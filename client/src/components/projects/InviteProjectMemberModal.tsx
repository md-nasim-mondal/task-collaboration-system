import React from "react";
import { X } from "lucide-react";
import { Member } from "@/types";

interface InviteProjectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  inviteUserId: string;
  setInviteUserId: (val: string) => void;
  userOptions: Member[];
  projectMembers: Member[];
  loading: boolean;
}

const inputClass =
  "w-full p-2.5 px-3.5 rounded-lg border border-border bg-background/50 text-foreground text-sm outline-none focus:border-primary transition-all duration-200";

export const InviteProjectMemberModal: React.FC<InviteProjectMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  inviteUserId,
  setInviteUserId,
  userOptions,
  projectMembers,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-1000 flex items-center justify-center p-2 sm:p-6"
      onClick={onClose}
    >
      <div
        className="glass-panel max-w-md w-full p-5 sm:p-8 relative bg-secondary-bg max-h-[90vh] overflow-y-auto animate-[fadeIn_var(--transition-normal)_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 cursor-pointer text-secondary hover:text-primary border-none bg-transparent outline-none transition-colors duration-200"
        >
          <X size={20} />
        </button>

        <h2 className="font-display text-xl font-bold text-foreground mb-5">Add Project Member</h2>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Select User</label>
            <select
              required
              value={inviteUserId}
              onChange={(e) => setInviteUserId(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Select a user to add...</option>
              {userOptions
                .filter((o) => !(projectMembers || []).some((m) => m._id === o._id))
                .map((opt) => (
                  <option key={opt._id} value={opt._id} className="bg-secondary-bg">
                    {opt.name} ({opt.role.replace("_", " ")})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-md cursor-pointer border border-border bg-transparent text-foreground text-sm font-semibold hover:bg-border transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 rounded-md cursor-pointer border-none gradient-bg text-white text-sm font-semibold disabled:opacity-70"
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
