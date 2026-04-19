# Vehitrax - Intelligent ANPR & Real-Time Parking Management System

Vehitrax is an enterprise-grade Software as a Service (SaaS) platform designed for modern **Automated Number Plate Recognition (ANPR)** and **Real-Time Parking Ecosystems**. It combines edge-computing AI integration with rapid, stateless React interfaces to securely manage High-Speed Tolls, tight Residential security perimeters, or Commercial parking complexes.

## 🚀 Key Features

*   **Dual-Engine OCR Architecture**: A fault-tolerant cloud API integration backed up by a completely offline PyTorch `EasyOCR` local engine to guarantee zero downtime.
*   **Algorithmic Bounding-Box Deduplication**: Utilizing `difflib` algorithmic structures, the system aggressively filters duplicate detections at the gate, keeping historical databases clean and saving compute costs.
*   **Server-Sent Events (SSE) Video Streaming**: Complete bypass of HTTP polling. The backend asynchronously engineers raw YOLO inference frames directly into MJPEG streams ensuring near-zero latency video monitoring.
*   **Digital Twin Parking Architecture**: Vehicles traversing gates are intelligently assigned into active memory zones, mapping them to a real-time `Live Occupancy` visual digital grid.
*   **Real-time Analytics Dashboard**: Features Recharts visualizations hooked directly into real-time polling schemas for instantaneous demographic breakdown and hourly traffic monitoring.
*   **PDF Intelligence Reports**: Administrative capability to generate one-click exportable PDF compliance reports directly via raw Canvas screenshotting.

---

## 📖 Access & Operational Rule Book

Vehitrax operates on strict Role-Based Access Control (RBAC) to ensure operational integrity.

### 💼 Administrator (System Architect)
Administrators wield total system execution oversight:
*   Full Read/Write/Delete permissions over the underlying master SQL `RegisteredVehicles` registry and `DetectionLogs` history.
*   Exclusive access to the **Settings** node to actively tweak threshold limits, themes, and "Deployment Modes" (Commercial vs Residential).
*   Exclusive access to **Reports** for compliance export and demographic tracking.

### 🛡️ Security Guard (Live Dispatch)
Security Personnel execute real-time facility enforcement:
*   Unrestricted access to the **Live Monitor** edge camera streams.
*   Access to the **Live Occupancy** Digital Twin mapping and **Alerts** protocol for immediate intervention.
*   Authorized to respond to strictly flashing red **Overstay Alerts** (exceeding 7 Hours) logically inferred by the AI tracker, resulting in forced towing or physical citations.
*   *Restricted entirely from modifying System Settings, deleting historical data, or exporting platform analytics.*

---

## 🛠️ Technology Stack Breakdown

### Frontend UI/UX
*   **React + Vite**: High-speed Single Page Application (SPA).
*   **Tailwind CSS & Framer Motion**: Responsive logic featuring Glassmorphism UI tokens, programmatic dark/light modes, and seamless micro-animations.
*   **Lucide React & Recharts**: Vector icons & dynamic analytic generation.

### Backend Pipeline
*   **Python 3.10+ & FastAPI**: ASGI pipeline logic for routing and non-blocking asynchronous event loops.
*   **SQLite + SQLAlchemy**: Object-Relational Database for master ledger handling.
*   **Ultralytics YOLO (v8)**: Advanced Computer Vision neural networking.
*   **EasyOCR**: Fallback localization ML.
*   **OpenCV (cv2)**: Matrix imaging framework encoding byte-frames instantly to output streams.

---

## ⚙️ How to Setup & Run Locally (Years Later)

These instructions act as a fail-proof foundation designed to reliably spin up the software instance on any modern operating system architecture, even years in the future.

### System Prerequisites
1.  **Python 3.10** or higher is required globally.
2.  **Node.js 16.x** or higher is required globally.
3.  Have a trained YOLO model properly saved at `models/best.pt`.
4.  Ensure you have downloaded the `.env` API keys (e.g., PlateRecognizer API token, if utilizing Cloud OCR).

### Phase 1: Spin up the Python Edge-Backend

1.  Open your terminal and navigate strictly to the `/backend` directory.
    ```bash
    cd backend
    ```
2.  Scaffold a protected Virtual Environment to prevent dependency poisoning.
    ```bash
    # Windows
    python -m venv myenv
    .\myenv\Scripts\activate

    # macOS / Linux
    python3 -m venv myenv
    source myenv/bin/activate
    ```
3.  Inject the rigid framework requirements.
    ```bash
    pip install -r requirements.txt
    ```
4.  Ignite the Uvicorn ASGI server.
    ```bash
    python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
    ```
    ✅ **Verification**: Open `http://localhost:8000/docs`. You should immediately see the auto-generated Swagger UI demonstrating an active server API map.

### Phase 2: Spin up the React Client Application

1.  Open an entirely new, secondary terminal and navigate purely to the `/frontend` directory.
    ```bash
    cd frontend
    ```
2.  Install the required `node_modules` package registry locally.
    ```bash
    npm install
    # Note: Use `npm install --legacy-peer-deps` if installing years later resolves into conflicting historical package definitions.
    ```
3.  Initiate the Vite development server.
    ```bash
    npm run dev
    ```
    ✅ **Verification**: Navigate to `http://localhost:5173` in a Chromium-based browser to access the Login Screen and view the application!

---

## 👥 Demo Environment Notes
If presenting this software offline: Ensure you run the `python backend/seed_db.py` script prior to presentation. This executes a surgical clearance of orphaned backend testing data, establishes 70 mapped Digital Twin slots, and gracefully spawns 25 active vehicles directly into the matrix, proving visual capacity tracking works correctly.

## 📜 License
Provided strictly "as is" and protected under generic commercial licensing outlines.
