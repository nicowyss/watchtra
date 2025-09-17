// app/scheduler.js
const cron = require("node-cron");
const { runScan } = require("./scripts/scan");
const { formatDate } = require("../src/utils/formatDate");


// Schedule: "0 * * * *" → every hour at minute 0
// Schedule: every minute: "* * * * *"
// Schedule: every day at midnight: "0 0 * * *"
// (e.g., 13:00, 14:00, 15:00 ...)
cron.schedule("* * * * *", async () => {
  console.log("⏰ Running scheduled scan at", formatDate(new Date()));
  try {
    await runScan();
    console.log("✅ Scan finished successfully");
  } catch (err) {
    console.error("❌ Scan failed:", err.message);
  }
});

// Optional: run once immediately on startup
(async () => {
  console.log("▶ Initial scan starting...");
  try {
    await runScan();
    console.log("✅ Initial scan finished");
  } catch (err) {
    console.error("❌ Initial scan failed:", err.message);
  }
})();
