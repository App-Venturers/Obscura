import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// Create admin client with service role key for user management operations
const createAdminClient = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const serviceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin configuration. Please add REACT_APP_SUPABASE_SERVICE_ROLE_KEY to your environment variables.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} Generated password
 */
export const generateSecurePassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate user role
 * @param {string} role - Role to validate
 * @returns {boolean} True if valid role
 */
export const isValidRole = (role) => {
  const validRoles = ["user", "admin"];
  return validRoles.includes(role.toLowerCase());
};

/**
 * Create a single user with admin privileges
 * @param {Object} userData - User data object
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role (user/admin)
 * @returns {Promise<Object>} Result object with success status and user data or error
 */
export const createUser = async (userData) => {
  try {
    const { email, password, role = "user" } = userData;

    // Validate input data
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
        email
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        error: "Invalid email format",
        email
      };
    }

    if (!isValidRole(role)) {
      return {
        success: false,
        error: "Invalid role. Must be 'user' or 'admin'",
        email
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long",
        email
      };
    }

    const adminClient = createAdminClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email to bypass confirmation
      user_metadata: {
        role: role.toLowerCase()
      }
    });

    if (authError) {
      // Handle specific error cases
      if (authError.message.includes("already registered")) {
        return {
          success: false,
          error: "User already exists",
          email
        };
      }

      return {
        success: false,
        error: authError.message,
        email
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create user account",
        email
      };
    }

    // Prepare user profile data for insertion
    const { email: userEmail, password: userPassword, originalRow, ...additionalFields } = userData;

    // Build profile object starting with core fields
    const profileData = {
      id: authData.user.id,
      email: authData.user.email,
      role: role.toLowerCase(),
      onboarding: false,
      ...additionalFields // Include any additional fields from CSV/Excel
    };

    // Check if user profile already exists
    const { data: existingProfile, error: checkError } = await adminClient
      .from("users")
      .select("id")
      .eq("id", authData.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // Handle database errors other than "not found"
      return {
        success: false,
        error: `Database error checking user profile: ${checkError.message}`,
        email
      };
    }

    if (existingProfile) {
      // User profile already exists, return success
      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: role.toLowerCase(),
          created_at: authData.user.created_at
        },
        email
      };
    }

    // Insert user profile into users table only if it doesn't exist
    const { error: profileError } = await adminClient
      .from("users")
      .insert([profileData]);

    if (profileError) {
      // If profile creation fails, we should clean up the auth user
      // First attempt to delete the auth user
      try {
        await adminClient.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error("Failed to cleanup auth user after profile creation failure:", cleanupError);
      }

      return {
        success: false,
        error: `User created but profile failed: ${profileError.message}`,
        email
      };
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role.toLowerCase(),
        created_at: authData.user.created_at
      },
      email
    };

  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
      email: userData.email
    };
  }
};

/**
 * Create multiple users in bulk
 * @param {Array<Object>} usersData - Array of user data objects
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} Result object with success/failed users and summary
 */
export const createUsersBulk = async (usersData, onProgress = null) => {
  const results = {
    successful: [],
    failed: [],
    total: usersData.length,
    processed: 0
  };

  // Process users one by one to avoid rate limiting
  for (let i = 0; i < usersData.length; i++) {
    const userData = usersData[i];

    try {
      const result = await createUser(userData);

      if (result.success) {
        results.successful.push(result);
      } else {
        results.failed.push(result);
      }

      results.processed++;

      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          processed: results.processed,
          total: results.total,
          successCount: results.successful.length,
          failedCount: results.failed.length,
          currentUser: userData.email
        });
      }

      // Small delay to prevent overwhelming the API
      if (i < usersData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error(`Error processing user ${userData.email}:`, error);
      results.failed.push({
        success: false,
        error: error.message || "Unknown error",
        email: userData.email
      });
      results.processed++;
    }
  }

  return results;
};

