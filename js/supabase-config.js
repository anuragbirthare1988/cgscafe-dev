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