import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export function getDeployStatus() {
  try {
    const commit = execSync("git rev-parse HEAD").toString().trim();

    const html = fs.readFileSync(
      path.join(process.cwd(), "dist/index.html"),
      "utf-8",
    );

    const match = html.match(/index-([A-Za-z0-9_-]+)\.js/);
    const build = match ? `index-${match[1]}.js` : null;

    return {
      commit,
      build,
      status: "ok",
      time: new Date().toISOString(),
    };
  } catch (e) {
    return {
      status: "error",
      error: e.message,
    };
  }
}
