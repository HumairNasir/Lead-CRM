"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string; // e.g., 'max-w-xl', 'max-w-2xl'
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  headerAction,
  children,
  footer,
  maxWidth = "max-w-2xl",
}: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Close on ESC key and trap focus within modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
        return;
      }

      if (e.key === "Tab" && isOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);

      // Focus first element on open
      setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          firstFocusable?.focus();
        }
      }, 50);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      aria-modal="true"
      role="dialog"
    >
      {/* Dark semi-transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} bg-zinc-900 border-x border-zinc-800 border-t-2 border-b-2 border-amber-500 rounded-2xl shadow-2xl shadow-black/80 flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 fade-in duration-200 overflow-hidden`}
      >
        {/* Fixed Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-800/80 bg-zinc-900/90 shrink-0">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold text-zinc-100 tracking-tight">
                {title}
              </div>
              {headerAction}
            </div>
            {subtitle && (
              <div className="text-xs text-zinc-400 mt-0.5">{subtitle}</div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {children}
        </div>

        {/* Fixed Modal Footer (if provided) */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/90 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
