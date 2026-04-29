import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

interface HistoricalTrendsProps {
  selectedDisease: string;
}

// Mapping from State Abbreviation to State Name
const stateAbbrToName: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia"
};

const HistoricalTrends = ({ selectedDisease }: HistoricalTrendsProps) => {
  const [selectedState, setSelectedState] = useState<string>("");

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["history", selectedDisease, selectedState],
    queryFn: () => api.getHistoricalTrends(selectedDisease, selectedState),
  });

  // Automatically select the first available state when data loads or if default is used
  if (historyData?.selected_state && !selectedState) {
    setSelectedState(historyData.selected_state);
  }

  if (isLoading || !historyData) {
    return <div className="p-8 text-center">Loading historical trends...</div>;
  }

  // The API now returns data already filtered and formatted.
  const chartData = historyData.data;

  // Update selected state if not validation
  // This is a bit tricky as states might change per disease, 
  // ideally we should set default state when data loads. 
  // For now let's use the states from API for the dropdown.

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gradient">
        Geographical Trend Analysis: {selectedDisease}
      </h2>

      {/* Region Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Select Region (State)</label>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-full glass-card border-white/30 bg-white/50">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent className="glass-card-strong border-white/30 max-h-60 overflow-y-auto">
            {historyData.states.map((state) => (
              <SelectItem key={state} value={state}>
                {stateAbbrToName[state] || state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Series Chart */}
      <motion.div
        className="glass-card-strong rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Time-Series Case Data for {stateAbbrToName[selectedState] || selectedState}
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) => {
                try {
                  return new Date(value).toISOString().split('T')[0];
                } catch (e) {
                  return value;
                }
              }}
              label={{
                value: "Timeline",
                position: "bottom",
                offset: 40,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{
                value: "Cases",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <Tooltip
              labelFormatter={(value) => {
                try {
                  return new Date(value).toISOString().split('T')[0];
                } catch (e) {
                  return value;
                }
              }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ top: 0, right: 0 }}
            />
            <Line
              type="monotone"
              dataKey="cases"
              name="Actual Cases"
              stroke="hsl(var(--feature-blue))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--feature-blue))" }}
            />
            <Line
              type="monotone"
              dataKey="rolling_avg_12"
              name="Trend (Smoothed)"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: "#f97316" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default HistoricalTrends;
