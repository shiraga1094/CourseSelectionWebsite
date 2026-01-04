// 載入系所資料
async function loadDepartment() {
    try {
        const res = await fetch("data/Department.txt");
        if (!res.ok) throw new Error("無法載入 Department.txt");
        const text = await res.text();
        return JSON.parse(text);
    } catch (e) {
        console.error("載入系所失敗:", e);
        return {};
    }
}

// 載入 Excel 資料
async function loadExcel() {
    try {
        const res = await fetch("data/export.xlsx");
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        const buf = await res.arrayBuffer();
        const workbook = XLSX.read(buf, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        
        console.log(`Excel 載入成功: ${data.length} 筆資料`);
        return data;
    } catch (e) {
        console.error("載入 Excel 失敗:", e);
        document.getElementById("result").innerHTML = '<div class="error">載入資料失敗</div>';
        return [];
    }
}
