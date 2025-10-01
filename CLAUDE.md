# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obscura is a React-based esports recruitment management platform with comprehensive team management and role-based access control. It uses Supabase for backend services and features separate interfaces for users, admins, and super admins, along with a public landing page and team showcase.

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Test user creation fixes
node test-user-creation.js
```

## Architecture

### Technology Stack
- **React 18.2** with React Router DOM for SPA routing
- **Supabase** for backend (PostgreSQL database, authentication, real-time subscriptions, file storage)
- **Tailwind CSS** for styling with custom utility classes and responsive design
- **Framer Motion** for animations and transitions
- **React Hot Toast** for notifications
- **Additional UI libraries**: Headless UI, Heroicons, Lucide React, React Player

### Core Architectural Patterns

1. **Dual Route Protection System**:
   - [ProtectedRoute.jsx](src/routes/ProtectedRoute.jsx) - Role-based access control
   - [OnboardingProtectedRoute.jsx](src/routes/OnboardingProtectedRoute.jsx) - Onboarding completion checks
   - Routes in [src/routes/index.jsx](src/routes/index.jsx) use appropriate protection based on requirements

2. **Component Architecture**:
   - [src/pages/](src/pages/) - Page-level components and main views
   - [src/components/](src/components/) - Reusable UI components
   - [src/components/landing/](src/components/landing/) - Landing page sections
   - [src/layouts/](src/layouts/) - Layout wrappers (AdminLayout)
   - [src/utils/](src/utils/) - Utility functions and operations

3. **State Management Strategy**:
   - React Context for global state (theme, notifications)
   - Supabase for database state with real-time updates
   - localStorage for role and onboarding status persistence
   - Component-level state with useState hooks

4. **Database-Driven Architecture**:
   - Complete [database schema](database/) with automated triggers
   - Row Level Security (RLS) policies for data protection
   - Database views for complex queries
   - Automatic profile creation on user registration

### Main Entry Points

- [src/App.jsx](src/App.jsx) - Main application component with authentication and routing logic
- [src/pages/LandingPage.jsx](src/pages/LandingPage.jsx) - Public homepage with team showcase
- [src/supabaseClient.js](src/supabaseClient.js) - Supabase client configuration

### Environment Configuration

Required environment variables (see [.env.example](.env.example)):
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key
- `REACT_APP_SUPABASE_SERVICE_ROLE_KEY` - Required for admin user operations

### Database Schema

Core tables and their purposes:
- `users` - User profiles with automatic creation triggers
- `applications` - Recruitment applications
- `hr_tickets` - Support ticket system
- `teams` - Team management with member rosters
- `team_members` - Team membership with roles
- `team_applications` - Team application workflow
- `active_game_categories` - Game category management

Database setup requires running SQL files in [database/](database/) folder in this order:
1. [users_schema.sql](database/users_schema.sql) - User management with triggers
2. [team_management_schema.sql](database/team_management_schema.sql) - Team system
3. [games_category_schema.sql](database/games_category_schema.sql) - Game categories

### Key Features and Systems

#### User Management & Authentication
- Automatic profile creation via database triggers
- Onboarding flow with recruitment form completion requirement
- Password reset functionality with secure tokens
- Bulk user creation via CSV/Excel upload ([CSV_USER_UPLOAD_SETUP.md](CSV_USER_UPLOAD_SETUP.md))

#### Team Management System
- [TeamManagementPage.jsx](src/pages/TeamManagementPage.jsx) - Admin team management interface
- [TeamDetailModal.jsx](src/components/TeamDetailModal.jsx) - Team roster display and member management
- [TeamApplicationModal.jsx](src/components/TeamApplicationModal.jsx) - Team application workflow
- [TeamsSection.jsx](src/components/landing/TeamsSection.jsx) - Public team showcase

#### Landing Page System
Modular landing page with sections:
- [HeroSection.jsx](src/components/landing/HeroSection.jsx) - Hero with call-to-action
- [TeamsSection.jsx](src/components/landing/TeamsSection.jsx) - Interactive team showcase
- [PlayersSection.jsx](src/components/landing/PlayersSection.jsx) - Player highlights
- [AboutSection.jsx](src/components/landing/AboutSection.jsx) - Organization information

## Important Components

### Core Admin Components
- [AdminDashboard.jsx](src/pages/AdminDashboard.jsx) - Application management with filtering and bulk actions
- [UserManagementPage.jsx](src/pages/UserManagementPage.jsx) - User creation and management (superadmin only)
- [TeamManagementPage.jsx](src/pages/TeamManagementPage.jsx) - Complete team management system
- [AdminLayout.jsx](src/layouts/AdminLayout.jsx) - Admin panel layout with navigation

### User Flow Components
- [RecruitmentForm.jsx](src/components/RecruitmentForm.jsx) - Multi-step recruitment application
- [LandingPage.jsx](src/pages/LandingPage.jsx) - Public homepage and team showcase
- [LoginPage.jsx](src/pages/LoginPage.jsx) - Authentication with onboarding redirect logic
- [SignupPage.jsx](src/pages/SignupPage.jsx) - User registration with automatic profile creation

## Critical Implementation Details

### User Creation Flow
The application has resolved "duplicate key constraint violations" through:
- Database triggers for automatic profile creation
- Proper existence checking in [SignupPage.jsx](src/pages/SignupPage.jsx)
- Enhanced admin operations in [src/utils/adminOperations.js](src/utils/adminOperations.js)
- See [USER_CREATION_FIX.md](USER_CREATION_FIX.md) for complete details

### Onboarding Protection System
Users must complete recruitment form before accessing protected features:
- Login automatically redirects incomplete users to `/recruitment`
- [OnboardingProtectedRoute.jsx](src/routes/OnboardingProtectedRoute.jsx) prevents URL bypass
- Routes using this protection: `/refer`, `/update-details`, `/hr-support`, `/my-hr-tickets`, `/exitform`
- Admin users bypass onboarding requirements
- See [ONBOARDING_FLOW_FIX.md](ONBOARDING_FLOW_FIX.md) for implementation details

### Route Protection Matrix
- **Public routes**: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`
- **Basic protected routes**: `/recruitment`, `/minor-recruitment` (login required only)
- **Onboarding protected routes**: Most user features require completed onboarding
- **Admin routes**: `/admin-*` paths require admin/superadmin role
- **Superadmin routes**: `/user-management` requires superadmin role

When modifying authentication or routing:
- Check [App.jsx](src/App.jsx) for session management and role fetching
- Review both route protection components for appropriate usage
- Ensure localStorage consistency for role and onboarding status
- Test direct URL navigation to verify protection works

When adding team-related features:
- Follow patterns in [TeamManagementPage.jsx](src/pages/TeamManagementPage.jsx)
- Use database views for complex team queries
- Implement proper RLS policies for data security
- Consider real-time updates for collaborative features

When working with bulk operations:
- Use [src/utils/adminOperations.js](src/utils/adminOperations.js) patterns
- Implement proper error handling and progress tracking
- Follow CSV/Excel parsing patterns for file uploads
- Ensure service role key is configured for admin operations