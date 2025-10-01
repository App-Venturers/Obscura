import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Main CTA */}
          <div className="bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40 rounded-3xl p-12 border border-purple-700/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6">
                Ready to Go Pro?
              </h2>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Take your gaming career to the next level. Join Obscura and compete alongside the best players in the world.
              </p>

              {/* Feature List */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-black/50 rounded-lg p-4 border border-purple-700/30"
                >
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="text-white font-semibold mb-1">Competitive Salary</h3>
                  <p className="text-gray-400 text-sm">Professional contracts with industry-leading compensation</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-black/50 rounded-lg p-4 border border-purple-700/30"
                >
                  <div className="text-3xl mb-2">🎮</div>
                  <h3 className="text-white font-semibold mb-1">Premium Setup</h3>
                  <p className="text-gray-400 text-sm">Top-tier gaming equipment and training facilities</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-black/50 rounded-lg p-4 border border-purple-700/30"
                >
                  <div className="text-3xl mb-2">🌍</div>
                  <h3 className="text-white font-semibold mb-1">Global Events</h3>
                  <p className="text-gray-400 text-sm">Travel the world competing in premier tournaments</p>
                </motion.div>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={() => navigate('/recruitment')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                >
                  <span className="relative z-10">Apply Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-gray-800 text-white font-bold rounded-lg border border-gray-700 hover:bg-gray-700 transition-all duration-300"
                >
                  Member Login
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex flex-wrap justify-center gap-8 text-gray-400"
          >
            <a href="#teams" className="hover:text-purple-400 transition-colors">Our Teams</a>
            <a href="#about" className="hover:text-purple-400 transition-colors">About Us</a>
            <a href="#news" className="hover:text-purple-400 transition-colors">Latest News</a>
            <a href="#partners" className="hover:text-purple-400 transition-colors">Partners</a>
            <button
              onClick={() => navigate('/hr-support')}
              className="hover:text-purple-400 transition-colors"
            >
              Contact Support
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;