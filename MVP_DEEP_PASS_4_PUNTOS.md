# MVP Deep Pass - 4 Puntos (Sistemas, UX, UI, Balance)

Fecha: 2026-04-26 (UTC)
Repositorio: `idlerpg`

## Alcance
Este documento hace una pasada profunda sobre 4 frentes para llevar el juego a MVP sólido:
1. Sistemas
2. UX
3. UI
4. Balance

Incluye problemas detectados, impacto, soluciones propuestas, prioridad y criterios de aceptación.

## Resumen Ejecutivo
- El núcleo de progresión (contratos/weekly) funciona con un modelo de baseline + delta, pero está muy acoplado a contadores duales (`stats` y `combat.analytics`), lo que aumenta riesgo de desalineación.
- El runtime de combate (`processTickRuntime`) está demasiado concentrado en un único flujo grande; hoy es potente, pero frágil para iterar rápido sin regresiones.
- UX mejoró en contratos/weekly, pero todavía hay inconsistencia de expectativas entre “completado”, “reclamable” y “reclamado” según pantalla.
- La UI tiene buena dirección visual, pero con deuda de arquitectura (mucho inline style y repetición de patrones).
- Balance usa templates estáticos y fórmulas razonables para arrancar, pero sin un lazo cerrado formal de tuning orientado a KPIs de MVP.

## 1) Sistemas

### Hallazgos clave
- Progreso de objetivos se calcula por tipo de target y usa `Math.max` entre `stats` y `combat.analytics`.
  - Evidencia: `src/engine/progression/goalEngine.js:83`
- Contratos de expedición y weekly ledger usan baseline al generarse y progreso por delta.
  - Evidencia: `src/engine/progression/expeditionContracts.js:245`, `src/engine/progression/weeklyLedger.js:127`
- El reducer global siempre re-asegura `expeditionContracts`, `weeklyLedger` y `weeklyBoss` al final de cada acción.
  - Evidencia: `src/state/gameReducer.js:2058`
- El runtime de combate maneja daño, loot, analytics, overflow, weekly boss y más en una sola función.
  - Evidencia: `src/engine/combat/processTickRuntime.js:391`
- No hay suite formal de tests automatizados del dominio gameplay.
  - Evidencia: `package.json` sin scripts de test ni dependencias de framework.

### Problemáticas detectadas

#### S-01: Doble fuente de verdad para progreso (`stats` vs `analytics`)
- Síntoma:
  - El progreso de objetivos toma el máximo entre dos contadores distintos.
- Riesgo:
  - Oculta discrepancias reales; una fuente rota puede quedar tapada por la otra.
  - Debug más difícil cuando “a veces cuenta, a veces no”.
- Solución propuesta:
  - Definir **fuente canónica** para progreso persistente: `state.stats`.
  - Dejar `combat.analytics` como telemetría de sesión exclusivamente.
  - Agregar chequeo de sanidad opcional en dev: warning cuando divergen más de un umbral.
- Prioridad: P0

#### S-02: “Ensure” global en cola de reducer para contratos/weekly
- Síntoma:
  - Se recalcula/normaliza en cada acción.
- Riesgo:
  - Riesgo de side effects silenciosos en baseline/rotaciones si entra una regresión.
  - Dificulta razonar qué acción cambió realmente el estado.
- Solución propuesta:
  - Mantener `ensure*` pero acotarlo: ejecutar sólo en acciones relevantes o en un “post-pass” tipado.
  - Agregar pruebas de invariantes (mismo `weekKey`/`rotationKey` no debe regenerar contenido).
- Prioridad: P0

#### S-03: `processTickRuntime` monolítico (alto costo de cambio)
- Síntoma:
  - Una función central gestiona demasiados subdominios.
- Riesgo:
  - Alta probabilidad de regresión cruzada en cada ajuste de loot/progreso.
- Solución propuesta:
  - Refactor incremental en pipeline explícito:
    - `resolveCombatExchange`
    - `resolveWeeklyBossStep`
    - `resolveLootAutomation`
    - `patchStatsAndAnalytics`
    - `buildCombatLogAndEvents`
  - Mantener golden snapshots de estado para validar equivalencia.
- Prioridad: P0/P1

#### S-04: Inconsistencia sistémica de claim entre expedición y weekly
- Síntoma:
  - Contrato de expedición se cobra automáticamente al confirmar extracción; weekly es claim manual.
  - Evidencia: `src/state/reducerDomains/extractionResolutionReducer.js:79` y `:103` vs `src/state/reducerDomains/progressionReducer.js:49`
