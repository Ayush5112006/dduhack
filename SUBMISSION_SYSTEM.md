# Submission System Implementation Guide

## Overview

The Submission System is a comprehensive platform for managing hackathon project submissions with features for file uploads, status tracking, scoring, and admin management.

## Architecture

### Components

#### 1. **SubmissionForm** (`components/submissions/submission-form.tsx`)
- **Purpose**: Main form for users to submit projects
- **Key Features**:
  - Multi-field form with title, description, technologies
  - Multiple link types: GitHub, Live demo, Deployment, Video, Documentation
  - File upload with drag-and-drop support
  - XHR-based upload with progress tracking
  - Real-time file size validation (100MB limit)
  - File type validation (.zip, .rar, .pdf, images)
- **Props**:
  ```typescript
  interface SubmissionFormProps {
    hackathonId: string
    hackathonTitle: string
    isAuthenticated: boolean
    isRegistered: boolean
    teamMode?: boolean
    teamName?: string
  }
  ```

#### 2. **SubmissionViewer** (`components/submissions/submission-viewer.tsx`)
- **Purpose**: Display submission cards and history
- **Components**:
  - `SubmissionCard`: Individual submission display with status badge, score, feedback
  - `SubmissionHistory`: Groups submissions by status
- **Status Types**: submitted, reviewing, shortlisted, won, rejected
- **Features**:
  - Clickable links to GitHub, live demo, video, documentation
  - File download buttons
  - Detailed view modal with full submission information

#### 3. **UserSubmissionDashboard** (`components/submissions/user-submission-dashboard.tsx`)
- **Purpose**: User-facing dashboard for tracking submissions
- **Features**:
  - List all user's submissions across hackathons
  - Progress steps visualization (Submitted → Reviewing → Shortlisted → Won)
  - Score and feedback display
  - Status filtering and search
  - Download attached files
  - View detailed submission information

#### 4. **AdminSubmissionManager** (`components/submissions/admin-submission-manager.tsx`)
- **Purpose**: Admin interface for managing submissions
- **Features**:
  - View all submissions for a hackathon
  - Filter by status and search by title/user ID
  - Update submission status, score, and feedback
  - Detailed submission viewer with all project links
  - Bulk action support (status updates)

### API Routes

#### User Submission Routes

1. **POST `/api/hackathons/[id]/submissions`** - Create submission
   - **Auth**: Required (user must be registered)
   - **Body**: FormData with submission data and files
   - **Response**: Created submission object
   - **Validation**:
     - User must be registered for hackathon
     - No duplicate submissions per user per hackathon
     - File size limit: 100MB total
     - Required fields: title, description, technologiesUsed, (gitHubLink OR liveLink)

2. **GET `/api/hackathons/[id]/submissions`** - Get user's submission for hackathon
   - **Auth**: Required
   - **Response**: User's submission object or 404

3. **GET `/api/submissions`** - Get all user's submissions
   - **Auth**: Required
   - **Response**: Array of all user submissions

#### Admin Routes

4. **GET `/api/admin/hackathons/[id]/submissions`** - List all submissions
   - **Auth**: Required (admin only)
   - **Response**: Array of all submissions for hackathon

5. **PUT `/api/admin/hackathons/[id]/submissions/[submissionId]`** - Update submission
   - **Auth**: Required (admin only)
   - **Body**: `{ status, score, feedback }`
   - **Response**: Updated submission object

6. **GET `/api/admin/hackathons/[id]/submissions/[submissionId]`** - Get submission details
   - **Auth**: Required (user or admin)
   - **Response**: Submission object

### Utilities

**submission-utils.ts** (`lib/submission-utils.ts`)
- `validateSubmission()`: Comprehensive validation
- `calculateSubmissionScore()`: Score calculation (0-100)
- `calculateSubmissionStats()`: Submission statistics
- `detectSubmissionIssues()`: Issue detection
- `getSubmissionRecommendations()`: Quality improvement suggestions

### Database Schema

The Submission model in Prisma includes:

```typescript
model Submission {
  id                String
  userId            String
  hackathonId       String
  title             String
  description       String
  technologiesUsed  String        // comma-separated
  gitHubLink        String?
  liveLink          String?
  deploymentLink    String?
  video             String?
  documentation     String?
  fileUrls          String?       // comma-separated
  teamContributions String?
  additionalNotes   String?
  status            SubmissionStatus  // submitted, reviewing, shortlisted, won, rejected
  score             Int           @default(0)
  feedback          String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@unique([userId, hackathonId])
}

enum SubmissionStatus {
  submitted
  reviewing
  shortlisted
  won
  rejected
}
```

## File Upload Handling

### Process Flow

1. **File Selection**: User selects files via dialog or drag-and-drop
2. **Validation**: 
   - Check total size against 100MB limit
   - Validate file extensions
   - Verify file count
3. **Upload**: 
   - Create FormData with all submission fields
   - Use XHR for upload progress tracking
   - Files stored in `public/submissions/` with UUID filenames
