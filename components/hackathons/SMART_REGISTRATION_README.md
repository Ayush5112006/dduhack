# Smart Registration Modal - Complete Documentation

## 🎯 Overview

The **Smart Registration Modal** is a comprehensive, multi-step registration system for hackathons that supports both **Individual** and **Team** registration flows with intelligent guidance and validation.

## ✨ Features

### Core Features
- ✅ **Dual Registration Modes**: Individual & Team registration
- ✅ **Multi-Step Progress Tracking**: Visual progress bar (0% → 100%)
- ✅ **Smart Tips Sidebar**: Context-aware guidance at each step
- ✅ **Team Management**: Create teams, join existing teams, invite members
- ✅ **Profile Management**: Edit skills, experience level, social links
- ✅ **Domain & Tech Stack Selection**: Multi-select options
- ✅ **Validation & Error Handling**: Comprehensive validation rules
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Glassmorphism UI**: Modern, premium design

### Registration Flows

#### 📋 Individual Registration (4 Steps)
1. **Choose Registration Type** - Select Individual
2. **Confirm Profile** - Review and update personal information
3. **Motivation & Skills** - Share motivation, domain, and tools
4. **Review & Submit** - Final review and submission

#### 👥 Team Registration (5 Steps)
1. **Choose Registration Type** - Select Team
2. **Team Setup** - Join existing team OR create new team
3. **Add Team Members** - Invite members (2-4 total)
4. **Team Details** - Define domain, tech stack, project idea
5. **Review & Submit** - Final review and submission

## 🚀 Usage

### Basic Implementation

```tsx
import { SmartRegistrationModal } from "@/components/hackathons/smart-registration-modal"

function HackathonPage() {
  const [modalOpen, setModalOpen] = useState(false)

  const hackathon = {
    id: "hackathon-123",
    title: "Cloud & DevOps Challenge",
    maxTeamSize: 4,
  }

  const currentUser = {
    id: "user-456",
    name: "John Doe",
    email: "john@example.com",
    skills: ["React", "Node.js"],
    github: "github.com/johndoe",
    linkedin: "linkedin.com/in/johndoe",
  }

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        Register for Hackathon
      </Button>

      <SmartRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        hackathon={hackathon}
        currentUser={currentUser}
      />
    </>
  )
}
```

## 📊 Database Schema

