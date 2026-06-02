import React from "react";
import TasksPageClient from "./TasksPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Tasks Center",
  description: "Manage, filter, search, and assign workspace tasks. Collaborate through dynamic threads and check overdue warning alerts.",
};

export default function TasksPage() {
  return <TasksPageClient />;
}
