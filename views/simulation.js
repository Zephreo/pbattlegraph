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

    // Evaluate current state immediately for eval bar
    evaluateCurrentSimState(simState);

    // Use minimax to recommend best action
    updateActionRecommendations('my', simState);

    // In PvP mode, also run minimax for enemy team
    if (MINIMAX_CONFIG.pvpMode) {
        updateActionRecommendations('enemy', simState);
    }
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
    // Only show simple best-move highlight for enemy team in PvE mode; PvP mode uses minimax for both
    let bestMoveIndex = -1;
    let shouldHighlightSwap = false;
    if (team === 'enemy' && !MINIMAX_CONFIG.pvpMode) {
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
    const attacker = team === 'my'
        ? state.myTeam[simState.myActiveIndex]
        : state.enemyTeam[simState.enemyActiveIndex];
    const defender = team === 'my'
        ? state.enemyTeam[simState.enemyActiveIndex]
        : state.myTeam[simState.myActiveIndex];

    if (!attacker || !attacker.pokemon || !defender || !defender.pokemon) return;
    if (!action.move) return;

    const move = action.move;
    const attackerName = attacker.pokemon.name;
    const defenderName = defender.pokemon.name;

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

        const damage = calculateActualDamage(move, attacker.pokemon, defender.pokemon, {
            level: attacker.level,
            defenderLevel: defender.level,
            attackerTeraType: attacker.teraType,
            defenderTeraType: defender.teraType,
            attackerAbility: attacker.ability,
            defenderAbility: defender.ability,
            attackerItem: attacker.item,
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
        const abilityEffects = applyPostAttackAbilityEffects(move, attacker.ability, defender.ability);

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
        if (abilityBlocksEffect(defender.ability, move.effect)) {
            // Effect blocked by ability - don't apply
            return;
        }

        // Apply ability effects to effect chance (e.g., Serene Grace)
        const effectiveChance = applyAbilityToEffectChance(attacker.ability, move.effectChance);

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
    const teamHP = team === 'my' ? simState.myTeamHP : simState.enemyTeamHP;
    teamData.slice(0, BATTLE_TEAM_SIZE).forEach((slot, index) => {
        if (!slot || !slot.pokemon) return;
        if (index === currentIndex) return; // Can't swap to current

        // Skip fainted Pokemon
        const hpData = teamHP[index];
        const currentHP = hpData ? hpData.current : 0;
        if (currentHP <= 0) return;

        // Calculate matchup score against the opponent
        const matchupScore = opponentSlot && opponentSlot.pokemon
            ? calculateMatchupScore(slot, opponentSlot)
            : 50;

        swapOptions.push({ slot, index, matchupScore });
    });

    // Compute best swap using minimax evaluation (for my team always, for enemy in PvP mode)
    let minimaxSwapIndex = -1;
    const useMinimaxForTeam = team === 'my' || (team === 'enemy' && MINIMAX_CONFIG.pvpMode);
    if (useMinimaxForTeam) {
        // Check if we have a stored swap recommendation
        const recommendation = team === 'my' ? minimaxState.currentRecommendation : minimaxState.enemyRecommendation;
        if (recommendation && recommendation.type === 'swap') {
            const storedIndex = recommendation.swapIndex;
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
    }

    let html = '';
    swapOptions.forEach(option => {
        const { slot, index, matchupScore } = option;
        const pokemon = slot.pokemon;
        const typesHTML = pokemon.types.map(t =>
            `<span class="type-badge type-${t}">${t}</span>`
        ).join('');

        const isBest = index === bestIndex;
        const isMinimaxPick = useMinimaxForTeam && index === minimaxSwapIndex;
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

    // PvP mode toggle
    const pvpToggle = document.getElementById('sim-pvp-toggle');
    if (pvpToggle) {
        pvpToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            setPvPMode(enabled);

            // Update toggle UI
            const toggleContainer = document.querySelector('.sim-mode-toggle');
            if (toggleContainer) {
                toggleContainer.classList.toggle('pvp-mode', enabled);
            }

            // Re-render to apply new mode
            renderSimulationView();
        });
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
