# Auditoría técnica actual: Items, Afijos, Crafting y Entropy

Fecha de auditoría: 2026-04-26
Objetivo: diagnóstico técnico + análisis de diseño del sistema actual (sin proponer todavía el rediseño final).

## Alcance y fuentes de código revisadas
- `src/data/items.js`
- `src/data/affixes.js`
- `src/data/itemFamilies.js`
- `src/utils/loot.js`
- `src/engine/affixesEngine.js`
- `src/engine/inventory/inventoryEngine.js`
- `src/engine/crafting/craftingEngine.js`
- `src/constants/craftingCosts.js`
- `src/state/gameReducer.js`
- `src/engine/combat/processTickRuntime.js`
- `src/engine/progression/rewards.js`
- `src/components/Inventory.jsx`
- `src/utils/itemPresentation.js`
- `src/components/Crafting.jsx`
- `src/components/crafting/craftingUi.js`
- `src/engine/sanctuary/projectForgeEngine.js`
- `src/state/reducerDomains/blueprintForgeReducer.js`
- `src/engine/sanctuary/jobEngine.js`
- `src/state/reducerDomains/sanctuaryJobsReducer.js`
- `src/engine/sanctuary/relicArmoryEngine.js`
- `src/state/reducerDomains/runFlowReducer.js`
- `src/engine/stateInitializer.js`
- `src/utils/runTelemetry.js`
- `src/hooks/useGame.js`

---

## 1) Estructura actual del item

### Campos que tiene hoy un item de inventario/equipo
- `id`: identificador único instanciado.
- `itemId`: id de plantilla base (referencia a `ITEMS`).
- `name`: nombre final (con prefijos/sufijos aplicados).
- `type`: slot efectivo (`weapon` o `armor`).
- `family` y `familyName`: familia del item.
- `rarity`: `common | magic | rare | epic | legendary`.
- `bonus`: mapa agregado final de stats efectivos.
- `baseBonus`: stats base de la pieza (líneas base de familia).
- `upgradeBonus`: delta por upgrade `level`.
- `implicitBonus`: implícito por familia+rareza.
- `implicitUpgradeBonus`: delta de implícitos por `level`.
- `affixes`: array de afijos rollados.
- `itemTier`: tier del contexto de drop (no es el tier del afijo).
- `level`: nivel de upgrade del item (`+N`).
- `crafting`: contadores/locks de crafting (`rerollCount`, `polishCount`, `reforgeCount`, `ascendCount`, `polishCountsByIndex`, `focusedAffixIndex`, `focusedAffixStat`).
- `sellValue`, `dropChance`, `rating`, `legendaryPowerId` (si aplica).

### Representación pedida
- Rareza: `rarity`.
- Slot: `type` (hoy no existe un campo separado `slot` para items normales).
- Nivel/tier del item: `itemTier`.
- Upgrade level: `level`.
- Rating: `rating` calculado por `calcItemRating`.
- Entropy: no existe en items normales.
- Affixes: `affixes[]`, cada afijo guarda `id`, `stat`, `tier`, `tierLabel`, `value`, `rolledValue`, `range`, `kind`, `category`, `source`, `perfectRoll`.

### Ejemplo realista JSON: weapon
```json
{
  "id": "warbringer_axe_1760000000000_3412",
  "itemId": "warbringer_axe",
  "name": "Implacable Hacha Portaguerra del Aprendiz",
  "type": "weapon",
  "family": "axe",
  "familyName": "Axe",
  "rarity": "rare",
  "itemTier": 9,
  "level": 6,
  "rating": 1436,
  "baseBonus": {
    "damage": 27
  },
  "upgradeBonus": {
    "damage": 36.13
  },
  "implicitBonus": {
    "damageOnKill": 5.2,
    "fractureChance": 0.023
  },
  "implicitUpgradeBonus": {
    "damageOnKill": 2.16,
    "fractureChance": 0.01
  },
  "affixes": [
    {
      "id": "prefix_crit_chance",
      "stat": "critChance",
      "kind": "prefix",
      "tier": 2,
      "tierLabel": "del Asesino",
      "value": 0.053,
      "rolledValue": 0.053,
      "range": { "min": 0.03, "max": 0.06 },
      "category": "offense_precision",
      "source": "base",
      "perfectRoll": false
    },
    {
      "id": "suffix_loot_bonus",
      "stat": "lootBonus",
      "kind": "suffix",
      "tier": 3,
      "tierLabel": "del Saqueador",
      "value": 0.045,
      "rolledValue": 0.045,
      "range": { "min": 0.03, "max": 0.06 },
      "category": "economy_loot",
      "source": "base",
      "perfectRoll": false
    }
  ],
  "crafting": {
    "rerollCount": 2,
    "polishCount": 3,
    "polishCountsByIndex": {
      "0": 2,
      "1": 1
    },
    "reforgeCount": 1,
    "ascendCount": 0,
    "focusedAffixIndex": 0,
    "focusedAffixStat": "critChance"
  },
  "sellValue": 150,
  "dropChance": 28
}
```

### Ejemplo realista JSON: armor
```json
{
  "id": "juggernaut_plate_1760000000100_2277",
  "itemId": "juggernaut_plate",
  "name": "Inquebrantable Placa del Juggernaut de la Fortaleza",
  "type": "armor",
  "family": "plate",
  "familyName": "Plate",
  "rarity": "legendary",
  "itemTier": 16,
  "level": 9,
  "rating": 2387,
  "baseBonus": {
    "defense": 43,
    "healthMax": 158,
    "thorns": 9
  },
  "upgradeBonus": {
    "defense": 97.42,
    "healthMax": 176.81
  },
  "implicitBonus": {
    "blockChance": 0.112
  },
  "implicitUpgradeBonus": {
    "blockChance": 0.069
  },
  "affixes": [
    {
      "id": "prefix_defense_2",
      "stat": "defense",
      "kind": "prefix",
      "tier": 2,
      "tierLabel": "Inquebrantable",
      "value": 15.3,
      "rolledValue": 15.3,
      "range": { "min": 8, "max": 16 },
      "category": "defense_armor",
      "source": "base",
      "perfectRoll": false
    },
    {
      "id": "prefix_health_max_2",
      "stat": "healthMax",
      "kind": "prefix",
      "tier": 2,
      "tierLabel": "del Gigante",
      "value": 59.4,
      "rolledValue": 59.4,
      "range": { "min": 30, "max": 62 },
      "category": "defense_vitality",
      "source": "base",
      "perfectRoll": false
    },
    {
      "id": "suffix_block_2",
      "stat": "blockChance",
      "kind": "suffix",
      "tier": 1,
      "tierLabel": "de la Fortaleza",
      "value": 0.194,
      "rolledValue": 0.194,
      "range": { "min": 0.12, "max": 0.2 },
      "category": "defense_guard",
      "source": "base",
      "perfectRoll": true
    }
  ],
  "crafting": {
    "rerollCount": 1,
    "polishCount": 2,
    "polishCountsByIndex": {
      "2": 2
    },
    "reforgeCount": 1,
    "ascendCount": 1,
    "focusedAffixIndex": 2,
    "focusedAffixStat": "blockChance"
  },
  "legendaryPowerId": "citadel_high_guard",
  "sellValue": 550,
  "dropChance": 10
}
```

