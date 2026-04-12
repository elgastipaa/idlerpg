# Contexto IA — Item System Rework (IdleRPG)

Documento de contexto para que otra IA pueda proponer cambios accionables sin perderse.
Fecha de corte: 2026-04-12.

## 1) Resumen del juego (muy corto)
- Idle ARPG con combate automático por tiers.
- Progresión por: combate, loot, equipamiento, crafting, talentos y prestigio.
- Sólo hay 2 slots de equipo activos hoy: `weapon` y `armor`.
- UI prioriza mobile: compacta, comparativas claras, poco ruido visual.

## 2) Objetivo del rework de items
Queremos un sistema más balanceable y legible, sin inflar complejidad.
En especial:
- evitar snowball de poder,
- evitar items con ruido inútil,
- mantener identidad por familia,
- mantener decisiones de crafting relevantes.

## 3) Decisiones ya cerradas (NO rediscutir)

### Densidad por rareza
- Common: 2 líneas
- Magic: 3 líneas
- Rare: 4 líneas
- Epic: 6 líneas
- Legendary: 8 líneas

### Composición por rareza
- Common: `1 base + 1 implicit + 0 affix`
- Magic: `1 base + 1 implicit + 1 affix`
- Rare: `1 base + 1 implicit + 2 affix`
- Epic: `2 base + 1 implicit + 3 affix`
- Legendary: `3 base + 1 implicit + 4 affix`

### Reglas de producto
- Upgrade NO agrega líneas nuevas.
- Queremos soft bias por familia/slot (pesos, no hard lock salvo casos extremos).
- No agregar sistemas nuevos por ahora (sin “blessing”, sin capas extra de complejidad).

## 4) Estado técnico actual (real)

## 4.1 Generación de loot
Archivo: `src/utils/loot.js`
- `generateLoot(...)` calcula drop chance global + rareza.
- `rollRarity(...)` usa config por rareza (base/boss/tier/luck).
- `pickItemByRarity(...)` elige base item desde `ITEMS`.
- `materializeItem(...)` construye item final con:
  - `baseBonus` (del item base),
  - `implicitBonus` (por familia+rareza),
  - `affixes` (rolleo aparte),
  - `upgradeBonus` (depende de `level`).

## 4.2 Affixes
Archivo: `src/engine/affixesEngine.js`
- Count actual por rareza:
  - common `1/0` (prefix/suffix)
  - magic `1/1`
  - rare `1/1`
  - epic `2/1`
  - legendary `2/2`
- Selección con weighted pick por tiers + modificador por `itemTier`.
- Evita categorías duplicadas (no evita necesariamente todos los duplicados de stat por otras vías).
- Tiene soporte de:
  - reroll total,
  - polish de una línea,
  - reforge con opciones,
  - addAffix,
  - mergeAffixes.

## 4.3 Crafting
Archivo: `src/engine/crafting/craftingEngine.js`
- Operaciones actuales: reroll, polish, reforge, upgrade, ascend, extract, fuse.
- Costos actuales:
  - reroll/polish/reforge: fórmula base * multiplicador por rareza * crecimiento por contador de uso.
  - upgrade: costo cuadrático por nivel y rareza + chance de fallo (puede bajar nivel).
  - ascend: costo fijo por rareza + minLevel + agrega affix.
- `rebuildItem(...)` recompone bonus desde `baseBonus + upgradeBonus + implicitBonus + affixes`.

## 4.4 Familias / implicits
Archivo: `src/data/itemFamilies.js`
- Familias actuales (`sword`, `axe`, `mace`, `dagger`, `spear`, `plate`, `mail`, etc.)
- Cada familia define `implicitByRarity`.

## 4.5 Pool de affixes
Archivo: `src/data/affixes.js`
- `PREFIXES` y `SUFFIXES` con tiers 1/2/3, rangos y weights.
- Mezcla stats de offense/defense/economy/utility/special.

## 4.6 Base items
Archivo: `src/data/items.js`
- Catálogo base de ítems por rareza con `bonus` inicial y `dropChance`.
- También existe `ITEM_STAT_PROFILES` al final del archivo.

## 4.7 Cálculo de stats efectivos del jugador
Archivo: `src/engine/combat/statEngine.js`
- Stats relevantes realmente usados en combate/economía:
  - damage, defense, healthMax, healthRegen,
  - critChance, critDamage, critOnLowHp,
  - attackSpeed, lifesteal, dodgeChance, blockChance,
  - damageOnKill, thorns,
  - goldBonus/goldBonusPct, xpBonus, essenceBonus, lootBonus, luck,
  - cooldownReduction, skillPower.

## 5) Problemas detectados
- La densidad actual no sigue el blueprint objetivo 2/3/4/6/8.
- Demasiado peso en affixes para rarezas altas en algunos casos.
- Falta esquema formal de “bases extra” por rareza/familia con pesos.
- Falta una tabla única de blueprint declarativa (hoy está repartido).
- Riesgo de stacking excesivo de stats porcentuales en ciertos rolls.

## 6) Qué necesitamos que proponga la IA externa
Queremos propuestas aplicables ya, no teoría.

Debe entregar:
1. Tabla `rarityBlueprint` final (counts + límites por rareza).
2. Diseño de `base pools` por familia/slot para bases extra (Epic/Legendary), con pesos.
3. Reglas anti-duplicados y límites de `%` por item.
4. Ajuste de pools/weights de affixes compatible con el blueprint acordado.
5. Plan de migración técnica en 3 fases (archivos y orden de implementación).

Opcional útil:
- propuesta de script simple de simulación de drops para validar distribución.

## 7) Restricciones de la propuesta
- Mantener sistema comprensible y mantenible.
- No introducir subsistemas nuevos fuera de alcance.
- No depender de backend ni servicios externos.
- Priorizar cambios data-driven (tablas/config), no hardcode distribuido.

## 8) Formato de respuesta esperado
Pedir que responda así:
1. Tablas concretas (familias, base pools, affix pools, límites).
2. Reglas exactas (pseudocódigo breve).
3. Patch plan por archivos.
4. Riesgos + mitigaciones.
5. Checklist de validación.

## 9) Archivos clave a adjuntar a la otra IA
Mínimo:
- `notes/propuestaItems.md`
- `notes/item-system-spec-v2.md`
- `src/utils/loot.js`
- `src/engine/affixesEngine.js`
- `src/engine/crafting/craftingEngine.js`
- `src/data/itemFamilies.js`
- `src/data/affixes.js`
- `src/data/items.js`
- `src/engine/combat/statEngine.js`
- `src/engine/inventory/inventoryEngine.js`

## 10) Prompt sugerido para usar junto con este contexto
"Usa `notes/contextIA.md` como fuente de verdad. No rediscutas decisiones cerradas.
Proponé una versión implementable del rework de items con enfoque data-driven.
Necesito tablas + reglas + patch plan por archivos.
Priorizá balance, legibilidad y evitar snowball.
No agregues sistemas nuevos fuera del alcance definido."
