# 🛒 HD Mart — Smart Grocery E-Commerce Platform

<div align="center">

![HD Mart Banner](https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80)

**A full-stack, feature-rich grocery e-commerce platform built with React + Node.js + MongoDB.**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Admin Panel](#-admin-panel)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)

---

## ✨ Features

### 🛍️ Customer Features
- **Browse & Shop** — Browse 500+ grocery products across multiple categories
- **Smart Search** — Filter by category, price range, brand
- **Product Details** — Detailed product page with description, pricing, stock
- **Shopping Cart** — Add/remove items, update quantities in real-time
- **Checkout** — Full checkout flow with address management
- **Order Tracking** — Track order status (Pending → Confirmed → Out for Delivery → Delivered)
- **User Authentication** — JWT-based signup/login with secure sessions
- **Profile Management** — Update personal info and saved addresses
- **Wishlist** — Save favourite products for later
- **Real-time Notifications** — Order updates via Socket.io

### 🔐 Admin Features
- **Dashboard** — Revenue analytics, order stats, user metrics (Recharts)
- **Product Management** — Add, edit, delete products with Cloudinary image uploads
- **Order Management** — View and update order statuses
- **User Management** — View registered users and their activity
- **Inventory Tracking** — Monitor stock levels

### 💳 Payment & Delivery
- **Razorpay Integration** — Secure online payments (UPI, cards, net banking)
- **Cash on Delivery** — COD option available
- **Free Delivery** — On orders above ₹499
- **Location** — Based in Surat, Gujarat, India

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router DOM 7** | Client-side routing |
| **Axios** | HTTP client |
| **Recharts** | Admin dashboard analytics |
| **Socket.io Client** | Real-time notifications |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication tokens |
| **Bcryptjs** | Password hashing |
| **Cloudinary** | Image storage & CDN |
| **Multer** | File upload middleware |
| **Nodemailer** | Email notifications |
| **Razorpay** | Payment gateway |
| **Socket.io** | Real-time communication |

---

## 📁 Project Structure

```
Smart-Grocery-E-Commerce-Platform/
├── client/                     # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Static assets
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ...
│   │   ├── context/            # React Context (Auth, Cart)
│   │   ├── pages/              # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Admin.jsx
│   │   │   └── ...
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js Backend (Express)
│   ├── src/
│   │   ├── config/             # DB & Cloudinary config
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth & upload middleware
│   │   ├── models/             # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   └── Order.js
│   │   ├── routes/             # Express routes
│   │   ├── index.js            # Server entry point
│   │   └── seed500.js          # Database seeder (500 products)
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** v18+ — [Download](https://nodejs.org/)
- **npm** v9+
- **MongoDB Atlas** account — [Sign Up](https://cloud.mongodb.com/)
- **Cloudinary** account — [Sign Up](https://cloudinary.com/)
- **Razorpay** account (optional) — [Sign Up](https://razorpay.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/harshdamani444-droid/Smart-Grocery-E-Commerce-Platform.git
cd Smart-Grocery-E-Commerce-Platform
```

### 2. Set Up the Backend (Server)

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:5173
```

Seed the database with 500 sample products:

```bash
npm run seed
# or
node src/seed500.js
```

Start the backend server:

```bash
npm run dev        # Development (with nodemon)
# or
npm start          # Production
```

The server will run at **http://localhost:5000**

### 3. Set Up the Frontend (Client)

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The app will run at **http://localhost:5173**

---

## 🔑 Environment Variables

### Server `.env`

| Variable | Description | Required |
|---------|-------------|----------|
| `PORT` | Server port (default: 5000) | ✅ |
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `EMAIL_USER` | Gmail address for notifications | ⚠️ Optional |
| `EMAIL_PASS` | Gmail App Password | ⚠️ Optional |
| `CLIENT_URL` | Frontend URL for CORS | ✅ |

> 💡 **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords

---

## 📡 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login user |
| GET | `/me` | Get current user (protected) |
| PUT | `/profile` | Update profile (protected) |

### Product Routes (`/api/products`)
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/` | Get all products (with filters) |
| GET | `/:id` | Get single product |
| POST | `/` | Create product (admin) |
| PUT | `/:id` | Update product (admin) |
| DELETE | `/:id` | Delete product (admin) |

### Order Routes (`/api/orders`)
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/` | Place new order |
| GET | `/my-orders` | Get user's orders |
| GET | `/` | Get all orders (admin) |
| PUT | `/:id/status` | Update order status (admin) |

### Cart Routes (`/api/cart`)
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/` | Get user cart |
| POST | `/add` | Add item to cart |
| PUT | `/update` | Update cart item |
| DELETE | `/remove/:id` | Remove cart item |

---

## 🛡️ Admin Panel

Access the admin panel at **http://localhost:5173/admin**

**Default Admin Credentials:**
> Create an admin account by registering normally, then manually set `isAdmin: true` in MongoDB for that user.

### Admin Features:
- 📊 **Dashboard** — Sales analytics, order counts, revenue charts
- 📦 **Products** — Full CRUD with image upload
- 🛒 **Orders** — View all orders, update status
- 👥 **Users** — View registered users

---

## 📸 Screenshots

### 🏠 Home Page
> Modern hero section with featured categories and deals

### 🛍️ Shop Page
> Filterable product grid with 500+ grocery items

### 🛒 Cart & Checkout
> Smooth cart experience with Razorpay payment integration

### 📊 Admin Dashboard
> Analytics charts with real-time order management

---

## 🌍 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Root Directory** to `server`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add all environment variables

### Deploy Frontend to Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com`

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Harsh Damani**
- 📍 Surat, Gujarat, India
- GitHub: [@harshdamani444-droid](https://github.com/harshdamani444-droid)

---

<div align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong><br>
  Built with ❤️ in Surat, Gujarat, India 🇮🇳
</div>
