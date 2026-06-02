import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL, {
      dbName: "task-collaboration-db",
    });

    console.log("✅ Connected to Database successfully!");

    // Auto-seed demo sandbox profiles
    await seedSuperAdmin();

    server = app.listen(envVars.PORT, () => {
      console.log(`🚀 Server is listening at http://localhost:${envVars.PORT}`);
      console.log(`🔑 Authentication System: CUSTOM JWT`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to Database:", error);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  console.error("Unexpected error:", error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  if (server) {
    server.close();
  }
});
