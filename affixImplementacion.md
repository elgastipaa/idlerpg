# Implementación propuesta: Afijos sin tiers, Entropy y Forja del Santuario

Fecha: 2026-04-26  
Estado: spec técnica para implementar por fases.  
Fuente de decisiones: `affixPropuesta.md`, secciones 23-31.  
Objetivo: bajar el diseño aprobado a módulos, cambios de data, migración, UI, analytics y pruebas.

---

## 0. Decisiones cerradas

### Modelo general

- La Forja vive en el Santuario.
- No hay proyectos, blueprints ni planos como entidad nueva del loop principal.
- El item persistente es la unidad de crafting.
- Durante la run no se hace crafting fino.
- Durante la run el jugador decide equipar, vender/extraer o guardar para Santuario.
- `Entropy` / `Entropía` es presupuesto de manipulación.
- Entropy sube al craftear, no se regenera y no se compra.
- Al llegar al cap, el item queda estabilizado.
- El último craft puede exceder el cap y luego estabiliza.

### Afijos

- T1/T2/T3 salen de UI y del modelo final.
- Se reemplazan por rangos continuos.
- Una línea puede ser `normal` o `excellent`.
- `Excelente` es loot-only.
- Crafting nunca crea una línea `Excelente`.
- Afinar una línea `Excelente` rerolles dentro de su rango excelente.
- Reforjar una línea `Excelente` sólo la conserva si el jugador elige mantener actual.

### Rarezas

- `magic`: puede tener más chance relativa de línea `Excelente`, porque tiene una sola línea.
- `rare`: misma EntropyCap base que `epic`; es la primera rareza realmente crafteable.
- `epic`: misma EntropyCap base que `rare`, pero puede usar `Imbuir`.
- `legendary`: más EntropyCap base y poder propio del drop; no puede cambiar/injertar otro poder.

### Acciones

- `Mejorar`: sube `+N`, hasta `+15`, sin falla ni degradación.
- `Afinar`: reroll simple dentro del rango de una línea, sin garantía de mejora.
- `Reforjar`: mantener actual + 2 opciones nuevas, sin enfoque/intención.
- `Imbuir`: sólo epic -> legendary, elige poder legendario desbloqueado.
- `Extraer`: simple, sin memorias.
- `Reroll total`: eliminado del juego.

---

## 1. Mapa técnico actual

### Data y generación

- `src/data/affixes.js`
  - Define `PREFIXES`, `SUFFIXES`, `ABYSS_PREFIXES`, `ABYSS_SUFFIXES`.
  - Hoy cada affix tiene `tiers` con `T1/T2/T3`, label, value y weight.

- `src/engine/affixesEngine.js`
  - Rola affixes por rareza.
  - Elige tier por pesos.
  - Construye affix instanciado con `tier`, `tierLabel`, `range`, `perfectRoll`.
  - Hace `polishAffix`.
  - Hace `generateReforgeOptions`.

- `src/utils/loot.js`
  - Genera loot.
  - Materializa item.
  - Normaliza items de save.
  - Recalcula bonus/rating.
  - Hoy contiene scaling especial de affixes para `rare` desde +7.

### Crafting

- `src/engine/crafting/craftingEngine.js`
  - Tiene `upgrade`, `reroll`, `polish`, `reforge`, `ascend`, `extract`.
  - Tiene límites por rareza.
  - Tiene lock de línea en reforge.

- `src/constants/craftingCosts.js`
  - Costos de acciones.
  - Multiplicadores por rareza.

- `src/components/Crafting.jsx`
  - UI de crafting actual.
  - Hoy sólo expone `extract` por `FORGE_MODE_ORDER = ["extract"]`.

- `src/components/crafting/craftingUi.js`
  - Metadatos de acciones visibles.

### Santuario / sistemas a reconciliar

- `src/components/DeepForgeOverlay.jsx`
  - UI actual de deep forge.
  - Trabaja proyectos, no items directos.

- `src/engine/sanctuary/projectForgeEngine.js`
  - Engine de proyectos.
  - Debe quedar deprecado para este loop o ser reemplazado por item forge.

