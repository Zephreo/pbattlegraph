// Pokemon Abilities Data

const ABILITIES_DATA = [
    // Type Immunities
    { name: "Levitate", effect: "immune", immuneType: "ground", description: "Immune to Ground-type moves" },
    { name: "Flash Fire", effect: "immune", immuneType: "fire", description: "Immune to Fire, boosts own Fire moves" },
    { name: "Water Absorb", effect: "immune", immuneType: "water", description: "Immune to Water-type moves" },
    { name: "Volt Absorb", effect: "immune", immuneType: "electric", description: "Immune to Electric-type moves" },
    { name: "Lightning Rod", effect: "immune", immuneType: "electric", description: "Immune to Electric-type moves" },
    { name: "Motor Drive", effect: "immune", immuneType: "electric", description: "Immune to Electric-type moves" },
    { name: "Storm Drain", effect: "immune", immuneType: "water", description: "Immune to Water-type moves" },
    { name: "Sap Sipper", effect: "immune", immuneType: "grass", description: "Immune to Grass-type moves" },
    { name: "Dry Skin", effect: "immune", immuneType: "water", description: "Immune to Water, weak to Fire (1.25x)" },
    { name: "Earth Eater", effect: "immune", immuneType: "ground", description: "Immune to Ground-type moves" },
    { name: "Well-Baked Body", effect: "immune", immuneType: "fire", description: "Immune to Fire-type moves" },
    { name: "Wind Rider", effect: "immune", immuneType: "flying", description: "Immune to wind moves" },
    
    // Wonder Guard - special case
    { name: "Wonder Guard", effect: "wonderguard", description: "Only super-effective moves can hit" },
    
    // Damage Reduction
    { name: "Thick Fat", effect: "resist", resistTypes: ["fire", "ice"], multiplier: 0.5, description: "Halves Fire and Ice damage" },
    { name: "Heatproof", effect: "resist", resistTypes: ["fire"], multiplier: 0.5, description: "Halves Fire damage" },
    { name: "Water Bubble", effect: "resist", resistTypes: ["fire"], multiplier: 0.5, description: "Halves Fire damage" },
    { name: "Purifying Salt", effect: "resist", resistTypes: ["ghost"], multiplier: 0.5, description: "Halves Ghost damage" },
    { name: "Filter", effect: "supereffective_reduce", multiplier: 0.75, description: "Reduces super-effective damage by 25%" },
    { name: "Solid Rock", effect: "supereffective_reduce", multiplier: 0.75, description: "Reduces super-effective damage by 25%" },
    { name: "Prism Armor", effect: "supereffective_reduce", multiplier: 0.75, description: "Reduces super-effective damage by 25%" },
    { name: "Fluffy", effect: "fluffy", description: "Halves contact damage, doubles Fire damage" },
    { name: "Ice Scales", effect: "resist_special", multiplier: 0.5, description: "Halves special move damage" },
    { name: "Fur Coat", effect: "resist_physical", multiplier: 0.5, description: "Halves physical move damage" },
    { name: "Multiscale", effect: "fullhp_reduce", multiplier: 0.5, description: "Halves damage at full HP" },
    { name: "Shadow Shield", effect: "fullhp_reduce", multiplier: 0.5, description: "Halves damage at full HP" },
    
    // Damage Increase (weaknesses)
    { name: "Fluffy", effect: "weak", weakTypes: ["fire"], multiplier: 2, description: "Takes double Fire damage" },
    { name: "Dry Skin", effect: "weak", weakTypes: ["fire"], multiplier: 1.25, description: "Takes 1.25x Fire damage" },
    
    // Offensive Abilities
    { name: "Adaptability", effect: "stab_boost", multiplier: 2, description: "STAB is 2x instead of 1.5x" },
    { name: "Aerilate", effect: "type_change", fromType: "normal", toType: "flying", description: "Normal moves become Flying" },
    { name: "Pixilate", effect: "type_change", fromType: "normal", toType: "fairy", description: "Normal moves become Fairy" },
    { name: "Refrigerate", effect: "type_change", fromType: "normal", toType: "ice", description: "Normal moves become Ice" },
    { name: "Galvanize", effect: "type_change", fromType: "normal", toType: "electric", description: "Normal moves become Electric" },
    { name: "Normalize", effect: "type_change", fromType: "all", toType: "normal", description: "All moves become Normal" },
    { name: "Liquid Voice", effect: "type_change", fromType: "sound", toType: "water", description: "Sound moves become Water" },
    { name: "Steelworker", effect: "type_boost", boostType: "steel", multiplier: 1.5, description: "Steel moves deal 1.5x damage" },
    { name: "Dragon's Maw", effect: "type_boost", boostType: "dragon", multiplier: 1.5, description: "Dragon moves deal 1.5x damage" },
    { name: "Transistor", effect: "type_boost", boostType: "electric", multiplier: 1.5, description: "Electric moves deal 1.5x damage" },
    { name: "Rocky Payload", effect: "type_boost", boostType: "rock", multiplier: 1.5, description: "Rock moves deal 1.5x damage" },
    { name: "Punk Rock", effect: "type_boost", boostType: "sound", multiplier: 1.3, description: "Sound moves deal 1.3x damage" },
    { name: "Iron Fist", effect: "category_boost", boostCategory: "punch", multiplier: 1.2, description: "Punching moves deal 1.2x damage" },
    { name: "Strong Jaw", effect: "category_boost", boostCategory: "bite", multiplier: 1.5, description: "Biting moves deal 1.5x damage" },
    { name: "Mega Launcher", effect: "category_boost", boostCategory: "pulse", multiplier: 1.5, description: "Pulse/aura moves deal 1.5x damage" },
    { name: "Sharpness", effect: "category_boost", boostCategory: "slicing", multiplier: 1.5, description: "Slicing moves deal 1.5x damage" },
    { name: "Reckless", effect: "category_boost", boostCategory: "recoil", multiplier: 1.2, description: "Recoil moves deal 1.2x damage" },
    { name: "Technician", effect: "weak_move_boost", threshold: 60, multiplier: 1.5, description: "Moves with ≤60 power deal 1.5x damage" },
    { name: "Tinted Lens", effect: "nve_boost", multiplier: 2, description: "Not very effective moves deal 2x damage" },
    { name: "Scrappy", effect: "scrappy", description: "Normal/Fighting moves can hit Ghost types" },
    
    // Stat/General Abilities (simplified for display)
    { name: "Huge Power", effect: "stat_boost", description: "Doubles Attack stat" },
    { name: "Pure Power", effect: "stat_boost", description: "Doubles Attack stat" },
    { name: "Gorilla Tactics", effect: "stat_boost", description: "1.5x Attack, locked into one move" },
    { name: "Hustle", effect: "stat_boost", description: "1.5x Attack, 0.8x Accuracy" },
    { name: "Guts", effect: "stat_boost", description: "1.5x Attack when statused" },
    { name: "Justified", effect: "stat_boost", description: "Raises Attack when hit by Dark-type move" },
    { name: "Protean", effect: "protean", description: "Changes type to match move used" },
    { name: "Libero", effect: "protean", description: "Changes type to match move used" },
    { name: "Intimidate", effect: "stat_lower", description: "Lowers opponent's Attack" },
    { name: "Mold Breaker", effect: "mold_breaker", description: "Ignores target's ability" },
    { name: "Teravolt", effect: "mold_breaker", description: "Ignores target's ability" },
    { name: "Turboblaze", effect: "mold_breaker", description: "Ignores target's ability" },
    { name: "Neutralizing Gas", effect: "neutralize", description: "Suppresses all abilities" },
    
    // No effect (for common abilities)
    { name: "None", effect: "none", description: "No ability" },
    { name: "Overgrow", effect: "none", description: "Boosts Grass moves when HP is low" },
    { name: "Blaze", effect: "none", description: "Boosts Fire moves when HP is low" },
    { name: "Torrent", effect: "none", description: "Boosts Water moves when HP is low" },
    { name: "Swarm", effect: "none", description: "Boosts Bug moves when HP is low" },
    { name: "Intimidate", effect: "none", description: "Lowers opponent Attack on switch-in" },
    { name: "Shed Skin", effect: "none", description: "May heal status conditions" },
    { name: "Natural Cure", effect: "none", description: "Heals status on switch-out" },
    { name: "Poison Point", effect: "none", description: "May poison on contact" },
    { name: "Static", effect: "none", description: "May paralyze on contact" },
    { name: "Flame Body", effect: "none", description: "May burn on contact" },
    { name: "Synchronize", effect: "none", description: "Passes status to attacker" },
    { name: "Clear Body", effect: "none", description: "Prevents stat drops" },
    { name: "White Smoke", effect: "none", description: "Prevents stat drops" },
    { name: "Pressure", effect: "none", description: "Opponent uses extra PP" },
    { name: "Speed Boost", effect: "none", description: "Raises Speed each turn" },
    { name: "Drought", effect: "none", description: "Summons harsh sunlight" },
    { name: "Drizzle", effect: "none", description: "Summons rain" },
    { name: "Sand Stream", effect: "none", description: "Summons sandstorm" },
    { name: "Snow Warning", effect: "none", description: "Summons snow/hail" },
    { name: "Swift Swim", effect: "none", description: "Doubles Speed in rain" },
    { name: "Chlorophyll", effect: "none", description: "Doubles Speed in sun" },
    { name: "Sand Rush", effect: "none", description: "Doubles Speed in sand" },
    { name: "Slush Rush", effect: "none", description: "Doubles Speed in snow" },
    { name: "Magic Guard", effect: "none", description: "Only takes direct damage" },
    { name: "Magic Bounce", effect: "none", description: "Reflects status moves" },
    { name: "Unaware", effect: "none", description: "Ignores stat changes" },
    { name: "Contrary", effect: "none", description: "Stat changes are reversed" },
    { name: "Regenerator", effect: "none", description: "Heals 1/3 HP on switch-out" },
    { name: "Serene Grace", effect: "serene_grace", description: "Doubles secondary effect chances" },
    { name: "Inner Focus", effect: "flinch_immune", description: "Prevents flinching" },
    { name: "Marvel Scale", effect: "marvel_scale", multiplier: 1.5, description: "1.5x Defense when statused" },
    { name: "Rough Skin", effect: "contact_recoil", damage: 1/8, description: "Contact attackers take 1/8 HP damage" },
    { name: "Iron Barbs", effect: "contact_recoil", damage: 1/8, description: "Contact attackers take 1/8 HP damage" }
];

