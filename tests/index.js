const path = require("path");
const { execSync } = require("child_process");

// Get the test file argument from command line
const testFile = process.argv[2];

if (!testFile) {
  console.error("Please provide a test file name");
  process.exit(1);
}

// Construct the full path to the test file
const testFilePath = path.join(__dirname, testFile);

execSync(`npx jest ${testFilePath}`, { stdio: "inherit" });
