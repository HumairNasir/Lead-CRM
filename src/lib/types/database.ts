/**
 * Frontend Model Interfaces & Types
 */
export type LeadStatus =
  | 'SCRAPED'
  | 'NEW'
  | 'WORKING_ON'
  | 'MOCKUP_BUILT'
  | 'EMAIL_SENT'
  | 'PITCH_RESPONSE'
  | 'PROJECT_MOVED'
  | 'IGNORED';

export interface Lead {
  id: string;
  businessName: string;
  location: string;
  rating: number;
  reviews: number;
  websiteUrl: string;
  deployedPreviewUrl?: string;
  summary?: string;
  hasMobileApp: boolean;
  status: LeadStatus;
  pitchNotes: string;
  contactEmail?: string;
  phone?: string;
}

export type ProjectPhase =
  | 'UNDER DISCUSSION'
  | 'STAGING & DESIGN'
  | 'BUILD & INTEGRATION'
  | 'DELIVERED'
  | 'REVISIONS';

export interface Project {
  id: string;
  leadId?: string;
  projectName: string;
  location: string;
  clientContact: string;
  clientPhone?: string;
  stagingUrl: string;
  summary?: string;
  hasMobileApp?: boolean;
  budget: string;
  budgetStatus?: string;
  phaseStatus: ProjectPhase;
}

export interface KpiCardData {
  id: string;
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  type: 'leads' | 'projects' | 'conversion' | 'revenue';
}

export interface OutreachTrendPoint {
  month: string;
  outreach: number;
  revenue: number;
}

export interface PipelineStatusSegment {
  id: string;
  label: string;
  percentage: number;
  color: string;
}

export interface DashboardData {
  kpis: KpiCardData[];
  trendStats: {
    title: string;
    description: string;
    dataPoints: OutreachTrendPoint[];
  };
  pipelineStatus: {
    title: string;
    segments: PipelineStatusSegment[];
  };
  globalDateRange: string;
  dateOptions: string[];
}

/**
 * Raw PostgreSQL table row interfaces (snake_case)
 */
export interface LeadRow {
  id: string;
  place_id: string;
  business_name: string | null;
  location: string | null;
  rating: number | null;
  reviews_count: number | null;
  website_url: string | null;
  deployed_preview_url?: string | null;
  summary?: string | null;
  has_mobile_app: boolean | null;
  status: string | null;
  pitch_notes: string | null;
  contact_email?: string | null;
  phone?: string | null;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  lead_id: string | null;
  project_name: string;
  client_email: string | null;
  client_phone: string | null;
  staging_url: string | null;
  location?: string | null;
  has_mobile_app?: boolean | null;
  summary?: string | null;
  budget: number | null;
  phase_status: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

/**
 * Insert & Update DTOs
 */
export type LeadInsert = Omit<LeadRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type LeadUpdate = Partial<Omit<LeadRow, "id" | "created_at">>;

export type ProjectInsert = Omit<ProjectRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type ProjectUpdate = Partial<Omit<ProjectRow, "id" | "created_at">>;

/**
 * Bidirectional mappers to ensure zero breaking changes in UI components
 */
export function mapLeadRowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    businessName: row.business_name || "Untitled Business",
    location: row.location || "Location not specified",
    rating: Number(row.rating) || 0,
    reviews: Number(row.reviews_count) || 0,
    websiteUrl: row.website_url || "NO WEBSITE",
    deployedPreviewUrl: row.deployed_preview_url || "",
    summary: row.summary || "",
    hasMobileApp: Boolean(row.has_mobile_app),
    status: (row.status as LeadStatus) || "NEW",
    pitchNotes: row.pitch_notes || "",
    contactEmail: row.contact_email || undefined,
    phone: row.phone || undefined,
  };
}

