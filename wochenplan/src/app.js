/**
 * Wochenplan App - Haupteinstiegspunkt
 */

import { storage } from './core/storage.js';
import { recipeManager } from './core/recipe.js';
import { generateUUID, formatDate, debounce } from './utils/helpers.js';
import {
    DIET_OPTIONS, DEFAULT_TAXONOMY, emptyCriteria, filterRecipes, countActive,
    hasDiet, isCampingFriendly
} from './core/filter.js';

class WochenplanApp {
    constructor() {
        this.currentView = 'recipes';
        this.recipes = [];
        this.taxonomy = DEFAULT_TAXONOMY;
        this.criteria = storage.getSetting('filterCriteria', emptyCriteria());
    }

    /**
     * Initialisiere App
     */
    async init() {
        console.log('🍽️ Wochenplan App startet...');

        // Storage initialisieren
        await storage.init();
        console.log('✅ Storage initialisiert');

        // PWA registrieren (Service Worker)
        this.registerServiceWorker();

        // Filter-Begriffe laden und Panel + Formular aufbauen
        await this.loadTaxonomy();
        this.buildFilterPanel();
        this.buildRecipeFormOptions();

        // Event Listener
        this.setupEventListeners();

        // Rezepte aus dem Repo übernehmen (nur neue)
        const imported = await recipeManager.importBundledRecipes();
        if (imported) console.log(`📥 ${imported} Rezept(e) aus dem Repo importiert`);

        // Rezepte laden
        await this.loadRecipes();

        // Initial View rendern (inkl. gespeicherter Filter)
        this.applyFilters();

        console.log('✅ App bereit!');
    }

    /**
     * Lade feste Filter-Begriffe (data/taxonomy.json), sonst Standardwerte
     */
    async loadTaxonomy() {
        try {
            const res = await fetch('data/taxonomy.json', { cache: 'no-cache' });
            if (res.ok) this.taxonomy = { ...DEFAULT_TAXONOMY, ...(await res.json()) };
        } catch (err) {
            console.warn('Taxonomie nicht geladen, nutze Standardwerte:', err);
        }
    }

    /**
     * Baue Filter-Chips aus der Taxonomie
     */
    buildFilterPanel() {
        const c = this.criteria;

        this.renderChips('filter-diet', DIET_OPTIONS.map(d => ({ value: d.key, label: d.label })), 'diet');
        this.renderChips('filter-methods', this.taxonomy.cookingMethods.map(m => ({ value: m, label: m })), 'methods');
        this.renderChips('filter-categories', this.taxonomy.category.map(m => ({ value: m, label: m })), 'categories');
        this.renderChips('filter-exclude', this.taxonomy.equipment.map(m => ({ value: m, label: m })), 'excludeEquipment', true);

        const timeSelect = document.getElementById('filter-time');
        timeSelect.innerHTML = '<option value="">egal</option>' +
            this.taxonomy.durationFilter
                .filter(d => d.max)
                .map(d => `<option value="${d.max}">${this.escapeHtml(d.label)}</option>`)
                .join('');

        document.getElementById('filter-text').value = c.text || '';
        document.getElementById('filter-ingredients').value = (c.ingredients || []).join(', ');
        timeSelect.value = c.maxTime || '';
        document.getElementById('filter-camping').checked = !!c.camping;

        if (countActive(c) > 0) document.getElementById('filter-panel').open = true;
    }

