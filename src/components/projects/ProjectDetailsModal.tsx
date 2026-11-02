"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Project, ProjectPhase, Lead } from "@/lib/types/database";
import {
  Briefcase,
  Globe,
  Mail,
  Phone,
  DollarSign,
  Edit3,
  Save,
  ExternalLink,
  Layers,
  FileText,
  Star,
  MapPin,
  Clock,
  Smartphone
} from "lucide-react";

interface ProjectDetailsModalProps {
  project: Project | null;
  linkedLead?: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveProject?: (updatedProject: Project) => void;
}

export function ProjectDetailsModal({
  project,
  linkedLead,
  isOpen,
  onClose,
  onSaveProject,
}: ProjectDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Project | null>(project);

  useEffect(() => {
    setFormData(project);
    setIsEditing(false);
  }, [project, isOpen]);

  if (!formData) return null;

  const handleSave = () => {
    if (formData && onSaveProject) {
      onSaveProject(formData);
    }
    setIsEditing(false);
  };

  const renderPhaseBadge = (phase: ProjectPhase) => {
    switch (phase) {
      case "UNDER DISCUSSION":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/70 text-amber-400 border border-amber-800/80">
            UNDER DISCUSSION
          </span>
        );
      case "STAGING & DESIGN":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            STAGING & DESIGN
          </span>
        );
      case "BUILD & INTEGRATION":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-950/80 text-yellow-400 border border-yellow-800/80">
            BUILD & INTEGRATION
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
            DELIVERED
          </span>
        );
      case "REVISIONS":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-950/70 text-orange-400 border border-orange-800/60">
            REVISIONS
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span>{formData.projectName}</span>
          {renderPhaseBadge(formData.phaseStatus)}
        </div>
      }
      subtitle={
        <div className="flex items-center gap-1.5 text-zinc-400">
          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
          <span>{formData.location}</span>
        </div>
      }
      headerAction={
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
            isEditing
              ? "bg-amber-500 text-zinc-950 border-amber-400 font-semibold"
              : "bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border-zinc-700"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? "Editing Mode" : "Edit Details"}</span>
        </button>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-zinc-500">
            UUID: <span className="font-mono text-zinc-400">{formData.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 rounded-xl border border-zinc-700/80 transition-colors"
            >
              Cancel
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Form Fields: Read-only or Editable based on isEditing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Project Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) =>
                setFormData({ ...formData, projectName: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          ) : (
            <div className="text-sm font-semibold text-zinc-200 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800">
              {formData.projectName}
            </div>
          )}
        </div>

        {/* Phase Status */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Pipeline Phase
          </label>
          {isEditing ? (
            <select
              value={formData.phaseStatus}
              onChange={(e) =>
                setFormData({ ...formData, phaseStatus: e.target.value as ProjectPhase })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
            >
              <option value="UNDER DISCUSSION">Under Discussions</option>
              <option value="STAGING & DESIGN">Design & Mockup</option>
              <option value="BUILD & INTEGRATION">Build & Integration</option>
              <option value="DELIVERED">Delivered</option>
              <option value="REVISIONS">Revisions</option>
            </select>
          ) : (
            <div className="text-sm font-semibold text-zinc-200 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800">
              {formData.phaseStatus}
            </div>
          )}
        </div>

        {/* Staged Mockup / Vercel Preview URL */}
        <div>
          <label className="block text-xs font-medium text-amber-400 mb-1 flex items-center justify-between">
            <span>Staged Mockup (Vercel / Preview URL)</span>
            {formData.stagingUrl && !isEditing && (
              <a
                href={
                  formData.stagingUrl.startsWith("http")
                    ? formData.stagingUrl
                    : `https://${formData.stagingUrl}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Open Preview</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.stagingUrl}
              onChange={(e) =>
                setFormData({ ...formData, stagingUrl: e.target.value })
              }
              placeholder="preview.myproject.vercel.app"
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-amber-500/50 rounded-xl text-amber-300 font-mono focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          ) : (
            <div className="text-sm bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl text-amber-300 font-mono flex items-center justify-between truncate">
              <span>{formData.stagingUrl || "No staging URL set"}</span>
            </div>
          )}
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Budget & Contract Invoiced
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
              placeholder="$1,500"
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
            />
          ) : (
            <div className="text-sm font-bold text-zinc-100 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800">
              {formData.budget} {formData.budgetStatus}
            </div>
          )}
        </div>

        {/* Client Contact Email */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Client Contact Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={formData.clientContact}
              onChange={(e) =>
                setFormData({ ...formData, clientContact: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-200 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800 truncate">
              <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>{formData.clientContact || "Not specified"}</span>
            </div>
          )}
        </div>

        {/* Client Phone */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Client Phone
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.clientPhone || ""}
              onChange={(e) =>
                setFormData({ ...formData, clientPhone: e.target.value })
              }
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-200 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800 truncate">
              <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>{formData.clientPhone || "Not specified"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile App Availability Switch / Indicator */}
      <div className="pt-1">
        {isEditing ? (
          <div className="flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
            <input
              type="checkbox"
              id="projectModalMobileApp"
              checked={!!formData.hasMobileApp}
              onChange={(e) =>
                setFormData({ ...formData, hasMobileApp: e.target.checked })
              }
              className="w-4 h-4 rounded-xs border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/40 accent-amber-500 cursor-pointer"
            />
            <label
              htmlFor="projectModalMobileApp"
              className="flex items-center gap-2 text-xs text-zinc-300 font-medium cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mobile App Available</span>
              <span className="text-[11px] text-zinc-500 font-normal">
                (Displays mobile app badge in project directory)
              </span>
            </label>
          </div>
        ) : (
          formData.hasMobileApp && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-xs font-semibold text-indigo-300">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mobile Application Active</span>
            </div>
          )
        )}
      </div>

      {/* Summary / Technical Deployment & Configuration Box */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-500" />
          <span>Project & Deployment Summary (Essential Reminders & Config)</span>
        </label>
        {isEditing ? (
          <textarea
            rows={3}
            value={formData.summary || ""}
            onChange={(e) =>
              setFormData({ ...formData, summary: e.target.value })
            }
            className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-amber-500/40 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
            placeholder="e.g. Vercel Project ID, GitHub repo, DNS CNAME status, specific client deliverables..."
          />
        ) : (
          <div className="p-3 bg-zinc-950/90 border border-amber-500/20 rounded-xl text-xs text-zinc-300 min-h-[64px] whitespace-pre-wrap leading-relaxed">
            {formData.summary || "No deployment configurations or summary notes added yet."}
          </div>
        )}
      </div>

      {/* Origin Lead Intelligence (if available) */}
      {linkedLead && (
        <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-2 mt-2">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
            <span className="text-xs font-semibold text-zinc-300">
              Origin Lead Intelligence
            </span>
            <span className="text-[10px] text-amber-400 font-medium">
              Converted Lead
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-zinc-500 text-[11px]">Google Rating:</span>
              <div className="flex items-center gap-1 text-zinc-200 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{linkedLead.rating}★ ({linkedLead.reviews} reviews)</span>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 text-[11px]">Original Site:</span>
              <div className="text-zinc-300 truncate">
                {linkedLead.websiteUrl}
              </div>
            </div>

            <div>
              <span className="text-zinc-500 text-[11px]">Mobile App:</span>
              <div className="text-zinc-300">
                {linkedLead.hasMobileApp ? "Available" : "None"}
              </div>
            </div>
          </div>

          {linkedLead.pitchNotes && (
            <div className="pt-1.5 border-t border-zinc-800/60 text-xs">
              <span className="text-zinc-500 text-[11px]">Outreach / Pitch Remarks:</span>
              <p className="text-zinc-400 text-xs italic mt-0.5">
                &ldquo;{linkedLead.pitchNotes}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

