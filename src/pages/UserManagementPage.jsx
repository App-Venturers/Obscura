import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  UsersIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import {
  createUsersBulk,
  parseAndValidateFile
} from "../utils/adminOperations";
import * as XLSX from "xlsx";

// Animated floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            boxShadow: '0 0 3px rgba(168, 85, 247, 0.3)',
          }}
        />
      ))}
    </div>
  );
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const navigate = useNavigate();

  // CSV Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return navigate("/");
    setCurrentUserId(user.id);

    const { data: roleData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || roleData?.role !== "superadmin") return navigate("/");

    const { data: allUsers, error: fetchError } = await supabase
      .from("users")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: false });

    if (!fetchError) setUsers(allUsers || []);
    else console.error("Fetch error:", fetchError.message);

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchData();
    const subscription = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        fetchData
      )
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, [fetchData]);

  const promoteToAdmin = async (id) => {
    const { error } = await supabase.from("users").update({ role: "admin" }).eq("id", id);
    if (error) toast.error("Promote failed: " + error.message);
    else {
      toast.success("Promoted to Admin");
      await fetchData();
    }
  };

  const demoteToUser = async (id) => {
    const { error } = await supabase.from("users").update({ role: "user" }).eq("id", id);
    if (error) toast.error("Demote failed: " + error.message);
    else {
      toast.success("Demoted to User");
      await fetchData();
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(users);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Template Download Functions
  const downloadCsvTemplate = () => {
    const template = [
      {
        // Required fields
        email: "user@example.com",
        password: "securepassword123",
        role: "user",
        // Optional profile fields
        full_name: "John Doe",
        phone: "+1234567890",
        gamertag: "john_gamer",
        discord: "johndoe#1234",
        dob: "1995-06-15",
        gender: "Male",
        division: "Gaming",
        photo_url: "",
        status: "active",
        onboarding: "false",
        is_minor: "false",
        platforms: "PC,Console",
        languages: "English,Spanish",
        software: "OBS,Discord"
      },
      {
        // Minimal example with just required fields
        email: "admin@example.com",
        password: "adminpassword456",
        role: "admin",
        full_name: "Jane Smith",
        phone: "",
        gamertag: "",
        discord: "",
        dob: "",
        gender: "",
        division: "",
        photo_url: "",
        status: "",
        onboarding: "",
        is_minor: "",
        platforms: "",
        languages: "",
        software: ""
      }
    ];
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "user_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV template downloaded successfully");
  };

  const downloadExcelTemplate = () => {
    const template = [
      {
        // Required fields
        email: "user@example.com",
        password: "securepassword123",
        role: "user",
        // Optional profile fields
        full_name: "John Doe",
        phone: "+1234567890",
        gamertag: "john_gamer",
        discord: "johndoe#1234",
        dob: "1995-06-15",
        gender: "Male",
        division: "Gaming",
        photo_url: "",
        status: "active",
        onboarding: "false",
        is_minor: "false",
        platforms: "PC,Console",
        languages: "English,Spanish",
        software: "OBS,Discord"
      },
      {
        // Minimal example with just required fields
        email: "admin@example.com",
        password: "adminpassword456",
        role: "admin",
        full_name: "Jane Smith",
        phone: "",
        gamertag: "",
        discord: "",
        dob: "",
        gender: "",
        division: "",
        photo_url: "",
        status: "",
        onboarding: "",
        is_minor: "",
        platforms: "",
        languages: "",
        software: ""
      }
    ];

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(template);

    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 25 }, // email
      { wch: 20 }, // password
      { wch: 10 }, // role
      { wch: 20 }, // full_name
      { wch: 15 }, // phone
      { wch: 15 }, // gamertag
      { wch: 15 }, // discord
      { wch: 12 }, // dob
      { wch: 10 }, // gender
      { wch: 15 }, // division
      { wch: 25 }, // photo_url
      { wch: 10 }, // status
      { wch: 12 }, // onboarding
      { wch: 10 }, // is_minor
      { wch: 20 }, // platforms
      { wch: 20 }, // languages
      { wch: 20 }  // software
    ];

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    // Write the file
    XLSX.writeFile(wb, "user_upload_template.xlsx");
    toast.success("Excel template downloaded successfully");
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCsv = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isCsv && !isExcel) {
      toast.error("Please select a CSV (.csv) or Excel (.xlsx, .xls) file");
      return;
    }

    setUploadResults(null);
    setUploadProgress(null);

    try {
      const parseResult = await parseAndValidateFile(file);

      if (!parseResult.success) {
        toast.error(parseResult.error);
        return;
      }

      setCsvData(parseResult.data);
      setShowPreview(true);
      const fileType = isExcel ? "Excel" : "CSV";
      toast.success(`Parsed ${parseResult.totalRows} users from ${fileType} file`);
    } catch (error) {
      toast.error("Failed to parse file: " + error.message);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvData.length) {
      toast.error("No valid data to upload");
      return;
    }

    setUploadLoading(true);
    setUploadProgress({ processed: 0, total: csvData.length, successCount: 0, failedCount: 0 });

    try {
      const results = await createUsersBulk(csvData, (progress) => {
        setUploadProgress(progress);
      });

      setUploadResults(results);

      if (results.successful.length > 0) {
        toast.success(`Successfully created ${results.successful.length} users`);
        await fetchData(); // Refresh the user list
      }

      if (results.failed.length > 0) {
        toast.error(`Failed to create ${results.failed.length} users`);
      }

    } catch (error) {
      console.error("Bulk upload error:", error);
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const resetUpload = () => {
    setCsvData([]);
    setUploadResults(null);
    setUploadProgress(null);
    setShowPreview(false);
    setShowUploadModal(false);
  };

  const downloadErrorReport = () => {
    if (!uploadResults?.failed?.length) return;

    const errorData = uploadResults.failed.map(result => ({
      email: result.email,
      error: result.error
    }));

    const csv = Papa.unparse(errorData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "upload_errors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((user) =>
    roleFilter === "all" ? true : user.role === roleFilter
  );

  const roleStyles = {
    superadmin: { icon: ExclamationTriangleIcon, gradient: "from-red-600 to-rose-600", text: "text-red-400" },
    admin: { icon: ShieldCheckIcon, gradient: "from-green-600 to-emerald-600", text: "text-green-400" },
    user: { icon: UserIcon, gradient: "from-blue-600 to-cyan-600", text: "text-blue-400" }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300 animate-pulse">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      <FloatingParticles />

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
                  User Management
                </h1>
                <p className="text-gray-400 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  Manage platform users and their permissions
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin-dashboard")}
                  className="px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600 text-white text-sm font-semibold rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all duration-300 shadow-lg"
                >
                  ← Back
                </motion.button>

                {/* Template Downloads */}
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Templates ▼
                  </motion.button>

                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-2 w-48 bg-black/90 backdrop-blur-lg border border-purple-700/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <button
                      onClick={downloadCsvTemplate}
                      className="w-full px-4 py-3 text-left text-white hover:bg-purple-600/20 transition-colors text-sm flex items-center gap-2 rounded-t-lg"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      CSV Template
                    </button>
                    <button
                      onClick={downloadExcelTemplate}
                      className="w-full px-4 py-3 text-left text-white hover:bg-purple-600/20 transition-colors text-sm flex items-center gap-2 rounded-b-lg"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      Excel Template
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 flex items-center gap-2"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Upload File
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportToCSV}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export CSV
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FunnelIcon className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">Filter by Role:</span>
                <div className="flex gap-2">
                  {["all", "superadmin", "admin", "user"].map((role) => (
                    <motion.button
                      key={role}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        roleFilter === role
                          ? role === "all"
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : `bg-gradient-to-r ${roleStyles[role]?.gradient || "from-gray-600 to-gray-500"} text-white`
                          : "bg-black/30 border border-purple-700/30 text-gray-400 hover:border-purple-500/50"
                      }`}
                    >
                      {role === "all" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Total: <span className="text-purple-400 font-bold">{filteredUsers.length}</span> users
              </div>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-black/40 backdrop-blur-lg border border-purple-700/30 rounded-xl overflow-hidden"
          >
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-purple-300 mb-2">No users found</h3>
                <p className="text-gray-500">Try adjusting your filter settings</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-purple-700/30">
                    <tr>
                      {["Email", "Role", "Created", "Actions"].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-700/20">
                    <AnimatePresence>
                      {filteredUsers.map((user, index) => {
                        const RoleIcon = roleStyles[user.role]?.icon || UserIcon;
                        return (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.02 }}
                            className="hover:bg-purple-900/10 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${
                                roleStyles[user.role]?.gradient || "from-gray-600 to-gray-500"
                              } text-white shadow-lg`}>
                                <RoleIcon className="w-3.5 h-3.5" />
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.id === currentUserId ? (
                                <span className="text-xs italic text-gray-500">Current User</span>
                              ) : user.role === "user" ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => promoteToAdmin(user.id)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center gap-1"
                                >
                                  <ChevronUpIcon className="w-3 h-3" />
                                  Promote
                                </motion.button>
                              ) : user.role === "admin" ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => demoteToUser(user.id)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 flex items-center gap-1"
                                >
                                  <ChevronDownIcon className="w-3 h-3" />
                                  Demote
                                </motion.button>
                              ) : (
                                <span className="text-xs text-gray-500">No actions</span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* CSV Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/90 backdrop-blur-lg rounded-2xl border border-purple-700/30 shadow-[0_0_40px_rgba(147,51,234,0.3)] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Bulk User Upload</h2>
                <p className="text-gray-400">Upload a CSV file to create multiple users at once</p>
              </div>

              {!showPreview && !uploadResults && (
                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-purple-700/50 rounded-xl p-8 text-center bg-purple-900/10">
                    <ArrowUpTrayIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Upload CSV or Excel File</h3>
                    <p className="text-gray-400 mb-4">
                      Select a CSV (.csv) or Excel (.xlsx, .xls) file with user data. Required: email. Optional: password, role, full_name, phone, gamertag, discord, dob, gender, and more.
                    </p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-semibold mb-3">File Format Requirements:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-blue-200 font-medium mb-2">Required Fields:</h5>
                        <ul className="text-blue-200 text-sm space-y-1">
                          <li>• <strong>email</strong>: Valid email address</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-blue-200 font-medium mb-2">Optional Fields:</h5>
                        <ul className="text-blue-200 text-sm space-y-1">
                          <li>• <strong>password</strong>: Min 6 chars (auto-generated if empty)</li>
                          <li>• <strong>role</strong>: "user" or "admin" (default: user)</li>
                          <li>• <strong>full_name</strong>: User's full name</li>
                          <li>• <strong>phone</strong>: Phone number</li>
                          <li>• <strong>gamertag</strong>: Gaming username</li>
                          <li>• <strong>discord</strong>: Discord username</li>
                          <li>• <strong>dob</strong>: Date of birth (YYYY-MM-DD)</li>
                          <li>• <strong>gender</strong>: Male, Female, or Other</li>
                          <li>• <strong>platforms</strong>: Comma-separated list</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-700/30">
                      <p className="text-blue-200 text-xs">
                        💡 Download templates to see all available fields with examples
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showPreview && !uploadResults && (
                <div className="space-y-6">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Preview ({csvData.length} users)
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPreview(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleBulkUpload}
                        disabled={uploadLoading}
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50"
                      >
                        {uploadLoading ? "Creating Users..." : "Create All Users"}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uploadProgress && (
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex justify-between text-sm text-gray-300 mb-2">
                        <span>Processing: {uploadProgress.currentUser}</span>
                        <span>{uploadProgress.processed}/{uploadProgress.total}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span className="text-green-400">✓ Success: {uploadProgress.successCount}</span>
                        <span className="text-red-400">✗ Failed: {uploadProgress.failedCount}</span>
                      </div>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="bg-black/40 rounded-lg border border-purple-700/30 max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-purple-900/50 border-b border-purple-700/30 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-purple-300 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-purple-300 uppercase">Password</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-purple-300 uppercase">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-700/20">
                        {csvData.slice(0, 50).map((user, index) => (
                          <tr key={index} className="hover:bg-purple-900/10">
                            <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-400">
                              {user.password.length > 12 ? "●●●●●●●●●●●●" : "●●●●●●●●"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                user.role === 'admin'
                                  ? 'bg-green-600/20 text-green-400'
                                  : 'bg-blue-600/20 text-blue-400'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvData.length > 50 && (
                      <div className="text-center py-3 text-gray-400 text-sm">
                        ... and {csvData.length - 50} more users
                      </div>
                    )}
                  </div>
                </div>
              )}

              {uploadResults && (
                <div className="space-y-6">
                  {/* Results Summary */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Upload Complete</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400">{uploadResults.total}</div>
                        <div className="text-blue-300 text-sm">Total</div>
                      </div>
                      <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-400">{uploadResults.successful.length}</div>
                        <div className="text-green-300 text-sm">Success</div>
                      </div>
                      <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-400">{uploadResults.failed.length}</div>
                        <div className="text-red-300 text-sm">Failed</div>
                      </div>
                    </div>
                  </div>

                  {/* Failed Users */}
                  {uploadResults.failed.length > 0 && (
                    <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                      <h4 className="text-red-300 font-semibold mb-3">Failed Users:</h4>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {uploadResults.failed.map((result, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-red-200">{result.email}</span>
                            <span className="text-red-400">{result.error}</span>
                          </div>
                        ))}
                      </div>
                      {uploadResults.failed.length > 0 && (
                        <button
                          onClick={downloadErrorReport}
                          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Download Error Report
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex justify-center">
                    <button
                      onClick={resetUpload}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                    >
                      Upload Another File
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-purple-700/30">
                <button
                  onClick={resetUpload}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}