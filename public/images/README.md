# TrackFlow Assets

## Brand Colors (Hex)
- Primary Navy: #0B1220
- Blue Accent: #2F6BFF
- Teal: #16B8A6
- Purple: #7C3AED
- Amber (alerts/highlights): #F59E0B
- Text on Dark: #E5E7EB

## Asset Structure

### `/public/images/`
- `logo.svg` - Main logo for light surfaces
- `logo-dark.svg` - Logo for dark mode
- `favicon.svg` - SVG favicon
- `favicon-16x16.png` - 16px favicon
- `favicon-32x32.png` - 32px favicon
- `favicon.ico` - ICO format favicon
- `apple-touch-icon.png` - 180×180 Apple touch icon
- `android-chrome-192x192.png` - 192px Android icon
- `android-chrome-512x512.png` - 512px Android icon (maskable)
- `og-image.png` - 1200×630 Open Graph image
- `twitter-image.png` - 1200×600 Twitter card image

### `/public/illustrations/`
#### `empty-states/`
- `no-time-entries.svg`
- `no-projects.svg`
- `no-reports.svg`
- `connect-integration.svg`
- `no-retainer.svg`
- `no-notifications.svg`

#### `onboarding/`
- `choose-role.svg`
- `select-services.svg`
- `connect-tools.svg`
- `privacy.svg`

#### `features/`
- `retainers.svg`
- `auto-detect.svg`
- `templates.svg`
- `privacy.svg`
- `csv-import.svg`
- `channel.svg`
- `reporting.svg`
- `insights.svg`

### `/public/avatars/`
- `default-user.png`
- `default-client.png`
- `testimonial-1.jpg` through `testimonial-6.jpg` (placeholder portraits)

## Usage

### Logo Implementation
```html
<!-- Theme-aware logo switching -->
<img src="/images/logo.svg" alt="TrackFlow" class="block dark:hidden">
<img src="/images/logo-dark.svg" alt="TrackFlow" class="hidden dark:block">
```

### Favicon Setup
All favicon files are automatically linked via the Next.js metadata in `app/layout.tsx`.

### PWA Configuration
The PWA manifest is configured in `/public/site.webmanifest` with maskable icons and theme colors.

## Notes
- All SVG files are optimized and use brand colors
- PNG files should be generated from high-quality sources
- The OG and Twitter images should feature the brand and key messaging
- All assets follow the privacy-first marketing positioning