Nota: `entropy` no forma parte del item normal. El único `entropy` actual está en reliquias (`sanctuary.relicArmory[].entropy`).

---

## 2) Sistema de afijos actual

### Resumen estructural
- Definiciones base en `src/data/affixes.js`:
- `PREFIXES`: 25 definidos, 24 activos, 1 deshabilitado por peso 0.
- `SUFFIXES`: 30 definidos, 23 activos, 7 deshabilitados por peso 0.
- `ABYSS_PREFIXES`: 4 definidos, 4 activos.
- `ABYSS_SUFFIXES`: 4 definidos, 4 activos.
- Total definiciones existentes: 63.
- Total activas para roll: 55.
- Total activas en drop/crafting normal (sin abyss): 47.

### Pool por slot
- Weapon: 47 afijos activos posibles (pool normal compartido).
- Armor: 47 afijos activos posibles (pool normal compartido).
- Con pool abyss habilitado en reforja profunda (`epic/legendary`): 55 posibles en total.

### ¿Aplican a weapon/armor o ambos?
- Hoy aplican a ambos en motor de roll. No hay gating por slot en la definición del afijo.
- Diferencia real entre arma/armadura viene por base stats/implícitos/familia/rating, no por filtros de afijos por slot.

### ¿Tienen T1/T2/T3?
- Sí, todos los afijos definidos tienen estructura de tiers `1/2/3`.
- Algunos están deshabilitados porque todos sus `weight` son 0.

### ¿Pueden repetirse en un mismo item?
- No.
- El motor bloquea duplicado por:
- `id` de afijo.
- `stat` normalizada.
- `category` derivada.

### ¿Existen afijos incompatibles?
- No hay una lista explícita “A incompatible con B”.
- Incompatibilidad efectiva surge por reglas de no repetición de `stat/category`, cuota prefijo/sufijo, y reglas de overlap con base/implícito.

### ¿Hay afijos estrictamente mejores que otros?
- Sí, hay varios pares con misma `stat` donde una variante tiene rangos superiores en todos los tiers pero menor peso.
- También hay duplicados con mismos rangos (valor igual) pero distinto `id/pesos`.
- Esto implica jerarquías internas ocultas al jugador (no visibles en UI).

### Afijos deshabilitados (persisten por compatibilidad de save)
- `prefix_berserk_duration`
- `suffix_gold_flat_2`
- `suffix_luck_2`
- `suffix_gold_pct`
- `suffix_xp_bonus_2`
- `suffix_talent_boost`
- `suffix_tier_scaling`
- `suffix_prestige_bonus`

