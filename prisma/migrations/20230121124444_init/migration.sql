-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fullpath" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "backdrop" TEXT,
    "poster" TEXT,
    "seen" BOOLEAN NOT NULL DEFAULT false
);
