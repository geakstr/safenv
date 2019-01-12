const path = require("path");
const { exec } = require("child_process");

const args = process.argv.slice(2);
const pkg = args[0];

exec(
  `cd packages/${pkg} && rm -rf ./dist && mkdir ./dist && cp ./package*.json ./dist && ../../node_modules/.bin/rollup --config`,
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
