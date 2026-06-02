import React from "react";
// Import optimized Projects Page Client component
import ProjectsPageClient from "@/components/pages/ProjectsPageClient";
import { serverFetch } from "@/utils/serverFetch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Projects Workspace",
  description: "View all active teams, search or filter through timelines, and spin up new dynamic workspaces.",
};

export default async function ProjectsPage() {
  let initialProjects = [];
  let initialMembers = [];

  try {
    const [projRes, userRes] = await Promise.all([
      serverFetch("/projects").catch(() => ({ success: true, data: [] })),
      serverFetch("/user").catch(() => ({ success: true, data: [] })),
    ]);

    if (projRes.success) initialProjects = projRes.data;
    if (userRes.success) initialMembers = userRes.data;
  } catch (err) {
    console.error("Projects server-side prefetch failed:", err);
  }

  // Cast to any to bypass stale Next.js App Router type cache
  const ClientComponent = ProjectsPageClient as any;

  return (
    <ClientComponent
      initialProjects={initialProjects}
      initialMembers={initialMembers}
    />
  );
}