/**
 * Parse Excel file and convert to JSON
 * @param {File} file - Excel file
 * @returns {Promise<Object>} Parsed data or error
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with header normalization
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        });

        if (jsonData.length === 0) {
          resolve({
            success: false,
            error: "Excel file is empty",
            data: []
          });
          return;
        }

        // Extract headers and normalize them
        const headers = jsonData[0].map(header =>
          header.toString().toLowerCase().trim()
        );

        // Convert rows to objects
        const rows = jsonData.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] ? row[index].toString().trim() : '';
          });
          return obj;
        }).filter(row => row.email); // Filter out rows without email

        resolve({
          success: true,
          data: rows,
          headers: headers
        });

      } catch (error) {
        resolve({
          success: false,
          error: "Failed to parse Excel file: " + error.message,
          data: []
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: "Failed to read Excel file",
        data: []
      });
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date format
 */
const isValidDate = (dateString) => {
  if (!dateString) return true; // Optional field
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date.toISOString().split('T')[0] === dateString;
};

/**
 * Validate phone format (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
const isValidPhone = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Parse array fields (platforms, languages, software)
 * @param {string} value - Comma-separated string
 * @returns {Array} Parsed array
 */
const parseArrayField = (value) => {
  if (!value || typeof value !== 'string') return [];
  return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
};

/**
 * Validate and process parsed data (works for both CSV and Excel)
 * @param {Array} data - Parsed data array
 * @returns {Object} Validation result
 */
export const validateAndProcessUserData = (data) => {
  // Validate required columns
  const requiredColumns = ["email"];
  const headers = Object.keys(data[0] || {});
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));

  if (missingColumns.length > 0) {
    return {
      success: false,
      error: `Missing required columns: ${missingColumns.join(", ")}`,
      data: []
    };
  }

  // Define optional fields that can be included
  const optionalFields = [
    'full_name', 'phone', 'gamertag', 'discord', 'dob', 'gender',
    'division', 'photo_url', 'status', 'onboarding', 'is_minor',
    'platforms', 'languages', 'software'
  ];

  const validationErrors = [];

  // Process and validate each row
  const processedData = data
    .map((row, index) => {
      const rowNumber = index + 1;
      const email = row.email?.trim();
      const password = row.password?.trim() || generateSecurePassword();
      const role = row.role?.trim().toLowerCase() || "user";

      // Basic validation
      if (!email) return null;

      if (!isValidEmail(email)) {
        validationErrors.push(`Row ${rowNumber}: Invalid email format`);
        return null;
      }

      if (!isValidRole(role)) {
        validationErrors.push(`Row ${rowNumber}: Invalid role '${role}'. Must be 'user' or 'admin'`);
        return null;
      }

      // Build user object with core fields
      const userData = {
        email,
        password,
        role,
        originalRow: rowNumber
      };

      // Add optional fields if present in the data
      optionalFields.forEach(field => {
        if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
          let value = row[field];

          // Field-specific processing and validation
          switch (field) {
            case 'full_name':
              userData.full_name = value.toString().trim();
              break;

            case 'phone':
              value = value.toString().trim();
              if (!isValidPhone(value)) {
                validationErrors.push(`Row ${rowNumber}: Invalid phone format`);
                return null;
              }
              userData.phone = value;
              break;

            case 'gamertag':
            case 'discord':
              userData[field] = value.toString().trim();
              break;

            case 'dob':
              value = value.toString().trim();
              if (!isValidDate(value)) {
                validationErrors.push(`Row ${rowNumber}: Invalid date format for DOB. Use YYYY-MM-DD`);
                return null;
              }
              userData.dob = value;
              break;

            case 'gender':
              const validGenders = ['male', 'female', 'other'];
              value = value.toString().toLowerCase().trim();
              if (!validGenders.includes(value)) {
                validationErrors.push(`Row ${rowNumber}: Invalid gender '${value}'. Must be 'male', 'female', or 'other'`);
                return null;
              }
              userData.gender = value.charAt(0).toUpperCase() + value.slice(1);
              break;

            case 'division':
              userData.division = value.toString().trim();
              break;

            case 'photo_url':
              userData.photo_url = value.toString().trim();
              break;

            case 'status':
              userData.status = value.toString().trim();
              break;

            case 'onboarding':
              // Convert to boolean
              const onboardingStr = value.toString().toLowerCase().trim();
              userData.onboarding = ['true', '1', 'yes', 'y'].includes(onboardingStr);
              break;

            case 'is_minor':
              // Convert to boolean
              const isMinorStr = value.toString().toLowerCase().trim();
              userData.is_minor = ['true', '1', 'yes', 'y'].includes(isMinorStr);
              break;

            case 'platforms':
            case 'languages':
            case 'software':
              // Parse comma-separated arrays
              userData[field] = parseArrayField(value.toString());
              break;

            default:
              // For any other fields, just include them as strings
              userData[field] = value.toString().trim();
              break;
          }
        }
      });

      return userData;
    })
    .filter(row => row !== null); // Filter out null rows (validation failures)

  // Return validation errors if any
  if (validationErrors.length > 0) {
    return {
      success: false,
      error: `Validation errors:\n${validationErrors.join('\n')}`,
      data: []
    };
  }

  return {
    success: true,
    data: processedData,
    totalRows: processedData.length
  };
};