// Get ability by name
function getAbilityByName(name) {
    if (!name) return null;
    const lowerName = name.toLowerCase();
    return ABILITIES_DATA.find(a => a.name.toLowerCase() === lowerName);
}

// Search abilities
function searchAbilities(query) {
    const lowerQuery = query.toLowerCase();
    return ABILITIES_DATA.filter(a => 
        a.name.toLowerCase().includes(lowerQuery) ||
        a.description.toLowerCase().includes(lowerQuery)
    );
}

// Apply ability effects to type effectiveness calculation
function applyAbilityToDefense(ability, moveType, baseEffectiveness, moveCategory = null) {
    if (!ability) return baseEffectiveness;
    
    const abilityData = typeof ability === 'string' ? getAbilityByName(ability) : ability;
    if (!abilityData) return baseEffectiveness;
    
    const type = moveType.toLowerCase();
    
    switch (abilityData.effect) {
        case 'immune':
            if (abilityData.immuneType === type) return 0;
            break;
            
        case 'wonderguard':
            // Only super-effective moves hit
            if (baseEffectiveness <= 1) return 0;
            break;
            
        case 'resist':
            if (abilityData.resistTypes && abilityData.resistTypes.includes(type)) {
                return baseEffectiveness * abilityData.multiplier;
            }
            break;
            
        case 'supereffective_reduce':
            if (baseEffectiveness > 1) {
                return baseEffectiveness * abilityData.multiplier;
            }
            break;
            
        case 'weak':
            if (abilityData.weakTypes && abilityData.weakTypes.includes(type)) {
                return baseEffectiveness * abilityData.multiplier;
            }
            break;
            
        case 'resist_special':
            if (moveCategory === 'special') {
                return baseEffectiveness * abilityData.multiplier;
            }
            break;
            
        case 'resist_physical':
            if (moveCategory === 'physical') {
                return baseEffectiveness * abilityData.multiplier;
            }
            break;
    }
    
    return baseEffectiveness;
}

