window.CONFIG_READY = false;

// 1. Load Data
async function loadGlobalConfig() {
    if (typeof defaultSupabaseClient === 'undefined') {
        setTimeout(loadGlobalConfig, 100);
        return;
    }

    const { data, error } = await defaultSupabaseClient
        .from('site_settings')
        .select('key, value');

    if (error) {
        console.error("Supabase Error:", error);
    } else if (data) {
        window.SITE_CONFIG = {};
        data.forEach(item => { window.SITE_CONFIG[item.key] = item.value; });
        window.CONFIG_READY = true;
        console.log("Config loaded into memory:", window.SITE_CONFIG);
        // Dispatch to trigger populate
        window.dispatchEvent(new Event('configLoaded'));
    }
}

// 2. Populate UI
function populateUI() {
    if (!window.SITE_CONFIG) return;
    console.log("Attempting to populate DOM...");

    // Helper to update elements safely
    const update = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = val || "";
            console.log("Updated ID:", id, "with:", val);
        } else {
            console.warn("Could not find element with ID:", id);
        }
    };

    // A. Footer
    const footerAddr = document.getElementById('display-address');
    if (footerAddr) {
        footerAddr.innerHTML = `${window.SITE_CONFIG['addr_line1'] || ''},<br>${window.SITE_CONFIG['addr_line2'] || ''},<br>${window.SITE_CONFIG['addr_line3'] || ''} (${window.SITE_CONFIG['state'] || ''}) - ${window.SITE_CONFIG['zip'] || ''}`;
    }

    // B. Tiles
    update('display-short-address', window.SITE_CONFIG['short_address']);
    update('display-timings', window.SITE_CONFIG['timings']);
    update('display-phone', window.SITE_CONFIG['phone']);
    console.log("PHONE NUMBER IS :: ", window.SITE_CONFIG['phone']);

    // C. Links
    if (window.SITE_CONFIG['maps_url']) document.getElementById('map-link')?.setAttribute('href', window.SITE_CONFIG['maps_url']);
    if (window.SITE_CONFIG['phone']) document.getElementById('call-link')?.setAttribute('href', `tel:${window.SITE_CONFIG['phone'].replace(/[^0-9+]/g, '')}`);
    if (window.SITE_CONFIG['whatsapp_number']) document.getElementById('whatsapp-link')?.setAttribute('href', `https://wa.me/${window.SITE_CONFIG['whatsapp_number'].replace(/[^0-9]/g, '')}?text=Hi`);
}

// 3. Execution
window.addEventListener('configLoaded', populateUI);
document.addEventListener('DOMContentLoaded', loadGlobalConfig);
