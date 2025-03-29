import { Link } from "react-router-dom";
import { useAuth } from "../utils/autcontext";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaUsers, FaRoad, FaTrophy, FaComments, FaCalendarAlt, FaChartLine, FaArrowRight, FaCheck, FaTimes, FaStar, FaGraduationCap, FaQuestionCircle } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import logo from "../../public/logo.jpg"
export default function LandingPage() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const headerRef = useRef(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Parallax effect for header
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Fade in animation for sections
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  // Stagger children animation
  const container = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Software Engineer at Google",
      image: "https://ui-avatars.com/api/?name=Sarah+Chen&background=random",
      text: "CampusConnect helped me connect with seniors who had cracked Google. Their interview experiences and guidance were invaluable in my preparation."
    },
    {
      name: "Alex Kumar",
      role: "Full Stack Developer at Microsoft",
      image: "https://ui-avatars.com/api/?name=Alex+Kumar&background=random",
      text: "The personalized tech roadmap feature helped me focus on the right skills and projects. I landed my dream job thanks to the structured guidance."
    },
    {
      name: "Priya Patel",
      role: "Product Manager at Amazon",
      image: "https://ui-avatars.com/api/?name=Priya+Patel&background=random",
      text: "The platform's data-driven insights helped me understand what companies were looking for. It made my preparation much more targeted."
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // useEffect(() => {
  //   setCurrentUser(user); // ✅ Update state when user changes
  // }, [user]);
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* Header */}
      <motion.nav 
        ref={headerRef}
        style={{ y: headerY }}
        className="w-full flex justify-between items-center py-4 px-8 bg-[#0B1120]/95 backdrop-blur-sm shadow-lg fixed top-0 z-50"
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl font-bold">
  <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
</div>

          
          <span className="text-xl font-semibold">CampusConnect</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-8"
        >
         
          {user ? (
            <Link to="/home" className="bg-[#4B7BF5] px-6 py-2 rounded-lg text-white hover:bg-[#3D63CC] transition-all duration-300 flex items-center gap-2">
              Dashboard <FaArrowRight className="text-sm" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Log in</Link>
              <Link to="/register" className="bg-[#4B7BF5] px-6 py-2 rounded-lg text-white hover:bg-[#3D63CC] transition-all duration-300">
                Get Started
              </Link>
            </>
          )}
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4B7BF5]/10 to-transparent"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative z-10 max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center bg-[#1A2942] rounded-full px-6 py-2 mb-8"
          >
            <span className="text-[#4B7BF5]">Connecting Campus Tech Talent</span>
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your College Tech Community,{" "}
            <span className="bg-gradient-to-r from-[#4B7BF5] to-[#8B5CF6] text-transparent bg-clip-text">
              Reimagined
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl text-gray-400 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Building bridges between students, seniors, and alumni to create a thriving tech ecosystem within your campus. Share experiences, discover opportunities, and grow together.
          </motion.p>

          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              to="/register" 
              className="bg-[#4B7BF5] px-8 py-4 rounded-lg text-white hover:bg-[#3D63CC] transition-all duration-300 flex items-center gap-2 text-lg font-semibold"
            >
              Join the Community <FaArrowRight />
            </Link>
            <Link 
              to="/features" 
              className="bg-[#1A2942] px-8 py-4 rounded-lg text-white hover:bg-[#243656] transition-all duration-300 text-lg font-semibold"
            >
              Explore Features
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaUsers className="text-[#4B7BF5]" />,
              title: "Connect with Seniors",
              description: "Direct access to experienced seniors who've landed dream tech roles"
            },
            {
              icon: <FaRoad className="text-[#4B7BF5]" />,
              title: "Personalized Roadmaps",
              description: "Get customized learning paths based on your career goals"
            },
            {
              icon: <FaTrophy className="text-[#4B7BF5]" />,
              title: "Track Achievements",
              description: "Showcase your projects and technical milestones"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-[#1A2942] p-6 rounded-xl hover:bg-[#243656] transition-all duration-300"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Choose CampusConnect?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-6 text-accent flex items-center gap-2">
                <FaLinkedin className="text-blue-500" /> LinkedIn
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-secondary-text">
                  <FaTimes className="text-red-500" />
                  <span>Generic skill endorsements</span>
                </li>
                <li className="flex items-center gap-3 text-secondary-text">
                  <FaTimes className="text-red-500" />
                  <span>Worldwide connections</span>
                </li>
                <li className="flex items-center gap-3 text-secondary-text">
                  <FaTimes className="text-red-500" />
                  <span>Limited college context</span>
                </li>
              </ul>
            </motion.div>
            <motion.div 
              className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-accent/50"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-6 text-accent flex items-center gap-2">
                <FaGraduationCap className="text-accent" /> CampusConnect
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-accent" />
                  <span>Personalized tech roadmaps</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-accent" />
                  <span>College-specific guidance</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-accent" />
                  <span>Direct senior connections</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Key Features
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <FaUsers />,
                title: "Smart Connections",
                description: "Connect with seniors and alumni who've achieved what you aspire to."
              },
              {
                icon: <FaRoad />,
                title: "Tech Roadmaps",
                description: "Get personalized guidance based on your college's placement patterns."
              },
              {
                icon: <FaTrophy />,
                title: "Achievement Tracking",
                description: "Document and showcase your technical achievements and projects."
              },
              {
                icon: <FaComments />,
                title: "Interview Experiences",
                description: "Access detailed interview experiences and preparation strategies."
              },
              {
                icon: <FaCalendarAlt />,
                title: "College Events",
                description: "Stay updated with college hackathons, coding contests, and tech events."
              },
              {
                icon: <FaChartLine />,
                title: "Data-Driven Insights",
                description: "Track your progress and get insights based on real placement data."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/10 hover:border-accent/50 transition-all duration-300"
              >
                <div className="text-accent text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-secondary-text">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5"></div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Success Stories
          </motion.h2>
          <div className="relative h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/10"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonials[activeTestimonial].image} 
                    alt={testimonials[activeTestimonial].name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{testimonials[activeTestimonial].name}</h3>
                    <p className="text-accent">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
                <p className="text-lg text-secondary-text">{testimonials[activeTestimonial].text}</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? "bg-accent scale-125" : "bg-accent/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5"></div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { value: "40%", label: "Increase in student engagement" },
              { value: "100%", label: "College-specific content" },
              { value: "24/7", label: "Access to senior guidance" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="bg-accent/10 backdrop-blur-sm p-8 rounded-2xl text-center border border-accent/20"
              >
                <h3 className="text-5xl font-bold text-accent mb-4">{stat.value}</h3>
                <p className="text-lg text-secondary-text">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Tech Journey?</h2>
            <p className="text-xl text-secondary-text mb-8">
              Join CampusConnect today and become part of your college's thriving tech community.
            </p>
            {!user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/register" className="bg-accent px-8 py-4 text-lg rounded-lg text-white hover:bg-accent-dark inline-flex items-center gap-2 transition-all duration-300">
                  Get Started Now <FaArrowRight />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#1A2942] text-gray-400">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <motion.p 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            © 2024 CampusConnect. All rights reserved.
          </motion.p>
          <motion.div 
            className="flex justify-center space-x-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}