const { app } = require('@azure/functions');
const { runScan } = require("../../../shared/scan-logic");

app.timer('ScanTimer', {
    schedule: '0 */1 * * * *', // 1 min for testing, later 0 0 */4 * * *
    handler: async (myTimer, context) => {
        const timeStamp = new Date().toISOString();
        try {
            const result = await runScan();
            context.log(`✅ Scan completed at ${timeStamp}`);
            context.log(`Total Users: ${result.total}, Issues: ${result.issues}`);
        } catch (err) {
            context.log.error(`❌ Scan failed at ${timeStamp}: ${err.message}`);
        }
    }
});
