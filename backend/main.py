import pandas as pd
import numpy as np
from preprocess import load_and_preprocess
from feature_engineering import generate_features
from train import train_models
from predict import classify_severity, get_thresholds
from visualize import plot_trends
import pickle
import os

# Absolute path for models directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DATASETS_DIR = os.path.join(BASE_DIR, 'datasets')


def run_pipeline():
    datasets = [f for f in os.listdir(DATASETS_DIR) if f.endswith('.csv')]
    all_summaries = []

    for dataset in datasets:
        disease_name = dataset.replace('.csv', '').upper()
        print(f"\n{'='*20} Processing {disease_name} {'='*20}")

        filepath = os.path.join(DATASETS_DIR, dataset)

        # 1. Preprocess
        print(f"Step 1: Preprocessing {disease_name} data...")
        try:
            df = load_and_preprocess(filepath)
        except Exception as e:
            print(f"Error processing {dataset}: {e}")
            continue

        # 2. Feature Engineering
        print(f"Step 2: Generating features...")
        df = generate_features(df)

        # 3. Train and Evaluate (Or just load if already trained)
        # Note: In a real app, we might separate training from inference.
        # Here we assume train.py has run or we run it on valid data.
        # Let's re-run training to ensure we have the latest and the manifest
        # results, test_df, features = train_models(df, disease_name) # This is expensive if we just want to run main

        # Load Manifest
        manifest_path = os.path.join(MODELS_DIR, 'model_manifest.json')
        if not os.path.exists(manifest_path):
            print(
                f"Model manifest not found at {manifest_path}. Please run train.py first.")
            continue

        import json
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)

        manifest_entry = manifest.get(disease_name)
        if isinstance(manifest_entry, dict):
            best_model_name = manifest_entry.get("model", "Random Forest")
            best_metrics = manifest_entry.get("metrics", {})
        else:
            best_model_name = manifest_entry if manifest_entry else "Random Forest"
            best_metrics = {}

        print(f"Step 3: Using Best Model -> {best_model_name}")

        # 4. Predict and Classify
        print(f"Step 4: Predicting...")

        # Load Best Model File
        model_filename = os.path.join(
            MODELS_DIR, f'{disease_name.lower()}_best_model.pkl')
        if not os.path.exists(model_filename):
            print(f"Model file {model_filename} not found.")
            continue

        with open(model_filename, 'rb') as f:
            model = pickle.load(f)

        # Prediction Logic based on Model Type
        if best_model_name in ["Random Forest", "Gradient Boosting"]:
            # ML Models need features
            # We need to recreate train/test split to get the 'test_df' consistent with training
            # Or just predict on the whole df for visualization? Let's predict on the last year (test set)
            max_date = df['date'].max()
            split_date = max_date - pd.Timedelta(weeks=52)
            test_df = df[df['date'] > split_date].copy()

            test_df['predicted_cases'] = model.predict(test_df[features])
            visualization_df = test_df  # For ML, we plot state-wise usually, or aggregate?

        elif best_model_name == "ARIMA":
            # ARIMA is trained on aggregated time series
            # We need to create the aggregated test set
            max_date = df['date'].max()
            split_date = max_date - pd.Timedelta(weeks=52)
            test_df = df[df['date'] > split_date].copy()
            test_ts = test_df.groupby('date')['cases'].sum().reset_index()

            # Forecast
            # Note: The saved ARIMA result wrapper can forecast further steps
            # We need to know how many steps.
            steps = len(test_ts)
            # If model was fit on training data, forecast(steps) gives next steps.
            # Warning: If we reload, does it remember state? Yes, ARIMAResultsWrapper does.
            forecast = model.forecast(steps=steps)
            test_ts['predicted_cases'] = forecast.tolist(
            ) if hasattr(forecast, 'tolist') else forecast

            # For visualization, we use the aggregated data
            visualization_df = test_ts
            # Dummy state for plot function
            visualization_df['state'] = 'Aggregated'

        elif best_model_name == "Prophet":
            # Prophet
            max_date = df['date'].max()
            split_date = max_date - pd.Timedelta(weeks=52)
            test_df = df[df['date'] > split_date].copy()
            test_ts = test_df.groupby('date')['cases'].sum().reset_index()

            future = pd.DataFrame(test_ts['date']).rename(
                columns={'date': 'ds'})
            forecast = model.predict(future)
            test_ts['predicted_cases'] = forecast['yhat'].values

            visualization_df = test_ts
            visualization_df['state'] = 'Aggregated'

        # Classify Severity
        thresholds = get_thresholds(df)
        visualization_df['severity'] = visualization_df['predicted_cases'].apply(
            lambda x: classify_severity(x, thresholds))

        # 5. Visualize
        print(f"Step 5: Generating visualizations...")
        os.makedirs('outputs', exist_ok=True)

        # Plot
        state_to_plot = visualization_df['state'].iloc[0]
        plot_trends(visualization_df, state_to_plot, disease_name,
                    save_path=f'outputs/outbreak_trend_{disease_name}.png')

        all_summaries.append({
            "Disease": disease_name,
            "Best Model": best_model_name,
            "MAE": best_metrics.get("MAE", 0),
            "RMSE": best_metrics.get("RMSE", 0),
            "Accuracy (%)": best_metrics.get("Accuracy", 0)
        })

    print("\n" + "="*50)
    print("Multi-Disease Pipeline Complete.")
    print("Aggregate Results:")
    summary_df = pd.DataFrame(all_summaries)
    print(summary_df.to_string(index=False))
    summary_df.to_csv('outputs/aggregate_summary.csv', index=False)


if __name__ == "__main__":
    run_pipeline()
