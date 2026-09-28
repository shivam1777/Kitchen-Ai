# 🍳 KitchenAI — Zero-Waste Smart Pantry & Recipe Generator

> Turn what you have in your fridge and pantry into culinary-grade zero-waste meals using multimodal Gemini AI vision and intelligent inventory tracking.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8)](https://tailwindcss.com/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-orange.svg)](https://opensource.org/licenses/Apache-2.0)

---

## ✨ Features

### 📷 1. Multimodal Real-Time Camera Scanner
- **Live Camera Stream**: Real-time viewfinder with auto environment (rear) / front camera toggle (`getUserMedia`).
- **Mechanical Shutter & Sound Effects**: Instant camera snapshot capture with built-in Web Audio synthesizer sounds.
- **Torch / Flashlight**: One-tap toggle on supported devices.
- **Gemini Vision Processing**: Multimodal AI parses perishable ingredients, assigns urgency status (*Danger*, *Expiring Soon*, *Fresh*), and detects item categories.
- **Preset Test Samples**: Instant one-click sample scans (Crisper Drawer, Refrigerator, Dry Pantry) for devices without webcam access.
- **Direct Inventory Synchronization**: One-tap "Sync Scanned Items to Virtual Pantry".

### 📦 2. Advanced Digital Pantry & Inventory Management
- **Automatic Expiration Tracker**: Computes days left until expiration with color-coded urgency badges (*Expired*, *Expires Today*, *Expiring in 2-3 Days*, *Fresh*).
- **Interactive Inline Quantity Stepper**: Adjust quantities with `+` and `-` buttons on every item; items automatically transition to *Out of Stock* when depleted.
- **Storage Location Partitioning**: Filter stock across *Fridge*, *Freezer*, *Pantry Shelf*, and *Spice Rack*.
- **"Cook With Selected" Multi-Select**: Batch select ingredients with checkboxes and launch custom recipe creation with one tap.
- **Full Shopping List Management**: Restock depleted items, mark items as purchased (which returns them to your pantry with fresh shelf life), and copy your formatted grocery list to the clipboard.
- **Sorting & Quick Search**: Sort by *Expiring Soonest*, *Name (A-Z)*, *Quantity*, or *Category*.

### 🥗 3. Zero-Waste Recipe Generator
- **Personalized Culinary Suggestions**: Generates meals tailored to the ingredients on hand, giving priority to items expiring soonest.
- **Dietary & Allergy Safeguards**: Automatically factors in user preferences (Vegan, Keto, Paleo, Gluten-Free) and filters allergens (Nuts, Shellfish, Dairy, etc.).
- **Nutritional Breakdown**: Calories, protein, carbs, and fat metrics for every recipe.

### ⏱️ 4. Interactive Hands-Free Cooking Mode
- **Step-by-Step Cooking Walkthrough**: Step timers with Web Audio alert chimes when countdowns complete.
- **Voice Guidance**: Native Web Speech Synthesis (`speechSynthesis`) reads instructions aloud while you cook.
- **Per-Step Ingredient Checklist**: Check off ingredients as you prepare each step.

### 📊 5. Sustainability & Impact Dashboard
- **Monthly Savings Tracker**: Estimated dollar savings from zero-waste home cooking.
- **Diverted Food Metric**: Tracks pounds of food saved from landfills.
- **JSON Backup Export**: Export full pantry inventory and dietary settings anytime.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or bun

### 1. Clone the repository
```bash
git clone https://github.com/your-username/kitchen-ai.git
cd kitchen-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Optional: Gemini API key for live AI vision and recipe generation.
# If omitted, intelligent local fallbacks are automatically used.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Port (defaults to 3000)
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build and Production Deployment

### Build for Production
```bash
npm run build
```

This compiles:
1. Client Vite bundle into `dist/`
2. Express backend server into `dist/server.cjs`

### Start Production Server
```bash
npm start
```

---

## 🚢 Deploying to Cloud Platforms

### Deploy on Render / Railway
1. Fork or push this repository to your GitHub account.
2. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service**.
3. Select your GitHub repository.
4. Set the build and start commands:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variable `GEMINI_API_KEY` (optional for live AI).

### Deploy with Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📂 Project Architecture

```
├── .github/workflows/ci.yml # Automated CI pipeline
├── server.ts                # Express backend with Vite middleware & Gemini API routes
├── src/
│   ├── components/
│   │   ├── BottomNav.tsx          # Navigation bar with center Camera Scan trigger
│   │   ├── CookingModeModal.tsx   # Interactive step cooking with audio timer & TTS
│   │   ├── Header.tsx             # Top header bar with real-time alert badge
│   │   ├── HomeScreen.tsx         # Hero view with camera launcher & recent recipes
│   │   ├── NotificationModal.tsx  # Smart expiry alerts for pantry & scanned items
│   │   ├── PantryScreen.tsx       # Virtual pantry with expiration & batch actions
│   │   ├── ProfileScreen.tsx      # Dietary preferences & impact dashboard
│   │   ├── RecipeResultsScreen.tsx# Curated zero-waste recipes list
│   │   └── ScanScreen.tsx         # Multimodal camera scanner with video stream
│   ├── data/
│   │   └── mockData.ts            # Baseline pantry, recipes, and user profile data
│   ├── utils/
│   │   ├── audio.ts               # Web Audio synthesizer (shutter, timer chime, beep)
│   │   └── storage.ts             # LocalStorage persistence & expiration date math
│   ├── types.ts                   # TypeScript domain models
│   ├── App.tsx                    # Root application container & state orchestration
│   └── main.tsx                   # React 19 entry point
└── package.json
```

---

## 📄 License
This project is licensed under the Apache 2.0 License.