### Lista completa de afijos existentes (todos)
| id | nombre visible (tiers) | stat | slot | T1/T2/T3 | rangos y pesos | categoria/tag | fuente | activa en rolls |
|---|---|---|---|---|---|---|---|---|
| prefix_damage_1 | Afilada / del Guerrero / Devastadora | damage | ambos | si | T3: Afilada (3-6, w42); T2: del Guerrero (7-14, w20); T1: Devastadora (18-30, w8) | offense (offense) | base | si |
| prefix_damage_2 | Sangrienta / Implacable / del Aniquilador | damage | ambos | si | T3: Sangrienta (4-7, w38); T2: Implacable (8-16, w18); T1: del Aniquilador (20-34, w7) | offense (offense) | base | si |
| prefix_thorns_1 | Espinosa / de la Venganza / del Martirio | thorns | ambos | si | T3: Espinosa (2-5, w45); T2: de la Venganza (6-13, w20); T1: del Martirio (16-28, w6) | offense (offense) | base | si |
| prefix_damage_on_kill | Cazadora / del Ejecutor / de la Masacre | damageOnKill | ambos | si | T3: Cazadora (2-5, w45); T2: del Ejecutor (6-12, w20); T1: de la Masacre (14-24, w6) | offense (offense) | base | si |
| prefix_crit_chance | Certera / del Asesino / del Verdugo | critChance | ambos | si | T3: Certera (0.01-0.02, w40); T2: del Asesino (0.03-0.06, w18); T1: del Verdugo (0.08-0.13, w7) | offense (offense) | base | si |
| prefix_crit_damage | Cruel / Brutal / del Cataclismo | critDamage | ambos | si | T3: Cruel (0.1-0.2, w45); T2: Brutal (0.25-0.48, w20); T1: del Cataclismo (0.6-1.05, w6) | offense (offense) | base | si |
| prefix_attack_speed | Agil / Frenetica / del Relampago | attackSpeed | ambos | si | T3: Agil (0.02-0.04, w38); T2: Frenetica (0.05-0.09, w17); T1: del Relampago (0.12-0.18, w6) | offense (offense) | base | si |
| prefix_multi_hit | de Combo / Encadenada / de la Tempestad | multiHitChance | ambos | si | T3: de Combo (0.02-0.04, w40); T2: Encadenada (0.05-0.08, w18); T1: de la Tempestad (0.1-0.14, w5) | offense (offense) | base | si |
| prefix_mark_chance | Marcadora / de la Runa / de la Condena | markChance | ambos | si | T3: Marcadora (0.02-0.04, w38); T2: de la Runa (0.05-0.08, w17); T1: de la Condena (0.1-0.14, w5) | offense (offense) | base | si |
| prefix_bleed_chance | Serrada / Desgarradora / de la Hemorragia | bleedChance | ambos | si | T3: Serrada (0.03-0.06, w38); T2: Desgarradora (0.07-0.11, w17); T1: de la Hemorragia (0.14-0.2, w5) | offense (offense) | base | si |
| prefix_bleed_damage_2 | de Sangre Negra / del Desuello / de la Carniceria | bleedDamage | ambos | si | T3: de Sangre Negra (0.02-0.04, w36); T2: del Desuello (0.05-0.08, w16); T1: de la Carniceria (0.1-0.15, w5) | offense_bleed_power (offense) | base | si |
| prefix_fracture_chance_2 | Quebradora / del Cisma / del Cataclismo Oseo | fractureChance | ambos | si | T3: Quebradora (0.02-0.04, w36); T2: del Cisma (0.05-0.08, w16); T1: del Cataclismo Oseo (0.1-0.15, w5) | offense_fracture (offense) | base | si |
| prefix_mark_effect_2 | Runica / del Sello Profundo / de la Marca Final | markEffectPerStack | ambos | si | T3: Runica (0.015-0.03, w36); T2: del Sello Profundo (0.04-0.07, w16); T1: de la Marca Final (0.09-0.13, w5) | offense_mark_power (offense) | base | si |
| prefix_lifesteal | Vampirica / del Vampiro / del Liche | lifesteal | ambos | si | T3: Vampirica (0.01-0.02, w40); T2: del Vampiro (0.03-0.06, w18); T1: del Liche (0.08-0.15, w5) | offense (offense) | base | si |
| prefix_crit_on_low_hp | Desesperada / del Agonico / del Ultimo Aliento | critOnLowHp | ambos | si | T3: Desesperada (0.03-0.05, w38); T2: del Agonico (0.07-0.12, w17); T1: del Ultimo Aliento (0.15-0.24, w5) | offense (offense) | base | si |
| prefix_defense_1 | Reforzada / del Guardian / del Titan | defense | ambos | si | T3: Reforzada (3-6, w55); T2: del Guardian (7-15, w25); T1: del Titan (19-32, w8) | defense (defense) | base | si |
| prefix_defense_2 | Solida / Inquebrantable / del Coloso | defense | ambos | si | T3: Solida (4-7, w50); T2: Inquebrantable (8-16, w22); T1: del Coloso (20-34, w7) | defense (defense) | base | si |
| prefix_health_max_1 | Robusta / Herculea / del Leviatan | healthMax | ambos | si | T3: Robusta (12-22, w55); T2: Herculea (28-58, w25); T1: del Leviatan (78-135, w8) | defense (defense) | base | si |
| prefix_health_max_2 | Vital / del Gigante / del Semidios | healthMax | ambos | si | T3: Vital (14-24, w50); T2: del Gigante (30-62, w22); T1: del Semidios (82-140, w7) | defense (defense) | base | si |
| prefix_health_regen | Regeneradora / Vital / del Fenix | healthRegen | ambos | si | T3: Regeneradora (1-2, w50); T2: Vital (3-6, w22); T1: del Fenix (8-15, w7) | defense (defense) | base | si |
| prefix_dodge | Escurridiza / del Acrobata / Fantasmal | dodgeChance | ambos | si | T3: Escurridiza (0.01-0.03, w45); T2: del Acrobata (0.04-0.07, w20); T1: Fantasmal (0.09-0.15, w6) | defense (defense) | base | si |
| prefix_block | Protectora / del Escudo / del Baluarte | blockChance | ambos | si | T3: Protectora (0.02-0.04, w45); T2: del Escudo (0.05-0.09, w20); T1: del Baluarte (0.12-0.2, w6) | defense (defense) | base | si |
| prefix_skill_power | Arcana / de la Resonancia / del Cataclismo | critDamage | ambos | si | T3: Arcana (0.05-0.09, w46); T2: de la Resonancia (0.12-0.22, w21); T1: del Cataclismo (0.28-0.5, w6) | utility (utility) | base | si |
| prefix_cooldown_reduction | Vibrante / de los Ecos / del Torbellino | multiHitChance | ambos | si | T3: Vibrante (0.03-0.06, w46); T2: de los Ecos (0.08-0.14, w21); T1: del Torbellino (0.18-0.3, w6) | utility (utility) | base | si |
| prefix_berserk_duration | Furiosa / Salvaje / del Berserk | berserkDuration | ambos | si | T3: Furiosa (1-1, w0); T2: Salvaje (2-2, w0); T1: del Berserk (3-4, w0) | utility (utility) | base | no |
| suffix_gold_flat_1 | del Comerciante / del Magnate / del Rey Midas | goldBonus | ambos | si | T3: del Comerciante (3-7, w34); T2: del Magnate (8-18, w15); T1: del Rey Midas (22-38, w5) | economy (economy) | base | si |
| suffix_gold_flat_2 | del Saqueo / del Tesoro / del Imperio | goldBonus | ambos | si | T3: del Saqueo (2-6, w0); T2: del Tesoro (7-16, w0); T1: del Imperio (20-35, w0) | economy (economy) | base | no |
| suffix_essence_bonus | del Destilado / del Alquimista / de la Esencia Pura | essenceBonus | ambos | si | T3: del Destilado (1-2, w32); T2: del Alquimista (3-6, w15); T1: de la Esencia Pura (7-13, w5) | economy (economy) | base | si |
| suffix_luck_1 | de la Fortuna / del Destino / de los Dioses | luck | ambos | si | T3: de la Fortuna (3-8, w32); T2: del Destino (9-20, w15); T1: de los Dioses (24-42, w5) | economy (economy) | base | si |
| suffix_luck_2 | del Trebol / del Oraculo / del Elegido | luck | ambos | si | T3: del Trebol (2-7, w0); T2: del Oraculo (8-18, w0); T1: del Elegido (22-40, w0) | economy (economy) | base | no |
| suffix_gold_pct | del Cobrador / del Recaudador / del Plutocrata | goldBonusPct | ambos | si | T3: del Cobrador (0.03-0.06, w0); T2: del Recaudador (0.08-0.15, w0); T1: del Plutocrata (0.22-0.4, w0) | economy (economy) | base | no |
| suffix_xp_bonus_1 | del Aprendiz / del Sabio / de la Ascension | xpBonus | ambos | si | T3: del Aprendiz (0.04-0.07, w34); T2: del Sabio (0.09-0.16, w15); T1: de la Ascension (0.22-0.38, w5) | economy (economy) | base | si |
| suffix_xp_bonus_2 | del Estudioso / del Erudito / del Iluminado | xpBonus | ambos | si | T3: del Estudioso (0.03-0.07, w0); T2: del Erudito (0.08-0.15, w0); T1: del Iluminado (0.2-0.36, w0) | economy (economy) | base | no |
| suffix_loot_bonus | del Saqueador / del Pillador / del Devastador | lootBonus | ambos | si | T3: del Saqueador (0.03-0.06, w28); T2: del Pillador (0.08-0.15, w13); T1: del Devastador (0.2-0.35, w4) | economy (economy) | base | si |
| suffix_health_regen_2 | de la Recuperacion / de la Vitalidad / de la Inmortalidad | healthRegen | ambos | si | T3: de la Recuperacion (1-2, w50); T2: de la Vitalidad (3-6, w22); T1: de la Inmortalidad (8-15, w7) | defense (defense) | base | si |
| suffix_health_max_2 | de la Tenacidad / del Colchon Vital / de la Vida Colosal | healthMax | ambos | si | T3: de la Tenacidad (12-22, w36); T2: del Colchon Vital (26-48, w16); T1: de la Vida Colosal (62-100, w5) | defense_vitality (defense) | base | si |
| suffix_dodge_2 | de la Bruma / del Desvio / de la Ausencia | dodgeChance | ambos | si | T3: de la Bruma (0.01-0.025, w34); T2: del Desvio (0.03-0.05, w15); T1: de la Ausencia (0.06-0.1, w5) | defense_evasion (defense) | base | si |
| suffix_damage_3 | del Impacto / del Golpe Brutal / de la Ruina | damage | ambos | si | T3: del Impacto (2-5, w34); T2: del Golpe Brutal (6-11, w15); T1: de la Ruina (14-22, w5) | offense_damage_flat (offense) | base | si |
| suffix_attack_speed_2 | del Impulso / del Fervor / de la Furia Instantanea | attackSpeed | ambos | si | T3: del Impulso (0.02-0.04, w36); T2: del Fervor (0.05-0.08, w16); T1: de la Furia Instantanea (0.1-0.15, w5) | offense_speed (offense) | base | si |
| suffix_crit_chance_2 | de la Precision / del Ojo Certero / del Golpe Perfecto | critChance | ambos | si | T3: de la Precision (0.01-0.02, w36); T2: del Ojo Certero (0.03-0.05, w16); T1: del Golpe Perfecto (0.07-0.11, w5) | offense_precision (offense) | base | si |
| suffix_lifesteal_2 | del Drenaje / del Sanguinario / del Banquete Carmesi | lifesteal | ambos | si | T3: del Drenaje (0.01-0.02, w34); T2: del Sanguinario (0.03-0.05, w15); T1: del Banquete Carmesi (0.07-0.12, w5) | offense_leech (offense) | base | si |
| suffix_mark_chance_2 | del Rastro / de la Persecucion / de la Caza Final | markChance | ambos | si | T3: del Rastro (0.02-0.04, w34); T2: de la Persecucion (0.05-0.08, w15); T1: de la Caza Final (0.09-0.13, w5) | offense_mark (offense) | base | si |
| suffix_bleed_chance_2 | del Tajo / del Desangrado / de la Apertura Carmesi | bleedChance | ambos | si | T3: del Tajo (0.02-0.04, w34); T2: del Desangrado (0.05-0.08, w15); T1: de la Apertura Carmesi (0.09-0.13, w5) | offense_bleed (offense) | base | si |
| suffix_block_2 | de la Guardia / del Muro / de la Fortaleza | blockChance | ambos | si | T3: de la Guardia (0.02-0.04, w42); T2: del Muro (0.05-0.09, w19); T1: de la Fortaleza (0.12-0.2, w6) | defense (defense) | base | si |
| suffix_skill_power_2 | del Aprendiz Arcano / del Resonante / del Archimago | critDamage | ambos | si | T3: del Aprendiz Arcano (0.04-0.08, w44); T2: del Resonante (0.1-0.2, w20); T1: del Archimago (0.26-0.48, w6) | utility (utility) | base | si |
| suffix_cooldown_2 | del Agil / del Eco / de la Cadena Eterna | multiHitChance | ambos | si | T3: del Agil (0.03-0.05, w44); T2: del Eco (0.07-0.13, w20); T1: de la Cadena Eterna (0.17-0.28, w6) | utility (utility) | base | si |
| suffix_mark_effect | de la Runa Fina / del Sello / del Sigilo Absoluto | markEffectPerStack | ambos | si | T3: de la Runa Fina (0.015-0.03, w38); T2: del Sello (0.04-0.07, w17); T1: del Sigilo Absoluto (0.09-0.13, w5) | special (special) | base | si |
| suffix_damage_on_kill_2 | del Asesino / del Ejecutor / de la Exterminacion | damageOnKill | ambos | si | T3: del Asesino (2-5, w42); T2: del Ejecutor (6-13, w19); T1: de la Exterminacion (16-28, w5) | special (special) | base | si |
| suffix_bleed_damage | de Sangrado / del Desgarro / de la Exanguinacion | bleedDamage | ambos | si | T3: de Sangrado (0.02-0.04, w38); T2: del Desgarro (0.05-0.08, w17); T1: de la Exanguinacion (0.1-0.14, w5) | special (special) | base | si |
| suffix_fracture_chance | de la Ruptura / del Quebranto / del Colapso | fractureChance | ambos | si | T3: de la Ruptura (0.02-0.05, w38); T2: del Quebranto (0.06-0.09, w17); T1: del Colapso (0.11-0.16, w5) | special (special) | base | si |
| suffix_crit_on_low_hp_2 | del Desesperado / del Moribundo / del Ultimo Suspiro | critOnLowHp | ambos | si | T3: del Desesperado (0.03-0.05, w38); T2: del Moribundo (0.07-0.12, w17); T1: del Ultimo Suspiro (0.15-0.25, w5) | special (special) | base | si |
| suffix_thorns_2 | de las Espinas / del Suplicio / del Martirio Supremo | thorns | ambos | si | T3: de las Espinas (2-5, w42); T2: del Suplicio (6-13, w19); T1: del Martirio Supremo (16-28, w5) | special (special) | base | si |
| suffix_talent_boost | del Iniciado / del Experto / del Gran Maestro | talentBoost | ambos | si | T3: del Iniciado (0.03-0.05, w0); T2: del Experto (0.06-0.1, w0); T1: del Gran Maestro (0.14-0.22, w0) | utility (utility) | base | no |
| suffix_tier_scaling | del Explorador / del Veterano / de la Leyenda | tierScaling | ambos | si | T3: del Explorador (0.02-0.04, w0); T2: del Veterano (0.05-0.09, w0); T1: de la Leyenda (0.12-0.2, w0) | utility (utility) | base | no |
| suffix_prestige_bonus | del Renacido / del Ascendido / del Eterno | prestigeBonus | ambos | si | T3: del Renacido (0.02-0.04, w0); T2: del Ascendido (0.05-0.09, w0); T1: del Eterno (0.12-0.2, w0) | special (special) | base | no |
| abyss_prefix_void_strike | Vacio Cortante / de la Incision Abisal / de la Hendidura Total | voidStrikeChance | ambos | si | T3: Vacio Cortante (0.06-0.1, w18); T2: de la Incision Abisal (0.12-0.18, w9); T1: de la Hendidura Total (0.2-0.28, w3) | abyss_void_strike (abyss) | abyss | si |
| abyss_prefix_abyssal_crit | Abisal / de la Fisura Negra / de la Ruptura del Vacio | abyssalCritFractureChance | ambos | si | T3: Abisal (0.08-0.12, w18); T2: de la Fisura Negra (0.14-0.2, w9); T1: de la Ruptura del Vacio (0.24-0.32, w3) | abyss_crit_fracture (abyss) | abyss | si |
| abyss_prefix_echo_hit | Ecofractal / de la Reverberacion / del Eco Infinito | echoHitChance | ambos | si | T3: Ecofractal (0.08-0.12, w18); T2: de la Reverberacion (0.14-0.18, w9); T1: del Eco Infinito (0.22-0.28, w3) | abyss_echo_hit (abyss) | abyss | si |
| abyss_prefix_corruption_amp | Corruptora / del Castigo Corrupto / de la Amplificacion Abisal | enemyAffixDamagePct | ambos | si | T3: Corruptora (0.05-0.08, w18); T2: del Castigo Corrupto (0.1-0.15, w9); T1: de la Amplificacion Abisal (0.18-0.24, w3) | abyss_corruption_amp (abyss) | abyss | si |
| abyss_suffix_void_leech | del Drenaje Negro / del Hambre Abisal / del Banquete del Vacio | enemyAffixLifesteal | ambos | si | T3: del Drenaje Negro (0.02-0.04, w18); T2: del Hambre Abisal (0.05-0.08, w9); T1: del Banquete del Vacio (0.1-0.14, w3) | abyss_void_leech (abyss) | abyss | si |
| abyss_suffix_phase_skin | de la Piel Fase / del Velo Fase / de la Segunda Fase | phaseSkin | ambos | si | T3: de la Piel Fase (1-1, w12); T2: del Velo Fase (1-1, w6); T1: de la Segunda Fase (1-1, w2) | abyss_phase_skin (abyss) | abyss | si |
| abyss_suffix_regen | de la Marea Negra / de la Savia Abisal / del Pulso Sin Fondo | abyssRegenFlat | ambos | si | T3: de la Marea Negra (2-4, w18); T2: de la Savia Abisal (5-8, w9); T1: del Pulso Sin Fondo (10-16, w3) | abyss_regen (abyss) | abyss | si |
| abyss_suffix_fracture_ward | del Resguardo Roto / del Muro Abisal / de la Guardia del Fin | bossMechanicMitigation | ambos | si | T3: del Resguardo Roto (0.04-0.07, w18); T2: del Muro Abisal (0.08-0.12, w9); T1: de la Guardia del Fin (0.14-0.2, w3) | abyss_fracture_ward (abyss) | abyss | si |
Observación técnica importante sobre tags/categorías:
- El dataset trae `category`, pero el motor (`getAffixCategory`) normaliza muchas categorías por `stat` y sobrescribe la categoría original salvo casos `abyss_*` o casos especiales (`skill_power`, `cooldown`).
- Efecto: hay categorías de data que no gobiernan realmente la compatibilidad final como parece a primera vista.

