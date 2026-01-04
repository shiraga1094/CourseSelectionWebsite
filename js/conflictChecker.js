// 檢查衝突
function checkNewCourseConflict(newCourse) {
    const newTimeInfo = parseTimeToSchedule(newCourse["地點時間"]);
    if (!newTimeInfo) return [];
    
    const conflicts = [];
    selectedCourses.forEach(existingCourse => {
        const existingTimeInfo = parseTimeToSchedule(existingCourse["地點時間"]);
        if (!existingTimeInfo) return;
        
        if (newTimeInfo.day === existingTimeInfo.day) {
            const hasOverlap = newTimeInfo.slots.some(slot => 
                existingTimeInfo.slots.includes(slot)
            );
            if (hasOverlap) conflicts.push(existingCourse);
        }
    });
    
    return conflicts;
}

// 標記衝突課程
function highlightConflictCourses(conflictCourses) {
    conflictCourses.forEach(course => {
        const timeInfo = parseTimeToSchedule(course["地點時間"]);
        if (!timeInfo) return;
        
        const { day, slots } = timeInfo;
        slots.forEach(slot => {
            const cell = document.querySelector(`.schedule-cell[data-day="${day}"][data-slot="${slot}"]`);
            if (cell) {
                cell.classList.add('has-conflict');
                cell.querySelectorAll('.schedule-course').forEach(courseDiv => {
                    courseDiv.classList.add('conflict');
                });
            }
        });
    });
}

// 顯示衝突通知
function showConflictNotice(message) {
    const notice = document.getElementById('conflictNotice');
    const messageEl = document.getElementById('conflictMessage');
    
    messageEl.textContent = message;
    notice.style.display = 'flex';
    
    playErrorSound();
    
    setTimeout(() => closeConflictNotice(), 5000);
}

// 播放錯誤音效
function playErrorSound() {
    const audio = document.getElementById('errorSound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(err => console.log('音效播放失敗:', err));
    }
}

// 關閉衝突通知
function closeConflictNotice() {
    const notice = document.getElementById('conflictNotice');
    if (notice) notice.style.display = 'none';
    
    document.querySelectorAll('.schedule-cell.has-conflict').forEach(cell => {
        cell.classList.remove('has-conflict');
    });
    document.querySelectorAll('.schedule-course.conflict').forEach(course => {
        course.classList.remove('conflict');
    });
}
