"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import {
  mapLeadToRow,
  mapProjectToRow,
  mapProjectUpdateToRow,
  mapLeadRowToLead,
  LeadRow,
  ProjectRow,
  Lead,
  Project
} from "@/lib/types/database";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateProjectInput {
  projectName: string;
  clientContact?: string;
  clientPhone?: string;
  stagingUrl?: string;
  location?: string;
  hasMobileApp?: boolean;
  budget?: string;
  phaseStatus?: string;
  summary?: string;
  leadId?: string;
}

/**
 * Updates the outreach status of a lead in the database
 */
export async function updateLeadStatus(
  leadId: string,
  newStatus: string
): Promise<ActionResult> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not fully configured yet. Fallback simulated for updateLeadStatus.");
      revalidatePath("/leads", "page");
      revalidatePath("/", "page");
      return { success: true };
    }

    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (error) {
      console.error("Error updating lead status in Supabase:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/leads", "page");
    revalidatePath("/", "page");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update lead status";
    console.error("Exception in updateLeadStatus:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Executes a bulk update in Supabase: changes all leads where status === 'SCRAPED' to status = 'NEW',
 * then revalidates '/leads' and '/' to update both the badge count and active leads table.
 */
export async function syncScrapedLeads(): Promise<ActionResult<{ count: number }>> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not fully configured yet. Fallback simulated for syncScrapedLeads.");
      revalidatePath("/leads", "page");
      revalidatePath("/", "page");
      return { success: true, data: { count: 0 } };
    }

    const { data, error } = await supabase
      .from("leads")
      .update({ status: "NEW" })
      .eq("status", "SCRAPED")
      .select("id");

    if (error) {
      console.error("Error bulk updating scraped leads in Supabase:", error);
      return { success: false, error: error.message };
    }

    const updatedCount = data ? data.length : 0;

    revalidatePath("/leads", "page");
    revalidatePath("/", "page");
    return { success: true, data: { count: updatedCount } };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to sync scraped leads";
    console.error("Exception in syncScrapedLeads:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Updates manually edited fields from the View Details modal
 */
export async function updateLeadDetails(
  leadId: string,
  data: Partial<Lead>
): Promise<ActionResult> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not fully configured yet. Fallback simulated for updateLeadDetails.");
      revalidatePath("/leads", "page");
      return { success: true };
    }

    const rowData = mapLeadToRow(data);

    const { error } = await supabase
      .from("leads")
      .update(rowData)
      .eq("id", leadId);

    if (error) {
      console.error("Error updating lead details in Supabase:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/leads", "page");
    revalidatePath("/", "page");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update lead details";
    console.error("Exception in updateLeadDetails:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Updates project details from the Project Details modal (specs, budget, staging URL, summary)
 */
export async function updateProjectDetails(
  projectId: string,
  data: Partial<Project>
): Promise<ActionResult> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not fully configured yet. Fallback simulated for updateProjectDetails.");
      revalidatePath("/projects", "page");
      revalidatePath("/", "page");
      return { success: true };
    }

    const rowData = mapProjectUpdateToRow(data);

    const { error } = await supabase
      .from("projects")
      .update(rowData)
      .eq("id", projectId);

    if (error) {
      console.error("Error updating project details in Supabase:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/projects", "page");
    revalidatePath("/", "page");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update project details";
    console.error("Exception in updateProjectDetails:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Inserts a new row into the projects table.
 * If lead_id is provided, automatically updates that lead's status to 'PROJECT_MOVED'.
 */
export async function createProject(
  data: CreateProjectInput
): Promise<ActionResult> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not fully configured yet. Fallback simulated for createProject.");
      revalidatePath("/projects", "page");
      revalidatePath("/leads", "page");
      revalidatePath("/", "page");
      return { success: true };
    }

    const projectRow = mapProjectToRow({
      projectName: data.projectName,
      clientContact: data.clientContact,
      clientPhone: data.clientPhone,
      stagingUrl: data.stagingUrl,
      location: data.location,
      hasMobileApp: data.hasMobileApp,
      summary: data.summary,
      budget: data.budget,
      phaseStatus: (data.phaseStatus as any) || "UNDER DISCUSSION",
      leadId: data.leadId,
    });

    const { data: insertedData, error: projectError } = await supabase
      .from("projects")
      .insert(projectRow)
      .select()
      .single();

    if (projectError) {
      console.error("Error creating project in Supabase:", projectError);
      return { success: false, error: projectError.message };
    }

    // If imported from an existing lead, update the lead's status to 'PROJECT_MOVED'
    if (data.leadId) {
      const { error: leadUpdateError } = await supabase
        .from("leads")
        .update({ status: "PROJECT_MOVED" })
        .eq("id", data.leadId);

      if (leadUpdateError) {
        console.warn("Project created, but lead status update had an issue:", leadUpdateError);
      }
    }

    revalidatePath("/projects", "page");
    revalidatePath("/leads", "page");
    revalidatePath("/", "page");
    return { success: true, data: insertedData };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create project";
    console.error("Exception in createProject:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Updates the pipeline stage of an active project
 */
export async function updateProjectPhase(
  projectId: string,
  newPhase: string
): Promise<ActionResult> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not fully configured yet. Fallback simulated for updateProjectPhase.");
      revalidatePath("/projects", "page");
      revalidatePath("/", "page");
      return { success: true };
    }

    const normalizedPhase = newPhase.replace(/\s+/g, "_").toUpperCase();

    const { error } = await supabase
      .from("projects")
      .update({ phase_status: normalizedPhase })
      .eq("id", projectId);

    if (error) {
      console.error("Error updating project phase in Supabase:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/projects", "page");
    revalidatePath("/", "page");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update project phase";
    console.error("Exception in updateProjectPhase:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Removes a project row
 */
export async function deleteProject(
  projectId: string
): Promise<ActionResult> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not fully configured yet. Fallback simulated for deleteProject.");
      revalidatePath("/projects", "page");
      revalidatePath("/", "page");
      return { success: true };
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Error deleting project from Supabase:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/projects", "page");
    revalidatePath("/", "page");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete project";
    console.error("Exception in deleteProject:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Fetches warm leads from Supabase for the Add Project "Import from Leads" tab
 */
export async function fetchWarmLeadsForImport(): Promise<Lead[]> {
  try {
    if (!isSupabaseConfigured) {
      return [];
    }

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .in("status", ["PITCH_RESPONSE", "EMAIL_SENT", "NEW", "MOCKUP_BUILT"])
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error fetching warm leads:", error);
      return [];
    }

    return (data as LeadRow[]).map(mapLeadRowToLead);
  } catch (err) {
    console.error("Exception in fetchWarmLeadsForImport:", err);
    return [];
  }
}

/**
 * Signs in a user using Supabase Auth password authentication
 */
export async function loginUser(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both your email address and password." };
  }

  try {
    const serverSupabase = await createServerSupabaseClient();
    const { error } = await serverSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/", "layout");
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return {
      error: err instanceof Error ? err.message : "Failed to sign in. Please try again.",
    };
  }

  redirect("/");
}

/**
 * Updates the authenticated user's profile in public.profiles
 */
export async function updateUserProfile(data: {
  firstName: string;
  lastName: string;
  role: string;
}): Promise<ActionResult> {
  try {
    const serverSupabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await serverSupabase.from("profiles").upsert({
      id: user.id,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      role: data.role.trim() || "CRM Administrator",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/profile", "page");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update profile",
    };
  }
}
