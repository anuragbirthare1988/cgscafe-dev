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
        document.dispatchEvent(new Event('configDataReady'));
    }
}

// 2. Persistent Populator
function startPersistentPopulator() {
    if (!window.SITE_CONFIG) return;

    const updateUI = () => {
        // A. Footer Address (innerHTML for line breaks)
        const footerAddr = document.getElementById('display-address');
        if (footerAddr && footerAddr.innerHTML.trim() === "") {
            const addr = `${window.SITE_CONFIG['addr_line1'] || ''},<br>${window.SITE_CONFIG['addr_line2'] || ''},<br>${window.SITE_CONFIG['addr_line3'] || ''} (${window.SITE_CONFIG['state'] || ''}) - ${window.SITE_CONFIG['zip'] || ''}`;
            footerAddr.innerHTML = addr;
            console.log("Injected Footer Address");
        }

        // B. Tiles Mapping
        const tileMap = {
            'display-short-address': window.SITE_CONFIG['short_address'],
            'display-timings': window.SITE_CONFIG['timings'],
            'display-phone': window.SITE_CONFIG['phone']
        };

        Object.keys(tileMap).forEach(id => {
            const el = document.getElementById(id);
            if (el && el.textContent.trim() === "") {
                el.textContent = tileMap[id] || "";
                console.log("Injected Tile:", id);
            }
        });

        // C. Links (These are not empty tags, so we update them directly)
        const mapLink = document.getElementById('map-link');
        if (mapLink && window.SITE_CONFIG['maps_url']) mapLink.setAttribute('href', window.SITE_CONFIG['maps_url']);

        const callLink = document.getElementById('call-link');
        if (callLink && window.SITE_CONFIG['phone']) {
            callLink.setAttribute('href', `tel:${window.SITE_CONFIG['phone'].replace(/[^0-9+]/g, '')}`);
        }
    };

    // Run immediately
    updateUI();

    // Watch for DOM changes to re-inject if framework wipes elements
    const observer = new MutationObserver(updateUI);
    observer.observe(document.body, { childList: true, subtree: true });
}

// 3. Trigger
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalConfig();
    document.addEventListener('configDataReady', startPersistentPopulator);
});
