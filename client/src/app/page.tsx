import React from "react";
import LandingPageClient from "./LandingPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Smart Project & Task Collaboration Workspace",
  description: "Empower your team with CollabSphere. Experience glassmorphic dashboards, custom workload balance analytics, and secure task collaboration boards.",
};

export default function LandingPage() {
  return <LandingPageClient />;
}
