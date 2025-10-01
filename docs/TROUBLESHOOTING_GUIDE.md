# Report Flow - Troubleshooting Guide

## Overview

This guide helps you diagnose and resolve common issues with Report Flow.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Report Execution Issues](#report-execution-issues)
3. [Email Delivery Issues](#email-delivery-issues)
4. [Scheduling Issues](#scheduling-issues)
5. [Data Issues](#data-issues)
6. [Performance Issues](#performance-issues)
7. [Database Issues](#database-issues)
8. [Shopify API Issues](#shopify-api-issues)
9. [Error Messages](#error-messages)
10. [Getting Help](#getting-help)

---

## Installation Issues

### App Won't Install

**Symptoms:**
- Installation fails
- Error message during installation
- App doesn't appear in Shopify admin

**Possible Causes:**
1. Insufficient permissions
2. Invalid API credentials
3. Network issues
4. Shopify Partner account issues

**Solutions:**

1. **Check Shopify Partner Account:**
   - Verify account is active
   - Ensure app is created in Partner Dashboard
   - Check API key and secret are correct

2. **Verify Scopes:**
   - Ensure all required scopes are requested:
     - `read_products`
     - `read_orders`
     - `read_customers`
     - `read_inventory`
     - `read_discounts`
     - `read_analytics`

3. **Check App URL:**
   - Verify SHOPIFY_APP_URL is correct
   - Ensure URL is accessible
   - Check SSL certificate is valid

4. **Review Logs:**
   ```bash
   # Check application logs
   npm run logs
   ```

---

### Database Migration Fails

**Symptoms:**
- Migration errors during setup
- Database connection errors
- Tables not created

**Solutions:**

1. **Check DATABASE_URL:**
   ```bash
   # Verify connection string format
   postgresql://user:password@host:5432/database
   ```

2. **Run Migrations Manually:**
   ```bash
   npx prisma migrate reset
   npx prisma migrate deploy
   ```

3. **Check Database Permissions:**
   - Ensure user has CREATE TABLE permissions
   - Verify database exists
   - Check network access to database

---

## Report Execution Issues

### Report Fails to Execute

**Symptoms:**
- Report status shows "FAILED"
- Error notification received
- No CSV file generated

**Common Error Categories:**

#### 1. Shopify API Rate Limit

**Error Message:** "Throttled" or "Rate limit exceeded"

**Solutions:**
- Wait for next scheduled run (automatic retry)
- Reduce report frequency
- Use smaller date ranges
- Stagger report schedules

#### 2. Authentication Error

**Error Message:** "Invalid access token" or "Authentication failed"

**Solutions:**
- Reinstall the app
- Check app permissions
- Verify Shopify session is valid
- Check SHOPIFY_API_KEY and SHOPIFY_API_SECRET

#### 3. Data Not Found

**Error Message:** "No data found" or "No records match filters"

**Solutions:**
- Expand date range
- Remove restrictive filters
- Use "Preview Report" to test filters
- Verify store has data for selected period

#### 4. Data Processing Error

**Error Message:** "Failed to process data" or "Invalid data format"

**Solutions:**
- Check for corrupted data in Shopify
- Verify report type configuration
- Review error details in report history
- Contact support with execution ID

#### 5. File Generation Error

**Error Message:** "Failed to generate CSV" or "File write error"

**Solutions:**
- Check disk space
- Verify reports directory exists and is writable
- Check file permissions
- Review server logs

---

### Report Takes Too Long

**Symptoms:**
- Report execution exceeds 5 minutes
- Timeout errors
- Incomplete data

**Solutions:**

1. **Reduce Date Range:**
   - Use smaller date ranges (e.g., 7 days instead of 90 days)
   - Split large reports into multiple smaller reports

2. **Optimize Filters:**
   - Add more specific filters
   - Reduce number of records processed

3. **Check Shopify API Performance:**
   - Verify Shopify status: https://status.shopify.com
   - Check for API degradation

4. **Increase Timeout:**
   ```typescript
   // In reportExecutionService.server.ts
   const EXECUTION_TIMEOUT = 600000; // 10 minutes
   ```

---

### Report Runs Multiple Times

**Symptoms:**
- Duplicate emails received
- Multiple executions in history
- Same report runs repeatedly

**Solutions:**

1. **Check Schedule Configuration:**
   - Verify schedule time is correct
   - Check timezone setting
   - Ensure only one schedule is active

2. **Check for Duplicate Reports:**
   - Review scheduled reports list
   - Delete duplicate reports

3. **Verify Scheduler:**
   ```bash
   # Check scheduler logs
   grep "Scheduler" logs/app.log
   ```

---

## Email Delivery Issues

### Emails Not Received

**Symptoms:**
- Report executes successfully
- No email received
- Email count shows 0 in history

**Solutions:**

1. **Check Spam/Junk Folder:**
   - Look for emails from sender address
   - Add sender to contacts/safe senders

2. **Verify Email Address:**
   - Check recipient email is correct
   - Test with different email address
   - Verify email address format

3. **Check SMTP Configuration:**
   ```bash
   # Verify SMTP settings
   echo $SMTP_HOST
   echo $SMTP_PORT
   echo $SMTP_USER
   ```

4. **Test Email Service:**
   ```bash
   # Run email test script
   node scripts/test-email.js
   ```

5. **Review Email Logs:**
   - Check for SMTP errors
   - Verify authentication succeeded
   - Look for delivery failures

---

### Email Delivery Fails

**Symptoms:**
- Error notification about email failure
- "Email delivery failed" in history
- SMTP errors in logs

**Common SMTP Errors:**

#### 1. Authentication Failed

**Error:** "Invalid login" or "Authentication failed"

**Solutions:**
- Verify SMTP_USER and SMTP_PASSWORD
- Use app password instead of account password (Gmail)
- Check 2FA settings
- Verify SMTP credentials haven't expired

#### 2. Connection Refused

**Error:** "Connection refused" or "ECONNREFUSED"

**Solutions:**
- Check SMTP_HOST and SMTP_PORT
- Verify firewall allows outbound SMTP
- Check network connectivity
- Try alternative SMTP port (465 or 587)

#### 3. Recipient Rejected

**Error:** "Recipient address rejected" or "Invalid recipient"

**Solutions:**
- Verify email address is valid
- Check for typos in email address
- Ensure recipient domain exists
- Try different recipient

#### 4. Message Too Large

**Error:** "Message exceeds maximum size" or "552 Message size exceeds"

**Solutions:**
- Reduce report size
- Use more restrictive filters
- Split into multiple reports
- Compress CSV file

---

### Attachment Missing

**Symptoms:**
- Email received but no CSV attached
- Empty attachment
- Corrupted CSV file

**Solutions:**

1. **Check File Generation:**
   - Verify CSV file was created
   - Check reports directory
   - Review file generation logs

2. **Check File Size:**
   - Verify file isn't too large (>10MB)
   - Check SMTP size limits

3. **Verify File Path:**
   ```typescript
   // Check reports directory exists
   const reportsDir = path.join(process.cwd(), 'reports');
   ```

---

## Scheduling Issues

### Report Doesn't Run on Schedule

**Symptoms:**
- Report never executes
- Next run time passes without execution
- No entries in report history

**Solutions:**

1. **Check Report is Active:**
   - Verify report status is "Active"
   - Ensure report isn't paused
   - Check isActive flag in database

2. **Verify Scheduler is Running:**
   ```bash
   # Check scheduler status
   curl http://localhost:3000/api/scheduler
   ```

3. **Check Next Run Time:**
   - Verify nextRunAt is in the future
   - Check timezone configuration
   - Ensure schedule calculation is correct

4. **Review Scheduler Logs:**
   ```bash
   # Check for scheduler errors
   grep "backgroundScheduler" logs/app.log
   ```

5. **Restart Application:**
   ```bash
   # Restart to reinitialize scheduler
   npm run restart
   ```

---

### Wrong Schedule Time

**Symptoms:**
- Report runs at wrong time
- Time doesn't match configuration
- Timezone issues

**Solutions:**

1. **Check Timezone Setting:**
   - Verify timezone in report configuration
   - Use IANA timezone format (e.g., "America/New_York")
   - Check server timezone

2. **Verify Schedule Calculation:**
   ```typescript
   // Test schedule calculation
   import { calculateNextRunTime } from '~/utils/timezoneHelper';
   const nextRun = calculateNextRunTime(frequency, time, timezone);
   console.log(nextRun);
   ```

3. **Check Daylight Saving Time:**
   - DST transitions may affect schedule
   - Verify timezone handles DST correctly

---

## Data Issues

### Missing Data in Report

**Symptoms:**
- Report has fewer records than expected
- Some data is missing
- Incomplete results

**Solutions:**

1. **Check Filters:**
   - Review filter configuration
   - Use "Preview Report" to test
   - Verify filters aren't too restrictive

2. **Check Date Range:**
   - Ensure date range includes expected data
   - Verify timezone for date filtering
   - Check for data in Shopify admin

3. **Check Pagination:**
   - Verify all pages are fetched
   - Check for pagination errors in logs
   - Review cursor-based pagination logic

4. **Check Record Limit:**
   - Reports limited to 10,000 records
   - Use filters to reduce dataset
   - Split into multiple reports

---

### Incorrect Data in Report

**Symptoms:**
- Numbers don't match Shopify admin
- Calculations are wrong
- Data formatting issues

**Solutions:**

1. **Verify Data Source:**
   - Check Shopify GraphQL API response
   - Compare with Shopify admin
   - Review data processing logic

2. **Check Calculations:**
   - Verify aggregation logic (Sales reports)
   - Check currency formatting
   - Review date grouping

3. **Check Data Types:**
   - Verify field types match expectations
   - Check for null/undefined values
   - Review data transformation logic

---

## Performance Issues

### Slow Report Execution

**Symptoms:**
- Reports take longer than expected
- Timeout warnings
- High server load

**Solutions:**

1. **Optimize Queries:**
   - Add database indexes
   - Use efficient filters
   - Reduce data fetched

2. **Optimize Shopify API Calls:**
   - Reduce page size if needed
   - Implement caching
   - Use GraphQL field selection

3. **Scale Resources:**
   - Increase server memory
   - Add more CPU cores
   - Use faster database

---

### High Memory Usage

**Symptoms:**
- Application crashes
- Out of memory errors
- Slow performance

**Solutions:**

1. **Reduce Report Size:**
   - Limit records per report
   - Use streaming for large datasets
   - Process data in chunks

2. **Optimize Code:**
   - Fix memory leaks
   - Clear unused variables
   - Use efficient data structures

3. **Increase Memory Limit:**
   ```bash
   # Increase Node.js memory
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

---

## Database Issues

### Connection Pool Exhausted

**Error:** "Too many connections" or "Connection pool timeout"

**Solutions:**

1. **Increase Pool Size:**
   ```prisma
   datasource db {
     url = env("DATABASE_URL")
     connectionLimit = 20
   }
   ```

2. **Close Connections:**
   - Ensure connections are properly closed
   - Use Prisma client correctly
   - Review connection lifecycle

3. **Use Connection Pooling:**
   - Use PgBouncer or similar
   - Configure pool settings
   - Monitor connection usage

---

### Slow Queries

**Symptoms:**
- Database queries take too long
- Application timeouts
- High database CPU

**Solutions:**

1. **Add Indexes:**
   ```prisma
   model ReportSchedule {
     @@index([shop])
     @@index([nextRunAt])
     @@index([isActive])
   }
   ```

2. **Optimize Queries:**
   - Use select to limit fields
   - Add where clauses
   - Use includes efficiently

3. **Analyze Query Performance:**
   ```bash
   # Enable Prisma query logging
   DATABASE_URL="...?connection_limit=10&pool_timeout=20"
   ```

---

## Shopify API Issues

### Rate Limiting

**Error:** "Throttled" or "429 Too Many Requests"

**Solutions:**

1. **Implement Backoff:**
   - Already implemented in shopifyDataFetcher
   - Exponential backoff with retries
   - Automatic retry on rate limit

2. **Reduce Request Frequency:**
   - Stagger report schedules
   - Use larger page sizes
   - Cache data when possible

3. **Monitor API Usage:**
   - Check Shopify Partner Dashboard
   - Review API call patterns
   - Optimize queries

---

### GraphQL Errors

**Error:** "GraphQL error" or "Invalid query"

**Solutions:**

1. **Verify Query Syntax:**
   - Check GraphQL query structure
   - Validate field names
   - Test in GraphiQL

2. **Check API Version:**
   - Ensure using correct API version
   - Check for deprecated fields
   - Review Shopify changelog

3. **Review Error Details:**
   - Check error message
   - Look for field-specific errors
   - Verify data types

---

## Error Messages

### Common Error Messages and Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Report not found" | Invalid report ID | Check report exists |
| "Unauthorized" | Not authenticated | Reinstall app |
| "Invalid email address" | Bad email format | Fix email address |
| "No recipients configured" | No recipients added | Add at least one recipient |
| "Invalid schedule configuration" | Bad schedule settings | Review schedule settings |
| "Database connection failed" | Database unavailable | Check DATABASE_URL |
| "SMTP connection failed" | Email server issue | Check SMTP settings |
| "File not found" | CSV file missing | Check reports directory |

---

## Getting Help

### Before Contacting Support

1. **Check this guide** for common solutions
2. **Review error messages** in report history
3. **Check application logs** for details
4. **Test with simple report** to isolate issue
5. **Verify environment variables** are correct

### Information to Provide

When contacting support, include:

1. **Store URL:** your-store.myshopify.com
2. **Report Name/ID:** From scheduled reports list
3. **Execution ID:** From report history
4. **Error Message:** Full error text
5. **Steps to Reproduce:** How to recreate the issue
6. **Screenshots:** Visual evidence
7. **Logs:** Relevant log entries
8. **Environment:** Production/staging/development

### Support Channels

- **Email:** support@reportflow.app
- **Documentation:** https://docs.reportflow.app
- **Status Page:** https://status.reportflow.app
- **GitHub Issues:** https://github.com/reportflow/issues

### Response Times

- **Critical Issues:** Within 4 hours
- **High Priority:** Within 24 hours
- **Normal Priority:** Within 48 hours
- **Low Priority:** Within 1 week

---

## Diagnostic Commands

### Check Application Status

```bash
# Check if app is running
curl http://localhost:3000/health

# Check scheduler status
curl http://localhost:3000/api/scheduler

# View recent logs
tail -f logs/app.log
```

### Check Database

```bash
# Open Prisma Studio
npx prisma studio

# Check database connection
npx prisma db pull

# View migrations
npx prisma migrate status
```

### Check Email Configuration

```bash
# Test SMTP connection
node scripts/test-email.js

# Check environment variables
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
```

### Check Shopify Connection

```bash
# Test Shopify API
node scripts/test-shopify-api.js

# Check scopes
node scripts/check-scopes.js
```

---

## Preventive Measures

### Regular Maintenance

1. **Monitor Logs:** Review logs daily for errors
2. **Check Execution History:** Verify reports are running
3. **Test Email Delivery:** Send test emails weekly
4. **Update Dependencies:** Keep packages up to date
5. **Backup Database:** Regular database backups
6. **Monitor Performance:** Track execution times

### Best Practices

1. **Use Descriptive Names:** Name reports clearly
2. **Test Filters:** Use preview before scheduling
3. **Stagger Schedules:** Don't run all reports at once
4. **Keep Recipients Updated:** Remove inactive recipients
5. **Monitor Report Size:** Keep reports under 10,000 records
6. **Review Error Notifications:** Act on failures promptly

---

## Advanced Troubleshooting

### Enable Debug Logging

```bash
# Set log level to debug
LOG_LEVEL=debug npm start
```

### Database Query Logging

```typescript
// In prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

### Network Debugging

```bash
# Check network connectivity
ping smtp.gmail.com
telnet smtp.gmail.com 587

# Check DNS resolution
nslookup your-store.myshopify.com
```

---

## Known Issues

### Issue: Scheduler stops after server restart

**Status:** Known issue  
**Workaround:** Scheduler auto-restarts on next request  
**Fix:** Planned for v1.1

### Issue: Large reports timeout

**Status:** Known limitation  
**Workaround:** Use smaller date ranges  
**Fix:** Streaming implementation planned

---

**Last Updated:** 2025-10-01  
**Version:** 1.0.0

