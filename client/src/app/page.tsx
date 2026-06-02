import React from "react";
import LandingPageClient from "@/components/pages/LandingPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Enterprise Task Collaboration",
  description: "Secure, role-based, dynamic glassmorphic task workspace featuring real-time validations and team workloads optimization.",
};

export default function LandingPage() {
  return <LandingPageClient />;
}
