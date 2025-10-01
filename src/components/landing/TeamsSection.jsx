import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { supabase } from '../../supabaseClient';
import TeamDetailModal from '../TeamDetailModal';
import TeamApplicationModal from '../TeamApplicationModal';

const TeamsSection = ({ user }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [gameCategories, setGameCategories] = useState([]);

  // Fallback static teams (in case database is not ready)
  const staticTeams = [
    {
      name: "Obscura Valorant",
      game: "valorant",
      rank: "Radiant",
      achievements: "VCT Champions 2024 Finalists",
      roster: 5,
      color_gradient: "from-red-600 to-orange-600",
      bg_color: "bg-red-900/20",
      border_color: "border-red-700/30",
    },
    {
      name: "Obscura CS2",
      game: "counterstrike",
      rank: "Global Elite",
      achievements: "IEM Major Winners",
      roster: 5,
      color_gradient: "from-yellow-600 to-orange-600",
      bg_color: "bg-yellow-900/20",
      border_color: "border-yellow-700/30",
    },
    {
      name: "Obscura League",
      game: "leagueoflegends",
      rank: "Challenger",
      achievements: "LCS Spring Split Champions",
      roster: 5,
      color_gradient: "from-blue-600 to-cyan-600",
      bg_color: "bg-blue-900/20",
      border_color: "border-blue-700/30",
    },
    {
      name: "Obscura Apex",
      game: "apexlegends",
      rank: "Apex Predator",
      achievements: "ALGS Championship Top 3",
      roster: 3,
      color_gradient: "from-purple-600 to-pink-600",
      bg_color: "bg-purple-900/20",
      border_color: "border-purple-700/30",
    },
    {
      name: "Obscura RL",
      game: "rocketleague",
      rank: "Supersonic Legend",
      achievements: "RLCS World Champions",
      roster: 3,
      color_gradient: "from-blue-600 to-purple-600",
      bg_color: "bg-blue-900/20",
      border_color: "border-blue-700/30",
    },
    {
      name: "Obscura R6",
      game: "rainbowsix",
      rank: "Champion",
      achievements: "Six Invitational Winners",
      roster: 5,
      color_gradient: "from-gray-600 to-gray-700",
      bg_color: "bg-gray-900/20",
      border_color: "border-gray-700/30",
    },
  ];

  // Fetch game categories from database
  const fetchGameCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('active_game_categories')
        .select('*')
        .order('display_name');

      if (error) throw error;
      setGameCategories(data || []);
    } catch (error) {
      console.warn('Failed to fetch game categories, using fallback:', error.message);
      // Fallback to static categories if database table doesn't exist yet
      setGameCategories([
        { category_code: 'call_of_duty', display_name: 'Call of Duty' },
        { category_code: 'valorant', display_name: 'Valorant' },
        { category_code: 'counterstrike', display_name: 'Counter-Strike' },
        { category_code: 'leagueoflegends', display_name: 'League of Legends' },
        { category_code: 'apexlegends', display_name: 'Apex Legends' },
        { category_code: 'rocketleague', display_name: 'Rocket League' },
        { category_code: 'rainbowsix', display_name: 'Rainbow Six Siege' },
        { category_code: 'other', display_name: 'Other' }
      ]);
    }
  };

  // Fetch teams from database
  useEffect(() => {
    // Fallback static teams (in case database is not ready)
    const staticTeams = [
      {
        name: "Obscura Valorant",
        game: "valorant",
        rank: "Radiant",
        achievements: "VCT Champions 2024 Finalists",
        roster: 5,
        color_gradient: "from-red-600 to-orange-600",
        bg_color: "bg-red-900/20",
        border_color: "border-red-700/30",
      },
      {
        name: "Obscura CS2",
        game: "counterstrike",
        rank: "Global Elite",
        achievements: "IEM Major Winners",
        roster: 5,
        color_gradient: "from-yellow-600 to-orange-600",
        bg_color: "bg-yellow-900/20",
        border_color: "border-yellow-700/30",
      },
      {
        name: "Obscura League",
        game: "leagueoflegends",
        rank: "Challenger",
        achievements: "LCS Spring Split Champions",
        roster: 5,
        color_gradient: "from-blue-600 to-cyan-600",
        bg_color: "bg-blue-900/20",
        border_color: "border-blue-700/30",
      },
      {
        name: "Obscura Call of Duty",
        game: "call_of_duty",
        rank: "Champion Division",
        achievements: "CDL Championship 2024",
        roster: 4,
        color_gradient: "from-green-600 to-emerald-600",
        bg_color: "bg-green-900/20",
        border_color: "border-green-700/30",
      },
      {
        name: "Obscura Apex",
        game: "apex",
        rank: "Predator",
        achievements: "ALGS Winners",
        roster: 3,
        color_gradient: "from-purple-600 to-pink-600",
        bg_color: "bg-purple-900/20",
        border_color: "border-purple-700/30",
      },
      {
        name: "Obscura Rocket League",
        game: "rocket_league",
        rank: "Grand Champion",
        achievements: "RLCS World Champions",
        roster: 3,
        color_gradient: "from-orange-600 to-red-600",
        bg_color: "bg-orange-900/20",
        border_color: "border-orange-700/30",
      },
      {
        name: "Obscura Overwatch",
        game: "overwatch",
        rank: "Grandmaster",
        achievements: "OWL Stage Champions",
        roster: 6,
        color_gradient: "from-gray-600 to-gray-700",
        bg_color: "bg-gray-900/20",
        border_color: "border-gray-700/30",
      },
    ];

    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('teams_with_member_count')
          .select('*')
          .eq('status', 'active')
          .order('created_at');

        if (error) {
          console.warn('Failed to fetch teams from database, using static data:', error);
          setTeams(staticTeams);
        } else if (data && data.length > 0) {
          // Map database data to component format
          const formattedTeams = data.map(team => ({
            id: team.id,
            name: team.name,
            game: team.game_category,
            rank: team.rank || 'Unranked',
            achievements: team.achievements || 'Rising Champions',
            roster: team.current_roster_size || 0,
            maxRoster: team.max_roster_size,
            color_gradient: team.color_gradient,
            bg_color: team.bg_color,
            border_color: team.border_color,
            status: team.status,
            max_roster_size: team.max_roster_size,
            description: team.description
          }));
          setTeams(formattedTeams);
        } else {
          // No teams in database, use static data
          setTeams(staticTeams);
        }
      } catch (error) {
        console.warn('Error fetching teams, using static data:', error);
        setTeams(staticTeams);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
    fetchGameCategories();

    // Set up global function for application modal
    window.showTeamApplicationModal = (team) => {
      setSelectedTeam(team);
      setShowApplicationModal(true);
    };

    return () => {
      window.showTeamApplicationModal = null;
    };
  }, [staticTeams]);

  const handleViewRoster = (team) => {
    setSelectedTeam(team);
    setShowDetailModal(true);
  };

  const handleApplicationSubmitted = () => {
    // Refresh teams data to update any counts
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('teams_with_member_count')
          .select('*')
          .eq('status', 'active')
          .order('created_at');

        if (error) throw error;
        if (data && data.length > 0) {
          const formattedTeams = data.map(team => ({
            id: team.id,
            name: team.name,
            game: team.game_category,
            rank: team.rank || 'Unranked',
            achievements: team.achievements || 'Rising Champions',
            roster: team.current_roster_size || 0,
            maxRoster: team.max_roster_size,
            color_gradient: team.color_gradient,
            bg_color: team.bg_color,
            border_color: team.border_color,
            status: team.status
          }));
          setTeams(formattedTeams);
        }
      } catch (error) {
        console.warn('Error refreshing teams:', error);
      }
    };
    fetchTeams();
  };

  // Function to get display name for game category
  const getGameDisplayName = (categoryCode) => {
    const category = gameCategories.find(cat => cat.category_code === categoryCode);
    return category ? category.display_name : categoryCode;
  };

  // Get unique games for tabs
  const getUniqueGames = () => {
    const games = [...new Set(teams.map(team => team.game))];
    return ['All', ...games.sort()];
  };

  // Filter teams by active tab
  const filteredTeams = activeTab === 'All'
    ? teams
    : teams.filter(team => team.game === activeTab);

  return (
    <section id="teams" className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-4">
            Our Teams
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Elite squads competing at the highest level across multiple gaming titles
          </p>
        </motion.div>

        {/* Game Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="flex flex-wrap justify-center gap-2 bg-gray-900/50 backdrop-blur-lg rounded-xl p-2 border border-gray-800">
            {getUniqueGames().map((game) => (
              <button
                key={game}
                onClick={() => setActiveTab(game)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-sm ${
                  activeTab === game
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {game === 'All' ? 'All' : getGameDisplayName(game)}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full"
            />
            <span className="ml-4 text-xl font-semibold text-purple-300">Loading Teams...</span>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team.name || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`relative ${team.bg_color} ${team.border_color} border rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105`}>
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 rounded-xl transition-all duration-300" />

                  {/* Content */}
                  <div className="relative">
                    {/* Game Badge */}
                    <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${team.color_gradient} text-white text-xs font-bold mb-3`}>
                      {getGameDisplayName(team.game)}
                    </div>

                    {/* Team Name */}
                    <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>

                    {/* Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Rank:</span>
                        <span className="text-purple-400 font-semibold text-sm">{team.rank}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Roster:</span>
                        <span className="text-white text-sm">
                          {team.roster}{team.maxRoster ? `/${team.maxRoster}` : ''} Players
                        </span>
                      </div>
                    </div>

                    {/* Achievement */}
                    <div className="pt-3 border-t border-gray-700/50">
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400">🏆</span>
                        <p className="text-gray-300 text-sm">{team.achievements}</p>
                      </div>
                    </div>

                    {/* Hover Effect - View Team */}
                    <motion.div
                      className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1 }}
                    >
                      <button
                        onClick={() => handleViewRoster(team)}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg transform hover:scale-105 transition-transform"
                      >
                        View Roster
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">Think you have what it takes to join our ranks?</p>
          <button
            onClick={() => window.location.href = '/recruitment'}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300"
          >
            Apply Now
          </button>
        </motion.div>
      </div>

      {/* Modals */}
      <TeamDetailModal
        team={selectedTeam}
        user={user}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTeam(null);
        }}
      />

      <TeamApplicationModal
        team={selectedTeam}
        user={user}
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedTeam(null);
        }}
        onSubmitted={handleApplicationSubmitted}
      />
    </section>
  );
};

export default TeamsSection;