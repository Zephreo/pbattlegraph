// Pokemon Moves Data
// Comprehensive list of moves with type, category, power, accuracy, effects and effect chances
// Effect data sourced from https://pokemondb.net/move/all
//
// Effect Structure:
// - For single effects: effects: [{ effect: "effect_name", chance: number }]
// - For multiple effects: effects: [{ effect: "effect1", chance: 10 }, { effect: "effect2", chance: 100 }]
// - For no effects: effects: []
// - Legacy format (deprecated): effect: "effect_name", effectChance: number

const MOVES_DATA = [
    // Normal Type Moves
    { name: "Tackle", type: "normal", category: "physical", power: 40, accuracy: 100, effect: null, effectChance: 0, description: "A physical attack in which the user charges and slams into the target with its whole body." },
    { name: "Quick Attack", type: "normal", category: "physical", power: 40, accuracy: 100, effect: "priority", effectChance: 100, description: "The user lunges at the target at a speed that makes it almost invisible. This move always goes first." },
    { name: "Scratch", type: "normal", category: "physical", power: 40, accuracy: 100, effect: null, effectChance: 0, description: "Hard, pointed, sharp claws rake the target to inflict damage." },
    { name: "Pound", type: "normal", category: "physical", power: 40, accuracy: 100, effect: null, effectChance: 0, description: "The target is physically pounded with a long tail, a foreleg, or the like." },
    { name: "Body Slam", type: "normal", category: "physical", power: 85, accuracy: 100, effect: "paralysis", effectChance: 30, description: "The user drops onto the target with its full body weight. This may also leave the target with paralysis." },
    { name: "Take Down", type: "normal", category: "physical", power: 90, accuracy: 85, effect: "recoil", effectChance: 100, description: "A reckless, full-body charge attack for slamming into the target. This also damages the user a little." },
    { name: "Double-Edge", type: "normal", category: "physical", power: 120, accuracy: 100, effect: "recoil", effectChance: 100, description: "A reckless, life-risking tackle in which the user rushes the target. This also damages the user quite a lot." },
    { name: "Hyper Beam", type: "normal", category: "special", power: 150, accuracy: 90, effect: "recharge", effectChance: 100, description: "The target is attacked with a powerful beam. The user can't move on the next turn." },
    { name: "Giga Impact", type: "normal", category: "physical", power: 150, accuracy: 90, effect: "recharge", effectChance: 100, description: "The user charges at the target using every bit of its power. The user can't move on the next turn." },
    { name: "Return", type: "normal", category: "physical", power: 102, accuracy: 100, effect: null, effectChance: 0, description: "This full-power attack grows more powerful the more the user likes its Trainer." },
    { name: "Frustration", type: "normal", category: "physical", power: 102, accuracy: 100, effect: null, effectChance: 0, description: "This full-power attack grows more powerful the less the user likes its Trainer." },
    { name: "Facade", type: "normal", category: "physical", power: 70, accuracy: 100, effect: "power_doubles_when_statused", effectChance: 100, description: "This attack move doubles its power if the user is poisoned, burned, or paralyzed." },
    { name: "Swift", type: "normal", category: "special", power: 60, accuracy: 100, effect: "never_misses", effectChance: 100, description: "Star-shaped rays are shot at opposing Pokémon. This attack never misses." },
    { name: "Slash", type: "normal", category: "physical", power: 70, accuracy: 100, effect: "high_critical_hit", effectChance: 100, description: "The target is attacked with a slash of claws or blades. Critical hits land more easily." },
    { name: "Extreme Speed", type: "normal", category: "physical", power: 80, accuracy: 100, effect: "priority_plus2", effectChance: 100, description: "The user charges the target at blinding speed. This move always goes first." },
    { name: "Fake Out", type: "normal", category: "physical", power: 40, accuracy: 100, effect: "flinch", effectChance: 100, description: "This attack hits first and makes the target flinch. It only works the first turn each time the user enters battle." },
    { name: "Last Resort", type: "normal", category: "physical", power: 140, accuracy: 100, effect: null, effectChance: 0, description: "This move can be used only after the user has used all the other moves it knows in the battle." },
    { name: "Rapid Spin", type: "normal", category: "physical", power: 50, accuracy: 100, effect: "raises_speed", effectChance: 100, description: "A spin attack that can also eliminate such moves as Bind, Wrap, and Leech Seed. This also raises the user's Speed." },
    { name: "Explosion", type: "normal", category: "physical", power: 250, accuracy: 100, effect: "user_faints", effectChance: 100, description: "The user attacks everything around it by causing a tremendous explosion. The user faints upon using this move." },
    { name: "Self-Destruct", type: "normal", category: "physical", power: 200, accuracy: 100, effect: "user_faints", effectChance: 100, description: "The user attacks everything around it by causing an explosion. The user faints upon using this move." },
    { name: "Boomburst", type: "normal", category: "special", power: 140, accuracy: 100, effect: null, effectChance: 0, description: "The user attacks everything around it with the destructive power of a terrible, explosive sound." },
    { name: "Hyper Voice", type: "normal", category: "special", power: 90, accuracy: 100, effect: null, effectChance: 0, description: "The user lets loose a horribly echoing shout with the power to inflict damage." },
    { name: "Tri Attack", type: "normal", category: "special", power: 80, accuracy: 100, effects: [{ effect: "burn", chance: 6.67 }, { effect: "freeze", chance: 6.67 }, { effect: "paralysis", chance: 6.67 }], description: "The user strikes with a simultaneous three-beam attack. May also burn, freeze, or paralyze the target." },
    { name: "Crush Claw", type: "normal", category: "physical", power: 75, accuracy: 95, effect: "lowers_defense", effectChance: 50, description: "The user slashes the target with hard and sharp claws. This may also lower the target's Defense." },
    { name: "Retaliate", type: "normal", category: "physical", power: 70, accuracy: 100, effect: "power_doubles_if_ally_fainted", effectChance: 100, description: "The user gets revenge for a fainted ally. If an ally fainted in the previous turn, this move's power is increased." },
    { name: "Head Charge", type: "normal", category: "physical", power: 120, accuracy: 100, effect: "recoil", effectChance: 100, description: "The user charges its head into its target, using its powerful guard hair. This also damages the user a little." },
    { name: "Mega Kick", type: "normal", category: "physical", power: 120, accuracy: 75, effect: null, effectChance: 0, description: "The target is attacked by a kick launched with muscle-packed power." },
    { name: "Mega Punch", type: "normal", category: "physical", power: 80, accuracy: 85, effect: null, effectChance: 0, description: "The target is slugged by a punch thrown with muscle-packed power." },
    { name: "Covet", type: "normal", category: "physical", power: 60, accuracy: 100, effect: "steals_item", effectChance: 100, description: "The user endearingly approaches the target, then has a 100% chance to steal the target's held item." },
    { name: "Cut", type: "normal", category: "physical", power: 50, accuracy: 95, effect: null, effectChance: 0, description: "The target is cut with a scythe or claw." },
    { name: "Strength", type: "normal", category: "physical", power: 80, accuracy: 100, effect: null, effectChance: 0, description: "The target is slugged with a punch thrown at maximum power." },
    { name: "Headbutt", type: "normal", category: "physical", power: 70, accuracy: 100, effect: "flinch", effectChance: 30, description: "The user sticks out its head and attacks by charging straight into the target. This may also make the target flinch." },
    { name: "Stomp", type: "normal", category: "physical", power: 65, accuracy: 100, effect: "flinch", effectChance: 30, description: "The target is stomped with a big foot. This may also make the target flinch." },
    { name: "Thrash", type: "normal", category: "physical", power: 120, accuracy: 100, effect: "confusion_after", effectChance: 100, description: "The user rampages and attacks for two to three turns. The user then becomes confused." },
    { name: "Double Hit", type: "normal", category: "physical", power: 35, accuracy: 90, effect: "hits_twice", effectChance: 100, description: "The user slams the target with a long tail, vines, or a tentacle. The target is hit twice in a row." },
    { name: "Population Bomb", type: "normal", category: "physical", power: 20, accuracy: 90, effect: "multi_hit_1_to_10", effectChance: 100, description: "The user's fellows gather in droves to perform a combo attack that hits the target one to ten times in a row." },
    { name: "Tera Blast", type: "normal", category: "special", power: 80, accuracy: 100, effect: "uses_higher_attack_stat", effectChance: 100, description: "If the user has Terastallized, it unleashes energy of its Tera Type. This move inflicts damage using the Attack or Sp. Atk stat—whichever is higher for the user." },
    { name: "Raging Bull", type: "normal", category: "physical", power: 90, accuracy: 100, effect: "type_varies_by_form", effectChance: 100, description: "The user performs a tackle like a raging bull. This move's type depends on the user's form." },
    { name: "Blood Moon", type: "normal", category: "special", power: 140, accuracy: 100, effect: "cannot_use_twice", effectChance: 100, description: "The user unleashes the full brunt of its spirit from a full moon that shines as red as blood. This move can't be used twice in a row." },

    // Fire Type Moves
    { name: "Ember", type: "fire", category: "special", power: 40, accuracy: 100, effect: "burn", effectChance: 10, description: "The target is attacked with small flames. This may also leave the target with a burn." },
    { name: "Flamethrower", type: "fire", category: "special", power: 90, accuracy: 100, effect: "burn", effectChance: 10, description: "The target is scorched with an intense blast of fire. This may also leave the target with a burn." },
    { name: "Fire Blast", type: "fire", category: "special", power: 110, accuracy: 85, effect: "burn", effectChance: 10, description: "The target is attacked with an intense blast of all-consuming fire. This may also leave the target with a burn." },
    { name: "Fire Punch", type: "fire", category: "physical", power: 75, accuracy: 100, effect: "burn", effectChance: 10, description: "The target is punched with a fiery fist. This may also leave the target with a burn." },
    { name: "Flame Wheel", type: "fire", category: "physical", power: 60, accuracy: 100, effect: "burn", effectChance: 10, description: "The user cloaks itself in fire and charges at the target. This may also leave the target with a burn." },
    { name: "Blaze Kick", type: "fire", category: "physical", power: 85, accuracy: 90, effects: [{ effect: "burn", chance: 10 }, { effect: "high_critical_hit", chance: 100 }], description: "The user launches a kick that lands a critical hit more easily. This may also leave the target with a burn." },
    { name: "Fire Fang", type: "fire", category: "physical", power: 65, accuracy: 95, effects: [{ effect: "burn", chance: 10 }, { effect: "flinch", chance: 10 }], description: "The user bites with flame-cloaked fangs. This may also make the target flinch or leave it with a burn." },
    { name: "Flare Blitz", type: "fire", category: "physical", power: 120, accuracy: 100, effects: [{ effect: "burn", chance: 10 }, { effect: "recoil", chance: 100 }], description: "The user cloaks itself in fire and charges the target. This also damages the user quite a lot and may leave the target with a burn." },
    { name: "Overheat", type: "fire", category: "special", power: 130, accuracy: 90, effect: "lowers_user_sp_atk_2", effectChance: 100, description: "The user attacks the target at full power. The attack's recoil harshly lowers the user's Sp. Atk stat." },
    { name: "Heat Wave", type: "fire", category: "special", power: 95, accuracy: 90, effect: "burn", effectChance: 10, description: "The user attacks by exhaling hot breath on opposing Pokémon. This may also leave those Pokémon with a burn." },
    { name: "Eruption", type: "fire", category: "special", power: 150, accuracy: 100, effect: "power_scales_with_hp", effectChance: 100, description: "The user attacks opposing Pokémon with explosive fury. The lower the user's HP, the lower the move's power." },
    { name: "Lava Plume", type: "fire", category: "special", power: 80, accuracy: 100, effect: "burn", effectChance: 30, description: "The user torches everything around it in an inferno of scarlet flames. This may also leave those Pokémon with a burn." },
    { name: "Sacred Fire", type: "fire", category: "physical", power: 100, accuracy: 95, effect: "burn", effectChance: 50, description: "The target is razed with a mystical fire of great intensity. This may also leave the target with a burn." },
    { name: "Blue Flare", type: "fire", category: "special", power: 130, accuracy: 85, effect: "burn", effectChance: 20, description: "The user attacks by engulfing the target in an intense, yet beautiful, blue flame. This may also leave the target with a burn." },
    { name: "V-create", type: "fire", category: "physical", power: 180, accuracy: 95, effect: "lowers_user_def_spdef_speed", effectChance: 100, description: "With a hot flame on its forehead, the user hurls itself at its target. This lowers the user's Defense, Sp. Def, and Speed stats." },
    { name: "Fusion Flare", type: "fire", category: "special", power: 100, accuracy: 100, effect: "power_boost_with_fusion_bolt", effectChance: 100, description: "The user brings down a giant flame. This move's power is increased when influenced by an enormous lightning bolt." },
    { name: "Searing Shot", type: "fire", category: "special", power: 100, accuracy: 100, effect: "burn", effectChance: 30, description: "The user torches everything around it in an inferno of scarlet flames. This may also leave those Pokémon with a burn." },
    { name: "Inferno", type: "fire", category: "special", power: 100, accuracy: 50, effect: "burn", effectChance: 100, description: "The user attacks by engulfing the target in an intense fire. This leaves the target with a burn." },
    { name: "Mystical Fire", type: "fire", category: "special", power: 75, accuracy: 100, effect: "lowers_sp_atk", effectChance: 100, description: "The user attacks by breathing a special, hot fire. This also lowers the target's Sp. Atk stat." },
    { name: "Fire Spin", type: "fire", category: "special", power: 35, accuracy: 85, effect: "trap", effectChance: 100, description: "The target becomes trapped within a fierce vortex of fire that rages for four to five turns." },
    { name: "Flame Charge", type: "fire", category: "physical", power: 50, accuracy: 100, effect: "raises_user_speed", effectChance: 100, description: "Cloaking itself in flame, the user attacks the target. Then, building up more power, the user raises its Speed stat." },
    { name: "Incinerate", type: "fire", category: "special", power: 60, accuracy: 100, effect: "burns_berry", effectChance: 100, description: "The user attacks opposing Pokémon with fire. If a Pokémon is holding a certain item, such as a Berry, the item becomes burned up and unusable." },
    { name: "Burning Jealousy", type: "fire", category: "special", power: 70, accuracy: 100, effect: "burn_if_stat_raised", effectChance: 100, description: "The user attacks with energy from jealousy. This leaves all opposing Pokémon that have had their stats boosted during the turn with a burn." },
    { name: "Pyro Ball", type: "fire", category: "physical", power: 120, accuracy: 90, effect: "burn", effectChance: 10, description: "The user attacks by igniting a small stone and launching it as a fiery ball at the target. This may also leave the target with a burn." },
    { name: "Bitter Blade", type: "fire", category: "physical", power: 90, accuracy: 100, effect: "drain_hp", effectChance: 100, description: "The user focuses its bitter feelings toward the world of the living into a slashing attack. The user's HP is restored by up to half the damage taken by the target." },
    { name: "Armor Cannon", type: "fire", category: "special", power: 120, accuracy: 100, effect: "lowers_user_def_spdef", effectChance: 100, description: "The user shoots its own armor out as blazing projectiles. This also lowers the user's Defense and Sp. Def stats." },
    { name: "Torch Song", type: "fire", category: "special", power: 80, accuracy: 100, effect: "raises_user_sp_atk", effectChance: 100, description: "The user blows out raging flames as if singing a song, scorching the target. This also boosts the user's Sp. Atk stat." },

    // Water Type Moves
    { name: "Water Gun", type: "water", category: "special", power: 40, accuracy: 100, effect: null, effectChance: 0, description: "The target is blasted with a forceful shot of water." },
    { name: "Bubble", type: "water", category: "special", power: 40, accuracy: 100, effect: "lowers_speed", effectChance: 10, description: "A spray of countless bubbles is jetted at the opposing Pokémon. This may also lower their Speed stat." },
    { name: "Bubble Beam", type: "water", category: "special", power: 65, accuracy: 100, effect: "lowers_speed", effectChance: 10, description: "A spray of bubbles is forcefully ejected at the target. This may also lower the target's Speed stat." },
    { name: "Surf", type: "water", category: "special", power: 90, accuracy: 100, effect: null, effectChance: 0, description: "The user attacks everything around it by swamping its surroundings with a giant wave." },
    { name: "Hydro Pump", type: "water", category: "special", power: 110, accuracy: 80, effect: null, effectChance: 0, description: "The target is blasted by a huge volume of water launched under great pressure." },
    { name: "Aqua Tail", type: "water", category: "physical", power: 90, accuracy: 90, effect: null, effectChance: 0, description: "The user attacks by swinging its tail as if it were a vicious wave in a raging storm." },
    { name: "Waterfall", type: "water", category: "physical", power: 80, accuracy: 100, effect: "flinch", effectChance: 20, description: "The user charges at the target and may make it flinch." },
    { name: "Aqua Jet", type: "water", category: "physical", power: 40, accuracy: 100, effect: "priority", effectChance: 100, description: "The user lunges at the target at a speed that makes it almost invisible. This move always goes first." },
    { name: "Scald", type: "water", category: "special", power: 80, accuracy: 100, effect: "burn", effectChance: 30, description: "The user shoots boiling hot water at its target. This may also leave the target with a burn." },
    { name: "Muddy Water", type: "water", category: "special", power: 90, accuracy: 85, effect: "lowers_accuracy", effectChance: 30, description: "The user attacks by shooting muddy water at opposing Pokémon. This may also lower their accuracy." },
    { name: "Hydro Cannon", type: "water", category: "special", power: 150, accuracy: 90, effect: "recharge", effectChance: 100, description: "The target is hit with a watery blast. The user can't move on the next turn." },
    { name: "Water Spout", type: "water", category: "special", power: 150, accuracy: 100, effect: "power_scales_with_hp", effectChance: 100, description: "The user spouts water to damage opposing Pokémon. The lower the user's HP, the lower the move's power." },
    { name: "Origin Pulse", type: "water", category: "special", power: 110, accuracy: 85, effect: null, effectChance: 0, description: "The user attacks opposing Pokémon with countless beams of light that glow a deep and brilliant blue." },
    { name: "Crabhammer", type: "water", category: "physical", power: 100, accuracy: 90, effect: "high_critical_hit", effectChance: 100, description: "The target is hammered with a large pincer. Critical hits land more easily." },
    { name: "Razor Shell", type: "water", category: "physical", power: 75, accuracy: 95, effect: "lowers_defense", effectChance: 50, description: "The user cuts its target with sharp shells. This may also lower the target's Defense stat." },
    { name: "Liquidation", type: "water", category: "physical", power: 85, accuracy: 100, effect: "lowers_defense", effectChance: 20, description: "The user slams into the target using a full-force blast of water. This may also lower the target's Defense stat." },
    { name: "Dive", type: "water", category: "physical", power: 80, accuracy: 100, effect: "two_turn_move", effectChance: 100, description: "Diving on the first turn, the user floats up and attacks on the next turn." },
    { name: "Brine", type: "water", category: "special", power: 65, accuracy: 100, effect: "power_doubles_if_target_half_hp", effectChance: 100, description: "If the target's HP is half or less, this attack will hit with double the power." },
    { name: "Aqua Cutter", type: "water", category: "physical", power: 70, accuracy: 100, effect: "high_critical_hit", effectChance: 100, description: "The user expels pressurized water to cut at the target like a blade. This move has a heightened chance of landing a critical hit." },
    { name: "Wave Crash", type: "water", category: "physical", power: 120, accuracy: 100, effect: "recoil", effectChance: 100, description: "The user shrouds itself in water and slams into the target with its whole body to inflict damage. This also damages the user quite a lot." },
    { name: "Jet Punch", type: "water", category: "physical", power: 60, accuracy: 100, effect: "priority", effectChance: 100, description: "The user summons a torrent around its fist and punches at blinding speed. This move always goes first." },
    { name: "Flip Turn", type: "water", category: "physical", power: 60, accuracy: 100, effect: "switch_out", effectChance: 100, description: "After making its attack, the user rushes back to switch places with a party Pokémon in waiting." },

    // Electric Type Moves
    { name: "Thunder Shock", type: "electric", category: "special", power: 40, accuracy: 100, effect: "paralysis", effectChance: 10, description: "A jolt of electricity crashes down on the target to inflict damage. This may also leave the target with paralysis." },
    { name: "Shock Wave", type: "electric", category: "special", power: 60, accuracy: 100, effect: "never_misses", effectChance: 100, description: "The user strikes the target with a quick jolt of electricity. This attack never misses." },
    { name: "Thunderbolt", type: "electric", category: "special", power: 90, accuracy: 100, effect: "paralysis", effectChance: 10, description: "A strong electric blast crashes down on the target. This may also leave the target with paralysis." },
    { name: "Thunder", type: "electric", category: "special", power: 110, accuracy: 70, effect: "paralysis", effectChance: 30, description: "A wicked thunderbolt is dropped on the target to inflict damage. This may also leave the target with paralysis." },
    { name: "Thunder Punch", type: "electric", category: "physical", power: 75, accuracy: 100, effect: "paralysis", effectChance: 10, description: "The target is punched with an electrified fist. This may also leave the target with paralysis." },
    { name: "Spark", type: "electric", category: "physical", power: 65, accuracy: 100, effect: "paralysis", effectChance: 30, description: "The user throws an electrically charged tackle at the target. This may also leave the target with paralysis." },
    { name: "Wild Charge", type: "electric", category: "physical", power: 90, accuracy: 100, effect: "recoil", effectChance: 100, description: "The user shrouds itself in electricity and smashes into its target. This also damages the user a little." },
    { name: "Volt Tackle", type: "electric", category: "physical", power: 120, accuracy: 100, effects: [{ effect: "paralysis", chance: 10 }, { effect: "recoil", chance: 100 }], description: "The user electrifies itself and charges the target. This also damages the user quite a lot and may leave the target with paralysis." },
    { name: "Thunder Fang", type: "electric", category: "physical", power: 65, accuracy: 95, effects: [{ effect: "paralysis", chance: 10 }, { effect: "flinch", chance: 10 }], description: "The user bites with electrified fangs. This may also make the target flinch or leave it with paralysis." },
    { name: "Discharge", type: "electric", category: "special", power: 80, accuracy: 100, effect: "paralysis", effectChance: 30, description: "The user strikes everything around it by letting loose a flare of electricity. This may also cause paralysis." },
    { name: "Volt Switch", type: "electric", category: "special", power: 70, accuracy: 100, effect: "switch_out", effectChance: 100, description: "After making its attack, the user rushes back to switch places with a party Pokémon in waiting." },
    { name: "Zap Cannon", type: "electric", category: "special", power: 120, accuracy: 50, effect: "paralysis", effectChance: 100, description: "The user fires an electric blast like a cannon to inflict damage and cause paralysis." },
    { name: "Bolt Strike", type: "electric", category: "physical", power: 130, accuracy: 85, effect: "paralysis", effectChance: 20, description: "The user surrounds itself with a great amount of electricity and charges its target. This may also leave the target with paralysis." },
    { name: "Fusion Bolt", type: "electric", category: "physical", power: 100, accuracy: 100, effect: "power_boost_with_fusion_flare", effectChance: 100, description: "The user throws down a giant lightning bolt. This move's power is increased when influenced by an enormous flame." },
    { name: "Parabolic Charge", type: "electric", category: "special", power: 65, accuracy: 100, effect: "drain_hp", effectChance: 100, description: "The user strikes everything around it. The user's HP is restored by half the damage taken by those hit." },
    { name: "Electro Ball", type: "electric", category: "special", power: 40, accuracy: 100, effect: "power_scales_with_speed", effectChance: 100, description: "The user hurls an electric orb at the target. The faster the user is than the target, the greater the move's power." },
    { name: "Nuzzle", type: "electric", category: "physical", power: 20, accuracy: 100, effect: "paralysis", effectChance: 100, description: "The user attacks by nuzzling its electrified cheeks against the target. This also leaves the target with paralysis." },
    { name: "Zing Zap", type: "electric", category: "physical", power: 80, accuracy: 100, effect: "flinch", effectChance: 30, description: "A strong electric blast crashes down on the target, giving it an electric shock. This may also make the target flinch." },
    { name: "Plasma Fists", type: "electric", category: "physical", power: 100, accuracy: 100, effect: "normal_to_electric", effectChance: 100, description: "The user attacks with electrically charged fists. This move changes Normal-type moves to Electric-type moves." },
    { name: "Aura Wheel", type: "electric", category: "physical", power: 110, accuracy: 100, effect: "raises_user_speed", effectChance: 100, description: "Morpeko attacks and raises its Speed with the energy stored in its cheeks. This move's type changes depending on the user's form." },
    { name: "Rising Voltage", type: "electric", category: "special", power: 70, accuracy: 100, effect: "power_doubles_on_electric_terrain", effectChance: 100, description: "The user attacks with electric voltage rising from the ground. This move's power doubles when the target is on Electric Terrain." },
    { name: "Overdrive", type: "electric", category: "special", power: 80, accuracy: 100, effect: null, effectChance: 0, description: "The user attacks opposing Pokémon by twanging a guitar or bass guitar, causing a huge echo and strong vibration." },
    { name: "Thunder Cage", type: "electric", category: "special", power: 80, accuracy: 90, effect: "trap", effectChance: 100, description: "The user traps the target in a cage of sparking electricity for four to five turns." },
    { name: "Electro Drift", type: "electric", category: "special", power: 100, accuracy: 100, effect: "super_effective_boost", effectChance: 100, description: "The user races forward at ultrafast speeds, piercing its target with futuristic electricity. This move's power is boosted more than usual if it's a supereffective hit." },
    { name: "Double Shock", type: "electric", category: "physical", power: 120, accuracy: 100, effect: "lose_electric_type", effectChance: 100, description: "The user discharges all the electricity from its body to perform a high-damage attack. After using this move, the user will no longer be Electric type." },

    // Grass Type Moves
    { name: "Vine Whip", type: "grass", category: "physical", power: 45, accuracy: 100, effect: null, effectChance: 0, description: "The target is struck with slender, whiplike vines to inflict damage." },
    { name: "Razor Leaf", type: "grass", category: "physical", power: 55, accuracy: 95, effect: "high_critical_hit", effectChance: 100, description: "Sharp-edged leaves are launched to slash at opposing Pokémon. Critical hits land more easily." },
    { name: "Solar Beam", type: "grass", category: "special", power: 120, accuracy: 100, effect: "two_turn_move", effectChance: 100, description: "In this two-turn attack, the user gathers light, then blasts a bundled beam on the next turn." },
    { name: "Leaf Blade", type: "grass", category: "physical", power: 90, accuracy: 100, effect: "high_critical_hit", effectChance: 100, description: "The user handles a sharp leaf like a sword and attacks by cutting its target. Critical hits land more easily." },
    { name: "Energy Ball", type: "grass", category: "special", power: 90, accuracy: 100, effect: "lowers_sp_def", effectChance: 10, description: "The user draws power from nature and fires it at the target. This may also lower the target's Sp. Def stat." },
    { name: "Giga Drain", type: "grass", category: "special", power: 75, accuracy: 100, effect: "drain_hp", effectChance: 100, description: "A nutrient-draining attack. The user's HP is restored by half the damage taken by the target." },
    { name: "Seed Bomb", type: "grass", category: "physical", power: 80, accuracy: 100, effect: null, effectChance: 0, description: "The user slams a barrage of hard-shelled seeds down on the target from above." },
    { name: "Power Whip", type: "grass", category: "physical", power: 120, accuracy: 85, effect: null, effectChance: 0, description: "The user violently whirls its vines, tentacles, or the like to harshly lash the target." },
    { name: "Wood Hammer", type: "grass", category: "physical", power: 120, accuracy: 100, effect: "recoil", effectChance: 100, description: "The user slams its rugged body into the target to attack. This also damages the user quite a lot." },
    { name: "Leaf Storm", type: "grass", category: "special", power: 130, accuracy: 90, effect: "lowers_user_sp_atk_2", effectChance: 100, description: "The user whips up a storm of leaves around the target. The attack's recoil harshly lowers the user's Sp. Atk stat." },
    { name: "Petal Blizzard", type: "grass", category: "physical", power: 90, accuracy: 100, effect: null, effectChance: 0, description: "The user stirs up a violent petal blizzard and attacks everything around it." },
    { name: "Petal Dance", type: "grass", category: "special", power: 120, accuracy: 100, effect: "confusion_after", effectChance: 100, description: "The user attacks the target by scattering petals for two to three turns. The user then becomes confused." },
    { name: "Frenzy Plant", type: "grass", category: "special", power: 150, accuracy: 90, effect: "recharge", effectChance: 100, description: "The user slams the target with the roots of an enormous tree. The user can't move on the next turn." },
    { name: "Horn Leech", type: "grass", category: "physical", power: 75, accuracy: 100, effect: "drain_hp", effectChance: 100, description: "The user drains the target's energy with its horns. The user's HP is restored by half the damage taken by the target." },
    { name: "Bullet Seed", type: "grass", category: "physical", power: 25, accuracy: 100, effect: "multi_hit_2_to_5", effectChance: 100, description: "The user forcefully shoots seeds at the target two to five times in a row." },
    { name: "Magical Leaf", type: "grass", category: "special", power: 60, accuracy: 100, effect: "never_misses", effectChance: 100, description: "The user scatters curious leaves that chase the target. This attack never misses." },
    { name: "Grass Knot", type: "grass", category: "special", power: 1, accuracy: 100, effect: "power_scales_with_weight", effectChance: 100, description: "The user snares the target with grass and trips it. The heavier the target, the greater the move's power." },
    { name: "Solar Blade", type: "grass", category: "physical", power: 125, accuracy: 100, effect: "two_turn_move", effectChance: 100, description: "In this two-turn attack, the user gathers light and fills a blade with the light's energy, attacking the target on the next turn." },
    { name: "Drum Beating", type: "grass", category: "physical", power: 80, accuracy: 100, effect: "lowers_speed", effectChance: 100, description: "The user plays its drum, controlling the drum's roots to attack the target. This also lowers the target's Speed stat." },
    { name: "Grassy Glide", type: "grass", category: "physical", power: 55, accuracy: 100, effect: "priority_on_grassy_terrain", effectChance: 100, description: "Gliding on the ground, the user attacks the target. This move always goes first on Grassy Terrain." },
    { name: "Apple Acid", type: "grass", category: "special", power: 80, accuracy: 100, effect: "lowers_sp_def", effectChance: 100, description: "The user attacks the target with an acidic liquid created from tart apples. This also lowers the target's Sp. Def stat." },
    { name: "Grav Apple", type: "grass", category: "physical", power: 80, accuracy: 100, effect: "lowers_defense", effectChance: 100, description: "The user inflicts damage by dropping an apple from high above. This also lowers the target's Defense stat." },
    { name: "Trailblaze", type: "grass", category: "physical", power: 50, accuracy: 100, effect: "raises_user_speed", effectChance: 100, description: "The user attacks suddenly as if leaping out from tall grass. The user's nimble footwork boosts its Speed stat." },
    { name: "Flower Trick", type: "grass", category: "physical", power: 70, accuracy: 100, effect: "never_misses_always_crit", effectChance: 100, description: "The user throws a rigged bouquet of flowers at the target. This attack never misses and always lands a critical hit." },
    { name: "Syrup Bomb", type: "grass", category: "special", power: 60, accuracy: 85, effect: "lowers_speed_3_turns", effectChance: 100, description: "The user sets off an explosion of sticky candy syrup, which coats the target and causes the target's Speed stat to drop each turn for three turns." },

    // Ice Type Moves
    { name: "Ice Beam", type: "ice", category: "special", power: 90, accuracy: 100, effect: "freeze", effectChance: 10, description: "The target is struck with an icy-cold beam of energy. This may also leave the target frozen." },
    { name: "Blizzard", type: "ice", category: "special", power: 110, accuracy: 70, effect: "freeze", effectChance: 10, description: "A howling blizzard is summoned to strike opposing Pokémon. This may also leave the opposing Pokémon frozen." },
    { name: "Ice Punch", type: "ice", category: "physical", power: 75, accuracy: 100, effect: "freeze", effectChance: 10, description: "The target is punched with an icy fist. This may also leave the target frozen." },
    { name: "Ice Fang", type: "ice", category: "physical", power: 65, accuracy: 95, effects: [{ effect: "freeze", chance: 10 }, { effect: "flinch", chance: 10 }], description: "The user bites with cold-infused fangs. This may also make the target flinch or leave it frozen." },
    { name: "Avalanche", type: "ice", category: "physical", power: 60, accuracy: 100, effect: "power_doubles_if_hit", effectChance: 100, description: "The power of this attack move doubles if the user has been hurt by the target in the same turn." },
    { name: "Ice Shard", type: "ice", category: "physical", power: 40, accuracy: 100, effect: "priority", effectChance: 100, description: "The user flash-freezes chunks of ice and hurls them at the target. This move always goes first." },
    { name: "Icicle Crash", type: "ice", category: "physical", power: 85, accuracy: 90, effect: "flinch", effectChance: 30, description: "The user attacks by harshly dropping large icicles onto the target. This may also make the target flinch." },
    { name: "Freeze-Dry", type: "ice", category: "special", power: 70, accuracy: 100, effect: "freeze_super_effective_water", effectChance: 10, description: "The user rapidly cools the target. This may also leave the target frozen. This move is super effective on Water types." },
    { name: "Frost Breath", type: "ice", category: "special", power: 60, accuracy: 90, effect: "always_critical_hit", effectChance: 100, description: "The user blows its cold breath on the target. This attack always results in a critical hit." },
    { name: "Aurora Beam", type: "ice", category: "special", power: 65, accuracy: 100, effect: "lowers_attack", effectChance: 10, description: "The target is hit with a rainbow-colored beam. This may also lower the target's Attack stat." },
    { name: "Glaciate", type: "ice", category: "special", power: 65, accuracy: 95, effect: "lowers_speed", effectChance: 100, description: "The user attacks by blowing freezing cold air at opposing Pokémon. This lowers their Speed stats." },
    { name: "Ice Burn", type: "ice", category: "special", power: 140, accuracy: 90, effect: "burn", effectChance: 30, description: "On the second turn, an ultracold, freezing wind surrounds the target. This may leave the target with a burn." },
    { name: "Freeze Shock", type: "ice", category: "physical", power: 140, accuracy: 90, effect: "paralysis", effectChance: 30, description: "On the second turn, the user hits the target with electrically charged ice. This may also leave the target with paralysis." },
    { name: "Icy Wind", type: "ice", category: "special", power: 55, accuracy: 95, effect: "lowers_speed", effectChance: 100, description: "The user attacks with a gust of chilled air. This also lowers opposing Pokémon's Speed stats." },
    { name: "Triple Axel", type: "ice", category: "physical", power: 20, accuracy: 90, effect: "hits_three_times_increasing", effectChance: 100, description: "A consecutive three-kick attack that becomes more powerful with each successful hit." },
    { name: "Icicle Spear", type: "ice", category: "physical", power: 25, accuracy: 100, effect: "multi_hit_2_to_5", effectChance: 100, description: "The user launches sharp icicles at the target two to five times in a row." },
    { name: "Ice Spinner", type: "ice", category: "physical", power: 80, accuracy: 100, effect: "removes_terrain", effectChance: 100, description: "The user covers its feet in thin ice and twirls around, slamming into the target. This move's spinning motion also destroys the terrain." },

    // Fighting Type Moves
    { name: "Karate Chop", type: "fighting", category: "physical", power: 50, accuracy: 100, effect: "high_critical_hit", effectChance: 100, description: "The target is attacked with a sharp chop. Critical hits land more easily." },
    { name: "Low Kick", type: "fighting", category: "physical", power: 1, accuracy: 100, effect: "power_scales_with_weight", effectChance: 100, description: "A powerful low kick that makes the target fall over. The heavier the target, the greater the move's power." },
    { name: "Brick Break", type: "fighting", category: "physical", power: 75, accuracy: 100, effect: "breaks_screens", effectChance: 100, description: "The user attacks with a swift chop. It can also break barriers, such as Light Screen and Reflect." },
    { name: "Cross Chop", type: "fighting", category: "physical", power: 100, accuracy: 80, effect: "high_critical_hit", effectChance: 100, description: "The user delivers a double chop with its forearms crossed. Critical hits land more easily." },
    { name: "Close Combat", type: "fighting", category: "physical", power: 120, accuracy: 100, effect: "lowers_user_def_spdef", effectChance: 100, description: "The user fights the target up close without guarding itself. This also lowers the user's Defense and Sp. Def stats." },
    { name: "Focus Blast", type: "fighting", category: "special", power: 120, accuracy: 70, effect: "lowers_sp_def", effectChance: 10, description: "The user heightens its mental focus and unleashes its power. This may also lower the target's Sp. Def stat." },
    { name: "Aura Sphere", type: "fighting", category: "special", power: 80, accuracy: 100, effect: "never_misses", effectChance: 100, description: "The user lets loose a wave of aura power from deep within its body at the target. This attack never misses." },
    { name: "Mach Punch", type: "fighting", category: "physical", power: 40, accuracy: 100, effect: "priority", effectChance: 100, description: "The user throws a punch at blinding speed. This move always goes first." },
    { name: "Drain Punch", type: "fighting", category: "physical", power: 75, accuracy: 100, effect: "drain_hp", effectChance: 100, description: "An energy-draining punch. The user's HP is restored by half the damage taken by the target." },
    { name: "Dynamic Punch", type: "fighting", category: "physical", power: 100, accuracy: 50, effect: "confusion", effectChance: 100, description: "The user punches the target with full, concentrated power. This confuses the target if it hits." },
    { name: "Superpower", type: "fighting", category: "physical", power: 120, accuracy: 100, effect: "lowers_user_atk_def", effectChance: 100, description: "The user attacks the target with great power. However, this also lowers the user's Attack and Defense stats." },
    { name: "High Jump Kick", type: "fighting", category: "physical", power: 130, accuracy: 90, effect: "crash_damage_on_miss", effectChance: 100, description: "The target is attacked with a knee kick from a jump. If it misses, the user is hurt instead." },
    { name: "Sky Uppercut", type: "fighting", category: "physical", power: 85, accuracy: 90, effect: null, effectChance: 0, description: "The user attacks the target with an uppercut thrown skyward with force." },
    { name: "Hammer Arm", type: "fighting", category: "physical", power: 100, accuracy: 90, effect: "lowers_user_speed", effectChance: 100, description: "The user swings and hits with its strong, heavy fist. It lowers the user's Speed, however." },
    { name: "Sacred Sword", type: "fighting", category: "physical", power: 90, accuracy: 100, effect: "ignores_stat_changes", effectChance: 100, description: "The user attacks by slicing with a long horn. The target's stat changes don't affect this attack's damage." },
    { name: "Secret Sword", type: "fighting", category: "special", power: 85, accuracy: 100, effect: "uses_target_defense", effectChance: 100, description: "The user cuts with its long horn. The odd power contained in the horn does physical damage to the target." },
    { name: "Force Palm", type: "fighting", category: "physical", power: 60, accuracy: 100, effect: "paralysis", effectChance: 30, description: "The target is attacked with a shock wave. This may also leave the target with paralysis." },
    { name: "Rock Smash", type: "fighting", category: "physical", power: 40, accuracy: 100, effect: "lowers_defense", effectChance: 50, description: "The user attacks with a punch. This may also lower the target's Defense stat." },
    { name: "Vacuum Wave", type: "fighting", category: "special", power: 40, accuracy: 100, effect: "priority", effectChance: 100, description: "The user whirls its fists to send a wave of pure vacuum at the target. This move always goes first." },
    { name: "Storm Throw", type: "fighting", category: "physical", power: 60, accuracy: 100, effect: "always_critical_hit", effectChance: 100, description: "The user strikes the target with a fierce blow. This attack always results in a critical hit." },
    { name: "Circle Throw", type: "fighting", category: "physical", power: 60, accuracy: 90, effect: "forces_switch", effectChance: 100, description: "The target is thrown, and a different Pokémon is dragged out. In the wild, this ends a battle against a single Pokémon." },
    { name: "Body Press", type: "fighting", category: "physical", power: 80, accuracy: 100, effect: "uses_user_defense", effectChance: 100, description: "The user attacks by slamming its body into the target. The higher the user's Defense, the more damage it can inflict on the target." },
    { name: "Thunderous Kick", type: "fighting", category: "physical", power: 90, accuracy: 100, effect: "lowers_defense", effectChance: 100, description: "The user overwhelms the target with lightning-like movement before delivering a kick. This also lowers the target's Defense stat." },
    { name: "Collision Course", type: "fighting", category: "physical", power: 100, accuracy: 100, effect: "super_effective_boost", effectChance: 100, description: "The user transforms and crashes down onto the target. This move's power is boosted more than usual if it's a supereffective hit." },

    // Poison Type Moves
    { name: "Poison Sting", type: "poison", category: "physical", power: 15, accuracy: 100, effect: "poison", effectChance: 30, description: "The user stabs the target with a poisonous stinger. This may also poison the target." },
    { name: "Sludge Bomb", type: "poison", category: "special", power: 90, accuracy: 100, effect: "poison", effectChance: 30, description: "Unsanitary sludge is hurled at the target. This may also poison the target." },
    { name: "Sludge Wave", type: "poison", category: "special", power: 95, accuracy: 100, effect: "poison", effectChance: 10, description: "The user strikes everything around it by swamping the area with a giant sludge wave. This may also poison those hit." },
    { name: "Poison Jab", type: "poison", category: "physical", power: 80, accuracy: 100, effect: "poison", effectChance: 30, description: "The target is stabbed with a tentacle, arm, or the like steeped in poison. This may also poison the target." },
    { name: "Cross Poison", type: "poison", category: "physical", power: 70, accuracy: 100, effects: [{ effect: "poison", chance: 10 }, { effect: "high_critical_hit", chance: 100 }], description: "A slashing attack with a poisonous blade that may also poison the target. Critical hits land more easily." },
    { name: "Gunk Shot", type: "poison", category: "physical", power: 120, accuracy: 80, effect: "poison", effectChance: 30, description: "The user shoots filthy garbage at the target to attack. This may also poison the target." },
    { name: "Venoshock", type: "poison", category: "special", power: 65, accuracy: 100, effect: "power_doubles_if_poisoned", effectChance: 100, description: "The user drenches the target in a special poisonous liquid. This move's power is doubled if the target is poisoned." },
    { name: "Acid", type: "poison", category: "special", power: 40, accuracy: 100, effect: "lowers_sp_def", effectChance: 10, description: "Opposing Pokémon are attacked with a spray of harsh acid. This may also lower their Sp. Def stats." },
    { name: "Acid Spray", type: "poison", category: "special", power: 40, accuracy: 100, effect: "lowers_sp_def_2", effectChance: 100, description: "The user spits fluid that works to melt the target. This harshly lowers the target's Sp. Def stat." },
    { name: "Belch", type: "poison", category: "special", power: 120, accuracy: 90, effect: "requires_berry", effectChance: 100, description: "The user lets out a damaging belch at the target. The user must eat a held Berry to use this move." },
    { name: "Clear Smog", type: "poison", category: "special", power: 50, accuracy: 100, effect: "resets_stat_changes", effectChance: 100, description: "The user attacks the target by throwing a clump of special mud. All stat changes are returned to normal." },
    { name: "Poison Fang", type: "poison", category: "physical", power: 50, accuracy: 100, effect: "bad_poison", effectChance: 50, description: "The user bites the target with toxic fangs. This may also leave the target badly poisoned." },
    { name: "Shell Side Arm", type: "poison", category: "special", power: 90, accuracy: 100, effect: "poison_physical_or_special", effectChance: 20, description: "This move inflicts physical or special damage, whichever will be more effective. This may also poison the target." },
    { name: "Dire Claw", type: "poison", category: "physical", power: 80, accuracy: 100, effect: "poison_paralysis_sleep", effectChance: 50, description: "The user lashes out at the target with ruinous claws. This may also leave the target poisoned, paralyzed, or asleep." },
    { name: "Mortal Spin", type: "poison", category: "physical", power: 30, accuracy: 100, effect: "poison_removes_hazards", effectChance: 100, description: "The user performs a spin attack that can also eliminate the effects of binding moves and Leech Seed. This also poisons opposing Pokémon." },
    { name: "Noxious Torque", type: "poison", category: "physical", power: 100, accuracy: 100, effect: "poison", effectChance: 30, description: "The user revs their engine and crashes into the target. This may also poison the target." },

    // Ground Type Moves
    { name: "Earthquake", type: "ground", category: "physical", power: 100, accuracy: 100, effect: null, effectChance: 0, description: "The user sets off an earthquake that strikes every Pokémon around it." },
    { name: "Earth Power", type: "ground", category: "special", power: 90, accuracy: 100, effect: "lowers_sp_def", effectChance: 10, description: "The user makes the ground under the target erupt with power. This may also lower the target's Sp. Def stat." },
    { name: "Dig", type: "ground", category: "physical", power: 80, accuracy: 100, effect: "two_turn_move", effectChance: 100, description: "The user burrows into the ground, then attacks on the next turn." },
    { name: "Drill Run", type: "ground", category: "physical", power: 80, accuracy: 95, effect: "high_critical_hit", effectChance: 100, description: "The user crashes into its target while rotating its body like a drill. Critical hits land more easily." },
    { name: "Mud Shot", type: "ground", category: "special", power: 55, accuracy: 95, effect: "lowers_speed", effectChance: 100, description: "The user attacks by hurling a blob of mud at the target. This also lowers the target's Speed stat." },
    { name: "Mud Bomb", type: "ground", category: "special", power: 65, accuracy: 85, effect: "lowers_accuracy", effectChance: 30, description: "The user launches a hard-packed mud ball to attack. This may also lower the target's accuracy." },
    { name: "Mud-Slap", type: "ground", category: "special", power: 20, accuracy: 100, effect: "lowers_accuracy", effectChance: 100, description: "The user hurls mud in the target's face to inflict damage and lower its accuracy." },
    { name: "Bulldoze", type: "ground", category: "physical", power: 60, accuracy: 100, effect: "lowers_speed", effectChance: 100, description: "The user strikes everything around it by stomping down on the ground. This lowers the Speed stat of those hit." },
    { name: "High Horsepower", type: "ground", category: "physical", power: 95, accuracy: 95, effect: null, effectChance: 0, description: "The user fiercely attacks the target using its entire body." },
    { name: "Precipice Blades", type: "ground", category: "physical", power: 120, accuracy: 85, effect: null, effectChance: 0, description: "The user attacks opposing Pokémon by manifesting the power of the land in fearsome blades of stone." },
    { name: "Land's Wrath", type: "ground", category: "physical", power: 90, accuracy: 100, effect: null, effectChance: 0, description: "The user gathers the energy of the land and focuses that power on opposing Pokémon to damage them." },
    { name: "Thousand Arrows", type: "ground", category: "physical", power: 90, accuracy: 100, effect: "hits_flying_grounds", effectChance: 100, description: "This move also hits opposing Pokémon that are in the air. Those Pokémon are knocked down to the ground." },
    { name: "Thousand Waves", type: "ground", category: "physical", power: 90, accuracy: 100, effect: "traps_target", effectChance: 100, description: "The user attacks with a wave that crawls along the ground. Those hit can't flee from battle." },
    { name: "Stomping Tantrum", type: "ground", category: "physical", power: 75, accuracy: 100, effect: "power_doubles_if_last_move_failed", effectChance: 100, description: "Driven by frustration, the user attacks the target. If the user's previous move has failed, the power of this move doubles." },
    { name: "Scorching Sands", type: "ground", category: "special", power: 70, accuracy: 100, effect: "burn", effectChance: 30, description: "The user throws scorching sand at the target to attack. This may also leave the target with a burn." },
    { name: "Headlong Rush", type: "ground", category: "physical", power: 120, accuracy: 100, effect: "lowers_user_def_spdef", effectChance: 100, description: "The user smashes into the target in a full-body tackle. This also lowers the user's Defense and Sp. Def stats." },
    { name: "Sand Attack", type: "ground", category: "status", power: 0, accuracy: 100, effect: "lowers_accuracy", effectChance: 100, description: "Sand is hurled in the target's face, reducing the target's accuracy." },

    // Flying Type Moves
    { name: "Gust", type: "flying", category: "special", power: 40, accuracy: 100, effect: null, effectChance: 0, description: "A gust of wind is whipped up by wings and launched at the target to inflict damage." },
    { name: "Wing Attack", type: "flying", category: "physical", power: 60, accuracy: 100, effect: null, effectChance: 0, description: "The target is struck with large, imposing wings spread wide to inflict damage." },
    { name: "Aerial Ace", type: "flying", category: "physical", power: 60, accuracy: 100, effect: "never_misses", effectChance: 100, description: "The user confounds the target with speed, then slashes. This attack never misses." },
    { name: "Air Slash", type: "flying", category: "special", power: 75, accuracy: 95, effect: "flinch", effectChance: 30, description: "The user attacks with a blade of air that slices even the sky. This may also make the target flinch." },
    { name: "Hurricane", type: "flying", category: "special", power: 110, accuracy: 70, effect: "confusion", effectChance: 30, description: "The user attacks by wrapping its opponent in a fierce wind that flies up into the sky. This may also confuse the target." },
    { name: "Brave Bird", type: "flying", category: "physical", power: 120, accuracy: 100, effect: "recoil", effectChance: 100, description: "The user tucks in its wings and charges from a low altitude. This also damages the user quite a lot." },
    { name: "Fly", type: "flying", category: "physical", power: 90, accuracy: 95, effect: "two_turn_move", effectChance: 100, description: "The user flies up into the sky and then strikes its target on the next turn." },
    { name: "Drill Peck", type: "flying", category: "physical", power: 80, accuracy: 100, effect: null, effectChance: 0, description: "A corkscrewing attack that strikes the target with a sharp beak acting as a drill." },
    { name: "Sky Attack", type: "flying", category: "physical", power: 140, accuracy: 90, effects: [{ effect: "flinch", chance: 30 }, { effect: "high_critical_hit", chance: 100 }], description: "A second-turn attack move where critical hits land more easily. This may also make the target flinch." },
    { name: "Acrobatics", type: "flying", category: "physical", power: 55, accuracy: 100, effect: "power_doubles_no_item", effectChance: 100, description: "The user nimbly strikes the target. If the user is not holding an item, this attack inflicts massive damage." },
    { name: "Peck", type: "flying", category: "physical", power: 35, accuracy: 100, effect: null, effectChance: 0, description: "The target is jabbed with a sharply pointed beak or horn." },
    { name: "Pluck", type: "flying", category: "physical", power: 60, accuracy: 100, effect: "eats_berry", effectChance: 100, description: "The user pecks the target. If the target is holding a Berry, the user eats it and gains its effect." },
    { name: "Bounce", type: "flying", category: "physical", power: 85, accuracy: 85, effect: "paralysis", effectChance: 30, description: "The user bounces up high, then drops on the target on the second turn. This may also leave the target with paralysis." },
    { name: "Oblivion Wing", type: "flying", category: "special", power: 80, accuracy: 100, effect: "drain_hp_75", effectChance: 100, description: "The user absorbs its target's HP. The user's HP is restored by over half of the damage taken by the target." },
    { name: "Dragon Ascent", type: "flying", category: "physical", power: 120, accuracy: 100, effect: "lowers_user_def_spdef", effectChance: 100, description: "After soaring upward, the user attacks its target by dropping out of the sky at high speeds. But it lowers its own Defense and Sp. Def stats." },
    { name: "Dual Wingbeat", type: "flying", category: "physical", power: 40, accuracy: 90, effect: "hits_twice", effectChance: 100, description: "The user slams the target with its wings. The target is hit twice in a row." },
    { name: "Bleakwind Storm", type: "flying", category: "special", power: 100, accuracy: 80, effect: "frostbite", effectChance: 30, description: "The user attacks with savagely cold winds that cause both body and spirit to tremble. This may also leave the target with frostbite." },

    // Psychic Type Moves
    { name: "Confusion", type: "psychic", category: "special", power: 50, accuracy: 100, effect: "confusion", effectChance: 10, description: "The target is hit by a weak telekinetic force. This may also confuse the target." },
    { name: "Psychic", type: "psychic", category: "special", power: 90, accuracy: 100, effect: "lowers_sp_def", effectChance: 10, description: "The target is hit by a strong telekinetic force. This may also lower the target's Sp. Def stat." },
    { name: "Psyshock", type: "psychic", category: "special", power: 80, accuracy: 100, effect: "uses_target_defense", effectChance: 100, description: "The user materializes an odd psychic wave to attack the target. This attack does physical damage." },
    { name: "Psybeam", type: "psychic", category: "special", power: 65, accuracy: 100, effect: "confusion", effectChance: 10, description: "The target is attacked with a peculiar ray. This may also confuse the target." },
    { name: "Psycho Cut", type: "psychic", category: "physical", power: 70, accuracy: 100, effect: "high_critical_hit", effectChance: 100, description: "The user tears at the target with blades formed by psychic power. Critical hits land more easily." },
    { name: "Zen Headbutt", type: "psychic", category: "physical", power: 80, accuracy: 90, effect: "flinch", effectChance: 20, description: "The user focuses its willpower to its head and attacks the target. This may also make the target flinch." },
    { name: "Psystrike", type: "psychic", category: "special", power: 100, accuracy: 100, effect: "uses_target_defense", effectChance: 100, description: "The user materializes an odd psychic wave to attack the target. This attack does physical damage." },
    { name: "Future Sight", type: "psychic", category: "special", power: 120, accuracy: 100, effect: "delayed_attack", effectChance: 100, description: "Two turns after this move is used, a hunk of psychic energy attacks the target." },
    { name: "Extrasensory", type: "psychic", category: "special", power: 80, accuracy: 100, effect: "flinch", effectChance: 10, description: "The user attacks with an odd, unseeable power. This may also make the target flinch." },
    { name: "Stored Power", type: "psychic", category: "special", power: 20, accuracy: 100, effect: "power_scales_with_stat_boosts", effectChance: 100, description: "The user attacks the target with stored power. The more the user's stats are raised, the greater the move's power." },
    { name: "Photon Geyser", type: "psychic", category: "special", power: 100, accuracy: 100, effect: "uses_higher_attack_stat", effectChance: 100, description: "The user attacks a target with a pillar of light. This move inflicts Attack or Sp. Atk damage—whichever stat is higher for the user." },
    { name: "Prismatic Laser", type: "psychic", category: "special", power: 160, accuracy: 100, effect: "recharge", effectChance: 100, description: "The user shoots powerful lasers using the power of a prism. The user can't move on the next turn." },
    { name: "Luster Purge", type: "psychic", category: "special", power: 70, accuracy: 100, effect: "lowers_sp_def", effectChance: 50, description: "The user lets loose a damaging burst of light. This may also lower the target's Sp. Def stat." },
    { name: "Mist Ball", type: "psychic", category: "special", power: 70, accuracy: 100, effect: "lowers_sp_atk", effectChance: 50, description: "A mist-like flurry of down envelops and damages the target. This may also lower the target's Sp. Atk stat." },
    { name: "Psycho Boost", type: "psychic", category: "special", power: 140, accuracy: 90, effect: "lowers_user_sp_atk_2", effectChance: 100, description: "The user attacks the target at full power. The attack's recoil harshly lowers the user's Sp. Atk stat." },
    { name: "Expanding Force", type: "psychic", category: "special", power: 80, accuracy: 100, effect: "power_boost_on_psychic_terrain", effectChance: 100, description: "The user attacks the target with its psychic power. This move's power goes up and damages all opposing Pokémon on Psychic Terrain." },
    { name: "Eerie Spell", type: "psychic", category: "special", power: 80, accuracy: 100, effect: "removes_pp", effectChance: 100, description: "The user attacks with its tremendous psychic power. This also removes 3 PP from the target's last move." },
    { name: "Freezing Glare", type: "psychic", category: "special", power: 90, accuracy: 100, effect: "freeze", effectChance: 10, description: "The user shoots its psychic power from its eyes to attack. This may also leave the target frozen." },
    { name: "Esper Wing", type: "psychic", category: "special", power: 80, accuracy: 100, effect: "raises_user_speed_high_crit", effectChance: 100, description: "The user slashes the target with aura-enriched wings. This also boosts the user's Speed stat. It has a heightened chance of landing a critical hit." },
    { name: "Lumina Crash", type: "psychic", category: "special", power: 80, accuracy: 100, effect: "lowers_sp_def_2", effectChance: 100, description: "The user attacks by unleashing a peculiar light that even affects the mind. This also harshly lowers the target's Sp. Def stat." },
    { name: "Twin Beam", type: "psychic", category: "special", power: 40, accuracy: 100, effect: "hits_twice", effectChance: 100, description: "The user shoots mystical beams from its eyes to inflict damage. The target is hit twice in a row." },
    { name: "Mirror Coat", type: "psychic", category: "special", power: 1, accuracy: 100, effect: "counter_special_2x", effectChance: 100, description: "A retaliation move that counters any special attack, inflicting double the damage taken." },

    // Bug Type Moves
    { name: "Bug Bite", type: "bug", category: "physical", power: 60, accuracy: 100, effect: "eats_berry", effectChance: 100, description: "The user bites the target. If the target is holding a Berry, the user eats it and gains its effect." },
    { name: "X-Scissor", type: "bug", category: "physical", power: 80, accuracy: 100, effect: null, effectChance: 0, description: "The user slashes at the target by crossing its scythes or claws as if they were a pair of scissors." },
    { name: "Bug Buzz", type: "bug", category: "special", power: 90, accuracy: 100, effect: "lowers_sp_def", effectChance: 10, description: "The user generates a damaging sound wave by vibration. This may also lower the target's Sp. Def stat." },
    { name: "Signal Beam", type: "bug", category: "special", power: 75, accuracy: 100, effect: "confusion", effectChance: 10, description: "The user attacks with a sinister beam of light. This may also confuse the target." },
    { name: "Megahorn", type: "bug", category: "physical", power: 120, accuracy: 85, effect: null, effectChance: 0, description: "Using its tough and impressive horn, the user rams into the target with no letup." },
    { name: "U-turn", type: "bug", category: "physical", power: 70, accuracy: 100, effect: "switch_out", effectChance: 100, description: "After making its attack, the user rushes back to switch places with a party Pokémon in waiting." },
    { name: "Leech Life", type: "bug", category: "physical", power: 80, accuracy: 100, effect: "drain_hp", effectChance: 100, description: "The user drains the target's blood. The user's HP is restored by half the damage taken by the target." },
    { name: "Pin Missile", type: "bug", category: "physical", power: 25, accuracy: 95, effect: "multi_hit_2_to_5", effectChance: 100, description: "Sharp spikes are shot at the target in rapid succession. They hit two to five times in a row." },
    { name: "Fury Cutter", type: "bug", category: "physical", power: 40, accuracy: 95, effect: "power_increases_consecutive", effectChance: 100, description: "The target is slashed with scythes or claws. This attack becomes more powerful if it hits in succession." },
    { name: "Silver Wind", type: "bug", category: "special", power: 60, accuracy: 100, effect: "raises_all_stats", effectChance: 10, description: "The target is attacked with powdery scales blown by the wind. This may also raise all the user's stats." },
    { name: "Attack Order", type: "bug", category: "physical", power: 90, accuracy: 100, effect: "high_critical_hit", effectChance: 100, description: "The user calls out its underlings to pummel the target. Critical hits land more easily." },
    { name: "Lunge", type: "bug", category: "physical", power: 80, accuracy: 100, effect: "lowers_attack", effectChance: 100, description: "The user makes a lunge at the target, attacking with full force. This also lowers the target's Attack stat." },
    { name: "First Impression", type: "bug", category: "physical", power: 90, accuracy: 100, effect: "first_turn_only", effectChance: 100, description: "Although this move has great power, it only works the first turn each time the user enters battle." },
    { name: "Pollen Puff", type: "bug", category: "special", power: 90, accuracy: 100, effect: "heals_ally", effectChance: 100, description: "The user attacks the enemy with a pollen puff that explodes. If the target is an ally, it gives the ally a pollen puff that restores its HP instead." },
    { name: "Fell Stinger", type: "bug", category: "physical", power: 50, accuracy: 100, effect: "raises_attack_3_on_ko", effectChance: 100, description: "When the user knocks out a target with this move, the user's Attack stat rises drastically." },
    { name: "Infestation", type: "bug", category: "special", power: 20, accuracy: 100, effect: "trap", effectChance: 100, description: "The target is infested and attacked for four to five turns. The target can't flee during this time." },
    { name: "Skitter Smack", type: "bug", category: "physical", power: 70, accuracy: 90, effect: "lowers_sp_atk", effectChance: 100, description: "The user skitters behind the target to attack. This also lowers the target's Sp. Atk stat." },

    // Rock Type Moves
    { name: "Rock Throw", type: "rock", category: "physical", power: 50, accuracy: 90, effect: null, effectChance: 0, description: "The user picks up and throws a small rock at the target to attack." },
    { name: "Rock Slide", type: "rock", category: "physical", power: 75, accuracy: 90, effect: "flinch", effectChance: 30, description: "Large boulders are hurled at opposing Pokémon to inflict damage. This may also make the opposing Pokémon flinch." },
    { name: "Stone Edge", type: "rock", category: "physical", power: 100, accuracy: 80, effect: "high_critical_hit", effectChance: 100, description: "The user stabs the target from below with sharpened stones. Critical hits land more easily." },
    { name: "Rock Blast", type: "rock", category: "physical", power: 25, accuracy: 90, effect: "multi_hit_2_to_5", effectChance: 100, description: "The user hurls hard rocks at the target. Two to five rocks are launched in a row." },
    { name: "Power Gem", type: "rock", category: "special", power: 80, accuracy: 100, effect: null, effectChance: 0, description: "The user attacks with a ray of light that sparkles as if it were made of gemstones." },
    { name: "Ancient Power", type: "rock", category: "special", power: 60, accuracy: 100, effect: "raises_all_stats", effectChance: 10, description: "The user attacks with a prehistoric power. This may also raise all the user's stats at once." },
    { name: "Head Smash", type: "rock", category: "physical", power: 150, accuracy: 80, effect: "recoil", effectChance: 100, description: "The user attacks the target with a hazardous, full-power headbutt. This also damages the user terribly." },
    { name: "Rock Wrecker", type: "rock", category: "physical", power: 150, accuracy: 90, effect: "recharge", effectChance: 100, description: "The user launches a huge boulder at the target to attack. The user can't move on the next turn." },
    { name: "Diamond Storm", type: "rock", category: "physical", power: 100, accuracy: 95, effect: "raises_user_defense_2", effectChance: 50, description: "The user whips up a storm of diamonds to damage opposing Pokémon. This may also sharply raise the user's Defense stat." },
    { name: "Accelerock", type: "rock", category: "physical", power: 40, accuracy: 100, effect: "priority", effectChance: 100, description: "The user smashes into the target at high speed. This move always goes first." },
    { name: "Smack Down", type: "rock", category: "physical", power: 50, accuracy: 100, effect: "grounds_target", effectChance: 100, description: "The user throws a stone or similar projectile to attack the target. A flying Pokémon will fall to the ground when it's hit." },
    { name: "Rollout", type: "rock", category: "physical", power: 30, accuracy: 90, effect: "power_increases_consecutive", effectChance: 100, description: "The user continually rolls into the target over five turns. It becomes more powerful each time it hits." },
    { name: "Meteor Beam", type: "rock", category: "special", power: 120, accuracy: 90, effect: "raises_user_sp_atk_two_turn", effectChance: 100, description: "In this two-turn attack, the user gathers space power and boosts its Sp. Atk stat, then attacks the target on the next turn." },
    { name: "Salt Cure", type: "rock", category: "physical", power: 40, accuracy: 100, effect: "salt_cure", effectChance: 100, description: "The user salt cures the target, inflicting damage every turn. Steel and Water types are more strongly affected by this move." },

    // Ghost Type Moves
    { name: "Shadow Ball", type: "ghost", category: "special", power: 80, accuracy: 100, effect: "lowers_sp_def", effectChance: 20, description: "The user hurls a shadowy blob at the target. This may also lower the target's Sp. Def stat." },
    { name: "Shadow Claw", type: "ghost", category: "physical", power: 70, accuracy: 100, effect: "high_critical_hit", effectChance: 100, description: "The user slashes with a sharp claw made from shadows. Critical hits land more easily." },
    { name: "Shadow Punch", type: "ghost", category: "physical", power: 60, accuracy: 100, effect: "never_misses", effectChance: 100, description: "The user throws a punch from the shadows. This attack never misses." },
    { name: "Shadow Sneak", type: "ghost", category: "physical", power: 40, accuracy: 100, effect: "priority", effectChance: 100, description: "The user extends its shadow and attacks the target from behind. This move always goes first." },
    { name: "Hex", type: "ghost", category: "special", power: 65, accuracy: 100, effect: "power_doubles_if_statused", effectChance: 100, description: "This relentless attack does massive damage to a target affected by status conditions." },
    { name: "Phantom Force", type: "ghost", category: "physical", power: 90, accuracy: 100, effects: [{ effect: "two_turn_move", chance: 100 }, { effect: "bypasses_protect", chance: 100 }], description: "The user vanishes somewhere, then strikes the target on the next turn. This move hits even if the target protects itself." },
    { name: "Shadow Force", type: "ghost", category: "physical", power: 120, accuracy: 100, effect: "bypasses_protect", effectChance: 100, description: "The user disappears, then strikes the target on the next turn. This move hits even if the target protects itself." },
    { name: "Night Shade", type: "ghost", category: "special", power: 1, accuracy: 100, effect: "damage_equals_level", effectChance: 100, description: "The user makes the target see a frightening mirage. It inflicts damage equal to the user's level." },
    { name: "Lick", type: "ghost", category: "physical", power: 30, accuracy: 100, effect: "paralysis", effectChance: 30, description: "The target is licked with a long tongue, causing damage. This may also leave the target with paralysis." },
    { name: "Ominous Wind", type: "ghost", category: "special", power: 60, accuracy: 100, effect: "raises_all_stats", effectChance: 10, description: "The user blasts the target with a gust of repulsive wind. This may also raise all the user's stats at once." },
    { name: "Spectral Thief", type: "ghost", category: "physical", power: 90, accuracy: 100, effect: "steals_stat_boosts", effectChance: 100, description: "The user hides in the target's shadow, steals the target's stat boosts, and then attacks." },
    { name: "Moongeist Beam", type: "ghost", category: "special", power: 100, accuracy: 100, effect: "ignores_ability", effectChance: 100, description: "The user emits a sinister ray to attack the target. This move can be used on the target regardless of its Abilities." },
    { name: "Spirit Shackle", type: "ghost", category: "physical", power: 80, accuracy: 100, effect: "traps_target", effectChance: 100, description: "The user attacks while simultaneously stitching the target's shadow to the ground to prevent the target from escaping." },
    { name: "Poltergeist", type: "ghost", category: "physical", power: 110, accuracy: 90, effect: "fails_if_no_item", effectChance: 100, description: "The user attacks the target by controlling the target's item. The move fails if the target doesn't have an item." },
    { name: "Astral Barrage", type: "ghost", category: "special", power: 120, accuracy: 100, effect: null, effectChance: 0, description: "The user attacks by sending a frightful amount of small ghosts at opposing Pokémon." },
    { name: "Bitter Malice", type: "ghost", category: "special", power: 75, accuracy: 100, effect: "frostbite", effectChance: 100, description: "The user attacks the target with spine-chilling resentment. This also leaves the target with frostbite." },
    { name: "Infernal Parade", type: "ghost", category: "special", power: 60, accuracy: 100, effect: "burn_power_doubles_if_statused", effectChance: 30, description: "The user attacks with myriad fireballs. This may also leave the target with a burn. This move's power is doubled if the target has a status condition." },
    { name: "Last Respects", type: "ghost", category: "physical", power: 50, accuracy: 100, effect: "power_scales_with_fainted_allies", effectChance: 100, description: "The user attacks to avenge its allies. The more defeated allies there are in the party, the greater the move's power." },
    { name: "Rage Fist", type: "ghost", category: "physical", power: 50, accuracy: 100, effect: "power_scales_with_hits_taken", effectChance: 100, description: "The user converts its rage into energy to attack. The more times the user has been hit by attacks, the greater the move's power." },

    // Dragon Type Moves
    { name: "Dragon Claw", type: "dragon", category: "physical", power: 80, accuracy: 100, effect: null, effectChance: 0, description: "The user slashes the target with huge sharp claws." },
    { name: "Dragon Pulse", type: "dragon", category: "special", power: 85, accuracy: 100, effect: null, effectChance: 0, description: "The target is attacked with a shock wave generated by the user's gaping mouth." },
    { name: "Dragon Breath", type: "dragon", category: "special", power: 60, accuracy: 100, effect: "paralysis", effectChance: 30, description: "The user exhales a mighty gust that inflicts damage. This may also leave the target with paralysis." },
    { name: "Outrage", type: "dragon", category: "physical", power: 120, accuracy: 100, effect: "confusion_after", effectChance: 100, description: "The user rampages and attacks for two to three turns. The user then becomes confused." },
    { name: "Draco Meteor", type: "dragon", category: "special", power: 130, accuracy: 90, effect: "lowers_user_sp_atk_2", effectChance: 100, description: "Comets are summoned down from the sky onto the target. The attack's recoil harshly lowers the user's Sp. Atk stat." },
    { name: "Dragon Rush", type: "dragon", category: "physical", power: 100, accuracy: 75, effect: "flinch", effectChance: 20, description: "The user tackles the target while exhibiting overwhelming menace. This may also make the target flinch." },
    { name: "Dragon Tail", type: "dragon", category: "physical", power: 60, accuracy: 90, effect: "forces_switch", effectChance: 100, description: "The target is knocked away, and a different Pokémon is dragged out. In the wild, this ends a battle against a single Pokémon." },
    { name: "Dual Chop", type: "dragon", category: "physical", power: 40, accuracy: 90, effect: "hits_twice", effectChance: 100, description: "The user attacks its target by hitting it with brutal strikes. The target is hit twice in a row." },
    { name: "Spacial Rend", type: "dragon", category: "special", power: 100, accuracy: 95, effect: "high_critical_hit", effectChance: 100, description: "The user tears the target along with the space around it. Critical hits land more easily." },
    { name: "Roar of Time", type: "dragon", category: "special", power: 150, accuracy: 90, effect: "recharge", effectChance: 100, description: "The user blasts the target with power that distorts even time. The user can't move on the next turn." },
    { name: "Core Enforcer", type: "dragon", category: "special", power: 100, accuracy: 100, effect: "suppresses_ability", effectChance: 100, description: "If the Pokémon the user has inflicted damage on have already used their moves, this move eliminates the effect of the target's Ability." },
    { name: "Clanging Scales", type: "dragon", category: "special", power: 110, accuracy: 100, effect: "lowers_user_defense", effectChance: 100, description: "The user rubs the scales on its entire body and makes a huge noise to attack opposing Pokémon. The user's Defense stat goes down after the attack." },
    { name: "Dragon Hammer", type: "dragon", category: "physical", power: 90, accuracy: 100, effect: null, effectChance: 0, description: "The user uses its body like a hammer to attack the target and inflict damage." },
    { name: "Dragon Darts", type: "dragon", category: "physical", power: 50, accuracy: 100, effect: "hits_twice_or_splits", effectChance: 100, description: "The user attacks twice using Dreepy. If there are two targets, this move hits each target once." },
    { name: "Eternabeam", type: "dragon", category: "special", power: 160, accuracy: 90, effect: "recharge", effectChance: 100, description: "This is Eternatus's most powerful attack in its original form. The user can't move on the next turn." },
    { name: "Dragon Energy", type: "dragon", category: "special", power: 150, accuracy: 100, effect: "power_scales_with_hp", effectChance: 100, description: "Converting its life-force into power, the user attacks opposing Pokémon. The lower the user's HP, the lower the move's power." },
    { name: "Scale Shot", type: "dragon", category: "physical", power: 25, accuracy: 90, effect: "multi_hit_raises_speed_lowers_def", effectChance: 100, description: "The user attacks by shooting scales two to five times in a row. This move boosts the user's Speed stat but lowers its Defense stat." },
    { name: "Breaking Swipe", type: "dragon", category: "physical", power: 60, accuracy: 100, effect: "lowers_attack", effectChance: 100, description: "The user swings its tough tail wildly and attacks opposing Pokémon. This also lowers their Attack stats." },
    { name: "Fickle Beam", type: "dragon", category: "special", power: 80, accuracy: 100, effect: "power_doubles_30_percent", effectChance: 30, description: "The user shoots a beam of light to inflict damage. Sometimes all the user's heads shoot beams in unison, doubling the move's power." },

    // Dark Type Moves
    { name: "Bite", type: "dark", category: "physical", power: 60, accuracy: 100, effect: "flinch", effectChance: 30, description: "The target is bitten with viciously sharp fangs. This may also make the target flinch." },
    { name: "Crunch", type: "dark", category: "physical", power: 80, accuracy: 100, effect: "lowers_defense", effectChance: 20, description: "The user crunches up the target with sharp fangs. This may also lower the target's Defense stat." },
    { name: "Dark Pulse", type: "dark", category: "special", power: 80, accuracy: 100, effect: "flinch", effectChance: 20, description: "The user releases a horrible aura imbued with dark thoughts. This may also make the target flinch." },
    { name: "Night Slash", type: "dark", category: "physical", power: 70, accuracy: 100, effect: "high_critical_hit", effectChance: 100, description: "The user slashes the target the instant an opportunity arises. Critical hits land more easily." },
    { name: "Sucker Punch", type: "dark", category: "physical", power: 70, accuracy: 100, effect: "priority_fails_if_not_attacking", effectChance: 100, description: "This move enables the user to attack first. This move fails if the target is not readying an attack." },
    { name: "Foul Play", type: "dark", category: "physical", power: 95, accuracy: 100, effect: "uses_target_attack", effectChance: 100, description: "The user turns the target's power against it. The higher the target's Attack stat, the greater the damage it deals." },
    { name: "Knock Off", type: "dark", category: "physical", power: 65, accuracy: 100, effect: "removes_item", effectChance: 100, description: "The user slaps down the target's held item, making it unable to be used in that battle. It deals more damage if the target has an item." },
    { name: "Payback", type: "dark", category: "physical", power: 50, accuracy: 100, effect: "power_doubles_if_hit", effectChance: 100, description: "The user stores power, then attacks. If the user moves after the target, this attack's power will be doubled." },
    { name: "Pursuit", type: "dark", category: "physical", power: 40, accuracy: 100, effect: "power_doubles_if_switching", effectChance: 100, description: "The power of this attack move is doubled if it's used on a target that's switching out of battle." },
    { name: "Throat Chop", type: "dark", category: "physical", power: 80, accuracy: 100, effect: "prevents_sound_moves", effectChance: 100, description: "The user attacks the target's throat, and the resultant suffering prevents the target from using moves that emit sound for two turns." },
    { name: "Assurance", type: "dark", category: "physical", power: 60, accuracy: 100, effect: "power_doubles_if_damaged", effectChance: 100, description: "If the target has already taken some damage in the same turn, this attack's power is doubled." },
    { name: "Brutal Swing", type: "dark", category: "physical", power: 60, accuracy: 100, effect: null, effectChance: 0, description: "The user swings its body around violently to inflict damage on everything in its vicinity." },
    { name: "Hyperspace Fury", type: "dark", category: "physical", power: 100, accuracy: 100, effect: "bypasses_protect_lowers_def", effectChance: 100, description: "Using its many arms, the user unleashes a barrage of attacks that ignore the effects of moves like Protect and Detect. The user's Defense stat falls." },
    { name: "Darkest Lariat", type: "dark", category: "physical", power: 85, accuracy: 100, effect: "ignores_stat_changes", effectChance: 100, description: "The user swings both arms and hits the target. The target's stat changes don't affect this attack's damage." },
    { name: "Fiery Wrath", type: "dark", category: "special", power: 90, accuracy: 100, effect: "flinch", effectChance: 20, description: "The user transforms its wrath into a fire-like aura to attack. This may also make opposing Pokémon flinch." },
    { name: "Lash Out", type: "dark", category: "physical", power: 75, accuracy: 100, effect: "power_doubles_if_stats_lowered", effectChance: 100, description: "The user lashes out to vent its frustration toward the target. If the user's stats were lowered during this turn, the power of this move is doubled." },
    { name: "False Surrender", type: "dark", category: "physical", power: 80, accuracy: 100, effect: "never_misses", effectChance: 100, description: "The user pretends to bow its head, but then it stabs the target with its disheveled hair. This attack never misses." },
    { name: "Wicked Blow", type: "dark", category: "physical", power: 75, accuracy: 100, effect: "always_critical_hit", effectChance: 100, description: "The user, having mastered the Dark style, strikes the target with a fierce blow. This attack always results in a critical hit." },
    { name: "Jaw Lock", type: "dark", category: "physical", power: 80, accuracy: 100, effect: "traps_both", effectChance: 100, description: "This move prevents the user and the target from switching out until either of them faints." },
    { name: "Obstruct", type: "dark", category: "status", power: 0, accuracy: 100, effect: "protect_lowers_def_on_contact", effectChance: 100, description: "This move enables the user to protect itself from all attacks. Its chance of failing rises if it is used in succession. Direct contact harshly lowers the attacker's Defense stat." },
    { name: "Kowtow Cleave", type: "dark", category: "physical", power: 85, accuracy: 100, effect: "never_misses", effectChance: 100, description: "The user slashes at the target after kowtowing to make the target unable to be on guard. This attack never misses." },
    { name: "Ruination", type: "dark", category: "special", power: 1, accuracy: 90, effect: "halves_hp", effectChance: 100, description: "The user summons a ruinous disaster. This cuts the target's HP in half." },
    { name: "Comeuppance", type: "dark", category: "physical", power: 1, accuracy: 100, effect: "counter_1_5x", effectChance: 100, description: "The user retaliates against the target that last inflicted damage on it. The more damage the user received, the more damage this attack deals." },

    // Steel Type Moves
    { name: "Metal Claw", type: "steel", category: "physical", power: 50, accuracy: 95, effect: "raises_user_attack", effectChance: 10, description: "The target is raked with steel claws. This may also raise the user's Attack stat." },
    { name: "Iron Tail", type: "steel", category: "physical", power: 100, accuracy: 75, effect: "lowers_defense", effectChance: 30, description: "The target is slammed with a steel-hard tail. This may also lower the target's Defense stat." },
    { name: "Iron Head", type: "steel", category: "physical", power: 80, accuracy: 100, effect: "flinch", effectChance: 30, description: "The user slams the target with its steel-hard head. This may also make the target flinch." },
    { name: "Steel Wing", type: "steel", category: "physical", power: 70, accuracy: 90, effect: "raises_user_defense", effectChance: 10, description: "The target is hit with wings of steel. This may also raise the user's Defense stat." },
    { name: "Flash Cannon", type: "steel", category: "special", power: 80, accuracy: 100, effect: "lowers_sp_def", effectChance: 10, description: "The user gathers all its light energy and releases it at once. This may also lower the target's Sp. Def stat." },
    { name: "Meteor Mash", type: "steel", category: "physical", power: 90, accuracy: 90, effect: "raises_user_attack", effectChance: 20, description: "The target is hit with a hard punch fired like a meteor. This may also raise the user's Attack stat." },
    { name: "Bullet Punch", type: "steel", category: "physical", power: 40, accuracy: 100, effect: "priority", effectChance: 100, description: "The user strikes the target with tough punches as fast as bullets. This move always goes first." },
    { name: "Gyro Ball", type: "steel", category: "physical", power: 1, accuracy: 100, effect: "power_scales_with_speed_difference", effectChance: 100, description: "The user tackles the target with a high-speed spin. The slower the user compared to the target, the greater the move's power." },
    { name: "Heavy Slam", type: "steel", category: "physical", power: 1, accuracy: 100, effect: "power_scales_with_weight_difference", effectChance: 100, description: "The user slams into the target with its heavy body. The more the user outweighs the target, the greater the move's power." },
    { name: "Doom Desire", type: "steel", category: "special", power: 140, accuracy: 100, effect: "delayed_attack", effectChance: 100, description: "Two turns after this move is used, a concentrated bundle of light blasts the target." },
    { name: "Magnet Bomb", type: "steel", category: "physical", power: 60, accuracy: 100, effect: "never_misses", effectChance: 100, description: "The user launches steel bombs that stick to the target. This attack never misses." },
    { name: "Mirror Shot", type: "steel", category: "special", power: 65, accuracy: 85, effect: "lowers_accuracy", effectChance: 30, description: "The user lets loose a flash of energy at the target from its polished body. This may also lower the target's accuracy." },
    { name: "Gear Grind", type: "steel", category: "physical", power: 50, accuracy: 85, effect: "hits_twice", effectChance: 100, description: "The user attacks by throwing steel gears at its target twice." },
    { name: "Smart Strike", type: "steel", category: "physical", power: 70, accuracy: 100, effect: "never_misses", effectChance: 100, description: "The user stabs the target with a sharp horn. This attack never misses." },
    { name: "Anchor Shot", type: "steel", category: "physical", power: 80, accuracy: 100, effect: "traps_target", effectChance: 100, description: "The user entangles the target with its anchor chain while attacking. The target becomes unable to flee." },
    { name: "Sunsteel Strike", type: "steel", category: "physical", power: 100, accuracy: 100, effect: "ignores_ability", effectChance: 100, description: "The user slams into the target with the force of a meteor. This move can be used on the target regardless of its Abilities." },
    { name: "Double Iron Bash", type: "steel", category: "physical", power: 60, accuracy: 100, effect: "flinch_hits_twice", effectChance: 30, description: "The user rotates, centering the hex nut in its chest, and then strikes with its arms twice in a row. This may also make the target flinch." },
    { name: "Behemoth Blade", type: "steel", category: "physical", power: 100, accuracy: 100, effect: "double_damage_dynamax", effectChance: 100, description: "The user wields a large, powerful sword using its whole body and cuts the target. This deals double damage to Dynamaxed Pokémon." },
    { name: "Behemoth Bash", type: "steel", category: "physical", power: 100, accuracy: 100, effect: "double_damage_dynamax", effectChance: 100, description: "The user's body becomes a firm shield and slams into the target. This deals double damage to Dynamaxed Pokémon." },
    { name: "Steel Beam", type: "steel", category: "special", power: 140, accuracy: 95, effect: "recoil_hp", effectChance: 100, description: "The user fires a beam of steel that it collected from its entire body. This also damages the user." },
    { name: "Steel Roller", type: "steel", category: "physical", power: 130, accuracy: 100, effect: "removes_terrain", effectChance: 100, description: "The user attacks while destroying the terrain. This move fails when the ground hasn't been turned into a terrain." },
    { name: "Make It Rain", type: "steel", category: "special", power: 120, accuracy: 100, effect: "lowers_user_sp_atk", effectChance: 100, description: "The user attacks by throwing out a mass of coins. This also lowers the user's Sp. Atk stat. Money is earned after the battle." },
    { name: "Gigaton Hammer", type: "steel", category: "physical", power: 160, accuracy: 100, effect: "cannot_use_twice", effectChance: 100, description: "The user swings its whole body around to attack with its huge hammer. This move can't be used twice in a row." },
    { name: "Tachyon Cutter", type: "steel", category: "special", power: 50, accuracy: 100, effect: "never_misses_hits_twice", effectChance: 100, description: "The user attacks by launching particle blades at the target twice in a row. This attack never misses." },

    // Fairy Type Moves
    { name: "Fairy Wind", type: "fairy", category: "special", power: 40, accuracy: 100, effect: null, effectChance: 0, description: "The user stirs up a fairy wind and strikes the target with it." },
    { name: "Moonblast", type: "fairy", category: "special", power: 95, accuracy: 100, effect: "lowers_sp_atk", effectChance: 30, description: "Borrowing the power of the moon, the user attacks the target. This may also lower the target's Sp. Atk stat." },
    { name: "Dazzling Gleam", type: "fairy", category: "special", power: 80, accuracy: 100, effect: null, effectChance: 0, description: "The user damages opposing Pokémon by emitting a powerful flash." },
    { name: "Play Rough", type: "fairy", category: "physical", power: 90, accuracy: 90, effect: "lowers_attack", effectChance: 10, description: "The user plays rough with the target and attacks it. This may also lower the target's Attack stat." },
    { name: "Draining Kiss", type: "fairy", category: "special", power: 50, accuracy: 100, effect: "drain_hp_75", effectChance: 100, description: "The user steals the target's HP with a kiss. The user's HP is restored by over half of the damage taken by the target." },
    { name: "Disarming Voice", type: "fairy", category: "special", power: 40, accuracy: 100, effect: "never_misses", effectChance: 100, description: "Letting out a charming cry, the user does emotional damage to opposing Pokémon. This attack never misses." },
    { name: "Geomancy", type: "fairy", category: "status", power: 0, accuracy: 100, effect: "raises_sp_atk_sp_def_speed_2", effectChance: 100, description: "The user absorbs energy and sharply raises its Sp. Atk, Sp. Def, and Speed stats on the next turn." },
    { name: "Nature's Madness", type: "fairy", category: "special", power: 1, accuracy: 90, effect: "halves_hp", effectChance: 100, description: "The user hits the target with the force of nature. It halves the target's HP." },
    { name: "Fleur Cannon", type: "fairy", category: "special", power: 130, accuracy: 90, effect: "lowers_user_sp_atk_2", effectChance: 100, description: "The user unleashes a strong beam. The attack's recoil harshly lowers the user's Sp. Atk stat." },
    { name: "Spirit Break", type: "fairy", category: "physical", power: 75, accuracy: 100, effect: "lowers_sp_atk", effectChance: 100, description: "The user attacks the target with so much force that it could break the target's spirit. This also lowers the target's Sp. Atk stat." },
    { name: "Strange Steam", type: "fairy", category: "special", power: 90, accuracy: 95, effect: "confusion", effectChance: 20, description: "The user attacks the target by emitting steam. This may also confuse the target." },
    { name: "Decorate", type: "fairy", category: "status", power: 0, accuracy: 100, effect: "raises_target_atk_sp_atk_2", effectChance: 100, description: "The user sharply raises the target's Attack and Sp. Atk stats by decorating the target." },
    { name: "Springtide Storm", type: "fairy", category: "special", power: 100, accuracy: 80, effect: "lowers_attack", effectChance: 30, description: "The user attacks by wrapping opposing Pokémon in fierce winds brimming with love and hate. This may also lower their Attack stats." },
    { name: "Alluring Voice", type: "fairy", category: "special", power: 80, accuracy: 100, effect: "confusion_if_stat_raised", effectChance: 100, description: "The user attacks the target using its angelic voice. This also confuses the target if its stats have been boosted during the turn." },

    // Additional Status and Utility Moves
    { name: "Swords Dance", type: "normal", category: "status", power: 0, accuracy: 100, effect: "raises_user_attack_2", effectChance: 100, description: "A frenetic dance to uplift the fighting spirit. This sharply raises the user's Attack stat." },
    { name: "Dragon Dance", type: "dragon", category: "status", power: 0, accuracy: 100, effect: "raises_user_attack_speed", effectChance: 100, description: "The user vigorously performs a mystic, powerful dance that raises its Attack and Speed stats." },
    { name: "Calm Mind", type: "psychic", category: "status", power: 0, accuracy: 100, effect: "raises_user_sp_atk_sp_def", effectChance: 100, description: "The user quietly focuses its mind and calms its spirit to raise its Sp. Atk and Sp. Def stats." },
    { name: "Agility", type: "psychic", category: "status", power: 0, accuracy: 100, effect: "raises_user_speed_2", effectChance: 100, description: "The user relaxes and lightens its body to move faster. This sharply raises the Speed stat." },
    { name: "Bulk Up", type: "fighting", category: "status", power: 0, accuracy: 100, effect: "raises_user_attack_defense", effectChance: 100, description: "The user tenses its muscles to bulk up its body, raising both its Attack and Defense stats." },
    { name: "Quiver Dance", type: "bug", category: "status", power: 0, accuracy: 100, effect: "raises_user_sp_atk_sp_def_speed", effectChance: 100, description: "The user lightly performs a beautiful, mystic dance. This boosts the user's Sp. Atk, Sp. Def, and Speed stats." },
    { name: "Shell Smash", type: "normal", category: "status", power: 0, accuracy: 100, effect: "shell_smash", effectChance: 100, description: "The user breaks its shell, which lowers Defense and Sp. Def stats but sharply raises its Attack, Sp. Atk, and Speed stats." },
    { name: "Coil", type: "poison", category: "status", power: 0, accuracy: 100, effect: "raises_user_attack_defense_accuracy", effectChance: 100, description: "The user coils up and concentrates. This raises its Attack and Defense stats as well as its accuracy." },
    { name: "Stealth Rock", type: "rock", category: "status", power: 0, accuracy: 100, effect: "sets_stealth_rock", effectChance: 100, description: "The user lays a trap of levitating stones around the opposing team. The trap hurts opposing Pokémon that switch into battle." },
    { name: "Spikes", type: "ground", category: "status", power: 0, accuracy: 100, effect: "sets_spikes", effectChance: 100, description: "The user lays a trap of spikes at the opposing team's feet. The trap hurts Pokémon that switch into battle." },
    { name: "Toxic Spikes", type: "poison", category: "status", power: 0, accuracy: 100, effect: "sets_toxic_spikes", effectChance: 100, description: "The user lays a trap of poison spikes at the feet of the opposing team. The spikes poison Pokémon that switch into battle." },
    { name: "Sticky Web", type: "bug", category: "status", power: 0, accuracy: 100, effect: "sets_sticky_web", effectChance: 100, description: "The user weaves a sticky net around the opposing team. Pokémon that switch in have their Speed lowered." },
    { name: "Defog", type: "flying", category: "status", power: 0, accuracy: 100, effect: "clears_hazards", effectChance: 100, description: "A strong wind blows away the target's barriers such as Reflect or Light Screen. This also lowers the target's evasiveness." },
    { name: "Roost", type: "flying", category: "status", power: 0, accuracy: 100, effect: "heals_50_percent", effectChance: 100, description: "The user lands and rests its body. This move restores the user's HP by up to half of its max HP." },
    { name: "Recover", type: "normal", category: "status", power: 0, accuracy: 100, effect: "heals_50_percent", effectChance: 100, description: "Restoring its own cells, the user restores its own HP by half of its max HP." },
    { name: "Soft-Boiled", type: "normal", category: "status", power: 0, accuracy: 100, effect: "heals_50_percent", effectChance: 100, description: "The user restores its own HP by up to half of its max HP." },
    { name: "Synthesis", type: "grass", category: "status", power: 0, accuracy: 100, effect: "heals_weather_dependent", effectChance: 100, description: "The user restores its own HP. The amount of HP regained varies with the weather." },
    { name: "Morning Sun", type: "normal", category: "status", power: 0, accuracy: 100, effect: "heals_weather_dependent", effectChance: 100, description: "The user restores its own HP. The amount of HP regained varies with the weather." },
    { name: "Slack Off", type: "normal", category: "status", power: 0, accuracy: 100, effect: "heals_50_percent", effectChance: 100, description: "The user slacks off, restoring its own HP by up to half of its max HP." },
    { name: "Wish", type: "normal", category: "status", power: 0, accuracy: 100, effect: "heals_next_turn", effectChance: 100, description: "One turn after this move is used, the user's or its replacement's HP is restored by half the user's max HP." },
    { name: "Heal Bell", type: "normal", category: "status", power: 0, accuracy: 100, effect: "cures_party_status", effectChance: 100, description: "The user makes a soothing bell chime to heal the status conditions of all the party Pokémon." },
    { name: "Aromatherapy", type: "grass", category: "status", power: 0, accuracy: 100, effect: "cures_party_status", effectChance: 100, description: "The user releases a soothing scent that heals all status conditions affecting the user's party." },
    { name: "Will-O-Wisp", type: "fire", category: "status", power: 0, accuracy: 85, effect: "burn", effectChance: 100, description: "The user shoots a sinister flame at the target to inflict a burn." },
    { name: "Thunder Wave", type: "electric", category: "status", power: 0, accuracy: 90, effect: "paralysis", effectChance: 100, description: "The user launches a weak jolt of electricity that paralyzes the target." },
    { name: "Toxic", type: "poison", category: "status", power: 0, accuracy: 90, effect: "bad_poison", effectChance: 100, description: "A move that leaves the target badly poisoned. Its poison damage worsens every turn." },
    { name: "Hypnosis", type: "psychic", category: "status", power: 0, accuracy: 60, effect: "sleep", effectChance: 100, description: "The user employs hypnotic suggestion to make the target fall into a deep sleep." },
    { name: "Sleep Powder", type: "grass", category: "status", power: 0, accuracy: 75, effect: "sleep", effectChance: 100, description: "The user scatters a big cloud of sleep-inducing dust around the target." },
    { name: "Spore", type: "grass", category: "status", power: 0, accuracy: 100, effect: "sleep", effectChance: 100, description: "The user scatters bursts of spores that induce sleep." },
    { name: "Stun Spore", type: "grass", category: "status", power: 0, accuracy: 75, effect: "paralysis", effectChance: 100, description: "The user scatters a cloud of numbing powder that paralyzes the target." },
    { name: "Leech Seed", type: "grass", category: "status", power: 0, accuracy: 90, effect: "leech_seed", effectChance: 100, description: "A seed is planted on the target. It steals some HP from the target every turn." },
    { name: "Protect", type: "normal", category: "status", power: 0, accuracy: 100, effect: "protect", effectChance: 100, description: "This move enables the user to protect itself from all attacks. Its chance of failing rises if it is used in succession." },
    { name: "Detect", type: "fighting", category: "status", power: 0, accuracy: 100, effect: "protect", effectChance: 100, description: "This move enables the user to protect itself from all attacks. Its chance of failing rises if it is used in succession." },
    { name: "Substitute", type: "normal", category: "status", power: 0, accuracy: 100, effect: "substitute", effectChance: 100, description: "The user creates a substitute for itself using some of its HP. The substitute serves as the user's decoy." },
    { name: "Baton Pass", type: "normal", category: "status", power: 0, accuracy: 100, effect: "baton_pass", effectChance: 100, description: "The user switches places with a party Pokémon in waiting and passes along any stat changes." },
    { name: "Encore", type: "normal", category: "status", power: 0, accuracy: 100, effect: "encore", effectChance: 100, description: "The user compels the target to keep using the move it encored for three turns." },
    { name: "Taunt", type: "dark", category: "status", power: 0, accuracy: 100, effect: "taunt", effectChance: 100, description: "The target is taunted into a rage that allows it to use only attack moves for three turns." },
    { name: "Trick", type: "psychic", category: "status", power: 0, accuracy: 100, effect: "swaps_items", effectChance: 100, description: "The user catches the target off guard and swaps its held item with its own." },
    { name: "Switcheroo", type: "dark", category: "status", power: 0, accuracy: 100, effect: "swaps_items", effectChance: 100, description: "The user trades held items with the target faster than the eye can follow." },
    { name: "Disable", type: "normal", category: "status", power: 0, accuracy: 100, effect: "disable", effectChance: 100, description: "For four turns, this move prevents the target from using the move it last used." },
    { name: "Torment", type: "dark", category: "status", power: 0, accuracy: 100, effect: "torment", effectChance: 100, description: "The user torments and enrages the target, making it incapable of using the same move twice in a row." },
    { name: "Haze", type: "ice", category: "status", power: 0, accuracy: 100, effect: "resets_all_stats", effectChance: 100, description: "The user creates a haze that eliminates every stat change among all the Pokémon engaged in battle." },
    { name: "Rain Dance", type: "water", category: "status", power: 0, accuracy: 100, effect: "sets_rain", effectChance: 100, description: "The user summons a heavy rain that falls for five turns, powering up Water-type moves." },
    { name: "Sunny Day", type: "fire", category: "status", power: 0, accuracy: 100, effect: "sets_sun", effectChance: 100, description: "The user intensifies the sun for five turns, powering up Fire-type moves." },
    { name: "Sandstorm", type: "rock", category: "status", power: 0, accuracy: 100, effect: "sets_sandstorm", effectChance: 100, description: "A five-turn sandstorm is summoned to hurt all combatants except Rock, Ground, and Steel types." },
    { name: "Snowscape", type: "ice", category: "status", power: 0, accuracy: 100, effect: "sets_snow", effectChance: 100, description: "The user summons a snowstorm lasting five turns. This boosts the Defense stats of Ice types." },
    { name: "Hail", type: "ice", category: "status", power: 0, accuracy: 100, effect: "sets_hail", effectChance: 100, description: "The user summons a hailstorm lasting five turns. It damages all Pokémon except Ice types." },
    { name: "Trick Room", type: "psychic", category: "status", power: 0, accuracy: 100, effect: "sets_trick_room", effectChance: 100, description: "The user creates a bizarre area in which slower Pokémon get to move first for five turns." },
    { name: "Tailwind", type: "flying", category: "status", power: 0, accuracy: 100, effect: "sets_tailwind", effectChance: 100, description: "The user whips up a turbulent whirlwind that ups the Speed stats of the user and its allies for four turns." },
    { name: "Light Screen", type: "psychic", category: "status", power: 0, accuracy: 100, effect: "sets_light_screen", effectChance: 100, description: "A wondrous wall of light is put up to reduce damage from special attacks for five turns." },
    { name: "Reflect", type: "psychic", category: "status", power: 0, accuracy: 100, effect: "sets_reflect", effectChance: 100, description: "A wondrous wall of light is put up to reduce damage from physical attacks for five turns." },
    { name: "Aurora Veil", type: "ice", category: "status", power: 0, accuracy: 100, effect: "sets_aurora_veil", effectChance: 100, description: "This move reduces damage from physical and special moves for five turns. This can be used only in a hailstorm or snowstorm." },
    { name: "Curse", type: "ghost", category: "status", power: 0, accuracy: 100, effect: "curse", effectChance: 100, description: "A move that works differently for the Ghost type than for all other types." },
    { name: "Pain Split", type: "normal", category: "status", power: 0, accuracy: 100, effect: "pain_split", effectChance: 100, description: "The user adds its HP to the target's HP, then equally shares the combined HP with the target." },
    { name: "Destiny Bond", type: "ghost", category: "status", power: 0, accuracy: 100, effect: "destiny_bond", effectChance: 100, description: "After using this move, if the user faints, the Pokémon that landed the knockout blow also faints." },
    { name: "Spite", type: "ghost", category: "status", power: 0, accuracy: 100, effect: "reduce_pp", effectChance: 100, description: "The user unleashes its grudge on the move last used by the target by cutting 4 PP from it." },
    { name: "Perish Song", type: "normal", category: "status", power: 0, accuracy: 100, effect: "perish_song", effectChance: 100, description: "Any Pokémon that hears this song faints in three turns, unless it switches out of battle." },

    // Dark - Additional
    { name: "Hone Claws", type: "dark", category: "status", power: 0, accuracy: 100, effect: "raises_user_attack_accuracy", effectChance: 100, description: "The user sharpens its claws to boost its Attack stat and accuracy." },
    { name: "Nasty Plot", type: "dark", category: "status", power: 0, accuracy: 100, effect: "raises_user_sp_atk_2", effectChance: 100, description: "The user stimulates its brain by thinking bad thoughts. This sharply raises the user's Sp. Atk stat." },
    { name: "Parting Shot", type: "dark", category: "status", power: 0, accuracy: 100, effect: "lowers_atk_sp_atk_switch", effectChance: 100, description: "With a parting threat, the user lowers the target's Attack and Sp. Atk stats. Then it switches with a party Pokémon." },
    { name: "Topsy-Turvy", type: "dark", category: "status", power: 0, accuracy: 100, effect: "inverts_stat_changes", effectChance: 100, description: "All stat changes affecting the target turn topsy-turvy and become the opposite of what they were." },
    { name: "Power Trip", type: "dark", category: "physical", power: 20, accuracy: 100, effect: "power_scales_with_stat_boosts", effectChance: 100, description: "The user boasts its strength and attacks the target. The more the user's stats are raised, the greater the move's power." },
    { name: "Beat Up", type: "dark", category: "physical", power: 10, accuracy: 100, effect: "multi_hit_party_size", effectChance: 100, description: "The user gets all party Pokémon to attack the target. The more party Pokémon, the greater the number of attacks." },
    { name: "Snarl", type: "dark", category: "special", power: 55, accuracy: 95, effect: "lowers_sp_atk", effectChance: 100, description: "The user yells as if it's ranting about something, which lowers the Sp. Atk stats of opposing Pokémon." },
    { name: "Night Daze", type: "dark", category: "special", power: 85, accuracy: 95, effect: "lowers_accuracy", effectChance: 40, description: "The user lets loose a pitch-black shock wave at its target. This may also lower the target's accuracy." },

    // Steel - Additional
    { name: "Iron Defense", type: "steel", category: "status", power: 0, accuracy: 100, effect: "raises_user_defense_2", effectChance: 100, description: "The user hardens its body's surface like iron, sharply raising its Defense stat." },
    { name: "Metal Sound", type: "steel", category: "status", power: 0, accuracy: 85, effect: "lowers_sp_def_2", effectChance: 100, description: "A horrible sound like scraping metal harshly lowers the target's Sp. Def stat." },
    { name: "Autotomize", type: "steel", category: "status", power: 0, accuracy: 100, effect: "raises_user_speed_2", effectChance: 100, description: "The user sheds part of its body to make itself lighter and sharply raise its Speed stat." },
    { name: "Shift Gear", type: "steel", category: "status", power: 0, accuracy: 100, effect: "raises_user_attack_speed_2", effectChance: 100, description: "The user rotates its gears, raising its Attack stat and sharply raising its Speed stat." },
    { name: "King's Shield", type: "steel", category: "status", power: 0, accuracy: 100, effect: "protect_lowers_atk_on_contact", effectChance: 100, description: "The user takes a defensive stance while protecting itself from damage. It also lowers the Attack stat of any attacker that makes direct contact." },

    // Fairy - Additional
    { name: "Moonlight", type: "fairy", category: "status", power: 0, accuracy: 100, effect: "heals_weather_dependent", effectChance: 100, description: "The user restores its own HP. The amount of HP regained varies with the weather." },
    { name: "Misty Terrain", type: "fairy", category: "status", power: 0, accuracy: 100, effect: "sets_misty_terrain", effectChance: 100, description: "This protects Pokémon on the ground from status conditions and halves damage from Dragon-type moves for five turns." },
    { name: "Crafty Shield", type: "fairy", category: "status", power: 0, accuracy: 100, effect: "blocks_status_moves", effectChance: 100, description: "The user protects itself and its allies from status moves with a mysterious power. This does not stop moves that do damage." },
    { name: "Flower Shield", type: "fairy", category: "status", power: 0, accuracy: 100, effect: "raises_grass_defense", effectChance: 100, description: "The user raises the Defense stats of all Grass-type Pokémon in battle with a mysterious power." },
    { name: "Aromatic Mist", type: "fairy", category: "status", power: 0, accuracy: 100, effect: "raises_ally_sp_def", effectChance: 100, description: "The user raises the Sp. Def stat of an ally Pokémon by using a mysterious aroma." },
    { name: "Sparkly Swirl", type: "fairy", category: "special", power: 120, accuracy: 85, effect: "cures_party_status", effectChance: 100, description: "The user attacks the target by wrapping it with a whirlwind of an overwhelming scent. This also heals all status conditions of the user's party." }
];

