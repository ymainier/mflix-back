-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Episode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fullpath" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "still" TEXT,
    "number" INTEGER,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "seasonId" TEXT,
    CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Episode" ("createdAt", "description", "fullpath", "id", "number", "seen", "still", "title", "updatedAt") SELECT "createdAt", "description", "fullpath", "id", "number", "seen", "still", "title", "updatedAt" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
CREATE TABLE "new_Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "poster" TEXT,
    "number" INTEGER,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "showId" TEXT,
    CONSTRAINT "Season_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Season" ("createdAt", "description", "id", "number", "poster", "seen", "title", "updatedAt") SELECT "createdAt", "description", "id", "number", "poster", "seen", "title", "updatedAt" FROM "Season";
DROP TABLE "Season";
ALTER TABLE "new_Season" RENAME TO "Season";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
