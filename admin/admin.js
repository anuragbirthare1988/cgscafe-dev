window.onload = async () => {
    if (!(await requireLogin())) return;
    renderDashboard();
};

function renderDashboard() {
    const grid = document.getElementById('admin-grid');
    grid.innerHTML = ADMIN_MODULES.map(mod => `
        <div class="tile ${mod.active ? 'active' : ''}" onclick="location.href='${mod.url}'">
            <h2>${mod.icon} ${mod.title}</h2>
            <p>${mod.subtitle || 'Coming Soon'}</p>
        </div>
    `).join('');
}
