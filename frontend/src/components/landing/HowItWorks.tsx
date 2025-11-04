import { motion } from "framer-motion";
import { UserPlus, BookOpen, Award } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Join Learnova",
    description: "Create your account and tell us about your learning goals. Our AI analyzes your preferences and background.",
    number: "01",
    gradient: "from-violet-500 to-purple-500"
  },
  {
    icon: BookOpen,
    title: "Learn & Adapt",
    description: "Dive into personalized lessons that adapt to your pace. Voice guidance, interactive exercises, and AI mentorship.",
    number: "02",
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    icon: Award,
    title: "Verify & Earn",
    description: "Complete assessments and earn blockchain-verified certificates. Share your achievements globally with confidence.",
    number: "03",
    gradient: "from-green-500 to-emerald-500"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-slate-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              {" "}Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Three simple steps to transform your learning experience with AI-powered personalization
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="relative h-0.5 bg-gradient-to-r from-violet-500 via-cyan-500 to-green-500 rounded-full">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-500 via-cyan-500 to-green-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
                viewport={{ once: true }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group hover:scale-105">
                  {/* Step number */}
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} text-white font-bold text-xl mb-6 mx-auto`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="w-20 h-20 rounded-xl bg-slate-700/50 flex items-center justify-center mb-6 mx-auto group-hover:bg-slate-600/50 transition-colors"
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <step.icon className="h-10 w-10 text-cyan-400" />
                  </motion.div>

                  <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="lg:hidden flex justify-center mt-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1 + index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 border-r-2 border-b-2 border-cyan-400 transform rotate-45"></div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;