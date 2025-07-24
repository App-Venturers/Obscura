export default function RecruitmentSummary({ data }) {
  const sectionedFields = [
    {
      title: "Personal Information",
      fields: [
        { label: "Full Name", value: data.full_name },
        { label: "Email", value: data.email },
        { label: "Phone", value: data.phone },
        { label: "Discord", value: data.discord },
        { label: "Gamertag", value: data.gamertag },
        { label: "Timezone", value: data.timezone },
        { label: "Division", value: data.division },
        { label: "Gender", value: data.gender },
        { label: "DOB", value: data.dob },
        { label: "Experience", value: data.experience },
        { label: "Schedule", value: data.schedule },
        { label: "Content Type", value: data.content_type },
        { label: "Games", value: data.games },
        { label: "Languages", value: data.languages?.join(", ") },
        { label: "Software", value: data.software?.join(", ") },
        { label: "Equipment", value: data.equipment },
        { label: "Internet", value: data.internet },
      ],
    },
    {
      title: "Creator & Application Info",
      fields: [
        { label: "Platforms", value: data.platforms?.join(", ") },
        { label: "Other Platform", value: data.other_platform },
        { label: "Years Creating", value: data.years_creating },
        { label: "Is Creator", value: data.is_creator ? "Yes" : "No" },
        { label: "Sponsors", value: data.sponsors ? "Yes" : "No" },
        { label: "Sponsor List", value: data.sponsor_list },
        { label: "Creator Name", value: data.creator_name },
        { label: "Creator Goals", value: data.creator_goals },
        { label: "Creator Notes", value: data.creator_notes },
        { label: "Camera", value: data.camera ? "Yes" : "No" },
      ],
    },
    {
      title: "Social Media & Admin Info",
      fields: [
        { label: "Followers YouTube", value: data.followers_youtube },
        { label: "Followers Twitch", value: data.followers_twitch },
        { label: "Followers Instagram", value: data.followers_instagram },
        { label: "Followers TikTok", value: data.followers_tiktok },
        { label: "Followers Facebook", value: data.followers_facebook },
        { label: "Followers Kick", value: data.followers_kick },
        { label: "Followers Other", value: data.followers_other },
        { label: "Created At", value: data.created_at ? new Date(data.created_at).toLocaleDateString() : "-" },
        { label: "Status", value: data.status },
        { label: "Admin Notes", value: data.admin_notes },
      ],
    },
  ];

  return (
    <div
      id="form-preview"
      className="p-8 bg-white text-black max-w-5xl mx-auto rounded-xl shadow-lg"
    >
      <h1 className="text-3xl font-bold mb-6 border-b pb-2">
        Recruitment Form Summary
      </h1>

      {sectionedFields.map((section) => (
        <div key={section.title} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-1">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {section.fields.map(({ label, value }) => (
              <div key={label} className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600">{label}</span>
                <span className="text-base font-medium break-words whitespace-pre-wrap">
                  {value || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
