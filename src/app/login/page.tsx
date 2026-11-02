"use client";

import React, { useActionState } from "react";
import { loginUser } from "@/app/actions";
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Welcome to <span className="text-amber-500">LEADS.CRM</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Sign in with your administrator credentials to access your pipeline.
          </p>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div className="mb-6 flex items-start gap-3 p-3.5 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Login Form */}
        <form action={formAction} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Email Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@leads-crm.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to CRM</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-zinc-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected by Supabase Auth & Row Level Security</span>
        </div>
      </div>
    </div>
  );
}
