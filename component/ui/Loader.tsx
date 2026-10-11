// File: component/ui/Loader.tsx
"use client";

import React from "react";
import "./loader.scss";

export type LoaderProps = {
  /** Size variant for the spinner */
  size?: "sm" | "md" | "lg";
  /** Optional message or status text shown beneath spinner */
  label?: string;
  /** Optional secondary subtitle text */
  sublabel?: string;
  /** Expands loader to take full height of parent container */
  fullPage?: boolean;
  /** Extra CSS class name */
  className?: string;
};

export function Loader({
  size = "md",
  label,
  sublabel,
  fullPage = false,
  className = "",
}: LoaderProps) {
  const classes = [
    "app-loader",
    `app-loader--${size}`,
    fullPage ? "app-loader--full-page" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="status" aria-live="polite">
      <div className="app-loader__spinner-wrapper" aria-hidden="true">
        <span className="app-loader__ring" />
        <span className="app-loader__pulse-dot" />
      </div>

      {(label || sublabel) && (
        <div className="app-loader__content">
          {label && <span className="app-loader__label">{label}</span>}
          {sublabel && <span className="app-loader__sublabel">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}

export default Loader;
