# Social Media Multi-Poster Design Guidelines

## 1. Brand Identity

**Purpose**: Empowers content creators and social media managers to efficiently publish content across multiple platforms simultaneously, eliminating repetitive posting.

**Aesthetic Direction**: Bold/striking with professional confidence. High contrast design that feels powerful and intentional - this is a productivity tool for people who mean business. The visual language emphasizes connectivity between platforms through deliberate use of color-coded platform indicators and clear visual hierarchy.

**Memorable Element**: Platform connectivity visualization - each social platform has its distinct brand color that appears throughout the UI, creating an instant visual map of where content is going. When multiple platforms are selected, their colors blend in gradients/borders to show unified publishing.

---

## 2. Navigation Architecture

**Root Navigation**: Tab Navigation (3 tabs)
- **Posts** (Home): Post history and status tracking
- **Compose** (Center FAB): Primary creation action
- **Account**: Connected platforms and settings

**Authentication Flow**:
- Stack-based login screens before tab navigation unlocks
- OAuth screens for Facebook and X (Twitter) handled via web modal/in-app browser
- Profile setup after first login

---

## 3. Screen-by-Screen Specifications

### Login/Signup Screen
**Purpose**: Authenticate user via Facebook and/or X OAuth

**Layout**:
- Header: None (full screen)
- Root view: Non-scrollable, centered content
- Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components**:
- App icon (large, 120pt)
- App name and tagline
- Two prominent OAuth buttons:
  - "Continue with Facebook" (Facebook blue #1877F2)
  - "Continue with X" (X black #000000)
- Footer: Privacy policy and terms links

**Visual Feedback**: OAuth buttons scale down slightly on press (0.95 scale)

---

### Posts Screen (Tab 1 - Home)
**Purpose**: View published post history and status per platform

**Layout**:
- Header: Transparent with title "Posts", right button = filter icon
- Root view: Scrollable list
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Post cards in vertical list, each showing:
  - Thumbnail (if image/video)
  - Caption preview (2 lines max)
  - Platform badges (color-coded icons: Facebook, Instagram, X)
  - Status indicators per platform (success checkmark, failed X, scheduled clock)
  - Timestamp
- Pull-to-refresh
- Empty state illustration when no posts exist

**Empty State**: Shows "empty-posts.png" illustration with message "No posts yet. Tap + to create your first multi-platform post"

---

### Compose Screen (FAB Modal)
**Purpose**: Create and publish/schedule post to selected platforms

**Layout**:
- Header: Custom header with "Cancel" (left), "Compose" (title), "Next" (right, disabled until valid input)
- Root view: Scrollable form
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl
- Presented as full-screen modal from FAB

**Components** (in order):
1. Media upload section:
   - Image/video picker button (large, dashed border)
   - Selected media preview (if uploaded)
   - Remove button (X icon overlay on preview)

2. Caption text area:
   - Multi-line text input
   - Character counter below (shows limits per platform in small text)
   - Platform with strictest limit highlighted in orange if exceeded

3. Platform selection:
   - Section header: "Publish to"
   - Checkboxes for:
     - Facebook Profile (with profile picture)
     - Facebook Pages (expandable - shows multi-select list of pages when checked)
     - Instagram (with Instagram gradient border)
     - X (with X logo)
   - Each checkbox has platform brand color accent when selected

4. Schedule section:
   - Toggle: "Post now" vs "Schedule"
   - Date/time picker (appears when Schedule enabled)

5. Preview section (collapsible):
   - Shows mock previews for each selected platform
   - Platform tabs to switch between Facebook/Instagram/X preview layouts

**Submit Flow**: "Next" button → Review screen (native modal) → "Publish" confirmation

**Visual Feedback**: Checkboxes use platform colors when selected. Media picker button pulses subtle scale animation when empty.

---

### Account Screen (Tab 3)
**Purpose**: Manage connected platforms, view profile, settings

**Layout**:
- Header: Transparent with title "Account"
- Root view: Scrollable
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
1. Profile section:
   - User avatar (generated preset)
   - Display name
   - Email (from OAuth)

2. Connected Platforms section:
   - List of connected platforms (Facebook, X)
   - Each platform shows:
     - Platform icon and name
     - "Connected" status with checkmark
     - "Disconnect" button (red text)
   - "Connect Platform" button for unconnected platforms

3. Settings section:
   - Notifications toggle
   - Theme selector (Light/Dark/Auto)

4. Account actions (nested under "Account Settings"):
   - Log out (confirmation alert)
   - Delete account (nested, double confirmation)

---

## 4. Color Palette

**Primary**: #FF6B35 (Bold coral-orange - energetic, action-oriented)
**Secondary**: #004E89 (Deep blue - trust, professionalism)

**Background**:
- Light mode: #F7F9FC
- Dark mode: #0F0F0F

**Surface**:
- Light mode: #FFFFFF
- Dark mode: #1C1C1E

**Text**:
- Primary: #1A1A1A (light) / #F5F5F7 (dark)
- Secondary: #6B6B6B (light) / #9A9A9D (dark)

**Platform Accents** (used for platform-specific elements):
- Facebook: #1877F2
- Instagram: Linear gradient (#F58529 → #DD2A7B → #8134AF)
- X: #000000

**Semantic**:
- Success: #27AE60
- Warning: #F39C12
- Error: #E74C3C

---

## 5. Typography

**Font**: Nunito (Google Font - friendly, modern, professional without being corporate)

**Type Scale**:
- Hero: 32pt Bold
- Title: 24pt Bold
- Heading: 18pt SemiBold
- Body: 16pt Regular
- Caption: 14pt Regular
- Small: 12pt Regular

**Platform Indicators**: Use system SF Symbols for icons paired with Nunito labels

---

## 6. Assets to Generate

**icon.png**
- Description: App icon featuring overlapping platform circles (Facebook blue, Instagram gradient, X black) with a paper airplane/send symbol in the center
- Where used: Device home screen

**splash-icon.png**
- Description: Simplified version of app icon on solid background
- Where used: App launch screen

**empty-posts.png**
- Description: Illustration of empty megaphone or clipboard with multiple platform icons floating around it (subtle, supportive colors matching brand)
- Where used: Posts screen when user has no post history

**avatar-preset.png**
- Description: Clean geometric avatar with user initials placeholder (uses Primary color background)
- Where used: Account screen profile section

**preview-facebook.png**
- Description: Mock Facebook post card UI showing sample layout
- Where used: Compose screen preview section

**preview-instagram.png**
- Description: Mock Instagram post card UI showing sample layout
- Where used: Compose screen preview section

**preview-x.png**
- Description: Mock X/Twitter post card UI showing sample layout
- Where used: Compose screen preview section