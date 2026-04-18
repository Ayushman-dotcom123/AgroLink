# 🌾 AgroLink – India's Smart Farm Marketplace & Farm Management Platform

> Connecting Farmers and Consumers for Fair Agriculture

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Docker (optional)

### 1. Clone & Setup

```bash
# Install frontend dependencies
cd agrolink/frontend
npm install

# Install backend dependencies
cd ../backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

### 2. Database Setup

```bash
# Create database and run schema
mysql -u root -p < agrolink/database/schema.sql
mysql -u root -p agrolink_db < agrolink/database/seed.sql
```

### 3. Run Development

```bash
# Terminal 1 - Backend
cd agrolink/backend
npm run dev   # runs on http://localhost:5000

# Terminal 2 - Frontend
cd agrolink/frontend
npm run dev   # runs on http://localhost:3000
```

### 4. Docker (Production)

```bash
cd agrolink
cp .env.example .env  # fill in your values
docker-compose up -d
```

## Demo Credentials

| Role     | Email                  | Password |
|----------|------------------------|----------|
| Farmer   | farmer@demo.com        | demo123  |
| Customer | customer@demo.com      | demo123  |
| Admin    | admin@demo.com         | demo123  |

## Features

- **3D Landing Page** – Three.js farm scene with tractor, wheat fields, farmer character
- **Marketplace** – Browse/filter/buy crops directly from farmers
- **Farmer Dashboard** – Sales, weather, crop status, profit charts
- **Farm Management** – Add/manage farms with soil type, size, location
- **Inventory Tracking** – Seeds, fertilizers, pesticides with low-stock alerts
- **Expense Tracker** – Income vs expense with pie charts and profit reports
- **Weather Advisory** – OpenWeather API with farming-specific advisories
- **AI Recommendations** – Rule-based crop suggestions by soil/season/state
- **Order System** – Cart → Checkout → Track delivery status
- **Admin Panel** – Approve farmers, monitor orders, send notifications
- **Multi-language** – English, Hindi (हिंदी), Assamese (অসমীয়া)
- **Payments** – Razorpay + UPI integration

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 14, React, Tailwind CSS         |
| 3D         | Three.js, React Three Fiber, Drei       |
| Animation  | Framer Motion                           |
| State      | Zustand                                 |
| Charts     | Recharts                                |
| Backend    | Node.js, Express.js                     |
| Database   | MySQL 8.0                               |
| Auth       | JWT                                     |
| Payments   | Razorpay, UPI                           |
| Weather    | OpenWeather API                         |
| Deploy     | Docker, AWS/Vercel                      |

## Project Structure

```
agrolink/
├── frontend/
│   ├── app/
│   │   ├── page.jsx              # Landing page (3D hero)
│   │   ├── marketplace/          # Crop marketplace
│   │   ├── dashboard/            # Farmer dashboard
│   │   │   ├── farms/            # Farm management
│   │   │   ├── inventory/        # Inventory tracking
│   │   │   ├── expenses/         # Expense tracker
│   │   │   ├── weather/          # Weather advisory
│   │   │   └── ai/               # AI recommendations
│   │   ├── auth/                 # Login / Register
│   │   ├── cart/                 # Shopping cart
│   │   ├── orders/               # Order tracking
│   │   └── admin/                # Admin panel
│   ├── components/
│   │   ├── 3d/FarmScene.jsx      # Three.js 3D scene
│   │   └── layout/               # Navbar, Footer
│   ├── store/useStore.js         # Zustand state
│   └── lib/                      # API client, translations
├── backend/
│   ├── server.js                 # Express app
│   ├── routes/                   # All API routes
│   ├── middleware/auth.js        # JWT middleware
│   └── config/db.js              # MySQL connection
├── database/
│   ├── schema.sql                # Full DB schema
│   └── seed.sql                  # Sample data
└── docker-compose.yml
```

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/crops              # Marketplace listing
POST   /api/crops              # Create listing (farmer)
GET    /api/crops/:id
PUT    /api/crops/:id
DELETE /api/crops/:id

POST   /api/orders             # Place order
GET    /api/orders/my/orders   # Customer orders
PUT    /api/orders/:id/status  # Update status

GET    /api/farms              # Farmer's farms
POST   /api/farms
GET    /api/inventory
POST   /api/inventory
GET    /api/expenses
POST   /api/expenses
GET    /api/expenses/summary

GET    /api/weather?city=Delhi
POST   /api/ai/recommend

GET    /api/admin/farmers
PUT    /api/admin/farmers/:id/approve
GET    /api/admin/stats

POST   /api/payments/create-order
POST   /api/payments/verify
```

## Environment Variables

See `backend/.env.example` for all required variables.

Key ones:
- `OPENWEATHER_API_KEY` – Get free at openweathermap.org
- `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` – Get at razorpay.com
- `JWT_SECRET` – Use a strong random string in production

## Deployment

### Vercel (Frontend)
```bash
cd agrolink/frontend
npx vercel --prod
```

### AWS EC2 (Backend + MySQL)
```bash
# On EC2 instance
git clone <repo>
cd agrolink
docker-compose up -d
```

---
Made with ❤️ for Indian Farmers | किसानों के लिए बनाया गया
