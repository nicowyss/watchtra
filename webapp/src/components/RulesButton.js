import React, { useState, useEffect } from "react";
import { getRules } from "../utils/getRules";
import styles from "../pages/index.module.css";

export default function RulesButton() {
  const [rules, setRules] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const loadedRules = await getRules();
      setRules(loadedRules);
      setOpen(true);
    } catch (err) {
      console.error("Failed to load rules:", err);
      alert("Failed to load rules. Falling back to local defaults.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ESC key closes the modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  const renderTable = (rulesObj) => (
    <table className={styles.rulesTable}>
      <thead>
        <tr>
          <th>Property</th>
          <th>Accepted Values</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(rulesObj).map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>
              {Array.isArray(value.allowed) ? value.allowed.join(", ") : ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <button
        className="button button--secondary button--block"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Loading..." : "Review your Organization Default Values"}
      </button>

      {open && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            {/* ✅ Sticky Header with Close button */}
            <div className={styles.modalHeader}>
              <h3>Organization Rules</h3>
              <button
                className={styles.closeButton}
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            {rules ? (
              <div className={styles.modalBody}>
                <h4>Member Rules</h4>
                {renderTable(rules.members)}

                <h4>Guest Rules</h4>
                {renderTable(rules.guests)}

                <a
                  href={`https://portal.azure.com/#view/Microsoft_Azure_StorageHub/StorageHub.MenuView/~/StorageAccountsBrowse`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--secondary button--block"
                >
                  View in Azure Portal
                </a>
              </div>
            ) : (
              <p>No rules found. Using default local values.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