export function mapLeadToRow(lead: Partial<Lead>, placeId?: string): LeadUpdate {
  const row: LeadUpdate = {};
  if (lead.businessName !== undefined) row.business_name = lead.businessName;
  if (lead.location !== undefined) row.location = lead.location;
  if (lead.rating !== undefined) row.rating = lead.rating;
  if (lead.reviews !== undefined) row.reviews_count = lead.reviews;
  if (lead.websiteUrl !== undefined) row.website_url = lead.websiteUrl;
  if (lead.deployedPreviewUrl !== undefined) row.deployed_preview_url = lead.deployedPreviewUrl;
  if (lead.summary !== undefined) row.summary = lead.summary;
  if (lead.hasMobileApp !== undefined) row.has_mobile_app = lead.hasMobileApp;
  if (lead.status !== undefined) row.status = lead.status;
  if (lead.pitchNotes !== undefined) row.pitch_notes = lead.pitchNotes;
  if (lead.contactEmail !== undefined) row.contact_email = lead.contactEmail;
  if (lead.phone !== undefined) row.phone = lead.phone;
  if (placeId) row.place_id = placeId;
  return row;
}

export function mapProjectRowToProject(row: ProjectRow, defaultMobileApp = false): Project {
  // Normalize budget formatting ($1,200)
  const formattedBudget =
    typeof row.budget === "number"
      ? `$${row.budget.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
      : "$0";

  // Map phase status (e.g. 'UNDER_DISCUSSION' to 'UNDER DISCUSSION')
  const normalizedPhase = (row.phase_status?.replace(/_/g, " ") || "UNDER DISCUSSION") as ProjectPhase;

  return {
    id: row.id,
    leadId: row.lead_id || undefined,
    projectName: row.project_name,
    location: row.location || "Active Client",
    clientContact: row.client_email || "Not specified",
    clientPhone: row.client_phone || undefined,
    stagingUrl: row.staging_url || "preview.devstaged.io",
    summary: row.summary || "",
    hasMobileApp: typeof row.has_mobile_app === "boolean" ? row.has_mobile_app : defaultMobileApp,
    budget: formattedBudget,
    budgetStatus: "(Active)",
    phaseStatus: normalizedPhase,
  };
}

export function mapProjectToRow(project: Partial<Project> & { leadId?: string; clientPhone?: string }): ProjectInsert {
  const parsedBudget = project.budget
    ? parseFloat(project.budget.replace(/[^0-9.]/g, ""))
    : 0;

  const normalizedPhaseStatus = (project.phaseStatus?.replace(/\s+/g, "_") || "UNDER_DISCUSSION").toUpperCase();

  const row: ProjectInsert = {
    lead_id: project.leadId || null,
    project_name: project.projectName || "New Client Project",
    client_email: project.clientContact || null,
    client_phone: project.clientPhone || null,
    staging_url: project.stagingUrl || null,
    location: project.location || "Active Client",
    has_mobile_app: !!project.hasMobileApp,
    summary: project.summary || "",
    budget: isNaN(parsedBudget) ? 0 : parsedBudget,
    phase_status: normalizedPhaseStatus,
  };

  return row;
}

export function mapProjectUpdateToRow(project: Partial<Project>): ProjectUpdate {
  const row: ProjectUpdate = {};
  if (project.projectName !== undefined) row.project_name = project.projectName;
  if (project.clientContact !== undefined) row.client_email = project.clientContact;
  if (project.clientPhone !== undefined) row.client_phone = project.clientPhone;
  if (project.stagingUrl !== undefined) row.staging_url = project.stagingUrl;
  if (project.location !== undefined) row.location = project.location;
  if (project.hasMobileApp !== undefined) row.has_mobile_app = project.hasMobileApp;
  if (project.summary !== undefined) row.summary = project.summary;
  if (project.budget !== undefined) {
    const parsedBudget = parseFloat(project.budget.replace(/[^0-9.]/g, ""));
    row.budget = isNaN(parsedBudget) ? 0 : parsedBudget;
  }
  if (project.phaseStatus !== undefined) {
    row.phase_status = project.phaseStatus.replace(/\s+/g, "_").toUpperCase();
  }
  return row;
}
