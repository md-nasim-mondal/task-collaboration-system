import { Types } from "mongoose";

export enum ProjectStatus {
  ACTIVE = "Active",
  COMPLETED = "Completed",
  ON_HOLD = "On Hold",
}

export interface IProject {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  deadline: Date;
  status: ProjectStatus;
  members: Array<Types.ObjectId | string>;
  createdBy: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}
