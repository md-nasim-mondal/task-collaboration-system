import React from "react";
import ProjectsPageClient from "./ProjectsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Projects Workspace",
  description: "View and manage active projects, coordinate deadlines, and invite team members to task boards.",
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
