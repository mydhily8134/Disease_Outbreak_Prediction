import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, classification_report
import pickle
import os
from statsmodels.tsa.arima.model import ARIMA
from prophet import Prophet
import warnings
from predict import classify_severity, get_thresholds

warnings.filterwarnings('ignore')

def train_arima_model(train, test):
    # ARIMA requires a univariate series
    history = list(train['cases'])
    test_cases = list(test['cases'])
    predictions = []
    
    # Rolling Forecast
    print(f"    Running ARIMA Rolling Forecast on {len(test_cases)} points...")
    # Pre-train model once to get parameters? Or re-train every step?
    # Re-training every step is too slow. 
    # Strategy: Fit once, then Append new observations.
    try:
        model = ARIMA(history, order=(5,1,0))
        model_fit = model.fit()
        
        for t in range(len(test_cases)):
            # Forecast 1 step
            output = model_fit.forecast()
            yhat = output[0]
            predictions.append(yhat)
            
            # Observe actual
            obs = test_cases[t]
            history.append(obs)
            
            # Update model with new observation (append, don't re-fit fully for speed)
            model_fit = model_fit.append([obs], refit=False)
            
    except Exception as e:
        print(f"ARIMA training failed: {e}")
        predictions = [0] * len(test)
        
    return predictions

def train_prophet_model(train, test):
    # Prophet requires 'ds' and 'y' columns
    # Rolling Forecast for Prophet (Weekly update for accuracy)
    history = train[['date', 'cases']].rename(columns={'date': 'ds', 'cases': 'y'})
    test_dates = test['date'].tolist()
    test_cases = test['cases'].tolist()
    predictions = []
    
    # Hide Prophet output to keep console clean
    import logging
    logging.getLogger('prophet').setLevel(logging.ERROR)
    
    print(f"    Running Prophet Rolling Forecast on {len(test_dates)} points...")
    
    for t in range(len(test_dates)):
        # Fit model on current history
        m = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
        m.fit(history)
        
        # Forecast 1 step
        future = pd.DataFrame([test_dates[t]], columns=['ds'])
        forecast = m.predict(future)
        yhat = forecast.iloc[0]['yhat']
        predictions.append(yhat)
        
        # Observe actual and update history
        new_row = pd.DataFrame({'ds': [test_dates[t]], 'y': [test_cases[t]]})
        history = pd.concat([history, new_row], ignore_index=True)
        
    return np.array(predictions)



