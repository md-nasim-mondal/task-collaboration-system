import React from "react";
import MembersPageClient from "@/components/pages/MembersPageClient";
import { serverFetch } from "@/utils/serverFetch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabSphere | Team Members",
  description: "View team workload, search members, and monitor productivity across the workspace.",
};

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  let initialMembers = [];
  let initialWorkload = [];

  try {
    const [userRes, workloadRes] = await Promise.all([
      serverFetch("/user").catch(() => ({ success: true, data: [] })),
      serverFetch("/dashboard/workload").catch(() => ({ success: true, data: [] })),
    ]);

    if (userRes.success) initialMembers = userRes.data;
    if (workloadRes.success) initialWorkload = workloadRes.data;
  } catch (err) {
    console.error("Members server-side prefetch failed:", err);
  }

  return (
    <MembersPageClient
      initialMembers={initialMembers}
      initialWorkload={initialWorkload}
    />
  );
}
