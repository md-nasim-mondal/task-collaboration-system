import { model, Schema } from "mongoose";
import { ITask, TaskPriority, TaskStatus } from "./task.interface";

const taskCommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    _id: false,
  }
);

const taskAttachmentSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    assignedMember: { type: Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date, required: true },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    attachments: [taskAttachmentSchema],
    comments: [taskCommentSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Task = model<ITask>("Task", taskSchema);
