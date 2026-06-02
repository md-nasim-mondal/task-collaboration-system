import React from "react";
import LoginPageClient from "@/components/pages/LoginPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Sign In",
  description: "Log in to your CollabSphere account or use one of our single-click sandbox accounts.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
