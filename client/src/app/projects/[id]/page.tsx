import React from "react";
import ProjectDetailPageClient from "./ProjectDetailPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Project Board Details",
  description: "Organize project tasks in a Kanban board. Assign tickets to teammates, set deadlines, and monitor completion rates.",
};

export default function ProjectDetailPage() {
  return <ProjectDetailPageClient />;
}
