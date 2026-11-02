"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { supabase } from "@/lib/supabase";
import { Lock, ShieldCheck, Loader2 } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onPasswordChanged,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill out both password fields.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onPasswordChanged();
      handleClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update password."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span>Change Password</span>
        </div>
      }
      subtitle="Update your workspace account authentication credentials"
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 rounded-xl border border-zinc-700/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>{isSubmitting ? "Updating..." : "Submit Change"}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* New Password Field - Masked without unmasking eye icon for security compliance */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter minimum 8 characters"
            className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
          />
        </div>

        {/* Confirm New Password Field - Masked without unmasking eye icon for security compliance */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
          />
        </div>
      </form>
    </Modal>
  );
}