// Apply ability effects to offensive calculation
function applyAbilityToOffense(ability, move, baseMultiplier) {
    if (!ability || !move) return baseMultiplier;
    
    const abilityData = typeof ability === 'string' ? getAbilityByName(ability) : ability;
    if (!abilityData) return baseMultiplier;
    
    switch (abilityData.effect) {
        case 'type_boost':
            if (move.type.toLowerCase() === abilityData.boostType) {
                return baseMultiplier * abilityData.multiplier;
            }
            break;
            
        case 'weak_move_boost':
            if (move.power <= abilityData.threshold) {
                return baseMultiplier * abilityData.multiplier;
            }
            break;
    }
    
    return baseMultiplier;
}

// Get STAB multiplier considering ability
function getSTABMultiplier(ability) {
    const abilityData = typeof ability === 'string' ? getAbilityByName(ability) : ability;
    if (abilityData && abilityData.effect === 'stab_boost') {
        return abilityData.multiplier; // Adaptability = 2x
    }
    return 1.5; // Normal STAB
}

// Apply ability effects to secondary effect chance (e.g., Serene Grace)
function applyAbilityToEffectChance(ability, baseChance) {
    if (!ability || baseChance >= 100) return baseChance;
    
    const abilityData = typeof ability === 'string' ? getAbilityByName(ability) : ability;
    if (!abilityData) return baseChance;
    
    switch (abilityData.effect) {
        case 'serene_grace':
            // Serene Grace doubles secondary effect chances
            return Math.min(100, baseChance * 2);
    }
    
    return baseChance;
}

