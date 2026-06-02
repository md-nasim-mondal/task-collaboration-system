import { model, Schema } from "mongoose";
import { IProject, ProjectStatus } from "./project.interface";

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE,
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Project = model<IProject>("Project", projectSchema);
