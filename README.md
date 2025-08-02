
# 🏥 QuickClinic – Smart Clinic & Appointment Platform

**QuickClinic** is a full-stack MERN-based platform designed to streamline clinic operations for **admins**, **doctors**, and **patients**. From appointment booking to prescription tracking, it ensures a smooth, modern healthcare experience.

Built with **React + Vite + TailwindCSS** and powered by a **Node.js + Express + MongoDB** backend, the platform supports **JWT-based role-based authentication**, geolocation features, and Google Maps integration.

---

## 👥 User Roles

| Role     | Capabilities |
|----------|--------------|
| **Clinic Admin** | Add & verify doctors, approve/reject appointments, manage schedules |
| **Doctor** | Manage appointments, add prescriptions, view patient records, set availability |
| **Patient** | Search clinics, book appointments, view prescriptions and history |

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
- **APIs:** Google Maps, IP Geolocation
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

### 🖥️ Frontend Setup

```bash
cd client
npm install
# In .env file
VITE_BASE_URL=http://localhost:8000/api
npm run dev
```

### 🛠️ Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```env
PORT=8000
MONGO_URI=your_mongodb_url
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
GOOGLE_API_KEY=your_google_maps_api_key
```

Start the server:

```bash
nodemon index.js
# or
node index.js
```

---

## 📚 API Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | ❌ | Login users |
| `/api/auth/register` | POST | ❌ | Register new patients |
| `/api/clinic/add` | POST | ✅ Admin | Add new clinic |
| `/api/clinic/verify` | POST | ✅ Admin | Verify via Google Maps link or OTP |
| `/api/doctor/add` | POST | ✅ Admin | Add a doctor |
| `/api/doctor/schedule` | POST | ✅ Doctor | Set availability |
| `/api/appointment/book` | POST | ✅ Patient | Book an appointment |
| `/api/prescription/create` | POST | ✅ Doctor | Add prescription |
| `/api/patient/history` | GET | ✅ Doctor/Patient | View medical history |

---

## 🗃️ Data Lifecycle

- Expired appointments and old records can be auto-cleaned using cron jobs or TTL indexes.

---

## 🧑‍💻 Future Improvements

- Real-time appointment updates (WebSocket)
- Email + SMS reminders
- Ratings & feedback for doctors
- Calendar integration

---

## 📜 License

MIT © [Your Name or GitHub Username]

---
