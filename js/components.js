// Add a status flag
window.CONFIG_READY = false;

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
            window.CONFIG_READY = true; // Set flag to true
            window.dispatchEvent(new Event('configLoaded'));
        }
    } catch (e) {
        console.error("Critical error in loadGlobalConfig:", e);
    }
}

function getSiteConfig(key) {
    return (window.SITE_CONFIG && window.SITE_CONFIG[key]) ? window.SITE_CONFIG[key] : '';
}

function populateUI() {
    // Check our new flag instead of checking the object itself
    if (!window.CONFIG_READY) {
        console.log("Config not ready, retrying...");
        setTimeout(populateUI, 300); // Retry slightly slower to allow data to land
        return;
    }

    console.log("Populating UI with:", window.SITE_CONFIG);

    // Footer Address
    const footerAddr = document.getElementById('display-address');
    if (footerAddr) {
        footerAddr.innerHTML = `${getSiteConfig('addr_line1')},<br>${getSiteConfig('addr_line2')},<br>${getSiteConfig('addr_line3')} (${getSiteConfig('state')}) - ${getSiteConfig('zip')}`;
    }

    // Tiles (ID Mapping)
    const elements = {
        'display-short-address': 'short_address',
        'display-timings': 'timings',
        'display-phone': 'phone'
    };

    Object.keys(elements).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const val = getSiteConfig(elements[id]);
            if (val) el.textContent = val;
        }
    });

    // Links
    const mapLink = document.getElementById('map-link');
    if (mapLink && getSiteConfig('maps_url')) mapLink.setAttribute('href', getSiteConfig('maps_url'));

    const callLink = document.getElementById('call-link');
    if (callLink && getSiteConfig('phone')) {
        callLink.setAttribute('href', `tel:${getSiteConfig('phone').replace(/[^0-9+]/g, '')}`);
    }

    const waLink = document.getElementById('whatsapp-link');
    if (waLink && getSiteConfig('whatsapp_number')) {
        waLink.setAttribute('href', `https://wa.me/${getSiteConfig('whatsapp_number').replace(/[^0-9]/g, '')}?text=Hi, I am inquiring about CGS.`);
    }
}

// Ensure init happens
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalConfig();
    populateUI(); 
});
