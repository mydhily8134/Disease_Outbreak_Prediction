import { motion } from "framer-motion";
import { ArrowRight, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statCards = [
  { label: "Active Cases", value: "2,847", change: "+12%", icon: Activity, color: "text-feature-pink" },
  { label: "Trend Score", value: "High", change: "Rising", icon: TrendingUp, color: "text-feature-purple" },
  { label: "Risk Level", value: "Moderate", change: "3 Regions", icon: AlertTriangle, color: "text-feature-cyan" },
];

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg">
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
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container relative z-10 px-4 py-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground/80">AI-Powered Disease Intelligence</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="text-foreground">Predict Disease</span>
            <br />
            <span className="text-gradient">Trends into Knowledge</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Get instant AI-powered risk alerts for 7+ diseases. 
            Protect your community with real-time outbreak predictions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Predicting
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="glass-card px-8 py-4 rounded-2xl font-semibold text-lg text-foreground hover:bg-card/80 transition-all duration-300"
            >
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Visual - Dashboard Preview */}
        <motion.div
          className="mt-16 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="glass-card-strong rounded-3xl p-6 sm:p-8">
            <div className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl p-6 relative overflow-hidden">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {statCards.map((stat, i) => (
                  <motion.div
                    key={i}
                    className="rounded-xl bg-card/90 shadow-sm p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.change}</div>
                  </motion.div>
                ))}
              </div>
              
              {/* Chart Mockups */}
              <div className="grid grid-cols-2 gap-4">
                {/* Line Chart */}
                <motion.div
                  className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 shadow-sm p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Outbreak Trend</span>
                    <span className="text-xs text-muted-foreground">Last 7 days</span>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary/60 to-primary/30 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 1.4 + i * 0.05, duration: 0.3 }}
                      />
                    ))}
                  </div>
                </motion.div>
                
                {/* Map Mockup */}
                <motion.div
                  className="rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 shadow-sm p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Regional Risk Map</span>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 h-24">
                    {[
                      "bg-feature-cyan/30", "bg-feature-pink/50", "bg-feature-cyan/20", "bg-feature-purple/30",
                      "bg-feature-pink/40", "bg-feature-cyan/40", "bg-feature-purple/50", "bg-feature-cyan/30",
                      "bg-feature-purple/20", "bg-feature-pink/30", "bg-feature-cyan/50", "bg-feature-pink/20",
                    ].map((color, i) => (
                      <motion.div
                        key={i}
                        className={`rounded ${color}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 + i * 0.03, duration: 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
