-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "teamId" TEXT,
    "userId" TEXT,
    "userEmail" TEXT,
    "psId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "github" TEXT,
    "demo" TEXT,
    "video" TEXT,
    "files" TEXT,
    "techStack" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" DATETIME,
    "lockedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Submission_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Submission_psId_fkey" FOREIGN KEY ("psId") REFERENCES "ProblemStatement" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("createdAt", "demo", "description", "files", "github", "hackathonId", "id", "psId", "status", "teamId", "techStack", "title", "updatedAt", "userEmail", "userId", "video") SELECT "createdAt", "demo", "description", "files", "github", "hackathonId", "id", "psId", "status", "teamId", "techStack", "title", "updatedAt", "userEmail", "userId", "video" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
