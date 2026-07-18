/**
 * Global Configuration & UI Management for CGS Cafe
 */

// 1. Fetch data from Supabase
async function loadGlobalConfig() {
    if (typeof defaultSupabaseClient === 'undefined') {
        // Wait if Supabase is still loading
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
            // Dispatch event so UI knows data is ready
            window.dispatchEvent(new Event('configLoaded'));
        }
    } catch (e) {
        console.error("Critical error in loadGlobalConfig:", e);
    }
}

// 2. Safely retrieve values
function getSiteConfig(key) {
    return window.SITE_CONFIG ? (window.SITE_CONFIG[key] || '') : '';
}

// 3. Populate UI with retry mechanism to prevent "Loading..." hanging
function populateUI() {
    // Retry if data hasn't arrived yet
    if (!window.SITE_CONFIG) {
        setTimeout(populateUI, 200);
        return;
    }

    // A. Footer Address
    const footerAddr = document.getElementById('display-address');
    if (footerAddr) {
        footerAddr.innerHTML = `${getSiteConfig('addr_line1')},<br>${getSiteConfig('addr_line2')},<br>${getSiteConfig('addr_line3')} (${getSiteConfig('state')}) - ${getSiteConfig('zip')}`;
    }

    // B. Tiles
    const elements = {
        'display-short-address': 'short_address',
        'display-timings': 'timings',
        'display-phone': 'phone'
    };

    Object.keys(elements).forEach(id => {
        const el = document.getElementById(id);
        const val = getSiteConfig(elements[id]);
        if (el && val) el.textContent = val;
    });

    // C. Dynamic Links
    const mapLink = document.getElementById('map-link');
    if (mapLink) {
        const url = getSiteConfig('maps_url');
        if (url) mapLink.setAttribute('href', url);
    }

    const callLink = document.getElementById('call-link');
    if (callLink) {
        const phone = getSiteConfig('phone');
        if (phone) {
            // Clean phone: keep only numbers and +
            const phoneRaw = phone.replace(/[^0-9+]/g, '');
            callLink.setAttribute('href', `tel:${phoneRaw}`);
        }
    }

    const waLink = document.getElementById('whatsapp-link');
    if (waLink) {
        const waNum = getSiteConfig('whatsapp_number');
        if (waNum) {
            // Clean waNum: keep only numbers
            const cleanWa = waNum.replace(/[^0-9]/g, '');
            waLink.setAttribute('href', `https://wa.me/${cleanWa}?text=Hi,%20I%20am%20inquiring%20about%20CGS.`);
        }
    }

    console.log("Global UI components fully populated.");
}

// 4. Initialization
window.addEventListener('configLoaded', populateUI);

document.addEventListener('DOMContentLoaded', () => {
    loadGlobalConfig();
    // Also trigger attempt to populate (in case config was already loaded)
    populateUI();
});
