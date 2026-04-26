export const ACHIEVEMENTS = [
{ id: "kill_1", name: "Primera Sangre", description: "Derrota 1 enemigo", category: "combat", icon: "🩸", condition: { stat: "kills", value: 1 }, reward: 20 },
{ id: "kill_25", name: "Cazador Novato", description: "Derrota 25 enemigos", category: "combat", icon: "⚔️", condition: { stat: "kills", value: 25 }, reward: 30 },
{ id: "kill_100", name: "Segador", description: "Derrota 100 enemigos", category: "combat", icon: "💀", condition: { stat: "kills", value: 100 }, reward: 60 },
{ id: "kill_250", name: "Triturador", description: "Derrota 250 enemigos", category: "combat", icon: "🪓", condition: { stat: "kills", value: 250 }, reward: 90 },
{ id: "kill_500", name: "Aniquilador", description: "Derrota 500 enemigos", category: "combat", icon: "☠️", condition: { stat: "kills", value: 500 }, reward: 150 },
{ id: "kill_1000", name: "Extincion Local", description: "Derrota 1,000 enemigos", category: "combat", icon: "🔥", condition: { stat: "kills", value: 1000 }, reward: 260 },

{ id: "boss_1", name: "Caza Mayor", description: "Derrota 1 boss", category: "combat", icon: "👑", condition: { stat: "bossKills", value: 1 }, reward: 45 },
{ id: "boss_5", name: "Rompe Jefes", description: "Derrota 5 bosses", category: "combat", icon: "🗿", condition: { stat: "bossKills", value: 5 }, reward: 110 },
{ id: "boss_15", name: "Azote del Vacio", description: "Derrota 15 bosses", category: "combat", icon: "🌋", condition: { stat: "bossKills", value: 15 }, reward: 240 },

{ id: "death_1", name: "No Era Tu Momento", description: "Muere 1 vez", category: "run", icon: "💔", condition: { stat: "deaths", value: 1 }, reward: 15 },
{ id: "death_10", name: "Veterano del Fracaso", description: "Muere 10 veces", category: "run", icon: "🪦", condition: { stat: "deaths", value: 10 }, reward: 70 },

{ id: "tier_3", name: "Rumbo al Frente", description: "Alcanza Tier 3", category: "progress", icon: "🧭", condition: { stat: "tier", value: 3 }, reward: 25 },
{ id: "tier_5", name: "Desafio Creciente", description: "Alcanza Tier 5", category: "progress", icon: "🛡️", condition: { stat: "tier", value: 5 }, reward: 45 },
{ id: "tier_7", name: "Zona Roja", description: "Alcanza Tier 7", category: "progress", icon: "🧱", condition: { stat: "tier", value: 7 }, reward: 80 },
{ id: "tier_10", name: "Maestro del Abismo", description: "Alcanza Tier 10", category: "progress", icon: "🌌", condition: { stat: "tier", value: 10 }, reward: 180 },

{ id: "level_5", name: "Subiendo Ritmo", description: "Llega a nivel 5", category: "progress", icon: "⭐", condition: { stat: "level", value: 5 }, reward: 25 },
{ id: "level_10", name: "Heroe en Ascenso", description: "Llega a nivel 10", category: "progress", icon: "🌟", condition: { stat: "level", value: 10 }, reward: 50 },
{ id: "level_20", name: "Veterania", description: "Llega a nivel 20", category: "progress", icon: "✨", condition: { stat: "level", value: 20 }, reward: 120 },
{ id: "level_30", name: "Legendario en Marcha", description: "Llega a nivel 30", category: "progress", icon: "🚀", condition: { stat: "level", value: 30 }, reward: 260 },

{ id: "gold_500", name: "Ahorrista", description: "Acumula 500 de oro", category: "economy", icon: "🪙", condition: { stat: "gold", value: 500 }, reward: 20 },
{ id: "gold_2500", name: "Magnate de Barrio", description: "Acumula 2,500 de oro", category: "economy", icon: "💰", condition: { stat: "gold", value: 2500 }, reward: 55 },
{ id: "gold_10000", name: "Midas", description: "Acumula 10,000 de oro", category: "economy", icon: "💎", condition: { stat: "gold", value: 10000 }, reward: 140 },

{ id: "item_10", name: "Coleccionista", description: "Encuentra 10 items", category: "loot", icon: "🎒", condition: { stat: "itemsFound", value: 10 }, reward: 30 },
{ id: "item_50", name: "Recolector", description: "Encuentra 50 items", category: "loot", icon: "📦", condition: { stat: "itemsFound", value: 50 }, reward: 70 },
{ id: "item_150", name: "Tesoro Ambulante", description: "Encuentra 150 items", category: "loot", icon: "🏺", condition: { stat: "itemsFound", value: 150 }, reward: 160 },

{ id: "magic_10", name: "Brillo Azul", description: "Encuentra 10 items magic", category: "loot", icon: "🟩", condition: { stat: "magicItemsFound", value: 10 }, reward: 30 },
{ id: "rare_10", name: "Pulso Raro", description: "Encuentra 10 items rare", category: "loot", icon: "🔷", condition: { stat: "rareItemsFound", value: 10 }, reward: 60 },
{ id: "epic_5", name: "Cosecha Epica", description: "Encuentra 5 items epic", category: "loot", icon: "🟣", condition: { stat: "epicItemsFound", value: 5 }, reward: 120 },
{ id: "legendary_1", name: "La Naranja", description: "Encuentra 1 item legendary", category: "loot", icon: "🟠", condition: { stat: "legendaryItemsFound", value: 1 }, reward: 220 },
{ id: "legendary_3", name: "Coleccion Dorada", description: "Encuentra 3 items legendary", category: "loot", icon: "👑", condition: { stat: "legendaryItemsFound", value: 3 }, reward: 420 },

{ id: "perfect_1", name: "Perfecto", description: "Encuentra 1 perfect roll", category: "affix", icon: "🎯", condition: { stat: "perfectRollsFound", value: 1 }, reward: 40 },
{ id: "perfect_10", name: "Mano Bendita", description: "Encuentra 10 perfect rolls", category: "affix", icon: "💫", condition: { stat: "perfectRollsFound", value: 10 }, reward: 140 },
{ id: "t1_3", name: "Aroma a T1", description: "Encuentra 3 affixes T1", category: "affix", icon: "🥇", condition: { stat: "t1AffixesFound", value: 3 }, reward: 70 },
{ id: "t1_15", name: "Perseguidor de T1", description: "Encuentra 15 affixes T1", category: "affix", icon: "🏆", condition: { stat: "t1AffixesFound", value: 15 }, reward: 240 },
{ id: "best_rating_100", name: "Buena Pieza", description: "Consigue un item de rating 100", category: "affix", icon: "📈", condition: { stat: "bestItemRating", value: 100 }, reward: 35 },
{ id: "best_rating_250", name: "Drop Serio", description: "Consigue un item de rating 250", category: "affix", icon: "📊", condition: { stat: "bestItemRating", value: 250 }, reward: 80 },
{ id: "best_rating_500", name: "Monstruo de Loot", description: "Consigue un item de rating 500", category: "affix", icon: "📡", condition: { stat: "bestItemRating", value: 500 }, reward: 180 },

{ id: "upgrade_5", name: "Herrero Amateur", description: "Haz 5 upgrades", category: "craft", icon: "🔨", condition: { stat: "upgradesCrafted", value: 5 }, reward: 35 },
{ id: "upgrade_20", name: "Martillo Vivo", description: "Haz 20 upgrades", category: "craft", icon: "⚒️", condition: { stat: "upgradesCrafted", value: 20 }, reward: 120 },
{ id: "reroll_5", name: "Cirujano", description: "Haz 5 reforjas", category: "craft", icon: "🎲", condition: { stat: "reforgesCrafted", value: 5 }, reward: 35 },
{ id: "reroll_20", name: "Arquitecto de Lineas", description: "Haz 20 reforjas", category: "craft", icon: "🌀", condition: { stat: "reforgesCrafted", value: 20 }, reward: 120 },
{ id: "ascend_3", name: "Ascendente", description: "Haz 3 ascends", category: "craft", icon: "🌠", condition: { stat: "ascendsCrafted", value: 3 }, reward: 70 },
{ id: "extract_20", name: "Reciclador", description: "Extrae 20 items", category: "craft", icon: "♻️", condition: { stat: "itemsExtracted", value: 20 }, reward: 60 },

{ id: "sell_25", name: "Mercader", description: "Vende 25 items", category: "economy", icon: "💸", condition: { stat: "itemsSold", value: 25 }, reward: 50 },
{ id: "sell_100", name: "Casa de Subastas", description: "Vende 100 items", category: "economy", icon: "🏪", condition: { stat: "itemsSold", value: 100 }, reward: 140 },
{ id: "auto_sell_20", name: "Basura Automatizada", description: "Auto-vende 20 items", category: "economy", icon: "🤖", condition: { stat: "autoSoldItems", value: 20 }, reward: 60 },
{ id: "auto_extract_20", name: "Trituradora Inteligente", description: "Auto-extrae 20 items", category: "economy", icon: "🧪", condition: { stat: "autoExtractedItems", value: 20 }, reward: 60 },

{ id: "talent_3", name: "Primeras Decisiones", description: "Desbloquea 3 talentos", category: "build", icon: "🎯", condition: { stat: "talentsUnlocked", value: 3 }, reward: 35 },
{ id: "talent_10", name: "Arquitecto", description: "Desbloquea 10 talentos", category: "build", icon: "🧠", condition: { stat: "talentsUnlocked", value: 10 }, reward: 120 },
{ id: "talent_reset_1", name: "Respec", description: "Resetea tu arbol 1 vez", category: "build", icon: "🔁", condition: { stat: "talentResets", value: 1 }, reward: 40 },
{ id: "prestige_1", name: "Renacimiento", description: "Haz 1 prestige", category: "meta", icon: "✨", condition: { stat: "prestigeCount", value: 1 }, reward: 90 },
{ id: "prestige_3", name: "Trascendente", description: "Haz 3 prestiges", category: "meta", icon: "🌠", condition: { stat: "prestigeCount", value: 3 }, reward: 260 },
];
