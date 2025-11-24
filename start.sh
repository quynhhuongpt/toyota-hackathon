#!/bin/bash

echo "Starting GR Cup Strategy Dashboard..."

# Check for dataset
if [ ! -d "../barber" ]; then
    echo "Dataset not found. Downloading..."
    mkdir -p ../barber
    curl -L -o ../barber/barber.zip https://trddev.com/hackathon-2025/barber-motorsports-park.zip
    unzip ../barber/barber.zip -d ../barber
    # Move files if they are nested (optional, depending on zip structure)
    # Assuming zip contains the CSV directly or in a folder
    echo "Dataset downloaded and extracted."
else
    echo "Dataset found."
fi

# Start Backend
echo "Starting Backend..."
cd backend
pip install -r backend/requirements.txt # Uncomment if needed, assuming already installed
python main.py &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend..."
cd frontend
# npm install # Uncomment if needed
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Services started."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop."

# Trap Ctrl+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

wait
