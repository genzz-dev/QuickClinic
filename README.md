# 🏥 QuickClinic – Smart Clinic & Appointment Platform

**QuickClinic** is a full-stack MERN-based platform designed to streamline clinic operations for **admins**, **doctors**, and **patients**. From appointment booking to prescription tracking, it ensures a smooth, modern healthcare experience.

Built with **React + Vite + TailwindCSS** and powered by a **Node.js + Express + MongoDB** backend, the platform supports **JWT-based role-based authentication**, geolocation features, and Google Maps integration.

Live demo: https://quick-clinic-psi.vercel.app/

---

## 👥 User Roles

| Role             | Capabilities                                                                   |
| ---------------- | ------------------------------------------------------------------------------ |
| **Clinic Admin** | Add & verify doctors, approve/reject appointments, manage schedules            |
| **Doctor**       | Manage appointments, add prescriptions, view patient records, set availability |
| **Patient**      | Search clinics, book appointments, view prescriptions and history              |

---

## 🚀 Core Features

- ✅ Role-based Dashboards for Admins, Doctors, and Patients
- ✅ Google Maps link-based clinic location auto-fill
- ✅ IP & Geolocation-based nearby clinic suggestions
- ✅ Appointment booking and smart scheduling
- ✅ Doctor-written prescriptions stored in patient history
- ✅ OTP-based verification for clinic and doctors
- ✅ JWT Authentication with refresh token support
- ✅ Modern UI using TailwindCSS and Vite

---

## 🧠 Tech Stack

- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express, MongoDB
- **Authentication:** JWT Access + Refresh Tokens
- **APIs:** Google Maps, IP Geolocation, Cloudinary
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 📦 Folder Structure

```
quickclinic/
├── client/       # Vite + React frontend
└── server/       # Node.js + Express backend
```

---

## 🧪 Features by Role

### 👤 Patient

- Search clinics by specialty or proximity
- Book appointments with available doctors
- View full prescription and medical history

### 👨‍⚕️ Doctor

- Accept or reject appointments
- Set availability
- Add/view prescriptions
- View full patient treatment history

### 🏥 Clinic Admin

- Add and verify doctors
- Approve or reject appointments
- View status of all clinic operations

---

## 🔐 Authentication & Security

- JWT with refresh token rotation
- Role-based access control middleware
- Secure cookies for session management

---

## 📍 Location-Aware Clinic Discovery

- Clinic admins paste **Google Maps link** instead of entering full address
- Location extracted from link via Google Maps API
- Patients can find nearby clinics using:
  - Geolocation
  - IP address fallback

---

## 🔧 Getting Started

### Environment Variables Setup

You need to create **two separate `.env` files** - one for the client (frontend) and one for the server (backend).

#### 🖥️ Frontend (.env in client folder)

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Note:** You can use the local backend URL (`http://localhost:3000/api`) or the live backend URL: `https://quickclinic-fowt.onrender.com/api`

#### 🛠️ Backend (.env in server folder)

```env
JWT_ACCESS_SECRET=4a8f5b3e7d2c1a9b6f5e4c3a2b1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4
JWT_REFRESH_SECRET=6e5f4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
PORT=3000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
GOOGLE_API_KEY=your_google_api_key
GOOGLE_PLACES_ENDPOINT=https://maps.googleapis.com/maps/api/place
Frontend_url=http://localhost:5173
```

---

### Running the Application

#### Option 1: Manual Run

**Frontend (Client):**
```bash
cd client
npm install
npm run dev
```

**Backend (Server):**
```bash
cd server
npm install
node index.js
# or use nodemon for development
nodemon index.js
```

#### Option 2: Docker

Use the provided `docker-compose.yml` file:

```bash
docker-compose up
```

This will start both the frontend and backend services in containers.

---

**Live Backend URL:** [https://quickclinic-fowt.onrender.com/api](https://quickclinic-fowt.onrender.com/api)

---

## 🧑‍💻 Future Improvements

- Real-time appointment updates (WebSocket)
- Email + SMS reminders
- Ratings & feedback for doctors
- Calendar integration
- QuickMed - a whole new module for the medicine info 
---

## 🤝 Contributing

Want to contribute? Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
