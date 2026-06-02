import React from "react";
import LoginPageClient from "./LoginPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Sign In",
  description: "Sign in to your CollabSphere workspace and manage your team assignments.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
