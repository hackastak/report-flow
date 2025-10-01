# Onboarding Flow Documentation

## Overview

The onboarding flow provides a welcoming experience for first-time users, introducing them to Report Flow's features and guiding them to create their first scheduled report. The flow uses a multi-step modal with progress indicators and clear calls-to-action.

## Features

### 1. First-Time User Detection

**Triggers:**
- User visits dashboard for the first time
- No previous onboarding completion recorded
- Automatic display on page load

---

### 2. Multi-Step Modal

**Steps:**
1. Welcome & Introduction
2. Report Types Overview
3. Scheduling Options
4. Feature Highlights
5. Getting Started Guide

**Features:**
- Progress indicator
- Previous/Next navigation
- Skip option
- Responsive design
- Smooth transitions

---

### 3. User Preference Tracking

**Database:**
- Stores onboarding completion status
- Tracks dismissal timestamp
- Per-shop preferences

---

## User Interface

### Modal Structure

```
┌─────────────────────────────────────────────────┐
│                    🎉                           │
│         Welcome to Report Flow!                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ Automate your Shopify analytics reporting...   │
│                                                 │
│ [Content for current step]                      │
│                                                 │
├─────────────────────────────────────────────────┤
│ ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│              Step 1 of 5                        │
├─────────────────────────────────────────────────┤
│ [Skip for now]              [Previous] [Next]   │
└─────────────────────────────────────────────────┘
```

---

## Onboarding Steps

### Step 1: Welcome & Introduction

**Icon:** 📊

**Title:** "Welcome to Report Flow! 🎉"

**Content:**
- Brief introduction to the app
- Value proposition
- Time-saving benefits

**Message:**
```
Automate your Shopify analytics reporting and save hours 
of manual work every week.

Schedule reports to be generated and emailed to your team 
automatically - no more manual exports!
```

---

### Step 2: Report Types Overview

**Icon:** 📈

**Title:** "7 Powerful Report Types"

**Content:**
- Sales Reports - Track revenue, discounts, and net sales
- Orders Reports - Monitor order details and fulfillment
- Products Reports - Analyze product performance
- Customers Reports - Understand customer behavior
- Inventory Reports - Track stock levels
- Discounts Reports - Monitor discount usage

---

### Step 3: Scheduling Options

**Icon:** ⏰

**Title:** "Flexible Scheduling"

**Content:**
- 📅 Daily Reports - Get fresh data every morning
- 📆 Weekly Reports - Perfect for team meetings
- 🗓️ Monthly Reports - Great for executive summaries

---

### Step 4: Feature Highlights

**Icon:** ✨

**Title:** "Powerful Features"

**Content:**
- 🔍 Custom Filters - Date ranges, product types, order status
- 👥 Multiple Recipients - Send to your entire team
- 👁️ Preview Reports - See sample data before scheduling
- 📧 Email Delivery - CSV files delivered to inbox
- 📊 Execution History - Track report status

---

### Step 5: Getting Started

**Icon:** 🚀

**Title:** "Ready to Get Started?"

**Content:**
- 1️⃣ Choose a Report Type
- 2️⃣ Configure Filters
- 3️⃣ Preview Your Data
- 4️⃣ Set Schedule & Recipients
- ✅ Sit Back & Relax

**CTA:** "Create First Report" button

---

## Implementation Details

### Database Schema

**Model:** `UserPreferences`

```prisma
model UserPreferences {
  id                    String   @id @default(cuid())
  shop                  String   @unique
  hasSeenOnboarding     Boolean  @default(false)
  onboardingDismissedAt DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([shop])
}
```

---

### Onboarding Modal Component

**File:** `app/components/OnboardingModal.tsx`

**Props:**
```typescript
interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}
```

**Features:**
- Step-based navigation
- Progress indicator
- Responsive design
- Click-outside to close
- Keyboard navigation support

---

### API Route

**File:** `app/routes/api.onboarding.tsx`

**Endpoints:**

**GET /api/onboarding**
- Check if user has seen onboarding
- Returns: `{ success: boolean, hasSeenOnboarding: boolean }`

**POST /api/onboarding**
- Mark onboarding as seen
- Updates user preferences
- Returns: `{ success: boolean, message: string }`

---

### Dashboard Integration

**File:** `app/routes/app._index.tsx`

**Loader:**
```typescript
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Check if user has seen onboarding
  const userPreferences = await prisma.userPreferences.findUnique({
    where: { shop: session.shop },
  });
  
  return {
    stats: { ... },
    recentExecutions: [ ... ],
    hasSeenOnboarding: userPreferences?.hasSeenOnboarding || false,
  };
};
```

