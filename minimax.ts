// Pokemon Battle Planner - Minimax AI Engine
// Handles battle simulation AI, action recommendations, and game tree search

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Pokemon {
    id: string;
    name: string;
    types: string[];
    speed: number;
    moves?: string[];
    [key: string]: unknown;
}

interface Move {
    name: string;
    power: number;
    type: string;
    [key: string]: unknown;
}

interface Slot {
    pokemon: Pokemon | null;
    moves: (string | null)[];
    ability: string | null;
    teraType: string | null;
    item: string | null;
}

interface HPData {
    current: number;
    max: number;
}

interface ChargingState {
    move: Move;
    moveName: string;
}

interface SimCopy {
    mySlot: Slot | null;
    oppSlot: Slot | null;
    myHP: number;
    oppHP: number;
    myMaxHP: number;
    oppMaxHP: number;
    myTeam: Slot[];
    oppTeam: Slot[];
    myTeamHP: (HPData | null)[];
    oppTeamHP: (HPData | null)[];
    myActiveIndex: number;
    oppActiveIndex: number;
    myCharging: ChargingState | null;
    oppCharging: ChargingState | null;
    perspective: string;
}

interface MoveAction {
    type: 'move';
    move: Move;
    moveIndex: number;
    moveName: string;
}

interface SwapAction {
    type: 'swap';
    swapIndex: number;
    swapSlot?: Slot;
    pokemon?: Pokemon;
    ability?: string | null;
    item?: string | null;
    teraType?: string | null;
}

interface ChargingReleaseAction {
    type: 'charging_release';
    move: Move;
    moveName: string;
}

interface SkipAction {
    type: 'skip';
}

type Action = MoveAction | SwapAction | ChargingReleaseAction | SkipAction;

type ScoredAction = Action & {
    score: number;
    depth?: number;
};

interface DamageResult {
    avg: number;
    percentAvg: number;
    min: number;
    max: number;
    [key: string]: unknown;
}

interface DamageOptions {
    attackerTeraType?: string | null;
    defenderTeraType?: string | null;
    attackerAbility?: string | null;
    defenderAbility?: string | null;
    attackerItem?: string | null;
}

interface SimState {
    myActiveIndex: number;
    enemyActiveIndex: number;
    myCurrentHP: number;
    enemyCurrentHP: number;
    myMaxHP: number;
    enemyMaxHP: number;
    myTeamHP: (HPData | null)[];
    enemyTeamHP: (HPData | null)[];
    [key: string]: unknown;
}

interface SwapOption {
    slot: Slot;
    index: number;
    matchupScore: number;
}

interface MinimaxProgress {
    current: number;
    total: number;
    depth: number;
    maxDepth?: number;
}

interface CancellationToken {
    cancelled: boolean;
}

interface MinimaxStateType {
    activeCalculation: CancellationToken | null;
    isCalculating: boolean;
    myProgress: MinimaxProgress;
    currentRecommendation: ScoredAction | null;
    damageCache: Map<string, DamageResult>;
    transpositionTable: Map<string, number>;
}

interface AppState {
    myTeam: Slot[];
    enemyTeam: Slot[];
    [key: string]: unknown;
}

// ============================================
// EXTERNAL DECLARATIONS (from app.js and moves.js)
// ============================================

declare const state: AppState;
declare const BATTLE_TEAM_SIZE: number;
declare function calculateActualDamage(move: Move, attacker: Pokemon, defender: Pokemon, options?: DamageOptions): DamageResult;
declare function calculateMatchupScore(mySlot: Slot, oppSlot: Slot): number;
declare function getMoveByName(name: string): Move | null;
declare function moveHasEffect(move: Move, effectName: string): boolean;
declare function getMovePriority(move: Move): number;

// ============================================
// MINIMAX CONFIGURATION
// ============================================

const MINIMAX_CONFIG = {
    depth: 6,
    pruningEnabled: true,
    yieldInterval: 200,
    opponentGreedy: true,
    moveOrdering: true,
    filterBadMoves: true
} as const;

// Track active minimax calculation (only one at a time for my team)
const minimaxState: MinimaxStateType = {
    activeCalculation: null,
    isCalculating: false,
    myProgress: { current: 0, total: 0, depth: 0 },
    currentRecommendation: null,
    damageCache: new Map(),
    transpositionTable: new Map()
};

