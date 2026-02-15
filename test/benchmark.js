// Minimax Algorithm Benchmark Tests
// Run in browser console after loading the app with Pokemon in simulation view

/**
 * Benchmark the minimax algorithm at different depths
 * Call from browser console: benchmarkMinimax()
 */
async function benchmarkMinimax(maxDepth = 8) {
    if (typeof simState === 'undefined' || !simState) {
        console.error('No simulation state found. Please set up a battle in the Simulation view first.');
        return null;
    }

    const simCopy = createSimStateCopy(simState, 'my');
    if (!simCopy.mySlot?.pokemon || !simCopy.oppSlot?.pokemon) {
        console.error('Both Pokemon must be set up in simulation. Add Pokemon to both sides first.');
        return null;
    }

    console.log('='.repeat(60));
    console.log('MINIMAX BENCHMARK');
    console.log('='.repeat(60));
    console.log(`My Pokemon: ${simCopy.mySlot.pokemon.name}`);
    console.log(`Opponent: ${simCopy.oppSlot.pokemon.name}`);
    console.log(`Config: pruning=${MINIMAX_CONFIG.pruningEnabled}, greedy=${MINIMAX_CONFIG.opponentGreedy}, moveOrdering=${MINIMAX_CONFIG.moveOrdering}`);
    console.log('='.repeat(60));

    const results = [];

    for (let depth = 1; depth <= maxDepth; depth++) {
        // Clear caches for fair comparison
        clearDamageCache();

        const actions = getAllPossibleActions(simCopy, true);
        const startTime = performance.now();
        let nodesEvaluated = 0;
        let cacheHits = 0;
        let bestAction = null;
        let bestScore = -Infinity;

        // Track nodes manually
        const originalTranspositionSize = minimaxState.transpositionTable.size;

        for (const action of actions) {
            const score = minimax(simCopy, action, depth - 1, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestAction = action;
            }
        }

        const endTime = performance.now();
        const duration = endTime - startTime;
        const transpositionEntries = minimaxState.transpositionTable.size - originalTranspositionSize;

        const result = {
            depth,
            timeMs: duration.toFixed(2),
            nodesPerSec: transpositionEntries > 0 ? Math.round(transpositionEntries / (duration / 1000)) : 'N/A',
            cacheEntries: minimaxState.transpositionTable.size,
            nodesEvaluated: minimaxState.myProgress.current,
            bestMove: bestAction?.type === 'move' ? bestAction.moveName : bestAction?.type,
            score: bestScore.toFixed(2)
        };

        results.push(result);

        console.log(`Depth ${depth}: ${duration.toFixed(2)}ms | Best: ${result.bestMove} (${result.score}) | Cache: ${result.cacheEntries} | Nodes: ${result.nodesEvaluated}`);

        // Stop if taking too long
        if (duration > 10000) {
            console.log('Stopping benchmark - exceeded 10 second threshold');
            break;
        }
    }

    console.log('='.repeat(60));
    console.log('RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.table(results);

    return results;
}

/**
 * Benchmark async version with progress tracking
 */
async function benchmarkMinimaxAsync(maxDepth = 6) {
    if (typeof simState === 'undefined' || !simState) {
        console.error('No simulation state found. Please set up a battle in the Simulation view first.');
        return null;
    }

    const simCopy = createSimStateCopy(simState, 'my');
    if (!simCopy.mySlot?.pokemon || !simCopy.oppSlot?.pokemon) {
        console.error('Both Pokemon must be set up in simulation.');
        return null;
    }

    console.log('='.repeat(60));
    console.log('MINIMAX ASYNC BENCHMARK');
    console.log('='.repeat(60));
    console.log(`My Pokemon: ${simCopy.mySlot.pokemon.name}`);
    console.log(`Opponent: ${simCopy.oppSlot.pokemon.name}`);
    console.log('='.repeat(60));

    // Clear caches
    clearDamageCache();

    const startTime = performance.now();
    const recommendation = await getMinimaxRecommendationAsync('my', simState, maxDepth);
    const endTime = performance.now();

    const duration = endTime - startTime;

    console.log('='.repeat(60));
    console.log('ASYNC RESULT');
    console.log('='.repeat(60));
    console.log(`Total time: ${duration.toFixed(2)}ms`);
    console.log(`Best action: ${recommendation?.type === 'move' ? recommendation.moveName : recommendation?.type}`);
    console.log(`Score: ${recommendation?.score?.toFixed(2)}`);
    console.log(`Final depth: ${recommendation?.depth}`);
    console.log(`Nodes evaluated: ${recommendation?.nodesEvaluated ?? 0}`);
    console.log(`Cache entries: ${minimaxState.transpositionTable.size}`);
    console.log(`Damage cache: ${minimaxState.damageCache.size}`);

    return {
        timeMs: duration.toFixed(2),
        bestMove: recommendation?.type === 'move' ? recommendation.moveName : recommendation?.type,
        score: recommendation?.score,
        depth: recommendation?.depth,
        nodesEvaluated: recommendation?.nodesEvaluated ?? 0,
        cacheEntries: minimaxState.transpositionTable.size,
        damageCacheEntries: minimaxState.damageCache.size
    };
}

/**
 * Compare performance with different config options
 */
async function benchmarkConfigComparison() {
    if (typeof simState === 'undefined' || !simState) {
        console.error('No simulation state found.');
        return null;
    }

    const depth = 4;
    const configs = [
        { name: 'Full optimizations', pruning: true, greedy: true, moveOrdering: true },
        { name: 'No pruning', pruning: false, greedy: true, moveOrdering: true },
        { name: 'No move ordering', pruning: true, greedy: true, moveOrdering: false },
        { name: 'No greedy opponent', pruning: true, greedy: false, moveOrdering: true },
        { name: 'Baseline (no opts)', pruning: false, greedy: false, moveOrdering: false }
    ];

    console.log('='.repeat(60));
    console.log('CONFIG COMPARISON BENCHMARK (Depth ' + depth + ')');
    console.log('='.repeat(60));

    const results = [];

    for (const config of configs) {
        // Save original config
        const originalPruning = MINIMAX_CONFIG.pruningEnabled;
        const originalGreedy = MINIMAX_CONFIG.opponentGreedy;
        const originalMoveOrdering = MINIMAX_CONFIG.moveOrdering;

        // Apply test config
        MINIMAX_CONFIG.pruningEnabled = config.pruning;
        MINIMAX_CONFIG.opponentGreedy = config.greedy;
        MINIMAX_CONFIG.moveOrdering = config.moveOrdering;

        // Clear caches
        clearDamageCache();

        const simCopy = createSimStateCopy(simState, 'my');
        const actions = getAllPossibleActions(simCopy, true);

        const startTime = performance.now();
        let bestAction = null;
        let bestScore = -Infinity;

        for (const action of actions) {
            const score = minimax(simCopy, action, depth - 1, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestAction = action;
            }
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        results.push({
            config: config.name,
            timeMs: duration.toFixed(2),
            cacheEntries: minimaxState.transpositionTable.size,
            bestMove: bestAction?.type === 'move' ? bestAction.moveName : bestAction?.type,
            score: bestScore.toFixed(2)
        });

        console.log(`${config.name}: ${duration.toFixed(2)}ms`);

        // Restore original config
        MINIMAX_CONFIG.pruningEnabled = originalPruning;
        MINIMAX_CONFIG.opponentGreedy = originalGreedy;
        MINIMAX_CONFIG.moveOrdering = originalMoveOrdering;

        // Stop if baseline takes too long
        if (duration > 30000) {
            console.log('Stopping - baseline too slow');
            break;
        }
    }

    console.log('='.repeat(60));
    console.table(results);

    return results;
}

/**
 * Quick performance check - single depth
 */
function quickBenchmark(depth = 4) {
    if (typeof simState === 'undefined' || !simState) {
        console.error('No simulation state found.');
        return null;
    }

    clearDamageCache();
    const simCopy = createSimStateCopy(simState, 'my');

    if (!simCopy.mySlot?.pokemon || !simCopy.oppSlot?.pokemon) {
        console.error('Both Pokemon must be set up.');
        return null;
    }

    const actions = getAllPossibleActions(simCopy, true);
    const startTime = performance.now();

    let bestAction = null;
    let bestScore = -Infinity;

    for (const action of actions) {
        const score = minimax(simCopy, action, depth - 1, -Infinity, Infinity, false);
        if (score > bestScore) {
            bestScore = score;
            bestAction = action;
        }
    }

    const duration = performance.now() - startTime;

    console.log(`Depth ${depth}: ${duration.toFixed(2)}ms | ${bestAction?.type === 'move' ? bestAction.moveName : bestAction?.type} (${bestScore.toFixed(2)})`);

    return { depth, timeMs: duration, bestAction, bestScore };
}

// Make functions globally available
window.benchmarkMinimax = benchmarkMinimax;
window.benchmarkMinimaxAsync = benchmarkMinimaxAsync;
window.benchmarkConfigComparison = benchmarkConfigComparison;
window.quickBenchmark = quickBenchmark;

console.log('Minimax benchmark loaded. Available functions:');
console.log('  benchmarkMinimax(maxDepth)     - Test sync algorithm at increasing depths');
console.log('  benchmarkMinimaxAsync(depth)   - Test async algorithm with progress');
console.log('  benchmarkConfigComparison()    - Compare different optimization settings');
console.log('  quickBenchmark(depth)          - Quick single-depth test');
