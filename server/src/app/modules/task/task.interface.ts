import { Types } from "mongoose";

export enum TaskPriority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export enum TaskStatus {
  TODO = "Todo",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
}

export interface ITaskComment {
  user: Types.ObjectId | string;
  text: string;
  createdAt: Date;
}

export interface ITaskAttachment {
  name: string;
  url: string;
}

export interface ITask {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  project: Types.ObjectId | string;
  assignedMember?: Types.ObjectId | string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  attachments: ITaskAttachment[];
  comments: ITaskComment[];
  createdBy: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}
