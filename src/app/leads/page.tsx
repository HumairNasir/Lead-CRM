import React, { Suspense } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mapLeadRowToLead, LeadRow, Lead } from "@/lib/types/database";
import { LeadsView } from "@/components/leads/LeadsView";
import { getDateFilterTimestamp } from "@/lib/dateUtils";

interface LeadsPageProps {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    tab?: string;
    date_range?: string;
  }>;
}

async function LeadsPageContent({ searchParams }: LeadsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const q = (resolvedParams?.q || "").trim();
  const page = Math.max(1, parseInt(resolvedParams?.page || "1", 10) || 1);
  const activeTab = (resolvedParams?.tab || "all").toLowerCase();
  const dateRange = (resolvedParams?.date_range || "all").toLowerCase();
  const gteDate = await getDateFilterTimestamp(dateRange);

  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let leads: Lead[] = [];
  let totalFilteredCount = 0;
  let unSyncedCount = 0;
  const statusCounts: Record<string, number> = {
    all: 0,
    unviewed: 0,
    working_on: 0,
    email_sent: 0,
    pitch_response: 0,
    moved_to_project: 0,
    ignored: 0,
  };

  if (isSupabaseConfigured) {
    try {
      // 1. Fetch aggregate status counts across all leads matching search query & date filter
      let countQuery = supabase
        .from("leads")
        .select("status")
        .neq("status", "SCRAPED");

      if (q) {
        countQuery = countQuery.or(
          `business_name.ilike.%${q}%,contact_email.ilike.%${q}%,website_url.ilike.%${q}%`
        );
      }
      if (gteDate) {
        countQuery = countQuery.gte("created_at", gteDate);
      }

      const { data: statusRows, error: statusError } = await countQuery;

      if (!statusError && statusRows) {
        for (const row of statusRows) {
          const s = (row.status || "NEW").toUpperCase();
          if (s !== "IGNORED") {
            statusCounts.all++;
          }
          if (s === "NEW" || s === "MOCKUP_BUILT") {
            statusCounts.unviewed++;
          }
          if (s === "WORKING_ON") {
            statusCounts.working_on++;
          }
          if (s === "EMAIL_SENT") {
            statusCounts.email_sent++;
          }
          if (s === "PITCH_RESPONSE") {
            statusCounts.pitch_response++;
          }
          if (s === "PROJECT_MOVED" || s === "PITCH_RESPONSE") {
            statusCounts.moved_to_project++;
          }
          if (s === "IGNORED") {
            statusCounts.ignored++;
          }
        }
      }

      // 2. Main paginated query applying the selected tab's filter
      let dataQuery = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .neq("status", "SCRAPED");

      if (q) {
        dataQuery = dataQuery.or(
          `business_name.ilike.%${q}%,contact_email.ilike.%${q}%,website_url.ilike.%${q}%`
        );
      }
      if (gteDate) {
        dataQuery = dataQuery.gte("created_at", gteDate);
      }

      // Apply server-side tab status filtering
      if (activeTab === "unviewed") {
        dataQuery = dataQuery.in("status", ["NEW", "MOCKUP_BUILT"]);
      } else if (activeTab === "working_on") {
        dataQuery = dataQuery.eq("status", "WORKING_ON");
      } else if (activeTab === "email_sent") {
        dataQuery = dataQuery.eq("status", "EMAIL_SENT");
      } else if (activeTab === "pitch_response") {
        dataQuery = dataQuery.eq("status", "PITCH_RESPONSE");
      } else if (activeTab === "moved_to_project") {
        dataQuery = dataQuery.in("status", ["PROJECT_MOVED", "PITCH_RESPONSE"]);
      } else if (activeTab === "ignored") {
        dataQuery = dataQuery.eq("status", "IGNORED");
      } else {
        // "all": default active pipeline excluding ignored
        dataQuery = dataQuery.neq("status", "IGNORED");
      }

      const { data, count, error } = await dataQuery
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error && data) {
        leads = (data as LeadRow[]).map(mapLeadRowToLead);
        totalFilteredCount = count ?? 0;
      } else if (error) {
        console.error("Supabase error querying paginated leads:", error);
      }

      // 3. Count staged/un-synced leads specifically where status === 'SCRAPED'
      const { count: stagedCount, error: countError } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "SCRAPED");

      if (!countError && typeof stagedCount === "number") {
        unSyncedCount = stagedCount;
      }
    } catch (err) {
      console.error("Error fetching leads from Supabase in Server Component:", err);
    }
  }

  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;

  return (
    <LeadsView
      initialLeads={leads}
      initialUnSyncedCount={unSyncedCount}
      totalCount={totalFilteredCount}
      currentPage={page}
      totalPages={totalPages}
      pageSize={pageSize}
      activeTab={activeTab}
      statusCounts={statusCounts}
    />
  );
}

export default function LeadsPage({ searchParams }: LeadsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col justify-center items-center text-zinc-500 gap-3">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading leads pipeline...</span>
        </div>
      }
    >
      <LeadsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
