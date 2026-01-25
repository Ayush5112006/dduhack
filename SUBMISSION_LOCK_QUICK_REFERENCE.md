# Submission Lock System - Quick Reference Card

## 🔒 What Was Built

A complete system to **prevent submissions after deadline** and let **admins lock/unlock submissions**.

---

## 📋 Files Changed (Quick Reference)

| File | Action | What Changed |
|------|--------|-------------|
| `prisma/schema.prisma` | ✏️ Modified | Added 3 lock fields to Submission |
| `lib/submission-utils.ts` | ✏️ Modified | Added 3 utility functions |
| `components/submissions/submission-lock-status.tsx` | ➕ Created | New lock status UI component |
| `components/submissions/submission-form.tsx` | ✏️ Modified | Integrated lock checking |
| `components/submissions/admin-submission-manager.tsx` | ✏️ Modified | Added lock/unlock controls |
| `app/api/hackathons/[id]/submissions/route.ts` | ✏️ Modified | Added deadline check |
| `app/api/admin/hackathons/[id]/submissions/[submissionId]/lock/route.ts` | ➕ Created | New lock API endpoint |
| `prisma/migrations/20260125030811_...` | ➕ Created | Database migration |

---

## 🚀 Quick Start

### 1. Apply Database Migration
```bash
npx prisma migrate dev
npx prisma generate
```

### 2. That's it! 🎉
- Update hackathonEndDate prop on SubmissionForm
- Use AdminSubmissionManager for lock controls
- Lock checking happens automatically

---

## 🎯 Key Functions

### Check if Locked
```typescript
import { isSubmissionLocked } from '@/lib/submission-utils'

const locked = isSubmissionLocked(submission, hackathon)
```

### Get Lock Reason
```typescript
import { getSubmissionLockReason } from '@/lib/submission-utils'

const reason = getSubmissionLockReason(submission, hackathon)
// Returns: "Submission deadline has passed" or "Locked by administrator"
```

### Get Deadline Countdown
```typescript
import { getTimeUntilDeadline } from '@/lib/submission-utils'

const deadline = getTimeUntilDeadline(hackathon)
// Returns: { remaining: 86400000, formatted: "1 day" }
```

---

## 🖼️ UI Components

### SubmissionLockStatus
```tsx
<SubmissionLockStatus
  locked={true}
  lockedReason="admin"
  deadlineText="Custom message"
/>
```
Shows red alert when submission is locked

### DeadlineCountdown
```tsx
<DeadlineCountdown hackathon={hackathon} />
```
Shows deadline warning with color coding

---

## 🔌 API Endpoints

### Lock a Submission (Admin)
```
PUT /api/admin/hackathons/{id}/submissions/{id}/lock
Body: { "locked": true, "lockedReason": "Duplicate" }
```

### Unlock a Submission (Admin)
```
PUT /api/admin/hackathons/{id}/submissions/{id}/lock
Body: { "locked": false }
```

### Submit Project
```
POST /api/hackathons/{id}/submissions
Returns 403 if deadline passed
```

---

## 🎮 User Experience

### Before Deadline
```
[Submit Project] ← Enabled button
Form fully functional
No warnings
```

### After Deadline
```
[Submission Deadline Passed] ← Disabled button
🔒 Submission Locked
This hackathon has reached its submission deadline
```

### Admin Locked
```
[Submission Deadline Passed] ← Disabled button
🔒 Submission Locked
Reason: Duplicate submission
```

---

## 🛠️ Admin Controls

In AdminSubmissionManager → View & Update:

```
┌─────────────────────────┐
│ Submission Lock         │
├─────────────────────────┤
│ 🔒 Locked               │
│ Locked: 2025-01-25      │
│                         │
│ Reason: [_________]     │
│                         │
│ [Unlock Submission]     │
└─────────────────────────┘
```

---

## 🔑 Key Props

