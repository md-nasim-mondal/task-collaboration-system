import { ActivityLog } from "./activityLog.model";

const getAllActivityLogs = async () => {
  return await ActivityLog.find()
    .populate("user", "name email role picture")
    .populate("project", "name")
    .populate("task", "title")
    .sort("-createdAt")
    .limit(10);
};

export const ActivityLogServices = {
  getAllActivityLogs,
};
