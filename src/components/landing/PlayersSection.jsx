import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../supabaseClient';
import AvatarPlaceholder from '../AvatarPlaceholder';

const PlayersSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);


  // Fetch random players from database
  useEffect(() => {
    // Fallback static players (in case database has no players yet)
    const staticPlayers = [
      {
        gamertag: "Shadow",
        role: "AWP",
        games: "Counter-Strike 2",
        division: "Counter Strike",
        photo_url: null, // Will use AvatarPlaceholder
        platforms: ["twitch", "youtube"],
        socialLinks: {
          twitch: "https://twitch.tv/shadow",
          youtube: "https://youtube.com/@shadow",
        },
      },
      {
        gamertag: "Phoenix",
        role: "Duelist",
        games: "VALORANT",
        division: "Valorant",
        photo_url: null, // Will use AvatarPlaceholder
        platforms: ["twitch", "instagram"],
        socialLinks: {
          twitch: "https://twitch.tv/phoenix",
          instagram: "https://instagram.com/phoenix",
        },
      },
      {
        gamertag: "Viper",
        role: "Controller",
        games: "VALORANT",
        division: "Valorant",
        photo_url: null, // Will use AvatarPlaceholder
        platforms: ["youtube", "tiktok"],
        socialLinks: {
          youtube: "https://youtube.com/@viper",
          tiktok: "https://tiktok.com/@viper",
        },
      },
      {
        gamertag: "Ace",
        role: "Entry Fragger",
        games: "Call of Duty",
        division: "Call of Duty",
        photo_url: null, // Will use AvatarPlaceholder
        platforms: ["twitch", "facebook"],
        socialLinks: {
          twitch: "https://twitch.tv/ace",
          facebook: "https://facebook.com/ace",
        },
      },
    ];

    const fetchRandomPlayers = async () => {
      try {
        // First, get total count of users
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .not('gamertag', 'is', null);

        if (count && count > 0) {
          // Get random offset for variety
          const randomOffset = Math.floor(Math.random() * Math.max(1, count - 6));

          // Fetch random players with relevant data
          const { data, error } = await supabase
            .from('users')
            .select(`
              gamertag,
              games,
              division,
              photo_url,
              platforms,
              url_twitch,
              url_youtube,
              url_instagram,
              url_tiktok,
              url_facebook,
              creator_name,
              followers_twitch,
              followers_youtube,
              followers_instagram,
              followers_tiktok,
              followers_facebook
            `)
            .not('gamertag', 'is', null)
            .limit(6)
            .range(randomOffset, randomOffset + 5);

          if (error) throw error;

          if (data && data.length > 0) {
            // Filter and format the data
            const formattedPlayers = data
              .filter(player => player.gamertag) // Only players with gamertags
              .map(player => ({
                gamertag: player.gamertag,
                role: player.creator_name || 'Player',
                games: player.games || player.division || 'Multiple Games',
                division: player.division,
                photo_url: player.photo_url || null, // Use null so AvatarPlaceholder is used
                platforms: player.platforms || [],
                socialLinks: {
                  twitch: player.url_twitch,
                  youtube: player.url_youtube,
                  instagram: player.url_instagram,
                  tiktok: player.url_tiktok,
                  facebook: player.url_facebook,
                },
                followers: {
                  twitch: player.followers_twitch,
                  youtube: player.followers_youtube,
                  instagram: player.followers_instagram,
                  tiktok: player.followers_tiktok,
                  facebook: player.followers_facebook,
                }
              }));

            if (formattedPlayers.length > 0) {
              setPlayers(formattedPlayers);
            } else {
              // No valid players found, use static data
              setPlayers(staticPlayers);
            }
          } else {
            // No data returned, use static data
            setPlayers(staticPlayers);
          }
        } else {
          // No users in database, use static data
          setPlayers(staticPlayers);
        }
      } catch (error) {
        console.warn('Failed to fetch players from database, using static data:', error);
        setPlayers(staticPlayers);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomPlayers();
  }, []);

  const nextPlayer = () => {
    setCurrentIndex((prev) => (prev + 1) % players.length);
  };

  const prevPlayer = () => {
    setCurrentIndex((prev) => (prev - 1 + players.length) % players.length);
  };

  return (
    <section id="players" className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-4">
            Featured Players
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Meet the superstars who make Obscura a powerhouse in competitive gaming
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full"
            />
            <span className="ml-4 text-xl font-semibold text-purple-300">Loading Players...</span>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No featured players available at the moment.</p>
          </div>
        ) : (
          /* Player Carousel */
          <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center justify-center">
            {/* Previous Button */}
            <button
              onClick={prevPlayer}
              className="absolute left-0 z-10 p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-full border border-purple-700/50 transition-all duration-300"
            >
              <ChevronLeftIcon className="w-6 h-6 text-purple-400" />
            </button>

            {/* Player Cards */}
            <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {players.map((player, index) => {
                  if (index !== currentIndex) return null;

                  return (
                    <motion.div
                      key={player.gamertag}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      className="absolute w-full flex flex-col md:flex-row items-center gap-8"
                    >
                      {/* Player Image */}
                      <div className="relative w-full md:w-1/2">
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-700/30">
                          {player.photo_url ? (
                            <div className="relative">
                              <img
                                src={player.photo_url}
                                alt={player.gamertag}
                                className="w-full h-[400px] object-cover"
                                onError={(e) => {
                                  // Hide the image and show placeholder instead
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'block';
                                }}
                              />
                              <div className="w-full h-[400px] hidden">
                                <AvatarPlaceholder
                                  gamertag={player.gamertag}
                                  size="w-full h-full"
                                  className="rounded-none"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-[400px]">
                              <AvatarPlaceholder
                                gamertag={player.gamertag}
                                size="w-full h-full"
                                className="rounded-none"
                              />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                          {/* Player Name Overlay */}
                          <div className="absolute bottom-4 left-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🎮</span>
                              <h3 className="text-2xl font-bold text-white">{player.gamertag}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-purple-600/50 backdrop-blur rounded-full text-white text-sm font-semibold">
                                {player.games}
                              </span>
                              <span className="text-gray-300">{player.role}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Player Info */}
                      <div className="w-full md:w-1/2 space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <h4 className="text-xl font-bold text-white mb-4">Player Information</h4>

                          {/* Player Details */}
                          <div className="space-y-4 mb-6">
                            <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                              <div className="text-gray-400 text-sm mb-1">Preferred Games</div>
                              <div className="text-lg font-semibold text-purple-400">{player.games}</div>
                            </div>
                            {player.division && (
                              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Division</div>
                                <div className="text-lg font-semibold text-blue-400">{player.division}</div>
                              </div>
                            )}
                          </div>

                          {/* Player Role */}
                          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/30 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-purple-400">🎯</span>
                              <span className="text-gray-400 text-sm">Role</span>
                            </div>
                            <div className="text-white font-semibold">{player.role}</div>
                          </div>

                          {/* Social Links - Only show if player has social media */}
                          {(player.socialLinks && Object.values(player.socialLinks).some(link => link)) && (
                            <div>
                              <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <span className="text-purple-400">🔗</span>
                                Follow {player.gamertag}
                              </h5>
                              <div className="flex flex-wrap gap-3">
                                {player.socialLinks?.twitch && (
                                  <a
                                    href={player.socialLinks.twitch}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-700/50 rounded-lg text-purple-400 transition-all duration-300 hover:scale-105"
                                  >
                                    🎮 Twitch
                                    {player.followers?.twitch && (
                                      <span className="text-xs text-gray-400">({player.followers.twitch})</span>
                                    )}
                                  </a>
                                )}
                                {player.socialLinks?.youtube && (
                                  <a
                                    href={player.socialLinks.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-700/50 rounded-lg text-red-400 transition-all duration-300 hover:scale-105"
                                  >
                                    📺 YouTube
                                    {player.followers?.youtube && (
                                      <span className="text-xs text-gray-400">({player.followers.youtube})</span>
                                    )}
                                  </a>
                                )}
                                {player.socialLinks?.instagram && (
                                  <a
                                    href={player.socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-700/50 rounded-lg text-pink-400 transition-all duration-300 hover:scale-105"
                                  >
                                    📸 Instagram
                                    {player.followers?.instagram && (
                                      <span className="text-xs text-gray-400">({player.followers.instagram})</span>
                                    )}
                                  </a>
                                )}
                                {player.socialLinks?.tiktok && (
                                  <a
                                    href={player.socialLinks.tiktok}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-700/50 rounded-lg text-gray-400 transition-all duration-300 hover:scale-105"
                                  >
                                    🎵 TikTok
                                    {player.followers?.tiktok && (
                                      <span className="text-xs text-gray-400">({player.followers.tiktok})</span>
                                    )}
                                  </a>
                                )}
                                {player.socialLinks?.facebook && (
                                  <a
                                    href={player.socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/50 rounded-lg text-blue-400 transition-all duration-300 hover:scale-105"
                                  >
                                    📘 Facebook
                                    {player.followers?.facebook && (
                                      <span className="text-xs text-gray-400">({player.followers.facebook})</span>
                                    )}
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Next Button */}
            <button
              onClick={nextPlayer}
              className="absolute right-0 z-10 p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-full border border-purple-700/50 transition-all duration-300"
            >
              <ChevronRightIcon className="w-6 h-6 text-purple-400" />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {players.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-purple-500'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
};

export default PlayersSection;