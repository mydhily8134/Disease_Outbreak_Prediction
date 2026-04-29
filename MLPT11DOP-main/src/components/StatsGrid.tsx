import { motion } from "framer-motion";
import { Target, Activity, MapPin, Sparkles } from "lucide-react";

const stats = [
  {
    icon: Target,
    value: "92%",
    label: "Accuracy",
    gradient: "icon-gradient-pink",
  },
  {
    icon: Activity,
    value: "7",
    label: "Diseases Tracked",
    gradient: "icon-gradient-purple",
  },
  {
    icon: MapPin,
    value: "50+",
    label: "Regional Analysis",
    gradient: "icon-gradient-cyan",
  },
  {
    icon: Sparkles,
    value: "Free",
    label: "Tools Available",
    gradient: "icon-gradient-blue",
  },
];

const StatsGrid = () => {
  return (
    <section className="py-20 relative">
      <div className="container px-4">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div className={`w-14 h-14 rounded-xl ${stat.gradient} flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsGrid;
