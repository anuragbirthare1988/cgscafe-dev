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

// Function to safely get config values
function getSiteConfig(key) {
    return window.SITE_CONFIG ? (window.SITE_CONFIG[key] || '') : '';
}

// Function to populate elements by ID
function populateUI() {
    if (!window.SITE_CONFIG) return;

    // Mapping of HTML IDs to Config Keys
    const mappings = {
        'display-address': 'addr_line1', // Footer
        'display-address-full': 'addr_line1', // Assuming this is your tile ID
        'display-phone': 'phone',
        'display-timings': 'timings',
        'display-short-address': 'short_address'
    };

    // Universal Updater
    Object.keys(mappings).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'display-address') {
                // Special 3-line format for Footer
                el.innerHTML = `${getSiteConfig('addr_line1')},<br>${getSiteConfig('addr_line2')},<br>${getSiteConfig('addr_line3')} (${getSiteConfig('state')}) - ${getSiteConfig('zip')}`;
            } else {
                el.textContent = getSiteConfig(mappings[id]);
            }
        }
    });

    console.log("Global UI components populated.");
}

// Ensure this runs when config is loaded
window.addEventListener('configLoaded', populateUI);

// Use 'DOMContentLoaded' to ensure the page is ready before running
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalConfig();
});
