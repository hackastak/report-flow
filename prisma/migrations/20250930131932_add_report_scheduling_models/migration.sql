-- CreateTable
CREATE TABLE "ReportSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "lastRunAt" DATETIME,
    "nextRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReportFilter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportScheduleId" TEXT NOT NULL,
    "filterKey" TEXT NOT NULL,
    "filterValue" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportFilter_reportScheduleId_fkey" FOREIGN KEY ("reportScheduleId") REFERENCES "ReportSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportScheduleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportRecipient_reportScheduleId_fkey" FOREIGN KEY ("reportScheduleId") REFERENCES "ReportSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportScheduleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "recordCount" INTEGER,
    "fileSize" INTEGER,
    "filePath" TEXT,
    "errorMessage" TEXT,
    "errorDetails" TEXT,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsFailed" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ReportHistory_reportScheduleId_fkey" FOREIGN KEY ("reportScheduleId") REFERENCES "ReportSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ReportSchedule_shop_idx" ON "ReportSchedule"("shop");

-- CreateIndex
CREATE INDEX "ReportSchedule_isActive_nextRunAt_idx" ON "ReportSchedule"("isActive", "nextRunAt");

-- CreateIndex
CREATE INDEX "ReportFilter_reportScheduleId_idx" ON "ReportFilter"("reportScheduleId");

-- CreateIndex
CREATE INDEX "ReportRecipient_reportScheduleId_idx" ON "ReportRecipient"("reportScheduleId");

-- CreateIndex
CREATE INDEX "ReportHistory_reportScheduleId_idx" ON "ReportHistory"("reportScheduleId");

-- CreateIndex
CREATE INDEX "ReportHistory_status_idx" ON "ReportHistory"("status");

-- CreateIndex
CREATE INDEX "ReportHistory_startedAt_idx" ON "ReportHistory"("startedAt");
