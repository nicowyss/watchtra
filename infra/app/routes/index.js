const express = require("express");
const { runScan } = require("../scan");
const { fetchDynamicGroups } = require("../groups"); 
const { fetchAuditLogs } = require("../../shared/audit-logic");
const router = express.Router();



// GET / -> serve the main dashboard page
router.get("/", (req, res) => {
  res.render("index", { title: "WatchTra Dashboard" });
});

// GET /scan -> fetch users, validate, save findings
router.get("/scan", async (req, res) => {
  try {
    const result = await runScan(); // calls your scan.js
    res.json({
      success: true,
      totalUsers: result.total,
      issuesFound: result.issues,
      findings: result.findings,
    });
  } catch (err) {
    console.error("Error running scan:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/groups", async (req, res) => {
  try {
    const groups = await fetchDynamicGroups();
    res.json({ success: true, groups });
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /audit-logs -> fetch logs from Graph & return
router.get("/audit-logs", async (req, res) => {
  try {
    const logs = await fetchAuditLogs();
    res.json({ success: true, logs });
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
