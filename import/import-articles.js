const { main } = require("./import-substack");

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
