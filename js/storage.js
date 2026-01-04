// 儲存到 localStorage
function saveToStorage() {
    localStorage.setItem('savedCourses', JSON.stringify(savedCourses));
    localStorage.setItem('selectedCourses', JSON.stringify(selectedCourses));
}

// 從 localStorage 載入
function loadFromStorage() {
    const saved1 = localStorage.getItem('savedCourses');
    const saved2 = localStorage.getItem('selectedCourses');
    
    if (saved1) {
        try { savedCourses = JSON.parse(saved1); } catch (e) { savedCourses = []; }
    }
    if (saved2) {
        try { selectedCourses = JSON.parse(saved2); } catch (e) { selectedCourses = []; }
    }
    
    renderSaved();
    renderSchedule();
}
