# To-Do Shopping Dashboard - Replit Setup

## Project Overview
A comprehensive React-based task management application with Firebase integration, featuring daily, weekly, and monthly goal tracking with real-time synchronization.

**Technology Stack:**
- React 19.1.1 with Vite 7.1.2
- Firebase (Authentication + Realtime Database)
- Tailwind CSS 4.1.13
- jsPDF for PDF export functionality

## Recent Changes (October 01, 2025)
- **Replit Environment Setup**: Configured Vite to work with Replit's proxy environment
  - Server now binds to 0.0.0.0:5000 (required for Replit)
  - Added HMR configuration for WebSocket support through Replit proxy
  - Created .gitignore with Node.js and Replit-specific ignores
  
- **Security Improvements**: Updated Firebase config to support environment variables
  - Firebase credentials can now be set via environment variables (VITE_FIREBASE_*)
  - Fallback to hardcoded values for existing setup
  - Created .env.example for reference

- **Deployment Configuration**: Set up autoscale deployment
  - Build command: `npm run build`
  - Run command: `npm run preview` (serves built static files)

## Project Architecture

### Frontend Structure
```
src/
├── components/
│   ├── Login.jsx              # Authentication UI
│   ├── RepeatTaskDropdown.jsx # Task repetition feature
│   └── Auth.css               # Auth styling
├── services/
│   ├── auth.js                # Firebase authentication logic
│   └── realtime.js            # Firebase Realtime Database operations
├── App.jsx                    # Main application with all components
├── firebase.js                # Firebase configuration
└── main.jsx                   # Application entry point
```

### Key Features
1. **Calendar Integration**: Interactive calendar with week highlighting
2. **Hourly Task Management**: 24-hour task scheduling
3. **Multi-level Goals**: Daily notes, weekly goals, monthly goals
4. **Pending Tasks View**: Aggregated view of incomplete tasks
5. **PDF Export**: Export notes to PDF with watermarks
6. **Real-time Sync**: Firebase Realtime Database integration
7. **Access Key System**: Additional security layer for new users

### Data Structure
- User data isolated by UID in Firebase
- Local storage namespaced by user for offline support
- Three main collections: days, weeks, months
- Access keys stored separately for authentication

## Development

### Environment Variables (Optional)
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Workflow
- **Server**: Runs `npm run dev` on port 5000
- Vite dev server with HMR enabled
- Configured for Replit's proxy environment

### Deployment
- **Type**: Autoscale deployment
- **Build**: Vite production build
- **Serve**: Vite preview server on port 5000

## Firebase Integration
The app uses Firebase for:
- **Authentication**: Email/password with access key system
- **Realtime Database**: Live sync of tasks, goals, and notes
- **User Isolation**: Each user's data completely separated

Current Firebase project: tasklist-5d2f8
