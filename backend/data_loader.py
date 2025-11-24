import pandas as pd
import numpy as np
import json
import math

class DataLoader:
    def __init__(self, telemetry_file: str):
        self.telemetry_file = telemetry_file
        self.df = None
        self.track_map = []
        self.drivers = []
        self.stats = {}

    def load_data(self):
        print(f"Loading data from {self.telemetry_file}...")
        # Read the CSV
        # The file is large, so we might want to optimize, but for now let's load it all
        # We only care about specific columns
        usecols = ['timestamp', 'vehicle_id', 'telemetry_name', 'telemetry_value', 'lap']
        self.df = pd.read_csv(self.telemetry_file, usecols=usecols)
        
        # Convert timestamp to datetime
        self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
        
        # Get unique drivers
        self.drivers = self.df['vehicle_id'].unique().tolist()
        print(f"Found {len(self.drivers)} drivers.")

        # Pivot the data to wide format for easier processing
        # This might be memory intensive. Let's do it per driver or in chunks if needed.
        # For the hackathon, we'll try to pivot the whole thing but maybe filter for important columns first.
        
        important_telemetry = [
            'speed', 'nmot', 'gear', 'aps', 'pbrake_f', 'Steering_Angle', 
            'accx_can', 'accy_can', 'VBOX_Lat_Min', 'VBOX_Long_Minutes', 'Laptrigger_lapdist_dls'
        ]
        
        self.df = self.df[self.df['telemetry_name'].isin(important_telemetry)]
        
        # Generate Track Map (using GPS data)
        self._generate_track_map()
        
        # Compute Global Stats
        self._compute_stats()
        
        print("Data loaded and processed.")

    def _generate_track_map(self):
        # Pick the first driver and extract Lat/Long
        if not self.drivers:
            return

        driver_id = self.drivers[0]
        driver_data = self.df[self.df['vehicle_id'] == driver_id]
        
        # Pivot just for this driver to get Lat/Long together
        pivoted = driver_data.pivot_table(
            index='timestamp', 
            columns='telemetry_name', 
            values='telemetry_value', 
            aggfunc='first'
        ).dropna(subset=['VBOX_Lat_Min', 'VBOX_Long_Minutes'])
        
        # Sort by timestamp
        pivoted = pivoted.sort_index()
        
        # Downsample for map (take every 10th point)
        self.track_map = pivoted[['VBOX_Lat_Min', 'VBOX_Long_Minutes']].iloc[::10].values.tolist()
        print(f"Generated track map with {len(self.track_map)} points.")

    def _compute_stats(self):
        # Max Speed per driver
        max_speeds = self.df[self.df['telemetry_name'] == 'speed'].groupby('vehicle_id')['telemetry_value'].max()
        
        self.stats = {
            "top_speeds": max_speeds.to_dict(),
            "total_drivers": len(self.drivers)
        }

        self.driver_cache = {}
        self.leaderboard_cache = None

    def get_driver_data(self, vehicle_id):
        if vehicle_id in self.driver_cache:
            return self.driver_cache[vehicle_id]

        if vehicle_id not in self.drivers:
            print(f"DEBUG: Vehicle ID {vehicle_id} not found in drivers list.")
            return pd.DataFrame()
        
        driver_df = self.df[self.df['vehicle_id'] == vehicle_id]
        print(f"DEBUG: Found {len(driver_df)} rows for {vehicle_id} before pivot.")

        if driver_df.empty:
            return pd.DataFrame()

        # Pivot to have telemetry names as columns
        pivoted = driver_df.pivot_table(
            index='timestamp', 
            columns='telemetry_name', 
            values='telemetry_value', 
            aggfunc='first'
        )
        
        # Get Lap numbers
        lap_series = driver_df.groupby('timestamp')['lap'].first()
        pivoted = pivoted.join(lap_series)

        # Forward fill and fill NaNs
        pivoted = pivoted.ffill().fillna(0)
        
        # Downsample to ~10Hz (take every 5th row if original is ~50Hz)
        # Assuming original is high frequency, we want to limit the load.
        # Let's just take every 5th row for now.
        pivoted = pivoted.iloc[::5]
        
        # Reset index
        pivoted = pivoted.reset_index()
        
        # Pre-calculate time difference (delay) for simulation
        pivoted['delay'] = pivoted['timestamp'].diff().dt.total_seconds().fillna(0.1)
        # Ensure minimum delay to prevent CPU spiking and maximum to prevent freezing
        pivoted['delay'] = pivoted['delay'].clip(lower=0.01, upper=1.0) 
        
        # Convert timestamp to string once
        # Use strftime which is robust and standard for Series
        pivoted['timestamp'] = pivoted['timestamp'].dt.strftime('%Y-%m-%dT%H:%M:%S.%f')

        print(f"DEBUG: Pivoted data for {vehicle_id} has {len(pivoted)} rows.")
        
        # Cache the result
        self.driver_cache[vehicle_id] = pivoted
        return pivoted

    def get_lap_stats(self, vehicle_id):
        if vehicle_id not in self.drivers:
            return {}
            
        driver_df = self.df[self.df['vehicle_id'] == vehicle_id]
        
        # Calculate Lap Times
        # Group by lap and get min/max timestamp
        lap_times = driver_df.groupby('lap')['timestamp'].agg(['min', 'max'])
        lap_times['duration'] = (lap_times['max'] - lap_times['min']).dt.total_seconds()
        
        # Filter out incomplete laps (e.g. first and last if they are partial)
        # For now, just return all.
        
        # Calculate Consistency (Std Dev of lap times)
        consistency = lap_times['duration'].std()
        
        return {
            "lap_times": lap_times['duration'].to_dict(),
            "consistency": 0 if pd.isna(consistency) else consistency,
            "best_lap": lap_times['duration'].min()
        }

    def get_track_map(self):
        return self.track_map

    def get_drivers(self):
        return self.drivers

    def get_stats(self):
        return self.stats

    def get_leaderboard_data(self):
        if self.leaderboard_cache is not None:
            return self.leaderboard_cache

        import time
        start_time = time.time()
        print("DEBUG: Computing leaderboard data...")

        # Calculate best lap for each driver
        leaderboard = []
        for driver in self.drivers:
            stats = self.get_lap_stats(driver)
            if stats and stats.get('best_lap'):
                leaderboard.append({
                    "driver": driver,
                    "best_lap": stats['best_lap'],
                    "last_lap": list(stats['lap_times'].values())[-1] if stats['lap_times'] else 0,
                    "laps_completed": len(stats['lap_times'])
                })
        
        # Sort by best lap (ascending)
        leaderboard.sort(key=lambda x: x['best_lap'])
        
        # Calculate gaps
        if leaderboard:
            best_time = leaderboard[0]['best_lap']
            for entry in leaderboard:
                entry['gap'] = entry['best_lap'] - best_time
        
        end_time = time.time()
        print(f"DEBUG: Leaderboard computation took {end_time - start_time:.4f} seconds.")
        
        self.leaderboard_cache = leaderboard
        return leaderboard
