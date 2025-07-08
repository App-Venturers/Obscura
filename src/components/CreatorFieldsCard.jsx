import { useState, useEffect } from "react";

const Card = ({ className = "", children }) => (
  <div className={`bg-gray-900/80 border border-purple-700 rounded-2xl shadow-xl p-6 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className = "", children }) => (
  <div className={`grid gap-6 ${className}`}>{children}</div>
);

export default function CreatorFieldsCard({ formData, handleChange }) {
  const [showOtherPlatform, setShowOtherPlatform] = useState(false);
  const [showOtherLanguage, setShowOtherLanguage] = useState(false);
  const [showOtherSoftware, setShowOtherSoftware] = useState(false);

  const platforms = ["YouTube", "Twitch", "Facebook", "Instagram", "Kick", "Other"];
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
    setShowOtherPlatform(formData.platforms?.includes("Other"));
    setShowOtherLanguage(formData.languages?.includes("Other"));
    setShowOtherSoftware(formData.software?.includes("Other"));
  }, [formData.platforms, formData.languages, formData.software]);

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
        <h2 className="text-xl font-bold text-purple-400 col-span-full">
          Content Creator & Streamer Info
        </h2>

        {/* Creator name & timezone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <div>
            <label className="block text-sm font-medium text-purple-300">Creator Name</label>
            <input
              name="creator_name"
              value={formData.creator_name || ""}
              onChange={handleChange}
              placeholder="Creator Name"
              className="recruitment-input mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-300">Timezone</label>
            <input
              name="timezone"
              value={formData.timezone || ""}
              onChange={handleChange}
              placeholder="e.g., SAST"
              className="recruitment-input mt-1"
            />
          </div>
        </div>

        {/* Platforms */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-purple-300 mb-1">Streaming Platforms</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {platforms.map((platform) => (
              <label key={platform} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={platform}
                  checked={formData.platforms?.includes(platform)}
                  onChange={(e) => handleMultiCheckboxChange(e, "platforms")}
                  className="accent-purple-500 w-4 h-4"
                />
                <span className="text-sm text-white">{platform}</span>
              </label>
            ))}
          </div>
          {showOtherPlatform && (
            <input
              name="other_platform"
              placeholder="Other Platform"
              value={formData.other_platform || ""}
              onChange={handleChange}
              className="recruitment-input mt-2"
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
                className="recruitment-input"
              />
              <input
                name={`followers_${key}`}
                placeholder={`${platform} Follower Count`}
                value={formData[`followers_${key}`] || ""}
                onChange={handleNumericInput}
                type="number"
                className="recruitment-input"
              />
            </div>
          );
        })}

        {/* Schedule & Games */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-300">Schedule</label>
            <input
              name="schedule"
              value={formData.schedule || ""}
              onChange={handleChange}
              placeholder="e.g., Mon 8PM, Fri 7PM (SAST)"
              className="recruitment-input mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-300">Games Played</label>
            <input
              name="games"
              value={formData.games || ""}
              onChange={handleChange}
              placeholder="List of games"
              className="recruitment-input mt-1"
            />
          </div>
        </div>

        {/* Languages */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-purple-300 mb-1">Languages</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {languages.map((lang) => (
              <label key={lang} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={lang}
                  checked={formData.languages?.includes(lang)}
                  onChange={(e) => handleMultiCheckboxChange(e, "languages")}
                  className="accent-purple-500 w-4 h-4"
                />
                <span className="text-sm text-white">{lang}</span>
              </label>
            ))}
          </div>
          {showOtherLanguage && (
            <input
              name="other_language"
              placeholder="Other Language"
              value={formData.other_language || ""}
              onChange={handleChange}
              className="recruitment-input mt-2"
            />
          )}
        </div>

        {/* Internet speed */}
        <div>
          <label className="block text-sm font-medium text-purple-300">Internet Speed</label>
          <input
            name="internet"
            placeholder="e.g., 100Mbps"
            value={formData.internet || ""}
            onChange={handleChange}
            className="recruitment-input mt-1"
          />
        </div>

        {/* Software */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-purple-300 mb-1">Streaming Software</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {softwareOptions.map((software) => (
              <label key={software} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={software}
                  checked={formData.software?.includes(software)}
                  onChange={(e) => handleMultiCheckboxChange(e, "software")}
                  className="accent-purple-500 w-4 h-4"
                />
                <span className="text-sm text-white">{software}</span>
              </label>
            ))}
          </div>
          {showOtherSoftware && (
            <input
              name="other_software"
              placeholder="Other Software"
              value={formData.other_software || ""}
              onChange={handleChange}
              className="recruitment-input mt-2"
            />
          )}
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-sm font-medium text-purple-300">Microphone / Camera Setup</label>
          <textarea
            name="equipment"
            placeholder="Describe your gear"
            value={formData.equipment || ""}
            onChange={handleChange}
            className="recruitment-input mt-1"
          />
        </div>

        {/* Camera usage */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="camera"
            checked={!!formData.camera}
            onChange={handleChange}
            className="accent-purple-500 w-4 h-4"
          />
          <span className="text-sm text-white">Use camera while streaming?</span>
        </label>

        {/* Year started */}
        <div>
          <label className="block text-sm font-medium text-purple-300">Starting year for content creation</label>
          <input
            name="years_creating"
            type="number"
            value={formData.years_creating || ""}
            onChange={handleNumericInput}
            placeholder="e.g., 2020"
            className="recruitment-input mt-1"
          />
        </div>

        {/* Sponsors */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="sponsors"
              checked={!!formData.sponsors}
              onChange={handleChange}
              className="accent-purple-500 w-4 h-4"
            />
            <span className="text-sm text-white">Are you sponsored?</span>
          </label>
          {formData.sponsors && (
            <input
              name="sponsor_list"
              placeholder="List Sponsors"
              value={formData.sponsor_list || ""}
              onChange={handleChange}
              className="recruitment-input mt-2"
            />
          )}
        </div>

        {/* Collabs */}
        <div>
          <label className="block text-sm font-medium text-purple-300">Open to collabs/events?</label>
          <select
            name="collabs"
            value={formData.collabs || "no"}
            onChange={handleChange}
            className="recruitment-input mt-1"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-purple-300">Goals as a Content Creator</label>
          <textarea
            name="creator_goals"
            placeholder="Your goals..."
            value={formData.creator_goals || ""}
            onChange={handleChange}
            className="recruitment-input mt-1"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-purple-300">Additional Notes</label>
          <textarea
            name="creator_notes"
            placeholder="Anything else to add..."
            value={formData.creator_notes || ""}
            onChange={handleChange}
            className="recruitment-input mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
