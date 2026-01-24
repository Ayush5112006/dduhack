# 🎯 Multi-Database System Overview

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     LOGIN PAGE                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Email: demo@example.com                              │   │
│  │ Password: ••••••                                     │   │
│  │ Role: [Participant ▼]                               │   │
│  │       • Participant / Student                        │   │
│  │       • Organizer                                    │   │
│  │       • Admin                                        │   │
│  │ [Login Button]                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              API LOGIN ENDPOINT                             │
│  POST /api/auth/login                                       │
│  {                                                          │
│    email: "demo@example.com",                              │
│    password: "demo123",                                    │
│    role: "participant"                                     │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           ROLE-BASED DATABASE SELECTION                     │
│  getPrismaClient("participant")  → DATABASE_URL_STUDENT    │
│  getPrismaClient("organizer")    → DATABASE_URL_ORGANIZER  │
│  getPrismaClient("admin")        → DATABASE_URL_ADMIN      │
└─────────────────────────────────────────────────────────────┘
                            ↓
            ┌───────────────┼───────────────┐
            ↓               ↓               ↓
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │  STUDENT DB  │  │ ORGANIZER DB │  │  ADMIN DB    │
   ├──────────────┤  ├──────────────┤  ├──────────────┤
   │ Users        │  │ Users        │  │ Users        │
   │ Sessions     │  │ Sessions     │  │ Sessions     │
   │ Profiles     │  │ Hackathons   │  │ All models   │
   │ Registrations│  │ Registrations│  │ Audit logs   │
   │ Submissions  │  │ Teams        │  │ Settings     │
   │ Teams        │  │ Submissions  │  │              │
   │ Certificates │  │              │  │              │
   └──────────────┘  └──────────────┘  └──────────────┘
            ↑               ↑               ↑
            └───────────────┼───────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            CREATE SESSION & SET COOKIE                      │
│  Session stored in role-specific database                   │
│  Cookie sent back to client (httpOnly, secure)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          USER REDIRECTED TO DASHBOARD                       │
│  /dashboard         ← for Participant/Student              │
│  /organizer/dashboard ← for Organizer                       │
│  /admin/dashboard     ← for Admin                           │
│  /judge/dashboard     ← for Judge                           │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Login Flow
```
User Input → Validation → Role Selection → Database Lookup
                                               ↓
                                    User Found/Not Found
                                               ↓
                                    Password Verification
                                               ↓
                                    Status Check (Active)
                                               ↓
                                    Create Session
                                               ↓
                                    Set Secure Cookie
                                               ↓
                                    Redirect to Dashboard
```

### Session Validation Flow
```
Request with Cookie → Extract Token → Check Expiry
                                          ↓
                               Session Valid/Invalid
                                          ↓
                            Query Role-Specific DB
                                          ↓
                            Return User with Role
                                          ↓
                          Request Processed/Denied
```

## File Organization

```
dduhack/
├── lib/
│   ├── prisma.ts ..................... Original (for fallback)
│   ├── prisma-multi-db.ts ............ NEW: Multi-database manager
│   ├── session.ts .................... UPDATED: Role-aware sessions
│   └── ...
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── login/
│   │           └── route.ts ......... UPDATED: Role-based DB selection
│   └── auth/
│       └── login/
│           └── page.tsx ............. UPDATED: Sends role
├── QUICK_START_MULTI_DB.md .......... Quick setup guide
├── MULTI_DATABASE_SETUP.md .......... Detailed setup guide
├── MULTI_DATABASE_IMPLEMENTATION.md . Technical details
├── IMPLEMENTATION_COMPLETE.md ....... Completion summary
└── .env.example ..................... Configuration template
```

## Configuration Layers

```
┌─────────────────────────────────┐
│    .env.local / Environment     │  (Top Priority)
│  DATABASE_URL_STUDENT           │
│  DATABASE_URL_ORGANIZER         │
│  DATABASE_URL_ADMIN             │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│   getPrismaClient(role)         │  (Router)
│   - Checks role parameter       │
│   - Selects appropriate client  │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│   Fallback DATABASE_URL         │  (Default)
│   (if role-specific not set)    │
└─────────────────────────────────┘
```

## Security Model

```
┌──────────────────────────────────────────────────┐
│         ROLE-BASED ISOLATION                     │
├──────────────────────────────────────────────────┤
│ Student Database                                 │
│   ├─ Can ONLY access Student DB                 │
│   ├─ Cannot read Admin or Organizer data        │
│   └─ Limited to own user data                   │
├──────────────────────────────────────────────────┤
│ Organizer Database                              │
│   ├─ Can ONLY access Organizer DB              │
│   ├─ Cannot read Admin or Student data         │
│   └─ Can manage hackathons                      │
├──────────────────────────────────────────────────┤
│ Admin Database                                  │
│   ├─ Can ONLY access Admin DB                 │
│   ├─ Cannot read Student or Organizer data    │
│   └─ Full system access (within admin scope)   │
└──────────────────────────────────────────────────┘
```

## Development vs Production

```
┌─────────────────────────────────────┐
│    DEVELOPMENT (SQLite)             │
│  ┌───────────────────────────────┐  │
│  │ file:./prisma/student.db      │  │
│  │ file:./prisma/organizer.db    │  │
│  │ file:./prisma/admin.db        │  │
│  └───────────────────────────────┘  │
│  Fast, Local, No Setup Required     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    PRODUCTION (PostgreSQL/MySQL)    │
│  ┌───────────────────────────────┐  │
│  │ cloud.db.provider/student_db  │  │
│  │ cloud.db.provider/organizer_db│  │
│  │ cloud.db.provider/admin_db    │  │
│  └───────────────────────────────┘  │
│  Scalable, Secure, Managed          │
└─────────────────────────────────────┘
```

## Feature Matrix

| Feature | Description |
|---------|-------------|
| 🔐 **Data Isolation** | Complete database separation by role |
| 🔄 **Session Management** | Role-aware session tracking |
| 📱 **Role Selection** | User chooses role at login |
| 🗄️ **Multi-DB Support** | SQLite, PostgreSQL, MySQL |
| ⚡ **Fallback URL** | Uses `DATABASE_URL` if role-specific not set |
| 🔀 **Automatic Routing** | API automatically routes to correct DB |
| 📊 **Query Flexibility** | Use standard Prisma syntax |
| 🔍 **Session Lookup** | Checks all DBs for session token |
| 🚀 **Production Ready** | Supports cloud database services |
| 🔧 **Backward Compatible** | Works with existing code patterns |

## Implementation Checklist

- [x] Create `lib/prisma-multi-db.ts` with database client manager
- [x] Update `lib/session.ts` for role-aware session management
- [x] Update login API route to use role-based database selection
- [x] Update login page to send role parameter
- [x] Create configuration template (`.env.example`)
- [x] Write setup guide (`MULTI_DATABASE_SETUP.md`)
- [x] Write implementation guide (`MULTI_DATABASE_IMPLEMENTATION.md`)
- [x] Write quick start guide (`QUICK_START_MULTI_DB.md`)
- [x] Fix TypeScript compilation errors
- [x] Commit changes to git

## Quick Reference

### Environment Variables
```bash
DATABASE_URL="..."                    # Fallback
DATABASE_URL_STUDENT="..."           # Student DB
DATABASE_URL_ORGANIZER="..."         # Organizer DB
DATABASE_URL_ADMIN="..."             # Admin DB
```

### Getting Database Client
```typescript
import { getPrismaClient } from "@/lib/prisma-multi-db"
const db = getPrismaClient("participant") // or "organizer", "admin"
```

### Session Info
```typescript
import { getSession } from "@/lib/session"
const session = await getSession() // includes userRole
```

---

**Status**: ✅ Implementation Complete
**Next Step**: Configure databases and run migrations
