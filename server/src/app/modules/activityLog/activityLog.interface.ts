import { Types } from "mongoose";

export interface IActivityLog {
  _id?: Types.ObjectId;
  action: string;
  user: Types.ObjectId | string;
  project?: Types.ObjectId | string;
  task?: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}
