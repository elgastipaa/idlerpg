import React from "react";

export default function ActionToast({ toast = null, isMobile = false }) {
  if (!toast?.message) return null;
  return (
    <div className={["action-toast", isMobile ? "action-toast--mobile" : ""].filter(Boolean).join(" ")} data-tone={toast.tone || "success"}>
      <div className="action-toast__card">
        <div className="action-toast__eyebrow">
          Accion aplicada
        </div>
        <div className="action-toast__message">
          {toast.message}
        </div>
      </div>
    </div>
  );
}