---

## 3) Generación de drops (paso a paso)

### Pipeline real
1. `calculateRewards` llama `generateLoot(...)`.
2. Se calcula chance de drop:
- Base `0.08`.
- + boss bonus `0.3` si es boss.
- + `luck * 0.0002`.
- + `lootBonus * 0.2`.
- Cap final `0.55`.
3. Si pasa el roll de drop, se decide rareza con `rollRarity`.
4. Se elige ítem base por rareza (`pickItemByRarity`) usando `dropChance` del item y sesgos de caza/arquetipo/familia.
5. Se construyen bases de familia:
- `baseBonus` por familia/rango/tier.
- `implicitBonus` por familia+rareza+tier.
6. Se rolean afijos con `rollAffixes` según rareza, tier, stat biases y reglas de overlap.
7. Se materializa item final (`materializeItem`) y se calcula `rating` al entrar a inventario.

### Cómo decide cada parte
- Rareza:
- Tabla `RARITY_CONFIG` + boss + tier + luck + bonuses (`rarityBonus`, `rarityFloor`, early-tier bonus).
- Slot:
- No hay “roll de slot” separado; sale del item base elegido (`type` en `ITEMS`).
- Cantidad de afijos:
- `ITEM_RARITY_BLUEPRINT`:
- common 0
- magic 1
- rare 2
- epic 2
- legendary 3
- Prefijos/sufijos: `ceil(n/2)` prefijos + `floor(n/2)` sufijos.
- Tier/rango de afijo:
- Se elige tier por pesos del afijo ajustados por `itemTier` (`TIER_WEIGHT_BY_ITEM_TIER`).
- Luego roll uniforme dentro del rango min/max del tier.

