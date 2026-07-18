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
    if (!window.SITE_CONFIG) {
        console.warn("populateUI called, but window.SITE_CONFIG is empty!");
        return;
    }

    console.log("Populating UI with data:", window.SITE_CONFIG);

    requestAnimationFrame(() => {
        // 1. Footer Address
        document.querySelectorAll('[id="display-address"]').forEach(el => {
            el.innerHTML = `${window.SITE_CONFIG['addr_line1'] || ''},<br>${window.SITE_CONFIG['addr_line2'] || ''},<br>${window.SITE_CONFIG['addr_line3'] || ''} (${window.SITE_CONFIG['state'] || ''}) - ${window.SITE_CONFIG['zip'] || ''}`;
        });
        // 2. Other fields
        const elements = {
            'display-short-address': window.SITE_CONFIG['short_address'],
            'display-timings': window.SITE_CONFIG['timings'],
            'display-phone': window.SITE_CONFIG['phone']
        };

        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                console.log(`Injecting into ${id}:`, elements[id]);
                el.innerText = elements[id] || "DATA_MISSING";
            } else {
                console.warn(`Could not find element: ${id}`);
            }
        });
    });
}
// 3. Execution
window.addEventListener('configLoaded', populateUI);
document.addEventListener('DOMContentLoaded', loadGlobalConfig);
window.populateUI = populateUI;