- Riesgo:
  - Confusión en expectativas del usuario y “¿por qué uno sí y otro no?”.
- Solución propuesta:
  - Definir contrato de producto explícito:
    - Opción A: ambos manuales.
    - Opción B: expedición auto-claim + weekly manual, pero reforzado con copy consistente en UI.
  - Si se mantiene mixto, agregar “toast de cobro automático” con monto y motivo.
- Prioridad: P1

#### S-05: Cobertura de calidad insuficiente para loops críticos
- Síntoma:
  - No hay pruebas automatizadas para rutas críticas (kill count, extract count, claim, reroll, weekly navigation state).
- Riesgo:
  - Cada ajuste de UX/UI puede romper progresión sin detectarse.
- Solución propuesta:
  - Crear harness mínimo de dominio (Node + assertions) para:
    - Contratos delta baseline
    - Weekly claimable/claimed
    - Auto-extract + protect upgrade
    - Resolución de extracción con contrato
- Prioridad: P0

### Criterios de aceptación (Sistemas)
- 1 sola fuente canónica para progreso persistente.
- Tests de regresión para contratos/weekly/loot automation en CI local (`npm run ...`).
- `processTickRuntime` dividido en módulos sin cambiar comportamiento observable.

---

## 2) UX

### Hallazgos clave
- La UX actual contiene buenos estados visuales, pero hay transiciones con semántica distinta entre paneles.
- El selector semanal en combate opera sobre lista filtrada (no reclamados), lo que puede cambiar el índice percibido.
  - Evidencia: `src/components/Combat.jsx:421`, `:424`, `:2249`
- Hay feedback de overflow de mochila, pero no explica siempre el “por qué” de cada decisión automática (extraer/vender/proteger).
  - Evidencia: `src/components/Combat.jsx:1174` y `src/engine/combat/processTickRuntime.js:1831`

### Problemáticas detectadas

#### UX-01: Semántica de estados no uniforme
- Síntoma:
  - “Completado”, “Reclamable”, “Reclamado” cambian de contexto según vista.
- Impacto:
  - Carga cognitiva; el usuario no sabe si falta una acción o si ya cerró el loop.
- Solución propuesta:
  - Definir contrato de estado único:
    - `En progreso`
    - `Listo para reclamar`
    - `Reclamado`
  - Aplicar exactamente estos 3 labels en Combat + Account + overlays.
- Prioridad: P1

#### UX-02: Selector weekly con modelo mental inestable
- Síntoma:
  - Al filtrar “sólo no reclamados”, el denominador cambia y puede parecer salto de posición.
- Impacto:
  - Sensación de bug aunque técnicamente funcione.
- Solución propuesta:
  - Mantener visibles items `claimable` y ocultar sólo `claimed` (regla correcta para MVP).
  - Mostrar explícitamente “Mostrando X pendientes (Y ya reclamados)”.
- Prioridad: P1

#### UX-03: Automatización de loot con baja explicabilidad
- Síntoma:
  - No siempre se ve claramente por qué un item se protegió o se auto-procesó.
- Impacto:
  - Pérdida de confianza en reglas automáticas.
- Solución propuesta:
  - Añadir `decisionReason` por drop (ej: `upgrade`, `hunt_match`, `auto_extract_rarity`).
  - Exponerlo en tooltip/log corto.
- Prioridad: P0/P1

#### UX-04: Diferencia de fricción entre expedición y weekly
- Síntoma:
  - Una recompensa se cobra sin click (expedición), otra requiere click (weekly).
- Impacto:
  - Inconsistencia percibida como bug de conteo o UI.
- Solución propuesta:
  - Si se mantiene diseño mixto, explicitarlo en copy:
    - “Expedición se cobra al extraer.”
    - “Weekly se reclama manualmente.”
- Prioridad: P1

### Criterios de aceptación (UX)
- Terminología única de estado en todas las superficies.
- Weekly selector con denominador estable para pendientes.
- Cada acción automática de loot tiene razón visible.

---

## 3) UI

### Hallazgos clave
- Predomina estilo inline en componentes grandes (Combat, App pre-run, Account, Inventory).
- Se repiten patrones de chips/paneles/progress bars con variaciones pequeñas.
- Se hicieron mejoras de compactación, pero sin sistema de componentes compartidos.

### Problemáticas detectadas

#### UI-01: Deuda de consistencia visual por inline style distribuido
- Síntoma:
  - Repetición de estilos con diferencias sutiles por pantalla.
- Impacto:
  - Cambios lentos, riesgo de incoherencia creciente.