const MOVES_BY_NAME = new Map(
  MOVES_DATA.map((m, idx) => [m.name.toLowerCase(), { ...m, id: idx }])
);

// Helper function to get move by name
function getMoveByName(name) {
    return MOVES_BY_NAME.get(name.toLowerCase());
}

function getMoveId(name) {
  const move = MOVES_BY_NAME.get(name.toLowerCase());
  return move?.id; // returns undefined if not found
}

// Helper function to search moves
function searchMoves(query) {
    const lowerQuery = query.toLowerCase();
    return MOVES_DATA.filter(m =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.type.toLowerCase() === lowerQuery
    );
}

// Helper to get moves by type
function getMovesByType(type) {
    const lowerType = type.toLowerCase();
    return MOVES_DATA.filter(m => m.type.toLowerCase() === lowerType);
}

/**
 * Get the effects array for a move (handles both legacy and new format)
 * @param {Object} move - The move object
 * @returns {Array} Array of { effect: string, chance: number } objects
 */
function getMoveEffects(move) {
    if (!move) return [];

    // New format: effects array
    if (Array.isArray(move.effects)) {
        return move.effects;
    }

    // Legacy format: single effect and effectChance
    if (move.effect && move.effectChance !== undefined) {
        return [{ effect: move.effect, chance: move.effectChance }];
    }

    return [];
}

