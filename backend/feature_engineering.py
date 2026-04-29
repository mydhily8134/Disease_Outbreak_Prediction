import pandas as pd
import numpy as np

def generate_features(df):
    """
    Generates time-series and seasonal features for outbreak prediction.
    """
    # Group by state to ensure features are per-region
    df_sorted = df.sort_values(['state', 'date'])
    
    # 1. Lag Features (1, 2, 4 weeks)
    df_sorted['cases_lag1'] = df_sorted.groupby('state')['cases'].shift(1)
    df_sorted['cases_lag2'] = df_sorted.groupby('state')['cases'].shift(2)
    df_sorted['cases_lag4'] = df_sorted.groupby('state')['cases'].shift(4)
    
    # 2. Rolling Averages (4 and 12 weeks)
    df_sorted['rolling_avg_4'] = df_sorted.groupby('state')['cases'].transform(lambda x: x.rolling(window=4).mean())
    df_sorted['rolling_avg_12'] = df_sorted.groupby('state')['cases'].transform(lambda x: x.rolling(window=12).mean())
    
    # 3. Seasonal Indicators
    df_sorted['month'] = df_sorted['date'].dt.month
    df_sorted['year'] = df_sorted['date'].dt.year
    df_sorted['quarter'] = df_sorted['date'].dt.quarter
    
    # 4. Growth Rate (Percentage change week-over-week)
    df_sorted['growth_rate'] = df_sorted.groupby('state')['cases'].pct_change().replace([np.inf, -np.inf], np.nan).fillna(0)
    
    # Drop rows with NaNs resulting from lags/rolling
    df_sorted = df_sorted.dropna()
    
    return df_sorted

if __name__ == "__main__":
    from preprocess import load_and_preprocess
    data_path = r"e:\TRIZEN\Disease-Outbreak-Prediction\measles.csv"
    df = load_and_preprocess(data_path)
    featured_df = generate_features(df)
    print("\nFeature Engineering Complete.")
    print(featured_df[['date', 'state', 'cases', 'cases_lag1', 'rolling_avg_4', 'growth_rate']].head())
