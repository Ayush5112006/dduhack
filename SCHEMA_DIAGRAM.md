# Prisma Database Schema Visualization

## Entity Relationship Diagram

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ name            │
│ password        │ ◄──── Hashed with bcrypt
│ role            │ ◄──── participant|organizer|admin|judge
│ status          │ ◄──── active|suspended|pending
│ avatar          │
│ bio             │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         ├──────────────────────┬────────────────────────┬──────────────────┐
         │                      │                        │                  │
    ┌────▼─────────┐   ┌────────▼──────────┐   ┌────────▼─────┐   ┌────────▼────────┐
    │ UserProfile  │   │  Registration     │   │ Submission   │   │  Certificate    │
    ├──────────────┤   ├───────────────────┤   ├──────────────┤   ├─────────────────┤
    │ userId (FK)  │   │ id (PK)           │   │ id (PK)      │   │ id (PK)         │
    │ bio          │   │ userId (FK)       │   │ userId (FK)  │   │ userId (FK)     │
    │ location     │   │ hackathonId (FK)  │   │ hackathonId  │   │ hackathonId(FK) │
    │ website      │   │ mode              │   │ teamId (FK)  │   │ verificationCode│
    │ github       │   │ teamId (FK)       │   │ title        │   │ type            │
    │ linkedin     │   │ status            │   │ github       │   │ verified        │
    │ twitter      │   │ consent           │   │ demo         │   │ issuedAt        │
    │ skills (JSON)│   │ formData (JSON)   │   │ video        │   │ rank            │
    │ interests    │   └───────────────────┘   │ status       │   └─────────────────┘
    │ totalHacks   │         (many)            │ createdAt    │          ▲
    │ totalSubmit  │                           │ updatedAt    │          │
    │ wins         │                           └──────────────┘          │
    └──────────────┘                                  │                  │
         ▲                                            │                  │
         │                                  ┌─────────┴──────────┐       │
         │                              ┌───▼────┐          ┌───▼────┐  │
         │                              │ Score  │          │ Winner │──┘
         │                              ├────────┤          ├────────┤
         └──────────────────────────────┤ judgeId├──┐       │ rank   │
                                        │ innova├──┤│       │ prize  │
                                        │technic│  ││       └────────┘
                                        │design │  │└──►  submissionId(FK)
                                        │impact │  │
                                        │present│  │
                                        └───────┘  │
                                          ▲        │
                                          │        │
                                ┌─────────┴────┐  │
                                │   Judge      │  │
                                │ Assignment   │  │
                                └──────────────┘  │
                                                  │
                    ┌─────────────────────────────┘
                    │
              ┌─────▼────────────┐
              │   Hackathon      │
              ├──────────────────┤
              │ id (PK)          │
              │ title            │
              │ organizer        │
              │ ownerId (FK)────►│◄─────────────┐
              │ banner           │              │
              │ prize            │         ┌────┴──────────┐
              │ prizeAmount      │         │ ProblemStatement
              │ mode             │         ├─────────────────┤
              │ location         │         │ id (PK)         │
              │ registrationDL   │         │ hackathonId(FK) │
              │ startDate        │         │ title           │
              │ endDate          │         │ description     │
              │ category         │         │ difficulty      │
              │ tags (JSON)      │         │ prize           │
              │ difficulty       │         │ resources       │
              │ status           │         │ dataset         │
              │ featured         │         └─────────────────┘
              │ createdAt        │
              │ updatedAt        │
              └──────────────────┘
                    ▲
                    │
        ┌───────────┴──────────┐
        │                      │
    ┌───▼─────┐          ┌────▼──────┐
    │  Team   │          │ Notif.    │
    ├─────────┤          ├───────────┤
    │id (PK)  │          │ id (PK)   │
    │leaderId │          │ userId(FK)│
    │members  │          │ type      │
    │locked   │          │ title     │
    └────┬────┘          │ message   │
         │               │ link      │
         │               │ read      │
    ┌────▼──────┐        │ createdAt │
    │TeamMember │        └───────────┘
    ├───────────┤
    │id (PK)    │
    │teamId(FK) │
    │userId(FK) │
    │email      │
    │status     │
    └───────────┘
```

## Table Relationships Summary

| From | To | Relationship | Description |
|------|-----|--|-------------|
| User | UserProfile | 1:1 | Extended user info |
| User | Hackathon | 1:N | User owns hackathons |
| User | Registration | 1:N | User registers for events |
| User | Submission | 1:N | User submits projects |
| User | JudgeAssignment | 1:N | Judge assigned to hackathons |
| User | Score | 1:N | Judge scores submissions |
| User | Certificate | 1:N | User receives certs |
| User | Notification | 1:N | User gets notifications |
| User | Team | 1:N | User leads teams |
| User | TeamMember | 1:N | User in team |
| Hackathon | Registration | 1:N | Multiple registrations |
| Hackathon | Submission | 1:N | Multiple submissions |
| Hackathon | ProblemStatement | 1:N | Multiple challenges |
| Hackathon | JudgeAssignment | 1:N | Multiple judges |
| Hackathon | Score | 1:N | Multiple scores |
| Hackathon | Winner | 1:N | Multiple winners |
| Hackathon | Certificate | 1:N | Multiple certificates |
| Hackathon | Team | 1:N | Multiple teams |
| Team | TeamMember | 1:N | Multiple members |
| Team | Submission | 1:N | Team submissions |
| Submission | Score | 1:N | Multiple judges score |
| Submission | Winner | 1:1 | Marked as winner |
| Submission | Certificate | 1:1 | Winner certificate |
| ProblemStatement | Submission | 1:N | Submissions to problem |

## Data Types

- **String** - Email, names, text fields
- **Int** - Counts, numbers, scores (1-10)
- **Float** - Calculated averages
- **DateTime** - Timestamps, dates
- **Boolean** - Status flags, verification
- **JSON** - Arrays (tags, skills, files, tech stack)
- **Enum** - Role, status, difficulty, type

## Indexes

Key fields indexed for performance:
- User.email (UNIQUE)
- Hackathon.status
- Registration (hackathonId, userId) - UNIQUE
- Submission.hackathonId
- Score (submissionId, judgeId) - UNIQUE
- Notification (userId, createdAt)
- Team (hackathonId, leaderId)
- Certificate.verificationCode - UNIQUE

## Cascade Delete Rules

- Delete User ➜ deletes UserProfile, all Registrations, Submissions, Scores, Certificates
- Delete Hackathon ➜ deletes all Registrations, Submissions, ProblemStatements, Teams, Scores, Winners
- Delete Team ➜ deletes all TeamMembers and Submissions
- Delete Submission ➜ deletes all Scores and Winners

## Sample Queries

### Count hackathons by status
```sql
GROUP BY status, COUNT(*)
```

### Get top 3 judges by score count
```sql
SELECT judgeId, COUNT(*) as score_count
FROM Score
GROUP BY judgeId
ORDER BY score_count DESC
LIMIT 3
```

### Get average score per submission
```sql
SELECT submissionId, AVG(total) as avg_score
FROM Score
GROUP BY submissionId
```

### Get all participants in a hackathon
```sql
SELECT DISTINCT u.* FROM User u
JOIN Registration r ON u.id = r.userId
WHERE r.hackathonId = ?
```

---

Generated with Prisma v5.22.0
