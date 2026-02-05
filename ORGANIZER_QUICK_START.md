# Quick Start Guide - Organizer Dashboard

## 🚀 Setup Instructions

### 1. Apply Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add organization branding fields to hackathons table
ALTER TABLE hackathons 
ADD COLUMN IF NOT EXISTS organization_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS organization_logo TEXT;

-- Create mentor_assignments table
CREATE TABLE IF NOT EXISTS mentor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hackathon_id, student_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_hackathon ON mentor_assignments(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_student ON mentor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor ON mentor_assignments(mentor_id);

-- Enable RLS
ALTER TABLE mentor_assignments ENABLE ROW LEVEL SECURITY;
```

### 2. Install Dependencies

```bash
npm install recharts
```

### 3. Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📍 Routes

### Organizer Dashboard Routes

| Route | Description |
|-------|-------------|
| `/organizer/dashboard` | Main dashboard with stats & charts |
| `/organizer/hackathons/create` | Create new hackathon |
| `/organizer/dashboard/hackathons` | Manage hackathons |
| `/organizer/dashboard/participants` | Manage participants |
| `/organizer/dashboard/mentors` | Assign mentors |
| `/organizer/dashboard/submissions` | Review submissions |
| `/organizer/dashboard/settings` | Settings |

## 🎯 Usage Workflows

### Creating a Hackathon with Branding

1. Navigate to "Create Hackathon" from sidebar
2. Fill in basic details (title, description, dates)
3. Select **Organization Type** (Company/College/Community)
4. Upload **Organization Logo** (max 5MB, image files only)
5. Toggle **Allow Team Participation** if needed
6. Set team size limits (if teams enabled)
7. Add prize details and eligibility
8. Submit to create

### Managing Participants

1. Go to "Participants" from sidebar
2. Use filters to find specific participants:
   - Search by name/email/team
   - Filter by type (Individual/Team)
   - Filter by status (Pending/Approved/Rejected)
3. Click eye icon to view full details
4. Click ✓ to approve or ✗ to reject pending registrations

### Assigning Mentors to Students

1. Go to "Mentor Assignments" from sidebar
2. Use filters to narrow down students:
   - Filter by hackathon
   - Filter by domain
   - Search by name
3. For unassigned students:
   - Click the mentor dropdown
   - Select a mentor from the list
   - Assignment is saved automatically
4. To unassign:
   - Click "Unassign" button next to assigned mentor

## 🎨 UI Components Used

### Cards
```tsx
<Card className="border-white/10 bg-white/5 backdrop-blur-sm">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Badges
```tsx
// Status badges
<Badge className="bg-green-500/20 text-green-400 border-green-500/30">
  Approved
</Badge>

// Type badges
<Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
  Team
</Badge>
```

### Logo Container
```tsx
<div className="w-20 h-20 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
</div>
```

## 🔧 API Endpoints

### Dashboard Stats
```
GET /api/organizer/dashboard/stats
Returns: stats, registrationTrend, domainDistribution
```

### Participants
```
GET /api/organizer/participants
Returns: participants[]

PATCH /api/organizer/participants/[id]/status
Body: { status: "approved" | "rejected" | "pending" }
```

### Mentor Assignments
```
GET /api/organizer/mentors/students
Returns: students[]

GET /api/organizer/mentors/available
Returns: mentors[]

POST /api/organizer/mentors/assign
Body: { studentId, mentorId, hackathonId }

POST /api/organizer/mentors/unassign
Body: { studentId, hackathonId }
```

## 🐛 Troubleshooting

### Charts not displaying
- Ensure `recharts` is installed: `npm install recharts`
- Check browser console for errors

### Logo upload fails
- Check file size (max 5MB)
- Ensure file is an image format (jpg, png, gif, webp)
- Verify Supabase storage bucket permissions

### Mentor assignment fails
- Ensure mentor has role = "mentor" in users table
- Verify hackathon belongs to logged-in organizer
- Check student is registered for the hackathon

### Stats showing zero
- Ensure you have created hackathons as organizer
- Check that registrations exist for your hackathons
- Verify database queries in browser network tab

## 📊 Data Flow

```
Organizer Creates Hackathon
    ↓
Students Register
    ↓
Organizer Approves/Rejects (Participants Page)
    ↓
Organizer Assigns Mentors (Mentor Assignments Page)
    ↓
Students Submit Projects
    ↓
Organizer Reviews Submissions
```

## 🎯 Testing Checklist

- [ ] Create hackathon with organization logo
- [ ] Logo displays in hackathon card
- [ ] Dashboard shows correct stats
- [ ] Charts render with data
- [ ] Filter participants by type and status
- [ ] Approve/reject participant registration
- [ ] View participant details modal
- [ ] Filter students by hackathon and domain
- [ ] Assign mentor to student
- [ ] Unassign mentor from student
- [ ] Verify mentor sees assigned students
- [ ] Verify student sees assigned mentor

## 💡 Tips

1. **Logo Best Practices:**
   - Use square images (1:1 ratio)
   - Recommended size: 400x400px
   - PNG with transparent background works best

2. **Performance:**
   - Use filters to reduce table data
   - Charts auto-limit to last 7 days and top 6 domains

3. **User Experience:**
   - Approve participants before assigning mentors
   - Assign mentors based on domain/skills match
   - Use search to quickly find specific participants

---

**Need Help?** Check `ORGANIZER_DASHBOARD_SUMMARY.md` for detailed documentation.
