import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUsers, FiAward, FiStar, FiMail } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import AvatarPlaceholder from './AvatarPlaceholder';

const TeamDetailModal = ({ team, isOpen, onClose, user }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canApply, setCanApply] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const fetchTeamDetails = useCallback(async () => {
    if (!team?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members_with_user_details')
        .select('*')
        .eq('team_id', team.id)
        .eq('status', 'active')
        .order('joined_at');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  }, [team?.id]);

  const checkApplicationStatus = useCallback(async () => {
    if (!team?.id || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('team_applications')
        .select('*')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setHasApplied(!!data);

      // Check if user can apply (not already a member, not already applied, team has space)
      const isMember = teamMembers.some(member => member.user_id === user.id);
      const hasSpace = teamMembers.length < (team.max_roster_size || 5);
      setCanApply(!isMember && !data && hasSpace && team.status === 'active');
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  }, [team?.id, team?.max_roster_size, team?.status, user?.id, teamMembers]);

  useEffect(() => {
    if (isOpen && team) {
      fetchTeamDetails();
      if (user) {
        checkApplicationStatus();
      }
    }
  }, [isOpen, team, user, fetchTeamDetails, checkApplicationStatus]);

  const handleApply = () => {
    onClose();
    // This will be handled by the parent component to show application modal
    if (window.showTeamApplicationModal) {
      window.showTeamApplicationModal(team);
    }
  };

  if (!isOpen || !team) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-black/90 backdrop-blur-lg border border-purple-700/30 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-purple-700/30">
            <div className="flex justify-between items-start">
              <div>
                <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${team.color_gradient} text-white text-sm font-bold mb-3`}>
                  {team.game}
                </div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                  {team.name}
                </h2>
                {team.description && (
                  <p className="text-gray-400 mt-2">{team.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 text-center">
                <FiUsers className="text-purple-400 mx-auto mb-2" size={24} />
                <div className="text-white font-semibold">
                  {teamMembers.length}/{team.max_roster_size || 5}
                </div>
                <div className="text-gray-400 text-sm">Members</div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 text-center">
                <FiAward className="text-yellow-400 mx-auto mb-2" size={24} />
                <div className="text-white font-semibold">{team.rank || 'Unranked'}</div>
                <div className="text-gray-400 text-sm">Current Rank</div>
              </div>

              <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 text-center">
                <FiStar className="text-green-400 mx-auto mb-2" size={24} />
                <div className="text-white font-semibold capitalize">{team.status}</div>
                <div className="text-gray-400 text-sm">Status</div>
              </div>

              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-white font-semibold text-xs leading-tight">
                  {team.achievements || 'Rising Stars'}
                </div>
                <div className="text-gray-400 text-sm">Achievement</div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FiUsers />
              Team Roster
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
                />
                <span className="ml-3 text-purple-300">Loading members...</span>
              </div>
            ) : teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/40 border border-gray-700/30 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.gamertag || member.full_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                          onError={(e) => {
                            // Hide the image and show placeholder instead
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 rounded-full border-2 border-purple-500 overflow-hidden ${member.photo_url ? 'hidden' : 'block'}`}>
                        <AvatarPlaceholder
                          gamertag={member.gamertag || member.full_name || 'Player'}
                          size="w-full h-full"
                          className="rounded-none"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{member.gamertag || 'Anonymous Player'}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            member.role === 'captain' ? 'bg-yellow-900/30 text-yellow-400' :
                            member.role === 'coach' ? 'bg-blue-900/30 text-blue-400' :
                            member.role === 'substitute' ? 'bg-gray-900/30 text-gray-400' :
                            'bg-purple-900/30 text-purple-400'
                          }`}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                          <span className="text-gray-500 text-xs">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiUsers className="text-gray-600 mx-auto mb-3" size={48} />
                <h4 className="text-gray-400 font-semibold">No members yet</h4>
                <p className="text-gray-500 text-sm">This team is looking for players!</p>
              </div>
            )}

            {/* Application Section */}
            {user && (
              <div className="mt-8 pt-6 border-t border-gray-700/30">
                {hasApplied ? (
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 text-center">
                    <FiMail className="text-yellow-400 mx-auto mb-2" size={24} />
                    <h4 className="text-yellow-400 font-semibold mb-1">Application Submitted</h4>
                    <p className="text-gray-400 text-sm">
                      Your application is being reviewed by the team administrators.
                    </p>
                  </div>
                ) : canApply ? (
                  <div className="text-center">
                    <h4 className="text-white font-semibold mb-2">Interested in joining this team?</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Submit an application to be considered for a spot on the roster.
                    </p>
                    <button
                      onClick={handleApply}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Apply to Team
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-900/20 border border-gray-700/30 rounded-lg p-4 text-center">
                    <h4 className="text-gray-400 font-semibold mb-1">Applications Closed</h4>
                    <p className="text-gray-500 text-sm">
                      {teamMembers.length >= (team.max_roster_size || 5)
                        ? 'This team is currently at full capacity.'
                        : team.status !== 'active'
                        ? 'This team is not currently recruiting.'
                        : 'You are already a member or have an existing application.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamDetailModal;