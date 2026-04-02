# Placement Eligibility Predictor

🎯 **Premium SaaS-Style Placement Prediction Platform**

A full-stack web application built with Flask + React that analyzes your technical skills and predicts placement eligibility with real-time analytics, beautiful animations, and professional UI.

---

## ✨ Features

### Backend (Flask)
- ✅ **Robust Scoring Algorithm**: 8-category weighted calculation (0-300 points)
- ✅ **Input Validation**: Type checking, range validation, enum constraints
- ✅ **Real-time Analysis**: Instant processing with detailed breakdown
- ✅ **Data Persistence**: SQLite database with prediction history
- ✅ **Smart Suggestions**: AI-powered improvement recommendations
- ✅ **Error Handling**: Meaningful error messages with status codes
- ✅ **Structured Logging**: Complete request/response tracking

### Frontend (React + Tailwind + Framer Motion)
- ✅ **Premium UI Design**: Glassmorphism + dark gradients + neon glows
- ✅ **Smooth Animations**: Page transitions, staggered entrances, morphing effects
- ✅ **Interactive Dashboard**: Animated gauge, metric cards, charts
- ✅ **Advanced Visualizations**: Pie & Bar charts (Chart.js), heatmaps
- ✅ **Mobile Responsive**: Perfect scaling from 320px to 1920px+
- ✅ **Accessibility**: WCAG AAA compliance, keyboard navigation
- ✅ **Real-time State Management**: Context API with React Router

---

## 📦 Project Structure

```
MENTOR_AI/
├── backend/
│   ├── app.py                      # Flask server + API routes
│   ├── database.py                 # SQLite management & queries
│   ├── models/
│   │   └── score_calculator.py    # Scoring algorithm + validation
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── InputPage.jsx      # Form with validation
│   │   │   └── DashboardPage.jsx  # Main dashboard
│   │   ├── components/
│   │   │   ├── ScoreCard.jsx           # Animated gauge
│   │   │   ├── MetricsGrid.jsx         # 6 performance cards
│   │   │   ├── AnalyticsSection.jsx    # Pie + Bar charts
│   │   │   ├── SuggestionsCard.jsx     # Improvement tips
│   │   │   ├── EligibilityCards.jsx    # Status cards
│   │   │   └── Confetti.jsx            # Celebration animation
│   │   ├── context/
│   │   │   └── PredictionContext.jsx   # Global state
│   │   ├── utils/
│   │   │   └── api.js                  # Axios client
│   │   ├── styles/
│   │   │   └── globals.css             # Global styles + animations
│   │   ├── App.jsx                     # Router setup
│   │   └── index.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .gitignore
│   └── .env.example
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.8+ (for backend)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Flask server**
   ```bash
   python app.py
   ```
   
   Server runs at: **http://localhost:5000**

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   App runs at: **http://localhost:5173**

4. **Build for production**
   ```bash
   npm run build
   ```

---

## 📊 How It Works

### Input Form (Page 1)
1. Fill 9 fields:
   - Coding Problems Solved (0-2000)
   - LeetCode Problems (0-3000)
   - Open Source Contribution (dropdown)
   - Competition Level (dropdown)
   - Certificates (dropdown: none, NPTEL, international, multiple)
   - CP Rating (dropdown)
   - Projects Level (dropdown)
   - Aptitude Score (0-100)
   - SkillRank Score (0-100)

2. Click **"Analyze Performance"**

### Scoring & Eligibility
- **College criteria-based scoring** implemented on the frontend utility
- **8 core skill bands + certificates**, scaled to **300 max points**
- **Real-time calculation** on backend + enhanced frontend mapping

**Eligibility Tiers (College View):**
- 🔴 **Below 5 LPA** (< 100 points)
- 🟡 **5–10 LPA** (100–259 points)
- 🟢 **Above 10 LPA** (260–300 points)

### Dashboard (Page 2)
1. **Score Card**: Animated gauge with current tier
2. **Metrics Grid**: 6 cards showing category breakdown
3. **Analytics**: Pie chart (distribution) + Bar chart (comparison)
4. **Suggestions**: 3–5 smart improvement tips (expandable)
5. **Eligibility Cards**: Visual status with benefits
6. **Confetti Animation**: Celebrates "Above 10 LPA" tier

---

## 🎨 Design System

| Aspect | Value |
|--------|-------|
| **Colors** | Blue (#3B82F6), Purple (#A855F7), Green (#10B981), Yellow (#FBBF24), Red (#EF4444) |
| **Typography** | Inter (default), Poppins (headings) |
| **Border Radius** | 8px-24px (smooth) |
| **Glassmorphism** | `backdrop-blur-md`, `bg-white/10`, `border-white/20` |
| **Shadows** | Layered + glow effects based on color |
| **Animations** | Framer Motion + CSS keyframes |

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict` | Analyze form data, return score + eligibility |
| GET | `/api/predictions/history` | Get last 10 predictions |
| GET | `/api/predictions/<id>` | Get specific prediction |
| GET | `/api/categories` | Get category definitions |
| GET | `/api/health` | Health check |

