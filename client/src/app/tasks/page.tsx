import React from "react";
import TasksPageClient from "@/components/pages/TasksPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Tasks Center",
  description: "View all team assignments, filter tasks by priority or project board, upload attachments, and comment on active work discussion threads.",
};

export default function TasksPage() {
  return <TasksPageClient />;
}
