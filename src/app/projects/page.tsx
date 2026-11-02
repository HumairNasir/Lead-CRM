import React, { Suspense } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  mapProjectRowToProject,
  mapLeadRowToLead,
  ProjectRow,
  LeadRow,
  Project,
  Lead
} from "@/lib/types/database";
import { ProjectsView } from "@/components/projects/ProjectsView";
import { getDateFilterTimestamp } from "@/lib/dateUtils";

interface ProjectsPageProps {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    tab?: string;
    date_range?: string;
  }>;
}

async function ProjectsPageContent({ searchParams }: ProjectsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const q = (resolvedParams?.q || "").trim();
  const page = Math.max(1, parseInt(resolvedParams?.page || "1", 10) || 1);
  const activeTab = (resolvedParams?.tab || "all").toLowerCase();
  const dateRange = (resolvedParams?.date_range || "all").toLowerCase();
  const gteDate = await getDateFilterTimestamp(dateRange);

  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let projects: Project[] = [];
  let totalFilteredCount = 0;
  let allLeads: Lead[] = [];
  let totalRevenue = 0;

  const phaseCounts: Record<string, number> = {
    all: 0,
    under_discussions: 0,
    design_mockup: 0,
    build_integration: 0,
    delivered: 0,
    revisions: 0,
  };

  if (isSupabaseConfigured) {
    try {
      // 1. Fetch aggregate phase counts & total revenue matching search query & date filter
      let countQuery = supabase
        .from("projects")
        .select("phase_status, budget");

      if (q) {
        countQuery = countQuery.or(
          `project_name.ilike.%${q}%,client_email.ilike.%${q}%,staging_url.ilike.%${q}%`
        );
      }
      if (gteDate) {
        countQuery = countQuery.gte("created_at", gteDate);
      }

      const { data: countRows, error: countRowsError } = await countQuery;

      if (!countRowsError && countRows) {
        for (const row of countRows) {
          phaseCounts.all++;
          const phase = (row.phase_status || "").replace(/_/g, " ").toUpperCase();
          if (phase === "UNDER DISCUSSION") phaseCounts.under_discussions++;
          else if (phase === "STAGING & DESIGN") phaseCounts.design_mockup++;
          else if (phase === "BUILD & INTEGRATION") phaseCounts.build_integration++;
          else if (phase === "DELIVERED") phaseCounts.delivered++;
          else if (phase === "REVISIONS") phaseCounts.revisions++;

          if (typeof row.budget === "number") {
            totalRevenue += row.budget;
          }
        }
      }

      // 2. Main paginated query applying the selected tab's phase status filter
      let dataQuery = supabase
        .from("projects")
        .select("*", { count: "exact" });

      if (q) {
        dataQuery = dataQuery.or(
          `project_name.ilike.%${q}%,client_email.ilike.%${q}%,staging_url.ilike.%${q}%`
        );
      }
      if (gteDate) {
        dataQuery = dataQuery.gte("created_at", gteDate);
      }

      // Apply server-side phase status filter
      if (activeTab === "under_discussions") {
        dataQuery = dataQuery.or("phase_status.eq.UNDER_DISCUSSION,phase_status.eq.UNDER DISCUSSION");
      } else if (activeTab === "design_mockup") {
        dataQuery = dataQuery.or("phase_status.eq.STAGING_&_DESIGN,phase_status.eq.STAGING & DESIGN");
      } else if (activeTab === "build_integration") {
        dataQuery = dataQuery.or("phase_status.eq.BUILD_&_INTEGRATION,phase_status.eq.BUILD & INTEGRATION");
      } else if (activeTab === "delivered") {
        dataQuery = dataQuery.eq("phase_status", "DELIVERED");
      } else if (activeTab === "revisions") {
        dataQuery = dataQuery.eq("phase_status", "REVISIONS");
      }

      const { data: projectRows, count, error: projectError } = await dataQuery
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!projectError && projectRows) {
        projects = (projectRows as ProjectRow[]).map((row) =>
          mapProjectRowToProject(row)
        );
        totalFilteredCount = count ?? 0;
      } else if (projectError) {
        console.error("Supabase error querying projects:", projectError);
      }

      // 3. Fetch warm leads for Add Project modal dropdown
      const { data: leadRows, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .neq("status", "SCRAPED")
        .order("created_at", { ascending: false });

      if (!leadError && leadRows && leadRows.length > 0) {
        allLeads = (leadRows as LeadRow[]).map(mapLeadRowToLead);
      }
    } catch (err) {
      console.error("Error fetching projects from Supabase in Server Component:", err);
    }
  }

  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;

  return (
    <ProjectsView
      initialProjects={projects}
      availableWarmLeads={allLeads}
      totalCount={totalFilteredCount}
      currentPage={page}
      totalPages={totalPages}
      pageSize={pageSize}
      activeTab={activeTab}
      phaseCounts={phaseCounts}
      totalRevenue={totalRevenue}
    />
  );
}

export default function ProjectsPage({ searchParams }: ProjectsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col justify-center items-center text-zinc-500 gap-3">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading projects pipeline...</span>
        </div>
      }
    >
      <ProjectsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