**Component:**
```typescript
export default function Index() {
  const { hasSeenOnboarding } = useLoaderData<typeof loader>();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [hasSeenOnboarding]);

  const handleGetStarted = async () => {
    setShowOnboarding(false);
    await fetch("/api/onboarding", { method: "POST" });
    navigate("/app/reports");
  };

  return (
    <>
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onGetStarted={handleGetStarted}
      />
      {/* Dashboard content */}
    </>
  );
}
```

---

## User Flows

### First-Time User Flow

1. User installs app
2. User opens app for first time
3. Dashboard loads
4. Onboarding modal appears automatically
5. User views steps 1-5
6. User clicks "Create First Report"
7. Modal closes
8. Preference saved to database
9. User redirected to report creation page

---

### Skip Flow

1. User sees onboarding modal
2. User clicks "Skip for now"
3. Modal closes
4. Preference saved to database
5. User remains on dashboard
6. Modal won't show again

---

### Navigation Flow

1. User sees onboarding modal
2. User clicks "Next" through steps
3. Progress indicator updates
4. User can click "Previous" to go back
5. On last step, button changes to "Create First Report"
6. User clicks final button
7. Redirected to report creation

---

## Design Principles

### 1. Progressive Disclosure
- Show information in digestible chunks
- One concept per step
- Build understanding gradually

### 2. Visual Hierarchy
- Large icons for visual interest
- Clear headings
- Scannable content
- Consistent formatting

### 3. User Control
- Skip option always available
- Previous/Next navigation
- Progress indicator
- No forced completion

### 4. Clear Value Proposition
- Lead with benefits
- Show concrete features
- Provide clear next steps
- Reduce friction to first action

---

## Accessibility

### Features

**Keyboard Navigation:**
- Tab through buttons
- Enter to activate
- Escape to close

**Screen Readers:**
- Semantic HTML
- ARIA labels
- Descriptive text

**Visual:**
- High contrast
- Large text
- Clear icons
- Progress indicators

---

## Performance

### Optimization

**Lazy Loading:**
- Modal only renders when open
- Component code-split
- Images optimized

**Database:**
- Single query for preferences
- Indexed shop field
- Efficient upsert operation

**Caching:**
- Preference cached in loader
- No repeated API calls
- Client-side state management

---

## Testing

### Manual Testing

**Test First-Time Experience:**
1. Clear database preferences
2. Visit dashboard
3. Verify modal appears
4. Navigate through all steps
5. Click "Create First Report"
6. Verify redirect to report creation
7. Return to dashboard
8. Verify modal doesn't appear again

**Test Skip Flow:**
1. Clear database preferences
2. Visit dashboard
3. Click "Skip for now"
4. Verify modal closes
5. Return to dashboard
6. Verify modal doesn't appear again

**Test Navigation:**
1. Open onboarding modal
2. Click "Next" through steps
3. Verify progress indicator updates
4. Click "Previous"
5. Verify step goes back
6. Verify "Previous" disabled on first step

---

### Automated Testing

**Unit Tests:**
```typescript
describe("OnboardingModal", () => {
  it("should render when isOpen is true", () => {
    render(<OnboardingModal isOpen={true} onClose={jest.fn()} onGetStarted={jest.fn()} />);
    expect(screen.getByText("Welcome to Report Flow!")).toBeInTheDocument();
  });
  
  it("should not render when isOpen is false", () => {
    render(<OnboardingModal isOpen={false} onClose={jest.fn()} onGetStarted={jest.fn()} />);
    expect(screen.queryByText("Welcome to Report Flow!")).not.toBeInTheDocument();
  });
  
  it("should call onClose when skip is clicked", () => {
    const onClose = jest.fn();
    render(<OnboardingModal isOpen={true} onClose={onClose} onGetStarted={jest.fn()} />);
    fireEvent.click(screen.getByText("Skip for now"));
    expect(onClose).toHaveBeenCalled();
  });
});
```

---

## Future Enhancements

### 1. Interactive Tour

**Current:** Static modal with steps

**Enhancement:**
- Highlight actual UI elements
- Click-through tutorial
- Contextual tooltips
- Interactive demo

### 2. Video Tutorial

**Current:** Text and icons only

**Enhancement:**
- Embedded video walkthrough
- Screen recordings
- Animated GIFs
- Visual demonstrations

### 3. Progress Tracking

**Current:** Binary seen/not seen

**Enhancement:**
- Track which steps viewed
- Resume from last step
- Completion percentage
- Analytics on drop-off

### 4. Personalization

**Current:** Same flow for everyone

**Enhancement:**
- Role-based onboarding
- Industry-specific examples
- Customized recommendations
- A/B testing variants

### 5. In-App Help

**Current:** One-time onboarding

**Enhancement:**
- Help button to replay
- Contextual help tooltips
- Documentation links
- Support chat integration

---

## Related Documentation

- Dashboard: `docs/APP_NAVIGATION.md`
- User Preferences: `docs/USER_PREFERENCES.md` (future)
- Report Creation: `docs/REPORT_CREATION_UI.md`

