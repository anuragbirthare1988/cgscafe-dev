function getCurrentEnvironment() {
    const host = window.location.hostname.toLowerCase();
    
    // 1. Only true production domains belong here (remove dev.cgscafe.in from this list)
    const productionDomains = ["cgscafe.in", "www.cgscafe.in"];
    if (productionDomains.includes(host)) {
        return "production";
    }

    const parts = host.split('.');
    if (parts.length > 2) {
        const sub = parts[0];
        if (sub === 'qa') return 'qa';
        if (sub === 'uat') return 'uat';
        if (sub === 'staging') return 'staging';
        if (sub === 'dev') return 'development'; // Ensures dev.cgscafe.in maps to development
    }

    // 3. Default fallback for local testing
    return "development";
}

const ENVIRONMENTS = {
    development: {
        url: 'https://aastenbsntpdxknonyyr.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhc3RlbmJzbnRwZHhrbm9ueXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjk4MTEsImV4cCI6MjA5NzgwNTgxMX0.C0lfo9Xawq5jvDetw1V-fozdr2jkfwB2Ulk3JMyBhps'
    },
    qa: {
        url: 'https://YOUR_QA_PROJECT_REF.supabase.co',
        anonKey: 'YOUR_QA_KEY'
    },
    uat: {
        url: 'https://YOUR_UAT_PROJECT_REF.supabase.co',
        anonKey: 'YOUR_UAT_KEY'
    },
    production: {
        url: 'https://urpednpniogbowdqocfm.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGVkbnBuaW9nYm93ZHFvY2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzAwNzcsImV4cCI6MjEwMDkwNjA3N30.CqoSLhuOmHuKtyoAk8Q0N0L0hlewBFDeTrTUhn1hZ20'
    }
};


window.currentEnvName = getCurrentEnvironment();
const config = ENVIRONMENTS[window.currentEnvName] || ENVIRONMENTS.development;

// Initialize the Supabase client dynamically using the active environment configuration
window.supabaseClient = supabase.createClient(config.url, config.anonKey);

// Optional: Log it once so you can visually verify in the console which DB it loaded
console.log("Supabase Initialized with URL:", config.url);

// // Supabase data fetching
// Initialize Supabase Client globally if not already present
window.getSupabaseClient = async function() {
    if (window.supabaseClient) return window.supabaseClient;
    
    // Assumes supabase script/CDN is loaded, or initialized via your environment keys
    if (typeof supabase !== 'undefined' && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
        window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        return window.supabaseClient;
    }
    
    console.error("Supabase library or environment credentials missing.");
    return null;
};

/**
 * Centralized function to fetch and construct the menu tree 
 * from normalized Supabase items and categories tables.
 */
window.fetchMasterMenuFromDatabase = async function() {
    const client = await window.getSupabaseClient();
    
    if (!client || typeof client.from !== 'function') {
        console.error("Supabase client is not initialized.");
        return { categories: [] };
    }

    try {
        // 1. Fetch categories sorted by their sort_order
        const { data: categoriesData, error: catError } = await client
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (catError) throw catError;

        // 2. Fetch all items sorted by their sort_order
        const { data: itemsData, error: itemError } = await client
            .from('items')
            .select('*')
            .order('sort_order', { ascending: true });

        if (itemError) throw itemError;

        // 3. Reconstruct the MASTER_DATABASE nested tree structure
        const categories = (categoriesData || []).map(cat => {
            const catItems = (itemsData || []).filter(item => item.category_id === cat.id);
            return {
                id: cat.id,
                superCategory: cat.super_category,
                subCategoryName: cat.sub_category_name,
                subCategoryDesc: cat.sub_category_desc,
                originType: cat.origin_type,
                tag: cat.tag,
                hidden: cat.is_hidden,
                sortOrder: cat.sort_order,
                items: catItems.map(item => ({
                    id: item.id,
                    category_id: item.category_id,
                    name: item.name,
                    description: item.description,
                    qty: item.qty,
                    price: item.price,
                    featured: item.is_featured,
                    hidden: item.is_hidden,
                    sortOrder: item.sort_order,
                    image_url: item.image_url || '',
                    image_path: item.image_path || ''
                }))
            };
        });

        return { categories };
    } catch (err) {
        console.error("Error fetching master menu from normalized tables:", err);
        return { categories: [] };
    }
};