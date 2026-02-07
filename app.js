// Pokemon Battle Planner - Main Application Logic

// ============================================
// STATE MANAGEMENT
// ============================================

const MAX_ROSTER_SIZE = 18; // Maximum Pokemon in roster
const BATTLE_TEAM_SIZE = 6; // Pokemon shown in battle matrix

const state = {
    myTeam: Array(MAX_ROSTER_SIZE).fill(null).map(() => ({ pokemon: null, moves: [null, null, null, null], ability: null, teraType: null, item: null, level: null })),
    enemyTeam: Array(MAX_ROSTER_SIZE).fill(null).map(() => ({ pokemon: null, moves: [null, null, null, null], ability: null, teraType: null, item: null, level: null })),
    faintedMyTeam: Array(MAX_ROSTER_SIZE).fill(false), // Track fainted state for my team
    faintedEnemyTeam: Array(MAX_ROSTER_SIZE).fill(false), // Track fainted state for enemy team
    currentView: 'builder',
    includeAccuracy: true, // Toggle for accuracy in calculations
    filterWeakMoves: true, // Filter out moves with power < 50
    damageMode: 'percent', // 'effective' for relative power, 'damage' for HP, 'percent' for % HP
    fieldEffect: 'none', // Weather/terrain: none, sun, rain, sand, snow, grassy, electric, psychic, misty, trickroom, magicroom, wonderroom
    // For modal context
    modalContext: {
        type: null, // 'pokemon', 'move', 'ability', 'tera', or 'item'
        team: null, // 'my' or 'enemy'
        slotIndex: null,
        moveIndex: null
    },
    // Simulation state
    simulationState: {
        phase: 'select_moves', // 'select_moves' | 'choose_order' | 'execute'
        myActiveIndex: 0,
        enemyActiveIndex: 0,
        myCurrentHP: null,     // Tracks active Pokemon HP (for backward compat)
        enemyCurrentHP: null,
        myMaxHP: null,         // Store max HP for percentage calculations
        enemyMaxHP: null,
        myTeamHP: [],          // HP for all my team members: [{current, max}, ...]
        enemyTeamHP: [],       // HP for all enemy team members
        mySelectedAction: null,  // { type: 'move', move: moveData } or { type: 'swap', targetIndex: n }
        enemySelectedAction: null,
        myChargingMove: null,    // { move: moveData, moveName: string } - for two-turn moves
        enemyChargingMove: null,
        // Stat modifiers for active Pokemon: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 }
        myStatMods: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 },
        enemyStatMods: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 },
        // Status conditions: null, 'burn', 'poison', 'paralysis', 'sleep', 'freeze', 'toxic'
        myStatus: null,
        enemyStatus: null,
        turnLog: [],
        battleStarted: false,
        undoHistory: []  // Stack of previous states for undo
    }
};

// All 18 types for Tera selection
const ALL_TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    // Views
    builderView: document.getElementById('builder-view'),
    battleView: document.getElementById('battle-view'),
    simulationView: document.getElementById('simulation-view'),
    
    // Nav
    navTabs: document.querySelectorAll('.nav-tab'),
    
    // Team slots
    myTeamSlots: document.getElementById('my-team-slots'),
    enemyTeamSlots: document.getElementById('enemy-team-slots'),
    
    // Battle matrix
    combinedMatrix: document.getElementById('combined-matrix'),
    includeAccuracyCheckbox: document.getElementById('include-accuracy'),
    filterWeakMovesCheckbox: document.getElementById('filter-weak-moves'),
    damageModeSelect: document.getElementById('damage-mode-select'),
    formulaSubtitle: document.getElementById('formula-subtitle'),
    fieldEffectSelect: document.getElementById('field-effect-select'),
    
    // My Team actions
    saveTeamBtn: document.getElementById('save-team-btn'),
    loadTeamSelect: document.getElementById('load-team-select'),
    deleteTeamBtn: document.getElementById('delete-team-btn'),
    teamNameInput: document.getElementById('team-name-input'),
    
    // Enemy Team actions
    saveEnemyBtn: document.getElementById('save-enemy-btn'),
    loadEnemySelect: document.getElementById('load-enemy-select'),
    enemyTeamNameInput: document.getElementById('enemy-team-name-input'),
    clearEnemyBtn: document.getElementById('clear-enemy-btn'),
    
    // Modals
    pokemonModal: document.getElementById('pokemon-modal'),
    moveModal: document.getElementById('move-modal'),
    abilityModal: document.getElementById('ability-modal'),
    teraModal: document.getElementById('tera-modal'),
    itemModal: document.getElementById('item-modal'),
    pokemonSearch: document.getElementById('pokemon-search'),
    moveSearch: document.getElementById('move-search'),
    abilitySearch: document.getElementById('ability-search'),
    itemSearch: document.getElementById('item-search'),
    pokemonGrid: document.getElementById('pokemon-grid'),
    moveList: document.getElementById('move-list'),
    abilityList: document.getElementById('ability-list'),
    teraList: document.getElementById('tera-list'),
    itemList: document.getElementById('item-list')
};

// ============================================
// INITIALIZATION
// ============================================

function init() {
    renderTeamSlots();
    renderBattleView();
    setupEventListeners();
    loadSavedTeams();
    loadLastSelectedTeams(); // Auto-load last used teams
    populatePokemonGrid();
    populateMoveList();
    populateAbilityList();
    populateItemList();
    initMoveTooltip();
    initPokemonTooltip();
    initTypeTooltip();
}

// ============================================
// MOVE TOOLTIP
// ============================================

// Format effect name for display
function formatEffectName(effect) {
    if (!effect) return '';
    const effectMap = {
        'paralysis': 'Paralysis',
        'burn': 'Burn',
        'freeze': 'Freeze',
        'poison': 'Poison',
        'badly_poison': 'Toxic',
        'sleep': 'Sleep',
        'confusion': 'Confusion',
        'flinch': 'Flinch',
        'recoil': 'Recoil',
        'recharge': 'Recharge',
        'priority': '+1 Priority',
        'priority_plus2': '+2 Priority',
        'high_critical_hit': 'High Crit',
        'lowers_defense': '↓ Defense',
        'lowers_sp_def': '↓ Sp. Def',
        'lowers_attack': '↓ Attack',
        'lowers_sp_atk': '↓ Sp. Atk',
        'lowers_speed': '↓ Speed',
        'lowers_accuracy': '↓ Accuracy',
        'raises_attack': '↑ Attack',
        'raises_defense': '↑ Defense',
        'raises_sp_atk': '↑ Sp. Atk',
        'raises_sp_def': '↑ Sp. Def',
        'raises_speed': '↑ Speed',
        'user_faints': 'User Faints',
        'never_misses': 'Never Misses',
        'heals_user': 'Heals User',
        'burn_freeze_paralysis': 'Burn/Freeze/Para',
        'steals_item': 'Steals Item',
        'power_doubles_when_statused': '2x if Statused',
        'power_doubles_if_ally_fainted': '2x if Ally KO\'d',
        'confusion_after': 'Self Confusion',
        'trap': 'Traps Target'
    };
    return effectMap[effect] || effect.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function initMoveTooltip() {
    const tooltip = document.getElementById('move-tooltip');
    
    document.addEventListener('mouseover', (e) => {
        const trigger = e.target.closest('.move-tooltip-trigger');
        if (!trigger) return;
        
        const name = trigger.dataset.moveName;
        const type = trigger.dataset.moveType;
        const category = trigger.dataset.moveCategory;
        const power = trigger.dataset.movePower;
        const accuracy = trigger.dataset.moveAccuracy;
        const description = trigger.dataset.moveDescription;
        const effectivePower = trigger.dataset.effectivePower;
        const damagePercent = trigger.dataset.damagePercent;
        const damageRolls = trigger.dataset.damageRolls;
        
        // Get full move data for effect info
        const moveData = getMoveByName(name);
        
        // Update tooltip content
        tooltip.querySelector('.tooltip-move-name').textContent = name;
        
        const typeBadge = tooltip.querySelector('.tooltip-type-badge');
        typeBadge.textContent = type;
        typeBadge.className = `tooltip-type-badge type-${type}`;
        
        tooltip.querySelector('.tooltip-category').textContent = category;
        tooltip.querySelector('#tooltip-power').textContent = power > 0 ? power : '—';
        tooltip.querySelector('#tooltip-accuracy').textContent = accuracy ? `${accuracy}%` : '—';
        
        // Update effect chance (use getPrimaryStatusEffect for new effects array format)
        const effectContainer = tooltip.querySelector('#tooltip-effect-container');
        const effectValueEl = tooltip.querySelector('#tooltip-effect');
        const primaryEffect = moveData ? getPrimaryStatusEffect(moveData) : null;
        if (primaryEffect && primaryEffect.chance > 0) {
            effectContainer.style.display = 'flex';
            // Apply ability effects to effect chance (e.g., Serene Grace)
            const attackerAbility = trigger.dataset.attackerAbility;
            const effectiveChance = applyAbilityToEffectChance(attackerAbility, primaryEffect.chance);
            effectValueEl.textContent = `${Math.round(effectiveChance)}%`;
            effectValueEl.title = abilityAffectsEffectChance(attackerAbility) ? 'Modified by ability' : '';
        } else {
            effectContainer.style.display = 'none';
        }
        
        // Update effective power / actual damage based on mode
        const effectiveContainer = tooltip.querySelector('#tooltip-effective-container');
        const effectiveLabel = tooltip.querySelector('#tooltip-effective-label');
        const effectiveValueEl = tooltip.querySelector('#tooltip-effective');
        const damageHP = trigger.dataset.damageHp;
        
        if (effectivePower || damagePercent || damageHP) {
            effectiveContainer.style.display = 'flex';
            
            if (state.damageMode === 'damage' && damageHP) {
                effectiveLabel.textContent = 'Damage';
                effectiveValueEl.textContent = `${damageHP} HP`;
                effectiveValueEl.className = 'tooltip-stat-value tooltip-effective-value damage-mode';
            } else if (state.damageMode === 'percent' && damagePercent) {
                effectiveLabel.textContent = 'Damage';
                effectiveValueEl.textContent = `${damagePercent}%`;
                effectiveValueEl.className = 'tooltip-stat-value tooltip-effective-value damage-mode';
            } else if (effectivePower) {
                effectiveLabel.textContent = 'Effective';
                effectiveValueEl.textContent = effectivePower;
                effectiveValueEl.className = 'tooltip-stat-value tooltip-effective-value';
            } else {
                effectiveContainer.style.display = 'none';
            }
        } else {
            effectiveContainer.style.display = 'none';
        }
        
        tooltip.querySelector('.tooltip-description').textContent = description;
        
        // Position tooltip
        const rect = trigger.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left;
        let top = rect.top - 10;
        
        // Show tooltip to measure it
        tooltip.classList.add('visible');
        const actualHeight = tooltip.offsetHeight;
        
        // Position above the element
        top = rect.top - actualHeight - 10;
        
        // Keep within viewport
        if (top < 10) {
            top = rect.bottom + 10; // Show below instead
        }
        if (left + 300 > window.innerWidth) {
            left = window.innerWidth - 310;
        }
        if (left < 10) {
            left = 10;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltipManager.open('move-tooltip');
    });
    
    const hideTooltip = () => {
        tooltip.classList.remove('visible');
    };
    
    document.addEventListener('mouseout', (e) => {
        const trigger = e.target.closest('.move-tooltip-trigger');
        if (!trigger && e.target !== tooltip && !tooltip.contains(e.target)) return;
        
        const related = e.relatedTarget;
        
        // Check if moving to any tooltip in the stack
        if (related && tooltipManager.isOverAnyTooltip(related)) {
            tooltipManager.cancelHide('move-tooltip');
            return;
        }
        
        // Check if moving to the tooltip itself
        if (related && (tooltip.contains(related) || related === tooltip)) {
            tooltipManager.cancelHide('move-tooltip');
            return;
        }
        
        // Check if moving to another part of the same trigger
        if (related && trigger && trigger.contains(related)) return;
        
        tooltipManager.scheduleHide('move-tooltip', hideTooltip);
    });
    
    tooltip.addEventListener('mouseenter', () => {
        tooltipManager.cancelHide('move-tooltip');
    });
    
    tooltip.addEventListener('mouseleave', (e) => {
        const related = e.relatedTarget;
        if (related && (related.closest('.move-tooltip-trigger') || tooltipManager.isOverAnyTooltip(related))) {
            return;
        }
        tooltipManager.scheduleHide('move-tooltip', hideTooltip);
    });
}

// Unified tooltip manager for N nested tooltips
const tooltipManager = {
    // Stack of open tooltip IDs in order (first = oldest/parent, last = newest/child)
    stack: [],
    hideTimeouts: {},
    hideCallbacks: {},
    
    // Register a tooltip as open
    open(tooltipId) {
        if (!this.stack.includes(tooltipId)) {
            this.stack.push(tooltipId);
        }
        this.cancelHide(tooltipId);
    },
    
    // Check if a tooltip or any of its children are open
    isOpenOrHasChildren(tooltipId) {
        const idx = this.stack.indexOf(tooltipId);
        return idx !== -1;
    },
    
    // Check if any tooltip after this one in the stack is open (children)
    hasOpenChildren(tooltipId) {
        const idx = this.stack.indexOf(tooltipId);
        if (idx === -1) return false;
        return idx < this.stack.length - 1;
    },
    
    // Schedule hiding a tooltip (and all its children)
    scheduleHide(tooltipId, callback, delay = 100) {
        this.hideCallbacks[tooltipId] = callback;
        this.hideTimeouts[tooltipId] = setTimeout(() => {
            // Don't hide if this tooltip has open children
            if (this.hasOpenChildren(tooltipId)) return;
            
            // Close this tooltip and remove from stack
            callback();
            const idx = this.stack.indexOf(tooltipId);
            if (idx !== -1) {
                this.stack.splice(idx, 1);
            }
            delete this.hideCallbacks[tooltipId];
        }, delay);
    },
    
    // Cancel scheduled hide
    cancelHide(tooltipId) {
        if (this.hideTimeouts[tooltipId]) {
            clearTimeout(this.hideTimeouts[tooltipId]);
            delete this.hideTimeouts[tooltipId];
        }
    },
    
    // Check if mouse is over any tooltip in the stack
    isOverAnyTooltip(element) {
        if (!element) return false;
        for (const tooltipId of this.stack) {
            const tooltip = document.getElementById(tooltipId);
            if (tooltip && (tooltip === element || tooltip.contains(element))) {
                return true;
            }
        }
        return false;
    },
    
    // Check if mouse is over any trigger element
    isOverAnyTrigger(element) {
        if (!element) return false;
        return element.closest('.move-tooltip-trigger, .pokemon-tooltip-trigger, .type-badge') !== null;
    },
    
    // Force hide all tooltips
    hideAll() {
        // Hide from children to parents (reverse order)
        const stackCopy = [...this.stack].reverse();
        for (const tooltipId of stackCopy) {
            this.cancelHide(tooltipId);
            if (this.hideCallbacks[tooltipId]) {
                this.hideCallbacks[tooltipId]();
                delete this.hideCallbacks[tooltipId];
            } else {
                const tooltip = document.getElementById(tooltipId);
                if (tooltip) tooltip.classList.remove('visible');
            }
        }
        this.stack = [];
    },
    
    // Get all tooltip elements in the stack
    getAllTooltipElements() {
        return this.stack.map(id => document.getElementById(id)).filter(el => el);
    }
};

// Global safety net: hide all tooltips if mouse is clearly outside everything
document.addEventListener('mousemove', (e) => {
    if (tooltipManager.stack.length === 0) return;
    
    // If mouse is over a tooltip or trigger, do nothing
    if (tooltipManager.isOverAnyTooltip(e.target)) return;
    if (tooltipManager.isOverAnyTrigger(e.target)) return;
    
    // Mouse is outside everything - schedule hide for all tooltips
    for (const tooltipId of tooltipManager.stack) {
        const tooltip = document.getElementById(tooltipId);
        if (tooltip && !tooltipManager.hideTimeouts[tooltipId]) {
            tooltipManager.scheduleHide(tooltipId, () => {
                tooltip.classList.remove('visible');
            }, 200);
        }
    }
});

// Hide all tooltips when mouse leaves the document entirely (fast mouse movement)
document.addEventListener('mouseleave', () => {
    if (tooltipManager.stack.length > 0) {
        tooltipManager.hideAll();
    }
});

// Additional safety: use pointer events to detect when mouse is outside all tooltips
// This catches fast mouse movements that skip intermediate events
document.addEventListener('pointerleave', () => {
    if (tooltipManager.stack.length > 0) {
        tooltipManager.hideAll();
    }
});

// Periodic hover state check - catches fast mouse movements that skip events
// Uses browser's native :hover detection which is more reliable
(function setupTooltipHoverCheck() {
    let checkScheduled = false;
    
    function checkHoverState() {
        checkScheduled = false;
        if (tooltipManager.stack.length === 0) return;
        
        // Check if any tooltip or trigger is being hovered using :hover pseudo-class
        const anyTooltipHovered = tooltipManager.getAllTooltipElements().some(el => el.matches(':hover'));
        const anyTriggerHovered = document.querySelector('.pokemon-tooltip-trigger:hover, .move-tooltip-trigger:hover, .type-badge:hover');
        
        if (!anyTooltipHovered && !anyTriggerHovered) {
            // Nothing is hovered, hide all tooltips
            tooltipManager.hideAll();
        }
    }
    
    // Check periodically when tooltips are visible
    function scheduleCheck() {
        if (checkScheduled || tooltipManager.stack.length === 0) return;
        checkScheduled = true;
        requestAnimationFrame(() => {
            setTimeout(checkHoverState, 150);
        });
    }
    
    // Hook into tooltip open to start checking
    const originalOpen = tooltipManager.open.bind(tooltipManager);
    tooltipManager.open = function(tooltipId) {
        originalOpen(tooltipId);
        scheduleCheck();
    };
    
    // Also check on any mouse movement
    document.addEventListener('mousemove', scheduleCheck, { passive: true });
})();

// Get types that are super effective against a defender
function getSuperEffectiveTypes(defenderTypes) {
    const ALL_TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 
                       'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 
                       'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    
    const weaknesses = [];
    
    ALL_TYPES.forEach(attackType => {
        const effectiveness = getEffectiveness(attackType, defenderTypes);
        if (effectiveness >= 2) {
            weaknesses.push({ type: attackType, multiplier: effectiveness });
        }
    });
    
    // Sort by multiplier descending (4x before 2x)
    weaknesses.sort((a, b) => b.multiplier - a.multiplier);
    
    return weaknesses;
}

// Get full type matchup info for a single type
function getTypeMatchups(typeName) {
    const ALL_TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 
                       'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 
                       'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    
    const type = typeName.toLowerCase();
    const matchups = {
        superEffective: [],   // This type deals 2x damage to
        notEffective: [],     // This type deals 0.5x damage to
        noEffect: [],         // This type deals 0x damage to
        weakTo: [],           // This type takes 2x damage from
        resists: [],          // This type takes 0.5x damage from
        immuneTo: []          // This type takes 0x damage from
    };
    
    ALL_TYPES.forEach(otherType => {
        // Offensive: how this type hits other types
        const offensiveEff = getEffectiveness(type, [otherType]);
        if (offensiveEff >= 2) matchups.superEffective.push(otherType);
        else if (offensiveEff === 0.5) matchups.notEffective.push(otherType);
        else if (offensiveEff === 0) matchups.noEffect.push(otherType);
        
        // Defensive: how other types hit this type
        const defensiveEff = getEffectiveness(otherType, [type]);
        if (defensiveEff >= 2) matchups.weakTo.push(otherType);
        else if (defensiveEff === 0.5) matchups.resists.push(otherType);
        else if (defensiveEff === 0) matchups.immuneTo.push(otherType);
    });
    
    return matchups;
}

function initTypeTooltip() {
    const tooltip = document.getElementById('type-tooltip');
    
    const hideTooltip = () => {
        tooltip.classList.remove('visible');
    };
    
    const showTypeTooltip = (typeName, rect) => {
        const matchups = getTypeMatchups(typeName);
        
        // Update header - show as a type badge
        const nameEl = tooltip.querySelector('.type-tooltip-name');
        nameEl.textContent = typeName.toUpperCase();
        nameEl.className = `type-tooltip-name type-badge type-${typeName.toLowerCase()}`;
        
        // Helper to render type badges
        const renderTypes = (types) => types.map(t => 
            `<span class="type-badge type-${t}">${t}</span>`
        ).join('');
        
        // Update offensive section
        document.getElementById('type-super-effective').innerHTML = renderTypes(matchups.superEffective);
        document.getElementById('type-not-effective').innerHTML = renderTypes(matchups.notEffective);
        document.getElementById('type-no-effect').innerHTML = renderTypes(matchups.noEffect);
        
        // Update defensive section
        document.getElementById('type-weak-to').innerHTML = renderTypes(matchups.weakTo);
        document.getElementById('type-resists').innerHTML = renderTypes(matchups.resists);
        document.getElementById('type-immune').innerHTML = renderTypes(matchups.immuneTo);
        
        // Position tooltip
        tooltip.classList.add('visible');
        tooltipManager.open('type-tooltip');
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.right + 10;
        let top = rect.top;
        
        // Keep within viewport
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = rect.left - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = window.innerHeight - tooltipRect.height - 10;
        }
        if (top < 10) top = 10;
        if (left < 10) left = 10;
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    };
    
    // Listen for hover on any type badge anywhere (except inside type-tooltip itself)
    document.addEventListener('mouseover', (e) => {
        const typeBadge = e.target.closest('.type-badge');
        if (!typeBadge) return;
        
        // Don't trigger on type badges inside the type tooltip itself (would cause infinite loop)
        if (tooltip.contains(typeBadge)) return;
        
        tooltipManager.cancelHide('type-tooltip');
        const typeName = typeBadge.textContent.trim().replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (typeName && typeName.length > 0) {
            showTypeTooltip(typeName, typeBadge.getBoundingClientRect());
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        const typeBadge = e.target.closest('.type-badge');
        // Ignore type badges inside type-tooltip
        if (typeBadge && tooltip.contains(typeBadge)) return;
        if (!typeBadge && e.target !== tooltip && !tooltip.contains(e.target)) return;
        
        const related = e.relatedTarget;
        
        // Check if moving to any tooltip in the stack
        if (related && tooltipManager.isOverAnyTooltip(related)) {
            tooltipManager.cancelHide('type-tooltip');
            return;
        }
        
        tooltipManager.scheduleHide('type-tooltip', hideTooltip);
    });
    
    tooltip.addEventListener('mouseenter', () => {
        tooltipManager.cancelHide('type-tooltip');
    });
    
    tooltip.addEventListener('mouseleave', (e) => {
        const related = e.relatedTarget;
        if (related && tooltipManager.isOverAnyTooltip(related)) {
            return;
        }
        tooltipManager.scheduleHide('type-tooltip', hideTooltip);
    });
}

function initPokemonTooltip() {
    const tooltip = document.getElementById('pokemon-tooltip');
    
    document.addEventListener('mouseover', (e) => {
        const trigger = e.target.closest('.pokemon-tooltip-trigger');
        if (!trigger) return;
        
        const name = trigger.dataset.pokemonName;
        const types = JSON.parse(trigger.dataset.pokemonTypes || '[]');
        
        if (!name || types.length === 0) return;
        
        // Update tooltip content
        tooltip.querySelector('.pokemon-tooltip-name').textContent = name;
        
        // Show types
        const typesContainer = tooltip.querySelector('.pokemon-tooltip-types');
        typesContainer.innerHTML = types.map(t => 
            `<span class="type-badge type-${t}">${t}</span>`
        ).join('');
        
        // Show weaknesses
        const weaknesses = getSuperEffectiveTypes(types);
        const weaknessContainer = tooltip.querySelector('.pokemon-tooltip-weakness-types');
        
        if (weaknesses.length > 0) {
            weaknessContainer.innerHTML = weaknesses.map(w => 
                `<span class="type-badge type-${w.type} ${w.multiplier >= 4 ? 'x4' : ''}">${w.type}${w.multiplier >= 4 ? ' (4×)' : ''}</span>`
            ).join('');
            tooltip.querySelector('.pokemon-tooltip-weaknesses').style.display = 'flex';
        } else {
            tooltip.querySelector('.pokemon-tooltip-weaknesses').style.display = 'none';
        }
        
        // Position tooltip
        const rect = trigger.getBoundingClientRect();
        
        tooltip.classList.add('visible');
        const actualHeight = tooltip.offsetHeight;
        
        let left = rect.left;
        let top = rect.top - actualHeight - 10;
        
        // Keep within viewport
        if (top < 10) {
            top = rect.bottom + 10; // Show below instead
        }
        if (left + 280 > window.innerWidth) {
            left = window.innerWidth - 290;
        }
        if (left < 10) {
            left = 10;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltipManager.open('pokemon-tooltip');
    });
    
    const hideTooltip = () => {
        tooltip.classList.remove('visible');
    };
    
    document.addEventListener('mouseout', (e) => {
        const trigger = e.target.closest('.pokemon-tooltip-trigger');
        if (!trigger && e.target !== tooltip && !tooltip.contains(e.target)) return;
        
        const related = e.relatedTarget;
        
        // Check if moving to any tooltip in the stack
        if (related && tooltipManager.isOverAnyTooltip(related)) {
            tooltipManager.cancelHide('pokemon-tooltip');
            return;
        }
        
        // Check if moving to the tooltip itself
        if (related && (tooltip.contains(related) || related === tooltip)) {
            tooltipManager.cancelHide('pokemon-tooltip');
            return;
        }
        
        // Check if moving to another part of the same trigger
        if (related && trigger && trigger.contains(related)) return;
        
        tooltipManager.scheduleHide('pokemon-tooltip', hideTooltip);
    });
    
    tooltip.addEventListener('mouseenter', () => {
        tooltipManager.cancelHide('pokemon-tooltip');
    });
    
    tooltip.addEventListener('mouseleave', (e) => {
        const related = e.relatedTarget;
        if (related && (related.closest('.pokemon-tooltip-trigger') || tooltipManager.isOverAnyTooltip(related))) {
            return;
        }
        tooltipManager.scheduleHide('pokemon-tooltip', hideTooltip);
    });
}

// ============================================
// RENDERING - TEAM BUILDER
// ============================================

function renderTeamSlots() {
    renderTeamPanel(elements.myTeamSlots, state.myTeam, 'my');
    renderTeamPanel(elements.enemyTeamSlots, state.enemyTeam, 'enemy');
}

function renderTeamPanel(container, team, teamType) {
    container.innerHTML = '';
    
    team.forEach((slot, index) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'pokemon-slot';
        slotEl.innerHTML = createSlotHTML(slot, index, teamType);
        
        // Make draggable if has Pokemon
        if (slot.pokemon) {
            slotEl.draggable = true;
            slotEl.dataset.slotIndex = index;
            slotEl.dataset.teamType = teamType;
            
            slotEl.addEventListener('dragstart', handleDragStart);
            slotEl.addEventListener('dragend', handleDragEnd);
        }
        
        // All slots can be drop targets
        slotEl.addEventListener('dragover', handleDragOver);
        slotEl.addEventListener('dragenter', handleDragEnter);
        slotEl.addEventListener('dragleave', handleDragLeave);
        slotEl.addEventListener('drop', handleDrop);
        slotEl.dataset.slotIndex = index;
        slotEl.dataset.teamType = teamType;
        
        container.appendChild(slotEl);
        
        // Add event listeners
        setupSlotEventListeners(slotEl, index, teamType);
    });
}

// Drag and Drop state
let dragState = {
    sourceTeam: null,
    sourceIndex: null
};

function handleDragStart(e) {
    const slotEl = e.currentTarget;
    dragState.sourceTeam = slotEl.dataset.teamType;
    dragState.sourceIndex = parseInt(slotEl.dataset.slotIndex);
    
    slotEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
        team: dragState.sourceTeam,
        index: dragState.sourceIndex
    }));
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.pokemon-slot').forEach(el => {
        el.classList.remove('drag-over');
    });
    dragState = { sourceTeam: null, sourceIndex: null };
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the slot element
    let slotEl = e.currentTarget;
    if (!slotEl.classList.contains('pokemon-slot')) {
        slotEl = slotEl.closest('.pokemon-slot');
    }
    if (!slotEl) return;
    
    // Only allow dropping on same team
    if (slotEl.dataset.teamType === dragState.sourceTeam) {
        e.dataTransfer.dropEffect = 'move';
    } else {
        e.dataTransfer.dropEffect = 'none';
    }
}

function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    
    let slotEl = e.currentTarget;
    if (!slotEl.classList.contains('pokemon-slot')) {
        slotEl = slotEl.closest('.pokemon-slot');
    }
    if (!slotEl) return;
    
    // Only allow dropping on same team
    if (slotEl.dataset.teamType === dragState.sourceTeam) {
        slotEl.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.stopPropagation();
    
    let slotEl = e.currentTarget;
    if (!slotEl.classList.contains('pokemon-slot')) {
        slotEl = slotEl.closest('.pokemon-slot');
    }
    if (!slotEl) return;
    
    // Only remove if we're actually leaving the slot (not just moving to a child)
    const rect = slotEl.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        slotEl.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the slot element (might be a child that received the event)
    let targetSlot = e.currentTarget;
    if (!targetSlot.classList.contains('pokemon-slot')) {
        targetSlot = targetSlot.closest('.pokemon-slot');
    }
    if (!targetSlot) return;
    
    targetSlot.classList.remove('drag-over');
    
    const targetTeam = targetSlot.dataset.teamType;
    const targetIndex = parseInt(targetSlot.dataset.slotIndex);
    
    // Validate drag state
    if (!dragState.sourceTeam || dragState.sourceIndex === null) return;
    
    // Only allow dropping on same team
    if (targetTeam !== dragState.sourceTeam) return;
    if (targetIndex === dragState.sourceIndex) return;
    
    // Swap the Pokemon
    const team = targetTeam === 'my' ? state.myTeam : state.enemyTeam;
    const faintedTeam = targetTeam === 'my' ? state.faintedMyTeam : state.faintedEnemyTeam;
    
    // Swap slots
    const temp = team[dragState.sourceIndex];
    team[dragState.sourceIndex] = team[targetIndex];
    team[targetIndex] = temp;
    
    // Also swap fainted state
    const tempFainted = faintedTeam[dragState.sourceIndex];
    faintedTeam[dragState.sourceIndex] = faintedTeam[targetIndex];
    faintedTeam[targetIndex] = tempFainted;
    
    const isEnemy = targetTeam === 'enemy';
    
    // Reset drag state before re-render
    dragState = { sourceTeam: null, sourceIndex: null };
    
    renderTeamSlots();
    if (state.currentView === 'battle') {
        renderBattleView();
    }
    autoSaveTeam(isEnemy);
}

