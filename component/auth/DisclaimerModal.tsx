// File: component/auth/DisclaimerModal.tsx
"use client";

import { useEffect, useState } from "react";
import "./disclaimer-modal.scss";

type DisclaimerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
};

export function DisclaimerModal({
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
}: DisclaimerModalProps) {
  const [agreed, setAgreed] = useState(false);

  // Reset agreement state and lock body scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      setAgreed(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="disclaimer-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="disclaimer-modal">
        {/* Header */}
        <div className="disclaimer-modal__header">
          <div className="disclaimer-modal__header-content">
            <div className="disclaimer-modal__eyebrow">
              <span className="disclaimer-modal__eyebrow-icon" aria-hidden="true">
                ⚠️
              </span>
              <span>Mandatory Compliance</span>
            </div>
            <h2 id="disclaimer-modal-title" className="disclaimer-modal__title">
              IMPORTANT NOTICE &amp; DISCLAIMER
            </h2>
            <p className="disclaimer-modal__subtitle">
              Please read carefully before registering.
            </p>
          </div>
          <button
            type="button"
            className="disclaimer-modal__close-btn"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close disclaimer modal"
          >
            ×
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="disclaimer-modal__body">
          <p>
            All information, materials, tools, and resources provided on this platform are intended strictly for educational and informational purposes. They are provided to help users gain knowledge, develop their understanding, and make informed decisions.
          </p>

          <p className="disclaimer-modal__highlight">
            By registering and using this platform, you acknowledge and agree that you will not use any information, resources, or services provided here for fraudulent, deceptive, illegal, or unauthorized activities, including scams, financial fraud, impersonation, or any other unlawful purpose.
          </p>

          <p>
            Users are solely responsible for how they use the information and resources provided. STREETIO does not authorize, encourage, or accept responsibility for any misuse of its platform, content, or services.
          </p>

          <p>
            By proceeding with registration, you confirm that you have read, understood, and agreed to comply with this disclaimer and all applicable laws and regulations.
          </p>
        </div>

        {/* Mandatory Agreement Checkbox */}
        <div className="disclaimer-modal__agreement">
          <label className="disclaimer-modal__checkbox-label" htmlFor="disclaimer-checkbox">
            <input
              id="disclaimer-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isPending}
            />
            <span>I have read, understood, and agree to the above Disclaimer.</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="disclaimer-modal__footer">
          <button
            type="button"
            className="disclaimer-modal__cancel-btn"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="disclaimer-modal__confirm-btn"
            onClick={onConfirm}
            disabled={!agreed || isPending}
          >
            {isPending ? (
              <>
                <span className="disclaimer-modal__spinner" aria-hidden="true" />
                <span>Creating account…</span>
              </>
            ) : (
              <span>I Agree &amp; Sign Up</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerModal;
