# Report Flow - User Guide

## Welcome to Report Flow! 📊

Report Flow automates your Shopify analytics reporting, saving you hours of manual work every week. Schedule reports to be generated and emailed to your team automatically - no more manual exports!

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Report](#creating-your-first-report)
3. [Report Types](#report-types)
4. [Managing Scheduled Reports](#managing-scheduled-reports)
5. [Viewing Report History](#viewing-report-history)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Getting Started

### Installation

1. Visit the Shopify App Store
2. Search for "Report Flow"
3. Click "Add app"
4. Approve the required permissions
5. You're ready to go!

### First-Time Setup

When you first open Report Flow, you'll see an onboarding guide that walks you through:
- Available report types
- Scheduling options
- Key features
- How to create your first report

You can skip this guide and access it later from the dashboard.

---

## Creating Your First Report

### Step 1: Choose a Report Type

1. Click "Create Report" in the navigation
2. Select from 7 report types:
   - **Sales Reports** - Revenue, discounts, net sales
   - **Orders Reports** - Order details and fulfillment
   - **Products Reports** - Product performance
   - **Customers Reports** - Customer analytics
   - **Inventory Reports** - Stock levels
   - **Discounts Reports** - Discount usage
   - **Traffic Reports** - Store traffic (limited data)

### Step 2: Configure Filters

Each report type has specific filters:

**Common Filters:**
- **Date Range** - Last 7 days, 30 days, 90 days, or custom
- **Report Name** - Give your report a descriptive name

**Report-Specific Filters:**
- **Sales**: Minimum order value, product type
- **Orders**: Order status, fulfillment status, financial status
- **Products**: Product type, vendor, tags
- **Customers**: Order count, total spent
- **Inventory**: Location, stock level

### Step 3: Preview Your Data

Before scheduling, preview your report:
1. Click "Preview Report"
2. See the first 10 rows of data
3. Verify your filters are working correctly
4. Adjust filters if needed

### Step 4: Set Schedule

Choose when your report should run:

**Frequency Options:**
- **Daily** - Every day at a specific time
- **Weekly** - Every week on a specific day
- **Monthly** - Every month on a specific day

**Time Settings:**
- Select your timezone
- Choose the time of day (24-hour format)
- For weekly: Select day of week (Monday-Sunday)
- For monthly: Select day of month (1-31)

### Step 5: Add Recipients

Add email addresses for report delivery:
1. Enter recipient name (optional)
2. Enter email address
3. Click "Add Recipient"
4. Add multiple recipients as needed
5. Remove recipients with the delete button

### Step 6: Save Your Report

1. Review all settings
2. Click "Create Report"
3. Your report is now scheduled!

---

## Report Types

### Sales Reports

**What's Included:**
- Date
- Total Revenue
- Discounts Applied
- Tax Collected
- Net Sales
- Number of Orders

**Best For:**
- Daily revenue tracking
- Weekly sales summaries
- Monthly financial reports

**Filters:**
- Date range
- Minimum order value
- Product type

---

### Orders Reports

**What's Included:**
- Order Number
- Order Date
- Customer Name
- Customer Email
- Total Amount
- Order Status
- Fulfillment Status
- Financial Status
- Items Count

**Best For:**
- Order fulfillment tracking
- Customer service reports
- Shipping coordination

**Filters:**
- Date range
- Order status (pending, completed, cancelled)
- Fulfillment status (fulfilled, unfulfilled, partial)
- Financial status (paid, pending, refunded)

---

### Products Reports

**What's Included:**
- Product Title
- SKU
- Variant Title
- Price
- Inventory Quantity
- Total Sales
- Units Sold
- Product Type
- Vendor
- Tags

**Best For:**
- Product performance analysis
- Inventory planning
- Vendor reports

**Filters:**
- Date range
- Product type
- Vendor
- Tags

---

### Customers Reports

**What's Included:**
- Customer Name
- Email
- Total Orders
- Total Spent
- Average Order Value
- First Order Date
- Last Order Date
- Tags

**Best For:**
- Customer segmentation
- Loyalty program management
- Marketing campaigns

**Filters:**
- Date range
- Minimum order count
- Minimum total spent

---

### Inventory Reports

**What's Included:**
- Product Title
- SKU
- Variant Title
- Inventory Quantity
- Location
- Inventory Value
- Product Type

**Best For:**
- Stock level monitoring
- Reorder planning
- Inventory audits

**Filters:**
- Location
- Minimum stock level
- Maximum stock level

---

### Discounts Reports

**What's Included:**
- Discount Code
- Discount Type
- Value/Percentage
- Usage Count
- Total Savings
- Start Date
- End Date
- Status

**Best For:**
- Promotion tracking
- Discount effectiveness
- Marketing ROI

**Filters:**
- Date range
- Discount status (active, expired, scheduled)

---

## Managing Scheduled Reports

### Viewing All Reports

1. Click "Scheduled Reports" in navigation
2. See all your scheduled reports
3. View details: name, type, frequency, next run

### Running Reports Manually

1. Find the report in the list
2. Click "Run Now"
3. Report executes immediately
4. Check your email for the CSV file

### Pausing Reports

1. Find the report in the list
2. Click "Pause"
3. Report won't run on schedule
4. Click "Resume" to reactivate

### Viewing Report History

1. Find the report in the list
2. Click "History"
3. See last 50 executions
4. View status, timestamp, record count
5. See error details for failures

### Deleting Reports

1. Find the report in the list
2. Click "Delete"
3. Confirm deletion
4. Report is permanently removed

---

## Viewing Report History

### Execution Details

For each execution, you'll see:
- **Status** - Success, Failed, or Running
- **Started At** - When execution began
- **Completed At** - When execution finished
- **Duration** - How long it took
- **Records** - Number of records in report
- **File Size** - Size of CSV file
- **Emails Sent** - Number of successful deliveries
- **Emails Failed** - Number of failed deliveries

### Error Details

If a report fails, you'll see:
- Error message
- Error category
- Troubleshooting tips
- Execution ID for support

### Downloading Past Reports

Currently, reports are delivered via email only. Future versions will support downloading from the dashboard.

---

## Troubleshooting

### Report Failed to Execute

**Common Causes:**
1. **Shopify API Rate Limit** - Too many requests
   - Solution: Wait for next scheduled run
   - Consider reducing report frequency

2. **Authentication Error** - App connection expired
   - Solution: Reinstall the app
   - Check app permissions

3. **No Data Found** - Filters too restrictive
   - Solution: Adjust date range
   - Broaden filter criteria

4. **Email Delivery Failed** - Invalid email address
   - Solution: Check recipient emails
   - Verify email addresses are correct

### Report Contains No Data

**Possible Reasons:**
1. Date range has no data
2. Filters are too restrictive
3. Store has no matching records

**Solutions:**
- Use "Preview Report" to test filters
- Expand date range
- Remove some filters

### Email Not Received

**Check:**
1. Spam/junk folder
2. Email address is correct
3. Report execution succeeded (check history)
4. Email server issues

**Solutions:**
- Add sender to contacts
- Check report history for errors
- Verify recipient email addresses

### Report Takes Too Long

**Causes:**
- Large date range
- Many records to process
- Shopify API rate limiting

**Solutions:**
- Use smaller date ranges
- Split into multiple reports
- Schedule during off-peak hours

---

## FAQ

### How often can reports run?

Reports can run daily, weekly, or monthly. For more frequent reporting, create multiple daily reports with different times.

### How many recipients can I add?

There's no hard limit, but we recommend keeping it under 20 recipients per report for best performance.

### What format are reports delivered in?

All reports are delivered as CSV (Comma-Separated Values) files, which can be opened in Excel, Google Sheets, or any spreadsheet application.

### Can I edit a scheduled report?

Currently, you need to delete and recreate reports to change settings. Report editing is planned for a future update.

### How long are reports stored?

Report execution history is stored indefinitely. CSV files are stored for 30 days after generation.

### Can I export report history?

Currently, report history is view-only. Export functionality is planned for a future update.

### What happens if a report fails?

You'll receive an email notification with error details and troubleshooting tips. The report will automatically retry on the next scheduled run.

### Can I run reports on-demand?

Yes! Use the "Run Now" button on any scheduled report to execute it immediately.

### Is there a limit on report size?

Reports are limited to 10,000 records per execution. For larger datasets, use filters to split into multiple reports.

### Can I customize report columns?

Currently, report columns are fixed per report type. Custom columns are planned for a future update.

### How do I cancel my subscription?

Simply uninstall the app from your Shopify admin. All scheduled reports will stop running.

### Is my data secure?

Yes! We use Shopify's secure authentication and never store your Shopify data. Reports are generated on-demand and delivered via encrypted email.

---

## Getting Help

### Support Channels

**Email Support:** support@reportflow.app
**Response Time:** Within 24 hours

**Documentation:** https://docs.reportflow.app
**Status Page:** https://status.reportflow.app

### When Contacting Support

Please include:
1. Your Shopify store URL
2. Report name or ID
3. Execution ID (from report history)
4. Error message (if applicable)
5. Steps to reproduce the issue

---

## Tips & Best Practices

### Naming Reports

Use descriptive names that include:
- Report type
- Frequency
- Purpose

Examples:
- "Daily Sales Summary - Finance Team"
- "Weekly Top Products - Marketing"
- "Monthly Customer Report - CEO"

### Scheduling Tips

- Schedule reports for early morning (6-8 AM)
- Avoid scheduling many reports at the same time
- Use different times for different report types
- Consider recipient timezones

### Filter Best Practices

- Start with broad filters, then narrow down
- Use preview to test filters before scheduling
- Document filter logic for team reference
- Review filters monthly for relevance

### Email Management

- Use distribution lists for team reports
- Keep recipient lists up to date
- Remove inactive recipients
- Use descriptive report names for easy identification

---

## What's Next?

### Upcoming Features

- Report editing
- Custom report columns
- Report templates
- Dashboard widgets
- Slack/Teams integration
- Advanced scheduling (multiple times per day)
- Report sharing links
- Data visualization

### Stay Updated

Follow our changelog for new features and improvements:
https://reportflow.app/changelog

---

## Conclusion

Thank you for using Report Flow! We're committed to making your Shopify reporting as easy and automated as possible.

If you have feedback or feature requests, please reach out to support@reportflow.app.

Happy reporting! 📊

