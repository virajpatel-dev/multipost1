# MultiPost - Social Media Multi-Platform Poster

## Overview
MultiPost is a cross-platform mobile application (Android + iOS) built with React Native (Expo) that allows users to create one post and publish it to multiple social media platforms simultaneously (Facebook, Instagram, X/Twitter). The app supports posting to multiple Facebook Pages in one action.

## Project Architecture

### Frontend (React Native / Expo)
- **Location**: `client/`
- **Entry Point**: `client/App.tsx`
- **Framework**: Expo SDK with React Navigation

### Backend (Express.js)
- **Location**: `server/`
- **Entry Point**: `server/index.ts`
- **Port**: 5000

### Shared
- **Location**: `shared/`
- **Schema**: Zod validation schemas for type safety

## Key Features

1. **User Authentication**
   - OAuth login with Facebook and X (Twitter)
   - Secure token storage with AsyncStorage
   - Demo/mock authentication for development

2. **Post Composer**
   - Text input with character counter (platform-specific limits)
   - Image/video upload support
   - Multi-platform selection

3. **Platform Selection**
   - Facebook Profile
   - Facebook Pages (multi-select for pages user manages)
   - Instagram (linked via Facebook)
   - X (Twitter)

4. **Post Scheduler**
   - Post now or schedule for later
   - Date/time picker for scheduling

5. **Post History**
   - View all published posts
   - Status tracking per platform (success/failed/scheduled)

## Running the App

### Development
The app uses two workflows:
- **Start Backend**: `npm run server:dev` (Port 5000)
- **Start Frontend**: `npm run expo:dev` (Port 8081)

### Testing on Device
Scan the QR code from Replit's URL bar menu to test on a physical device via Expo Go.

## OAuth Configuration (For Production)

### Meta (Facebook/Instagram)
1. Create a Meta Developer App at https://developers.facebook.com
2. Add Facebook Login product
3. Configure OAuth redirect URIs
4. Required permissions: `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`
5. Set environment variables:
   - `FACEBOOK_APP_ID`
   - `FACEBOOK_APP_SECRET`

### X (Twitter)
1. Create a Twitter Developer App at https://developer.twitter.com
2. Enable OAuth 2.0 with PKCE
3. Configure callback URLs
4. Required scopes: `tweet.read`, `tweet.write`, `users.read`
5. Set environment variables:
   - `TWITTER_CLIENT_ID`
   - `TWITTER_CLIENT_SECRET`

## Design System

The app follows iOS 26 liquid glass design principles with:
- **Primary Color**: #FF6B35 (Coral orange)
- **Secondary Color**: #004E89 (Deep blue)
- **Platform Colors**: Facebook (#1877F2), Instagram (gradient), X (#000000)
- **Font**: System fonts with Nunito-style typography

## File Structure
```
├── client/
│   ├── App.tsx                 # App entry point
│   ├── components/             # Reusable UI components
│   ├── context/                # React contexts (Auth, Posts)
│   ├── constants/              # Theme, colors, spacing
│   ├── hooks/                  # Custom hooks
│   ├── navigation/             # Navigation structure
│   ├── screens/                # Screen components
│   └── types/                  # TypeScript types
├── server/
│   ├── index.ts                # Server entry point
│   ├── routes.ts               # API routes
│   └── storage.ts              # Data storage
├── shared/
│   └── schema.ts               # Shared Zod schemas
├── assets/
│   └── images/                 # App icons and images
└── design_guidelines.md        # UI/UX specifications
```

## Character Limits
- Facebook: 63,206 characters
- Instagram: 2,200 characters
- X (Twitter): 280 characters

## Recent Changes
- Initial MVP implementation with mock OAuth
- Complete frontend with all screens
- AsyncStorage for local post persistence
- Platform selection with Facebook Pages support
- Post scheduling functionality