### Escalado con variables pedidas
- Enemy tier:
- Afecta chance de rareza.
- Afecta `itemTier` del drop.
- Escala base stats e implícitos por `getTierScale` (flat +10% por tier delta; percent +2.5%).
- También modifica pesos de tier de afijos (más chance de T1/T2 en tiers altos).
- Player level:
- No impacta directamente el drop roll.
- En generación, `getDropItemLevel()` devuelve siempre `0`, o sea los items dropean +0.
- Boss:
- Más chance de drop, más chance de rarezas altas y mayor sesgo a stats favorecidas (`favoredStatWeightMultiplier` más alto).
- Luck:
- Sube chance de drop y chance de rareza.
- Bonus loot (`lootBonus`):
- Sube chance de drop.
- Rareza:
- Cambia cantidad de líneas base/implícitas/afijos.
- Cambia reglas de overlap con base/implícito (solo epic/legendary permiten overlap controlado).

### Diferencias reales entre rarezas (más allá de cantidad de afijos)
- `baseCount` por rareza: common/magic/rare=1, epic=2, legendary=3.
- `implicitByRarity` escala por familia.
- Reglas de overlap afijo↔base/implícito: permitidas solo en `epic/legendary` con penalidad/cap.
- Multiplicador de rating por rareza en `calcItemRating`.
- Mayor presencia de `legendaryPowerId` en templates legendarios.

### Qué condiciones generan item “bueno/promedio/malo” hoy
- Bueno:
- Rarity alta + `itemTier` alto.
- Afijos T1/T2 alineados con build o hunt.
- Margen de rating positivo vs comparable equipado/mochila.
- Idealmente con perfect rolls y/o poder legendario relevante.
- Promedio:
- Afijos mixtos, sin sinergia clara, rating cerca del comparable.
- Malo:
- Afijos off-build o economía no deseada para contexto.
- Tiers bajos en líneas críticas.
- Rating bajo frente a equipado y mejor de mochila.

---

## 4) Entropy actual

### Qué significa hoy en código
- `entropy` no existe en items normales ni en crafting de ítems de expedición.
- `entropy` hoy es una propiedad de reliquias del Arsenal (`relicArmory`).
- Se usa como fricción de sintonía contextual de reliquias.

### Dónde se guarda
- `sanctuary.relicArmory[].entropy`.

### Cómo se calcula/asigna
- Inicializa en 0 al crear reliquia.
- Al cambiar `contextAttunement`:
- `none -> contexto`: +12 entropy.
- `contexto -> contexto`: +16 entropy.
- `contexto -> none`: +4 entropy.
- Clamp en [0..100].

### Qué acciones lo consumen/modifican
- No se “consume” directamente como moneda.
- Se incrementa al sintonizar (`SET_RELIC_ATTUNEMENT`).
- Se reduce al estabilizar (`STABILIZE_RELIC_ENTROPY`), hasta 22 por acción.

### ¿Se regenera, aumenta, resetea?
- Regeneración pasiva: no.
- Aumento: sí, por retune de contexto.
- Reset total: no directo; solo reducción por estabilización o eliminación/reemplazo de reliquia.

### ¿Ligado al item o al jugador?
- Ligado a cada reliquia individual.

### Rol funcional actual
- Funciona como contador de fricción/riesgo para switching de contexto.
- No funciona como presupuesto de afijos del item.
- No funciona como límite del crafting de items normal.
- No funciona como moneda universal (los costos son `sigilFlux` y `relicDust`).

### Bugs potenciales / exploits / inconsistencias / casos raros
- Inconsistencia conceptual alta: se quiere usar Entropy para items/crafting, pero hoy está aislado en reliquias.
- El jugador puede ignorar casi todo el sistema dejando contexto en `none` (baja agencia de Entropy en loop principal).
- No hay acople entre Entropy y loops donde realmente se forza BIS (`reroll/reforge/polish`), especialmente en Deep Forge.
- Si una reliquia se descarta/reemplaza, se “resetea” indirectamente ese historial de entropy.
- En términos de UX, el jugador puede no conectar por qué paga más flux al sintonizar (falta de visibilidad causal en loop de items principal).

---

## 5) Crafting / forging actual

## 5.1 Crafting de items de expedición (engine presente)

Nota de producto/UI actual:
- La UI de `Crafting` hoy está en modo `FORGE_MODE_ORDER = ["extract"]`.
- O sea, el usuario final en esa vista sólo ve extracción táctica, aunque el engine mantiene acciones completas.

### Acción: `upgrade`
- Input requerido:
- item existente (inventario o equipado).
- Output posible:
- éxito: `level +1`.
- fallo: `level -1` (mínimo 0).
- Costo:
- oro (esencia 0).
- Recurso usado:
- `gold`.
- Afecta:
- `level`, `upgradeBonus`, `implicitUpgradeBonus`, `bonus`, `rating`.
- En `rare`, desde +7 también escala afijos (`scaleAffixesForItemLevel`).
- Puede fallar:
- sí (`UPGRADE_FAIL_CHANCE`).
- Puede degradar:
- sí (baja un nivel).
- Límites:
- cap por rareza (`common 5`, `magic 7`, `rare/epic/legendary 10`).
- Repetición indefinida:
- no (cap fijo por item).
- ¿Acerca a item perfecto desde cero?
- no directamente (no cambia identidad de afijos).

