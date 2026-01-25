# Team Submission System - Quick Reference

## ✅ What Was Implemented

All 4 features requested:

1. **Teams can submit together** - Submission API validates team eligibility
2. **Role-based permissions** - Leader (manage team) vs Member (join/submit)
3. **Team size limits** - Configurable min/max per hackathon
4. **Single team enforcement** - Users can only be in 1 team per hackathon

---

## 🚀 Quick Start

### 1. Apply Migration
```bash
npx prisma migrate dev
npx prisma generate
```

### 2. Configure Hackathon Team Settings
```typescript
await prisma.hackathon.create({
  data: {
    title: "Tech Hackathon 2025",
    // Team settings
    allowTeams: true,           // Allow team submissions
    minTeamSize: 2,             // Minimum 2 members
    maxTeamSize: 5,             // Maximum 5 members
    allowSoloSubmission: false,  // No individual submissions
    // ... other fields
  }
})
```

### 3. Use in Component
```tsx
<SubmissionForm
  hackathonId={hackathon.id}
  hackathonTitle={hackathon.title}
  isAuthenticated={true}
  isRegistered={true}
  teamMode={true}
  teamName="Team Awesome"
  teamId={team.id}
  teamMembers={3}                    // Current members
  minTeamSize={hackathon.minTeamSize}
  maxTeamSize={hackathon.maxTeamSize}
  hackathonEndDate={hackathon.endDate}
/>
```

---

## 📚 Core Functions (lib/team-utils.ts)

```typescript
// Check if user is in team
const { inTeam, teamId } = await isUserInTeam(userId, hackathonId)

// Get user's role
const role = await getUserTeamRole(userId, teamId)  // "leader" or "member"

// Can user submit?
const { canSubmit, error } = await canUserSubmitForTeam(userId, teamId)

// Can user manage team?
const isLeader = await canUserManageTeam(userId, teamId)

// Validate before submission
const { eligible, error } = await validateTeamSubmissionEligibility(teamId, hackathonId)

// Get hackathon submission mode
const mode = await getTeamSubmissionMode(hackathonId)
// Returns: { allowTeams, allowIndividual, forceTeams, forceIndividual }
```

---

## 🔌 Key API Endpoints

### Add Member to Team
```
POST /api/teams/[teamId]/members
Body: { "email": "user@example.com" }
Auth: Leader only
Response: Created member with status "invited"
```

### Accept Invitation
```
PUT /api/teams/[teamId]/members/[memberId]
Body: { "status": "joined" }
Auth: Member can accept own, leader can set any
Response: Updated member
```

### Remove Member
```
DELETE /api/teams/[teamId]/members/[memberId]
Auth: Leader only
Error: Cannot remove leader
```

### Submit as Team
```
POST /api/hackathons/[id]/submissions
Body: { "teamId": "...", "title": "...", ... }
Validation: Team size, member status, eligibility
```

---

## 🔐 Permissions

| Action | Leader | Member |
|--------|--------|--------|
| Add members | ✅ | ❌ |
| Remove members | ✅ | ❌ |
| Change roles | ✅ | ❌ |
| Accept invite | ✅ | ✅ |
| Submit project | ✅ | ✅ |
| View team | ✅ | ✅ |

---

## ⚙️ Hackathon Settings

### Force Teams (Default)
```typescript
{
  allowTeams: true,
  minTeamSize: 2,
  maxTeamSize: 5,
  allowSoloSubmission: false
}
// Result: Must submit as team (2-5 people)
```

### Individual Only
```typescript
{
  allowTeams: false,
  allowSoloSubmission: true
}
// Result: Individual submissions only
```

### Flexible
```typescript
{
  allowTeams: true,
  minTeamSize: 1,
  maxTeamSize: 5,
  allowSoloSubmission: true
}
// Result: Solo or teams (1-5 people)
```

### Pair Programming
```typescript
{
  allowTeams: true,
  minTeamSize: 2,
  maxTeamSize: 2,
  allowSoloSubmission: false
}
// Result: Exactly 2-person teams
```

---

## 📋 Database Schema Changes

```typescript
// Hackathon model (NEW FIELDS)
allowTeams: Boolean @default(true)
minTeamSize: Int @default(2)
maxTeamSize: Int @default(5)
allowSoloSubmission: Boolean @default(false)

// TeamMember model (NEW FIELD)
role: String @default("member")  // "leader" or "member"

// TeamMember status
status: String  // "joined", "invited", "declined"
```

---

## ✨ Key Features

✅ **Team Size Validation**
- Min/max members enforced
- Clear error messages
- Per-hackathon configuration

✅ **Role-Based Access**
- Leaders manage team
- Members can submit
- Invited members pending

✅ **Single Team Constraint**
- User can only be in 1 team per hackathon
- Enforced at database level
- Prevents split effort

✅ **Smart Submission Form**
- Shows team member count
- Disables if team too small
- Shows helpful error messages

✅ **Comprehensive Validation**
- Team exists
- User is member
- User status is "joined"
- Team has min members
- All members confirmed

---

## 🧪 Testing

```typescript
// Test 1: Create team
const team = await prisma.team.create({...})

// Test 2: Add members
await fetch(`/api/teams/${team.id}/members`, {
  method: 'POST',
  body: JSON.stringify({ email: 'user@example.com' })
})

// Test 3: Accept invitation
await fetch(`/api/teams/${team.id}/members/${member.id}`, {
  method: 'PUT',
  body: JSON.stringify({ status: 'joined' })
})

// Test 4: Submit
await fetch(`/api/hackathons/${hackathon.id}/submissions`, {
  method: 'POST',
  body: new FormData({
    teamId: team.id,
    title: '...',
    ...
  })
})
```

---

## 🐛 Error Handling

All endpoints return clear error messages:

```json
{
  "error": "Team must have at least 2 members (current: 1)"
}
```

Common errors:
- "Team not found" (404)
- "Only team leader can add members" (403)
- "User already in another team" (400)
- "Team has reached maximum size" (400)
- "User is not a member of this team" (403)

---

## 📝 Migration

**File:** `prisma/migrations/20260125031930_add_team_features`

Applies automatically with:
```bash
npx prisma migrate dev
```

To check status:
```bash
npx prisma migrate status
```

---

## 📁 Files Modified

- `prisma/schema.prisma` - Schema updates
- `lib/team-utils.ts` - NEW utility functions
- `app/api/teams/[teamId]/members/route.ts` - NEW endpoints
- `app/api/teams/[teamId]/members/[memberId]/route.ts` - NEW endpoints
- `app/api/hackathons/[id]/submissions/route.ts` - Submission validation
- `components/submissions/submission-form.tsx` - Team size checks

---

## ✅ Verification Checklist

- [x] Schema updated
- [x] Migration created
- [x] Utilities written
- [x] API endpoints created
- [x] Submission validation updated
- [x] Form component updated
- [x] Error handling implemented
- [x] Documentation complete

---

## 🎯 Next Steps (Optional)

**To further enhance:**
- [ ] Email notifications on team invitations
- [ ] Team statistics/achievements
- [ ] Team member permissions UI
- [ ] Team contracts/agreements
- [ ] Conflict resolution system
- [ ] Team performance tracking

---

**Status:** ✅ **100% COMPLETE & READY**

See `TEAM_SUBMISSION_SYSTEM.md` for full documentation.

