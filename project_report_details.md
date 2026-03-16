# Vehitrax: Real-Time Vehicle Surveillance & Automated Parking Management System
**Comprehensive Technical Documentation for Project Report**

This document outlines the complete architecture, tech stack, feature set, and inner workings of the Vehitrax platform. This can be used as the foundational source material to prompt any AI to write specific chapters of a university or college project report (e.g., Introduction, Methodology, System Architecture, Conclusion).

---

## 1. Project Overview
Vehitrax is an intelligent, scalable, and automated parking management and vehicle surveillance system. It leverages cutting-edge computer vision (YOLOv8) and Optical Character Recognition (OCR) to detect vehicles, read license plates in real-time, and manage entry/exit flows seamlessly. The platform is designed to replace manual logging with an automated, high-accuracy digital system suitable for distinct deployment scenarios (residential complexes, toll booths, business parks, and smart city parking).

## 2. Technology Stack
The project is built on a modern, decoupled client-server architecture.

### **Backend (Data & AI Processing Layer)**
- **Core Framework (The Backbone):** **FastAPI** (Python). FastAPI is used to build all the RESTful API endpoints for the application. It was chosen specifically for its asynchronous capabilities (crucial since AI models take time to run), speed (built on Starlette), and its ability to automatically generate Swagger documentation. It manages the routing for video streaming, log aggregation, and fetching vehicle data.
- **Machine Learning (Object Detection):** YOLOv8 (Ultralytics) - A state-of-the-art model used for real-time bounding box detection of vehicles and license plates.
- **Text Recognition:** EasyOCR - Used to extract alphanumeric text from the localized license plate regions identified by YOLOv8.
- **Image Processing:** OpenCV (cv2) - For frame extraction from live streams/videos, resizing, and preprocessing images before passing them to the ML models.
- **Database:** SQLite (managed via SQLAlchemy ORM). Optionally designed to integrate with Firebase Firestore for real-time cloud sync.
- **Server Environment:** Uvicorn (ASGI web server implementation used to run the FastAPI application).
- **Real-Time Communication:** Server-Sent Events (SSE) via `sse-starlette` (integrated directly into the FastAPI response stream) to stream real-time logs and status updates to the frontend without constant polling.

### **Frontend (User Interface Layer)**
- **Framework:** React.js initialized with Vite (for lightning-fast Hot Module Replacement and optimized builds).
- **Styling:** TailwindCSS - A utility-first CSS framework used for creating a highly responsive, modern, "glassmorphic" user interface.
- **Routing:** React Router DOM (v6) - For seamless Single Page Application (SPA) navigation.
- **Data Visualization:** Recharts - Used to generate analytical graphs on the dashboard and reports page.
- **Icons:** Lucide-React - Clean, consistent UI iconography.
- **Theme:** Dynamic (Dark/Light mode support with CSS variables) default cyberpunk-inspired aesthetic.

---

## 3. Core System Architecture & Workflow

### 3.1 Custom Dataset Collection & Annotation
A significant portion of the Machine Learning effort was dedicated to creating a localized dataset for high accuracy:
1. **Data Gathering:** Images and video frames of Indian vehicles containing various license plate formats (standardized and non-standardized) were manually gathered.
2. **Annotation:** The dataset was manually annotated using **MakeSense.ai**. Bounding boxes were meticulously drawn around license plates to create accurate ground-truth labels for training.
3. **Training:** The YOLOv8 model was custom-trained on this specific, hand-curated dataset to ensure maximum detection reliability for Indian registration plates under various lighting conditions.

### 3.2 Data Acquisition (Input)
The system ingests video data. This can be mocked via an uploaded `.mp4` file or theoretically connected to an RTSP IP camera stream. The `main.py` script routes these requests to the appropriate processing pipeline.

