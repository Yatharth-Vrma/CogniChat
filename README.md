# CogniChat - Intelligent Q&A System

A modern React application with animated splash screen, professional header, and advanced theme switching capabilities.

## Features

- **Animated Splash Screen**: Gradient text animation with letter-by-letter reveal
- **Professional Header**: Clean navigation with breadcrumbs and user controls
- **Advanced Theme Toggle**: Animated GIF overlay during theme transitions
- **File Management**: Upload and view PDF files
- **Chat Interface**: Interactive Q&A system
- **Responsive Design**: Works across different screen sizes

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd gemini-like-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Deployment

#### Production Build
Create an optimized production build:
```bash
npm run build
```

#### Deploy to Another Laptop
1. Copy the entire project folder to the target machine
2. Ensure Node.js and npm are installed
3. Run `npm install` to install dependencies
4. Run `npm start` for development or `npm run build` for production

## Available Scripts

### `npm start`
Runs the app in development mode with hot reload.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Project Structure

```
gemini-like-app/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # UI components (theme, text reveal, etc.)
│   │   ├── Chat.js       # Chat interface
│   │   ├── Header.js     # Navigation header
│   │   ├── Sidebar.js    # Sidebar navigation
│   │   └── FileViewer.js # PDF file viewer
│   ├── lib/              # Utility functions
│   ├── App.js            # Main application component
│   ├── index.js          # Application entry point
│   └── index.css         # Global styles and theme variables
├── package.json          # Dependencies and scripts
└── tailwind.config.js    # Tailwind CSS configuration
```

## Key Components

- **TextRevealLetters**: Animated splash screen with gradient text
- **Header**: Professional navigation with theme toggle
- **ThemeProvider**: Context-based theme management
- **ThemeToggleButton**: Animated theme switcher with GIF overlay

## Dependencies

- **React 19**: Latest React framework
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for text reveals
- **Lucide React**: Icon library
- **React PDF**: PDF viewing capabilities

## Troubleshooting

### Common Issues

1. **Dependencies not installed**: Run `npm install`
2. **Port 3000 in use**: The app will automatically use the next available port
3. **Build errors**: Check console for specific error messages

### System Requirements

- Node.js 14+ 
- npm 6+ or yarn 1.22+
- Modern web browser with ES6 support

## Browser Support

- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)

For more information about Create React App, visit the [official documentation](https://create-react-app.dev/).

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
