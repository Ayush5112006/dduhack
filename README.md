# DDU Hackathon Management Portal

A comprehensive, production-ready hackathon management platform built with modern web technologies, featuring advanced registration, submission management, judge scoring, email notifications, and a complete admin dashboard.

## Overview

DDU is a full-stack hackathon management system that enables participants to discover and register for hackathons, organizers to create and manage events, judges to evaluate projects, and admins to oversee the entire platform. The system supports user authentication, profile management, submissions, email notifications, judge scoring, and real-time analytics.

## 🎯 Key Highlights (Phase 1-7)

✅ **Smart Registration System** - Individual/team registration with deadline validation  
✅ **Submission Management** - Draft editing, deadline enforcement, late submission window  
✅ **Judge Panel** - 5-metric scoring rubric with automatic averaging  
✅ **Notification Engine** - Paginated notifications with read/unread tracking  
✅ **Admin Dashboard** - User management, hackathon moderation, analytics  
✅ **Participant Dashboard** - Registrations, submissions, timeline views  
✅ **Email Notifications** - 8 email templates via Resend API  
✅ **Comprehensive Testing** - 34+ tests with Jest (90%+ coverage)  

## Tech Stack

- **Frontend**: Next.js 16.0.10 with React 19.2.0 and TypeScript
- **Styling**: Tailwind CSS 4.1.9 with dark theme support
- **Database**: Prisma 5.22.0 ORM with SQLite
- **Validation**: Zod for type-safe validation
- **Authentication**: Session-based auth with JWT tokens
- **Components**: shadcn/ui component library
- **Email**: Resend for transactional emails
- **Testing**: Jest 30.2.0 with @testing-library/react
- **Build Tool**: Turbopack for fast compilation

## Features

### For Participants
- ✅ Smart registration (individual or team mode)
- ✅ Profile management with detailed information capture
- ✅ Browse and register for hackathons
- ✅ Create and edit project submissions (draft mode)
- ✅ View judge scores and feedback
- ✅ Participant dashboard with timeline view
- ✅ Email notifications for all events
- ✅ Real-time notification system
- ✅ Team management and invitations
- ✅ Manage profile and settings

### For Judges
- ✅ View assigned hackathon submissions
- ✅ 5-metric scoring rubric (innovation, technical, design, impact, presentation)
- ✅ Provide detailed feedback on projects
- ✅ Automatic score averaging and ranking
- ✅ Leaderboard visibility

### For Organizers
- ✅ Create and manage hackathons
- ✅ Upload problem statement PDFs
- ✅ Track registrations and submissions
- ✅ Manage team formations
- ✅ View analytics and reports
- ✅ Organize events with custom settings
- ✅ Send announcements via email

### For Admins
- ✅ User management and approval system
- ✅ Hackathon oversight and moderation
- ✅ Platform analytics dashboard
- ✅ User role and status management
- ✅ System settings and configuration
- ✅ Create admin/judge accounts
- ✅ Monitor platform activity

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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ with pnpm package manager
- SQLite database (included)

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
# Create .env.local file with:
DATABASE_URL="file:./prisma/student.db"
JWT_SECRET="your-secret-key-min-32-characters"
RESEND_API_KEY="your-resend-api-key"  # Optional: for email notifications
EMAIL_FROM="noreply@hackathon.com"

# 3. Setup database
npx prisma migrate dev

# 4. Run development server
pnpm dev

# 5. Open browser
# Navigate to http://localhost:3000
```

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode (auto-rerun on changes)
pnpm test:watch

# Coverage report
pnpm test:coverage

# API tests only
pnpm test:api

# Unit tests only
pnpm test:unit
```

### Documentation