def calculate_accuracy(y_true, y_pred):
    """
    Calculates accuracy using 100 - SMAPE (Symmetric Mean Absolute Percentage Error).
    Includes a small constant to handle low values (0 vs 1) gracefully.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    # Baseline granularity constant (handles near-zero values gracefully)
    C = 1.0 
    denominator = np.abs(y_true) + np.abs(y_pred) + C
    diff = np.abs(y_true - y_pred)
    
    smape = 2.0 * diff / denominator
    mean_smape = np.mean(smape)
    
    # Scale: SMAPE stays [0, 2], so we normalize by /2 to get [0, 1] error scale.
    accuracy = 100 * (1 - (mean_smape / 2.0))
    return max(0.0, accuracy)

def train_models(df, disease_name):
    # Features and Target
    features = ['cases_lag1', 'cases_lag2', 'cases_lag4', 'rolling_avg_4', 'rolling_avg_12', 'month', 'year', 'quarter', 'growth_rate']
    target = 'cases'
    
    max_date = df['date'].max()
    split_date = max_date - pd.Timedelta(weeks=52)
    
    train = df[df['date'] <= split_date]
    test = df[df['date'] > split_date]
    
    X_train, y_train = train[features], train[target]
    X_test, y_test = test[features], test[target]
    
    # Aggregated National Target for Comparison
    test_ts = test.groupby('date')['cases'].sum().reset_index()
    y_test_national = test_ts['cases'].values
    
    # Models
    ml_models = {
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, random_state=42)
    }
    
    results = {}
    fitted_models = {} # Store model objects to return
    
    # Use absolute path for models to avoid nesting
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # 1. Train ML Models
    for name, model in ml_models.items():
        print(f"  Training {name}...")
        model.fit(X_train, y_train)
        
        # Predict at state level
        test_with_preds = test.copy()
        test_with_preds['preds'] = model.predict(X_test)
        
        # AGGREGATE to National level for metric calculation
        national_preds = test_with_preds.groupby('date')['preds'].sum().values
        
        mae = mean_absolute_error(y_test_national, national_preds)
        rmse = np.sqrt(mean_squared_error(y_test_national, national_preds))
        accuracy = calculate_accuracy(y_test_national, national_preds)
        
        results[name] = {"MAE": mae, "RMSE": rmse, "Accuracy": accuracy}
        fitted_models[name] = model # Keep in memory

    # 2. Train Time Series Models (on already aggregated data)
    train_ts = train.groupby('date')['cases'].sum().reset_index()
    
    # Train ARIMA
    print("  Training ARIMA...")
    try:
        # Note: We fit on the full train_ts and use rolling forecast for metrics
        # But for saving/loading, we need the fitted object from the end of history
        history = list(train_ts['cases'])
        arima_model = ARIMA(history, order=(5,1,0))
        arima_fit = arima_model.fit()
        
        # We still use train_arima_model (rolling) for the ACCURATE metrics
        arima_preds = train_arima_model(train_ts, test_ts)
        
        arima_mae = mean_absolute_error(y_test_national, arima_preds)
        arima_rmse = np.sqrt(mean_squared_error(y_test_national, arima_preds))
        arima_acc = calculate_accuracy(y_test_national, arima_preds)
        results["ARIMA"] = {"MAE": arima_mae, "RMSE": arima_rmse, "Accuracy": arima_acc}
        fitted_models["ARIMA"] = arima_fit
        
    except Exception as e:
        print(f"  ARIMA failed: {e}")
        results["ARIMA"] = {"MAE": 99999, "RMSE": 99999, "Accuracy": 0}

    # Train Prophet
    print("  Training Prophet...")
    try:
        prophet_train = train_ts[['date', 'cases']].rename(columns={'date': 'ds', 'cases': 'y'})
        prophet_model = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
        prophet_model.fit(prophet_train)
        
        prophet_preds = train_prophet_model(train_ts, test_ts)
        
        prophet_mae = mean_absolute_error(y_test_national, prophet_preds)
        prophet_rmse = np.sqrt(mean_squared_error(y_test_national, prophet_preds))
        prophet_acc = calculate_accuracy(y_test_national, prophet_preds)
        results["Prophet"] = {"MAE": prophet_mae, "RMSE": prophet_rmse, "Accuracy": prophet_acc}
        fitted_models["Prophet"] = prophet_model
        
    except Exception as e:
         print(f"  Prophet failed: {e}")
         results["Prophet"] = {"MAE": 99999, "RMSE": 99999, "Accuracy": 0}
            
    return results, test, features, fitted_models

if __name__ == "__main__":
    from preprocess import load_and_preprocess
    from feature_engineering import generate_features
    import json
    
    # Absolute path for datasets folder
    base_dir = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(base_dir, "datasets")
    best_models_manifest = {}
    all_summaries = [] # To collect metrics for aggregate_summary.csv
    
    if os.path.exists(DATA_DIR):
        # Calculate absolute path for models folder (inside backend)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(base_dir, 'models')
        print(f"Target Models Directory: {models_dir}")
        
        # Clear old models and ensure folder exists
        if os.path.exists(models_dir):
            import shutil
            shutil.rmtree(models_dir)
        os.makedirs(models_dir, exist_ok=True)
        
        files = [f for f in os.listdir(DATA_DIR) if f.endswith('.csv')]
        print(f"Found {len(files)} datasets: {files}")
        
        for filename in files:
            disease_name = filename.replace('.csv', '').capitalize()
            file_path = os.path.join(DATA_DIR, filename)
            
            print(f"\n{'='*40}")
            print(f"Processing: {disease_name}")
            print(f"{'='*40}")
            
            df = load_and_preprocess(file_path)
            df = generate_features(df)
            
            results, test_data, features, fitted_models = train_models(df, disease_name)
            
            print(f"\n{disease_name} Performance:")
            best_model = ""
            best_accuracy = -1
            
            for name, metrics in results.items():
                print(f"{name}: RMSE={metrics['RMSE']:.2f}, Accuracy={metrics['Accuracy']:.2f}%")
                # Select based on Accuracy now
                if metrics['Accuracy'] > best_accuracy:
                    best_accuracy = metrics['Accuracy']
                    best_model = name
            
            print(f">> Best Model: {best_model} (Accuracy: {best_accuracy:.2f}%)")
            
            # --- Classification Report for Severity ---
            best_model_obj = fitted_models[best_model]
            
            # Re-predict on test set with best model
            # We need to use the SAME test set features used during training
            # X_test was defined inside train_models, but we need it here.
            # train_models returned 'test' which is the dataframe.
            
            # Re-create X_test
            # features was returned by train_models
            X_test_final = test_data[features]
            y_pred_final = best_model_obj.predict(X_test_final)
            
            # Calculate thresholds from FULL dataset (df) - simulating what api.py does
            thresholds = get_thresholds(df)
            
            # Vectorize classification
            y_true_severity = [classify_severity(c, thresholds) for c in test_data['cases']]
            y_pred_severity = [classify_severity(c, thresholds) for c in y_pred_final]
            
            print("\nClassification Report (Severity):")
            print(classification_report(y_true_severity, y_pred_severity, zero_division=0))
            # ------------------------------------------
            
            # Store best model info in manifest
            best_models_manifest[disease_name] = {
                "model": best_model,
                "metrics": results[best_model]
            }
            
            # SAVE ONLY THE BEST MODEL
            best_model_obj = fitted_models[best_model]
            dst_path = os.path.join(models_dir, f'{disease_name.lower()}_best_model.pkl')
            
            try:
                # Double check dir exists
                os.makedirs(os.path.dirname(dst_path), exist_ok=True)
                with open(dst_path, 'wb') as f:
                    pickle.dump(best_model_obj, f)
                print(f">> Successfully saved best model to: {dst_path}")
            except Exception as e:
                print(f"Error saving best model to {dst_path}: {e}")
            
            # Collect summary for aggregate_summary.csv
            best_metrics = results[best_model]
            all_summaries.append({
                "Disease": disease_name,
                "Best Model": best_model,
                "MAE": best_metrics.get("MAE", 0),
                "RMSE": best_metrics.get("RMSE", 0),
                "ModelPerformance": best_metrics.get("Accuracy", 0)
            })
            
            # Save Aggregate Summary (INCREMENTAL)
            outputs_dir = os.path.join(base_dir, 'outputs')
            os.makedirs(outputs_dir, exist_ok=True)
            summary_path = os.path.join(outputs_dir, 'aggregate_summary.csv')
            summary_df = pd.DataFrame(all_summaries)
            summary_df.to_csv(summary_path, index=False)
            print(f">> Updated Aggregate Summary: {summary_path}")
            
        # Save Manifest
        manifest_path = os.path.join(models_dir, 'model_manifest.json')
        with open(manifest_path, 'w') as f:
            json.dump(best_models_manifest, f, indent=4)
        print(f"\nModel Manifest saved to {manifest_path}")
            
    else:
        print(f"Directory not found: {DATA_DIR}")
