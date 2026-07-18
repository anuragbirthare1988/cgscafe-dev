window.CONFIG_READY = false;

async function loadGlobalConfig() {
    // Wait for Supabase client
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
            return;
        }

        if (data) {
            window.SITE_CONFIG = {};
            data.forEach(item => { window.SITE_CONFIG[item.key] = item.value; });
            window.CONFIG_READY = true;
            console.log("Config loaded successfully.");
            window.dispatchEvent(new Event('configLoaded'));
        }
    } catch (e) {
        console.error("Critical Config Load Error:", e);
    }
}

function populateUI() {
    // If not ready, stop (the event listener will trigger this again later)
    if (!window.CONFIG_READY) return;

    console.log("Populating UI elements...");

    // A. Footer Address
    const footerAddr = document.getElementById('display-address');
    if (footerAddr && window.SITE_CONFIG['addr_line1']) {
        footerAddr.innerHTML = `${window.SITE_CONFIG['addr_line1']},<br>${window.SITE_CONFIG['addr_line2']},<br>${window.SITE_CONFIG['addr_line3']} (${window.SITE_CONFIG['state']}) - ${window.SITE_CONFIG['zip']}`;
    }

    // B. Tiles
    const elements = {
        'display-short-address': 'short_address',
        'display-timings': 'timings',
        'display-phone': 'phone'
    };

    Object.keys(elements).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const val = window.SITE_CONFIG[elements[id]];
            if (val) el.textContent = val;
        } else {
            console.warn(`Element with ID '${id}' not found in DOM.`);
        }
    });

    // C. Links
    const mapLink = document.getElementById('map-link');
    if (mapLink && window.SITE_CONFIG['maps_url']) mapLink.setAttribute('href', window.SITE_CONFIG['maps_url']);

    const callLink = document.getElementById('call-link');
    if (callLink && window.SITE_CONFIG['phone']) {
        callLink.setAttribute('href', `tel:${window.SITE_CONFIG['phone'].replace(/[^0-9+]/g, '')}`);
    }

    const waLink = document.getElementById('whatsapp-link');
    if (waLink && window.SITE_CONFIG['whatsapp_number']) {
        waLink.setAttribute('href', `https://wa.me/${window.SITE_CONFIG['whatsapp_number'].replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20inquiring%20about%20CGS.`);
    }
}

// 1. Listen for the custom event
window.addEventListener('configLoaded', populateUI);

// 2. Initial trigger
loadGlobalConfig();

// 3. Safety Fallback: Populate if data arrives after DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (window.CONFIG_READY) populateUI();
});
