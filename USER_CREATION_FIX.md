# User Creation Database Error Fix

This document explains the fixes applied to resolve the "duplicate key value violates unique constraint 'users_pkey'" errors during user registration.

## Problem Summary

Users were experiencing database errors when trying to sign up or when admins created users in bulk:

```
Failed Users:
user@example.com
User created but profile failed: duplicate key value violates unique constraint "users_pkey"
admin@example.com
User created but profile failed: duplicate key value violates unique constraint "users_pkey"
```

### Root Cause

The application had **two different user creation flows** with flawed logic:

1. **Regular User Signup** (`SignupPage.jsx`): Incorrect condition for checking existing users
2. **Admin User Creation** (`adminOperations.js`): No check for existing user profiles before insertion
3. **Missing Database Automation**: No automatic profile creation trigger in the database

## Fixes Applied

### 1. Fixed SignupPage User Creation Logic

**File**: `src/pages/SignupPage.jsx`

**Problem**: The condition `!existingUser && !fetchError` was incorrect because Supabase returns an error when a user doesn't exist, not null.

**Fix**: Changed to properly check for the "not found" error code:

```javascript
// Before (INCORRECT)
if (!existingUser && !fetchError) {
  // Create user profile
}

// After (CORRECT)
if (!existingUser && fetchError?.code === 'PGRST116') {
  // Create user profile only if user doesn't exist
  // PGRST116 is Supabase's "not found" error code
}
```

### 2. Fixed Admin User Creation Logic

**File**: `src/utils/adminOperations.js`

**Problem**: The admin user creation didn't check if a user profile already existed before trying to create one.

**Fix**: Added proper existence check and cleanup logic:

```javascript
// Added before profile creation:
1. Check if user profile already exists
2. Return success if profile exists
3. Only create profile if it doesn't exist
4. Clean up auth user if profile creation fails
```

### 3. Created Comprehensive Database Schema

**File**: `database/users_schema.sql`

**New Features**:
- ✅ **Automatic profile creation trigger** - Creates user profiles automatically when auth users are created
- ✅ **Proper RLS policies** - Row-level security for data protection
- ✅ **Cleanup functions** - Tools to fix orphaned users and missing profiles
- ✅ **Helper functions** - Utility functions for role checking
- ✅ **Error handling** - Graceful handling of edge cases

## Database Setup Instructions

### Step 1: Apply the Users Schema

Run the SQL in `database/users_schema.sql` in your Supabase SQL Editor. This will:

1. Create the `users` table with proper structure
2. Set up automatic profile creation triggers
3. Configure Row Level Security policies
4. Add cleanup and utility functions

### Step 2: Fix Existing Data (If Needed)

If you have existing users with issues, run these cleanup functions as a superadmin:

```sql
-- Create missing profiles for existing auth users
SELECT create_missing_profiles();

-- Remove orphaned auth users (optional, be careful!)
SELECT cleanup_orphaned_auth_users();
```

### Step 3: Verify Setup

Check that everything is working:

```sql
-- View users without profiles (should be empty after fixes)
SELECT au.email, au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- View your current role
SELECT get_user_role(auth.uid());
```

## Benefits of the Fix

### 🚀 **Automatic Profile Creation**
- New user registrations automatically create profiles
- No more manual intervention required
- Eliminates race conditions

### 🛡️ **Better Error Handling**
- Graceful handling of duplicate users
- Proper cleanup when things go wrong
- Clear error messages for debugging

### 🔧 **Maintenance Tools**
- Built-in functions to fix data issues
- Easy monitoring of user sync status
- Automated cleanup capabilities

### 🔒 **Enhanced Security**
- Proper Row Level Security policies
- Role-based access controls
- Protection against unauthorized operations

## Testing the Fix

### Test Regular User Registration

1. Go to `/signup`
2. Create a new user account
3. Verify email confirmation works
4. Check that user profile is created automatically

### Test Admin User Creation

1. Go to `/user-management`
2. Upload a CSV or create users manually
3. Verify no duplicate key errors occur
4. Check that profiles are created properly

### Monitor for Issues

Watch the Supabase logs for any remaining errors:
- Auth user creation events
- Profile creation trigger execution
- Any constraint violation errors

## Error Prevention

The fix prevents these common issues:

- ❌ Duplicate key constraint violations
- ❌ Orphaned auth users without profiles
- ❌ Race conditions during user creation
- ❌ Manual profile creation failures
- ❌ Inconsistent user data states

## Future Maintenance

### Regular Health Checks

Run these queries periodically to monitor user sync:

```sql
-- Count users by status
SELECT
  COUNT(*) as total_auth_users,
  COUNT(pu.id) as users_with_profiles,
  COUNT(*) - COUNT(pu.id) as missing_profiles
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;
```

### Backup Strategy

Before running cleanup functions:
1. Always backup your database
2. Test on a staging environment first
3. Run during low-traffic periods
4. Monitor results carefully

## Support

If you encounter issues after applying these fixes:

1. Check Supabase database logs
2. Verify the trigger is installed correctly
3. Ensure RLS policies are active
4. Contact the development team with specific error messages

---

**Note**: This fix maintains backward compatibility while adding robust user management. All existing functionality continues to work as expected.