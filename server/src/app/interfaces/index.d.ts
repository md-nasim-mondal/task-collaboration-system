declare namespace Express {
  interface Request {
    user: {
      userId: string;
      email: string;
      role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
    };
  }
}


