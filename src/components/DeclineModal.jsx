import { motion, AnimatePresence } from "framer-motion";

export default function DeclineModal({ visible, onClose, onSave, noteInput, setNoteInput }) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-2xl p-6 shadow-2xl w-full max-w-md pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                  Decline Reason
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label htmlFor="decline-note" className="block text-sm font-medium text-purple-300 mb-2">
                  Please provide a reason for declining this applicant
                </label>
                <textarea
                  id="decline-note"
                  rows={5}
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 resize-none"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Enter decline reason..."
                />
                <p className="text-xs text-purple-300/50 mt-2">
                  This note will be saved with the applicant's record
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-5 py-2.5 bg-black/30 backdrop-blur-sm border border-purple-700/30 text-purple-300 font-semibold rounded-lg hover:bg-purple-900/20 hover:border-purple-600/40 transition-all duration-300"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSave}
                  disabled={!noteInput.trim()}
                  className={`px-5 py-2.5 font-semibold rounded-lg transition-all duration-300 ${
                    noteInput.trim()
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                  }`}
                >
                  Save & Decline
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}