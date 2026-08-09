-- CreateEnum
CREATE TYPE "InstructorProfileStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "InstructorApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OfferingStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "location" TEXT,
    "status" "InstructorProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_applications" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "status" "InstructorApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructor_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_offerings" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "applicationId" TEXT,
    "subcategoryId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "experienceYears" INTEGER,
    "status" "OfferingStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructor_offerings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offering_media" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offering_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "subcategories_categoryId_isActive_idx" ON "subcategories"("categoryId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_categoryId_slug_key" ON "subcategories"("categoryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "instructor_profiles_userId_key" ON "instructor_profiles"("userId");

-- CreateIndex
CREATE INDEX "instructor_profiles_status_idx" ON "instructor_profiles"("status");

-- CreateIndex
CREATE INDEX "instructor_applications_profileId_status_idx" ON "instructor_applications"("profileId", "status");

-- CreateIndex
CREATE INDEX "instructor_applications_status_submittedAt_idx" ON "instructor_applications"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "instructor_offerings_profileId_status_idx" ON "instructor_offerings"("profileId", "status");

-- CreateIndex
CREATE INDEX "instructor_offerings_subcategoryId_status_idx" ON "instructor_offerings"("subcategoryId", "status");

-- CreateIndex
CREATE INDEX "instructor_offerings_applicationId_idx" ON "instructor_offerings"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "offering_media_storageKey_key" ON "offering_media"("storageKey");

-- CreateIndex
CREATE INDEX "offering_media_offeringId_type_sortOrder_idx" ON "offering_media"("offeringId", "type", "sortOrder");

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_profiles" ADD CONSTRAINT "instructor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_applications" ADD CONSTRAINT "instructor_applications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_offerings" ADD CONSTRAINT "instructor_offerings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_offerings" ADD CONSTRAINT "instructor_offerings_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "instructor_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_offerings" ADD CONSTRAINT "instructor_offerings_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering_media" ADD CONSTRAINT "offering_media_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "instructor_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
