import z from "zod";
import { TaskPriority, TaskStatus } from "./task.interface";

export const createTaskZodSchema = z.object({
  body: z.object({
    title: z
      .string({ message: "Task title is required" })
      .min(2, "Title must be at least 2 characters")
      .max(150, "Title cannot exceed 150 characters"),
    description: z.string().max(2000, "Description cannot exceed 2000 characters").optional(),
    project: z.string({ message: "Project ID is required" }),
    assignedMember: z.string({ message: "Assigned member ID is required" }),
    dueDate: z.string({ message: "Due date is required" }).refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for due date",
    }),
    priority: z.enum(Object.values(TaskPriority) as [string, ...string[]]).optional(),
    status: z.enum(Object.values(TaskStatus) as [string, ...string[]]).optional(),
  }),
});

export const updateTaskZodSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title must be at least 2 characters").max(150, "Title cannot exceed 150 characters").optional(),
    description: z.string().max(2000, "Description cannot exceed 2000 characters").optional(),
    assignedMember: z.string().optional(),
    dueDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format for due date",
      })
      .optional(),
    priority: z.enum(Object.values(TaskPriority) as [string, ...string[]]).optional(),
    status: z.enum(Object.values(TaskStatus) as [string, ...string[]]).optional(),
    attachUrl: z.string().url("Invalid attachment URL").optional(),
  }),
});
