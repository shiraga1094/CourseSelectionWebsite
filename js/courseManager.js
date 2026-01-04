// 加入儲藏區
function addToSaved(course) {
    const code = course["開課代碼"];
    if (savedCourses.some(c => c["開課代碼"] === code)) return;
    
    savedCourses.push(course);
    saveToStorage();
    renderSaved();
    render();
}

// 從儲藏區移除
function removeSaved(code) {
    savedCourses = savedCourses.filter(c => c["開課代碼"] !== code);
    selectedCourses = selectedCourses.filter(c => c["開課代碼"] !== code);
    saveToStorage();
    renderSaved();
    renderSchedule();
    render();
}

// 切換選課狀態
function toggleSelected(code) {
    const course = savedCourses.find(c => c["開課代碼"] === code);
    if (!course) return;
    
    const index = selectedCourses.findIndex(c => c["開課代碼"] === code);
    
    if (index >= 0) {
        selectedCourses.splice(index, 1);
        closeConflictNotice();
    } else {
        const conflicts = checkNewCourseConflict(course);
        if (conflicts.length > 0) {
            const conflictNames = conflicts.map(c => c["中文課程名稱"]).join('、');
            showConflictNotice(`無法選課！此課程與「${conflictNames}」時間衝突，請先取消衝突課程。`);
            highlightConflictCourses(conflicts);
            return;
        }
        selectedCourses.push(course);
        closeConflictNotice();
    }
    
    saveToStorage();
    renderSaved();
    renderSchedule();
}

// 清空儲藏區
function clearSelected() {
    if (confirm('確定要清空儲藏區嗎？')) {
        savedCourses = [];
        selectedCourses = [];
        saveToStorage();
        renderSaved();
        renderSchedule();
        render();
    }
}

// 清除所有資料
function clearAllData() {
    if (confirm('確定要清除所有儲存的資料嗎？')) {
        localStorage.removeItem('savedCourses');
        localStorage.removeItem('selectedCourses');
        savedCourses = [];
        selectedCourses = [];
        renderSaved();
        renderSchedule();
        render();
        closeConflictNotice();
    }
}
