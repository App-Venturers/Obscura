import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Card = ({ className = "", children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-black/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const CardContent = ({ className = "", children }) => (
  <div className={`grid gap-6 ${className}`}>{children}</div>
);

export default function CreatorFieldsCard({ formData, handleChange }) {
  const [showOtherPlatform, setShowOtherPlatform] = useState(false);
  const [showOtherLanguage, setShowOtherLanguage] = useState(false);
  const [showOtherSoftware, setShowOtherSoftware] = useState(false);

  const platforms = ["YouTube", "Twitch", "Facebook", "Instagram", "Kick", "TikTok", "Other"];
  const languages = ["Afrikaans", "English", "Other"];
  const softwareOptions = [
    "OBS",
    "Streamlabs",
    "Facebook Live Studio",
    "YouTube Live Studio",
    "TikTok Live Studio",
    "Other",
  ];

  useEffect(() => {
    setShowOtherPlatform(!!formData?.platforms?.includes("Other"));
    setShowOtherLanguage(!!formData?.languages?.includes("Other"));
    setShowOtherSoftware(!!formData?.software?.includes("Other"));
  }, [formData]);

  const handleMultiCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    const current = new Set(formData[field] || []);
    checked ? current.add(value) : current.delete(value);
    handleChange({ target: { name: field, value: Array.from(current) } });
  };

  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    handleChange({
      target: {
        name,
        value: value === "" ? null : parseInt(value, 10),
      },
    });
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 col-span-full">
          Content Creator & Streamer Info
        </h2>

        {/* Creator name & timezone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Creator Name</label>
            <input
              name="creator_name"
              value={formData.creator_name || ""}
              onChange={handleChange}
              placeholder="Your creator/channel name"
              className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Timezone</label>
            <input
              name="timezone"
              value={formData.timezone || ""}
              onChange={handleChange}
              placeholder="e.g., SAST, EST, PST"
              className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Platforms */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-purple-300 mb-3">
            Streaming Platforms
          </label>
          <div className="flex flex-wrap gap-3">
            {platforms.map((platform) => {
              const isSelected = formData.platforms?.includes(platform);
              const iconMap = {
                YouTube: "📺",
                Twitch: "🎮",
                Facebook: "📘",
                Instagram: "📸",
                Kick: "🟢",
                TikTok: "🎵",
                Other: "➕",
              };
              return (
                <motion.button
                  key={platform}
                  type="button"
                  onClick={() =>
                    handleMultiCheckboxChange(
                      { target: { value: platform, checked: !isSelected } },
                      "platforms"
                    )
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500 text-white shadow-lg shadow-purple-500/25"
                      : "bg-black/30 backdrop-blur-sm border-purple-700/30 text-gray-300 hover:border-purple-500 hover:text-purple-300"
                  }`}
                >
                  <span>{iconMap[platform]}</span>
                  <span>{platform}</span>
                </motion.button>
              );
            })}
          </div>
          {showOtherPlatform && (
            <input
              name="other_platform"
              placeholder="Specify other platform"
              value={formData.other_platform || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 mt-3"
            />
          )}
        </div>

        {/* Platform URLs and followers */}
        {(formData.platforms || []).map((platform) => {
          const key = platform.toLowerCase();
          return (
            <div key={platform} className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
              <input
                name={`url_${key}`}
                placeholder={`${platform} Channel URL`}
                value={formData[`url_${key}`] || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
              />
              <input
                name={`followers_${key}`}
                placeholder={`${platform} Follower Count`}
                value={formData[`followers_${key}`] || ""}
                onChange={handleNumericInput}
                type="number"
                className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
              />
            </div>
          );
        })}

        {/* Schedule & Games */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Schedule</label>
            <input
              name="schedule"
              value={formData.schedule || ""}
              onChange={handleChange}
              placeholder="e.g., Mon 8PM, Fri 7PM (SAST)"
              className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Games Played</label>
            <input
              name="games"
              value={formData.games || ""}
              onChange={handleChange}
              placeholder="List your main games"
              className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Languages */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-purple-300 mb-3">Languages</label>
          <div className="flex flex-wrap gap-3">
            {languages.map((lang) => {
              const isSelected = formData.languages?.includes(lang);
              const iconMap = {
                English: "🇬🇧",
                Afrikaans: "🇿🇦",
                Other: "🌍",
              };
              return (
                <motion.button
                  key={lang}
                  type="button"
                  onClick={() =>
                    handleMultiCheckboxChange(
                      { target: { value: lang, checked: !isSelected } },
                      "languages"
                    )
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500 text-white shadow-lg shadow-purple-500/25"
                      : "bg-black/30 backdrop-blur-sm border-purple-700/30 text-gray-300 hover:border-purple-500 hover:text-purple-300"
                  }`}
                >
                  <span>{iconMap[lang]}</span>
                  <span>{lang}</span>
                </motion.button>
              );
            })}
          </div>
          {showOtherLanguage && (
            <input
              name="other_language"
              placeholder="Specify other language"
              value={formData.other_language || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 mt-3"
            />
          )}
        </div>

        {/* Internet speed */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-2">Internet Speed</label>
          <input
            name="internet"
            placeholder="e.g., 100Mbps upload/download"
            value={formData.internet || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
          />
        </div>

        {/* Software */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-purple-300 mb-3">Streaming Software</label>
          <div className="flex flex-wrap gap-3">
            {softwareOptions.map((software) => {
              const isSelected = formData.software?.includes(software);
              const iconMap = {
                OBS: "🖥️",
                Streamlabs: "📊",
                "Facebook Live Studio": "📘",
                "YouTube Live Studio": "📺",
                "TikTok Live Studio": "🎵",
                Other: "⚙️",
              };
              return (
                <motion.button
                  key={software}
                  type="button"
                  onClick={() =>
                    handleMultiCheckboxChange(
                      { target: { value: software, checked: !isSelected } },
                      "software"
                    )
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500 text-white shadow-lg shadow-purple-500/25"
                      : "bg-black/30 backdrop-blur-sm border-purple-700/30 text-gray-300 hover:border-purple-500 hover:text-purple-300"
                  }`}
                >
                  <span>{iconMap[software]}</span>
                  <span>{software}</span>
                </motion.button>
              );
            })}
          </div>
          {showOtherSoftware && (
            <input
              name="other_software"
              placeholder="Specify other software"
              value={formData.other_software || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 mt-3"
            />
          )}
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-2">Microphone / Camera Setup</label>
          <textarea
            name="equipment"
            placeholder="Describe your streaming gear and setup..."
            value={formData.equipment || ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 resize-none"
          />
        </div>

        {/* Camera usage */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="camera"
            checked={!!formData.camera}
            onChange={handleChange}
            className="w-5 h-5 text-purple-600 bg-black/30 border-purple-700/30 rounded focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 transition-all duration-300"
          />
          <span className="text-sm text-gray-300 group-hover:text-purple-300 transition-colors">
            I use a camera while streaming
          </span>
        </label>

        {/* Year started */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-2">
            Year Started Creating Content
          </label>
          <input
            name="years_creating"
            type="number"
            value={formData.years_creating || ""}
            onChange={handleNumericInput}
            placeholder="e.g., 2020"
            min="2000"
            max={new Date().getFullYear()}
            className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
          />
        </div>

        {/* Sponsors */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="sponsors"
              checked={!!formData.sponsors}
              onChange={handleChange}
              className="w-5 h-5 text-purple-600 bg-black/30 border-purple-700/30 rounded focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 transition-all duration-300"
            />
            <span className="text-sm text-gray-300 group-hover:text-purple-300 transition-colors">
              I currently have sponsors
            </span>
          </label>
          {formData.sponsors && (
            <motion.input
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              name="sponsor_list"
              placeholder="List your current sponsors"
              value={formData.sponsor_list || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 mt-3"
            />
          )}
        </div>

        {/* Collabs */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-2">
            Open to Collaborations/Events?
          </label>
          <select
            name="collabs"
            value={formData.collabs || "no"}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1em',
            }}
          >
            <option value="yes" className="bg-gray-900">Yes, I'm interested</option>
            <option value="no" className="bg-gray-900">No, not at this time</option>
          </select>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-2">
            Your Content Creator Goals
          </label>
          <textarea
            name="creator_goals"
            placeholder="What are your goals as a content creator? What do you hope to achieve?"
            value={formData.creator_goals || ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 resize-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-2">Additional Notes</label>
          <textarea
            name="creator_notes"
            placeholder="Any additional information you'd like to share about your content creation journey..."
            value={formData.creator_notes || ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur-sm text-white border border-purple-700/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}