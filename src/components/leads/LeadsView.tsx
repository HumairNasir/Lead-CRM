"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DataTable, Column, TabOption } from "@/components/common/DataTable";
import { Lead, LeadStatus } from "@/lib/types/database";
import { LeadDetailsModal } from "@/components/leads/LeadDetailsModal";
import { TerminalDrawer } from "@/components/leads/TerminalDrawer";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { updateLeadStatus, updateLeadDetails, createProject, syncScrapedLeads } from "@/app/actions";
import {
  Calendar,
  Info,
  RefreshCw,
  Star,
  ExternalLink,
  MoreVertical,
  Smartphone,
  Clock,
  Send,
  MessageSquare,
  Ban,
  ArrowRight,
  Layers
} from "lucide-react";

interface LeadsViewProps {
  initialLeads: Lead[];
  initialUnSyncedCount?: number;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  activeTab?: string;
  statusCounts?: Record<string, number>;
}

export function LeadsView({
  initialLeads,
  initialUnSyncedCount = 0,
  totalCount = initialLeads.length,
  currentPage = 1,
  totalPages = 1,
  pageSize = 15,
  activeTab = "all",
  statusCounts = {},
}: LeadsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [unSyncedCount, setUnSyncedCount] = useState<number>(initialUnSyncedCount);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeLeadForModal, setActiveLeadForModal] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Connected to Supabase live database.",
    "Ready to sync newly scraped leads from spec-leads-scraper."
  ]);

  // Sync state whenever server revalidates and returns fresh initialLeads or unSyncedCount
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  useEffect(() => {
    setUnSyncedCount(initialUnSyncedCount);
  }, [initialUnSyncedCount]);

  // Tab definitions with accurate database status aggregate counts
  const tabs: TabOption[] = [
    {
      id: "all",
      label: "All Leads",
      count: statusCounts.all ?? totalCount,
    },
    {
      id: "unviewed",
      label: "Unviewed",
      count: statusCounts.unviewed ?? 0,
    },
    {
      id: "working_on",
      label: "Working On",
      count: statusCounts.working_on ?? 0,
    },
    {
      id: "email_sent",
      label: "Email Sent",
      count: statusCounts.email_sent ?? 0,
    },
    {
      id: "pitch_response",
      label: "Pitch Response",
      count: statusCounts.pitch_response ?? 0,
    },
    {
      id: "moved_to_project",
      label: "Moved to Project",
      count: statusCounts.moved_to_project ?? 0,
    },
    {
      id: "ignored",
      label: "Ignored",
      count: statusCounts.ignored ?? 0,
    },
  ];

  // URL-driven tab navigation
  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (tabId === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tabId);
    }
    params.set("page", "1");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  // Bulk selection handlers
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(leads.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Status badge styling helper
  const renderStatusBadge = (status: LeadStatus | string) => {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-900/50 text-blue-400 border border-blue-700/50">
            NEW
          </span>
        );
      case "WORKING_ON":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
            WORKING ON
          </span>
        );
      case "MOCKUP_BUILT":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-900/50 text-purple-400 border border-purple-700/50">
            MOCKUP BUILT
          </span>
        );
      case "EMAIL_SENT":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-900/50 text-amber-400 border border-amber-700/50">
            EMAIL SENT
          </span>
        );
      case "PITCH_RESPONSE":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-900/50 text-emerald-400 border border-emerald-700/50">
            PITCH RESPONSE
          </span>
        );
      case "PROJECT_MOVED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            PROJECT MOVED
          </span>
        );
      case "IGNORED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-900/50 text-red-400 border border-red-700/50">
            IGNORED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            {status}
          </span>
        );
    }
  };

  /**
   * Triggers the syncScrapedLeads Server Action to bulk update all 'SCRAPED' leads to 'NEW',
   * promoting them from staging into the active CRM table.
   */
  const handleFetchAndSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      `[${timestamp}] Executing bulk promotion for staged SCRAPED leads to NEW in Supabase...`,
      ...prev.slice(0, 10)
    ]);

    startTransition(async () => {
      const res = await syncScrapedLeads();
      const finishTime = new Date().toLocaleTimeString();

      if (res.success) {
        const syncedCount = res.data?.count ?? 0;
        setTerminalLogs((prev) => [
          `[${finishTime}] Database sync completed. Promoted ${syncedCount} staged leads to active pipeline.`,
          ...prev.slice(0, 10)
        ]);
        setUnSyncedCount(0);
        router.refresh();
      } else {
        setTerminalLogs((prev) => [
          `[${finishTime}] Error syncing leads: ${res.error}`,
          ...prev.slice(0, 10)
        ]);
      }
      setIsSyncing(false);
    });
  };

  /**
   * "Wire the ... Actions Dropdown to trigger your updateLeadStatus Server Action."
   */
  const handleUpdateStatus = (leadId: string, newStatus: LeadStatus) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    setOpenDropdownId(null);

    startTransition(async () => {
      const res = await updateLeadStatus(leadId, newStatus);
      if (!res.success) {
        console.error("Failed to update status on server:", res.error);
      }
      router.refresh();
    });
  };

  /**
   * "Wire the 'Save Changes' button in the LeadDetailsModal to trigger your updateLeadDetails Server Action."
   */
  const handleSaveLead = (updatedLead: Lead) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );

    startTransition(async () => {
      const res = await updateLeadDetails(updatedLead.id, updatedLead);
      if (!res.success) {
        console.error("Failed to update lead details on server:", res.error);
      }
      router.refresh();
    });
  };

  /**
   * Move lead to Project via createProject Server Action
   */
  const handleMoveToProject = (lead: Lead) => {
    setOpenDropdownId(null);
    startTransition(async () => {
      const res = await createProject({
        projectName: lead.businessName,
        clientContact: lead.contactEmail || `info@${lead.businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        clientPhone: lead.phone,
        stagingUrl: `preview.${lead.businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        budget: "$1,500",
        phaseStatus: "UNDER DISCUSSION",
        leadId: lead.id,
      });

      if (res.success) {
        // Optimistically update lead status
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, status: "PROJECT_MOVED" as any } : l))
        );
        alert(`Moved ${lead.businessName} into Projects Pipeline.`);
        router.refresh();
      } else {
        alert(`Error moving lead to project: ${res.error}`);
      }
    });
  };

  // Table Columns Definition
  const columns: Column<Lead>[] = [
    {
      key: "businessName",
      header: (
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-200">
          <span>Business Name</span>
        </div>
      ),
      render: (lead) => (
        <div>
          <div className="font-semibold text-zinc-100 flex items-center gap-2">
            <span>{lead.businessName}</span>
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">{lead.location}</div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating & Reviews",
      render: (lead) => (
        <div>
          <div className="flex items-center gap-1.5 font-bold text-zinc-100">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{Number(lead.rating || 0).toFixed(1)}</span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            ({lead.reviews} reviews)
          </div>
        </div>
      ),
    },
    {
      key: "website",
      header: "Website",
      render: (lead) => {
        const isNoWebsite = lead.websiteUrl === "NO WEBSITE" || !lead.websiteUrl;
        const isBroken = lead.websiteUrl?.includes("brokenlink");
        const isOutdated = lead.websiteUrl === "OUTDATED";

        return (
          <div className="space-y-1">
            {isNoWebsite ? (
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-950/60 text-amber-500 border border-amber-900/60">
                NO WEBSITE
              </span>
            ) : isBroken ? (
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md bg-red-950/60 text-red-400 border border-red-900/60">
                {lead.websiteUrl}
              </span>
            ) : isOutdated ? (
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/80">
                OUTDATED
              </span>
            ) : (
              <a
                href={lead.websiteUrl.startsWith("http") ? lead.websiteUrl : `https://${lead.websiteUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-300 hover:text-amber-400 flex items-center gap-1 truncate max-w-[200px]"
              >
                <span>{lead.websiteUrl}</span>
                <ExternalLink className="w-3 h-3 text-zinc-500 shrink-0" />
              </a>
            )}

            {lead.hasMobileApp && (
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                  <Smartphone className="w-2.5 h-2.5 text-indigo-400" />
                  Mobile App Available
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Outreach Status",
      render: (lead) => renderStatusBadge(lead.status),
    },
    {
      key: "actions",
      header: (
        <div className="text-right font-semibold text-zinc-400 uppercase tracking-wider text-xs">
          Actions
        </div>
      ),
      cellClassName: "text-right",
      render: (lead) => (
        <div className="flex items-center justify-end gap-2 relative">
          <button
            onClick={() => {
              setActiveLeadForModal(lead);
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-750 hover:text-zinc-100 rounded-lg border border-zinc-700/80 transition-colors shadow-xs"
          >
            View Details
          </button>

          {/* Dropdown Menu Trigger */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenDropdownId(openDropdownId === lead.id ? null : lead.id)
              }
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              aria-label="Lead actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Popover */}
            {openDropdownId === lead.id && (
              <div
                onMouseLeave={() => setOpenDropdownId(null)}
                className="absolute right-0 mt-2 w-48 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-30 text-xs text-zinc-300 divide-y divide-zinc-800/80 animate-in fade-in zoom-in-95"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleUpdateStatus(lead.id, "NEW")}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Move to Unviewed</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(lead.id, "WORKING_ON")}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left hover:bg-zinc-800 hover:text-cyan-400"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mark Working On</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(lead.id, "EMAIL_SENT")}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mark Email Sent</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(lead.id, "PITCH_RESPONSE")}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Pitch Response</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(lead.id, "IGNORED")}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left hover:bg-zinc-800 hover:text-red-400"
                  >
                    <Ban className="w-3.5 h-3.5 text-red-400" />
                    <span>Mark Ignored</span>
                  </button>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => handleMoveToProject(lead)}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left text-amber-400 font-semibold hover:bg-amber-500/10"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Move to Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Area matching Screenshot #4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Un-synced Batch Badge */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-100">
              <span>
                {unSyncedCount > 0
                  ? `${unSyncedCount.toLocaleString()} New Un-synced Leads`
                  : "All Leads Synced (0 Staged)"}
              </span>
              <Info className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="text-xs text-zinc-400">
              {unSyncedCount > 0
                ? `${unSyncedCount.toLocaleString()} leads staged from scraper ready to sync`
                : `${(statusCounts.all ?? totalCount).toLocaleString()} total active leads in pipeline`}
            </div>
          </div>
        </div>

        {/* Action Button: Fetch & Sync New Leads */}
        <button
          onClick={handleFetchAndSync}
          disabled={isSyncing || isPending}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 text-zinc-950 ${isSyncing || isPending ? "animate-spin" : ""}`}
          />
          <span>{isSyncing || isPending ? "Syncing Pipeline..." : "Fetch & Sync New Leads"}</span>
        </button>
      </div>

      {/* URL-Based Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          placeholder="Search leads by name, email, or website..."
          className="w-full max-w-md"
        />
      </div>

      {/* Reusable Data Table for Leads */}
      <DataTable<Lead>
        data={leads}
        columns={columns}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedIds={selectedLeadIds}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectRow={handleToggleSelectRow}
        emptyMessage="No leads found matching this filter."
      />

      {/* Server-Side Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
      />

      {/* Terminal / Status Console Drawer */}
      <TerminalDrawer logs={terminalLogs} isSyncing={isSyncing} />

      {/* View Details Centered Modal */}
      <LeadDetailsModal
        lead={activeLeadForModal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveLeadForModal(null);
        }}
        onSaveLead={handleSaveLead}
      />
    </div>
  );
}