- Solución propuesta:
  - Crear primitives UI mínimas:
    - `PanelCard`
    - `StatusChip`
    - `ProgressMeter`
    - `ActionPillButton`
  - Migración por etapas (sin big-bang).
- Prioridad: P1

#### UI-02: Jerarquía de densidad inconsistente entre pantallas
- Síntoma:
  - Algunas vistas ya compactas, otras siguen ocupando demasiado alto vertical.
- Impacto:
  - Scroll excesivo en mobile y pérdida de foco.
- Solución propuesta:
  - Definir escalas de densidad (`dense`, `default`) y usar tokens de spacing/fuente.
  - Estandarizar “copy acotado” en cards de selector (ej. 4 líneas cuando aplica).
- Prioridad: P1

#### UI-03: Semántica de color y componentes de progreso no totalmente unificada
- Síntoma:
  - Barras/chips de progreso usan tonos similares pero no siempre mismo significado.
- Impacto:
  - Lectura menos inmediata de estado global.
- Solución propuesta:
  - Convención visual fija:
    - warning = en progreso
    - success = completado/reclamable/reclamado (con matices)
    - accent = navegación/configuración
- Prioridad: P2

### Criterios de aceptación (UI)
- Al menos 70% de cards de progreso usando primitives compartidas.
- Densidad mobile uniforme en Combat + Account + Pre-Run.
- Esquema de color semántico consistente en chips/barras.

---

## 4) Balance

### Hallazgos clave
- Contratos/weekly usan templates estáticos con `gainTarget` y recompensas definidas por tabla.
  - Evidencia: `src/engine/progression/expeditionContracts.js:8`, `src/engine/progression/weeklyLedger.js:6`
- Weekly boss usa fórmula de `powerRating` y thresholds por dificultad.
  - Evidencia: `src/engine/progression/weeklyBoss.js:87`, `:115`, `:409`
- Existe telemetría rica para análisis, pero falta proceso formal de tuning con objetivos KPI.
  - Evidencia: `src/utils/runTelemetry.js:6`, `:370`, `:640`

### Problemáticas detectadas

#### B-01: Targets y rewards sin banda dinámica por etapa real del jugador
- Síntoma:
  - `gainTarget` fijo por plantilla, independiente del momento de cuenta.
- Impacto:
  - Puede sentirse trivial o imposible según fase de progresión.
- Solución propuesta:
  - Escalado por banda de cuenta (ej: early/mid/late según `maxTier`, `prestige`, `bestItemRating`).
  - Mantener identidad de plantilla, ajustar magnitud.
- Prioridad: P1/P2

#### B-02: Lógica de “proteger upgrades” resuelve parte del problema, no todo
- Estado actual:
  - Ya compara contra mejor entre equipado y mochila del slot comparable.
  - Evidencia: `src/engine/combat/processTickRuntime.js:1769-1797`
- Riesgo residual:
  - En zonas con drops muy por encima del equipo, la mochila puede llenarse por mejoras marginales sucesivas.
- Solución propuesta:
  - Regla incremental simple (siguiente paso):
    - proteger sólo si mejora al “mejor comparable” por un umbral mínimo (`deltaRatingMin`, ej. +X).
  - Opcional posterior:
    - límite de upgrades protegidos por slot por run.
- Prioridad: P1

#### B-03: Weekly boss tuning puede no reflejar poder efectivo real de build
- Síntoma:
  - `powerRating` resume stats macro; puede subestimar/sobreestimar sinergias (talentos/efectos).
- Impacto:
  - Dificultades percibidas como injustas o triviales.
- Solución propuesta:
  - Ajustar `powerRating` con features de performance real de sesión:
    - kills/min pico
    - deaths/hour
    - tier sustain
  - Recalibrar thresholds con datos de telemetría.
- Prioridad: P2

#### B-04: Falta de KPI explícitos de MVP para cerrar tuning
- Síntoma:
  - Hay métricas, pero no umbrales objetivo acordados.
- Impacto:
  - Se itera “por sensación”, más lento y con retrabajo.
- Solución propuesta:
  - Definir tablero mínimo de KPIs (por cohorte de cuenta):
    - tiempo a primer contrato completado
    - % de weekly claim dentro de semana
    - overflow rate de mochila
    - tasa de auto-extract útil
    - win rate weekly boss por dificultad
- Prioridad: P0

### Criterios de aceptación (Balance)
- KPIs definidos y medibles en telemetría.
- Al menos 1 ciclo de tuning basado en datos reales de sesión.
- Reducción observable de overflow no deseado con auto-loot activo.

