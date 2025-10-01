import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/landing/HeroSection';
import TeamsSection from '../components/landing/TeamsSection';
import PlayersSection from '../components/landing/PlayersSection';
import AboutSection from '../components/landing/AboutSection';
import NewsSection from '../components/landing/NewsSection';
import PartnersSection from '../components/landing/PartnersSection';
import CTASection from '../components/landing/CTASection';
import LandingNavbar from '../components/landing/LandingNavbar';

const LandingPage = ({ user }) => {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Fixed Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection />
        <AboutSection />
        <TeamsSection user={user} />
        <PlayersSection />
        <NewsSection />
        <PartnersSection />
        <CTASection />
      </motion.main>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Obscura eSports. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                Twitter
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                Discord
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                YouTube
              </a>
              <a href="https://twitch.tv" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                Twitch
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;