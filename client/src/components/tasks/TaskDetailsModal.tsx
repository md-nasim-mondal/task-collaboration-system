"use client";

import React, { useState, useEffect } from "react";
import { Folder, X, Calendar, User, Paperclip, Send } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Task, Member } from "@/types";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  isMobile: boolean;
  isManager: boolean;
  teamMembers: Member[];
  onRefresh: () => void;
}

export default function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  isMobile,
  isManager,
  teamMembers,
  onRefresh,
}: TaskDetailsModalProps) {
  const { apiFetch, showToast, user } = useAuth();
  const router = useRouter();

  const [selectedTask, setSelectedTask] = useState<Task>(task);
  const [modalLoading, setModalLoading] = useState(false);

  // Form edit states
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editStatus, setEditStatus] = useState(task.status);
  const [editAssignee, setEditAssignee] = useState(task.assignedMember?._id || "");

  // Attachment states
  const [attachName, setAttachName] = useState("");
  const [attachUrl, setAttachUrl] = useState("");

  // Comment state
  const [commentText, setCommentText] = useState("");

  // Sync state if task prop changes
  useEffect(() => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditAssignee(task.assignedMember?._id || "");

    if (task.dueDate) {
      const d = new Date(task.dueDate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      setEditDueDate(`${yyyy}-${mm}-${dd}`);
    } else {
      setEditDueDate("");
    }
  }, [task]);

  if (!isOpen) return null;

  const handleSaveChanges = async () => {
    try {
      setModalLoading(true);
      const payload: any = {
        status: editStatus,
      };

      if (isManager) {
        payload.title = editTitle;
        payload.description = editDesc;
        payload.priority = editPriority;
        payload.dueDate = editDueDate;
        payload.assignedMember = editAssignee || null;
      }

      const res = await apiFetch(`/tasks/${selectedTask._id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast("Task updated successfully!", "success");
        onClose();
        onRefresh();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update task", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await apiFetch(`/tasks/${selectedTask._id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: commentText.trim() }),
      });

      if (res.success) {
        setSelectedTask(res.data);
        setCommentText("");
        showToast("Comment added", "success");
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to add comment", "error");
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachName.trim() || !attachUrl.trim()) return;

    try {
      const res = await apiFetch(`/tasks/${selectedTask._id}/attachments`, {
        method: "POST",
        body: JSON.stringify({
          name: attachName.trim(),
          url: attachUrl.trim(),
        }),
      });

      if (res.success) {
        setSelectedTask(res.data);
        setAttachName("");
        setAttachUrl("");
        showToast("Attachment uploaded", "success");
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to add attachment", "error");
    }
  };

  const handleDeleteTask = async () => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "Are you sure you want to remove this task from the workspace?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
      cancelButtonColor: "hsl(var(--border-color))",
      confirmButtonText: "Delete Task",
      background: "hsl(var(--bg-secondary))",
      color: "hsl(var(--text-primary))",
    });

    if (!result.isConfirmed) return;

    try {
      setModalLoading(true);
      const res = await apiFetch(`/tasks/${selectedTask._id}`, {
        method: "DELETE",
      });

      if (res.success) {
        showToast("Task deleted successfully", "success");
        onClose();
        onRefresh();
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete task", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const isAssignedToCurrentUser = selectedTask.assignedMember?._id === user?.id;
  const canModifyStatus = isManager || isAssignedToCurrentUser;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-2000 flex items-center justify-center p-2 md:p-6"
      onClick={onClose}
    >
      <div
        className="glass-panel max-w-240 w-full relative bg-secondary-bg shadow-2xl flex overflow-y-auto md:overflow-hidden max-h-[95vh] md:max-h-[90vh] flex-col md:flex-row animate-[fadeIn_var(--transition-normal)_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 cursor-pointer text-secondary hover:text-primary z-10 bg-transparent border-none outline-none transition-colors duration-200"
        >
          <X size={20} />
        </button>

        {/* Modal Body Container */}
        <div className="flex flex-col md:flex-row grow overflow-y-visible md:overflow-hidden">
          {/* Left Side: Task Fields Form */}
          <div className="grow flex-1 p-5 md:p-8 overflow-y-visible md:overflow-y-auto border-b md:border-b-0 md:border-r border-border/50">
            <div className="flex items-center gap-2 text-primary mb-3 text-xs font-bold uppercase">
              <Folder size={14} />
              <span>
                PROJECT: {selectedTask.project?.name || "Workspace"}
              </span>
            </div>

            <h2 className="font-display text-2xl font-extrabold mb-6 text-foreground">
              {isManager ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-extrabold border-b border-dashed border-border bg-transparent p-0.5 text-foreground focus:outline-none focus:border-primary transition-colors duration-200"
                />
              ) : (
                selectedTask.title
              )}
            </h2>

            <div className="flex flex-col gap-5">
              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Description
                </label>
                {isManager ? (
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={4}
                    className="w-full p-2.5 px-3 rounded-lg border border-border bg-background/30 text-foreground text-sm resize-none focus:outline-none focus:border-primary transition-colors duration-200"
                  />
                ) : (
                  <p className="text-sm leading-relaxed bg-background/30 p-3 rounded-lg border border-border/50 text-foreground">
                    {selectedTask.description ||
                      "No description provided for this task."}
                  </p>
                )}
              </div>

              {/* Metadata Dropdowns Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                    Due Date
                  </label>
                  {isManager ? (
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full border border-border rounded-lg p-2.5 bg-background/30 text-foreground text-sm outline-none focus:border-primary transition-all duration-200"
                    />
                  ) : (
                    <div className="p-2.5 rounded-lg border border-border/50 text-sm flex items-center gap-2 bg-background/10 text-foreground">
                      <Calendar size={14} />
                      <span>
                        {new Date(
                          selectedTask.dueDate,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                    Priority
                  </label>
                  {isManager ? (
                    <select
                      value={editPriority}
                      onChange={(e: any) => setEditPriority(e.target.value)}
                      className="w-full border border-border rounded-lg p-2.5 bg-background/30 text-foreground text-sm outline-none cursor-pointer focus:border-primary transition-all duration-200"
                    >
                      <option value="High" className="bg-secondary-bg">High</option>
                      <option value="Medium" className="bg-secondary-bg">Medium</option>
                      <option value="Low" className="bg-secondary-bg">Low</option>
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-lg border border-border/50 text-sm bg-background/10 text-foreground">
                      <span className={`badge badge-${selectedTask.priority.toLowerCase()}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    disabled={!canModifyStatus}
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className={`w-full border border-border rounded-lg p-2.5 bg-background/30 text-foreground text-sm outline-none focus:border-primary transition-all duration-200 ${
                      canModifyStatus ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                    }`}
                  >
                    <option value="Todo" className="bg-secondary-bg">Todo</option>
                    <option value="In Progress" className="bg-secondary-bg">In Progress</option>
                    <option value="Completed" className="bg-secondary-bg">Completed</option>
                  </select>
                  {!canModifyStatus && (
                    <span className="text-[0.7rem] text-danger mt-0.5">
                      Only editable if assigned to you.
                    </span>
                  )}
                </div>

                {/* Assignee */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                    Assignee
                  </label>
                  {isManager ? (
                    <select
                      disabled={selectedTask.status === "Completed"}
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      className={`w-full border border-border rounded-lg p-2.5 bg-background/30 text-foreground text-sm outline-none focus:border-primary transition-all duration-200 ${
                        selectedTask.status === "Completed" ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <option value="" className="bg-secondary-bg">Unassigned</option>
                      {teamMembers.map((m) => (
                        <option key={m._id} value={m._id} className="bg-secondary-bg">
                          {m.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-lg border border-border/50 text-sm flex items-center gap-2 bg-background/10 text-foreground">
                      <User size={14} />
                      <span>
                        {selectedTask.assignedMember?.name || "Unassigned"}
                      </span>
                    </div>
                  )}
                  {selectedTask.status === "Completed" && isManager && (
                    <span className="text-[0.7rem] text-muted mt-0.5">
                      Completed tasks cannot be reassigned.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Save changes action row */}
            <div className="border-t border-border/50 pt-5 mt-8 flex justify-between items-center">
              {isManager && (
                <button
                  onClick={handleDeleteTask}
                  disabled={modalLoading}
                  className="p-2.5 px-5 rounded-lg bg-danger/10 text-danger font-semibold cursor-pointer border-none hover:bg-danger/25 transition-colors duration-200 disabled:opacity-50"
                >
                  Delete Task
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={onClose}
                  className="p-2.5 px-5 rounded-lg border border-border font-semibold cursor-pointer bg-transparent text-foreground hover:bg-border transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={modalLoading}
                  className="gradient-bg p-2.5 px-6 rounded-lg font-semibold cursor-pointer border-none text-white hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-70"
                >
                  {modalLoading ? "Saving..." : "Save Workspace Details"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Comments and File Attachments */}
          <div className="grow flex-1 flex flex-col h-auto md:h-full min-h-100 md:min-h-0">
            <div className="flex border-b border-border/50 bg-secondary-bg/30">
              <div className="grow p-4 uppercase text-xs font-bold tracking-wider text-center border-b-2 border-primary text-primary">
                Collaboration Activity
              </div>
            </div>

            {/* Comments Feed Area */}
            <div className="grow overflow-y-auto p-6 flex flex-col gap-4">
              {/* Attachments Section Inside Activity */}
              <div>
                <h4 className="text-xs font-bold text-secondary mb-3 uppercase tracking-wider">
                  File Assets
                </h4>
                {selectedTask.attachments?.length === 0 ? (
                  <p className="text-xs text-muted">
                    No shared attachments yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTask.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 p-1.5 px-3 rounded-md border border-border bg-background/50 text-xs font-medium text-foreground hover:bg-border transition-colors duration-200"
                      >
                        <Paperclip size={12} />
                        <span>{att.name}</span>
                      </a>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAddAttachment} className="flex flex-col sm:flex-row gap-2 mt-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Asset Name (e.g. Design Wireframe)"
                    value={attachName}
                    onChange={(e) => setAttachName(e.target.value)}
                    className="w-full p-1.5 px-2.5 rounded-md border border-border text-xs bg-background/50 text-foreground focus:outline-none focus:border-primary transition-all duration-200"
                  />
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/..."
                    value={attachUrl}
                    onChange={(e) => setAttachUrl(e.target.value)}
                    className="w-full p-1.5 px-2.5 rounded-md border border-border text-xs bg-background/50 text-foreground focus:outline-none focus:border-primary transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer p-1.5 px-3 rounded-md bg-border text-foreground border-none text-xs font-bold w-full sm:w-auto hover:bg-background transition-colors duration-200"
                  >
                    Upload
                  </button>
                </form>
              </div>

              <div className="h-px bg-border/50 my-2" />

              {/* Comments Feed list */}
              <div>
                <h4 className="text-xs font-bold text-secondary mb-3 uppercase tracking-wider">
                  Discussion Thread
                </h4>
                {selectedTask.comments?.length === 0 ? (
                  <p className="text-xs text-muted text-center py-5">
                    No comments yet. Start the conversation below!
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedTask.comments.map((comm, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <div className="gradient-bg w-7 h-7 rounded-full flex items-center justify-center text-white text-[0.7rem] font-bold shrink-0 shadow-sm">
                          {comm.user?.name
                            ?.split(" ")
                            ?.map((n) => n[0])
                            ?.join("")
                            ?.toUpperCase()
                            ?.slice(0, 2)}
                        </div>
                        <div className="grow p-2.5 px-3 rounded-lg bg-background/40 border border-border/30">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-bold text-foreground">
                              {comm.user?.name} (
                              {comm.user?.role?.replace("_", " ")})
                            </span>
                            <span className="text-[0.65rem] text-muted">
                              {new Date(comm.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                          <p className="text-xs leading-normal text-foreground">
                            {comm.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comment Input Footer bar */}
            <form
              onSubmit={handleAddComment}
              className="p-3 px-4 md:p-5 md:px-6 border-t border-border/50 flex flex-col sm:flex-row gap-3 bg-secondary-bg/50"
            >
              <input
                type="text"
                placeholder="Add a comment to the thread..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-2.5 px-3.5 rounded-lg border border-border text-sm bg-background/50 text-foreground focus:outline-none focus:border-primary transition-all duration-200"
              />
              <button
                type="submit"
                className="cursor-pointer p-2.5 rounded-lg flex items-center justify-center text-white border-none gradient-bg w-full sm:w-auto hover:scale-105 active:scale-100 transition-transform duration-200"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
