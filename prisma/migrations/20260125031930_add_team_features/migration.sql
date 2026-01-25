-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hackathon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "banner" TEXT,
    "description" TEXT,
    "eligibility" TEXT,
    "problemStatementPdf" TEXT,
    "prize" TEXT,
    "prizeAmount" INTEGER NOT NULL DEFAULT 0,
    "mode" TEXT NOT NULL,
    "location" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT,
    "difficulty" TEXT NOT NULL,
    "registrationDeadline" DATETIME NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "participants" INTEGER NOT NULL DEFAULT 0,
    "allowTeams" BOOLEAN NOT NULL DEFAULT true,
    "minTeamSize" INTEGER NOT NULL DEFAULT 2,
    "maxTeamSize" INTEGER NOT NULL DEFAULT 5,
    "allowSoloSubmission" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hackathon_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hackathon" ("banner", "category", "createdAt", "description", "difficulty", "eligibility", "endDate", "featured", "id", "isFree", "location", "mode", "organizer", "ownerId", "participants", "prize", "prizeAmount", "problemStatementPdf", "registrationDeadline", "startDate", "status", "tags", "title", "updatedAt") SELECT "banner", "category", "createdAt", "description", "difficulty", "eligibility", "endDate", "featured", "id", "isFree", "location", "mode", "organizer", "ownerId", "participants", "prize", "prizeAmount", "problemStatementPdf", "registrationDeadline", "startDate", "status", "tags", "title", "updatedAt" FROM "Hackathon";
DROP TABLE "Hackathon";
ALTER TABLE "new_Hackathon" RENAME TO "Hackathon";
CREATE TABLE "new_TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TeamMember" ("createdAt", "email", "id", "status", "teamId", "userId") SELECT "createdAt", "email", "id", "status", "teamId", "userId" FROM "TeamMember";
DROP TABLE "TeamMember";
ALTER TABLE "new_TeamMember" RENAME TO "TeamMember";
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
