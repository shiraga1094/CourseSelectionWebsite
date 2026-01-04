// 建立系所選單
function buildDeptOptions() {
    const depts = new Set();
    excelData.forEach(r => {
        const dept = r["系所"];
        if (dept && dept.trim() !== "") depts.add(dept.trim());
    });
    
    const select = document.getElementById("filterDept");
    Array.from(depts).sort().forEach(dept => {
        const option = document.createElement("option");
        option.value = dept;
        option.textContent = dept;
        select.appendChild(option);
    });
}

// 建立課表表格
function buildScheduleTable() {
    const schedule = document.getElementById("schedule");
    const days = ["一", "二", "三", "四", "五", "六"];
    const slots = [
        { code: "00", time: "07:10-08:00" },
        { code: "01", time: "08:10-09:00" },
        { code: "02", time: "09:10-10:00" },
        { code: "03", time: "10:20-11:10" },
        { code: "04", time: "11:20-12:10" },
        { code: "05", time: "12:20-13:10" },
        { code: "06", time: "13:20-14:10" },
        { code: "07", time: "14:20-15:10" },
        { code: "08", time: "15:30-16:20" },
        { code: "09", time: "16:30-17:20" },
        { code: "10", time: "17:30-18:20" },
        { code: "A", time: "18:40-19:30" },
        { code: "B", time: "19:35-20:25" },
        { code: "C", time: "20:30-21:20" },
        { code: "D", time: "21:25-22:15" },
    ];
    
    let html = '<table style="table-layout: fixed;"><thead><tr><th>節次</th>';
    days.forEach(day => html += `<th>星期${day}</th>`);
    html += '</tr></thead><tbody>';
    
    slots.forEach(slot => {
        html += `<tr><td class="time-label">${slot.code}<br><small>${slot.time}</small></td>`;
        days.forEach(day => {
            html += `<td class="schedule-cell" data-day="${day}" data-slot="${slot.code}"></td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    schedule.innerHTML = html;
}

// 渲染搜尋結果
function render() {
    const kw = document.getElementById("search").value.trim();
    const filterDept = document.getElementById("filterDept").value;
    const filterReq = document.getElementById("filterReq").value;
    const filterDay = document.getElementById("filterDay").value;
    
    const result = document.getElementById("result");
    result.innerHTML = "";

    const list = excelData.filter(r => {
        if (kw && !(r["中文課程名稱"] || "").includes(kw) && !(r["開課代碼"] || "").includes(kw)) return false;
        if (filterDept && (r["系所"] || "") !== filterDept) return false;
        if (filterReq && (r["必/選"] || "") !== filterReq) return false;
        if (filterDay && !(r["地點時間"] || "").includes(filterDay)) return false;
        return true;
    });

    if (list.length === 0) {
        result.innerHTML = '<div class="error">查無符合的課程</div>';
        return;
    }

    list.forEach(r => {
        const div = document.createElement("div");
        div.className = "course";

        const courseName = r["中文課程名稱"] || "未命名課程";
        const courseCode = r["開課代碼"] || "無代碼";
        const dept = r["系所"] || "";
        const teacher = r["教師"] || "";
        const req = r["必/選"] || "";
        const credits = r["學分"] || "0";
        const limit = r["限修條件"] || "無";
        
        const zu = (r["組"] || "").toString().trim();
        const year = (r["年"] || "").toString().trim();
        const ban = (r["班"] || "").toString().trim();
        let groupParts = [];
        if (zu) groupParts.push(zu);
        if (year) groupParts.push(year);
        if (ban) groupParts.push(ban);
        const group = groupParts.length > 0 ? groupParts.join(" ") : "無";
        
        const time = parseSlot(r["地點時間"] || "");

        const isSaved = savedCourses.some(c => c["開課代碼"] === courseCode);
        if (isSaved) div.classList.add('added');

        div.innerHTML = `
            <div><strong>${courseName}</strong> (${courseCode})</div>
            <div class="tag">${dept}</div>
            <div class="tag">${req === "必" ? "📕 必修" : "📘 選修"}</div>
            <div class="tag">📚 ${credits}學分</div>
            <div class="tag">${time}</div>
            <div>教師：${teacher}</div>
            <div>限修條件：${limit}</div>
            <div>組年班：${group}</div>
        `;
        
        div.addEventListener('click', () => {
            if (isSaved) {
                removeSaved(courseCode);
            } else {
                addToSaved(r);
            }
        });

        result.appendChild(div);
    });
}

// 渲染儲藏區
function renderSaved() {
    const container = document.getElementById('selectedCourses');
    
    const totalCredits = selectedCourses.reduce((sum, course) => {
        return sum + parseFloat(course["學分"] || 0);
    }, 0);
    
    let creditColor = totalCredits < 16 ? 'red' : totalCredits > 27 ? 'yellow' : 'green';
    
    container.innerHTML = `
        <div class="credit-summary" style="background: ${creditColor === 'red' ? '#ffebee' : creditColor === 'yellow' ? '#fff9c4' : '#e8f5e9'}; padding: 10px; border-radius: 5px; margin-bottom: 10px; text-align: center; border: 2px solid ${creditColor === 'red' ? '#f44336' : creditColor === 'yellow' ? '#fbc02d' : '#4CAF50'};">
            <div style="font-weight: bold; font-size: 14px; color: #333;">總學分</div>
            <div style="font-size: 24px; font-weight: bold; color: ${creditColor === 'red' ? '#d32f2f' : creditColor === 'yellow' ? '#f57f17' : '#2e7d32'};">${totalCredits}</div>
        </div>
    `;
    
    savedCourses.forEach(course => {
        const div = document.createElement('div');
        div.className = 'selected-course';
        
        const code = course["開課代碼"];
        const isSelected = selectedCourses.some(c => c["開課代碼"] === code);
        
        if (isSelected) div.classList.add('active');
        
        const courseName = course["中文課程名稱"] || "";
        const teacher = course["教師"] || "";
        const dept = course["系所"] || "";
        const credits = course["學分"] || "0";
        const time = parseSlot(course["地點時間"] || "");
        
        div.innerHTML = `
            <button class="remove-btn" onclick="removeSaved('${code}')">✕</button>
            <div class="course-title">${courseName}</div>
            <div class="course-detail">${dept}</div>
            <div class="course-detail">${teacher}</div>
            <div class="course-detail">📚 ${credits}學分</div>
            <div class="course-detail">${time}</div>
        `;
        
        div.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) return;
            toggleSelected(code);
        });
        
        container.appendChild(div);
    });
}

// 渲染課表
function renderSchedule() {
    document.querySelectorAll('.schedule-cell').forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('has-conflict');
    });
    
    const conflictCells = new Set();
    const cellCourseCount = {};
    
    selectedCourses.forEach(course => {
        const timeInfo = parseTimeToSchedule(course["地點時間"]);
        if (!timeInfo) return;
        
        const { day, slots } = timeInfo;
        slots.forEach(slot => {
            const cellKey = `${day}-${slot}`;
            if (!cellCourseCount[cellKey]) cellCourseCount[cellKey] = [];
            cellCourseCount[cellKey].push(course["開課代碼"]);
        });
    });
    
    Object.keys(cellCourseCount).forEach(cellKey => {
        if (cellCourseCount[cellKey].length > 1) {
            conflictCells.add(cellKey);
        }
    });
    
    const renderedCourses = new Set();
    
    selectedCourses.forEach(course => {
        const courseCode = course["開課代碼"];
        if (renderedCourses.has(courseCode)) return;
        renderedCourses.add(courseCode);
        
        const timeInfo = parseTimeToSchedule(course["地點時間"]);
        if (!timeInfo) return;
        
        const { day, slots } = timeInfo;
        
        slots.forEach(slot => {
            const cellKey = `${day}-${slot}`;
            const cell = document.querySelector(`.schedule-cell[data-day="${day}"][data-slot="${slot}"]`);
            
            if (cell) {
                if (conflictCells.has(cellKey)) {
                    cell.classList.add('has-conflict');
                }
                
                const courseDiv = document.createElement('div');
                courseDiv.className = 'schedule-course';
                courseDiv.innerHTML = `
                    <div class="course-name">${course["中文課程名稱"] || ""}</div>
                    <div class="course-info">${course["教師"] || ""}</div>
                `;
                
                cell.appendChild(courseDiv);
            }
        });
    });
}
