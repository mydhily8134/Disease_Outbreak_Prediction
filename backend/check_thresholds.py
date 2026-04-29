import pandas as pd
import os
from preprocess import load_and_preprocess
from predict import get_thresholds

# Datasets are stored in the 'datasets' folder
DATA_DIR = "datasets"
files = [f for f in os.listdir(DATA_DIR) if f.endswith('.csv')]

for filename in files:
    disease = filename.replace('.csv', '').upper()
    try:
        csv_path = os.path.join(DATA_DIR, filename)
        df = load_and_preprocess(csv_path)
        
        # Calculate thresholds
        thresholds = get_thresholds(df)
        
        # In predict.py, the keys are 'low_med' (Median) and 'med_high' (P90)
        median_val = thresholds['low_med']
        p90_val = thresholds['med_high']
        
        print(f"{disease:10}: Median (Low/Med) = {median_val:<5} | P90 (Med/High) = {p90_val}")
    except Exception as e:
        print(f"Error processing {disease}: {e}")
