"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Mail, Shield, ChevronRight, X, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "../Loading";

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Workload {
  member: {
    _id: string;
    name: string;
    email: string;
    role: string;
    picture?: string;
  };
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export default function MembersPageClient({
  initialMembers,
  initialWorkload,
}: {
  initialMembers: Member[];
  initialWorkload: Workload[];
}) {
  const { apiFetch, showToast } = useAuth();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>(initialMembers || []);
  const [workloads, setWorkloads] = useState<Workload[]>(initialWorkload || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("searchTerm", searchTerm);

      const res = await apiFetch(`/user?${queryParams.toString()}`);
      if (res.success) {
        setMembers(res.data);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load members", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkloads = async () => {
    try {
      const res = await apiFetch("/dashboard/workload");
      if (res.success) {
        setWorkloads(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Fetch members whenever searchTerm changes with a debounce
      fetchMembers();
      fetchWorkloads();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredMembers = members;

  const getMemberWorkload = (memberId: string) => {
    return (
      workloads.find((w) => w.member._id === memberId) || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
      }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ animation: "fadeIn var(--transition-normal) forwards" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 800,
          }}>
          Team Members
        </h1>
        <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>
          Monitor team workload, manage roles, and collaborate effectively.
        </p>
      </div>

      <div
        className='glass-panel'
        style={{
          padding: "24px",
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 16px",
            height: "44px",
            borderRadius: "10px",
            border: `1px solid ${isSearchFocused ? "hsl(var(--primary))" : "hsl(var(--border-color))"}`,
            backgroundColor: "hsl(var(--bg-primary) / 0.5)",
            flexGrow: 1,
            maxWidth: "450px",
            minWidth: "280px",
            transition: "all var(--transition-normal)",
            boxShadow: isSearchFocused
              ? "0 0 0 4px hsl(var(--primary) / 0.1)"
              : "none",
          }}>
          <Search
            size={20}
            style={{
              color: isSearchFocused
                ? "hsl(var(--primary))"
                : "hsl(var(--text-muted))",
              transition: "color var(--transition-normal)",
              flexShrink: 0,
            }}
          />
          <input
            type='text'
            placeholder='Search members by name or email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              flex: 1,
              height: "100%",
              border: "none",
              backgroundColor: "transparent",
              color: "hsl(var(--text-primary))",
              outline: "none",
              fontSize: "1rem",
              boxShadow: "none",
              padding: 0,
              margin: 0,
              minWidth: 0,
              display: "block",
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "hsl(var(--text-muted))",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "hsl(var(--danger))")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "hsl(var(--text-muted))")
              }>
              <X size={16} />
            </button>
          )}
        </div>

        <div
          style={{
            color: "hsl(var(--text-secondary))",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}>
          Total Members:{" "}
          <span style={{ color: "hsl(var(--primary))", fontWeight: 700 }}>
            {members.length}
          </span>
        </div>
      </div>

      {loading ? (
        <Loading text='Fetching team members...' />
      ) : filteredMembers.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}>
          {filteredMembers.map((member) => {
            const workload = getMemberWorkload(member._id);
            const progress =
              workload.totalTasks > 0
                ? Math.round(
                    (workload.completedTasks / workload.totalTasks) * 100,
                  )
                : 0;

            return (
              <div
                key={member._id}
                className='glass-panel'
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  transition: "transform var(--transition-fast)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
                onClick={() =>
                  router.push(`/tasks?assignedMember=${member._id}`)
                }>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}>
                  <div
                    className='gradient-bg'
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                    {getInitials(member.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "1.125rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {member.name}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "hsl(var(--text-secondary))",
                        fontSize: "0.875rem",
                        marginTop: "2px",
                      }}>
                      <Mail size={14} />
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {member.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: "hsl(var(--bg-tertiary))",
                  }}>
                  <Shield size={16} style={{ color: "hsl(var(--primary))" }} />
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}>
                    {member.role.replace("_", " ").toLowerCase()}
                  </span>
                </div>

                <div style={{ marginTop: "4px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.875rem",
                      marginBottom: "8px",
                    }}>
                    <span
                      style={{
                        color: "hsl(var(--text-secondary))",
                        fontWeight: 500,
                      }}>
                      Active Tasks
                    </span>
                    <span
                      style={{
                        color: "hsl(var(--text-primary))",
                        fontWeight: 700,
                      }}>
                      {workload.pendingTasks} / {workload.totalTasks}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      backgroundColor: "hsl(var(--border-color))",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}>
                    <div
                      className='gradient-bg'
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        transition: "width 1s ease-in-out",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    paddingTop: "16px",
                    borderTop: "1px solid hsl(var(--border-color))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "hsl(var(--primary))",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}>
                  <span>View Workload</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className='glass-panel'
          style={{
            padding: "80px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "hsl(var(--primary) / 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "hsl(var(--primary))",
              marginBottom: "12px",
            }}>
            <Users size={40} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            No members found
          </h2>
          <p
            style={{
              color: "hsl(var(--text-secondary))",
              maxWidth: "400px",
              lineHeight: 1.6,
            }}>
            We couldn't find any team members matching "
            <strong>{searchTerm}</strong>". Check your spelling or try searching
            for something else.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className='gradient-bg'
            style={{
              padding: "12px 24px",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              marginTop: "8px",
            }}>
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
