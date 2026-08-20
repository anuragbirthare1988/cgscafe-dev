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

        // Phone/Call Link Binding with Validation, and Correct Dialing Prefix
        document.querySelectorAll('.call-link').forEach(link => {
            const rawPhone = window.SITE_CONFIG['phone'];
            const cleanDigits = rawPhone ? rawPhone.replace(/[^0-9]/g, '') : '';
            
            // Check if we have at least 10 digits to work with
            if (!rawPhone || cleanDigits.length < 10) {
                link.style.display = 'none'; // Hide if invalid
            } else {
                link.style.display = '';
                
                // 1. Ensure the tel: attribute always has the proper '+' prefix for international/local routing
                let dialNumber = cleanDigits;
                if (dialNumber.length === 10) {
                    // If it's strictly 10 digits, prepend India's country code with a plus
                    dialNumber = '+91' + dialNumber;
                } else if (dialNumber.length > 10 && !dialNumber.startsWith('+')) {
                    // If it has a country code like 91 but no '+', prepend the '+'
                    dialNumber = '+' + dialNumber;
                }
                link.setAttribute('href', `tel:${dialNumber}`);
                
                // 2. Always grab the last 10 digits to strip out any country code for visual display
                const tenDigits = cleanDigits.slice(-10);
                
                // 3. Format into your exact layout: 999 - 37 - 38 - 851
                const formatted = `${tenDigits.slice(0, 3)} - ${tenDigits.slice(3, 5)} - ${tenDigits.slice(5, 7)} - ${tenDigits.slice(7)}`;
                
                // 4. Update ONLY the inner span so the SVG phone icon stays intact
                const phoneSpan = link.querySelector('.display-phone');
                if (phoneSpan) {
                    phoneSpan.textContent = formatted;
                } else {
                    // Fallback or if you are using it on buttons like "Call Us Directly"
                    const textNode = link.querySelector('span:not(.display-phone)') || link;
                    // If it's just a general link without a span, you can handle text here if needed
                }
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