function createSlotHTML(slot, index, teamType) {
    const pokemon = slot.pokemon;
    const hasPokemon = pokemon !== null;
    
    let spriteHTML = '';
    let nameHTML = '';
    let typesHTML = '';
    
    if (hasPokemon) {
        spriteHTML = `<img src="${getSpriteUrl(pokemon.id)}" alt="${pokemon.name}">`;
        nameHTML = pokemon.name;
        
        // Show tera type if set, otherwise show original types
        if (slot.teraType) {
            typesHTML = `<span class="type-badge type-${slot.teraType} tera-badge">⟡ ${slot.teraType}</span>`;
            typesHTML += `<span class="original-types">(${pokemon.types.join('/')})</span>`;
        } else {
            typesHTML = pokemon.types.map(t => 
                `<span class="type-badge type-${t}">${t}</span>`
            ).join('');
        }
    } else {
        spriteHTML = '<span style="color: var(--text-muted); font-size: 1.5rem;">+</span>';
        nameHTML = '<span class="empty">Click to add...</span>';
    }
    
    const movesHTML = slot.moves.map((move, moveIndex) => {
        if (move) {
            const moveData = getMoveByName(move);
            const typeClass = moveData ? moveData.type : 'normal';
            return `
                <div class="move-slot" data-move-index="${moveIndex}">
                    <span class="move-type-indicator" style="background: var(--type-${typeClass})"></span>
                    <span class="move-name-text">${move}</span>
                    <button class="move-remove-btn" data-move-index="${moveIndex}" title="Remove move">×</button>
                </div>
            `;
        } else {
            return `
                <div class="move-slot empty" data-move-index="${moveIndex}">
                    <span class="move-type-indicator" style="background: var(--text-muted)"></span>
                    <span class="move-name-text">Add move...</span>
                </div>
            `;
        }
    }).join('');
    
    // Ability, Tera type, Item, and Level selectors
    const abilityHTML = hasPokemon ? `
        <div class="ability-tera-row">
            <div class="ability-selector" data-action="select-ability">
                <span class="selector-label">Ability:</span>
                <span class="selector-value ${!slot.ability ? 'empty' : ''}">${slot.ability || 'None'}</span>
                ${slot.ability ? '<button class="remove-btn" data-action="remove-ability" title="Remove ability">×</button>' : ''}
            </div>
            <div class="tera-selector" data-action="select-tera">
                <span class="selector-label">Tera:</span>
                <span class="selector-value ${!slot.teraType ? 'empty' : ''}" ${slot.teraType ? `style="color: var(--type-${slot.teraType})"` : ''}>
                    ${slot.teraType ? `⟡ ${slot.teraType}` : 'None'}
                </span>
                ${slot.teraType ? '<button class="remove-btn" data-action="remove-tera" title="Remove Tera type">×</button>' : ''}
            </div>
        </div>
        <div class="item-level-row">
            <div class="item-selector" data-action="select-item">
                <span class="selector-label">🎒 Item:</span>
                <span class="selector-value ${!slot.item ? 'empty' : ''}">${slot.item || 'None'}</span>
                ${slot.item ? '<button class="remove-btn" data-action="remove-item" title="Remove item">×</button>' : ''}
            </div>
            <div class="level-selector">
                <span class="selector-label">Lv:</span>
                <input type="number" class="level-input" data-action="set-level" 
                       value="${slot.level || ''}" placeholder="50" min="1" max="100">
            </div>
        </div>
    ` : '';
    
    return `
        <div class="slot-header">
            <span class="slot-number">#${index + 1}</span>
            <div class="pokemon-sprite ${hasPokemon ? 'has-pokemon' : ''}" data-action="select-pokemon">
                ${spriteHTML}
            </div>
            <div class="pokemon-info">
                <div class="pokemon-name ${!hasPokemon ? 'empty' : ''}">${nameHTML}</div>
                <div class="pokemon-types">${typesHTML}</div>
            </div>
            ${hasPokemon ? `<button class="remove-pokemon" data-action="remove-pokemon" title="Remove">×</button>` : ''}
        </div>
        ${abilityHTML}
        <div class="move-slots">
            ${movesHTML}
        </div>
    `;
}

function setupSlotEventListeners(slotEl, slotIndex, teamType) {
    // Select Pokemon
    const spriteEl = slotEl.querySelector('[data-action="select-pokemon"]');
    spriteEl.addEventListener('click', () => {
        openPokemonModal(teamType, slotIndex);
    });
    
    // Also allow clicking pokemon name area
    const infoEl = slotEl.querySelector('.pokemon-info');
    infoEl.addEventListener('click', () => {
        openPokemonModal(teamType, slotIndex);
    });
    
    // Remove Pokemon
    const removeBtn = slotEl.querySelector('[data-action="remove-pokemon"]');
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removePokemon(teamType, slotIndex);
        });
    }
    
    // Ability selector
    const abilitySelector = slotEl.querySelector('[data-action="select-ability"]');
    if (abilitySelector) {
        abilitySelector.addEventListener('click', (e) => {
            // Don't open modal if clicking the remove button
            if (e.target.dataset.action === 'remove-ability') return;
            openAbilityModal(teamType, slotIndex);
        });
    }
    
    // Remove ability button
    const removeAbilityBtn = slotEl.querySelector('[data-action="remove-ability"]');
    if (removeAbilityBtn) {
        removeAbilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const team = teamType === 'my' ? state.myTeam : state.enemyTeam;
            team[slotIndex].ability = null;
            renderTeamSlots();
            renderBattleView();
            autoSaveTeam(teamType === 'enemy');
        });
    }
    
    // Tera type selector
    const teraSelector = slotEl.querySelector('[data-action="select-tera"]');
    if (teraSelector) {
        teraSelector.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'remove-tera') return;
            openTeraModal(teamType, slotIndex);
        });
    }
    
    // Remove tera button
    const removeTeraBtn = slotEl.querySelector('[data-action="remove-tera"]');
    if (removeTeraBtn) {
        removeTeraBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const team = teamType === 'my' ? state.myTeam : state.enemyTeam;
            team[slotIndex].teraType = null;
            renderTeamSlots();
            renderBattleView();
            autoSaveTeam(teamType === 'enemy');
        });
    }
    
    // Item selector
    const itemSelector = slotEl.querySelector('[data-action="select-item"]');
    if (itemSelector) {
        itemSelector.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'remove-item') return;
            openItemModal(teamType, slotIndex);
        });
    }
    
    // Remove item button
    const removeItemBtn = slotEl.querySelector('[data-action="remove-item"]');
    if (removeItemBtn) {
        removeItemBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const team = teamType === 'my' ? state.myTeam : state.enemyTeam;
            team[slotIndex].item = null;
            renderTeamSlots();
            renderBattleView();
            autoSaveTeam(teamType === 'enemy');
        });
    }
    
    // Level input
    const levelInput = slotEl.querySelector('[data-action="set-level"]');
    if (levelInput) {
        levelInput.addEventListener('change', (e) => {
            const team = teamType === 'my' ? state.myTeam : state.enemyTeam;
            const value = parseInt(e.target.value);
            if (value >= 1 && value <= 100) {
                team[slotIndex].level = value;
            } else if (e.target.value === '') {
                team[slotIndex].level = null; // Clear level
            }
            renderBattleView(); // Update battle calculations
            autoSaveTeam(teamType === 'enemy');
        });
        // Prevent click from bubbling to parent
        levelInput.addEventListener('click', (e) => e.stopPropagation());
    }
    
    // Move slots - click on the slot (not the remove button) to edit
    const moveSlots = slotEl.querySelectorAll('.move-slot');
    moveSlots.forEach((moveSlot) => {
        moveSlot.addEventListener('click', (e) => {
            // Don't open modal if clicking remove button
            if (e.target.classList.contains('move-remove-btn')) return;
            
            const moveIndex = parseInt(moveSlot.dataset.moveIndex);
            const team = teamType === 'my' ? state.myTeam : state.enemyTeam;
            if (team[slotIndex].pokemon) {
                openMoveModal(teamType, slotIndex, moveIndex);
            }
        });
    });
    
    // Move remove buttons
    const removeButtons = slotEl.querySelectorAll('.move-remove-btn');
    removeButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const moveIndex = parseInt(btn.dataset.moveIndex);
            removeMove(teamType, slotIndex, moveIndex);
        });
    });
}

function removeMove(teamType, slotIndex, moveIndex) {
    const team = teamType === 'my' ? state.myTeam : state.enemyTeam;
    team[slotIndex].moves[moveIndex] = null;
    renderTeams();
    if (state.currentView === 'battle') {
        renderBattleView();
    }
    autoSaveTeam(teamType === 'enemy');
}

// Battle View Drag and Drop
let battleDragState = {
    sourceTeam: null,
    sourceIndex: null
};

function handleBattleViewDragStart(e) {
    const el = e.currentTarget;
    battleDragState.sourceTeam = el.dataset.teamType;
    battleDragState.sourceIndex = parseInt(el.dataset.slotIndex);
    
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(battleDragState));
}

function handleBattleViewDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    battleDragState = { sourceTeam: null, sourceIndex: null };
}

function handleBattleViewDragOver(e) {
    e.preventDefault();
    const el = e.currentTarget;
    if (el.dataset.teamType === battleDragState.sourceTeam) {
        e.dataTransfer.dropEffect = 'move';
    } else {
        e.dataTransfer.dropEffect = 'none';
    }
}

function handleBattleViewDragEnter(e) {
    e.preventDefault();
    const el = e.currentTarget;
    if (el.dataset.teamType === battleDragState.sourceTeam && 
        parseInt(el.dataset.slotIndex) !== battleDragState.sourceIndex) {
        el.classList.add('drag-over');
    }
}

function handleBattleViewDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleBattleViewDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const targetEl = e.currentTarget;
    targetEl.classList.remove('drag-over');
    
    const targetTeam = targetEl.dataset.teamType;
    const targetIndex = parseInt(targetEl.dataset.slotIndex);
    
    if (!battleDragState.sourceTeam || battleDragState.sourceIndex === null) return;
    if (targetTeam !== battleDragState.sourceTeam) return;
    if (targetIndex === battleDragState.sourceIndex) return;
    
    // Swap the Pokemon
    const team = targetTeam === 'my' ? state.myTeam : state.enemyTeam;
    const faintedTeam = targetTeam === 'my' ? state.faintedMyTeam : state.faintedEnemyTeam;
    
    const temp = team[battleDragState.sourceIndex];
    team[battleDragState.sourceIndex] = team[targetIndex];
    team[targetIndex] = temp;
    
    const tempFainted = faintedTeam[battleDragState.sourceIndex];
    faintedTeam[battleDragState.sourceIndex] = faintedTeam[targetIndex];
    faintedTeam[targetIndex] = tempFainted;
    
    const isEnemy = targetTeam === 'enemy';
    battleDragState = { sourceTeam: null, sourceIndex: null };
    
    renderTeamSlots();
    renderBattleView();
    autoSaveTeam(isEnemy);
}

// ============================================
// RENDERING - BATTLE VIEW
// ============================================

function updateFormulaSubtitle() {
    if (!elements.formulaSubtitle) return;
    
    if (state.damageMode === 'damage') {
        elements.formulaSubtitle.innerHTML = 
            'Shows: <strong>HP Damage</strong> using official formula (Lv50, 31 IVs, 0 EVs)';
    } else if (state.damageMode === 'percent') {
        elements.formulaSubtitle.innerHTML = 
            'Shows: <strong>Damage %</strong> of defender HP (Lv50, 31 IVs, 0 EVs)';
    } else {
        elements.formulaSubtitle.innerHTML = 
            'Shows: Power × STAB (1.5×) × Type Effectiveness = <strong>Effective Power</strong>';
    }
}

function renderBattleView() {
    updateFormulaSubtitle();
    renderCombinedMatrix();
}

function renderCombinedMatrix() {
    const container = elements.combinedMatrix;
    container.innerHTML = '';
    
    // Get all Pokemon with their indices
    const allMyPokemon = state.myTeam.map((slot, idx) => ({ slot, idx })).filter(s => s.slot.pokemon !== null);
    const allEnemyPokemon = state.enemyTeam.map((slot, idx) => ({ slot, idx })).filter(s => s.slot.pokemon !== null);
    
    // Battle team is first 6, bench is the rest
    const myBattleTeam = allMyPokemon.slice(0, BATTLE_TEAM_SIZE);
    const myBench = allMyPokemon.slice(BATTLE_TEAM_SIZE);
    const enemyBattleTeam = allEnemyPokemon.slice(0, BATTLE_TEAM_SIZE);
    const enemyBench = allEnemyPokemon.slice(BATTLE_TEAM_SIZE);
    
    // For compatibility with existing code
    const myPokemon = myBattleTeam.map(p => p.slot);
    const enemyPokemon = enemyBattleTeam.map(p => p.slot);
    
    // Find first empty enemy slot index for adding new Pokemon
    const firstEmptyEnemySlot = state.enemyTeam.findIndex(slot => slot.pokemon === null);
    
    if (myPokemon.length === 0) {
        container.innerHTML = '<div class="no-selection-message">Add Pokemon to your team to see matchups</div>';
        return;
    }
    
    // Create header row with MY Pokemon (swapped: my team on top)
    const headerRow = document.createElement('div');
    headerRow.className = 'matrix-header-row';
    
    // Corner cell
    const cornerDiv = document.createElement('div');
    cornerDiv.className = 'matrix-corner';
    cornerDiv.innerHTML = '<span>Enemy ↓</span><span>My Team →</span>';
    headerRow.appendChild(cornerDiv);
    
    // Track actual slot indices for my battle team (first 6 only)
    const mySlotIndices = myBattleTeam.map(p => p.idx);
    
    // Add my Pokemon to header (clickable for fainted toggle, draggable for reorder)
    myPokemon.forEach((slot, displayIndex) => {
        const actualSlotIndex = mySlotIndices[displayIndex];
        const isFainted = state.faintedMyTeam[actualSlotIndex];
        
        const displayTypes = slot.teraType ? [slot.teraType] : slot.pokemon.types;
        const typesHTML = displayTypes.map(t => 
            `<span class="type-badge type-${t} ${slot.teraType ? 'tera-badge' : ''}" style="font-size: 0.6rem; padding: 0.1rem 0.3rem;">${slot.teraType ? '⟡ ' : ''}${t}</span>`
        ).join('');
        const abilityHTML = slot.ability ? `<span class="matrix-ability">${slot.ability}</span>` : '';
        
        const headerCell = document.createElement('div');
        headerCell.className = `matrix-header-cell my-header clickable-header pokemon-tooltip-trigger ${isFainted ? 'fainted' : ''}`;
        headerCell.dataset.slotIndex = actualSlotIndex;
        headerCell.dataset.teamType = 'my';
        headerCell.dataset.pokemonName = slot.pokemon.name;
        headerCell.dataset.pokemonTypes = JSON.stringify(displayTypes);
        headerCell.draggable = true;
        headerCell.innerHTML = `
            <img src="${getSpriteUrl(slot.pokemon.id)}" alt="${slot.pokemon.name}">
            <span class="matrix-pokemon-name">${slot.pokemon.name}</span>
            <div class="matrix-pokemon-types">${typesHTML}</div>
            ${abilityHTML}
            ${isFainted ? '<span class="fainted-label">FAINTED</span>' : ''}
        `;
        
        // Click for fainted toggle (but not when dragging)
        // Use distance threshold to distinguish click from drag
        let dragStartPos = null;
        let isDragging = false;
        const DRAG_THRESHOLD = 8; // pixels
        
        headerCell.addEventListener('mousedown', (e) => { 
            dragStartPos = { x: e.clientX, y: e.clientY };
            isDragging = false;
        });
        headerCell.addEventListener('mousemove', (e) => { 
            if (dragStartPos && !isDragging) {
                const dx = Math.abs(e.clientX - dragStartPos.x);
                const dy = Math.abs(e.clientY - dragStartPos.y);
                if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
                    isDragging = true;
                }
            }
        });
        headerCell.addEventListener('mouseup', () => { dragStartPos = null; });
        headerCell.addEventListener('click', () => {
            if (isDragging) return;
            state.faintedMyTeam[actualSlotIndex] = !state.faintedMyTeam[actualSlotIndex];
            renderBattleView();
        });
        
        // Drag and drop
        headerCell.addEventListener('dragstart', handleBattleViewDragStart);
        headerCell.addEventListener('dragend', handleBattleViewDragEnd);
        headerCell.addEventListener('dragover', handleBattleViewDragOver);
        headerCell.addEventListener('dragenter', handleBattleViewDragEnter);
        headerCell.addEventListener('dragleave', handleBattleViewDragLeave);
        headerCell.addEventListener('drop', handleBattleViewDrop);
        
        headerRow.appendChild(headerCell);
    });
    
    container.appendChild(headerRow);
    
    // If no enemies yet, show add enemy button and message
    if (enemyPokemon.length === 0) {
        if (firstEmptyEnemySlot !== -1) {
            const addRow = document.createElement('div');
            addRow.className = 'matrix-row';
            const addSlotDiv = document.createElement('div');
            addSlotDiv.className = 'matrix-row-header add-enemy-slot';
            addSlotDiv.innerHTML = `
                <div class="add-enemy-icon">+</div>
                <span class="add-enemy-text">Add Enemy</span>
            `;
            addSlotDiv.addEventListener('click', () => {
                openPokemonModal('enemy', firstEmptyEnemySlot);
            });
            addRow.appendChild(addSlotDiv);
            container.appendChild(addRow);
        }
        const messageDiv = document.createElement('div');
        messageDiv.className = 'no-selection-message';
        messageDiv.style.marginTop = '1rem';
        messageDiv.textContent = 'Click "+ Add Enemy" to add enemy Pokemon';
        container.appendChild(messageDiv);
        return;
    }
    
    // Create a row for each ENEMY Pokemon (swapped: enemy on left)
    // Use battle team indices (first 6 only)
    const enemySlotIndices = enemyBattleTeam.map(p => p.idx);
    
    enemyPokemon.forEach((enemySlot, enemyIndex) => {
        const actualSlotIndex = enemySlotIndices[enemyIndex];
        const row = document.createElement('div');
        row.className = 'matrix-row';
        
        // Enemy Pokemon cell (row header) - clickable to edit moves, draggable for reorder
        const enemyDisplayTypes = enemySlot.teraType ? [enemySlot.teraType] : enemySlot.pokemon.types;
        const enemyTypesHTML = enemyDisplayTypes.map(t => 
            `<span class="type-badge type-${t} ${enemySlot.teraType ? 'tera-badge' : ''}" style="font-size: 0.6rem; padding: 0.1rem 0.3rem;">${enemySlot.teraType ? '⟡ ' : ''}${t}</span>`
        ).join('');
        const enemyAbilityHTML = enemySlot.ability ? `<span class="matrix-ability">${enemySlot.ability}</span>` : '';
        const currentMovesHTML = enemySlot.moves.filter(m => m).map(m => 
            `<span class="enemy-move-chip">${m}</span>`
        ).join('') || '<span class="no-moves-text">Click to add moves</span>';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'matrix-row-header enemy-row-header clickable-enemy pokemon-tooltip-trigger';
        headerDiv.dataset.slotIndex = actualSlotIndex;
        headerDiv.dataset.teamType = 'enemy';
        headerDiv.dataset.pokemonName = enemySlot.pokemon.name;
        headerDiv.dataset.pokemonTypes = JSON.stringify(enemyDisplayTypes);
        headerDiv.draggable = true;
        headerDiv.innerHTML = `
            <img src="${getSpriteUrl(enemySlot.pokemon.id)}" alt="${enemySlot.pokemon.name}">
            <div class="matrix-row-info">
                <span class="matrix-pokemon-name">${enemySlot.pokemon.name}</span>
                <div class="matrix-pokemon-types">${enemyTypesHTML}</div>
                ${enemyAbilityHTML}
                <div class="enemy-moves-preview">${currentMovesHTML}</div>
            </div>
            <span class="edit-moves-icon" title="Edit moves">✏️</span>
        `;
        
        // Click to edit moves (but not when dragging)
        // Use distance threshold to distinguish click from drag
        let enemyDragStartPos = null;
        let isDraggingEnemy = false;
        const ENEMY_DRAG_THRESHOLD = 8; // pixels
        
        headerDiv.addEventListener('mousedown', (e) => { 
            enemyDragStartPos = { x: e.clientX, y: e.clientY };
            isDraggingEnemy = false;
        });
        headerDiv.addEventListener('mousemove', (e) => { 
            if (enemyDragStartPos && !isDraggingEnemy) {
                const dx = Math.abs(e.clientX - enemyDragStartPos.x);
                const dy = Math.abs(e.clientY - enemyDragStartPos.y);
                if (dx > ENEMY_DRAG_THRESHOLD || dy > ENEMY_DRAG_THRESHOLD) {
                    isDraggingEnemy = true;
                }
            }
        });
        headerDiv.addEventListener('mouseup', () => { enemyDragStartPos = null; });
        headerDiv.addEventListener('click', () => {
            if (isDraggingEnemy) return;
            openQuickMoveEditor(actualSlotIndex, enemySlot);
        });
        
        // Drag and drop
        headerDiv.addEventListener('dragstart', handleBattleViewDragStart);
        headerDiv.addEventListener('dragend', handleBattleViewDragEnd);
        headerDiv.addEventListener('dragover', handleBattleViewDragOver);
        headerDiv.addEventListener('dragenter', handleBattleViewDragEnter);
        headerDiv.addEventListener('dragleave', handleBattleViewDragLeave);
        headerDiv.addEventListener('drop', handleBattleViewDrop);
        
        row.appendChild(headerDiv);
        
        // Calculate matchups against each of MY Pokemon
        myPokemon.forEach((mySlot, myIndex) => {
            const myActualSlotIndex = mySlotIndices[myIndex];
            const isMyFainted = state.faintedMyTeam[myActualSlotIndex];
            
            const cell = document.createElement('div');
            cell.className = `matrix-cell combined-cell ${isMyFainted ? 'fainted-column' : ''}`;
            
            const includeAcc = state.includeAccuracy;
            const minEffectivePower = state.filterWeakMoves ? 50 : 0;
            const fieldEffect = state.fieldEffect;
            
            // OFFENSIVE: My moves against this enemy
            // Determine types for calculations - tera type replaces original types for defensive calcs
            const enemyDefTypes = enemySlot.teraType ? [enemySlot.teraType] : enemySlot.pokemon.types;
            const myDefTypes = mySlot.teraType ? [mySlot.teraType] : mySlot.pokemon.types;
            
            const damageMode = state.damageMode; // 'effective', 'damage', or 'percent'
            const useActualDamage = damageMode === 'damage' || damageMode === 'percent';
            
            const myMoveEffects = mySlot.moves
                .filter(m => m !== null)
                .map(moveName => {
                    const move = getMoveByName(moveName);
                    if (!move) return null;
                    
                    // Handle status moves separately - calculate status value and first tick damage
                    if (move.category === 'status' || move.power === 0) {
                        const statusValue = getStatusMoveValue(move);
                        const attackerLevel = getEffectiveLevel(mySlot.level, enemySlot.level);
                        const defenderLevel = getEffectiveLevel(enemySlot.level, mySlot.level);
                        const statusDamage = calculateStatusMoveDamage(move, enemySlot.pokemon, {
                            level: attackerLevel,
                            defenderLevel: defenderLevel
                        });
                        
                        // Display value: use percent damage if available, otherwise status value
                        let displayValue = statusValue;
                        if (damageMode === 'percent' && statusDamage.percentAvg > 0) {
                            displayValue = statusDamage.percentAvg;
                        } else if (damageMode === 'damage' && statusDamage.avg > 0) {
                            displayValue = statusDamage.avg;
                        }
                        
                        return { 
                            name: moveName, 
                            type: move.type, 
                            category: move.category,
                            power: 0,
                            accuracy: move.accuracy,
                            description: move.description || '',
                            effectiveness: 1,
                            isStab: false,
                            isStatus: true,
                            effectivePower: statusValue,
                            actualDamage: statusDamage.avg > 0 ? statusDamage : null,
                            displayValue: displayValue
                        };
                    }
                    
                    const eff = getEffectiveness(move.type, enemyDefTypes);
                    // Apply defender's ability to effectiveness
                    const effAfterAbility = applyDefenderAbility(eff, move.type, move.category, enemySlot.ability);
                    // STAB: includes tera type if set
                    const isStab = hasSTABWithTera(mySlot.pokemon.types, mySlot.teraType, move.type);
                    const effectivePower = calculateEffectivePowerWithAbility(
                        move, mySlot.pokemon.types, mySlot.teraType, mySlot.ability,
                        enemyDefTypes, enemySlot.ability, includeAcc, fieldEffect,
                        mySlot.pokemon, enemySlot.pokemon
                    );
                    
                    // Calculate actual damage if needed
                    let actualDamage = null;
                    if (useActualDamage) {
                        const weather = ['sun', 'rain', 'sand', 'snow'].includes(fieldEffect) ? fieldEffect : 'none';
                        const attackerLevel = getEffectiveLevel(mySlot.level, enemySlot.level);
                        const defenderLevel = getEffectiveLevel(enemySlot.level, mySlot.level);
                        actualDamage = calculateActualDamage(move, mySlot.pokemon, enemySlot.pokemon, {
                            level: attackerLevel,
                            defenderLevel: defenderLevel,
                            attackerTeraType: mySlot.teraType,
                            defenderTeraType: enemySlot.teraType,
                            attackerAbility: mySlot.ability,
                            defenderAbility: enemySlot.ability,
                            attackerItem: mySlot.item,
                            weather: weather,
                            fieldEffect: fieldEffect
                        });
                    }
                    
                    // Display value depends on mode
                    let displayValue;
                    if (damageMode === 'damage' && actualDamage) {
                        displayValue = actualDamage.avg;
                    } else if (damageMode === 'percent' && actualDamage) {
                        displayValue = actualDamage.percentAvg;
                    } else {
                        displayValue = effectivePower;
                    }
                    
                    return { 
                        name: moveName, 
                        type: move.type, 
                        category: move.category,
                        power: move.power,
                        accuracy: move.accuracy,
                        description: move.description || '',
                        effectiveness: effAfterAbility,
                        isStab: isStab,
                        isStatus: false,
                        effectivePower: effectivePower,
                        actualDamage: actualDamage,
                        displayValue: displayValue
                    };
                })
                .filter(m => m !== null)
                .sort((a, b) => b.displayValue - a.displayValue) // Sort by display value
                .slice(0, state.filterWeakMoves ? 1 : undefined); // Show only best move if toggle is on
            
            // DEFENSIVE: Enemy moves against me
            // First, process assigned moves
            const assignedMoves = enemySlot.moves.filter(m => m !== null);
            const assignedMoveCount = assignedMoves.length;
            
            let enemyMoveEffects = assignedMoves
                .map(moveName => {
                    const move = getMoveByName(moveName);
                    if (!move) return null;
                    
                    // Handle status moves separately - calculate status value and first tick damage
                    if (move.category === 'status' || move.power === 0) {
                        const statusValue = getStatusMoveValue(move);
                        const attackerLevel = getEffectiveLevel(enemySlot.level, mySlot.level);
                        const defenderLevel = getEffectiveLevel(mySlot.level, enemySlot.level);
                        const statusDamage = calculateStatusMoveDamage(move, mySlot.pokemon, {
                            level: attackerLevel,
                            defenderLevel: defenderLevel
                        });
                        
                        // Display value: use percent damage if available, otherwise status value
                        let displayValue = statusValue;
                        if (damageMode === 'percent' && statusDamage.percentAvg > 0) {
                            displayValue = statusDamage.percentAvg;
                        } else if (damageMode === 'damage' && statusDamage.avg > 0) {
                            displayValue = statusDamage.avg;
                        }
                        
                        return { 
                            name: moveName, 
                            type: move.type, 
                            category: move.category,
                            power: 0,
                            accuracy: move.accuracy,
                            description: move.description || '',
                            effectiveness: 1,
                            isStab: false,
                            isStatus: true,
                            effectivePower: statusValue,
                            actualDamage: statusDamage.avg > 0 ? statusDamage : null,
                            displayValue: displayValue
                        };
                    }
                    
                    const eff = getEffectiveness(move.type, myDefTypes);
                    const effAfterAbility = applyDefenderAbility(eff, move.type, move.category, mySlot.ability);
                    const isStab = hasSTABWithTera(enemySlot.pokemon.types, enemySlot.teraType, move.type);
                    const effectivePower = calculateEffectivePowerWithAbility(
                        move, enemySlot.pokemon.types, enemySlot.teraType, enemySlot.ability,
                        myDefTypes, mySlot.ability, includeAcc, fieldEffect,
                        enemySlot.pokemon, mySlot.pokemon
                    );
                    
                    // Calculate actual damage if needed
                    let actualDamage = null;
                    if (useActualDamage) {
                        const weather = ['sun', 'rain', 'sand', 'snow'].includes(fieldEffect) ? fieldEffect : 'none';
                        const attackerLevel = getEffectiveLevel(enemySlot.level, mySlot.level);
                        const defenderLevel = getEffectiveLevel(mySlot.level, enemySlot.level);
                        actualDamage = calculateActualDamage(move, enemySlot.pokemon, mySlot.pokemon, {
                            level: attackerLevel,
                            defenderLevel: defenderLevel,
                            attackerTeraType: enemySlot.teraType,
                            defenderTeraType: mySlot.teraType,
                            attackerAbility: enemySlot.ability,
                            defenderAbility: mySlot.ability,
                            attackerItem: enemySlot.item,
                            weather: weather,
                            fieldEffect: fieldEffect
                        });
                    }
                    
                    // Display value depends on mode
                    let displayValue;
                    if (damageMode === 'damage' && actualDamage) {
                        displayValue = actualDamage.avg;
                    } else if (damageMode === 'percent' && actualDamage) {
                        displayValue = actualDamage.percentAvg;
                    } else {
                        displayValue = effectivePower;
                    }
                    
                    return { 
                        name: moveName, 
                        type: move.type, 
                        category: move.category,
                        power: move.power,
                        accuracy: move.accuracy,
                        description: move.description || '',
                        effectiveness: effAfterAbility,
                        isStab: isStab,
                        isStatus: false,
                        effectivePower: effectivePower,
                        actualDamage: actualDamage,
                        displayValue: displayValue
                    };
                })
                .filter(m => m !== null);
            
            // Check if we should add default STAB moves:
            // - Has less than 4 moves AND
            // - Missing STAB move for at least one of their types
            if (assignedMoveCount < 4) {
                // Get all types that need STAB (including tera type if set)
                const enemyTypes = [...enemySlot.pokemon.types];
                if (enemySlot.teraType && !enemyTypes.includes(enemySlot.teraType)) {
                    enemyTypes.push(enemySlot.teraType);
                }
                
                // Find which types already have a STAB move assigned
                const coveredStabTypes = new Set();
                assignedMoves.forEach(moveName => {
                    const move = getMoveByName(moveName);
                    if (move && enemyTypes.includes(move.type.toLowerCase())) {
                        coveredStabTypes.add(move.type.toLowerCase());
                    }
                });
                
                // Add default STAB for uncovered types
                const uncoveredTypes = enemyTypes.filter(t => !coveredStabTypes.has(t.toLowerCase()));
                
                uncoveredTypes.forEach(type => {
                    const pseudoMove = { 
                        name: `${type.charAt(0).toUpperCase() + type.slice(1)} STAB`, 
                        type: type, 
                        category: 'physical', 
                        power: 80, 
                        accuracy: 100 
                    };
                    const eff = getEffectiveness(type, myDefTypes);
                    const effAfterAbility = applyDefenderAbility(eff, type, 'physical', mySlot.ability);
                    const effectivePower = calculateEffectivePowerWithAbility(
                        pseudoMove, enemySlot.pokemon.types, enemySlot.teraType, enemySlot.ability,
                        myDefTypes, mySlot.ability, includeAcc, fieldEffect,
                        enemySlot.pokemon, mySlot.pokemon
                    );
                    
                    // Calculate actual damage for pseudo-moves
                    let actualDamage = null;
                    if (useActualDamage) {
                        const weather = ['sun', 'rain', 'sand', 'snow'].includes(fieldEffect) ? fieldEffect : 'none';
                        const attackerLevel = getEffectiveLevel(enemySlot.level, mySlot.level);
                        const defenderLevel = getEffectiveLevel(mySlot.level, enemySlot.level);
                        actualDamage = calculateActualDamage(pseudoMove, enemySlot.pokemon, mySlot.pokemon, {
                            level: attackerLevel,
                            defenderLevel: defenderLevel,
                            attackerTeraType: enemySlot.teraType,
                            defenderTeraType: mySlot.teraType,
                            attackerAbility: enemySlot.ability,
                            defenderAbility: mySlot.ability,
                            weather: weather,
                            fieldEffect: fieldEffect
                        });
                    }
                    
                    // Display value depends on mode
                    let displayValue;
                    if (damageMode === 'damage' && actualDamage) {
                        displayValue = actualDamage.avg;
                    } else if (damageMode === 'percent' && actualDamage) {
                        displayValue = actualDamage.percentAvg;
                    } else {
                        displayValue = effectivePower;
                    }
                    
                    enemyMoveEffects.push({
                        name: pseudoMove.name,
                        type: type,
                        power: 80,
                        accuracy: 100,
                        effectiveness: effAfterAbility,
                        isStab: true,
                        effectivePower: effectivePower,
                        actualDamage: actualDamage,
                        displayValue: displayValue,
                        isDefault: true // Mark as default STAB
                    });
                });
            }
            
            // Apply sorting and limit to best move if toggle is on
            enemyMoveEffects = enemyMoveEffects
                .sort((a, b) => b.displayValue - a.displayValue)
                .slice(0, state.filterWeakMoves ? 1 : undefined);
            
            // Get best offensive and worst defensive for cell coloring
            const bestOffenseValue = myMoveEffects.length > 0 ? myMoveEffects[0].displayValue : 0;
            const worstDefenseValue = enemyMoveEffects.length > 0 ? enemyMoveEffects[0].displayValue : 0;
            
            // Determine cell background based on power comparison
            // Different thresholds based on mode
            if (damageMode === 'percent') {
                cell.classList.add(getMatchupCellClassByPercent(bestOffenseValue, worstDefenseValue));
            } else if (damageMode === 'damage') {
                cell.classList.add(getMatchupCellClassByDamage(bestOffenseValue, worstDefenseValue));
            } else {
                cell.classList.add(getMatchupCellClassByPower(bestOffenseValue, worstDefenseValue));
            }
            
            let cellHTML = '';
            
            // Calculate matchup score for this cell
            const rawMatchupScore = calculateMatchupScore(mySlot, enemySlot);
            const curvedMatchupScore = applyScoreCurve(rawMatchupScore);
            const scoreClass = rawMatchupScore >= 70 ? 'score-good' : rawMatchupScore >= 50 ? 'score-neutral' : 'score-bad';
            cellHTML += `<div class="cell-matchup-score ${scoreClass}" title="Raw: ${Math.round(rawMatchupScore)} | Curved: ${Math.round(curvedMatchupScore)}">${Math.round(curvedMatchupScore)}</div>`;
            
            // Get status threats
            const myStatusThreats = getStatusThreats(mySlot.moves, 30);
            const enemyStatusThreats = getStatusThreats(enemySlot.moves, 30);
            
            // Offensive section
            cellHTML += '<div class="cell-section offense-section">';
            cellHTML += '<div class="section-label">⚔️';
            // Add my status badges inline
            if (myStatusThreats.length > 0) {
                cellHTML += myStatusThreats.map(t => {
                    const move = getMoveByName(t.moveName);
                    const guaranteedClass = t.isGuaranteed ? 'guaranteed' : '';
                    return `<span class="status-badge move-tooltip-trigger ${guaranteedClass}" 
                                 style="background: ${t.color}"
                                 data-move-name="${t.moveName}"
                                 data-move-type="${move ? move.type : ''}"
                                 data-move-category="${move ? move.category : 'status'}"
                                 data-move-power="${move ? move.power : 0}"
                                 data-move-accuracy="${t.accuracy}"
                                 data-move-effect-chance="${t.chance}"
                                 data-move-description="${move ? move.description.replace(/"/g, '&quot;') : ''}"
                                 data-attacker-ability="${mySlot.ability || ''}">${t.label}</span>`;
                }).join('');
            }
            cellHTML += '</div>';
            if (myMoveEffects.length === 0) {
                cellHTML += '<span class="no-moves-mini">—</span>';
            } else {
                cellHTML += myMoveEffects.map(m => {
                    const displayVal = m.displayValue;
                    let powerClass, superEffClass, displayText;
                    
                    // Handle status moves - show first tick damage if available
                    if (m.isStatus) {
                        const statusDmg = m.actualDamage && m.actualDamage.percentAvg > 0 ? Math.round(m.actualDamage.percentAvg) : 0;
                        powerClass = statusDmg > 0 ? getPowerClassPercent(statusDmg) : 'power-status';
                        superEffClass = 'status-move';
                        displayText = statusDmg > 0 ? `${statusDmg}%/t` : 'Status';
                    } else if (damageMode === 'percent') {
                        powerClass = getPowerClassPercent(displayVal);
                        superEffClass = displayVal >= 100 ? 'super-eff' : displayVal < 25 ? 'not-eff' : '';
                        displayText = `${Math.round(displayVal)}%`;
                    } else if (damageMode === 'damage') {
                        powerClass = getPowerClassDamage(displayVal);
                        superEffClass = displayVal >= 150 ? 'super-eff' : displayVal < 40 ? 'not-eff' : '';
                        displayText = Math.round(displayVal);
                    } else {
                        powerClass = getPowerClass(displayVal);
                        superEffClass = displayVal >= 150 ? 'super-eff' : displayVal < 50 ? 'not-eff' : '';
                        displayText = displayVal;
                    }
                    const effectiveValue = m.effectivePower;
                    const damageHP = m.actualDamage ? Math.round(m.actualDamage.avg) : 0;
                    const damagePercent = m.actualDamage ? Math.round(m.actualDamage.percentAvg) : 0;
                    const damageRolls = (m.actualDamage && m.actualDamage.rolls) ? m.actualDamage.rolls : '';
                    return `
                        <div class="matrix-move-compact move-tooltip-trigger ${superEffClass}" 
                             data-move-name="${m.name}" 
                             data-move-type="${m.type}" 
                             data-move-category="${m.category || 'physical'}" 
                             data-move-power="${m.power}" 
                             data-move-accuracy="${m.accuracy}" 
                             data-move-description="${(m.description || '').replace(/"/g, '&quot;')}"
                             data-effective-power="${effectiveValue}"
                             data-damage-hp="${damageHP}"
                             data-damage-percent="${damagePercent}"
                             data-damage-rolls="${(damageRolls || '').replace(/"/g, '&quot;')}"
                             data-attacker-ability="${mySlot.ability || ''}">
                            <span class="move-type-dot" style="background: var(--type-${m.type})"></span>
                            <span class="move-name-tiny">${m.name}${m.isStab ? '*' : ''}</span>
                            <span class="power-badge ${powerClass}">${displayText}</span>
                        </div>
                    `;
                }).join('');
            }
            cellHTML += '</div>';
            
            // Divider
            cellHTML += '<div class="cell-divider"></div>';
            
            // Defensive section
            cellHTML += '<div class="cell-section defense-section">';
            cellHTML += '<div class="section-label">🛡️';
            // Add enemy status badges inline
            if (enemyStatusThreats.length > 0) {
                cellHTML += enemyStatusThreats.map(t => {
                    const move = getMoveByName(t.moveName);
                    const guaranteedClass = t.isGuaranteed ? 'guaranteed' : '';
                    return `<span class="status-badge enemy move-tooltip-trigger ${guaranteedClass}" 
                                 style="background: ${t.color}"
                                 data-move-name="${t.moveName}"
                                 data-move-type="${move ? move.type : ''}"
                                 data-move-category="${move ? move.category : 'status'}"
                                 data-move-power="${move ? move.power : 0}"
                                 data-move-accuracy="${t.accuracy}"
                                 data-move-effect-chance="${t.chance}"
                                 data-move-description="${move ? move.description.replace(/"/g, '&quot;') : ''}"
                                 data-attacker-ability="${enemySlot.ability || ''}">${t.label}</span>`;
                }).join('');
            }
            cellHTML += '</div>';
            if (enemyMoveEffects.length === 0) {
                cellHTML += '<span class="no-moves-mini">—</span>';
            } else {
                cellHTML += enemyMoveEffects.map(m => {
                    const displayVal = m.displayValue;
                    let powerClass, dangerClass, displayText;
                    
                    // Handle status moves - show first tick damage if available
                    if (m.isStatus) {
                        const statusDmg = m.actualDamage && m.actualDamage.percentAvg > 0 ? Math.round(m.actualDamage.percentAvg) : 0;
                        powerClass = statusDmg > 0 ? getPowerClassPercent(statusDmg) : 'power-status';
                        dangerClass = 'status-move';
                        displayText = statusDmg > 0 ? `${statusDmg}%/t` : 'Status';
                    } else if (damageMode === 'percent') {
                        powerClass = getPowerClassPercent(displayVal);
                        dangerClass = displayVal >= 100 ? 'danger' : displayVal < 25 ? 'safe' : '';
                        displayText = `${Math.round(displayVal)}%`;
                    } else if (damageMode === 'damage') {
                        powerClass = getPowerClassDamage(displayVal);
                        dangerClass = displayVal >= 150 ? 'danger' : displayVal < 40 ? 'safe' : '';
                        displayText = Math.round(displayVal);
                    } else {
                        powerClass = getPowerClass(displayVal);
                        dangerClass = displayVal >= 150 ? 'danger' : displayVal < 50 ? 'safe' : '';
                        displayText = displayVal;
                    }
                    
                    const isDefault = m.isDefault ? 'default-stab' : '';
                    const effectiveValue = m.effectivePower;
                    const damageHP = m.actualDamage ? Math.round(m.actualDamage.avg) : 0;
                    const damagePercent = m.actualDamage ? Math.round(m.actualDamage.percentAvg) : 0;
                    const damageRolls = (m.actualDamage && m.actualDamage.rolls) ? m.actualDamage.rolls : '';
                    const description = m.isDefault 
                        ? 'Assumed STAB move with 80 base power'
                        : (m.description || '');
                    return `
                        <div class="matrix-move-compact move-tooltip-trigger ${dangerClass} ${isDefault}" 
                             data-move-name="${m.name}" 
                             data-move-type="${m.type}" 
                             data-move-category="${m.category || 'physical'}" 
                             data-move-power="${m.power}" 
                             data-move-accuracy="${m.accuracy}" 
                             data-move-description="${description.replace(/"/g, '&quot;')}"
                             data-effective-power="${effectiveValue}"
                             data-damage-hp="${damageHP}"
                             data-damage-percent="${damagePercent}"
                             data-damage-rolls="${(damageRolls || '').replace(/"/g, '&quot;')}"
                             data-attacker-ability="${enemySlot.ability || ''}">
                            <span class="move-type-dot" style="background: var(--type-${m.type})"></span>
                            <span class="move-name-tiny">${m.name}${m.isStab && !m.isDefault ? '*' : ''}</span>
                            <span class="power-badge ${powerClass}">${displayText}</span>
                        </div>
                    `;
                }).join('');
            }
            cellHTML += '</div>';
            
            cell.innerHTML = cellHTML;
            row.appendChild(cell);
        });
        
        container.appendChild(row);
    });
    
    // Add "Add Enemy" row if there's room for more enemies
    if (firstEmptyEnemySlot !== -1) {
        const addRow = document.createElement('div');
        addRow.className = 'matrix-row';
        const addSlotDiv = document.createElement('div');
        addSlotDiv.className = 'matrix-row-header add-enemy-slot';
        addSlotDiv.innerHTML = `
            <div class="add-enemy-icon">+</div>
            <span class="add-enemy-text">Add Enemy</span>
        `;
        addSlotDiv.addEventListener('click', () => {
            openPokemonModal('enemy', firstEmptyEnemySlot);
        });
        addRow.appendChild(addSlotDiv);
        container.appendChild(addRow);
    }
    
    // Render bench section if there are Pokemon on the bench
    if (myBench.length > 0 || enemyBench.length > 0) {
        renderBenchSection(container, myBench, enemyBench, myBattleTeam, enemyBattleTeam);
    }
}

