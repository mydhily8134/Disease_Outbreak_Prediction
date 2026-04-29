import pandas as pd
import numpy as np

def load_and_preprocess(filepath):
    """
    Loads disease case data and performs initial cleaning.
    """
    df = pd.read_csv(filepath)
    
    # Handle missing values
    df = df.dropna(subset=['week', 'cases', 'state'])
    
    # Ensure cases is numeric
    df['cases'] = pd.to_numeric(df['cases'], errors='coerce')
    df = df.dropna(subset=['cases'])
    df['cases'] = df['cases'].astype(int)
    
    # Convert week (YYYYWW) to datetime
    # Adding '0' for Sunday of that week as a convention
    df['date'] = pd.to_datetime(df['week'].astype(str) + '0', format='%Y%U%w')
    
    # Sort chronologically
    df = df.sort_values(['state', 'date'])
    
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Fill missing cases with 0 or forward fill? Let's use 0 for disease cases if missing
    df['cases'] = df['cases'].fillna(0)
    
    return df

if __name__ == "__main__":
    # Test on measles
    data_path = r"e:\TRIZEN\Disease-Outbreak-Prediction\measles.csv"
    processed_df = load_and_preprocess(data_path)
    print("Dataset Structure and Data Types:")
    print(processed_df.info())
    print("\nFirst 5 rows:")
    print(processed_df.head())
    
    # Summary for report
    summary = {
        "Total Records": len(processed_df),
        "Regions": processed_df['state'].nunique(),
        "Date Range": f"{processed_df['date'].min()} to {processed_df['date'].max()}",
        "Columns": list(processed_df.columns)
    }
    print("\nSummary:", summary)
