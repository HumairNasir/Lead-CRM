"use client";

import React from "react";
import { Megaphone, Mail, Send, Play, CheckCircle2, Clock, Users, ArrowUpRight } from "lucide-react";

export default function CampaignsPage() {
  const campaigns = [
    {
      id: "camp-01",
      name: "Local Service Contractor Outdated Site Outreach",
      channel: "Cold Email Sequence",
      sent: 840,
      opened: "64.2%",
      replied: "18.4%",
      status: "Active",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      id: "camp-02",
      name: "HVAC & Plumbing Mobile Redesign Loom Pitch",
      channel: "Video Demo Pitch",
      sent: 320,
      opened: "78.1%",
      replied: "24.5%",
      status: "Active",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      id: "camp-03",
      name: "Dental Clinics Automated Booking Re-engagement",
      channel: "Multi-touch Drip",
      sent: 280,
      opened: "52.0%",
      replied: "12.8%",
      status: "Scheduled",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Outreach Campaigns</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automated multi-channel outreach sequencing and pitch response tracking
          </p>
        </div>

        <button
          onClick={() => alert("New Campaign Wizard: Creating outreach sequence.")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
        >
          <Megaphone className="w-4 h-4 stroke-[2.5]" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${camp.badgeColor}`}
                >
                  {camp.status}
                </span>
                <span className="text-[11px] text-zinc-500">{camp.channel}</span>
              </div>

              <h3 className="font-bold text-sm text-zinc-100 leading-snug">
                {camp.name}
              </h3>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center">
                <div className="bg-zinc-950/60 p-2 rounded-xl">
                  <div className="text-xs font-bold text-zinc-200">{camp.sent}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Sent</div>
                </div>
                <div className="bg-zinc-950/60 p-2 rounded-xl">
                  <div className="text-xs font-bold text-amber-400">{camp.opened}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Open Rate</div>
                </div>
                <div className="bg-zinc-950/60 p-2 rounded-xl">
                  <div className="text-xs font-bold text-emerald-400">{camp.replied}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Reply Rate</div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Running 24/7</span>
              </div>
              <button
                onClick={() => alert(`Inspecting ${camp.name}`)}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
              >
                <span>Analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