// Calculate matchup score for a Pokemon against an enemy (0-100 scale)
// Uses actual damage % calculations instead of just type effectiveness
// 100 = you dominate (OHKO them, they deal almost no damage)
// 50 = even matchup (similar damage both ways OR neither can do much)
// 0 = you get dominated (they OHKO you, you deal almost no damage)
function calculateMatchupScore(mySlot, enemySlot) {
    const myPokemon = mySlot.pokemon;
    const enemyPokemon = enemySlot.pokemon;
    
    if (!myPokemon || !enemyPokemon) return 50; // Neutral if no pokemon
    
    const myTypes = mySlot.teraType ? [mySlot.teraType] : myPokemon.types;
    const enemyTypes = enemySlot.teraType ? [enemySlot.teraType] : enemyPokemon.types;
    
    // Calculate best damage % I can deal to them
    let myBestDamagePercent = 0;
    
    // Use my moves if available - moves are stored as names, need to look up
    const myMoveNames = (mySlot.moves || []).filter(m => m);
    const myMoves = myMoveNames.map(name => getMoveByName(name)).filter(m => m && m.power > 0);
    if (myMoves.length > 0) {
        myMoves.forEach(move => {
            const damage = calculateActualDamage(move, myPokemon, enemyPokemon, {
                attackerTeraType: mySlot.teraType,
                defenderTeraType: enemySlot.teraType,
                attackerAbility: mySlot.ability,
                defenderAbility: enemySlot.ability,
                attackerItem: mySlot.item
            });
            if (damage.percentAvg > myBestDamagePercent) {
                myBestDamagePercent = damage.percentAvg;
            }
        });
    } else {
        // Fall back to STAB moves with base 80 power
        myTypes.forEach(type => {
            const pseudoMove = { 
                type: type, 
                power: 80, 
                category: (myPokemon.attack || 100) >= (myPokemon.spAtk || 100) ? 'physical' : 'special'
            };
            const damage = calculateActualDamage(pseudoMove, myPokemon, enemyPokemon, {
                attackerTeraType: mySlot.teraType,
                defenderTeraType: enemySlot.teraType,
                attackerAbility: mySlot.ability,
                defenderAbility: enemySlot.ability,
                attackerItem: mySlot.item
            });
            if (damage.percentAvg > myBestDamagePercent) {
                myBestDamagePercent = damage.percentAvg;
            }
        });
    }
    
    // Calculate best damage % enemy can deal to me
    let enemyBestDamagePercent = 0;
    
    // Use enemy moves if available - moves are stored as names, need to look up
    const enemyMoveNames = (enemySlot.moves || []).filter(m => m);
    const enemyMoves = enemyMoveNames.map(name => getMoveByName(name)).filter(m => m && m.power > 0);
    if (enemyMoves.length > 0) {
        enemyMoves.forEach(move => {
            const damage = calculateActualDamage(move, enemyPokemon, myPokemon, {
                attackerTeraType: enemySlot.teraType,
                defenderTeraType: mySlot.teraType,
                attackerAbility: enemySlot.ability,
                defenderAbility: mySlot.ability,
                attackerItem: enemySlot.item
            });
            if (damage.percentAvg > enemyBestDamagePercent) {
                enemyBestDamagePercent = damage.percentAvg;
            }
        });
    } else {
        // Fall back to STAB moves with base 80 power
        enemyTypes.forEach(type => {
            const pseudoMove = { 
                type: type, 
                power: 80, 
                category: (enemyPokemon.attack || 100) >= (enemyPokemon.spAtk || 100) ? 'physical' : 'special'
            };
            const damage = calculateActualDamage(pseudoMove, enemyPokemon, myPokemon, {
                attackerTeraType: enemySlot.teraType,
                defenderTeraType: mySlot.teraType,
                attackerAbility: enemySlot.ability,
                defenderAbility: mySlot.ability,
                attackerItem: enemySlot.item
            });
            if (damage.percentAvg > enemyBestDamagePercent) {
                enemyBestDamagePercent = damage.percentAvg;
            }
        });
    }
    
    // Special cases for when one side can't deal damage
    const myCanDamage = myBestDamagePercent > 0;
    const enemyCanDamage = enemyBestDamagePercent > 0;
    
    // If enemy can't damage me at all
    if (!enemyCanDamage) {
        if (myCanDamage) return 100;  // I win eventually, they can't touch me
        else return 50;                // Stalemate - neither can damage
    }
    
    // If I can't damage them at all but they can damage me
    if (!myCanDamage && enemyCanDamage) {
        return 0;  // They win eventually, I can't touch them
    }
    
    // Normal calculation when both can deal damage
    // Offense: Higher damage I deal = higher score
    let offenseScore;
    if (myBestDamagePercent >= 100) offenseScore = 50;      // OHKO
    else if (myBestDamagePercent >= 50) offenseScore = 40;  // 2HKO
    else if (myBestDamagePercent >= 33) offenseScore = 30;  // 3HKO
    else if (myBestDamagePercent >= 25) offenseScore = 22;  // 4HKO
    else if (myBestDamagePercent >= 15) offenseScore = 15;  // Low damage
    else if (myBestDamagePercent >= 5) offenseScore = 8;    // Very low
    else offenseScore = 2;                                   // Negligible but non-zero
    
    // Defense: Lower damage they deal = higher score
    let defenseScore;
    if (enemyBestDamagePercent <= 5) defenseScore = 48;      // Negligible damage
    else if (enemyBestDamagePercent <= 15) defenseScore = 42; // Very low
    else if (enemyBestDamagePercent <= 25) defenseScore = 35; // 4HKO
    else if (enemyBestDamagePercent <= 33) defenseScore = 25; // 3HKO
    else if (enemyBestDamagePercent <= 50) defenseScore = 15; // 2HKO
    else if (enemyBestDamagePercent < 100) defenseScore = 5;  // Near OHKO
    else defenseScore = 0;                                    // OHKO'd
    
    // Total score clamped to 0-100
    return Math.max(0, Math.min(100, offenseScore + defenseScore));
}

// Find the weakest Pokemon in the battle team based on matchups against enemies
// Uses weighted scoring: each enemy has 300 points total to distribute across the team
// This prevents redundant coverage from inflating scores
function findWeakestBattleTeamMember(battleTeam, enemyTeam) {
    if (battleTeam.length === 0 || enemyTeam.length === 0) return null;
    
    const { scores } = calculateWeightedTeamScores(battleTeam, enemyTeam);
    
    let worstEntry = null;
    let worstScore = Infinity;
    
    battleTeam.forEach((battleEntry, bIdx) => {
        if (scores[bIdx] < worstScore) {
            worstScore = scores[bIdx];
            worstEntry = battleEntry;
        }
    });
    
    return worstEntry;
}

// Apply non-linear curve to matchup scores
// This makes high scores (strong matchups) worth proportionally more than mediocre ones
// e.g., one 100-point matchup is worth more than four 25-point matchups
function applyScoreCurve(score) {
    // Power curve: score^1.5 / 100^0.5 to keep 100 as max
    // Score 100 → 100
    // Score 50 → ~35
    // Score 25 → ~12.5
    // Score 10 → ~3.2
    if (score <= 0) return 0;
    return Math.pow(score / 100, 1.5) * 100;
}

// Calculate weighted team scores with non-linear curve and 100 points per enemy cap
// Returns { scores: { [teamIdx]: totalAdjustedScore }, rawScores: { [teamIdx]: { [enemyIdx]: rawScore } } }
function calculateWeightedTeamScores(team, enemyTeam) {
    const POINTS_PER_ENEMY = 100;
    
    // Calculate raw scores for every Pokemon vs every enemy
    const rawScores = {};
    const curvedScores = {}; // Scores after applying non-linear curve
    
    team.forEach((entry, tIdx) => {
        rawScores[tIdx] = {};
        curvedScores[tIdx] = {};
        enemyTeam.forEach((enemyEntry, eIdx) => {
            const raw = calculateMatchupScore(entry.slot, enemyEntry.slot);
            rawScores[tIdx][eIdx] = raw;
            curvedScores[tIdx][eIdx] = applyScoreCurve(raw);
        });
    });
    
    // For each enemy, apply the 100-point cap normalization on curved scores
    const adjustedScores = {};
    team.forEach((_, tIdx) => {
        adjustedScores[tIdx] = {};
    });
    
    enemyTeam.forEach((_, eIdx) => {
        let totalCurvedForEnemy = 0;
        team.forEach((_, tIdx) => {
            totalCurvedForEnemy += curvedScores[tIdx][eIdx];
        });
        
        const adjustmentFactor = totalCurvedForEnemy > POINTS_PER_ENEMY 
            ? POINTS_PER_ENEMY / totalCurvedForEnemy 
            : 1;
        
        team.forEach((_, tIdx) => {
            adjustedScores[tIdx][eIdx] = curvedScores[tIdx][eIdx] * adjustmentFactor;
        });
    });
    
    // Calculate total adjusted score per Pokemon
    const totalScores = {};
    team.forEach((_, tIdx) => {
        let total = 0;
        enemyTeam.forEach((_, eIdx) => {
            total += adjustedScores[tIdx][eIdx];
        });
        totalScores[tIdx] = total;
    });
    
    return { scores: totalScores, rawScores, curvedScores, adjustedScores };
}

// Calculate swap recommendations based on matchups
// Uses weighted scoring: each enemy has 300 points total to distribute across the team
function calculateSwapRecommendations(benchPokemon, battleTeam, enemyTeam, isMyTeam) {
    const recommendations = [];
    
    if (battleTeam.length === 0 || enemyTeam.length === 0) return recommendations;
    
    // Get current team's weighted scores
    const currentScores = calculateWeightedTeamScores(battleTeam, enemyTeam);
    
    // Find the weakest current team member
    let worstIdx = 0;
    let worstScore = Infinity;
    Object.entries(currentScores.scores).forEach(([idx, score]) => {
        if (score < worstScore) {
            worstScore = score;
            worstIdx = parseInt(idx);
        }
    });
    const worstBattleEntry = battleTeam[worstIdx];
    
    // For each bench Pokemon, calculate what the team scores would be if they replaced the worst member
    benchPokemon.forEach(benchEntry => {
        const benchSlot = benchEntry.slot;
        
        // Create a hypothetical team with bench Pokemon replacing the worst
        const hypotheticalTeam = battleTeam.map((entry, idx) => 
            idx === worstIdx ? benchEntry : entry
        );
        
        // Calculate weighted scores for hypothetical team
        const hypotheticalScores = calculateWeightedTeamScores(hypotheticalTeam, enemyTeam);
        
        // The bench Pokemon's score in the new configuration
        const benchWeightedScore = hypotheticalScores.scores[worstIdx];
        
        // Track good matchups for this bench Pokemon
        let bestMatchups = [];
        enemyTeam.forEach((enemyEntry, eIdx) => {
            const rawScore = calculateMatchupScore(benchSlot, enemyEntry.slot);
            if (rawScore >= 60) {
                bestMatchups.push({
                    enemy: enemyEntry.slot.pokemon.name,
                    reason: rawScore >= 80 ? 'strong' : 'good',
                    score: rawScore
                });
            }
        });
        
        // Recommend if bench Pokemon would score higher than current worst
        if (benchWeightedScore > worstScore) {
            recommendations.push({
                benchEntry,
                replaceEntry: worstBattleEntry,
                score: benchWeightedScore - worstScore,
                matchups: bestMatchups.slice(0, 2)
            });
        }
    });
    
    // Sort by score improvement and return top recommendations
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
}

