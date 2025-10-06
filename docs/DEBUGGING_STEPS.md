# Debugging Steps - Missing Terminal Logs

## The Problem

You're receiving empty reports via email, but **no terminal logs are appearing** when you manually execute a report. This suggests the execution might be:

1. Failing silently before reaching the data fetching code
2. Running in a different process that's not logging to your terminal
3. Being caught by an error handler that's not logging

## What I've Added

I've added extensive logging at **every step** of the execution flow:

### 1. API Route (`app/routes/api.reports.$id.run.tsx`)
- Logs when the "Run Now" button is clicked
- Shows report details, filters, and shop info
- Confirms access token is present
- Logs execution start and completion

### 2. Manual Execution Service (`executeReportManually`)
- Logs when manual execution is requested
- Shows all parameters being passed
- Logs success/failure with details

### 3. Main Execution Service (`executeReport`)
- Logs at the very start with timestamp
- Shows each step of the execution process
- Logs data fetching, processing, and email sending

### 4. Data Fetcher (`fetchFinanceSummaryData`)
- Logs with unique execution ID
- Shows date calculations step-by-step
- Logs query filter being sent to Shopify
- Shows orders fetched per page

## Steps to Debug

### Step 1: Restart the Server

**IMPORTANT:** Stop and restart your dev server to load the new logging code.

```bash
# In your terminal where the server is running:
# Press Ctrl+C to stop

# Then restart:
npm run dev
```

### Step 2: Run the Report

1. Go to http://localhost:3000
2. Navigate to "Scheduled Reports"
3. Find your Finance Summary report
4. Click "Run Now"
5. Confirm the dialog

### Step 3: Watch the Terminal

You should see logs like this:

```
========== MANUAL REPORT EXECUTION TRIGGERED ==========
Report ID: d2c943ce-fac2-463b-ad4e-8867b0646ad4
Report Type: FINANCE_SUMMARY
Report Name: Finance Summary
Shop: your-store.myshopify.com
Recipient Count: 1
Filter Count: 2
Filters: [...]
=======================================================

✅ Access token present, starting execution...

========== [MANUAL EXECUTION] START ==========
Report Schedule ID: d2c943ce-fac2-463b-ad4e-8867b0646ad4
Shop: your-store.myshopify.com
Access Token: Present
==============================================

🚀 ========== [EXECUTE REPORT] START ==========
Report Schedule ID: d2c943ce-fac2-463b-ad4e-8867b0646ad4
Shop: your-store.myshopify.com
Timestamp: 2025-10-06T21:52:41.000Z
================================================

[Report Execution] Step 1: Fetching report configuration...
[Report Execution] Created history record: 93a5e418-a7e4-4d92-9xd5-76cb07a46295
[Report Execution] Fetching data from Shopify...
[Report Execution] Filters: {...}

========== [Finance Summary abc123] START ==========
[Finance Summary abc123] Received filters: {...}
[Finance Summary abc123] After calculateDateRange:
  startDate.toISOString() = 2025-09-07T00:00:00.000Z
  endDate.toISOString() = 2025-10-06T23:59:59.999Z
...
```

## What to Look For

### Scenario 1: No Logs at All ❌

If you see **NO logs** after clicking "Run Now":

**Possible causes:**
- Server didn't restart properly
- Browser is caching the old code
- Request isn't reaching the server

**Solutions:**
1. Hard refresh the browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Check the browser console for errors (F12 → Console tab)
3. Verify the server is running on the correct port
4. Check if there are multiple terminal windows with different servers

### Scenario 2: Logs Stop Early ⚠️

If you see the initial logs but they stop before reaching the Finance Summary logs:

**Possible causes:**
- Error in report configuration fetching
- Database connection issue
- GraphQL client creation failing

**What to check:**
- Look for error messages in the logs
- Check if the history record is created
- Verify the filters are being parsed correctly

### Scenario 3: Finance Summary Logs Show Wrong Dates 📅

If you see the Finance Summary logs but dates are wrong:

**Possible causes:**
- Date calculation issue
- Timezone problem
- Variable corruption

**What to check:**
- Compare dates across all log lines
- Verify they all have the same execution ID
- Check if dates are consistent from calculation to query

### Scenario 4: Query Executes but Returns 0 Orders 🔍

If you see "Total orders fetched: 0":

**Possible causes:**
- Date range doesn't include your orders
- Sales channel filter is excluding orders
- Orders don't match the query criteria

**What to check:**
- Compare the query filter dates with your order timestamps
- Check the sales channel filter in the logs
- Test the query in Shopify's GraphQL Explorer

## Next Steps

After running the report, **copy the entire terminal output** and share it with me. The logs will tell us exactly where the issue is:

1. ✅ If logs appear → We can trace the execution flow
2. ❌ If no logs appear → We need to check the server/browser connection
3. ⚠️ If logs stop early → We need to fix the error that's occurring
4. 📅 If dates are wrong → We need to fix the date calculation
5. 🔍 If 0 orders → We need to adjust the query filter

## Quick Test

Before running the full report, you can test if the server is responding:

1. Open your browser console (F12)
2. Run this in the console:
```javascript
fetch('/api/reports/YOUR_REPORT_ID/run', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

Replace `YOUR_REPORT_ID` with your actual report ID. You should see logs in the terminal immediately.

---

**Remember:** The key is to restart the server and watch the terminal carefully. The logs will tell us exactly what's happening! 🚀

