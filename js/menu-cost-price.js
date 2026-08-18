// Central dynamic ingredient database loaded from Supabase & LocalStorage (SSOT)
let ingredientDatabase = [];

// Helper function to format strings to Camel Case (Title Case per word) for UI display
function toCamelCase(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Live typing formatter to display camel case instantly regardless of caps lock status
function handleLiveCamelCase(inputElement) {
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;
    const rawValue = inputElement.value;
    
    let formatted = toCamelCase(rawValue);
    if (rawValue.endsWith(' ') && !formatted.endsWith(' ')) {
        formatted += ' ';
    }
    
    if (inputElement.value !== formatted) {
        inputElement.value = formatted;
        try {
            inputElement.setSelectionRange(start, end);
        } catch (e) {}
    }
}

let hasAnyUnsavedChanges = false;
let modalInitialState = '';

window.addEventListener('beforeunload', function (e) {
    if (hasAnyUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.autocomplete-wrapper') && !e.target.closest('#ingredientStockModal')) {
        document.querySelectorAll('.autocomplete-dropdown').forEach(dd => {
            dd.style.display = 'none';
        });
    }
});

function filterRecipes() {
    const query = document.getElementById('menuSearch').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.cgs-cost-card');

    cards.forEach(card => {
        const name = card.getAttribute('data-recipe-name').toLowerCase();
        const category = card.getAttribute('data-category').toLowerCase();
        if (name.includes(query) || category.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

const cardInitialStates = new Map();


function captureCardState(card) {
    const inputs = card.querySelectorAll('input:not(#menuSearch):not(#globalBaseMargin)');
    const stateValues = {};
    inputs.forEach((input, index) => {
        stateValues[index] = input.type === 'file' ? input.files : input.value;
    });
    const tbody = card.querySelector('.ingredient-tbody').innerHTML;
    const thumbHtml = card.querySelector('.cgs-photo-thumb').innerHTML;
    cardInitialStates.set(card, { inputs: stateValues, tbody: tbody, thumb: thumbHtml });
}

function hasCardStateChanged(card) {
    const initial = cardInitialStates.get(card);
    if (!initial) return false;
    
    const inputs = card.querySelectorAll('input:not(#menuSearch):not(#globalBaseMargin)');
    let changed = false;
    inputs.forEach((input, index) => {
        const val = input.type === 'file' ? input.files : input.value;
        if (initial.inputs[index] !== val) {
            changed = true;
        }
    });
    const currentTbody = card.querySelector('.ingredient-tbody').innerHTML;
    if (initial.tbody !== currentTbody) changed = true;

    const currentThumb = card.querySelector('.cgs-photo-thumb').innerHTML;
    if (initial.thumb !== currentThumb) changed = true;

    return changed;
}

function markUnsaved(element) {
    const card = element.closest('.cgs-cost-card');
    if (card) {
        const indicator = card.querySelector('.unsaved-indicator');
        const changed = hasCardStateChanged(card);
        if (changed) {
            if (indicator) indicator.style.display = 'inline-flex';
        } else {
            if (indicator) indicator.style.display = 'none';
        }
    }
    updateGlobalUnsavedState();
}



// Initialize as null instead of a hardcoded 35
let originalBaseMargin = null;

function updateGlobalUnsavedState() {
    let remaining = false;
    
    // 1. Check individual recipe cards
    document.querySelectorAll('.cgs-cost-card').forEach(c => {
        const ind = c.querySelector('.unsaved-indicator');
        if (ind && ind.style.display === 'inline-flex') {
            remaining = true;
        }
    });

    // 2. Check if the global Base Margin has unsaved changes
    const baseInput = document.getElementById('baseMarginInput');
    if (baseInput) {
        const val = parseInt(baseInput.value.trim(), 10);
        if (!isNaN(val) && val !== originalBaseMargin) {
            remaining = true;
        }
    }

    hasAnyUnsavedChanges = remaining;
}

function handleBaseMarginInput(input) {
    // Ensure only digits remain
    input.value = input.value.replace(/[^0-9]/g, '');

    const saveBtn = document.getElementById('saveMarginBtn');
    const cancelBtn = document.getElementById('cancelMarginBtn');
    let val = parseInt(input.value, 10);
    
    const isEmpty = input.value.trim() === '' || isNaN(val);

    // Prevent margin from being 100 or greater
    if (!isEmpty && val >= 100) {
        val = 99;
        input.value = 99;
    }

    if (isEmpty) {
        input.style.backgroundColor = 'rgba(255, 193, 7, 0.15)';
        input.style.border = '1px dashed #ffc107';
        input.style.color = '#ffc107';
        window.liveBaseMargin = null;
    } else {
        input.style.backgroundColor = 'transparent';
        input.style.border = 'none';
        input.style.color = '#fff';
        window.liveBaseMargin = val;
    }

    const isChanged = !isEmpty && val !== originalBaseMargin;

    if (saveBtn && cancelBtn) {
        saveBtn.disabled = !isChanged || isEmpty;
        saveBtn.style.cursor = (!isChanged || isEmpty) ? 'not-allowed' : 'pointer';
        saveBtn.style.opacity = (!isChanged || isEmpty) ? '0.4' : '1';

        cancelBtn.disabled = isEmpty && originalBaseMargin === null;
        cancelBtn.style.cursor = cancelBtn.disabled ? 'not-allowed' : 'pointer';
        cancelBtn.style.opacity = cancelBtn.disabled ? '0.4' : '1';
    }

    // Directly control the pre-existing HTML indicator element
    const marginIndicator = document.getElementById('unsaved-global-changes');
    if (marginIndicator) {
        marginIndicator.innerText = isChanged ? '● Unsaved Global Changes' : '';
        marginIndicator.style.display = isChanged ? 'inline-flex' : 'none';
        marginIndicator.style.marginRight = isChanged ? '12px' : '0'; // Adds spacing between warning and button group when visible
    }

    // Update global state check whenever base margin is edited
    updateGlobalUnsavedState();

    if (typeof calculateAll === 'function') {
        calculateAll();
    }
}

function handleCustomMarginInput(input) {
    // Keep only natural number digits
    input.value = input.value.replace(/[^0-9]/g, '');
    let val = parseInt(input.value, 10);

    // Cap at 99 to prevent division-by-zero or 100%+ anomalies
    if (!isNaN(val) && val >= 100) {
        val = 99;
        input.value = 99;
    }

    markUnsaved(input);
    syncCustomPrice('margin', input);
}

function clearUnsaved(card) {
    const indicator = card.querySelector('.unsaved-indicator');
    if (indicator) indicator.style.display = 'none';
    updateGlobalUnsavedState();
}

async function toggleEditRecipe(btn) {
    const card = btn.closest('.cgs-cost-card');
    const isEditing = btn.classList.contains('editing');

    if (!isEditing) {
        const activeEditBtn = document.querySelector('.edit-recipe-btn.editing');
        if (activeEditBtn && activeEditBtn !== btn) {
            alert("Please save or close the currently active editing item first. Only a single menu item can allow editing at a time.");
            return;
        }
        captureCardState(card);
    }

    const inputs = card.querySelectorAll('input:not(#menuSearch):not(#globalBaseMargin)');
    const deleteRowBtns = card.querySelectorAll('.row-del-btn');
    const addIngBtn = card.querySelector('.add-ing-btn');
    const cancelBtn = card.querySelector('.cancel-recipe-btn');
    const uploadLabel = card.querySelector('.cgs-photo-upload-label');
    
    const nowEditing = btn.classList.toggle('editing');

    inputs.forEach(input => { input.disabled = !nowEditing; });
    deleteRowBtns.forEach(delBtn => { delBtn.disabled = !nowEditing; });
    if (addIngBtn) addIngBtn.disabled = !nowEditing;
    if (cancelBtn) cancelBtn.style.display = nowEditing ? 'inline-block' : 'none';
    if (uploadLabel) uploadLabel.style.display = nowEditing ? 'block' : 'none';

    if (nowEditing) {
        btn.innerHTML = '💾';
        btn.title = 'Save Recipe';
        btn.style.color = 'var(--cgs-menu-success)';
    } else {
        await saveRecipeToSupabase(card);
        btn.innerHTML = '✏️';
        btn.title = 'Edit Recipe';
        btn.style.color = 'var(--cgs-menu-text-muted)';
        clearUnsaved(card);
        calculateAll();
    }
}

// Load base margin from Supabase without fallback defaults
async function loadBaseMarginFromSupabase() {
    if (typeof supabaseClient === 'undefined') return;
    try {
        const { data, error } = await supabaseClient
            .from('app_settings')
            .select('base_margin')
            .eq('id', 1);

        if (error) {
            console.warn('Error fetching base margin:', error);
            return;
        }

        let fetchedMargin = null;
        if (Array.isArray(data) && data.length > 0) {
            fetchedMargin = data[0].base_margin;
        } else if (data && typeof data === 'object') {
            fetchedMargin = data.base_margin;
        }

        const input = document.getElementById('baseMarginInput');

        if (fetchedMargin !== null && fetchedMargin !== undefined && !isNaN(fetchedMargin)) {
            originalBaseMargin = parseFloat(fetchedMargin);
            if (input) {
                input.value = originalBaseMargin;
            }
        } else {
            originalBaseMargin = null;
            if (input) {
                input.value = '';
            }
        }

        if (input) {
            // Explicitly attach input listener to ensure handleBaseMarginInput runs on typing
            input.oninput = function() {
                handleBaseMarginInput(this);
            };
            handleBaseMarginInput(input);
        }
        
        if (typeof calculateAll === 'function') {
            calculateAll();
        }
    } catch (e) {
        console.warn('Could not load base margin from Supabase:', e);
    }
}

function cancelBaseMarginChange() {
    document.getElementById('baseMarginInput').value = originalBaseMargin;
    handleBaseMarginInput(document.getElementById('baseMarginInput'));
}

async function saveBaseMargin() {
    const input = document.getElementById('baseMarginInput');
    const newMargin = parseFloat(input.value);

    if (isNaN(newMargin) || newMargin <= 0 || newMargin >= 100) {
        showCgsDialog({ title: 'Invalid Margin', message: 'Please enter a valid margin between 1% and 99%.', type: 'alert' });
        return;
    }

    originalBaseMargin = newMargin;
    handleBaseMarginInput(input);

    // Sync with Supabase using primary key id: 1
    if (typeof supabaseClient !== 'undefined') {
        try {
            await supabaseClient
                .from('app_settings')
                .update({ base_margin: newMargin })
                .eq('id', 1);
        } catch (e) {
            console.warn('Supabase settings sync note:', e);
        }
    }

    // Trigger instant recalculation across all cards
    if (typeof calculateAll === 'function') {
        calculateAll();
    } else {
        document.querySelectorAll('.cgs-cost-card').forEach(card => {
            if (typeof updateCardCalculations === 'function') updateCardCalculations(card);
        });
    }

    showCgsDialog({ title: 'Saved', message: `Base margin updated to ${newMargin}%. All base prices recalculated.`, type: 'alert' });
}

function updateCardCalculations(card) {
    const totalCostEl = card.querySelector('.total-recipe-cost');
    const totalCost = parseFloat(totalCostEl?.textContent.replace(/[^0-9.]/g, '')) || 0;

    // Recalculate Auto Base Price using the updated global base margin variable
    const autoBasePrice = totalCost > 0 ? Math.round(totalCost / (1 - (originalBaseMargin / 100))) : 0;
    
    const autoPriceSpan = card.querySelector('.auto-raw-price');
    if (autoPriceSpan) {
        autoPriceSpan.textContent = totalCost > 0 ? `(Auto: ₹ ${autoPriceSpan.dataset.exactCost ? parseFloat(autoPriceSpan.dataset.exactCost).toFixed(2) : totalCost.toFixed(2)})` : '';
    }

    // Update base price display elements if not manually overridden
    // ... your existing card update logic ...
}

// 2. Custom Price and Margin Two-Way Sync
function syncCustomPrice(type, element) {
    const card = element.closest('.cgs-cost-card');
    if (!card) return;

    const priceInput = card.querySelector('.custom-price-input');
    const marginInput = card.querySelector('.custom-margin-input');
    const totalCostEl = card.querySelector('.total-recipe-cost');
    const totalCost = parseFloat(totalCostEl?.textContent.replace(/[^0-9.]/g, '')) || 0;

    // Manage warning icon element next to margin input
    let warningIcon = marginInput.parentNode.querySelector('.cgs-margin-warning');
    if (!warningIcon) {
        warningIcon = document.createElement('span');
        warningIcon.className = 'cgs-margin-warning';
        warningIcon.style.cssText = 'margin-left: 6px; cursor: pointer; display: none; font-size: 1rem;';
        warningIcon.innerHTML = '⚠️';
        marginInput.parentNode.appendChild(warningIcon);
    }

    if (type === 'margin') {
        const marginVal = marginInput.value.trim();
        if (marginVal === '') {
            priceInput.value = '';
            warningIcon.style.display = 'none';
        } else {
            const margin = parseFloat(marginVal) || 0;
            if (margin >= 100) {
                // Show warning for impractical/infinite values
                warningIcon.style.display = 'inline-block';
                warningIcon.title = 'Margin cannot be 100% or higher (causes infinite price). Please use a value below 100%.';
                priceInput.value = ''; // Prevent corrupted calculation reset
            } else {
                warningIcon.style.display = 'none';
                if (totalCost > 0) {
                    const calculatedPrice = totalCost / (1 - (margin / 100));
                    priceInput.value = Math.round(calculatedPrice);
                }
            }
        }
    } else if (type === 'price') {
        const priceVal = priceInput.value.trim();
        if (priceVal === '') {
            marginInput.value = '';
            warningIcon.style.display = 'none';
        } else {
            const price = parseFloat(priceVal) || 0;
            if (totalCost > 0 && price > totalCost) {
                const calculatedMargin = ((price - totalCost) / price) * 100;
                marginInput.value = Math.round(calculatedMargin);
                warningIcon.style.display = 'none';
            }
        }
    }

    if (typeof updateActivePriceHighlight === 'function') {
        updateActivePriceHighlight(card);
    }
}

// 3. Active Price Highlighting (Green for active higher price, Red if below threshold)
function updateActivePriceHighlight(cardElement) {
    const card = cardElement.closest('.cgs-cost-card') || cardElement;
    if (!card) return;

    const baseEl = card.querySelector('.base-price-value');
    const customEl = card.querySelector('.custom-price-value');
    const customInput = card.querySelector('.custom-price-input');

    // Extract numeric values safely
    const baseText = baseEl?.textContent || '';
    const baseMatch = baseText.match(/₹\s*([0-9.]+)/);
    const basePrice = baseMatch ? parseFloat(baseMatch[1]) : 0;

    const customPrice = parseFloat(customInput?.value) || 0;

    // Remove highlight from both first
    baseEl?.classList.remove('highlight-price');
    customEl?.classList.remove('highlight-price');

    // Apply green highlight to the one with the greater amount
    if (customPrice > 0 && customPrice > basePrice) {
        customEl?.classList.add('highlight-price');
    } else {
        baseEl?.classList.add('highlight-price');
    }
}

// 4. Custom Modal Dialog Implementation (Replacing standard alerts/confirms)
function showCgsDialog({ title = 'Notice', message = '', type = 'alert', confirmText = 'OK', cancelText = 'Cancel', onConfirm = null }) {
    const existing = document.getElementById('cgsDialogOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'cgsDialogOverlay';
    overlay.className = 'cgs-dialog-overlay';

    const isConfirm = type === 'confirm';

    overlay.innerHTML = `
        <div class="cgs-dialog-box">
            <div class="cgs-dialog-header">${title}</div>
            <div class="cgs-dialog-body">${message}</div>
            <div class="cgs-dialog-actions">
                ${isConfirm ? `<button class="cgs-dialog-btn cgs-dialog-btn-secondary" id="cgsDialogCancel">${cancelText}</button>` : ''}
                <button class="cgs-dialog-btn ${isConfirm ? 'cgs-dialog-btn-danger' : 'cgs-dialog-btn-primary'}" id="cgsDialogConfirm">${confirmText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#cgsDialogConfirm').onclick = () => {
        overlay.remove();
        if (typeof onConfirm === 'function') onConfirm();
    };

    if (isConfirm) {
        overlay.querySelector('#cgsDialogCancel').onclick = () => overlay.remove();
    }
}

function confirmDeleteFromDatabase(btn) {
    const row = btn.closest('tr');
    const ingName = row.querySelector('.ing-name-input')?.value || 'this ingredient';

    showCgsDialog({
        title: 'Delete Ingredient',
        message: `Are you sure you want to delete "${ingName}" from the database?`,
        type: 'confirm',
        confirmText: 'Delete',
        onConfirm: () => {
            row.remove();
            if (typeof calculateAll === 'function') calculateAll();
        }
    });
}

async function saveRecipeToSupabase(target) {
    if (typeof supabaseClient === 'undefined') return;

    // Support being called via button element (this) or directly passing the card element
    let card = null;
    if (target instanceof Element) {
        card = target.classList.contains('cgs-cost-card') ? target : target.closest('.cgs-cost-card');
    }
    if (!card) return;

    const itemId = card.getAttribute('data-item-id');
    const isTemporary = !itemId || itemId.startsWith('temp_');

    // Get recipe name from title or attribute
    const titleSpan = card.querySelector('.cgs-recipe-title');
    const recipeName = titleSpan ? titleSpan.textContent.trim() : (card.getAttribute('data-recipe-name') || '');

    if (!recipeName) {
        alert('Recipe name cannot be empty.');
        return;
    }

    // Validate name uniqueness against all other cards on the page
    const allCards = document.querySelectorAll('.cgs-cost-card');
    let nameExists = false;
    allCards.forEach(c => {
        if (c !== card) {
            const cTitle = c.querySelector('.cgs-recipe-title');
            const cName = cTitle ? cTitle.textContent.trim() : c.getAttribute('data-recipe-name');
            if (cName && cName.toLowerCase() === recipeName.toLowerCase()) {
                nameExists = true;
            }
        }
    });

    if (nameExists) {
        alert(`A recipe with the name "${recipeName}" already exists! Please use a unique name before saving.`);
        return;
    }

    // Gather financial inputs safely
    const customPriceInput = card.querySelector('.custom-price-input');
    const customMarginInput = card.querySelector('.custom-margin-input');
    const servingSizeInput = card.querySelector('.recipe-serving-size-input');
    
    const customPrice = customPriceInput ? parseFloat(customPriceInput.value) || null : null;
    const customMargin = customMarginInput ? parseFloat(customMarginInput.value) || null : null;
    const servingSize = servingSizeInput ? servingSizeInput.value.trim() : '';

    // Calculate total cost from rows
    let totalRecipeCost = 0;
    const ingredientsJson = [];
    const rows = card.querySelectorAll('.ingredient-tbody tr');

    rows.forEach(row => {
        const nameInput = row.querySelector('.ing-name-input');
        const usedQtyInput = row.querySelector('.ing-serving-qty');
        const bulkQtyInput = row.querySelector('.ing-bulk-qty');
        const bulkCostInput = row.querySelector('.ing-bulk-cost');
        const totalCostCell = row.querySelector('.ing-total-cost');

        const ingName = nameInput ? nameInput.value.trim() : '';
        const usedQty = usedQtyInput ? parseFloat(usedQtyInput.value) || 0 : 0;
        const bulkQty = bulkQtyInput ? parseFloat(bulkQtyInput.value) || 0 : 0;
        const bulkCost = bulkCostInput ? parseFloat(bulkCostInput.value) || 0 : 0;
        const rowTotal = totalCostCell ? parseFloat(totalCostCell.innerText) || 0 : 0;

        if (ingName) {
            ingredientsJson.push({
                name: ingName,
                used_qty: usedQty,
                bulk_qty: bulkQty,
                bulk_cost: bulkCost,
                total_cost: rowTotal
            });
            totalRecipeCost += rowTotal;
        }
    });

    // Compute autoRound locally
    const autoRound = totalRecipeCost > 0 ? (typeof roundUpFriendly === 'function' ? roundUpFriendly(totalRecipeCost / 0.65) : Math.ceil(totalRecipeCost / 0.65)) : 0;

    const payload = {
        name: recipeName,
        ingredients_json: ingredientsJson,
        total_cost: totalRecipeCost,
        base_price: autoRound,
        display_price: Math.max(autoRound, customPrice || 0),
        custom_price: customPrice,
        custom_margin: customMargin,
        qty: servingSize,
        updated_at: new Date()
    };

    let error = null;
    let savedData = null;

    if (isTemporary) {
        // Insert new record for duplicated items
        const { data, error: err } = await supabaseClient
            .from('items')
            .insert([payload])
            .select();
        error = err;
        savedData = data;
    } else {
        // Update existing record
        const { error: err } = await supabaseClient
            .from('items')
            .update(payload)
            .eq('id', itemId);
        error = err;
    }

    if (error) {
        console.error('Error saving recipe to Supabase:', error);
        alert('Failed to save recipe changes to Supabase.');
        return;
    }

    // If it was a temporary duplicated card, assign the real database ID returned from Supabase
    if (isTemporary && savedData && savedData.length > 0) {
        card.setAttribute('data-item-id', savedData[0].id);
    }

    card.setAttribute('data-recipe-name', recipeName);

    // Clean up UI and exit edit mode on success
    card.classList.remove('unsaved');
    const indicator = card.querySelector('.unsaved-indicator');
    if (indicator) indicator.style.display = 'none';

    const editBtn = card.querySelector('.edit-recipe-btn');
    const cancelBtn = card.querySelector('.cancel-recipe-btn');
    const uploadLabel = card.querySelector('.cgs-photo-upload-label');
    const inputs = card.querySelectorAll('input:not(#menuSearch):not(#globalBaseMargin)');

    if (editBtn) {
        editBtn.classList.remove('editing');
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Edit Recipe';
        editBtn.style.color = '';
    }
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (uploadLabel) uploadLabel.style.display = 'none';
    inputs.forEach(input => { input.disabled = true; });

    alert('Recipe saved successfully!');

    if (typeof calculateAll === 'function') {
        calculateAll();
    }
}

function cancelEditRecipe(btn) {
    const card = btn.closest('.cgs-cost-card');
    const initial = cardInitialStates.get(card);
    
    if (initial) {
        card.querySelector('.ingredient-tbody').innerHTML = initial.tbody;
        card.querySelector('.cgs-photo-thumb').innerHTML = initial.thumb;
        
        const inputs = card.querySelectorAll('input:not(#menuSearch):not(#globalBaseMargin)');
        inputs.forEach((input, index) => {
            if (input.type !== 'file') {
                input.value = initial.inputs[index];
            }
        });
    }

    const editBtn = card.querySelector('.edit-recipe-btn');
    editBtn.classList.remove('editing');
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit Recipe';
    editBtn.style.color = 'var(--cgs-menu-text-muted)';

    card.querySelectorAll('.row-del-btn').forEach(dBtn => dBtn.disabled = true);
    const addIngBtn = card.querySelector('.add-ing-btn');
    if (addIngBtn) addIngBtn.disabled = true;
    const cancelBtn = card.querySelector('.cancel-recipe-btn');
    if (cancelBtn) cancelBtn.style.display = 'none';
    const uploadLabel = card.querySelector('.cgs-photo-upload-label');
    if (uploadLabel) uploadLabel.style.display = 'none';

    card.querySelectorAll('input:not(#menuSearch):not(#globalBaseMargin)').forEach(input => input.disabled = true);

    clearUnsaved(card);
    calculateAll();
}

function handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const thumb = input.closest('.cgs-recipe-body-grid').querySelector('.cgs-photo-thumb');
            thumb.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
            markUnsaved(input);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function openPhotoModal(thumbDiv) {
    const img = thumbDiv.querySelector('img');
    if (img) {
        const modal = document.getElementById('photoModal');
        const modalImg = document.getElementById('modalImage');
        modal.style.display = 'flex';
        modalImg.src = img.src;
    }
}

function closePhotoModal() {
    document.getElementById('photoModal').style.display = 'none';
}

function roundUpFriendly(val) {
    return Math.ceil(val / 5) * 5;
}

// Update your calculateAll function to safeguard against a null/empty margin
function calculateAll() {
    const cards = document.querySelectorAll('.cgs-cost-card');
    
    cards.forEach(card => {
        let totalRecipeCost = 0;
        const rows = card.querySelectorAll('.ingredient-tbody tr');
        
        rows.forEach(row => {
            const usedQty = parseFloat(row.querySelector('.ing-serving-qty')?.value) || 0;
            const bulkQty = parseFloat(row.querySelector('.ing-bulk-qty')?.value) || 0;
            const bulkCost = parseFloat(row.querySelector('.ing-bulk-cost')?.value) || 0;
            
            let rowTotal = 0;
            if (bulkQty > 0 && bulkCost > 0 && usedQty > 0) {
                rowTotal = (bulkCost / bulkQty) * usedQty;
            }
            
            const totalCostCell = row.querySelector('.ing-total-cost');
            if (totalCostCell) {
                totalCostCell.innerText = rowTotal.toFixed(2);
            }
            
            totalRecipeCost += rowTotal;
        });
        
        const recipeCostEl = card.querySelector('.total-recipe-cost');
        if (recipeCostEl) {
            recipeCostEl.innerText = totalRecipeCost > 0 ? `₹ ${totalRecipeCost.toFixed(2)}` : '₹ 0.00';
        }
        
        const autoRoundEl = card.querySelector('.auto-round-price');
        const autoRawEl = card.querySelector('.auto-raw-price');
        const activeMargin = window.liveBaseMargin !== undefined ? window.liveBaseMargin : originalBaseMargin;
        // Only calculate auto price if total cost > 0 AND base margin is actually configured
        if (totalRecipeCost > 0 && activeMargin !== null && activeMargin > 0) {
            const calculatedAuto = roundUpFriendly(totalRecipeCost / (1 - (activeMargin / 100)));
            if (autoRoundEl) autoRoundEl.innerText = `₹ ${calculatedAuto}`;
            if (autoRawEl) autoRawEl.innerText = `(Auto: ₹ ${totalRecipeCost.toFixed(2)})`;
        } else {
            if (autoRoundEl) autoRoundEl.innerText = activeMargin === null ? '⚠️ Margin Not Set' : '';
            if (autoRawEl) autoRawEl.innerText = '';
        }
    });
}

function syncCustomPrice(source, element) {
    const card = element.closest('.cgs-cost-card');
    const totalCostText = card.querySelector('.total-recipe-cost').innerText.replace('₹ ', '');
    const totalCost = parseFloat(totalCostText) || 0;

    const priceInput = card.querySelector('.custom-price-input');
    const marginInput = card.querySelector('.custom-margin-input');

    if (source === 'price') {
        const price = parseFloat(priceInput.value) || 0;
        if (price > 0 && totalCost > 0) {
            const margin = ((price - totalCost) / price) * 100;
            marginInput.value = margin.toFixed(1);
        }
    } else if (source === 'margin') {
        const margin = parseFloat(marginInput.value) || 0;
        if (margin < 100 && totalCost > 0) {
            const price = totalCost / (1 - (margin / 100));
            priceInput.value = price.toFixed(0);
        }
    }
}

async function loadIngredientsMaster() {
    if (typeof supabaseClient === 'undefined') return;
    const { data, error } = await supabaseClient
        .from('ingredients')
        .select('name')
        .order('name', { ascending: true });
    
    let storedStocks = {};
    try {
        storedStocks = JSON.parse(localStorage.getItem('cgs_ingredient_stocks') || '{}');
    } catch(e) {}

    if (!error && data) {
        ingredientDatabase = data.map(item => {
            const name = item.name.toLowerCase();
            const stock = storedStocks[name] || { bulk_qty: 1000, bulk_cost: 100 };
            return {
                name: name,
                bulk_qty: stock.bulk_qty,
                bulk_cost: stock.bulk_cost
            };
        });
    }
}

function saveStockToLocalStorage() {
    const stocks = {};
    ingredientDatabase.forEach(ing => {
        stocks[ing.name] = { bulk_qty: ing.bulk_qty, bulk_cost: ing.bulk_cost };
    });
    localStorage.setItem('cgs_ingredient_stocks', JSON.stringify(stocks));
}

async function addIngredientToDatabase(inputElement, ingredientName) {
    const nameFormatted = ingredientName.trim().toLowerCase();
    if (!nameFormatted) return;

    const existingMaster = ingredientDatabase.find(i => i.name === nameFormatted);
    const defaultBulkQty = existingMaster ? existingMaster.bulk_qty : 1000;
    const defaultBulkCost = existingMaster ? existingMaster.bulk_cost : 100;

    if (typeof supabaseClient !== 'undefined') {
        const { error } = await supabaseClient
            .from('ingredients')
            .upsert([{ name: nameFormatted }], { onConflict: 'name' });

        if (error) {
            console.error('Error saving ingredient to Supabase:', error);
            alert('Failed to save ingredient to database: ' + (error.message || 'Unknown error'));
            return;
        }
    }

    if (!ingredientDatabase.some(i => i.name === nameFormatted)) {
        ingredientDatabase.push({ name: nameFormatted, bulk_qty: defaultBulkQty, bulk_cost: defaultBulkCost });
        saveStockToLocalStorage();
    }

    const wrapper = inputElement.closest('.autocomplete-wrapper');
    if (wrapper) {
        const badge = wrapper.querySelector('.badge-highlight-yellow') || wrapper.parentElement.querySelector('.badge-highlight-yellow');
        if (badge) badge.style.display = 'none';
        const deleteBtn = wrapper.querySelector('.ing-delete-db-btn');
        if (deleteBtn) deleteBtn.style.display = 'block';
    }

    markUnsaved(inputElement);
    await loadIngredientsMaster();
}

function handleAutocomplete(inputElement) {
    document.querySelectorAll('.autocomplete-dropdown').forEach(dd => {
        if (dd !== inputElement.closest('.autocomplete-wrapper').querySelector('.autocomplete-dropdown')) {
            dd.style.display = 'none';
        }
    });

    const wrapper = inputElement.closest('.autocomplete-wrapper');
    let dropdown = wrapper.querySelector('.autocomplete-dropdown');
    let badge = wrapper.querySelector('.badge-highlight-yellow');
    let deleteDbBtn = wrapper.querySelector('.ing-delete-db-btn');
    
    const query = inputElement.value.toLowerCase().trim();
    const matchedIng = ingredientDatabase.find(item => item.name === query);

    if (matchedIng) {
        deleteDbBtn.style.display = 'block';
        const row = inputElement.closest('tr');
        row.querySelector('.ing-bulk-qty').value = matchedIng.bulk_qty;
        row.querySelector('.ing-bulk-cost').value = matchedIng.bulk_cost;
    } else {
        deleteDbBtn.style.display = 'none';
    }

    if (query.length > 0 && !matchedIng) {
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'badge-highlight-yellow';
            badge.style.position = 'absolute';
            badge.style.top = '100%';
            badge.style.left = '0';
            badge.style.zIndex = '1000';
            badge.onclick = function() { addIngredientToDatabase(inputElement, query); };
            wrapper.appendChild(badge);
        }
        badge.innerText = `${toCamelCase(inputElement.value)} (Press Enter or Click to add)`;
        badge.style.display = 'inline-flex';
    } else {
        if (badge) badge.style.display = 'none';
    }

    dropdown.innerHTML = '';
    const matches = query.length === 0 ? ingredientDatabase : ingredientDatabase.filter(item => item.name.includes(query));
    
    if (matches.length > 0) {
        dropdown.style.display = 'block';
        matches.forEach(matchObj => {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.innerText = toCamelCase(matchObj.name);
            div.onmousedown = function(e) { e.preventDefault(); };
            div.onclick = function() {
                inputElement.value = toCamelCase(matchObj.name);
                dropdown.style.display = 'none';
                if (badge) badge.style.display = 'none';
                deleteDbBtn.style.display = 'block';
                
                const row = inputElement.closest('tr');
                row.querySelector('.ing-bulk-qty').value = matchObj.bulk_qty;
                row.querySelector('.ing-bulk-cost').value = matchObj.bulk_cost;

                markUnsaved(inputElement);
                calculateAll();
            };
            dropdown.appendChild(div);
        });
    } else {
        dropdown.style.display = 'none';
    }
}

function handleBlur(inputElement) {
    const wrapper = inputElement.closest('.autocomplete-wrapper');
    const dropdown = wrapper.querySelector('.autocomplete-dropdown');
    const deleteDbBtn = wrapper.querySelector('.ing-delete-db-btn');
    const badge = wrapper.querySelector('.badge-highlight-yellow');

    setTimeout(() => {
        if (dropdown) dropdown.style.display = 'none';
        const val = inputElement.value.trim().toLowerCase();
        if (val) {
            addIngredientToDatabase(inputElement, val);
        }
        const matchedDbItem = ingredientDatabase.find(item => item.name === val);
        if (matchedDbItem) {
            inputElement.value = toCamelCase(matchedDbItem.name);
            deleteDbBtn.style.display = 'block';
            if (badge) badge.style.display = 'none';
            
            const row = inputElement.closest('tr');
            row.querySelector('.ing-bulk-qty').value = matchedDbItem.bulk_qty;
            row.querySelector('.ing-bulk-cost').value = matchedDbItem.bulk_cost;
            calculateAll();
        }
    }, 200);
}

function handleKeyNavigation(event, inputElement) {
    const wrapper = inputElement.closest('.autocomplete-wrapper');
    const dropdown = wrapper.querySelector('.autocomplete-dropdown');
    
    if (event.key === 'Enter') {
        event.preventDefault();
        const val = inputElement.value.trim().toLowerCase();
        if (val) {
            addIngredientToDatabase(inputElement, val);
            if (dropdown) dropdown.style.display = 'none';
            const matched = ingredientDatabase.find(i => i.name === val);
            if (matched) {
                const row = inputElement.closest('tr');
                row.querySelector('.ing-bulk-qty').value = matched.bulk_qty;
                row.querySelector('.ing-bulk-cost').value = matched.bulk_cost;
            }
            calculateAll();
        }
    } else if (event.key === 'Escape') {
        if (dropdown && dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            event.stopPropagation();
        }
    }
}

async function confirmDeleteFromDatabase(btn) {
    const wrapper = btn.closest('.autocomplete-wrapper');
    const input = wrapper.querySelector('.ing-name-input');
    const ingredientName = input.value.trim().toLowerCase();
    const displayName = toCamelCase(ingredientName);

    if (confirm(`Are you sure you want to delete "${displayName}" from the database? This action will stop showing the ingredient in any of the future product additions.`)) {
        if (typeof supabaseClient !== 'undefined') {
            const { error } = await supabaseClient
                .from('ingredients')
                .delete()
                .eq('name', ingredientName);

            if (error) {
                console.error('Error deleting ingredient from Supabase:', error);
                alert('Failed to delete from database.');
                return;
            }
        }
        ingredientDatabase = ingredientDatabase.filter(item => item.name !== ingredientName);
        saveStockToLocalStorage();
        btn.style.display = 'none';
        input.value = '';
        markUnsaved(input);
        calculateAll();
    }
}

function addIngredientRow(button) {
    const card = button.closest('.cgs-cost-card');
    const tbody = card.querySelector('.ingredient-tbody');
    const isEditing = card.querySelector('.edit-recipe-btn').classList.contains('editing');
    const disabledAttr = isEditing ? '' : 'disabled';
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <div class="autocomplete-wrapper">
                <input type="text" class="cgs-table-input ing-name-input" placeholder="Type ingredient..." value="" ${disabledAttr} oninput="markUnsaved(this); handleLiveCamelCase(this); handleAutocomplete(this)" onfocus="handleAutocomplete(this)" onblur="handleBlur(this)" onkeydown="handleKeyNavigation(event, this)">
                <button type="button" class="ing-delete-db-btn" title="Delete from Database" onclick="confirmDeleteFromDatabase(this)">🗑️</button>
                <div class="autocomplete-dropdown"></div>
            </div>
        </td>
        <td><input type="number" class="cgs-table-input ing-serving-qty" value="" placeholder="0" ${disabledAttr} oninput="markUnsaved(this); calculateAll()"></td>
        <td><input type="number" class="cgs-table-input ing-bulk-qty" value="" placeholder="0" ${disabledAttr} oninput="markUnsaved(this); calculateAll()"></td>
        <td><input type="number" step="0.01" class="cgs-table-input ing-bulk-cost" value="" placeholder="0.00" ${disabledAttr} oninput="markUnsaved(this); calculateAll()"></td>
        <td class="ing-total-cost">0.00</td>
        <td><button class="cgs-action-btn row-del-btn" ${disabledAttr} onclick="removeRow(this)">🗑️</button></td>
    `;
    tbody.appendChild(newRow);
    
    const newlyAddedInput = newRow.querySelector('.ing-name-input');
    if (newlyAddedInput) {
        newlyAddedInput.focus();
    }

    markUnsaved(button);
    calculateAll();
}

function removeRow(btn) {
    const row = btn.closest('tr');
    const tbody = row.closest('.ingredient-tbody');
    const nameInput = row.querySelector('.ing-name-input');
    const ingredientName = nameInput ? toCamelCase(nameInput.value.trim()) : '';
    const displayName = ingredientName ? `"${ingredientName}"` : 'this ingredient row';

    if (tbody.rows.length > 1) {
        if (confirm(`Are you sure you want to remove ${displayName}?`)) {
            row.remove();
            markUnsaved(btn);
            calculateAll();
        }
    } else {
        alert("A recipe must have at least one ingredient row.");
    }
}

function initIngredientStockModal() {
    if (document.getElementById('ingredientStockModal')) return;

    const modalHtml = `
        <div id="ingredientStockModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter: blur(6px); z-index:9999; justify-content:center; align-items:center;">
            <div style="background:#181818; width:94vw; height:92vh; max-width:1400px; border:1px solid #333; border-radius:12px; padding:24px 32px; display:flex; flex-direction:column; box-sizing:border-box; color:#fff; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid #333; padding-bottom:12px;">
                    <h3 style="margin:0; font-size:1.2rem; font-weight:600; color:#fff; display:flex; align-items:center; gap:8px;">📦 Manage Ingredients & Bulk Stock (SSOT)</h3>
                    <button onclick="closeIngredientStockModal()" style="background:none; border:none; font-size:1.6rem; cursor:pointer; color:#aaa; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#aaa'">&times;</button>
                </div>
                <div style="overflow-y:auto; flex:1; margin-bottom:16px; padding-right:4px;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                        <thead>
                            <tr style="background:#222; color:#bbb; text-align:left;">
                                <th style="padding:12px 14px; border-bottom:2px solid #444; width:35%;">Ingredient Name</th>
                                <th style="padding:12px 14px; border-bottom:2px solid #444; width:25%;">Bulk Qty (gm/ml/pc)</th>
                                <th style="padding:12px 14px; border-bottom:2px solid #444; width:25%;">Bulk Cost (₹)</th>
                                <th style="padding:12px 14px; border-bottom:2px solid #444; width:15%;">Action</th>
                            </tr>
                        </thead>
                        <tbody id="ingredientStockTableBody">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid #333; padding-top:12px;">
                    <button onclick="closeIngredientStockModal()" style="padding:8px 18px; background:#2a2a2a; color:#ccc; border:1px solid #444; border-radius:4px; cursor:pointer; font-weight:500; font-size:0.85rem; transition: background 0.2s;" onmouseover="this.style.background='#333'; this.style.color='#fff'" onmouseout="this.style.background='#2a2a2a'; this.style.color='#ccc'">Cancel</button>
                    <button onclick="saveIngredientStockChanges()" style="padding:8px 20px; background:linear-gradient(135deg, #d4af37, #aa8c2c); color:#111; border:none; border-radius:4px; cursor:pointer; font-weight:700; font-size:0.85rem; box-shadow: 0 2px 6px rgba(212, 175, 55, 0.3); transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Save All Stock</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function getModalCurrentStateString() {
    const rows = document.querySelectorAll('#ingredientStockTableBody tr');
    let state = [];
    rows.forEach(row => {
        const nameInput = row.querySelector('.modal-ing-name');
        const qtyInput = row.querySelector('.modal-bulk-qty');
        const costInput = row.querySelector('.modal-bulk-cost');
        if (nameInput && qtyInput && costInput) {
            state.push(`${nameInput.value.trim()}|${qtyInput.value}|${costInput.value}`);
        }
    });
    return state.join('||');
}

function openIngredientStockModal() {
    initIngredientStockModal();
    const tbody = document.getElementById('ingredientStockTableBody');
    tbody.innerHTML = '';

    ingredientDatabase.forEach(ing => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding:8px 14px; border-bottom:1px solid #222;">
                <input type="text" class="modal-ing-name" data-original-name="${ing.name}" value="${toCamelCase(ing.name)}" oninput="handleLiveCamelCase(this)" style="width:100%; padding:6px 10px; background:#222; color:#fff; border:1px solid #444; border-radius:4px; font-size:0.85rem;">
            </td>
            <td style="padding:8px 14px; border-bottom:1px solid #222;">
                <input type="number" class="modal-bulk-qty" value="${ing.bulk_qty}" style="width:100%; padding:6px 10px; background:#222; color:#fff; border:1px solid #444; border-radius:4px; font-size:0.85rem;">
            </td>
            <td style="padding:8px 14px; border-bottom:1px solid #222;">
                <input type="number" step="0.01" class="modal-bulk-cost" value="${ing.bulk_cost}" style="width:100%; padding:6px 10px; background:#222; color:#fff; border:1px solid #444; border-radius:4px; font-size:0.85rem;">
            </td>
            <td style="padding:8px 14px; border-bottom:1px solid #222;">
                <button type="button" onclick="deleteModalIngredientRow(this)" style="background:none; border:none; cursor:pointer; font-size:1rem; padding:4px;" title="Delete Ingredient">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    modalInitialState = getModalCurrentStateString();
    document.getElementById('ingredientStockModal').style.display = 'flex';
}

function deleteModalIngredientRow(btn) {
    const tr = btn.closest('tr');
    const nameInput = tr.querySelector('.modal-ing-name');
    const ingredientName = nameInput ? toCamelCase(nameInput.value.trim()) : '';
    const displayName = ingredientName ? `"${ingredientName}"` : 'this ingredient';

    if (confirm(`Are you sure you want to remove ${displayName}?`)) {
        tr.remove();
    }
}

function closeIngredientStockModal() {
    const currentState = getModalCurrentStateString();
    if (currentState !== modalInitialState) {
        if (!confirm("You have unsaved edits that will be vanished. Are you sure you want to close?")) {
            return;
        }
    }
    const modal = document.getElementById('ingredientStockModal');
    if (modal) modal.style.display = 'none';
}

async function saveIngredientStockChanges() {
    const rows = document.querySelectorAll('#ingredientStockTableBody tr');
    let newIngredientDatabase = [];
    let storedStocks = {};

    let oldToNewNames = {};

    rows.forEach(row => {
        const nameInput = row.querySelector('.modal-ing-name');
        const qtyInput = row.querySelector('.modal-bulk-qty');
        const costInput = row.querySelector('.modal-bulk-cost');

        const newName = nameInput.value.trim().toLowerCase();
        const origName = nameInput.getAttribute('data-original-name');
        const bulk_qty = parseFloat(qtyInput.value) || 1;
        const bulk_cost = parseFloat(costInput.value) || 0;

        if (newName) {
            newIngredientDatabase.push({
                name: newName,
                bulk_qty: bulk_qty,
                bulk_cost: bulk_cost
            });
            storedStocks[newName] = { bulk_qty: bulk_qty, bulk_cost: bulk_cost };
            if (origName && origName !== newName) {
                oldToNewNames[origName] = newName;
            }
        }
    });

    if (typeof supabaseClient !== 'undefined') {
        const currentNamesSet = new Set(newIngredientDatabase.map(i => i.name));
        const originalNamesSet = new Set(ingredientDatabase.map(i => i.name));

        for (let orig of originalNamesSet) {
            if (!currentNamesSet.has(orig) && !oldToNewNames[orig]) {
                await supabaseClient.from('ingredients').delete().eq('name', orig);
            }
        }

        for (let ing of newIngredientDatabase) {
            await supabaseClient.from('ingredients').upsert([{ name: ing.name }], { onConflict: 'name' });
        }
    }

    ingredientDatabase = newIngredientDatabase;
    localStorage.setItem('cgs_ingredient_stocks', JSON.stringify(storedStocks));

    modalInitialState = getModalCurrentStateString();
    closeIngredientStockModal();
    loadMenuFromSupabase();
    alert('Ingredients and bulk stock updated successfully!');
}

function injectManageStockButton() {
    const searchBar = document.getElementById('menuSearch');
    if (searchBar && !document.getElementById('manageStockBtn')) {
        const parentWrapper = searchBar.parentNode;
        parentWrapper.style.display = 'flex';
        parentWrapper.style.alignItems = 'center';
        parentWrapper.style.gap = '12px';
        parentWrapper.style.flexWrap = 'nowrap';
        parentWrapper.style.width = '100%';

        searchBar.style.flex = '1';
        searchBar.style.minWidth = '200px';

        const btn = document.createElement('button');
        btn.id = 'manageStockBtn';
        btn.innerHTML = '📦 Manage Stock';
        btn.style.background = 'linear-gradient(135deg, #1e1e1e, #2c2c2c)';
        btn.style.color = '#d4af37';
        btn.style.border = '1px solid #d4af37';
        btn.style.padding = '10px 18px';
        btn.style.whiteSpace = 'nowrap';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = '700';
        btn.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.4)';
        btn.style.transition = 'all 0.2s ease';
        
        btn.onmouseover = function() {
            this.style.background = 'linear-gradient(135deg, #2c2c2c, #3a3a3a)';
            this.style.boxShadow = '0 4px 10px rgba(212, 175, 55, 0.2)';
        };
        btn.onmouseout = function() {
            this.style.background = 'linear-gradient(135deg, #1e1e1e, #2c2c2c)';
            this.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.4)';
        };

        btn.style.height = searchBar.offsetHeight ? searchBar.offsetHeight + 'px' : '44px';
        btn.onclick = openIngredientStockModal;
        
        parentWrapper.appendChild(btn);
    }
}

async function loadMenuFromSupabase() {
    await loadIngredientsMaster();
    initIngredientStockModal();
    injectManageStockButton();

    if (typeof supabaseClient === 'undefined') {
        calculateAll();
        return;
    }

    const { data: items, error } = await supabaseClient
        .from('items')
        .select(`
            id,
            name,
            description,
            base_price,
            custom_price,
            custom_margin,
            display_price,
            used_qty,
            bulk_qty,
            bulk_cost,
            ingredients_json,
            image_url,
            total_cost,
            category_id,
            sort_order,
            categories (
                sub_category_name,
                super_category,
                sort_order
            )
        `)
        // ... rest of query
        // 1. Order by category sequence first
        .order('sort_order', { foreignTable: 'categories', ascending: true })
        // 2. Order by item sequence within that category (removes alphabetical sorting)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error loading items from Supabase:', error);
        return;
    }

    const container = document.getElementById('recipeContainer');
    if (!container || !items || items.length === 0) return;

    container.innerHTML = '';

    // Helper to safely extract subcategory name whether 'categories' is an object, array, or null
    function getSubCatName(catData) {
        if (!catData) return '';
        if (Array.isArray(catData)) {
            return (catData[0]?.sub_category_name || '').trim().toUpperCase();
        }
        return (catData.sub_category_name || '').trim().toUpperCase();
    }

    // Master display order matching menu-edit.html layout (optional fallback sorting)
    const CATEGORY_SEQUENCE = [
        "ICED COFFEE", "FRAPPES", "SHAKES", "CAD THICK CHOCOLATES",
        "SOOTHING SIPS", "BREADS & BUTTERS", "REFRESHERS", "SHOTS",
        "SIGNATURE MELTS", "TIMELESS COMFORT", "ARTISAN PASTA",
        "CRISP CUT FRIES", "GOLDEN KERNELS", "BOTANICAL SALADS",
        "CHEF'S SPECIAL", "DESSERTS"
    ];

    // Safe sorting using database sort_order or fallback sequence
    items.sort((a, b) => {
        const subCatA = getSubCatName(a.categories);
        const subCatB = getSubCatName(b.categories);

        const indexA = CATEGORY_SEQUENCE.indexOf(subCatA);
        const indexB = CATEGORY_SEQUENCE.indexOf(subCatB);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        return subCatA.localeCompare(subCatB);
    });

    items.forEach(item => {
        // Safe category display name resolution
        let categoryName = 'General';
        if (item.categories) {
            if (Array.isArray(item.categories)) {
                categoryName = item.categories[0]?.sub_category_name || item.categories[0]?.super_category || 'General';
            } else {
                categoryName = item.categories.sub_category_name || item.categories.super_category || 'General';
            }
        }

        const displayPrice = (item.custom_price !== null && item.custom_price !== undefined && item.custom_price !== '') 
            ? item.custom_price 
            : (item.base_price !== null && item.base_price !== undefined && item.base_price !== '' 
                ? item.base_price 
                : '');

        const displayMargin = (item.custom_margin !== null && item.custom_margin !== undefined && item.custom_margin !== '') 
            ? item.custom_margin 
            : '';

        const totalCost = (item.total_cost !== null && item.total_cost !== undefined) ? Number(item.total_cost) : 0;
        
        // Only calculate auto-round and raw prices if totalCost is valid and greater than 0
        const autoRound = (totalCost > 0) ? (typeof roundUpFriendly === 'function' ? roundUpFriendly(totalCost / 0.65) : Math.ceil(totalCost / 0.65)) : '';

        const card = document.createElement('div');
        card.className = 'cgs-cost-card';
        card.setAttribute('data-recipe-name', item.name || '');
        card.setAttribute('data-category', categoryName);
        card.setAttribute('data-item-id', item.id || '');
        card.style.overflow = 'visible';

        let ingredientsRowsHtml = '';
        
        // Ensure ingredients_json is parsed correctly if it comes back as a string
        let ingredientsList = item.ingredients_json;
        if (typeof ingredientsList === 'string') {
            try { ingredientsList = JSON.parse(ingredientsList); } catch (e) { ingredientsList = []; }
        }

        if (ingredientsList && Array.isArray(ingredientsList) && ingredientsList.length > 0) {
            ingredientsList.forEach(ing => {
                const ingName = typeof toCamelCase === 'function' ? toCamelCase(ing.name || '') : (ing.name || '');
                const usedQty = ing.used_qty !== undefined ? ing.used_qty : '';
                const bulkQty = ing.bulk_qty !== undefined ? ing.bulk_qty : '';
                const bulkCost = ing.bulk_cost !== undefined ? ing.bulk_cost : '';
                const rowTotal = ing.total_cost !== undefined ? ing.total_cost : 0.00;

                ingredientsRowsHtml += `
                    <tr>
                        <td>
                            <div class="autocomplete-wrapper">
                                <input type="text" class="cgs-table-input ing-name-input" placeholder="Type ingredient..." value="${ingName}" disabled oninput="markUnsaved(this); handleLiveCamelCase(this); handleAutocomplete(this)" onfocus="handleAutocomplete(this)" onblur="handleBlur(this)" onkeydown="handleKeyNavigation(event, this)">
                                <button type="button" class="ing-delete-db-btn" title="Delete from Database" onclick="confirmDeleteFromDatabase(this)" style="display:${ingName ? 'block' : 'none'};">🗑️</button>
                                <div class="autocomplete-dropdown"></div>
                            </div>
                        </td>
                        <td><input type="number" class="cgs-table-input ing-serving-qty" value="${usedQty}" placeholder="0" disabled oninput="markUnsaved(this); calculateAll()"></td>
                        <td><input type="number" class="cgs-table-input ing-bulk-qty" value="${bulkQty}" placeholder="0" disabled oninput="markUnsaved(this); calculateAll()"></td>
                        <td><input type="number" step="0.01" class="cgs-table-input ing-bulk-cost" value="${bulkCost}" placeholder="0.00" disabled oninput="markUnsaved(this); calculateAll()"></td>
                        <td class="ing-total-cost">${Number(rowTotal).toFixed(2)}</td>
                        <td><button class="cgs-action-btn row-del-btn" disabled onclick="removeRow(this)">🗑️</button></td>
                    </tr>
                `;
            });
        } else {
            const fallbackUsed = item.used_qty !== undefined && item.used_qty !== null ? item.used_qty : '';
            const fallbackBulk = item.bulk_qty !== undefined && item.bulk_qty !== null ? item.bulk_qty : '';
            const fallbackCost = item.bulk_cost !== undefined && item.bulk_cost !== null ? item.bulk_cost : '';
            ingredientsRowsHtml = `
                <tr>
                    <td>
                        <div class="autocomplete-wrapper">
                            <input type="text" class="cgs-table-input ing-name-input" placeholder="Type ingredient..." value="" disabled oninput="markUnsaved(this); handleLiveCamelCase(this); handleAutocomplete(this)" onfocus="handleAutocomplete(this)" onblur="handleBlur(this)" onkeydown="handleKeyNavigation(event, this)">
                            <button type="button" class="ing-delete-db-btn" title="Delete from Database" onclick="confirmDeleteFromDatabase(this)">🗑️</button>
                            <div class="autocomplete-dropdown"></div>
                        </div>
                    </td>
                    <td><input type="number" class="cgs-table-input ing-serving-qty" value="${fallbackUsed}" placeholder="0" disabled oninput="markUnsaved(this); calculateAll()"></td>
                    <td><input type="number" class="cgs-table-input ing-bulk-qty" value="${fallbackBulk}" placeholder="0" disabled oninput="markUnsaved(this); calculateAll()"></td>
                    <td><input type="number" step="0.01" class="cgs-table-input ing-bulk-cost" value="${fallbackCost}" placeholder="0.00" disabled oninput="markUnsaved(this); calculateAll()"></td>
                    <td class="ing-total-cost">${Number(totalCost).toFixed(2)}</td>
                    <td><button class="cgs-action-btn row-del-btn" disabled onclick="removeRow(this)">🗑️</button></td>
                </tr>
            `;
        }

        const recipeTitle = typeof toCamelCase === 'function' ? toCamelCase(item.name || '') : (item.name || '');

        card.innerHTML = `
            <div class="cgs-card-header">
                <div class="cgs-recipe-meta">
                    <span class="cgs-recipe-title">${recipeTitle}</span>
                    <span class="cgs-recipe-category">${categoryName}</span>
                    <span class="unsaved-indicator">● Unsaved Changes</span>
                </div>
                <div>
                    <button class="cgs-action-btn" title="Duplicate Recipe" onclick="duplicateRecipe(this)">📋</button>
                    <button class="cgs-action-btn edit-recipe-btn" title="Edit Recipe" onclick="toggleEditRecipe(this)">✏️</button>
                    <button class="cgs-action-btn cancel-recipe-btn" title="Cancel Editing" style="display:none;" onclick="cancelEditRecipe(this)">❌</button>
                    <button class="cgs-action-btn" title="Delete Recipe" onclick="deleteRecipe(this)">🗑️</button>
                </div>
            </div>

            <div class="cgs-recipe-body-grid">
                <div class="cgs-photo-section">
                    <div class="cgs-photo-thumb" onclick="openPhotoModal(this)" title="Click to view full image">
                        ${item.image_url ? `<img src="${item.image_url}" style="width:100%; height:100%; object-fit:cover;">` : '<span>No Photo</span>'}
                    </div>
                    <input type="file" class="cgs-photo-input" accept="image/*" onchange="handlePhotoUpload(this)">
                    <label class="cgs-photo-upload-label" style="display:none;" onclick="this.previousElementSibling.click()">Upload Photo</label>
                </div>
                <div class="cgs-right-content">
                    <div class="cgs-financial-strip">
                        <div class="cgs-fin-block">
                            <div class="cgs-fin-label">Serving Size</div>
                            <div class="cgs-fin-value">
                                <input type="text" class="cgs-table-input recipe-serving-size-input" value="${item.qty || ''}" placeholder="500 ML" oninput="markUnsaved(this)" style="width:100%; text-align:center;">
                            </div>
                        </div>
                        <div class="cgs-fin-block">
                            <div class="cgs-fin-label">Base Price</div>
                            <div class="cgs-fin-value highlight-price">
                                <span class="auto-round-price">${autoRound !== '' ? '₹ ' + autoRound : ''}</span> 
                                <span style="font-size:0.75rem; color:var(--cgs-menu-text-muted); font-weight:normal;" class="auto-raw-price">${totalCost > 0 ? '(Auto: ₹ ' + totalCost.toFixed(2) + ')' : ''}</span>
                            </div>
                        </div>
                        <div class="cgs-fin-block">
                            <div class="cgs-fin-label">Custom Price</div>
                            <div class="cgs-fin-value">
                                <div class="cgs-input-group">
                                    <span>₹</span>
                                    <input type="number" class="custom-price-input" value="${displayPrice}" disabled oninput="markUnsaved(this); syncCustomPrice('price', this)">
                                </div>
                            </div>
                        </div>
                        <div class="cgs-fin-block">
                            <div class="cgs-fin-label">Custom Price Margin</div>
                            <div class="cgs-fin-value">
                                <div class="cgs-input-group">
                                    <input type="number" 
                                        class="custom-margin-input" 
                                        value="${displayMargin}" 
                                        min="1" 
                                        max="99"
                                        step="1" 
                                        disabled 
                                        oninput="handleCustomMarginInput(this)">
                                        <span>%</span>
                                </div>
                            </div>
                        </div>
                        <div class="cgs-fin-block">
                            <div class="cgs-fin-label">Total Recipe Cost</div>
                            <div class="cgs-fin-value total-recipe-cost">${totalCost > 0 ? '₹ ' + totalCost.toFixed(2) : ''}</div>
                        </div>
                    </div>

                    <div class="cgs-table-wrapper">
                        <table class="cgs-ingredient-table">
                            <thead>
                                <tr>
                                    <th style="width: 35%;">Ingredient</th>
                                    <th style="width: 18%;">Used Qty (gm/ml/pc)</th>
                                    <th style="width: 18%;">Bulk Qty (gm/ml/pc)</th>
                                    <th style="width: 14%;">Bulk Cost (₹)</th>
                                    <th style="width: 10%;">Total Cost (₹)</th>
                                    <th style="width: 5%;"></th>
                                </tr>
                            </thead>
                            <tbody class="ingredient-tbody">
                                ${ingredientsRowsHtml}
                            </tbody>
                        </table>
                    </div>

                    <div class="cgs-card-footer">
                        <button class="cgs-btn-primary add-ing-btn" disabled onclick="addIngredientRow(this)">+ Add Ingredient</button>
                        <span style="font-size: 0.8rem; color: var(--cgs-menu-text-muted);">Yield: ${item.qty || '1 Serving'}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    if (typeof calculateAll === 'function') {
        calculateAll();
    }
}



let originalCopiedName = '';
let isRecipeSavedInModal = false;

async function duplicateRecipe(btn) {
    const sourceCard = btn.closest('.cgs-cost-card');
    if (!sourceCard) return;

    isRecipeSavedInModal = false;

    const currentName = sourceCard.getAttribute('data-recipe-name') || sourceCard.querySelector('.cgs-recipe-title').textContent.trim();
    originalCopiedName = (currentName + ' (COPY)').toUpperCase();

    const newCard = sourceCard.cloneNode(true);
    newCard.setAttribute('data-item-id', 'temp_' + Date.now());
    newCard.style.width = '100%';
    newCard.style.maxWidth = '100%';

    let sourceCatId = sourceCard.getAttribute('data-category-id') || sourceCard.dataset.categoryId;
    if (sourceCatId && sourceCatId.length > 15) {
        newCard.setAttribute('data-category-id', sourceCatId);
    } else {
        newCard.removeAttribute('data-category-id');
    }

    const headerButtons = newCard.querySelectorAll('.cgs-action-btn');
    headerButtons.forEach(b => {
        const title = b.getAttribute('title') || '';
        if (title.includes('Duplicate') || title.includes('Delete')) {
            b.remove();
        }
    });

    const titleContainer = newCard.querySelector('.cgs-recipe-title');
    if (titleContainer) {
        titleContainer.innerHTML = `<input type="text" class="modal-recipe-name-input" value="${originalCopiedName}" placeholder="ENTER RECIPE NAME..." style="background: #27272a; border: 1px solid #ef4444; color: #fff; padding: 6px 10px; border-radius: 4px; font-size: 1rem; width: 100%; outline: none; text-transform: uppercase;" onblur="validateModalRecipeName(this)">`;
    }
    newCard.setAttribute('data-recipe-name', originalCopiedName);

    newCard.querySelectorAll('.row-del-btn').forEach(b => b.remove());
    const addIngBtn = newCard.querySelector('.add-ing-btn');
    if (addIngBtn) addIngBtn.remove();

    const table = newCard.querySelector('table');
    if (table) {
        table.style.width = '100%';
        table.style.tableLayout = 'fixed';
        const thead = table.querySelector('thead');
        if (thead) {
            thead.style.display = 'table';
            thead.style.width = '100%';
            thead.style.tableLayout = 'fixed';
        }
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.style.display = 'block';
            tbody.style.maxHeight = '250px';
            tbody.style.overflowY = 'auto';
            tbody.style.overflowX = 'hidden';
            tbody.style.width = '100%';
            tbody.querySelectorAll('tr').forEach(r => {
                r.style.display = 'table';
                r.style.width = '100%';
                r.style.tableLayout = 'fixed';
            });
        }
    }

    const editBtn = newCard.querySelector('.edit-recipe-btn');
    const cancelBtn = newCard.querySelector('.cancel-recipe-btn');
    const uploadLabel = newCard.querySelector('.cgs-photo-upload-label');
    const inputs = newCard.querySelectorAll('input:not(#menuSearch):not(#globalBaseMargin)');

    if (editBtn) editBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (uploadLabel) uploadLabel.style.display = 'block';
    inputs.forEach(input => { input.disabled = false; });

    newCard.addEventListener('input', function() {
        if (typeof calculateRecipeCost === 'function') {
            calculateRecipeCost(newCard);
        }
    });

    const modalBody = document.getElementById('recipeModalBody');
    if (modalBody) {
        modalBody.innerHTML = '';
        modalBody.appendChild(newCard);
    }

    const modal = document.getElementById('recipeModal');
    if (modal) {
        modal.style.display = 'flex';
    }

    const nameInput = newCard.querySelector('.modal-recipe-name-input');
    if (nameInput) validateModalRecipeName(nameInput);
}

async function deleteRecipe(btn) {
    const card = btn.closest('.cgs-cost-card');
    if (!card) return;

    // Get the database UUID from the card attribute
    const itemId = card.getAttribute('data-item-id');
    
    // If it's a brand new temporary modal item not yet saved to the database
    if (!itemId || itemId.startsWith('temp_')) {
        card.remove();
        return;
    }

    const confirmDelete = confirm("Are you sure you want to permanently delete this recipe from the database?");
    if (!confirmDelete) return;

    // Permanently delete the record from Supabase
    const { error } = await supabaseClient
        .from('items')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error('Error deleting item from Supabase:', error);
        alert('Failed to delete item from database: ' + error.message);
        return;
    }

    // Successfully deleted from backend, now remove it from the UI
    card.remove();
    alert('Recipe deleted successfully!');

    // Refresh the menu data if the function exists
    if (typeof loadMenuFromSupabase === 'function') {
        loadMenuFromSupabase();
    }
}

function confirmCloseRecipeModal() {
    if (!isRecipeSavedInModal) {
        const discard = confirm("Are you sure you want to discard your changes?");
        if (!discard) return;
    }
    closeRecipeModal();
}

function handleModalBackgroundClick(event) {
    if (event.target.id === 'recipeModal') {
        confirmCloseRecipeModal();
    }
}

function closeRecipeModal() {
    document.getElementById('recipeModal').style.display = 'none';
    document.getElementById('recipeModalBody').innerHTML = '';
}

async function validateModalRecipeName(input) {
    const rawValue = input.value;
    const newName = rawValue.toUpperCase();
    if (input.value !== newName) {
        input.value = newName;
    }

    const saveBtn = document.getElementById('modalSaveBtn');
    if (!saveBtn) return;

    let hasError = false;
    let errorMessage = '';

    if (!newName || newName.trim() === '') {
        hasError = true;
        errorMessage = 'Recipe name cannot be empty or blank spaces.';
    } else if (newName === originalCopiedName) {
        hasError = true;
        errorMessage = 'You must change/update the name to a unique value.';
    } else {
        const modalBody = document.getElementById('recipeModalBody');
        const card = modalBody.querySelector('.cgs-cost-card');
        if (card) {
            const rows = card.querySelectorAll('.ingredient-tbody tr');
            rows.forEach(row => {
                const nameInputRow = row.querySelector('.ing-name-input');
                const servingQtyInput = row.querySelector('.ing-serving-qty');
                const bulkQtyInput = row.querySelector('.ing-bulk-qty');
                const bulkCostInput = row.querySelector('.ing-bulk-cost');

                const hasAnyVal = (nameInputRow && nameInputRow.value.trim()) ||
                                  (servingQtyInput && servingQtyInput.value.trim()) ||
                                  (bulkQtyInput && bulkQtyInput.value.trim()) ||
                                  (bulkCostInput && bulkCostInput.value.trim());

                const hasAllVal = (nameInputRow && nameInputRow.value.trim()) &&
                                  (servingQtyInput && servingQtyInput.value.trim()) &&
                                  (bulkQtyInput && bulkQtyInput.value.trim()) &&
                                  (bulkCostInput && bulkCostInput.value.trim());

                if (hasAnyVal && !hasAllVal) {
                    hasError = true;
                    errorMessage = 'Please completely fill out all ingredient fields before saving.';
                }
            });
        }

        if (!hasError) {
            const allCards = document.querySelectorAll('.cgs-cost-card');
            allCards.forEach(c => {
                const titleEl = c.querySelector('.cgs-recipe-title');
                const cName = titleEl ? titleEl.textContent.trim().toUpperCase() : (c.getAttribute('data-recipe-name') || '').toUpperCase();
                if (cName && cName === newName) {
                    hasError = true;
                    errorMessage = 'An item with this exact name already exists in your menu!';
                }
            });

            if (!hasError && typeof supabaseClient !== 'undefined') {
                const { data } = await supabaseClient
                    .from('items')
                    .select('id')
                    .ilike('name', newName)
                    .maybeSingle();
                
                if (data) {
                    hasError = true;
                    errorMessage = 'An item with this name already exists in the database!';
                }
            }
        }
    }

    if (hasError) {
        input.style.borderColor = '#ef4444';
        input.style.background = 'rgba(239, 68, 68, 0.1)';
        saveBtn.disabled = true;
        saveBtn.style.cursor = 'not-allowed';
        saveBtn.style.opacity = '0.4';
        saveBtn.title = errorMessage;
    } else {
        input.style.borderColor = '#22c55e';
        input.style.background = 'transparent';
        saveBtn.disabled = false;
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.opacity = '1';
        saveBtn.title = 'Click to save new recipe';
    }
}

async function saveDuplicatedRecipeFromModal(btn) {
    const modalBody = document.getElementById('recipeModalBody');
    const card = modalBody.querySelector('.cgs-cost-card');
    if (!card) return;

    const nameInput = card.querySelector('.modal-recipe-name-input');
    const recipeName = nameInput ? nameInput.value.trim().toUpperCase() : '';

    if (!recipeName || recipeName === '') {
        alert('Please provide a valid unique name in UPPERCASE.');
        return;
    }

    card.setAttribute('data-recipe-name', recipeName);

    // Securely fetch category_id UUID from Supabase using original recipe name
    let categoryId = card.getAttribute('data-category-id');
    if ((!categoryId || categoryId.length < 15) && typeof supabaseClient !== 'undefined') {
        const baseOriginalName = originalCopiedName.replace(' (COPY)', '').trim();
        const { data: origItem } = await supabaseClient
            .from('items')
            .select('category_id')
            .ilike('name', baseOriginalName)
            .maybeSingle();
        if (origItem && origItem.category_id) {
            categoryId = origItem.category_id;
        }
    }

    const customPriceInput = card.querySelector('.custom-price-input');
    const customMarginInput = card.querySelector('.custom-margin-input');
    const servingSizeInput = card.querySelector('.recipe-serving-size-input');
    
    const customPrice = customPriceInput ? parseFloat(customPriceInput.value) || null : null;
    const customMargin = customMarginInput ? parseFloat(customMarginInput.value) || null : null;
    const servingSize = servingSizeInput ? servingSizeInput.value.trim() : '';

    let totalRecipeCost = 0;
    const ingredientsJson = [];
    const rows = card.querySelectorAll('.ingredient-tbody tr');

    rows.forEach(row => {
        const nameInputRow = row.querySelector('.ing-name-input');
        const usedQtyInput = row.querySelector('.ing-serving-qty');
        const bulkQtyInput = row.querySelector('.ing-bulk-qty');
        const bulkCostInput = row.querySelector('.ing-bulk-cost');
        const totalCostCell = row.querySelector('.ing-total-cost');

        const ingName = nameInputRow ? nameInputRow.value.trim() : '';
        const usedQty = usedQtyInput ? parseFloat(usedQtyInput.value) || 0 : 0;
        const bulkQty = bulkQtyInput ? parseFloat(bulkQtyInput.value) || 0 : 0;
        const bulkCost = bulkCostInput ? parseFloat(bulkCostInput.value) || 0 : 0;
        const rowTotal = totalCostCell ? parseFloat(totalCostCell.innerText) || 0 : 0;

        if (ingName) {
            ingredientsJson.push({
                name: ingName,
                used_qty: usedQty,
                bulk_qty: bulkQty,
                bulk_cost: bulkCost,
                total_cost: rowTotal
            });
            totalRecipeCost += rowTotal;
        }
    });

    const autoRound = totalRecipeCost > 0 ? (typeof roundUpFriendly === 'function' ? roundUpFriendly(totalRecipeCost / 0.65) : Math.ceil(totalRecipeCost / 0.65)) : 0;

    const payload = {
        name: recipeName,
        ingredients_json: ingredientsJson,
        total_cost: totalRecipeCost,
        base_price: autoRound,
        display_price: Math.max(autoRound, customPrice || 0),
        custom_price: customPrice,
        custom_margin: customMargin,
        qty: servingSize,
        is_hidden: false, // <--- FOREVER FIX: Explicitly ensures item is NOT hidden on UI menus
        updated_at: new Date()
    };

    if (categoryId && categoryId.length > 15) {
        payload.category_id = categoryId;
    }

    const { error } = await supabaseClient
        .from('items')
        .insert([payload]);

    if (error) {
        console.error('Error saving duplicated recipe:', error);
        alert('Failed to save the duplicated recipe to Supabase: ' + error.message);
        return;
    }

    isRecipeSavedInModal = true;
    alert('New recipe created and saved successfully!');
    closeRecipeModal();

    if (typeof loadMenuFromSupabase === 'function') {
        loadMenuFromSupabase();
    }
}

window.onload = function() {
    loadMenuFromSupabase();
    loadBaseMarginFromSupabase();
};