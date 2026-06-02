import { Types } from "mongoose";

export interface INotification {
  _id?: Types.ObjectId;
  message: string;
  user: Types.ObjectId | string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
