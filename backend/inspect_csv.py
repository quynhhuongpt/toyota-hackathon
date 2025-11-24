import pandas as pd

# Read only the telemetry_name column
df = pd.read_csv("../COTA/Race 1/R1_cota_telemetry_data.csv", usecols=['telemetry_name'])
unique_names = df['telemetry_name'].unique()
print("Unique Telemetry Names:")
for name in unique_names:
    print(name)
