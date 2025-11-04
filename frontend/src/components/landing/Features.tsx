import { motion } from "framer-motion";
import { Brain, Mic, Shield, Bot } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "🧠 Adaptive Learning Engine",
    description: "Learns your pace and difficulty. AI analyzes your performance to create personalized learning paths that adapt in real-time.",
    gradient: "from-violet-500 to-purple-500",
    delay: 0.1
  },
  {
    icon: Mic,
    title: "🎧 Multilingual Voice Support",
    description: "Powered by Whisper + GPT. Learn in your native language with voice-guided lessons and instant translations.",
    gradient: "from-cyan-500 to-blue-500",
    delay: 0.2
  },
  {
    icon: Shield,
    title: "🔐 Blockchain Credentials",
    description: "Verifiable and permanent. Your achievements are stored on blockchain, making them tamper-proof and globally recognized.",
    gradient: "from-green-500 to-emerald-500",
    delay: 0.3
  },
  {
    icon: Bot,
    title: "🤖 AI Chatbot Mentor",
    description: "Ask anything, anytime. Get instant help, explanations, and guidance from our intelligent AI tutor.",
    gradient: "from-orange-500 to-red-500",
    delay: 0.4
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
            <br />
            for Modern Learning
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the future of education with cutting-edge AI technology and blockchain security
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <motion.div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </motion.div>

                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                <motion.div
                  className={`mt-4 h-1 bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;