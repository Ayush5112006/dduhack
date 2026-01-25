# Submission Lock System Implementation

## Overview
A complete submission locking system has been implemented to prevent submissions after a hackathon deadline and allow administrators to manually lock/unlock individual submissions.

## Components Implemented

### 1. **Database Schema Updates** ✅
**File:** `prisma/schema.prisma`

Added three new fields to the `Submission` model:
```typescript
locked: Boolean @default(false)              // Explicit lock flag
lockedAt: DateTime?                          // Timestamp when submission was locked
lockedReason: String?                        // Reason for lock (e.g., "admin", "deadline")
```

**Migration:** `20260125030811_add_submission_lock_fields`
- Run `npx prisma migrate dev` to apply schema changes
- Run `npx prisma generate` to regenerate Prisma client

---

### 2. **Utility Functions** ✅
**File:** `lib/submission-utils.ts`

Three new utility functions for lock management:

#### `isSubmissionLocked(submission, hackathon?): boolean`
Checks if a submission is locked by either:
- Explicit admin lock (submission.locked === true)
- Deadline has passed (hackathon.endDate < now)

#### `getSubmissionLockReason(submission, hackathon?): string`
Returns a human-readable explanation for why a submission is locked:
- "Submission locked by administrator" (explicit lock)
- "Submission deadline has passed" (deadline-based lock)

#### `getTimeUntilDeadline(hackathon?): { remaining: number; formatted: string } | null`
Calculates time remaining until submission deadline:
- Returns `null` if no deadline exists
- Returns object with:
  - `remaining`: milliseconds until deadline
  - `formatted`: human-readable format (e.g., "2 days 3 hours")

---

### 3. **Lock Status Display Component** ✅
**File:** `components/submissions/submission-lock-status.tsx`

#### `SubmissionLockStatus` Component
Displays a red alert card when submission is locked:
- Shows lock icon and "Submission Locked" heading
- Displays custom deadline text or default message
- Shows lock reason (e.g., "Locked by administrator")
- Displays "Locked" badge

**Props:**
```typescript
interface SubmissionLockStatusProps {
  submission?: any
  hackathon?: any
  locked: boolean                    // Is submission locked?
  lockedReason?: string             // Reason for lock
  deadlineText?: string             // Custom message text
}
```

#### `DeadlineCountdown` Component
Shows a color-coded deadline warning:
- **Blue card:** Normal (>24 hours remaining)
- **Orange card:** Urgent (<24 hours remaining)
- **Hidden:** When deadline has passed

**Props:**
```typescript
interface DeadlineCountdownProps {
  hackathon?: any
}
```

---

### 4. **Submission Form Integration** ✅
**File:** `components/submissions/submission-form.tsx`

**Updates:**
- Added `hackathonEndDate` prop to `SubmissionFormProps`
- Added `isLocked` state that checks deadline on dialog open
- Disabled submit button if deadline has passed
- Displays `SubmissionLockStatus` component when locked
- Shows locked message instead of form when submission is locked
- Integrates with deadline checking on mount

**Key Changes:**
```typescript
// Check lock status on dialog open
useEffect(() => {
  if (hackathonEndDate) {
    const now = new Date()
    const endDate = new Date(hackathonEndDate)
    setIsLocked(now > endDate)
  }
}, [hackathonEndDate, open])

// Show lock status if locked
{isLocked && (
  <SubmissionLockStatus locked={true} deadlineText="..." />
)}

// Conditionally render form or lock message
{!isLocked ? (
  <form>...</form>
) : (
  <div>Submission Closed</div>
)}
```

---

### 5. **Admin Lock/Unlock API Endpoint** ✅
**File:** `app/api/admin/hackathons/[id]/submissions/[submissionId]/lock/route.ts`

**Endpoint:** `PUT /api/admin/hackathons/[id]/submissions/[submissionId]/lock`

**Features:**
- Admin-only authentication check
- Updates submission lock fields:
  - `locked`: true/false
  - `lockedAt`: timestamp or null
  - `lockedReason`: reason or null
- Returns updated submission object
- Proper error handling (401, 404, 500)

**Request Body:**
```typescript
{
  locked: boolean,        // Lock or unlock submission
  lockedReason: string   // Reason for lock (optional)
}
```

**Response:**
```typescript
{
  id: string,
  locked: boolean,
  lockedAt: Date | null,
  lockedReason: string | null,
  ... // Other submission fields
}
```

---

### 6. **Admin Submission Manager Integration** ✅
**File:** `components/submissions/admin-submission-manager.tsx`

