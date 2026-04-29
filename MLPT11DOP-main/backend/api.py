import os
import pandas as pd
import numpy as np
import pickle
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from preprocess import load_and_preprocess
from feature_engineering import generate_features
from predict import classify_severity, get_thresholds

app = FastAPI(title="Epidemic Guard API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Absolute path for models and outputs directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
OUTPUTS_DIR = os.path.join(BASE_DIR, 'outputs')

class PredictionInput(BaseModel):
    cases_lag1: float
    cases_lag2: float
    cases_lag4: float
    rolling_avg_4: float
    rolling_avg_12: float
    month: int
    year: int
    quarter: int
    growth_rate: float

class PredictionOutput(BaseModel):
    predicted_cases: int
    severity: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Epidemic Guard API is running. Go to http://localhost:8080 to access the Dashboard."}

@app.get("/diseases")
def get_diseases():
    """Returns a list of available diseases based on CSV files."""
    datasets_dir = os.path.join(BASE_DIR, "datasets")
    if not os.path.exists(datasets_dir):
        # Fallback to current dir if datasets folder not found (unlikely if standard)
        datasets_dir = BASE_DIR
        
    files = [f for f in os.listdir(datasets_dir) if f.endswith('.csv')]
    diseases = [f.replace('.csv', '').upper() for f in files]
    return {"diseases": diseases}

@app.get("/performance")
def get_performance_metrics():
    """Returns aggregated performance metrics from the training pipeline."""
    summary_path = os.path.join(OUTPUTS_DIR, "aggregate_summary.csv")
    if not os.path.exists(summary_path):
        raise HTTPException(status_code=404, detail="Performance summary not found. Run training pipeline first.")
    
    df = pd.read_csv(summary_path)
    # Convert to list of dicts
    metrics = df.to_dict(orient="records")
    return metrics

@app.get("/history/{disease}")
def get_historical_trends(disease: str, state: str = None):
    """Returns historical data for a specific disease, optionally filtered by state."""
    disease = disease.lower()
    datasets_dir = os.path.join(BASE_DIR, "datasets")
    csv_path = os.path.join(datasets_dir, f"{disease}.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail=f"Data for {disease} not found at {csv_path}")
    
    try:
        raw_df = load_and_preprocess(csv_path)
        featured_df = generate_features(raw_df)
        
        # Get all distinct states for the dropdown
        states = sorted(featured_df['state'].unique().tolist())
        
        # Default to first state if none provided
        target_state = state if state else states[0]
        
        # Filter by state
        filtered_df = featured_df[featured_df['state'] == target_state].copy()
        
        # Vectorized Date Formatting (MUCH FASTER than loop)
        filtered_df['date'] = filtered_df['date'].dt.strftime('%Y-%m-%d')
        
        # Prepare data for frontend chart
        result = filtered_df[['date', 'state', 'cases', 'rolling_avg_12']].to_dict(orient="records")
        
        return {
            "data": result, 
            "states": states,
            "selected_state": target_state
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/map-data/{disease}")
def get_map_data(disease: str):
    """Returns aggregated total cases per state for geographical map visualization."""
    disease = disease.lower()
    datasets_dir = os.path.join(BASE_DIR, "datasets")
    csv_path = os.path.join(datasets_dir, f"{disease}.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail=f"Data for {disease} not found.")
    
    try:
        raw_df = load_and_preprocess(csv_path)
        # Aggregate totals per state
        # We use the state abbreviation (AL, TX) as keys
        state_totals = raw_df.groupby('state')['cases'].sum().to_dict()
        
        return {
            "state_totals": state_totals
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/{disease}", response_model=PredictionOutput)
def predict_outbreak(disease: str, input_data: PredictionInput):
    """Predicts outbreak cases and severity."""
    disease = disease.lower()
    model_path = os.path.join(MODELS_DIR, f"{disease}_best_model.pkl")
    
    if not os.path.exists(model_path):
         raise HTTPException(status_code=404, detail=f"Model for {disease} not found.")

    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
            
        # Prepare input dataframe
        features = [
            input_data.cases_lag1,
            input_data.cases_lag2,
            input_data.cases_lag4,
            input_data.rolling_avg_4,
            input_data.rolling_avg_12,
            input_data.month,
            input_data.year,
            input_data.quarter,
            input_data.growth_rate
        ]
        feature_cols = ['cases_lag1', 'cases_lag2', 'cases_lag4', 'rolling_avg_4', 'rolling_avg_12', 'month', 'year', 'quarter', 'growth_rate']
        
        input_df = pd.DataFrame([features], columns=feature_cols)
        
        predicted_cases = model.predict(input_df)[0]
        
        # Calculate severity
        # We need thresholds from the raw data. 
        datasets_dir = os.path.join(BASE_DIR, "datasets")
        csv_path = os.path.join(datasets_dir, f"{disease}.csv")
        if os.path.exists(csv_path):
            raw_df = load_and_preprocess(csv_path)
            thresholds = get_thresholds(raw_df)
            severity = classify_severity(predicted_cases, thresholds)
        else:
            severity = "Unknown" # Should not happen if model exists usually
            
        return {
            "predicted_cases": int(predicted_cases),
            "severity": severity
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
