// Pokemon Held Items Data
// Comprehensive list of held items with effects

const ITEMS_DATA = [
    // ========================================
    // CHOICE ITEMS
    // ========================================
    { name: "Choice Band", category: "choice", effect: "boost_attack", multiplier: 1.5, description: "Boosts Attack by 50%, but locks into one move" },
    { name: "Choice Specs", category: "choice", effect: "boost_spatk", multiplier: 1.5, description: "Boosts Sp. Atk by 50%, but locks into one move" },
    { name: "Choice Scarf", category: "choice", effect: "boost_speed", multiplier: 1.5, description: "Boosts Speed by 50%, but locks into one move" },
    
    // ========================================
    // LIFE ORB & DAMAGE BOOSTERS
    // ========================================
    { name: "Life Orb", category: "damage", effect: "boost_damage", multiplier: 1.3, description: "Boosts damage by 30%, but lose 10% HP per attack" },
    { name: "Expert Belt", category: "damage", effect: "boost_super_effective", multiplier: 1.2, description: "Super-effective moves deal 20% more damage" },
    { name: "Metronome", category: "damage", effect: "consecutive_boost", description: "Boosts same move used consecutively (up to 2x)" },
    { name: "Muscle Band", category: "damage", effect: "boost_physical", multiplier: 1.1, description: "Physical moves deal 10% more damage" },
    { name: "Wise Glasses", category: "damage", effect: "boost_special", multiplier: 1.1, description: "Special moves deal 10% more damage" },
    
    // ========================================
    // TYPE-BOOSTING ITEMS (1.2x damage)
    // ========================================
    { name: "Silk Scarf", category: "type_boost", boostType: "normal", multiplier: 1.2, description: "Normal moves deal 20% more damage" },
    { name: "Charcoal", category: "type_boost", boostType: "fire", multiplier: 1.2, description: "Fire moves deal 20% more damage" },
    { name: "Mystic Water", category: "type_boost", boostType: "water", multiplier: 1.2, description: "Water moves deal 20% more damage" },
    { name: "Magnet", category: "type_boost", boostType: "electric", multiplier: 1.2, description: "Electric moves deal 20% more damage" },
    { name: "Miracle Seed", category: "type_boost", boostType: "grass", multiplier: 1.2, description: "Grass moves deal 20% more damage" },
    { name: "Never-Melt Ice", category: "type_boost", boostType: "ice", multiplier: 1.2, description: "Ice moves deal 20% more damage" },
    { name: "Black Belt", category: "type_boost", boostType: "fighting", multiplier: 1.2, description: "Fighting moves deal 20% more damage" },
    { name: "Poison Barb", category: "type_boost", boostType: "poison", multiplier: 1.2, description: "Poison moves deal 20% more damage" },
    { name: "Soft Sand", category: "type_boost", boostType: "ground", multiplier: 1.2, description: "Ground moves deal 20% more damage" },
    { name: "Sharp Beak", category: "type_boost", boostType: "flying", multiplier: 1.2, description: "Flying moves deal 20% more damage" },
    { name: "Twisted Spoon", category: "type_boost", boostType: "psychic", multiplier: 1.2, description: "Psychic moves deal 20% more damage" },
    { name: "Silver Powder", category: "type_boost", boostType: "bug", multiplier: 1.2, description: "Bug moves deal 20% more damage" },
    { name: "Hard Stone", category: "type_boost", boostType: "rock", multiplier: 1.2, description: "Rock moves deal 20% more damage" },
    { name: "Spell Tag", category: "type_boost", boostType: "ghost", multiplier: 1.2, description: "Ghost moves deal 20% more damage" },
    { name: "Dragon Fang", category: "type_boost", boostType: "dragon", multiplier: 1.2, description: "Dragon moves deal 20% more damage" },
    { name: "Black Glasses", category: "type_boost", boostType: "dark", multiplier: 1.2, description: "Dark moves deal 20% more damage" },
    { name: "Metal Coat", category: "type_boost", boostType: "steel", multiplier: 1.2, description: "Steel moves deal 20% more damage" },
    { name: "Fairy Feather", category: "type_boost", boostType: "fairy", multiplier: 1.2, description: "Fairy moves deal 20% more damage" },
    
    // ========================================
    // PLATES (1.2x + Judgment/Multi-Attack type)
    // ========================================
    { name: "Flame Plate", category: "plate", boostType: "fire", multiplier: 1.2, description: "Fire moves +20%, Judgment becomes Fire" },
    { name: "Splash Plate", category: "plate", boostType: "water", multiplier: 1.2, description: "Water moves +20%, Judgment becomes Water" },
    { name: "Zap Plate", category: "plate", boostType: "electric", multiplier: 1.2, description: "Electric moves +20%, Judgment becomes Electric" },
    { name: "Meadow Plate", category: "plate", boostType: "grass", multiplier: 1.2, description: "Grass moves +20%, Judgment becomes Grass" },
    { name: "Icicle Plate", category: "plate", boostType: "ice", multiplier: 1.2, description: "Ice moves +20%, Judgment becomes Ice" },
    { name: "Fist Plate", category: "plate", boostType: "fighting", multiplier: 1.2, description: "Fighting moves +20%, Judgment becomes Fighting" },
    { name: "Toxic Plate", category: "plate", boostType: "poison", multiplier: 1.2, description: "Poison moves +20%, Judgment becomes Poison" },
    { name: "Earth Plate", category: "plate", boostType: "ground", multiplier: 1.2, description: "Ground moves +20%, Judgment becomes Ground" },
    { name: "Sky Plate", category: "plate", boostType: "flying", multiplier: 1.2, description: "Flying moves +20%, Judgment becomes Flying" },
    { name: "Mind Plate", category: "plate", boostType: "psychic", multiplier: 1.2, description: "Psychic moves +20%, Judgment becomes Psychic" },
    { name: "Insect Plate", category: "plate", boostType: "bug", multiplier: 1.2, description: "Bug moves +20%, Judgment becomes Bug" },
    { name: "Stone Plate", category: "plate", boostType: "rock", multiplier: 1.2, description: "Rock moves +20%, Judgment becomes Rock" },
    { name: "Spooky Plate", category: "plate", boostType: "ghost", multiplier: 1.2, description: "Ghost moves +20%, Judgment becomes Ghost" },
    { name: "Draco Plate", category: "plate", boostType: "dragon", multiplier: 1.2, description: "Dragon moves +20%, Judgment becomes Dragon" },
    { name: "Dread Plate", category: "plate", boostType: "dark", multiplier: 1.2, description: "Dark moves +20%, Judgment becomes Dark" },
    { name: "Iron Plate", category: "plate", boostType: "steel", multiplier: 1.2, description: "Steel moves +20%, Judgment becomes Steel" },
    { name: "Pixie Plate", category: "plate", boostType: "fairy", multiplier: 1.2, description: "Fairy moves +20%, Judgment becomes Fairy" },
    
    // ========================================
    // GEMS (1.5x one-time boost - Gen 5)
    // ========================================
    { name: "Normal Gem", category: "gem", boostType: "normal", multiplier: 1.5, description: "One-time 50% boost to Normal move" },
    { name: "Fire Gem", category: "gem", boostType: "fire", multiplier: 1.5, description: "One-time 50% boost to Fire move" },
    { name: "Water Gem", category: "gem", boostType: "water", multiplier: 1.5, description: "One-time 50% boost to Water move" },
    { name: "Electric Gem", category: "gem", boostType: "electric", multiplier: 1.5, description: "One-time 50% boost to Electric move" },
    { name: "Grass Gem", category: "gem", boostType: "grass", multiplier: 1.5, description: "One-time 50% boost to Grass move" },
    { name: "Ice Gem", category: "gem", boostType: "ice", multiplier: 1.5, description: "One-time 50% boost to Ice move" },
    { name: "Fighting Gem", category: "gem", boostType: "fighting", multiplier: 1.5, description: "One-time 50% boost to Fighting move" },
    { name: "Poison Gem", category: "gem", boostType: "poison", multiplier: 1.5, description: "One-time 50% boost to Poison move" },
    { name: "Ground Gem", category: "gem", boostType: "ground", multiplier: 1.5, description: "One-time 50% boost to Ground move" },
    { name: "Flying Gem", category: "gem", boostType: "flying", multiplier: 1.5, description: "One-time 50% boost to Flying move" },
    { name: "Psychic Gem", category: "gem", boostType: "psychic", multiplier: 1.5, description: "One-time 50% boost to Psychic move" },
    { name: "Bug Gem", category: "gem", boostType: "bug", multiplier: 1.5, description: "One-time 50% boost to Bug move" },
    { name: "Rock Gem", category: "gem", boostType: "rock", multiplier: 1.5, description: "One-time 50% boost to Rock move" },
    { name: "Ghost Gem", category: "gem", boostType: "ghost", multiplier: 1.5, description: "One-time 50% boost to Ghost move" },
    { name: "Dragon Gem", category: "gem", boostType: "dragon", multiplier: 1.5, description: "One-time 50% boost to Dragon move" },
    { name: "Dark Gem", category: "gem", boostType: "dark", multiplier: 1.5, description: "One-time 50% boost to Dark move" },
    { name: "Steel Gem", category: "gem", boostType: "steel", multiplier: 1.5, description: "One-time 50% boost to Steel move" },
    { name: "Fairy Gem", category: "gem", boostType: "fairy", multiplier: 1.5, description: "One-time 50% boost to Fairy move" },
    
    // ========================================
    // DEFENSIVE ITEMS
    // ========================================
    { name: "Leftovers", category: "recovery", effect: "passive_heal", description: "Recover 1/16 HP at end of turn" },
    { name: "Black Sludge", category: "recovery", effect: "poison_heal", description: "Poison types heal 1/16 HP, others take damage" },
    { name: "Shell Bell", category: "recovery", effect: "drain", description: "Recover 1/8 of damage dealt" },
    { name: "Assault Vest", category: "defense", effect: "boost_spdef", multiplier: 1.5, description: "Boosts Sp. Def by 50%, but can only use attacks" },
    { name: "Eviolite", category: "defense", effect: "boost_defenses", multiplier: 1.5, description: "Boosts Def & Sp. Def by 50% for NFE Pokemon" },
    { name: "Rocky Helmet", category: "defense", effect: "contact_damage", description: "Contact attackers take 1/6 HP damage" },
    { name: "Focus Sash", category: "defense", effect: "survive_ohko", description: "Survive any hit with 1 HP at full health" },
    { name: "Air Balloon", category: "defense", effect: "ground_immunity", description: "Immune to Ground moves until hit" },
    { name: "Safety Goggles", category: "defense", effect: "powder_immunity", description: "Immune to powder moves and weather damage" },
    { name: "Protective Pads", category: "defense", effect: "contact_protection", description: "Protects from contact side effects" },
    { name: "Heavy-Duty Boots", category: "defense", effect: "hazard_immunity", description: "Immune to entry hazards" },
    
    // ========================================
    // BERRIES - SUPER EFFECTIVE REDUCTION (50%)
    // ========================================
    { name: "Occa Berry", category: "resist_berry", resistType: "fire", multiplier: 0.5, description: "Halves super-effective Fire damage once" },
    { name: "Passho Berry", category: "resist_berry", resistType: "water", multiplier: 0.5, description: "Halves super-effective Water damage once" },
    { name: "Wacan Berry", category: "resist_berry", resistType: "electric", multiplier: 0.5, description: "Halves super-effective Electric damage once" },
    { name: "Rindo Berry", category: "resist_berry", resistType: "grass", multiplier: 0.5, description: "Halves super-effective Grass damage once" },
    { name: "Yache Berry", category: "resist_berry", resistType: "ice", multiplier: 0.5, description: "Halves super-effective Ice damage once" },
    { name: "Chople Berry", category: "resist_berry", resistType: "fighting", multiplier: 0.5, description: "Halves super-effective Fighting damage once" },
    { name: "Kebia Berry", category: "resist_berry", resistType: "poison", multiplier: 0.5, description: "Halves super-effective Poison damage once" },
    { name: "Shuca Berry", category: "resist_berry", resistType: "ground", multiplier: 0.5, description: "Halves super-effective Ground damage once" },
    { name: "Coba Berry", category: "resist_berry", resistType: "flying", multiplier: 0.5, description: "Halves super-effective Flying damage once" },
    { name: "Payapa Berry", category: "resist_berry", resistType: "psychic", multiplier: 0.5, description: "Halves super-effective Psychic damage once" },
    { name: "Tanga Berry", category: "resist_berry", resistType: "bug", multiplier: 0.5, description: "Halves super-effective Bug damage once" },
    { name: "Charti Berry", category: "resist_berry", resistType: "rock", multiplier: 0.5, description: "Halves super-effective Rock damage once" },
    { name: "Kasib Berry", category: "resist_berry", resistType: "ghost", multiplier: 0.5, description: "Halves super-effective Ghost damage once" },
    { name: "Haban Berry", category: "resist_berry", resistType: "dragon", multiplier: 0.5, description: "Halves super-effective Dragon damage once" },
    { name: "Colbur Berry", category: "resist_berry", resistType: "dark", multiplier: 0.5, description: "Halves super-effective Dark damage once" },
    { name: "Babiri Berry", category: "resist_berry", resistType: "steel", multiplier: 0.5, description: "Halves super-effective Steel damage once" },
    { name: "Roseli Berry", category: "resist_berry", resistType: "fairy", multiplier: 0.5, description: "Halves super-effective Fairy damage once" },
    { name: "Chilan Berry", category: "resist_berry", resistType: "normal", multiplier: 0.5, description: "Halves Normal damage once" },
    
    // ========================================
    // STAT BOOSTING BERRIES
    // ========================================
    { name: "Liechi Berry", category: "stat_berry", effect: "boost_attack_low", description: "Raises Attack when HP is low" },
    { name: "Ganlon Berry", category: "stat_berry", effect: "boost_defense_low", description: "Raises Defense when HP is low" },
    { name: "Salac Berry", category: "stat_berry", effect: "boost_speed_low", description: "Raises Speed when HP is low" },
    { name: "Petaya Berry", category: "stat_berry", effect: "boost_spatk_low", description: "Raises Sp. Atk when HP is low" },
    { name: "Apicot Berry", category: "stat_berry", effect: "boost_spdef_low", description: "Raises Sp. Def when HP is low" },
    { name: "Lansat Berry", category: "stat_berry", effect: "boost_crit_low", description: "Raises critical hit ratio when HP is low" },
    { name: "Starf Berry", category: "stat_berry", effect: "boost_random_low", description: "Sharply raises random stat when HP is low" },
    { name: "Micle Berry", category: "stat_berry", effect: "boost_accuracy", description: "Boosts accuracy of next move when HP is low" },
    { name: "Custap Berry", category: "stat_berry", effect: "priority", description: "Moves first when HP is low (one time)" },
    
    // ========================================
    // HEALING BERRIES
    // ========================================
    { name: "Sitrus Berry", category: "heal_berry", effect: "heal_quarter", description: "Restores 25% HP when below 50%" },
    { name: "Oran Berry", category: "heal_berry", effect: "heal_10", description: "Restores 10 HP when below 50%" },
    { name: "Figy Berry", category: "heal_berry", effect: "heal_third", description: "Restores 33% HP when below 25%" },
    { name: "Wiki Berry", category: "heal_berry", effect: "heal_third", description: "Restores 33% HP when below 25%" },
    { name: "Mago Berry", category: "heal_berry", effect: "heal_third", description: "Restores 33% HP when below 25%" },
    { name: "Aguav Berry", category: "heal_berry", effect: "heal_third", description: "Restores 33% HP when below 25%" },
    { name: "Iapapa Berry", category: "heal_berry", effect: "heal_third", description: "Restores 33% HP when below 25%" },
    
    // ========================================
    // STATUS CURE BERRIES
    // ========================================
    { name: "Lum Berry", category: "status_berry", effect: "cure_all", description: "Cures any status condition" },
    { name: "Cheri Berry", category: "status_berry", effect: "cure_paralysis", description: "Cures paralysis" },
    { name: "Chesto Berry", category: "status_berry", effect: "cure_sleep", description: "Cures sleep" },
    { name: "Pecha Berry", category: "status_berry", effect: "cure_poison", description: "Cures poison" },
    { name: "Rawst Berry", category: "status_berry", effect: "cure_burn", description: "Cures burn" },
    { name: "Aspear Berry", category: "status_berry", effect: "cure_freeze", description: "Cures freeze" },
    { name: "Persim Berry", category: "status_berry", effect: "cure_confusion", description: "Cures confusion" },
    
    // ========================================
    // SPEED PRIORITY ITEMS
    // ========================================
    { name: "Quick Claw", category: "priority", effect: "random_priority", description: "20% chance to move first" },
    { name: "Lagging Tail", category: "priority", effect: "move_last", description: "Always move last in priority bracket" },
    { name: "Full Incense", category: "priority", effect: "move_last", description: "Always move last in priority bracket" },
    { name: "Iron Ball", category: "priority", effect: "halve_speed", description: "Halves Speed, grounds Flying types" },
    
    // ========================================
    // MEGA STONES (for reference)
    // ========================================
    { name: "Venusaurite", category: "mega_stone", pokemon: "Venusaur", description: "Mega Evolves Venusaur" },
    { name: "Charizardite X", category: "mega_stone", pokemon: "Charizard", description: "Mega Evolves Charizard (Fire/Dragon)" },
    { name: "Charizardite Y", category: "mega_stone", pokemon: "Charizard", description: "Mega Evolves Charizard (Fire/Flying)" },
    { name: "Blastoisinite", category: "mega_stone", pokemon: "Blastoise", description: "Mega Evolves Blastoise" },
    { name: "Alakazite", category: "mega_stone", pokemon: "Alakazam", description: "Mega Evolves Alakazam" },
    { name: "Gengarite", category: "mega_stone", pokemon: "Gengar", description: "Mega Evolves Gengar" },
    { name: "Kangaskhanite", category: "mega_stone", pokemon: "Kangaskhan", description: "Mega Evolves Kangaskhan" },
    { name: "Pinsirite", category: "mega_stone", pokemon: "Pinsir", description: "Mega Evolves Pinsir" },
    { name: "Gyaradosite", category: "mega_stone", pokemon: "Gyarados", description: "Mega Evolves Gyarados" },
    { name: "Aerodactylite", category: "mega_stone", pokemon: "Aerodactyl", description: "Mega Evolves Aerodactyl" },
    { name: "Mewtwonite X", category: "mega_stone", pokemon: "Mewtwo", description: "Mega Evolves Mewtwo (Psychic/Fighting)" },
    { name: "Mewtwonite Y", category: "mega_stone", pokemon: "Mewtwo", description: "Mega Evolves Mewtwo (Psychic)" },
    { name: "Ampharosite", category: "mega_stone", pokemon: "Ampharos", description: "Mega Evolves Ampharos" },
    { name: "Scizorite", category: "mega_stone", pokemon: "Scizor", description: "Mega Evolves Scizor" },
    { name: "Heracronite", category: "mega_stone", pokemon: "Heracross", description: "Mega Evolves Heracross" },
    { name: "Tyranitarite", category: "mega_stone", pokemon: "Tyranitar", description: "Mega Evolves Tyranitar" },
    { name: "Blazikenite", category: "mega_stone", pokemon: "Blaziken", description: "Mega Evolves Blaziken" },
    { name: "Gardevoirite", category: "mega_stone", pokemon: "Gardevoir", description: "Mega Evolves Gardevoir" },
    { name: "Mawilite", category: "mega_stone", pokemon: "Mawile", description: "Mega Evolves Mawile" },
    { name: "Aggronite", category: "mega_stone", pokemon: "Aggron", description: "Mega Evolves Aggron" },
    { name: "Medichamite", category: "mega_stone", pokemon: "Medicham", description: "Mega Evolves Medicham" },
    { name: "Manectite", category: "mega_stone", pokemon: "Manectric", description: "Mega Evolves Manectric" },
    { name: "Banettite", category: "mega_stone", pokemon: "Banette", description: "Mega Evolves Banette" },
    { name: "Absolite", category: "mega_stone", pokemon: "Absol", description: "Mega Evolves Absol" },
    { name: "Garchompite", category: "mega_stone", pokemon: "Garchomp", description: "Mega Evolves Garchomp" },
    { name: "Lucarionite", category: "mega_stone", pokemon: "Lucario", description: "Mega Evolves Lucario" },
    { name: "Salamencite", category: "mega_stone", pokemon: "Salamence", description: "Mega Evolves Salamence" },
    { name: "Metagrossite", category: "mega_stone", pokemon: "Metagross", description: "Mega Evolves Metagross" },
    { name: "Latiasite", category: "mega_stone", pokemon: "Latias", description: "Mega Evolves Latias" },
    { name: "Latiosite", category: "mega_stone", pokemon: "Latios", description: "Mega Evolves Latios" },
    { name: "Swampertite", category: "mega_stone", pokemon: "Swampert", description: "Mega Evolves Swampert" },
    { name: "Sceptilite", category: "mega_stone", pokemon: "Sceptile", description: "Mega Evolves Sceptile" },
    { name: "Sablenite", category: "mega_stone", pokemon: "Sableye", description: "Mega Evolves Sableye" },
    { name: "Sharpedonite", category: "mega_stone", pokemon: "Sharpedo", description: "Mega Evolves Sharpedo" },
    { name: "Slowbronite", category: "mega_stone", pokemon: "Slowbro", description: "Mega Evolves Slowbro" },
    { name: "Steelixite", category: "mega_stone", pokemon: "Steelix", description: "Mega Evolves Steelix" },
    { name: "Pidgeotite", category: "mega_stone", pokemon: "Pidgeot", description: "Mega Evolves Pidgeot" },
    { name: "Glalitite", category: "mega_stone", pokemon: "Glalie", description: "Mega Evolves Glalie" },
    { name: "Diancite", category: "mega_stone", pokemon: "Diancie", description: "Mega Evolves Diancie" },
    { name: "Cameruptite", category: "mega_stone", pokemon: "Camerupt", description: "Mega Evolves Camerupt" },
    { name: "Lopunnite", category: "mega_stone", pokemon: "Lopunny", description: "Mega Evolves Lopunny" },
    { name: "Galladite", category: "mega_stone", pokemon: "Gallade", description: "Mega Evolves Gallade" },
    { name: "Audinite", category: "mega_stone", pokemon: "Audino", description: "Mega Evolves Audino" },
    { name: "Beedrillite", category: "mega_stone", pokemon: "Beedrill", description: "Mega Evolves Beedrill" },
    { name: "Rayquazite", category: "mega_stone", pokemon: "Rayquaza", description: "Mega Evolves Rayquaza" },
    
    // ========================================
    // Z-CRYSTALS (for reference)
    // ========================================
    { name: "Normalium Z", category: "z_crystal", boostType: "normal", description: "Allows Normal Z-Move" },
    { name: "Firium Z", category: "z_crystal", boostType: "fire", description: "Allows Fire Z-Move" },
    { name: "Waterium Z", category: "z_crystal", boostType: "water", description: "Allows Water Z-Move" },
    { name: "Electrium Z", category: "z_crystal", boostType: "electric", description: "Allows Electric Z-Move" },
    { name: "Grassium Z", category: "z_crystal", boostType: "grass", description: "Allows Grass Z-Move" },
    { name: "Icium Z", category: "z_crystal", boostType: "ice", description: "Allows Ice Z-Move" },
    { name: "Fightinium Z", category: "z_crystal", boostType: "fighting", description: "Allows Fighting Z-Move" },
    { name: "Poisonium Z", category: "z_crystal", boostType: "poison", description: "Allows Poison Z-Move" },
    { name: "Groundium Z", category: "z_crystal", boostType: "ground", description: "Allows Ground Z-Move" },
    { name: "Flyinium Z", category: "z_crystal", boostType: "flying", description: "Allows Flying Z-Move" },
    { name: "Psychium Z", category: "z_crystal", boostType: "psychic", description: "Allows Psychic Z-Move" },
    { name: "Buginium Z", category: "z_crystal", boostType: "bug", description: "Allows Bug Z-Move" },
    { name: "Rockium Z", category: "z_crystal", boostType: "rock", description: "Allows Rock Z-Move" },
    { name: "Ghostium Z", category: "z_crystal", boostType: "ghost", description: "Allows Ghost Z-Move" },
    { name: "Dragonium Z", category: "z_crystal", boostType: "dragon", description: "Allows Dragon Z-Move" },
    { name: "Darkinium Z", category: "z_crystal", boostType: "dark", description: "Allows Dark Z-Move" },
    { name: "Steelium Z", category: "z_crystal", boostType: "steel", description: "Allows Steel Z-Move" },
    { name: "Fairium Z", category: "z_crystal", boostType: "fairy", description: "Allows Fairy Z-Move" },
    
    // ========================================
    // SPECIAL/UTILITY ITEMS
    // ========================================
    { name: "Flame Orb", category: "utility", effect: "burn_self", description: "Burns holder at end of turn" },
    { name: "Toxic Orb", category: "utility", effect: "poison_self", description: "Badly poisons holder at end of turn" },
    { name: "Light Ball", category: "utility", pokemon: "Pikachu", effect: "double_attack", description: "Doubles Pikachu's Attack and Sp. Atk" },
    { name: "Thick Club", category: "utility", pokemon: "Cubone/Marowak", effect: "double_attack", description: "Doubles Cubone/Marowak's Attack" },
    { name: "Lucky Punch", category: "utility", pokemon: "Chansey", effect: "boost_crit", description: "Boosts Chansey's critical hit ratio" },
    { name: "Stick", category: "utility", pokemon: "Farfetch'd", effect: "boost_crit", description: "Boosts Farfetch'd's critical hit ratio" },
    { name: "DeepSeaTooth", category: "utility", pokemon: "Clamperl", effect: "double_spatk", description: "Doubles Clamperl's Sp. Atk" },
    { name: "DeepSeaScale", category: "utility", pokemon: "Clamperl", effect: "double_spdef", description: "Doubles Clamperl's Sp. Def" },
    { name: "Soul Dew", category: "utility", pokemon: "Latios/Latias", effect: "boost_spatk_spdef", multiplier: 1.5, description: "Boosts Latios/Latias Sp. Atk & Sp. Def by 50%" },
    { name: "Griseous Orb", category: "utility", pokemon: "Giratina", effect: "boost_dragon_ghost", multiplier: 1.2, description: "Boosts Dragon/Ghost moves, Origin Forme" },
    { name: "Adamant Orb", category: "utility", pokemon: "Dialga", effect: "boost_dragon_steel", multiplier: 1.2, description: "Boosts Dialga's Dragon/Steel moves by 20%" },
    { name: "Lustrous Orb", category: "utility", pokemon: "Palkia", effect: "boost_dragon_water", multiplier: 1.2, description: "Boosts Palkia's Dragon/Water moves by 20%" },
    { name: "Rusted Sword", category: "utility", pokemon: "Zacian", description: "Transforms Zacian to Crowned form" },
    { name: "Rusted Shield", category: "utility", pokemon: "Zamazenta", description: "Transforms Zamazenta to Crowned form" },
    { name: "Booster Energy", category: "utility", effect: "paradox_boost", description: "Activates Paradox Pokemon abilities" },
    { name: "Clear Amulet", category: "utility", effect: "stat_drop_immunity", description: "Prevents stat drops from opponent" },
    { name: "Mirror Herb", category: "utility", effect: "copy_stat_boost", description: "Copies opponent's stat boosts once" },
    { name: "Covert Cloak", category: "utility", effect: "secondary_immunity", description: "Immune to secondary effects of moves" },
    { name: "Loaded Dice", category: "utility", effect: "multi_hit_boost", description: "Multi-hit moves hit 4-5 times" },
    { name: "Light Clay", category: "utility", effect: "extend_screens", description: "Extends Light Screen, Reflect, Aurora Veil to 8 turns" },
    { name: "Punching Glove", category: "utility", effect: "punch_boost", multiplier: 1.1, description: "Punching moves +10%, no contact" },
    { name: "Ability Shield", category: "utility", effect: "ability_protection", description: "Prevents ability changes" },
    { name: "Throat Spray", category: "utility", effect: "sound_boost", description: "Raises Sp. Atk after using sound move" },
    { name: "Room Service", category: "utility", effect: "trick_room_speed", description: "Lowers Speed in Trick Room" },
    { name: "Eject Button", category: "utility", effect: "switch_on_hit", description: "Switch out when hit by attack" },
    { name: "Eject Pack", category: "utility", effect: "switch_on_drop", description: "Switch out when stats are lowered" },
    { name: "Red Card", category: "utility", effect: "force_switch", description: "Forces attacker to switch out" },
    { name: "Weakness Policy", category: "utility", effect: "boost_on_super_effective", description: "Sharply raises Attack & Sp. Atk when hit by super-effective move" },
    { name: "Terrain Extender", category: "utility", effect: "extend_terrain", description: "Extends terrain duration to 8 turns" },
    { name: "Grassy Seed", category: "terrain_seed", terrain: "grassy", effect: "boost_defense", description: "Raises Defense in Grassy Terrain" },
    { name: "Electric Seed", category: "terrain_seed", terrain: "electric", effect: "boost_defense", description: "Raises Defense in Electric Terrain" },
    { name: "Misty Seed", category: "terrain_seed", terrain: "misty", effect: "boost_spdef", description: "Raises Sp. Def in Misty Terrain" },
    { name: "Psychic Seed", category: "terrain_seed", terrain: "psychic", effect: "boost_spdef", description: "Raises Sp. Def in Psychic Terrain" },
    { name: "White Herb", category: "utility", effect: "restore_stats", description: "Restores lowered stats once" },
    { name: "Mental Herb", category: "utility", effect: "cure_infatuation", description: "Cures infatuation, Taunt, Encore, etc." },
    { name: "Power Herb", category: "utility", effect: "skip_charge", description: "Skip charging turn for moves like Solar Beam" },
    { name: "Focus Band", category: "utility", effect: "survive_chance", description: "10% chance to survive a KO hit with 1 HP" },
    { name: "King's Rock", category: "utility", effect: "flinch_chance", description: "10% chance to cause flinching" },
    { name: "Razor Fang", category: "utility", effect: "flinch_chance", description: "10% chance to cause flinching" },
    { name: "Scope Lens", category: "utility", effect: "boost_crit", description: "Increases critical hit ratio by 1 stage" },
    { name: "Razor Claw", category: "utility", effect: "boost_crit", description: "Increases critical hit ratio by 1 stage" },
    { name: "Wide Lens", category: "utility", effect: "boost_accuracy", multiplier: 1.1, description: "Boosts accuracy by 10%" },
    { name: "Zoom Lens", category: "utility", effect: "boost_accuracy_slow", multiplier: 1.2, description: "Boosts accuracy by 20% if moving after target" },
    { name: "Bright Powder", category: "utility", effect: "lower_opponent_accuracy", description: "Lowers opponent's accuracy by 10%" },
    { name: "Lax Incense", category: "utility", effect: "lower_opponent_accuracy", description: "Lowers opponent's accuracy by 10%" },
    { name: "Binding Band", category: "utility", effect: "trap_damage_boost", description: "Trapping moves deal 1/6 HP instead of 1/8" },
    { name: "Grip Claw", category: "utility", effect: "extend_trap", description: "Trapping moves last 7 turns" },
    { name: "Shed Shell", category: "utility", effect: "escape_trap", description: "Can switch out even if trapped" },
    { name: "Smoke Ball", category: "utility", effect: "escape_wild", description: "Guarantees escape from wild Pokemon" },
    { name: "Float Stone", category: "utility", effect: "halve_weight", description: "Halves holder's weight" },
    { name: "Macho Brace", category: "utility", effect: "halve_speed", description: "Halves Speed, doubles EVs gained" },
    { name: "Ring Target", category: "utility", effect: "remove_immunity", description: "Removes holder's type immunities" },
    { name: "Lagging Tail", category: "utility", effect: "move_last", description: "Holder always moves last" },
    { name: "Destiny Knot", category: "utility", effect: "share_infatuation", description: "Infatuates attacker if holder becomes infatuated" },
    
    // ========================================
    // NO ITEM
    // ========================================
    { name: "None", category: "none", effect: "none", description: "No held item" }
];