**Updates:**
- Added `locked`, `lockedAt`, `lockedReason` to Submission interface
- Added lock state management (isLocked, lockReason, isTogglingLock)
- Added `handleToggleLock()` function to call lock API
- New "Submission Lock" section in detail modal with:
  - Lock status indicator (🔒 Locked / 🔓 Unlocked)
  - Lock reason input field
  - "Lock Submission" / "Unlock Submission" button
  - Timestamp of when locked

**Lock Controls UI:**
```
┌─────────────────────────────────┐
│ Submission Lock                 │
├─────────────────────────────────┤
│ Lock Status: 🔒 This submission │
│             is locked           │
│ Locked at: 2025-01-25 10:30 AM │
│                                 │
│ Lock Reason:                    │
│ [____________________]          │
│                                 │
│ [  Unlock Submission  ]         │
└─────────────────────────────────┘
```

---

### 7. **Submission Endpoint Protection** ✅
**File:** `app/api/hackathons/[id]/submissions/route.ts`

**Updates:**
- Added deadline check before allowing submission
- Imported `isSubmissionLocked` utility
- Returns 403 error if:
  - Hackathon endDate has passed
  - Submission would be locked

**Error Response:**
```json
{
  "error": "Submission deadline has passed for this hackathon"
}
```

---

## How It Works

### Scenario 1: User Submitting Before Deadline
1. User opens submission form
2. `SubmissionForm` checks `hackathonEndDate`
3. If `now < endDate`, form is enabled
4. User submits project
5. API accepts submission (deadline check passes)
6. Submission is created with `status: "submitted"`

### Scenario 2: User Submitting After Deadline
1. User opens submission form
2. `SubmissionForm` checks `hackathonEndDate`
3. If `now > endDate`, `isLocked` is set to true
4. Submit button is disabled
5. Lock status message is displayed
6. User cannot submit (button disabled)
7. If they try via API, they get 403 error

### Scenario 3: Admin Locks Submission
1. Admin opens AdminSubmissionManager
2. Admin clicks "View & Update" on a submission
3. Admin clicks "Lock Submission" button
4. `handleToggleLock()` calls PUT API endpoint
5. API updates: `locked=true`, `lockedAt=now`, `lockedReason="admin"`
6. Submission card shows locked status
7. User cannot edit submission anymore

### Scenario 4: Admin Unlocks Submission
1. Admin clicks "Unlock Submission" button
2. API updates: `locked=false`, `lockedAt=null`, `lockedReason=null`
3. If deadline hasn't passed, user can submit again

---

## Database Migration

Run the migration to apply schema changes:

```bash
# Apply migration
npx prisma migrate dev

# Or push schema directly (development only)
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

The migration creates the `locked`, `lockedAt`, and `lockedReason` columns on the `Submission` table.

---

## Testing Checklist

- [ ] Migration applied successfully
- [ ] Database schema updated with lock fields
- [ ] User can submit before deadline
- [ ] User sees "Submission Closed" after deadline
- [ ] User cannot submit after deadline (gets 403 error)
- [ ] Admin can lock submission via AdminSubmissionManager
- [ ] Lock status shows correctly in admin panel
- [ ] Admin can unlock submission
- [ ] Lock reason is saved and displayed
- [ ] Lock timestamp is recorded
- [ ] Form displays SubmissionLockStatus component when locked
- [ ] DeadlineCountdown shows correct colors based on remaining time

---

## API Endpoints Summary

### User Submissions
- **POST** `/api/hackathons/[id]/submissions` - Create submission (blocks if deadline passed)
- **GET** `/api/hackathons/[id]/submissions` - Get user's submission for hackathon

### Admin Submission Management
- **GET** `/api/admin/hackathons/[id]/submissions` - List all submissions
- **PUT** `/api/admin/hackathons/[id]/submissions/[submissionId]` - Update status/score/feedback
- **PUT** `/api/admin/hackathons/[id]/submissions/[submissionId]/lock` - Lock/unlock submission

---

## File Changes Summary

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added 3 lock fields to Submission model |
| `lib/submission-utils.ts` | Added 3 utility functions |
| `components/submissions/submission-lock-status.tsx` | Created new component |
| `components/submissions/submission-form.tsx` | Integrated lock checking & display |
| `components/submissions/admin-submission-manager.tsx` | Added lock controls |
| `app/api/hackathons/[id]/submissions/route.ts` | Added deadline check |
| `app/api/admin/hackathons/[id]/submissions/[submissionId]/lock/route.ts` | Created new endpoint |
| `prisma/migrations/20260125030811_...` | Migration file |

---

## Notes

1. **Deadline Checking:** The system checks both `locked` flag and `endDate` to determine if submission is locked
2. **Lock Reason:** Can be "admin" for manual locks or "deadline" for automatic locks
3. **Admin Only:** Lock/unlock operations require admin authentication
4. **User Friendly:** Clear messages inform users why submissions are locked
5. **Rollback Safe:** Migration is reversible if needed

