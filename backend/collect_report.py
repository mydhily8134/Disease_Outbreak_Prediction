import pandas as pd
import os
from preprocess import load_and_preprocess
from predict import get_thresholds

summary = pd.read_csv('outputs/aggregate_summary.csv')
results = []
for _, row in summary.iterrows():
    disease = row['Disease']
    try:
        df = load_and_preprocess(disease.lower() + '.csv')
        t = get_thresholds(df)
        results.append({
            'Disease': disease,
            'Low Threshold (Normal)': f"<= {int(t['low_med'])}",
            'Medium Threshold (Warning)': f"{int(t['low_med'])+1} to {int(t['med_high'])-1}",
            'High Threshold (Outbreak)': f">= {int(t['med_high'])}"
        })
    except:
        pass

print("\n### Final Project Metrics: Accuracy & Thresholds")
print(pd.DataFrame(results).to_markdown(index=False))
