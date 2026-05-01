<div align="center">

<br />

<img src="https://img.shields.io/badge/BEST%20ERP-School%20Management%20System-0F6E56?style=for-the-badge&logoColor=white" alt="BEST ERP" height="40"/>

<br /><br />

# 🏫 BEST International School — ERP System

**A modern, full-stack School ERP built for BEST International School, Bahawalnagr.**
Digitize, streamline, and manage your entire school — students, staff, fees, attendance, and beyond.

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-1D9E75?style=for-the-badge)](https://ems-bahawalnagr.vercel.app/login)

[![GitHub Repo](https://img.shields.io/badge/Source%20Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/AmirMajeed4905/ems)

[![TypeScript](https://img.shields.io/badge/TypeScript-99%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
## 📸 Screenshots

![Dashboard](https://github.com/user-attachments/assets/3584b827-5779-4b4a-b5ed-64dfc0c5f2ab)

![Login](https://github.com/user-attachments/assets/58259b12-b6c4-4c11-b12b-644ba3a1f1d2)

![Page 3](https://github.com/user-attachments/assets/fd636ee4-30fa-46fb-ad30-7cc3f5ed9338)

![Page 4](https://github.com/user-attachments/assets/98255d6c-360f-4211-a8a5-b0b7e71cdce2)

![Page 5](https://github.com/user-attachments/assets/b7718400-2eb7-40ef-905d-c5a788604c79)

![Page 6](https://github.com/user-attachments/assets/a2a2428c-60be-4cdf-b4aa-dead9fe274d1)
<br />

</div>

---

## 📸 Preview

> 🔗 **Live System:** [ems-bahawalnagr.vercel.app/login](https://ems-bahawalnagr.vercel.app/login)

> _(Add a screenshot here: `![Dashboard](./screenshots/dashboard.png)`)_

---

## ✨ Features

The **BEST ERP** is a centralized school management platform that eliminates paperwork and gives administrators, teachers, and staff one powerful interface to run the entire school.

| Module | Description |
|---|---|
| 🔐 **Authentication** | Secure role-based login for Admin, Staff & Teachers |
| 👨‍🎓 **Student Management** | Enroll, update & track complete student records |
| 👨‍🏫 **Employee Management** | Manage staff profiles, roles & departments |
| 💰 **Fee Management** | Generate fee structures, collect & track payments |
| 📅 **Attendance System** | Daily attendance marking & monthly reports |
| 🏫 **Class & Section** | Organize students into classes, sections & subjects |
| 📊 **Dashboard & Analytics** | Real-time stats, charts & summaries at a glance |
| 📋 **Reports** | Export and view academic & financial reports |

---

## 🛠️ Tech Stack

```
Frontend     →   Next.js 14  ·  TypeScript  ·  Tailwind CSS
Backend      →   Node.js  ·  Express.js
Language     →   TypeScript (99.3%)
Deployment   →   Vercel
```

---

## 📁 Project Structure

```
ems/
│
├── 📂 frontend/               # Next.js + TypeScript App
│   ├── app/                   # App Router (pages & layouts)
│   ├── components/            # Reusable UI Components
│   ├── lib/                   # Utilities & Helpers
│   └── public/                # Static Assets
│
├── 📂 backend/                # Node.js + Express REST API
│   ├── routes/                # API Route Definitions
│   ├── controllers/           # Request Handlers
│   ├── models/                # Database Models
│   └── middleware/            # Auth & Error Handling
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup Guide

### ✅ Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/AmirMajeed4905/ems.git
cd ems
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
# Runs on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env.local` file inside `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
# Runs on http://localhost:3000
```

---

## 🌍 Deployment

The frontend is deployed on **Vercel**. To deploy your own instance:

```bash
npm install -g vercel
cd frontend
vercel
```

For the backend, you can use **Railway**, **Render**, or any Node.js host.

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Then open a Pull Request
```

---

## 👨‍💻 Author

<div align="center">

**Amir Majeed**

[![GitHub](https://img.shields.io/badge/GitHub-@AmirMajeed4905-181717?style=flat-square&logo=github)](https://github.com/AmirMajeed4905)

</div>

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

Made with ❤️ for **BEST International School, Bahawalnagr**

⭐ *Agar yeh project helpful laga toh ek star zaroor dein!* ⭐

</div>