### Acción: `reroll`
- Input requerido:
- item existente.
- Output posible:
- rehace todo el set de afijos del item según rareza.
- Costo:
- principalmente esencia (oro base 0, pero fórmula contempla ambos).
- Recurso usado:
- `essence` (y oro si se configura).
- Afecta:
- afijos completos, `bonus`, `rating`.
- resetea `polishCountsByIndex`, limpia `focusedAffix*`.
- Puede fallar:
- no.
- Puede degradar:
- sí en calidad (resultado peor), no en integridad.
- Límites:
- límite por rareza (`CRAFT_ACTION_LIMITS`).
- Repetición indefinida:
- no por item (sí entre items).
- ¿Acerca a perfecto desde cero?
- parcialmente sí, pero con topes por item.

### Acción: `polish`
- Input requerido:
- item + `affixIndex`.
- Output posible:
- reroll de valor dentro del mismo tier del afijo.
- Costo:
- esencia (tier-targeted multiplier), oro base 0.
- Recurso usado:
- `essence`.
- Afecta:
- sólo valor/rango del afijo seleccionado, luego `bonus/rating`.
- Puede fallar:
- no.
- Puede degradar:
- sí (puede salir peor valor).
- Límites:
- tope por línea por rareza (`polishPerLine`).
- Repetición indefinida:
- no en ese item/línea.
- ¿Acerca a perfecto desde cero?
- sí, para “cerrar” roll de una línea ya buena.

### Acción: `reforge` (preview + apply)
- Input requerido:
- item + `affixIndex`.
- Flujo:
- `craftReforgePreview`: paga costo y genera opciones.
- `craftReforge`: aplica una opción (sin costo adicional; `skipCost=true` desde sesión).
- Output posible:
- reemplazo de 1 línea por otra de mismo kind (prefijo/sufijo).
- Costo:
- esencia (y oro si se habilita).
- Recurso usado:
- `essence`.
- Afecta:
- afijo puntual, `bonus/rating`, `reforgeCount`.
- fija línea (`focusedAffixIndex`, `focusedAffixStat`), bloqueando reforjas en otras líneas.
- Puede fallar:
- no.
- Puede degradar:
- sí en calidad si se elige peor opción.
- Límites:
- tope de reforjas por rareza.
- Repetición indefinida:
- no por item.
- ¿Acerca a perfecto desde cero?
- sí, pero con tope y lock de línea.

### Acción: `ascend`
- Input requerido:
- item, recursos, nivel mínimo.
- Output posible:
- sube rareza a la siguiente (`common->magic->rare->epic->legendary`).
- preserva afijos y asegura conteo para nueva rareza.
- opcional injerto de poder legendario al pasar a `legendary` si está desbloqueado.
- Costo:
- esencia (oro 0 en config actual).
- Recurso usado:
- `essence`.
- Afecta:
- rareza, base/implícitos, `legendaryPowerId` opcional, `ascendCount`, `bonus/rating`.
- Puede fallar:
- no.
- Puede degradar:
- no (salvo costo invertido sobre mala base).
- Límites:
- no sobre legendario.
- requiere `minLevel` por rareza.
- Repetición indefinida:
- no por item (tope en legendary).
- ¿Acerca a perfecto desde cero?
- sí, especialmente al permitir convertir base buena en legendaria con poder injertado.

### Acción: `extract`
- Input requerido:
- item en inventario (equipado bloqueado).
- Output posible:
- elimina item y da esencia.
- Costo:
- sin costo.
- Recurso usado:
- ninguno (genera `essence`).
- Afecta:
- inventario, `essence`.
- Puede fallar:
- no (salvo item inválido/equipado).
- Puede degradar:
- destruye item (acción terminal).
- Límites:
- no.
- Repetición indefinida:
- sí, por cantidad de items.
- ¿Acerca a perfecto desde cero?
- indirectamente, porque financia otros loops.

## 5.2 Forging de proyectos (Deep Forge / Santuario)

### Acción: `forge_project` (upgrade +1 por job)
- Input:
- proyecto en stash + relic dust + slot de estación + tiempo.
- Output:
- proyecto vuelve con `upgradeLevel +1`.
- Costo:
- `relicDust`.
- Tiempo:
- sí (job con duración por rareza y nivel).
- Fallo/degradación:
- no.
- Límite:
- `upgradeCap` (default 15).

### Acción: `forge_master_project` (job 24h)
- Input:
- proyecto + dust + codexInk.
- Output:
- salto de varios niveles (hasta +3 por plan).
- Costo:
- `relicDust + codexInk`.
- Tiempo:
- sí (24h base, con multiplicador de estación).
- Fallo/degradación:
- no.
- Límite:
- no si hay cap pendiente.

### Acción: `deepForgePolishProject`
- Input:
- proyecto + `affixIndex`.
- Output:
- pulido de línea base.
- Costo:
- `essence + relicDust`.
- Fallo:
- no.
- Degradación:
- puede bajar calidad de roll.
- Límites:
- no hay hard cap de usos por proyecto.

### Acción: `deepForgeRerollProject`
- Input:
- proyecto.
- Output:
- reroll total de afijos base.
- Costo:
- `essence + relicDust`.
- Fallo:
- no.
- Degradación:
- posible peor resultado.
- Límites:
- sin hard cap.

### Acción: `buildDeepForgeReforgePreview` + `deepForgeApplyReforge`
- Input:
- proyecto + línea.
- Output:
- reemplazo de línea base por opción elegida.
- Costo:
- se paga en preview (`essence + relicDust`), apply sin costo adicional.
- Afecta:
- línea base, score, `reforgeCount`, lock de línea.
- Fallo:
- no.
- Degradación:
- posible por elección.
- Límites:
- sin hard cap.
- Puede abrir abyss affixes en `epic/legendary`.

### Acción: `deepForgeAscendProject`
- Input:
- proyecto que alcanzó `upgradeCap` + costos.
- Output:
- `ascensionTier +1`, `projectTier +1`, reset de `upgradeLevel` a 0.
- opcional `selectedPowerId` en legendary.
- Costo:
- `essence + relicDust` (con extra de imprint si cambia poder).
- Fallo:
- no.
- Degradación:
- no, escala progresión.
- Límites:
- sin tope explícito de `ascensionTier`.

### Acción relacionada: `scrap_extracted_item`
- No forja un proyecto, pero alimenta el sistema devolviendo cargas de afinidad para blueprints.

### Hallazgo clave de esta sección
- En expedición hay límites por item.
- En Deep Forge no hay límites duros equivalentes en polish/reroll/reforge/ascend.
- Esto abre convergencia fuerte a piezas óptimas con suficiente tiempo/recursos.

---

## 6) Riesgo de bypass de loot

### Riesgo 1: convergencia infinita en Deep Forge
- Cómo ocurre:
- reroll/polish/reforge de proyecto sin cap duro + ascend sin tope explícito.
- Gravedad:
- alta.
- Sistema que lo permite:
- `projectForgeEngine` + `blueprintForgeReducer`.

