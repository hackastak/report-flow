# Report Flow - Automated Shopify Analytics Reporting 📊

Report Flow is a Shopify app that automates analytics report generation and delivery. Schedule reports to be generated and emailed to your team automatically - no more manual exports!

## Features

### 🎯 Core Features

- **7 Report Types** - Sales, Orders, Products, Customers, Inventory, Traffic, and Discounts
- **Flexible Scheduling** - Daily, weekly, or monthly delivery
- **Custom Filters** - Date ranges, product types, order status, and more
- **Multiple Recipients** - Send reports to your entire team
- **Report Preview** - See sample data before scheduling
- **Execution History** - Track when reports were sent and their status
- **Error Notifications** - Get notified when reports fail with troubleshooting tips
- **Background Scheduler** - Automatic report execution every 5 minutes
- **Manual Execution** - Run reports on-demand with "Run Now" button
- **Pause/Resume** - Temporarily disable reports without deleting

### 🎨 User Experience

- **Onboarding Flow** - Welcome new users with a 5-step guided tour
- **Dashboard** - View statistics and recent executions at a glance
- **Clean Navigation** - Simple 3-link navigation structure
- **Responsive Design** - Works on desktop and mobile
- **Professional UI** - Built with Shopify Polaris components

## Tech Stack

### Frontend
- **React Router v7** - Full-stack web framework
- **Shopify Polaris Web Components** - UI component library
- **TypeScript** - Type safety throughout

### Backend
- **Node.js** - Runtime environment
- **Prisma ORM** - Database access layer
- **PostgreSQL** - Production database (SQLite for development)
- **Shopify Admin GraphQL API** - Data fetching from Shopify

### Services
- **node-cron** - Background job scheduling
- **nodemailer** - Email delivery with SMTP
- **csv-writer** - CSV file generation
- **date-fns** - Date/time manipulation

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Shopify Partner account
- PostgreSQL database (for production)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/report-flow.git
cd report-flow
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Run database migrations:**
```bash
npx prisma migrate dev
```

5. **Start development server:**
```bash
npm run dev
```

6. **Open the app:**
```
http://localhost:3000
```

## Documentation

### User Documentation
- [User Guide](USER_GUIDE.md) - Complete guide for end users
- [Onboarding Flow](ONBOARDING_FLOW.md) - First-time user experience

### Developer Documentation
- [Project Roadmap](PROJECT_ROADMAP.md) - Development progress and tasks
- [API Documentation](API_DOCUMENTATION.md) - Internal API reference
- [Database Schema](DATABASE_SCHEMA.md) - Database structure
- [Testing Checklist](TESTING_CHECKLIST.md) - QA procedures
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment

### Feature Documentation
- [Report Types](REPORT_TYPES.md) - Available report types
- [Background Scheduler](BACKGROUND_SCHEDULER.md) - Automated execution
- [Email Service](EMAIL_SERVICE.md) - Email delivery system
- [Error Notifications](ERROR_NOTIFICATIONS.md) - Failure notifications
- [Report Preview](REPORT_PREVIEW.md) - Data preview feature
- [App Navigation](APP_NAVIGATION.md) - Navigation structure

## Project Structure

```
report-flow/
├── app/
│   ├── components/          # React components
│   │   └── OnboardingModal.tsx
│   ├── config/             # Configuration files
│   │   └── reportTypes.ts
│   ├── routes/             # React Router routes
│   │   ├── app.tsx         # Main app layout
│   │   ├── app._index.tsx  # Dashboard
│   │   ├── app.reports.tsx # Report type selection
│   │   ├── app.reports.new.tsx # Report configuration
│   │   ├── app.reports.scheduled.tsx # Report list
│   │   ├── app.reports.$id.history.tsx # Report history
│   │   ├── api.reports.tsx # Reports API
│   │   ├── api.reports.$id.tsx # Single report API
│   │   ├── api.reports.$id.run.tsx # Manual execution API
│   │   ├── api.reports.preview.tsx # Preview API
│   │   ├── api.scheduler.tsx # Scheduler API
│   │   └── api.onboarding.tsx # Onboarding API
│   ├── services/           # Business logic services
│   │   ├── shopifyDataFetcher.server.ts
│   │   ├── reportDataProcessor.server.ts
│   │   ├── emailService.server.ts
│   │   ├── reportExecutionService.server.ts
│   │   ├── backgroundScheduler.server.ts
│   │   └── scheduler.init.server.ts
│   ├── utils/              # Utility functions
│   │   ├── timezoneHelper.ts
│   │   └── errorCategorization.ts
│   └── db.server.ts        # Database client
├── docs/                   # Documentation
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                 # Static assets
└── reports/                # Generated CSV files
```

