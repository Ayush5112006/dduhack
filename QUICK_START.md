# Submission System - Quick Start Guide

## What's New?

A complete submission system has been implemented, allowing users to submit projects with files and admins to review and score submissions.

## Quick Links

- 📖 **Detailed Documentation**: [SUBMISSION_SYSTEM.md](SUBMISSION_SYSTEM.md)
- 📋 **Summary**: [SUBMISSION_SYSTEM_SUMMARY.md](SUBMISSION_SYSTEM_SUMMARY.md)
- 🔗 **Integration Guide**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- ✅ **Implementation Checklist**: [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)

## Setup (Quick)

### 1. Create File Upload Directory
```bash
mkdir -p public/submissions
```

### 2. Sync Database
```bash
npx prisma db push
npx prisma generate
```

### 3. Restart Dev Server
```bash
npm run dev
```

## Testing the System

### User Flow - Submit a Project

1. **Register for Hackathon**
   - Navigate to any hackathon detail page
   - Click "Register for Event"
   - Complete the SmartRegistrationForm
   - Submit registration

2. **Submit Project**
   - See "You're registered" message
   - Click "Submit Project" button
   - Fill in submission form:
     - Project title
     - Description
     - Technologies (at least 1)
     - GitHub link OR Live demo link
     - Optional: Files, deployment link, video, documentation
   - Click "Submit"
   - See success message

3. **View Dashboard**
   - Navigate to `/dashboard/submissions`
   - See your submission with status "Submitted"
   - Click "View Details" for full information

### Admin Flow - Review Submissions

1. **Access Admin Panel**
   - Navigate to hackathon management page
   - Click "View Submissions" (if admin)

2. **Review Submission**
   - See list of all submissions
   - Filter by status or search by title
   - Click "View & Update" on any submission

3. **Score & Feedback**
   - View project details
   - View all links (GitHub, demo, etc.)
   - Update status (Reviewing → Shortlisted → Won)
   - Enter score (0-100)
   - Add feedback
   - Save changes

## Key Features

### For Users
✅ Multi-field submission form  
✅ File upload with progress  
✅ Status tracking (Submitted → Reviewing → Shortlisted → Won)  
✅ View scores and feedback  
✅ Download submitted files  

### For Admins
✅ View all submissions  
✅ Filter and search  
✅ Update status and score  
✅ Provide feedback  
✅ Manage submissions  

## File Locations

```
components/submissions/
├── submission-form.tsx           # Main submission form
├── submission-viewer.tsx         # Display submissions
├── user-submission-dashboard.tsx # User dashboard
└── admin-submission-manager.tsx  # Admin interface

app/api/submissions/
├── route.ts                      # Get user submissions
├── hackathons/[id]/submissions/
│   ├── route.ts                  # Create/get submission
│   └── [submissionId]/route.ts   # Submission details
└── admin/hackathons/[id]/submissions/
    ├── route.ts                  # List all
    └── [submissionId]/route.ts   # Update

app/dashboard/submissions/page.tsx # User submissions page
```

## API Endpoints

### User Endpoints
```
POST   /api/hackathons/[id]/submissions
GET    /api/hackathons/[id]/submissions
GET    /api/submissions
```

### Admin Endpoints
```
GET    /api/admin/hackathons/[id]/submissions
PUT    /api/admin/hackathons/[id]/submissions/[id]
GET    /api/admin/hackathons/[id]/submissions/[id]
```

## Common Issues

### ❌ "File type not allowed"
→ Use allowed types: .zip, .rar, .pdf, .jpg, .png, .gif

### ❌ "Total file size exceeds 100MB"
→ Compress files or submit separately

### ❌ "You must be registered first"
→ Complete registration before submission

### ❌ Files not uploading
→ Check public/submissions/ directory exists and is writable

## Configuration

### File Upload Settings
- **Max total size**: 100MB per submission
- **Allowed types**: .zip, .rar, .pdf, images
- **Storage location**: public/submissions/

