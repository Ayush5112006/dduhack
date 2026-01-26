# Email OTP Verification System - Quick Start

## 🚀 Setup in 5 Steps

### 1️⃣ Install Dependencies
```bash
npm install bcryptjs nodemailer
npm install -D @types/nodemailer
```

### 2️⃣ Configure Gmail
1. Go to [Gmail App Passwords](https://myaccount.google.com/apppasswords)
2. Enable 2-Step Verification if needed
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password

### 3️⃣ Update `.env.local`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dduhack"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="xxxx xxxx xxxx xxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4️⃣ Run Database Migration
```bash
npx prisma migrate dev --name add_email_otp
```

### 5️⃣ Start Development Server
```bash
npm run dev
```

---

## 📍 Test the System

### Registration
```
Visit: http://localhost:3000/auth/register
Enter: name, email, password
Click: Create Account
```

### OTP Verification
```
Check: Email inbox for OTP code
Visit: Verification page (automatically redirected)
Enter: 6-digit OTP code
Click: Verify Email
```

---

## 🔗 Key Files

| File | Purpose |
|------|---------|
| `lib/otp-generator.ts` | Generate & validate OTPs |
| `lib/email-service.ts` | Send emails via Nodemailer |
| `app/api/auth/register/route.ts` | User registration |
| `app/api/auth/verify-otp/route.ts` | OTP verification |
| `app/api/auth/resend-otp/route.ts` | Resend OTP |
| `app/auth/register/page.tsx` | Registration page |
| `app/verify-otp/page.tsx` | OTP verification page |
| `prisma/schema.prisma` | Database schema |

---

## 🎯 API Endpoints

```
POST /api/auth/register
  → Validates input → Creates user → Sends OTP → Returns email

POST /api/auth/verify-otp
  → Validates OTP → Marks email verified → Activates account

POST /api/auth/resend-otp
  → Rate limited (5 min) → Generates new OTP → Sends email
```

---

## ⚡ Key Features

✅ 6-digit OTP with 10-minute expiry
✅ Max 5 verification attempts
✅ 5-minute cooldown for resend
✅ Bcryptjs password hashing
✅ Real-time password strength validation
✅ Email enumeration prevention
✅ Auto-generated welcome emails

---

## 🔐 Security Checklist

- [x] Passwords hashed with bcryptjs (salt rounds: 10)
- [x] OTP deleted after verification
- [x] Rate limiting on resend (5 minutes)
- [x] Attempt limiting on verification (max 5)
- [x] No sensitive data in error messages
- [x] SQL injection prevention (Prisma)
- [x] Email verification required before account activation

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Email not received | Use App Password, not Gmail password |
| OTP verification fails | Check OTP hasn't expired (10 min limit) |
| Database error | Ensure PostgreSQL is running, DATABASE_URL is correct |
| Module not found | Run `npm install` and restart dev server |

---

## 📚 Full Documentation

For complete setup guide with troubleshooting: [OTP_SYSTEM_SETUP_GUIDE.md](OTP_SYSTEM_SETUP_GUIDE.md)

---

## ✅ Production Checklist

Before deploying:
- [ ] Update Gmail credentials to production account
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable HTTPS (required for email)
- [ ] Set `NODE_ENV=production`
- [ ] Configure database backups
- [ ] Add CSRF protection
- [ ] Test with real email addresses
- [ ] Monitor email delivery rates

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