/**
 * Parse file (CSV or Excel) and validate structure
 * @param {File} file - File to parse (CSV or Excel)
 * @returns {Promise<Object>} Parsed and validated user data
 */
export const parseAndValidateFile = async (file) => {
  const fileName = file.name.toLowerCase();
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
  const isCsv = fileName.endsWith('.csv');

  if (!isExcel && !isCsv) {
    return {
      success: false,
      error: "Unsupported file format. Please use CSV (.csv) or Excel (.xlsx, .xls) files.",
      data: []
    };
  }

  if (isExcel) {
    const parseResult = await parseExcelFile(file);
    if (!parseResult.success) {
      return parseResult;
    }
    return validateAndProcessUserData(parseResult.data);
  } else {
    // Handle CSV files
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvText = e.target.result;
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.toLowerCase().trim(),
          complete: (results) => {
            const { data, errors } = results;

            if (errors.length > 0) {
              resolve({
                success: false,
                error: "CSV parsing errors: " + errors.map(e => e.message).join(", "),
                data: []
              });
              return;
            }

            const validationResult = validateAndProcessUserData(data);
            resolve(validationResult);
          }
        });
      };
      reader.readAsText(file);
    });
  }
};

/**
 * Parse CSV data and validate structure (legacy function for backward compatibility)
 * @param {string} csvData - Raw CSV data
 * @returns {Promise<Object>} Parsed and validated user data
 */
export const parseAndValidateCSV = async (csvData) => {
  return new Promise((resolve) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: (results) => {
        const { data, errors } = results;

        if (errors.length > 0) {
          resolve({
            success: false,
            error: "CSV parsing errors: " + errors.map(e => e.message).join(", "),
            data: []
          });
          return;
        }

        // Validate required columns
        const requiredColumns = ["email"];
        const headers = Object.keys(data[0] || {});
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
          resolve({
            success: false,
            error: `Missing required columns: ${missingColumns.join(", ")}`,
            data: []
          });
          return;
        }

        // Process and validate each row
        const processedData = data
          .map((row, index) => {
            const email = row.email?.trim();
            const password = row.password?.trim() || generateSecurePassword();
            const role = row.role?.trim().toLowerCase() || "user";

            return {
              email,
              password,
              role,
              originalRow: index + 1
            };
          })
          .filter(row => row.email); // Filter out rows without email

        resolve({
          success: true,
          data: processedData,
          totalRows: processedData.length
        });
      }
    });
  });
};