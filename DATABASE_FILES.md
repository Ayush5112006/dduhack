# Prisma Database - Files and Configuration

## 📁 Project Structure

```
dduhack/
├── .env                              # Environment variables
│   └── DATABASE_URL="file:./dev.db"
│
├── dev.db                            # SQLite database file (auto-created)
│
├── prisma/
│   ├── schema.prisma                 # Data model definitions
│   │   ├── User model
│   │   ├── UserProfile model
│   │   ├── Hackathon model
│   │   ├── Registration model
│   │   ├── Team model
│   │   ├── TeamMember model
│   │   ├── Submission model
│   │   ├── ProblemStatement model
│   │   ├── Score model
│   │   ├── Winner model
│   │   ├── Certificate model
│   │   ├── Notification model
│   │   └── JudgeAssignment model
│   │
│   ├── seed.ts                       # Database seeding script
│   │   ├── Creates admin user
│   │   ├── Creates sample users
│   │   ├── Creates sample hackathons
│   │   ├── Creates registrations & submissions
│   │   └── Creates certificates & scores
│   │
│   ├── migrations/
│   │   └── 20260124065447_init/
│   │       └── migration.sql         # Initial schema migration
│   │
│   └── .gitignore                    # Ignore dev.db and migrations
│
├── lib/
│   └── prisma.ts                     # Prisma client singleton
│       └── Optimized for Next.js usage
│
├── package.json                      # Dependencies
│   ├── @prisma/client: ^5.22.0
│   ├── prisma: ^5.22.0
│   ├── bcrypt: ^6.0.0
│   └── tsx: ^4.21.0 (dev)
│
├── PRISMA_SETUP.md                   # Detailed setup guide
├── PRISMA_SUMMARY.md                 # Quick reference
├── SCHEMA_DIAGRAM.md                 # ER diagrams and relationships
└── DATABASE_FILES.md                 # This file
```

## 🔧 Configuration Files

### .env (Environment Variables)
```
DATABASE_URL="file:./dev.db"
```

### prisma/schema.prisma
- 13 models defined
- 25+ relationships
- Type-safe queries

### package.json (Prisma Config)
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## 📊 Migration Files

### Location
`prisma/migrations/20260124065447_init/migration.sql`

### Contains
- CREATE TABLE statements for all 13 models
- UNIQUE constraints on:
  - User.email
  - UserProfile.userId
  - Registration (hackathonId, userId)
  - Score (submissionId, judgeId)
  - Certificate.verificationCode
  - JudgeAssignment (hackathonId, judgeId)
  - TeamMember (teamId, userId)
  - Winner (hackathonId, submissionId) and (hackathonId, rank)

### Indexes
- User.email
- Hackathon.status
- Notification (userId, createdAt)

## 🗄️ Database File

### dev.db (SQLite)
- **Type:** SQLite 3 database
- **Location:** Project root
- **Size:** ~100-200 KB (with sample data)
- **Connection:** Local file-based
- **Format:** Binary SQLite format

### Development vs Production
```
Development (Current)
├── File-based SQLite
├── Easy migration/reset
└── dev.db in project root

Production (Future)
├── PostgreSQL/MySQL
├── Managed database service
└── Environment-based connection URL
```

## 🚀 Key Commands

### Database Operations
```bash
# View data interactively
npx prisma studio

# Create new migration
npx prisma migrate dev --name <description>

# View migration history
npx prisma migrate status

# Reset entire database
npx prisma migrate reset

# Seed database
pnpm seed

# Generate types
npx prisma generate
```

### Diagnostics
```bash
# Check schema validity
npx prisma format

# Check if schema matches database
npx prisma db push --skip-generate

# Create SQL script for deployment
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datasource-url $DATABASE_URL
```

## 📝 prisma/seed.ts Details

### Purpose
Populates database with sample data for development and testing

### Data Created
```
Users:
  ├── 1 admin user (admin@dduhack.com)
  ├── 2 organizer users
  ├── 5 participant users
  └── 1 judge user

Hackathons:
  ├── "Global AI Innovation Summit" (upcoming)
  ├── "Web Crafters Championship" (live)
  ├── "BlockWave Hack" (upcoming)
  └── "Mobile App Sprint" (past)

Relationships:
  ├── 8+ problem statements
  ├── 15 registrations
  ├── 12 submissions
  ├── Multiple scores (judges scoring)
  ├── Winners announced
  └── Certificates issued
```

### Password Hashing
- Uses bcrypt with 10 salt rounds
- Admin password: `admin123`
- All other passwords: `password123`

## 🔐 Security Considerations

### Password Storage
- All passwords hashed with bcrypt
- Never stored in plain text
- Salt rounds: 10 (recommended)

### Environment Variables
- DATABASE_URL in .env
- Never commit .env to version control
- Different values for dev/prod

### Access Control
- Role-based (participant, organizer, admin, judge)
- Status tracking (active, suspended, pending)
- Implement row-level security in APIs

## 📊 Data Validation

### Prisma Validations
- Type checking at compile time
- Unique constraints enforced
- Foreign key relationships validated
- Cascade deletes configured

### Additional Validation Needed
- Add Zod schemas for API validation
- Implement business logic constraints
- Add custom validators for complex rules

## 🔄 Transaction Support

Prisma supports transactions for multi-step operations:

```typescript
await prisma.$transaction(async (tx) => {
  // Multiple operations, all succeed or all fail
  await tx.submission.create(...)
  await tx.score.create(...)
  await tx.notification.create(...)
})
```

## 📈 Performance Tips

1. **Use Select/Include** - Only fetch needed fields
2. **Pagination** - Use take/skip for large datasets
3. **Indexes** - Already configured on key fields
4. **Connection Pooling** - Built into Prisma
5. **Query Optimization** - Use Prisma studio to analyze

## 🐛 Debugging

### Enable Logs
```typescript
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})
```

### Check Migrations
```bash
npx prisma migrate status
```

### Validate Schema
```bash
npx prisma validate
```

## 🔄 Updating Schema

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Review generated migration
4. Prisma automatically updates database
5. Types regenerated automatically

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Table doesn't exist" | Run `npx prisma migrate deploy` |
| "Database locked" | Reset with `npx prisma migrate reset` |
| "Type not found" | Run `npx prisma generate` |
| "Foreign key violation" | Check relationships exist |
| "Unique constraint failed" | Check for duplicate values |

## 📚 Files Reference

| File | Purpose | Modified By |
|------|---------|------------|
| prisma/schema.prisma | Data models | Define structure |
| prisma/seed.ts | Sample data | Update test data |
| .env | Configuration | Change DB_URL |
| dev.db | Database | Generated by Prisma |
| lib/prisma.ts | Client | Use in app code |
| migrations/* | History | Auto-generated |

---

**Last Updated:** January 24, 2026
**Prisma Version:** 5.22.0
**Status:** ✅ Complete
