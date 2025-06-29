// components/RecruitmentSummary.jsx
export default function RecruitmentSummary({ data }) {
  return (
    <div id="form-preview" className="p-8 bg-white text-black max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Recruitment Form</h1>
      <p><strong>Full Name:</strong> {data.fullName}</p>
      <p><strong>Email:</strong> {data.email}</p>
      <p><strong>Game:</strong> {data.selectedGame}</p>
      <p><strong>Experience:</strong> {data.experience}</p>
      <p><strong>Availability:</strong> {data.availability}</p>
      {/* Add more fields as needed */}
    </div>
  );
}
