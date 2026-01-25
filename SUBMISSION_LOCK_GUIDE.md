# Submission Lock System - Quick Start Guide

## What Was Implemented

A complete **Submission Lock System** that:
- ✅ Prevents submissions after hackathon deadline
- ✅ Allows admins to manually lock/unlock submissions  
- ✅ Shows user-friendly lock status messages
- ✅ Tracks lock timestamp and reason
- ✅ Protects submission endpoints from locked submissions

---

## Quick Reference

### For Users
- **Before Deadline:** Can submit projects normally
- **After Deadline:** "Submission Closed" message appears
- **If Locked by Admin:** Red lock alert displayed with reason

### For Admins
- **Lock Submission:** AdminSubmissionManager → View & Update → Lock Submission button
- **Unlock Submission:** Same dialog → Unlock Submission button
- **Set Reason:** Enter reason before locking (e.g., "Duplicate submission", "Late submission")

---

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema with lock fields |
| `lib/submission-utils.ts` | Utility functions for lock checking |
| `components/submissions/submission-lock-status.tsx` | Lock status UI component |
| `components/submissions/submission-form.tsx` | User submission form (integrated) |
| `components/submissions/admin-submission-manager.tsx` | Admin controls (integrated) |
| `app/api/hackathons/[id]/submissions/route.ts` | Submission creation (deadline check added) |
| `app/api/admin/hackathons/[id]/submissions/[submissionId]/lock/route.ts` | Lock API endpoint |

---

## Database Changes

Three new fields on `Submission` model:
```
locked: Boolean @default(false)    // Is submission locked?
lockedAt: DateTime?                // When was it locked?
lockedReason: String?              // Why was it locked?
```

**Migration file:** `prisma/migrations/20260125030811_add_submission_lock_fields/migration.sql`

---

## How to Use

### Step 1: Apply Database Migration
```bash
npx prisma migrate dev
npx prisma generate
```

### Step 2: Test Deadline Lock
1. Create a hackathon with end date in the past
2. Try to submit a project
3. You should see "Submission Deadline Passed" message

### Step 3: Test Admin Lock
1. Go to admin dashboard
2. Find a submission in AdminSubmissionManager
3. Click "View & Update"
4. Scroll to "Submission Lock" section
5. Click "Lock Submission"
6. Enter a reason (optional)
7. Submission is now locked

### Step 4: Test Unlock
1. In the same modal
2. Click "Unlock Submission"
3. Submission is now unlocked

---

## API Endpoints

### Lock a Submission (Admin Only)
```
PUT /api/admin/hackathons/{hackathonId}/submissions/{submissionId}/lock

Request Body:
{
  "locked": true,
  "lockedReason": "Duplicate submission"
}

Response:
{
  "id": "...",
  "locked": true,
  "lockedAt": "2025-01-25T10:30:00Z",
  "lockedReason": "Duplicate submission",
  ...
}
```

### Unlock a Submission
```
PUT /api/admin/hackathons/{hackathonId}/submissions/{submissionId}/lock

Request Body:
{
  "locked": false
}

Response:
{
  "id": "...",
  "locked": false,
  "lockedAt": null,
  "lockedReason": null,
  ...
}
```

### Submit Project (Deadline Check)
```
POST /api/hackathons/{hackathonId}/submissions

Response if locked:
{
  "error": "Submission deadline has passed for this hackathon"
}
Status: 403
```

---

## Features Included

### 1. Automatic Deadline Locking
- Submissions blocked after `hackathon.endDate`
- User sees clear "Submission Closed" message
- Form is disabled and unclickable

### 2. Manual Admin Locking
- Admins can lock any submission at any time
- Optional lock reason (displayed to user)
- Lock timestamp recorded

### 3. Lock Status Display
- Red alert card when locked
- Shows lock reason
- Shows when it was locked

### 4. Deadline Warnings
- Yellow warning if <24 hours remain
- Orange warning if <1 hour remains
- Blue informational if >24 hours

### 5. API Protection
- Submission creation blocked if locked
- Proper HTTP status codes (403, 401, 404)
- Authentication checks on admin endpoints

---

## Component Props

### SubmissionForm
```typescript
<SubmissionForm
  hackathonId="hackathon-123"
  hackathonTitle="TechHack 2025"
  isAuthenticated={true}
  isRegistered={true}
  hackathonEndDate={new Date("2025-01-31")} // NEW!
  teamMode={false}
/>
```

### SubmissionLockStatus
```typescript
<SubmissionLockStatus
  locked={true}
  lockedReason="admin"
  deadlineText="Custom message..."
/>
```

### DeadlineCountdown
```typescript
<DeadlineCountdown
  hackathon={hackathonObject}
/>
```

---

## Testing Commands

```bash
# Check database schema
npx prisma studio

# View migrations
ls prisma/migrations

# Regenerate client
npx prisma generate

# Build project
npm run build
```

---

## Error Handling

### User submits after deadline
```
Response: 403 Forbidden
Body: { "error": "Submission deadline has passed for this hackathon" }
```

### Unauthorized admin access
```
Response: 401 Unauthorized
Body: { "error": "Unauthorized" }
```

### Submission not found
```
Response: 404 Not Found
Body: { "error": "Submission not found" }
```

---

## What's Next?

1. ✅ Database schema updated
2. ✅ Utility functions created
3. ✅ Components integrated
4. ✅ API endpoints created
5. **TODO:** Test with actual hackathons
6. **TODO:** Add email notifications when locked
7. **TODO:** Add audit log for lock/unlock actions
8. **TODO:** Create locked submission appeals process

---

## Support

For issues or questions:
1. Check the migration was applied: `npx prisma migrate status`
2. Verify schema: `npx prisma studio`
3. Check browser console for errors
4. Check server logs for API errors

