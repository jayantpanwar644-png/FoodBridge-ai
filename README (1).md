# @babel/code-frame

> Generate errors that contain a code frame that point to source locations.

See our website [@babel/code-frame](https://babeljs.io/docs/babel-code-frame) for more information.

## Install

Using npm:

```sh
npm install --save-dev @babel/code-frame
```

or using yarn:

```sh
yarn add @babel/code-frame --dev
```
foodbridge-ai/
│
├── 📁 frontend/                         # React 18 + Vite + Tailwind CSS + Lucide Icons
│   ├── 📁 src/
│   │   ├── 📁 components/               # Navbar, Sidebar, Modals, Drawers
│   │   ├── 📁 context/                  # AppContext (Auth state, Live sync, LocalStorage)
│   │   ├── 📁 data/                     # Seed data (Donors, NGOs, Couriers, Runs)
│   │   ├── 📁 pages/                    # 12+ Pages (Dashboard, Login, Match, Scanner, Map, Tracker, etc.)
│   │   ├── 📁 services/                 # AI matching, prediction, logistics failover engines
│   │   ├── 📁 types/                    # Domain models & TypeScript interfaces
│   │   ├── App.tsx                      # Root router
│   │   ├── index.css                    # Tailwind styles
│   │   └── main.tsx                     # React DOM mount point
│   ├── index.html                       # Frontend HTML entry
│   ├── package.json                     # Frontend dependencies
│   ├── tailwind.config.js               # Theme configuration
│   ├── tsconfig.json                    # TypeScript compiler options
│   ├── vite.config.ts                   # Vite bundler
│   └── 📁 dist/                         # Compiled production bundle
│
├── 📁 backend/                          # Node.js + Express REST API Server
│   ├── server.js                        # Complete REST APIs (Auth, Listings, Runs, QR/OTP, Scanner, Analytics)
│   └── package.json                     # Express, CORS, Dotenv dependencies
│
├── vercel.json                          # 1-Click Vercel Deployment Configuration
├── render.yaml                          # 1-Click Render.com Blueprint (Fullstack)
├── Dockerfile                           # Multi-Stage Production Container
├── docker-compose.yml                   # 1-Command local/cloud container setup
├── package.json                         # Root orchestration scripts (`npm run build`, `npm start`)
├── .env.example                         # Environment variables template
└── DEPLOYMENT_GUIDE.md                  # Complete deployment instructions
