import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiEye,
  FiCheck,
  FiX,
  FiSearch
} from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

const TeamManagementPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamApplications, setTeamApplications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [gameCategories, setGameCategories] = useState([]);

  // Floating particles background
  const FloatingParticles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 30 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              boxShadow: '0 0 4px rgba(168, 85, 247, 0.3)',
            }}
          />
        ))}
      </div>
    );
  };

  // Fetch teams data
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams_with_member_count')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      toast.error('Failed to fetch teams: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users for member assignment
  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, photo_url, role')
        .not('full_name', 'is', null)
        .order('full_name');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      toast.error('Failed to fetch users: ' + error.message);
    }
  };

  // Fetch game categories
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

  // Fetch team members
  const fetchTeamMembers = async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_members_with_user_details')
        .select('*')
        .eq('team_id', teamId)
        .order('joined_at');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      toast.error('Failed to fetch team members: ' + error.message);
    }
  };

  // Fetch team applications
  const fetchTeamApplications = async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_applications_with_details')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamApplications(data || []);
    } catch (error) {
      toast.error('Failed to fetch team applications: ' + error.message);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchAllUsers();
    fetchGameCategories();
  }, []);

  // Filter teams based on search and filters
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.game.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = gameFilter === 'all' || team.game_category === gameFilter;
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;

    return matchesSearch && matchesGame && matchesStatus;
  });

  // Get unique games for filter
  const uniqueGames = [...new Set(teams.map(team => team.game_category))];

  // Edit Team Modal Component
  const EditTeamModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      game_category: '',
      description: '',
      max_roster_size: 5,
      status: 'active',
      rank: '',
      achievements: '',
      color_gradient: 'from-purple-600 to-blue-600',
      bg_color: 'bg-purple-900/20',
      border_color: 'border-purple-700/30'
    });

    // Initialize form with selected team data
    useEffect(() => {
      if (selectedTeam && showEditModal) {
        setFormData({
          name: selectedTeam.name || '',
          game_category: selectedTeam.game_category || '',
          description: selectedTeam.description || '',
          max_roster_size: selectedTeam.max_roster_size || 5,
          status: selectedTeam.status || 'active',
          rank: selectedTeam.rank || '',
          achievements: selectedTeam.achievements || '',
          color_gradient: selectedTeam.color_gradient || 'from-purple-600 to-blue-600',
          bg_color: selectedTeam.bg_color || 'bg-purple-900/20',
          border_color: selectedTeam.border_color || 'border-purple-700/30'
        });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTeam, showEditModal]);


    const colorOptions = [
      { gradient: 'from-purple-600 to-blue-600', bg: 'bg-purple-900/20', border: 'border-purple-700/30', name: 'Purple-Blue' },
      { gradient: 'from-red-600 to-orange-600', bg: 'bg-red-900/20', border: 'border-red-700/30', name: 'Red-Orange' },
      { gradient: 'from-yellow-600 to-orange-600', bg: 'bg-yellow-900/20', border: 'border-yellow-700/30', name: 'Yellow-Orange' },
      { gradient: 'from-green-600 to-blue-600', bg: 'bg-green-900/20', border: 'border-green-700/30', name: 'Green-Blue' },
      { gradient: 'from-pink-600 to-purple-600', bg: 'bg-pink-900/20', border: 'border-pink-700/30', name: 'Pink-Purple' },
      { gradient: 'from-gray-600 to-gray-700', bg: 'bg-gray-900/20', border: 'border-gray-700/30', name: 'Gray' }
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const { error } = await supabase
          .from('teams')
          .update(formData)
          .eq('id', selectedTeam.id);

        if (error) throw error;

        toast.success('Team updated successfully!');
        setShowEditModal(false);
        setSelectedTeam(null);
        fetchTeams();
      } catch (error) {
        toast.error('Failed to update team: ' + error.message);
      }
    };

    return (
      <AnimatePresence>
        {showEditModal && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowEditModal(false);
              setSelectedTeam(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 backdrop-blur-lg border border-purple-700/30 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                  Edit Team: {selectedTeam.name}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTeam(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Team Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Game Category</label>
                    <select
                      value={formData.game_category}
                      onChange={e => setFormData({...formData, game_category: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                      required
                    >
                      <option value="">Select Category</option>
                      {gameCategories.map(cat => (
                        <option key={cat.category_code} value={cat.category_code}>{cat.display_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Max Roster Size</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.max_roster_size}
                      onChange={e => setFormData({...formData, max_roster_size: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                    >
                      <option value="active">Active</option>
                      <option value="recruiting">Recruiting</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Team Colors</label>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            color_gradient: color.gradient,
                            bg_color: color.bg,
                            border_color: color.border
                          })}
                          className={`p-2 rounded text-xs border-2 transition-all ${
                            formData.color_gradient === color.gradient
                              ? 'border-purple-500'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className={`w-full h-4 rounded bg-gradient-to-r ${color.gradient} mb-1`}></div>
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Current Rank</label>
                    <input
                      type="text"
                      value={formData.rank}
                      onChange={e => setFormData({...formData, rank: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Recent Achievements</label>
                    <input
                      type="text"
                      value={formData.achievements}
                      onChange={e => setFormData({...formData, achievements: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedTeam(null);
                    }}
                    className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/30 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    Update Team
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Create Team Modal Component
  const CreateTeamModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      game_category: '',
      description: '',
      max_roster_size: 5,
      status: 'active',
      rank: '',
      achievements: '',
      color_gradient: 'from-purple-600 to-blue-600',
      bg_color: 'bg-purple-900/20',
      border_color: 'border-purple-700/30'
    });


    const colorOptions = [
      { gradient: 'from-purple-600 to-blue-600', bg: 'bg-purple-900/20', border: 'border-purple-700/30', name: 'Purple-Blue' },
      { gradient: 'from-red-600 to-orange-600', bg: 'bg-red-900/20', border: 'border-red-700/30', name: 'Red-Orange' },
      { gradient: 'from-yellow-600 to-orange-600', bg: 'bg-yellow-900/20', border: 'border-yellow-700/30', name: 'Yellow-Orange' },
      { gradient: 'from-green-600 to-blue-600', bg: 'bg-green-900/20', border: 'border-green-700/30', name: 'Green-Blue' },
      { gradient: 'from-pink-600 to-purple-600', bg: 'bg-pink-900/20', border: 'border-pink-700/30', name: 'Pink-Purple' },
      { gradient: 'from-gray-600 to-gray-700', bg: 'bg-gray-900/20', border: 'border-gray-700/30', name: 'Gray' }
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const { error } = await supabase
          .from('teams')
          .insert([formData]);

        if (error) throw error;

        toast.success('Team created successfully!');
        setShowCreateModal(false);
        setFormData({
          name: '',
          game_category: '',
          description: '',
          max_roster_size: 5,
          status: 'active',
          rank: '',
          achievements: '',
          color_gradient: 'from-purple-600 to-blue-600',
          bg_color: 'bg-purple-900/20',
          border_color: 'border-purple-700/30'
        });
        fetchTeams();
      } catch (error) {
        toast.error('Failed to create team: ' + error.message);
      }
    };

    return (
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 backdrop-blur-lg border border-purple-700/30 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                  Create New Team
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Team Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Game Category</label>
                    <select
                      value={formData.game_category}
                      onChange={e => setFormData({...formData, game_category: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                      required
                    >
                      <option value="">Select Category</option>
                      {gameCategories.map(cat => (
                        <option key={cat.category_code} value={cat.category_code}>{cat.display_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Max Roster Size</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.max_roster_size}
                      onChange={e => setFormData({...formData, max_roster_size: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                    >
                      <option value="active">Active</option>
                      <option value="recruiting">Recruiting</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Team Colors</label>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            color_gradient: color.gradient,
                            bg_color: color.bg,
                            border_color: color.border
                          })}
                          className={`p-2 rounded text-xs border-2 transition-all ${
                            formData.color_gradient === color.gradient
                              ? 'border-purple-500'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className={`w-full h-4 rounded bg-gradient-to-r ${color.gradient} mb-1`}></div>
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Current Rank</label>
                    <input
                      type="text"
                      value={formData.rank}
                      onChange={e => setFormData({...formData, rank: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-purple-300 mb-2">Recent Achievements</label>
                    <input
                      type="text"
                      value={formData.achievements}
                      onChange={e => setFormData({...formData, achievements: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/30 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Members Modal Component
  const MembersModal = () => {
    const [addMemberForm, setAddMemberForm] = useState({
      user_id: '',
      role: 'player'
    });

    const handleAddMember = async (e) => {
      e.preventDefault();

      try {
        const { error } = await supabase
          .from('team_members')
          .insert([{
            team_id: selectedTeam.id,
            user_id: addMemberForm.user_id,
            role: addMemberForm.role,
            status: 'active'
          }]);

        if (error) throw error;

        toast.success('Member added successfully!');
        setAddMemberForm({ user_id: '', role: 'player' });
        fetchTeamMembers(selectedTeam.id);
      } catch (error) {
        toast.error('Failed to add member: ' + error.message);
      }
    };

    const handleRemoveMember = async (memberId) => {
      try {
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', memberId);

        if (error) throw error;

        toast.success('Member removed successfully!');
        fetchTeamMembers(selectedTeam.id);
      } catch (error) {
        toast.error('Failed to remove member: ' + error.message);
      }
    };

    const handleRoleChange = async (memberId, newRole) => {
      try {
        const { error } = await supabase
          .from('team_members')
          .update({ role: newRole })
          .eq('id', memberId);

        if (error) throw error;

        toast.success('Member role updated!');
        fetchTeamMembers(selectedTeam.id);
      } catch (error) {
        toast.error('Failed to update role: ' + error.message);
      }
    };

    return (
      <AnimatePresence>
        {showMembersModal && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowMembersModal(false);
              setSelectedTeam(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 backdrop-blur-lg border border-purple-700/30 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                  {selectedTeam.name} - Team Members
                </h2>
                <button
                  onClick={() => {
                    setShowMembersModal(false);
                    setSelectedTeam(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Add Member Form */}
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <FiPlus />
                  Add Team Member
                </h3>
                <form onSubmit={handleAddMember} className="flex gap-4">
                  <select
                    value={addMemberForm.user_id}
                    onChange={(e) => setAddMemberForm({...addMemberForm, user_id: e.target.value})}
                    className="flex-1 px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:outline-none transition-all duration-300"
                    required
                  >
                    <option value="">Select User</option>
                    {allUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </option>
                    ))}
                  </select>
                  <select
                    value={addMemberForm.role}
                    onChange={(e) => setAddMemberForm({...addMemberForm, role: e.target.value})}
                    className="px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:outline-none transition-all duration-300"
                  >
                    <option value="player">Player</option>
                    <option value="captain">Captain</option>
                    <option value="substitute">Substitute</option>
                    <option value="coach">Coach</option>
                  </select>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Current Members */}
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <FiUsers />
                  Current Members ({teamMembers.length}/{selectedTeam.max_roster_size})
                </h3>

                {teamMembers.length > 0 ? (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="bg-black/40 border border-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {member.photo_url ? (
                              <img
                                src={member.photo_url}
                                alt={member.full_name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white">
                                {member.full_name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <div>
                              <h4 className="text-white font-semibold">{member.full_name || 'Anonymous Player'}</h4>
                              <p className="text-gray-400 text-sm">{member.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="px-3 py-1 rounded bg-black/30 text-white border border-purple-700/30 focus:border-purple-500 focus:outline-none transition-all duration-300"
                            >
                              <option value="player">Player</option>
                              <option value="captain">Captain</option>
                              <option value="substitute">Substitute</option>
                              <option value="coach">Coach</option>
                            </select>

                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-700/50 rounded text-red-400 hover:text-red-300 transition-all duration-300"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiUsers className="text-gray-600 mx-auto mb-3" size={48} />
                    <h4 className="text-gray-400 font-semibold">No members yet</h4>
                    <p className="text-gray-500 text-sm">Add members to build this team!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Applications Modal Component
  const ApplicationsModal = () => {
    const handleApproveApplication = async (applicationId, userId) => {
      try {
        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();

        // Add user to team
        const { error: memberError } = await supabase
          .from('team_members')
          .insert([{
            team_id: selectedTeam.id,
            user_id: userId,
            role: 'player',
            status: 'active'
          }]);

        if (memberError) throw memberError;

        // Update application status
        const { error: appError } = await supabase
          .from('team_applications')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user?.id || null
          })
          .eq('id', applicationId);

        if (appError) throw appError;

        toast.success('Application approved and member added to team!');
        fetchTeamApplications(selectedTeam.id);
        fetchTeamMembers(selectedTeam.id);
        fetchTeams(); // Refresh teams list to update pending application counts
      } catch (error) {
        toast.error('Failed to approve application: ' + error.message);
      }
    };

    const handleRejectApplication = async (applicationId, notes = '') => {
      try {
        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
          .from('team_applications')
          .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user?.id || null,
            admin_notes: notes
          })
          .eq('id', applicationId);

        if (error) throw error;

        toast.success('Application rejected');
        fetchTeamApplications(selectedTeam.id);
        fetchTeams(); // Refresh teams list to update pending application counts
      } catch (error) {
        toast.error('Failed to reject application: ' + error.message);
      }
    };

    return (
      <AnimatePresence>
        {showApplicationsModal && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowApplicationsModal(false);
              setSelectedTeam(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 backdrop-blur-lg border border-purple-700/30 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                  {selectedTeam.name} - Applications
                </h2>
                <button
                  onClick={() => {
                    setShowApplicationsModal(false);
                    setSelectedTeam(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              {teamApplications.length > 0 ? (
                <div className="space-y-4">
                  {teamApplications.map((application) => (
                    <div key={application.id} className="bg-black/40 border border-gray-700/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {application.applicant_photo ? (
                            <img
                              src={application.applicant_photo}
                              alt={application.applicant_name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white">
                              {application.applicant_name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <h4 className="text-white font-semibold">{application.applicant_name || 'Anonymous'}</h4>
                            <p className="text-purple-400 text-sm font-semibold">@{application.applicant_gamertag || 'Unknown'}</p>
                            <p className="text-gray-500 text-xs">Applied: {new Date(application.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          application.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                          application.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>

                      {application.application_message && (
                        <div className="mb-4 p-3 bg-gray-900/30 rounded border-l-4 border-purple-500">
                          <p className="text-gray-300 text-sm">{application.application_message}</p>
                        </div>
                      )}

                      {application.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApproveApplication(application.id, application.user_id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-700/50 rounded text-green-400 hover:text-green-300 transition-all duration-300"
                          >
                            <FiCheck size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectApplication(application.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-700/50 rounded text-red-400 hover:text-red-300 transition-all duration-300"
                          >
                            <FiX size={16} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiEye className="text-gray-600 mx-auto mb-3" size={48} />
                  <h4 className="text-gray-400 font-semibold">No applications yet</h4>
                  <p className="text-gray-500 text-sm">Applications will appear here when users apply to this team</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full"
          />
          <span className="ml-4 text-xl font-semibold text-purple-300">Loading Teams...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <FloatingParticles />

      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
            Team Management
          </h1>
          <p className="text-gray-400">Manage teams, rosters, and applications</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-lg bg-black/30 backdrop-blur-sm border border-purple-700/30 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm border border-purple-700/30 text-white focus:border-purple-500 focus:outline-none transition-all duration-300"
              >
                <option value="all">All Games</option>
                {uniqueGames.map(game => (
                  <option key={game} value={game}>
                    {game.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm border border-purple-700/30 text-white focus:border-purple-500 focus:outline-none transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="recruiting">Recruiting</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Create Team Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            <FiPlus size={20} />
            Create Team
          </motion.button>
        </motion.div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className={`relative ${team.bg_color} ${team.border_color} border rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 rounded-xl transition-all duration-300" />

                <div className="relative">
                  {/* Game Badge */}
                  <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${team.color_gradient} text-white text-xs font-bold mb-3`}>
                    {team.game}
                  </div>

                  {/* Team Name */}
                  <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Status:</span>
                      <span className={`text-sm font-semibold ${
                        team.status === 'active' ? 'text-green-400' :
                        team.status === 'recruiting' ? 'text-yellow-400' :
                        'text-gray-400'
                      }`}>
                        {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Roster:</span>
                      <span className="text-white text-sm">
                        {team.current_roster_size}/{team.max_roster_size} Players
                      </span>
                    </div>
                    {team.pending_applications > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Applications:</span>
                        <span className="text-purple-400 text-sm font-semibold">
                          {team.pending_applications} Pending
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        fetchTeamMembers(team.id);
                        setShowMembersModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-700/50 rounded-lg text-purple-400 text-sm transition-all duration-300"
                    >
                      <FiUsers size={16} />
                      Members
                    </button>

                    {team.pending_applications > 0 && (
                      <button
                        onClick={() => {
                          setSelectedTeam(team);
                          fetchTeamApplications(team.id);
                          setShowApplicationsModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-700/50 rounded-lg text-yellow-400 text-sm transition-all duration-300"
                      >
                        <FiEye size={16} />
                        Applications
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowEditModal(true);
                      }}
                      className="px-3 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-all duration-300"
                    >
                      <FiEdit2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTeams.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h3 className="text-xl font-semibold text-purple-300 mb-2">No teams found</h3>
            <p className="text-gray-500">Try adjusting your search or filter settings</p>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal />
      <EditTeamModal />
      <MembersModal />
      <ApplicationsModal />
    </div>
  );
};

export default TeamManagementPage;