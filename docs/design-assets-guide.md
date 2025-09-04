# Design Assets Guide

## Overview

This guide documents all design assets created and available in the TrackFlow application, including logos, icons, empty state illustrations, and metadata configuration.

## Asset Structure

```
public/
├── avatars/
│   ├── default-user.png         # Default user avatar silhouette
│   ├── default-client.png       # Default client/company avatar
│   └── testimonial-*.jpg        # Sample testimonial avatars
├── illustrations/
│   ├── empty-states/
│   │   ├── no-time-entries.svg  # When no time entries exist
│   │   ├── no-projects.svg      # When no projects exist
│   │   ├── no-reports.svg       # When no reports available
│   │   └── ...
│   └── features/
│       ├── reporting.svg        # Feature illustrations
│       └── ...
├── images/
│   ├── logo.svg                 # Primary logo with blue clock icon
│   ├── logo-dark.svg            # Dark mode logo variant
│   ├── empty-timer.svg          # No timer running illustration
│   ├── empty-clients.svg        # No clients illustration
│   ├── empty-projects.svg       # No projects illustration
│   ├── favicon.ico              # Browser favicon
│   ├── favicon.svg              # SVG favicon
│   ├── favicon-16x16.png        # Small favicon
│   ├── favicon-32x32.png        # Medium favicon
│   ├── apple-touch-icon.png     # Apple devices icon
│   ├── android-chrome-*.png     # Android icons
│   ├── og-image.png             # Open Graph share image
│   └── twitter-image.png        # Twitter card image
└── manifest.json                 # PWA manifest

```

## Logo Assets

### Primary Logo (`logo.svg`)
- **Dimensions**: 180x40px
- **Colors**: 
  - Primary blue: `#2F6BFF`
  - Accent teal: `#16B8A6`
  - Text: `#0B1220`
- **Components**: Clock icon with "TrackFlow" text
- **Usage**: Light backgrounds, main navigation

### Dark Mode Logo (`logo-dark.svg`)
- **Dimensions**: 180x40px
- **Colors**: White version for dark backgrounds
- **Usage**: Dark theme, dark backgrounds

## Empty State Illustrations

### Timer Empty State (`empty-timer.svg`)
- **Dimensions**: 400x300px
- **Description**: Stopwatch/timer with pause icon
- **Message**: "No timer running"
- **Sub-message**: "Press Space or click Start to begin tracking"
- **Colors**: Blue, teal, purple accents

### Clients Empty State (`empty-clients.svg`)
- **Dimensions**: 400x300px
- **Description**: Building icons representing companies
- **Message**: "No clients yet"
- **Sub-message**: "Add your first client to start tracking time"
- **Colors**: Blue buildings with teal/purple accents

### Projects Empty State (`empty-projects.svg`)
- **Dimensions**: 400x300px
- **Description**: Folder with kanban board representation
- **Message**: "No projects yet"
- **Sub-message**: "Create a project to organize your work"
- **Colors**: Blue folders with colored task cards

## Favicon Files

### Standard Favicons
- `favicon.ico` - Multi-resolution ICO file
- `favicon.svg` - Scalable vector favicon
- `favicon-16x16.png` - 16px square
- `favicon-32x32.png` - 32px square

### Platform-Specific Icons
- `apple-touch-icon.png` - 180x180px for iOS devices
- `android-chrome-192x192.png` - Android home screen
- `android-chrome-512x512.png` - Android splash screen

## Social Media Assets

### Open Graph Image (`og-image.png`)
- **Dimensions**: 1200x630px
- **Purpose**: Facebook, LinkedIn sharing
- **Content**: TrackFlow branding with marketing message

### Twitter Card Image (`twitter-image.png`)
- **Dimensions**: 1200x600px
- **Purpose**: Twitter post previews
- **Content**: Optimized for Twitter's card format

## Default Avatars

### User Avatar (`default-user.png`)
- **Dimensions**: 200x200px
- **Description**: Simple user silhouette
- **Usage**: Placeholder for users without profile photos

### Client Avatar (`default-client.png`)
- **Dimensions**: 200x200px
- **Description**: Building/company icon
- **Usage**: Placeholder for clients without logos

## Metadata Configuration

Located in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'TrackFlow - Time Tracking for Digital Marketing',
  description: 'The only time tracking software built specifically for digital marketing freelancers and agencies.',
  openGraph: {
    title: 'TrackFlow - Time Tracking for Digital Marketing',
    description: 'Track time by campaign, channel, and client.',
    images: ['/images/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackFlow',
    description: 'Time tracking for digital marketers',
    images: ['/images/twitter-image.png'],
  },
};
```

## Color Palette

### Primary Colors
- **Primary Blue**: `#2F6BFF` - Main brand color
- **Accent Teal**: `#16B8A6` - Secondary accent
- **Purple**: `#7C3AED` - Tertiary accent
- **Orange**: `#F59E0B` - Warning/attention

### Neutral Colors
- **Dark**: `#0B1220` - Text, dark backgrounds
- **Gray**: `#6B7280` - Muted text
- **Light Gray**: `#E5E7EB` - Borders, dividers
- **White**: `#FFFFFF` - Backgrounds

## Usage Guidelines

### Empty States
- Use when no data is available
- Always include helpful action text
- Maintain consistent 400x300px dimensions
- Use opacity for depth and layering

### Logo Usage
- Minimum clear space: 20px on all sides
- Don't alter colors or proportions
- Use dark variant on dark backgrounds
- Maintain aspect ratio when scaling

### Icons & Favicons
- Always include multiple sizes for different devices
- Use SVG when possible for scalability
- Include platform-specific versions (Apple, Android)
- Test on actual devices for clarity

### Social Media Images
- Keep text minimal and readable
- Include brand colors and logo
- Test preview on actual platforms
- Update regularly with current messaging

## Implementation Examples

### Using Empty States in React
```tsx
import Image from 'next/image';

function ClientsList({ clients }) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <Image
          src="/images/empty-clients.svg"
          alt="No clients"
          width={400}
          height={300}
        />
      </div>
    );
  }
  // ... rest of component
}
```

### Logo Implementation
```tsx
// Light mode
<Image
  src="/images/logo.svg"
  alt="TrackFlow"
  width={180}
  height={40}
  priority
/>

// Dark mode support
<Image
  src="/images/logo-dark.svg"
  alt="TrackFlow"
  width={180}
  height={40}
  className="hidden dark:block"
/>
```

## Maintenance Notes

- **Regular Updates**: Review social media images quarterly
- **Testing**: Verify favicons on new devices/browsers
- **Accessibility**: Ensure sufficient contrast ratios
- **Performance**: Optimize SVGs and compress PNGs
- **Consistency**: Maintain design language across all assets

## Future Enhancements

1. **Animation**: Add subtle animations to empty states
2. **Seasonal**: Create holiday/seasonal logo variants
3. **Localization**: Translated empty state messages
4. **A/B Testing**: Multiple social share image variants
5. **Brand Kit**: Downloadable assets for partners


