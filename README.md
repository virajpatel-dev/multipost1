# MultiPost

A cross-platform mobile application that enables users to create one post and publish it simultaneously to multiple social media platforms: Facebook (including multiple Facebook Pages), Instagram, and X (Twitter).

## Features

- **Multi-Platform Publishing**: Share a single post to Facebook, Instagram, and X simultaneously
- **Facebook Pages Support**: Publish to multiple Facebook Pages at once
- **OAuth Authentication**: Secure login with real Facebook and X accounts
- **Instagram Integration**: Automatically connected when you link your Facebook account (via Meta Graph API)
- **Media Upload**: Attach photos to your posts
- **Character Counting**: Real-time character limits per platform
  - Facebook: 63,206 characters
  - Instagram: 2,200 characters
  - X (Twitter): 280 characters
- **Post History**: View and track all your published posts
- **Platform Status Tracking**: Monitor publish status for each platform

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Express.js with TypeScript
- **UI Design**: iOS 26 Liquid Glass design system
- **State Management**: React Context API
- **Data Fetching**: TanStack React Query
- **Storage**: AsyncStorage for local persistence

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app (for mobile testing)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development servers:
   ```bash
   npm run dev
   ```

### OAuth Configuration

To enable real social media login, you need to configure OAuth credentials:

#### Facebook & Instagram Setup

1. Create a Meta Developer App at [developers.facebook.com](https://developers.facebook.com)
2. Add Facebook Login product
3. Configure OAuth redirect URI: `multipost://oauth`
4. Set the following environment variables:
   - `FACEBOOK_APP_ID`: Your Facebook App ID
   - `FACEBOOK_APP_SECRET`: Your Facebook App Secret

Required Facebook permissions:
- `public_profile`
- `email`
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `instagram_basic`
- `instagram_content_publish`

#### X (Twitter) Setup

1. Create a Developer App at [developer.x.com](https://developer.x.com)
2. Enable OAuth 2.0
3. Configure OAuth redirect URI: `multipost://oauth`
4. Set the following environment variables:
   - `X_CLIENT_ID`: Your X Client ID
   - `X_CLIENT_SECRET`: Your X Client Secret

Required X scopes:
- `tweet.read`
- `tweet.write`
- `users.read`
- `offline.access`

## Project Structure

```
multipost/
├── client/                 # React Native Expo app
│   ├── components/         # Reusable UI components
│   ├── context/            # React Context providers
│   ├── constants/          # Theme and design tokens
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # App screens
│   └── types/              # TypeScript definitions
├── server/                 # Express.js backend
│   ├── routes.ts           # API routes
│   ├── oauth.ts            # OAuth implementation
│   └── storage.ts          # Data storage
├── shared/                 # Shared code between client/server
│   └── schema.ts           # Zod schemas
└── assets/                 # Images and icons
```

## API Endpoints

### Authentication

- `GET /api/oauth/config` - Get OAuth configuration status
- `POST /api/oauth/facebook/token` - Exchange Facebook auth code for tokens
- `POST /api/oauth/x/token` - Exchange X auth code for tokens

### Posts

- `GET /api/posts/:userId` - Get all posts for a user
- `POST /api/posts/:userId` - Create a new post
- `DELETE /api/posts/:userId/:postId` - Delete a post

### Publishing

- `POST /api/publish/facebook` - Publish to Facebook Page
- `POST /api/publish/instagram` - Publish to Instagram
- `POST /api/publish/x` - Publish to X (Twitter)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FACEBOOK_APP_ID` | Meta Developer App ID | For Facebook/Instagram |
| `FACEBOOK_APP_SECRET` | Meta Developer App Secret | For Facebook/Instagram |
| `X_CLIENT_ID` | X Developer Client ID | For X |
| `X_CLIENT_SECRET` | X Developer Client Secret | For X |
| `SESSION_SECRET` | Session encryption key | Yes |

## Testing on Mobile

1. Install Expo Go on your iOS or Android device
2. Scan the QR code displayed in the terminal
3. The app will load on your device

## Design System

The app follows iOS 26 Liquid Glass design principles:
- Frosted glass effects with subtle blur
- Dynamic light reflection
- Spring-based animations
- Coral orange primary color (#FF6B35)
- Platform-specific accent colors:
  - Facebook: #1877F2
  - Instagram: #E4405F
  - X (Twitter): #000000

## License

MIT License
