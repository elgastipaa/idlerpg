# Propuesta de Layout por Función — Forja (Módulos/Wrappers)

## Fuente de verdad
- `forge-light-kit-v4.html` (look and feel final).
- `flDesign.md` (reglas de cascada, canónicos, anti-overrides).
- Primitives actuales: `FlCard`, `FlPanel`, `FlButton`, `FlTag`, `FlBadge`, `FlProgressBar`, `FlMilestoneProgress`, `FlResourceCounter`, `FlRequirementHint`.
- Módulos actuales:
  - `FlForgeUpgradeModule`
  - `FlForgeModeModule`
  - `FlForgeLegacySection` (temporal, para transición)

## Objetivo
Pasar de “pantalla + bloque legacy” a “pantalla orquestadora + módulos por función”, sin skins inline.

---

## Estructura Canónica de Crafting (target)

### 1) `CraftingShell` (pantalla/orquestador)
- Header/título/tabs.
- Item drawer selector.
- Render condicional de módulo por modo.
- Log de actividad desacoplado (módulo propio).

### 2) Módulos por función
- `FlForgeUpgradeModule`
- `FlForgePolishModule`
- `FlForgeReforgeModule`
- `FlForgeAscendModule`
- `FlForgeExtractModule`

### 3) Wrappers internos compartidos
- `FlForgeItemPreviewCard` (columna izquierda)
- `FlForgeResultCard` (centro) // Este lo cambiaría al panel derecho. Principalemnte porque en Mobile queda al lado del item, entonces sería lo más lógico que la "función" esté directamente accesible después del item.
- `FlForgeActionPanel` (panel derecho, variantes por modo) // Este lo cambiaría al panel central. Porque quedaría abajo del item + función en mobile, y a la derecha en desktop (tipo resultado final)
- `FlForgeStatsCompare` (actual vs nuevo)
- `FlForgeModeActionBar` (CTA + secondary + requirement)
- El CTA tendría que ser no sé si compartido, pero sí que la estética sea parecida para todos, y sticky arriba del bottom nav.

---

## Layout propuesto por función

## Mejorar (`upgrade`)
- Izquierda: `FlForgeItemPreviewCard` (item + nivel actual).
- Centro: `FlForgeResultCard` (nivel nuevo, poder, entropía). // Cambiar al derecho
- Derecha: `FlForgeActionPanel` variante `upgrade`: // Cambiar al Centro.
  - material principal,
  - probabilidad 100%,
  - costo.
- Debajo:
  - `FlMilestoneProgress` (+0/+5/+10/+15),
  - `FlForgeStatsCompare`,
  - `FlForgeModeActionBar` (MEJORAR).

## Afinar (`polish`)
- Misma grilla base izquierda/centro/derecha.
- Centro (`FlForgeActionPanel` `polish`):
  - línea objetivo seleccionada,
  - “reroll de valor”,
  - costo.
- Derecha:
  - lista de líneas (`FlForgeAffixSelector`) con estado selected/excellent.
  - CTA AFINAR.

## Reforjar (`reforge`)
- Misma grilla base.
- Derecha (`FlForgeActionPanel` `reforge`):
  - línea objetivo,
  - estado “genera opciones / opciones listas”,
  - costo.
- Debajo:
  - selector de línea,
  - `FlForgeReforgeOptionsPanel` (mantener + nuevas opciones),
  - CTA PAGAR REFORJA / CONFIRMAR según estado sesión.

## Imbuir (`ascend`)
- Misma grilla base.
- Derecha (`FlForgeActionPanel` `ascend`):
  - estado ritual (listo/en curso/reclamar),
  - costo o “listo para reclamar”.
- Centro:
  - `FlForgeLegendaryPowerSelector`,
  - `FlForgeImbueJobStatus` (timer, rush, claim),
  - CTA IMBUIR / RECLAMAR.

## Extraer (`extract`)
- Puede conservar grilla base o usar variante más compacta.
- Derecha (`FlForgeActionPanel` `extract`):
  - cantidad seleccionada,
  - retorno esencia estimado,
  - costo por lote.
- Centro:
  - `FlForgeExtractQuickFilters` (common/magic/rare/clear),
  - resumen lote,
  - CTA EXTRAER / CONFIRMAR.

---

## Qué ya está hecho
- `upgrade` modularizado en `FlForgeUpgradeModule`.
- `polish/reforge/ascend/extract` modularizados de forma base en `FlForgeModeModule`.
- Bloque legacy extraído a `FlForgeLegacySection` (ya no incrustado en `Crafting.jsx`).

---

## Próximo paso de implementación (sin inline)
1. Separar `FlForgeModeModule` en 4 módulos concretos (`Polish/Reforge/Ascend/Extract`).
2. Mover estilos de cada modo a `modules.css` por namespace de módulo.
3. Dejar `FlForgeLegacySection` solo como fallback temporal detrás de flag.
4. Remover fallback legacy cuando haya paridad funcional/visual.

---

## Decisiones pendientes para tu feedback
1. `extract`: ¿mantenemos la comparación de stats abajo o lo dejamos minimal?. Saquemos Extract directamente por ahora. Se puede extraer en el Arsenal de Reliquias.
2. `reforge`: ¿opciones dentro del mismo módulo o mantener overlay dedicado? Yo mantendría overlay dedicado...
3. `ascend`: ¿CTA único contextual o CTA doble (`Imbuir` + `Reclamar`)? Imbuir sería el único, porqué reclamar como segundo CTA?
4. ¿Log de actividad de forja como módulo fijo abajo o drawer colapsable? Cuál es la diferencia entre drawer colapsable y log colapsable?
