import React from "react";
import ProjectsPageClient from "@/components/pages/ProjectsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Projects Workspace",
  description: "View all active teams, search or filter through timelines, and spin up new dynamic workspaces.",
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
