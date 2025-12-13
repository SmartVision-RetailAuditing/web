# Smart Vision – Web Dashboard

## 📖 Overview

**Smart Vision** is an AI-powered retail compliance platform designed to automate the verification of retail shelf compliance based on merchandising agreements.

This repository contains the **Web Frontend**, which serves as the central command center for:

- **Supervisors** to monitor field operations and compliance results
- **System Administrators** to manage users, system health, and AI operations

---

## 🚀 Tech Stack

- **Framework:** React (v18+)
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Visualization:** Recharts (Charts) & Leaflet (Maps)

---

## ✨ Key Features

### 📊 Supervisor Dashboard

- Real-time visualization of compliance trends
- Store performance metrics
- GPS-based store location mapping

### ✅ Audit Review

- Detailed inspection of shelf images
- AI-generated bounding boxes for brand detection
- Shelf share and compliance analysis

### 📅 Task Management

- Assign store visits and audit tasks to field personnel
- Track task progress and completion status

### 📈 Analytics

- Comprehensive compliance reports
- Issue distribution analysis
- Regional performance insights

### 🛡️ Admin Panel

- User provisioning and role management
- System log monitoring
- Triggering AI model retraining pipelines

---

## 🔐 Roles & Access

### Supervisor

- Dashboard access
- Store and audit monitoring
- Task assignment
- Analytics and reporting

### System Administrator

- Admin Panel access
- User management
- System health monitoring
- AI model maintenance

---

## 📂 Project Structure

The project follows a **scalable, feature-based architecture** organized by domain modules:

```text
src/
├── app/              # App configuration (Layouts, Routes, Guards)
├── components/       # UI components organized by feature (Audits, Admin, Tasks...)
├── config/           # Environment and chart configurations
├── context/          # Global state (Auth, Theme, Notifications)
├── hooks/            # Custom React hooks
├── pages/            # Application pages (Dashboard, Stores, Analytics...)
├── services/         # API integration services
├── types/            # TypeScript interfaces
└── utils/            # Helper functions (Formatting, Validators)
```
