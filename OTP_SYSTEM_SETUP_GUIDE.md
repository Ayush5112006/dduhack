# 🔐 Email OTP Verification System - Setup Guide

A complete, production-ready Email OTP verification system for Next.js 14 (App Router) with Prisma + PostgreSQL.

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Installation & Setup](#installation--setup)
4. [Environment Variables](#environment-variables)
5. [Database Migrations](#database-migrations)
6. [API Endpoints](#api-endpoints)
7. [Frontend Pages](#frontend-pages)
8. [Security Features](#security-features)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## ✨ Features

✅ **6-digit OTP Generation** - Cryptographically secure random OTP
✅ **Email Delivery** - HTML-styled emails via Nodemailer + Gmail SMTP
✅ **10-minute Expiry** - Automatic OTP expiration
✅ **Rate Limiting** - Max 5 verification attempts, 5-minute resend cooldown
✅ **Account Blocking** - Users can't login until email verified
✅ **Attempt Tracking** - Failed attempts counter with user feedback
✅ **Resend OTP** - Request new OTP without email leakage
✅ **Welcome Email** - Sent after successful verification
✅ **Password Strength** - Real-time validation with feedback
✅ **Type-Safe** - Full TypeScript support

---

## 🧱 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **ORM**: Prisma + PostgreSQL
- **Email**: Nodemailer with Gmail SMTP
- **Password Hashing**: bcryptjs
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

---

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install bcryptjs nodemailer
npm install -D @types/nodemailer
```

### 2. Update `.env.local`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dduhack"

# Email (Gmail SMTP)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Generate Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords** (in Security section)
4. Select "Mail" and "Windows Computer"
5. Copy the generated 16-character password
6. Paste it in `.env.local` as `EMAIL_PASS`

> ⚠️ **Important**: Do NOT use your regular Gmail password. Always use App Password.

---

## 🗄️ Database Migrations

### 1. Update Prisma Schema

The schema has already been updated with:
- `EmailOTP` model for OTP storage
- `emailVerified` field on User model
- Indexes for performance

### 2. Run Migrations

```bash
# Generate migration
npx prisma migrate dev --name add_email_otp

# Or push to database directly (development only)
npx prisma db push
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Verify Schema

```bash
npx prisma studio  # Opens visual DB editor
```

---

## 📡 API Endpoints

### POST `/api/auth/register`

Registers a new user and sends OTP.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful! OTP sent to your email.",
  "email": "john@example.com"
}
```

**Error Responses:**
- `400` - Invalid email/password format or missing fields
- `409` - Email already registered
- `500` - Server error (email service down)

---

### POST `/api/auth/verify-otp`

Verifies OTP and activates account.

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! Your account is now active.",
  "user": {
    "id": "user123",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400` - Invalid OTP format
- `401` - Wrong OTP (includes remaining attempts)
- `404` - User/OTP not found
- `410` - OTP expired
- `429` - Too many attempts

---

### POST `/api/auth/resend-otp`

Sends a new OTP to user's email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please check your inbox and spam folder."
}
```

**Error Responses:**
- `400` - Email not provided
- `429` - Rate limited (wait 5 minutes before resending)
- `500` - Email service failure

> **Security Note**: Never reveals if email exists or is verified. Returns 200 even if email not found.

---

## 🌐 Frontend Pages

### Registration Page (`/auth/register`)

```
┌─────────────────────────────┐
│        🎯 HackHub           │
│     Create Your Account     │
├─────────────────────────────┤
│ Full Name: [___________]    │
│ Email:     [___________]    │
│ Password:  [___________] 👁️│
│   └─ Strength: ████░░░ Fair│
│ Confirm:   [___________] 👁️│
│ [Create Account]            │
│ Already have account? Sign in│
└─────────────────────────────┘
```

**Features:**
- Real-time password strength indicator
- Password visibility toggle
- Email validation
- Form error handling

### OTP Verification Page (`/verify-otp?email=...`)

```
┌─────────────────────────────┐
│        🎯 HackHub           │
│      Email Verification     │
├─────────────────────────────┤
│ Verifying: john@email.com   │
│ ⏰ Time: 09:45             │
│ [_] [_] [_] [_] [_] [_]    │
│ [Verify Email]              │
│ Resend OTP                  │
│ Wrong email? Register again │
└─────────────────────────────┘
```

**Features:**
- 6-digit OTP input with auto-focus
- Live countdown timer
- Attempt counter
- Resend button with cooldown
- Success animation

---

## 🔐 Security Features

### 1. **OTP Security**
- 6-digit numeric OTP (1 million possible combinations)
- 10-minute expiration
- Deleted after successful verification
- Cannot be reused after verification

### 2. **Password Security**
- bcryptjs with salt rounds: 10
- Minimum 8 characters required
- Must include uppercase, lowercase, number, special character
- Never stored in plain text

### 3. **Rate Limiting**
- Max 5 verification attempts per OTP
- 5-minute cooldown between resend requests
- Automatic OTP deletion after expiration

### 4. **Email Privacy**
- Resend OTP endpoint doesn't reveal if email exists
- Failed verification doesn't expose email status
- No sensitive data in error messages

### 5. **Database Security**
- Indexes on frequently queried fields
- OTP deleted immediately after verification
- User account locked until email verified

### 6. **API Security**
- Input validation on all endpoints
- SQL injection prevention (Prisma)
- CSRF protection (configure in middleware)
- Environment variables for secrets

---

## 🧪 Testing

### 1. Test Registration Flow

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### 2. Check OTP in Database

```bash
npx prisma studio
# Navigate to EmailOTP table
```

### 3. Test Verification

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### 4. Development Mode OTP Logging

In development, OTP is logged to console:
```
✅ OTP email sent to test@example.com
```

Check server logs for the OTP.

---

## 🐛 Troubleshooting

### Email Not Sending

**Problem**: OTP email not received

**Solutions**:
1. ✅ Verify `EMAIL_USER` and `EMAIL_PASS` in `.env.local`
2. ✅ Check Gmail [Less Secure Apps](https://myaccount.google.com/security) is enabled
3. ✅ Use [App Password](https://myaccount.google.com/apppasswords), not Gmail password
4. ✅ Check spam/trash folder
5. ✅ Restart dev server: `npm run dev`

**Debug**: Add this to `lib/email-service.ts` startup:
```typescript
if (process.env.NODE_ENV === "development") {
  verifyEmailService()
}
```

---

### OTP Verification Fails

**Problem**: "Invalid OTP" error even with correct code

**Solutions**:
1. ✅ Check OTP hasn't expired (10 minutes)
2. ✅ Verify no extra spaces in OTP input
3. ✅ Check database OTP value matches
4. ✅ Ensure email case matches (normalized to lowercase)

**Debug**:
```bash
# Check OTP in database
SELECT email, otp, expiresAt, attempts FROM "EmailOTP" 
WHERE email = 'user@example.com';
```

---

### Database Connection Error

**Problem**: `PrismaClientInitializationError`

**Solutions**:
1. ✅ Verify `DATABASE_URL` in `.env.local`
2. ✅ PostgreSQL server is running
3. ✅ Database exists
4. ✅ User has permissions

```bash
# Test connection
npx prisma db execute --stdin < /dev/null
```

---

### Password Hash Error

**Problem**: bcryptjs module not found

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Or install specifically
npm install bcryptjs
```

---

## 📦 File Structure

```
app/
├── api/auth/
│   ├── register/route.ts          # Registration API
│   ├── verify-otp/route.ts        # OTP verification API
│   └── resend-otp/route.ts        # Resend OTP API
├── auth/
│   └── register/page.tsx          # Registration page
└── verify-otp/page.tsx            # OTP verification page

lib/
├── otp-generator.ts               # OTP utilities
├── email-service.ts               # Nodemailer config
└── prisma.ts                       # Prisma client

prisma/
└── schema.prisma                  # Updated with EmailOTP model
```

---

## 🔧 Advanced Configuration

### Custom OTP Expiry Time

In `lib/otp-generator.ts`:
```typescript
export function getOTPExpirationTime(minutesFromNow: number = 15): Date {
  // Change 10 to 15 for 15-minute expiry
```

### Custom Attempt Limit

In `app/api/auth/verify-otp/route.ts`:
```typescript
const MAX_ATTEMPTS = 10  // Increase from 5
```

### Custom Email Template

Edit HTML template in `lib/email-service.ts` function `getOTPEmailTemplate()`

---

## 📚 References

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Nodemailer Guide](https://nodemailer.com/smtp/gmail/)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)

---

## ✅ Checklist Before Production

- [ ] Update `EMAIL_USER` and `EMAIL_PASS` to production Gmail account
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable HTTPS (required for email)
- [ ] Add CSRF protection middleware
- [ ] Set up database backups
- [ ] Configure email rate limits higher if needed
- [ ] Add monitoring/logging for failed verifications
- [ ] Test with real email addresses
- [ ] Set `NODE_ENV=production`
- [ ] Enable database connection pooling

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review API endpoint responses
3. Check server logs in terminal
4. Verify all environment variables are set

---

**Last Updated**: January 2026
**Version**: 1.0.0 (Production Ready)
