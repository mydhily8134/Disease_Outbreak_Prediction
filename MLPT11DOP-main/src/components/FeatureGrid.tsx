import { motion } from "framer-motion";
import { Clock, TrendingUp, Cpu, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Time-Series Lags",
    description: "Analyze temporal patterns with advanced lag correlation to identify early warning signals before outbreaks occur.",
    gradient: "icon-gradient-pink",
  },
  {
    icon: TrendingUp,
    title: "Seasonal Growth Rates",
    description: "Track seasonal variations and growth patterns to predict disease spread with precision.",
    gradient: "icon-gradient-purple",
  },
  {
    icon: Cpu,
    title: "Random Forest Brain",
    description: "Powered by ensemble machine learning models for robust predictions across diverse scenarios.",
    gradient: "icon-gradient-cyan",
  },
  {
    icon: BarChart3,
    title: "Automated Visualizations",
    description: "Generate beautiful, actionable charts and maps that communicate risk clearly to stakeholders.",
    gradient: "icon-gradient-blue",
  },
];

const FeatureGrid = () => {
  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Powerful <span className="text-gradient">Features</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced AI capabilities designed for accurate outbreak prediction
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="glass-card rounded-2xl p-6 group hover:scale-[1.03] transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div className={`w-14 h-14 rounded-xl ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureGrid;
