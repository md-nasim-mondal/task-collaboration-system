import { Types } from "mongoose";
import { Notification } from "../modules/notification/notification.model";

export const sendNotification = async (
  message: string,
  userId: string | Types.ObjectId
) => {
  try {
    await Notification.create({
      message,
      user: userId,
      isRead: false,
    });
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
  }
};