// Get item by name
function getItemByName(name) {
    if (!name) return null;
    const lowerName = name.toLowerCase();
    return ITEMS_DATA.find(i => i.name.toLowerCase() === lowerName);
}

// Search items
function searchItems(query) {
    const lowerQuery = query.toLowerCase();
    return ITEMS_DATA.filter(i => 
        i.name.toLowerCase().includes(lowerQuery) ||
        i.description.toLowerCase().includes(lowerQuery) ||
        i.category.toLowerCase().includes(lowerQuery)
    );
}

// Apply item effects to offensive calculation
function applyItemToOffense(item, move, attackerTypes, effectiveness) {
    if (!item || !move) return 1;
    
    const itemData = typeof item === 'string' ? getItemByName(item) : item;
    if (!itemData) return 1;
    
    let multiplier = 1;
    
    switch (itemData.category) {
        case 'choice':
            if (itemData.effect === 'boost_attack' && move.category === 'physical') {
                multiplier *= 1.5;
            } else if (itemData.effect === 'boost_spatk' && move.category === 'special') {
                multiplier *= 1.5;
            }
            break;
            
        case 'damage':
            if (itemData.effect === 'boost_damage') {
                multiplier *= itemData.multiplier;
            } else if (itemData.effect === 'boost_super_effective' && effectiveness > 1) {
                multiplier *= itemData.multiplier;
            } else if (itemData.effect === 'boost_physical' && move.category === 'physical') {
                multiplier *= itemData.multiplier;
            } else if (itemData.effect === 'boost_special' && move.category === 'special') {
                multiplier *= itemData.multiplier;
            }
            break;
            
        case 'type_boost':
        case 'plate':
        case 'gem':
            if (itemData.boostType && move.type.toLowerCase() === itemData.boostType) {
                multiplier *= itemData.multiplier;
            }
            break;
    }
    
    return multiplier;
}

// Apply item effects to defensive calculation
function applyItemToDefense(item, moveType, effectiveness) {
    if (!item) return 1;
    
    const itemData = typeof item === 'string' ? getItemByName(item) : item;
    if (!itemData) return 1;
    
    // Resist berries only work on super-effective hits
    if (itemData.category === 'resist_berry') {
        if (itemData.resistType === moveType.toLowerCase() && effectiveness > 1) {
            return itemData.multiplier; // 0.5
        }
    }
    
    // Assault Vest boosts Sp. Def
    if (itemData.effect === 'boost_spdef') {
        // This would need special handling in actual damage calc
        return 1;
    }
    
    return 1;
}
