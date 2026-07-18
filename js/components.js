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

    // 1. Footer Address (3-line format)
    const footerAddr = document.getElementById('display-address');
    if (footerAddr) {
        footerAddr.innerHTML = `${getSiteConfig('addr_line1')},<br>${getSiteConfig('addr_line2')},<br>${getSiteConfig('addr_line3')} (${getSiteConfig('state')}) - ${getSiteConfig('zip')}`;
    }

    // 2. Sticky Header / Other Pages
    // Add the new shortcut address mapping
    const shortAddrEl = document.getElementById('display-short-address');
    if (shortAddrEl) {
        shortAddrEl.textContent = getSiteConfig('short_address');
    }
    // Simply select elements by ID on ANY page
    const phoneEl = document.getElementById('display-phone');
    if (phoneEl) phoneEl.textContent = getSiteConfig('phone');

    const timingEl = document.getElementById('display-timings');
    if (timingEl) timingEl.textContent = getSiteConfig('timings');
    
    console.log("Global UI components populated.");
}

// Ensure this runs when config is loaded
window.addEventListener('configLoaded', populateUI);

// Start the fetch
loadGlobalConfig().then(() => {
    populateUI();
});