4. **Storage**: Files persisted to disk with unique names
5. **Recording**: File URLs stored as comma-separated string in database

### File Organization

```
public/
  submissions/
    [uuid].zip
    [uuid].pdf
    [uuid].jpg
    ...
```

### File Type Validation

**Allowed Extensions**:
- `.zip` - Project archives
- `.rar` - Compressed files
- `.pdf` - Documents
- `.jpg`, `.jpeg`, `.png`, `.gif` - Images

**File Size Limits**:
- Per file: No individual limit (validated by type)
- Total: 100MB per submission

## User Flows

### Submission Creation Flow

1. User registers for hackathon
2. Navigates to hackathon detail page
3. Clicks "Submit Project"
4. Fills submission form:
   - Project title (required)
   - Description (required)
   - Technologies (required, at least 1)
   - GitHub link OR Live link (required)
   - Optional: Deployment link, video, documentation
   - Optional: Files, team contributions, additional notes
5. Submits form with file upload
6. System validates and stores submission
7. User receives success confirmation
8. Submission appears in dashboard

### Admin Review Flow

1. Admin navigates to hackathon management
2. Clicks "View Submissions"
3. Filters by status (submitted, reviewing, etc.)
4. Searches by title or user ID
5. Clicks "View & Update" on submission
6. Reviews submission details:
   - Project information
   - All project links
   - Attached files
   - Team contributions if applicable
7. Updates:
   - Status (submitted → reviewing → shortlisted → won/rejected)
   - Score (0-100)
   - Feedback for team
8. Changes saved to database
9. User notified of updates

## Integration Points

### With Registration System
- User must be registered to submit
- Registration status checked before allowing submission
- Registration status updated when submission created

### With Hackathon System
- Submissions tied to specific hackathon
- Hackathon details shown in submission forms
- Hackathon must exist before accepting submissions

### With Authentication System
- Session-based auth for all endpoints
- User ID from session used for all submissions
- Admin role checked for admin endpoints

## Security Features

1. **Authorization**:
   - Users can only view/edit their own submissions
   - Admins can manage all submissions
   - Registration verification required

2. **File Upload Security**:
   - Extension whitelist validation
   - Size limit enforcement
   - UUID-based filename to prevent conflicts
   - Files stored outside web root where possible

3. **Data Validation**:
   - Required field validation
   - URL format validation
   - Field length validation
   - Duplicate submission prevention

## Performance Optimizations

1. **File Upload Progress**:
   - XHR-based upload with progress events
   - Real-time progress display (0-100%)
   - Non-blocking UI updates

2. **Database**:
   - Indexed queries on userId and hackathonId
   - Composite unique constraint on (userId, hackathonId)
   - Efficient filtering and sorting

3. **Component Optimization**:
   - Lazy loading of submission details
   - Modal-based detail views
   - Pagination support in admin view

## Testing Checklist

- [ ] User can submit project without files
- [ ] User can submit project with files
- [ ] File size validation works (reject >100MB)
- [ ] File type validation works (reject invalid types)
- [ ] Duplicate submission prevention works
- [ ] Registration check enforces submission requirement
- [ ] Admin can view all submissions
- [ ] Admin can update status, score, feedback
- [ ] User sees progress steps in dashboard
- [ ] User can download attached files
- [ ] Status changes reflected in real-time
- [ ] Search and filter work in admin view

## Known Limitations

1. File uploads stored on local filesystem (not cloud storage)
2. No file size limits per file (only total)
3. No automatic virus scanning
4. No CDN optimization for file serving
5. No batch submission operations
6. No email notifications (yet)

## Future Enhancements

1. **Cloud Storage**: Integrate AWS S3 or similar
2. **Notifications**: Email on status changes
3. **Analytics**: Submission statistics dashboard
4. **Plagiarism Detection**: Automated code similarity checking
5. **Scoring Rubric**: Custom scoring templates per hackathon
6. **Comments**: Comment threads on submissions
7. **Team Collaboration**: Real-time collaboration features
8. **Versioning**: Allow resubmission with version history
9. **Export**: Export submissions as ZIP or PDF
10. **Webhooks**: Integration with external systems

## Troubleshooting

### Upload fails with "File type not allowed"
- Check file extension is in whitelist
- Ensure file has correct extension (not renamed)

### Upload fails with size limit exceeded
- Total files should not exceed 100MB
- Compress files or remove unnecessary attachments

### Submission not visible in dashboard
- Verify user is authenticated
- Check submission was successfully created
- Clear browser cache and refresh

### Admin can't see submissions
- Verify user has admin role
- Check hackathon ID is correct
- Ensure submissions exist for hackathon

## Dependencies

- **Prisma**: ORM for database access
- **shadcn/ui**: UI components
- **Next.js**: Framework with file handling
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **uuid**: Unique filename generation
- **fs/promises**: File system operations
