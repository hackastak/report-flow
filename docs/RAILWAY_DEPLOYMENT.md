# Railway Deployment Guide

This guide walks you through deploying Report Flow to Railway with GitHub CI/CD integration.

## Prerequisites

- GitHub account with the `hackastak/report-flow` repository
- Railway account (sign up at [railway.app](https://railway.app))
- Neon PostgreSQL database (already configured)
- SMTP credentials (already configured)

---

## Step-by-Step Deployment

### 1. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Login with GitHub"**
3. Authorize Railway to access your GitHub repositories
4. This automatically connects your GitHub account

### 2. Create New Project from GitHub

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: `hackastak/report-flow`
4. Railway will automatically:
   - Detect it's a Node.js app
   - Read your `package.json`
   - Configure build settings
   - Start the first deployment

### 3. Configure Environment Variables

In your Railway project dashboard:

1. Click on your service (should be named "report-flow")
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"** and add each of these:

```bash
# Shopify Configuration
SHOPIFY_API_KEY=a3ec7d7dc5c2359c2b0ce9dc4c06ce0a
SHOPIFY_API_SECRET=530eeac793dd7adc46384d8489465fae
SCOPES=read_orders,read_products,read_customers,read_reports,read_analytics,read_inventory,read_locations,read_price_rules,read_discounts

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_C0oOuMlg4dsw@ep-raspy-mud-ad74aw2b-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# SMTP Configuration (SMTP2Go)
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=report.flow@smilestacklabs.com
SMTP_PASSWORD=yesuApzMNdGbo5AK
SMTP_FROM=report.flow@smilestacklabs.com
SMTP_FROM_NAME=Report Flow

# Node Environment
NODE_ENV=production
PORT=3000
```

**Important:** Railway will automatically redeploy after you add variables.

### 4. Generate Public Domain

1. In your service, go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Copy the generated URL (e.g., `report-flow-production.up.railway.app`)
5. Save this URL - you'll need it for the next step

### 5. Update Shopify App Configuration

**IMPORTANT:** You must update your app URLs before the app will work.

1. Open `shopify.app.toml` in your local project
2. Replace `YOUR-RAILWAY-URL` with your actual Railway domain:

```toml
application_url = "https://your-actual-domain.up.railway.app"

[auth]
redirect_urls = [ "https://your-actual-domain.up.railway.app/auth/callback" ]
```

3. Also add the Railway URL as an environment variable in Railway:

```bash
SHOPIFY_APP_URL=https://your-actual-domain.up.railway.app
```

### 6. Deploy Configuration to Shopify

After updating `shopify.app.toml`, deploy the configuration:

```bash
# Make sure you're in the project directory
cd /Users/hackastak/Developer/SMILESTACKLABS/report-flow

# Deploy the app configuration to Shopify
shopify app deploy
```

This updates Shopify's records with your new Railway URL.

### 7. Commit and Push Changes

```bash
# Add the updated files
git add shopify.app.toml railway.json docs/RAILWAY_DEPLOYMENT.md

# Commit
git commit -m "Configure Railway deployment"

# Push to GitHub
git push origin main
```

Railway will automatically detect the push and deploy the updated code!

---

## How CI/CD Works

Once set up, Railway automatically:

1. **Watches your GitHub repository** for changes
2. **Triggers a build** when you push to `main` branch
3. **Runs the build command:** `npm ci && npm run build`
4. **Runs database migrations:** via `npm run docker-start` → `npm run setup`
5. **Starts the app:** `npm run start`
6. **Health checks** the deployment
7. **Routes traffic** to the new deployment if successful

### Deployment Triggers

Railway deploys automatically when:
- You push commits to the `main` branch
- You merge a pull request
- You manually trigger a redeploy in the Railway dashboard

### Branch Deployments (Optional)

You can also set up preview deployments for other branches:

1. In Railway, go to **Settings** → **Deployments**
2. Enable **"PR Deploys"**
3. Railway will create temporary deployments for each pull request

---

## Monitoring Your Deployment

### View Logs

1. In Railway dashboard, click your service
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. View real-time logs

**Look for these key log messages:**
```
[Scheduler Init] Initializing background scheduler...
[Scheduler] Starting background scheduler...
[Scheduler] Background scheduler started (runs every 5 minutes)
```

### Check Deployment Status

In the Railway dashboard:
- **Green checkmark** = Deployment successful
- **Red X** = Deployment failed (check logs)
- **Yellow spinner** = Deployment in progress

### Test Your App

1. Visit your Railway URL: `https://your-domain.up.railway.app`
2. You should see the Shopify app installation flow
3. Install the app on a development store to test

---

## Troubleshooting

### Deployment Fails

**Check the build logs:**
1. Go to Railway dashboard → Deployments
2. Click the failed deployment
3. Look for error messages in the logs

**Common issues:**
- Missing environment variables
- Database connection errors
- Build command failures

### App Won't Load

**Check these:**
1. Environment variables are set correctly
2. `SHOPIFY_APP_URL` matches your Railway domain
3. `shopify.app.toml` has the correct Railway URL
4. You ran `shopify app deploy` after updating URLs

### Scheduler Not Running

**Check logs for:**
```
[Scheduler Init] Initializing background scheduler...
[Scheduler] Starting background scheduler...
```

If you don't see these messages:
1. Check that `NODE_ENV` is set to `production`
2. Verify the app started successfully
3. Check for any startup errors in logs

### Database Connection Issues

**Verify:**
1. `DATABASE_URL` is set correctly in Railway
2. Neon database is accessible
3. Connection string includes `?sslmode=require`

**Test connection:**
```bash
# In Railway dashboard, open the service shell
npx prisma db push
```

---

## Scaling Considerations

### Current Setup

Your app runs on a **single Railway instance** with:
- In-memory cron scheduler (`node-cron`)
- Persistent container (doesn't sleep)
- Automatic restarts on failure

### Limitations

⚠️ **If you scale to multiple instances:**
- Cron jobs will run on EACH instance
- Reports could be sent multiple times
- You'll need distributed locking

### Future Improvements

For production at scale, consider:
1. **External cron service** (Quirrel, Inngest)
2. **Job queue** (BullMQ with Redis)
3. **Shopify webhooks** for real-time events
4. **Database-based locking** to prevent duplicate executions

---

## Cost Estimate

Railway pricing (as of 2024):

- **Free Tier:** $5 credit/month
- **Hobby Plan:** $5/month (500 hours)
- **Pro Plan:** $20/month (unlimited)

Your app should run comfortably on the **Hobby plan** for development/testing.

**Estimated usage:**
- Web service: ~$5-10/month
- Database: Using external Neon (free tier)
- Total: ~$5-10/month

---

## Rollback Procedure

If a deployment breaks something:

1. Go to Railway dashboard → **Deployments**
2. Find the last working deployment
3. Click **"⋯"** menu → **"Redeploy"**
4. Railway will rollback to that version

Or rollback via Git:
```bash
git revert HEAD
git push origin main
```

---

## Environment Management

### Development vs Production

Consider creating separate Railway projects:

1. **Production:** Connected to `main` branch
2. **Staging:** Connected to `develop` branch

This allows you to test changes before production.

### Updating Environment Variables

1. Go to Railway dashboard → Variables
2. Update the variable
3. Railway will automatically redeploy

---

## Next Steps

After successful deployment:

1. ✅ Test app installation on a development store
2. ✅ Create a test report schedule
3. ✅ Verify emails are sent correctly
4. ✅ Monitor logs for any errors
5. ✅ Set up monitoring/alerting (optional)

---

## Support Resources

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Shopify CLI Docs:** https://shopify.dev/docs/api/shopify-cli
- **Project Issues:** https://github.com/hackastak/report-flow/issues

---

## Quick Reference Commands

```bash
# View Railway logs (if CLI installed)
railway logs

# Redeploy manually
railway up

# Open Railway dashboard
railway open

# Deploy Shopify config
shopify app deploy

# Check app status
shopify app info
```

