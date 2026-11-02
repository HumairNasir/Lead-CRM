"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/app/actions";
import {
  User,
  Shield,
  Key,
  CheckCircle2,
  Mail,
  Camera,
  Smartphone,
  History,
  Loader2,
  AlertCircle
} from "lucide-react";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";

interface ProfileClientViewProps {
  user: {
    id: string;
    email: string;
  };
  initialProfile: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export function ProfileClientView({
  user,
  initialProfile,
}: ProfileClientViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState(initialProfile.firstName);
  const [lastName, setLastName] = useState(initialProfile.lastName);
  const [role, setRole] = useState(initialProfile.role);

  const [accountUpdated, setAccountUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      const res = await updateUserProfile({
        firstName,
        lastName,
        role,
      });

      if (res.success) {
        setAccountUpdated(true);
        setTimeout(() => setAccountUpdated(false), 3500);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to update profile.");
      }
    });
  };

  const handlePasswordChanged = () => {
    setPasswordChangeSuccess(true);
    setTimeout(() => setPasswordChangeSuccess(false), 4000);
  };

  // Dynamic Avatar Initials
  const initials =
    ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() ||
    (user.email[0] || "U").toUpperCase();

  const displayName = `${firstName} ${lastName}`.trim() || user.email;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Feedback Alerts */}
      {accountUpdated && (
        <div className="flex items-center gap-2 p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-2xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Account information updated successfully!</span>
        </div>
      )}

      {passwordChangeSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-2xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your password has been changed successfully.</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-2xl animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Account Details (Left) and Security (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Account Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/80">
              <User className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-zinc-100">Account Details</h2>
            </div>

            {/* Avatar Section with Dynamic Initials */}
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-zinc-800 to-amber-500/30 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-2xl shadow-lg">
                  <span>{initials}</span>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-zinc-200" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-zinc-100 text-base">
                  {displayName}
                </h3>
                <p className="text-xs text-zinc-400">{role || "CRM Administrator"}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  CRM Administrator
                </span>
              </div>
            </div>

            {/* Profile Form Fields */}
            <form id="account-form" onSubmit={handleUpdateAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Email Address - Strictly readOnly per requirements */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] font-normal text-zinc-500">(Read-only)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    readOnly
                    value={user.email}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 cursor-not-allowed select-all font-mono"
                  />
                </div>
              </div>

              {/* Workspace Role */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Workspace Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. CRM Administrator"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </form>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              form="account-form"
              disabled={isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Update Account Information</span>
              )}
            </button>
          </div>
        </div>

        {/* Right Card: Security (No Current Password / Eye Icon per Security Compliance) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/80">
              <Shield className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-zinc-100">Security & Credentials</h2>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Manage your Supabase authentication safeguards and password credentials.
            </p>

            {/* Authentication Safeguards Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      Account Password
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Protected via bcrypt salt hashing
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-800/80 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      Two-Factor Authentication (2FA)
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      TOTP Authenticator app support
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold px-2 py-0.5 rounded-full">
                  Available
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-800/80 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-zinc-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      Active Session UUID
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      {user.id ? `${user.id.slice(0, 18)}...` : "Authenticated"}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 font-medium px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Modal Trigger */}
          <div className="pt-6">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-semibold text-xs transition-all shadow-xs hover:border-amber-500/50 active:scale-98"
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onPasswordChanged={handlePasswordChanged}
      />
    </div>
  );
}

