# Background Scheduler Documentation

## Overview

The Background Scheduler automatically executes scheduled reports using node-cron. It runs every 5 minutes, checks for reports that are due to run, and executes them in the background.

## File Locations

- `app/services/backgroundScheduler.server.ts` - Main scheduler service
- `app/services/scheduler.init.server.ts` - Initialization module
- `app/routes/api.scheduler.tsx` - API route for management
- `app/entry.server.tsx` - Imports scheduler initialization

---

## Main Functions

### `startScheduler(): void`

Starts the background scheduler with a cron job.

**Schedule:** Every 5 minutes (`*/5 * * * *`)

**Example Usage:**
```typescript
import { startScheduler } from "~/services/backgroundScheduler.server";

startScheduler();
// [Scheduler] Starting background scheduler...
// [Scheduler] Background scheduler started (runs every 5 minutes)
```

---

### `stopScheduler(): void`

Stops the background scheduler.

**Example Usage:**
```typescript
import { stopScheduler } from "~/services/backgroundScheduler.server";

stopScheduler();
// [Scheduler] Stopping background scheduler...
// [Scheduler] Background scheduler stopped
```

---

### `getSchedulerStatus(): object`

Returns the current status of the scheduler.

**Returns:**
```typescript
{
  isRunning: boolean;
  runningJobs: string[];  // Array of shop domains currently processing
  jobCount: number;       // Number of shops currently processing
}
```

**Example Usage:**
```typescript
import { getSchedulerStatus } from "~/services/backgroundScheduler.server";

const status = getSchedulerStatus();
console.log(`Scheduler running: ${status.isRunning}`);
console.log(`Active jobs: ${status.jobCount}`);
```

---

### `triggerSchedulerCheck(): Promise<void>`

Manually triggers a scheduler check (for testing).

**Example Usage:**
```typescript
import { triggerSchedulerCheck } from "~/services/backgroundScheduler.server";

await triggerSchedulerCheck();
// [Scheduler] Manual trigger requested
// [Scheduler] Checking for scheduled reports...
```

---

## How It Works

### Initialization

**On App Start:**
1. `entry.server.tsx` imports `scheduler.init.server.ts`
2. Initialization module waits 5 seconds
3. Calls `startScheduler()`
4. Cron job is registered

**Code:**
```typescript
// app/entry.server.tsx
import "./services/scheduler.init.server";

// app/services/scheduler.init.server.ts
setTimeout(() => {
  startScheduler();
}, 5000); // 5 second delay
```

---

### Execution Flow

```
Every 5 Minutes
       ↓
[Cron Job Triggers]
       ↓
checkAndExecuteReports()
       ↓
1. Query database for due reports
   WHERE isActive = true
   AND nextRunAt <= now
       ↓
2. Group reports by shop
       ↓
3. For each shop:
   - Check if already running (prevent duplicates)
   - Mark as running
   - Execute reports in background
   - Remove from running jobs when done
       ↓
4. For each report:
   - Get shop session/access token
   - Call executeScheduledReports()
   - Track success/failure
       ↓
5. Log results
```

---

### Duplicate Prevention

**Problem:** Multiple scheduler runs could execute the same report twice

**Solution:** Track running jobs per shop

**Implementation:**
```typescript
const runningJobs = new Set<string>();

// Before executing
if (runningJobs.has(shop)) {
  console.log(`Skipping ${shop} - already running`);
  continue;
}

// Mark as running
runningJobs.add(shop);

// Execute in background
executeReportsForShop(shop, reports)
  .finally(() => {
    runningJobs.delete(shop);
  });
```

**Benefits:**
- ✅ Prevents duplicate executions
- ✅ Per-shop tracking
- ✅ Automatic cleanup

---

## Cron Schedule

### Current Schedule

**Pattern:** `*/5 * * * *`

**Meaning:** Every 5 minutes

**Examples:**
- 10:00 AM
- 10:05 AM
- 10:10 AM
- 10:15 AM
- etc.

---

### Alternative Schedules