function renderBenchSection(container, myBench, enemyBench, myBattleTeam, enemyBattleTeam) {
    const benchSection = document.createElement('div');
    benchSection.className = 'bench-section';
    
    // Get all enemy Pokemon for matchup analysis
    const allEnemyPokemon = state.enemyTeam.map((slot, idx) => ({ slot, idx })).filter(s => s.slot.pokemon !== null);
    const allMyPokemon = state.myTeam.map((slot, idx) => ({ slot, idx })).filter(s => s.slot.pokemon !== null);
    
    // My bench - only show if there's a beneficial swap available
    if (myBench.length > 0) {
        const recommendations = calculateSwapRecommendations(myBench, myBattleTeam, enemyBattleTeam, true);
        
        // Only show my bench if there are better swaps available
        if (recommendations.length > 0) {
            const myBenchDiv = document.createElement('div');
            myBenchDiv.className = 'bench-team my-bench';
            
            // Only show bench Pokemon that are recommended swaps
            const recommendedBench = myBench.filter(entry => 
                recommendations.some(r => r.benchEntry.idx === entry.idx)
            );
            
            myBenchDiv.innerHTML = `
                <div class="bench-header">
                    <span class="bench-title">📋 Better Options (${recommendedBench.length})</span>
                    <span class="bench-hint">Click to swap with weakest team member</span>
                </div>
                <div class="bench-pokemon-list">
                    ${recommendedBench.map(entry => {
                        const slot = entry.slot;
                        const rec = recommendations.find(r => r.benchEntry.idx === entry.idx);
                        const displayTypes = slot.teraType ? [slot.teraType] : slot.pokemon.types;
                        return `
                            <div class="bench-pokemon pokemon-tooltip-trigger recommended"
                                 data-slot-index="${entry.idx}"
                                 data-team-type="my"
                                 data-pokemon-name="${slot.pokemon.name}"
                                 data-pokemon-types='${JSON.stringify(displayTypes)}'>
                                <img src="${getSpriteUrl(slot.pokemon.id)}" alt="${slot.pokemon.name}">
                                <span class="bench-pokemon-name">${slot.pokemon.name}</span>
                                ${displayTypes.map(t => `<span class="type-badge type-${t}" style="font-size: 0.55rem; padding: 0.05rem 0.2rem;">${t}</span>`).join('')}
                                ${rec ? `<span class="swap-hint" title="Replace ${rec.replaceEntry.slot.pokemon.name}">↔ ${rec.matchups.map(m => m.reason + ' vs ' + m.enemy).join(', ')}</span>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            // Add click handlers for swapping
            benchSection.appendChild(myBenchDiv);
            setTimeout(() => {
                myBenchDiv.querySelectorAll('.bench-pokemon').forEach(el => {
                    el.addEventListener('click', () => {
                        const benchIdx = parseInt(el.dataset.slotIndex);
                        // Find the weakest battle team member to swap with
                        const weakestEntry = findWeakestBattleTeamMember(myBattleTeam, enemyBattleTeam);
                        if (weakestEntry) {
                            swapPokemonSlots('my', benchIdx, weakestEntry.idx);
                        }
                    });
                });
            }, 0);
        }
    }
    
    // Enemy bench
    if (enemyBench.length > 0) {
        const enemyBenchDiv = document.createElement('div');
        enemyBenchDiv.className = 'bench-team enemy-bench';
        
        enemyBenchDiv.innerHTML = `
            <div class="bench-header">
                <span class="bench-title">📋 Enemy Bench (${enemyBench.length})</span>
            </div>
            <div class="bench-pokemon-list">
                ${enemyBench.map(entry => {
                    const slot = entry.slot;
                    const displayTypes = slot.teraType ? [slot.teraType] : slot.pokemon.types;
                    return `
                        <div class="bench-pokemon pokemon-tooltip-trigger"
                             data-slot-index="${entry.idx}"
                             data-team-type="enemy"
                             data-pokemon-name="${slot.pokemon.name}"
                             data-pokemon-types='${JSON.stringify(displayTypes)}'>
                            <img src="${getSpriteUrl(slot.pokemon.id)}" alt="${slot.pokemon.name}">
                            <span class="bench-pokemon-name">${slot.pokemon.name}</span>
                            ${displayTypes.map(t => `<span class="type-badge type-${t}" style="font-size: 0.55rem; padding: 0.05rem 0.2rem;">${t}</span>`).join('')}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Add click handlers for swapping
        benchSection.appendChild(enemyBenchDiv);
        setTimeout(() => {
            enemyBenchDiv.querySelectorAll('.bench-pokemon').forEach(el => {
                el.addEventListener('click', () => {
                    const benchIdx = parseInt(el.dataset.slotIndex);
                    const firstBattleIdx = enemyBattleTeam[enemyBattleTeam.length - 1]?.idx;
                    if (firstBattleIdx !== undefined) {
                        swapPokemonSlots('enemy', benchIdx, firstBattleIdx);
                    }
                });
            });
        }, 0);
    }
    
    // Only append bench section if it has content
    if (benchSection.children.length > 0) {
        container.appendChild(benchSection);
    }
}

function swapPokemonSlots(teamType, idx1, idx2) {
    const team = teamType === 'my' ? state.myTeam : state.enemyTeam;
    const faintedTeam = teamType === 'my' ? state.faintedMyTeam : state.faintedEnemyTeam;
    
    // Swap the slots
    const temp = team[idx1];
    team[idx1] = team[idx2];
    team[idx2] = temp;
    
    const tempFainted = faintedTeam[idx1];
    faintedTeam[idx1] = faintedTeam[idx2];
    faintedTeam[idx2] = tempFainted;
    
    renderTeamSlots();
    renderBattleView();
    autoSaveTeam(teamType === 'enemy');
}

function getMatchupCellClass(offenseEff, defenseEff) {
    // Favorable: I hit hard, they don't
    if (offenseEff >= 2 && defenseEff <= 1) return 'cell-favorable';
    // Very favorable: 4x offense or immune to their attacks
    if (offenseEff >= 4 || defenseEff === 0) return 'cell-very-favorable';
    // Unfavorable: They hit hard, I don't
    if (defenseEff >= 2 && offenseEff <= 1) return 'cell-unfavorable';
    // Very unfavorable: 4x threat
    if (defenseEff >= 4) return 'cell-very-unfavorable';
    // Mixed: Both hit hard
    if (offenseEff >= 2 && defenseEff >= 2) return 'cell-mixed';
    // Neutral
    return 'cell-neutral';
}

function getMatchupCellClassByPower(offensePower, defensePower) {
    // Very favorable: High offense, low defense threat
    if (offensePower >= 200 && defensePower < 100) return 'cell-very-favorable';
    // Favorable: Good offense advantage
    if (offensePower >= 150 && defensePower < 150) return 'cell-favorable';
    if (offensePower > defensePower * 1.5) return 'cell-favorable';
    // Very unfavorable: High threat, low offense
    if (defensePower >= 200 && offensePower < 100) return 'cell-very-unfavorable';
    // Unfavorable: They have advantage
    if (defensePower >= 150 && offensePower < 150) return 'cell-unfavorable';
    if (defensePower > offensePower * 1.5) return 'cell-unfavorable';
    // Mixed: Both threatening
    if (offensePower >= 150 && defensePower >= 150) return 'cell-mixed';
    // Neutral
    return 'cell-neutral';
}

// Cell coloring based on actual damage percentages
function getMatchupCellClassByPercent(offensePercent, defensePercent) {
    // Very favorable: OHKO potential, they can't OHKO us
    if (offensePercent >= 100 && defensePercent < 50) return 'cell-very-favorable';
    // Favorable: 2HKO guaranteed, they can't 2HKO us
    if (offensePercent >= 50 && defensePercent < 50) return 'cell-favorable';
    if (offensePercent > defensePercent * 1.5) return 'cell-favorable';
    // Very unfavorable: They OHKO us, we can't do much
    if (defensePercent >= 100 && offensePercent < 50) return 'cell-very-unfavorable';
    // Unfavorable: They 2HKO us, we can't 2HKO them
    if (defensePercent >= 50 && offensePercent < 50) return 'cell-unfavorable';
    if (defensePercent > offensePercent * 1.5) return 'cell-unfavorable';
    // Mixed: Both threatening
    if (offensePercent >= 50 && defensePercent >= 50) return 'cell-mixed';
    // Neutral
    return 'cell-neutral';
}

function getPowerClass(power) {
    if (power >= 300) return 'power-extreme';
    if (power >= 200) return 'power-high';
    if (power >= 150) return 'power-good';
    if (power >= 100) return 'power-medium';
    if (power >= 50) return 'power-low';
    return 'power-minimal';
}

// Power class for percentage-based damage display
function getPowerClassPercent(percent) {
    if (percent >= 100) return 'power-extreme';  // OHKO
    if (percent >= 75) return 'power-high';       // Near OHKO
    if (percent >= 50) return 'power-good';       // 2HKO
    if (percent >= 33) return 'power-medium';     // 3HKO
    if (percent >= 20) return 'power-low';        // 4-5HKO
    return 'power-minimal';                        // Chip damage
}

// Power class for HP damage display
function getPowerClassDamage(damage) {
    if (damage >= 200) return 'power-extreme';   // Huge damage
    if (damage >= 150) return 'power-high';       // High damage
    if (damage >= 100) return 'power-good';       // Good damage
    if (damage >= 60) return 'power-medium';      // Medium damage
    if (damage >= 30) return 'power-low';         // Low damage
    return 'power-minimal';                        // Chip damage
}

// Cell coloring based on HP damage
function getMatchupCellClassByDamage(offenseDamage, defenseDamage) {
    // Very favorable: High damage output, low incoming damage
    if (offenseDamage >= 150 && defenseDamage < 80) return 'cell-very-favorable';
    // Favorable: Good damage advantage
    if (offenseDamage >= 100 && defenseDamage < 100) return 'cell-favorable';
    if (offenseDamage > defenseDamage * 1.5) return 'cell-favorable';
    // Very unfavorable: High incoming, low output
    if (defenseDamage >= 150 && offenseDamage < 80) return 'cell-very-unfavorable';
    // Unfavorable: They have advantage
    if (defenseDamage >= 100 && offenseDamage < 100) return 'cell-unfavorable';
    if (defenseDamage > offenseDamage * 1.5) return 'cell-unfavorable';
    // Mixed: Both threatening
    if (offenseDamage >= 100 && defenseDamage >= 100) return 'cell-mixed';
    // Neutral
    return 'cell-neutral';
}

// ============================================
// STATUS THREAT DETECTION
// ============================================

// Status effects configuration - using short text labels like type badges
// value = equivalent damage % over a typical battle (for scoring status moves)
const STATUS_THREAT_CONFIG = {
    // Primary status conditions (most threatening)
    // Burn: 6.25%/turn residual + halves physical = ~75% value vs physical attackers
    burn: { label: 'BRN', color: '#ff6633', priority: 3, value: 6.25 * 2 },
    // Toxic: Scales up rapidly, devastating over time = ~100% value
    badly_poison: { label: 'TOX', color: '#aa55aa', priority: 4, value: 100 },
    bad_poison: { label: 'TOX', color: '#aa55aa', priority: 4, value: 100 },
    // Sleep: 1-3 turns of no action = ~60% value
    sleep: { label: 'SLP', color: '#9966cc', priority: 1, value: 60 },
    // Paralysis: 25% full para + speed cut = ~50% value
    paralysis: { label: 'PAR', color: '#f0d000', priority: 2, value: 50 },
    // Poison: 12.5%/turn = ~50% value
    poison: { label: 'PSN', color: '#aa55aa', priority: 5, value: 50 },
    // Freeze: Can't move until thaw = ~70% value (rare to land though)
    freeze: { label: 'FRZ', color: '#66ccff', priority: 6, value: 70 },
    // Confusion: 33% self-hit chance = ~30% value
    confusion: { label: 'CNF', color: '#ff6699', priority: 7, value: 30 },
    
    // Disruption (secondary threats)
    flinch: { label: 'FLN', color: '#888888', priority: 8, value: 20 },
    taunt: { label: 'TNT', color: '#ff4444', priority: 9, value: 40 },
    encore: { label: 'ENC', color: '#ff8844', priority: 10, value: 35 },
    
    // Stat drops
    lowers_attack: { label: 'ATK↓', color: '#cc6666', priority: 11 },
    lowers_sp_atk: { label: 'SPA↓', color: '#cc6666', priority: 11 },
    lowers_atk_sp_atk: { label: 'ATK↓', color: '#cc6666', priority: 11 },
    lowers_atk_sp_atk_switch: { label: 'EXIT', color: '#cc6666', priority: 11 },
    lowers_speed: { label: 'SPE↓', color: '#6688cc', priority: 11 },
    lowers_defense: { label: 'DEF↓', color: '#cc8866', priority: 12 },
    lowers_sp_def: { label: 'SPD↓', color: '#cc8866', priority: 12 },
    
    // Speed control
    sets_trick_room: { label: 'TR', color: '#ff66ff', priority: 13 },
    tailwind: { label: 'TW', color: '#88ccff', priority: 13 },
    
    // Priority threats
    priority: { label: '+1', color: '#ffcc00', priority: 14 },
    priority_plus2: { label: '+2', color: '#ffcc00', priority: 14 }
};

/**
 * Extract status threats from a Pokemon's moves
 * @param {Array} moves - Array of move names
 * @param {number} minChance - Minimum effectChance to consider (default 30 for reliable threats)
 * @returns {Array} Array of threat objects sorted by priority
 */
function getStatusThreats(moves, minChance = 30) {
    const threats = [];
    const seenEffects = new Set();
    
    moves.forEach(moveName => {
        if (!moveName) return;
        const move = getMoveByName(moveName);
        if (!move) return;
        
        // Get effects using the new helper (supports both legacy and new format)
        const effects = getMoveEffects(move);
        if (effects.length === 0) return;
        
        // Check each effect in the move
        effects.forEach(({ effect, chance }) => {
            if (!effect) return;
            
            const config = STATUS_THREAT_CONFIG[effect];
            const effectChance = chance || 0;
            
            // Only show if it's a known threat and meets chance threshold
            // Status moves (power 0) always count, damaging moves need high chance
            if (config && (move.power === 0 || effectChance >= minChance)) {
                if (!seenEffects.has(effect)) {
                    seenEffects.add(effect);
                    threats.push({
                        effect,
                        moveName: move.name,
                        label: config.label,
                        color: config.color,
                        priority: config.priority,
                        chance: effectChance,
                        accuracy: move.accuracy,
                        isGuaranteed: move.power === 0 && effectChance === 100
                    });
                }
            }
        });
    });
    
    return threats.sort((a, b) => a.priority - b.priority);
}

/**
 * Calculate the effective value of a status move (for sorting/display)
 * Returns an equivalent "damage percentage" based on status effect value
 * @param {Object} move - The move object
 * @returns {number} Effective value (0-100+ representing equivalent damage %)
 */
function getStatusMoveValue(move) {
    if (!move) return 0;
    
    // Get effects from the move
    const effects = getMoveEffects(move);
    if (effects.length === 0) return 0;
    
    let maxValue = 0;
    
    effects.forEach(({ effect, chance }) => {
        const config = STATUS_THREAT_CONFIG[effect];
        if (config && config.value) {
            // Adjust value by accuracy and effect chance
            const effectChance = chance || 100;
            const accuracy = move.accuracy || 100;
            const adjustedValue = config.value * (accuracy / 100) * (effectChance / 100);
            maxValue = Math.max(maxValue, adjustedValue);
        }
    });
    
    return Math.round(maxValue);
}

// ============================================
// TYPE EFFECTIVENESS & DAMAGE CALCULATIONS
// ============================================

function getEffectiveness(moveType, defenderTypes) {
    // Calculate type effectiveness multiplier
    return defenderTypes.reduce((mult, defType) => {
        const row = TYPE_CHART[moveType];
        if (row && row[defType] !== undefined) {
            return mult * row[defType];
        }
        return mult;
    }, 1);
}

function hasSTABWithTera(originalTypes, teraType, moveType) {
    // STAB applies if move type matches:
    // - Original types (always)
    // - Tera type (if set)
    const lowerMoveType = moveType.toLowerCase();
    const hasOriginalSTAB = originalTypes.some(t => t.toLowerCase() === lowerMoveType);
    const hasTeraSTAB = teraType && teraType.toLowerCase() === lowerMoveType;
    return hasOriginalSTAB || hasTeraSTAB;
}

function getSTABMultiplierForAbility(ability, originalTypes, teraType, moveType) {
    const hasStab = hasSTABWithTera(originalTypes, teraType, moveType);
    if (!hasStab) return 1;
    
    // Adaptability doubles STAB (2x instead of 1.5x)
    if (ability) {
        const abilityData = getAbilityByName(ability);
        if (abilityData && abilityData.effect === 'stab_boost') {
            return abilityData.multiplier; // 2x for Adaptability
        }
    }
    return 1.5; // Normal STAB
}

function applyDefenderAbility(effectiveness, moveType, moveCategory, defenderAbility) {
    if (!defenderAbility) return effectiveness;
    
    const abilityData = getAbilityByName(defenderAbility);
    if (!abilityData) return effectiveness;
    
    const type = moveType.toLowerCase();
    
    switch (abilityData.effect) {
        case 'immune':
            if (abilityData.immuneType === type) return 0;
            break;
            
        case 'wonderguard':
            // Only super-effective moves hit
            if (effectiveness <= 1) return 0;
            break;
            
        case 'resist':
            if (abilityData.resistTypes && abilityData.resistTypes.includes(type)) {
                return effectiveness * abilityData.multiplier;
            }
            break;
            
        case 'supereffective_reduce':
            if (effectiveness > 1) {
                return effectiveness * abilityData.multiplier;
            }
            break;
            
        case 'weak':
            if (abilityData.weakTypes && abilityData.weakTypes.includes(type)) {
                return effectiveness * abilityData.multiplier;
            }
            break;
            
        case 'resist_special':
            if (moveCategory === 'special') {
                return effectiveness * abilityData.multiplier;
            }
            break;
            
        case 'resist_physical':
            if (moveCategory === 'physical') {
                return effectiveness * abilityData.multiplier;
            }
            break;
    }
    
    return effectiveness;
}

function applyOffensiveAbility(power, move, attackerAbility) {
    if (!attackerAbility || !move) return power;
    
    const abilityData = getAbilityByName(attackerAbility);
    if (!abilityData) return power;
    
    switch (abilityData.effect) {
        case 'type_boost':
            if (move.type.toLowerCase() === abilityData.boostType) {
                return power * abilityData.multiplier;
            }
            break;
            
        case 'weak_move_boost':
            // Technician: boost moves with base power <= 60
            if (move.power <= abilityData.threshold) {
                return power * abilityData.multiplier;
            }
            break;
    }
    
    return power;
}

// Get field effect multiplier for a move type
function getFieldEffectMultiplier(moveType, fieldEffect) {
    const type = moveType.toLowerCase();
    
    switch (fieldEffect) {
        case 'sun':
            if (type === 'fire') return 1.5;
            if (type === 'water') return 0.5;
            break;
        case 'rain':
            if (type === 'water') return 1.5;
            if (type === 'fire') return 0.5;
            break;
        case 'grassy':
            if (type === 'grass') return 1.3;
            if (type === 'ground') return 0.5; // Earthquake, Bulldoze, Magnitude halved
            break;
        case 'electric':
            if (type === 'electric') return 1.3;
            break;
        case 'psychic':
            if (type === 'psychic') return 1.3;
            break;
        case 'misty':
            if (type === 'dragon') return 0.5;
            break;
    }
    return 1;
}

function calculateEffectivePowerWithAbility(move, attackerTypes, attackerTeraType, attackerAbility, defenderTypes, defenderAbility, includeAccuracy, fieldEffect = 'none', attackerStats = null, defenderStats = null) {
    if (!move || !move.power) return 0;
    
    // Start with base power
    let power = move.power;
    
    // Apply offensive ability bonuses (e.g., Technician, type boosts)
    power = applyOffensiveAbility(power, move, attackerAbility);
    
    // Apply STAB (considering tera type and Adaptability)
    const stabMultiplier = getSTABMultiplierForAbility(attackerAbility, attackerTypes, attackerTeraType, move.type);
    power *= stabMultiplier;
    
    // Calculate type effectiveness
    let effectiveness = getEffectiveness(move.type, defenderTypes);
    
    // Apply defender's ability (immunities, resistances)
    effectiveness = applyDefenderAbility(effectiveness, move.type, move.category, defenderAbility);
    
    power *= effectiveness;
    
    // Apply stat ratio if both attacker and defender stats are provided
    // Uses Attack/Defense for Physical moves, SpAtk/SpDef for Special moves
    // Based on official Pokemon damage formula: Power × (Attack / Defense)
    // We use base stats as approximation (assumes Level 50, no EVs/IVs)
    if (attackerStats && defenderStats) {
        const isPhysical = move.category === 'physical';
        const wonderRoomActive = fieldEffect === 'wonderroom';
        
        const attackStat = isPhysical ? (attackerStats.attack || 100) : (attackerStats.spAtk || 100);
        
        // Wonder Room: physical moves use SpDef, special moves use Defense
        let defenseStat;
        if (wonderRoomActive) {
            defenseStat = isPhysical ? (defenderStats.spDef || 100) : (defenderStats.defense || 100);
        } else {
            defenseStat = isPhysical ? (defenderStats.defense || 100) : (defenderStats.spDef || 100);
        }
        
        // Official formula uses linear ratio: Attack / Defense
        // We normalize to keep numbers reasonable (divide by 100 as baseline)
        // This gives: 100 atk vs 100 def = 1.0x multiplier
        const statRatio = attackStat / defenseStat;
        power *= statRatio;
    }
    
    // Apply field effect (weather/terrain)
    power *= getFieldEffectMultiplier(move.type, fieldEffect);
    
    // Apply accuracy if enabled
    if (includeAccuracy && move.accuracy) {
        power *= (move.accuracy / 100);
    }
    
    return Math.round(power);
}

/**
 * Get the effective level for damage calculations
 * - If attacker has a level set, use it
 * - If not, and defender has a level set, use defender's level
 * - If neither has a level, default to 50
 */
function getEffectiveLevel(attackerLevel, defenderLevel) {
    if (attackerLevel && attackerLevel >= 1 && attackerLevel <= 100) {
        return attackerLevel;
    }
    if (defenderLevel && defenderLevel >= 1 && defenderLevel <= 100) {
        return defenderLevel;
    }
    return 50; // Default VGC level
}

/**
 * Calculate damage from status moves (first tick of residual damage)
 * @param {Object} move - The status move
 * @param {Object} defender - Defender Pokemon object with stats
 * @param {Object} options - Additional options
 * @returns {Object} { min, max, avg, percentMin, percentMax, percentAvg }
 */
function calculateStatusMoveDamage(move, defender, options = {}) {
    const {
        level = 50,
        defenderLevel = null
    } = options;
    
    const defenderLvl = defenderLevel || level;
    
    // Calculate defender's HP using shared function
    const defenderHP = defender ? calculateMaxHP(defender, defenderLvl) : Math.floor((2 * 100 + 31) * defenderLvl / 100) + defenderLvl + 10;
    
    // Get the move's effects to determine damage
    const effects = getMoveEffects(move);
    let damagePercent = 0;
    
    // Status damage per tick (percentage of max HP)
    const STATUS_TICK_DAMAGE = {
        burn: 6.25,           // 1/16 HP per turn
        poison: 12.5,         // 1/8 HP per turn
        badly_poison: 6.25,   // Starts at 1/16, scales up (use first tick)
        bad_poison: 6.25,     // Starts at 1/16, scales up (use first tick)
        leech_seed: 12.5,     // 1/8 HP per turn
        curse: 25,            // 1/4 HP per turn (Ghost curse)
        nightmare: 25,        // 1/4 HP per turn while asleep
        trap: 12.5            // Wrap, Bind, etc. - 1/8 HP per turn
    };
    
    // Find the highest damage effect
    effects.forEach(({ effect }) => {
        if (effect && STATUS_TICK_DAMAGE[effect]) {
            damagePercent = Math.max(damagePercent, STATUS_TICK_DAMAGE[effect]);
        }
    });
    
    // Also check legacy effect field
    if (move.effect && STATUS_TICK_DAMAGE[move.effect]) {
        damagePercent = Math.max(damagePercent, STATUS_TICK_DAMAGE[move.effect]);
    }
    
    if (damagePercent === 0) {
        return { min: 0, max: 0, avg: 0, percentMin: 0, percentMax: 0, percentAvg: 0 };
    }
    
    // Calculate actual damage (rounded up for status damage)
    const damage = Math.ceil(defenderHP * damagePercent / 100);
    const percentDamage = Math.round((damage / defenderHP) * 1000) / 10;
    
    return {
        min: damage,
        max: damage,
        avg: damage,
        percentMin: percentDamage,
        percentMax: percentDamage,
        percentAvg: percentDamage,
        isStatusDamage: true
    };
}

/**
 * Calculate actual average damage in HP based on official Pokemon formula
 * Formula: floor((2 × Level / 5 + 2) × Power × Attack / Defense / 50 + 2) × Modifiers × 0.925
 * 
 * @param {Object} move - The move being used
 * @param {Object} attacker - Attacker Pokemon object with stats
 * @param {Object} defender - Defender Pokemon object with stats  
 * @param {Object} options - Additional options
 * @returns {Object} { min, max, avg, percentMin, percentMax, percentAvg }
 */
function calculateActualDamage(move, attacker, defender, options = {}) {
    if (!move) {
        return { min: 0, max: 0, avg: 0, percentMin: 0, percentMax: 0, percentAvg: 0 };
    }
    
    // Handle status moves - calculate first tick of status damage
    if (!move.power || move.category === 'status') {
        return calculateStatusMoveDamage(move, defender, options);
    }
    
    const {
        level = 50,                    // Attacker level (VGC = 50, Smogon = 100)
        defenderLevel = null,          // Defender level (if different, defaults to attacker level)
        attackerTeraType = null,
        defenderTeraType = null,
        attackerAbility = null,
        defenderAbility = null,
        attackerItem = null,
        weather = 'none',
        terrain = 'none',
        fieldEffect = 'none',          // For special rooms (wonderroom, magicroom, trickroom)
        isCritical = false,
        isBurned = false,
        defenderStatus = null,         // Defender's status condition for abilities like Marvel Scale
        attackBoost = 0,               // Stat stages (-6 to +6)
        defenseBoost = 0,
        spAtkBoost = 0,
        spDefBoost = 0
    } = options;
    
    const attackerLvl = level;
    const defenderLvl = defenderLevel || level; // Default to attacker level if not specified
    
    const isPhysical = move.category === 'physical';
    
    // Wonder Room: swap Defense and Special Defense
    const wonderRoomActive = fieldEffect === 'wonderroom';
    
    // Get base stats (these represent Level 50 with 0 EVs/IVs for simplicity)
    // Real stat = floor((2 × Base + IV + floor(EV/4)) × Level / 100) + 5 [+Nature]
    // For base stat approximation at Level 50: floor(Base + 5 + Level) ≈ Base + 55
    const attackBase = isPhysical ? (attacker.attack || 100) : (attacker.spAtk || 100);
    
    // Under Wonder Room, physical moves use SpDef and special moves use Defense
    let defenseBase;
    if (wonderRoomActive) {
        defenseBase = isPhysical ? (defender.spDef || 100) : (defender.defense || 100);
    } else {
        defenseBase = isPhysical ? (defender.defense || 100) : (defender.spDef || 100);
    }
    
    // Approximate actual stats with neutral nature, 0 EVs, 31 IVs
    // Formula: floor((2 × Base + 31) × Level / 100) + 5
    const attackStat = Math.floor((2 * attackBase + 31) * attackerLvl / 100) + 5;
    const defenseStat = Math.floor((2 * defenseBase + 31) * defenderLvl / 100) + 5;
    
    // Apply stat stage multipliers
    const stageMultipliers = [2/8, 2/7, 2/6, 2/5, 2/4, 2/3, 2/2, 3/2, 4/2, 5/2, 6/2, 7/2, 8/2];
    const attackMultiplier = stageMultipliers[(isPhysical ? attackBoost : spAtkBoost) + 6];
    const defenseMultiplier = stageMultipliers[(isPhysical ? defenseBoost : spDefBoost) + 6];
    
    const finalAttack = Math.floor(attackStat * attackMultiplier);
    let finalDefense = Math.floor(defenseStat * defenseMultiplier);
    
    // Apply status-based ability modifiers (e.g., Marvel Scale boosts Defense when statused)
    if (defenderAbility && defenderStatus) {
        const statType = isPhysical ? 'defense' : 'spDef';
        const abilityDefenseMultiplier = getStatusAbilityStatMultiplier(defenderAbility, statType, true);
        finalDefense = Math.floor(finalDefense * abilityDefenseMultiplier);
    }
    
    // Base power
    let power = move.power;
    
    // Apply offensive ability to power (Technician, etc.)
    if (attackerAbility) {
        power = applyOffensiveAbility(power, move, attackerAbility);
    }
    
    // Core damage formula: floor((2 × Level / 5 + 2) × Power × A / D / 50 + 2)
    const levelFactor = Math.floor(2 * level / 5) + 2;
    let baseDamage = Math.floor(Math.floor(levelFactor * power * finalAttack / finalDefense) / 50) + 2;
    
    // === MODIFIER CHAIN ===
    let modifier = 1;
    
    // Weather
    if (weather === 'sun' && move.type === 'fire') modifier *= 1.5;
    if (weather === 'sun' && move.type === 'water') modifier *= 0.5;
    if (weather === 'rain' && move.type === 'water') modifier *= 1.5;
    if (weather === 'rain' && move.type === 'fire') modifier *= 0.5;
    
    // Critical hit (1.5x, ignores negative attack stages and positive defense stages)
    if (isCritical) modifier *= 1.5;
    
    // STAB
    const attackerTypes = attacker.types || [];
    const hasSTAB = attackerTypes.some(t => t.toLowerCase() === move.type.toLowerCase()) ||
                    (attackerTeraType && attackerTeraType.toLowerCase() === move.type.toLowerCase());
    if (hasSTAB) {
        modifier *= (attackerAbility === 'Adaptability') ? 2.0 : 1.5;
    }
    
    // Type effectiveness
    const defenderTypes = defenderTeraType ? [defenderTeraType] : (defender.types || []);
    let effectiveness = getEffectiveness(move.type, defenderTypes);
    
    // Apply defender ability (immunities, etc.)
    if (defenderAbility) {
        effectiveness = applyDefenderAbility(effectiveness, move.type, move.category, defenderAbility);
    }
    modifier *= effectiveness;
    
    // Burn (halves physical damage, except Guts/Facade)
    if (isBurned && isPhysical && attackerAbility !== 'Guts') {
        modifier *= 0.5;
    }
    
    // Item effects (Magic Room negates held items)
    const magicRoomActive = fieldEffect === 'magicroom';
    if (attackerItem && !magicRoomActive) {
        const itemMult = applyItemToOffense(attackerItem, move, attackerTypes, effectiveness);
        modifier *= itemMult;
    }
    
    // Calculate damage range (random roll is 0.85 to 1.00)
    const minDamage = Math.floor(baseDamage * modifier * 0.85);
    const maxDamage = Math.floor(baseDamage * modifier * 1.00);
    const avgDamage = Math.floor(baseDamage * modifier * 0.925);
    
    // Calculate defender HP using shared function
    const defenderHP = calculateMaxHP(defender, defenderLvl);
    
    // Calculate percentages
    const percentMin = Math.round((minDamage / defenderHP) * 1000) / 10;
    const percentMax = Math.round((maxDamage / defenderHP) * 1000) / 10;
    const percentAvg = Math.round((avgDamage / defenderHP) * 1000) / 10;
    
    return {
        min: minDamage,
        max: maxDamage,
        avg: avgDamage,
        percentMin,
        percentMax,
        percentAvg,
        defenderHP,
        rolls: `${minDamage}-${maxDamage} (${percentMin}%-${percentMax}%)`
    };
}

/**
 * Get a human-readable damage description
 */
function getDamageDescription(damageResult) {
    const { percentMin, percentMax } = damageResult;
    
    if (percentMin >= 100) return 'OHKO guaranteed';
    if (percentMax >= 100 && percentMin >= 50) return 'OHKO possible';
    if (percentMin >= 50) return '2HKO guaranteed';
    if (percentMax >= 50) return '2HKO possible';
    if (percentMin >= 33) return '3HKO guaranteed';
    if (percentMax >= 33) return '3HKO possible';
    if (percentMin >= 25) return '4HKO';
    return 'Low damage';
}

// ============================================
// POKEMON MODAL
// ============================================

function openPokemonModal(team, slotIndex) {
    state.modalContext = {
        type: 'pokemon',
        team: team,
        slotIndex: slotIndex,
        moveIndex: null
    };
    
    elements.pokemonSearch.value = '';
    filterPokemonGrid('');
    elements.pokemonModal.classList.add('active');
    elements.pokemonSearch.focus();
}

function closePokemonModal() {
    elements.pokemonModal.classList.remove('active');
    state.modalContext = { type: null, team: null, slotIndex: null, moveIndex: null };
}

function populatePokemonGrid() {
    const grid = elements.pokemonGrid;
    grid.innerHTML = '';
    
    POKEMON_DATA.forEach(pokemon => {
        const option = document.createElement('div');
        option.className = 'pokemon-option';
        option.dataset.pokemonId = pokemon.id;
        option.dataset.pokemonName = pokemon.name.toLowerCase();
        option.innerHTML = `
            <img src="${getSpriteUrl(pokemon.id)}" alt="${pokemon.name}" loading="lazy">
            <div class="pokemon-option-name">${pokemon.name}</div>
        `;
        option.addEventListener('click', () => selectPokemon(pokemon));
        grid.appendChild(option);
    });
}

function filterPokemonGrid(query) {
    const lowerQuery = query.toLowerCase();
    const options = elements.pokemonGrid.querySelectorAll('.pokemon-option');
    
    options.forEach(option => {
        const name = option.dataset.pokemonName;
        const id = option.dataset.pokemonId;
        const matches = name.includes(lowerQuery) || id === query;
        option.style.display = matches ? '' : 'none';
    });
}

function selectPokemon(pokemon) {
    const { team, slotIndex } = state.modalContext;
    const targetTeam = team === 'my' ? state.myTeam : state.enemyTeam;
    
    targetTeam[slotIndex] = {
        pokemon: pokemon,
        moves: [null, null, null, null],
        ability: null,
        teraType: null,
        item: null,
        level: null
    };
    
    closePokemonModal();
    renderTeamSlots();
    renderBattleView();
    autoSaveTeam(team === 'enemy');
}

function removePokemon(team, slotIndex) {
    const targetTeam = team === 'my' ? state.myTeam : state.enemyTeam;
    targetTeam[slotIndex] = { pokemon: null, moves: [null, null, null, null], ability: null, teraType: null, item: null, level: null };
    renderTeamSlots();
    renderBattleView();
    autoSaveTeam(team === 'enemy');
}

// ============================================
// MOVE MODAL
// ============================================

function openMoveModal(team, slotIndex, moveIndex) {
    state.modalContext = {
        type: 'move',
        team: team,
        slotIndex: slotIndex,
        moveIndex: moveIndex
    };
    
    elements.moveSearch.value = '';
    filterMoveList('');
    elements.moveModal.classList.add('active');
    elements.moveSearch.focus();
}

function closeMoveModal() {
    elements.moveModal.classList.remove('active');
    state.modalContext = { type: null, team: null, slotIndex: null, moveIndex: null };
}

function populateMoveList() {
    const list = elements.moveList;
    list.innerHTML = '';
    
    // Sort moves by type, then by name
    const sortedMoves = [...MOVES_DATA].sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.name.localeCompare(b.name);
    });
    
    sortedMoves.forEach(move => {
        const option = document.createElement('div');
        option.className = 'move-option';
        option.dataset.moveName = move.name.toLowerCase();
        option.dataset.moveType = move.type;
        option.innerHTML = `
            <span class="type-badge type-${move.type} move-option-type">${move.type}</span>
            <span class="move-option-name">${move.name}</span>
            <span class="move-option-category">${move.category}</span>
        `;
        option.addEventListener('click', () => selectMove(move));
        list.appendChild(option);
    });
}

function filterMoveList(query) {
    const lowerQuery = query.toLowerCase();
    const options = elements.moveList.querySelectorAll('.move-option');
    
    options.forEach(option => {
        const name = option.dataset.moveName;
        const type = option.dataset.moveType;
        const matches = name.includes(lowerQuery) || type.includes(lowerQuery);
        option.style.display = matches ? '' : 'none';
    });
}

function selectMove(move) {
    const { team, slotIndex, moveIndex } = state.modalContext;
    const targetTeam = team === 'my' ? state.myTeam : state.enemyTeam;
    
    targetTeam[slotIndex].moves[moveIndex] = move.name;
    
    closeMoveModal();
    renderTeamSlots();
    renderBattleView();
    autoSaveTeam(team === 'enemy');
}

// ============================================
// QUICK MOVE EDITOR (Battle View)
// ============================================

let quickMoveEditorState = {
    slotIndex: null,
    selectedMoveSlot: 0
};

function openQuickMoveEditor(slotIndex, enemySlot) {
    quickMoveEditorState.slotIndex = slotIndex;
    quickMoveEditorState.selectedMoveSlot = 0;
    
    const modal = document.getElementById('quick-move-modal');
    const pokemonInfo = document.getElementById('quick-move-pokemon-info');
    const slotsContainer = document.getElementById('quick-move-slots');
    
    // Show Pokemon info
    pokemonInfo.innerHTML = `
        <img src="${getSpriteUrl(enemySlot.pokemon.id)}" alt="${enemySlot.pokemon.name}" class="quick-move-sprite">
        <div class="quick-move-pokemon-details">
            <span class="quick-move-pokemon-name">${enemySlot.pokemon.name}</span>
            <div class="quick-move-pokemon-types">
                ${enemySlot.pokemon.types.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
            </div>
        </div>
    `;
    
    // Show current move slots
    renderQuickMoveSlots();
    
    // Setup search
    const searchInput = document.getElementById('quick-move-search');
    searchInput.value = '';
    filterQuickMoveList('');
    
    modal.classList.add('active');
    searchInput.focus();
}

function renderQuickMoveSlots() {
    const slotsContainer = document.getElementById('quick-move-slots');
    const slot = state.enemyTeam[quickMoveEditorState.slotIndex];
    
    slotsContainer.innerHTML = slot.moves.map((move, idx) => {
        const moveData = move ? getMoveByName(move) : null;
        const typeClass = moveData ? moveData.type : 'empty';
        const isSelected = idx === quickMoveEditorState.selectedMoveSlot;
        return `
            <div class="quick-move-slot ${isSelected ? 'selected' : ''} ${move ? '' : 'empty'}" data-slot="${idx}">
                <span class="slot-number">${idx + 1}</span>
                ${move ? `
                    <span class="move-type-dot" style="background: var(--type-${typeClass})"></span>
                    <span class="slot-move-name">${move}</span>
                    <button class="slot-remove-btn" data-slot="${idx}">×</button>
                ` : `
                    <span class="slot-empty-text">Empty</span>
                `}
            </div>
        `;
    }).join('');
    
    // Add click handlers
    slotsContainer.querySelectorAll('.quick-move-slot').forEach(slotEl => {
        slotEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('slot-remove-btn')) {
                const slotIdx = parseInt(e.target.dataset.slot);
                state.enemyTeam[quickMoveEditorState.slotIndex].moves[slotIdx] = null;
                renderQuickMoveSlots();
                renderBattleView();
                autoSaveTeam(true); // Enemy team
                return;
            }
            quickMoveEditorState.selectedMoveSlot = parseInt(slotEl.dataset.slot);
            renderQuickMoveSlots();
        });
    });
}

function filterQuickMoveList(query) {
    const list = document.getElementById('quick-move-list');
    const lowerQuery = query.toLowerCase();
    
    const filteredMoves = MOVES_DATA.filter(m => 
        m.name.toLowerCase().includes(lowerQuery) ||
        m.type.toLowerCase().includes(lowerQuery)
    ).slice(0, 50); // Limit results
    
    list.innerHTML = filteredMoves.map(move => `
        <div class="quick-move-option" data-move="${move.name}">
            <span class="move-type-dot" style="background: var(--type-${move.type})"></span>
            <span class="move-option-name">${move.name}</span>
            <span class="move-option-stats">${move.category} | ${move.power || '—'} | ${move.accuracy}%</span>
        </div>
    `).join('');
    
    // Add click handlers
    list.querySelectorAll('.quick-move-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const moveName = opt.dataset.move;
            selectQuickMove(moveName);
        });
    });
}

function selectQuickMove(moveName) {
    const slot = state.enemyTeam[quickMoveEditorState.slotIndex];
    slot.moves[quickMoveEditorState.selectedMoveSlot] = moveName;
    
    // Move to next empty slot or stay on current
    const nextEmpty = slot.moves.findIndex((m, idx) => m === null && idx > quickMoveEditorState.selectedMoveSlot);
    if (nextEmpty !== -1) {
        quickMoveEditorState.selectedMoveSlot = nextEmpty;
    } else {
        const firstEmpty = slot.moves.findIndex(m => m === null);
        if (firstEmpty !== -1) {
            quickMoveEditorState.selectedMoveSlot = firstEmpty;
        }
    }
    
    renderQuickMoveSlots();
    renderBattleView();
    autoSaveTeam(true); // Enemy team
    
    // Clear search and refocus
    const searchInput = document.getElementById('quick-move-search');
    searchInput.value = '';
    filterQuickMoveList('');
    searchInput.focus();
}

function closeQuickMoveModal() {
    document.getElementById('quick-move-modal').classList.remove('active');
    quickMoveEditorState = { slotIndex: null, selectedMoveSlot: 0 };
}

// ============================================
// ABILITY MODAL
// ============================================

function openAbilityModal(team, slotIndex) {
    state.modalContext = {
        type: 'ability',
        team: team,
        slotIndex: slotIndex,
        moveIndex: null
    };
    
    elements.abilitySearch.value = '';
    filterAbilityList('');
    elements.abilityModal.classList.add('active');
    elements.abilitySearch.focus();
}

function closeAbilityModal() {
    elements.abilityModal.classList.remove('active');
    state.modalContext = { type: null, team: null, slotIndex: null, moveIndex: null };
}

function populateAbilityList() {
    const list = elements.abilityList;
    list.innerHTML = '';
    
    // Sort abilities by effect type, then by name
    const sortedAbilities = [...ABILITIES_DATA].sort((a, b) => {
        // Priority: battle-relevant abilities first
        const getPriority = (ab) => {
            if (ab.effect === 'wonderguard') return 0;
            if (ab.effect === 'immune') return 1;
            if (ab.effect === 'resist' || ab.effect === 'supereffective_reduce') return 2;
            if (ab.effect === 'stab_boost' || ab.effect === 'type_boost') return 3;
            return 10;
        };
        const priorityDiff = getPriority(a) - getPriority(b);
        if (priorityDiff !== 0) return priorityDiff;
        return a.name.localeCompare(b.name);
    });
    
    sortedAbilities.forEach(ability => {
        const option = document.createElement('div');
        option.className = 'ability-option';
        option.dataset.abilityName = ability.name.toLowerCase();
        option.dataset.abilityEffect = ability.effect;
        
        // Color-code by effect type
        let effectClass = 'effect-none';
        if (ability.effect === 'immune' || ability.effect === 'wonderguard') effectClass = 'effect-immune';
        else if (ability.effect === 'resist' || ability.effect === 'supereffective_reduce') effectClass = 'effect-resist';
        else if (ability.effect === 'stab_boost' || ability.effect === 'type_boost') effectClass = 'effect-boost';
        
        option.innerHTML = `
            <span class="ability-option-name">${ability.name}</span>
            <span class="ability-option-desc ${effectClass}">${ability.description}</span>
        `;
        option.addEventListener('click', () => selectAbility(ability));
        list.appendChild(option);
    });
}

function filterAbilityList(query) {
    const lowerQuery = query.toLowerCase();
    const options = elements.abilityList.querySelectorAll('.ability-option');
    
    options.forEach(option => {
        const name = option.dataset.abilityName;
        const desc = option.querySelector('.ability-option-desc').textContent.toLowerCase();
        const matches = name.includes(lowerQuery) || desc.includes(lowerQuery);
        option.style.display = matches ? '' : 'none';
    });
}

function selectAbility(ability) {
    const { team, slotIndex } = state.modalContext;
    const targetTeam = team === 'my' ? state.myTeam : state.enemyTeam;
    
    targetTeam[slotIndex].ability = ability.name === 'None' ? null : ability.name;
    
    closeAbilityModal();
    renderTeamSlots();
    renderBattleView();
    autoSaveTeam(team === 'enemy');
}

// ============================================
// TERA TYPE MODAL
// ============================================

function openTeraModal(team, slotIndex) {
    state.modalContext = {
        type: 'tera',
        team: team,
        slotIndex: slotIndex,
        moveIndex: null
    };
    
    populateTeraList();
    elements.teraModal.classList.add('active');
}

function closeTeraModal() {
    elements.teraModal.classList.remove('active');
    state.modalContext = { type: null, team: null, slotIndex: null, moveIndex: null };
}

function populateTeraList() {
    const list = elements.teraList;
    list.innerHTML = '';
    
    // Add "Clear Tera" option
    const clearOption = document.createElement('div');
    clearOption.className = 'tera-option tera-clear';
    clearOption.innerHTML = `<span>✕ Clear Tera Type</span>`;
    clearOption.addEventListener('click', () => selectTera(null));
    list.appendChild(clearOption);
    
    // Add all types
    ALL_TYPES.forEach(type => {
        const option = document.createElement('div');
        option.className = `tera-option type-${type}`;
        option.innerHTML = `
            <span class="tera-icon">⟡</span>
            <span class="tera-name">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
        `;
        option.addEventListener('click', () => selectTera(type));
        list.appendChild(option);
    });
}

function selectTera(teraType) {
    const { team, slotIndex } = state.modalContext;
    const targetTeam = team === 'my' ? state.myTeam : state.enemyTeam;
    
    targetTeam[slotIndex].teraType = teraType;
    
    closeTeraModal();
    renderTeamSlots();
    renderBattleView();
    autoSaveTeam(team === 'enemy');
}

// ============================================
// ITEM MODAL
// ============================================

function openItemModal(team, slotIndex) {
    state.modalContext = {
        type: 'item',
        team: team,
        slotIndex: slotIndex,
        moveIndex: null
    };
    
    elements.itemSearch.value = '';
    filterItemList('');
    elements.itemModal.classList.add('active');
    elements.itemSearch.focus();
}

function closeItemModal() {
    elements.itemModal.classList.remove('active');
    state.modalContext = { type: null, team: null, slotIndex: null, moveIndex: null };
}

function populateItemList() {
    const list = elements.itemList;
    list.innerHTML = '';
    
    // Group items by category
    const categories = [
        { key: 'choice', label: '⚔️ Choice Items' },
        { key: 'damage', label: '💥 Damage Boosters' },
        { key: 'type_boost', label: '🔥 Type Boosters' },
        { key: 'defense', label: '🛡️ Defensive Items' },
        { key: 'recovery', label: '💚 Recovery Items' },
        { key: 'resist_berry', label: '🍇 Resist Berries' },
        { key: 'stat_berry', label: '📈 Stat Berries' },
        { key: 'heal_berry', label: '🍓 Healing Berries' },
        { key: 'status_berry', label: '💊 Status Berries' },
        { key: 'utility', label: '🔧 Utility Items' },
        { key: 'plate', label: '📀 Plates' },
        { key: 'gem', label: '💎 Gems' },
        { key: 'mega_stone', label: '🌟 Mega Stones' },
        { key: 'z_crystal', label: '⚡ Z-Crystals' },
        { key: 'priority', label: '⏱️ Priority Items' },
        { key: 'terrain_seed', label: '🌱 Terrain Seeds' },
        { key: 'none', label: '❌ No Item' }
    ];
    
    categories.forEach(cat => {
        const itemsInCat = ITEMS_DATA.filter(i => i.category === cat.key);
        if (itemsInCat.length === 0) return;
        
        // Add category header
        const header = document.createElement('div');
        header.className = 'item-category-header';
        header.textContent = cat.label;
        list.appendChild(header);
        
        // Add items
        itemsInCat.forEach(item => {
            const option = document.createElement('div');
            option.className = 'item-option';
            option.dataset.itemName = item.name.toLowerCase();
            option.dataset.itemCategory = item.category;
            
            // Color-code by category
            let categoryClass = 'cat-default';
            if (item.category === 'choice') categoryClass = 'cat-choice';
            else if (item.category === 'damage') categoryClass = 'cat-damage';
            else if (item.category === 'defense' || item.category === 'resist_berry') categoryClass = 'cat-defense';
            else if (item.category === 'type_boost' || item.category === 'plate') categoryClass = 'cat-type';
            
            option.innerHTML = `
                <span class="item-option-name">${item.name}</span>
                <span class="item-option-desc ${categoryClass}">${item.description}</span>
            `;
            option.addEventListener('click', () => selectItem(item));
            list.appendChild(option);
        });
    });
}

function filterItemList(query) {
    const lowerQuery = query.toLowerCase();
    const options = elements.itemList.querySelectorAll('.item-option');
    const headers = elements.itemList.querySelectorAll('.item-category-header');
    
    // First hide all headers
    headers.forEach(h => h.style.display = 'none');
    
    options.forEach(option => {
        const name = option.dataset.itemName;
        const desc = option.querySelector('.item-option-desc').textContent.toLowerCase();
        const matches = name.includes(lowerQuery) || desc.includes(lowerQuery);
        option.style.display = matches ? '' : 'none';
    });
    
    // Show headers if any items in that category are visible
    if (!lowerQuery) {
        headers.forEach(h => h.style.display = '');
    }
}

function selectItem(item) {
    const { team, slotIndex } = state.modalContext;
    const targetTeam = team === 'my' ? state.myTeam : state.enemyTeam;
    
    targetTeam[slotIndex].item = item.name === 'None' ? null : item.name;
    
    closeItemModal();
    renderTeamSlots();
    renderBattleView();
    autoSaveTeam(team === 'enemy');
}

// ============================================
// SAVE / LOAD TEAMS
// ============================================

// Auto-save team if it has a name (silent save, no UI feedback)
function autoSaveTeam(isEnemy = false) {
    const nameInput = isEnemy ? elements.enemyTeamNameInput : elements.teamNameInput;
    const teamData = isEnemy ? state.enemyTeam : state.myTeam;
    
    const teamName = nameInput.value.trim();
    if (!teamName) return; // Don't auto-save if no name
    
    // Check if team has at least one Pokemon
    const hasPokemon = teamData.some(slot => slot.pokemon !== null);
    if (!hasPokemon) return;
    
    const savedTeams = getSavedTeams();
    savedTeams[teamName] = {
        pokemon: teamData.map(slot => ({
            id: slot.pokemon?.id || null,
            name: slot.pokemon?.name || null,
            types: slot.pokemon?.types || [],
            moves: slot.moves,
            ability: slot.ability || null,
            teraType: slot.teraType || null,
            item: slot.item || null,
            level: slot.level || null
        }))
    };
    
    localStorage.setItem('pokemonBattleTeams', JSON.stringify(savedTeams));
}

function saveTeam(isEnemy = false) {
    const nameInput = isEnemy ? elements.enemyTeamNameInput : elements.teamNameInput;
    const teamData = isEnemy ? state.enemyTeam : state.myTeam;
    const btn = isEnemy ? elements.saveEnemyBtn : elements.saveTeamBtn;
    
    const teamName = nameInput.value.trim();
    if (!teamName) {
        alert('Please enter a team name');
        return;
    }
    
    // Check if team has at least one Pokemon
    const hasPokemon = teamData.some(slot => slot.pokemon !== null);
    if (!hasPokemon) {
        alert('Please add at least one Pokemon to the team');
        return;
    }
    
    const savedTeams = getSavedTeams();
    savedTeams[teamName] = {
        pokemon: teamData.map(slot => ({
            id: slot.pokemon?.id || null,
            name: slot.pokemon?.name || null,
            types: slot.pokemon?.types || [],
            moves: slot.moves,
            ability: slot.ability || null,
            teraType: slot.teraType || null,
            item: slot.item || null,
            level: slot.level || null
        }))
    };
    
    localStorage.setItem('pokemonBattleTeams', JSON.stringify(savedTeams));
    loadSavedTeams();
    
    // Show feedback
    const originalText = btn.textContent;
    btn.textContent = 'Saved!';
    btn.style.background = 'var(--accent-tertiary)';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1500);
}

function loadTeam(teamName, isEnemy = false) {
    if (!teamName) return;
    
    const savedTeams = getSavedTeams();
    const team = savedTeams[teamName];
    
    if (team) {
        const loadedTeam = team.pokemon.map(p => {
            if (p.id) {
                const pokemon = POKEMON_DATA.find(pk => pk.id === p.id);
                return {
                    pokemon: pokemon || null,
                    moves: p.moves || [null, null, null, null],
                    ability: p.ability || null,
                    teraType: p.teraType || null,
                    item: p.item || null,
                    level: p.level || null
                };
            }
            return { pokemon: null, moves: [null, null, null, null], ability: null, teraType: null, item: null, level: null };
        });
        
        // Ensure we have enough slots for the roster
        while (loadedTeam.length < MAX_ROSTER_SIZE) {
            loadedTeam.push({ pokemon: null, moves: [null, null, null, null], ability: null, teraType: null, item: null, level: null });
        }
        
        if (isEnemy) {
            state.enemyTeam = loadedTeam;
            elements.enemyTeamNameInput.value = teamName;
            // Save last selected enemy team
            localStorage.setItem('lastSelectedEnemyTeam', teamName);
        } else {
            state.myTeam = loadedTeam;
            elements.teamNameInput.value = teamName;
            // Save last selected my team
            localStorage.setItem('lastSelectedMyTeam', teamName);
        }
        
        renderTeamSlots();
        renderBattleView();
    }
}

function deleteTeam() {
    const teamName = elements.loadTeamSelect.value;
    if (!teamName) {
        alert('Please select a team to delete');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete "${teamName}"?`)) {
        return;
    }
    
    const savedTeams = getSavedTeams();
    delete savedTeams[teamName];
    localStorage.setItem('pokemonBattleTeams', JSON.stringify(savedTeams));
    
    elements.loadTeamSelect.value = '';
    elements.loadEnemySelect.value = '';
    loadSavedTeams();
}

function getSavedTeams() {
    try {
        return JSON.parse(localStorage.getItem('pokemonBattleTeams')) || {};
    } catch {
        return {};
    }
}

function loadSavedTeams() {
    const savedTeams = getSavedTeams();
    
    // Populate both dropdowns
    [elements.loadTeamSelect, elements.loadEnemySelect].forEach(select => {
        // Clear existing options except first
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add saved teams
        Object.keys(savedTeams).sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    });
}

function loadLastSelectedTeams() {
    const savedTeams = getSavedTeams();
    
    // Load last selected "My Team"
    const lastMyTeam = localStorage.getItem('lastSelectedMyTeam');
    if (lastMyTeam && savedTeams[lastMyTeam]) {
        elements.loadTeamSelect.value = lastMyTeam;
        loadTeam(lastMyTeam, false);
    }
    
    // Load last selected "Enemy Team"
    const lastEnemyTeam = localStorage.getItem('lastSelectedEnemyTeam');
    if (lastEnemyTeam && savedTeams[lastEnemyTeam]) {
        elements.loadEnemySelect.value = lastEnemyTeam;
        loadTeam(lastEnemyTeam, true);
    }
}

function clearEnemyTeam() {
    state.enemyTeam = Array(6).fill(null).map(() => ({ pokemon: null, moves: [null, null, null, null] }));
    elements.enemyTeamNameInput.value = '';
    renderTeamSlots();
    renderBattleView();
}

// ============================================
// VIEW NAVIGATION
// ============================================

function switchView(view) {
    state.currentView = view;
    
    // Update nav tabs
    elements.navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === view);
    });
    
    // Update views
    elements.builderView.classList.toggle('active', view === 'builder');
    elements.battleView.classList.toggle('active', view === 'battle');
    if (elements.simulationView) {
        elements.simulationView.classList.toggle('active', view === 'simulation');
    }
    
    if (view === 'battle') {
        renderBattleView();
    }
    
    if (view === 'simulation') {
        initializeSimulation();
        renderSimulationView();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Navigation
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchView(tab.dataset.view));
    });
    
    // My Team actions
    elements.saveTeamBtn.addEventListener('click', () => saveTeam(false));
    elements.deleteTeamBtn.addEventListener('click', deleteTeam);
    elements.loadTeamSelect.addEventListener('change', (e) => loadTeam(e.target.value, false));
    
    // Enemy Team actions
    elements.saveEnemyBtn.addEventListener('click', () => saveTeam(true));
    elements.loadEnemySelect.addEventListener('change', (e) => loadTeam(e.target.value, true));
    elements.clearEnemyBtn.addEventListener('click', clearEnemyTeam);
    
    // Accuracy toggle
    elements.includeAccuracyCheckbox.addEventListener('change', (e) => {
        state.includeAccuracy = e.target.checked;
        renderBattleView();
    });
    
    // Filter weak moves toggle
    elements.filterWeakMovesCheckbox.addEventListener('change', (e) => {
        state.filterWeakMoves = e.target.checked;
        renderBattleView();
    });
    
    // Damage mode toggle
    elements.damageModeSelect.addEventListener('change', (e) => {
        state.damageMode = e.target.value;
        updateFormulaSubtitle();
        renderBattleView();
    });
    
    // Field effect dropdown
    elements.fieldEffectSelect.addEventListener('change', (e) => {
        state.fieldEffect = e.target.value;
        renderBattleView();
    });
    
    // Pokemon modal
    elements.pokemonSearch.addEventListener('input', (e) => filterPokemonGrid(e.target.value));
    elements.pokemonModal.querySelector('.modal-close').addEventListener('click', closePokemonModal);
    elements.pokemonModal.addEventListener('click', (e) => {
        if (e.target === elements.pokemonModal) closePokemonModal();
    });
    
    // Move modal
    elements.moveSearch.addEventListener('input', (e) => filterMoveList(e.target.value));
    elements.moveModal.querySelector('.modal-close').addEventListener('click', closeMoveModal);
    elements.moveModal.addEventListener('click', (e) => {
        if (e.target === elements.moveModal) closeMoveModal();
    });
    
    // Ability modal
    elements.abilitySearch.addEventListener('input', (e) => filterAbilityList(e.target.value));
    elements.abilityModal.querySelector('.modal-close').addEventListener('click', closeAbilityModal);
    elements.abilityModal.addEventListener('click', (e) => {
        if (e.target === elements.abilityModal) closeAbilityModal();
    });
    
    // Tera modal
    elements.teraModal.querySelector('.modal-close').addEventListener('click', closeTeraModal);
    elements.teraModal.addEventListener('click', (e) => {
        if (e.target === elements.teraModal) closeTeraModal();
    });
    
    // Item modal
    elements.itemSearch.addEventListener('input', (e) => filterItemList(e.target.value));
    elements.itemModal.querySelector('.modal-close').addEventListener('click', closeItemModal);
    elements.itemModal.addEventListener('click', (e) => {
        if (e.target === elements.itemModal) closeItemModal();
    });
    
    // Quick move editor modal (battle view)
    const quickMoveModal = document.getElementById('quick-move-modal');
    const quickMoveSearch = document.getElementById('quick-move-search');
    quickMoveSearch.addEventListener('input', (e) => filterQuickMoveList(e.target.value));
    quickMoveModal.querySelector('.modal-close').addEventListener('click', closeQuickMoveModal);
    quickMoveModal.addEventListener('click', (e) => {
        if (e.target === quickMoveModal) closeQuickMoveModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePokemonModal();
            closeMoveModal();
            closeAbilityModal();
            closeTeraModal();
            closeItemModal();
            closeQuickMoveModal();
        }
    });
}

