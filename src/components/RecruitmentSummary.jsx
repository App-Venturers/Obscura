// components/RecruitmentSummary.jsx
export default function RecruitmentSummary({ data }) {
  const fields = [
    { label: "Full Name", value: data.fullName },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
    { label: "Discord", value: data.discord },
    { label: "Gamertag", value: data.gamertag },
    { label: "Selected Game", value: data.selectedGame },
    { label: "Experience", value: data.experience },
    { label: "Availability", value: data.availability },
    { label: "Gender", value: data.gender },
    { label: "Division", value: data.division },
    { label: "Created At", value: new Date(data.created_at).toLocaleDateString() },
    { label: "Notes", value: data.notes },
    // Add more fields here as needed
  ];

  return (
    <div id="form-preview" className="p-8 bg-white text-black max-w-5xl mx-auto rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2">Recruitment Form Summary</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-600">{label}</span>
            <span className="text-base font-medium">{value || "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
