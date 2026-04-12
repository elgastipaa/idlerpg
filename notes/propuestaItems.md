# Roadmap — Rework de Items (propuestaItems)

## 1) Decisiones cerradas (ya acordadas)

### Objetivo de densidad por rareza
- Common: **2 líneas**
- Magic: **3 líneas**
- Rare: **4 líneas**
- Epic: **6 líneas**
- Legendary: **8 líneas**

### Composición por rareza
- Common: `1 base + 1 implicit + 0 affix`
- Magic: `1 base + 1 implicit + 1 affix`
- Rare: `1 base + 1 implicit + 2 affix`
- Epic: `2 base + 1 implicit + 3 affix`
- Legendary: `3 base + 1 implicit + 4 affix`

### Principios
- Menos ruido de affixes, más legibilidad del item.
- Rareza alta gana profundidad también vía **bases extra**, no solo afijos.
- Upgrade **no agrega líneas nuevas**, solo mejora valores existentes.

---

## 2) Riesgos a controlar (antes de codificar fuerte)

1. Romper identidad de familias por bases extra demasiado libres.
2. Snowball por acumulación de demasiados `%` en un mismo item.
3. Items "clónicos" si los pesos no están bien distribuidos.
4. Comparativas UI confusas si cambian muchas líneas por rareza.

Mitigaciones:
- Pool de bases extra por familia/slot (acotado, con pesos).
- Regla de no duplicar stat en un mismo item.
- Límite de stats porcentuales por item (ej: max 2-3).
- Pruebas de simulación masiva de drops antes de balance final.

---

## 3) Modelo de datos objetivo

## 3.1 Catálogo de familias y slots
Crear catálogo único (`itemFamilies`):
- `id` familia (ej: greatsword, dagger, plate, leather, focus, etc.)
- `slot` (weapon, helmet, chest, gloves, boots, ring, amulet, etc.)
- `basePrimary` (stat base principal)
- `baseSecondaryPool` (stats base extra posibles con pesos)
- `implicitStat` + tabla por rareza
- `affixBiasTags` (para soft bias)

## 3.2 Tabla de estructura por rareza
Crear tabla declarativa (`rarityBlueprint`):
- `baseCount`
- `implicitCount` (siempre 1)
- `affixCount`
- límites opcionales (`maxPercentStats`, `maxDefensiveLines`, etc.)

## 3.3 Pools de stats y pesos
Separar en bloques:
- `baseStatPoolsBySlot` (posibles bases por slot/familia + weight)
- `affixPools` por prefijo/sufijo/categoría
- `softBiasWeights` por familia/tag

Formato sugerido:
- `{ stat, min, max, weight, tags, constraints }`

## 3.4 Reglas de generación
- No stat duplicado por item.
- Si una línea candidata rompe límites globales, reroll de esa línea.
- Bases extra priorizan identidad de familia (weights), pero no 100% rígido.

---

## 4) Plan de implementación por fases

## Fase 1 — Infraestructura de datos
Objetivo: dejar el sistema preparado sin romper gameplay actual.

Tareas:
1. Crear archivo/s módulo/s de configuración:
   - `rarityBlueprint`
   - `itemFamilies`
   - `baseStatPoolsBySlot`
   - `affixPools` (si no existe ya centralizado)
2. Mapear familias actuales a nuevo esquema sin cambiar todavía tasas globales.
3. Agregar validadores puros:
   - `validateNoDuplicateStats(item)`
   - `validatePercentCap(item)`
   - `validateBlueprint(item, rarity)`

Criterio de salida:
- Se pueden generar items "compatibles" con blueprint sin tocar UI.

## Fase 2 — Generador y balance inicial
Objetivo: aplicar nueva densidad/estructura en drops reales.

Tareas:
1. Reescribir pipeline de roll por capas:
   - roll base principal
   - roll bases extra según rareza
   - roll implicit
   - roll affixes
2. Aplicar tabla acordada de composición por rareza.
3. Implementar soft bias en selección (solo pesos, sin hard lock salvo casos extremos).
4. Añadir guardrails:
   - no duplicados
   - límite de `%` por item
   - fallback si no hay candidato válido

Criterio de salida:
- Simulación de N drops por rareza cumple densidad objetivo.

## Fase 3 — UI, comparativas y tuning
Objetivo: que el jugador entienda el nuevo sistema sin fricción.

Tareas:
1. Asegurar que Item Stats se vea compacto y legible para 6-8 líneas.
2. Mostrar claramente qué línea es Base, Implicit, Affix (etiqueta sutil).
3. Verificar comparativas de equipado vs drop con nuevo número de líneas.
4. Ajustar pesos/costos según métricas de uso real.

Criterio de salida:
- UX clara y sin redundancia; balance estable en sesiones largas.

---

## 5) Instrumentación mínima (obligatoria)

Agregar métricas para calibrar con datos:
- `% drops equipados` por rareza.
- `rerolls por item equipado`.
- `tiempo promedio para reemplazar slot`.
- `distribución de cantidad de stats % por item`.
- `top stats más frecuentes por slot/familia`.

Objetivo:
- detectar rápido si hay dominancia de 2-3 stats o si rarezas altas no se sienten mejores.

---

## 6) Trabajo con otras IAs (recomendado)

Sí, conviene. Propongo usar 3 frentes en paralelo:

1. IA A — Economía y costos
- Diseñar curva de costos de upgrade/reroll/forge sin muros.
- Entregar fórmulas + tabla de ejemplo 1-20.

2. IA B — Balance de pools/pesos
- Proponer pesos por familia/slot para base y affixes.
- Entregar simulación conceptual y riesgos de meta dominante.

3. IA C — UX de legibilidad de item
- Definir formato final de card/modal para 8 líneas sin ruido.
- Reglas de prioridad visual (qué destacar y qué no).

### Prompt base para pasar a otras IAs
"Estamos reworkeando un sistema ARPG-lite de items. Decisiones cerradas:
- Densidad por rareza: Common 2, Magic 3, Rare 4, Epic 6, Legendary 8.
- Composición: Common 1B+1I+0A; Magic 1B+1I+1A; Rare 1B+1I+2A; Epic 2B+1I+3A; Legendary 3B+1I+4A.
- Upgrade no agrega líneas nuevas, solo mejora valores.
- Queremos soft bias por familia/slot (pesos, no hard lock salvo extremos).

Necesito una propuesta concreta y accionable de [ECONOMÍA / POOLS / UX], con:
1) reglas exactas,
2) tabla de ejemplo,
3) riesgos y mitigaciones,
4) plan de implementación por pasos,
5) métricas para validar en producción.

Contexto de objetivo: evitar snowball, evitar muros, mantener identidad de familia y legibilidad en mobile." 

---

## 7) Entregables técnicos sugeridos

1. `notes/item-system-spec-v2.md`
- Especificación funcional cerrada.

2. `src/data/itemBlueprints.(js|ts)`
- Tablas de rareza/familias/pools.

3. `src/systems/itemRoller.(js|ts)`
- Generador por capas con validaciones.

4. `src/systems/itemValidation.(js|ts)`
- Reglas de integridad y caps.

5. `notes/item-balance-playtest.md`
- Métricas observadas + ajustes iterativos.

---

## 8) Orden recomendado de ejecución (rápido y seguro)

1. Cerrar spec de datos (familias/slots/stats/pesos iniciales).
2. Implementar generador con blueprint + validaciones.
3. Correr simulación de drops (script interno) y ajustar pesos.
4. Recién después ajustar UI fina.
5. Playtest corto y ajuste de costos/pesos.

Este orden evita retrabajo visual sobre reglas todavía inestables.
