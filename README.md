# DDU Hackathon Management Portal

A comprehensive hackathon management platform built with modern web technologies, featuring role-based access control, multi-database support, and a complete admin dashboard.

## Overview

DDU is a full-stack hackathon management system that enables participants to discover and register for hackathons, organizers to create and manage events, and admins to oversee the entire platform. The system supports user authentication, profile management, submissions, and real-time notifications.

## Tech Stack

- **Frontend**: Next.js 16.0.10 with React and TypeScript
- **Styling**: Tailwind CSS with dark theme support
- **Database**: Prisma ORM with multi-database support (Student, Organizer, Admin)
- **Authentication**: Session-based auth with bcrypt password hashing
- **Components**: shadcn/ui component library
- **Build Tool**: Turbopack

## Features

### For Participants
- User registration and authentication
- Browse and register for hackathons
- Submit projects and track submissions
- View certificates and achievements
- Manage profile and settings
- Real-time notifications

### For Organizers
- Create and manage hackathons
- Track registrations and submissions
- Manage team formations
- View analytics and reports
- Organize events with custom settings

### For Admins
- User management and approval system
- Hackathon oversight and control
- Platform analytics and reports
- Create admin accounts
- System settings and configuration

## Project Structure

```
dduhack/
├── app/
│   ├── api/              # API routes for all endpoints
│   ├── auth/            # Authentication pages (login, register)
│   ├── admin/           # Admin dashboard and management pages
│   ├── dashboard/       # User dashboard (participant/organizer)
│   └── hackathons/      # Public hackathon listing
├── components/          # React components
├── lib/                 # Utility functions and configs
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── styles/              # Global styles
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Database connections (configured in .env)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Setup

Create a `.env.local` file with your database URLs:

```
DATABASE_URL_STUDENT="your_student_db_url"
DATABASE_URL_ORGANIZER="your_organizer_db_url"
DATABASE_URL_ADMIN="your_admin_db_url"
SESSION_SECRET="your_session_secret"
```

## Key Components

### Admin Dashboard
- **Approvals**: Manage new user registrations
- **Users**: View and manage all users
- **Hackathons**: Monitor hackathons and events
- **Reports**: View platform analytics and statistics
- **Profile**: Admin profile management
- **Settings**: Account and system settings
- **Add Member**: Create new admin/organizer accounts

### User Features
- Profile editing with avatar support
- Password management
- Real-time activity notifications
- Personal dashboard with analytics

## Role System

The platform supports three user roles:

1. **Participant** - Join hackathons and submit projects
2. **Organizer** - Create and manage hackathons
3. **Admin** - Full platform control and oversight

## Database Schema

The system uses Prisma with multi-database support:
- **Student DB**: Participant user data and submissions
- **Organizer DB**: Hackathon and team information
- **Admin DB**: System users and administrative data

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/profile/update` - Update profile
- `POST /api/password/change` - Change password

### Admin
- `GET /api/admin/users/all` - List all users
- `POST /api/admin/users/create` - Create new user
- `GET /api/admin/approvals` - Get pending approvals
- `POST /api/admin/users/[id]/approve` - Approve user
- `GET /api/admin/hackathons/all` - List hackathons
- `GET /api/admin/analytics` - Get platform analytics

## Development

```bash
# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript check
npm run type-check
```

## Features Implemented

✅ Multi-role authentication system  
✅ Complete admin dashboard  
✅ User management and approval workflow  
✅ Hackathon discovery and registration  
✅ Submission tracking  
✅ Real-time notifications  
✅ Profile management  
✅ Password security  
✅ Session management  
✅ Responsive dark theme design  

## License

This project is licensed under the MIT License.