// ============================================
// CACHE MANAGEMENT
// ============================================

function clearDamageCache(): void {
    minimaxState.damageCache.clear();
    minimaxState.transpositionTable.clear();
}

function getCachedDamage(move: Move, attacker: Pokemon, defender: Pokemon, options: DamageOptions = {}): DamageResult {
    const key = `${move.name}-${attacker.id}-${defender.id}-${options.attackerTeraType || ''}-${options.defenderTeraType || ''}`;

    const cached = minimaxState.damageCache.get(key);
    if (cached) {
        return cached;
    }

    const damage = calculateActualDamage(move, attacker, defender, options);

    if (minimaxState.damageCache.size > 1000) {
        minimaxState.damageCache.clear();
    }

    minimaxState.damageCache.set(key, damage);
    return damage;
}

// ============================================
// STATE KEY GENERATION (for memoization)
// ============================================

function generateStateKey(simCopy: SimCopy, action: Action, depth: number, isMaximizing: boolean): string {
    const parts: (string | number)[] = [
        simCopy.mySlot?.pokemon?.id || 'none',
        simCopy.oppSlot?.pokemon?.id || 'none',
        simCopy.myActiveIndex,
        simCopy.oppActiveIndex,
        simCopy.myTeamHP.map(hp => Math.round(hp?.current ?? 0)).join(','),
        simCopy.oppTeamHP.map(hp => Math.round(hp?.current ?? 0)).join(','),
        simCopy.myCharging?.move?.name || '',
        simCopy.oppCharging?.move?.name || '',
        action.type,
        action.type === 'move' ? action.move?.name : (action.type === 'swap' ? action.swapIndex : ''),
        depth,
        isMaximizing ? 1 : 0
    ];
    return parts.join('|');
}

// ============================================
// ACTION ORDERING & EVALUATION
// ============================================

function orderActionsByValue(actions: Action[], simCopy: SimCopy): Action[] {
    return actions.map(action => {
        let priority = 0;

        if (action.type === 'move' && action.move) {
            if (action.move.power > 0) {
                priority = evaluateGreedyAction(simCopy, action, true);
            } else {
                priority = -10;
            }
        } else if (action.type === 'swap') {
            priority = 10;
        } else if (action.type === 'charging_release') {
            priority = 50;
        }

        return { action, priority };
    })
    .sort((a, b) => b.priority - a.priority)
    .map(item => item.action);
}

function evaluateGreedyAction(simCopy: SimCopy, action: Action, isMyAction: boolean): number {
    const attacker = isMyAction ? simCopy.mySlot : simCopy.oppSlot;
    const defender = isMyAction ? simCopy.oppSlot : simCopy.mySlot;

    if (action.type === 'move' && action.move) {
        const move = action.move;
        if (move.power > 0 && attacker?.pokemon && defender?.pokemon) {
            const damage = calculateActualDamage(move, attacker.pokemon, defender.pokemon, {
                attackerTeraType: attacker.teraType,
                defenderTeraType: defender.teraType,
                attackerAbility: attacker.ability,
                defenderAbility: defender.ability,
                attackerItem: attacker.item
            });

            if (isMyAction) {
                return damage.percentAvg;
            } else {
                return -damage.percentAvg;
            }
        }
        return 0;
    } else if (action.type === 'swap' && action.pokemon) {
        const newSlot: Slot = {
            pokemon: action.pokemon,
            moves: action.pokemon.moves || [],
            ability: action.ability || null,
            item: action.item || null,
            teraType: action.teraType || null
        };

        const bestDamage = getBestDamageToSlot(newSlot, defender);
        const currentBestDamage = getBestDamageToSlot(attacker, defender);
        const damageImprovement = bestDamage - currentBestDamage;

        if (isMyAction) {
            return damageImprovement * 0.8;
        } else {
            return -damageImprovement * 0.8;
        }
    }

    return 0;
}

