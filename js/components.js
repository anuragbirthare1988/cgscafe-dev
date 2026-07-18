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
        window.dispatchEvent(new Event('configLoaded'));
    }
}

// 2. Populate UI (Revised for Persistence)
function populateUI() {
    if (!window.SITE_CONFIG) return;

    // A. Footer Address (Full)
    const footerEl = document.getElementById('display-address');
    if (footerEl && footerEl.innerHTML.trim() === "") {
        footerEl.innerHTML = `${window.SITE_CONFIG['addr_line1'] || ''},<br>${window.SITE_CONFIG['addr_line2'] || ''},<br>${window.SITE_CONFIG['addr_line3'] || ''} (${window.SITE_CONFIG['state'] || ''}) - ${window.SITE_CONFIG['zip'] || ''}`;
    }

    // B. Tiles & Simple Fields
    const elements = {
        'display-short-address': window.SITE_CONFIG['short_address'],
        'display-timings': window.SITE_CONFIG['timings'],
        'display-phone': window.SITE_CONFIG['phone']
    };

    Object.keys(elements).forEach(id => {
        const el = document.getElementById(id);
        if (el && el.innerText.trim() === "") {
            el.innerText = elements[id] || "";
        }
    });

    // C. Links
    const mapLink = document.getElementById('map-link');
    if (mapLink) mapLink.setAttribute('href', window.SITE_CONFIG['maps_url'] || '#');

    const callLink = document.getElementById('call-link');
    if (callLink) callLink.setAttribute('href', `tel:${(window.SITE_CONFIG['phone'] || '').replace(/[^0-9+]/g, '')}`);

    const waLink = document.getElementById('whatsapp-link');
    if (waLink) waLink.setAttribute('href', `https://wa.me/${(window.SITE_CONFIG['whatsapp_number'] || '').replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20inquiring%20about%20CGS.`);
}

// 3. The Observer (Prevents content from staying empty if components reload)
const observer = new MutationObserver(() => {
    if (window.CONFIG_READY) populateUI();
});
observer.observe(document.body, { childList: true, subtree: true });

// 4. Execution
window.addEventListener('configLoaded', populateUI);
document.addEventListener('DOMContentLoaded', loadGlobalConfig);
window.populateUI = populateUI;
