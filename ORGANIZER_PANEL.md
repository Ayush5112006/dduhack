# Organizer Hackathon Management Panel

## Overview

A comprehensive dashboard for hackathon organizers to create, manage, and monitor hosted hackathons. This panel provides all the tools needed to manage hackathons from creation to completion.

## Features

### 1. **Dashboard Overview**
- View statistics: Total hackathons, live events, upcoming events, and total registrations
- Quick access to all organizer functions
- Real-time updates on hackathon status

### 2. **Hackathon Management**
- **Create Hackathons**: Easy-to-use form to create new hackathons with:
  - Title, description, and category
  - Mode: Online, Offline, or Hybrid
  - Difficulty level: Beginner, Intermediate, or Advanced
  - Prize amount and pool settings
  - Dates and deadlines
  - Location information

- **View Hackathons**: Grid view of all hosted hackathons with:
  - Status badges (Upcoming, Live, Closed, Past)
  - Quick stats (registrations, submissions, teams)
  - Prize pool information
  - Search and filter capabilities

- **Edit Hackathons**: Update hackathon details anytime:
  - Modify all event details
  - Change dates and deadlines
  - Update prize amounts
  - Edit descriptions

- **Delete Hackathons**: Remove hackathons with confirmation dialog

### 3. **Hackathon Details Page**
Access comprehensive hackathon information with tabs for:
- **Details**: View and edit hackathon information
- **Participants**: See registration and participant information
- **Submissions**: Track submissions and projects
- **Settings**: Configure hackathon-specific settings

### 4. **Search & Filter**
- Search hackathons by title
- Filter by status (All, Upcoming, Live, Closed, Past)
- Filter by category (Web Development, Mobile, AI/ML, Cloud, Other)

## File Structure

```
components/organizer/
├── create-hackathon-dialog.tsx    # Dialog for creating new hackathons
├── hackathon-card.tsx             # Card component displaying hackathon info
└── hackathons-list.tsx            # Main list with search and filters

app/api/organizer/
└── hackathons/
    ├── route.ts                   # GET all, POST create
    └── [id]/
        └── route.ts               # GET, PUT, DELETE individual hackathons

app/organizer/dashboard/
├── hackathons/
│   ├── page.tsx                   # Main hackathons list page
│   └── [id]/
│       └── page.tsx               # Hackathon detail page
```

## API Endpoints

### Hackathons List & Create
- **GET** `/api/organizer/hackathons` - Fetch all organizer's hackathons
- **POST** `/api/organizer/hackathons` - Create a new hackathon

### Single Hackathon Operations
- **GET** `/api/organizer/hackathons/[id]` - Get hackathon details
- **PUT** `/api/organizer/hackathons/[id]` - Update hackathon
- **DELETE** `/api/organizer/hackathons/[id]` - Delete hackathon

## Usage

### Creating a Hackathon

1. Navigate to **Organizer Dashboard** → **Manage Hackathons**
2. Click **"Create Hackathon"** button
3. Fill in the required fields:
   - Hackathon Title *
   - Mode (Online/Offline/Hybrid) *
   - Category *
   - Start Date & End Date *
   - Registration Deadline *
4. Add optional information:
   - Description
   - Prize Amount
   - Location
   - Difficulty Level
5. Click **"Create Hackathon"**

### Managing Hackathons

Each hackathon card shows:
- Title and status badge
- Description (truncated)
- Category, mode, and difficulty tags
- Registration, submission, and team counts
- Prize pool information
- Action menu with options to:
  - View Details
  - Edit
  - View Participants
  - View Submissions
  - Delete

### Viewing Hackathon Details

1. Click **"View Details"** on any hackathon card
2. Navigate through tabs:
   - **Details**: View all information, edit mode available
   - **Participants**: See registration stats
   - **Submissions**: View submission counts
   - **Settings**: Additional configurations
3. Click **"Edit"** to modify hackathon information
4. Click **"Save Changes"** to persist updates

## Status Indicators

- **Upcoming** - Registration open, hasn't started yet
- **Live** - Currently running
- **Closed** - Registration closed, event finished
- **Past** - Event has completed

## Security

- All endpoints require authentication
- Only hackathon organizers can view/edit their own hackathons
- Authorization checks prevent unauthorized access
- CORS credentials required for API calls

## Toast Notifications

Users receive feedback for actions:
- ✓ Success: Hackathon created/updated/deleted
- ✗ Error: API failures or validation errors
- ℹ Info: Informational messages

## Database Relations

The system tracks:
- **Registrations**: User registrations for hackathons
- **Submissions**: Team/individual submissions
- **Teams**: Team compositions for hackathons
- **Organizations**: Hackathon organizer information

## Future Enhancements

- [ ] Bulk operations (edit multiple hackathons)
- [ ] Export hackathons to CSV
- [ ] Advanced filtering by date range
- [ ] Hackathon templates
- [ ] Participant management interface
- [ ] Submission review dashboard
- [ ] Email notifications to participants
- [ ] Analytics and reporting
- [ ] Leaderboard management
- [ ] Judge assignment interface

## Styling

- Built with Tailwind CSS
- Uses Radix UI components for accessibility
- Responsive design (mobile, tablet, desktop)
- Dark/light theme support via theme provider

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Semantic HTML structure
- Color contrast compliance

## Performance

- Lazy loading of hackathon data
- Optimized re-renders with React hooks
- Search and filter optimizations
- Pagination ready for large datasets