- `src/state/reducerDomains/blueprintForgeReducer.js`
  - Reducer de deep forge/proyectos.
  - Debe dejar de ser la ruta principal del nuevo crafting.

- `src/engine/sanctuary/extractionEngine.js`
  - Resuelve extracción desde run.
  - Importante para decidir qué items llegan al Santuario.

- `src/engine/sanctuary/itemStashSchema.js`
  - Stash del Santuario.
  - Puede ser la base para guardar items trabajables.

### Save y analytics

- `src/engine/stateInitializer.js`
  - Normalización/migración de save.
  - Punto crítico para agregar Entropy y migrar affixes legacy.

- `src/utils/runTelemetry.js`
  - Payloads compactos/completos.
  - Agregar eventos de Entropy/crafting.

- `src/components/Stats.jsx`
  - Reportes visibles/exportables.

---

## 2. Shape final de item

### Item persistente

```json
{
  "id": "item_123",
  "itemId": "warbringer_axe",
  "name": "Hacha Portaguerra",
  "type": "weapon",
  "family": "axe",
  "rarity": "rare",
  "itemTier": 12,
  "level": 7,
  "rating": 1480,
  "baseBonus": {},
  "upgradeBonus": {},
  "implicitBonus": {},
  "implicitUpgradeBonus": {},
  "affixes": [],
  "crafting": {
    "entropy": 34,
    "entropyCap": 94,
    "stabilized": false,
    "craftingRulesVersion": 2,
    "lastCraftAt": 1760000000000,
    "history": [],
    "lineCraftCounts": {
      "0": { "polish": 2, "reforge": 1 },
      "1": { "polish": 0, "reforge": 0 }
    }
  }
}
```

### Campos nuevos

`crafting.entropy`

- Entero.
- Sube por acción.
- No baja.

`crafting.entropyCap`

- Entero.
- Nace con el drop.
- Puede recibir modificadores de drop.
- No se compra ni se aumenta por monetización.

`crafting.stabilized`

- Boolean.
- Bloquea acciones de crafting excepto extracción.

`crafting.craftingRulesVersion`

- Versiona la migración.
- Valor inicial nuevo: `2`.

`crafting.lineCraftCounts`

- Reemplaza el uso visible de `polishCountsByIndex` y locks.
- Guarda conteos por línea para escalar esencia.

`crafting.history`

- Guardar máximo últimos 5 eventos por item.
- El detalle completo vive en telemetry, no en save.

### Compatibilidad temporal

Durante migración pueden coexistir:

- `rerollCount`
- `polishCount`
- `reforgeCount`
- `ascendCount`
- `polishCountsByIndex`
- `focusedAffixIndex`
- `tier`
- `tierLabel`

Pero el engine nuevo no debe depender de esos campos para nuevos drops/crafts.

---

## 3. Shape final de affix

### Affix instanciado

```json
{
  "id": "prefix_defense_2",
  "stat": "defense",
  "kind": "prefix",
  "category": "defense_armor",
  "quality": "excellent",
  "qualityLabel": "Excelente",
  "source": "base",
  "value": 36,
  "rolledValue": 36,
  "range": { "min": 30, "max": 40 },
  "baseValue": 36,
  "baseRolledValue": 36,
  "baseRange": { "min": 30, "max": 40 },
  "legacyTier": 1,
  "lootOnlyQuality": true
}
```

### Campos

`quality`

- `normal`
- `excellent`

`qualityLabel`

- `Excelente` sólo para UI avanzada o tooltip.

`lootOnlyQuality`

- `true` si quality es `excellent`.

`legacyTier`

- Campo opcional para migración/debug.
- No usar en UI primaria ni nuevas reglas.

### Campos a dejar de producir en drops nuevos

- `tier`
- `tierLabel`
- `perfectRoll`

### Campos que pueden quedar en saves viejos

- `tier`
- `tierLabel`
- `perfectRoll`

El normalizador debe leerlos, convertirlos y no romper.

