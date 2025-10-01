import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      title: "Elite Training",
      description: "Professional coaching and state-of-the-art facilities",
      icon: "🎯",
    },
    {
      title: "Global Competitions",
      description: "Compete in international tournaments and leagues",
      icon: "🌍",
    },
    {
      title: "Team Support",
      description: "Full organizational backing and resources",
      icon: "🤝",
    },
    {
      title: "Career Growth",
      description: "Build your professional gaming career with us",
      icon: "📈",
    },
  ];

  return (
    <section id="about" className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-4">
            About Obscura
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Founded with a vision to dominate the competitive gaming landscape,
            Obscura brings together the world's most talented players under one banner.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Forging Champions Since Day One
            </h3>
            <p className="text-gray-400 mb-6">
              Obscura eSports is more than just a team – we're a family of dedicated gamers pushing
              the boundaries of competitive excellence. With multiple championship titles across
              various games, we've established ourselves as a force to be reckoned with in the
              global eSports arena.
            </p>
            <p className="text-gray-400 mb-6">
              Our commitment to player development, cutting-edge strategies, and team synergy
              has created an environment where talent thrives and champions are born. We invest
              in our players' futures, providing comprehensive support both in and out of the game.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">2019</div>
                <div className="text-gray-400 text-sm">Founded</div>
              </div>
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">$2M+</div>
                <div className="text-gray-400 text-sm">Prize Winnings</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10" />
              <div className="relative grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="bg-black/50 backdrop-blur-sm border border-purple-700/30 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-purple-900/20 via-black to-blue-900/20 rounded-2xl p-8 border border-purple-700/30"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            To create a world-class eSports organization that nurtures talent, achieves excellence,
            and inspires the next generation of competitive gamers through dedication, innovation,
            and unwavering team spirit.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;