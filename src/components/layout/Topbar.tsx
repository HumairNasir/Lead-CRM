"use client";

import React, { useState, useRef, useEffect, useTransition, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  Bell,
  User,
  Menu,
  Check
} from "lucide-react";

const DATE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
];

interface TopbarProps {
  onToggleMobileMenu: () => void;
}

function DateFilterDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDateValue = searchParams?.get("date_range") || "all";
  const currentOption = DATE_OPTIONS.find((opt) => opt.value === currentDateValue) || DATE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectDate = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value === "all") {
      params.delete("date_range");
    } else {
      params.set("date_range", value);
    }
    params.set("page", "1");
    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isPending}
        className="flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-all shadow-xs disabled:opacity-50"
      >
        <Calendar className="w-4 h-4 text-amber-500" />
        <span className="hidden sm:inline">{currentOption.label}</span>
        <span className="sm:hidden">Date</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 mt-2 w-52 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 transition-all duration-200 origin-top-right ${
          isDropdownOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80">
          Filter Date Range
        </div>
        {DATE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelectDate(option.value)}
            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
              currentDateValue === option.value
                ? "bg-amber-500/10 text-amber-400 font-semibold"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            <span>{option.label}</span>
            {currentDateValue === option.value && (
              <Check className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard Overview";
    if (pathname?.startsWith("/leads")) return "Leads Management";
    if (pathname?.startsWith("/projects")) return "Projects Dashboard";
    if (pathname?.startsWith("/campaigns")) return "Outreach Campaigns";
    if (pathname?.startsWith("/settings")) return "Application Settings";
    if (pathname?.startsWith("/profile")) return "Workspace Profile";
    return "Dashboard Overview";
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-850/60">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Date Filter Dropdown with Suspense isolation */}
        <Suspense
          fallback={
            <div className="flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-xl">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span>All</span>
            </div>
          }
        >
          <DateFilterDropdown />
        </Suspense>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-xl text-zinc-300 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 transition-colors shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-zinc-900 animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          <div
            className={`absolute right-0 mt-2 w-80 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 transition-all duration-200 origin-top-right ${
              notificationsOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold text-zinc-200">
                Recent Notifications
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-medium px-2 py-0.5 rounded-full">
                3 New
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-zinc-850/60 border border-zinc-800/80">
                <p className="font-medium text-zinc-200">New batch synced</p>
                <p className="text-zinc-400 text-[11px]">1,240 leads imported from Apify scraper.</p>
              </div>
              <div className="p-2 rounded-lg bg-zinc-850/60 border border-zinc-800/80">
                <p className="font-medium text-zinc-200">Pitch Response received</p>
                <p className="text-zinc-400 text-[11px]">Summit Dental Clinic requested a walkthrough.</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Avatar Link */}
        <Link href="/profile" className="flex items-center gap-2 pl-1 group cursor-pointer" aria-label="Go to Profile">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:border-amber-500/50 transition-colors shadow-xs cursor-pointer">
            <User className="w-4 h-4 text-amber-500" />
          </div>
        </Link>
      </div>
    </header>
  );
}