/**
 * Check if a move has a specific effect
 * @param {Object} move - The move object
 * @param {string} effectName - The effect to check for
 * @returns {Object|null} The effect object if found, null otherwise
 */
function moveHasEffect(move, effectName) {
    const effects = getMoveEffects(move);
    const lowerEffect = effectName.toLowerCase();
    return effects.find(e => e.effect && e.effect.toLowerCase().includes(lowerEffect)) || null;
}

/**
 * Get the highest effect chance for a move (for display purposes)
 * @param {Object} move - The move object
 * @returns {number} The highest effect chance, or 0 if no effects
 */
function getHighestEffectChance(move) {
    const effects = getMoveEffects(move);
    if (effects.length === 0) return 0;
    return Math.max(...effects.map(e => e.chance || 0));
}

/**
 * Get the primary status effect for a move (for display in tooltips)
 * Prioritizes status effects like burn, freeze, paralysis, poison over other effects
 * @param {Object} move - The move object
 * @returns {Object|null} The primary effect { effect, chance } or null
 */
function getPrimaryStatusEffect(move) {
    const effects = getMoveEffects(move);
    const statusPriority = ['burn', 'freeze', 'paralysis', 'poison', 'bad_poison', 'sleep', 'confusion', 'flinch'];

    // Hidden effects that shouldn't be displayed as primary status
    const hiddenEffects = [
        'two_turn_move', 'never_misses', 'priority', 'priority_plus2',
        'recharge', 'high_critical_hit', 'user_faints', 'heals_user',
        'power_doubles_when_statused', 'power_doubles_if_ally_fainted',
        'steals_item', 'trap', 'recoil', 'confusion_after', 'always_critical_hit'
    ];

    // Filter out hidden effects
    const visibleEffects = effects.filter(e => !hiddenEffects.includes(e.effect));

    if (visibleEffects.length === 0) return null;

    // Find highest priority status effect
    for (const status of statusPriority) {
        const found = visibleEffects.find(e => e.effect && e.effect.toLowerCase().includes(status));
        if (found) return found;
    }

    // Return first visible effect if no status effect found
    return visibleEffects[0];
}

