import React from "react";
import { Workload } from "@/types";

interface MemberWorkloadBalanceProps {
  workloads: Workload[];
}

export const MemberWorkloadBalance: React.FC<MemberWorkloadBalanceProps> = ({ workloads }) => {
  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg text-foreground">Member Workload Balance</h3>
          <p className="text-secondary text-sm">Active task counts per assignee.</p>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {workloads.length > 0 ? (
          workloads.map((w) => (
            <div key={w.member._id} className="flex justify-between items-center text-sm border-b border-border/40 pb-3 last:border-none last:pb-0">
              <div className="flex items-center gap-3">
                <div className="gradient-bg w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                  {w.member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground leading-tight">{w.member.name}</h4>
                  <p className="text-[0.7rem] text-muted capitalize leading-none mt-0.5">
                    {w.member.role.replace("_", " ").toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-foreground">{w.pendingTasks} Active</span>
                <p className="text-[0.7rem] text-muted mt-0.5">{w.completedTasks} Done</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-secondary text-sm text-center py-4">No team workload recorded.</p>
        )}
      </div>
    </div>
  );
};
