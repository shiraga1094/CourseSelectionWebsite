import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchAll } from "./fetch.js";

// ===== 路徑：以檔案位置為基準（不會漂）=====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

// ===== 確保 data/ 存在 =====
fs.mkdirSync(DATA_DIR, { recursive: true });

// ===== 自動抓取所有學期 =====
async function fetchAllSemesters() {
  const START_YEAR = 112;
  const START_TERM = 1;
  let consecutiveFailures = 0;
  const MAX_CONSECUTIVE_FAILURES = 3; // 連續3個學期抓不到就停止
  
  let year = START_YEAR;
  let term = START_TERM;
  let successCount = 0;
  let skipCount = 0;

  while (consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
    const semesterName = `${year}-${term}`;
    const outDir = path.join(DATA_DIR, semesterName);
    
    console.log(`\n[${semesterName}] 開始抓取...`);
    
    try {
      const { courses, denseMap } = await fetchAll(year, term);
      
      if (!courses || courses.length === 0) {
        console.log(`[${semesterName}] 沒有課程資料，跳過`);
        consecutiveFailures++;
        skipCount++;
      } else {
        // 建立學期目錄
        fs.mkdirSync(outDir, { recursive: true });
        
        // 儲存 courses.json
        fs.writeFileSync(
          path.join(outDir, "courses.json"),
          JSON.stringify(courses, null, 2),
          "utf8"
        );
        
        // 儲存 dense.json
        fs.writeFileSync(
          path.join(outDir, "dense.json"),
          JSON.stringify(denseMap, null, 2),
          "utf8"
        );
        
        console.log(`[${semesterName}] ✓ 成功抓取 ${courses.length} 門課程`);
        console.log(`[${semesterName}] 儲存至: ${outDir}`);
        
        consecutiveFailures = 0; // 重置失敗計數
        successCount++;
      }
    } catch (err) {
      console.error(`[${semesterName}] ✗ 錯誤: ${err.message}`);
      consecutiveFailures++;
      skipCount++;
    }
    
    // 移動到下一個學期
    // 學期順序: 1(上) -> 2(下) -> 3(暑) -> 下一學年的1
    if (term === 1) {
      term = 2;
    } else if (term === 2) {
      term = 3;
    } else {
      term = 1;
      year++;
    }
    
    // 防止過度請求
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n========== 抓取完成 ==========`);
  console.log(`成功: ${successCount} 個學期`);
  console.log(`跳過: ${skipCount} 個學期`);
  console.log(`資料儲存於: ${DATA_DIR}`);
}

(async () => {
  await fetchAllSemesters();
})().catch(err => {
  console.error(err);
  process.exit(1);
});