### Required Tables

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  skills    String[]
  github    String?
  linkedin  String?
  userRole  String   @default("participant")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Team {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique
  hackathonId String
  leaderId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  hackathon   Hackathon     @relation(fields: [hackathonId], references: [id])
  members     TeamMember[]
  registrations Registration[]
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  userId    String
  role      String   @default("member") // "leader" | "member"
  status    String   @default("invited") // "invited" | "joined" | "pending"
  createdAt DateTime @default(now())
  
  team      Team     @relation(fields: [teamId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}

model Registration {
  id          String   @id @default(cuid())
  type        String   // "individual" | "team"
  userId      String?
  teamId      String?
  hackathonId String
  domain      String
  techStack   String[]
  motivation  String?
  projectIdea String?
  status      String   @default("pending") // "pending" | "approved" | "rejected"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User?      @relation(fields: [userId], references: [id])
  team        Team?      @relation(fields: [teamId], references: [id])
  hackathon   Hackathon  @relation(fields: [hackathonId], references: [id])
}

model Hackathon {
  id          String   @id @default(cuid())
  title       String
  maxTeamSize Int      @default(4)
  startDate   DateTime
  endDate     DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  teams         Team[]
  registrations Registration[]
}
```

## 🔌 API Endpoints

### 1. **POST /api/registrations**
Create a new registration (individual or team)

**Request Body:**
```json
{
  "type": "individual" | "team",
  "userId": "string",
  "teamId": "string",
  "hackathonId": "string",
  "profile": {
    "name": "string",
    "skills": ["string"],
    "experienceLevel": "string",
    "github": "string",
    "linkedin": "string"
  },
  "motivation": "string",
  "domain": "string",
  "techStack": ["string"],
  "projectIdea": "string"
}
```

### 2. **GET /api/teams/check?code={teamCode}**
Check if a team exists and has available slots

**Response:**
```json
{
  "team": {
    "id": "string",
    "name": "string",
    "code": "string",
    "members": [],
    "hackathon": {}
  }
}
```

### 3. **POST /api/teams**
Create a new team

**Request Body:**
```json
{
  "name": "string",
  "hackathonId": "string",
  "leaderId": "string"
}
```

### 4. **POST /api/teams/{teamId}/join**
Join an existing team

**Request Body:**
```json
{
  "userId": "string"
}
```

### 5. **POST /api/teams/{teamId}/invite**
Invite a member to the team

**Request Body:**
```json
{
  "email": "string"
}
```

## ⚙️ Validation Rules

### Business Rules
- ✔ A user cannot register twice for the same hackathon
- ✔ Team must have minimum 2 members before submission
- ✔ Maximum team size = 4 (configurable)
- ✔ Team name must be unique
- ✔ Only team leader can invite members
- ✔ Invitation expires after 24 hours (implement in backend)
- ✔ Progress bar updates at every step

### Field Validations
- **Name**: Required, min 2 characters
- **Email**: Required, valid email format
- **Team Name**: Required, unique, min 3 characters
- **Team Code**: Required, 6 characters
- **Domain**: Required selection
- **Tech Stack**: At least 1 selection recommended
- **Motivation**: Recommended for better approval chances

## 🎨 UI Components Used

- `Dialog` - Modal container
- `Button` - Action buttons
- `Input` - Text inputs
- `Textarea` - Multi-line text
- `Select` - Dropdown selections
- `Checkbox` - Agreement checkbox
- `Badge` - Tags and status indicators
- `Progress` - Progress bar
- `Label` - Form labels

## 🎯 Smart Tips System

The sidebar displays context-aware tips based on:
- Current step number
- Registration type (individual/team)
- User actions

**Example Tips:**
- "Team registrations have 20% higher acceptance rates"
- "Connect GitHub/LinkedIn to boost your profile"
- "Balanced teams with diverse skills have better chances"

## 🔧 Customization

### Change Maximum Team Size
```tsx
<SmartRegistrationModal
  hackathon={{
    id: "...",
    title: "...",
    maxTeamSize: 6  // Change from default 4
  }}
  // ...
/>
```

### Add Custom Domains
Edit the `DOMAINS` array in the component:
```tsx
const DOMAINS = [
  "Artificial Intelligence",
  "Your Custom Domain",
  // ...
]
```

### Add Custom Tech Stack
Edit the `TECH_STACK` array:
```tsx
const TECH_STACK = [
  "React",
  "Your Custom Tech",
  // ...
]
```

## 📱 Responsive Design

- **Desktop**: Full modal with sidebar
- **Tablet**: Stacked layout
- **Mobile**: Single column, collapsible tips

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (`from-primary to-blue-400`)
- **Background**: Dark gradient with glassmorphism
- **Borders**: Primary with opacity variations
- **Text**: Foreground with muted variants

### Animations
- Smooth transitions on card selection
- Progress bar animation
- Step transitions

## 🚦 Status Indicators

### Team Member Status
- **Joined** ✅ - Green badge with checkmark
- **Invited** 🕐 - Yellow badge with clock
- **Pending** ⏳ - Gray badge with clock

### Registration Status
- **Pending** - Awaiting approval
- **Approved** - Registration accepted
- **Rejected** - Registration declined

## 🔒 Security Considerations

1. **Session Validation**: All API calls check user session
2. **Team Leader Verification**: Only leaders can invite members
3. **Duplicate Prevention**: Check for existing registrations
4. **Input Sanitization**: Validate all user inputs
5. **Rate Limiting**: Implement on invitation endpoints

## 📝 Testing Checklist

- [ ] Individual registration flow (all 4 steps)
- [ ] Team creation flow
- [ ] Team joining flow
- [ ] Member invitation
- [ ] Member removal
- [ ] Duplicate registration prevention
- [ ] Team capacity validation
- [ ] Progress bar accuracy
- [ ] Smart tips display
- [ ] Form validation
- [ ] Mobile responsiveness

## 🎯 Demo Page

Visit `/hackathons/[id]/register-demo` to see the modal in action with mock data.

## 📄 License

This component is part of the HackHub project.

---

**Built with ❤️ for HackHub**
