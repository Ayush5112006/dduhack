# Student Registration Feature for Hackathons

## Overview
This feature allows students to register for hackathons with comprehensive information collection. It supports both individual and team-based registrations.

## Features

### 1. **Student Registration Form**
Located at: `components/hackathons/student-registration-form.tsx`

#### Collected Information:
- **Student Information** (Required):
  - Full Name
  - Email Address
  - Phone Number
  - University Name
  - Enrollment Number
  - Branch/Department
  - Year of Study

- **Team Information** (For team mode):
  - Team Name
  - Team Members (up to 4 members)
    - Member Name
    - Member Email
    - Member Enrollment Number

- **Skills & Experience** (Optional):
  - Technical Skills
  - Previous Hackathon/Project Experience

- **Social Profiles** (Optional):
  - GitHub Profile
  - LinkedIn Profile
  - Portfolio Website

- **Project Information** (Optional):
  - Project Idea
  - Motivation for Participation

- **Consent** (Required):
  - Terms and Conditions acceptance

#### Registration Modes:
1. **Individual**: Single student registration
2. **Team**: Team-based registration with team leader and members

### 2. **Admin Registration Viewer**
Located at: `components/admin/student-registration-viewer.tsx`

#### Features:
- View all registrations in a table format
- Search by name, email, enrollment number, or university
- Filter by:
  - Registration status (pending, approved, rejected)
  - Registration mode (individual, team)
- Export registrations to CSV
- View detailed information for each registration
- Statistics dashboard showing:
  - Total registrations
  - Individual registrations count
  - Team registrations count
  - Pending registrations count

### 3. **Database Schema**
The Registration model has been enhanced with student-specific fields:

```prisma
model Registration {
  id            String    @id @default(cuid())
  hackathonId   String
  userId        String
  userEmail     String
  mode          String    // individual, team
  teamId        String?
  status        String    @default("pending")
  consent       Boolean   @default(false)
  
  // Student Information
  fullName      String?
  phone         String?
  university    String?
  enrollmentNumber String?
  branch        String?
  year          String?
  skills        String?
  experience    String?
  githubProfile String?
  linkedinProfile String?
  portfolioUrl  String?
  projectIdea   String?
  motivation    String?
  
  formData      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([hackathonId, userId])
}
```

## Usage

### For Students:

1. Navigate to any hackathon detail page
2. Click on "Register for Hackathon" button
3. Choose registration type (Individual or Team)
4. Fill in all required fields marked with *
5. Optionally fill in additional information
6. Accept terms and conditions
7. Submit the registration

### For Admins:

1. Navigate to admin dashboard
2. Select a hackathon to view its registrations
3. Use the StudentRegistrationViewer component to:
   - View all registrations
   - Search and filter registrations
   - Export data to CSV
   - View detailed student information

## API Endpoint

**POST** `/api/hackathons/[id]/register`

### Request Body:
```json
{
  "mode": "individual" | "team",
  "consent": true,
  "teamName": "Team Name (required for team mode)",
  "memberEmails": ["email1@example.com", "email2@example.com"],
  "formData": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "university": "Example University",
    "enrollmentNumber": "EN12345678",
    "branch": "Computer Science",
    "year": "2nd Year",
    "skills": "JavaScript, Python, React",
    "experience": "Previous experience...",
    "githubProfile": "https://github.com/username",
    "linkedinProfile": "https://linkedin.com/in/username",
    "portfolioUrl": "https://portfolio.com",
    "projectIdea": "Project description...",
    "motivation": "Motivation text...",
    "teamMembers": [
      {
        "name": "Member Name",
        "email": "member@example.com",
        "enrollmentNumber": "EN87654321"
      }
    ]
  }
}
```

### Response:
```json
{
  "success": true,
  "registrationId": "reg_xxxx",
  "teamId": "team_xxxx",
  "teamName": "Team Name",
  "message": "Successfully registered for the hackathon"
}
```

## Integration

### In Hackathon Detail Page:
Replace the old RegisterButton with StudentRegistrationForm:

```tsx
import { StudentRegistrationForm } from "@/components/hackathons/student-registration-form"

// In your component:
<StudentRegistrationForm 
  hackathonId={id} 
  hackathonTitle={hackathon.title}
  isRegistered={isRegistered}
  disabled={!isRegistrationOpen}
/>
```

### In Admin Panel:
Use the StudentRegistrationViewer component:

```tsx
import { StudentRegistrationViewer } from "@/components/admin/student-registration-viewer"

// In your admin component:
<StudentRegistrationViewer 
  registrations={registrations}
  hackathonTitle={hackathon.title}
/>
```

## Database Migration

The migration has been applied with:
```bash
pnpm prisma migrate dev --name add_student_registration_fields
```

Migration file: `20260125022404_add_student_registration_fields`

## Validation

The form includes comprehensive client-side validation:
- Required fields validation
- Email format validation
- Team member information validation (for team mode)
- Consent checkbox validation
- Maximum team size limit (4 members)

## Future Enhancements

Potential improvements:
1. Bulk approval/rejection of registrations
2. Email notifications to students
3. QR code generation for registered students
4. Integration with ID card verification
5. Payment gateway integration for paid hackathons
6. Waitlist management
7. Certificate generation for participants
8. Student dashboard to view registration status

## Notes

- All student data is stored securely in the database
- The formData field stores additional JSON data if needed
- Team invitations are sent to members via email
- Registration deadline is enforced at the API level
- Duplicate registrations are prevented by unique constraint