---

## Plan Propuesto (implementación completa, actualizado con "Qué hacer")

### Fase 0 - Guardrails y baseline (P0)
- Congelar una baseline funcional con snapshots de estado para: contratos de expedición, weekly ledger, extracción manual/auto, protect upgrades, boss weekly.
- Agregar checklist de smoke manual por vista: `Combat`, `AccountProgressView`, `RunSigilOverlay`, `ExtractionOverlay`, `Sanctuary`.
- Definir un tablero mínimo de KPIs y formato único de lectura para todas las iteraciones de balance.
- Regla de rollout: cambios por slices pequeños, mergeables, sin refactor masivo de una sola vez.

### Fase 1 - Sistemas (S-01 a S-05) (P0/P1)
- S-01: Definir fuente canónica de progreso.
- S-01: Separar explícitamente progreso de sesión (`analytics`) vs progreso persistente (`stats`) y bloquear mezclas silenciosas.
- S-01: Crear utilidades de lectura compartidas para contratos/weekly en vez de leer counters "a mano" por vista.
- S-02: Reubicar lógica `ensure` fuera de puntos de render y concentrarla en inicialización/migración segura del estado.
- S-02: Reducir efectos colaterales de `ensure` en reducers de dominio para evitar auto-resets involuntarios.
- S-03: Partir `processTickRuntime` en pipeline por etapas (`preCombat`, `combat`, `loot`, `progress`, `postTick`) con contratos de entrada/salida claros.
- S-03: Agregar pruebas de regresión por etapa para detectar roturas sin depender de pruebas E2E completas.
- S-04: Unificar modelo de claim manual entre contrato expedición y weekly (estado listo/claimable/claimed + feedback consistente).
- S-04: Implementar feedback visual elegido (toast de cobro y/o glow+sello de card) con payload de recursos realmente otorgados.
- S-05: Crear harness de regresión de loops críticos (kills, extracción, claim, boss weekly, protect upgrades).
- S-05: Añadir tests de no-regresión para bugs ya vistos en este ciclo (contador que no sube, selector weekly inestable, barras congeladas).

### Fase 2 - UX (UX-01 a UX-04) (P1)
- UX-01: Definir diccionario único de estados para contratos/weekly: `en progreso`, `listo para reclamar`, `reclamado`.
- UX-01: Aplicar ese diccionario en Combat, Account y Pre-Run para evitar textos contradictorios.
- UX-02: Mantener visibles contratos `claimable` y ocultar sólo `claimed`; conservar numerador real `x/y` del set visible.
- UX-02: Estabilizar selector weekly para que no "salte" por cambios de orden no intencionales.
- UX-03: Mantener badge existente `MEJOR` y sumar badge `CAZA` donde hoy se muestran etiquetas de sinergia.
- UX-03: Exponer `decisionReason` de auto-loot en UI compacta para explicar por qué un item quedó protegido/extractado/no extractado.
- UX-04: Mantener claim manual en contrato y weekly, sin auto-claim implícito.
- UX-04: Acercar visualmente la card de contrato al lenguaje de weekly (estructura, jerarquía y CTA) sin duplicar componentes.

### Fase 3 - UI (UI-01, UI-02 global, UI-03) (P1/P2)
- UI-01: Extraer primitives reutilizables (`Panel`, `CardHeader`, `StatusChip`, `ProgressBar`, `InlineAction`) y migrar pantallas críticas.
- UI-02: Extender `dense` a toda la UI (desktop y mobile), no sólo mobile.
- UI-02: Definir tokens de densidad globales para spacing, tipografías, alturas de barra y paddings de botones/chips.
- UI-02: Migrar por tandas: `Combat` + `Pre-Run`, luego `Account/Weekly`, luego `Sanctuary/Extraction/Inventory`, y finalmente `Character/Codex/Prestige`.
- UI-02: Validar legibilidad y targets táctiles mínimos para no perder usabilidad al compactar.
- UI-03: Unificar semántica de color por estado de progreso.
- UI-03: Reglas propuestas: `warning` para "en progreso", `success` para "completo/claimable/claimed", `accent/info` para navegación y contexto, `danger` sólo para riesgo/fallo.
- UI-03: Ejemplos concretos de aplicación: barras de contrato en `Combat`, `Account weekly`, `Pre-Run`; badges de estado en cards de objetivos; CTA de claim con semántica `success`.
- UI-03: Cerrar diferencias entre gradientes y sólidos para que la semántica no cambie entre pantallas.