---

## 4. Migración de T1/T2/T3 a rangos

### Estrategia recomendada

No editar todo `src/data/affixes.js` a mano en la primera fase.

Primero crear una capa de compatibilidad:

- Lee definiciones legacy con `tiers`.
- Deriva `normalRange`.
- Deriva `excellentRange`.
- Rola nuevos affixes sin exponer tiers.

Después, en una fase de limpieza, se puede reescribir `src/data/affixes.js` al shape nuevo.

### Derivación de rangos desde tiers legacy

Para cada definición:

- `normalRange`: combina los tiers no excelentes.
- `excellentRange`: usa el tier más alto legacy.

Regla inicial:

```txt
normalRange = min(T3.min, T2.min) -> max(T3.max, T2.max)
excellentRange = T1.min -> T1.max
```

Si falta T2:

```txt
normalRange = T3
excellentRange = T1
```

Si falta T1:

```txt
normalRange = rango disponible
excellentRange = null
```

### Migración de affixes guardados

| Legacy | Nuevo |
|---|---|
| `tier === 1` | `quality: "excellent"` |
| `tier === 2` | `quality: "normal"` |
| `tier === 3` | `quality: "normal"` |
| sin tier | inferir por value/range o default `normal` |

Para `tier === 1`:

- conservar valor actual si cae dentro del rango excellent;
- si queda fuera por scaling antiguo, clamp suave al rango;
- setear `legacyTier: 1`;
- setear `lootOnlyQuality: true`.

Para `tier === 2/3`:

- conservar valor actual si cae dentro normalRange;
- setear `legacyTier`;
- setear `quality: "normal"`.

### Riesgo de esta migración

Los items viejos con T1 pasan a ser `Excelente`. Es aceptable porque preserva valor del jugador y evita nerfear saves.

---

## 5. Chance de línea Excelente

### Reglas

- Sólo se evalúa al drop.
- Nunca en `Afinar`.
- Nunca en `Reforjar`.
- Nunca en línea agregada por `Imbuir`.
- Puede recibir bonus por boss/itemTier.

### Tabla inicial para simulación

| Rareza | Chance por línea |
|---|---:|
| common | 0% |
| magic | 9% |
| rare | 5% |
| epic | 5% |
| legendary | 7% |

### Modificadores

| Fuente | Bonus |
|---|---:|
| Boss drop | +2% |
| ItemTier 9-15 | +1% |
| ItemTier 16+ | +2% |

### Justificación

- `magic` tiene una sola línea, entonces necesita mayor chance relativa para generar drops simples pero emocionantes.
- `rare` y `epic` comparten base de Entropy, pero epic tiene `Imbuir`.
- `legendary` tiene más cap y poder propio, por eso puede tener chance un poco mayor.

### Clamp

Chance final máxima sugerida:

```txt
excellentChance <= 12%
```

Esto evita que `Excelente` deje de ser señal de loot.

---

## 6. EntropyCap

### Tabla base final v1

| Rareza | EntropyCap base | Rol |
|---|---:|---|
| common | 20 | material / tempo temprano |
| magic | 38 | una línea, chance alta relativa de Excelente |
| rare | 90 | muy crafteable |
| epic | 90 | crafteable + puede Imbuir |
| legendary | 112 | más margen + poder fijo del drop |

### Modificadores

| Factor | Bonus |
|---|---:|
| ItemTier 5-8 | +4 |
| ItemTier 9-12 | +8 |
| ItemTier 13-16 | +12 |
| ItemTier 17+ | +16 |
| Boss drop | +6 |
| Cada línea Excelente | +4 |
| Variación de drop | -4 a +6 |

### Fórmula

```txt
entropyCap =
  basePorRareza
  + bonusItemTier
  + bossBonus
  + excellentBonus
  + variance
```

### Clamp sugerido

| Rareza | Min | Max |
|---|---:|---:|
| common | 14 | 34 |
| magic | 30 | 60 |
| rare | 78 | 116 |
| epic | 78 | 116 |
| legendary | 96 | 140 |

