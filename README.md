# Vehitrax - Real-Time Vehicle Surveillance & Automated Parking Management

Vehitrax is a comprehensive, scalable, and modular SaaS platform designed for Automated Number Plate Recognition (ANPR) and real-time parking management. It leverages YOLOv8 for vehicle and license plate detection, alongside OCR for text extraction. It features a FastAPI backend, Firebase/SQLite data management, and a dynamic React/Vite dashboard.

## Project Structure

- **`backend/`**: Contains the FastAPI application, YOLOv8 ML models, database configuration, and API routes.
- **`frontend/`**: Contains the React + Vite dashboard application, including specialized views like the Live Monitor and Reports.
- **`data/`**: Stores sample videos, uploads, and data sources used for inference.
- **`models/`**: Stores trained machine learning models (e.g., `best.pt`).

---

## Prerequisites

- **Python 3.8+** (for the backend)
- **Node.js 16+** and **npm** (for the frontend)
- Git

---

## Step-by-Step Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Backend Setup

The backend handles AI inference (YOLOv8 + OCR), video streaming, and data storage.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment:
   - **Windows:**
     ```bash
     python -m venv myenv
     .\myenv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     python3 -m venv myenv
     source myenv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API locally:
   ```bash
   python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
   ```
   The API will be available at `http://localhost:8000`. You can access the Swagger documentation at `http://localhost:8000/docs`.

### 3. Frontend Setup

The frontend is a modern React application built with Vite and TailwindCSS.

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:5173`.

---

## Contributing

1. Create a feature branch (`git checkout -b feature/my-feature`)
2. Commit your changes (`git commit -m 'Add new feature'`)
3. Push to the branch (`git push origin feature/my-feature`)
4. Open a Pull Request on GitHub.

## License

This project is licensed under the MIT License.
