import dns from "dns";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

// Manually configure Node.js dns module to resolve using Google DNS (prevents Atlas querySrv resolution failures on local/serverless environments)
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import rateLimit from "express-rate-limit";
import { envVars } from "./app/config/env";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";

const app = express();

// Vercel Serverless Database Connection and Seeding Middleware
let isDbConnected = false;
app.use(async (_req, _res, next) => {
  if (process.env.VERCEL && !isDbConnected) {
    try {
      const mongoose = await import("mongoose");
      const { seedSuperAdmin } = await import("./app/utils/seedSuperAdmin");
      await mongoose.default.connect(envVars.DB_URL, {
        dbName: "task-collaboration-db",
      });
      isDbConnected = true;
      console.log("✅ Vercel DB Connection Established");
      await seedSuperAdmin();
    } catch (error) {
      console.error("❌ Vercel DB Connection Failed:", error);
    }
  }
  next();
});

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  })
);

// Logging
if (envVars.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use("/api", limiter);

app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", router);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Task Collaboration System API!",
    version: "1.0.0",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