### Entropy inicial

Drops nuevos:

```txt
entropy = 0
stabilized = false
```

Items migrados:

```txt
entropy = min(entropyCap - 1, legacyEntropyEstimate)
```

No estabilizar masivamente items legacy salvo casos extremos o corruptos.

---

## 7. Acciones de crafting

## 7.1 Mejorar

### Regla

- Sube `level +1`.
- Cap nuevo: `+15`.
- Sin falla.
- Sin degradación.
- Consume Entropy fija.
- Consume oro.

### Entropy

```txt
entropyCost = 4
```

### Costo material

Mantener oro como recurso principal.

Propuesta:

```txt
goldCost = baseGold * (level + 1)^2 * rarityMultiplier
```

No aplicar multiplicador adicional de Entropy por repetición.

### Scaling

Para el vertical slice:

- Escalar base stats.
- Escalar implicit stats.
- Eliminar la excepción oculta de rare +7 que escala affixes.

Motivo:

- La rareza `rare` ya recibe rol por EntropyCap/costos.
- Evitamos una regla invisible que sólo aplica a una rareza.

### Último craft

Si `entropy + 4 >= entropyCap`, permitir el upgrade y marcar `stabilized: true`.

---

## 7.2 Afinar

### Regla

- Selecciona una línea.
- Rerolles valor dentro del rango actual.
- No cambia stat.
- No cambia quality.
- No garantiza mejora.
- Consume Entropy fija.
- Consume esencia.

### Entropy

```txt
entropyCost = 10
```

### Costo material

```txt
essenceCost = basePolishCost * rarityMultiplier * (1 + polishCountForLine * 0.25)
```

### Rango

- `quality: normal`: usa `normalRange`.
- `quality: excellent`: usa `excellentRange`.

### Conteo

Actualizar:

```txt
lineCraftCounts[index].polish += 1
```

### UI

Texto:

```txt
Afinar línea
Resultado: nuevo valor dentro del rango.
No garantiza mejora.
```

---

## 7.3 Reforjar

### Regla

- Selecciona una línea.
- No hay hard lock.
- No hay selector de intención.
- Siempre usa pool general compatible con kind/categorías.
- Genera 2 opciones nuevas.
- Muestra opción mantener actual.
- Las opciones nuevas nunca son `excellent`.
- Consume Entropy fija.
- Consume esencia.

### Entropy

```txt
entropyCost = 20
```

### Costo material

```txt
essenceCost = baseReforgeCost * rarityMultiplier * (1 + reforgeCountForLine * 0.25)
```

### Cuándo se paga

Pagar al abrir preview.

Motivo:

- Evita save/load/fishing gratis.
- Permite persistir sesión de preview.
- Si el jugador mantiene la línea actual, mantiene item pero ya gastó el intento.

### Opciones

Preview siempre contiene:

```txt
currentAffix
newOptionA
newOptionB
```

`newOptionA/B`:

- `quality: normal`.
- sin `tier`.
- sin `perfectRoll`.
- no duplicar stat/categoría de líneas restantes.

### Conteo

Actualizar al pagar preview:

```txt
lineCraftCounts[index].reforge += 1
```

### Sesión pendiente

Guardar en estado:

```json
{
  "itemId": "item_123",
  "affixIndex": 1,
  "currentAffix": {},
  "options": [],
  "entropyCost": 20,
  "costs": { "essence": 420 },
  "createdAt": 1760000000000
}
```

---

## 7.4 Imbuir

### Regla

- Sólo aplica a item `epic`.
- Requiere poder legendario desbloqueado.
- Convierte el item a `legendary`.
- Setea `legendaryPowerId` elegido.
- Agrega una línea normal si hace falta llegar al affix count legendary.
- No genera `excellent`.
- Consume Entropy alta.
- Puede tener timer en fase posterior.

### Entropy

Valor inicial sugerido:

```txt
entropyCost = 35
```

Motivo:

