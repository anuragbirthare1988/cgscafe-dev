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

    // 1. Footer Address (Full 3-line format)
    const footerAddr = document.getElementById('display-address');
    if (footerAddr) {
        footerAddr.innerHTML = `${getSiteConfig('addr_line1')},<br>${getSiteConfig('addr_line2')},<br>${getSiteConfig('addr_line3')} (${getSiteConfig('state')}) - ${getSiteConfig('zip')}`;
    }

    // 2. Short Address (Tile)
    const shortAddrEl = document.getElementById('display-short-address');
    if (shortAddrEl) shortAddrEl.textContent = getSiteConfig('short_address');

    // 3. Timings (Tile)
    const timingEl = document.getElementById('display-timings');
    if (timingEl) timingEl.textContent = getSiteConfig('timings');

    // 4. Dynamic Links
    const phone = getSiteConfig('phone');
    
    // Call Link
    const callLink = document.getElementById('call-link');
    if (callLink) {
        callLink.setAttribute('href', `tel:${phone}`);
        const phoneEl = document.getElementById('display-phone');
        if (phoneEl) phoneEl.textContent = phone;
    }

    // WhatsApp Link
    const waLink = document.getElementById('whatsapp-link');
    if (waLink) {
        const waNum = getSiteConfig('whatsapp_number');
        waLink.setAttribute('href', `https://wa.me/${waNum}?text=Hi,%20I%20am%20inquiring%20about%20CGS.`);
    }

    // Map Link
    const mapLink = document.getElementById('map-link');
    if (mapLink) mapLink.setAttribute('href', getSiteConfig('maps_url'));

    console.log("All global UI components (including links) populated.");
}

// Ensure this runs when config is loaded
window.addEventListener('configLoaded', populateUI);

// Use 'DOMContentLoaded' to ensure the page is ready before running
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalConfig();
});
