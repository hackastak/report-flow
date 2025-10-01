# Report Flow - Deployment Guide

## Overview

This guide covers deploying Report Flow to production, including environment setup, database configuration, email service setup, and monitoring.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Email Service Configuration](#email-service-configuration)
5. [Deployment Platforms](#deployment-platforms)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

1. **Shopify Partner Account**
   - Create at: https://partners.shopify.com
   - Create a new app
   - Note your API key and secret

2. **Database Provider**
   - PostgreSQL database (recommended: Supabase, Railway, or Neon)
   - Minimum: 1GB storage
   - Connection pooling recommended

3. **Email Service**
   - SMTP server (Gmail, SendGrid, Mailgun, etc.)
   - Sender email address
   - SMTP credentials

4. **Hosting Platform**
   - Shopify hosting (recommended)
   - Or: Vercel, Railway, Fly.io, Heroku

### Required Tools

- Node.js 18+ and npm
- Git
- Prisma CLI (`npm install -g prisma`)

---

## Environment Variables

### Required Variables

Create a `.env` file with the following variables:

```bash
# Shopify App Configuration
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_APP_URL=https://your-app-url.com
SCOPES=read_products,read_orders,read_customers,read_inventory,read_discounts,read_analytics

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@reportflow.app
SMTP_FROM_NAME=Report Flow

# Session Storage
SESSION_SECRET=your-random-secret-here-min-32-chars

# Node Environment
NODE_ENV=production
```

### Optional Variables

```bash
# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# File Storage
REPORTS_DIR=./reports
MAX_REPORT_SIZE=10485760

# Background Jobs
SCHEDULER_ENABLED=true
SCHEDULER_INTERVAL=*/5 * * * *
```

---

## Database Setup

### 1. Create Database

**Using Supabase:**
```bash
# Create project at https://supabase.com
# Copy connection string from project settings
```

**Using Railway:**
```bash
# Create project at https://railway.app
# Add PostgreSQL service
# Copy connection string
```

**Using Neon:**
```bash
# Create project at https://neon.tech
# Copy connection string
```

### 2. Update DATABASE_URL

```bash
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

### 3. Run Migrations

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma db push
```

### 4. Seed Database (Optional)

```bash
# Create seed script if needed
npx prisma db seed
```

---

## Email Service Configuration

### Gmail Setup

1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to Google Account Settings
   - Security → App Passwords
   - Generate password for "Mail"
3. Use app password in SMTP_PASSWORD

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

### SendGrid Setup

1. Create account at https://sendgrid.com
2. Create API key
3. Verify sender email

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Mailgun Setup

1. Create account at https://mailgun.com
2. Add and verify domain
3. Get SMTP credentials

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.com
SMTP_PASSWORD=your-mailgun-password
```

### Test Email Configuration

```bash
# Create test script
node scripts/test-email.js
```

---

## Deployment Platforms

### Shopify Hosting (Recommended)

**Advantages:**
- Integrated with Shopify ecosystem
- Automatic scaling
- Built-in SSL
- Easy deployment

**Steps:**

1. **Install Shopify CLI:**
```bash
npm install -g @shopify/cli
```

2. **Login:**
```bash
shopify auth login
```

3. **Deploy:**
```bash
shopify app deploy
```

4. **Configure Environment Variables:**
```bash
shopify app env set SMTP_HOST=smtp.gmail.com
shopify app env set SMTP_USER=your-email@gmail.com
# ... set all required variables
```

5. **Run Migrations:**
```bash
shopify app db migrate
```

---

### Railway

**Advantages:**
- Simple deployment
- Built-in PostgreSQL
- Automatic SSL
- Good free tier

**Steps:**

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Initialize:**
```bash
railway init
```

4. **Add PostgreSQL:**
```bash
railway add postgresql
```

5. **Set Environment Variables:**
```bash
railway variables set SHOPIFY_API_KEY=your_key
railway variables set SHOPIFY_API_SECRET=your_secret
# ... set all required variables
```

6. **Deploy:**
```bash
railway up
```

---

### Vercel

**Advantages:**
- Fast deployment
- Global CDN
- Automatic SSL
- Good free tier

**Steps:**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Set Environment Variables:**
```bash
vercel env add SHOPIFY_API_KEY
vercel env add SHOPIFY_API_SECRET
# ... add all required variables
```

5. **Redeploy:**
```bash
vercel --prod
```

**Note:** Vercel has serverless function limitations. Background scheduler may need external cron service.

---

### Fly.io

**Advantages:**
- Full control
- Global deployment
- Good pricing
- Persistent storage

**Steps:**

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login:**
```bash
fly auth login
```

3. **Launch:**
```bash
fly launch
```

4. **Set Secrets:**
```bash
fly secrets set SHOPIFY_API_KEY=your_key
fly secrets set SHOPIFY_API_SECRET=your_secret
# ... set all required variables
```

5. **Deploy:**
```bash
fly deploy
```

---

## Post-Deployment

### 1. Verify Deployment

**Check Health:**
```bash
curl https://your-app-url.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-01T12:00:00Z"
}
```

### 2. Test Shopify Integration

1. Install app on test store
2. Create a test report
3. Run report manually
4. Verify email delivery

### 3. Configure Shopify App

1. Go to Shopify Partner Dashboard
2. Select your app
3. Update App URL: `https://your-app-url.com`
4. Update Redirect URLs:
   - `https://your-app-url.com/auth/callback`
   - `https://your-app-url.com/auth/shopify/callback`
5. Save changes

### 4. Test Background Scheduler

1. Create a report scheduled for next 5 minutes
2. Wait for execution
3. Check report history
4. Verify email received

### 5. Monitor Logs

```bash
# Shopify
shopify app logs

# Railway
railway logs

# Vercel
vercel logs

# Fly.io
fly logs
```

---

## Monitoring

### Application Monitoring

**Recommended Tools:**
- Sentry (error tracking)
- LogRocket (session replay)
- DataDog (APM)
- New Relic (performance)

**Setup Sentry:**

1. Create account at https://sentry.io
2. Install SDK:
```bash
npm install @sentry/node
```

3. Initialize in `app/entry.server.tsx`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Database Monitoring

**Metrics to Track:**
- Connection pool usage
- Query performance
- Database size
- Slow queries

**Tools:**
- Prisma Studio (development)
- pgAdmin (PostgreSQL)
- Database provider dashboard

### Email Monitoring

**Metrics to Track:**
- Delivery rate
- Bounce rate
- Open rate (if tracking enabled)
- Failed deliveries

**Tools:**
- Email service dashboard
- Custom logging

### Background Job Monitoring

**Metrics to Track:**
- Execution success rate
- Execution duration
- Queue length
- Failed jobs

**Implementation:**
```typescript
// Add to backgroundScheduler.server.ts
console.log(`[Scheduler] Metrics: {
  totalExecutions: ${totalExecutions},
  successRate: ${successRate}%,
  avgDuration: ${avgDuration}ms
}`);
```

---

## Troubleshooting

### Database Connection Issues

**Error:** "Can't reach database server"

**Solutions:**
1. Check DATABASE_URL is correct
2. Verify database is running
3. Check firewall rules
4. Verify SSL mode if required

### Email Delivery Issues

**Error:** "SMTP connection failed"

**Solutions:**
1. Verify SMTP credentials
2. Check SMTP_HOST and SMTP_PORT
3. Enable "Less secure apps" (Gmail)
4. Use app password instead of account password
5. Check firewall/network restrictions

### Background Scheduler Not Running

**Error:** Reports not executing on schedule

**Solutions:**
1. Check SCHEDULER_ENABLED=true
2. Verify cron expression is valid
3. Check server timezone
4. Review scheduler logs
5. Ensure process stays running (use PM2 or similar)

### Shopify Authentication Errors

**Error:** "Invalid API key or access token"

**Solutions:**
1. Verify SHOPIFY_API_KEY and SHOPIFY_API_SECRET
2. Check app is installed on store
3. Verify scopes match requirements
4. Reinstall app if needed

### High Memory Usage

**Symptoms:** App crashes or slows down

**Solutions:**
1. Reduce report size limits
2. Implement pagination for large datasets
3. Add memory limits to processes
4. Scale up server resources
5. Optimize database queries

---

## Security Checklist

- [ ] All environment variables set securely
- [ ] DATABASE_URL uses SSL
- [ ] SESSION_SECRET is random and secure (32+ chars)
- [ ] SMTP credentials are app passwords, not account passwords
- [ ] Shopify API credentials are kept secret
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)
- [ ] CSRF protection enabled

