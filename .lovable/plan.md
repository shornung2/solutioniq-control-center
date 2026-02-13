
# SolutionIQ Autopilot – Agent Console Dashboard

## Design System
- **Colors**: Dark Blue (#35495e), Mid Blue (#6e7d89), Orange (#f4af40), Light Gray (#f1f1f2) mapped to Tailwind CSS variables
- **Fonts**: Play (headings/logo) + Lato (body text) via Google Fonts
- **Theme**: Default dark mode with cyber/tech aesthetic — dark backgrounds, orange glowing accents, subtle gradients. Light mode toggle available in header.

## Layout
- **Sidebar** (collapsible): Navigation with icons for Dashboard, Tasks, Chat, Approvals, Settings
- **Top Header**: SolutionIQ Autopilot branding, connection status indicator (green/red dot + "Connected"/"Disconnected"), theme toggle, and user avatar
- **Main Content Area**: Renders the active page

## Pages

### 1. Dashboard (Home)
- **Metrics Row**: Cards showing Active Tasks, Completed Today, Success Rate, Avg Response Time
- **Performance Charts**: Line/area charts for task completion trends over time (using Recharts)
- **Activity Feed**: Real-time scrolling log of agent actions with timestamps and status badges
- **Quick Actions**: Buttons to trigger common operations (e.g., "Run Analysis", "Sync Data", "Generate Report")

### 2. Tasks
- Table/list view of all tasks with status (Pending, Running, Completed, Failed)
- Filters by status, date range
- Click a task to see details, logs, and output

### 3. Chat
- Chat interface to communicate with the AI agent
- Message bubbles with user vs agent distinction
- Input box at bottom to send messages

### 4. Approvals
- **Pending tab**: Agent-proposed actions awaiting human approval — approve/reject buttons with optional notes
- **Completed tab**: Review finished work with outcome details and feedback options
- Badge count in sidebar showing pending approvals

### 5. Settings
- API connection configuration (FastAPI backend URL, API key)
- Notification preferences
- Theme settings

## Backend Integration
- API service layer with real fetch calls to the FastAPI backend
- Centralized API client with base URL configuration, auth headers, and error handling
- React Query for data fetching, caching, and real-time polling
- Connection status derived from a health-check endpoint ping

## Key UX Details
- Connection status pulsing indicator in the header
- Toast notifications for task completions, approval requests, and errors
- Responsive layout for tablet/desktop use
- Smooth page transitions