- Debe ser decisión fuerte.
- No debe dejar sin margen automáticamente a todos los epic buenos.
- Con cap base 90, un epic con poca manipulación todavía puede imbuirse y quedar con margen.

### Costo material

```txt
essenceCost = alto
relicDustCost = medio
```

No cerrar números finales sin simulación.

### Restricciones

- No aplica a common.
- No aplica a magic.
- No aplica a rare.
- No aplica a legendary.
- No cambia poder de legendary natural.

### Timer

Fase posterior:

```txt
duration = 4h a 8h
```

Vertical slice:

- Puede ser instantáneo o quedar fuera.
- Recomendación: dejar `Imbuir` fuera de la primera implementación si Entropy/Affixes todavía no están calibrados.

---

## 7.5 Extraer

### Regla

- Destruye item.
- Devuelve esencia/materiales actuales.
- No genera memorias.
- No consume Entropy.
- Puede extraer item estabilizado.

### Cambio de UX

Debe quedar claro:

- si extraés, perdés toda inversión del item;
- la forja vive en Santuario, por lo que no debería haber inversión accidental durante la run.

---

## 8. Acciones eliminadas o deprecadas

### Reroll total

Eliminar de:

- UI.
- reducer actions.
- recomendaciones.
- analytics como acción disponible.

Mantener sólo migración de datos legacy:

- `rerollCount` puede contribuir a Entropy inicial.

### Hard lock de línea

Eliminar de reglas nuevas:

- `focusedAffixIndex`.
- `focusedAffixStat`.

Mantener sólo lectura legacy si existe.

### Deep Forge de proyectos

No eliminar código en la primera PR si genera riesgo, pero:

- Sacarlo de navegación principal del nuevo loop.
- No hacer que sea ruta recomendada.
- Marcar como legacy/deprecated en spec interna.

---

## 9. Forja del Santuario

### Objetivo

Una sola UI para trabajar items persistentes.

### Fuente de items

La Forja debe listar:

- items en inventario persistente;
- items equipados;
- items guardados/extraídos al Santuario si ese flujo existe separado;
- no proyectos/blueprints.

### Durante la run

No mostrar crafting fino.

Opciones de item durante run:

- equipar.
- vender/extraer.
- guardar para Santuario.

### En Santuario

Mostrar:

- lista compacta de items;
- filtro por slot/rareza;
- rating vs equipado;
- Entropy;
- marcas de `Excelente`;
- acciones disponibles.

### Nombre de pantalla

Opciones:

- `Forja`
- `Taller`
- `Forja del Santuario`

Recomendación:

- UI visible: `Forja`.
- Copy contextual: `Santuario`.

---

## 10. UI propuesta

### Item card compacta

Debe mostrar:

- nombre.
- rareza.
- slot.
- rating.
- delta vs equipado.
- Entropy `x/y`.
- estado: `Flexible`, `Tenso`, `Último intento`, `Estabilizado`.
- affixes como líneas compactas.

### Línea Excelente

Marca visual:

- triángulo naranja recomendado.
- alternativa: icono de afijo actual con color naranja.
- texto `Excelente` sólo en modo avanzado/tooltip.

### Acciones

Action rail:

- `Mejorar`
- `Afinar`
- `Reforjar`
- `Imbuir` si aplica
- `Extraer`

### Modo avanzado

Colapsado por defecto.

Mostrar:

- rango exacto.
- quality.
- source.
- legacyTier si existe.
- conteos de crafts por línea.
- costo creciente.

### Reforge preview

Cards:

- Mantener actual.
- Opción A.
- Opción B.

Cada opción muestra:

- stat.
- valor.
- rating estimado.
- quality.

---

## 11. Analytics

### Campos nuevos por item/drop

Agregar a payload compacto y completo cuando sea razonable:

- `entropy`
- `entropyCap`
- `entropyState`
- `excellentAffixCount`
- `normalAffixCount`
- `stabilized`
- `craftingRulesVersion`

### Eventos

`item_entropy_created`

```json
{
  "event": "item_entropy_created",
  "itemId": "item_123",
  "rarity": "rare",
  "itemTier": 12,
  "entropyCap": 98,
  "excellentAffixCount": 1,
  "source": "drop"
}
```

