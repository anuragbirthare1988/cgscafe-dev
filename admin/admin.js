window.onload = async () => {
    if (!(await requireLogin())) return;
    renderDashboard();
};

function renderDashboard() {
    const grid = document.getElementById('admin-grid');
    grid.innerHTML = ADMIN_MODULES.map(mod => `
        <div class="tile" onclick="location.href='${mod.url}'">
            <div style="font-size: 2.5rem; margin-bottom: 15px;">${mod.icon}</div>
            <h2>${mod.title}</h2>
            <p>${mod.subtitle}</p>
        </div>
    `).join('');
}
