import React from "react";
import DashboardPageClient from "@/components/pages/DashboardPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Analytics Dashboard",
  description: "View real-time workspace metrics, team workload charts, system warning alerts, and active project pipelines.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
