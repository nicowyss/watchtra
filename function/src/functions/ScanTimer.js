// watchtra/function/src/functions/ScanTimer.js
const { runScan } = require("../../../webapp/app/scripts/scan");

module.exports = async function (context, myTimer) {
  context.log("Timer function started.");

  try {
    const results = await runScan();
    context.log(`✅ Scan completed successfully. Total users: ${results.userResults.total}`);
  } catch (err) {
    context.log.error("❌ Scan failed:", err);
  }

  context.log("Timer function finished.");
};
