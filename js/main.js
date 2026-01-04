// 全域變數
let deptMap = {};
let excelData = [];
let savedCourses = [];
let selectedCourses = [];

// 主程式
async function main() {
    deptMap = await loadDepartment();
    excelData = await loadExcel();

    if (excelData.length > 0) {
        buildDeptOptions();
        buildScheduleTable();
        
        document.getElementById("search").addEventListener("input", render);
        document.getElementById("filterDept").addEventListener("change", render);
        document.getElementById("filterReq").addEventListener("change", render);
        document.getElementById("filterDay").addEventListener("change", render);
        document.getElementById("clearBtn").addEventListener("click", clearSelected);
        document.getElementById("resetBtn").addEventListener("click", clearAllData);
        
        loadFromStorage();
        render();
    }
}

main();