// Helper to get moves with specific effect (supports both legacy and new format)
function getMovesByEffect(effect) {
    const lowerEffect = effect.toLowerCase();
    return MOVES_DATA.filter(m => {
        // Check new effects array format
        if (Array.isArray(m.effects)) {
            return m.effects.some(e => e.effect && e.effect.toLowerCase().includes(lowerEffect));
        }
        // Check legacy format
        return m.effect && m.effect.toLowerCase().includes(lowerEffect);
    });
}

// Check if a Pokemon gets STAB for a move
function hasSTAB(pokemonTypes, moveType) {
    return pokemonTypes.some(t => t.toLowerCase() === moveType.toLowerCase());
}

// Calculate effective power of a move
function calculateEffectivePower(move, attackerTypes, defenderTypes, includeAccuracy = true) {
    if (!move || move.power === 0 || move.category === 'status') return 0;

    const basePower = move.power;
    const stab = hasSTAB(attackerTypes, move.type) ? 1.5 : 1;
    const effectiveness = getEffectiveness(move.type, defenderTypes);
    const accuracy = includeAccuracy ? (move.accuracy / 100) : 1;

    return Math.round(basePower * stab * effectiveness * accuracy);
}

// ============================================
// MOVE EFFECT DEFINITIONS
// ============================================
// Centralized effect handling configuration