`craft_preview_opened`

```json
{
  "event": "craft_preview_opened",
  "mode": "reforge",
  "itemId": "item_123",
  "rarity": "rare",
  "affixIndex": 1,
  "entropyBefore": 34,
  "entropyCap": 98,
  "entropyCost": 20,
  "essenceCost": 420,
  "optionCount": 2
}
```

`craft_applied`

```json
{
  "event": "craft_applied",
  "mode": "polish",
  "itemId": "item_123",
  "entropyBefore": 34,
  "entropyAfter": 44,
  "entropyCap": 98,
  "stabilized": false,
  "ratingBefore": 1480,
  "ratingAfter": 1512,
  "quality": "excellent"
}
```

`item_stabilized`

```json
{
  "event": "item_stabilized",
  "itemId": "item_123",
  "rarity": "epic",
  "entropy": 104,
  "entropyCap": 100,
  "lastCraftMode": "reforge"
}
```

`imbue_applied`

```json
{
  "event": "imbue_applied",
  "itemId": "item_123",
  "powerId": "citadel_high_guard",
  "entropyBefore": 40,
  "entropyAfter": 75,
  "stabilized": false
}
```

### Métricas de balance

- Porcentaje de drops con línea Excelente por rareza.
- EntropyCap promedio por rareza.
- Crafts promedio antes de estabilizar.
- Items estabilizados que terminan equipados.
- Items craftados que terminan extraídos.
- Rating ganado por Entropy.
- Rating ganado por esencia.
- Reforge previews canceladas/mantenidas/aplicadas.
- Afinar que mejora vs empeora.
- Magic/Rare retenidos vs extraídos.
- Epic imbuido vs extraído.
- Legendary natural usado vs imbuido.

---

## 12. Migración de saves

### Objetivos

- No romper items actuales.
- No borrar inversión del jugador.
- No estabilizar masivamente.
- No cambiar IDs de affixes.
- Permitir rollback mental: legacy fields siguen legibles.

### Normalización de item

Crear helper:

```txt
normalizeItemCraftingState(item)
```

Responsabilidades:

- crear `crafting.entropy`;
- crear `crafting.entropyCap`;
- crear `crafting.stabilized`;
- crear `crafting.craftingRulesVersion`;
- crear `crafting.lineCraftCounts`;
- conservar counters legacy.

### Estimación de Entropy legacy

```txt
legacyEntropy =
  rerollCount * 18
  + reforgeCount * 16
  + polishCount * 8
  + ascendCount * 24
  + min(level, 10) * 2
```

Aplicar suave:

```txt
entropy = min(entropyCap - 1, round(legacyEntropy * 0.6))
```

Motivo:

- Reconoce inversión previa.
- No castiga demasiado saves existentes.
- Evita estabilizar piezas de golpe.

### Migración de affix legacy

Crear helper:

```txt
normalizeAffixInstance(affix, definition)
```

Responsabilidades:

- convertir `tier` a `quality`;
- setear `legacyTier`;
- setear `range/baseRange` correcto;
- preservar valor cuando sea posible;
- eliminar dependencia funcional de `tier`.

---

## 13. Archivos a tocar

### Fase de modelo/helpers

- `src/engine/crafting/entropyEngine.js`
  - nuevo.
  - Helpers de EntropyCap, estados, costos y consumo.

- `src/engine/affixesEngine.js`
  - derivar rangos normal/excellent.
  - rolar quality.
  - polish sin tier.
  - reforge sin tier y sin excellent.

- `src/utils/loot.js`
  - materializar item con Entropy.
  - normalizar affixes legacy.
  - normalizar crafting state.
  - remover/neutralizar rare-only affix upgrade scaling.

- `src/constants/craftingCosts.js`
  - costos sin reroll total.
  - cap +15.
  - costos de esencia por línea.

### Fase crafting

