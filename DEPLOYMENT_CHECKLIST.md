# Railway Deployment Checklist

Use this checklist to deploy Report Flow to Railway with GitHub CI/CD.

## Pre-Deployment

- [ ] GitHub repository is up to date
- [ ] All local changes are committed
- [ ] Neon PostgreSQL database is accessible
- [ ] SMTP credentials are working (SMTP2Go)
- [ ] Shopify app is created in Partner Dashboard

## Railway Setup

- [ ] Create Railway account at [railway.app](https://railway.app)
- [ ] Login with GitHub
- [ ] Authorize Railway to access repositories
- [ ] Create new project from GitHub repo: `hackastak/report-flow`
- [ ] Wait for initial deployment to complete

## Environment Variables

Add these in Railway dashboard → Variables tab:

- [ ] `SHOPIFY_API_KEY` = `your-shopify-api-key-here`
- [ ] `SHOPIFY_API_SECRET` = `your-shopify-api-secret-here`
- [ ] `SCOPES` = `read_orders,read_products,read_customers,read_reports,read_analytics,read_inventory,read_locations,read_price_rules,read_discounts`
- [ ] `DATABASE_URL` = `postgresql://username:password@your-host.neon.tech/database?sslmode=require`
- [ ] `SMTP_HOST` = `your-smtp-host.com`
- [ ] `SMTP_PORT` = `2525`
- [ ] `SMTP_USER` = `your-smtp-username`
- [ ] `SMTP_PASSWORD` = `your-smtp-password`
- [ ] `SMTP_FROM` = `your-email@example.com`
- [ ] `SMTP_FROM_NAME` = `Report Flow`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`

## Domain Configuration

- [ ] Generate domain in Railway (Settings → Networking → Generate Domain)
- [ ] Copy the Railway URL (e.g., `report-flow-production.up.railway.app`)
- [ ] Add `SHOPIFY_APP_URL` environment variable with Railway URL
- [ ] Update `shopify.app.toml` with Railway URL (replace `YOUR-RAILWAY-URL`)
- [ ] Verify both `application_url` and `redirect_urls` are updated

## Deploy Configuration

- [ ] Run `shopify app deploy` to update Shopify with new URLs
- [ ] Commit changes: `git add shopify.app.toml railway.json docs/`
- [ ] Push to GitHub: `git push origin main`
- [ ] Wait for Railway to auto-deploy

## Verification

- [ ] Check Railway logs for successful deployment
- [ ] Look for scheduler initialization messages:
  - `[Scheduler Init] Initializing background scheduler...`
  - `[Scheduler] Starting background scheduler...`
  - `[Scheduler] Background scheduler started (runs every 5 minutes)`
- [ ] Visit Railway URL in browser (should redirect to Shopify)
- [ ] Install app on a development store
- [ ] Create a test report schedule
- [ ] Wait for scheduled execution (or trigger manually)
- [ ] Verify email is received

## Post-Deployment

- [ ] Monitor Railway logs for errors
- [ ] Test all app features
- [ ] Verify database migrations ran successfully
- [ ] Check that cron scheduler is running
- [ ] Document the Railway URL for team reference
- [ ] Set up monitoring/alerting (optional)

## Troubleshooting

If deployment fails:

1. Check Railway logs for error messages
2. Verify all environment variables are set
3. Ensure database is accessible
4. Confirm Shopify URLs are correct
5. Check that `shopify app deploy` was run

## Quick Commands

```bash
# Deploy Shopify configuration
shopify app deploy

# View app info
shopify app info

# Check environment variables
shopify app env show

# Commit and push changes
git add .
git commit -m "Deploy to Railway"
git push origin main
```

## Support

- Railway Docs: https://docs.railway.app
- Deployment Guide: See `docs/RAILWAY_DEPLOYMENT.md`
- Issues: https://github.com/hackastak/report-flow/issues