### Fase 4 - Balance (B-01, B-03, B-04; B-02 descartado por decisión) (P1/P2)
- B-01: Ajustar generación de targets/rewards por banda de cuenta al momento de generar contrato/weekly.
- B-01: Congelar target/reward generado hasta `complete` o `reroll` (no mutar durante avance del jugador).
- B-03: Ajustar boss weekly y resetear intentos + HP cada 22 horas según decisión.
- B-03: Medir tasa de victoria/abandono por dificultad para recalibrar HP, daño y recompensas.
- B-04: Definir KPIs operativos del juego actual y umbrales de aceptación por ciclo.
- B-04: KPIs base: tiempo a primer claim, tiempo a contrato completo, % de claim semanal, variación de mochila con auto-extract activo, tasa de extracción manual vs auto, winrate por dificultad weekly boss, distribución de rerolls y abandono de run.

### Fase 5 - Cierre y hardening (P2)
- Ejecutar suite completa de regresión + smoke manual de todas las tabs principales.
- Resolver deudas abiertas detectadas por QA antes de mover números de balance finales.
- Congelar release candidate y abrir una ventana corta de telemetría real.
- Hacer un único pase final de tuning con datos, sin introducir cambios estructurales nuevos.

### Entregables por sprint
- Sprint A: guardrails + S-01/S-02 + UX-02 estable.
- Sprint B: S-03/S-04/S-05 + UX-01/UX-03/UX-04.
- Sprint C: UI-01 + UI-02 global (dense desktop/mobile) + UI-03 semántica unificada.
- Sprint D: B-01/B-03/B-04 + hardening y cierre MVP.

---

## Riesgos de implementación
- Riesgo de romper saves si se cambia estructura de progreso sin migración segura.
- Riesgo de regresiones silenciosas en combate si se refactoriza sin snapshots.
- Riesgo de sobreajuste de balance si se tunea con muestra de datos pequeña.

Mitigaciones:
- Migraciones backward-compatible.
- Golden snapshots de estado por caso crítico.
- Ventana mínima de datos antes de retocar números de reward/target.

---

## Definición de “MVP listo” para estos 4 frentes
- Sistemas: flujo estable, sin regressions frecuentes en progreso/claims/loot automation.
- UX: estados y acciones comprensibles sin ambigüedad en todas las vistas principales.
- UI: experiencia consistente y compacta en desktop/mobile para run + account + pre-run.
- Balance: pacing defendible con KPIs y al menos un ciclo de tuning con datos.


### Qué hacer
S-01 > Hacer
S-02 > Hacer
S-03 > Hacer
S-04 > Opción A. agregar feedback visual de cobro, como Toast con recursos obtenidos o como glow de card + sellado, veamos opciones.
S-05 > Hacer.
Ux-01 > Hacer
UX-02 > Si, ocultar sólo claimed, mantener visibles claimable. Lo de X pendientes debería ser el x/y que ya se muestra.
UX-03 > A los items que se los protegió por "MEJOR" ya aparece MEJOR. No le sumaría nada. A los items que se los protegió por Caza capaz podemos ponerle una badge de "Caza", no? A donde hoy dice "Sinergia" y esas cosas.
UX-04 > Hacer manuales ambas, ya lo charlamos arriba. No explicitar más cosas en copy, sólo hacer claimeable manualmente el Contrato. Si querés podemos hacer que Contrato tenga una UI un poquito más parecida a la weekly que me gusta.
UI-01 > Si, empecemos esto.
UI-02 > Hacer, priorizar dense entonces, me gustó el resultado, unificar todo entonces, no sólo "mobile".
UI-03 > Me gusta, dame detalles de la propuesta con ejemplos.
B-01 > Me gusta, empecemos las propuestas, pero el dinamismo tiene que ser en la generación digamos, si se generó un Contrato de X manera, no tiene que seguir cambiando mientras el jugador avanza porque eso no tendría sentido. Tendría que quedar así como se generó, hasta que se complete o se rerollee por ejemplo. lo mismo con objetivos weekly.
B-02 > No hagamos nada, no creo que estadísticamente puedan llegar 50 drops mejores que el anterior máximo en una misma Tier.
B-03 > Si, hagámoslo, estamos testeando todavía el Boss. Sumemos que los 3 intentos se reseteen cada 22 horas así pueden jugarlo todos los días (y la HP del boss también obvio).
B-04 > Si, haceme un repaso profundo y definí en base a nuestro juego actual y sus sistemas, KPIs que nos sirvan de métricas para balancear.