### Riesgo 2: fabricar BIS a partir de base mediocre
- Cómo ocurre:
- upgrade/ascend de proyecto + control fino de líneas termina reduciendo dependencia del loot nuevo.
- Gravedad:
- alta.
- Sistema:
- Deep Forge + jobs + ascensión de proyecto.

### Riesgo 3: imprint de poder legendario en ascend de item
- Cómo ocurre:
- al descubrir un poder en codex, se puede injertar en cualquier ascend a legendary (si desbloqueado).
- Gravedad:
- media/alta.
- Sistema:
- `craftAscend` + codex unlocks.

### Riesgo 4: save/load manipulation local
- Cómo ocurre:
- save local JSON (`localStorage`) + export/import + ventana de autosave throttled.
- permite revertir outcomes RNG con intervención externa.
- Gravedad:
- media.
- Sistema:
- `useGame` autosave + `storage` import/export.

### Riesgo 5: economía de esencia puede trivializar loops
- Cómo ocurre:
- auto-extract + extract manual sostienen reroll/polish/reforge constantes.
- Gravedad:
- media.
- Sistema:
- auto loot rules + costos esencia.

### Riesgo 6: “rare” con límites más altos que epic/legendary
- Cómo ocurre:
- `CRAFT_ACTION_LIMITS` da más usos a rare que a epic en varios modos.
- Gravedad:
- media.
- Sistema:
- configuración de límites de crafting.

### Riesgo 7: low friction en progreso de proyecto por jobs
- Cómo ocurre:
- upgrades de proyecto por job son deterministas, sin fail/degrade.
- Gravedad:
- media.
- Sistema:
- `createForgeProjectJob`/`createForgeMasterProjectJob`.

### Riesgo 8: bypass por ausencia de Entropy en item crafting
- Cómo ocurre:
- entropy no participa en crafting de items/proyectos; no frena convergencia BIS en ese loop.
- Gravedad:
- alta (si Entropy iba a ser freno central).
- Sistema:
- separación actual entre reliquias y crafting de items.

---

## 7) Inventario y legibilidad

### Cómo se muestra actualmente un item
- Card compacta con:
- badge de rareza, glyph, nombre, `+level`, rating `P`, highlights, dots de afijos, pills de comparación, resumen de implícitos.
- Modal detallada con:
- tabla completa de stats vs equipado.
- cards de afijos (tier, perfect, wishlist, valor, rango del tier, prefijo/sufijo).
- límites de forja (`reroll/reforge/polish`).

### Cuánto texto puede tener un legendary promedio
- Entre 20 y 35 líneas visibles en modal si tiene poder legendario + 3 afijos + tabla completa + bloque de límites.

### Qué genera más clutter visual
- Combinación de:
- muchos badges/tones simultáneos.
- información redundante de afijos (tier badge + rango + label + kind + perfect/wishlist).
- tabla completa de stats aunque el jugador sólo necesita 2-4 señales de decisión.

### Qué es más difícil de entender para el jugador
- Diferencia entre:
- `itemTier` (contexto drop),
- `tier` del afijo (T1/T2/T3),
- `level` de upgrade.
- T1 “mejor” (inversión semántica habitual para algunos jugadores).
- Por qué un item con rating alto puede ser peor para una build específica.

### Comparador actual
- Sí existe.
- Muestra:
- rating delta,
- top diffs por stat,
- diff stat por stat en modal.

### ¿Puede entender rápido si es mejor/peor?
- Parcialmente sí por `rating` + chip “MEJOR”.
- Parcialmente no en casos de sinergia build (rating no es contextual).

### Datos importantes ocultos o mal comunicados
- Pesos/chances reales de afijos/tier.
- Reglas de incompatibilidad (stat/category/overlap).
- Reglas de overlap por rareza.
- Cost curves reales de crafting.
- Diferencia entre pool base y pool abyss.

---

## 8) Métricas actuales disponibles

### Disponibilidad por métrica pedida
- DPS estimado:
- sí, aproximación por `damagePerTick` en `performanceSnapshot`.
- Daño promedio por tick:
- sí.
- Supervivencia / EHP estimado:
- no hay EHP formal; hay ratios heurísticos (`pressureRatio`, HP ratio, mitigaciones implícitas).
- Rating del item:
- sí (`calcItemRating`).
- Comparación equipado vs candidato:
- sí (rating y diffs de stats).
- Impacto de un afijo específico:
- no como feature dedicada; se puede inferir indirectamente por diff de bonus/rating.
- Impacto de una acción de crafting antes de confirmar:
- parcial.
- upgrade: sí, preview de impacto.
- reforge: sí, preview de opciones.
- reroll/polish/ascend: sin preview numérico completo del resultado final.
- Eficiencia según build:
- parcial (highlights/build tag/wishlist), no optimizador formal.
- Analytics de drops:
- sí, muy completas (rarityByTier, perfects, first rare/epic/legendary, best drop score, etc.).
- Analytics de crafting:
- sí, muy completas (conteos, gasto por fuente, éxito/fallo upgrades, auto-processing).

### Fórmula de item rating actual (resumen)
- `combatScore` = suma ponderada de stats (pesos distintos arma vs armadura).
- `economyScore` = suma ponderada de stats económicas.
- `score` = `(combatScore*0.92 + economyScore*0.08) * levelWeight + legendaryEnablerScore`.
- `levelWeight = 1 + level*0.02`.
- `legendaryEnablerScore = +180` si tiene `legendaryPowerId`.
- Multiplicador final por rareza (`common 1`, `magic 1.08`, `rare 1.2`, `epic 1.38`, `legendary 1.58`).

### Limitaciones del rating
- No es contextual por clase/spec/build objetivo.
- Mezcla economía y combate con pesos fijos.
- El bonus plano de poder legendario puede sobrevalorar piezas débiles.
- No modela sinergias no lineales ni breakpoints de caps de manera explícita.

---

## 9) Análisis de diseño del sistema actual

### Legibilidad
- Mejoró respecto a un sistema sin rating/comparador, pero sigue con ruido alto.
- Mayor confusión: coexistencia de múltiples niveles (`itemTier`, `affix tier`, `upgrade level`) y badges.

### Complejidad innecesaria
- Duplicados de afijos por misma stat con diferencias mínimas o equivalentes.
- Categorías en data que no siempre gobiernan la lógica final (normalización en engine).
- Dos dominios de forging paralelos con reglas muy distintas (expedición vs deep forge).

### Riesgo de BIS
- En expedición, los caps por item frenan bastante.
- En Deep Forge, la convergencia a óptimo es mucho más fuerte por ausencia de hard caps equivalentes y ausencia de fallo.
- Resultado: tendencia a convergencia, no a diversidad sostenida.

### Agencia del jugador
- Decisiones interesantes:
- qué línea reforjar,
- cuándo ascender,
- qué poder injertar,
- qué proteger en loot.
- Decisiones falsas/trámite:
- loops repetitivos de reroll/polish con resultado esperable de “seguir hasta encontrar mejor”.

