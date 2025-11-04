import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Computer Science Student",
    avatar: "SC",
    content: "Learnova's AI adaptation is incredible. It understood my learning style within days and created a perfect curriculum. The voice feature helped me learn complex algorithms while commuting.",
    rating: 5,
    gradient: "from-violet-500 to-purple-500"
  },
  {
    name: "Dr. Michael Rodriguez",
    role: "Professor, MIT",
    avatar: "MR",
    content: "As an educator, I'm impressed by the blockchain verification. Students can now prove their skills globally. The multilingual support opens education to everyone worldwide.",
    rating: 5,
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    name: "Aisha Patel",
    role: "Data Scientist",
    avatar: "AP",
    content: "The AI chatbot mentor is like having a personal tutor 24/7. It explains concepts differently when I don't understand, and the certificates are instantly verifiable by employers.",
    rating: 5,
    gradient: "from-green-500 to-emerald-500"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Loved by
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {" "}Learners Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of students and educators who trust Learnova for their learning journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 h-full relative overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Quote icon */}
                <motion.div
                  className="absolute top-4 right-4 text-cyan-400/30"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Quote className="h-8 w-8" />
                </motion.div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-300 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center text-white font-semibold text-lg`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Hover effect line */}
                <motion.div
                  className={`mt-6 h-1 bg-gradient-to-r ${testimonial.gradient} rounded-full`}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">98%</div>
            <div className="text-gray-400">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-violet-400 mb-2">50+</div>
            <div className="text-gray-400">Countries</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400 mb-2">1M+</div>
            <div className="text-gray-400">Lessons Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-gray-400">AI Support</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;