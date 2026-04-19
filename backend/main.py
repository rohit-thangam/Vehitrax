from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import video, stream, logs, vehicles, parking
import os

app = FastAPI(title="Vehitrax Backend API")

from fastapi.staticfiles import StaticFiles
# Mount the parent data folder to serve videos
app.mount("/data", StaticFiles(directory="../data"), name="data")

# Configure CORS for React frontend (Vite default is 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(video.router, prefix="/api/video", tags=["Video"])
app.include_router(stream.router, prefix="/api/stream", tags=["Stream"])
app.include_router(logs.router, prefix="/api/logs", tags=["Logs"])
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["Vehicles"])
app.include_router(parking.router, prefix="/api/parking", tags=["Parking"])

@app.get("/")
async def root():
    return {"message": "Vehitrax API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.1", port=   8000, reload=True)
