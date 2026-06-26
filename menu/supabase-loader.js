async function loadMenuFromSupabase() {

    const { data: categories, error: catError } =
        await supabaseClient
            .from('categories')
            .select('*')
            .order('sort_order');

    if (catError) {
        console.error(catError);
        return { categories: [] };
    }

    const { data: items, error: itemError } =
        await supabaseClient
            .from('items')
            .select('*')
            .order('sort_order');

    if (itemError) {
        console.error(itemError);
        return { categories: [] };
    }

    const result = {
        categories: []
    };

    categories.forEach(cat => {

        const categoryItems = items
            .filter(i => i.category_id === cat.id)
            .map(i => ({
                id: i.id,
                categoryId: i.category_id,
                sortOrder: i.sort_order,
                legacyIndex: i.legacy_index,
            
                name: i.name,
                description: i.description,
                qty: i.qty,
                price: i.price,
            
                featured: i.is_featured,
                hidden: i.is_hidden
            }));

        result.categories.push({
            id: cat.id,
            sortOrder: cat.sort_order,
            legacyIndex: cat.legacy_index,
        
            superCategory: cat.super_category,
            subCategoryName: cat.sub_category_name,
            subCategoryDesc: cat.sub_category_desc,
            originType: cat.origin_type,
            tag: cat.tag,
            hidden: cat.is_hidden,
        
            items: categoryItems
        });
    });

    return result;
}
