import React, { useState } from "react";
import { updateData } from "../utils/updateData";
import styles from "../pages/index.module.css"; // reuse your page styles

export default function UpdateButton() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await updateData(setProgress);
    } catch (err) {
      console.error("Failed to trigger update:", err);
      alert("Failed to trigger update.");
    } finally {
      setLoading(false);
      setProgress(0); // reset progress after reload
    }
  };

  return (
<div className={styles.updateContainer}>
      {/* Progress Overlay */}
      <div
        className={styles.progressOverlay}
        style={{ width: `${progress}%` }}
      />
      {/* Button */}
      <button
        className="button button--secondary button--block"
        onClick={handleClick}
        disabled={loading}
      >
        {loading || progress > 0 ? (
          <>
            Updating…
            <span className={styles.spinner}></span>
          </>
        ) : (
          "🔄 Update Data"
        )}
      </button>
    </div>
  );
}
