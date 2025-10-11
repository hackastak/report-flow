-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportSchedule" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "reportType" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportFilter" (
    "id" TEXT NOT NULL,
    "reportScheduleId" TEXT NOT NULL,
    "filterKey" TEXT NOT NULL,
    "filterValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportRecipient" (
    "id" TEXT NOT NULL,
    "reportScheduleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportField" (
    "id" TEXT NOT NULL,
    "reportScheduleId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportHistory" (
    "id" TEXT NOT NULL,
    "reportScheduleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "recordCount" INTEGER,
    "fileSize" INTEGER,
    "filePath" TEXT,
    "errorMessage" TEXT,
    "errorDetails" TEXT,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsFailed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPreferences" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "hasSeenOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "onboardingDismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportSchedule_shop_idx" ON "public"."ReportSchedule"("shop");

-- CreateIndex
CREATE INDEX "ReportSchedule_isActive_nextRunAt_idx" ON "public"."ReportSchedule"("isActive", "nextRunAt");

-- CreateIndex
CREATE INDEX "ReportFilter_reportScheduleId_idx" ON "public"."ReportFilter"("reportScheduleId");

-- CreateIndex
CREATE INDEX "ReportRecipient_reportScheduleId_idx" ON "public"."ReportRecipient"("reportScheduleId");

-- CreateIndex
CREATE INDEX "ReportField_reportScheduleId_idx" ON "public"."ReportField"("reportScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportField_reportScheduleId_fieldKey_key" ON "public"."ReportField"("reportScheduleId", "fieldKey");

-- CreateIndex
CREATE INDEX "ReportHistory_reportScheduleId_idx" ON "public"."ReportHistory"("reportScheduleId");

-- CreateIndex
CREATE INDEX "ReportHistory_status_idx" ON "public"."ReportHistory"("status");

-- CreateIndex
CREATE INDEX "ReportHistory_startedAt_idx" ON "public"."ReportHistory"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_shop_key" ON "public"."UserPreferences"("shop");

-- CreateIndex
CREATE INDEX "UserPreferences_shop_idx" ON "public"."UserPreferences"("shop");

-- AddForeignKey
ALTER TABLE "public"."ReportFilter" ADD CONSTRAINT "ReportFilter_reportScheduleId_fkey" FOREIGN KEY ("reportScheduleId") REFERENCES "public"."ReportSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportRecipient" ADD CONSTRAINT "ReportRecipient_reportScheduleId_fkey" FOREIGN KEY ("reportScheduleId") REFERENCES "public"."ReportSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportField" ADD CONSTRAINT "ReportField_reportScheduleId_fkey" FOREIGN KEY ("reportScheduleId") REFERENCES "public"."ReportSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportHistory" ADD CONSTRAINT "ReportHistory_reportScheduleId_fkey" FOREIGN KEY ("reportScheduleId") REFERENCES "public"."ReportSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
