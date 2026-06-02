import React from "react";
import TasksPageClient from "@/components/pages/TasksPageClient";
import { serverFetch } from "@/utils/serverFetch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Tasks Center",
  description: "View all team assignments, filter tasks by priority or project board, upload attachments, and comment on active work discussion threads.",
};

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  let initialTasks = [];
  let initialProjects = [];
  let initialTeamMembers = [];

  try {
    const [tasksRes, projRes, userRes] = await Promise.all([
      serverFetch("/tasks?sort=-createdAt").catch(() => ({ success: true, data: [] })),
      serverFetch("/projects").catch(() => ({ success: true, data: [] })),
      serverFetch("/user").catch(() => ({ success: true, data: [] })),
    ]);

    if (tasksRes.success) initialTasks = tasksRes.data;
    if (projRes.success) initialProjects = projRes.data;
    if (userRes.success) initialTeamMembers = userRes.data;
  } catch (err) {
    console.error("Tasks server-side prefetch failed:", err);
  }

  const ClientComponent = TasksPageClient as any;

  return (
    <ClientComponent
      initialTasks={initialTasks}
      initialProjects={initialProjects}
      initialTeamMembers={initialTeamMembers}
    />
  );
}