// ============================================
// SIMULATION VIEW
// ============================================

function initializeSimulation() {
    // Find first non-null Pokemon in each team (only consider first 6 - battle team)
    const myFirstIndex = state.myTeam.slice(0, BATTLE_TEAM_SIZE).findIndex(slot => slot.pokemon);
    const enemyFirstIndex = state.enemyTeam.slice(0, BATTLE_TEAM_SIZE).findIndex(slot => slot.pokemon);
    
    const simState = state.simulationState;
    
    // Only initialize if battle hasn't started or we're resetting
    if (!simState.battleStarted || simState.myCurrentHP === null) {
        simState.myActiveIndex = myFirstIndex >= 0 ? myFirstIndex : 0;
        simState.enemyActiveIndex = enemyFirstIndex >= 0 ? enemyFirstIndex : 0;
        
        // Initialize HP for all team members (first 6 only - battle team)
        simState.myTeamHP = [];
        simState.enemyTeamHP = [];
        
        state.myTeam.slice(0, BATTLE_TEAM_SIZE).forEach((slot, index) => {
            if (slot && slot.pokemon) {
                const maxHP = calculateMaxHP(slot.pokemon, slot.level || 50);
                simState.myTeamHP[index] = { current: maxHP, max: maxHP };
            } else {
                simState.myTeamHP[index] = null;
            }
        });
        
        state.enemyTeam.slice(0, BATTLE_TEAM_SIZE).forEach((slot, index) => {
            if (slot && slot.pokemon) {
                const maxHP = calculateMaxHP(slot.pokemon, slot.level || 50);
                simState.enemyTeamHP[index] = { current: maxHP, max: maxHP };
            } else {
                simState.enemyTeamHP[index] = null;
            }
        });
        
        // Set active Pokemon HP (for backward compat with display)
        const myActiveHP = simState.myTeamHP[simState.myActiveIndex];
        const enemyActiveHP = simState.enemyTeamHP[simState.enemyActiveIndex];
        
        if (myActiveHP) {
            simState.myMaxHP = myActiveHP.max;
            simState.myCurrentHP = myActiveHP.current;
        }
        
        if (enemyActiveHP) {
            simState.enemyMaxHP = enemyActiveHP.max;
            simState.enemyCurrentHP = enemyActiveHP.current;
        }
        
        simState.phase = 'select_moves';
        simState.mySelectedAction = null;
        simState.enemySelectedAction = null;
        simState.turnLog = [];
        simState.battleStarted = true;
    }
}

function calculateMaxHP(pokemon, level = 50) {
    // Shedinja always has exactly 1 HP
    if (pokemon.name && pokemon.name.toLowerCase() === 'shedinja') {
        return 1;
    }
    
    // HP formula: floor((2 × Base + IV) × Level / 100) + Level + 10
    // Using 31 IVs and 0 EVs for simplicity
    const baseHP = pokemon.hp || 100;
    return Math.floor((2 * baseHP + 31) * level / 100) + level + 10;
}

