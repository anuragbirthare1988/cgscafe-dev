async function loadGlobalConfig() {
    if (typeof defaultSupabaseClient === 'undefined') {
        setTimeout(loadGlobalConfig, 100);
        return;
    }

    try {
        const { data, error } = await defaultSupabaseClient
            .from('site_settings')
            .select('key, value');

        if (error) {
            console.error("Supabase Query Error:", error);
        } else if (!data || data.length === 0) {
            console.warn("No data found in 'site_settings'.");
        } else {
            window.SITE_CONFIG = {};
            data.forEach(item => {
                window.SITE_CONFIG[item.key] = item.value;
            });
            window.dispatchEvent(new Event('configLoaded'));
        }
    } catch (e) {
        console.error("Critical error in loadGlobalConfig:", e);
    }
}

function updateUIComponents() {
    if (!window.SITE_CONFIG) return;

    const footerAddr = document.getElementById('display-address');
    if (footerAddr) {
        const l1 = window.SITE_CONFIG.addr_line1 || '';
        const l2 = window.SITE_CONFIG.addr_line2 || '';
        const city = window.SITE_CONFIG.addr_line3 || '';
        const state = window.SITE_CONFIG.state || '';
        const zip = window.SITE_CONFIG.zip || '';

        footerAddr.innerHTML = `${l1},<br>${l2},<br>${city} - ${zip}, ${state}`;
    }
}

// 1. Listen for the event
window.addEventListener('configLoaded', updateUIComponents);

// 2. Start the fetch
loadGlobalConfig();
