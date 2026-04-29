import pandas as pd
import numpy as np
from preprocess import load_and_preprocess
from feature_engineering import generate_features
from train import train_models
from sklearn.metrics import r2_score
import os

datasets = [f for f in os.listdir('.') if f.endswith('.csv')]
results_list = []

for dataset in datasets:
    disease = dataset.replace('.csv', '').upper()
    try:
        df = load_and_preprocess(dataset)
        df = generate_features(df)
        res, _, _ = train_models(df, disease)
        # Get R2 for Random Forest
        r2 = res['Random Forest']['R2']
        mae = res['Random Forest']['MAE']
        results_list.append({"Disease": disease, "MAE": mae, "Accuracy (R2)": r2})
    except Exception as e:
        print(f"Error {disease}: {e}")

summary_df = pd.DataFrame(results_list)
print("\nFinal Accuracy Report:")
print(summary_df.to_markdown(index=False))
