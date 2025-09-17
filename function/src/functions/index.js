const { runScan } = require("../../app/scripts/scan");

module.exports = async function (context, myTimer) {
    const timeStamp = new Date().toISOString();
    context.log('⏰ Scheduler function triggered at', timeStamp);

    try {
        const results = await runScan();
        context.log("✅ Scan finished successfully", results);
    } catch (err) {
        context.log.error("❌ Scan failed:", err.message);
    }
};