- `src/engine/crafting/craftingEngine.js`
  - remover rutas visibles de reroll.
  - upgrade sin falla.
  - polish -> Afinar con Entropy.
  - reforge con Entropy y 2 opciones.
  - imbuir epic -> legendary.
  - estabilización.

- `src/state/gameReducer.js`
  - acciones nuevas/renombradas.
  - persistir reforge session nueva.

### Fase UI

- `src/components/Crafting.jsx`
  - convertir en Forja del Santuario o extraer componente reusable.
  - mostrar Entropy.
  - mostrar Excelente.
  - ocultar tiers.

- `src/components/crafting/craftingUi.js`
  - actualizar labels.
  - eliminar reroll.
  - agregar Imbuir.

- `src/components/Sanctuary.jsx`
  - entry point a Forja.

- `src/components/DeepForgeOverlay.jsx`
  - deprecar o reemplazar por Forja de items.

- `src/components/Inventory.jsx`
  - item card con Entropy y Excelente.
  - no mostrar T1/T2/T3.

- `src/utils/itemPresentation.js`
  - formatting de quality/range.

### Fase extracción/santuario

- `src/engine/sanctuary/extractionEngine.js`
  - asegurar que items guardados lleguen como items persistentes, no proyectos.

- `src/engine/sanctuary/itemStashSchema.js`
  - validar si sirve como stash de items trabajables.

### Fase analytics

- `src/utils/runTelemetry.js`
  - eventos/campos.

- `src/components/Stats.jsx`
  - reportes compactos/completos.

### Fase migración

- `src/engine/stateInitializer.js`
  - normalizar saves.

---

## 14. Orden de implementación recomendado

### PR 1: Helpers y migración pasiva

Objetivo:

- Agregar Entropy y quality sin cambiar todavía toda la UX.

Cambios:

- `entropyEngine.js`.
- normalización de crafting.
- normalización de affixes legacy.
- item drops nuevos con `entropyCap`.
- saves viejos siguen cargando.

Verificación:

- cargar save existente.
- generar drops.
- confirmar que no aparecen NaN/rating roto.

### PR 2: Affixes sin tiers para nuevos rolls

Objetivo:

- Nuevos drops ya usan `quality`.
- `Excelente` puede aparecer sólo por drop.

Cambios:

- affix range adapter.
- roll de quality.
- UI deja de leer `tier`.
- rating sigue funcionando.

Verificación:

- simulación de 10k drops.
- distribución de Excelente por rareza.
- no repetir stats/categorías.

### PR 3: Crafting con Entropy

Objetivo:

- Afinar/Reforjar/Mejorar consumen Entropy.
- Reroll total eliminado.
- Último craft estabiliza.

Cambios:

- crafting engine.
- reducer actions.
- costs.
- logs.

Verificación:

- no se puede craftear item estabilizado.
- reforge genera 2 opciones normales.
- afinar excellent se queda en rango excellent.
- mantener actual en reforge conserva línea.

### PR 4: Forja del Santuario

Objetivo:

- Unificar experiencia en Santuario.

Cambios:

- entry desde Sanctuary.
- UI compacta mobile.
- cards de opciones.
- modo avanzado.
- ocultar crafting fino durante run.

Verificación:

- mobile usable.
- no se pierde item al cambiar de run.
- equipar item trabajado funciona.

### PR 5: Imbuir

Objetivo:

- Epic -> Legendary con poder elegido.

Cambios:

- acción `Imbuir`.
- selector de poderes desbloqueados.
- agregar línea normal si falta.
- costos.
- analytics.

Verificación:

- sólo epic.
- no legendary.
- no rare.
- poder desbloqueado requerido.
- no genera excellent.

### PR 6: Timers

Objetivo:

- Timegating sólo para acciones mayores.

Cambios:

- Imbuir con job.
- slots/cola.
- progreso offline.
- sin monetización real.

Verificación:

- claim correcto.
- cancelar/pendiente no duplica items.
- reload save conserva job.

---

## 15. Tests y simulaciones

### Unit tests sugeridos

