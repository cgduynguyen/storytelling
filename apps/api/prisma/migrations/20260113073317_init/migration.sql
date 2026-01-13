-- CreateEnum
CREATE TYPE "AgeBand" AS ENUM ('AGE_3_5', 'AGE_6_8', 'AGE_9_10');

-- CreateEnum
CREATE TYPE "StoryTheme" AS ENUM ('ADVENTURE', 'ANIMALS', 'FANTASY', 'FRIENDSHIP', 'SPACE', 'UNDERWATER', 'NATURE', 'RANDOM');

-- CreateEnum
CREATE TYPE "StoryLength" AS ENUM ('SHORT', 'MEDIUM', 'LONG');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('PENDING', 'GENERATING', 'AUDIO_PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parental_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "ageBand" "AgeBand" NOT NULL,
    "excludedThemes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parental_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "theme" "StoryTheme" NOT NULL,
    "length" "StoryLength" NOT NULL,
    "ageBand" "AgeBand" NOT NULL,
    "isInteractive" BOOLEAN NOT NULL DEFAULT false,
    "mainCharacter" TEXT,
    "status" "StoryStatus" NOT NULL DEFAULT 'PENDING',
    "content" TEXT,
    "audioData" BYTEA,
    "wordBoundaries" JSONB,
    "savedToLibrary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_segments" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "audioData" BYTEA,
    "wordBoundaries" JSONB,
    "order" INTEGER NOT NULL,
    "isEnding" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choices" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "nextSegmentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "choices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "parental_settings_userId_key" ON "parental_settings"("userId");

-- CreateIndex
CREATE INDEX "stories_userId_idx" ON "stories"("userId");

-- CreateIndex
CREATE INDEX "stories_userId_savedToLibrary_idx" ON "stories"("userId", "savedToLibrary");

-- CreateIndex
CREATE INDEX "stories_userId_createdAt_idx" ON "stories"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "stories_status_idx" ON "stories"("status");

-- CreateIndex
CREATE INDEX "story_segments_storyId_order_idx" ON "story_segments"("storyId", "order");

-- CreateIndex
CREATE INDEX "choices_segmentId_order_idx" ON "choices"("segmentId", "order");

-- AddForeignKey
ALTER TABLE "parental_settings" ADD CONSTRAINT "parental_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_segments" ADD CONSTRAINT "story_segments_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "choices" ADD CONSTRAINT "choices_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "story_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "choices" ADD CONSTRAINT "choices_nextSegmentId_fkey" FOREIGN KEY ("nextSegmentId") REFERENCES "story_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
