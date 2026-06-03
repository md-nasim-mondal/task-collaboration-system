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

      // Only allow editing title, description, priority, deadline, assignee for Admin/PM
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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(6px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "8px" : "24px",
      }}
      onClick={onClose}>
      <div
        className='glass-panel'
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "960px",
          width: "100%",
          maxHeight: isMobile ? "95vh" : "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: isMobile ? "auto" : "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          backgroundColor: "hsl(var(--bg-secondary))",
          position: "relative",
          animation: "fadeIn var(--transition-normal) forwards",
        }}>
        {/* Modal Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            cursor: "pointer",
            color: "hsl(var(--text-secondary))",
            zIndex: 10,
            background: "none",
            border: "none",
          }}>
          <X size={20} />
        </button>

        {/* Modal Body Container */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flexGrow: 1, overflow: isMobile ? "visible" : "hidden" }}>
          {/* Left Side: Task Fields Form */}
          <div
            style={{
              flex: 1,
              padding: isMobile ? "20px" : "32px",
              overflowY: isMobile ? "visible" : "auto",
              borderRight: isMobile ? "none" : "1px solid hsl(var(--border-color) / 0.5)",
              borderBottom: isMobile ? "1px solid hsl(var(--border-color) / 0.5)" : "none",
            }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "hsl(var(--primary))",
                marginBottom: "12px",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}>
              <Folder size={14} />
              <span>
                PROJECT: {selectedTask.project?.name || "Workspace"}
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 800,
                marginBottom: "24px",
              }}>
              {isManager ? (
                <input
                  type='text'
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    width: "100%",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    border: "none",
                    borderBottom: "1px dashed hsl(var(--border-color))",
                    backgroundColor: "transparent",
                    padding: "2px 0",
                    color: "hsl(var(--text-primary))",
                  }}
                />
              ) : (
                selectedTask.title
              )}
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}>
              {/* Description */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                <label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "hsl(var(--text-secondary))",
                  }}>
                  Description
                </label>
                {isManager ? (
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                      color: "hsl(var(--text-primary))",
                      resize: "none",
                      fontSize: "0.875rem",
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border-color) / 0.5)",
                    }}>
                    {selectedTask.description ||
                      "No description provided for this task."}
                  </p>
                )}
              </div>

              {/* Metadata Dropdowns Form */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "16px",
                }}>
                {/* Due Date */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "hsl(var(--text-secondary))",
                    }}>
                    Due Date
                  </label>
                  {isManager ? (
                    <input
                      type='date'
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border-color))",
                        backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                        color: "hsl(var(--text-primary))",
                        fontSize: "0.85rem",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border-color) / 0.5)",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}>
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "hsl(var(--text-secondary))",
                    }}>
                    Priority
                  </label>
                  {isManager ? (
                    <select
                      value={editPriority}
                      onChange={(e: any) => setEditPriority(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border-color))",
                        backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                        color: "hsl(var(--text-primary))",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}>
                      <option value='High' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>High</option>
                      <option value='Medium' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Medium</option>
                      <option value='Low' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Low</option>
                    </select>
                  ) : (
                    <div
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border-color) / 0.5)",
                        fontSize: "0.85rem",
                      }}>
                      <span
                        className={`badge badge-${selectedTask.priority.toLowerCase()}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "16px",
                }}>
                {/* Status */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "hsl(var(--text-secondary))",
                    }}>
                    Status
                  </label>
                  <select
                    disabled={!canModifyStatus}
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border-color))",
                      backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                      color: "hsl(var(--text-primary))",
                      fontSize: "0.85rem",
                      cursor: canModifyStatus ? "pointer" : "not-allowed",
                      opacity: canModifyStatus ? 1 : 0.7,
                    }}>
                    <option value='Todo' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Todo</option>
                    <option value='In Progress' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>In Progress</option>
                    <option value='Completed' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Completed</option>
                  </select>
                  {!canModifyStatus && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "hsl(var(--danger))",
                        marginTop: "2px",
                      }}>
                      Only editable if assigned to you.
                    </span>
                  )}
                </div>

                {/* Assignee */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "hsl(var(--text-secondary))",
                    }}>
                    Assignee
                  </label>
                  {isManager ? (
                    <select
                      disabled={selectedTask.status === "Completed"}
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border-color))",
                        backgroundColor: "hsl(var(--bg-primary) / 0.3)",
                        color: "hsl(var(--text-primary))",
                        fontSize: "0.85rem",
                        cursor:
                          selectedTask.status === "Completed"
                            ? "not-allowed"
                            : "pointer",
                      }}>
                      <option value='' style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>Unassigned</option>
                      {teamMembers.map((m) => (
                        <option key={m._id} value={m._id} style={{ backgroundColor: "hsl(var(--bg-secondary))" }}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border-color) / 0.5)",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}>
                      <User size={14} />
                      <span>
                        {selectedTask.assignedMember?.name || "Unassigned"}
                      </span>
                    </div>
                  )}
                  {selectedTask.status === "Completed" && isManager && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "hsl(var(--text-muted))",
                        marginTop: "2px",
                      }}>
                      Completed tasks cannot be reassigned.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Save changes action row */}
            <div
              style={{
                borderTop: "1px solid hsl(var(--border-color) / 0.5)",
                paddingTop: "20px",
                marginTop: "32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              {isManager && (
                <button
                  onClick={handleDeleteTask}
                  disabled={modalLoading}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "hsl(var(--danger) / 0.1)",
                    color: "hsl(var(--danger))",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                  }}>
                  Delete Task
                </button>
              )}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginLeft: "auto",
                }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border-color))",
                    fontWeight: 600,
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    color: "hsl(var(--text-primary))",
                  }}>
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={modalLoading}
                  className='gradient-bg'
                  style={{
                    padding: "10px 24px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    color: "#fff",
                    opacity: modalLoading ? 0.7 : 1,
                  }}>
                  {modalLoading ? "Saving..." : "Save Workspace Details"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Comments and File Attachments */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              height: isMobile ? "auto" : "100%",
              minHeight: isMobile ? "400px" : "auto",
            }}>
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid hsl(var(--border-color) / 0.5)",
                backgroundColor: "hsl(var(--bg-secondary) / 0.3)",
              }}>
              <div
                style={{
                  flex: 1,
                  padding: "16px",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textAlign: "center",
                  borderBottom: "2px solid hsl(var(--primary))",
                  color: "hsl(var(--primary))",
                }}>
                Collaboration Activity
              </div>
            </div>

            {/* Comments Feed Area */}
            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}>
              {/* Attachments Section Inside Activity */}
              <div>
                <h4
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "hsl(var(--text-secondary))",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                  }}>
                  File Assets
                </h4>
                {selectedTask.attachments?.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "hsl(var(--text-muted))",
                    }}>
                    No shared attachments yet.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "12px",
                    }}>
                    {selectedTask.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target='_blank'
                        rel='noreferrer'
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid hsl(var(--border-color))",
                          backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          color: "hsl(var(--text-primary))",
                        }}>
                        <Paperclip size={12} />
                        <span>{att.name}</span>
                      </a>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={handleAddAttachment}
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: "8px",
                    marginTop: "10px",
                  }}>
                  <input
                    type='text'
                    required
                    placeholder='Asset Name (e.g. Design Wireframe)'
                    value={attachName}
                    onChange={(e) => setAttachName(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px solid hsl(var(--border-color))",
                      fontSize: "0.75rem",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                      color: "hsl(var(--text-primary))",
                    }}
                  />
                  <input
                    type='url'
                    required
                    placeholder='https://drive.google.com/...'
                    value={attachUrl}
                    onChange={(e) => setAttachUrl(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px solid hsl(var(--border-color))",
                      fontSize: "0.75rem",
                      backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                      color: "hsl(var(--text-primary))",
                    }}
                  />
                  <button
                    type='submit'
                    style={{
                      cursor: "pointer",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      backgroundColor: "hsl(var(--border-color))",
                      color: "hsl(var(--text-primary))",
                      border: "none",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      width: isMobile ? "100%" : "auto",
                    }}>
                    Upload
                  </button>
                </form>
              </div>

              <div
                style={{
                  height: "1px",
                  backgroundColor: "hsl(var(--border-color) / 0.5)",
                  margin: "8px 0",
                }}
              />

              {/* Comments Feed list */}
              <div>
                <h4
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "hsl(var(--text-secondary))",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                  }}>
                  Discussion Thread
                </h4>
                {selectedTask.comments?.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "hsl(var(--text-muted))",
                      textAlign: "center",
                      padding: "20px 0",
                    }}>
                    No comments yet. Start the conversation below!
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}>
                    {selectedTask.comments.map((comm, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                        }}>
                        <div
                          className='gradient-bg'
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}>
                          {comm.user?.name
                            ?.split(" ")
                            ?.map((n) => n[0])
                            ?.join("")
                            ?.toUpperCase()
                            ?.slice(0, 2)}
                        </div>
                        <div
                          style={{
                            flexGrow: 1,
                            padding: "10px 12px",
                            borderRadius: "8px",
                            backgroundColor: "hsl(var(--bg-primary) / 0.4)",
                            border:
                              "1px solid hsl(var(--border-color) / 0.3)",
                          }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}>
                              {comm.user?.name} (
                              {comm.user?.role?.replace("_", " ")})
                            </span>
                            <span
                              style={{
                                fontSize: "0.65rem",
                                color: "hsl(var(--text-muted))",
                              }}>
                              {new Date(comm.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "hsl(var(--text-primary))",
                              lineHeight: 1.4,
                            }}>
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
              style={{
                padding: isMobile ? "12px 16px" : "20px 24px",
                borderTop: "1px solid hsl(var(--border-color) / 0.5)",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: "12px",
                backgroundColor: "hsl(var(--bg-secondary) / 0.5)",
              }}>
              <input
                type='text'
                placeholder='Add a comment to the thread...'
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border-color))",
                  fontSize: "0.85rem",
                  backgroundColor: "hsl(var(--bg-primary) / 0.5)",
                  color: "hsl(var(--text-primary))",
                }}
              />
              <button
                type='submit'
                className='gradient-bg'
                style={{
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  border: "none",
                  width: isMobile ? "100%" : "auto",
                }}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
