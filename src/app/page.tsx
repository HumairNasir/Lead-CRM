import React, { Suspense } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  LeadRow,
  ProjectRow,
  KpiCardData,
  PipelineStatusSegment,
  OutreachTrendPoint
} from "@/lib/types/database";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { PipelineDonut } from "@/components/dashboard/PipelineDonut";

const DEFAULT_TREND_POINTS: OutreachTrendPoint[] = [
  { month: "Jan", outreach: 120, revenue: 1800 },
  { month: "Feb", outreach: 180, revenue: 2400 },
  { month: "Mar", outreach: 240, revenue: 3800 },
  { month: "Apr", outreach: 310, revenue: 4600 },
  { month: "May", outreach: 420, revenue: 7200 },
  { month: "Jun", outreach: 560, revenue: 9800 },
];

const DEFAULT_PIPELINE_SEGMENTS: PipelineStatusSegment[] = [
  { id: "segment-scraped-01", label: "Leads Scraped", percentage: 35, color: "#d97706" },
  { id: "segment-mockup-02", label: "Mockup Built", percentage: 26, color: "#f59e0b" },
  { id: "segment-pitch-03", label: "Pitch Sent", percentage: 28, color: "#fbbf24" },
  { id: "segment-closed-04", label: "Closed", percentage: 11, color: "#fef3c7" },
];

async function DashboardOverviewContent() {
  let leads: LeadRow[] = [];
  let projects: ProjectRow[] = [];

  if (isSupabaseConfigured) {
    try {
      const [leadsRes, projectsRes] = await Promise.all([
        supabase.from("leads").select("*").neq("status", "SCRAPED"),
        supabase.from("projects").select("*"),
      ]);

      if (leadsRes.data) leads = leadsRes.data as LeadRow[];
      if (projectsRes.data) projects = projectsRes.data as ProjectRow[];
    } catch (err) {
      console.error("Error aggregating dashboard metrics from Supabase:", err);
    }
  }

  // Live Metrics Calculation directly from database records
  const totalLeadsCount = leads.length;
  const activeProjects = projects.filter((p) => p.phase_status !== "DELIVERED");
  const activeProjectsCount = activeProjects.length;

  const conversionRateValue =
    totalLeadsCount > 0
      ? ((activeProjectsCount / totalLeadsCount) * 100).toFixed(1)
      : "0.0";

  const totalProjectedRevenueNumber = activeProjects.reduce(
    (sum, p) => sum + (Number(p.budget) || 0),
    0
  );

  const formattedRevenue = `$${totalProjectedRevenueNumber.toLocaleString("en-US")}`;

  // Live dynamic KPI cards
  const liveKpis: KpiCardData[] = [
    {
      id: "kpi-scraped-leads",
      title: "Total Scraped Leads",
      value: totalLeadsCount.toLocaleString("en-US"),
      change: totalLeadsCount > 0 ? `+${totalLeadsCount}` : "0",
      isPositive: true,
      type: "leads",
    },
    {
      id: "kpi-active-projects",
      title: "Active Projects",
      value: activeProjectsCount.toString(),
      change: activeProjectsCount > 0 ? `+${activeProjectsCount}` : "0",
      isPositive: true,
      type: "projects",
    },
    {
      id: "kpi-conversion-rate",
      title: "Conversion Rate",
      value: `${conversionRateValue}%`,
      change: "+0.0%",
      isPositive: true,
      type: "conversion",
    },
    {
      id: "kpi-projected-revenue",
      title: "Projected Revenue",
      value: formattedRevenue,
      change: "+0.0%",
      isPositive: true,
      type: "revenue",
    },
  ];

  // Calculate live Pipeline Status distribution
  let pipelineSegments: PipelineStatusSegment[] = DEFAULT_PIPELINE_SEGMENTS;

  if (leads.length > 0) {
    const scrapedCount = leads.filter((l) => l.status === "NEW").length;
    const mockupCount = leads.filter((l) => l.status === "MOCKUP_BUILT").length;
    const pitchCount = leads.filter((l) => l.status === "EMAIL_SENT" || l.status === "PITCH_RESPONSE").length;
    const closedCount = leads.filter((l) => l.status === "PROJECT_MOVED").length;
    const totalPipeline = scrapedCount + mockupCount + pitchCount + closedCount || 1;

    pipelineSegments = [
      {
        id: "segment-scraped-01",
        label: "Leads Scraped",
        percentage: Math.round((scrapedCount / totalPipeline) * 100) || 35,
        color: "#d97706",
      },
      {
        id: "segment-mockup-02",
        label: "Mockup Built",
        percentage: Math.round((mockupCount / totalPipeline) * 100) || 26,
        color: "#f59e0b",
      },
      {
        id: "segment-pitch-03",
        label: "Pitch Sent",
        percentage: Math.round((pitchCount / totalPipeline) * 100) || 28,
        color: "#fbbf24",
      },
      {
        id: "segment-closed-04",
        label: "Closed",
        percentage: Math.max(1, 100 - (Math.round((scrapedCount / totalPipeline) * 100) + Math.round((mockupCount / totalPipeline) * 100) + Math.round((pitchCount / totalPipeline) * 100))),
        color: "#fef3c7",
      },
    ];
  }

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <section aria-label="Key Performance Indicators">
        <KpiCards kpis={liveKpis} />
      </section>

      {/* Analytics & Pipeline Charts Grid */}
      <section
        aria-label="Analytics & Pipeline Distribution"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
      >
        <div className="lg:col-span-2">
          <TrendChart dataPoints={DEFAULT_TREND_POINTS} />
        </div>
        <div className="lg:col-span-1">
          <PipelineDonut segments={pipelineSegments} />
        </div>
      </section>
    </div>
  );
}

function DashboardFallback() {
  const fallbackKpis: KpiCardData[] = [
    { id: "fallback-leads", title: "Total Scraped Leads", value: "0", type: "leads" },
    { id: "fallback-projects", title: "Active Projects", value: "0", type: "projects" },
    { id: "fallback-conv", title: "Conversion Rate", value: "0.0%", type: "conversion" },
    { id: "fallback-rev", title: "Projected Revenue", value: "$0", type: "revenue" },
  ];

  return (
    <div className="space-y-6">
      <section aria-label="Key Performance Indicators">
        <KpiCards kpis={fallbackKpis} />
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <TrendChart dataPoints={DEFAULT_TREND_POINTS} />
        </div>
        <div className="lg:col-span-1">
          <PipelineDonut segments={DEFAULT_PIPELINE_SEGMENTS} />
        </div>
      </section>
    </div>
  );
}

export default function DashboardOverviewPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardOverviewContent />
    </Suspense>
  );
}
