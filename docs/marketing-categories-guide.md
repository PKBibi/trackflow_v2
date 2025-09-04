# Marketing Categories & Activity Selector Guide

## Overview

The new marketing categories system provides a mobile-optimized, two-tier interface for selecting marketing activities. This replaces the previous separate channel and activity dropdowns with a more intuitive category-based approach.

## Structure

### Categories

The system organizes marketing activities into 6 main categories:

1. **Content & SEO** (#10b981)
   - Content Strategy, Blog Writing, SEO, Video Marketing, etc.

2. **Advertising & Paid Media** (#3b82f6)
   - PPC, Google Ads, Meta Ads, Display Advertising, etc.

3. **Social & Influencer Marketing** (#8b5cf6)
   - Social Media Management, Influencer Outreach, Community Management, etc.

4. **Web & Tech** (#06b6d4)
   - Website Development, UX/UI Design, Analytics Implementation, etc.

5. **Email & Direct Marketing** (#f59e0b)
   - Email Campaigns, Newsletter Creation, SMS Marketing, etc.

6. **Strategy & Analytics** (#ec4899)
   - Marketing Strategy, Reporting, ROI Analysis, Market Research, etc.

## Components

### ActivitySelector Component

Located at `/components/dashboard/activity-selector.tsx`

Features:
- **Mobile-optimized interface**: Works seamlessly on all screen sizes
- **Quick templates**: Pre-configured common tasks for faster logging
- **Search functionality**: Find activities quickly across all categories
- **Recent activities**: Tracks and displays your 5 most recent selections
- **Category grid**: Visual 2x3 grid on desktop, vertical list on mobile

Usage:
```tsx
import { ActivitySelector } from '@/components/dashboard/activity-selector';

<ActivitySelector
  value={{ category: 'content-seo', activity: 'Blog Writing' }}
  onSelect={(category, activity) => console.log(category, activity)}
  onQuickTemplate={(template) => console.log(template)}
/>
```

### TimeEntryForm Component

Located at `/components/dashboard/time-entry-form.tsx`

Features:
- Integrated activity selector
- Quick duration buttons (15m, 30m, 1h, 2h)
- Automatic duration calculation from start/end times
- Billable toggle with optional rate field
- Quick template support with auto-fill

Usage:
```tsx
import { TimeEntryForm } from '@/components/dashboard/time-entry-form';

<TimeEntryForm
  projectId="project-123"
  clientId="client-456"
  onSubmit={handleSubmit}
  mode="create"
/>
```

## Quick Templates

Pre-configured templates for common tasks:

1. **Client Call** - 30 minutes (Strategy & Analytics)
2. **PPC Optimization** - 45 minutes (Advertising & Paid Media)
3. **Content Writing** - 120 minutes (Content & SEO)
4. **Social Media Scheduling** - 60 minutes (Social & Influencer)
5. **Monthly Report** - 90 minutes (Strategy & Analytics)

## Data Storage

### Recent Activities
Recent activities are stored in localStorage with the following structure:
```json
[
  {
    "category": "content-seo",
    "activity": "Blog Writing",
    "timestamp": 1234567890
  }
]
```

### Helper Functions

```typescript
// Get all activities across categories
getAllActivities()

// Search activities by keyword
searchActivities("seo")

// Get category icon component
getCategoryIcon("FileText")
```

## Mobile UX Considerations

1. **Touch-friendly targets**: All interactive elements are at least 44x44px
2. **Modal/drawer pattern**: Activities open in a full-screen modal on mobile
3. **Search-first approach**: Quick access to search for finding activities
4. **Visual categories**: Color-coded with icons for quick recognition
5. **Recent items**: Reduces repetitive selections

## Customization

### Adding New Categories

Edit `/lib/constants/marketing-categories.ts`:

```typescript
export const MARKETING_CATEGORIES = {
  'new-category': {
    label: 'New Category',
    icon: 'IconName',
    color: '#hexcolor',
    activities: [
      'Activity 1',
      'Activity 2'
    ]
  }
}
```

### Adding Quick Templates

```typescript
export const QUICK_TEMPLATES = [
  {
    label: 'Template Name',
    category: 'category-key',
    activity: 'Activity Name',
    duration: 60, // minutes
    icon: 'IconName'
  }
]
```

## Best Practices

1. **Keep activity names concise**: Max 3-4 words for better mobile display
2. **Use descriptive categories**: Help users find activities quickly
3. **Leverage quick templates**: For frequently used time blocks
4. **Monitor recent activities**: Understand user patterns
5. **Test on mobile**: Ensure touch targets and modals work well

## Integration

The system integrates with:
- Time tracking forms
- Project management
- Client billing
- Reporting & analytics
- Chrome extension (for quick time logging)

