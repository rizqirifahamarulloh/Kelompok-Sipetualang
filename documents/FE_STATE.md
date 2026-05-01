# Frontend State — SiPetualang

> Last updated: 2026-05-02

## Tech Stack
- **Framework**: React 19.2.5
- **Build Tool**: Vite 8.0.10
- **Styling**: Tailwind CSS v4.2.4
- **Animation**: Framer Motion 12.38
- **Font**: Poppins (via @fontsource)
- **Linting**: ESLint 10

## Architecture
```
frontend/
├── src/
│   ├── App.jsx              # Root component
│   ├── app.css              # Global styles
│   ├── main.jsx             # Entry point
│   ├── assets/              # Static assets (images, icons)
│   ├── components/          # Shared components (empty)
│   └── features/
│       └── landing/
│           ├── components/  # Landing page components
│           │   ├── Navbar.jsx
│           │   ├── Hero.jsx
│           │   ├── Information.jsx
│           │   ├── HowItWorks.jsx
│           │   ├── Category.jsx
│           │   ├── Brand.jsx
│           │   ├── Testimonial.jsx
│           │   ├── Footer.jsx
│           │   └── LoadingScreen.jsx
│           ├── pages/
│           │   └── Home.jsx
│           ├── constants.js
│           └── landing.css
├── public/                  # Static public files
├── dist/                    # Build output
├── index.html
├── vite.config.js
└── package.json
```

## Implemented Features
- ✅ Landing page with all sections
- ✅ Animated loading screen
- ✅ Responsive navbar
- ✅ Feature-based folder structure

## Pending Features
- React Router (multi-page navigation)
- Auth pages (Login / Register)
- Super Admin Dashboard
- Penyewa Dashboard
- Customer Dashboard
- API integration layer
- JWT token management
- i18n (ID/EN)

## Known Issues
- No routing yet (single-page landing)
- No state management library (will need for dashboard)
