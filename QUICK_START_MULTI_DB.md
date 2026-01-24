# Quick Start: Multi-Database Setup

## What's New? 
Your application now supports **separate databases for Student, Admin, and Organizer roles**.

## 1️⃣ Configure Environment Variables

Create `.env.local` in your project root:

```env
# Fallback database (used if role-specific URLs are not set)
DATABASE_URL="file:./prisma/dev.db"

# Role-specific databases
DATABASE_URL_STUDENT="file:./prisma/student.db"
DATABASE_URL_ORGANIZER="file:./prisma/organizer.db"
DATABASE_URL_ADMIN="file:./prisma/admin.db"
```

## 2️⃣ Run Migrations

```bash
npx prisma migrate dev --name init
```

This will create all three databases with the complete schema.

## 3️⃣ Start Your App

```bash
npm run dev
# or
pnpm dev
```

## 4️⃣ Test Login

1. Go to **http://localhost:3000/auth/login**
2. Select **"Participant / Student"** from the dropdown
3. Click **"Demo Login"** button
4. You'll be logged into the **Student database**
5. Repeat with different roles to test

## 🔄 How It Works

- **Login page** lets users select their role
- **Backend** selects the appropriate database based on role
- **Sessions** are stored in the role-specific database
- **Data** is completely isolated per role

## 📊 Database URLs

### For Development (SQLite - Default)
Already configured. Just run migrations.

### For Production (PostgreSQL)
```env
DATABASE_URL_STUDENT="postgresql://user:password@db.example.com/student_db"
DATABASE_URL_ORGANIZER="postgresql://user:password@db.example.com/organizer_db"
DATABASE_URL_ADMIN="postgresql://user:password@db.example.com/admin_db"
```

### For Production (MySQL)
```env
DATABASE_URL_STUDENT="mysql://user:password@db.example.com/student_db"
DATABASE_URL_ORGANIZER="mysql://user:password@db.example.com/organizer_db"
DATABASE_URL_ADMIN="mysql://user:password@db.example.com/admin_db"
```

## 📚 Files Changed

### New Files:
- **`lib/prisma-multi-db.ts`** - Multi-database client management
- **`MULTI_DATABASE_SETUP.md`** - Complete setup guide
- **`MULTI_DATABASE_IMPLEMENTATION.md`** - Implementation details
- **`.env.example`** - Environment configuration template

### Modified Files:
- **`lib/session.ts`** - Now uses role-specific databases
- **`app/api/auth/login/route.ts`** - Queries from role-specific database
- **`app/auth/login/page.tsx`** - Sends role with login request

## ⚠️ Important Notes

- Existing user data won't be transferred automatically
- Each role has its own isolated database
- Admins cannot access student data and vice versa
- For production, use cloud databases (Planetscale, Railway, etc.)

## 🔧 Troubleshooting

**Error: "Database file not found"**
- Run: `npx prisma migrate dev`

**Error: "Cannot read property 'create' of undefined"**
- Ensure all three database files/URLs are accessible

**Sessions not working**
- Verify session records are in the correct role database

## 📖 Learn More

- See [MULTI_DATABASE_SETUP.md](./MULTI_DATABASE_SETUP.md) for detailed guide
- See [MULTI_DATABASE_IMPLEMENTATION.md](./MULTI_DATABASE_IMPLEMENTATION.md) for architecture details

## 💡 Next Steps

1. ✅ Configure `.env.local` 
2. ✅ Run migrations
3. ✅ Test login with different roles
4. ✅ Create user accounts for each role
5. ✅ Deploy to production with cloud databases