### 3.3 The ML Pipeline (Inference)
The core logic resides in the backend's continuous streaming mechanism:
1. **Frame Capture:** OpenCV reads frames from the video source.
2. **Detection:** The YOLOv8 model (`best.pt`) evaluates the frame to calculate bounding boxes around vehicles and, specifically, license plates.
3. **Cropping:** The coordinates of the license plate bounding box are used to crop that specific region from the frame.
4. **OCR (Text Extraction):** The cropped license plate image is fed into EasyOCR.
5. **Validation:** Basic regex (e.g., Indian standard format `^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$`) is often mentally/programmatically applied to filter out noise, though raw OCR data is captured.
6. **Annotation:** OpenCV draws the bounding boxes and the detected text directly onto the video frame.

### 3.3 Database & State Management
When a valid license plate is detected:
- The system checks the local `vehitrax.db` (SQLite) to see if the vehicle exists in the database.
- The vehicle state transitions through: `Entry` -> `Parked` -> `Exit`.
- A log entry is created containing the timestamp, license plate number, and action (Entry/Exit).
- **Unknown Vehicles / Operators Approval Flow:** If a plate is unrecognized, it temporarily defaults to an "Unknown" status on the frontend. The system allows an operator to manually approve this vehicle as a "Visitor," adding it to the authorized database and updating its log stream.

### 3.4 Data Streaming to Client
Instead of making the frontend ask "Are there new plates?", the backend uses Server-Sent Events (**SSE**). As inferences are processed, a background generator yields byte-encoded JPEG images (for live video) and simultaneous JSON payloads containing the live logs, pushing them to the React frontend instantly.

---

## 4. Frontend Features & Modules

1. **Dashboard (Overview):**
   - High-level analytics: Total vehicles processed, current occupancy, alerts, and system uptime.
   - Dynamic charts displaying hourly traffic flow (using Recharts).

2. **Live Monitor (The Core Operational View):**
   - **Video Feed:** Displays the real-time annotated video stream.
   - **Activity Stream:** A scrolling list of detected plates in real-time, color-coded by status (E.g., Authorized Resident, Visitor, Unauthorized).
   - **Manual Override:** The distinct feature allowing operators to click "Approve as Visitor" for unknown vehicles, making the system hybrid (AI + Human in the loop).

3. **Vehicle Database (CRM):**
   - A tabular view of all registered vehicles.
   - Functionality to search, sort, add, edit, or remove vehicle entries.
   - Categorization by owner type (Resident, Employee, etc.).

4. **Reports & Analytics:**
   - Filters to search historical data by date range.
   - Statistics on peak hours, common visitors, etc.
   - Export functionality to download logs.

5. **Settings / Configuration:**
   - Dark/Light theme toggles.
   - "Deployment Mode" configurations to adapt the UI for different environments (e.g., turning on/off toll collection features vs. residential features).

6. **Parking Space Management (Under Development):**
   - The platform is expanding to include a real-time slot allocation module. Once completed, the ANPR system will automatically allocate or track individual parking space availability, directing drivers to open spots upon successful plate recognition.

---

## 5. System Deployment & Use Cases

The software is designed as a multi-modal platform. Through configuration, the application subtly adapts its terminology and dashboard metrics:
- **Residential Complex:** Focuses on Resident vs. Visitor, tracking long-term parking.
- **Toll Booths:** Focuses on high-speed throughput and potential payment status.
- **Business/Corporate Park:** Focuses on Employee vs. Guest parking and slot availability.
- **Smart Parking:** Focuses on empty slot tracking and monetization.

## 6. Novelty & Academic Value
For the purpose of an academic thesis/report, highlight these specific engineering feats:
- **Edge Deployment Viability:** By using YOLOv8, inference is fast enough to run on mid-range hardware (or edge devices) without necessarily requiring massive cloud GPUs.
- **Asynchronous Python Backend:** Demonstrates modern web development using `FastAPI` to prevent the heavy machine learning code from blocking web requests.
- **Human-in-the-Loop AI:** The "Approve as Visitor" flow demonstrates understanding that 100% OCR accuracy is impossible due to dirty plates or bad lighting. Providing a seamless UI fallback for human operators is a mature system design choice.
- **SSE over WebSockets:** Choosing Server-Sent Events for the unidirectional transmission of real-time logs and video chunks is a lightweight, HTTP-compliant alternative to complex WebSocket setups.
