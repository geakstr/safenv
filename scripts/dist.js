const path = require("path");
const { exec } = require("child_process");

const args = process.argv.slice(2);
const pkg = args[0];

exec(
  `node ./scripts/build ${pkg} && cd packages/${pkg} && npm publish --access=public dist`,
  { cwd: path.resolve(__dirname, "../") },
  (error, stdout, stderr) => {
    if (error) {
      console.error("error", error);
    }
    if (stdout) {
      console.log("stdout", stdout);
    }
    if (stderr) {
      console.error("stderr", stderr);
    }
  }
);
