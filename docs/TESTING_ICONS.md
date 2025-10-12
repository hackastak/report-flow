# Testing Icon System Changes

## Quick Test Checklist

After starting the dev server with `npm run dev`, verify the following:

### 1. Report Selection Page (`/app/reports`)

**Expected Behavior:**
- [ ] All report cards display with Lucide icons (not emojis)
- [ ] Icons are consistently sized (24px) in rounded containers
- [ ] Icon containers have a subtle background color
- [ ] "Select" button is always aligned to the far right
- [ ] Hover effects work (border color changes, shadow appears)
- [ ] Cards are clickable and navigate to the report creation page
- [ ] Keyboard navigation works (Tab to focus, Enter/Space to select)

**Report Icons to Verify:**
- Sales Report: Dollar sign icon ($)
- Orders Report: Package/box icon
- Products Report: Shopping bag icon
- Customers Report: Multiple people icon
- Inventory Report: Bar chart icon
- Traffic Report: Trending up arrow icon
- Discounts Report: Tag icon
- Finance Summary: Receipt icon
- Custom Report: Settings/gear icon

### 2. Scheduled Reports Page (`/app/reports/scheduled`)

**Expected Behavior:**
- [ ] Report type column shows Lucide icons (not emojis)
- [ ] Icons are consistently sized (20px)
- [ ] Icons have subdued color
- [ ] Table layout is not broken

### 3. Onboarding Modal (First-time users)

**Expected Behavior:**
- [ ] Modal displays with Lucide icons (not emojis)
- [ ] Step icons are large (48px) and centered
- [ ] Feature icons in content are properly sized (28px)
- [ ] All icons render without errors

**Icons to Verify:**
- Welcome step: Sparkles icon
- Report types step: Trending up icon
- Scheduling step: Clock icon
- Features step: Sparkles icon
- Daily reports: Calendar icon
- Weekly reports: Calendar with days icon
- Monthly reports: Calendar range icon
- Filters: Search icon
- Email: Mail icon
- CSV: File text icon
- History: Bar chart icon

## Common Issues and Solutions

### Issue: "Component is not a function" Error

**Cause:** Trying to render Lucide icon components inside Polaris web components

**Solution:** Use regular HTML elements (div, button, etc.) instead of Polaris web components for containers that need to render Lucide icons

### Issue: Icons Not Displaying

**Possible Causes:**
1. Icon not imported in the file
2. Icon component not extracted from config
3. Typo in icon name

**Solution:** Check that:
- Icon is imported: `import { IconName } from 'lucide-react'`
- Icon is used correctly: `<IconComponent size={24} />`

### Issue: Inconsistent Icon Sizes

**Solution:** Always specify size prop:
- Small: `size={16}`
- Medium: `size={20}` or `size={24}`
- Large: `size={28}` or `size={32}`
- Extra large: `size={48}`

### Issue: Icons Look Too Thin/Thick

**Solution:** Adjust strokeWidth prop:
- Thin: `strokeWidth={1.5}`
- Normal: `strokeWidth={2}` (default)
- Bold: `strokeWidth={2.5}`

## Browser Testing

Test in multiple browsers to ensure consistent rendering:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on macOS)

## Accessibility Testing

- [ ] Tab through report cards with keyboard
- [ ] Press Enter or Space to select a report
- [ ] Verify screen reader announces cards as buttons
- [ ] Check color contrast of icons

## Performance Testing

- [ ] Page loads quickly (< 2 seconds)
- [ ] No console errors
- [ ] No console warnings about missing props
- [ ] Icons render immediately (no flash of missing content)

## Visual Regression Testing

Compare before/after screenshots:

### Before (Emojis)
- Inconsistent sizes
- Different rendering across platforms
- Less professional appearance

### After (Lucide Icons)
- Consistent sizes and styling
- Same rendering everywhere
- Professional, polished look

## Manual Testing Steps

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the app:**
   - Open the provided URL in your browser
   - Install the app in a development store if needed

3. **Test Report Selection:**
   - Go to "Create Report" page
   - Verify all icons display correctly
   - Click on different report cards
   - Test keyboard navigation

4. **Test Scheduled Reports:**
   - Go to "Scheduled Reports" page
   - Verify icons in the table
   - Check that layout is not broken

5. **Test Onboarding (if applicable):**
   - Clear local storage to trigger onboarding
   - Step through the modal
   - Verify all icons display

## Automated Testing (Future)

Consider adding these tests:

```typescript
// Example test for report card rendering
describe('ReportCard', () => {
  it('renders with Lucide icon', () => {
    const report = {
      type: 'SALES',
      name: 'Sales Report',
      icon: DollarSign,
      // ... other props
    };
    
    render(<ReportCard report={report} onSelect={jest.fn()} />);
    
    // Verify icon is rendered
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('is keyboard accessible', () => {
    const onSelect = jest.fn();
    render(<ReportCard report={mockReport} onSelect={onSelect} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(onSelect).toHaveBeenCalled();
  });
});
```

## Rollback Plan

If issues are found, you can rollback by:

1. Uninstall lucide-react:
   ```bash
   npm uninstall lucide-react
   ```

2. Revert changes to these files:
   - `app/config/reportTypes.ts`
   - `app/routes/app.reports._index.tsx`
   - `app/routes/app.reports.scheduled.tsx`
   - `app/components/OnboardingModal.tsx`

3. Restore emoji icons in reportTypes.ts

## Success Criteria

The icon system update is successful if:

- ✅ All icons render correctly without errors
- ✅ Icons are consistently styled across the app
- ✅ No performance degradation
- ✅ Accessibility is maintained or improved
- ✅ Layout is consistent and professional
- ✅ No console errors or warnings

## Next Steps After Testing

Once testing is complete and successful:

1. Commit the changes
2. Update the changelog
3. Consider adding more icons for future features
4. Document icon usage guidelines for the team

