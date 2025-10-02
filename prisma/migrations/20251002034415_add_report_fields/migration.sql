-- CreateTable
CREATE TABLE "ReportField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportScheduleId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportField_reportScheduleId_fkey" FOREIGN KEY ("reportScheduleId") REFERENCES "ReportSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ReportField_reportScheduleId_idx" ON "ReportField"("reportScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportField_reportScheduleId_fieldKey_key" ON "ReportField"("reportScheduleId", "fieldKey");
