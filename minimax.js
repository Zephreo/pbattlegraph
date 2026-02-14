// Pokemon Battle Planner - Minimax AI Engine
// Handles battle simulation AI, action recommendations, and game tree search

// ============================================
// MINIMAX CONFIGURATION
// ============================================

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

// ============================================
// CACHE MANAGEMENT
// ============================================

// Clear damage cache when state changes significantly
function clearDamageCache() {
    minimaxState.damageCache.clear();
    minimaxState.transpositionTable.clear();
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

// ============================================
// STATE KEY GENERATION (for memoization)
// ============================================

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

// ============================================
// ACTION ORDERING & EVALUATION
// ============================================

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

// ============================================
// STATE SIMULATION
// ============================================

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

// ============================================
// GAME STATE EVALUATION
// ============================================

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

// ============================================
// MINIMAX ALGORITHMS
// ============================================

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

// ============================================
// UI INTEGRATION
// ============================================

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