function resetSimulation() {
    const simState = state.simulationState;
    simState.battleStarted = false;
    simState.myCurrentHP = null;
    simState.enemyCurrentHP = null;
    simState.myMaxHP = null;
    simState.enemyMaxHP = null;
    simState.mySelectedAction = null;
    simState.enemySelectedAction = null;
    simState.myChargingMove = null;
    simState.enemyChargingMove = null;
    simState.phase = 'select_moves';
    simState.turnLog = [];
    simState.undoHistory = [];
    
    // Clear minimax caches
    clearDamageCache();
    
    initializeSimulation();
    renderSimulationView();
    updateUndoButton();
}

function saveSimulationStateForUndo() {
    const simState = state.simulationState;
    
    // Deep copy the relevant state
    const snapshot = {
        myActiveIndex: simState.myActiveIndex,
        enemyActiveIndex: simState.enemyActiveIndex,
        myCurrentHP: simState.myCurrentHP,
        enemyCurrentHP: simState.enemyCurrentHP,
        myMaxHP: simState.myMaxHP,
        enemyMaxHP: simState.enemyMaxHP,
        myTeamHP: simState.myTeamHP.map(hp => hp ? { ...hp } : null),
        enemyTeamHP: simState.enemyTeamHP.map(hp => hp ? { ...hp } : null),
        myChargingMove: simState.myChargingMove ? { ...simState.myChargingMove } : null,
        enemyChargingMove: simState.enemyChargingMove ? { ...simState.enemyChargingMove } : null,
        myStatMods: { ...simState.myStatMods },
        enemyStatMods: { ...simState.enemyStatMods },
        myStatus: simState.myStatus,
        enemyStatus: simState.enemyStatus,
        turnLog: [...simState.turnLog],
        battleStarted: simState.battleStarted
    };
    
    simState.undoHistory.push(snapshot);
    
    // Limit history to 20 turns to prevent memory issues
    if (simState.undoHistory.length > 20) {
        simState.undoHistory.shift();
    }
    
    updateUndoButton();
}

function undoLastTurn() {
    const simState = state.simulationState;
    
    if (simState.undoHistory.length === 0) return;
    
    const snapshot = simState.undoHistory.pop();
    
    // Restore the state
    simState.myActiveIndex = snapshot.myActiveIndex;
    simState.enemyActiveIndex = snapshot.enemyActiveIndex;
    simState.myCurrentHP = snapshot.myCurrentHP;
    simState.enemyCurrentHP = snapshot.enemyCurrentHP;
    simState.myMaxHP = snapshot.myMaxHP;
    simState.enemyMaxHP = snapshot.enemyMaxHP;
    simState.myTeamHP = snapshot.myTeamHP;
    simState.enemyTeamHP = snapshot.enemyTeamHP;
    simState.myChargingMove = snapshot.myChargingMove;
    simState.enemyChargingMove = snapshot.enemyChargingMove;
    simState.myStatMods = snapshot.myStatMods;
    simState.enemyStatMods = snapshot.enemyStatMods;
    simState.myStatus = snapshot.myStatus;
    simState.enemyStatus = snapshot.enemyStatus;
    simState.turnLog = snapshot.turnLog;
    simState.battleStarted = snapshot.battleStarted;
    
    // Reset action selection
    simState.mySelectedAction = null;
    simState.enemySelectedAction = null;
    simState.phase = 'select_moves';
    
    renderSimulationView();
    updateUndoButton();
    
    addTurnLogEntry('Turn undone!', 'info');
    renderSimTurnLog();
}

function updateUndoButton() {
    const undoBtn = document.getElementById('sim-undo-btn');
    if (undoBtn) {
        undoBtn.disabled = state.simulationState.undoHistory.length === 0;
    }
}

function updateSimulationHP(team, newHP) {
    const simState = state.simulationState;
    const previousHP = team === 'my' ? simState.myCurrentHP : simState.enemyCurrentHP;
    
    if (team === 'my') {
        simState.myCurrentHP = newHP;
        // Sync to team HP array
        if (simState.myTeamHP[simState.myActiveIndex]) {
            simState.myTeamHP[simState.myActiveIndex].current = newHP;
        }
    } else {
        simState.enemyCurrentHP = newHP;
        // Sync to team HP array
        if (simState.enemyTeamHP[simState.enemyActiveIndex]) {
            simState.enemyTeamHP[simState.enemyActiveIndex].current = newHP;
        }
    }
    
    renderSimulationView();
    // Note: Faint swap handling is now done in executeSimulationTurn after all actions complete
}

function renderSimulationView() {
    const simState = state.simulationState;
    const mySlot = state.myTeam[simState.myActiveIndex];
    const enemySlot = state.enemyTeam[simState.enemyActiveIndex];
    
    // Render Pokemon cards (with charging indicator)
    renderSimPokemonCard('sim-my-pokemon', mySlot, simState.myCurrentHP, simState.myMaxHP, 'my', simState.myChargingMove);
    renderSimPokemonCard('sim-enemy-pokemon', enemySlot, simState.enemyCurrentHP, simState.enemyMaxHP, 'enemy', simState.enemyChargingMove);
    
    // Render move panels (locked if charging)
    renderSimMovePanel('sim-my-moves', mySlot, enemySlot, 'my', simState.myChargingMove);
    renderSimMovePanel('sim-enemy-moves', enemySlot, mySlot, 'enemy', simState.enemyChargingMove);
    
    // Auto-select charging move release if applicable
    autoSelectChargingMoves();
    
    // Render turn log
    renderSimTurnLog();
    
    // Update selected states on buttons
    updateSimSelectedStates();
    
    // Use minimax to recommend best action for my team only
    // Enemy team uses simple best-move highlighting (already rendered in move panel)
    updateActionRecommendations('my', simState);
}

function autoSelectChargingMoves() {
    const simState = state.simulationState;
    
    // If my Pokemon is charging, auto-select the release action
    if (simState.myChargingMove && !simState.mySelectedAction) {
        simState.mySelectedAction = { 
            type: 'charging_release', 
            move: simState.myChargingMove.move,
            moveName: simState.myChargingMove.moveName
        };
    }
    
    // If enemy Pokemon is charging, auto-select the release action
    if (simState.enemyChargingMove && !simState.enemySelectedAction) {
        simState.enemySelectedAction = { 
            type: 'charging_release', 
            move: simState.enemyChargingMove.move,
            moveName: simState.enemyChargingMove.moveName
        };
    }
}

// Minimax configuration
const MINIMAX_CONFIG = {
    depth: 6,
    pruningEnabled: true,  // Alpha-beta pruning for performance
    yieldInterval: 200,  // Yield to UI every N nodes (increased for performance)
    opponentGreedy: true,  // Opponent uses greedy (best immediate move) instead of full minimax
    moveOrdering: true,  // Sort moves by likely value for better pruning
    filterBadMoves: true  // Skip obviously bad moves
};

// Track active minimax calculation (only one at a time for my team)
const minimaxState = {
    activeCalculation: null,
    isCalculating: false,
    myProgress: { current: 0, total: 0, depth: 0 },
    currentRecommendation: null,  // Store current recommendation for swap modal
    damageCache: new Map(),  // Cache for damage calculations
    transpositionTable: new Map()  // Memoization cache for minimax positions
};

// Clear damage cache when state changes significantly
function clearDamageCache() {
    minimaxState.damageCache.clear();
    minimaxState.transpositionTable.clear();
}

// Generate a unique key for memoization of minimax positions
function generateStateKey(simCopy, action, depth, isMaximizing) {
    // Build key from essential state components
    const parts = [
        // Active Pokemon IDs
        simCopy.mySlot?.pokemon?.id || 'none',
        simCopy.oppSlot?.pokemon?.id || 'none',
        // Active indices
        simCopy.myActiveIndex,
        simCopy.oppActiveIndex,
        // Current HP values (rounded to reduce key variations while maintaining accuracy)
        simCopy.myHP,
        simCopy.oppHP,
        // Team HP state (only alive/dead matters for most decisions)
        simCopy.myTeamHP.map(hp => hp ? (hp.current > 0 ? Math.round(hp.current) : 0) : 'x').join(','),
        simCopy.oppTeamHP.map(hp => hp ? (hp.current > 0 ? Math.round(hp.current) : 0) : 'x').join(','),
        // Charging moves
        simCopy.myCharging?.move?.name || '',
        simCopy.oppCharging?.move?.name || '',
        // Action being evaluated
        action.type,
        action.type === 'move' ? action.move?.name : (action.type === 'swap' ? action.swapIndex : ''),
        // Depth and maximizing flag
        depth,
        isMaximizing ? 1 : 0
    ];
    return parts.join('|');
}

// Order actions by likely value for better alpha-beta pruning
// Higher damage moves first, then swaps to good matchups
function orderActionsByValue(actions, simCopy) {
    return actions.map(action => {
        let priority = 0;
        
        if (action.type === 'move' && action.move) {
            if (action.move.power > 0) {
                // Estimate damage for ordering (use greedy evaluation)
                priority = evaluateGreedyAction(simCopy, action, true);
            } else {
                // Status moves get lower priority
                priority = -10;
            }
        } else if (action.type === 'swap') {
            // Swaps get medium priority
            priority = 10;
        } else if (action.type === 'charging_release') {
            // Charged moves are usually strong
            priority = 50;
        }
        
        return { action, priority };
    })
    .sort((a, b) => b.priority - a.priority)
    .map(item => item.action);
}

// Get cached damage or calculate and cache
function getCachedDamage(move, attacker, defender, options = {}) {
    const key = `${move.name}-${attacker.id}-${defender.id}-${options.attackerTeraType || ''}-${options.defenderTeraType || ''}`;
    
    if (minimaxState.damageCache.has(key)) {
        return minimaxState.damageCache.get(key);
    }
    
    const damage = calculateActualDamage(move, attacker, defender, options);
    
    // Limit cache size
    if (minimaxState.damageCache.size > 1000) {
        minimaxState.damageCache.clear();
    }
    
    minimaxState.damageCache.set(key, damage);
    return damage;
}

