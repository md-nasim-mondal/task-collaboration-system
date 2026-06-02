import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import { envVars } from "../config/env";
import { IAuthProvider, IsActive, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
  try {
    const demoUsers = [
      {
        name: "Demo Admin",
        email: "admin@example.com",
        password: "Password123!",
        role: Role.ADMIN,
      },
      {
        name: "Demo Project Manager",
        email: "pm@example.com",
        password: "Password123!",
        role: Role.PROJECT_MANAGER,
      },
      {
        name: "Demo Team Member",
        email: "member@example.com",
        password: "Password123!",
        role: Role.TEAM_MEMBER,
      },
    ];

    console.log("🌱 Seeding Demo Users...");

    for (const u of demoUsers) {
      const isUserExist = await User.findOne({ email: u.email });
      if (isUserExist) {
        console.log(`ℹ️ User ${u.email} already exists.`);
        continue;
      }

      const hashedPassword = await bcryptjs.hash(
        u.password,
        Number(envVars.BCRYPT_SALT_ROUND)
      );

      const authProvider: IAuthProvider = {
        provider: "credentials",
        providerId: u.email,
      };

      await User.create({
        name: u.name,
        role: u.role,
        email: u.email,
        password: hashedPassword,
        isVerified: true,
        isDeleted: false,
        isActive: IsActive.ACTIVE,
        auths: [authProvider],
      });

      console.log(`✅ Seeded ${u.name} (${u.role}) successfully!`);
    }

    console.log("🌱 Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding Demo Users:", error);
  }
};

// Self-contained execution runner for `pnpm seed` script
const runSeeder = async () => {
  try {
    await mongoose.connect(envVars.DB_URL, {
      dbName: "task-collaboration-db",
    });
    console.log("🔌 Connected to database for seeding...");
    await seedSuperAdmin();
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection error for seeding:", error);
    process.exit(1);
  }
};

// Only run if executed directly
if (require.main === module) {
  runSeeder();
}