    renderChips(containerId, options, criteriaKey, isExclude = false) {
        const container = document.getElementById(containerId);
        const selected = this.criteria[criteriaKey] || [];
        container.innerHTML = '';

        options.forEach(opt => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chip' + (isExclude ? ' exclude' : '');
            chip.textContent = opt.label;
            chip.setAttribute('aria-pressed', selected.includes(opt.value) ? 'true' : 'false');
            chip.addEventListener('click', () => {
                const list = this.criteria[criteriaKey] || [];
                const idx = list.indexOf(opt.value);
                if (idx >= 0) list.splice(idx, 1); else list.push(opt.value);
                this.criteria[criteriaKey] = list;
                chip.setAttribute('aria-pressed', idx >= 0 ? 'false' : 'true');
                this.applyFilters();
            });
            container.appendChild(chip);
        });
    }

    /**
     * Felder im Rezept-Formular aus der Taxonomie bauen
     */
    buildRecipeFormOptions() {
        document.getElementById('recipe-category').innerHTML =
            '<option value="">–</option>' +
            this.taxonomy.category.map(c => `<option value="${c}">${this.escapeHtml(c)}</option>`).join('');

        const checks = (id, items) => {
            document.getElementById(id).innerHTML = items.map(it =>
                `<label><input type="checkbox" value="${this.escapeHtml(it.value)}"> ${this.escapeHtml(it.label)}</label>`
            ).join('');
        };

        checks('form-diet', DIET_OPTIONS.map(d => ({ value: d.key, label: d.label })));
        checks('form-methods', this.taxonomy.cookingMethods.map(m => ({ value: m, label: m })));
        checks('form-equipment', this.taxonomy.equipment.map(m => ({ value: m, label: m })));
    }

    checkedValues(containerId) {
        return [...document.querySelectorAll(`#${containerId} input:checked`)].map(i => i.value);
    }

    /**
     * Filter anwenden und speichern
     */
    applyFilters() {
        storage.setSetting('filterCriteria', this.criteria);
        const count = countActive(this.criteria);
        const badge = document.getElementById('filter-count');
        badge.hidden = count === 0;
        badge.textContent = count;
        if (this.currentView === 'recipes') this.renderRecipesView();
    }

    resetFilters() {
        this.criteria = emptyCriteria();
        this.buildFilterPanel();
        this.applyFilters();
    }

    /**
     * Registriere Service Worker (PWA)
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.warn('Service Worker Registration failed:', err);
            });
        }
    }

    /**
     * Setup Event Listener
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Filter
        const onTextInput = debounce(() => {
            this.criteria.text = document.getElementById('filter-text').value.trim();
            this.criteria.ingredients = document.getElementById('filter-ingredients').value
                .split(',').map(s => s.trim()).filter(Boolean);
            this.applyFilters();
        }, 250);
        document.getElementById('filter-text').addEventListener('input', onTextInput);
        document.getElementById('filter-ingredients').addEventListener('input', onTextInput);
        document.getElementById('filter-time').addEventListener('change', (e) => {
            this.criteria.maxTime = e.target.value ? parseInt(e.target.value) : null;
            this.applyFilters();
        });
        document.getElementById('filter-camping').addEventListener('change', (e) => {
            this.criteria.camping = e.target.checked;
            this.applyFilters();
        });
        document.getElementById('filter-reset').addEventListener('click', () => this.resetFilters());

        // Detail-Ansicht
        document.getElementById('detail-back').addEventListener('click', () => this.switchView('recipes'));

        // Rezept-Form
        document.getElementById('recipe-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRecipeFormSubmit();
        });
    }

    /**
     * Wechsle View
     */
    switchView(viewName) {
        // Update nav
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Update containers
        document.querySelectorAll('.container').forEach(container => {
            container.classList.remove('active');
        });

        // Zeige neue View
        const viewId = `${viewName}-view`;
        const viewElement = document.getElementById(viewId);
        if (viewElement) {
            viewElement.classList.add('active');
        }

        this.currentView = viewName;

        // View-spezifische Aktionen
        if (viewName === 'recipes') {
            this.renderRecipesView();
        } else if (viewName === 'add-recipe') {
            this.resetRecipeForm();
        }
    }

    /**
     * Lade Rezepte aus Storage
     */
    async loadRecipes() {
        this.recipes = await recipeManager.getAllRecipes();
        console.log(`📚 ${this.recipes.length} Rezepte geladen`);
    }

    /**
     * Render Rezepte-Übersicht
     */
    renderRecipesView() {
        const grid = document.getElementById('recipe-grid');
        const emptyState = document.getElementById('recipes-empty');
        const result = document.getElementById('filter-result');

        grid.innerHTML = '';

        if (this.recipes.length === 0) {
            emptyState.style.display = 'block';
            result.textContent = '';
            return;
        }

        emptyState.style.display = 'none';

        const filtered = filterRecipes(this.recipes, this.criteria, this.taxonomy)
            .sort((a, b) => a.title.localeCompare(b.title, 'de'));

        result.textContent = countActive(this.criteria) > 0
            ? `${filtered.length} von ${this.recipes.length} Rezepten`
            : `${this.recipes.length} ${this.recipes.length === 1 ? 'Rezept' : 'Rezepte'}`;

        if (filtered.length === 0) {
            grid.innerHTML = '<p class="empty-state">Kein Rezept passt zu diesen Filtern.</p>';
            return;
        }

        filtered.forEach(recipe => {
            grid.appendChild(this.createRecipeCard(recipe));
        });
    }

    /**
     * Erstelle Rezept-Karte
     */
    createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';

        const dietBadges = ['vegan', 'vegetarisch']
            .find(k => hasDiet(recipe, k));
        const veganOption = dietBadges !== 'vegan' && recipe.diet?.veganMoeglich;
        const camping = (recipe.equipment || []).length > 0 &&
            isCampingFriendly(recipe, this.taxonomy.campingEquipment?.available || []);

        card.innerHTML = `
            <h3>${this.escapeHtml(recipe.title)}</h3>
            <div class="meta">
                <span>⏱️ ${recipe.cookTime ? recipe.cookTime + ' min' : 'N/A'}</span>
                ${recipe.servings ? `<span>🍽️ ${recipe.servings} Pers.</span>` : ''}
                ${camping ? '<span title="campingtauglich">⛺</span>' : ''}
                <span>📊 ${this.getDifficultyEmoji(recipe.difficulty)}</span>
                ${recipe.feedback?.childrenRating ?
                    `<span>👧👦 ${this.getRatingStars(recipe.feedback.childrenRating)}</span>`
                    : ''}
            </div>
            <div class="tags" style="margin-bottom: 0.4rem;">
                ${dietBadges ? `<span class="badge">${dietBadges}</span>` : ''}
                ${veganOption ? '<span class="badge">vegan möglich</span>' : ''}
            </div>
            <div class="tags">
                ${(recipe.tags || []).map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn-secondary" onclick="app.viewRecipe('${recipe.id}')">👁️ Ansehen</button>
                <button class="btn-danger" onclick="app.deleteRecipe('${recipe.id}')">🗑️ Löschen</button>
            </div>
        `;

        return card;
    }

    /**
     * Zeige Rezept-Detail
     */
    async viewRecipe(id) {
        const recipe = await recipeManager.getRecipe(id);
        if (!recipe) {
            alert('❌ Rezept nicht gefunden');
            return;
        }

        document.getElementById('recipe-detail').innerHTML = this.renderRecipeDetail(recipe);
        this.switchView('recipe-detail');
        window.scrollTo(0, 0);
    }

    renderRecipeDetail(recipe) {
        const esc = (t) => this.escapeHtml(t ?? '');

        const diets = DIET_OPTIONS.filter(d => hasDiet(recipe, d.key));
        const equipment = (recipe.equipment || []).map(e => (typeof e === 'string' ? e : e.name));
        const camping = equipment.length > 0 &&
            isCampingFriendly(recipe, this.taxonomy.campingEquipment?.available || []);

        const ingredients = (recipe.ingredients || []).map(i => {
            const amount = [i.amount ?? '', i.unit || ''].join(' ').trim();
            return `<li>
                <span class="amount">${esc(amount)}</span><span>${esc(i.name)}</span>
                ${i.veganAlternative ? `<span class="alt">vegan: ${esc(i.veganAlternative)}</span>` : ''}
            </li>`;
        }).join('');

        // Schritte: bevorzugt als Liste, sonst aus dem Anleitungstext
        let steps = Array.isArray(recipe.steps) && recipe.steps.length ? recipe.steps : null;
        if (!steps && recipe.instructions) {
            steps = recipe.instructions.split('\n')
                .map(l => l.replace(/^\s*\d+[.)]\s*/, '').trim())
                .filter(Boolean);
        }
        const stepsHtml = steps && steps.length
            ? `<ol class="step-list">${steps.map(st => `<li>${esc(st)}</li>`).join('')}</ol>`
            : '<p>Keine Anleitung hinterlegt.</p>';

        const tips = (recipe.tips || []).map(t => `<p class="tip">${esc(t)}</p>`).join('');
        const childNotes = recipe.variants?.children?.notes;

        return `
            <h2>${esc(recipe.title)}</h2>
            <div class="detail-facts">
                ${recipe.servings ? `<span>🍽️ ${recipe.servings} Portionen</span>` : ''}
                <span>⏱️ ${recipe.cookTime ? 'ca. ' + recipe.cookTime + ' Min.' : 'Dauer unbekannt'}</span>
                ${recipe.category ? `<span>📂 ${esc(recipe.category)}</span>` : ''}
                <span>📊 ${this.getDifficultyLabel(recipe.difficulty)}</span>
                ${camping ? '<span>⛺ campingtauglich</span>' : ''}
            </div>
            ${diets.length ? `<div class="tags" style="margin-bottom:0.5rem;">${diets.map(d => `<span class="badge">${esc(d.label)}</span>`).join('')}</div>` : ''}
            ${(recipe.cookingMethods || []).length ? `<div class="tags">${recipe.cookingMethods.map(m => `<span class="tag">${esc(m)}</span>`).join('')}</div>` : ''}

            <div class="detail-columns">
                <section>
                    <h3>Zutaten</h3>
                    ${ingredients ? `<ul class="ingredient-list">${ingredients}</ul>` : '<p>Keine Zutaten hinterlegt.</p>'}
                    ${equipment.length ? `
                        <div class="detail-section">
                            <h3>Küchengeräte</h3>
                            <p>${equipment.map(esc).join(', ')}</p>
                        </div>` : ''}
                </section>
                <section>
                    <h3>Zubereitung</h3>
                    ${stepsHtml}
                    ${tips ? `<div class="detail-section"><h3>Tipps</h3>${tips}</div>` : ''}
                    ${childNotes ? `<div class="detail-section"><h3>Kinder-Variante</h3><p>${esc(childNotes)}</p></div>` : ''}
                </section>
            </div>
            ${recipe.source ? `<p class="hint detail-section">Quelle: ${esc(recipe.source)}</p>` : ''}
        `;
    }

    getDifficultyLabel(difficulty) {
        return { easy: 'einfach', medium: 'mittel', hard: 'schwierig' }[difficulty] || '–';
    }

    /**
     * Lösche Rezept
     */
    async deleteRecipe(id) {
        if (!confirm('Rezept wirklich löschen?')) return;

        await recipeManager.deleteRecipe(id);
        await this.loadRecipes();
        this.renderRecipesView();
        alert('✅ Rezept gelöscht');
    }

    /**
     * Verarbeite Rezept-Form Submit
     */
    async handleRecipeFormSubmit() {
        const title = document.getElementById('recipe-title').value.trim();
        const source = document.getElementById('recipe-source').value.trim();
        const cookTime = document.getElementById('recipe-cooktime').value;
        const difficulty = document.getElementById('recipe-difficulty').value;
        const servings = document.getElementById('recipe-servings').value;
        const category = document.getElementById('recipe-category').value || null;
        const dietKeys = this.checkedValues('form-diet');
        const diet = Object.fromEntries(DIET_OPTIONS.map(d => [d.key, dietKeys.includes(d.key)]));
        if (diet.vegan) diet.vegetarisch = diet.veganMoeglich = diet.laktosefrei = true;
        if (diet.vegetarisch) diet.ohneSchwein = diet.ohneFleisch = diet.ohneFisch = true;
        const cookingMethods = this.checkedValues('form-methods');
        const equipment = this.checkedValues('form-equipment').map(name => ({ name, required: true }));
        const ingredients = document.getElementById('recipe-ingredients').value.trim();
        const instructions = document.getElementById('recipe-instructions').value.trim();
        const tags = document.getElementById('recipe-tags').value.trim();
        const childrenNotes = document.getElementById('recipe-children-notes').value.trim();

        if (!title) {
            alert('❌ Rezept-Name erforderlich');
            return;
        }

        try {
            const recipe = await recipeManager.createRecipe({
                title,
                source,
                category,
                servings,
                cookTime,
                difficulty,
                diet,
                cookingMethods,
                equipment,
                ingredients,
                instructions,
                tags,
                childrenNotes,
                photos: []
            });

            console.log('✅ Rezept erstellt:', recipe);

            // Foto-Upload (falls vorhanden)
            const photoInput = document.getElementById('recipe-photos');
            if (photoInput.files.length > 0) {
                await this.handlePhotoUpload(recipe.id, photoInput.files);
            }

            // Reset Form
            this.resetRecipeForm();

            // Zurück zu Rezepte-View
            await this.loadRecipes();
            this.switchView('recipes');

            alert('✅ Rezept gespeichert!');
        } catch (error) {
            console.error('Fehler beim Erstellen des Rezepts:', error);
            alert('❌ Fehler: ' + error.message);
        }
    }

    /**
     * Verarbeite Foto-Upload
     */
    async handlePhotoUpload(recipeId, files) {
        const recipe = await recipeManager.getRecipe(recipeId);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const photoId = generateUUID();

            try {
                await storage.savePhoto(photoId, file);
                recipe.photos.push(photoId);
                console.log(`✅ Foto ${i + 1} gespeichert`);
            } catch (error) {
                console.error(`Fehler beim Speichern von Foto ${i + 1}:`, error);
            }
        }

        await storage.saveRecipe(recipe);
    }

    /**
     * Reset Rezept-Form
     */
    resetRecipeForm() {
        document.getElementById('recipe-form').reset();
    }

    /**
     * Hilfsfunktionen UI
     */

    getDifficultyEmoji(difficulty) {
        const emojis = {
            easy: '🟢',
            medium: '🟡',
            hard: '🔴'
        };
        return emojis[difficulty] || '⚪';
    }

    getRatingStars(rating) {
        return '⭐'.repeat(Math.round(rating));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialisiere App
const app = new WochenplanApp();
app.init().catch(err => {
    console.error('❌ App Init Error:', err);
});

// Expose global für onclick Attribute
window.app = app;
