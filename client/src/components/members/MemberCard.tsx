import React from "react";
import { Mail, Shield, ChevronRight } from "lucide-react";
import { Member } from "@/types";

interface MemberCardProps {
  member: Member;
  workload: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };
  onClick: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, workload, onClick }) => {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const progress =
    workload.totalTasks > 0 ? Math.round((workload.completedTasks / workload.totalTasks) * 100) : 0;

  return (
    <div
      className="glass-panel p-6 flex flex-col gap-5 cursor-pointer hover:-translate-y-1 transition-transform duration-200"
      onClick={onClick}
    >
      {/* Member Info */}
      <div className="flex items-center gap-4">
        <div className="gradient-bg w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0">
          {getInitials(member.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground truncate">{member.name}</h3>
          <div className="flex items-center gap-1.5 text-secondary text-sm mt-0.5">
            <Mail size={14} />
            <span className="truncate">{member.email}</span>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-2 p-3 rounded-[10px] bg-[hsl(var(--bg-tertiary))]">
        <Shield size={16} className="text-primary" />
        <span className="text-sm font-semibold capitalize">
          {member.role.replace("_", " ").toLowerCase()}
        </span>
      </div>

      {/* Workload Progress */}
      <div className="mt-1">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-secondary font-medium">Active Tasks</span>
          <span className="text-foreground font-bold">
            {workload.pendingTasks} / {workload.totalTasks}
          </span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="gradient-bg h-full rounded-full transition-[width] duration-1000 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* CTA Footer */}
      <div className="mt-2 pt-4 border-t border-border flex items-center justify-between text-primary text-sm font-semibold">
        <span>View Workload</span>
        <ChevronRight size={18} />
      </div>
    </div>
  );
};
