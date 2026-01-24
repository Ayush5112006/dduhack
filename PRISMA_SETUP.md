# Prisma Database Setup - Complete

## Overview
Your hackathon platform now has a complete Prisma database setup with SQLite. All data is persisted in a `dev.db` file.

## Installed Packages
- `prisma` v5.22.0 - ORM and schema management
- `@prisma/client` v5.22.0 - Database client for your application
- `bcrypt` v6.0.0 - Password hashing
- `tsx` v4.21.0 - TypeScript runtime for seed scripts

## Database Structure

### Core Models

#### User
- Stores all user accounts
- Fields: id, email, name, password, role, status, avatar, bio, timestamps
- Roles: participant, organizer, admin, judge

#### UserProfile  
- Extended user information
- Fields: bio, location, website, social links, skills, interests, stats

#### Hackathon
- Main hackathon events
- Fields: title, organizer, description, dates, prize, difficulty, status, tags

#### Registration
- User registrations for hackathons
- Tracks mode (individual/team), status, and form data

#### Team
- Team management for hackathons
- Fields: name, leader, members, locked status

#### Submission
- Project submissions to hackathons
- Fields: title, description, links (GitHub, demo, video), tech stack, status

#### ProblemStatement
- Challenge problems for hackathons
- Fields: title, description, difficulty, resources, dataset

#### Score
- Judge scores for submissions
- Fields: innovation, technical, design, impact, presentation scores, feedback

#### Winner
- Hackathon winners/rankings
- Fields: rank, prize, announcement date

#### Certificate
- Digital certificates for participants/winners
- Fields: type, verification code, verified status

#### Notification
- User notifications
- Fields: type, title, message, link, read status

#### JudgeAssignment
- Judge assignment to hackathons

## Setup Instructions

### Initial Setup (Already Done)
1. ✅ Prisma installed and configured
2. ✅ SQLite database created at `file:./dev.db`
3. ✅ Schema defined in `prisma/schema.prisma`
4. ✅ Migrations created and applied
5. ✅ Database seeded with sample data

### Key Files
- `.env` - Database URL configuration
- `prisma/schema.prisma` - Data model definitions
- `prisma/seed.ts` - Sample data seeding script
- `lib/prisma.ts` - Prisma client singleton for Next.js
- `prisma/migrations/` - Migration history

## Using Prisma in Your Application

### Import the Prisma Client
```typescript
import { prisma } from '@/lib/prisma'
```

### Common Operations

#### Create
```typescript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword,
    role: 'participant'
  }
})
```

#### Read
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

const hackathons = await prisma.hackathon.findMany({
  where: { status: 'live' }
})
```

#### Update
```typescript
const updated = await prisma.user.update({
  where: { id: userId },
  data: { bio: 'New bio' }
})
```

#### Delete
```typescript
await prisma.user.delete({
  where: { id: userId }
})
```

### Relations
```typescript
// Get hackathon with registrations
const hackathon = await prisma.hackathon.findUnique({
  where: { id: hackathonId },
  include: {
    registrations: true,
    submissions: true,
    winners: true
  }
})

// Get user with submissions
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    submissions: true,
    profile: true,
    certificates: true
  }
})
```

## Database Commands

### View Schema
```bash
npx prisma studio
```
Opens interactive Prisma Studio to view and edit data.

### Run Migrations
```bash
npx prisma migrate dev --name <migration_name>
```

### Reset Database
```bash
npx prisma migrate reset
```
Drops all tables and re-runs all migrations + seeding.

### Check Schema Status
```bash
npx prisma db push
```

## Environment Variables
```
DATABASE_URL="file:./dev.db"
```

## Sample Data
The seed script creates:
- 1 admin user (admin@dduhack.com / admin123)
- 2 organizer users  
- 5 participant users
- 1 judge user
- 4 featured hackathons (upcoming, live, past)
- Problem statements, registrations, submissions, scores, and certificates

## Next Steps
1. Update API routes in `app/api/**` to use Prisma instead of in-memory data
2. Update authentication to use Prisma user model
3. Replace session storage with Prisma
4. Implement database indexes for performance
5. Set up automated backups for production

## Tips
- Always use `prisma.disconnect()` when done (Next.js handles this automatically)
- Use transactions for multi-step operations that must succeed together
- Use select/include to optimize queries and reduce data transfer
- Implement proper error handling for database operations
- Use Prisma's type safety for full IDE support

## Troubleshooting

### Database is locked
```bash
# Reset the database
npx prisma migrate reset
```

### Schema out of sync
```bash
# Check what's different
npx prisma db push --skip-generate

# Or reset everything
npx prisma migrate reset
```

### Type generation issues
```bash
# Regenerate types
npx prisma generate
```

For more help, visit: https://www.prisma.io/docs/
