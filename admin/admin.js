window.onload = async () => {
    if (!(await requireLogin())) return;
    
    // Check if ADMIN_MODULES is loaded to prevent the ReferenceError
    if (typeof ADMIN_MODULES !== 'undefined') {
        renderDashboard();
    } else {
        console.error("Dashboard data (ADMIN_MODULES) failed to load.");
    }
};

function renderDashboard() {
    const grid = document.getElementById('admin-grid');
    grid.innerHTML = ADMIN_MODULES.map(mod => `
        <div class="tile" onclick="location.href='${mod.url}'">
            <div class="icon">${mod.icon}</div>
            <div>
                <h2>${mod.title}</h2>
                <p>${mod.subtitle}</p>
            </div>
        </div>
    `).join('');
}
