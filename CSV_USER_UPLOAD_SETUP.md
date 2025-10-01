# File-Based User Upload Setup Guide

## Overview

This guide explains how to set up and use the CSV and Excel bulk user upload functionality for admins in the Obscura application. You can now upload users using either CSV files (.csv) or Excel files (.xlsx, .xls).

## Prerequisites

1. **Supabase Project Access**: You need admin access to your Supabase project
2. **Service Role Key**: Required for creating users without email confirmation

## Setup Instructions

### 1. Disable Email Confirmation in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Settings**
3. Under **User Settings**, disable **"Enable email confirmations"**
4. Save the changes

### 2. Get Service Role Key

1. In Supabase Dashboard, go to **Settings** > **API**
2. Copy the **service_role** key (not the anon key)
3. Keep this key secure - it has admin privileges

### 3. Update Environment Variables

Add the service role key to your environment variables:

```bash
# Add to your .env file
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ Important**: The service role key should NEVER be committed to version control. Add it to your `.env` file which should be in `.gitignore`.

### 4. Update Supabase RLS Policies (if needed)

Ensure your `users` table has appropriate RLS policies that allow the service role to insert new users.

## How to Use File Upload

### 1. Access the Feature

1. Log in as a **superadmin** user
2. Navigate to **User Management** page
3. Click the **"Upload File"** button

### 2. Prepare Your File

You can use either **CSV** or **Excel** format:

#### CSV Format (.csv)
```csv
email,password,role
user1@example.com,securepass123,user
admin@example.com,adminpass456,admin
newuser@example.com,,user
```

#### Excel Format (.xlsx, .xls)
Create an Excel file with the same column structure:
- Column A: email
- Column B: password
- Column C: role

**Column Requirements (both formats):**

**Required Fields:**
- **email**: Valid email address

**Basic Optional Fields:**
- **password**: Minimum 6 characters. If empty, a secure password will be generated
- **role**: "user" or "admin". Defaults to "user" if not specified

**Profile Optional Fields:**
- **full_name**: User's full name
- **phone**: Phone number (basic format validation)
- **gamertag**: Gaming username
- **discord**: Discord username (e.g., username#1234)
- **dob**: Date of birth in YYYY-MM-DD format
- **gender**: "Male", "Female", or "Other"
- **division**: User's division or department
- **photo_url**: URL to user's profile photo
- **status**: User status (e.g., "active", "inactive")
- **onboarding**: Boolean (true/false, yes/no, 1/0) - whether user has completed onboarding
- **is_minor**: Boolean (true/false, yes/no, 1/0) - whether user is a minor

**Array Fields (comma-separated):**
- **platforms**: Gaming platforms (e.g., "PC,Console,Mobile")
- **languages**: Spoken languages (e.g., "English,Spanish,French")
- **software**: Software proficiency (e.g., "OBS,Discord,Photoshop")

### 3. Upload Process

1. Click **"Templates"** dropdown to download sample files:
   - **CSV Template** - Downloads a sample .csv file
   - **Excel Template** - Downloads a sample .xlsx file
2. Click **"Upload File"** to open the upload modal
3. Select your CSV or Excel file
4. Review the preview of users to be created
5. Click **"Create All Users"** to start the bulk upload
6. Monitor the progress bar and results

### 4. Handle Errors

- Failed users will be displayed with specific error messages
- Download the error report to see which users failed and why
- Common errors include: duplicate emails, invalid email formats, weak passwords

## File Templates

Download templates from the User Management page or create files with this structure:

### CSV Template
```csv
email,password,role,full_name,phone,gamertag,discord,dob,gender,division,platforms,languages
user@example.com,securepass123,user,John Doe,+1234567890,john_gamer,johndoe#1234,1995-06-15,Male,Gaming,"PC,Console","English,Spanish"
admin@example.com,adminpass456,admin,Jane Smith,,,,,,,,,
```

### Excel Template
Create an Excel file (.xlsx) with these columns (only first few shown):
| email | password | role | full_name | phone | gamertag | discord | dob | gender | ... |
|-------|----------|------|-----------|-------|----------|---------|-----|--------|-----|
| user@example.com | securepass123 | user | John Doe | +1234567890 | john_gamer | johndoe#1234 | 1995-06-15 | Male | ... |
| admin@example.com | adminpass456 | admin | Jane Smith | | | | | | ... |

**Note**: Download the actual templates from the application to see all available columns with proper formatting.

## Security Features

1. **Role Restrictions**: Only superadmin users can access this feature
2. **Password Requirements**: Minimum 6 characters (configurable)
3. **Email Validation**: Validates email format before creation
4. **Role Validation**: Only allows "user" and "admin" roles (prevents superadmin creation)
5. **Secure Password Generation**: Auto-generates strong passwords when not provided

## Troubleshooting

### Common Issues

1. **"Missing Supabase admin configuration" Error**
   - Solution: Ensure `REACT_APP_SUPABASE_SERVICE_ROLE_KEY` is set in your environment

2. **"User already exists" Error**
   - Solution: The email is already registered. Remove duplicates from your CSV

3. **"Invalid email format" Error**
   - Solution: Check email addresses in your CSV for typos

4. **Permission Errors**
   - Solution: Verify your Supabase RLS policies allow service role access

### Environment Variables Checklist

```bash
# Required variables
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Features Included

- ✅ **Multiple file format support**: CSV (.csv) and Excel (.xlsx, .xls)
- ✅ Drag-and-drop file upload interface
- ✅ Real-time preview of users to be created
- ✅ Progress tracking during bulk upload
- ✅ Detailed error reporting and downloadable error logs
- ✅ Automatic password generation for missing passwords
- ✅ Email and role validation
- ✅ **Template downloads**: Both CSV and Excel templates available
- ✅ No email confirmation required (bypassed automatically)

## File Structure

```
src/
├── utils/
│   └── adminOperations.js     # Core file upload logic (CSV + Excel)
├── pages/
│   └── UserManagementPage.jsx # UI for file upload
└── .env.example               # Environment variable template
```

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure your Supabase project has email confirmation disabled
4. Check Supabase logs for authentication errors