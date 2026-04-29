import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import os

def plot_trends(results_df, state_name, disease_name, save_path=None):
    """
    Plots actual vs predicted trends for a specific state and disease.
    """
    sns.set(style="whitegrid")
    plt.figure(figsize=(14, 7))
    
    state_data = results_df[results_df['state'] == state_name]
    
    plt.plot(state_data['date'], state_data['cases'], label='Actual Cases', color='blue', linewidth=2, alpha=0.6)
    plt.plot(state_data['date'], state_data['predicted_cases'], label='Predicted Cases', color='orange', linestyle='--', linewidth=2)
    
    # Highlight severity
    high_severity = state_data[state_data['severity'] == 'High']
    plt.scatter(high_severity['date'], high_severity['cases'], color='red', label='Outbreak (High Severity)', zorder=5)
    
    plt.title(f'{disease_name} Outbreak Prediction - {state_name}', fontsize=16)
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Case Count', fontsize=12)
    plt.legend()
    
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, bbox_inches='tight', dpi=300)
        print(f"Plot saved to {save_path}")
    plt.close()

if __name__ == "__main__":
    print("Visualization module ready.")
