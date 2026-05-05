import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { errorHandler } from "./middlewares/errorHandler";
import { setupSwagger } from "./config/swagger";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import classRoutes from "./routes/class.routes";
import studentRoutes from "./routes/student.routes";
import staffRoutes from "./routes/staff.routes";
import subjectRoutes from "./routes/subject.routes";
import attendanceRoutes from "./routes/attendance.routes";
import examRoutes from "./routes/exam.routes";
import feeRoutes from "./routes/fee.routes";
import noticeRoutes from "./routes/notice.routes";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================= CORS ================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://ems-bahawalnagr.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // mobile/postman/curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================= RATE LIMIT ================= */

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts" },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests" },
});

app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);

/* ================= SWAGGER ================= */

setupSwagger(app);

/* ================= ROUTES ================= */

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "School ERP API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/notices", noticeRoutes);

/* ================= 404 ================= */

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

export default app;
