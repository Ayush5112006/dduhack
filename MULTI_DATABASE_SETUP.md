# Multi-Database Setup Guide

## Overview
This application now supports **separate databases for each user role** (Student/Participant, Admin, and Organizer). Each role has its own isolated database.

## Database Configuration

### Environment Variables
Create a `.env.local` file with the following:

```env
# Main database URL (fallback for all roles)
DATABASE_URL="file:./prisma/dev.db"

# Role-specific database URLs (optional)
DATABASE_URL_STUDENT="file:./prisma/student.db"
DATABASE_URL_ORGANIZER="file:./prisma/organizer.db"
DATABASE_URL_ADMIN="file:./prisma/admin.db"
```

### Supported Database Providers
- **SQLite** (development): `file:./prisma/student.db`
- **PostgreSQL**: `postgresql://user:password@localhost:5432/student_db`
- **MySQL**: `mysql://user:password@localhost:3306/student_db`

### Examples

#### PostgreSQL Setup
```env
DATABASE_URL_STUDENT="postgresql://user:password@localhost:5432/student_db"
DATABASE_URL_ORGANIZER="postgresql://user:password@localhost:5432/organizer_db"
DATABASE_URL_ADMIN="postgresql://user:password@localhost:5432/admin_db"
```

#### MySQL Setup
```env
DATABASE_URL_STUDENT="mysql://user:password@localhost:3306/student_db"
DATABASE_URL_ORGANIZER="mysql://user:password@localhost:3306/organizer_db"
DATABASE_URL_ADMIN="mysql://user:password@localhost:3306/admin_db"
```

## Database Initialization

### Step 1: Create Migration
Run migrations for each role's database:

```bash
npx prisma migrate dev --name init
```

This will prompt you to create the databases if they don't exist.

### Step 2: Seed Data (Optional)
```bash
npx prisma db seed
```

## Database Structure

Each role's database contains:
- **User Model**: Stores user credentials and profile
- **Session Model**: Tracks active sessions
- **Role-specific Data**:
  - **Student/Participant**: Registrations, Submissions, Certificates, Teams
  - **Organizer**: Hackathons, Registrations (as organizer)
  - **Admin**: User management, System logs, Analytics

## Code Usage

### Getting the Right Database Client
```typescript
import { getPrismaClient } from "@/lib/prisma-multi-db"

// Get database for a specific role
const studentDb = getPrismaClient("participant")
const organizerDb = getPrismaClient("organizer")
const adminDb = getPrismaClient("admin")

// Use it in queries
const user = await studentDb.user.findUnique({
  where: { email }
})
```

### In API Routes
```typescript
import { getPrismaClient } from "@/lib/prisma-multi-db"

export async function POST(request: NextRequest) {
  const { email, password, role } = await request.json()
  
  // Get the appropriate database based on user role
  const db = getPrismaClient(role || "participant")
  
  const user = await db.user.findUnique({ where: { email } })
  // ... rest of logic
}
```

## Migration Workflow

When you need to update the schema:

1. **Update prisma/schema.prisma** with your changes
2. **Run migration** for all databases:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

This will update all role-specific databases with the same schema.

## Accessing Sessions

Sessions are now role-aware:
```typescript
import { getSession } from "@/lib/session"

// Returns session with the user's role
const session = await getSession()
// session.userRole = "participant" | "organizer" | "admin" | "judge"
```

## Fallback Behavior

If a role-specific database URL is not set:
- Uses `DATABASE_URL` as fallback
- Example: If `DATABASE_URL_ORGANIZER` is not set, it uses `DATABASE_URL`

This allows gradual migration from single to multi-database setup.

## Troubleshooting

### Error: "Database connection failed"
- Verify database URLs in `.env.local`
- Ensure databases exist and are accessible
- Check database credentials

### Error: "Table does not exist"
- Run migrations: `npx prisma migrate dev`
- Verify schema is applied to all databases

### Sessions not persisting
- Check that each role's database has the Session table
- Verify session TTL is not expired

## Production Deployment

### Using Cloud Databases
```env
# Example: Using Planetscale (MySQL)
DATABASE_URL_STUDENT="mysql://user:password@aws.connect.planetscale.com/student_db"
DATABASE_URL_ORGANIZER="mysql://user:password@aws.connect.planetscale.com/organizer_db"
DATABASE_URL_ADMIN="mysql://user:password@aws.connect.planetscale.com/admin_db"
```

### Environment-specific Configuration
Store database URLs in your hosting platform's environment variables:
- Vercel: Project Settings → Environment Variables
- Railway: Variables → Set Variable
- Heroku: Settings → Config Vars

## Performance Considerations

1. **Connection Pooling**: Adjust for production using database-specific settings
2. **Query Optimization**: Index frequently queried fields
3. **Database Backups**: Set up automated backups for each role's database
4. **Load Balancing**: Consider read replicas for high-traffic databases

## Migration from Single to Multi-Database

1. Backup existing `DATABASE_URL`
2. Create three new databases
3. Copy data from main database to role-specific databases
4. Set environment variables for new databases
5. Test thoroughly before going live
6. Monitor logs for any issues
