import { motion } from "framer-motion";
import { Map, Brain, Bell } from "lucide-react";

const steps = [
  {
    icon: Map,
    title: "Select State/Region",
    description: "Choose your geographic area of interest from our comprehensive coverage map.",
    step: "01",
    gradient: "icon-gradient-pink",
  },
  {
    icon: Brain,
    title: "AI Analyzing Patterns",
    description: "Our machine learning models process historical data and current trends.",
    step: "02",
    gradient: "icon-gradient-purple",
  },
  {
    icon: Bell,
    title: "Real-time Alerts",
    description: "Receive instant notifications when outbreak risks are detected in your area.",
    step: "03",
    gradient: "icon-gradient-cyan",
  },
];

const ProcessSection = () => {
  return (
    <section className="py-24 relative gradient-bg">
      <div className="container px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to stay ahead of disease outbreaks
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-secondary/30" />
              )}
              
              <div className="glass-card-strong rounded-3xl p-8 h-full hover:scale-[1.02] transition-transform duration-300 relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${step.gradient} flex items-center justify-center`}>
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <span className="text-5xl font-bold text-muted/40">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