### Fun / adictividad del crafting
- Dopamina:
- hits de perfect/T1, upgrades exitosos, preview de reforja, ascensos con poder.
- Tensión positiva:
- riesgo de fallo en upgrade de ítems normales.
- Frustración:
- ruido visual y costos percibidos como opacos.
- Trámite:
- acciones repetitivas sin cambio de decisión estratégica real.

### Entropy como sistema
- Hoy no cumple rol central del loop de items/crafting.
- Es entendible en reliquias, pero periférico para el objetivo de balance de items.
- No limita crafting de BIS en el dominio donde más se necesita.

---

## 10) Restricciones técnicas

### Módulos que gobiernan cada parte
- Drops:
- `src/engine/progression/rewards.js`
- `src/utils/loot.js`
- `src/engine/combat/processTickRuntime.js`
- Affixes:
- `src/data/affixes.js`
- `src/engine/affixesEngine.js`
- Crafting de item:
- `src/engine/crafting/craftingEngine.js`
- `src/constants/craftingCosts.js`
- `src/state/gameReducer.js`
- Crafting/forging de proyecto:
- `src/engine/sanctuary/projectForgeEngine.js`
- `src/state/reducerDomains/blueprintForgeReducer.js`
- `src/engine/sanctuary/jobEngine.js`
- `src/state/reducerDomains/sanctuaryJobsReducer.js`
- Entropy:
- `src/engine/sanctuary/relicArmoryEngine.js`
- `src/state/reducerDomains/runFlowReducer.js`
- Inventory:
- `src/engine/inventory/inventoryEngine.js`
- `src/components/Inventory.jsx`
- Item UI / comparación:
- `src/components/Inventory.jsx`
- `src/utils/itemPresentation.js`
- `src/constants/rarity.js`

### Qué sería fácil de refactorizar
- Nombres/copy/tooltips/badges/UI density.
- Pesos de drop/afijos/costos (data-driven).
- Exposición de tiers en UI (ocultar sin romper lógica interna).
- Ajustes de límites por rareza.

### Qué está muy acoplado
- Hardcode de slots `weapon/armor` en múltiples capas (engine/UI/reducers/sanctuary).
- Uso de `tier` de afijo atravesando roll, UI, telemetry, highlights, crafting cost multipliers.
- Doble dominio de crafting con reglas distintas y shared stats/analytics.

### Qué cambios romperían saves existentes
- Remover `affix.tier` de persistencia sin migración.
- Cambiar shape de `affixes[]` (range/baseRange/perfectRoll) sin normalizador.
- Cambiar estructura `crafting` por item/proyecto sin fallback.
- Cambiar ids de afijos existentes (rompe items guardados).

### Migración de saves necesaria si se elimina T1/T2/T3
- Mínimo:
- preservar lectura de items legacy con `tier`.
- backfill a nuevo campo equivalente (`qualityBand` o percentil).
- recomputar `perfectRoll` o su reemplazo.
- ajustar validaciones de reforge que hoy comparan `tier`.
- actualizar UI/glyph/telemetry que hoy usan `tier===1`.

### Cambios que conviene evitar por costo técnico alto
- Cambiar ids históricos de afijos.
- Eliminar de golpe `tier` sin etapa de compatibilidad.
- Expandir slots antes de desacoplar hardcodes `weapon/armor`.
- Unificar de golpe los dos dominios de forging sin plan incremental.

---

## 11) Salida final obligatoria

### A) Lo que definitivamente hay que mantener
- Estructura `base + implicit + affixes` como capas separadas.
- Comparador rápido (rating + diffs), porque sostiene decisión inmediata.
- Highlights de loot (wishlist/hunt/perfect/T1), dan feedback útil.
- Reforge con preview y elección, porque agrega agencia real.
- Telemetría de sesión/cuenta (hay señal suficiente para balance iterativo).

### B) Lo que definitivamente hay que eliminar o simplificar
- Duplicados/legacy de afijos con peso 0 visibles en lógica extendida.
- Exposición excesiva de detalle por afijo en UI principal.
- Inconsistencias de límites por rareza (ejemplo `rare` con más usos que `epic`).
- Ambigüedad entre `tier` del afijo y `itemTier` sin framing claro.
- Dependencia de categorías declarativas que luego se sobreescriben en engine.

### C) Lo que está a medio camino y podría refactorizarse
- Rating: útil, pero necesita capa contextual por build.
- Ascend con imprint: potente, pero requiere mejor control anti-convergencia.
- Sistema de Deep Forge: divertido, pero hoy demasiado determinista para BIS.
- Entropy: buen concepto, mala ubicación en el loop principal de items.
- Auto loot rules: buenas, pero requieren explicabilidad y guardrails más claros.

### D) Top 5 riesgos técnicos del refactor
1. Romper compatibilidad de saves al tocar `affix.tier` sin migración robusta.
2. Introducir bugs por acople `weapon/armor` al preparar más slots.
3. Desalinear UI/engine si se cambia shape de afijos y no se actualizan highlights/comparadores.
4. Duplicar lógica entre crafting de expedición y deep forge si no se define ownership claro.
5. Corromper métricas históricas si cambian ids de eventos/counters sin versionado.

### E) Top 5 riesgos de diseño del sistema actual
1. Convergencia rápida a BIS por loops de Deep Forge sin topes fuertes.
2. Pérdida de valor del loot si crafting termina siendo ruta dominante.
3. Sobrecarga cognitiva por demasiadas señales visuales por item.
4. Sensación de “sistema opaco” por chances/costos/incompatibilidades no visibles.
5. Entropy irrelevante para el problema que debería resolver (crafting de items).

### F) Top 5 oportunidades fáciles de mejora
1. Ocultar T1/T2/T3 en card primaria y dejarlo sólo en detalle avanzado.
2. Reducir chips/badges en card a 2-3 máximos por prioridad.
3. Unificar nomenclatura visible de tiers (`Calidad alta/media/baja`) manteniendo dato interno.
4. Exponer “por qué este item está protegido/autoextraído” con una razón única clara.
5. Mostrar en crafting una previsualización homogénea de impacto para más acciones (no sólo upgrade/reforge).

### G) Decisiones de diseño que podés tomar sin tocar demasiado código
- Ocultar tier numérico en UI y mantenerlo interno.
- Renombrar acciones de crafting para claridad mental.
- Agrupar afijos por familia/tag en tooltips.
- Simplificar modal de item (modo resumen vs modo avanzado).
- Reordenar highlights por prioridad de decisión (upgrade/build/hunt primero).

### H) Decisiones que requieren refactor profundo
- Eliminar realmente T1/T2/T3 del modelo persistido.
- Rediseñar estructura de afijos (pool/categorías/incompatibilidades) con migración de saves.
- Integrar Entropy como corazón del loop de crafting de items/proyectos.
- Unificar o reconciliar los dos dominios de forging bajo reglas coherentes.
- Recalibrar rating para que sea contextual por build sin romper comparadores existentes.

---

## Conclusión de diagnóstico
- El sistema actual tiene buena base modular para MVP, pero la convergencia de Deep Forge y la desconexión de Entropy respecto al crafting principal son los dos ejes que más comprometen legibilidad, balance y longevidad del loot.
- Antes de diseñar el rediseño final, conviene fijar primero decisiones de compatibilidad de save (tiers/affix shape) y ownership de dominio (expedición vs santuario).
