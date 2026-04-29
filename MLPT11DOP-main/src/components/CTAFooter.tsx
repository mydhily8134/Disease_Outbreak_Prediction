import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTAFooter = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 relative gradient-bg">
      <div className="container px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground/80">Trusted by Health Organizations Worldwide</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to prevent the{" "}
            <span className="text-gradient">next outbreak?</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of health professionals using Epidemic Guard to protect their communities with data-driven insights.
          </p>

          <motion.button
            onClick={() => navigate('/dashboard')}
            className="group inline-flex items-center gap-3 bg-foreground text-background px-10 py-5 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Free tier available
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="container px-4 mt-24">
        <div className="glass-card rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl icon-gradient-pink flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Epidemic Guard</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2026 Epidemic Guard. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAFooter;