### Status Options
- `submitted` - Initial state
- `reviewing` - Admin is reviewing
- `shortlisted` - Passed initial review
- `won` - Winner selected
- `rejected` - Not selected

## Troubleshooting

### Issue: 404 on submission endpoints
**Check**: Database is synced with `npx prisma db push`

### Issue: File upload fails
**Check**: 
- public/submissions/ directory exists
- Directory is writable
- File size < 100MB total
- File type is allowed

### Issue: Admin can't see submissions
**Check**:
- User has admin role
- Submission exists for that hackathon
- User is viewing correct hackathon

### Issue: Submission not showing in dashboard
**Check**:
- Refresh browser
- Clear browser cache
- Check user is logged in
- Submission was successfully created

## Performance Tips

1. **For Large Files**
   - Compress to .zip before upload
   - Keep under 100MB total
   - Upload during off-peak hours

2. **For Multiple Submissions**
   - Submit one at a time
   - Wait for success confirmation
   - Check dashboard after each submission

3. **For Admin**
   - Use search/filter to narrow list
   - Review in batches
   - Batch-update status when possible

## Next Steps

1. ✅ Setup complete - navigate to hackathons
2. ✅ Test user submission
3. ✅ Test admin review
4. ✅ Monitor logs for issues
5. ✅ Collect feedback

## Support

For issues or questions:

1. **Check Documentation**
   - [SUBMISSION_SYSTEM.md](SUBMISSION_SYSTEM.md) - Technical details
   - [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Architecture

2. **Check Logs**
   - Server console for errors
   - Browser console for client-side issues

3. **Common Fixes**
   - Restart dev server
   - Clear browser cache
   - Check file permissions
   - Verify database sync

## Quick Reference

| Task | Location | Time |
|------|----------|------|
| Register for hackathon | Hackathon detail page | 2 min |
| Submit project | Same page after registration | 5 min |
| View submissions | /dashboard/submissions | 1 min |
| Review as admin | Hackathon management | 2-5 min |

## Database Schema

```typescript
model Submission {
  id                String (unique ID)
  userId            String (who submitted)
  hackathonId       String (for which hackathon)
  title             String (project name)
  description       String (project details)
  technologiesUsed  String (comma-separated)
  gitHubLink        String (optional)
  liveLink          String (optional)
  deploymentLink    String (optional)
  video             String (optional)
  documentation     String (optional)
  fileUrls          String (comma-separated file paths)
  status            String (submitted|reviewing|shortlisted|won|rejected)
  score             Int (0-100)
  feedback          String (admin feedback)
  createdAt         DateTime
  updatedAt         DateTime
  
  Unique: userId + hackathonId (one submission per user per hackathon)
}
```

## Example Data

### Sample Submission
```json
{
  "id": "sub_abc123",
  "userId": "user_123",
  "hackathonId": "hack_456",
  "title": "AI Chat Bot",
  "description": "An intelligent chatbot built with GPT and RAG",
  "technologiesUsed": "Node.js, React, OpenAI",
  "gitHubLink": "https://github.com/user/chatbot",
  "liveLink": "https://chatbot-demo.vercel.app",
  "fileUrls": "/submissions/uuid1.zip",
  "status": "submitted",
  "score": 0,
  "feedback": null
}
```

## Environment Variables (if needed)

```env
# File upload configuration
UPLOAD_DIR=public/submissions
MAX_FILE_SIZE=104857600  # 100MB in bytes
ALLOWED_EXTENSIONS=.zip,.rar,.pdf,.jpg,.jpeg,.png,.gif
```

## Success Metrics

✅ User can submit project in < 5 minutes  
✅ File uploads with progress bar  
✅ Submission visible in dashboard  
✅ Admin can review and score  
✅ Status updates propagate correctly  

---

**Status**: ✅ Ready to Use

**Version**: 1.0.0

**Last Updated**: 2025-01-25

Happy submitting! 🚀