// Async minimax with iterative deepening and progress updates (my team only)
async function getMinimaxRecommendationAsync(team, simState, maxDepth = MINIMAX_CONFIG.depth) {
    const simCopy = createSimStateCopy(simState, team);
    
    if (!simCopy.mySlot || !simCopy.mySlot.pokemon || !simCopy.oppSlot || !simCopy.oppSlot.pokemon) {
        return null;
    }
    
    // Mark calculation as started
    minimaxState.isCalculating = true;
    
    let bestAction = null;
    
    // Iterative deepening - show results at each depth
    for (let depth = 1; depth <= maxDepth; depth++) {
        minimaxState.myProgress = { current: 0, total: 0, depth, maxDepth };
        
        // Count total nodes for progress
        const actions = getAllPossibleActions(simCopy, true);
        minimaxState.myProgress.total = estimateNodes(actions.length, depth);
        
        // Update progress display
        updateMinimaxProgress('my');
        
        let depthBestAction = null;
        let depthBestScore = -Infinity;
        
        // Sort actions by likely value for better pruning
        const orderedActions = MINIMAX_CONFIG.moveOrdering 
            ? orderActionsByValue(actions, simCopy) 
            : actions;
        
        for (const action of orderedActions) {
            let score = await minimaxAsync(simCopy, action, depth - 1, -Infinity, Infinity, false);
            
            // Add small tiebreaker for immediate damage (prefer higher damage when scores are equal)
            if (action.type === 'move' && action.move && action.move.power > 0) {
                const immediateDamage = evaluateGreedyAction(simCopy, action, true);
                score += immediateDamage * 0.001; // Tiny bonus for immediate damage
            }
            
            if (score > depthBestScore) {
                depthBestScore = score;
                depthBestAction = { ...action, score, depth };
            }
        }
        
        if (depthBestAction) {
            bestAction = depthBestAction;
            // Show intermediate recommendation
            showIntermediateRecommendation(team, bestAction, depth, maxDepth);
        }
        
        // Yield to UI between depth iterations
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Mark calculation as complete and clear progress
    minimaxState.isCalculating = false;
    minimaxState.myProgress = { current: 0, total: 0, depth: 0 };
    updateMinimaxProgress('my');
    
    return bestAction;
}

// Estimate number of nodes for progress bar
function estimateNodes(branchingFactor, depth) {
    let nodes = 0;
    
    if (MINIMAX_CONFIG.opponentGreedy) {
        // With greedy opponent, only MY actions branch at each turn
        // Each "depth" represents one full turn (my action + opponent greedy response)
        // So effective branching is just my actions per turn
        let factor = branchingFactor;
        for (let d = 0; d < depth; d++) {
            nodes += Math.pow(factor, d + 1);
            factor = Math.max(2, factor * 0.8); // Pruning reduces branching
        }
    } else {
        // Standard minimax: both sides branch
        let factor = branchingFactor;
        for (let d = 0; d < depth; d++) {
            nodes += Math.pow(factor, d + 1);
            factor = Math.max(2, factor * 0.7); // Pruning reduces branching
        }
    }
    
    return Math.min(nodes, 100000); // Cap for display
}

// Get the greedy opponent's best action based on current state (without knowing my move)
function getGreedyOpponentAction(simCopy) {
    const oppActions = getAllPossibleActions(simCopy, false);
    
    if (oppActions.length === 0) return null;
    
    let bestOppAction = null;
    let bestOppScore = Infinity;
    
    for (const oppAction of oppActions) {
        // Opponent evaluates each action independently, not knowing my move
        // They pick the action that would minimize my score if I did nothing
        const oppResultState = applyActionToState(simCopy, oppAction, false);
        const immediateScore = evaluateGreedyAction(simCopy, oppAction, false);
        
        if (immediateScore < bestOppScore) {
            bestOppScore = immediateScore;
            bestOppAction = oppAction;
        }
    }
    
    return bestOppAction;
}

// Evaluate an action for greedy decision-making (considers damage potential)
function evaluateGreedyAction(simCopy, action, isMyAction) {
    const attacker = isMyAction ? simCopy.mySlot : simCopy.oppSlot;
    const defender = isMyAction ? simCopy.oppSlot : simCopy.mySlot;
    
    if (action.type === 'move' && action.move) {
        const move = action.move;
        if (move.power > 0 && attacker && attacker.pokemon && defender && defender.pokemon) {
            // Calculate expected damage percentage
            const damage = calculateActualDamage(move, attacker.pokemon, defender.pokemon, {
                attackerTeraType: attacker.teraType,
                defenderTeraType: defender.teraType,
                attackerAbility: attacker.ability,
                defenderAbility: defender.ability,
                attackerItem: attacker.item
            });
            
            // Score based on damage dealt (negative for opponent = good for opponent)
            // From opponent's greedy view: high damage to me = low score (good for them)
            if (isMyAction) {
                return damage.percentAvg; // Higher damage = higher score for me
            } else {
                return -damage.percentAvg; // Higher damage to me = lower score (opponent wants to minimize)
            }
        }
        // Status move - neutral
        return 0;
    } else if (action.type === 'swap' && action.pokemon) {
        // Evaluate swap based on matchup improvement
        const newSlot = { 
            pokemon: action.pokemon, 
            moves: action.pokemon.moves || [],
            ability: action.ability,
            item: action.item,
            teraType: action.teraType
        };
        
        // Calculate best damage the new Pokemon could deal
        const bestDamage = getBestDamageToSlot(newSlot, defender);
        const currentBestDamage = getBestDamageToSlot(attacker, defender);
        
        // Prefer swap if new Pokemon can deal significantly more damage
        const damageImprovement = bestDamage - currentBestDamage;
        
        if (isMyAction) {
            return damageImprovement * 0.8; // Slight penalty for swap tempo loss
        } else {
            return -damageImprovement * 0.8;
        }
    }
    
    return 0;
}

// Apply both actions simultaneously and return resulting state
function applySimultaneousActions(simCopy, myAction, oppAction) {
    // Deep copy state
    let newState = {
        ...simCopy,
        myTeamHP: simCopy.myTeamHP.map(hp => hp ? {...hp} : null),
        oppTeamHP: simCopy.oppTeamHP.map(hp => hp ? {...hp} : null),
        myCharging: simCopy.myCharging ? {...simCopy.myCharging} : null,
        oppCharging: simCopy.oppCharging ? {...simCopy.oppCharging} : null
    };
    
    // Handle swaps first (they happen before attacks in Pokemon)
    if (myAction.type === 'swap') {
        newState = applySwapAction(newState, myAction, true);
    }
    if (oppAction.type === 'swap') {
        newState = applySwapAction(newState, oppAction, false);
    }
    
    // Determine attack order based on move priority and speed
    const myPriority = getSimMovePriority(myAction);
    const oppPriority = getSimMovePriority(oppAction);

    const mySpeed = newState.mySlot?.pokemon?.speed || 50;
    const oppSpeed = newState.oppSlot?.pokemon?.speed || 50;
    
    let myFirst = mySpeed >= oppSpeed;
    if (myPriority > oppPriority) {
        myFirst = true;
    } else if (oppPriority > myPriority) {
        myFirst = false;
    }
    
    // Apply attacks in priority/speed order
    if (myFirst) {
        if (myAction.type === 'move' || myAction.type === 'charging_release') {
            newState = applyMoveActionSim(newState, myAction, true);
        }
        // Check if opponent is still alive before they attack
        if (newState.oppHP > 0 && (oppAction.type === 'move' || oppAction.type === 'charging_release')) {
            newState = applyMoveActionSim(newState, oppAction, false);
        }
    } else {
        if (oppAction.type === 'move' || oppAction.type === 'charging_release') {
            newState = applyMoveActionSim(newState, oppAction, false);
        }
        // Check if I'm still alive before attacking
        if (newState.myHP > 0 && (myAction.type === 'move' || myAction.type === 'charging_release')) {
            newState = applyMoveActionSim(newState, myAction, true);
        }
    }
    
    // Handle faint swaps - auto-swap to best available Pokemon
    newState = handleFaintSwapsSim(newState);
    
    return newState;
}

// Get move priority for simulation (uses MOVE_EFFECTS from moves.js)
function getSimMovePriority(action) {
    if (!action || action.type === 'swap' || action.type === 'skip') return -1; // Swaps already handled
    if (!action.move) return 0;
    return getMovePriority(action.move);
}

// Apply swap action - just changes active Pokemon
// Note: In simultaneous model, opponent's attack is applied separately and will target
// the NEW Pokemon after swap, so the "free hit" effect still happens correctly
function applySwapAction(simCopy, action, isMyAction) {
    const newState = {
        ...simCopy,
        myTeamHP: simCopy.myTeamHP.map(hp => hp ? {...hp} : null),
        oppTeamHP: simCopy.oppTeamHP.map(hp => hp ? {...hp} : null),
        myCharging: simCopy.myCharging ? {...simCopy.myCharging} : null,
        oppCharging: simCopy.oppCharging ? {...simCopy.oppCharging} : null
    };
    
    const swapSlot = action.swapSlot || (isMyAction ? simCopy.myTeam : simCopy.oppTeam)[action.swapIndex];
    const swapHP = (isMyAction ? newState.myTeamHP : newState.oppTeamHP)[action.swapIndex];
    
    if (isMyAction) {
        newState.mySlot = swapSlot;
        newState.myHP = swapHP ? swapHP.current : 0;
        newState.myMaxHP = swapHP ? swapHP.max : 100;
        newState.myActiveIndex = action.swapIndex;
        newState.myCharging = null; // Clear charging on swap
    } else {
        newState.oppSlot = swapSlot;
        newState.oppHP = swapHP ? swapHP.current : 0;
        newState.oppMaxHP = swapHP ? swapHP.max : 100;
        newState.oppActiveIndex = action.swapIndex;
        newState.oppCharging = null; // Clear charging on swap
    }
    
    return newState;
}

// Apply move action in simulation (handles two-turn and regular moves)
function applyMoveActionSim(simCopy, action, isMyAction) {
    const newState = {
        ...simCopy,
        myTeamHP: simCopy.myTeamHP.map(hp => hp ? {...hp} : null),
        oppTeamHP: simCopy.oppTeamHP.map(hp => hp ? {...hp} : null),
        myCharging: simCopy.myCharging ? {...simCopy.myCharging} : null,
        oppCharging: simCopy.oppCharging ? {...simCopy.oppCharging} : null
    };
    
    const move = action.move;
    if (!move) return newState;
    
    // Handle charging release
    if (action.type === 'charging_release') {
        if (isMyAction) {
            newState.myCharging = null;
        } else {
            newState.oppCharging = null;
        }
        return applyMoveDamage(newState, move, isMyAction);
    }
    
    // Handle two-turn moves (start charging)
    const isTwoTurn = moveHasEffect(move, 'two_turn_move');
    if (isTwoTurn) {
        if (isMyAction) {
            newState.myCharging = { move, moveName: action.moveName };
        } else {
            newState.oppCharging = { move, moveName: action.moveName };
        }
        return newState; // No damage on charge turn
    }
    
    // Regular move - deal damage
    return applyMoveDamage(newState, move, isMyAction);
}

// Handle faint swaps - auto-swap fainted Pokemon to best available
function handleFaintSwapsSim(simCopy) {
    let newState = { ...simCopy };
    
    // Check if my Pokemon fainted
    if (newState.myHP <= 0) {
        const bestSwap = getBestSwapForSim(newState, true);
        if (bestSwap !== -1) {
            const swapSlot = newState.myTeam[bestSwap];
            const swapHP = newState.myTeamHP[bestSwap];
            newState.mySlot = swapSlot;
            newState.myHP = swapHP ? swapHP.current : 0;
            newState.myMaxHP = swapHP ? swapHP.max : 100;
            newState.myActiveIndex = bestSwap;
            newState.myCharging = null;
        }
    }
    
    // Check if opponent Pokemon fainted
    if (newState.oppHP <= 0) {
        const bestSwap = getBestSwapForSim(newState, false);
        if (bestSwap !== -1) {
            const swapSlot = newState.oppTeam[bestSwap];
            const swapHP = newState.oppTeamHP[bestSwap];
            newState.oppSlot = swapSlot;
            newState.oppHP = swapHP ? swapHP.current : 0;
            newState.oppMaxHP = swapHP ? swapHP.max : 100;
            newState.oppActiveIndex = bestSwap;
            newState.oppCharging = null;
        }
    }
    
    return newState;
}

// Get best swap target for simulation (highest HP percentage)
function getBestSwapForSim(simCopy, isMyTeam) {
    const team = isMyTeam ? simCopy.myTeam : simCopy.oppTeam;
    const teamHP = isMyTeam ? simCopy.myTeamHP : simCopy.oppTeamHP;
    const currentIndex = isMyTeam ? simCopy.myActiveIndex : simCopy.oppActiveIndex;
    
    let bestIndex = -1;
    let bestHPPercent = -1;
    
    team.slice(0, BATTLE_TEAM_SIZE).forEach((slot, idx) => {
        if (!slot || !slot.pokemon) return;
        if (idx === currentIndex) return;
        const hp = teamHP[idx];
        if (!hp || hp.current <= 0) return;
        
        const hpPercent = hp.max > 0 ? hp.current / hp.max : 0;
        if (hpPercent > bestHPPercent) {
            bestHPPercent = hpPercent;
            bestIndex = idx;
        }
    });
    
    return bestIndex;
}

// Async minimax for simultaneous moves - opponent uses greedy (picks move without seeing mine)
async function minimaxAsync(simCopy, myAction, depth, alpha, beta, isMaximizing) {
    // Update progress
    minimaxState.myProgress.current++;
    
    // Yield to UI periodically
    if (minimaxState.myProgress.current % MINIMAX_CONFIG.yieldInterval === 0) {
        updateMinimaxProgress('my');
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Check memoization cache (transposition table)
    const stateKey = generateStateKey(simCopy, myAction, depth, isMaximizing);
    if (minimaxState.transpositionTable.has(stateKey)) {
        return minimaxState.transpositionTable.get(stateKey);
    }
    
    // Limit transposition table size to prevent memory issues
    if (minimaxState.transpositionTable.size > 100000) {
        minimaxState.transpositionTable.clear();
    }
    
    let result;
    
    if (MINIMAX_CONFIG.opponentGreedy) {
        // SIMULTANEOUS MOVE MODEL:
        // 1. Opponent picks their action greedily based on current state (before seeing my move)
        // 2. Both actions are applied simultaneously
        // 3. I (minimax) can predict what they'll pick and counter it
        
        const oppAction = getGreedyOpponentAction(simCopy);
        
        if (!oppAction) {
            // No opponent action possible, just apply my action
            const newState = applyActionToState(simCopy, myAction, true);
            result = evaluateState(newState);
            minimaxState.transpositionTable.set(stateKey, result);
            return result;
        }
        
        // Apply both actions simultaneously
        const newState = applySimultaneousActions(simCopy, myAction, oppAction);
        
        // Terminal conditions
        if (depth === 0 || isGameOver(newState)) {
            result = evaluateState(newState);
            minimaxState.transpositionTable.set(stateKey, result);
            return result;
        }
        
        // Continue to next turn - get my possible actions
        const myActions = getAllPossibleActions(newState, true);
        // Order actions for better pruning
        const orderedActions = MINIMAX_CONFIG.moveOrdering 
            ? orderActionsByValue(myActions, newState) 
            : myActions;
        
        let maxScore = -Infinity;
        
        for (const nextMyAction of orderedActions) {
            const score = await minimaxAsync(newState, nextMyAction, depth - 1, alpha, beta, true);
            maxScore = Math.max(maxScore, score);
            if (MINIMAX_CONFIG.pruningEnabled) {
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        result = maxScore;
    } else {
        // Standard alternating minimax (original behavior)
        const newState = applyActionToState(simCopy, myAction, isMaximizing);
        
        if (depth === 0 || isGameOver(newState)) {
            result = evaluateState(newState);
            minimaxState.transpositionTable.set(stateKey, result);
            return result;
        }
        
        const actions = getAllPossibleActions(newState, !isMaximizing);
        
        if (!isMaximizing) {
            let maxScore = -Infinity;
            for (const nextAction of actions) {
                const score = await minimaxAsync(newState, nextAction, depth - 1, alpha, beta, false);
                maxScore = Math.max(maxScore, score);
                if (MINIMAX_CONFIG.pruningEnabled) {
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break;
                }
            }
            result = maxScore;
        } else {
            let minScore = Infinity;
            for (const nextAction of actions) {
                const score = await minimaxAsync(newState, nextAction, depth - 1, alpha, beta, true);
                minScore = Math.min(minScore, score);
                if (MINIMAX_CONFIG.pruningEnabled) {
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break;
                }
            }
            result = minScore;
        }
    }
    
    // Store result in transposition table before returning
    minimaxState.transpositionTable.set(stateKey, result);
    return result;
}

// Synchronous version for immediate feedback (depth 1)
function getMinimaxRecommendation(team, simState, depth = 1) {
    const simCopy = createSimStateCopy(simState, team);
    
    if (!simCopy.mySlot || !simCopy.mySlot.pokemon || !simCopy.oppSlot || !simCopy.oppSlot.pokemon) {
        return null;
    }
    
    let bestAction = null;
    let bestScore = -Infinity;
    
    const actions = getAllPossibleActions(simCopy, true);
    
    for (const action of actions) {
        let score = minimax(simCopy, action, depth - 1, -Infinity, Infinity, false);
        
        // Add small tiebreaker for immediate damage (prefer higher damage when scores are equal)
        if (action.type === 'move' && action.move && action.move.power > 0) {
            const immediateDamage = evaluateGreedyAction(simCopy, action, true);
            score += immediateDamage * 0.001; // Tiny bonus for immediate damage
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestAction = { ...action, score };
        }
    }
    
    return bestAction;
}

// Synchronous minimax for simultaneous moves - opponent uses greedy
function minimax(simCopy, myAction, depth, alpha, beta, isMaximizing) {
    // Check memoization cache (transposition table)
    const stateKey = generateStateKey(simCopy, myAction, depth, isMaximizing);
    if (minimaxState.transpositionTable.has(stateKey)) {
        return minimaxState.transpositionTable.get(stateKey);
    }
    
    // Limit transposition table size to prevent memory issues
    if (minimaxState.transpositionTable.size > 100000) {
        minimaxState.transpositionTable.clear();
    }
    
    let result;
    
    if (MINIMAX_CONFIG.opponentGreedy) {
        // SIMULTANEOUS MOVE MODEL:
        // 1. Opponent picks their action greedily based on current state
        // 2. Both actions are applied simultaneously
        // 3. I (minimax) can predict what they'll pick and counter it
        
        const oppAction = getGreedyOpponentAction(simCopy);
        
        if (!oppAction) {
            const newState = applyActionToState(simCopy, myAction, true);
            result = evaluateState(newState);
            minimaxState.transpositionTable.set(stateKey, result);
            return result;
        }
        
        // Apply both actions simultaneously
        const newState = applySimultaneousActions(simCopy, myAction, oppAction);
        
        // Terminal conditions
        if (depth === 0 || isGameOver(newState)) {
            result = evaluateState(newState);
            minimaxState.transpositionTable.set(stateKey, result);
            return result;
        }
        
        // Continue to next turn - get my possible actions
        const myActions = getAllPossibleActions(newState, true);
        // Order actions for better pruning
        const orderedActions = MINIMAX_CONFIG.moveOrdering 
            ? orderActionsByValue(myActions, newState) 
            : myActions;
        
        let maxScore = -Infinity;
        
        for (const nextMyAction of orderedActions) {
            const score = minimax(newState, nextMyAction, depth - 1, alpha, beta, true);
            maxScore = Math.max(maxScore, score);
            if (MINIMAX_CONFIG.pruningEnabled) {
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        result = maxScore;
    } else {
        // Standard alternating minimax (original behavior)
        const newState = applyActionToState(simCopy, myAction, isMaximizing);
        
        if (depth === 0 || isGameOver(newState)) {
            result = evaluateState(newState);
            minimaxState.transpositionTable.set(stateKey, result);
            return result;
        }
        
        const actions = getAllPossibleActions(newState, !isMaximizing);
        
        if (!isMaximizing) {
            let maxScore = -Infinity;
            for (const nextAction of actions) {
                const score = minimax(newState, nextAction, depth - 1, alpha, beta, false);
                maxScore = Math.max(maxScore, score);
                if (MINIMAX_CONFIG.pruningEnabled) {
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break;
                }
            }
            result = maxScore;
        } else {
            let minScore = Infinity;
            for (const nextAction of actions) {
                const score = minimax(newState, nextAction, depth - 1, alpha, beta, true);
                minScore = Math.min(minScore, score);
                if (MINIMAX_CONFIG.pruningEnabled) {
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break;
                }
            }
            result = minScore;
        }
    }
    
    // Store result in transposition table before returning
    minimaxState.transpositionTable.set(stateKey, result);
    return result;
}

// Show intermediate recommendation while calculating
function showIntermediateRecommendation(team, action, currentDepth, maxDepth) {
    // Store recommendation for swap modal (only for my team)
    if (team === 'my') {
        minimaxState.currentRecommendation = action;
    }
    
    // Clear previous recommendations
    document.querySelectorAll(`.sim-move-btn[data-team="${team}"]`).forEach(btn => {
        btn.classList.remove('recommended-action', 'calculating');
    });
    const swapBtn = document.getElementById(`sim-${team}-swap-btn`);
    if (swapBtn) {
        swapBtn.classList.remove('recommend-swap', 'calculating');
    }
    
    const isCalculating = currentDepth < maxDepth;
    const className = isCalculating ? 'calculating' : 'recommended-action';
    const swapClass = isCalculating ? 'calculating' : 'recommend-swap';
    
    if (action.type === 'move') {
        const moveBtn = document.querySelector(
            `.sim-move-btn[data-team="${team}"][data-move-index="${action.moveIndex}"]`
        );
        if (moveBtn) {
            moveBtn.classList.add(className);
        }
    } else if (action.type === 'swap') {
        if (swapBtn) {
            swapBtn.classList.add(swapClass);
        }
    }
}

// Update progress display (only show for my team)
function updateMinimaxProgress(team) {
    const progressEl = document.getElementById(`sim-${team}-progress`);
    
    if (!progressEl) return;
    
    // Only show progress for my team, not enemy
    if (team === 'enemy') {
        progressEl.style.display = 'none';
        return;
    }
    
    const progress = minimaxState.myProgress;
    
    // Hide when not calculating
    if (!minimaxState.isCalculating) {
        progressEl.style.display = 'none';
        return;
    }
    
    progressEl.style.display = 'block';
    const percent = Math.min(100, (progress.current / progress.total) * 100);
    const bar = progressEl.querySelector('.progress-fill');
    const text = progressEl.querySelector('.progress-text');
    
    if (bar) bar.style.width = `${percent}%`;
    
    // Show nodes remaining (can go negative if estimate was low, show 0 in that case)
    const remaining = Math.max(0, progress.total - progress.current);
    const formattedRemaining = remaining >= 1000 
        ? `${(remaining / 1000).toFixed(1)}k` 
        : remaining.toString();
    if (text) text.textContent = `Depth ${progress.depth}/${progress.maxDepth} • ${formattedRemaining} nodes`;
}

// Create a copy of simulation state for minimax calculations
function createSimStateCopy(simState, perspective) {
    const isMyPerspective = perspective === 'my';
    
    return {
        mySlot: isMyPerspective 
            ? state.myTeam[simState.myActiveIndex] 
            : state.enemyTeam[simState.enemyActiveIndex],
        oppSlot: isMyPerspective 
            ? state.enemyTeam[simState.enemyActiveIndex] 
            : state.myTeam[simState.myActiveIndex],
        myHP: isMyPerspective ? simState.myCurrentHP : simState.enemyCurrentHP,
        oppHP: isMyPerspective ? simState.enemyCurrentHP : simState.myCurrentHP,
        myMaxHP: isMyPerspective ? simState.myMaxHP : simState.enemyMaxHP,
        oppMaxHP: isMyPerspective ? simState.enemyMaxHP : simState.myMaxHP,
        myTeam: isMyPerspective ? [...state.myTeam] : [...state.enemyTeam],
        oppTeam: isMyPerspective ? [...state.enemyTeam] : [...state.myTeam],
        myTeamHP: isMyPerspective 
            ? (simState.myTeamHP || []).map(hp => hp ? {...hp} : null)
            : (simState.enemyTeamHP || []).map(hp => hp ? {...hp} : null),
        oppTeamHP: isMyPerspective 
            ? (simState.enemyTeamHP || []).map(hp => hp ? {...hp} : null)
            : (simState.myTeamHP || []).map(hp => hp ? {...hp} : null),
        myActiveIndex: isMyPerspective ? simState.myActiveIndex : simState.enemyActiveIndex,
        oppActiveIndex: isMyPerspective ? simState.enemyActiveIndex : simState.myActiveIndex,
        myCharging: null,  // Track two-turn move charging
        oppCharging: null,
        perspective
    };
}

// Get all possible actions for a player
function getAllPossibleActions(simCopy, isMaximizing) {
    const actions = [];
    const slot = isMaximizing ? simCopy.mySlot : simCopy.oppSlot;
    const currentHP = isMaximizing ? simCopy.myHP : simCopy.oppHP;
    const charging = isMaximizing ? simCopy.myCharging : simCopy.oppCharging;
    const team = isMaximizing ? simCopy.myTeam : simCopy.oppTeam;
    const teamHP = isMaximizing ? simCopy.myTeamHP : simCopy.oppTeamHP;
    const activeIndex = isMaximizing ? simCopy.myActiveIndex : simCopy.oppActiveIndex;
    
    // If active Pokemon is fainted, only swaps are allowed (forced swap)
    const isFainted = currentHP <= 0;
    
    // If charging, must release (unless fainted)
    if (charging && !isFainted) {
        actions.push({ type: 'charging_release', move: charging.move, moveName: charging.moveName });
        return actions;
    }
    
    // Add move actions (only if not fainted)
    if (!isFainted) {
        const moves = slot.moves || [];
        moves.forEach((moveName, moveIndex) => {
            if (!moveName) return;
            const move = getMoveByName(moveName);
            if (!move) return;
            actions.push({ type: 'move', move, moveIndex, moveName });
        });
    }
    
    // Add swap actions (only first 6)
    team.slice(0, BATTLE_TEAM_SIZE).forEach((swapSlot, index) => {
        if (!swapSlot || !swapSlot.pokemon) return;
        if (index === activeIndex) return;
        
        const hpData = teamHP[index];
        if (hpData && hpData.current <= 0) return;
        
        actions.push({ type: 'swap', swapIndex: index, swapSlot });
    });
    
    // Add skip as fallback (only if not fainted - can't skip when need to swap)
    if (actions.length === 0 && !isFainted) {
        actions.push({ type: 'skip' });
    }
    
    return actions;
}

// Note: minimax function is defined earlier (line ~4117) with greedy opponent support

// Apply an action to state and return new state
function applyActionToState(simCopy, action, isMyAction) {
    // Deep copy state
    const newState = {
        ...simCopy,
        myTeamHP: simCopy.myTeamHP.map(hp => hp ? {...hp} : null),
        oppTeamHP: simCopy.oppTeamHP.map(hp => hp ? {...hp} : null),
        myCharging: simCopy.myCharging ? {...simCopy.myCharging} : null,
        oppCharging: simCopy.oppCharging ? {...simCopy.oppCharging} : null
    };
    
    if (action.type === 'skip') {
        return newState;
    }
    
    if (action.type === 'swap') {
        // Swap - opponent gets a free hit
        const swapSlot = action.swapSlot || (isMyAction ? simCopy.myTeam : simCopy.oppTeam)[action.swapIndex];
        const swapHP = (isMyAction ? newState.myTeamHP : newState.oppTeamHP)[action.swapIndex];
        
        if (isMyAction) {
            // Opponent gets free hit on swap
            const oppBestDmg = getBestDamageToSlot(simCopy.oppSlot, swapSlot);
            if (swapHP) {
                const dmgAmount = Math.round(oppBestDmg * swapHP.max / 100);
                swapHP.current = Math.max(0, swapHP.current - dmgAmount);
            }
            newState.mySlot = swapSlot;
            newState.myHP = swapHP ? swapHP.current : 0;
            newState.myMaxHP = swapHP ? swapHP.max : 100;
            newState.myActiveIndex = action.swapIndex;
        } else {
            const myBestDmg = getBestDamageToSlot(simCopy.mySlot, swapSlot);
            if (swapHP) {
                const dmgAmount = Math.round(myBestDmg * swapHP.max / 100);
                swapHP.current = Math.max(0, swapHP.current - dmgAmount);
            }
            newState.oppSlot = swapSlot;
            newState.oppHP = swapHP ? swapHP.current : 0;
            newState.oppMaxHP = swapHP ? swapHP.max : 100;
            newState.oppActiveIndex = action.swapIndex;
        }
        return newState;
    }
    
    if (action.type === 'move') {
        const move = action.move;
        const isTwoTurn = moveHasEffect(move, 'two_turn_move');
        
        if (isTwoTurn) {
            // First turn: charging - no damage, opponent gets free hit
            if (isMyAction) {
                newState.myCharging = { move, moveName: action.moveName };
                // Opponent attacks while we charge
                const oppBestDmg = getBestDamageToSlot(simCopy.oppSlot, simCopy.mySlot);
                const dmgAmount = Math.round(oppBestDmg * newState.myMaxHP / 100);
                newState.myHP = Math.max(0, newState.myHP - dmgAmount);
                if (newState.myTeamHP[newState.myActiveIndex]) {
                    newState.myTeamHP[newState.myActiveIndex].current = newState.myHP;
                }
            } else {
                newState.oppCharging = { move, moveName: action.moveName };
                const myBestDmg = getBestDamageToSlot(simCopy.mySlot, simCopy.oppSlot);
                const dmgAmount = Math.round(myBestDmg * newState.oppMaxHP / 100);
                newState.oppHP = Math.max(0, newState.oppHP - dmgAmount);
                if (newState.oppTeamHP[newState.oppActiveIndex]) {
                    newState.oppTeamHP[newState.oppActiveIndex].current = newState.oppHP;
                }
            }
            return newState;
        }
        
        // Regular move - deal damage
        return applyMoveDamage(newState, move, isMyAction);
    }
    
    if (action.type === 'charging_release') {
        // Release charged move
        if (isMyAction) {
            newState.myCharging = null;
        } else {
            newState.oppCharging = null;
        }
        return applyMoveDamage(newState, action.move, isMyAction);
    }
    
    return newState;
}

// Apply move damage to state
function applyMoveDamage(newState, move, isMyAction) {
    const attacker = isMyAction ? newState.mySlot : newState.oppSlot;
    const defender = isMyAction ? newState.oppSlot : newState.mySlot;
    
    if (!attacker || !attacker.pokemon || !defender || !defender.pokemon) {
        return newState;
    }
    
    if (move.power <= 0) {
        // Status move - minimal state change
        return newState;
    }
    
    const damage = calculateActualDamage(move, attacker.pokemon, defender.pokemon, {
        attackerTeraType: attacker.teraType,
        defenderTeraType: defender.teraType,
        attackerAbility: attacker.ability,
        defenderAbility: defender.ability,
        attackerItem: attacker.item
    });
    
    const damageAmount = Math.round(damage.avg);
    
    if (isMyAction) {
        newState.oppHP = Math.max(0, newState.oppHP - damageAmount);
        if (newState.oppTeamHP[newState.oppActiveIndex]) {
            newState.oppTeamHP[newState.oppActiveIndex].current = newState.oppHP;
        }
    } else {
        newState.myHP = Math.max(0, newState.myHP - damageAmount);
        if (newState.myTeamHP[newState.myActiveIndex]) {
            newState.myTeamHP[newState.myActiveIndex].current = newState.myHP;
        }
    }
    
    return newState;
}

// Get best damage one slot can deal to another
function getBestDamageToSlot(attackerSlot, defenderSlot) {
    if (!attackerSlot || !attackerSlot.pokemon || !defenderSlot || !defenderSlot.pokemon) {
        return 0;
    }
    
    let bestDamage = 0;
    const moves = attackerSlot.moves || [];
    
    for (const moveName of moves) {
        if (!moveName) continue;
        const move = getMoveByName(moveName);
        if (!move || move.power <= 0) continue;
        
        // Skip two-turn moves for "free hit" calculations
        if (moveHasEffect(move, 'two_turn_move')) continue;
        
        const damage = calculateActualDamage(move, attackerSlot.pokemon, defenderSlot.pokemon, {
            attackerTeraType: attackerSlot.teraType,
            defenderTeraType: defenderSlot.teraType,
            attackerAbility: attackerSlot.ability,
            defenderAbility: defenderSlot.ability,
            attackerItem: attackerSlot.item
        });
        
        if (damage.percentAvg > bestDamage) {
            bestDamage = damage.percentAvg;
        }
    }
    
    return bestDamage;
}

// Check if game is over (one side has no Pokemon left)
function isGameOver(simCopy) {
    // Check if my active is fainted and no swaps available
    if (simCopy.myHP <= 0) {
        const hasAlive = simCopy.myTeamHP.slice(0, BATTLE_TEAM_SIZE).some((hp, idx) => 
            hp && hp.current > 0 && idx !== simCopy.myActiveIndex
        );
        if (!hasAlive) return true;
    }
    
    if (simCopy.oppHP <= 0) {
        const hasAlive = simCopy.oppTeamHP.slice(0, BATTLE_TEAM_SIZE).some((hp, idx) => 
            hp && hp.current > 0 && idx !== simCopy.oppActiveIndex
        );
        if (!hasAlive) return true;
    }
    
    return false;
}

// Evaluate state - positive = good for maximizing player
function evaluateState(simCopy) {
    let score = 0;
    
    // HP differential of active Pokemon (weighted heavily)
    const myHPPercent = simCopy.myMaxHP > 0 ? (simCopy.myHP / simCopy.myMaxHP) * 100 : 0;
    const oppHPPercent = simCopy.oppMaxHP > 0 ? (simCopy.oppHP / simCopy.oppMaxHP) * 100 : 0;
    score += (myHPPercent - oppHPPercent) * 2;
    
    // Bonus for KO'd opponent
    if (simCopy.oppHP <= 0) score += 100;
    // Penalty for being KO'd
    if (simCopy.myHP <= 0) score -= 100;
    
    // Team HP totals
    let myTeamTotal = 0, myTeamMax = 0;
    let oppTeamTotal = 0, oppTeamMax = 0;
    
    simCopy.myTeamHP.slice(0, BATTLE_TEAM_SIZE).forEach(hp => {
        if (hp) {
            myTeamTotal += hp.current;
            myTeamMax += hp.max;
        }
    });
    
    simCopy.oppTeamHP.slice(0, BATTLE_TEAM_SIZE).forEach(hp => {
        if (hp) {
            oppTeamTotal += hp.current;
            oppTeamMax += hp.max;
        }
    });
    
    const myTeamPercent = myTeamMax > 0 ? (myTeamTotal / myTeamMax) * 100 : 0;
    const oppTeamPercent = oppTeamMax > 0 ? (oppTeamTotal / oppTeamMax) * 100 : 0;
    score += (myTeamPercent - oppTeamPercent) * 0.5;
    
    // Matchup advantage
    if (simCopy.mySlot && simCopy.oppSlot && simCopy.mySlot.pokemon && simCopy.oppSlot.pokemon) {
        const matchup = calculateMatchupScore(simCopy.mySlot, simCopy.oppSlot);
        score += (matchup - 50) * 0.3;
    }
    
    // Penalty for being locked in charging (vulnerable)
    if (simCopy.myCharging) score -= 20;
    if (simCopy.oppCharging) score += 20;
    
    return score;
}

// Update UI to show recommended action (async with progress) - only for my team
function updateActionRecommendations(team, simState) {
    // Only run minimax for my team
    if (team !== 'my') return;
    
    // Cancel any existing calculation
    if (minimaxState.activeCalculation) {
        minimaxState.activeCalculation.cancelled = true;
    }
    
    // Start with quick depth-1 recommendation
    const quickRec = getMinimaxRecommendation(team, simState, 1);
    if (quickRec) {
        showIntermediateRecommendation(team, quickRec, 1, MINIMAX_CONFIG.depth);
    }
    
    // Create cancellation token
    const calcToken = { cancelled: false };
    minimaxState.activeCalculation = calcToken;
    
    // Run full async calculation
    getMinimaxRecommendationAsync(team, simState, MINIMAX_CONFIG.depth).then(recommendation => {
        // Check if this calculation was cancelled
        if (calcToken.cancelled) return;
        
        // Clear calculating states
        document.querySelectorAll(`.sim-move-btn[data-team="${team}"]`).forEach(btn => {
            btn.classList.remove('calculating');
        });
        const swapBtn = document.getElementById(`sim-${team}-swap-btn`);
        if (swapBtn) {
            swapBtn.classList.remove('calculating');
        }
        
        if (!recommendation) return;
        
        // Show final recommendation
        showIntermediateRecommendation(team, recommendation, MINIMAX_CONFIG.depth, MINIMAX_CONFIG.depth);
    });
}

// Render stat modifier badges for a Pokemon
function renderStatModifiers(statMods) {
    const statNames = {
        atk: 'ATK', def: 'DEF', spAtk: 'SPA', spDef: 'SPD', 
        speed: 'SPE', accuracy: 'ACC', evasion: 'EVA'
    };
    
    const modBadges = [];
    for (const [stat, value] of Object.entries(statMods)) {
        if (value !== 0) {
            const sign = value > 0 ? '+' : '';
            const className = value > 0 ? 'stat-boost' : 'stat-drop';
            modBadges.push(`<span class="stat-mod-badge ${className}" title="${statNames[stat]}: ${sign}${value} stages">${statNames[stat]} ${sign}${value}</span>`);
        }
    }
    
    if (modBadges.length === 0) return '';
    
    return `<div class="stat-mods-container">${modBadges.join('')}</div>`;
}

function renderSimPokemonCard(containerId, slot, currentHP, maxHP, team, chargingMove = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!slot || !slot.pokemon) {
        container.innerHTML = `
            <div class="sim-empty-state">
                <h3>No Pokemon</h3>
                <p>Add Pokemon in Team Builder</p>
            </div>
        `;
        return;
    }
    
    const pokemon = slot.pokemon;
    const hpPercent = maxHP > 0 ? Math.max(0, (currentHP / maxHP) * 100) : 100;
    const hpClass = hpPercent > 50 ? 'hp-high' : hpPercent > 25 ? 'hp-medium' : 'hp-low';
    const speed = pokemon.speed || 0;
    
    const typesHTML = pokemon.types.map(t => 
        `<span class="type-badge type-${t}">${t}</span>`
    ).join('');
    
    const chargingHTML = chargingMove 
        ? `<div class="sim-charging-indicator">Charging ${chargingMove.moveName}...</div>` 
        : '';
    
    // Get stat modifiers for this Pokemon
    const simState = state.simulationState;
    const statMods = team === 'my' ? simState.myStatMods : simState.enemyStatMods;
    const statModsHTML = renderStatModifiers(statMods);
    
    container.innerHTML = `
        <img src="${getSpriteUrl(pokemon.id)}" alt="${pokemon.name}" class="sim-pokemon-sprite${chargingMove ? ' charging' : ''}">
        <div class="sim-pokemon-name">${pokemon.name}</div>
        <div class="sim-pokemon-types">${typesHTML}</div>
        ${chargingHTML}
        ${statModsHTML}
        <div class="sim-stat-row">
            <span class="sim-speed-label">SPD</span>
            <span class="sim-speed-value">${speed}</span>
        </div>
        <div class="sim-hp-container">
            <div class="sim-hp-label">
                <span class="sim-hp-label-text">HP</span>
                <div class="sim-hp-editable">
                    <input type="number" 
                           class="sim-hp-input" 
                           data-team="${team}" 
                           value="${Math.max(0, currentHP)}" 
                           min="0" 
                           max="${maxHP}">
                    <span class="sim-hp-max">/ ${maxHP}</span>
                </div>
            </div>
            <div class="sim-hp-bar" data-team="${team}" title="Click to set HP">
                <div class="sim-hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
            </div>
        </div>
    `;
    
    // Add event listener for HP input
    const hpInput = container.querySelector('.sim-hp-input');
    if (hpInput) {
        hpInput.addEventListener('change', (e) => {
            const newHP = parseInt(e.target.value) || 0;
            updateSimulationHP(team, Math.max(0, Math.min(newHP, maxHP)));
        });
        hpInput.addEventListener('click', (e) => e.stopPropagation());
    }
    
    // Add click handler for HP bar to quickly set HP
    const hpBar = container.querySelector('.sim-hp-bar');
    if (hpBar) {
        hpBar.addEventListener('click', (e) => {
            const rect = hpBar.getBoundingClientRect();
            const clickPercent = (e.clientX - rect.left) / rect.width;
            const newHP = Math.round(clickPercent * maxHP);
            updateSimulationHP(team, Math.max(0, Math.min(newHP, maxHP)));
        });
    }
}

function renderSimMovePanel(containerId, attackerSlot, defenderSlot, team, chargingMove = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!attackerSlot || !attackerSlot.pokemon) {
        container.innerHTML = '<p class="sim-empty-state">No Pokemon selected</p>';
        return;
    }
    
    // If charging, show locked state
    if (chargingMove) {
        container.innerHTML = `
            <div class="sim-charging-locked">
                <div class="sim-charging-message">
                    <span class="charging-icon">⚡</span>
                    Releasing ${chargingMove.moveName} this turn!
                </div>
            </div>
        `;
        return;
    }
    
    const moves = attackerSlot.moves || [];
    // Only show simple best-move highlight for enemy team; my team uses minimax recommendation
    let bestMoveIndex = -1;
    let shouldHighlightSwap = false;
    if (team === 'enemy') {
        const bestAction = getBestMoveForSimulation(attackerSlot, defenderSlot);
        bestMoveIndex = bestAction.moveIndex;
        shouldHighlightSwap = bestAction.shouldSwap;
        
        // Highlight swap button if no moves can deal damage
        const swapBtn = document.getElementById('sim-enemy-swap-btn');
        if (swapBtn) {
            swapBtn.classList.toggle('recommend-swap', shouldHighlightSwap);
        }
    }
    
    let html = '';
    for (let i = 0; i < 4; i++) {
        const moveName = moves[i];
        if (moveName) {
            const move = getMoveByName(moveName);
            if (move) {
                const isBest = i === bestMoveIndex;
                const typeColor = `var(--type-${move.type})`;
                
                // Check for two-turn move
                const isTwoTurn = moveHasEffect(move, 'two_turn_move');
                
                // Calculate damage percentage for display
                let damageText = '';
                if (defenderSlot && defenderSlot.pokemon && move.power > 0) {
                    const damage = calculateActualDamage(move, attackerSlot.pokemon, defenderSlot.pokemon, {
                        attackerTeraType: attackerSlot.teraType,
                        defenderTeraType: defenderSlot.teraType,
                        attackerAbility: attackerSlot.ability,
                        defenderAbility: defenderSlot.ability,
                        attackerItem: attackerSlot.item
                    });
                    // Show effective damage per turn for two-turn moves
                    if (isTwoTurn) {
                        damageText = `~${Math.round(damage.percentAvg / 2)}%/t`;
                    } else {
                        damageText = `~${Math.round(damage.percentAvg)}%`;
                    }
                } else if (move.power > 0) {
                    damageText = `${move.power} pow`;
                } else if (defenderSlot && defenderSlot.pokemon) {
                    // Status move - show first tick damage if available
                    const statusDamage = calculateActualDamage(move, attackerSlot.pokemon, defenderSlot.pokemon, {
                        attackerTeraType: attackerSlot.teraType,
                        defenderTeraType: defenderSlot.teraType
                    });
                    if (statusDamage.percentAvg > 0) {
                        damageText = `~${Math.round(statusDamage.percentAvg)}%/t`;
                    } else {
                        damageText = 'Status';
                    }
                } else {
                    damageText = 'Status';
                }
                
                // Check for priority (supports both legacy and new effects array format)
                const hasPriority = moveHasEffect(move, 'priority') || moveHasEffect(move, 'priority_plus2');
                const priorityBadge = hasPriority ? '<span class="sim-priority-badge">+P</span>' : '';
                const twoTurnBadge = isTwoTurn ? '<span class="sim-two-turn-badge">2T</span>' : '';
                
                html += `
                    <button class="sim-move-btn${isBest ? ' best-move' : ''}${isTwoTurn ? ' two-turn' : ''}" 
                            data-team="${team}" 
                            data-move-index="${i}"
                            data-move-name="${moveName}">
                        <div class="sim-move-type-dot" style="background: ${typeColor}"></div>
                        <div class="sim-move-info">
                            <div class="sim-move-name">${moveName}${priorityBadge}${twoTurnBadge}</div>
                            <div class="sim-move-power">${damageText}</div>
                        </div>
                    </button>
                `;
            }
        } else {
            html += `
                <button class="sim-move-btn empty" disabled>
                    <div class="sim-move-type-dot" style="background: var(--border-color)"></div>
                    <div class="sim-move-info">
                        <div class="sim-move-name">—</div>
                    </div>
                </button>
            `;
        }
    }
    
    container.innerHTML = html;
    
    // Add click handlers
    container.querySelectorAll('.sim-move-btn:not(.empty)').forEach(btn => {
        btn.addEventListener('click', () => {
            const moveTeam = btn.dataset.team;
            const moveIndex = parseInt(btn.dataset.moveIndex);
            selectSimulationMove(moveTeam, moveIndex);
        });
    });
}

function getBestMoveForSimulation(attackerSlot, defenderSlot) {
    if (!attackerSlot || !attackerSlot.pokemon || !defenderSlot || !defenderSlot.pokemon) {
        return { moveIndex: -1, shouldSwap: false };
    }
    
    const moves = attackerSlot.moves || [];
    let bestIndex = -1;
    let bestEffectiveDamage = 0;
    
    moves.forEach((moveName, index) => {
        if (!moveName) return;
        const move = getMoveByName(moveName);
        if (!move || move.power <= 0) return;
        
        const damage = calculateActualDamage(move, attackerSlot.pokemon, defenderSlot.pokemon, {
            attackerTeraType: attackerSlot.teraType,
            defenderTeraType: defenderSlot.teraType,
            attackerAbility: attackerSlot.ability,
            defenderAbility: defenderSlot.ability,
            attackerItem: attackerSlot.item
        });
        
        // Penalize two-turn moves (effective damage per turn is halved)
        let effectiveDamage = damage.percentAvg;
        if (moveHasEffect(move, 'two_turn_move')) {
            effectiveDamage = effectiveDamage / 2;
        }
        
        if (effectiveDamage > bestEffectiveDamage) {
            bestEffectiveDamage = effectiveDamage;
            bestIndex = index;
        }
    });
    
    // If no move can deal damage, recommend swap
    const shouldSwap = bestEffectiveDamage <= 0;
    
    return { moveIndex: bestIndex, shouldSwap };
}

function selectSimulationMove(team, moveIndex) {
    const simState = state.simulationState;
    const slot = team === 'my' ? state.myTeam[simState.myActiveIndex] : state.enemyTeam[simState.enemyActiveIndex];
    const moveName = slot.moves[moveIndex];
    const move = getMoveByName(moveName);
    
    if (team === 'my') {
        simState.mySelectedAction = { type: 'move', moveIndex, move, moveName };
    } else {
        simState.enemySelectedAction = { type: 'move', moveIndex, move, moveName };
    }
    
    updateSimSelectedStates();
    checkBothActionsSelected();
}

function selectSimulationSwap(team, targetIndex) {
    const simState = state.simulationState;
    
    // Handle faint swap - execute immediately
    if (simState.phase === 'faint_swap') {
        closeSimSwapModal();
        executeSwap(team, targetIndex);
        addTurnLogEntry(`${team === 'my' ? 'You' : 'Enemy'} sent out ${state[team === 'my' ? 'myTeam' : 'enemyTeam'][targetIndex].pokemon.name}!`, 'info');
        
        // Check if the other team also fainted and needs to swap
        const otherTeam = team === 'my' ? 'enemy' : 'my';
        const otherHP = otherTeam === 'my' ? simState.myCurrentHP : simState.enemyCurrentHP;
        const otherHasSwap = hasAvailableSwap(otherTeam);
        
        if (otherHP <= 0 && otherHasSwap) {
            // Other team also fainted, show their swap modal
            openSimSwapModal(otherTeam);
            return;
        }
        
        // All swaps done, proceed to next turn
        simState.phase = 'select_moves';
        renderSimulationView();
        return;
    }
    
    // Normal swap selection during move selection phase
    if (team === 'my') {
        simState.mySelectedAction = { type: 'swap', targetIndex };
    } else {
        simState.enemySelectedAction = { type: 'swap', targetIndex };
    }
    
    updateSimSelectedStates();
    closeSimSwapModal();
    checkBothActionsSelected();
}

function selectSimulationSkip(team) {
    const simState = state.simulationState;
    
    if (team === 'my') {
        simState.mySelectedAction = { type: 'skip' };
    } else {
        simState.enemySelectedAction = { type: 'skip' };
    }
    
    updateSimSelectedStates();
    checkBothActionsSelected();
}

function updateSimSelectedStates() {
    const simState = state.simulationState;
    
    // Update move buttons
    document.querySelectorAll('.sim-move-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    if (simState.mySelectedAction && simState.mySelectedAction.type === 'move') {
        const myBtn = document.querySelector(`.sim-move-btn[data-team="my"][data-move-index="${simState.mySelectedAction.moveIndex}"]`);
        if (myBtn) myBtn.classList.add('selected');
    }
    
    if (simState.enemySelectedAction && simState.enemySelectedAction.type === 'move') {
        const enemyBtn = document.querySelector(`.sim-move-btn[data-team="enemy"][data-move-index="${simState.enemySelectedAction.moveIndex}"]`);
        if (enemyBtn) enemyBtn.classList.add('selected');
    }
    
    // Update swap buttons
    document.querySelectorAll('.sim-swap-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    if (simState.mySelectedAction && simState.mySelectedAction.type === 'swap') {
        const mySwapBtn = document.getElementById('sim-my-swap-btn');
        if (mySwapBtn) mySwapBtn.classList.add('selected');
    }
    
    if (simState.enemySelectedAction && simState.enemySelectedAction.type === 'swap') {
        const enemySwapBtn = document.getElementById('sim-enemy-swap-btn');
        if (enemySwapBtn) enemySwapBtn.classList.add('selected');
    }
    
    // Update skip buttons
    document.querySelectorAll('.sim-skip-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    if (simState.mySelectedAction && simState.mySelectedAction.type === 'skip') {
        const mySkipBtn = document.getElementById('sim-my-skip-btn');
        if (mySkipBtn) mySkipBtn.classList.add('selected');
    }
    
    if (simState.enemySelectedAction && simState.enemySelectedAction.type === 'skip') {
        const enemySkipBtn = document.getElementById('sim-enemy-skip-btn');
        if (enemySkipBtn) enemySkipBtn.classList.add('selected');
    }
}

function checkBothActionsSelected() {
    const simState = state.simulationState;
    
    if (simState.mySelectedAction && simState.enemySelectedAction) {
        // Both actions selected - determine what happens next
        const myAction = simState.mySelectedAction;
        const enemyAction = simState.enemySelectedAction;
        
        // Types that don't need order selection
        const noOrderTypes = ['swap', 'skip', 'charging_release'];
        
        // If either is a swap, skip, or charging release, execute immediately (no order selection needed)
        if (noOrderTypes.includes(myAction.type) || noOrderTypes.includes(enemyAction.type)) {
            executeSimulationTurn('swap_first');
        } else {
            // Both are regular moves - show order selection
            showOrderSelection();
        }
    }
}

function showOrderSelection() {
    const simState = state.simulationState;
    const mySlot = state.myTeam[simState.myActiveIndex];
    const enemySlot = state.enemyTeam[simState.enemyActiveIndex];
    
    if (!mySlot || !enemySlot || !mySlot.pokemon || !enemySlot.pokemon) return;
    
    // Automatically determine turn order based on priority and speed
    const firstMover = determineTurnOrder();
    
    // Execute turn immediately without showing modal
    executeSimulationTurn(firstMover);
}

// Determine who moves first based on move priority and speed
function determineTurnOrder() {
    const simState = state.simulationState;
    const mySlot = state.myTeam[simState.myActiveIndex];
    const enemySlot = state.enemyTeam[simState.enemyActiveIndex];
    
    // Get speeds
    const mySpeed = mySlot.pokemon.speed || 50;
    const enemySpeed = enemySlot.pokemon.speed || 50;
    
    // Get move priorities (uses getMovePriority from moves.js)
    const myMove = simState.mySelectedAction?.move;
    const enemyMove = simState.enemySelectedAction?.move;
    const myPriority = getMovePriority(myMove);
    const enemyPriority = getMovePriority(enemyMove);
    
    // Higher priority moves first
    if (myPriority > enemyPriority) {
        return 'my';
    } else if (enemyPriority > myPriority) {
        return 'enemy';
    }
    
    // Same priority - faster Pokémon moves first
    // Ties go to "my" team
    return mySpeed >= enemySpeed ? 'my' : 'enemy';
}

// getMovePriority is now defined in moves.js using MOVE_EFFECTS.priority

function closeOrderModal() {
    const modal = document.getElementById('sim-order-modal');
    if (modal) modal.classList.remove('active');
}

function executeSimulationTurn(firstMover) {
    const simState = state.simulationState;
    const myAction = simState.mySelectedAction;
    const enemyAction = simState.enemySelectedAction;
    
    // Save state before executing for undo functionality
    saveSimulationStateForUndo();
    
    closeOrderModal();
    
    // Helper to execute an action
    const executeAction = (team, action) => {
        if (action.type === 'swap') {
            executeSwap(team, action.targetIndex);
        } else if (action.type === 'skip') {
            const slot = team === 'my' ? state.myTeam[simState.myActiveIndex] : state.enemyTeam[simState.enemyActiveIndex];
            addTurnLogEntry(`${slot?.pokemon?.name || team} skipped their turn.`, 'info');
        } else if (action.type === 'move') {
            executeMoveAction(team, action);
        } else if (action.type === 'charging_release') {
            // Execute the charged move with damage
            executeMoveAction(team, action, true);
        }
    };
    
    // Handle swaps, skips, and charging releases first (no order selection needed)
    if (firstMover === 'swap_first') {
        // Execute swaps before moves
        if (myAction.type === 'swap') {
            executeSwap('my', myAction.targetIndex);
        }
        if (enemyAction.type === 'swap') {
            executeSwap('enemy', enemyAction.targetIndex);
        }
        
        // Handle skips
        if (myAction.type === 'skip') {
            const mySlot = state.myTeam[simState.myActiveIndex];
            addTurnLogEntry(`${mySlot?.pokemon?.name || 'You'} skipped their turn.`, 'info');
        }
        if (enemyAction.type === 'skip') {
            const enemySlot = state.enemyTeam[simState.enemyActiveIndex];
            addTurnLogEntry(`${enemySlot?.pokemon?.name || 'Enemy'} skipped their turn.`, 'info');
        }
        
        // Handle charging releases
        if (myAction.type === 'charging_release') {
            executeMoveAction('my', myAction, true);
        }
        if (enemyAction.type === 'charging_release') {
            executeMoveAction('enemy', enemyAction, true);
        }
        
        // Then execute any regular moves
        if (myAction.type === 'move') {
            executeMoveAction('my', myAction);
        }
        if (enemyAction.type === 'move') {
            executeMoveAction('enemy', enemyAction);
        }
    } else {
        // Both are moves or charging releases - execute in order
        const first = firstMover;
        const second = firstMover === 'my' ? 'enemy' : 'my';
        
        const firstAction = first === 'my' ? myAction : enemyAction;
        const secondAction = second === 'my' ? myAction : enemyAction;
        
        const isFirstCharging = firstAction.type === 'charging_release';
        const isSecondCharging = secondAction.type === 'charging_release';
        
        executeMoveAction(first, firstAction, isFirstCharging);
        
        // Check if second Pokemon is still alive
        const secondHP = second === 'my' ? simState.myCurrentHP : simState.enemyCurrentHP;
        if (secondHP > 0) {
            executeMoveAction(second, secondAction, isSecondCharging);
        }
    }
    
    // Apply end-of-turn effects (Leftovers, etc.)
    applyEndOfTurnEffects();
    
    // Check if any Pokemon fainted and needs replacement
    const myFainted = simState.myCurrentHP <= 0;
    const enemyFainted = simState.enemyCurrentHP <= 0;
    
    // Check for available swaps
    const myHasSwap = hasAvailableSwap('my');
    const enemyHasSwap = hasAvailableSwap('enemy');
    
    // Reset selected actions
    simState.mySelectedAction = null;
    simState.enemySelectedAction = null;
    
    // If a Pokemon fainted and has available swaps, show swap modal
    if (myFainted && myHasSwap) {
        simState.phase = 'faint_swap';
        renderSimulationView();
        openSimSwapModal('my');
        return; // Wait for swap before next turn
    }
    
    if (enemyFainted && enemyHasSwap) {
        simState.phase = 'faint_swap';
        renderSimulationView();
        openSimSwapModal('enemy');
        return; // Wait for swap before next turn
    }
    
    // Normal reset for next turn
    simState.phase = 'select_moves';
    renderSimulationView();
}

// Check if a team has available Pokemon to swap to
function hasAvailableSwap(team) {
    const simState = state.simulationState;
    const teamData = team === 'my' ? state.myTeam : state.enemyTeam;
    const teamHP = team === 'my' ? simState.myTeamHP : simState.enemyTeamHP;
    const currentIndex = team === 'my' ? simState.myActiveIndex : simState.enemyActiveIndex;
    
    return teamData.slice(0, BATTLE_TEAM_SIZE).some((slot, idx) => {
        if (!slot || !slot.pokemon) return false;
        if (idx === currentIndex) return false;
        const hp = teamHP[idx];
        return hp && hp.current > 0;
    });
}

function applyEndOfTurnEffects() {
    const simState = state.simulationState;
    
    // Apply effects to both active Pokemon
    ['my', 'enemy'].forEach(team => {
        const activeIndex = team === 'my' ? simState.myActiveIndex : simState.enemyActiveIndex;
        const slot = team === 'my' ? state.myTeam[activeIndex] : state.enemyTeam[activeIndex];
        const currentHP = team === 'my' ? simState.myCurrentHP : simState.enemyCurrentHP;
        const maxHP = team === 'my' ? simState.myMaxHP : simState.enemyMaxHP;
        
        if (!slot || !slot.pokemon || currentHP <= 0) return;
        
        const pokemonName = slot.pokemon.name;
        const item = slot.item;
        
        // Leftovers: Heal 1/16 of max HP at end of turn
        if (item === 'Leftovers') {
            const healAmount = Math.max(1, Math.floor(maxHP / 16));
            const newHP = Math.min(maxHP, currentHP + healAmount);
            const actualHeal = newHP - currentHP;
            
            if (actualHeal > 0) {
                if (team === 'my') {
                    simState.myCurrentHP = newHP;
                    if (simState.myTeamHP[simState.myActiveIndex]) {
                        simState.myTeamHP[simState.myActiveIndex].current = newHP;
                    }
                } else {
                    simState.enemyCurrentHP = newHP;
                    if (simState.enemyTeamHP[simState.enemyActiveIndex]) {
                        simState.enemyTeamHP[simState.enemyActiveIndex].current = newHP;
                    }
                }
                addTurnLogEntry(`${pokemonName}'s Leftovers restored ${actualHeal} HP!`, 'heal');
            }
        }
    });
}

function executeSwap(team, targetIndex) {
    const simState = state.simulationState;
    const targetSlot = team === 'my' ? state.myTeam[targetIndex] : state.enemyTeam[targetIndex];
    
    if (!targetSlot || !targetSlot.pokemon) return;
    
    const oldIndex = team === 'my' ? simState.myActiveIndex : simState.enemyActiveIndex;
    const oldSlot = team === 'my' ? state.myTeam[oldIndex] : state.enemyTeam[oldIndex];
    const teamHP = team === 'my' ? simState.myTeamHP : simState.enemyTeamHP;
    
    // Save current HP to team array before swapping
    if (teamHP[oldIndex]) {
        teamHP[oldIndex].current = team === 'my' ? simState.myCurrentHP : simState.enemyCurrentHP;
    }
    
    // Reset stat modifiers when switching out (stat changes don't persist through switching)
    if (team === 'my') {
        simState.myStatMods = { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 };
    } else {
        simState.enemyStatMods = { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 };
    }
    
    // Update active index and load HP from new Pokemon
    if (team === 'my') {
        simState.myActiveIndex = targetIndex;
        const newHP = simState.myTeamHP[targetIndex];
        if (newHP) {
            simState.myMaxHP = newHP.max;
            simState.myCurrentHP = newHP.current;
        }
    } else {
        simState.enemyActiveIndex = targetIndex;
        const newHP = simState.enemyTeamHP[targetIndex];
        if (newHP) {
            simState.enemyMaxHP = newHP.max;
            simState.enemyCurrentHP = newHP.current;
        }
    }
    
    const teamName = team === 'my' ? 'You' : 'Enemy';
    addTurnLogEntry(`${teamName} swapped ${oldSlot.pokemon.name} for ${targetSlot.pokemon.name}!`, 'swap');
}

function executeMoveAction(team, action, isChargingRelease = false) {
    const simState = state.simulationState;
    const attackerSlot = team === 'my' 
        ? state.myTeam[simState.myActiveIndex] 
        : state.enemyTeam[simState.enemyActiveIndex];
    const defenderSlot = team === 'my'
        ? state.enemyTeam[simState.enemyActiveIndex]
        : state.myTeam[simState.myActiveIndex];
    
    if (!attackerSlot || !attackerSlot.pokemon || !defenderSlot || !defenderSlot.pokemon) return;
    if (!action.move) return;
    
    const move = action.move;
    const attackerName = attackerSlot.pokemon.name;
    const defenderName = defenderSlot.pokemon.name;
    
    // Check if this is a two-turn move and we're not releasing
    const isTwoTurn = moveHasEffect(move, 'two_turn_move');
    
    if (isTwoTurn && !isChargingRelease) {
        // First turn of two-turn move - just charge, no damage
        if (team === 'my') {
            simState.myChargingMove = { move: move, moveName: move.name };
        } else {
            simState.enemyChargingMove = { move: move, moveName: move.name };
        }
        addTurnLogEntry(`${attackerName} is charging ${move.name}...`, 'info');
        return;
    }
    
    // Clear charging state if this was a release
    if (isChargingRelease) {
        if (team === 'my') {
            simState.myChargingMove = null;
        } else {
            simState.enemyChargingMove = null;
        }
    }
    
    // Calculate damage
    if (move.power > 0) {
        // Get defender's status for abilities like Marvel Scale
        const defenderStatus = team === 'my' ? simState.enemyStatus : simState.myStatus;
        
        const damage = calculateActualDamage(move, attackerSlot.pokemon, defenderSlot.pokemon, {
            attackerTeraType: attackerSlot.teraType,
            defenderTeraType: defenderSlot.teraType,
            attackerAbility: attackerSlot.ability,
            defenderAbility: defenderSlot.ability,
            attackerItem: attackerSlot.item,
            defenderStatus: defenderStatus
        });
        
        const damageDealt = Math.round(damage.avg);
        
        // Apply damage to defender (update both active HP and team array)
        if (team === 'my') {
            simState.enemyCurrentHP = Math.max(0, simState.enemyCurrentHP - damageDealt);
            // Sync to team HP array
            if (simState.enemyTeamHP[simState.enemyActiveIndex]) {
                simState.enemyTeamHP[simState.enemyActiveIndex].current = simState.enemyCurrentHP;
            }
        } else {
            simState.myCurrentHP = Math.max(0, simState.myCurrentHP - damageDealt);
            // Sync to team HP array
            if (simState.myTeamHP[simState.myActiveIndex]) {
                simState.myTeamHP[simState.myActiveIndex].current = simState.myCurrentHP;
            }
        }
        
        const percentDamage = Math.round(damage.percentAvg);
        const releaseText = isChargingRelease ? ' unleashed ' : ' used ';
        addTurnLogEntry(`${attackerName}${releaseText}${move.name}! Dealt ${damageDealt} HP (${percentDamage}%) to ${defenderName}`, 'damage');
        
        // Check for fainting
        const defenderHP = team === 'my' ? simState.enemyCurrentHP : simState.myCurrentHP;
        if (defenderHP <= 0) {
            addTurnLogEntry(`${defenderName} fainted!`, 'damage');
        }
        
        // Apply post-attack ability effects (Rough Skin, Iron Barbs, etc.)
        const abilityEffects = applyPostAttackAbilityEffects(move, attackerSlot.ability, defenderSlot.ability);
        
        if (abilityEffects.attackerRecoil > 0) {
            const attackerMaxHP = team === 'my' ? simState.myMaxHP : simState.enemyMaxHP;
            const recoilDamage = Math.max(1, Math.floor(attackerMaxHP * abilityEffects.attackerRecoil));
            
            if (team === 'my') {
                simState.myCurrentHP = Math.max(0, simState.myCurrentHP - recoilDamage);
                if (simState.myTeamHP[simState.myActiveIndex]) {
                    simState.myTeamHP[simState.myActiveIndex].current = simState.myCurrentHP;
                }
            } else {
                simState.enemyCurrentHP = Math.max(0, simState.enemyCurrentHP - recoilDamage);
                if (simState.enemyTeamHP[simState.enemyActiveIndex]) {
                    simState.enemyTeamHP[simState.enemyActiveIndex].current = simState.enemyCurrentHP;
                }
            }
            
            addTurnLogEntry(`${attackerName} was hurt by ${defenderName}'s ${abilityEffects.recoilAbilityName}!`, 'damage');
            
            // Check if attacker fainted from recoil
            const attackerHP = team === 'my' ? simState.myCurrentHP : simState.enemyCurrentHP;
            if (attackerHP <= 0) {
                addTurnLogEntry(`${attackerName} fainted!`, 'damage');
            }
        }
    } else {
        // Status move - log and apply effects
        addTurnLogEntry(`${attackerName} used ${move.name}!`, 'info');
    }
    
    // Apply stat change effects (both damaging moves with effects and status moves)
    if (move.effect && move.effectChance) {
        // Check if defender's ability blocks this effect (e.g., Inner Focus blocks flinch)
        if (abilityBlocksEffect(defenderSlot.ability, move.effect)) {
            // Effect blocked by ability - don't apply
            return;
        }
        
        // Apply ability effects to effect chance (e.g., Serene Grace)
        const effectiveChance = applyAbilityToEffectChance(attackerSlot.ability, move.effectChance);
        
        // Check if effect triggers (100% for guaranteed, otherwise random)
        const triggers = effectiveChance >= 100 || Math.random() * 100 < effectiveChance;
        if (triggers) {
            applyMoveEffect(move.effect, team, attackerName, defenderName);
        }
    }
}

// Apply stat change effects from moves (uses MOVE_EFFECTS from moves.js)
function applyMoveEffect(effect, attackerTeam, attackerName, defenderName) {
    const simState = state.simulationState;
    const targetSelf = effect.includes('user');
    const statModsKey = targetSelf 
        ? (attackerTeam === 'my' ? 'myStatMods' : 'enemyStatMods')
        : (attackerTeam === 'my' ? 'enemyStatMods' : 'myStatMods');
    const targetName = targetSelf ? attackerName : defenderName;
    
    // Handle healing effects (always target self)
    const healingEffect = MOVE_EFFECTS.healing[effect];
    if (healingEffect) {
        const currentHP = attackerTeam === 'my' ? simState.myCurrentHP : simState.enemyCurrentHP;
        const maxHP = attackerTeam === 'my' ? simState.myMaxHP : simState.enemyMaxHP;
        const healAmount = Math.floor(maxHP * healingEffect.percent / 100);
        const newHP = Math.min(maxHP, currentHP + healAmount);
        const actualHeal = newHP - currentHP;
        
        if (attackerTeam === 'my') {
            simState.myCurrentHP = newHP;
            if (simState.myTeamHP[simState.myActiveIndex]) {
                simState.myTeamHP[simState.myActiveIndex].current = newHP;
            }
        } else {
            simState.enemyCurrentHP = newHP;
            if (simState.enemyTeamHP[simState.enemyActiveIndex]) {
                simState.enemyTeamHP[simState.enemyActiveIndex].current = newHP;
            }
        }
        
        if (actualHeal > 0) {
            addTurnLogEntry(`${attackerName} restored ${actualHeal} HP!`, 'heal');
        } else {
            addTurnLogEntry(`${attackerName}'s HP is already full!`, 'info');
        }
        return;
    }
    
    // Handle stat change effects
    const change = MOVE_EFFECTS.statChanges[effect];
    if (!change) return; // Effect not handled
    
    // Determine which stat mods to update
    const actualModsKey = change.self 
        ? (attackerTeam === 'my' ? 'myStatMods' : 'enemyStatMods')
        : statModsKey;
    const actualTargetName = change.self ? attackerName : targetName;
    
    // Apply the stat change(s)
    const statsToChange = change.stats || [change.stat];
    const stages = change.stages;
    
    statsToChange.forEach(stat => {
        // Clamp stat stages between -6 and +6
        const oldValue = simState[actualModsKey][stat];
        const newValue = Math.max(-6, Math.min(6, oldValue + stages));
        simState[actualModsKey][stat] = newValue;
        
        if (newValue !== oldValue) {
            const changeText = stages > 0 ? 'rose' : (stages < -1 ? 'harshly fell' : 'fell');
            addTurnLogEntry(`${actualTargetName}'s ${MOVE_EFFECTS.statNames[stat]} ${changeText}!`, 'status');
        }
    });
}

function addTurnLogEntry(message, type = 'info') {
    state.simulationState.turnLog.push({ message, type, timestamp: Date.now() });
}

function renderSimTurnLog() {
    const container = document.getElementById('sim-turn-log');
    if (!container) return;
    
    const log = state.simulationState.turnLog;
    
    if (log.length === 0) {
        container.innerHTML = '<p class="sim-log-empty">Battle log will appear here...</p>';
        return;
    }
    
    // Show last 5 entries
    const recentEntries = log.slice(-5);
    container.innerHTML = recentEntries.map(entry => 
        `<div class="sim-turn-log-entry ${entry.type}">${entry.message}</div>`
    ).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function openSimSwapModal(team) {
    const modal = document.getElementById('sim-swap-modal');
    const grid = document.getElementById('sim-swap-grid');
    const simState = state.simulationState;
    
    // Update modal title based on context
    const modalTitle = modal.querySelector('.modal-header h3');
    const closeBtn = modal.querySelector('.modal-close');
    if (simState.phase === 'faint_swap') {
        const faintedSlot = team === 'my' ? state.myTeam[simState.myActiveIndex] : state.enemyTeam[simState.enemyActiveIndex];
        const faintedName = faintedSlot?.pokemon?.name || 'Pokemon';
        modalTitle.textContent = `${faintedName} fainted! Choose a replacement:`;
        if (closeBtn) closeBtn.style.display = 'none'; // Hide close button during forced swap
    } else {
        modalTitle.textContent = 'Swap Pokemon';
        if (closeBtn) closeBtn.style.display = ''; // Show close button normally
    }
    
    const teamData = team === 'my' ? state.myTeam : state.enemyTeam;
    const currentIndex = team === 'my' ? simState.myActiveIndex : simState.enemyActiveIndex;
    
    // Get the opponent's current Pokemon for matchup calculation
    const opponentSlot = team === 'my' 
        ? state.enemyTeam[simState.enemyActiveIndex]
        : state.myTeam[simState.myActiveIndex];
    
    // Calculate matchup scores for each available swap option (only first 6 - battle team, not bench)
    const swapOptions = [];
    teamData.slice(0, BATTLE_TEAM_SIZE).forEach((slot, index) => {
        if (!slot || !slot.pokemon) return;
        if (index === currentIndex) return; // Can't swap to current
        
        // Calculate matchup score against the opponent
        const matchupScore = opponentSlot && opponentSlot.pokemon 
            ? calculateMatchupScore(slot, opponentSlot)
            : 50;
        
        swapOptions.push({ slot, index, matchupScore });
    });
    
    // For my team: compute best swap using minimax evaluation
    let minimaxSwapIndex = -1;
    if (team === 'my') {
        // Check if we have a stored swap recommendation
        if (minimaxState.currentRecommendation && minimaxState.currentRecommendation.type === 'swap') {
            const storedIndex = minimaxState.currentRecommendation.swapIndex;
            // Validate that swapIndex is a valid number
            if (typeof storedIndex === 'number' && storedIndex >= 0 && storedIndex < BATTLE_TEAM_SIZE) {
                minimaxSwapIndex = storedIndex;
            }
        }
        
        // If no valid swap recommendation, compute best swap now
        if (minimaxSwapIndex === -1 && swapOptions.length > 0) {
            minimaxSwapIndex = computeBestSwapIndex(simState, swapOptions);
        }
    }
    
    // Fallback to highest matchup if no minimax recommendation
    let bestIndex = minimaxSwapIndex;
    if (bestIndex === -1) {
        let bestScore = -1;
        swapOptions.forEach(option => {
            if (option.matchupScore > bestScore) {
                bestScore = option.matchupScore;
                bestIndex = option.index;
            }
        });
        // Only use matchup fallback if score is reasonable
        if (bestScore < 50) bestIndex = -1;
    }
    
    let html = '';
    swapOptions.forEach(option => {
        const { slot, index, matchupScore } = option;
        const pokemon = slot.pokemon;
        const typesHTML = pokemon.types.map(t => 
            `<span class="type-badge type-${t}">${t}</span>`
        ).join('');
        
        const isBest = index === bestIndex;
        const isMinimaxPick = team === 'my' && index === minimaxSwapIndex;
        const scoreClass = matchupScore >= 70 ? 'score-great' : matchupScore >= 50 ? 'score-good' : 'score-poor';
        
        // Get HP for this Pokemon
        const teamHP = team === 'my' ? simState.myTeamHP : simState.enemyTeamHP;
        const hpData = teamHP[index];
        const currentHP = hpData ? hpData.current : 0;
        const maxHP = hpData ? hpData.max : 0;
        const hpPercent = maxHP > 0 ? Math.round((currentHP / maxHP) * 100) : 0;
        const hpClass = hpPercent > 50 ? 'hp-high' : hpPercent > 25 ? 'hp-medium' : 'hp-low';
        
        // Check if fainted
        const isFainted = currentHP <= 0;
        
        const minimaxBadge = isMinimaxPick ? '<span class="minimax-badge" title="Minimax recommended">★</span>' : '';
        
        html += `
            <div class="sim-swap-option${isBest ? ' best-swap' : ''}${isFainted ? ' disabled fainted' : ''}" data-team="${team}" data-index="${index}">
                ${minimaxBadge}
                <img src="${getSpriteUrl(pokemon.id)}" alt="${pokemon.name}">
                <div class="sim-swap-info">
                    <div class="sim-swap-name">${pokemon.name}</div>
                    <div class="sim-swap-types">${typesHTML}</div>
                    <div class="sim-swap-hp">
                        <span class="sim-swap-hp-text ${hpClass}">${currentHP}/${maxHP} HP</span>
                        <div class="sim-swap-hp-bar">
                            <div class="sim-swap-hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                        </div>
                    </div>
                    ${!isFainted ? `<div class="sim-swap-score ${scoreClass}">${Math.round(matchupScore)}% matchup</div>` : '<div class="sim-swap-fainted">FAINTED</div>'}
                </div>
            </div>
        `;
    });
    
    if (html === '') {
        html = '<p class="sim-empty-state">No other Pokemon available</p>';
    }
    
    grid.innerHTML = html;
    
    // Add click handlers
    grid.querySelectorAll('.sim-swap-option').forEach(option => {
        option.addEventListener('click', () => {
            const swapTeam = option.dataset.team;
            const swapIndex = parseInt(option.dataset.index);
            selectSimulationSwap(swapTeam, swapIndex);
        });
    });
    
    modal.classList.add('active');
}

function closeSimSwapModal() {
    const simState = state.simulationState;
    
    // Don't allow closing during faint swap - must select a Pokemon
    if (simState.phase === 'faint_swap') {
        return;
    }
    
    const modal = document.getElementById('sim-swap-modal');
    if (modal) modal.classList.remove('active');
}

// Compute the best swap index using quick minimax evaluation
function computeBestSwapIndex(simState, swapOptions) {
    if (!swapOptions || swapOptions.length === 0) return -1;
    
    const simCopy = createSimStateCopy(simState, 'my');
    if (!simCopy.oppSlot || !simCopy.oppSlot.pokemon) {
        // No opponent, just return highest matchup
        let bestIdx = -1;
        let bestScore = -1;
        swapOptions.forEach(opt => {
            if (opt.matchupScore > bestScore) {
                bestScore = opt.matchupScore;
                bestIdx = opt.index;
            }
        });
        return bestIdx;
    }
    
    // Evaluate each swap option
    let bestSwapIndex = -1;
    let bestScore = -Infinity;
    
    for (const option of swapOptions) {
        const { slot, index } = option;
        
        // Skip fainted Pokemon
        const hpData = simCopy.myTeamHP[index];
        if (!hpData || hpData.current <= 0) continue;
        
        // Create action and evaluate
        const swapAction = { type: 'swap', swapIndex: index, swapSlot: slot };
        
        // Use depth 1 minimax to evaluate this swap
        const score = minimax(simCopy, swapAction, 1, -Infinity, Infinity, false);
        
        if (score > bestScore) {
            bestScore = score;
            bestSwapIndex = index;
        }
    }
    
    return bestSwapIndex;
}

function setupSimulationEventListeners() {
    // Swap buttons
    const mySwapBtn = document.getElementById('sim-my-swap-btn');
    const enemySwapBtn = document.getElementById('sim-enemy-swap-btn');
    
    if (mySwapBtn) {
        mySwapBtn.addEventListener('click', () => openSimSwapModal('my'));
    }
    if (enemySwapBtn) {
        enemySwapBtn.addEventListener('click', () => openSimSwapModal('enemy'));
    }
    
    // Skip buttons
    const mySkipBtn = document.getElementById('sim-my-skip-btn');
    const enemySkipBtn = document.getElementById('sim-enemy-skip-btn');
    
    if (mySkipBtn) {
        mySkipBtn.addEventListener('click', () => selectSimulationSkip('my'));
    }
    if (enemySkipBtn) {
        enemySkipBtn.addEventListener('click', () => selectSimulationSkip('enemy'));
    }
    
    // Reset button
    const resetBtn = document.getElementById('sim-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSimulation);
    }
    
    // Undo button
    const undoBtn = document.getElementById('sim-undo-btn');
    if (undoBtn) {
        undoBtn.addEventListener('click', undoLastTurn);
    }
    
    // Order selection buttons
    const orderMyBtn = document.getElementById('sim-order-my');
    const orderEnemyBtn = document.getElementById('sim-order-enemy');
    
    if (orderMyBtn) {
        orderMyBtn.addEventListener('click', () => executeSimulationTurn('my'));
    }
    if (orderEnemyBtn) {
        orderEnemyBtn.addEventListener('click', () => executeSimulationTurn('enemy'));
    }
    
    // Swap modal close
    const swapModal = document.getElementById('sim-swap-modal');
    if (swapModal) {
        const closeBtn = swapModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSimSwapModal);
        }
        swapModal.addEventListener('click', (e) => {
            if (e.target === swapModal) closeSimSwapModal();
        });
    }
    
    // Order modal - close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeOrderModal();
            closeSimSwapModal();
        }
    });
}

// ============================================
// INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    init();
    setupSimulationEventListeners();
});