**Every Minute (for testing):**
```typescript
cron.schedule("* * * * *", async () => {
  await checkAndExecuteReports();
});
```

**Every 10 Minutes:**
```typescript
cron.schedule("*/10 * * * *", async () => {
  await checkAndExecuteReports();
});
```

**Every Hour:**
```typescript
cron.schedule("0 * * * *", async () => {
  await checkAndExecuteReports();
});
```

**Specific Times:**
```typescript
// Every day at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  await checkAndExecuteReports();
});

// Every Monday at 8:00 AM
cron.schedule("0 8 * * 1", async () => {
  await checkAndExecuteReports();
});
```

---

## Session Management

### Getting Shop Access Token

**Challenge:** Background jobs don't have request context

**Solution:** Use Shopify's offline session storage

**Implementation:**
```typescript
async function getShopSession(shop: string) {
  const { shopify } = await import("../shopify.server");
  
  // Get offline session ID
  const sessionId = shopify.session.getOfflineId(shop);
  
  // Load session from storage
  const session = await shopify.config.sessionStorage.loadSession(sessionId);
  
  if (!session || !session.accessToken) {
    return null;
  }
  
  return {
    accessToken: session.accessToken,
  };
}
```

**Session Types:**
- **Online Session:** Tied to user, expires after 24 hours
- **Offline Session:** Tied to shop, long-lived, used for background jobs

**Requirements:**
- App must request offline access during installation
- Sessions must be stored in database or persistent storage
- Access tokens must be kept secure

---

## Logging

### Log Examples

**Scheduler Start:**
```
[Scheduler] Starting background scheduler...
[Scheduler] Background scheduler started (runs every 5 minutes)
```

**Checking for Reports:**
```
[Scheduler] Checking for scheduled reports...
[Scheduler] Found 3 reports due to run
[Scheduler] Processing reports for 2 shops
```

**Executing Reports:**
```
[Scheduler] Executing 2 reports for shop1.myshopify.com
[Scheduler] Executing report: Weekly Sales (report-123)
[Scheduler] Completed for shop1.myshopify.com: 2 succeeded, 0 failed
```

**No Reports Due:**
```
[Scheduler] Checking for scheduled reports...
[Scheduler] No reports due to run
```

**Duplicate Prevention:**
```
[Scheduler] Skipping shop1.myshopify.com - already running
```

**Errors:**
```
[Scheduler] No session found for shop: shop1.myshopify.com
[Scheduler] Error executing reports for shop1.myshopify.com: Connection timeout
[Scheduler] Error checking for scheduled reports: Database connection failed
```

---

## API Routes

### GET /api/scheduler

Get scheduler status.

**Response:**
```json
{
  "success": true,
  "scheduler": {
    "isRunning": true,
    "runningJobs": ["shop1.myshopify.com"],
    "jobCount": 1
  }
}
```

---

### POST /api/scheduler/trigger

Manually trigger a scheduler check.

**Response:**
```json
{
  "success": true,
  "message": "Scheduler check triggered"
}
```

**Use Cases:**
- Testing scheduler functionality
- Forcing immediate execution
- Debugging report issues

---

## Error Handling

### Error Types

1. **Database Errors**
   - Connection failures
   - Query errors
   - Logged but don't stop scheduler

2. **Session Errors**
   - No session found
   - Invalid access token
   - Skip shop and continue

3. **Execution Errors**
   - Report execution failures
   - Tracked in ReportHistory
   - Don't stop other reports

4. **Cron Errors**
   - Schedule parsing errors
   - Prevent scheduler start
   - Logged to console

### Error Recovery

**Strategy:**
- Continue processing other shops on error
- Log all errors for debugging
- Don't crash the scheduler
- Retry on next scheduled run

**Example:**
```typescript
try {
  await executeReportsForShop(shop, reports);
} catch (error) {
  console.error(`Error executing reports for ${shop}:`, error);
  // Continue to next shop
}
```

---

## Performance Considerations

### Sequential vs Parallel Execution

**Current Implementation:**
- Shops processed in parallel (non-blocking)
- Reports within a shop processed sequentially

