# itemsIdleRPG.md — Contexto + Prompt para generar base grande de data

## 1) Contexto del juego (resumen)
- Juego: Idle ARPG.
- Equipamiento activo hoy: `weapon` y `armor`.
- Pipeline actual de item: `base + implicit + affixes + upgrade`.
- Objetivo de rework: más variabilidad, mejor legibilidad, menos snowball.

## 2) Decisiones cerradas (no rediscutir)

### Densidad objetivo por rareza
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

### Reglas de solape
- No duplicar stats entre affixes.
- Solape `base/implicit` con affix: solo `epic/legendary`, con penalización de peso `0.30`, máximo 1 solape por item.

## 3) Qué existe hoy en código

### Archivos clave
- `src/data/itemFamilies.js`
- `src/data/items.js`
- `src/data/affixes.js`
- `src/utils/loot.js`
- `src/engine/affixesEngine.js`
- `src/engine/crafting/craftingEngine.js`
- `src/engine/combat/statEngine.js`

### Campos de familias (actual)
```js
{
  name,
  slot, // "weapon" | "armor"
  primaryBase,
  primaryBaseRange: { min, max },
  extraBases: [{ stat, weight, range: { min, max } }],
  affinityCategories,
  preferredStats,
  discouragedStats,
  implicitByRarity: { common, magic, rare, epic, legendary }
}
```

### Campos de ítems base (actual)
```js
{
  id,
  name,
  family,
  type, // "weapon" | "armor"
  rarity,
  bonus, // mapa de stats flat/%
  dropChance,
  sellValue
}
```

### Stats conocidos por engine (priorizar)
- damage, defense, healthMax, healthRegen
- critChance, critDamage, critOnLowHp
- attackSpeed, lifesteal, dodgeChance, blockChance
- damageOnKill, thorns
- goldBonus, goldBonusPct, xpBonus, essenceBonus, lootBonus, luck
- cooldownReduction, skillPower

## 4) Qué queremos que la otra IA genere
Queremos una **base grande de data** (no código de lógica), lista para pegar en el repo.

Entregables:
1. Catálogo ampliado de familias (`weapon` y `armor`) con pesos y rangos.
2. Catálogo grande de base items por rareza (muchos ejemplos, no 10).
3. Pool ampliado de affixes con tiers, ranges, weight y categorías.
4. Pesos por rareza/familia para drops.
5. Sugerencias de contenido nuevo **aunque aún no exista en engine**.

## 5) Importante: contenido nuevo no soportado aún
Si agrega cosas nuevas, marcarlas SIEMPRE con comentario claro para que no rompa.

Ejemplo de convención obligatoria:
```js
futureTags: ["bleed", "ignite"], // FUTURO_NO_ENGINE: requiere soporte en statEngine/combat
```

o

```js
specialProc: { onCrit: "arc_splash" }, // FUTURO_NO_ENGINE
```

Regla:
- Todo lo no soportado hoy debe incluir `// FUTURO_NO_ENGINE`.
- Además, incluir un bloque final "compatibilidad" con una lista de campos nuevos introducidos.

## 6) Prompt listo para copiar/pegar

```text
Usa este contexto como fuente de verdad: notes/itemsIdleRPG.md.

Tarea:
Generar una base grande de DATA para el sistema de ítems de un idle ARPG, lista para implementar.
No quiero teoría larga: quiero tablas/objetos concretos.

Decisiones cerradas (obligatorio respetar):
- Densidad por rareza: Common 2, Magic 3, Rare 4, Epic 6, Legendary 8.
- Composición: Common 1B+1I+0A; Magic 1B+1I+1A; Rare 1B+1I+2A; Epic 2B+1I+3A; Legendary 3B+1I+4A.
- Solape base/implicit con affix: solo Epic/Legendary, penalización de peso 0.30, máximo 1 por item.
- No duplicar stats entre affixes del mismo item.

Necesito que entregues exactamente:
1) ITEM_FAMILIES_EXPANDED
- mínimo 16 familias (8 weapon + 8 armor).
- cada familia con: slot, primaryBase, primaryBaseRange, extraBases con weights, implicitByRarity, affinityCategories, preferredStats, discouragedStats.

2) ITEMS_EXPANDED
- mínimo 200 items base (repartidos entre rarezas y slots).
- incluir: id, name, family, type, rarity, bonus, dropChance, sellValue.
- nombres temáticos variados (no repetitivos).

3) AFFIX_POOL_EXPANDED
- mínimo 80 affixes totales entre prefix/suffix.
- cada affix con tiers T3/T2/T1, rango min/max y peso.
- categorías equilibradas: offense/defense/economy/utility/special.

4) DROP_WEIGHTS_BY_RARITY
- tabla de pesos por rareza y familia.

5) FUTURE_VARIANTS
- agrega variantes que hoy no existen en engine para dar variabilidad (ej: bleed, burn, barrier, chain-hit, on-kill procs),
  PERO cada campo nuevo debe ir marcado con comentario `// FUTURO_NO_ENGINE`.
- incluir al final una tabla "Campos nuevos y qué engine requiere tocarlos".

Formato de salida:
- Un único bloque Markdown con secciones:
  A) Resumen breve (10 líneas máx)
  B) Bloques JS listos para copiar
  C) Checklist de compatibilidad
- Evitar explicación extensa.
- Si dudas entre dos opciones, elige la más conservadora para balance.
```

## 7) Nota operativa
Cuando recibamos la respuesta, primero separar:
- "usable hoy" (sin tocar engine),
- "future" (marcado con FUTURO_NO_ENGINE),
antes de pegar nada al repo.
