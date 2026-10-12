/**
 * Rezept-Filter
 * Reine Funktionen, kein DOM. Kriterien kommen aus dem Filter-Panel.
 *
 * Logik:
 *  - Zutaten: UND (alle genannten Zutaten müssen vorkommen)
 *  - Ernährung: UND (alle gewählten Eigenschaften müssen zutreffen)
 *  - Zubereitungsart: ODER (z.B. Ofen ODER Onepot)
 *  - Kategorie: ODER
 *  - Dauer: maximal X Minuten
 *  - Camping: alle benötigten Geräte müssen in der Camping-Liste stehen
 *  - Geräte ausschließen: kein benötigtes Gerät darf auf dieser Liste stehen
 */

export const DIET_OPTIONS = [
    { key: 'vegetarisch', label: 'vegetarisch' },
    { key: 'vegan', label: 'vegan' },
    { key: 'veganMoeglich', label: 'vegan möglich' },
    { key: 'ohneSchwein', label: 'ohne Schwein' },
    { key: 'ohneFleisch', label: 'ohne Fleisch' },
    { key: 'ohneFisch', label: 'ohne Fisch' },
    { key: 'laktosefrei', label: 'laktosefrei' },
    { key: 'glutenfrei', label: 'glutenfrei' },
    { key: 'nussfrei', label: 'nussfrei' }
];

// Für ältere Rezepte ohne diet-Objekt: passende Tags werten wir ebenfalls aus
const DIET_TAG_FALLBACK = {
    vegetarisch: ['vegetarisch', 'veggie'],
    vegan: ['vegan'],
    veganMoeglich: ['vegan', 'vegan-möglich'],
    ohneSchwein: ['ohne-schwein', 'vegetarisch', 'vegan'],
    ohneFleisch: ['ohne-fleisch', 'vegetarisch', 'vegan'],
    ohneFisch: ['ohne-fisch', 'vegetarisch', 'vegan'],
    laktosefrei: ['laktosefrei', 'vegan'],
    glutenfrei: ['glutenfrei'],
    nussfrei: ['nussfrei']
};

export const DEFAULT_TAXONOMY = {
    category: ['hauptgericht', 'beilage', 'suppe', 'salat', 'frühstück', 'snack', 'dessert', 'backen'],
    cookingMethods: ['ofen', 'pfanne', 'onepot', 'suppe', 'pasta', 'fisch', 'fleisch', 'süß', 'grill', 'ohne-kochen'],
    equipment: ['Herd', 'Kochtopf', 'Pfanne', 'Wok', 'Backofen', 'Auflaufform', 'Backblech', 'Standmixer',
        'Pürierstab', 'Küchenmaschine', 'Reibe', 'Sieb', 'Grill'],
    campingEquipment: { available: ['Herd', 'Kochtopf', 'Pfanne', 'Reibe', 'Sieb', 'Grill'] },
    durationFilter: [
        { label: 'bis 20 Min.', max: 20 },
        { label: 'bis 30 Min.', max: 30 },
        { label: 'bis 45 Min.', max: 45 }
    ]
};

export function emptyCriteria() {
    return {
        text: '',
        ingredients: [],
        diet: [],
        methods: [],
        categories: [],
        maxTime: null,
        camping: false,
        excludeEquipment: []
    };
}

/** Kleinbuchstaben + Umlaute vereinheitlichen, damit "Grünkohl" = "gruenkohl" */
export function normalize(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .trim();
}

function tagsOf(recipe) {
    return (recipe.tags || []).map(normalize);
}

export function hasDiet(recipe, key) {
    if (recipe.diet && recipe.diet[key] === true) return true;
    if (key === 'veganMoeglich' && recipe.diet && recipe.diet.vegan === true) return true;
    if (recipe.diet && key in recipe.diet) return false;
    const tags = tagsOf(recipe);
    return (DIET_TAG_FALLBACK[key] || []).some(t => tags.includes(normalize(t)));
}

export function methodsOf(recipe) {
    if (Array.isArray(recipe.cookingMethods) && recipe.cookingMethods.length) {
        return recipe.cookingMethods.map(normalize);
    }
    return tagsOf(recipe);
}

export function requiredEquipment(recipe) {
    return (recipe.equipment || [])
        .filter(e => e.required !== false)
        .map(e => (typeof e === 'string' ? e : e.name));
}

/** Rezept ist campingtauglich, wenn alle benötigten Geräte in der Camping-Liste stehen */
export function isCampingFriendly(recipe, campingAvailable) {
    const available = campingAvailable.map(normalize);
    const needed = requiredEquipment(recipe);
    if (needed.length === 0) return recipe.campingTauglich === true;
    return needed.every(eq => available.includes(normalize(eq)));
}

function ingredientTerms(recipe) {
    const terms = [];
    (recipe.ingredients || []).forEach(i => {
        terms.push(normalize(i.name));
        (i.search || []).forEach(s => terms.push(normalize(s)));
    });
    return terms;
}

export function matchesCriteria(recipe, criteria, taxonomy = DEFAULT_TAXONOMY) {
    const c = { ...emptyCriteria(), ...criteria };

    if (c.text) {
        const q = normalize(c.text);
        const haystack = [
            normalize(recipe.title),
            ...tagsOf(recipe),
            ...ingredientTerms(recipe)
        ];
        if (!haystack.some(h => h.includes(q))) return false;
    }

    if (c.ingredients.length) {
        const terms = ingredientTerms(recipe);
        const allFound = c.ingredients.every(wanted => {
            const w = normalize(wanted);
            return w === '' || terms.some(t => t.includes(w));
        });
        if (!allFound) return false;
    }

    if (c.diet.length && !c.diet.every(key => hasDiet(recipe, key))) return false;

    if (c.methods.length) {
        const methods = methodsOf(recipe);
        if (!c.methods.some(m => methods.includes(normalize(m)))) return false;
    }

    if (c.categories.length) {
        const cat = normalize(recipe.category);
        const tags = tagsOf(recipe);
        if (!c.categories.some(k => cat === normalize(k) || tags.includes(normalize(k)))) return false;
    }

    if (c.maxTime) {
        if (!recipe.cookTime || recipe.cookTime > c.maxTime) return false;
    }

    if (c.camping) {
        const available = taxonomy.campingEquipment?.available || DEFAULT_TAXONOMY.campingEquipment.available;
        if (!isCampingFriendly(recipe, available)) return false;
    }

    if (c.excludeEquipment.length) {
        const needed = requiredEquipment(recipe).map(normalize);
        if (c.excludeEquipment.some(ex => needed.includes(normalize(ex)))) return false;
    }

    return true;
}

export function filterRecipes(recipes, criteria, taxonomy = DEFAULT_TAXONOMY) {
    return recipes.filter(r => matchesCriteria(r, criteria, taxonomy));
}

export function countActive(criteria) {
    const c = { ...emptyCriteria(), ...criteria };
    return (c.text ? 1 : 0) + c.ingredients.length + c.diet.length + c.methods.length +
        c.categories.length + (c.maxTime ? 1 : 0) + (c.camping ? 1 : 0) + c.excludeEquipment.length;
}
