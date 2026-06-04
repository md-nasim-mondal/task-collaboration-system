import React from "react";
import { MessageSquare, Paperclip, CheckSquare, PlusCircle } from "lucide-react";

interface ActivityTimelineProps {
  activities: any[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "CREATE_TASK":
        return <PlusCircle size={15} />;
      case "ADD_COMMENT":
        return <MessageSquare size={15} />;
      case "ADD_ATTACHMENT":
        return <Paperclip size={15} />;
      default:
        return <CheckSquare size={15} />;
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 6000);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg text-foreground">Recent Activity Logs</h3>
          <p className="text-secondary text-sm">Real-time collaboration feed.</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto max-h-96 pr-1">
        {activities.length > 0 ? (
          activities.map((a) => (
            <div key={a._id} className="flex gap-3 text-sm">
              <div className="p-1.5 h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {getActivityIcon(a.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground leading-tight">
                  <span className="font-bold">{a.user?.name || "Someone"}</span> {a.details}
                </p>
                <span className="text-[0.7rem] text-muted block mt-0.5">
                  {getRelativeTime(a.createdAt)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-secondary text-sm text-center py-4">No recent activities.</p>
        )}
      </div>
    </div>
  );
};