const MOVE_EFFECTS = {
    // Stat change effects - maps effect names to their stat modifications
    statChanges: {
        // Lowers target stats
        'lowers_accuracy': { stat: 'accuracy', stages: -1 },
        'lowers_attack': { stat: 'atk', stages: -1 },
        'lowers_defense': { stat: 'def', stages: -1 },
        'lowers_sp_atk': { stat: 'spAtk', stages: -1 },
        'lowers_sp_def': { stat: 'spDef', stages: -1 },
        'lowers_sp_def_2': { stat: 'spDef', stages: -2 },
        'lowers_speed': { stat: 'speed', stages: -1 },
        // Lowers user stats (recoil effects)
        'lowers_user_sp_atk_2': { stat: 'spAtk', stages: -2, self: true },
        'lowers_user_def_spdef': { stats: ['def', 'spDef'], stages: -1, self: true },
        'lowers_user_def_spdef_speed': { stats: ['def', 'spDef', 'speed'], stages: -1, self: true },
        'lowers_user_atk_def': { stats: ['atk', 'def'], stages: -1, self: true },
        'lowers_user_speed': { stat: 'speed', stages: -1, self: true },
        // Raises user stats
        'raises_user_speed': { stat: 'speed', stages: 1, self: true },
        'raises_user_attack': { stat: 'atk', stages: 1, self: true },
        'raises_user_sp_atk': { stat: 'spAtk', stages: 1, self: true },
        'raises_user_defense': { stat: 'def', stages: 1, self: true },
        'raises_user_sp_def': { stat: 'spDef', stages: 1, self: true }
    },

    // Healing effects - percent of max HP to heal
    healing: {
        'heals_50_percent': { percent: 50 }
    },

    // Priority effects - maps effect names to priority brackets
    priority: {
        'priority': 1,
        'priority_plus2': 2
    },

    // Stat display names for battle log messages
    statNames: {
        atk: 'Attack',
        def: 'Defense',
        spAtk: 'Sp. Atk',
        spDef: 'Sp. Def',
        speed: 'Speed',
        accuracy: 'Accuracy',
        evasion: 'Evasion'
    }
};

