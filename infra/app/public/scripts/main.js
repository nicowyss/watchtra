document.addEventListener("DOMContentLoaded", () => {
  /**
   * -------------------
   * USER SCAN SECTION
   * -------------------
   */
  const scanBtn = document.getElementById("scanBtn");
  const totalUsersEl = document.getElementById("totalUsers");
  const issuesCountEl = document.getElementById("issuesCount");
  const tableEl = document.getElementById("usersTable");

  // Tabulator for users
  let table = new Tabulator(tableEl, {
    layout: "fitData",
    pagination: "local",
    paginationSize: 25,
    placeholder: "No users scanned yet",
    columns: [
      { title: "Name", field: "name" },
      { title: "User Type", field: "userType" },
      { title: "Company", field: "companyName" },
      { title: "Department", field: "department" },
      { title: "Office Location", field: "officeLocation" },
      { title: "City", field: "city" },
      { title: "Country", field: "country" },
      { title: "Issues", field: "issues" },
      { title: "Timestamp", field: "timestamp" },
    ],
  });

  async function fetchScan() {
    scanBtn.disabled = true;
    scanBtn.textContent = "Scanning...";
    try {
      const res = await fetch("/scan");
      const data = await res.json();

      if (data.success) {
        totalUsersEl.textContent = data.totalUsers;
        issuesCountEl.textContent = data.issuesFound;

        const now = new Date().toLocaleString();
        document.getElementById("lastScan").textContent = `Last scan: ${now}`;

        const rows = data.findings.map(f => ({
          name: f.name,
          userType: f.userType || "Member",
          companyName: f.issues.companyName || "",
          department: f.issues.department || "",
          officeLocation: f.issues.officeLocation || "",
          city: f.issues.city || "",
          country: f.issues.country || "",
          issues: Object.entries(f.issues)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", "),
          timestamp: f.timestamp,
        }));

        table.setData(rows);
      } else {
        alert("Scan failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching scan.");
    } finally {
      scanBtn.disabled = false;
      scanBtn.textContent = "Run Scan";
    }
  }

  scanBtn.addEventListener("click", fetchScan);
  fetchScan(); // run on page load


  /**
   * -------------------
   * GROUPS SECTION
   * -------------------
   */
  const groupsBtn = document.getElementById("groupsBtn");
  const groupsTableEl = document.getElementById("groupsTable");

  let groupsTable = new Tabulator(groupsTableEl, {
    layout: "fitData",
    placeholder: "No groups loaded yet",
    columns: [
      { title: "Group Name", field: "name" },
      { title: "Member Count", field: "memberCount" },
      { title: "Membership Rule", field: "membershipRule" },
    ],
  });

  async function fetchGroups() {
    groupsBtn.disabled = true;
    groupsBtn.textContent = "Loading...";
    try {
      const res = await fetch("/groups");
      const data = await res.json();

      if (data.success) {
        groupsTable.setData(data.groups);
      } else {
        alert("Failed to load groups: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error loading groups.");
    } finally {
      groupsBtn.disabled = false;
      groupsBtn.textContent = "Load Groups";
    }
  }

  groupsBtn.addEventListener("click", fetchGroups);
  fetchGroups();


  /**
   * -------------------
   * AUDIT LOGS SECTION
   * -------------------
   */
  const auditBtn = document.getElementById("auditBtn");
  const auditTableEl = document.getElementById("auditTable");

  let auditTable = new Tabulator(auditTableEl, {
    layout: "fitData",
    placeholder: "No logs loaded yet",
    columns: [
      { title: "Timestamp", field: "timestamp" },
      { title: "Activity", field: "activity" },
      { title: "Initiated By", field: "initiatedBy" },
      { title: "Target", field: "target" },
      { title: "Details", field: "details" },
    ],
  });

  async function fetchAuditLogs() {
    auditBtn.disabled = true;
    auditBtn.textContent = "Loading...";
    try {
      const res = await fetch("/audit-logs");
      const data = await res.json();

      if (data.success) {
        auditTable.setData(data.logs);
      } else {
        alert("Failed to load audit logs: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error loading audit logs.");
    } finally {
      auditBtn.disabled = false;
      auditBtn.textContent = "Load Audit Logs";
    }
  }

  auditBtn.addEventListener("click", fetchAuditLogs);
});
