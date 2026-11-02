"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Lead } from "@/lib/types/database";
import {
  Star,
  Smartphone,
  Globe,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  ExternalLink,
  Layers,
  FileText
} from "lucide-react";

interface LeadDetailsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLead?: (updatedLead: Lead) => void;
}

export function LeadDetailsModal({
  lead,
  isOpen,
  onClose,
  onSaveLead,
}: LeadDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Lead | null>(lead);

  useEffect(() => {
    setFormData(lead);
    setIsEditing(false);
  }, [lead, isOpen]);

  if (!formData) return null;

  const handleSave = () => {
    if (formData && onSaveLead) {
      onSaveLead(formData);
    }
    setIsEditing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span>{formData.businessName}</span>
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              formData.status === "NEW"
                ? "bg-blue-900/50 text-blue-400 border-blue-700/50"
                : formData.status === "WORKING_ON"
                ? "bg-cyan-900/50 text-cyan-400 border-cyan-700/50"
                : formData.status === "MOCKUP_BUILT"
                ? "bg-purple-900/50 text-purple-400 border-purple-700/50"
                : formData.status === "EMAIL_SENT"
                ? "bg-amber-900/50 text-amber-400 border-amber-700/50"
                : formData.status === "PITCH_RESPONSE"
                ? "bg-emerald-900/50 text-emerald-400 border-emerald-700/50"
                : formData.status === "PROJECT_MOVED"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-red-900/50 text-red-400 border-red-700/50"
            }`}
          >
            {formData.status.replace("_", " ")}
          </span>
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
        {/* Business Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Business Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          ) : (
            <div className="text-sm font-semibold text-zinc-200 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800">
              {formData.businessName}
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Location
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          ) : (
            <div className="text-sm font-semibold text-zinc-200 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800">
              {formData.location}
            </div>
          )}
        </div>

        {/* Rating & Reviews */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Rating & Total Reviews
          </label>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
                placeholder="Rating"
              />
              <input
                type="number"
                value={formData.reviews}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reviews: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500"
                placeholder="Reviews"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-200 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold">{formData.rating}</span>
              <span className="text-zinc-500 text-xs">
                ({formData.reviews} verified reviews)
              </span>
            </div>
          )}
        </div>

        {/* Original Scraped Website URL */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Original Website (Scraped)
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.websiteUrl}
              onChange={(e) =>
                setFormData({ ...formData, websiteUrl: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          ) : (
            <div className="text-sm text-zinc-200 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800 truncate">
              {formData.websiteUrl}
            </div>
          )}
        </div>

        {/* New Deployed Preview URL (Vercel) */}
        <div>
          <label className="block text-xs font-medium text-amber-400 mb-1 flex items-center justify-between">
            <span>New Deployed URL (Vercel / Staging)</span>
            {formData.deployedPreviewUrl && !isEditing && (
              <a
                href={
                  formData.deployedPreviewUrl.startsWith("http")
                    ? formData.deployedPreviewUrl
                    : `https://${formData.deployedPreviewUrl}`
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
              value={formData.deployedPreviewUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, deployedPreviewUrl: e.target.value })
              }
              placeholder="https://my-demo-lead.vercel.app"
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-amber-500/50 rounded-xl text-amber-300 placeholder-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
            />
          ) : (
            <div className="text-sm bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl text-amber-300 font-mono flex items-center justify-between truncate">
              <span>{formData.deployedPreviewUrl || "No Vercel demo deployed yet"}</span>
            </div>
          )}
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Contact Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={formData.contactEmail || ""}
              onChange={(e) =>
                setFormData({ ...formData, contactEmail: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-200 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800 truncate">
              <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>{formData.contactEmail || "Not specified"}</span>
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-200 bg-zinc-850/60 px-3 py-2 rounded-xl border border-zinc-800 truncate">
              <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>{formData.phone || "Not specified"}</span>
            </div>
          )}
        </div>

        {/* Mobile App Capability Switch */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Mobile App Status
          </label>
          <div className="flex items-center justify-between bg-zinc-850/60 px-3.5 py-2 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-zinc-300">
                Has Dedicated Mobile App
              </span>
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    hasMobileApp: !formData.hasMobileApp,
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  formData.hasMobileApp ? "bg-amber-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    formData.hasMobileApp ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            ) : (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  formData.hasMobileApp
                    ? "bg-indigo-900/50 text-indigo-300 border border-indigo-700/40"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {formData.hasMobileApp ? "Available" : "No App"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Summary / Technical Deployment Notes Box */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-500" />
          <span>Project & Deployment Summary (Essential Reminders)</span>
        </label>
        {isEditing ? (
          <textarea
            rows={3}
            value={formData.summary || ""}
            onChange={(e) =>
              setFormData({ ...formData, summary: e.target.value })
            }
            className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-amber-500/40 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
            placeholder="Deployment host (e.g. Vercel), repository link, DNS configs, or key client constraints..."
          />
        ) : (
          <div className="p-3 bg-zinc-950/90 border border-amber-500/20 rounded-xl text-xs text-zinc-300 min-h-[64px] whitespace-pre-wrap leading-relaxed">
            {formData.summary || "No deployment summary or config notes logged yet."}
          </div>
        )}
      </div>

      {/* Large Text Area for Pitch Response History / Notes */}
      <div className="pt-1">
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Pitch Response History / Outreach Notes
        </label>
        {isEditing ? (
          <textarea
            rows={3}
            value={formData.pitchNotes}
            onChange={(e) =>
              setFormData({ ...formData, pitchNotes: e.target.value })
            }
            className="w-full px-3.5 py-2.5 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            placeholder="Log notes, client responses, or meeting remarks..."
          />
        ) : (
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-300 min-h-[72px] whitespace-pre-wrap leading-relaxed">
            {formData.pitchNotes || "No notes logged for this lead yet."}
          </div>
        )}
      </div>
    </Modal>
  );
}
