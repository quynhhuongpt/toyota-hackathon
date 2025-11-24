from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import pandas as pd
from data_loader import DataLoader
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Data Loader
# Adjust path to where the CSV is located
CSV_PATH = "../barber/R1_barber_telemetry_data.csv"
data_loader = DataLoader(CSV_PATH)

@app.on_event("startup")
async def startup_event():
    # Load data on startup
    if os.path.exists(CSV_PATH):
        data_loader.load_data()
    else:
        print(f"Error: CSV file not found at {CSV_PATH}")

@app.get("/api/drivers")
async def get_drivers():
    return {"drivers": data_loader.get_drivers()}

@app.get("/api/track")
async def get_track():
    return data_loader.get_track_map()

@app.get("/api/leaderboard")
async def get_leaderboard():
    return data_loader.get_leaderboard_data()

@app.get("/api/stats")
async def get_stats():
    return data_loader.get_stats()

@app.get("/api/history/{vehicle_id}")
async def get_history(vehicle_id: str):
    return data_loader.get_lap_stats(vehicle_id)

@app.websocket("/ws/telemetry/{vehicle_id}")
async def websocket_endpoint(websocket: WebSocket, vehicle_id: str):
    await websocket.accept()
    
    try:
        driver_data = data_loader.get_driver_data(vehicle_id)
        
        if driver_data.empty:
            await websocket.send_json({"error": "No data for this driver"})
            await websocket.close()
            return

        # Simulation Loop
        # We will iterate through the rows and send them
        
        # Convert to list of dicts for iteration
        # Data is already cached and processed in DataLoader
        records = driver_data.to_dict('records')
        
        for record in records:
            # Use pre-calculated delay
            delay = record.get('delay', 0.1)
            
            # Send data
            await websocket.send_json(record)
            
            # Sleep
            await asyncio.sleep(delay)
            
    except WebSocketDisconnect:
        print(f"Client disconnected for {vehicle_id}")
    except Exception as e:
        print(f"Error in websocket: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
