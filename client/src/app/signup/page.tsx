import React from "react";
import SignupPageClient from "@/components/pages/SignupPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Sign Up",
  description: "Create an account on CollabSphere to join and manage project workspace dashboards and Kanban task boards.",
};

export default function SignupPage() {
  return <SignupPageClient />;
}
