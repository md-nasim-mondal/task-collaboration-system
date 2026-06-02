import React from "react";
import ProjectDetailPageClient from "@/components/pages/ProjectDetailPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Project Workspace Detail",
  description: "Manage project details, view Kanban task columns, assign priorities, invite workspace collaborators, and track milestones.",
};

export default function ProjectDetailPage() {
  return <ProjectDetailPageClient />;
}