**Code:**
```typescript
// Parallel: Don't await
for (const [shop, reports] of reportsByShop.entries()) {
  executeReportsForShop(shop, reports)
    .then(() => console.log("Done"))
    .catch((error) => console.error(error));
}
```

**Benefits:**
- ✅ Multiple shops processed simultaneously
- ✅ Fast overall execution
- ✅ Isolated failures

**Considerations:**
- Resource usage (CPU, memory, network)
- Shopify API rate limits per shop
- Database connection pool

---

### Optimization Options

**1. Batch Processing:**
```typescript
const batches = chunk(Array.from(reportsByShop.entries()), 5);
for (const batch of batches) {
  await Promise.all(batch.map(([shop, reports]) => 
    executeReportsForShop(shop, reports)
  ));
}
```

**2. Priority Queue:**
- High priority reports first
- Based on recipient count
- Based on report type

**3. Worker Threads:**
- Use Node.js worker threads
- Isolate execution
- Better resource management

---

## Testing

### Manual Testing

**1. Trigger Scheduler Check:**
```bash
curl -X POST http://localhost:3000/api/scheduler/trigger \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**2. Check Scheduler Status:**
```bash
curl http://localhost:3000/api/scheduler \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Create Test Report:**
- Set nextRunAt to current time
- Set isActive to true
- Wait for scheduler to run

---

### Unit Tests

**Test Cases:**
1. Start scheduler successfully
2. Stop scheduler successfully
3. Prevent duplicate starts
4. Find due reports correctly
5. Group reports by shop
6. Prevent duplicate executions
7. Handle missing sessions
8. Handle execution errors
9. Update next run times
10. Clean up running jobs

**Example Test:**
```typescript
describe("backgroundScheduler", () => {
  it("should find reports due to run", async () => {
    // Create test report with nextRunAt in past
    await prisma.reportSchedule.create({
      data: {
        shop: "test.myshopify.com",
        nextRunAt: new Date(Date.now() - 1000),
        isActive: true,
        // ...
      },
    });

    // Trigger scheduler
    await triggerSchedulerCheck();

    // Verify report was executed
    const history = await prisma.reportHistory.findFirst({
      where: { reportScheduleId: report.id },
    });
    expect(history).toBeDefined();
  });
});
```

---

## Deployment Considerations

### Production Setup

**1. Environment Variables:**
```env
NODE_ENV=production
```

**2. Process Management:**
- Use PM2 or similar
- Ensure single instance (or use distributed locks)
- Auto-restart on crashes

**3. Monitoring:**
- Log aggregation (Datadog, LogDNA)
- Error tracking (Sentry)
- Performance monitoring (New Relic)

**4. Scaling:**
- Single scheduler instance recommended
- Use distributed locks for multiple instances
- Consider dedicated scheduler service

---

### Heroku Deployment

**Procfile:**
```
web: npm start
```

**Scheduler runs automatically when app starts**

**Considerations:**
- Heroku dynos restart daily
- Scheduler will restart automatically
- Use Heroku Scheduler add-on as backup

---

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

**Scheduler starts with container**

---

## Future Enhancements

### 1. Distributed Locking

**Current:** Single instance only

**Enhancement:**
- Use Redis for distributed locks
- Support multiple app instances
- Prevent duplicate executions across instances

### 2. Job Queue

**Current:** Direct execution

**Enhancement:**
- Use Bull or BullMQ
- Better job management
- Retry logic
- Job prioritization

### 3. Monitoring Dashboard

**Current:** API endpoints only

**Enhancement:**
- UI for scheduler status
- View running jobs
- Manual trigger button
- Execution history

### 4. Dynamic Scheduling

**Current:** Fixed 5-minute interval

**Enhancement:**
- Adjust interval based on load
- Skip checks if no reports due
- Optimize for timezone patterns

---

## Related Documentation

- Report Execution Service: `docs/REPORT_EXECUTION_SERVICE.md`
- Email Service: `docs/EMAIL_SERVICE.md`
- API Routes: `docs/API_ROUTES.md`