// Check if ability affects secondary effect chances
function abilityAffectsEffectChance(ability) {
    if (!ability) return false;
    
    const abilityData = typeof ability === 'string' ? getAbilityByName(ability) : ability;
    if (!abilityData) return false;
    
    return abilityData.effect === 'serene_grace';
}

// Check if defender's ability blocks a specific move effect
function abilityBlocksEffect(ability, effectName) {
    if (!ability || !effectName) return false;
    
    const abilityData = typeof ability === 'string' ? getAbilityByName(ability) : ability;
    if (!abilityData) return false;
    
    const effect = effectName.toLowerCase();
    
    switch (abilityData.effect) {
        case 'flinch_immune':
            // Inner Focus blocks flinch
            return effect === 'flinch';
    }
    
    return false;
}

// Apply status-based ability stat modifiers
// Returns multiplier for the specified stat when Pokemon is statused
function getStatusAbilityStatMultiplier(ability, stat, hasStatus) {
    if (!ability || !hasStatus) return 1;
    
    const abilityData = typeof ability === 'string' ? getAbilityByName(ability) : ability;
    if (!abilityData) return 1;
    
    switch (abilityData.effect) {
        case 'marvel_scale':
            // Marvel Scale: 1.5x Defense when statused
            if (stat === 'defense') {
                return abilityData.multiplier || 1.5;
            }
            break;
    }
    
    return 1;
}

// Apply post-attack ability effects
// Returns an object describing all effects to apply after an attack
// @param {Object} move - The move that was used
// @param {string} attackerAbility - Attacker's ability name
// @param {string} defenderAbility - Defender's ability name
// @returns {Object} Effects to apply: { attackerRecoil: fraction, ... }
function applyPostAttackAbilityEffects(move, attackerAbility, defenderAbility) {
    const effects = {
        attackerRecoil: 0,      // Fraction of attacker's max HP as recoil damage
        defenderRecoil: 0,      // Fraction of defender's max HP as recoil damage
        attackerHeal: 0,        // Fraction of attacker's max HP to heal
        defenderHeal: 0,        // Fraction of defender's max HP to heal
        recoilAbilityName: null // Name of ability causing recoil (for log messages)
    };
    
    if (!move) return effects;
    
    // Check defender's ability for contact recoil (Rough Skin, Iron Barbs)
    if (defenderAbility && isContactMove(move)) {
        const defenderAbilityData = typeof defenderAbility === 'string' ? getAbilityByName(defenderAbility) : defenderAbility;
        if (defenderAbilityData && defenderAbilityData.effect === 'contact_recoil') {
            effects.attackerRecoil = defenderAbilityData.damage || 1/8;
            effects.recoilAbilityName = defenderAbilityData.name;
        }
    }
    
    // Future: Add more post-attack ability effects here
    // e.g., Poison Point, Static, Flame Body contact status effects
    // e.g., Color Change type changing
    // e.g., Aftermath explosion damage
    
    return effects;
}
