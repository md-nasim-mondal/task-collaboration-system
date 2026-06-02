import { Types } from "mongoose";
import { ActivityLog } from "../modules/activityLog/activityLog.model";

export const logActivity = async (
  action: string,
  userId: string | Types.ObjectId,
  projectId?: string | Types.ObjectId,
  taskId?: string | Types.ObjectId
) => {
  try {
    await ActivityLog.create({
      action,
      user: userId,
      project: projectId,
      task: taskId,
    });
  } catch (error) {
    console.error("❌ Failed to create activity log:", error);
  }
};
