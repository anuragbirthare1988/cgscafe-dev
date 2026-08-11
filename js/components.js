window.CONFIG_READY = false;

// 1. Load Data
async function loadGlobalConfig() {
    if (typeof supabaseClient === 'undefined') {
        setTimeout(loadGlobalConfig, 100);
        return;
    }

    const { data, error } = await supabaseClient
        .from('site_settings')
        .select('key, value');

    if (error) {
        console.error("Supabase Error:", error);
    } else if (data) {
        window.SITE_CONFIG = {};
        data.forEach(item => { window.SITE_CONFIG[item.key] = item.value; });
        window.CONFIG_READY = true;
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
        // 1. Text Fields
        const textMap = {
            '.display-short-address': 'short_address',
            '.display-timings': 'timings',
            '.display-phone': 'phone'
        };

        Object.keys(textMap).forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.innerText = window.SITE_CONFIG[textMap[selector]] || "";
            });
        });

        // Special handling for Address block (Multiple locations)
        document.querySelectorAll('.display-address').forEach(el => {
            el.innerHTML = `${window.SITE_CONFIG['addr_line1'] || ''}<br>${window.SITE_CONFIG['addr_line2'] || ''}<br>${window.SITE_CONFIG['addr_line3'] || ''} (${window.SITE_CONFIG['state'] || ''}) - ${window.SITE_CONFIG['zip'] || ''}`;
        });

        // 2. Interactive Links
        // WhatsApp Link Binding with Validation
        document.querySelectorAll('.whatsapp-link').forEach(link => {
            const rawNumber = window.SITE_CONFIG['whatsapp_number'];
            
            // Check if the number exists and has actual digits beyond just the country code/symbols
            if (!rawNumber || rawNumber.replace(/[^0-9]/g, '').length <= 2) {
                link.style.display = 'none'; // Hide the element if empty/invalid
            } else {
                link.style.display = ''; // Ensure it's visible if valid
                const rawMessage = window.SITE_CONFIG['whatsapp_message'] || "Hi, I am inquiring about CGS.";
                const encodedMsg = encodeURIComponent(rawMessage);
                link.setAttribute('href', `https://wa.me/${rawNumber.replace(/[^0-9]/g, '')}?text=${encodedMsg}`);
            }
        });

        // Phone/Call Link Binding with Validation
        document.querySelectorAll('.call-link').forEach(link => {
            const rawPhone = window.SITE_CONFIG['phone'];
            
            if (!rawPhone || rawPhone.replace(/[^0-9]/g, '').length <= 2) {
                link.style.display = 'none'; // Hide the element if empty/invalid
            } else {
                link.style.display = '';
                link.setAttribute('href', `tel:${rawPhone.replace(/[^0-9+]/g, '')}`);
            }
        });

        document.querySelectorAll('.map-link').forEach(link => {
            if (window.SITE_CONFIG['maps_url']) {
                link.setAttribute('href', window.SITE_CONFIG['maps_url']);
            }
        });

        // Reveal the info bar smoothly once populated
        document.querySelectorAll('.info-bar__inner').forEach(bar => {
            bar.classList.add('is-loaded');
        });
    });
}

// 3. Execution
window.addEventListener('configLoaded', populateUI);
document.addEventListener('DOMContentLoaded', loadGlobalConfig);
window.populateUI = populateUI;