### Request Example
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "coding_problems": 500,
    "leetcode_problems": 300,
    "open_source": "Intermediate",
    "competitions": "Advanced",
    "cp_rating": "4-star",
    "projects": "Intermediate",
    "aptitude": 85,
    "skillrank": 75
  }'
```

### Response Example
```json
{
  "success": true,
  "total_score": 245.5,
  "eligibility": {
    "tier": "Above 10 LPA",
    "color": "green",
    "min_score": 200,
    "max_score": 300
  },
  "category_breakdown": {
    "coding_problems": {
      "name": "Coding Skills",
      "score": 25,
      "max": 20,
      "percentage": 100,
      "weight": 0.25
    },
    ...
  },
  "suggestions": [
    "Complete 100+ projects on SkillRank platform",
    "Participate in 5+ programming competitions",
    ...
  ],
  "prediction_id": 1
}
```

---

## 📈 Screenshots

### Input Form
- Clean, minimal design
- Animated gradient background
- Form validation with error messages
- Smooth focus transitions

### Dashboard
- Centered score card with animated gauge
- 6 performance metric cards with progress bars
- Pie + Bar charts with color coding
- Expandable suggestions with detailed action items
- 3 eligibility status cards (highlight current tier)
- Responsive grid layout

---

## ✅ Testing Checklist

### Backend
- [ ] `/api/predict` accepts valid form data and returns success
- [ ] Invalid input returns 400 with error messages
- [ ] Total score always in 0-300 range
- [ ] Database persists predictions
- [ ] Logs show calculation steps

### Frontend
- [ ] Form submission works smoothly
- [ ] Navigation to dashboard is instant
- [ ] All animations run at 60fps (no jank)
- [ ] Responsive on mobile (320px), tablet (768px), desktop (1920px+)
- [ ] Charts render correctly with data
- [ ] Confetti fires for "Above 10 LPA" tier
- [ ] Accessibility: Tab navigation, focus indicators, ARIA labels

### Visual Quality
- [ ] Glassmorphism visible on cards
- [ ] Glow colors match eligibility tier
- [ ] Typography is readable
- [ ] All icons display correctly
- [ ] Dark gradient background visible
- [ ] Smooth transitions and animations (no stuttering)

---

## 🚀 Deployment

### Backend (Flask to Heroku)
```bash
# Create Procfile in backend/
echo "web: gunicorn app:app" > backend/Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### Frontend (React to Vercel/Netlify)
```bash
# Build
npm run build

# Vercel
npm install -g vercel
vercel

# Netlify
npm run build
netlify deploy --prod --dir=dist
```

---

## 🔐 Environment Variables

**Backend** (`.env`)
```
FLASK_ENV=production
DEBUG=False
```

**Frontend** (`.env.local`)
```
VITE_API_URL=https://your-backend-url.com
```

---

## 📝 Notes

- **Scoring Formula**: Linear weighted sum for transparency
- **Database**: SQLite (local), can migrate to PostgreSQL for production
- **State Management**: React Context API (simple, sufficient for this app)
- **Animations**: Framer Motion (professional, performant)
- **Styling**: Tailwind CSS + custom CSS keyframes

---

## 🤝 Contributing

Suggestions and improvements welcome!

---

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for placement success**
