"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import Loading from "@/components/ui/Loading";
import { Project, Member, Task } from "@/types";
import { ProjectTaskColumn } from "../projects/ProjectTaskColumn";
import { ProjectHeader } from "../projects/ProjectHeader";
import { AddProjectTaskModal } from "../projects/AddProjectTaskModal";
import { InviteProjectMemberModal } from "../projects/InviteProjectMemberModal";

const inputClass =
  "w-full p-2.5 px-3.5 rounded-lg border border-border bg-background/50 text-foreground text-sm outline-none focus:border-primary transition-all duration-200";

export default function ProjectDetailPageClient({
  projectId,
  initialProject,
  initialTasks,
  initialUsers,
}: {
  projectId: string;
  initialProject: Project | null;
  initialTasks: Task[];
  initialUsers: Member[];
}) {
  const id = projectId;
  const { apiFetch, showToast, user } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(initialProject);
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [userOptions, setUserOptions] = useState<Member[]>(initialUsers || []);
  const [loading, setLoading] = useState(!initialProject);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskFormLoading, setTaskFormLoading] = useState(false);

  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const isManager = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        apiFetch(`/projects/${id}`),
        apiFetch(`/tasks?project=${id}`),
      ]);
      if (projRes.success) setProject(projRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
    } catch (err: any) {
      showToast(err.message || "Failed to load project details", "error");
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchInviteOptions = async () => {
    try {
      const res = await apiFetch("/user");
      if (res.success) setUserOptions(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (initialProject) return;
    if (id) {
      fetchProjectDetails();
      if (isManager) fetchInviteOptions();
    }
  }, [id, initialProject]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDueDate || !taskAssignee) return;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    if (new Date(taskDueDate) < now) { showToast("Please select a valid deadline.", "error"); return; }

    try {
      setTaskFormLoading(true);
      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: taskTitle, description: taskDesc, project: id, dueDate: taskDueDate, priority: taskPriority, assignedMember: taskAssignee }),
      });
      if (res.success) {
        showToast("Task created and assigned successfully!", "success");
        setIsTaskModalOpen(false);
        setTaskTitle(""); setTaskDesc(""); setTaskDueDate(""); setTaskPriority("Medium"); setTaskAssignee("");
        fetchProjectDetails(); router.refresh();
      }
    } catch (err: any) { showToast(err.message || "Failed to create task", "error"); }
    finally { setTaskFormLoading(false); }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserId) return;
    try {
      setInviteLoading(true);
      const res = await apiFetch(`/projects/${id}/members`, { method: "POST", body: JSON.stringify({ userId: inviteUserId }) });
      if (res.success) {
        showToast("Member successfully invited to project!", "success");
        setIsInviteModalOpen(false); setInviteUserId("");
        fetchProjectDetails(); router.refresh();
      }
    } catch (err: any) { showToast(err.message || "Failed to invite member", "error"); }
    finally { setInviteLoading(false); }
  };

  const handleUpdateProjectStatus = async (newStatus: string) => {
    try {
      const res = await apiFetch(`/projects/${id}`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
      if (res.success) { showToast("Project status updated", "success"); fetchProjectDetails(); router.refresh(); }
    } catch (err: any) { showToast(err.message || "Failed to update project status", "error"); }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (memberId === project?.createdBy?._id) { showToast("Cannot remove the project owner.", "error"); return; }
    const result = await Swal.fire({ title: "Remove Member?", text: "This member will no longer have access to this project.", icon: "question", showCancelButton: true, confirmButtonColor: "hsl(var(--danger))", cancelButtonColor: "hsl(var(--border-color))", confirmButtonText: "Remove Member", background: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" });
    if (!result.isConfirmed) return;
    try {
      const res = await apiFetch(`/projects/${id}/members/${memberId}`, { method: "DELETE" });
      if (res.success) { showToast("Member removed from project", "success"); fetchProjectDetails(); router.refresh(); }
    } catch (err: any) { showToast(err.message || "Failed to remove member", "error"); }
  };

  const handleDeleteTask = async (taskId: string) => {
    const result = await Swal.fire({ title: "Delete Task?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "hsl(var(--danger))", cancelButtonColor: "hsl(var(--border-color))", confirmButtonText: "Yes, delete", background: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" });
    if (!result.isConfirmed) return;
    try {
      const res = await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
      if (res.success) { showToast("Task deleted successfully", "success"); fetchProjectDetails(); router.refresh(); }
    } catch (err: any) { showToast(err.message || "Failed to delete task", "error"); }
  };

  const handleDeleteProject = async () => {
    const result = await Swal.fire({ title: "Delete Entire Project?", text: "This will permanently remove this project and all its tasks. This action is irreversible!", icon: "warning", showCancelButton: true, confirmButtonColor: "hsl(var(--danger))", cancelButtonColor: "hsl(var(--border-color))", confirmButtonText: "Yes, delete project", background: "hsl(var(--bg-secondary))", color: "hsl(var(--text-primary))" });
    if (!result.isConfirmed) return;
    try {
      const res = await apiFetch(`/projects/${id}`, { method: "DELETE" });
      if (res.success) { showToast("Project deleted successfully", "success"); router.push("/projects"); router.refresh(); }
    } catch (err: any) { showToast(err.message || "Failed to delete project", "error"); }
  };

  const todoTasks = tasks.filter((t) => t.status === "Todo");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  if (loading || !project) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading project board..." />
      </div>
    );
  }

  return (
    <>
      <div className="animate-[fadeIn_var(--transition-normal)_forwards]">
        {/* Back Link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-secondary text-sm font-semibold mb-6 hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        {/* Project Header */}
        <ProjectHeader
          project={project}
          isManager={isManager}
          completionRate={completionRate}
          onUpdateStatus={handleUpdateProjectStatus}
          onDeleteProject={handleDeleteProject}
          onRemoveMember={handleRemoveMember}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
        />

        {/* Project Board Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-foreground">Project Tasks</h3>
          {isManager && (
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="cursor-pointer p-2 px-4 rounded-lg border-none bg-primary/10 text-primary text-sm font-bold flex items-center gap-1.5 hover:bg-primary/20 transition-colors duration-200"
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          )}
        </div>

        {/* Project Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Todo */}
          <ProjectTaskColumn
            title="Todo"
            tasks={todoTasks}
            countClass="bg-border text-foreground"
            emptyLabel="No tasks in Todo"
            isManager={isManager}
            onDelete={handleDeleteTask}
          />
          {/* In Progress */}
          <ProjectTaskColumn
            title="In Progress"
            tasks={inProgressTasks}
            countClass="bg-primary/10 text-primary"
            emptyLabel="No tasks In Progress"
            isManager={isManager}
            onDelete={handleDeleteTask}
          />
          {/* Completed */}
          <ProjectTaskColumn
            title="Completed"
            tasks={completedTasks}
            countClass="bg-success/10 text-success"
            emptyLabel="No completed tasks"
            isManager={isManager}
            onDelete={handleDeleteTask}
          />
        </div>
      </div>

      {/* ADD TASK MODAL */}
      <AddProjectTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        taskTitle={taskTitle}
        setTaskTitle={setTaskTitle}
        taskDesc={taskDesc}
        setTaskDesc={setTaskDesc}
        taskDueDate={taskDueDate}
        setTaskDueDate={setTaskDueDate}
        taskPriority={taskPriority}
        setTaskPriority={setTaskPriority}
        taskAssignee={taskAssignee}
        setTaskAssignee={setTaskAssignee}
        members={project.members || []}
        formLoading={taskFormLoading}
        minDate={getTodayDateString()}
      />

      {/* INVITE MEMBER MODAL */}
      <InviteProjectMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteMember}
        inviteUserId={inviteUserId}
        setInviteUserId={setInviteUserId}
        userOptions={userOptions}
        projectMembers={project.members || []}
        loading={inviteLoading}
      />
    </>
  );
}

