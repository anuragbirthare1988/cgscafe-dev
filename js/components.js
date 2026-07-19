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

    requestAnimationFrame(() => {
        // 1. Text Fields (Using Classes)
        const textFields = {
            '.display-address': 'addr_line1', // Note: Special handling below
            '.display-short-address': 'short_address',
            '.display-timings': 'timings',
            '.display-phone': 'phone'
        };

        // Update standard text fields
        Object.keys(textFields).forEach(className => {
            if (className === '.display-address') return; // Handled separately
            
            document.querySelectorAll(className).forEach(el => {
                el.innerText = window.SITE_CONFIG[textFields[className]] || "";
            });
        });

        // Special handling for the full address block
        document.querySelectorAll('.display-address').forEach(el => {
            el.innerHTML = `${window.SITE_CONFIG['addr_line1'] || ''},<br>${window.SITE_CONFIG['addr_line2'] || ''},<br>${window.SITE_CONFIG['addr_line3'] || ''} (${window.SITE_CONFIG['state'] || ''}) - ${window.SITE_CONFIG['zip'] || ''}`;
        });

        // 2. Interactive Links (Using Classes)
        
        // WhatsApp Links
        document.querySelectorAll('.whatsapp-link').forEach(link => {
            if (window.SITE_CONFIG['whatsapp_number']) {
                link.setAttribute('href', `https://wa.me/${window.SITE_CONFIG['whatsapp_number'].replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20inquiring%20about%20CGS.`);
            }
        });

        // Call Links
        document.querySelectorAll('.call-link').forEach(link => {
            if (window.SITE_CONFIG['phone']) {
                link.setAttribute('href', `tel:${window.SITE_CONFIG['phone'].replace(/[^0-9+]/g, '')}`);
            }
        });

        // Map Links
        document.querySelectorAll('.map-link').forEach(link => {
            if (window.SITE_CONFIG['maps_url']) {
                link.setAttribute('href', window.SITE_CONFIG['maps_url']);
            }
        });
    });
}

// 3. Execution
window.addEventListener('configLoaded', populateUI);
document.addEventListener('DOMContentLoaded', loadGlobalConfig);
window.populateUI = populateUI;