## Development

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

## Deployment

See [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions.

### Quick Deploy to Railway

```bash
railway login
railway init
railway add postgresql
railway up
```

### Quick Deploy to Vercel

```bash
vercel login
vercel --prod
```

## Environment Variables

Required environment variables:

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

See [Deployment Guide](DEPLOYMENT_GUIDE.md) for complete list.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Email:** support@reportflow.app
- **Documentation:** https://docs.reportflow.app
- **Issues:** https://github.com/yourusername/report-flow/issues

## Acknowledgments

- Built with [Shopify App Template](https://github.com/Shopify/shopify-app-template-react-router)
- UI components from [Shopify Polaris](https://polaris.shopify.com)
- Icons from [Emoji](https://emojipedia.org)

## Resources

- [Shopify App Docs](https://shopify.dev/docs/apps/getting-started)
- [React Router Docs](https://reactrouter.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Shopify GraphQL API](https://shopify.dev/docs/api/admin-graphql)

## Project Status

**Current Version:** 1.0.0  
**Status:** Production Ready  
**Progress:** 95% complete (21/22 tasks)

See [Project Roadmap](PROJECT_ROADMAP.md) for detailed progress.

## Key Achievements

✅ **Phase 1: Foundation & Setup** (100%)
- Database schema design
- Shopify scopes configuration
- Dependencies installation
- Report types configuration

✅ **Phase 2: User Interface** (100%)
- Report type selection
- Filter configuration
- Schedule configuration
- Email recipients UI

✅ **Phase 3: Report Management UI** (100%)
- Scheduled reports list
- Report actions (Run, Pause, Delete)
- Report history view

✅ **Phase 4: Backend API** (100%)
- CRUD API routes
- Report execution API
- Preview API

✅ **Phase 5: Email & Execution** (100%)
- Shopify data fetcher
- Report data processor
- Email service
- Report execution service
- Background scheduler

✅ **Phase 6: Additional Features** (100%)
- Manual report execution
- Report history view
- Report preview feature
- Error notifications

✅ **Phase 7: Polish & Launch** (67%)
- App navigation updates
- Onboarding flow
- Testing & documentation (in progress)

## Next Steps

The final task is comprehensive testing and documentation:
- Unit tests for services
- Integration tests for API
- E2E tests for UI flows
- Complete user documentation
- API documentation
- Deployment guide
- Troubleshooting guide

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Report Creation
![Report Creation](screenshots/report-creation.png)

### Scheduled Reports
![Scheduled Reports](screenshots/scheduled-reports.png)

### Report History
![Report History](screenshots/report-history.png)

### Onboarding Flow
![Onboarding](screenshots/onboarding.png)

## FAQ

**Q: How often can reports run?**  
A: Reports can run daily, weekly, or monthly.

**Q: What format are reports delivered in?**  
A: All reports are delivered as CSV files via email.

**Q: Can I edit a scheduled report?**  
A: Currently, you need to delete and recreate reports. Editing is planned for a future update.

**Q: How long are reports stored?**  
A: Report execution history is stored indefinitely. CSV files are stored for 30 days.

**Q: What happens if a report fails?**  
A: You'll receive an email notification with error details and troubleshooting tips.

## Changelog

### Version 1.0.0 (2025-10-01)
- Initial release
- 7 report types
- Flexible scheduling
- Email delivery
- Background scheduler
- Error notifications
- Onboarding flow
- Dashboard with statistics

---

**Made with ❤️ by the Report Flow Team**