### SubmissionForm (NEW)
```typescript
<SubmissionForm
  hackathonEndDate={hackathon.endDate} // ← NEW!
  {...otherProps}
/>
```

### SubmissionLockStatus
```typescript
interface SubmissionLockStatusProps {
  locked: boolean          // Is locked?
  lockedReason?: string    // Why locked?
  deadlineText?: string    // Custom message
}
```

---

## ⚙️ Configuration

### Database Fields
```
Submission.locked: Boolean @default(false)
Submission.lockedAt: DateTime?
Submission.lockedReason: String?
```

### Lock Triggers
- **Automatic:** After hackathon endDate
- **Manual:** Admin clicks "Lock Submission"

---

## 🧪 Test It

### Test Deadline Lock
1. Create hackathon with past endDate
2. Try to submit
3. See "Submission Deadline Passed" message

### Test Admin Lock
1. Go to AdminSubmissionManager
2. Find a submission
3. Click "View & Update"
4. Scroll to "Submission Lock"
5. Click "Lock Submission"
6. See lock message appear

### Test API
```bash
# Try submitting after deadline
curl -X POST /api/hackathons/123/submissions \
  -H "Content-Type: application/json" \
  -d '{...}'
# Response: 403 "Submission deadline has passed"
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Migration fails | Run `npx prisma migrate status` |
| Types missing | Run `npx prisma generate` |
| Build errors | Run `rm -rf .next && npm run build` |
| Lock not showing | Verify hackathonEndDate is passed as prop |
| Admin lock not working | Check user has admin role in session |

---

## 📊 Status

| Component | Status |
|-----------|--------|
| Database schema | ✅ Done |
| Utility functions | ✅ Done |
| UI components | ✅ Done |
| Form integration | ✅ Done |
| Admin controls | ✅ Done |
| API endpoints | ✅ Done |
| Migration | ✅ Done |
| Documentation | ✅ Done |

**Overall:** ✅ **100% COMPLETE**

---

## 📚 Documentation

- 📄 `SUBMISSION_LOCK_IMPLEMENTATION.md` - Technical details
- 📄 `SUBMISSION_LOCK_GUIDE.md` - User guide
- 📄 `SUBMISSION_LOCK_SUMMARY.md` - Full overview
- 📄 `SUBMISSION_LOCK_VERIFICATION.md` - Verification checklist
- 📄 This file - Quick reference

---

## 💡 Quick Decisions

**Q: How to check if locked?**
A: Use `isSubmissionLocked(submission, hackathon)`

**Q: Where to show lock status?**
A: Use `<SubmissionLockStatus />` component

**Q: How to let admins lock?**
A: Built into AdminSubmissionManager

**Q: What if deadline is wrong?**
A: Update hackathon.endDate, lock check is automatic

**Q: Can I unlock after deadline?**
A: Yes, admins can unlock anytime

---

## 🎓 Examples

### Check Lock Status in Code
```typescript
const locked = isSubmissionLocked(submission, hackathon)
if (locked) {
  console.log("Submission is locked")
  console.log(getSubmissionLockReason(submission, hackathon))
}
```

### Use in Component
```tsx
import { isSubmissionLocked } from '@/lib/submission-utils'
import { SubmissionLockStatus } from '@/components/submissions/submission-lock-status'

export function MyComponent({ submission, hackathon }) {
  const locked = isSubmissionLocked(submission, hackathon)
  
  return (
    <>
      {locked && <SubmissionLockStatus locked={locked} />}
      {locked ? <div>Cannot edit</div> : <EditForm />}
    </>
  )
}
```

### Call Lock API
```typescript
const response = await fetch(
  `/api/admin/hackathons/${hackId}/submissions/${subId}/lock`,
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locked: true,
      lockedReason: 'Plagiarism detected'
    })
  }
)
const updated = await response.json()
```

---

## ✅ Done!

Everything is implemented and ready to use. Just apply the database migration and you're good to go!

```bash
npx prisma migrate dev && npm run dev
```

Happy coding! 🚀

