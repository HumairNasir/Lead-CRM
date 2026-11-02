"use client";

import React, { useState } from "react";
import {
  Sliders,
  Key,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Activity,
  Zap,
  Radio,
  Server
} from "lucide-react";

export default function SettingsPage() {
  // Scraper & Fetch Configuration State
  const [searchRadius, setSearchRadius] = useState("10 km");
  const [reviewThreshold, setReviewThreshold] = useState("30 Reviews");
  const [leadScore, setLeadScore] = useState(60);
  const [noWebsiteScore, setNoWebsiteScore] = useState(60);
  const [autoDetectBrokenLinks, setAutoDetectBrokenLinks] = useState(true);
  const [auditMobile, setAuditMobile] = useState(true);
  const [auditMobileUrls, setAuditMobileUrls] = useState(false);

  // Integrations & Storage API Keys State
  const [googlePlacesKey, setGooglePlacesKey] = useState("AIzaSyB8x-PlacesApiKeySecret923");
  const [showGoogleKey, setShowGoogleKey] = useState(false);

  const [apifyToken, setApifyToken] = useState("apify_api_token_live_9981244");
  const [showApifyToken, setShowApifyToken] = useState(false);

  const [supabaseUrl, setSupabaseUrl] = useState("https://crm-supabase-prod.supabase.co");
  const [showSupabase, setShowSupabase] = useState(false);

  const [smtpConnector, setSmtpConnector] = useState("connector.saw.smtp.com");
  const [oauthConnector, setOauthConnector] = useState("connector oauth connector");
  const [webhookUrl, setWebhookUrl] = useState("https://www.webhook.um/webhook.url");

  // Save Status
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setSearchRadius("10 km");
    setReviewThreshold("30 Reviews");
    setLeadScore(60);
    setNoWebsiteScore(60);
    setAutoDetectBrokenLinks(true);
    setAuditMobile(true);
    setAuditMobileUrls(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry / Status Ribbon matching Screenshot #2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl text-[11px] text-zinc-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-500" />
            <span>13.247 nodes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-zinc-500" />
            <span>387.8 mps</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-zinc-500" />
            <span>0.30/s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-zinc-500" />
            <span>0.23 inp/s</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-300 font-mono">Cluster: Active (0.00% err)</span>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-2xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configuration saved successfully! API keys and scraper preferences are active.</span>
        </div>
      )}

      {/* 2-Column Configuration Grid matching Screenshot #2 */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Scraper & Fetch Configuration */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/80">
              <Sliders className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-zinc-100">
                Scraper & Fetch Configuration
              </h2>
            </div>

            {/* Default Search Radius */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Default Search Radius
              </label>
              <input
                type="text"
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.target.value)}
                placeholder="10 km"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Minimum Review Threshold */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Minimum Review Threshold
              </label>
              <input
                type="text"
                value={reviewThreshold}
                onChange={(e) => setReviewThreshold(e.target.value)}
                placeholder="30 Reviews"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Lead Prioritization / Scoring Score Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                <span>Lead Prioritization/Scoring Score</span>
                <span className="text-amber-400 font-bold">{leadScore}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={leadScore}
                onChange={(e) => setLeadScore(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>1</span>
                <span className="text-amber-500 font-bold">{leadScore}</span>
                <span>100</span>
              </div>
            </div>

            {/* No Website Threshold Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                <span>No Website Priority Score</span>
                <span className="text-amber-400 font-bold">{noWebsiteScore}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={noWebsiteScore}
                onChange={(e) => setNoWebsiteScore(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>1</span>
                <span className="text-amber-500 font-bold">{noWebsiteScore}</span>
                <span>100</span>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3 pt-2">
              {/* Auto-detect Broken Links */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Auto-detect Broken Links
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Ping target lead domains to identify 404s and SSL errors
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoDetectBrokenLinks(!autoDetectBrokenLinks)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    autoDetectBrokenLinks ? "bg-amber-500" : "bg-zinc-750"
                  }`}
                  aria-label="Toggle auto-detect broken links"
                >
                  <div
                    className={`bg-zinc-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      autoDetectBrokenLinks ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Audit Mobile Responsiveness */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Audit Mobile Responsiveness
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Perform headless viewport checks for mobile friendliness
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditMobile(!auditMobile)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    auditMobile ? "bg-amber-500" : "bg-zinc-750"
                  }`}
                  aria-label="Toggle audit mobile responsiveness"
                >
                  <div
                    className={`bg-zinc-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      auditMobile ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Audit Mobile Responsiveness Urls */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Audit Mobile Responsiveness Urls
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Deep crawl sub-pages for viewport conformity
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditMobileUrls(!auditMobileUrls)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    auditMobileUrls ? "bg-amber-500" : "bg-zinc-800"
                  }`}
                  aria-label="Toggle audit mobile responsiveness urls"
                >
                  <div
                    className={`bg-zinc-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      auditMobileUrls ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Integrations & Storage API Keys */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/80">
              <Key className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-zinc-100">
                Integrations & Storage API Keys
              </h2>
            </div>

            {/* Google Places API Key */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Google Places API Key
              </label>
              <div className="relative">
                <input
                  type={showGoogleKey ? "text" : "password"}
                  value={googlePlacesKey}
                  onChange={(e) => setGooglePlacesKey(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowGoogleKey(!showGoogleKey)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                  aria-label={showGoogleKey ? "Hide key" : "Show key"}
                >
                  {showGoogleKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Apify Actor Token */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Apify Actor Token
              </label>
              <div className="relative">
                <input
                  type={showApifyToken ? "text" : "password"}
                  value={apifyToken}
                  onChange={(e) => setApifyToken(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApifyToken(!showApifyToken)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                  aria-label={showApifyToken ? "Hide token" : "Show token"}
                >
                  {showApifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Supabase URL & Key */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Supabase URL & Key
              </label>
              <div className="relative">
                <input
                  type={showSupabase ? "text" : "password"}
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSupabase(!showSupabase)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                  aria-label={showSupabase ? "Hide key" : "Show key"}
                >
                  {showSupabase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SMTP Connector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                SMTP Connector
              </label>
              <input
                type="text"
                value={smtpConnector}
                onChange={(e) => setSmtpConnector(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* OAuth Connector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                OAuth Connector
              </label>
              <input
                type="text"
                value={oauthConnector}
                onChange={(e) => setOauthConnector(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Webhook Listener URLs */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Webhook Listener URLs
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions matching Screenshot #2 */}
        <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-98"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Settings</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-amber-500/50 hover:bg-amber-500/10 text-amber-400 font-semibold text-sm transition-all active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Default Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
