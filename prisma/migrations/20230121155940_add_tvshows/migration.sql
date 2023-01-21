-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "backdrop" TEXT,
    "poster" TEXT,
    "seen" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "poster" TEXT,
    "number" INTEGER,
    "seen" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fullpath" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "still" TEXT,
    "number" INTEGER,
    "seen" BOOLEAN NOT NULL DEFAULT false
);
