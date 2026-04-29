import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ArrowRight, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { api, PredictionOutput } from "@/services/api";
import { toast } from "sonner";

interface OutbreakPredictorProps {
  selectedDisease: string;
}

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

const NumberInput = ({ label, value, onChange, step = 1, min = 0, max = 1000 }: InputFieldProps) => {
  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center glass-card rounded-xl overflow-hidden">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-foreground"
          step={step}
          min={min}
          max={max}
        />
        <button
          onClick={handleDecrement}
          className="px-3 py-3 border-l border-white/20 hover:bg-white/30 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleIncrement}
          className="px-3 py-3 border-l border-white/20 hover:bg-white/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const OutbreakPredictor = ({ selectedDisease }: OutbreakPredictorProps) => {
  const [casesT1, setCasesT1] = useState(10);
  const [casesT2, setCasesT2] = useState(60);
  const [casesT4, setCasesT4] = useState(80);
  const [growthRate, setGrowthRate] = useState(20.0);
  const [rollingAvg4, setRollingAvg4] = useState(20.0);
  const [rollingAvg12, setRollingAvg12] = useState(20.0);
  const [forecastMonth, setForecastMonth] = useState(4);
  const [forecastYear, setForecastYear] = useState(2024);
  
  const [prediction, setPrediction] = useState<PredictionOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const result = await api.predictOutbreak(selectedDisease, {
        cases_lag1: casesT1,
        cases_lag2: casesT2,
        cases_lag4: casesT4,
        rolling_avg_4: rollingAvg4,
        rolling_avg_12: rollingAvg12,
        month: forecastMonth,
        year: forecastYear,
        quarter: Math.floor((forecastMonth - 1) / 3) + 1,
        growth_rate: growthRate
      });
      setPrediction(result);
      toast.success("Prediction generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">
          Real-Time Case Prediction & Severity Analysis
        </h2>
        <div className="glass-card rounded-xl p-4 mb-8 border-l-4 border-secondary">
          <p className="text-primary font-medium">
            Enter historical indicators to predict the total case count.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Previous Trends */}
        <motion.div 
          className="glass-card-strong rounded-2xl p-6 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-foreground">
            Previous Trends (Lag Features)
          </h3>

          <NumberInput
            label="Cases in Last Week (t-1)"
            value={casesT1}
            onChange={setCasesT1}
          />

          <NumberInput
            label="Cases 2 Weeks Ago (t-2)"
            value={casesT2}
            onChange={setCasesT2}
          />

          <NumberInput
            label="Cases 4 Weeks Ago (t-4)"
            value={casesT4}
            onChange={setCasesT4}
          />

          <NumberInput
            label="Current Growth Rate (%)"
            value={growthRate}
            onChange={setGrowthRate}
            step={0.01}
          />
        </motion.div>

        {/* Right Column - Averages & Time */}
        <motion.div 
          className="glass-card-strong rounded-2xl p-6 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-foreground">
            Averages & Time
          </h3>

          <NumberInput
            label="4-Week Rolling Average"
            value={rollingAvg4}
            onChange={setRollingAvg4}
            step={0.01}
          />

          <NumberInput
            label="12-Week Rolling Average"
            value={rollingAvg12}
            onChange={setRollingAvg12}
            step={0.01}
          />

          {/* Forecast Month Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Forecast Month</label>
              <span className="text-sm font-semibold text-primary">{forecastMonth}</span>
            </div>
            <Slider
              value={[forecastMonth]}
              onValueChange={(value) => setForecastMonth(value[0])}
              min={1}
              max={12}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>12</span>
            </div>
          </div>

          <NumberInput
            label="Forecast Year"
            value={forecastYear}
            onChange={setForecastYear}
            min={2020}
            max={2030}
          />
        </motion.div>
      </div>

      {/* Predict Button */}
      <motion.div 
        className="pt-4 flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handlePredict}
          disabled={loading}
          className="group flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
        >
          {loading ? (
             <>
               <Loader2 className="w-5 h-5 animate-spin"/> Predicting...
             </>
          ) : (
             <>
               Predict Outbreak Severity
               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </>
          )}
        </button>

        {prediction && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border ${
              prediction.severity === 'High' ? 'bg-red-500/10 border-red-500/30' :
              prediction.severity === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-green-500/10 border-green-500/30'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Predicted Cases</p>
                <p className="text-3xl font-bold">{prediction.predicted_cases}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Severity Level</p>
                <p className={`text-2xl font-bold ${
                  prediction.severity === 'High' ? 'text-red-500' :
                  prediction.severity === 'Medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>{prediction.severity}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OutbreakPredictor;
