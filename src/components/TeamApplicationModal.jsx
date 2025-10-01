import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

const TeamApplicationModal = ({ team, user, isOpen, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState({
    application_message: ''
  });
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    full_name: '',
    gamertag: ''
  });

  // Fetch user details when modal opens
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id || !isOpen) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, gamertag')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserDetails({
          full_name: data.full_name || 'Not provided',
          gamertag: data.gamertag || 'Not set'
        });
      } catch (error) {
        console.warn('Error fetching user details:', error.message);
        setUserDetails({
          full_name: 'Not available',
          gamertag: 'Not available'
        });
      }
    };

    fetchUserDetails();
  }, [user?.id, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team || !user) return;

    setLoading(true);
    try {
      // Check if user already has an application for this team
      const { data: existingApp } = await supabase
        .from('team_applications')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (existingApp) {
        toast.error('You already have an application for this team.');
        return;
      }

      // Create new application
      const { error } = await supabase
        .from('team_applications')
        .insert([{
          team_id: team.id,
          user_id: user.id,
          application_message: formData.application_message.trim() || null,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success('Application submitted successfully!');
      setFormData({ application_message: '' });
      onClose();

      if (onSubmitted) {
        onSubmitted();
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !team || !user) return null;

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
          className="bg-black/90 backdrop-blur-lg border border-purple-700/30 rounded-xl w-full max-w-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-purple-700/30">
            <div className="flex justify-between items-start">
              <div>
                <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${team.color_gradient} text-white text-sm font-bold mb-3`}>
                  {team.game}
                </div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                  Apply to {team.name}
                </h2>
                <p className="text-gray-400 mt-2">
                  Submit your application to join this elite team
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* User Info Display */}
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FiUser />
                Applicant Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Full Name:</span>
                  <div className="text-white">{userDetails.full_name}</div>
                </div>
                <div>
                  <span className="text-gray-400">Gamertag:</span>
                  <div className="text-purple-400 font-semibold">{userDetails.gamertag}</div>
                </div>
              </div>
            </div>

            {/* Application Message */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                <FiMessageSquare />
                Application Message (Optional)
              </label>
              <textarea
                value={formData.application_message}
                onChange={(e) => setFormData({...formData, application_message: e.target.value})}
                placeholder="Tell the team why you want to join, your gaming experience, availability, or any other relevant information..."
                rows="6"
                className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 resize-none"
                maxLength="1000"
              />
              <div className="text-right mt-2">
                <span className="text-xs text-gray-500">
                  {formData.application_message.length}/1000 characters
                </span>
              </div>
            </div>

            {/* Team Information */}
            <div className="bg-black/40 border border-gray-700/30 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-3">Team Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Max Roster:</span>
                  <div className="text-white">{team.max_roster_size || 5} players</div>
                </div>
                <div>
                  <span className="text-gray-400">Current Rank:</span>
                  <div className="text-purple-400">{team.rank || 'Unranked'}</div>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <div className={`capitalize font-medium ${
                    team.status === 'active' ? 'text-green-400' :
                    team.status === 'recruiting' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {team.status}
                  </div>
                </div>
              </div>
              {team.achievements && (
                <div className="mt-3 pt-3 border-t border-gray-700/30">
                  <span className="text-gray-400 text-sm">Recent Achievement:</span>
                  <div className="text-white text-sm flex items-center gap-2">
                    🏆 {team.achievements}
                  </div>
                </div>
              )}
            </div>

            {/* Application Notice */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-6">
              <h4 className="text-blue-400 font-semibold mb-2">Application Process</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Your application will be reviewed by team administrators</li>
                <li>• You'll receive a notification when your application status changes</li>
                <li>• Applications are typically reviewed within 3-5 business days</li>
                <li>• You can view your application status in your profile</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/30 transition-all duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamApplicationModal;