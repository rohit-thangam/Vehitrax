"""
ocr_service.py — Advanced OCR pipeline for Vehitrax ANPR system.

Pipeline stages:
  1. Preprocessing   – denoise, sharpen, deskew, binarise
  2. Primary OCR     – PlateRecognizer Cloud API  (highest accuracy)
  3. Fallback OCR    – local EasyOCR multi-variant pipeline
  4. Post-processing – clean, correct common confusions, validate Indian format
  5. Frame buffering – collect N frames, pick best quality, send once to API
  6. Frame averaging – vote on most frequent reading across recent frames
"""

import io
import os
import re
import cv2
import httpx
import numpy as np
from collections import Counter
from typing import Optional

from dotenv import load_dotenv

# Load .env from the backend directory (one level up from services/)
_ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_ENV_PATH)

# ── PlateRecognizer config ────────────────────────────────────────────────────
PLATE_RECOGNIZER_API_KEY: str = os.getenv("PLATE_RECOGNIZER_API_KEY", "")
PLATE_RECOGNIZER_REGION:  str = os.getenv("PLATE_RECOGNIZER_REGION", "in")
PLATE_RECOGNIZER_URL = "https://api.platerecognizer.com/v1/plate-reader/"

_API_ENABLED = bool(
    PLATE_RECOGNIZER_API_KEY
    and PLATE_RECOGNIZER_API_KEY != "your_api_token_here"
)

if _API_ENABLED:
    print("[OCR] PlateRecognizer API enabled (region: %s)" % PLATE_RECOGNIZER_REGION)
else:
    print("[OCR] PlateRecognizer API key not set – using local EasyOCR fallback only.")


# ---------------------------------------------------------------------------
# Indian number-plate regex
# Standard format:  AA-00-AA-0000  (e.g. MH-12-AB-1234)
# BH-series format: 00-BH-0000-AA  (e.g. 22-BH-1234-AB)
# ---------------------------------------------------------------------------
_INDIAN_PLATE_RE = re.compile(
    r'^(?:[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}|'   # standard
    r'\d{2}BH\d{4}[A-Z]{1,2})$'             # BH-series
)

# Common single-character OCR substitutions (wrong → right)
_OCR_CORRECTIONS = {
    'O': '0',
    'I': '1',
    'L': '1',
    'B': '8',
    'S': '5',
    'Z': '2',
    'G': '6',
    'Q': '0',
}

# Reverse map – used when a digit was read but a letter is expected
_OCR_CORRECTIONS_REV = {v: k for k, v in _OCR_CORRECTIONS.items()
                         if k not in ('O', 'Q')}


# ---------------------------------------------------------------------------
# 1. PREPROCESSING  (shared by EasyOCR fallback)
# ---------------------------------------------------------------------------

def _resize_for_ocr(img: np.ndarray, target_height: int = 64) -> np.ndarray:
    """Scale image so its height is at least `target_height` pixels."""
    h, w = img.shape[:2]
    if h < target_height:
        scale = target_height / h
        img = cv2.resize(img, (int(w * scale), int(h * scale)),
                         interpolation=cv2.INTER_CUBIC)
    return img


def _deskew(gray: np.ndarray) -> np.ndarray:
    """Correct slight tilt in plate crops via minAreaRect."""
    try:
        _, binary = cv2.threshold(gray, 0, 255,
                                  cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        coords = np.column_stack(np.where(binary > 0))
        if len(coords) < 5:
            return gray
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = 90 + angle
        if abs(angle) < 1.0:
            return gray
        h, w = gray.shape[:2]
        M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
        return cv2.warpAffine(gray, M, (w, h),
                              flags=cv2.INTER_CUBIC,
                              borderMode=cv2.BORDER_REPLICATE)
    except Exception:
        return gray


def _sharpen(gray: np.ndarray) -> np.ndarray:
    """Unsharp-mask sharpening."""
    blurred = cv2.GaussianBlur(gray, (0, 0), 3)
    return cv2.addWeighted(gray, 1.5, blurred, -0.5, 0)


def _prepare_api_image(crop: np.ndarray) -> bytes:
    """
    Resize crop to recommended resolution and encode as JPEG bytes
    ready to POST to PlateRecognizer.

    Recommended: 800×600 – 1920×1080 px (plate should be ≥100 px wide).
    We scale so the plate region is at least 600 px wide.
    """
    h, w = crop.shape[:2]
    target_w = 600
    if w < target_w:
        scale = target_w / w
        crop = cv2.resize(crop, (target_w, int(h * scale)),
                          interpolation=cv2.INTER_CUBIC)
    _, buf = cv2.imencode('.jpg', crop, [cv2.IMWRITE_JPEG_QUALITY, 95])
    return buf.tobytes()


def build_preprocessing_variants(crop: np.ndarray) -> list[np.ndarray]:
    """
    Return 4 preprocessed variants used by the local EasyOCR fallback.

      V0 – grayscale + resize          (baseline)
      V1 – bilateral denoise + sharpen  (clean plates)
      V2 – deskew + adaptive threshold  (tilted / dark plates)
      V3 – CLAHE + Otsu threshold       (uneven lighting)
    """
    variants: list[np.ndarray] = []

    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    gray = _resize_for_ocr(gray, target_height=64)
    variants.append(gray)                                           # V0

    bilateral = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
    variants.append(_sharpen(bilateral))                            # V1

    deskewed = _deskew(gray)
    adaptive = cv2.adaptiveThreshold(deskewed, 255,
                                     cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                     cv2.THRESH_BINARY, 11, 2)
    variants.append(adaptive)                                       # V2

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    equalized = clahe.apply(gray)
    _, otsu = cv2.threshold(equalized, 0, 255,
                            cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    variants.append(otsu)                                           # V3

    return variants


# ---------------------------------------------------------------------------
# 2. PRIMARY OCR – PlateRecognizer Cloud API  (synchronous, run via to_thread)
# ---------------------------------------------------------------------------

def call_plate_recognizer_api(
    crop: np.ndarray,
    min_confidence: float = 0.6,
) -> tuple[Optional[str], float]:
    """
    Send a plate crop to the PlateRecognizer REST API and return
    (raw_plate_text, confidence).  Returns (None, 0.0) on failure or
    if confidence is below `min_confidence`.

    This function is intentionally **synchronous** so it can be offloaded
    with asyncio.to_thread() in inference_service.py.
    """
    if not _API_ENABLED or crop is None or crop.size == 0:
        return None, 0.0

    try:
        img_bytes = _prepare_api_image(crop)
        response = httpx.post(
            PLATE_RECOGNIZER_URL,
            headers={"Authorization": f"Token {PLATE_RECOGNIZER_API_KEY}"},
            files={"upload": ("plate.jpg", img_bytes, "image/jpeg")},
            data={"regions": PLATE_RECOGNIZER_REGION},
            timeout=5.0,           # hard timeout to protect real-time pipeline
        )
        response.raise_for_status()
        data = response.json()

        results = data.get("results", [])
        if not results:
            return None, 0.0

        # Pick highest-score result
        best = max(results, key=lambda r: r.get("score", 0))
        plate = best.get("plate", "").upper().strip()
        score = float(best.get("score", 0))

        if score < min_confidence or not plate:
            return None, 0.0

        return plate, score

    except httpx.TimeoutException:
        print("[PlateRecognizer] Request timed out – falling back to EasyOCR")
        return None, 0.0
    except Exception as exc:
        print(f"[PlateRecognizer] API error: {exc}")
        return None, 0.0


# ---------------------------------------------------------------------------
# 3. FALLBACK OCR – local EasyOCR multi-variant pipeline
# ---------------------------------------------------------------------------

def run_easyocr_multi(
    reader,
    variants: list[np.ndarray],
    confidence_threshold: float = 0.3,
) -> list[tuple[str, float]]:
    """
    Run EasyOCR on every image variant. Returns (text, confidence) pairs
    that pass the confidence threshold.
    """
    allowlist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    candidates: list[tuple[str, float]] = []

    for img in variants:
        try:
            results = reader.readtext(img, allowlist=allowlist,
                                      detail=1, paragraph=False)
            for (_bbox, text, conf) in results:
                if conf >= confidence_threshold and text.strip():
                    candidates.append((text.upper().strip(), conf))
        except Exception:
            pass

    return candidates


# ---------------------------------------------------------------------------
# 4. POST-PROCESSING  (shared by both OCR paths)
# ---------------------------------------------------------------------------

def _apply_positional_corrections(text: str) -> str:
    """
    Position-aware substitutions for standard 10-char Indian plates.

    Layout: LL DD LL DDDD
      L positions → 0,1,4,5
      D positions → 2,3,6,7,8,9
    """
    if len(text) != 10:
        return text

    LETTER_POS = {0, 1, 4, 5}
    DIGIT_POS  = {2, 3, 6, 7, 8, 9}

    result = list(text)
    for i, ch in enumerate(result):
        if i in LETTER_POS and ch.isdigit():
            result[i] = _OCR_CORRECTIONS_REV.get(ch, ch)
        elif i in DIGIT_POS and ch.isalpha():
            result[i] = _OCR_CORRECTIONS.get(ch, ch)
    return ''.join(result)


def clean_and_validate(raw: str) -> Optional[str]:
    """
    Strip noise → positional corrections → length check.
    Returns cleaned string or None if implausible.
    """
    text = re.sub(r'[^A-Z0-9]', '', raw.upper())
    if len(text) < 4:
        return None
    text = _apply_positional_corrections(text)
    if not (6 <= len(text) <= 10):
        return None
    return text


def format_indian_plate(text: str) -> str:
    """Format a 10-char raw plate as AA-00-AA-0000 for display."""
    if len(text) == 10:
        return f"{text[:2]}-{text[2:4]}-{text[4:6]}-{text[6:]}"
    return text


def best_candidate(candidates: list[tuple[str, float]]) -> Optional[str]:
    """
    Aggregate (text, conf) pairs → weighted vote → prefer regex-valid plates.
    """
    if not candidates:
        return None
    score: dict[str, float] = {}
    for raw, conf in candidates:
        cleaned = clean_and_validate(raw)
        if cleaned:
            score[cleaned] = score.get(cleaned, 0.0) + conf
    if not score:
        return None
    valid = {t: s for t, s in score.items() if _INDIAN_PLATE_RE.match(t)}
    pool  = valid if valid else score
    return max(pool, key=pool.__getitem__)


# ---------------------------------------------------------------------------
# 5. FRAME BUFFER  – collect N detections, pick best quality frame for API
# ---------------------------------------------------------------------------

class FrameBuffer:
    """
    Accumulates (crop, yolo_confidence) tuples for the same vehicle.
    When the buffer is full (or flush() is called), it returns the crop
    with the highest YOLO detection confidence – the sharpest, most
    representative frame to send to the API.

    Usage:
        buf = FrameBuffer(size=5)
        buf.add(crop, conf)
        best_crop = buf.flush()    # returns best crop or None if empty
    """

    def __init__(self, size: int = 5):
        self._size   = size
        self._frames: list[tuple[np.ndarray, float]] = []

    def add(self, crop: np.ndarray, yolo_conf: float):
        self._frames.append((crop, yolo_conf))

    @property
    def full(self) -> bool:
        return len(self._frames) >= self._size

    def flush(self) -> Optional[np.ndarray]:
        if not self._frames:
            return None
        best_crop = max(self._frames, key=lambda x: x[1])[0]
        self._frames.clear()
        return best_crop

    def reset(self):
        self._frames.clear()


# ---------------------------------------------------------------------------
# 6. FRAME AVERAGING  – majority-vote across recent frame readings
# ---------------------------------------------------------------------------

class PlateVoter:
    """
    Rolling-window majority vote on OCR readings for a single vehicle track.

    Returns the winning plate once at least `min_votes` identical readings
    appear within the last `window` detections.
    """

    def __init__(self, window: int = 10, min_votes: int = 3):
        self._window    = window
        self._min_votes = min_votes
        self._history: list[str] = []

    def update(self, reading: Optional[str]) -> Optional[str]:
        if reading:
            self._history.append(reading)
            if len(self._history) > self._window:
                self._history.pop(0)

        if len(self._history) < self._min_votes:
            return None

        counts = Counter(self._history)
        most_common, count = counts.most_common(1)[0]
        return most_common if count >= self._min_votes else None

    def reset(self):
        self._history.clear()


# ---------------------------------------------------------------------------
# 7. PUBLIC API  – single entry point called from inference_service.py
# ---------------------------------------------------------------------------

def extract_plate_text(
    reader,
    crop: np.ndarray,
    confidence_threshold: float = 0.3,
) -> tuple[Optional[str], Optional[str]]:
    """
    EasyOCR-only pipeline (used as fallback when API is unavailable
    or when called outside the frame-buffer accumulation window).

    Returns:
        (raw_text, formatted_text)  – both None if no plate found.
    """
    if crop is None or crop.size == 0 or reader is None:
        return None, None

    variants   = build_preprocessing_variants(crop)
    candidates = run_easyocr_multi(reader, variants, confidence_threshold)
    raw        = best_candidate(candidates)

    if raw is None:
        return None, None

    return raw, format_indian_plate(raw)


def extract_plate_with_api(
    reader,
    crop: np.ndarray,
    confidence_threshold: float = 0.3,
    api_min_confidence: float = 0.6,
) -> tuple[Optional[str], Optional[str], str]:
    """
    Full pipeline: PlateRecognizer API first, EasyOCR fallback second.

    Returns:
        (raw_text, formatted_text, source)
          source is "api" or "easyocr" for diagnostics.
    """
    # --- Try PlateRecognizer API ---
    if _API_ENABLED and crop is not None and crop.size > 0:
        api_raw, api_conf = call_plate_recognizer_api(crop, api_min_confidence)
        if api_raw:
            cleaned = clean_and_validate(api_raw)
            if cleaned:
                return cleaned, format_indian_plate(cleaned), "api"

    # --- Local EasyOCR fallback ---
    raw, formatted = extract_plate_text(reader, crop, confidence_threshold)
    return raw, formatted, "easyocr"
