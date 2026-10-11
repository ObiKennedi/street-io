// File: components/auth/PasswordField.tsx
"use client";

import { useId, useState } from "react";

type PasswordFieldProps = {
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  hint?: string;
  action?: React.ReactNode;
};

export function PasswordField({ name, label, autoComplete, minLength, hint, action }: PasswordFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-form__field">
      <div className="auth-form__label-row">
        <label htmlFor={id} className="auth-form__label">
          {label}
        </label>
        {action}
      </div>
      <div className="auth-form__password">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          className="auth-form__input"
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={128}
          required
          aria-describedby={hint ? hintId : undefined}
        />
        <button
          type="button"
          className="auth-form__reveal"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-controls={id}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {hint && (
        <p id={hintId} className="auth-form__hint">
          {hint}
        </p>
      )}
    </div>
  );
}