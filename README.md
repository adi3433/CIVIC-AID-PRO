# CivicAid - Community Engagement Platform

A mobile-first web application designed to empower citizens by connecting them with community resources, safety information, civic schemes, and incident reporting tools.

## 🎯 Project Overview

CivicAid is a civic engagement platform that helps users:

- **Discover Community Services**: Browse available civic schemes and community programs
- **Report Issues**: Submit safety concerns and civic issues directly to authorities
- **Stay Informed**: Receive announcements about community events and health updates
- **Access Health Information**: Get area-specific health resources and alerts
- **Quick Actions**: Perform common tasks with ease through quick action shortcuts

## ✨ Key Features

- **Home Dashboard**: Personalized greeting, community highlights, and announcements
- **Safety Hub**: Report safety concerns and access safety guidelines
- **Schemes Directory**: Explore government and community schemes available in your area
- **Health Updates**: Area-specific health information and resources
- **Community Highlights**: Discover community events and initiatives
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Theme Support**: Light and dark theme options

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Bun or npm package manager

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd civicaid-app

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── home/           # Home page components
│   ├── layout/         # Layout components (navigation, mobile layout)
│   └── ui/             # shadcn/ui components
├── pages/              # Page components
│   ├── Home.tsx        # Dashboard
│   ├── Safety.tsx      # Safety reporting
│   ├── Schemes.tsx     # Community schemes
│   ├── Report.tsx      # Incident reporting
│   ├── Profile.tsx     # User profile
│   └── NotFound.tsx    # 404 page
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── test/               # Test files
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Form Handling**: React Hook Form
- **Testing**: Vitest
- **Linting**: ESLint

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 🤝 Contributing

1. Create a new branch for your feature (`git checkout -b feature/amazing-feature`)
2. Make your changes and commit (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📱 Mobile Optimization

CivicAid is designed with a mobile-first approach. The app features:

- Bottom navigation for easy thumb access
- Responsive grid layouts
- Touch-friendly buttons and interactions
- Optimized image carousels

## 🎨 Theming

The application supports light and dark themes via the `ThemeContext`. Users can toggle themes from their profile or through the app settings.

## 🔒 Security & Privacy

CivicAid prioritizes user privacy:

- Local storage for user preferences
- Secure form validation
- Data-driven architecture ready for API integration

## 📄 License

This project is part of the CodeKalaro Hackathon. All rights reserved.

## 🙋 Support

For issues, feature requests, or questions, please open an issue on GitHub or contact the development team.
