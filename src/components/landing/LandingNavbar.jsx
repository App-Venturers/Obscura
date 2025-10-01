import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../supabaseClient';

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [gamertag, setGamertag] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for authenticated user
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Get user role from localStorage or fetch from database
        const role = localStorage.getItem('userRole');
        setUserRole(role);

        // Fetch gamertag from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('gamertag')
          .eq('id', user.id)
          .single();

        if (!error && userData?.gamertag) {
          setGamertag(userData.gamertag);
        }
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const role = localStorage.getItem('userRole');
        setUserRole(role);

        // Fetch gamertag from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('gamertag')
          .eq('id', session.user.id)
          .single();

        if (!error && userData?.gamertag) {
          setGamertag(userData.gamertag);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setGamertag('');
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasCompletedOnboarding');
    setUser(null);
    setUserRole(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Teams', href: '#teams' },
    { label: 'Players', href: '#players' },
    { label: 'News', href: '#news' },
    { label: 'Partners', href: '#partners' },
  ];

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/90 backdrop-blur-lg border-b border-purple-700/30'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center"
            >
              <h1
                className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                OBSCURA
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
                >
                  {item.label}
                </motion.a>
              ))}
            </div>

            {/* Desktop CTA Buttons / User Menu */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden md:flex items-center space-x-4"
            >
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-700/50 rounded-lg text-purple-400 transition-all duration-300"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="font-medium">{gamertag || user.email?.split('@')[0]}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-lg border border-purple-700/30 rounded-lg shadow-xl overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            navigate('/refer');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-purple-600/20 hover:text-purple-400 transition-colors"
                        >
                          Refer Someone
                        </button>

                        <button
                          onClick={() => {
                            navigate('/update-details');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-purple-600/20 hover:text-purple-400 transition-colors"
                        >
                          Update Details
                        </button>

                        <button
                          onClick={() => {
                            navigate('/hr-support');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-purple-600/20 hover:text-purple-400 transition-colors"
                        >
                          HR Support
                        </button>

                        <button
                          onClick={() => {
                            navigate('/my-hr-tickets');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-purple-600/20 hover:text-purple-400 transition-colors"
                        >
                          My HR Tickets
                        </button>

                        {userRole && ['admin', 'superadmin'].includes(userRole) && (
                          <>
                            <div className="border-t border-purple-700/30" />
                            <button
                              onClick={() => {
                                navigate('/admin-overview');
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-4 py-3 text-orange-400 hover:bg-orange-600/20 transition-colors font-medium"
                            >
                              Admin Panel
                            </button>
                          </>
                        )}

                        <div className="border-t border-purple-700/30" />
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-600/20 transition-colors"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Join Us
                  </button>
                </>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 right-0 bottom-0 w-full bg-black/95 backdrop-blur-lg z-40 md:hidden"
          >
            <div className="p-6 space-y-4">
              {navItems.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="block text-gray-300 hover:text-purple-400 transition-colors font-medium text-lg py-2"
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                </motion.a>
              ))}

              <div className="pt-4 border-t border-gray-800 space-y-3">
                {user ? (
                  <>
                    <div className="text-purple-400 font-medium mb-3">
                      {gamertag || user.email}
                    </div>

                    <button
                      onClick={() => {
                        navigate('/refer');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-6 py-3 border border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-all duration-300 text-left"
                    >
                      Refer Someone
                    </button>

                    <button
                      onClick={() => {
                        navigate('/update-details');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-6 py-3 border border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-all duration-300 text-left"
                    >
                      Update Details
                    </button>

                    <button
                      onClick={() => {
                        navigate('/hr-support');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-6 py-3 border border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-all duration-300 text-left"
                    >
                      HR Support
                    </button>

                    <button
                      onClick={() => {
                        navigate('/my-hr-tickets');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-6 py-3 border border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-all duration-300 text-left"
                    >
                      My HR Tickets
                    </button>

                    {userRole && ['admin', 'superadmin'].includes(userRole) && (
                      <button
                        onClick={() => {
                          navigate('/admin-overview');
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full px-6 py-3 bg-orange-600/20 border border-orange-500 text-orange-400 font-semibold rounded-lg hover:bg-orange-500/30 transition-all duration-300 text-left"
                      >
                        Admin Panel
                      </button>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="block w-full px-6 py-3 bg-red-600/20 border border-red-500 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-all duration-300 text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-6 py-3 border border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-all duration-300"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate('/signup');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                    >
                      Join Us
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;