"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutGrid,
  Send,
  FolderKanban,
  Megaphone,
  Settings,
  User,
  LogOut,
  Layers,
  X,
  Loader2
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutGrid },
  { label: "Leads", href: "/leads", icon: Send },
  { label: "Projects", href: "/projects", icon: FolderKanban, badge: "New" },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: User },
];

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Logo & Nav */}
        <div className="flex flex-col flex-1 px-4 py-6 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between px-2 mb-8">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-zinc-100 tracking-tight leading-tight">
                  LEADS<span className="text-amber-500">.CRM</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                  Enterprise Suite
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 md:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-zinc-800/90 text-amber-500 shadow-xs border border-zinc-700/40 font-semibold"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-amber-500" : "text-zinc-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500 text-zinc-950 leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Logout */}
        <div className="p-4 border-t border-zinc-800/80">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-850/60 hover:bg-zinc-800 hover:text-zinc-100 border border-zinc-800 transition-all hover:border-zinc-700 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 text-zinc-400" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
