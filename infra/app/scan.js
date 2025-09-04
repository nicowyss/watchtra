const { runScan } = require("../shared/scan-logic");

if (require.main === module) {
  runScan().then((res) => console.log(res));
}

module.exports = { runScan };
