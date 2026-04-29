import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, BarChart3, Target, TrendingUp, ArrowLeft, Map } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import PerformanceOverview from "@/components/dashboard/PerformanceOverview";
import OutbreakPredictor from "@/components/dashboard/OutbreakPredictor";
import HistoricalTrends from "@/components/dashboard/HistoricalTrends";
import GISMap from "@/components/dashboard/GISMap";

const diseases = [
  "PERTUSSIS",
  "HEPATITIS",
  "MEASLES",
  "MUMPS",
  "POLIO",
  "RUBELLA",
  "SMALLPOX",
];

const Dashboard = () => {
  const [selectedDisease, setSelectedDisease] = useState("PERTUSSIS");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg flex relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/20 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/20 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Sidebar */}
      <motion.aside
        className="w-72 glass-card-strong border-r border-white/20 p-6 flex flex-col relative z-10"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <h2 className="text-xl font-bold text-gradient mb-6">Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Select Disease Theme
            </label>
            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger className="w-full glass-card border-white/30 bg-white/50">
                <SelectValue placeholder="Select disease" />
              </SelectTrigger>
              <SelectContent className="glass-card-strong border-white/30">
                {diseases.map((disease) => (
                  <SelectItem key={disease} value={disease}>
                    {disease}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl icon-gradient-cyan">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">
              Disease Outbreak Prediction System
            </h1>
          </div>
          <p className="text-lg text-primary/80 font-medium mb-6">
            Historical Epidemiological Trend Analysis & Forecasting
          </p>

          {/* Tabs */}
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="glass-card border-white/30 rounded-2xl w-fit p-1 gap-1 h-auto mb-8">
              <TabsTrigger
                value="performance"
                className="data-[state=active]:bg-white/80 data-[state=active]:shadow-md data-[state=active]:text-primary rounded-xl px-4 py-3 flex items-center gap-2 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                Performance Overview
              </TabsTrigger>
              <TabsTrigger
                value="predictor"
                className="data-[state=active]:bg-white/80 data-[state=active]:shadow-md data-[state=active]:text-primary rounded-xl px-4 py-3 flex items-center gap-2 transition-all"
              >
                <Target className="w-4 h-4" />
                Outbreak Predictor
              </TabsTrigger>
              <TabsTrigger
                value="historical"
                className="data-[state=active]:bg-white/80 data-[state=active]:shadow-md data-[state=active]:text-primary rounded-xl px-4 py-3 flex items-center gap-2 transition-all"
              >
                <TrendingUp className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-white/80 data-[state=active]:shadow-md data-[state=active]:text-primary rounded-xl px-4 py-3 flex items-center gap-2 transition-all"
              >
                <Map className="w-4 h-4" />
                Geographical Distribution
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <PerformanceOverview selectedDisease={selectedDisease} />
            </TabsContent>

            <TabsContent value="predictor">
              <OutbreakPredictor selectedDisease={selectedDisease} />
            </TabsContent>

            <TabsContent value="historical">
              <HistoricalTrends selectedDisease={selectedDisease} />
            </TabsContent>

            <TabsContent value="map">
              <GISMap selectedDisease={selectedDisease} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
