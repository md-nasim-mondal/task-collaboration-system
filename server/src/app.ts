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
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [envVars.FRONTEND_URL].filter(Boolean);
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        callback(null, true);
      } else {
        // Fallback to allow connection in preview environments
        callback(null, true);
      }
    },
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
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Collaboration API - Online</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-color: #0b0f19;
          --panel-bg: rgba(17, 24, 39, 0.7);
          --accent-primary: #6366f1;
          --accent-secondary: #a855f7;
          --text-main: #f3f4f6;
          --text-muted: #9ca3af;
          --green-glow: #10b981;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--bg-color);
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 40%);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-x: hidden;
        }

        .container {
          max-width: 650px;
          width: 100%;
          background: var(--panel-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          text-align: center;
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--green-glow);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          letter-spacing: 0.5px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background-color: var(--green-glow);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 12px var(--green-glow);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        h1 {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .tagline {
          font-size: 16px;
          color: var(--text-muted);
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          margin: 24px 0;
        }

        .endpoints-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--text-muted);
          margin-bottom: 16px;
          font-weight: 700;
        }

        .endpoint-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }

        .endpoint-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-2px);
        }

        .method {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .path {
          font-family: monospace;
          color: var(--text-main);
          font-size: 14px;
          font-weight: 500;
        }

        .footer {
          margin-top: 32px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .footer a {
          color: var(--accent-primary);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer a:hover {
          color: var(--accent-secondary);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="status-badge">
          <span class="status-dot"></span>
          SYSTEM RUNNING
        </div>
        <h1>Task Collaboration System</h1>
        <p class="tagline">The backend API is running smoothly and ready for client integrations. Connect your client apps to get started.</p>
        
        <div class="divider"></div>
        
        <h2 class="endpoints-title">Available Core Routes</h2>
        
        <div class="endpoint-card">
          <span class="path">/api/v1/auth</span>
          <span class="method">Authentication</span>
        </div>
        <div class="endpoint-card">
          <span class="path">/api/v1/users</span>
          <span class="method">User Management</span>
        </div>
        <div class="endpoint-card">
          <span class="path">/api/v1/projects</span>
          <span class="method">Project Board</span>
        </div>
        <div class="endpoint-card">
          <span class="path">/api/v1/tasks</span>
          <span class="method">Task Tracker</span>
        </div>
        <div class="endpoint-card">
          <span class="path">/health</span>
          <span class="method">GET Status</span>
        </div>

        <div class="footer">
          Task Collaboration System &bull; Version 1.0.0 &bull; <a href="/health" target="_blank">Health Specs</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
