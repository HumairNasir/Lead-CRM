"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Project, ProjectPhase, Lead } from "@/lib/types/database";
import { createProject, fetchWarmLeadsForImport } from "@/app/actions";
import { Search, Plus, Check, DollarSign, Globe, Mail, MapPin, Briefcase, Phone, Smartphone, FileText } from "lucide-react";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject?: (newProject: Project) => void;
  availableLeads?: Lead[];
}

export function AddProjectModal({
  isOpen,
  onClose,
  onAddProject,
  availableLeads = [],
}: AddProjectModalProps) {
  const [activeTab, setActiveTab] = useState<"import" | "manual">("import");
  const [searchLeadQuery, setSearchLeadQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [warmLeads, setWarmLeads] = useState<Lead[]>(availableLeads);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual entry form state
  const [projectName, setProjectName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [budget, setBudget] = useState("$0");
  const [stagingUrl, setStagingUrl] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [hasMobileApp, setHasMobileApp] = useState(false);
  const [phaseStatus, setPhaseStatus] = useState<ProjectPhase>("UNDER DISCUSSION");
  const [validationError, setValidationError] = useState("");

  // When modal opens, pull fresh list of leads directly from Supabase filtering for PITCH_RESPONSE or EMAIL_SENT
  useEffect(() => {
    async function loadFreshWarmLeads() {
      if (!isOpen) return;
      setIsLoadingLeads(true);
      try {
        const fresh = await fetchWarmLeadsForImport();
        if (fresh && fresh.length > 0) {
          setWarmLeads(fresh);
        } else if (availableLeads.length > 0) {
          setWarmLeads(availableLeads);
        } else {
          setWarmLeads([]);
        }
      } catch (err) {
        console.error("Error loading fresh warm leads:", err);
      } finally {
        setIsLoadingLeads(false);
      }
    }

    loadFreshWarmLeads();
  }, [isOpen, availableLeads]);

  // Filter available leads for import by query
  const filteredWarmLeads = warmLeads.filter(
    (l) =>
      l.businessName.toLowerCase().includes(searchLeadQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchLeadQuery.toLowerCase())
  );

  const resetForm = () => {
    setActiveTab("import");
    setSearchLeadQuery("");
    setSelectedLeadId(null);
    setProjectName("");
    setClientContact("");
    setClientPhone("");
    setBudget("$0");
    setStagingUrl("");
    setLocation("");
    setSummary("");
    setHasMobileApp(false);
    setPhaseStatus("UNDER DISCUSSION");
    setValidationError("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectLeadToImport = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setProjectName(lead.businessName);
    setClientContact(lead.contactEmail || `contact@${lead.businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`);
    setClientPhone(lead.phone || "");
    setLocation(lead.location);
    setStagingUrl(lead.deployedPreviewUrl || `preview.${lead.businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`);
    setBudget("$0");
    setSummary(lead.summary || lead.pitchNotes || "");
    setHasMobileApp(!!lead.hasMobileApp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setValidationError("Project Name is mandatory.");
      return;
    }

    setIsSubmitting(true);
    setValidationError("");

    const parsedBudgetText = budget.trim()
      ? (budget.trim().startsWith("$") ? budget.trim() : `$${budget.trim()}`)
      : "$0";

    const newProject: Project = {
      id: `f47ac10b-${Math.random().toString(36).substring(2, 6)}-4372-${Math.random().toString(36).substring(2, 6)}-${Date.now().toString(16)}`,
      projectName: projectName.trim(),
      location: location.trim() || "Active Client",
      clientContact: clientContact.trim() || "unassigned@client.com",
      clientPhone: clientPhone.trim() || undefined,
      stagingUrl: stagingUrl.trim() || "preview.devstaged.io",
      summary: summary.trim(),
      hasMobileApp: hasMobileApp,
      budget: parsedBudgetText,
      budgetStatus: "(Active)",
      phaseStatus: phaseStatus,
      leadId: selectedLeadId || undefined,
    };

    try {
      // Execute createProject Server Action
      const res = await createProject({
        projectName: projectName.trim(),
        clientContact: clientContact.trim(),
        clientPhone: clientPhone.trim(),
        stagingUrl: stagingUrl.trim(),
        location: location.trim(),
        hasMobileApp: hasMobileApp,
        summary: summary.trim(),
        budget: parsedBudgetText,
        phaseStatus: phaseStatus,
        leadId: selectedLeadId || undefined,
      });

      if (!res.success) {
        console.warn("Supabase project insert returned issue, continuing with optimistic update:", res.error);
      }

      if (onAddProject) {
        onAddProject(newProject);
      }

      handleClose();
    } catch (err) {
      console.error("Failed to add project:", err);
      setValidationError("Failed to create project. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Project"
      subtitle="Initialize client delivery workspace or import from converted leads"
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 rounded-xl border border-zinc-700/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? "Creating..." : "Create Project"}</span>
          </button>
        </div>
      }
    >
      {/* Internal Tabs matching Screenshot #3 */}
      <div className="flex items-center border-b border-zinc-800 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("import")}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold transition-colors relative ${
            activeTab === "import"
              ? "text-amber-400 border-b-2 border-amber-500"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span>Import from Leads</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold transition-colors relative ${
            activeTab === "manual"
              ? "text-amber-400 border-b-2 border-amber-500"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span>Manual Entry</span>
        </button>
      </div>

      {validationError && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
          {validationError}
        </div>
      )}

      {/* Tab 1: Import from Leads */}
      {activeTab === "import" && (
        <div className="space-y-4">
          {/* Search Leads Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchLeadQuery}
              onChange={(e) => setSearchLeadQuery(e.target.value)}
              placeholder="Search responsive leads or businesses..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Leads Selection List */}
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {isLoadingLeads ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                Fetching qualified leads from Supabase...
              </div>
            ) : filteredWarmLeads.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No matching leads found.
              </div>
            ) : (
              filteredWarmLeads.map((lead) => {
                const isSelected = selectedLeadId === lead.id;
                return (
                  <div
                    key={lead.id}
                    onClick={() => handleSelectLeadToImport(lead)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 text-zinc-100 shadow-xs"
                        : "bg-zinc-850/60 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-amber-500 border-amber-500 text-zinc-950"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-zinc-100">
                          {lead.businessName}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {lead.location} • {lead.reviews} reviews ({lead.rating}★)
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                      {lead.status.replace("_", " ")}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {selectedLeadId && (
            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs space-y-1">
              <span className="text-zinc-400">Ready to convert: </span>
              <span className="font-semibold text-amber-400">{projectName}</span>
              <p className="text-[11px] text-zinc-500">
                Click &ldquo;Create Project&rdquo; below to import this lead into the project staging workflow.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manual Entry Form */}
      {activeTab === "manual" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Project Name <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (validationError) setValidationError("");
                }}
                placeholder="e.g. Dallas Roofing Co."
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Client Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  placeholder="info@client.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Client Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Budget
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="$0"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Initial Pipeline Phase
              </label>
              <select
                value={phaseStatus}
                onChange={(e) => setPhaseStatus(e.target.value as ProjectPhase)}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
              >
                <option value="UNDER DISCUSSION">Under Discussions</option>
                <option value="STAGING & DESIGN">Design & Mockup</option>
                <option value="BUILD & INTEGRATION">Build & Integration</option>
                <option value="DELIVERED">Delivered</option>
                <option value="REVISIONS">Revisions</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dallas, CA"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Staged Mockup Preview URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={stagingUrl}
                  onChange={(e) => setStagingUrl(e.target.value)}
                  placeholder="preview.domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Mobile App Availability Toggle */}
          <div className="flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
            <input
              type="checkbox"
              id="hasMobileAppManual"
              checked={hasMobileApp}
              onChange={(e) => setHasMobileApp(e.target.checked)}
              className="w-4 h-4 rounded-xs border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/40 accent-amber-500 cursor-pointer"
            />
            <label htmlFor="hasMobileAppManual" className="flex items-center gap-2 text-xs text-zinc-300 font-medium cursor-pointer">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mobile App Available</span>
              <span className="text-[11px] text-zinc-500 font-normal">
                (Displays mobile badge in project directory)
              </span>
            </label>
          </div>

          {/* Summary / Technical Deployment & Configuration Notes */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Deployment & Configuration Summary (Optional)</span>
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Vercel deployment URL, GitHub repository, DNS CNAME configuration, hosting credentials, or initial deliverables..."
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-xl text-zinc-100 placeholder-zinc-500 font-mono focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
