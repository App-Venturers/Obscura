import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const PartnersSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const partners = [
    { name: "App Venturers", category: "Web Development & Marketing", logo: "/images/AvLogoTransparent.svg", website: "https://www.appventurers.com/" },
    { name: "Grizzly", category: "Energy Drink Sponsor", logo: "/images/Grizzly-Logo-Full-Text-White.pdf-1.svg", website: "https://grizzlyenergy.co.za" },
  ];

  return (
    <section id="partners" className="relative py-20 overflow-hidden bg-gradient-to-b from-black to-gray-950">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-4">
            Our Partners
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Proud to be supported by industry-leading brands that share our vision for excellence
          </p>
        </motion.div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-700/50 hover:bg-purple-900/10 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                  <div className="flex flex-col items-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className={`w-full h-16 object-contain mb-3 opacity-70 group-hover:opacity-100 transition-opacity ${
                        partner.name === 'Grizzly' ? 'filter brightness-0 invert' : ''
                      }`}
                    />
                    <h4 className="text-white text-sm font-semibold mb-1 text-center">{partner.name}</h4>
                    <p className="text-gray-400 text-xs text-center">{partner.category}</p>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Partnership CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-purple-900/20 via-black to-blue-900/20 rounded-2xl p-8 border border-purple-700/30"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Become a Partner</h3>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            Join us in shaping the future of competitive gaming. Partner with Obscura and reach millions of passionate gaming fans worldwide.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300">
            Get in Touch
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;