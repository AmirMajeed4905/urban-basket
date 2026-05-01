<div align="center">

<br/>

<img src="https://img.shields.io/badge/BEST-ERP%20System-0F6E56?style=for-the-badge&logoColor=white" height="36" alt="BEST ERP"/>

<h1>🏫 BEST International School ERP</h1>

<p>A modern, full-stack School Management System built for<br/><strong>BEST International School, Bahawalnagr.</strong></p>

<p>
  <a href="https://ems-bahawalnagr.vercel.app/login">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-1D9E75?style=for-the-badge" alt="Live Demo"/>
  </a>
  &nbsp;
  <a href="https://github.com/AmirMajeed4905/ems">
    <img src="https://img.shields.io/badge/GitHub-Source_Code-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
  &nbsp;
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-99.3%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  </a>
  &nbsp;
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
  </a>
</p>

<br/>

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

</div>

---

## 📸 Screenshots

<div align="center">

### 🔐 Login Page
![Login Page](https://github.com/user-attachments/assets/a2a2428c-60be-4cdf-b4aa-dead9fe274d1)

### 📊 Dashboard
![Dashboard](https://github.com/user-attachments/assets/3584b827-5779-4b4a-b5ed-64dfc0c5f2ab)

<details>
<summary><b>📷 View More Screenshots</b></summary>
<br/>

![Page 2](https://github.com/user-attachments/assets/58259b12-b6c4-4c11-b12b-644ba3a1f1d2)

![Page 3](https://github.com/user-attachments/assets/fd636ee4-30fa-46fb-ad30-7cc3f5ed9338)

![Page 4](https://github.com/user-attachments/assets/98255d6c-360f-4211-a8a5-b0b7e71cdce2)

![Page 5](https://github.com/user-attachments/assets/b7718400-2eb7-40ef-905d-c5a788604c79)

</details>

</div>

---

## ✨ Features

| Module | Description |
|:---|:---|
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

| Layer | Technologies |
|:---|:---|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Language** | TypeScript (99.3%) |
| **Deployment** | Vercel |

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

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm or yarn
- Git

### 1 — Clone the Repository

```bash
git clone https://github.com/AmirMajeed4905/ems.git
cd ems
```

### 2 — Setup Backend

```bash
cd backend
npm install
```

Create `.env` inside `backend/`:

```env
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

```bash
npm run dev
# ✅ Runs on http://localhost:5000
```

### 3 — Setup Frontend

```bash
cd ../frontend
npm install
```

Create `.env.local` inside `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
# ✅ Runs on http://localhost:3000
```

---

## 🌍 Deployment

Frontend is deployed on **Vercel**:

```bash
npm install -g vercel
cd frontend
vercel
```

Backend can be hosted on **Railway** or **Render**.

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request on GitHub
```

---

## 👨‍💻 Author

<div align="center">

**Amir Majeed**

[![GitHub](https://img.shields.io/badge/GitHub-@AmirMajeed4905-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AmirMajeed4905)

</div>

---

## 📄 License

This project is licensed under the **[MIT License](LICENSE)**.

---

<div align="center">

Made with ❤️ for **BEST International School, Bahawalnagr**

*⭐ if you like this project give me star. ! ⭐*

</div>
