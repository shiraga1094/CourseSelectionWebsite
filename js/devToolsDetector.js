// 偵測開發者工具
(function() {
    // 檢查開發者權限（在 localStorage 中設置）
    const isDeveloper = () => {
        return localStorage.getItem('devMode') === 'enabled';
    };
    
    // 如果是開發者模式，直接返回
    if (isDeveloper()) {
        console.log('開發者模式已啟用');
        return;
    }
    
    let devtoolsOpen = false;
    const threshold = 160;
    
    const detectDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            }
        } else {
            devtoolsOpen = false;
        }
    };
    
    // 每秒檢查
    setInterval(detectDevTools, 1000);
    
    // 阻止右鍵
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // 阻止 F12
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
            window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        }
    });
})();

// 開發者可以在 網址列 輸入以下指令啟用開發者模式：
// javascript:localStorage.setItem('devMode','enabled');location.reload();
// 然後重新整理頁面

// 關閉開發者模式：
// localStorage.removeItem('devMode')