// Get move priority from MOVE_EFFECTS
function getMovePriority(move) {
    if (!move) return 0;

    // Check for priority effects using the centralized definitions
    for (const [effectName, priorityValue] of Object.entries(MOVE_EFFECTS.priority)) {
        if (moveHasEffect(move, effectName)) {
            return priorityValue;
        }
    }
    return 0;
}

// Non-contact physical moves (common exceptions)
const NON_CONTACT_PHYSICAL_MOVES = new Set([
    'Earthquake', 'Bulldoze', 'Magnitude', 'Bone Rush', 'Bonemerang',
    'Rock Slide', 'Stone Edge', 'Rock Throw', 'Rock Tomb', 'Rock Blast',
    'Explosion', 'Self-Destruct',
    'Attack Order', 'Icicle Spear', 'Icicle Crash', 'Avalanche',
    'Poison Sting', 'Pin Missile', 'Twineedle',
    'Sacred Sword', 'Secret Sword',
    'Psycho Cut', 'Leaf Blade', 'Air Cutter', 'Air Slash',
    'Razor Leaf', 'Magical Leaf', 'Petal Blizzard',
    'Dragon Darts', 'Precipice Blades', 'Land\'s Wrath',
    'Thousand Arrows', 'Thousand Waves',
    'Poltergeist', 'Shadow Bone'
]);

// Check if a move makes contact (relevant for Rough Skin, Iron Barbs, etc.)
function isContactMove(move) {
    if (!move) return false;

    // Status moves are never contact
    if (move.category === 'status') return false;

    // Special moves are generally not contact (with rare exceptions we ignore)
    if (move.category === 'special') return false;

    // Physical moves are contact unless in the exception list
    if (move.category === 'physical') {
        return !NON_CONTACT_PHYSICAL_MOVES.has(move.name);
    }

    return false;
}

