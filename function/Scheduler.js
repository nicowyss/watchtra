// Scheduler.js
const { app } = require('@azure/functions');
const { runScan } = require("./app/scripts/scan");   // adjust path

app.timer('Scheduler', {
    // every 5 minutes for testing
    schedule: '0 */5 * * * *',
    runOnStartup: true,
    handler: async (myTimer, context) => {
        const timeStamp = new Date().toISOString();
        context.log('⏰ Scheduler function triggered at', timeStamp);
        try {
            const results = await runScan();
            context.log("✅ Scan finished successfully", results);
        } catch (err) {
            context.log.error("❌ Scan failed:", err.message);
        }
    }
});
