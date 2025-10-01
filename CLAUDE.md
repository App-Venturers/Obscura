# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obscura is a React-based recruitment management system with role-based access control. It uses Supabase for backend services (authentication, database, storage) and features separate interfaces for users, admins, and super admins.

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture

### Technology Stack
- **React 18.2** with React Router DOM for SPA routing
- **Supabase** for backend (PostgreSQL database, authentication, real-time subscriptions, file storage)
- **Tailwind CSS** for styling with custom utility classes
- **Vite** as build tool (though npm scripts use react-scripts)

### Key Architectural Patterns

1. **Role-Based Access Control**: Three user roles (user, admin, superadmin) with hierarchical permissions
   - Routes protected via [ProtectedRoute.jsx](src/components/ProtectedRoute.jsx)
   - Role stored in localStorage for persistence
   - Admin routes require admin or superadmin role
   - User management requires superadmin role only

2. **Component Structure**:
   - [src/pages/](src/pages/) - Page-level components for each route
   - [src/components/](src/components/) - Reusable UI components
   - [src/layouts/](src/layouts/) - Layout wrappers (AdminLayout)
   - [src/context/](src/context/) - React Context providers (Theme, Toast)

3. **State Management**:
   - React Context for global state (theme, notifications)
   - Supabase for database state with real-time updates
   - Local component state with useState hooks
   - Session management through Supabase Auth

4. **Routing Architecture**:
   - Public routes: Login, Signup, Password Reset
   - Protected user routes: Entry, Recruitment forms, Referral
   - Admin routes: Dashboard, Overview, Streamers management
   - Super admin routes: User management

### Main Entry Points

- [src/App.jsx](src/App.jsx) - Main application component with routing logic
- [src/index.js](src/index.js) - Application bootstrap
- [src/supabaseClient.js](src/supabaseClient.js) - Supabase client configuration

### Environment Configuration

All environment variables use `REACT_APP_` prefix:
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key

### Database Schema

Key tables in Supabase:
- `users` - User profiles with roles
- `applications` - Recruitment applications
- `hr_tickets` - Support tickets
- Storage buckets for file uploads

### Styling Approach

- Tailwind CSS with custom configuration in [tailwind.config.js](tailwind.config.js)
- Global styles in [src/index.css](src/index.css)
- Custom gradient buttons and form inputs
- Dark/light theme support via ThemeProvider context

### Testing

Tests run via Jest (react-scripts test). Currently no custom test files exist in the codebase.

## Important Components

- [AdminDashboard.jsx](src/pages/AdminDashboard.jsx) - Main admin interface for managing applications with filtering, sorting, and bulk actions
- [RecruitmentForm.jsx](src/pages/RecruitmentForm.jsx) - Multi-step recruitment application form
- [EntryPage.jsx](src/pages/EntryPage.jsx) - User landing page post-authentication
- [AdminLayout.jsx](src/layouts/AdminLayout.jsx) - Admin panel layout with sidebar navigation

## Common Development Tasks

When modifying authentication flow:
- Check [App.jsx](src/App.jsx) for session management logic
- Review [ProtectedRoute.jsx](src/components/ProtectedRoute.jsx) for route protection
- Ensure role persistence in localStorage matches Supabase session

When adding new admin features:
- Extend [AdminLayout.jsx](src/layouts/AdminLayout.jsx) navigation
- Follow existing pattern in admin pages for consistent UI
- Ensure proper role checks for new routes

When working with Supabase:
- Client instance available via [supabaseClient.js](src/supabaseClient.js)
- Use real-time subscriptions for live updates where appropriate
- Handle authentication errors gracefully with user feedback