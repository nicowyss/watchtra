const { runScan } = require("../app/scripts/scan");

module.exports = async function (context, req) {
  const timestamp = new Date().toISOString();
  context.log(`⏰ scanTimer (m-fetch) executed at ${timestamp}`);

  try {
    const results = await runScan();
    context.log("✅ Scan completed successfully");
    context.res = {
      status: 200,
      body: results
    };
  } catch (err) {
    context.log.error("❌ Scan failed:", err.message);
    context.res = {
      status: 500,
      body: { error: err.message }
    };
  }
};
