# Disease Outbreak Prediction Using Historical Epidemiological Data

An interactive machine learning system designed to forecast future disease trends and identify potential outbreaks at a regional (State) level using over 50 years of historical data.

## 🌟 Project Overview
This project provides an **Early Warning System (EWS)** for public health officials. By analyzing patterns in seasonal data, growth rates, and historical momentum, the system predicts the number of cases for various diseases and classifies the risk level into **Low, Medium, and High**.

### **Key Features**
- **Multi-Disease Support**: Specialized models for Measles, Hepatitis, Mumps, Pertussis, Polio, Rubella, and Smallpox.
- **Ensemble Learning**: Uses **Random Forest Regressor** to achieve high predictive accuracy (up to 92%).
- **Interactive Dashboard**: A custom **Streamlit** app for real-time "What-If" scenario analysis.
- **Dynamic Thresholding**: Outbreak alerts are triggered based on historical 90th percentiles.
- **Automated Visualizations**: Generates time-series trend plots and heatmaps for specific regions.

---

## 🚀 Getting Started

### Backend setup(Python 3.8.10)
1. `py -3.8 -m venv venv`
2. `venv/Scripts/activate`
3. `pip install -r requirements.txt`
4. `python -m uvicorn api:app --reload`


## 🛠️ Technical Workflow

### **1. Data Preprocessing**
Standardizes raw historical records, handles missing values, and converts temporal data (Year-Week) into standard datetime objects for time-series analysis.

### **2. Feature Engineering**
The model is trained on 9 key indicators:
- **Lags (t-1, t-2, t-4)**: Captures recent momentum.
- **Rolling Averages**: Identifies smoothed long-term trends.
- **Growth Rate**: Measures the speed of spread.
- **Seasonal Indicators**: Accounts for cyclical outbreaks (Month/Year).

### **3. Accuracy & Performance**
| Disease Theme | Accuracy (R²) | Reliability |
| :--- | :--- | :--- |
| **Pertussis** | **92.39%** | Excellent |
| **Polio** | **76.90%** | High |
| **Smallpox** | **71.38%** | High |

---

## 📊 Risk Classification Logic
Risk is determined by comparing predictions against historical stats:
- 🟢 **Low**: Predicted cases $\leq$ Median (Normal activity).
- 🟡 **Medium**: Predicted cases fall between Median and 90th percentile (Warning).
- 🔴 **High**: Predicted cases $\geq$ 90th percentile (**Outbreak Alert**).

---

## 📂 Project Structure
- `app.py`: Main Streamlit dashboard code.
- `preprocess.py`: Data cleaning and transformation.
- `train.py`: Machine learning training pipeline.
- `predict.py`: Risk classification and forecasting logic.
- `visualize.py`: Automated plotting scripts.
- `report_summary.md`: Consolidated project results and metrics.

---

## ⚖️ License
This project is developed for educational and research purposes in epidemiological forecasting.

