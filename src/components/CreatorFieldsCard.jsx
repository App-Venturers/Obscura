import { useState, useEffect } from "react";

const Card = ({ className = "", children }) => (
  <div className={`bg-gray-900/80 border border-purple-700 rounded-2xl shadow-xl p-6 ${className}`}>{children}</div>
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
  const softwareOptions = ["OBS", "Streamlabs", "Facebook Live Studio", "YouTube Live Studio", "TikTok Live Studio", "Other"];

  useEffect(() => {
    setShowOtherPlatform(formData.platforms?.includes("Other"));
    setShowOtherLanguage(formData.languages?.includes("Other"));
    setShowOtherSoftware(formData.software?.includes("Other"));
  }, [formData.platforms, formData.languages, formData.software]);

  const handleMultiCheckboxChange = (e, field) => {
    const value = e.target.value;
    const checked = e.target.checked;
    const updatedValues = new Set(formData[field] || []);
    checked ? updatedValues.add(value) : updatedValues.delete(value);
    handleChange({ target: { name: field, value: Array.from(updatedValues) } });
  };

  const handleNumericInput = (e) => {
    const value = e.target.value;
    handleChange({
      target: {
        name: e.target.name,
        value: value === "" ? null : parseInt(value, 10),
      },
    });
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold text-purple-400 col-span-full">Content Creator & Streamer Info</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <div>
            <label className="block text-sm font-medium text-purple-300">Creator Name</label>
            <input name="creatorName" value={formData.creatorName} onChange={handleChange} placeholder="Creator Name" className="recruitment-input mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-300">Timezone</label>
            <input name="timezone" value={formData.timezone} onChange={handleChange} placeholder="e.g., SAST" className="recruitment-input mt-1" />
          </div>
        </div>

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
            <input name="otherPlatform" placeholder="Other Platform" value={formData.otherPlatform || ""} onChange={handleChange} className="recruitment-input mt-2" />
          )}
        </div>

        {(formData.platforms || []).map((platform) => (
          <div key={platform} className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
            <input
              name={`url_${platform}`}
              placeholder={`${platform} Channel URL`}
              value={formData[`url_${platform}`] || ""}
              onChange={handleChange}
              className="recruitment-input"
            />
            <input
              name={`followers_${platform}`}
              placeholder={`${platform} Follower Count`}
              value={formData[`followers_${platform}`] || ""}
              onChange={handleChange}
              type="number"
              className="recruitment-input"
            />
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-300">Schedule</label>
            <input name="schedule" value={formData.schedule || ""} onChange={handleChange} placeholder="e.g., Mon 8PM, Fri 7PM (SAST)" className="recruitment-input mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-300">Games Played</label>
            <input name="games" value={formData.games || ""} onChange={handleChange} placeholder="List of games" className="recruitment-input mt-1" />
          </div>
        </div>

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
            <input name="otherLanguage" placeholder="Other Language" value={formData.otherLanguage || ""} onChange={handleChange} className="recruitment-input mt-2" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-300">Internet Speed</label>
          <input name="internet" placeholder="e.g., 100Mbps" value={formData.internet || ""} onChange={handleChange} className="recruitment-input mt-1" />
        </div>

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
            <input name="otherSoftware" placeholder="Other Software" value={formData.otherSoftware || ""} onChange={handleChange} className="recruitment-input mt-2" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-300">Microphone / Camera Setup</label>
          <textarea name="equipment" placeholder="Describe your gear" value={formData.equipment || ""} onChange={handleChange} className="recruitment-input mt-1" />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="camera" checked={!!formData.camera} onChange={handleChange} className="accent-purple-500 w-4 h-4" />
          <span className="text-sm text-white">Use camera while streaming?</span>
        </label>

        <div>
          <label className="block text-sm font-medium text-purple-300">Starting year for content creation</label>
          <input name="yearsCreating" type="number" value={formData.yearsCreating || ""} onChange={handleNumericInput} placeholder="e.g., 2020" className="recruitment-input mt-1" />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="sponsors" checked={!!formData.sponsors} onChange={handleChange} className="accent-purple-500 w-4 h-4" />
            <span className="text-sm text-white">Are you sponsored?</span>
          </label>
          {formData.sponsors && (
            <input name="sponsorList" placeholder="List Sponsors" value={formData.sponsorList || ""} onChange={handleChange} className="recruitment-input mt-2" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-300">Open to collabs/events?</label>
          <select name="collabs" value={formData.collabs || "no"} onChange={handleChange} className="recruitment-input mt-1">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-300">Goals as a Content Creator</label>
          <textarea name="creatorGoals" placeholder="Your goals..." value={formData.creatorGoals || ""} onChange={handleChange} className="recruitment-input mt-1" />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-300">Additional Notes</label>
          <textarea name="creatorNotes" placeholder="Anything else to add..." value={formData.creatorNotes || ""} onChange={handleChange} className="recruitment-input mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}
