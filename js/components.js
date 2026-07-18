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

    requestAnimationFrame(() => {
        // 1. Footer Address (Full)
        const footerEl = document.getElementById('display-address');
        if (footerEl) {
            footerEl.innerHTML = `${window.SITE_CONFIG['addr_line1'] || ''},<br>${window.SITE_CONFIG['addr_line2'] || ''},<br>${window.SITE_CONFIG['addr_line3'] || ''} (${window.SITE_CONFIG['state'] || ''}) - ${window.SITE_CONFIG['zip'] || ''}`;
        }

        // 2. Tiles & Simple Fields
        const elements = {
            'display-short-address': window.SITE_CONFIG['short_address'],
            'display-timings': window.SITE_CONFIG['timings'],
            'display-phone': window.SITE_CONFIG['phone']
        };

        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = elements[id] || "";
        });

        // 3. Links & Interactive Elements
        const mapLink = document.getElementById('map-link');
        if (mapLink && window.SITE_CONFIG['maps_url']) {
            mapLink.setAttribute('href', window.SITE_CONFIG['maps_url']);
        }

        const callLink = document.getElementById('call-link');
        if (callLink && window.SITE_CONFIG['phone']) {
            callLink.setAttribute('href', `tel:${window.SITE_CONFIG['phone'].replace(/[^0-9+]/g, '')}`);
        }

        const waLink = document.getElementById('whatsapp-link');
        if (waLink && window.SITE_CONFIG['whatsapp_number']) {
            waLink.setAttribute('href', `https://wa.me/${window.SITE_CONFIG['whatsapp_number'].replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20inquiring%20about%20CGS.`);
        }
    });
}
// 3. Execution
window.addEventListener('configLoaded', populateUI);
document.addEventListener('DOMContentLoaded', loadGlobalConfig);
window.populateUI = populateUI;
