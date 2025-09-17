# 📋 To-Do Shopping Dashboard

A comprehensive React-based task management application with Firebase integration, featuring daily, weekly, and monthly goal tracking with real-time synchronization.

## 🌟 Features

### Core Functionality
- **📅 Calendar Integration**: Interactive calendar with date selection and week highlighting
- **⏰ Hourly Task Management**: Schedule tasks for specific hours throughout the day
- **📝 Daily Notes**: Add daily target notes and main focus areas
- **🎯 Weekly Goals**: Set and track weekly objectives
- **📊 Monthly Goals**: Plan and monitor monthly targets
- **⏳ Pending Tasks**: View all incomplete tasks across different time periods
- **🕐 Live Clock**: Real-time digital clock display
- **💾 Auto-Save**: Automatic data synchronization with Firebase

### Authentication & Security
- **🔐 Firebase Authentication**: Secure email/password login system
- **🔑 Access Key System**: Additional security layer for first-time users
- **👤 User Isolation**: Each user's data is completely separated
- **🔄 Real-time Sync**: Live updates across multiple devices

### User Interface
- **🌙 Dark Theme**: Modern dark UI with gradient backgrounds
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🎨 Modern Styling**: Clean, professional interface with smooth animations
- **⚡ Fast Performance**: Optimized with Vite for lightning-fast development

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16.0 or higher)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/To-Do-Shopping.git
   cd To-Do-Shopping
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173` in your web browser

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 🔧 Project Structure

```
To-Do-Shopping/
├── public/
│   └── vite.svg                 # Vite logo
├── src/
│   ├── components/
│   │   ├── Auth.css             # Authentication styling
│   │   └── Login.jsx            # Login/signup component
│   ├── services/
│   │   ├── auth.js              # Firebase authentication logic
│   │   └── realtime.js          # Firebase realtime database operations
│   ├── assets/
│   │   └── react.svg            # React logo
│   ├── App.css                  # Main application styles
│   ├── App.jsx                  # Main application component
│   ├── firebase.js              # Firebase configuration
│   ├── index.css                # Global styles and CSS variables
│   └── main.jsx                 # Application entry point
├── eslint.config.js             # ESLint configuration
├── index.html                   # HTML template
├── package.json                 # Project dependencies and scripts
├── package-lock.json            # Dependency lock file
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - Modern React with latest features
- **Vite 7.1.2** - Fast build tool and development server
- **CSS3** - Custom styling with CSS variables and modern features
- **ESLint** - Code linting and quality assurance

### Backend & Database
- **Firebase Authentication** - User management and security
- **Firebase Realtime Database** - Real-time data synchronization
- **Firebase Hosting** (optional) - Easy deployment

### Development Tools
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - Automatic vendor prefixing

## 📱 Application Overview

### Dashboard View
The main dashboard provides a comprehensive overview of your productivity:

- **Left Sidebar**:
  - Interactive calendar for date selection
  - Live digital clock
  - Weekly goals management
  - Monthly goals tracking

- **Main Content Area**:
  - Daily target notes
  - Hourly task scheduling (24-hour format)
  - Real-time task completion tracking

### Navigation Tabs
- **Dashboard**: Main productivity overview
- **Pending**: View all incomplete tasks across time periods
- **Calendar**: Enhanced calendar view (coming soon)
- **Analytics**: Productivity insights (coming soon)
- **Settings**: User preferences (coming soon)

### Data Management
- **Local Storage**: Immediate data persistence for offline use
- **Firebase Sync**: Real-time synchronization across devices
- **User Isolation**: Complete data separation between users
- **Auto-Save**: Automatic data saving to Firebase

## 🔐 Authentication System

### User Registration
1. Enter email and password
2. System automatically generates an access key
3. User is signed out and must sign in with the access key
4. After first successful login, access key requirement is removed

### Security Features
- **Access Key System**: Additional security layer for new users
- **Email Validation**: Proper email format validation
- **Password Requirements**: Minimum 6 characters
- **User Isolation**: Complete data separation between accounts

## 🎨 Styling & Design

### Design System
- **Color Palette**: Dark theme with purple/blue accents
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent spacing using CSS custom properties
- **Components**: Reusable UI components with consistent styling

### CSS Variables
```css
:root {
  --bg: #0b0b0f;           /* Background color */
  --panel: #111116;        /* Panel background */
  --muted: #a1a1aa;        /* Muted text color */
  --border: #22222a;       /* Border color */
  --accent: #6366f1;       /* Primary accent */
  --accent-weak: #818cf8;  /* Secondary accent */
}
```

## 📊 Data Structure

### Firebase Database Schema
```
users/
  {userId}/
    days/
      {dateKey}/           # Format: YYYY-MM-DD
        tasks/             # Hour-based tasks (0-23)
          {hour}/
            text: string
            done: boolean
        note: string        # Daily note
    weeks/
      {weekKey}/           # Format: YYYY-MM-DD (Monday start)
        goals/
          [array of goals with text and done properties]
    months/
      {monthKey}/          # Format: YYYY-MM
        goals/
          [array of goals with text and done properties]
```

### Local Storage Structure
- Data is namespaced by user ID: `uid:{userId}`
- Separate storage for: dailyNotes, dailyTasks, monthlyGoals, weeklyGoals
- Automatic cleanup when switching users

## 🚀 Deployment

### Firebase Hosting (Recommended)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**
   ```bash
   firebase init hosting
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Other Hosting Options
- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop your build folder
- **GitHub Pages**: Use GitHub Actions for automated deployment

## 🔧 Configuration

### Firebase Setup
The application uses a pre-configured Firebase project. To set up your own:

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication and Realtime Database
3. Update `src/firebase.js` with your configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}
```

### Environment Variables (Optional)
For production, consider using environment variables:

```bash
# .env.local
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Check your internet connection
   - Verify Firebase configuration in `src/firebase.js`
   - Ensure Firebase project has Authentication and Realtime Database enabled

2. **Authentication Problems**
   - Check email format
   - Ensure password is at least 6 characters
   - Verify access key for new users

3. **Data Not Syncing**
   - Check Firebase database rules
   - Verify user authentication status
   - Check browser console for errors

4. **Build Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Development Tips

- Use browser developer tools to monitor Firebase operations
- Check the Network tab for API calls
- Monitor the Console for any error messages
- Use React Developer Tools for component debugging

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Firebase Team** - For the powerful backend services
- **Vite Team** - For the fast build tool
- **Contributors** - Thank you to all contributors who help improve this project

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/To-Do-Shopping/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Happy Productivity! 🚀**

Built with ❤️ using React, Firebase, and modern web technologies.