import { model, Schema } from "mongoose";
import { IActivityLog } from "./activityLog.interface";

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    task: { type: Schema.Types.ObjectId, ref: "Task" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ActivityLog = model<IActivityLog>("ActivityLog", activityLogSchema);