function getGreedyOpponentAction(simCopy: SimCopy): Action | null {
    const oppActions = getAllPossibleActions(simCopy, false);

    if (oppActions.length === 0) return null;

    let bestOppAction: Action | null = null;
    let bestOppScore = Infinity;

    for (const oppAction of oppActions) {
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

function createSimStateCopy(simState: SimState, perspective: string): SimCopy {
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
        myCharging: null,
        oppCharging: null,
        perspective
    };
}

function getAllPossibleActions(simCopy: SimCopy, isMaximizing: boolean): Action[] {
    const actions: Action[] = [];
    const slot = isMaximizing ? simCopy.mySlot : simCopy.oppSlot;
    const currentHP = isMaximizing ? simCopy.myHP : simCopy.oppHP;
    const charging = isMaximizing ? simCopy.myCharging : simCopy.oppCharging;
    const team = isMaximizing ? simCopy.myTeam : simCopy.oppTeam;
    const teamHP = isMaximizing ? simCopy.myTeamHP : simCopy.oppTeamHP;
    const activeIndex = isMaximizing ? simCopy.myActiveIndex : simCopy.oppActiveIndex;

    const isFainted = currentHP <= 0;

    if (charging && !isFainted) {
        actions.push({ type: 'charging_release', move: charging.move, moveName: charging.moveName });
        return actions;
    }

    if (!isFainted && slot) {
        const moves = slot.moves || [];
        moves.forEach((moveName, moveIndex) => {
            if (!moveName) return;
            const move = getMoveByName(moveName);
            if (!move) return;
            actions.push({ type: 'move', move, moveIndex, moveName });
        });
    }

    team.slice(0, BATTLE_TEAM_SIZE).forEach((swapSlot, index) => {
        if (!swapSlot || !swapSlot.pokemon) return;
        if (index === activeIndex) return;

        const hpData = teamHP[index];
        if (hpData && hpData.current <= 0) return;

        actions.push({ type: 'swap', swapIndex: index, swapSlot });
    });

    if (actions.length === 0 && !isFainted) {
        actions.push({ type: 'skip' });
    }

    return actions;
}

function applyActionToState(simCopy: SimCopy, action: Action, isMyAction: boolean): SimCopy {
    const newState: SimCopy = {
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
        const swapSlot = action.swapSlot || (isMyAction ? simCopy.myTeam : simCopy.oppTeam)[action.swapIndex];
        const swapHP = (isMyAction ? newState.myTeamHP : newState.oppTeamHP)[action.swapIndex];

        if (isMyAction) {
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
            if (isMyAction) {
                newState.myCharging = { move, moveName: action.moveName };
                const oppBestDmg = getBestDamageToSlot(simCopy.oppSlot, simCopy.mySlot);
                const dmgAmount = Math.round(oppBestDmg * newState.myMaxHP / 100);
                newState.myHP = Math.max(0, newState.myHP - dmgAmount);
                const hpEntry = newState.myTeamHP[newState.myActiveIndex];
                if (hpEntry) {
                    hpEntry.current = newState.myHP;
                }
            } else {
                newState.oppCharging = { move, moveName: action.moveName };
                const myBestDmg = getBestDamageToSlot(simCopy.mySlot, simCopy.oppSlot);
                const dmgAmount = Math.round(myBestDmg * newState.oppMaxHP / 100);
                newState.oppHP = Math.max(0, newState.oppHP - dmgAmount);
                const hpEntry = newState.oppTeamHP[newState.oppActiveIndex];
                if (hpEntry) {
                    hpEntry.current = newState.oppHP;
                }
            }
            return newState;
        }

        return applyMoveDamage(newState, move, isMyAction);
    }

    if (action.type === 'charging_release') {
        if (isMyAction) {
            newState.myCharging = null;
        } else {
            newState.oppCharging = null;
        }
        return applyMoveDamage(newState, action.move, isMyAction);
    }

    return newState;
}

function applyMoveDamage(newState: SimCopy, move: Move, isMyAction: boolean): SimCopy {
    const attacker = isMyAction ? newState.mySlot : newState.oppSlot;
    const defender = isMyAction ? newState.oppSlot : newState.mySlot;

    if (!attacker?.pokemon || !defender?.pokemon) {
        return newState;
    }

    if (move.power <= 0) {
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
        const hpEntry = newState.oppTeamHP[newState.oppActiveIndex];
        if (hpEntry) {
            hpEntry.current = newState.oppHP;
        }
    } else {
        newState.myHP = Math.max(0, newState.myHP - damageAmount);
        const hpEntry = newState.myTeamHP[newState.myActiveIndex];
        if (hpEntry) {
            hpEntry.current = newState.myHP;
        }
    }

    return newState;
}

function getBestDamageToSlot(attackerSlot: Slot | null, defenderSlot: Slot | null): number {
    if (!attackerSlot?.pokemon || !defenderSlot?.pokemon) {
        return 0;
    }

    let bestDamage = 0;
    const moves = attackerSlot.moves || [];

    for (const moveName of moves) {
        if (!moveName) continue;
        const move = getMoveByName(moveName);
        if (!move || move.power <= 0) continue;

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

function applySimultaneousActions(simCopy: SimCopy, myAction: Action, oppAction: Action): SimCopy {
    let newState: SimCopy = {
        ...simCopy,
        myTeamHP: simCopy.myTeamHP.map(hp => hp ? {...hp} : null),
        oppTeamHP: simCopy.oppTeamHP.map(hp => hp ? {...hp} : null),
        myCharging: simCopy.myCharging ? {...simCopy.myCharging} : null,
        oppCharging: simCopy.oppCharging ? {...simCopy.oppCharging} : null
    };

    if (myAction.type === 'swap') {
        newState = applySwapAction(newState, myAction, true);
    }
    if (oppAction.type === 'swap') {
        newState = applySwapAction(newState, oppAction, false);
    }

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

    if (myFirst) {
        if (myAction.type === 'move' || myAction.type === 'charging_release') {
            newState = applyMoveActionSim(newState, myAction, true);
        }
        if (newState.oppHP > 0 && (oppAction.type === 'move' || oppAction.type === 'charging_release')) {
            newState = applyMoveActionSim(newState, oppAction, false);
        }
    } else {
        if (oppAction.type === 'move' || oppAction.type === 'charging_release') {
            newState = applyMoveActionSim(newState, oppAction, false);
        }
        if (newState.myHP > 0 && (myAction.type === 'move' || myAction.type === 'charging_release')) {
            newState = applyMoveActionSim(newState, myAction, true);
        }
    }

    newState = handleFaintSwapsSim(newState);

    return newState;
}

function getSimMovePriority(action: Action): number {
    if (!action || action.type === 'swap' || action.type === 'skip') return -1;
    if (action.type === 'move' || action.type === 'charging_release') {
        return getMovePriority(action.move);
    }
    return 0;
}

function applySwapAction(simCopy: SimCopy, action: SwapAction, isMyAction: boolean): SimCopy {
    const newState: SimCopy = {
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
        newState.myCharging = null;
    } else {
        newState.oppSlot = swapSlot;
        newState.oppHP = swapHP ? swapHP.current : 0;
        newState.oppMaxHP = swapHP ? swapHP.max : 100;
        newState.oppActiveIndex = action.swapIndex;
        newState.oppCharging = null;
    }

    return newState;
}

function applyMoveActionSim(simCopy: SimCopy, action: MoveAction | ChargingReleaseAction, isMyAction: boolean): SimCopy {
    const newState: SimCopy = {
        ...simCopy,
        myTeamHP: simCopy.myTeamHP.map(hp => hp ? {...hp} : null),
        oppTeamHP: simCopy.oppTeamHP.map(hp => hp ? {...hp} : null),
        myCharging: simCopy.myCharging ? {...simCopy.myCharging} : null,
        oppCharging: simCopy.oppCharging ? {...simCopy.oppCharging} : null
    };

    const move = action.move;
    if (!move) return newState;

    if (action.type === 'charging_release') {
        if (isMyAction) {
            newState.myCharging = null;
        } else {
            newState.oppCharging = null;
        }
        return applyMoveDamage(newState, move, isMyAction);
    }

    const isTwoTurn = moveHasEffect(move, 'two_turn_move');
    if (isTwoTurn) {
        if (isMyAction) {
            newState.myCharging = { move, moveName: action.moveName };
        } else {
            newState.oppCharging = { move, moveName: action.moveName };
        }
        return newState;
    }

    return applyMoveDamage(newState, move, isMyAction);
}

function handleFaintSwapsSim(simCopy: SimCopy): SimCopy {
    const newState = { ...simCopy };

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

function getBestSwapForSim(simCopy: SimCopy, isMyTeam: boolean): number {
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

function isGameOver(simCopy: SimCopy): boolean {
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

function evaluateState(simCopy: SimCopy): number {
    let score = 0;

    const myHPPercent = simCopy.myMaxHP > 0 ? (simCopy.myHP / simCopy.myMaxHP) * 100 : 0;
    const oppHPPercent = simCopy.oppMaxHP > 0 ? (simCopy.oppHP / simCopy.oppMaxHP) * 100 : 0;
    score += (myHPPercent - oppHPPercent) * 2;

    if (simCopy.oppHP <= 0) score += 100;
    if (simCopy.myHP <= 0) score -= 100;

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

    if (simCopy.mySlot && simCopy.oppSlot && simCopy.mySlot.pokemon && simCopy.oppSlot.pokemon) {
        const matchup = calculateMatchupScore(simCopy.mySlot, simCopy.oppSlot);
        score += (matchup - 50) * 0.3;
    }

    if (simCopy.myCharging) score -= 20;
    if (simCopy.oppCharging) score += 20;

    return score;
}

// ============================================
// MINIMAX ALGORITHMS
// ============================================

function estimateNodes(branchingFactor: number, depth: number): number {
    let nodes = 0;

    if (MINIMAX_CONFIG.opponentGreedy) {
        let factor = branchingFactor;
        for (let d = 0; d < depth; d++) {
            nodes += Math.pow(factor, d + 1);
            factor = Math.max(2, factor * 0.8);
        }
    } else {
        let factor = branchingFactor;
        for (let d = 0; d < depth; d++) {
            nodes += Math.pow(factor, d + 1);
            factor = Math.max(2, factor * 0.7);
        }
    }

    return Math.min(nodes, 100000);
}

async function getMinimaxRecommendationAsync(team: string, simState: SimState, maxDepth: number = MINIMAX_CONFIG.depth): Promise<ScoredAction | null> {
    const simCopy = createSimStateCopy(simState, team);

    if (!simCopy.mySlot?.pokemon || !simCopy.oppSlot?.pokemon) {
        return null;
    }

    minimaxState.isCalculating = true;

    let bestAction: ScoredAction | null = null;

    for (let depth = 1; depth <= maxDepth; depth++) {
        minimaxState.myProgress = { current: 0, total: 0, depth, maxDepth };

        const actions = getAllPossibleActions(simCopy, true);
        minimaxState.myProgress.total = estimateNodes(actions.length, depth);

        updateMinimaxProgress('my');

        let depthBestAction: ScoredAction | null = null;
        let depthBestScore = -Infinity;

        const orderedActions = MINIMAX_CONFIG.moveOrdering
            ? orderActionsByValue(actions, simCopy)
            : actions;

        for (const action of orderedActions) {
            let score = await minimaxAsync(simCopy, action, depth - 1, -Infinity, Infinity, false);

            if (action.type === 'move' && action.move && action.move.power > 0) {
                const immediateDamage = evaluateGreedyAction(simCopy, action, true);
                score += immediateDamage * 0.001;
            }

            if (score > depthBestScore) {
                depthBestScore = score;
                depthBestAction = { ...action, score, depth } as ScoredAction;
            }
        }

        if (depthBestAction) {
            bestAction = depthBestAction;
            showIntermediateRecommendation(team, bestAction, depth, maxDepth);
        }

        await new Promise(resolve => setTimeout(resolve, 0));
    }

    minimaxState.isCalculating = false;
    minimaxState.myProgress = { current: 0, total: 0, depth: 0 };
    updateMinimaxProgress('my');

    return bestAction;
}

async function minimaxAsync(simCopy: SimCopy, myAction: Action, depth: number, alpha: number, beta: number, isMaximizing: boolean): Promise<number> {
    minimaxState.myProgress.current++;

    if (minimaxState.myProgress.current % MINIMAX_CONFIG.yieldInterval === 0) {
        updateMinimaxProgress('my');
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    const stateKey = generateStateKey(simCopy, myAction, depth, isMaximizing);
    const cached = minimaxState.transpositionTable.get(stateKey);
    if (cached !== undefined) {
        return cached;
    }

    if (minimaxState.transpositionTable.size > 100000) {
        minimaxState.transpositionTable.clear();
    }

    let result: number;

    if (MINIMAX_CONFIG.opponentGreedy) {
        const oppAction = getGreedyOpponentAction(simCopy);

        if (!oppAction) {
            const newState = applyActionToState(simCopy, myAction, true);
            result = evaluateState(newState);
            minimaxState.transpositionTable.set(stateKey, result);
            return result;
        }

        const newState = applySimultaneousActions(simCopy, myAction, oppAction);

        if (depth === 0 || isGameOver(newState)) {
            result = evaluateState(newState);
            minimaxState.transpositionTable.set(stateKey, result);
            return result;
        }

        const myActions = getAllPossibleActions(newState, true);
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

    minimaxState.transpositionTable.set(stateKey, result);
    return result;
}

function getMinimaxRecommendation(team: string, simState: SimState, depth: number = 1): ScoredAction | null {
    const simCopy = createSimStateCopy(simState, team);

    if (!simCopy.mySlot?.pokemon || !simCopy.oppSlot?.pokemon) {
        return null;
    }

    let bestAction: ScoredAction | null = null;
    let bestScore = -Infinity;

    const actions = getAllPossibleActions(simCopy, true);

    for (const action of actions) {
        let score = minimax(simCopy, action, depth - 1, -Infinity, Infinity, false);

        if (action.type === 'move' && action.move && action.move.power > 0) {
            const immediateDamage = evaluateGreedyAction(simCopy, action, true);
            score += immediateDamage * 0.001;
        }

        if (score > bestScore) {
            bestScore = score;
            bestAction = { ...action, score } as ScoredAction;
        }
    }

    return bestAction;
}

function minimax(simCopy: SimCopy, myAction: Action, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    const stateKey = generateStateKey(simCopy, myAction, depth, isMaximizing);
    const cached = minimaxState.transpositionTable.get(stateKey);
    if (cached !== undefined) {
        return cached;
    }

    if (minimaxState.transpositionTable.size > 100000) {
        minimaxState.transpositionTable.clear();
    }

    let result: number;

    if (MINIMAX_CONFIG.opponentGreedy) {
        const oppAction = getGreedyOpponentAction(simCopy);

        if (!oppAction) {
            const newState = applyActionToState(simCopy, myAction, true);
            result = evaluateState(newState);
            minimaxState.transpositionTable.set(stateKey, result);
            return result;
        }

        const newState = applySimultaneousActions(simCopy, myAction, oppAction);

        if (depth === 0 || isGameOver(newState)) {
            result = evaluateState(newState);
            minimaxState.transpositionTable.set(stateKey, result);
            return result;
        }

        const myActions = getAllPossibleActions(newState, true);
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

    minimaxState.transpositionTable.set(stateKey, result);
    return result;
}

// ============================================
// UI INTEGRATION
// ============================================

function showIntermediateRecommendation(team: string, action: ScoredAction, currentDepth: number, maxDepth: number): void {
    if (team === 'my') {
        minimaxState.currentRecommendation = action;
        // Update evaluation bar with the score
        if (action.score !== undefined) {
            updateEvalBar(action.score);
        }
    }

    document.querySelectorAll<HTMLElement>(`.sim-move-btn[data-team="${team}"]`).forEach(btn => {
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
        const moveBtn = document.querySelector<HTMLElement>(
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

function updateMinimaxProgress(team: string): void {
    const progressEl = document.getElementById(`sim-${team}-progress`);

    if (!progressEl) return;

    if (team === 'enemy') {
        progressEl.style.display = 'none';
        return;
    }

    const progress = minimaxState.myProgress;

    if (!minimaxState.isCalculating) {
        progressEl.style.display = 'none';
        return;
    }

    progressEl.style.display = 'block';
    const percent = Math.min(100, (progress.current / progress.total) * 100);
    const bar = progressEl.querySelector<HTMLElement>('.progress-fill');
    const text = progressEl.querySelector<HTMLElement>('.progress-text');

    if (bar) bar.style.width = `${percent}%`;

    const remaining = Math.max(0, progress.total - progress.current);
    const formattedRemaining = remaining >= 1000
        ? `${(remaining / 1000).toFixed(1)}k`
        : remaining.toString();
    if (text) text.textContent = `Depth ${progress.depth}/${progress.maxDepth} • ${formattedRemaining} nodes`;
}

function evaluateCurrentSimState(simState: SimState): void {
    const simCopy = createSimStateCopy(simState, 'my');
    if (!simCopy.mySlot?.pokemon || !simCopy.oppSlot?.pokemon) {
        updateEvalBar(0);
        return;
    }
    const score = evaluateState(simCopy);
    updateEvalBar(score);
}

function updateEvalBar(score: number): void {
    const evalBar = document.getElementById('sim-eval-bar');
    const evalBarEnemy = document.getElementById('eval-bar-enemy');
    const evalBarMy = document.getElementById('eval-bar-my');
    const evalBarScore = document.getElementById('eval-bar-score');

    if (!evalBar || !evalBarEnemy || !evalBarMy || !evalBarScore) return;

    // Normalize score to a percentage (0-100)
    // Score typically ranges from about -300 to +300
    // Use sigmoid-like function for smooth scaling
    const maxScore = 200; // Score at which bar is nearly full
    const normalizedScore = Math.max(-maxScore, Math.min(maxScore, score));

    // Convert to percentage (50% = even, 100% = winning completely)
    const myPercent = 50 + (normalizedScore / maxScore) * 50;
    const enemyPercent = 100 - myPercent;

    evalBarEnemy.style.height = `${enemyPercent}%`;
    evalBarMy.style.height = `${myPercent}%`;

    // Enable animations after first update
    if (!evalBar.classList.contains('animated')) {
        requestAnimationFrame(() => {
            evalBar.classList.add('animated');
        });
    }

    // Format score display
    const displayScore = (score / 100).toFixed(1);
    const prefix = score > 0 ? '+' : '';
    evalBarScore.textContent = `${prefix}${displayScore}`;

    // Update score color class
    evalBarScore.classList.remove('winning', 'losing', 'even');
    if (score > 10) {
        evalBarScore.classList.add('winning');
    } else if (score < -10) {
        evalBarScore.classList.add('losing');
    } else {
        evalBarScore.classList.add('even');
    }
}

function updateActionRecommendations(team: string, simState: SimState): void {
    if (team !== 'my') return;

    if (minimaxState.activeCalculation) {
        minimaxState.activeCalculation.cancelled = true;
    }

    const quickRec = getMinimaxRecommendation(team, simState, 1);
    if (quickRec) {
        showIntermediateRecommendation(team, quickRec, 1, MINIMAX_CONFIG.depth);
    }

    const calcToken: CancellationToken = { cancelled: false };
    minimaxState.activeCalculation = calcToken;

    getMinimaxRecommendationAsync(team, simState, MINIMAX_CONFIG.depth).then(recommendation => {
        if (calcToken.cancelled) return;

        document.querySelectorAll<HTMLElement>(`.sim-move-btn[data-team="${team}"]`).forEach(btn => {
            btn.classList.remove('calculating');
        });
        const swapBtn = document.getElementById(`sim-${team}-swap-btn`);
        if (swapBtn) {
            swapBtn.classList.remove('calculating');
        }

        if (!recommendation) return;

        showIntermediateRecommendation(team, recommendation, MINIMAX_CONFIG.depth, MINIMAX_CONFIG.depth);
    });
}

function computeBestSwapIndex(simState: SimState, swapOptions: SwapOption[]): number {
    if (!swapOptions || swapOptions.length === 0) return -1;

    const simCopy = createSimStateCopy(simState, 'my');
    if (!simCopy.oppSlot?.pokemon) {
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

    let bestSwapIndex = -1;
    let bestScore = -Infinity;

    for (const option of swapOptions) {
        const { slot, index } = option;

        const hpData = simCopy.myTeamHP[index];
        if (!hpData || hpData.current <= 0) continue;

        const swapAction: SwapAction = { type: 'swap', swapIndex: index, swapSlot: slot };

        const score = minimax(simCopy, swapAction, 1, -Infinity, Infinity, false);

        if (score > bestScore) {
            bestScore = score;
            bestSwapIndex = index;
        }
    }

    return bestSwapIndex;
}
