# Report Flow - Automated Shopify Analytics Reporting 📊

> Automate your Shopify analytics reporting workflow. Schedule reports to be generated and emailed to your team automatically - no more manual exports!

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/report-flow)
[![Status](https://img.shields.io/badge/status-production%20ready-green.svg)](https://github.com/yourusername/report-flow)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 What is Report Flow?

Report Flow is a Shopify app that eliminates the manual process of viewing reports, exporting data, and emailing files to stakeholders. Configure your reports once, and they'll be automatically generated and delivered on your schedule.

### The Problem We Solve

**Before Report Flow:**
1. Log into Shopify Admin
2. Navigate to Analytics
3. Apply filters manually
4. Export to CSV
5. Rename file
6. Email to team members
7. Repeat daily/weekly/monthly

**With Report Flow:**
1. Configure report once
2. Set schedule
3. Add recipients
4. Done! Reports arrive automatically

---

## ✨ Features

### Core Functionality
- **9 Report Types** - Sales, Orders, Products, Customers, Inventory, Discounts, Traffic, Finance Summary, Custom Reports
- **Flexible Scheduling** - Daily, weekly, or monthly delivery with timezone support
- **Custom Filters** - Date ranges, product types, order status, sales channels, and more
- **Multiple Recipients** - Send reports to your entire team
- **Report Preview** - See sample data before scheduling
- **Execution History** - Track when reports were sent and their status
- **Error Notifications** - Get notified when reports fail with troubleshooting tips
- **Background Scheduler** - Automatic report execution every 5 minutes
- **Manual Execution** - Run reports on-demand with "Run Now" button
- **Pause/Resume** - Temporarily disable reports without deleting

### Advanced Features
- **Custom Reports** - Create reports with any fields available via Shopify API
- **Field Customization** - Add/remove fields from any report
- **Starter Reports** - Pre-configured Finance Summary, Total Sales, and Tax reports
- **All Channels Support** - Fetch from all sales channels by default
- **Professional UI** - Built with Shopify Polaris components
- **Onboarding Flow** - Welcome new users with a 5-step guided tour

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Shopify Partner account
- PostgreSQL database (for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/report-flow.git
cd report-flow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```bash
# Shopify
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://your-app-url.com
SCOPES=read_products,read_orders,read_customers,read_inventory,read_discounts,read_analytics

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@reportflow.app

# Session
SESSION_SECRET=your-random-secret-min-32-chars
```

See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for complete setup instructions.

---

## 📚 Documentation

### For Users
- **[User Guide](docs/USER_GUIDE.md)** - Complete guide for end users
- **[Onboarding Flow](docs/ONBOARDING_FLOW.md)** - First-time user experience
- **[Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md)** - Common issues and solutions

### For Developers
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[PRD](docs/PRD.md)** - Product requirements document
- **[FSD](docs/FSD.md)** - Functional specification document
- **[Project Summary](docs/PROJECT_SUMMARY.md)** - Project completion summary
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Internal API reference
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Database structure
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Testing Checklist](docs/TESTING_CHECKLIST.md)** - QA procedures

### Feature Documentation
- **[Report Types](docs/REPORT_TYPES.md)** - Available report types
- **[Background Scheduler](docs/BACKGROUND_SCHEDULER.md)** - Automated execution
- **[Email Service](docs/EMAIL_SERVICE.md)** - Email delivery system
- **[Error Notifications](docs/ERROR_NOTIFICATIONS.md)** - Failure notifications
- **[Field Customization](docs/FIELD_CUSTOMIZATION_FEATURE.md)** - Custom field selection

---

## 🏗️ Tech Stack

### Frontend
- **React Router v7** - Full-stack web framework
- **Shopify Polaris Web Components** - UI component library
- **TypeScript** - Type safety throughout

### Backend
- **Node.js 18+** - Runtime environment
- **Prisma ORM** - Database access layer
- **PostgreSQL** - Production database (SQLite for development)
- **Shopify Admin GraphQL API** - Data fetching from Shopify

### Services
- **node-cron** - Background job scheduling (5-minute intervals)
- **nodemailer** - Email delivery with SMTP
- **csv-writer** - CSV file generation
- **date-fns** - Date/time manipulation

---

## 🎨 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│         (React Router + Shopify Polaris Components)         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Report Execution Service (Orchestrator)             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Data Fetcher │  │ Data Processor│  │ Email Service│    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Background Scheduler                          │
│              (node-cron - 5 min intervals)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Database (PostgreSQL/SQLite)                    │
└─────────────────────────────────────────────────────────────┘
```

See [Architecture Documentation](docs/ARCHITECTURE.md) for detailed information.

---

## 📊 Report Types

### Starter Reports (Pre-configured)
1. **Finance Summary** - Complete financial overview with sales breakdown, payments, and gross profit
2. **Total Sales** - Revenue tracking across all channels
3. **US Sales Tax** - Tax reporting by state
4. **Taxes by County** - Detailed tax breakdown

### Standard Reports
5. **Sales Reports** - Revenue, discounts, net sales
6. **Orders Reports** - Order details and fulfillment
7. **Products Reports** - Product performance
8. **Customers Reports** - Customer analytics
9. **Inventory Reports** - Stock levels
10. **Discounts Reports** - Discount usage
11. **Traffic Reports** - Store traffic (limited)

### Custom Reports
Create your own reports with any fields available via the Shopify API. Select from orders, products, or customers data sources and choose exactly which fields to include.

---

## 🔧 Development

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Database Management

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

---

## 🚢 Deployment

Report Flow can be deployed to any Node.js hosting platform. We provide detailed guides for:

- **Shopify Hosting** (Recommended)
- **Railway**
- **Vercel**
- **Fly.io**
- **Heroku**

See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for platform-specific instructions.

---

## 📈 Project Status

**Version:** 1.0.0  
**Status:** Production Ready  
**Completion:** 22/22 tasks (100%)  
**Development Time:** ~22 days

See [Project Summary](docs/PROJECT_SUMMARY.md) and [Changelog](docs/CHANGELOG.md) for details.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 💬 Support

- **Email:** support@reportflow.app
- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/report-flow/issues)

---

## 🙏 Acknowledgments

Built with:
- [Shopify App Template](https://github.com/Shopify/shopify-app-template-react-router)
- [Shopify Polaris](https://polaris.shopify.com)
- [React Router](https://reactrouter.com/)
- [Prisma ORM](https://www.prisma.io/)

---

**Made with ❤️ for Shopify Merchants**