---

## Performance Optimization

### Database

- [ ] Indexes on frequently queried fields
- [ ] Connection pooling enabled
- [ ] Query optimization
- [ ] Regular VACUUM (PostgreSQL)

### Application

- [ ] Caching enabled
- [ ] Gzip compression
- [ ] CDN for static assets
- [ ] Code splitting
- [ ] Lazy loading

### Background Jobs

- [ ] Queue system for large jobs
- [ ] Rate limiting for Shopify API
- [ ] Retry logic with exponential backoff
- [ ] Job timeout limits

---

## Backup Strategy

### Database Backups

**Automated:**
- Daily full backups
- Point-in-time recovery enabled
- 30-day retention

**Manual:**
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Import database
psql $DATABASE_URL < backup.sql
```

### File Backups

**Reports Directory:**
- Backup generated CSV files
- 30-day retention
- Cloud storage (S3, GCS, etc.)

---

## Scaling Considerations

### Horizontal Scaling

- Load balancer
- Multiple app instances
- Shared database
- Distributed caching

### Vertical Scaling

- Increase server resources
- Optimize database
- Add read replicas
- Implement caching

---

## Support

For deployment issues, contact:
- Email: support@reportflow.app
- Documentation: https://docs.reportflow.app
- GitHub Issues: https://github.com/reportflow/issues

