import { useState, useEffect } from "react";

const Card = ({ className = "", children }) => (
  <div className={`bg-gray-900/70 border border-purple-700 rounded-2xl shadow-lg ${className}`}>{children}</div>
);

const CardContent = ({ className = "", children }) => (
  <div className={`p-4 space-y-6 ${className}`}>{children}</div>
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
        <h2 className="text-xl font-bold text-purple-400">Content Creator & Streamer Info</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-purple-300 mb-1">Creator Name</label>
            <input name="creatorName" placeholder="Creator Name" value={formData.creatorName} onChange={handleChange} className="recruitment-input" />
            <label className="block font-semibold text-purple-300 mt-3 mb-1">Timezone</label>
            <input name="timezone" placeholder="Timezone" value={formData.timezone} onChange={handleChange} className="recruitment-input" />
          </div>

          <div>
            <label className="block font-semibold text-purple-300 mb-2">Streaming Platforms</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
              {platforms.map((platform) => (
                <label key={platform} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={platform}
                    checked={formData.platforms?.includes(platform)}
                    onChange={(e) => handleMultiCheckboxChange(e, "platforms")}
                    className="accent-purple-500 w-4 h-4"
                  />
                  <span>{platform}</span>
                </label>
              ))}
            </div>
            {showOtherPlatform && (
              <input name="otherPlatform" placeholder="Specify Other Platform" value={formData.otherPlatform || ""} onChange={handleChange} className="recruitment-input mt-2" />
            )}
          </div>

          {(formData.platforms || []).map((platform) => (
            <div key={platform} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="recruitment-input"
                type="number"
              />
            </div>
          ))}

          <div>
            <label className="block font-semibold text-purple-300 mb-1">Schedule</label>
            <input name="schedule" placeholder="e.g., Mon 8PM, Fri 7PM (SAST)" value={formData.schedule || ""} onChange={handleChange} className="recruitment-input" />
          </div>

          <div>
            <label className="block font-semibold text-purple-300 mb-1">Games Played</label>
            <input name="games" placeholder="List of games" value={formData.games || ""} onChange={handleChange} className="recruitment-input" />
          </div>

          <div>
            <label className="block font-semibold text-purple-300 mb-2">Languages</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
              {languages.map((lang) => (
                <label key={lang} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={lang}
                    checked={formData.languages?.includes(lang)}
                    onChange={(e) => handleMultiCheckboxChange(e, "languages")}
                    className="accent-purple-500 w-4 h-4"
                  />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
            {showOtherLanguage && (
              <input name="otherLanguage" placeholder="Specify Other Language" value={formData.otherLanguage || ""} onChange={handleChange} className="recruitment-input mt-2" />
            )}
          </div>

          <div>
            <label className="block font-semibold text-purple-300 mb-1">Internet Speed</label>
            <input name="internet" placeholder="e.g., 100Mbps" value={formData.internet || ""} onChange={handleChange} className="recruitment-input" />
          </div>

          <div>
            <label className="block font-semibold text-purple-300 mb-2">Streaming Software</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
              {softwareOptions.map((software) => (
                <label key={software} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={software}
                    checked={formData.software?.includes(software)}
                    onChange={(e) => handleMultiCheckboxChange(e, "software")}
                    className="accent-purple-500 w-4 h-4"
                  />
                  <span>{software}</span>
                </label>
              ))}
            </div>
            {showOtherSoftware && (
              <input name="otherSoftware" placeholder="Specify Other Software" value={formData.otherSoftware || ""} onChange={handleChange} className="recruitment-input mt-2" />
            )}
          </div>

          <div>
            <label className="block font-semibold text-purple-300 mb-1">Microphone / Camera Setup</label>
            <textarea name="equipment" placeholder="Describe your gear" value={formData.equipment || ""} onChange={handleChange} className="recruitment-input" />
          </div>

          <label className="flex items-center space-x-2">
            <input type="checkbox" name="camera" checked={!!formData.camera} onChange={handleChange} className="accent-purple-500 w-4 h-4" />
            <span className="text-sm">Use camera while streaming?</span>
          </label>

          <div>
            <label className="block font-semibold text-purple-300 mb-1">Start Year of Creating Content</label>
            <input
              name="yearsCreating"
              type="number"
              placeholder="e.g., 2020"
              value={formData.yearsCreating || ""}
              onChange={handleNumericInput}
              className="recruitment-input"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="sponsors"
                checked={!!formData.sponsors}
                onChange={handleChange}
                className="accent-purple-500 w-4 h-4"
              />
              <span>Are you sponsored?</span>
            </label>
            {formData.sponsors && (
              <input name="sponsorList" placeholder="List Sponsors" value={formData.sponsorList || ""} onChange={handleChange} className="recruitment-input mt-2" />
            )}
          </div>

          <div>
            <label className="block font-semibold text-purple-300 mb-1">Open to collabs/events?</label>
            <select name="collabs" value={formData.collabs || "no"} onChange={handleChange} className="recruitment-input">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-purple-300 mb-1">Goals as a Content Creator</label>
            <textarea name="creatorGoals" placeholder="Your goals..." value={formData.creatorGoals || ""} onChange={handleChange} className="recruitment-input" />
          </div>

          <div>
            <label className="block font-semibold text-purple-300 mb-1">Additional Notes</label>
            <textarea name="creatorNotes" placeholder="Anything else to add..." value={formData.creatorNotes || ""} onChange={handleChange} className="recruitment-input" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
