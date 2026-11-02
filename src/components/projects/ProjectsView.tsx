"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DataTable, Column, TabOption } from "@/components/common/DataTable";
import { Project, ProjectPhase, Lead } from "@/lib/types/database";
import { AddProjectModal } from "@/components/projects/AddProjectModal";
import { ProjectDetailsModal } from "@/components/projects/ProjectDetailsModal";
import { TerminalDrawer } from "@/components/leads/TerminalDrawer";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { updateProjectPhase, deleteProject, updateProjectDetails } from "@/app/actions";
import {
  DollarSign,
  Plus,
  ExternalLink,
  Smartphone,
  MoreVertical,
  Briefcase,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Trash2
} from "lucide-react";

interface ProjectsViewProps {
  initialProjects: Project[];
  availableWarmLeads?: Lead[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  activeTab?: string;
  phaseCounts?: Record<string, number>;
  totalRevenue?: number;
}

export function ProjectsView({
  initialProjects,
  availableWarmLeads = [],
  totalCount = initialProjects.length,
  currentPage = 1,
  totalPages = 1,
  pageSize = 15,
  activeTab = "all",
  phaseCounts = {},
  totalRevenue = 0,
}: ProjectsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeProjectForModal, setActiveProjectForModal] = useState<Project | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Sync state whenever server revalidates and returns fresh initialProjects
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // Compute live metrics for the header ribbon based on database aggregates
  const activeProjectsCount = Math.max(0, (phaseCounts.all ?? totalCount) - (phaseCounts.delivered ?? 0));
  const totalRevenueFormatted = `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  // Filter Tabs definition using database phase counts
  const tabs: TabOption[] = [
    { id: "all", label: "All Projects", count: phaseCounts.all ?? totalCount },
    {
      id: "under_discussions",
      label: "Under Discussions",
      count: phaseCounts.under_discussions ?? 0,
    },
    {
      id: "design_mockup",
      label: "Design & Mockup",
      count: phaseCounts.design_mockup ?? 0,
    },
    {
      id: "build_integration",
      label: "Build & Integration",
      count: phaseCounts.build_integration ?? 0,
    },
    {
      id: "delivered",
      label: "Delivered",
      count: phaseCounts.delivered ?? 0,
    },
    {
      id: "revisions",
      label: "Revisions",
      count: phaseCounts.revisions ?? 0,
    },
  ];

  // URL-driven phase tab navigation
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

  // Phase Status badge helper
  const renderPhaseBadge = (phase: ProjectPhase) => {
    switch (phase) {
      case "UNDER DISCUSSION":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/70 text-amber-400 border border-amber-800/80">
            UNDER DISCUSSION
          </span>
        );
      case "STAGING & DESIGN":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            STAGING & DESIGN
          </span>
        );
      case "BUILD & INTEGRATION":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-950/80 text-yellow-400 border border-yellow-800/80">
            BUILD & INTEGRATION
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
            DELIVERED
          </span>
        );
      case "REVISIONS":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-950/70 text-orange-400 border border-orange-800/60">
            REVISIONS
          </span>
        );
    }
  };

  /**
   * Status updates from row action dropdown
   */
  const handleUpdatePhase = (projectId: string, newPhase: ProjectPhase) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, phaseStatus: newPhase } : p))
    );
    setOpenDropdownId(null);

    startTransition(async () => {
      const res = await updateProjectPhase(projectId, newPhase);
      if (!res.success) {
        console.error("Failed to update project phase on server:", res.error);
      }
      router.refresh();
    });
  };

  /**
   * Delete project
   */
  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setOpenDropdownId(null);

    startTransition(async () => {
      const res = await deleteProject(projectId);
      if (!res.success) {
        console.error("Failed to delete project on server:", res.error);
      }
      router.refresh();
    });
  };

  /**
   * Save changes from Project Details Modal
   */
  const handleSaveProjectDetails = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );

    startTransition(async () => {
      const res = await updateProjectDetails(updatedProject.id, updatedProject);
      if (!res.success) {
        console.error("Failed to update project details on server:", res.error);
      }
      router.refresh();
    });
  };

  const handleAddProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    router.refresh();
  };

  // Find linked lead for active modal
  const activeLinkedLead = activeProjectForModal?.leadId
    ? availableWarmLeads.find((l) => l.id === activeProjectForModal.leadId)
    : null;

  // Table Columns Definition matching Screenshot with proper ACTIONS header
  const columns: Column<Project>[] = [
    {
      key: "projectName",
      header: (
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-200">
          <span>Project Name</span>
        </div>
      ),
      render: (project) => (
        <div>
          <div className="font-semibold text-zinc-100 flex items-center gap-2">
            <span>{project.projectName}</span>
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">{project.location}</div>
        </div>
      ),
    },
    {
      key: "clientContact",
      header: (
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-200">
          <span>Client Contact</span>
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
        </div>
      ),
      render: (project) => (
        <div className="text-xs font-mono text-zinc-300">
          {project.clientContact}
        </div>
      ),
    },
    {
      key: "stagedMockup",
      header: "Staged Mockup",
      render: (project) => (
        <div className="space-y-1">
          <a
            href={project.stagingUrl.startsWith("http") ? project.stagingUrl : `https://${project.stagingUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono truncate max-w-[220px]"
          >
            <span>{project.stagingUrl}</span>
            <ExternalLink className="w-3 h-3 text-amber-500 shrink-0" />
          </a>
          {project.hasMobileApp && (
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                <Smartphone className="w-2.5 h-2.5 text-indigo-400" />
                Mobile App Available
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "budget",
      header: "Budget & Invoiced",
      render: (project) => (
        <div className="text-xs">
          <span className="font-bold text-zinc-100 text-sm">
            {project.budget}
          </span>
          {project.budgetStatus && (
            <span className="text-zinc-400 ml-1.5 font-medium">
              {project.budgetStatus}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "phaseStatus",
      header: "Phase Status",
      render: (project) => renderPhaseBadge(project.phaseStatus),
    },
    {
      key: "actions",
      header: (
        <div className="text-right font-semibold text-zinc-400 uppercase tracking-wider text-xs">
          Actions
        </div>
      ),
      cellClassName: "text-right",
      render: (project) => (
        <div className="flex items-center justify-end gap-2 relative">
          {/* View Details Button matching Leads view */}
          <button
            onClick={() => {
              setActiveProjectForModal(project);
              setIsDetailsModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-750 hover:text-zinc-100 rounded-lg border border-zinc-700/80 transition-colors shadow-xs"
          >
            View Details
          </button>

          {/* Quick Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenDropdownId(openDropdownId === project.id ? null : project.id)
              }
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              aria-label="Project actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Popover */}
            {openDropdownId === project.id && (
              <div
                onMouseLeave={() => setOpenDropdownId(null)}
                className="absolute right-0 mt-2 w-48 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-30 text-xs text-zinc-300 divide-y divide-zinc-800/80 animate-in fade-in zoom-in-95"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleUpdatePhase(project.id, "UNDER DISCUSSION")}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Move to Discussions</span>
                  </button>
                  <button
                    onClick={() => handleUpdatePhase(project.id, "STAGING & DESIGN")}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Move to Staging & Design</span>
                  </button>
                  <button
                    onClick={() => handleUpdatePhase(project.id, "BUILD & INTEGRATION")}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <Layers className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Move to Build & Integration</span>
                  </button>
                  <button
                    onClick={() => handleUpdatePhase(project.id, "DELIVERED")}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left hover:bg-zinc-800 hover:text-emerald-400"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark as Delivered</span>
                  </button>
                  <button
                    onClick={() => handleUpdatePhase(project.id, "REVISIONS")}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left hover:bg-zinc-800 hover:text-orange-400"
                  >
                    <Layers className="w-3.5 h-3.5 text-orange-400" />
                    <span>Request Revisions</span>
                  </button>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete Project</span>
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
      {/* Header Area matching Screenshot #3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Metric Summary Ribbon with Live Values */}
        <div className="flex items-center gap-6 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <span className="font-extrabold text-amber-400 text-sm">
                {activeProjectsCount}
              </span>
              <span className="text-zinc-300 text-xs font-semibold ml-1.5">
                Active Projects
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-800" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-zinc-100 text-sm">
                {totalRevenueFormatted}
              </span>
              <span className="text-zinc-400 text-xs font-medium ml-1.5">
                Total Project Revenue
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Add New Project */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* URL-Based Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          placeholder="Search projects by name, client email, or staging URL..."
          className="w-full max-w-md"
        />
      </div>

      {/* Unified Reusable Data Table (No select checkboxes, proper ACTIONS header) */}
      <DataTable<Project>
        data={projects}
        columns={columns}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        emptyMessage="No projects currently in this phase."
      />

      {/* Server-Side Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
      />

      {/* Terminal / Status Console Dock */}
      <TerminalDrawer
        logs={[
          "[0:21:12] Pipeline webhook connected to Supabase PostgreSQL cluster...",
          "[0:21:40] Client staging environments synchronized with database.",
          "[0:22:04] Project status updated: live pipeline tracking enabled.",
        ]}
      />

      {/* Centered Add New Project Modal with Internal Tabs & Live Supabase Leads */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProject={handleAddProject}
        availableLeads={availableWarmLeads}
      />

      {/* Centered Project Details Modal with Edit Mode & Technical Summary */}
      <ProjectDetailsModal
        project={activeProjectForModal}
        linkedLead={activeLinkedLead}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setActiveProjectForModal(null);
        }}
        onSaveProject={handleSaveProjectDetails}
      />
    </div>
  );
}
