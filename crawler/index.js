import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchAll } from "./fetch.js";

// ===== 路徑：以檔案位置為基準（不會漂）=====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.join(__dirname, "..", "data");

// ===== 確保 data/ 存在 =====
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const YEAR = 113;
  const TERM = 1;

  const { courses, denseMap } = await fetchAll(YEAR, TERM);

  fs.writeFileSync(
    path.join(OUT_DIR, "courses.json"),
    JSON.stringify(courses, null, 2),
    "utf8"
  );

  fs.writeFileSync(
    path.join(OUT_DIR, "dense.json"),
    JSON.stringify(denseMap, null, 2),
    "utf8"
  );

  console.log(`done: ${courses.length} rows`);
  console.log(`written to: ${OUT_DIR}`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});