- `deriveAffixRangesFromLegacyTiers`.
- `rollAffixQuality`.
- `normalizeAffixInstance`.
- `calculateEntropyCap`.
- `applyEntropyCost`.
- `canCraftItem`.
- `craftPolish` mantiene quality.
- `craftReforgePreview` no genera excellent.
- `craftUpgrade` no falla y cap +15.
- `craftImbue` sólo epic.

### Simuladores

Crear o extender scripts:

- `scripts/run-affix-entropy-simulation.mjs`
- `scripts/run-crafting-convergence-simulation.mjs`

Simular:

- 10k drops por rareza/tier.
- distribución de Excelente.
- EntropyCap promedio.
- cantidad promedio de crafts antes de estabilizar.
- probabilidad de item con 1/2/3 líneas excelentes.
- valor esperado de rare vs epic vs legendary.

### Criterios de aceptación de balance

- Magic con Excelente aparece lo suficiente para generar sorpresa, no tanto como para ser normal.
- Rare con buen cap se guarda/craftea en simulación.
- Epic tiene valor por Imbuir.
- Legendary natural mantiene valor por cap alto + poder fijo.
- Reforge no puede fabricar excellent.
- Reroll total no existe como ruta.

---

## 16. Riesgos técnicos

### Riesgo 1: `tier` está muy acoplado

Mitigación:

- No borrar campos legacy en primera PR.
- Crear helpers que devuelvan quality/range aunque haya tier.
- Hacer que UI deje de depender de tier antes de borrar data.

### Riesgo 2: Deep Forge y blueprints siguen vivos

Mitigación:

- No borrar de golpe.
- Sacar de navegación principal.
- Reusar sólo piezas seguras: jobs/slots si sirven.

### Riesgo 3: migración de item names

Hoy el nombre puede incluir `tierLabel`.

Mitigación:

- No bloquear vertical slice por naming.
- En fase UI, mostrar nombre base + rareza y dejar affixes en líneas.
- En fase limpieza, dejar de construir nombre con labels de affix.

### Riesgo 4: +15 rompe curva de poder

Mitigación:

- Simular DPS/EHP.
- Ajustar `computeUpgradeBonus`.
- Si hace falta, hacer que +11 a +15 escale más caro y menos explosivo.

### Riesgo 5: Excellent demasiado frecuente

Mitigación:

- Tabla de chances en data.
- Simulación.
- Clamp.
- Ajustar antes de exponer.

---

## 17. Primer vertical slice exacto

### Incluir

- Entropy en item.
- EntropyCap por rareza.
- `quality: normal | excellent`.
- Drops pueden generar `Excelente`.
- UI muestra Entropy y marca Excelente.
- Mejorar hasta +15 sin falla.
- Afinar consume Entropy y rerolles dentro de rango.
- Reforjar consume Entropy, mantiene actual + 2 opciones normales.
- Item estabilizado bloquea crafting.
- Reroll total eliminado de UI/engine nuevo.
- Analytics básicos.

### No incluir

- Timers.
- Imbuir.
- Monetización.
- Memorias.
- Reescritura total de `data/affixes.js`.
- Borrado físico de módulos legacy.

### Por qué

Este slice prueba el corazón del sistema:

- Entropy limita.
- Excelente protege loot.
- Rare/Magic vuelven a tener interés.
- Crafting deja de ser reroll infinito.

---

## 18. Estado listo para implementar

La implementación puede arrancar con PR 1 si aceptamos estos defaults:

- `Excelente` = quality superior loot-only.
- Triángulo naranja o icono naranja para Excelente.
- EntropyCap base: common 20, magic 38, rare 90, epic 90, legendary 112.
- Excellent chance: common 0%, magic 9%, rare 5%, epic 5%, legendary 7%.
- Mejorar: +4 Entropy, cap +15.
- Afinar: +10 Entropy, esencia creciente por línea.
- Reforjar: +20 Entropy, esencia creciente por línea, mantener + 2 opciones.
- Imbuir: no entra en primer vertical slice.

Si después de simular estos valores quedan altos/bajos, los ajustamos como data.
