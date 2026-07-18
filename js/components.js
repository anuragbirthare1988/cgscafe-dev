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

    // Update Footer safely
    const footerAddr = document.getElementById('display-address');
    if (footerAddr) {
        footerAddr.innerHTML = `${window.SITE_CONFIG.address_street || ''}<br>${window.SITE_CONFIG.address_area || ''}`;
    }
}

// 1. Listen for the event
window.addEventListener('configLoaded', updateUIComponents);

// 2. Start the fetch
loadGlobalConfig();
