"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useId, MouseEvent, useEffect, useCallback } from "react";

/* ─── Sizes ─── */
const MAX_W = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
} as const;

type MaxWidth = keyof typeof MAX_W;

/* ─── Props ─── */
interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  icon?: ReactNode;
  maxWidth?: MaxWidth;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  scrollable?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/* ─── Corner ornament ─── */
function CornerOrnament({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const rotations = { tl: "0", tr: "90", bl: "270", br: "180" };
  const positions = {
    tl: "top-0 left-0",
    tr: "top-0 right-0",
    bl: "bottom-0 left-0",
    br: "bottom-0 right-0",
  };

  return (
    <div className={`absolute ${positions[position]} pointer-events-none`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        style={{ transform: `rotate(${rotations[position]}deg)` }}
      >
        <path
          d="M2 2 L12 2 L8 6 L2 6 Z"
          fill="rgba(201,162,39,0.12)"
          stroke="rgba(201,162,39,0.2)"
          strokeWidth="0.5"
        />
        <path
          d="M2 2 L2 12 L6 8 L6 2 Z"
          fill="rgba(201,162,39,0.08)"
          stroke="rgba(201,162,39,0.15)"
          strokeWidth="0.5"
        />
        <circle cx="3" cy="3" r="1.5" fill="rgba(201,162,39,0.25)" />
      </svg>
    </div>
  );
}

/* ─── Overlay + Container ─── */
function BaseModal({
  open,
  onClose,
  title,
  icon,
  maxWidth = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  scrollable = true,
  children,
  footer,
  className = "",
}: BaseModalProps) {
  const titleId = useId();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) onClose();
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleEscape]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={`relative w-full ${MAX_W[maxWidth]} max-h-[85vh] flex flex-col rounded-2xl border border-[rgba(201,162,39,0.15)] bg-gradient-to-br from-[#0B0F1A] to-[#151a24] shadow-[0_0_40px_rgba(201,162,39,0.06),0_25px_50px_rgba(0,0,0,0.5)] overflow-hidden ${className}`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Corner ornaments */}
            <CornerOrnament position="tl" />
            <CornerOrnament position="tr" />
            <CornerOrnament position="bl" />
            <CornerOrnament position="br" />

            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")` }} />

            {/* Header */}
            {title && (
              <div className="relative flex items-center justify-between px-6 py-4 border-b border-[rgba(201,162,39,0.1)]">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(201,162,39,0.1)] border border-[rgba(201,162,39,0.2)]">
                      {icon}
                    </div>
                  )}
                  <h2 id={titleId} className="font-cinzel text-base md:text-lg font-bold text-[#d4af37] tracking-wide">
                    {title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Fechar"
                  className="flex items-center justify-center w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* No-title close button */}
            {!title && (
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Body */}
            <div
              className={`relative flex-1 overflow-y-auto px-6 py-5 ${scrollable ? "scrollbar-gold" : ""}`}
              style={scrollable ? { scrollbarGutter: "stable" } : undefined}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="relative flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(201,162,39,0.1)]">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Sub-components ─── */

function Header({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center gap-3 mb-4 ${className}`}>{children}</div>;
}

function IconCircle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(201,162,39,0.1)] border border-[rgba(201,162,39,0.2)] shrink-0 ${className}`}>
      {children}
    </div>
  );
}

function Body({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function Footer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center justify-end gap-3 ${className}`}>{children}</div>;
}

function PrimaryButton({ children, onClick, disabled, className = "", type = "button" }: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-11 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] hover:from-[#e8c84a] hover:to-[#e8c84a] disabled:from-white/10 disabled:via-white/10 disabled:to-white/10 disabled:text-white/30 text-[#0a0a0a] text-sm font-bold uppercase tracking-wider font-cinzel transition-all duration-300 shadow-[0_2px_12px_rgba(212,175,55,0.25)] hover:shadow-[0_2px_20px_rgba(212,175,55,0.4)] disabled:shadow-none flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, className = "" }: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 text-sm font-bold uppercase tracking-wider font-cinzel transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

function DangerButton({ children, onClick, className = "" }: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold uppercase tracking-wider font-cinzel transition-all duration-200 shadow-[0_2px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_2px_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

/* ─── Attach sub-components ─── */
BaseModal.Header = Header;
BaseModal.IconCircle = IconCircle;
BaseModal.Body = Body;
BaseModal.Footer = Footer;
BaseModal.PrimaryButton = PrimaryButton;
BaseModal.SecondaryButton = SecondaryButton;
BaseModal.DangerButton = DangerButton;

export default BaseModal;
