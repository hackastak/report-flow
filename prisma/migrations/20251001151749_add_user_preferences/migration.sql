-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "hasSeenOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "onboardingDismissedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_shop_key" ON "UserPreferences"("shop");

-- CreateIndex
CREATE INDEX "UserPreferences_shop_idx" ON "UserPreferences"("shop");
