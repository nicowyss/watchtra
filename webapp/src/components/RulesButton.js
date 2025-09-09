import React, { useState } from "react";
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

  const renderTable = (rulesObj) => (
    <table className="table table--striped table--hover">
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
            <td>{Array.isArray(value.allowed) ? value.allowed.join(", ") : ""}</td>
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
            <h3>Organization Rules</h3>

            {rules ? (
              <>
                <h4>Member Rules</h4>
                {renderTable(rules.members)}

                <h4>Guest Rules</h4>
                {renderTable(rules.guests)}
              </>
            ) : (
              <p>No rules found. Using default local values.</p>
            )}

            <button
              className="button button--outline mt-4"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
