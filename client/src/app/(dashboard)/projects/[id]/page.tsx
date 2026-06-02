import React from "react";
import ProjectDetailPageClient from "@/components/pages/ProjectDetailPageClient";
import { serverFetch } from "@/utils/serverFetch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Project Workspace Detail",
  description: "Manage project details, view Kanban task columns, assign priorities, invite workspace collaborators, and track milestones.",
};

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialProject = null;
  let initialTasks = [];
  let initialUsers = [];

  try {
    const [projRes, tasksRes, userRes] = await Promise.all([
      serverFetch(`/projects/${id}`).catch(() => null),
      serverFetch(`/tasks?project=${id}`).catch(() => ({ success: true, data: [] })),
      serverFetch("/user").catch(() => ({ success: true, data: [] })),
    ]);

    if (projRes && projRes.success) initialProject = projRes.data;
    if (tasksRes && tasksRes.success) initialTasks = tasksRes.data;
    if (userRes && userRes.success) initialUsers = userRes.data;
  } catch (err) {
    console.error("Project details SSR prefetch failed:", err);
  }

  const ClientComponent = ProjectDetailPageClient as any;

  return (
    <ClientComponent
      projectId={id}
      initialProject={initialProject}
      initialTasks={initialTasks}
      initialUsers={initialUsers}
    />
  );
}
