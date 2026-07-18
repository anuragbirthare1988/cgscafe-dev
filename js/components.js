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

    // 1. Footer Address
    const footerAddr = document.getElementById('display-address');
    if (footerAddr) {
        footerAddr.innerHTML = `${getSiteConfig('addr_line1')},<br>${getSiteConfig('addr_line2')},<br>${getSiteConfig('addr_line3')} (${getSiteConfig('state')}) - ${getSiteConfig('zip')}`;
    }

    // 2. Simple Tile Text Elements
    const elements = {
        'display-short-address': 'short_address',
        'display-timings': 'timings',
        'display-phone': 'phone'
    };

    Object.keys(elements).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = getSiteConfig(elements[id]);
    });

    // 3. Dynamic Links (Refined)
    // Map Link
    const mapLink = document.getElementById('map-link');
    if (mapLink) mapLink.setAttribute('href', getSiteConfig('maps_url'));

    // Call Link (Clean the phone number for the tel: protocol)
    const phoneRaw = getSiteConfig('phone').replace(/[^0-9+]/g, ''); // Removes dashes/spaces
    const callLink = document.getElementById('call-link');
    if (callLink) callLink.setAttribute('href', `tel:${phoneRaw}`);

    // WhatsApp Link
    const waLink = document.getElementById('whatsapp-link');
    if (waLink) {
        const waNum = getSiteConfig('whatsapp_number').replace(/[^0-9]/g, ''); // Ensure only digits
        waLink.setAttribute('href', `https://wa.me/${waNum}?text=Hi, I am inquiring about CGS.`);
    }

    console.log("Global UI components populated.");
}
// Ensure this runs when config is loaded
window.addEventListener('configLoaded', populateUI);

// Use 'DOMContentLoaded' to ensure the page is ready before running
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalConfig();
});