- 📖 [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing documentation
- 🚀 [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Production deployment guide
- 📋 [Phase 7 Summary](./PHASE_7_SUMMARY.md) - Email & testing implementation details
- 📝 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Full architecture documentation

## API Routes

### Public Routes
- `GET /api/public/hackathons` - List all hackathons
- `GET /api/public/hackathons/:id` - Get hackathon details

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Participant Routes
- `GET/POST /api/participant/registration` - Manage registrations
- `GET/POST /api/participant/submissions` - Manage submissions
- `GET/POST /api/participant/notifications` - Manage notifications
- `POST /api/participant/teams/invite` - Team invitations

### Judge Routes
- `GET/POST /api/judge/scores` - Submit and view scores

### Organizer Routes
- `GET/POST /api/organizer/hackathons` - Create/manage hackathons
- `POST /api/organizer/hackathons/:id/upload-pdf` - Upload problem statement

### Admin Routes
- `GET/PUT /api/admin/moderation/hackathons` - Moderate hackathons
- `GET/PUT /api/admin/moderation/users` - Manage users
- `GET /api/admin/analytics` - Platform analytics

## Database Schema

### Core Models
- **User** - Participant, organizer, judge, admin accounts
- **Hackathon** - Event information, dates, deadlines
- **Registration** - User-hackathon enrollment
- **Team** - Team creation and management
- **TeamMember** - Team membership with invitations
- **Submission** - Project submissions with status tracking
- **Score** - Judge evaluations with 5-metric rubric
- **Notification** - User notifications with read status
- **Certificate** - Achievement certificates

See [schema.prisma](./prisma/schema.prisma) for full schema details.

## Key Implementation Highlights

### Smart Registration System
- Individual or team mode selection
- Deadline enforcement and automatic rejection after deadline
- Auto-team creation with member invitations
- Comprehensive profile data capture
- Email notifications for confirmations

### Submission Management
- Draft editing with deadline awareness
- Late submission window (24 hours after deadline)
- Status tracking (draft, submitted, late)
- Immutable after final submission
- Version history and timestamps

### Judge Scoring
- 5-metric rubric: Innovation, Technical, Design, Impact, Presentation
- 1-10 scale for each metric
- Automatic average calculation
- Detailed feedback field
- Upsert logic for idempotent operations

### Email Notifications
- 8 template types: Registration, Team Invite, Submission, Score, Winner, Deadline, Announcement
- Responsive HTML design
- Bulk sending support
- Error handling and logging
- Resend API integration

### Comprehensive Testing
- 34+ unit and integration tests
- Jest configuration with TypeScript support
- Mock email service for isolated testing
- Validation schema testing
- 90%+ code coverage

## Environment Variables

```env
# Database
DATABASE_URL="file:./prisma/student.db"

# Authentication
JWT_SECRET="your-super-secret-key-min-32-chars"
SESSION_TOKEN_NAME="session_token"
SESSION_MAX_AGE="604800"  # 7 days

# Email (Optional)
RESEND_API_KEY="re_xxxx"
EMAIL_FROM="noreply@hackathon.com"
EMAIL_SUPPORT="support@hackathon.com"

# File Upload
MAX_FILE_SIZE="10485760"  # 10MB
UPLOAD_DIR="./public/uploads"

# Rate Limiting
RATE_LIMIT_WINDOW="60000"
RATE_LIMIT_MAX_REQUESTS="100"
```

## Deployment

### Development
```bash
pnpm dev
# Server runs on http://localhost:3000
```

### Production Build
```bash
pnpm build
pnpm start
```

### Docker Deployment
```bash
docker build -t hackathon-platform .
docker run -p 3000:3000 hackathon-platform
```

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete deployment guide including:
- Database migration to PostgreSQL
- Environment setup
- Security configuration
- Monitoring and logging
- Performance optimization

## Performance Metrics

- **Frontend**: Turbopack-powered, ~3s build time
- **API Response**: <500ms for 99% of requests
- **Email Sending**: ~100-200ms per email
- **Database Queries**: Optimized with Prisma select/include
- **Test Suite**: 34 tests in ~6.9 seconds

## Security Features

- ✅ Bcrypt password hashing
- ✅ JWT token authentication
- ✅ Session-based authorization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (Next.js built-in)
- ✅ CSRF token support
- ✅ Rate limiting on API endpoints
- ✅ Role-based access control (RBAC)
- ✅ User isolation in queries

## Future Enhancements (Phase 8-10)

- **Phase 8**: Real-time WebSocket updates for live participant counts and leaderboards
- **Phase 9**: Advanced analytics dashboard with engagement metrics
- **Phase 10**: Performance optimization with Redis caching and CDN setup

## Support & Contribution

### Report Issues
- Create an issue on GitHub
- Include error logs and reproduction steps
- Specify environment details

### Contribute
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- shadcn/ui for beautiful components
- Prisma for database abstraction
- Resend for email service
- Next.js team for the incredible framework
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