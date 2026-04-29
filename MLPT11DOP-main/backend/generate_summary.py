import pandas as pd
import pickle
import numpy as np
import os

def generate_consolidated_report():
    outputs_dir = 'outputs'
    models_dir = 'models'
    
    # 1. Load basic aggregate stats
    if os.path.exists(f'{outputs_dir}/aggregate_summary.csv'):
        aggregate_stats = pd.read_csv(f'{outputs_dir}/aggregate_summary.csv')
    else:
        aggregate_stats = pd.DataFrame()

    # 2. Get feature importance from the best overall model (using Measles as proxy)
    measles_model_path = f'{models_dir}/measles_random_forest.pkl'
    if os.path.exists(measles_model_path):
        with open(measles_model_path, 'rb') as f:
            model = pickle.load(f)
        features = ['cases_lag1', 'cases_lag2', 'cases_lag4', 'rolling_avg_4', 'rolling_avg_12', 'month', 'year', 'quarter', 'growth_rate']
        importances = model.feature_importances_
        feature_summary = pd.DataFrame({'Feature': features, 'Importance': importances}).sort_values(by='Importance', ascending=False)
        feature_md = feature_summary.to_markdown(index=False)
    else:
        feature_md = "Feature importance data not available."

    summary_text = f"""
# Consolidated Project Report: Multi-Disease Outbreak Prediction

## 1. Project Overview
This project predicts future outbreak trends for multiple diseases using historical epidemiological data.
Diseases analyzed: {', '.join(aggregate_stats['Disease'].tolist()) if not aggregate_stats.empty else 'Various'}

## 2. Dataset Structure
- **Source**: Historical records from 7 different disease themes.
- **Key Columns**: `date`, `state`, `cases` (Target).
- **Processing**: Time-series extraction and multi-region aggregation.

## 3. Feature Importance (Representative - Measles)
Features were generated to capture temporal dependencies and seasonal trends:
{feature_md}

## 4. Model Performance (MAE Across Diseases)
| Disease | MAE (Random Forest) |
|:---|---|
{aggregate_stats[['Disease', 'MAE']].to_markdown(index=False) if not aggregate_stats.empty else "N/A"}

## 5. Outbreak Identification & Severity
- **Severity Levels**:
    - **Low**: Cases below historical median.
    - **Medium**: Cases between Median and 90th percentile.
    - **High (Outbreak)**: Cases exceeding the 90th percentile.
- **Detection**: Highlighted by red markers in the generated trend plots.

## 6. Viva/Report Explanation (Inputs & Outputs)
- **Inputs**: Historical Case Counts, Time Metadata (Year, Month, Week), Region.
- **Outputs**: Predicted Future Cases, Outbreak Trends, Severity Alerts.
"""

    with open('report_summary.md', 'w') as f:
        f.write(summary_text)
    print("Consolidated report summary generated in report_summary.md")

if __name__ == "__main__":
    generate_consolidated_report()
