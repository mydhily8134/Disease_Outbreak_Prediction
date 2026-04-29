import os
import plotly.express as px
import plotly.graph_objects as go
from preprocess import load_and_preprocess
from feature_engineering import generate_features
from predict import classify_severity, get_thresholds
import pickle

# Set Page Config
st.set_page_config(page_title="Disease Outbreak Predictor", layout="wide")

# Styling
st.markdown("""
<style>
    .main {
        background-color: #0e1117;
        color: #ffffff;
    }
    .stMetric {
        background-color: #1e2227;
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #3e444b;
    }
    h1, h2, h3 {
        color: #00d4ff;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_resource
def load_models_and_data():
    models = {}
    datasets = {}
    if not os.path.exists('outputs/aggregate_summary.csv'):
        return {}, {}, pd.DataFrame()
        
    summary = pd.read_csv('outputs/aggregate_summary.csv')
    
    for _, row in summary.iterrows():
        disease = row['Disease'].lower()
        best_model = row['Best Model'] 
        
        # Load Best Model File
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, 'models', f'{disease}_best_model.pkl')
             
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                models[disease.upper()] = pickle.load(f)
        
        csv_path = f'{disease}.csv'
        if os.path.exists(csv_path):
            datasets[disease.upper()] = pd.read_csv(csv_path)
            
    return models, datasets, summary

def main():
    st.title("🌐 Disease Outbreak Prediction System")
    st.markdown("### Historical Epidemiological Trend Analysis & Forecasting")
    
    models, datasets, summary = load_models_and_data()
    
    if summary.empty:
        st.error("No model data found. Please run the training pipeline first (backend/main.py).")
        return

    # Sidebar
    st.sidebar.title("Configuration")
    selected_disease = st.sidebar.selectbox("Select Disease Theme", list(models.keys()))
    
    # Get Metadata for selected disease
    disease_summary = summary[summary['Disease'] == selected_disease].iloc[0]
    best_model_name = disease_summary['Best Model']
    
    # Tabs
    tab1, tab2, tab3 = st.tabs(["📊 Performance Overview", "🎯 Outbreak Predictor", "📈 Historical Trends"])
    
    with tab1:
        st.subheader(f"Model Performance: {selected_disease}")
        
        col1, col2, col3 = st.columns(3)
        col1.metric("Selected Model", best_model_name)
        col2.metric("Mean Absolute Error (MAE)", f"{disease_summary['MAE']:.4f}")
        col3.metric("RMSE", f"{disease_summary['RMSE']:.4f}")
        
        st.markdown("---")
        st.subheader("Aggregate Model Accuracy (MAE) Across Themes")
        if 'MAE' in summary.columns:
            fig = px.bar(summary, x='Disease', y='MAE', color='MAE', 
                        title="Comparative Prediction Error",
                        color_continuous_scale='Reds')
            st.plotly_chart(fig, use_container_width=True)
 
    with tab2:
        st.subheader("Real-Time Case Prediction & Severity Analysis")
        
        if best_model_name in ["Random Forest", "Gradient Boosting"]:
            st.info(f"Using **{best_model_name}**. Enter historical indicators to predict total cases.")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("**Previous Trends (Lag Features)**")
                lag1 = st.number_input("Cases in Last Week (t-1)", min_value=0, value=10)
                lag2 = st.number_input("Cases 2 Weeks Ago (t-2)", min_value=0, value=8)
                lag4 = st.number_input("Cases 4 Weeks Ago (t-4)", min_value=0, value=5)
                growth = st.number_input("Current Growth Rate (%)", value=0.1)
                
            with col2:
                st.write("**Averages & Time**")
                roll4 = st.number_input("4-Week Rolling Average", min_value=0.0, value=9.0)
                roll12 = st.number_input("12-Week Rolling Average", min_value=0.0, value=12.0)
                month = st.slider("Forecast Month", 1, 12, 1)
                year = st.number_input("Forecast Year", value=2026)
                quarter = (month - 1) // 3 + 1
                
            if st.button("Predict Outbreak Severity"):
                input_df = pd.DataFrame([[lag1, lag2, lag4, roll4, roll12, month, year, quarter, growth]], 
                                         columns=['cases_lag1', 'cases_lag2', 'cases_lag4', 'rolling_avg_4', 'rolling_avg_12', 'month', 'year', 'quarter', 'growth_rate'])
                
                prediction = models[selected_disease].predict(input_df)[0]
                
                # Severity Logic
                raw_df = datasets[selected_disease] # use preloaded
                thresholds = get_thresholds(raw_df)
                severity = classify_severity(prediction, thresholds)
                
                st.markdown("---")
                res_col1, res_col2 = st.columns(2)
                res_col1.metric("Predicted Case Count", f"{int(prediction)}")
                
                if severity == 'High':
                    res_col2.error(f"Severity Level: {severity} (OUTBREAK ALERT)")
                elif severity == 'Medium':
                    res_col2.warning(f"Severity Level: {severity}")
                else:
                    res_col2.success(f"Severity Level: {severity}")
                    
        elif best_model_name in ["ARIMA", "Prophet"]:
            st.info(f"Using **{best_model_name}**. Forecasting future trends based on historical data.")
            
            steps = st.slider("Forecast Horizon (Weeks)", 1, 52, 12)
            
            if st.button("Generate Forecast"):
                model = models[selected_disease]
                
                try:
                    if best_model_name == "ARIMA":
                         # ARIMA Forecast
                         # Note: wrapper.forecast(steps) forecasts from end of training data.
                         # This might not be "real-time" if model isn't retrained.
                         # For demo, we show the next 'steps' from where training left off.
                         forecast = model.forecast(steps=steps)
                         preds = forecast.tolist()
                         
                    elif best_model_name == "Prophet":
                         # Prophet Forecast
                         future = model.make_future_dataframe(periods=steps, freq='W')
                         forecast = model.predict(future)
                         # Take last 'steps' rows
                         preds = forecast.tail(steps)['yhat'].values
                    
                    # Visualize Forecast
                    st.success(f"Generated forecast for next {steps} weeks.")
                    
                    # Create a simple df for plotting
                    dates = pd.date_range(start=pd.Timestamp.now(), periods=steps, freq='W')
                    forecast_df = pd.DataFrame({'Date': dates, 'Predicted Cases': preds})
                    
                    fig_forecast = px.line(forecast_df, x='Date', y='Predicted Cases', title=f"{best_model_name} Forecast")
                    st.plotly_chart(fig_forecast, use_container_width=True)
                    
                except Exception as e:
                    st.error(f"Forecasting failed: {e}")
                
    with tab3:
        st.subheader(f"Geographical Trend Analysis: {selected_disease}")
        state_list = datasets[selected_disease]['state'].unique()
        selected_state = st.selectbox("Select Region (State)", state_list)
        
        # Load processed data for plotting
        raw_df = load_and_preprocess(f"{selected_disease.lower()}.csv")
        featured_df = generate_features(raw_df)
        state_data = featured_df[featured_df['state'] == selected_state]
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=state_data['date'], y=state_data['cases'], name='Actual Cases', line=dict(color='#00d4ff', width=2)))
        fig.add_trace(go.Scatter(x=state_data['date'], y=state_data['rolling_avg_12'], name='12-Week Trend', line=dict(color='orange', dash='dot')))
        
        fig.update_layout(title=f"Time-Series Case Data for {selected_state}",
                          xaxis_title="Timeline", yaxis_title="Cases",
                          template="plotly_dark")
        st.plotly_chart(fig, use_container_width=True)

    # Global Risk Map (New Feature)
    st.markdown("---")
    st.subheader(f"🗺️ Regional Risk Map: {selected_disease}")
    
    # Process all states to get current risk
    raw_df_all = load_and_preprocess(f"{selected_disease.lower()}.csv")
    featured_df_all = generate_features(raw_df_all)
    
    # Get the most recent predictions for all states
    latest_date = featured_df_all['date'].max()
    current_risk_df = featured_df_all[featured_df_all['date'] == latest_date].copy()
    
    # Load model to predict
    model_path = f'models/{selected_disease.lower()}_random_forest.pkl'
    if os.path.exists(model_path):
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        features = ['cases_lag1', 'cases_lag2', 'cases_lag4', 'rolling_avg_4', 'rolling_avg_12', 'month', 'year', 'quarter', 'growth_rate']
        current_risk_df['predicted'] = model.predict(current_risk_df[features])
        
        thresholds = get_thresholds(raw_df_all)
        current_risk_df['severity'] = current_risk_df['predicted'].apply(lambda x: classify_severity(x, thresholds))
        
        # Mapping severity to numeric for map coloring
        sev_map = {'Low': 0, 'Medium': 1, 'High': 2}
        current_risk_df['risk_score'] = current_risk_df['severity'].map(sev_map)
        
        fig_map = px.choropleth(current_risk_df,
                                locations='state',
                                locationmode="USA-states",
                                color='risk_score',
                                hover_name='state',
                                hover_data={'severity': True, 'predicted': ':.2f', 'risk_score': False},
                                color_continuous_scale=[(0, "green"), (0.5, "yellow"), (1, "red")],
                                range_color=[0, 2],
                                scope="usa",
                                title=f"Real-Time Outbreak Risk Level across USA ({latest_date.strftime('%Y-%m-%d')})")
        
        fig_map.update_layout(coloraxis_showscale=False, template="plotly_dark")
        st.plotly_chart(fig_map, use_container_width=True)
        
        st.info("💡 **Map Legend**: 🟢 Green = Low Risk | 🟡 Yellow = Medium Risk | 🔴 Red = High Outbreak Risk")
