import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api, DiseaseMetric } from "@/services/api";

interface PerformanceOverviewProps {
  selectedDisease: string;
}

const PerformanceOverview = ({ selectedDisease }: PerformanceOverviewProps) => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["performance"],
    queryFn: api.getPerformanceMetrics,
  });

  if (isLoading || !metrics) {
    return <div className="p-8 text-center">Loading performance metrics...</div>;
  }

  // Find metrics for selected disease (Case-insensitive)
  const currentMetrics = metrics.find((m) => m?.Disease?.toUpperCase() === selectedDisease?.toUpperCase());

  // Format MAE data for chart
  // Assign colors based on index or logic
  const colors = [
    "hsl(0, 70%, 35%)", "hsl(0, 60%, 85%)", "hsl(0, 55%, 80%)",
    "hsl(15, 80%, 70%)", "hsl(0, 60%, 85%)", "hsl(0, 60%, 88%)",
    "hsl(0, 55%, 82%)"
  ];

  const maeData = metrics.map((m, i) => ({
    disease: m?.Disease || "Unknown",
    modelPerformance: m?.ModelPerformance || 0,
    color: colors[i % colors.length]
  }));

  return (
    <div className="space-y-8">
      {/* Model Performance Section */}
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-6">
          Model Performance: {selectedDisease}
        </h2>

        {currentMetrics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              className="glass-card-strong rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm text-muted-foreground mb-2">Selected Model</p>
              <p className="text-2xl font-light text-foreground truncate">{currentMetrics["Best Model"] || "Random Forest"}</p>
            </motion.div>

            <motion.div
              className="glass-card-strong rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-muted-foreground mb-2">MAE</p>
              <p className="text-3xl font-light text-foreground">{(currentMetrics.MAE || 0).toFixed(4)}</p>
            </motion.div>

            <motion.div
              className="glass-card-strong rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-muted-foreground mb-2">RMSE</p>
              <p className="text-3xl font-light text-foreground">{(currentMetrics.RMSE || 0).toFixed(4)}</p>
            </motion.div>

            <motion.div
              className="glass-card-strong rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-sm text-muted-foreground mb-2">Model Performance</p>
              <p className="text-3xl font-light text-foreground">{(currentMetrics.ModelPerformance || 0).toFixed(2)}%</p>
            </motion.div>
          </div>
        ) : (
          <div className="p-4 glass-card text-muted-foreground">No data found for {selectedDisease}</div>
        )}
      </div>

      {/* Aggregate Model Accuracy Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gradient mb-4">
          Aggregate Model Performance Across Themes
        </h2>
        <p className="text-sm text-muted-foreground mb-6">Comparative Prediction Performance</p>

        <div className="glass-card-strong rounded-2xl p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={maeData} margin={{ top: 20, right: 80, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="disease"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                angle={0}
                dy={10}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                domain={[0, 100]}
                label={{
                  value: "Model Performance (%)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any) => [typeof value === 'number' ? `${value.toFixed(2)}%` : 'N/A', "Model Performance"]}
              />
              <Bar dataKey="modelPerformance" radius={[8, 8, 0, 0]}>
                {maeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceOverview;
