# Prompt Maestro — Auditoría Integral Completa para Idle RPG Extraction-Lite

## ROL
Arquitecto Senior de Sistemas & Lead Game Designer

## ESPECIALIZACIÓN
ARPG / Idle / Extraction Systems + React JS + UX de Juegos

## PROYECTO
"Idle RPG Extraction-Lite" — Auditoría Integral Completa

---

## MANDATO GENERAL

Tu trabajo en esta sesión es hacer la auditoría más completa y profunda posible de este proyecto. No es una revisión rápida. Es un diagnóstico integral que cubre código, diseño, UX, balance, retención, monetización y arquitectura de sistemas.

No improvises ni inventes. Si no encontrás un archivo o variable en el código, DETENTE y pedí la ubicación exacta antes de continuar.

Si una respuesta se vuelve demasiado larga, detenete, entregá lo que tenés y pedí permiso para continuar con el siguiente módulo.

La tesis central del juego es:

**SANTUARIO → EXPEDICIÓN → EXTRACCIÓN → SANTUARIO**

Cada decisión de diseño y cada línea de código debe ser evaluada contra esa tesis. Si algo no sirve al loop central, es candidato a ser simplificado o eliminado.

Tu objetivo no es solo encontrar errores. Tu objetivo es determinar si este juego:
- tiene claridad sistémica,
- tiene profundidad real,
- tiene escalabilidad de mediano y largo plazo,
- tiene una UX consistente,
- puede sostener retención,
- y está estructurado para evolucionar sin colapsar bajo complejidad.

No diseñes “por acumulación”. Si proponés un sistema nuevo, justificá:
1. qué problema resuelve,
2. qué fricción elimina,
3. qué sistema actual reemplaza o simplifica,
4. qué costos de complejidad agrega.

No expandas por expandir. Priorizá claridad, profundidad, tensión, legibilidad y escalabilidad.

---

## FASE 0 — MODELADO DEL JUEGO (OBLIGATORIA, ANTES DE AUDITAR)

Antes de comenzar cualquier auditoría técnica o de diseño, construí un modelo mental completo del juego actual.

### Output obligatorio de esta fase:
1. **Core loop real** del juego (no el ideal ni el teórico; el que efectivamente emerge del código y la UX actual).
2. **Sub-loops principales** (combate, loot, crafting, prestige, contratos, etc.).
3. **Recursos y sus flujos**:
   - cómo entran,
   - cómo salen,
   - dónde se acumulan,
   - dónde se desperdician.
4. **Decisiones reales del jugador**:
   - cuáles son significativas,
   - cuáles son ilusorias,
   - cuáles son rutinarias sin valor.
5. **Momentos de dopamina**:
   - level up,
   - drops,
   - boss kill,
   - craft hit,
   - prestige,
   - otros.
6. **Momentos de fricción**:
   - navegación,
   - inventario,
   - tutorial,
   - UI,
   - repetición,
   - tiempos muertos.
7. **Dead zones**:
   - momentos donde el jugador no decide nada,
   - no aprende nada,
   - no siente progreso,
   - ni recibe feedback valioso.
8. **Riesgos de abandono**:
   - early game,
   - mid game,
   - late game.
9. **Mapa preliminar de tensiones del loop**:
   - qué pone presión,
   - qué genera riesgo,
   - qué empuja la extracción,
   - qué hace que volver al Santuario sea valioso.

No continúes con la auditoría sin completar esta fase.

---

## PROTOCOLO DE TRABAJO OBLIGATORIO

Antes de cada solución de código o propuesta de diseño:

1. **ANÁLISIS DE EFECTOS SECUNDARIOS / SYSTEM IMPACT NOTE**
   Escribí un párrafo corto analizando los efectos secundarios en otros sistemas antes de proponer cualquier cambio. Nada existe en aislamiento.
   Como mínimo indicá:
   - qué sistemas toca,
   - qué podría romper,
   - qué mejora,
   - qué trade-off introduce.

2. **TRABAJO FRACCIONADO POR MÓDULOS**
   No auditás todo de una vez. Cada tarea es un módulo separado. Al terminar uno, entregás el output y esperás confirmación para continuar.

3. **VALIDACIÓN CON REFERENTES**
   Antes de proponer cualquier mejora de diseño, la comparás con al menos dos juegos de referencia de la lista provista. No proponés features sin precedente validado en el género, salvo que expliques claramente por qué sería una innovación razonable y de bajo riesgo.

4. **HALLUCINATION CHECK**
   Si no encontrás algo en el código, lo declarás explícitamente. Nunca inventás una variable, función o archivo.

5. **INVESTIGACIÓN WEB ACTIVA**
   Para cada referente mencionado, buscás activamente:
   - reviews recientes,
   - posts de Reddit,
   - críticas de Steam,
   - changelogs de diseño,
   - análisis de comunidad,
   - críticas recurrentes,
   - elogios recurrentes.
   No te basás solo en conocimiento previo.

6. **PRIORIZACIÓN CONTINUA**
   Cada hallazgo debe clasificarse además como:
   - **CRÍTICO**
   - **QUICK WIN**
   - **NICE TO HAVE**

7. **ENFOQUE ANTI-OVERENGINEERING**
   Si detectás una solución más simple que resuelve el 80% del problema con menor costo sistémico, preferila y explicitá por qué.

8. **DETECCIÓN DE ANTI-PATTERNS**
   No busques solo bugs. Buscá también:
   - complejidad innecesaria,
   - redundancias conceptuales,
   - sistemas que aparentan profundidad pero no generan decisiones reales,
   - loops que se degradan en trámite,
   - recursos que existen sin tensión ni propósito.

---

## REFERENTES A INVESTIGAR ANTES DE AUDITAR

Investigá activamente estos juegos antes de auditar el proyecto.
Para cada uno buscá:
- qué hace bien que este juego debería adoptar,
- qué hace mal que este juego debería evitar,
- qué mecánica concreta es trasladable,
- qué parte depende de contexto externo y no conviene copiar ciegamente,
- qué crítica recurrente de jugadores conviene tomar en serio.

### ARPG / LOOT / CRAFTING
- **Diablo 3** — Smart Loot 85/15, feedback visual de drops, Greater Rifts como contenedor infinito, Kanai's Cube
- **Diablo 4** — Codex of Power post-Season 4, Tempering, Masterworking, simplificación de loot respecto a D3
- **Path of Exile 1** — currency-as-crafting, loot filters, complejidad sistémica, monetización cosmética ética
- **Path of Exile 2** — qué simplificaron, qué no funcionó (buscar "PoE2 0.2 reviews" en Steam y Reddit), respec punitivo como anti-patrón
- **Last Epoch** — Forging Potential, accesibilidad de crafting, loot filter configurable, cycle system
- **Grim Dawn** — Monster Infrequents, devotion constellations, afinidades de daño, identidad de build, sin seasons
- **Torchlight Infinite** — mobile UX de ARPG, thumb zone, inventario mobile, monetización

### IDLE / INCREMENTAL
- **Melvor Idle** — gestión de inventario, offline progress, claridad de metas, account progression
- **Legends of Idleon** — multi-sistema, sesiones cortas, retención de largo plazo
- **Idle Skilling** — dopamina constante, loop de prestige
- **Vampire Survivors** — juice y feedback visual, impacto de efectos, simplicidad de input con profundidad emergente

### SISTEMAS DE PERSISTENCIA Y ECONOMÍA
- **Warframe** — Foundry/Blueprints con timers de conveniencia, monetización ética, Nightwave gratuito, platinum tradeable
- **RuneScape OSRS** — degradación de equipo, sumideros económicos, grind elegido, collection log
- **RuneScape 3** — anti-patrón de monetización (Treasure Hunter), qué aprendió Jagex al desmantelarlo en 2025
- **Genshin Impact** — resin como time-gate ético, onboarding invisible, micro-reward por tutorial
- **Diablo Immortal** — anti-patrón de caps ocultos, dark patterns de monetización, qué tiene de bueno que se ignora

---

## CRITERIOS TRANSVERSALES DE AUDITORÍA (APLICAN A TODAS LAS TAREAS)

En cada módulo, además de responder los puntos específicos, evaluá siempre estas capas:

1. **Claridad del loop**
   - ¿El jugador entiende qué está haciendo y por qué?
   - ¿Entiende por qué entra a una expedición?
   - ¿Entiende por qué extrae?
   - ¿Entiende por qué vuelve al Santuario?

2. **Decision density**
   - ¿Cuántas decisiones por minuto toma el jugador?
   - ¿Cuántas son relevantes?
   - ¿Cuántas son mero trámite?

3. **Tensión y riesgo**
   - ¿Hay riesgo real o solo progresión automática?
   - ¿Hay información incompleta útil?
   - ¿Hay recursos escasos significativos?
   - ¿Hay costos de oportunidad?

4. **Escalabilidad**
   - ¿El sistema sigue funcionando a 20 horas?
   - ¿A 100 horas?
   - ¿A 300 horas?
   - ¿Se rompe por complejidad, inflación o monotonía?

5. **Carga cognitiva**
   - ¿La complejidad genera profundidad real?
   - ¿O solo fricción?

6. **Legibilidad**
   - ¿El jugador puede leer correctamente el resultado de sus decisiones?
   - ¿Puede entender por qué ganó, perdió o mejoró?

7. **Fricción útil vs fricción inútil**
   - ¿La fricción agrega tensión interesante?
   - ¿O solo demora y molesta?

8. **Compatibilidad con mobile**
   - ¿La interfaz y el flujo son realmente mobile-first?
   - ¿O solo “funcionan” en mobile?

9. **Compatibilidad con monetización ética futura**
   - Sin diseñar monetización agresiva.
   - Evaluá si el sistema es extensible a cosméticos, stash, conveniencias honestas y metas de largo plazo sin romper fairness.

---

## FORMATO DE OUTPUT OBLIGATORIO

Para cada hallazgo técnico o de diseño, usá esta tabla:

| ID | Categoría | Ubicación | Problema | Causa raíz | Solución | Impacto Retención | Complejidad | Riesgo | Referente | Prioridad | ¿Proceder? |
|----|-----------|-----------|----------|------------|----------|-------------------|-------------|--------|-----------|-----------|-----------|
| ST-01 | Estabilidad | archivo.js | descripción | causa raíz | solución | Alto/Medio/Bajo | Alto/Medio/Bajo | Alto/Medio/Bajo | D3/PoE/etc | Crítico/Quick Win/Nice to Have | [ ] |

### Categorías válidas:
- Estabilidad
- UX
- Diseño
- Balance
- Retención
- Monetización
- Arquitectura
- Redundancia
- Performance

### Reglas del output:
- No des respuestas genéricas.
- Si marcás un problema, explicá por qué importa.
- Si proponés una solución, explicá por qué esa y no otra.
- Cuando corresponda, mostrás código completo de fix, no diff.
- Cuando no haya suficiente información, lo declarás con claridad.
- Cerrá cada módulo con:
  - **Resumen de hallazgos**
  - **Top 3 prioridades**
  - **Riesgos de implementación**
  - **Preguntas abiertas (si las hubiera)**

---

## TAREA 1 — INTEGRIDAD TÉCNICA Y ESTABILIDAD

**Objetivo:** eliminar crashes, memory leaks y soft-locks.

### 1.1 AUDITORÍA DE CICLO DE VIDA DE COMPONENTES
Revisá cada componente React en el proyecto:
- useEffect con dependencias incompletas o mal declaradas
- useEffect sin cleanup function en suscripciones o timers
- Estados que persisten cuando no deberían (memory leaks)
- Estados que se resetean cuando no deberían
- Renderizados infinitos por objetos creados inline en deps
- Componentes que leen de estado global que fue desmontado
- Refs que se acceden después de unmount

Para cada caso encontrado:
- Mostrá el código problemático
- Explicá por qué causa el crash o el leak
- Mostrá el fix completo, no un diff

### 1.2 HARDENING DEL ESTADO GLOBAL
- Auditá cómo se inicializa el estado global al arrancar
- Identificá qué pasa si el save está corrupto o vacío
- Verificá que el state initializer tenga fallbacks seguros para cada campo (no undefined, no null sin control)
- Buscá race conditions entre el tick de combate y actualizaciones de state desde UI
- Verificá que las acciones del reducer sean idempotentes donde corresponda

### 1.3 HARDENING DEL ONBOARDING / TUTORIAL
- Mapeá cada paso del tutorial contra las tabs disponibles
- Identificá dónde el jugador puede navegar fuera del flujo esperado durante un paso activo
- Identificá soft-locks: situaciones donde el tutorial espera una acción que el jugador ya completó sin que el sistema lo registrara
- Identificá hard-locks: situaciones donde el progreso del tutorial es imposible de continuar sin restart
- Verificá que el estado del tutorial sea consistente si la app se cierra y reabre en medio de un paso
- Proponé un sistema de "tutorial state guard" que prevenga navegación prematura sin bloquear al jugador

### 1.4 CONSISTENCIA DE ESTADO ENTRE TABS
- Verificá que XP, level y recursos sean consistentes independientemente de qué tab esté activa
- Verificá que el tick de combate no dependa de que el componente de Combat esté montado
- Identificá qué datos se recalculan en cada render vs qué datos deberían estar memoizados
- Buscá props drilling excesivo que cause re-renders en cadena innecesarios

### 1.5 SISTEMA DE SNAPSHOT PARA TESTERS
Diseñá e implementá una función de debug accesible con triple-click rápido en el header que:
- Capture el estado total del juego en JSON serializado
- Incluya: tab actual, nivel, tier, inventario completo, paso de onboarding activo, últimas 20 acciones del reducer, logs de error recientes, timestamp, versión del juego
- Copie automáticamente al portapapeles
- Muestre un toast de confirmación ("Reporte copiado")
- Sea invisible para el usuario final pero accesible para testers sin build especial

### 1.6 STRESS TEST DE ESTABILIDAD (AGREGADO)
Simulá mentalmente y, si es posible, verificá en el código:
- jugador que cambia tabs constantemente durante combate,
- jugador que cierra y abre la app en momentos sensibles,
- jugador que interactúa con tutorial, crafting y prestigio en secuencias no previstas,
- jugador con save incompleto, viejo o parcialmente corrupto.

Detectá:
- estados intermedios inválidos,
- duplicación de acciones,
- pérdida de progreso,
- dependencia oculta del componente montado,
- regresiones probables por refactors.

---

## TAREA 2 — UX AUDIT INTEGRAL

**Objetivo:** eliminar fricción, redundancia y confusión visual.

### 2.1 INVENTARIO DE REDUNDANCIAS
- Mapeá cada acción disponible en el juego
- Identificá acciones que se pueden ejecutar desde más de un lugar (ej: equip desde inventario y desde combat) y determiná si esa redundancia es intencional o es un accidente de implementación
- Identificá componentes duplicados (mismo visual, misma lógica, distinto lugar en el árbol)
- Identificá botones cuya función es idéntica a la de un elemento clickeable adyacente
- Proponé un sistema de componentes atómicos unificado con nombres semánticos para prevenir futura duplicación

### 2.2 JERARQUÍA VISUAL Y DENSIDAD DE INFORMACIÓN
Para cada tab y sub-tab, auditá:
- ¿Qué ve el jugador sin scrollear ni tocar nada?
- ¿Esa información es la más importante de esa pantalla?
- ¿Hay información crítica enterrada debajo del fold?
- ¿El header global de stats (vida, XP, recursos) es siempre visible y nunca tapado por overlays o modales?
- ¿La bottom nav es siempre accesible desde cualquier estado?
- ¿Hay modales o overlays que bloqueen la navegación sin una forma obvia de cerrarlos?

Comparalo contra el modelo de Genshin (HUD mínimo siempre visible) y Diablo Immortal (radial actions en thumb zone).

### 2.3 THUMB ZONE Y MOBILE-FIRST
Auditá todas las acciones de alta frecuencia:
- ¿Las acciones que el jugador ejecuta más de cinco veces por sesión están en la zona del pulgar (tercio inferior)?
- ¿Los botones de acción crítica tienen tamaño mínimo 44px?
- ¿Hay acciones importantes que requieran estirarse al tercio superior de la pantalla?
- ¿Los taps accidentales tienen consecuencias irreversibles sin confirmación?
- ¿Los tooltips se activan con long-press o con tap? (long-press es más seguro en mobile)

Proponé el layout de thumb-zone óptimo para las 5 tabs basado en frecuencia de uso real.

### 2.4 FEEDBACK VISUAL — MAPA DE SILENCIOS
Mapeá cada acción del juego y clasificala:
- CORRECTA: acción con feedback visual/audio inmediato
- SILENCIOSA: acción sin ningún feedback
- AMBIGUA: acción con feedback que no comunica el resultado

Para cada acción silenciosa o ambigua, proponé el feedback mínimo viable basado en el referente más apropiado:
- Drops: loot beam de Diablo para rarezas altas
- Level up: overlay ceremonial de WoW
- Craft exitoso: partículas de Last Epoch
- Craft fallido: feedback neutro (no dramático, no punitivo)
- Prestige/Ascension: transición cinematográfica
- Error/imposible: shake + color rojo momentáneo, nunca modal

### 2.5 ARQUITECTURA DE TABS Y NAVEGACIÓN
Auditá si las tabs actuales son las correctas:
- ¿Hay tabs que se usan menos de una vez por sesión que deberían ser sub-drawers en lugar de tabs primarias?
- ¿Hay funcionalidad enterrada en sub-tabs que debería ser tab primaria por frecuencia de uso?
- ¿El orden de las tabs refleja el orden del core loop? (SANTUARIO → EXPEDICIÓN → EXTRACCIÓN → SANTUARIO)
- ¿El jugador sabe siempre en qué tab está y cómo volver?
- ¿Hay deep-linking implícito que pueda llevar al jugador a un estado inesperado?

Proponé una arquitectura de navegación óptima comparando con D4 (HUD vs menús) y Warframe (Hub central vs acceso contextual).

### 2.6 CONSISTENCIA VISUAL Y SISTEMA DE DISEÑO
Auditá el design system del proyecto:
- ¿Los colores de rareza son consistentes en todas las tabs? (el mismo épico debe verse igual en Inventory, Combat y Crafting)
- ¿Los bordes, radios, sombras y tipografías son consistentes?
- ¿Hay elementos que usan estilos inline que deberían ser variables CSS o tokens?
- ¿El dark mode y light mode están ambos completamente implementados o hay elementos que ignoran el modo activo?
- ¿Los estados de hover, focus, active y disabled son consistentes entre componentes similares?

### 2.7 DISEÑO EMOCIONAL DE LA UX (AGREGADO)
Para cada tab y cada momento importante del loop, definí:
- qué debería sentir el jugador,
- qué siente actualmente según la implementación,
- qué elementos de UI o feedback están generando o rompiendo esa emoción,
- cuál es el gap emocional entre intención y ejecución.

Especialmente evaluá:
- anticipación,
- claridad,
- recompensa,
- tensión,
- alivio,
- mastery.

### 2.8 ANTI-FATIGA Y MICRO-FRICCIÓN (AGREGADO)
Detectá:
- clicks sin valor,
- taps redundantes,
- navegación innecesaria entre tabs,
- cadenas de acciones repetitivas sin decisión,
- interrupciones de flujo,
- validaciones o modales innecesarios,
- acciones importantes enterradas tras demasiados pasos.

Clasificá la fricción en:
- fricción útil,
- fricción neutra,
- fricción dañina.

---

## TAREA 3 — AUDITORÍA DE SISTEMAS DE JUEGO

**Objetivo:** verificar que cada sistema de gameplay funciona correctamente, es coherente con el loop central, y no tiene comportamientos inesperados.

### 3.1 AUDITORÍA DEL COMBAT TICK
- ¿El tick corre independientemente del componente montado?
- ¿Qué pasa si el tick se ejecuta mientras el jugador está en el inventario o en crafting?
- ¿Hay edge cases donde el tick puede ejecutarse dos veces en el mismo frame?
- ¿El offline progress calcula correctamente el tiempo transcurrido y lo aplica de forma determinista?
- ¿Hay stats del jugador que se aplican en el tick pero no se muestran al jugador de forma clara?

### 3.2 AUDITORÍA DEL SISTEMA DE LOOT
- ¿Las probabilidades de drop son correctas por tier?
- ¿Hay casos donde ningún affix puede rollearse (pool vacío) que causan un item sin affixes?
- ¿El sistema anti-duplicado de affixes funciona correctamente en todos los casos?
- ¿El loot de boss respeta los BOSS_LOOT_THEMES definidos en data?
- ¿La Luck del jugador afecta correctamente el loot?
- ¿El jugador puede quedarse sin espacio en inventario y perder drops sin aviso?
- ¿Los drops de currency (si existen) tienen su propia lógica o compiten con el drop de items?

### 3.3 AUDITORÍA DEL SISTEMA DE CRAFTING
- ¿Cada operación de crafting (upgrade/reroll/polish/reforge/ascend/fuse/extract/corrupt) tiene su caso en el reducer correctamente implementado?
- ¿El Forging Potential se consume correctamente en cada operación?
- ¿Qué pasa si el jugador craftea un item y el inventario está lleno con el resultado?
- ¿Los costos de crafting escalan correctamente con rareza e item level?
- ¿Hay operaciones de crafting que pueden ejecutarse en un item que no debería recibirlas (ej: corrupt en un item ya corrompido)?
- ¿El rebuildItem recalcula correctamente todos los stats después de cada operación?

### 3.4 AUDITORÍA DEL TALENT TREE
- ¿El sistema de prereqs bloquea correctamente nodos que no deberían estar disponibles?
- ¿El costo de nodos infinitos escala correctamente?
- ¿El reset del talent tree devuelve exactamente los TP gastados?
- ¿Hay nodos que declaran efectos que el statEngine no lee? (nodos "fantasma" que no hacen nada)
- ¿La migración de talentSystemVersion funciona correctamente sin perder progreso?

### 3.5 AUDITORÍA DEL SISTEMA DE PRESTIGE
- ¿El cálculo de Ecos es correcto y consistente?
- ¿El reset de prestige limpia exactamente lo que debe limpiar y preserva exactamente lo que debe preservar?
- ¿Los Sigils de prestige se aplican correctamente al inicio de la run?
- ¿Hay edge cases donde el jugador puede hacer prestige con estado inválido?
- ¿El árbol de reliquias se aplica correctamente después del prestige?

### 3.6 AUDITORÍA DEL SISTEMA DE BLUEPRINTS Y MATERIALES
- ¿El Blueprint Aging (obsolescencia por tier) está implementado y funciona correctamente?
- ¿El sistema de afinidades (family charges) sesga correctamente la materialización de Blueprints?
- ¿El tiempo de fabricación en Foundry/Santuario es determinista y no depende del componente montado?
- ¿Hay blueprints que pueden materializarse con stats imposibles o fuera de rango?

### 3.7 DECISION DENSITY DEL GAMEPLAY (AGREGADO)
Analizá para cada sistema:
- cuántas decisiones produce,
- con qué frecuencia,
- si esas decisiones son realmente significativas,
- si el jugador puede leer sus consecuencias,
- si el sistema se vuelve trámite después de pocas horas.

No solo enumeres decisiones; evaluá su calidad.

### 3.8 SISTEMA DE RIESGO Y COSTO DE OPORTUNIDAD (AGREGADO)
Determiná:
- qué se arriesga dentro de una expedición,
- qué se arriesga al extraer temprano,
- qué se arriesga al seguir avanzando,
- qué se arriesga al usar recursos escasos,
- qué decisiones son irreversibles,
- dónde hay costo de oportunidad real y dónde no.

Si el sistema carece de tensión, proponé mecanismos que la agreguen sin romper claridad ni fairness.

### 3.9 STRESS TEST DE SISTEMAS (AGREGADO)
Simulá el comportamiento de:
- un jugador óptimo min-maxer,
- un jugador casual,
- un jugador exploitador,
- un jugador que ignora tutoriales,
- un jugador que juega en ráfagas cortas.

Buscá:
- loops degenerativos,
- sistemas trivializables,
- secuencias abusivas,
- exploits económicos,
- contenido que puede ignorarse sin costo,
- sistemas que solo funcionan para un tipo de jugador.

---

## TAREA 4 — EVOLUCIÓN DE SISTEMAS Y DISEÑO

**Objetivo:** proponer mejoras de diseño concretas y fundamentadas en referentes del género.

### 4.1 SISTEMA DE JUICE Y FEEDBACK VISUAL
Diseñá un sistema completo de feedback para los momentos de alta dopamina del juego. Para cada momento:

#### LEVEL UP
- Comparalo con WoW (freeze + overlay + audio sting) y con Vampire Survivors (explosión de partículas)
- Proponé la implementación más apropiada para mobile
- Incluí: duración, elementos visuales, audio (descripción), haptics, qué información muestra el overlay
- Asegurate de que no bloquee el combate activo

#### LOOT DROP DE RAREZA ALTA
- Comparalo con el loot beam de Diablo 3/4 y con el audio sting de PoE
- Proponé: loot beam visual, audio por rareza, haptic distinto por tier, tooltip automático para legendarios, screenshot opcional automático
- Incluí la lógica de "silencio para commons, ceremonia para legendarios"

#### CRAFT EXITOSO / PERFECT ROLL
- Comparalo con Last Epoch (tensión de Forging Potential) y con PoE (affix reveal)
- Proponé: animación del affix apareciendo, destaque del stat nuevo, comparativa automática vs equipado, audio distinto para T1

#### PRESTIGE / ASCENSIÓN
- Comparalo con D3 Season start y con Warframe (new quest cinematic)
- Proponé: transición de 5-10 segundos, Legacy Journal entry automático, Eco flotando en HUD, "chapter X" visible

#### BOSS KILL
- Comparalo con D4 (slow-mo final hit) y con Grim Dawn (loot explosion)
- Proponé: cámara en boss cayendo, slow-mo del último hit, chest con preview animado, Boss Codex pop si es primer kill

### 4.2 BLUEPRINT AGING Y OBSOLESCENCIA
Diseñá la fórmula de obsolescencia de Blueprints:
- Si un Blueprint es de Tier N y el jugador pelea en Tier N+X, su poder debe caer gradualmente
- La caída debe ser suave (logarítmica) no cliff edge
- El jugador debe ver claramente qué tan "vigente" está su Blueprint activo
- Comparalo con la degradación de gear de RuneScape y con el scaling de D3 Paragon
- Proponé el UI indicator de vigencia del Blueprint
- Definí el threshold donde el juego sugiere "re-escanear" para obtener Blueprint actualizado

### 4.3 SISTEMA DE AFINIDADES — FAMILY CHARGES
Refiná el sistema de afinidades existente:
- El desguace de items debe generar cargas de la familia del item (bleed_dot, crit_burst, etc.)
- Las cargas sesgan (weighted random) la próxima materialización de Blueprint favoreciendo esa familia
- El jugador debe ver sus cargas acumuladas
- El sistema debe tener un cap de acumulación para evitar que el jugador stockee cargas indefinidamente
- Comparalo con el Devotion affinity de Grim Dawn y con Monster Infrequents como drops temáticos
- Proponé dónde viven las cargas en el state y cómo se muestran en UI

### 4.4 LENTE DE ESCRUTINIO — INFORMACIÓN TÁCTICA EN-RUN
Diseñá el sistema de Lente de Escrutinio:
- Reemplaza el Reroll durante la expedición (el Reroll se mueve al Santuario — Forja Profunda)
- La Lente permite "escanear" un item para revelar sus affixes ocultos antes de decidir si extraerlo
- Tiene usos limitados por run (no ilimitado)
- Los usos se recuperan en el Santuario
- El jugador que usa todos sus usos debe decidir a "ciegas" para los demás items de la run
- Comparalo con la Chaos Orb de PoE (recurso escaso que fuerza decisiones) y con el loot filter de Last Epoch (información vs acción)
- Proponé: UI de la Lente, animación de reveal, dónde vive en el state, cómo se recupera

### 4.5 FORJA PROFUNDA — SANTUARIO COMO HUB
Diseñá la Forja Profunda como sistema central del Santuario:
- Absorbe el Reroll que se quita de la expedición
- Puede incluir operaciones de crafting más pesadas (Ascend, Corrupt, Fuse) que requieren materiales de múltiples runs
- Tiene timers de conveniencia estilo Warframe Foundry (la pieza se fabrica en X tiempo, pero el jugador puede seguir expedicionando)
- Comparalo con Warframe Foundry (blueprint + materiales + tiempo) y con el Cube de Diablo 3
- Proponé: qué operaciones viven aquí, qué materiales requieren, cómo funcionan los timers, cómo se integra con el loop SANTUARIO → EXPEDICIÓN

### 4.6 SISTEMA DE CONTRATOS Y OBJETIVOS DE SESIÓN
Auditá el Quest Log actual y proponé mejoras:
- ¿Los objetivos actuales son claros y accionables?
- ¿Hay siempre un objetivo visible que el jugador puede completar en 10-20 minutos?
- Proponé un sistema de "Session Arc": objetivo principal + dos secundarios, todos visibles en Combat sin necesitar cambiar de tab
- Comparalo con Warframe Nightwave (weekly challenges con narrativa) y con OSRS goal-setting implícito
- Los contratos diarios deben ser ventana semanal con banking (podés completar 7 en un día), no presión diaria estilo "Dailyscape"

### 4.7 LOOT FILTER CONFIGURABLE
Proponé la implementación de un loot filter básico:
- El jugador puede marcar rareza mínima para mostrar en pantalla (silenciar commons en late-game)
- El jugador puede marcar affixes de interés para el "wishlist highlight" (border especial si el item tiene uno de esos affixes)
- El filter se guarda en el save
- Comparalo con Last Epoch (loot filter visual) y con PoE (filtros de texto plano)
- Para este juego: UI simple con toggles, no sintaxis de texto plano

### 4.8 AUDITORÍA Y RE-DISEÑO DEL CORE LOOP (AGREGADO)
Antes de proponer features sueltas, auditá explícitamente si el loop:

**SANTUARIO → EXPEDICIÓN → EXTRACCIÓN → SANTUARIO**

cumple con:
- claridad,
- tensión,
- preparación,
- resolución,
- recompensa,
- retorno significativo al hub.

Respondé:
- qué parte del loop hoy está más fuerte,
- cuál está más débil,
- cuál está mejor resuelta en código pero peor resuelta en UX,
- cuál necesita rediseño sistémico y no solo polish.

### 4.9 SIMPLIFICACIÓN AGRESIVA DE SISTEMAS (AGREGADO)
Para cada sistema de diseño que propongas o revises, preguntate:
- ¿se puede eliminar?
- ¿se puede fusionar?
- ¿se puede mover de lugar en el loop?
- ¿hace que el juego gane tensión o solo pasos?
- ¿aumenta profundidad o solo densidad de reglas?

No agregues sistemas por “potencial”. Justificá existencia.

---

## TAREA 5 — BALANCE Y ECONOMÍA

**Objetivo:** detectar desequilibrios económicos y de poder que rompan la progresión.

### 5.1 CURVAS DE PROGRESIÓN
Para cada recurso del juego (gold, essence, prestige currency, craft currency si existe):
- ¿Hay un punto en la progresión donde el jugador acumula más de lo que puede gastar? (inflación)
- ¿Hay un punto donde el jugador nunca tiene suficiente? (muro de poder)
- ¿Los sinks de cada recurso son proporcionales a su generación por tier?
- ¿La curva de XP es logarítmica en early y se aplana correctamente en late? (los primeros niveles deben sentirse rápidos)

### 5.2 BALANCE DE CLASES Y SPECS
Si hay múltiples specs implementadas:
- ¿Tienen power budgets equivalentes en todos los tiers?
- ¿Hay una spec claramente superior que todos eligen?
- ¿Hay builds que trivializan contenido que no debería ser trivializable?
- ¿Hay builds que son mecánicamente inviables por un affix o talento que no funciona?

### 5.3 BALANCE DE CRAFTING
- ¿El costo de cada operación de crafting es proporcional al beneficio potencial?
- ¿Hay una operación de crafting que es claramente superior y hace que las demás sean irrelevantes?
- ¿El Forging Potential crea decisiones reales o es solo una barra que se vacía sin agencia?
- ¿Hay loops abusivos (ej: fuse masivo para escalar rareza sin costo real)?

### 5.4 BALANCE DE LOOT Y DROPS
- ¿La frecuencia de drops hace que el inventario se llene en menos de 10 minutos de farm?
- ¿Los affixes T1 son suficientemente escasos para generar emoción cuando aparecen?
- ¿Los boss drops justifican el tiempo invertido en matar al boss vs farm de enemies normales?
- ¿Hay items que nunca son útiles en ningún contexto?

### 5.5 LONGEVIDAD ECONÓMICA (AGREGADO)
Evaluá si la economía:
- sostiene decisiones a largo plazo,
- tiene sinks sanos,
- evita inflación estructural,
- evita estancamiento por escasez tóxica,
- puede ampliarse con nuevos materiales o currencies sin explotar complejidad.

### 5.6 LECTURA DE PODER POR PARTE DEL JUGADOR (AGREGADO)
Evaluá si el jugador puede entender:
- por qué su build mejoró,
- por qué un ítem es mejor,
- por qué un craft fue bueno o malo,
- por qué una spec rinde más o menos.

Si el sistema de poder no se puede leer, el balance también falla a nivel UX.

---

## TAREA 6 — MONETIZACIÓN Y RETENCIÓN

**Objetivo:** verificar que la base es monetizable de forma ética y que la retención está diseñada correctamente.

### 6.1 AUDITORÍA DE RETENCIÓN POR ESCALA TEMPORAL
Para cada escala, verificá que el juego tiene algo que lo cubra:
- 5 minutos: ¿hay una sesión completa y satisfactoria posible en 5 minutos?
- 20 minutos: ¿hay un objetivo completo de sesión?
- 1 día: ¿hay una razón para volver mañana?
- 1 semana: ¿hay una meta de mediano plazo visible?
- 1 mes: ¿hay progreso de cuenta que el jugador siente acumularse?

Para cada escala donde no hay cobertura, proponé el sistema mínimo que la cubriría basado en referentes.

### 6.2 LOOPS DE PRESTIGE Y RESET
- ¿El prestige se siente como recompensa o castigo?
- ¿El jugador tiene claro qué conserva y qué pierde?
- ¿Los Sigils hacen que el segundo prestige se sienta diferente al primero?
- ¿Hay razones para hacer prestige más allá de "suben los números"?

### 6.3 PREPARACIÓN PARA MONETIZACIÓN
Auditá si el juego está estructuralmente listo para monetización ética futura:
- ¿Hay un sistema de inventario que podría expandirse con stash tabs premium (PoE model)?
- ¿Hay un sistema de apariencias donde se podrían vender cosméticos sin impacto en poder?
- ¿Hay un sistema de energía/resin que podría tener un refill ético con cap diario?
- ¿El loop central es completo sin pago alguno? (si no, es paywall, no monetización)
- ¿Hay dark patterns de UX que deberían corregirse antes de monetizar? (ej: cuenta regresiva artificial, ofertas con "urgencia" falsa)

### 6.4 LONGEVITY CHECK (AGREGADO)
Respondé explícitamente:
- ¿por qué alguien jugaría esto 1 mes?
- ¿por qué alguien jugaría esto 3 meses?
- ¿por qué alguien jugaría esto 6 meses?

Si no hay respuesta clara, identificá qué capa sistémica falta:
- identidad de build,
- chase items,
- objetivos de cuenta,
- mastery,
- metas semanales,
- colección,
- variedad de runs,
- riesgo/recompensa,
- progreso transversal.

### 6.5 DISEÑO PARA MONETIZACIÓN FUTURA, NO MONETIZACIÓN TEMPRANA (AGREGADO)
Sin diseñar una tienda todavía, evaluá si el juego ya debería prepararse estructuralmente para:
- cosméticos,
- quality-of-life legítimo,
- slots o stash,
- battle pass no intrusivo,
- objetivos de temporada,
- social proof no agresivo.

La consigna es:
**design for monetization compatibility, not monetization pressure.**

---

## TAREA 7 — PERFORMANCE Y ARQUITECTURA

**Objetivo:** detectar problemas de performance que afecten la experiencia en dispositivos mobile de gama media.

### 7.1 RE-RENDERS INNECESARIOS
- Identificá componentes que se re-renderizan cuando no deberían (padre que pasa props que cambian en cada tick aunque el hijo no las use)
- Identificá listas grandes sin virtualización (inventario de 100 items = 100 DOM nodes activos)
- Identificá cálculos pesados en el render path que deberían estar en useMemo
- Identificá funciones creadas inline en JSX que deberían estar en useCallback

### 7.2 EL TICK DE COMBATE
- ¿Usa setInterval o requestAnimationFrame?
- ¿El interval se limpia correctamente al desmontar?
- ¿El tick procesa demasiado trabajo por frame?
- ¿Hay cálculos en el tick que podrían moverse a workers o diferirse?
- ¿Qué pasa si el tick se atrasa (tab en background, CPU ocupada)? ¿Se acumula el atraso?

### 7.3 PERSISTENCIA Y SAVE
- ¿El save a localStorage ocurre en cada tick o en intervalos razonables?
- ¿El JSON.stringify del estado completo en cada save es viable en tamaño y tiempo?
- ¿Hay campos del state que no necesitan persistirse y que podrían excluirse del save para reducir tamaño?
- ¿Hay compresión del save para states grandes?
- ¿El save falla silenciosamente si localStorage está lleno?

### 7.4 CARGA INICIAL
- ¿Hay assets grandes (imágenes, fuentes) que bloquean la primera renderización?
- ¿Los datos (items, affixes, enemies) se cargan todos al inicio o hay lazy loading?
- ¿El bundle size es razonable para mobile?

### 7.5 ESCALABILIDAD ARQUITECTÓNICA (AGREGADO)
Evaluá si la arquitectura actual soporta:
- agregar nuevas clases,
- nuevas specs,
- nuevos tiers,
- nuevos tipos de crafting,
- nuevos tipos de contratos,
- nuevas familias de items,
- nuevos estados del tutorial,
- nuevas tabs o sub-flujos.

Indicá dónde la arquitectura está lista y dónde va a colapsar por acoplamiento.

### 7.6 DEUDA TÉCNICA PRIORITARIA (AGREGADO)
Separá claramente:
- deuda técnica que ya impacta al jugador,
- deuda técnica que todavía no impacta pero bloqueará evolución,
- deuda técnica tolerable.

---

## ENTREGABLE FINAL

Al terminar todas las tareas, entregás un documento `AUDIT_MASTER.md` con:

### 1. RESUMEN EJECUTIVO (media página)
Los 10 hallazgos más críticos, ordenados por impacto. Para compartir con cualquier colaborador sin contexto previo.

### 2. MVP ACTION MATRIX COMPLETA
Todos los hallazgos en la tabla estandarizada, ordenados por categoría y luego por impacto.

### 3. ROADMAP DE IMPLEMENTACIÓN EN 3 HORIZONTES
- **Esta semana** (bloqueantes críticos, crashes, soft-locks)
- **Este mes** (UX, feedback visual, sistemas de juego)
- **Próximo trimestre** (evolución de sistemas, monetización)

### 4. PROMPTS PARA OTROS COLABORADORES
Si hay cambios de UI que corresponden a otro agente (Germina), generá los prompts exactos para pedirle esos cambios, con el contexto necesario para que no necesite leer todo este documento.

### 5. LAS 5 COSAS QUE NO TOCARÍAS
Lo que está bien y merece ser protegido de over-engineering.

### 6. DECISIONES QUE REQUIEREN AL DUEÑO DEL PROYECTO
Lista de preguntas que solo el creador puede responder, con opciones y tu recomendación para cada una.
Máximo 10. Solo las importantes.

### 7. TOP 5 OPORTUNIDADES DE DISEÑO (AGREGADO)
Las 5 mejoras más valiosas que podrían elevar notablemente el juego sin disparar complejidad.

### 8. TOP 5 RIESGOS ESTRUCTURALES (AGREGADO)
Los 5 problemas sistémicos más peligrosos a mediano plazo si no se corrigen.

### 9. VISIÓN DEL JUEGO A 1 AÑO (AGREGADO)
Describí cómo debería verse este juego dentro de 1 año si las decisiones correctas se implementan bien:
- qué sistemas tendría,
- qué tono de UX tendría,
- qué tipo de retención lograría,
- qué identidad diferencial tendría frente a otros idle/ARPG.

---

## REGLAS FINALES

- No hagas el juego más grande por reflejo.
- Hacelo más claro, más profundo y más adictivo.
- No confundas complejidad con profundidad.
- No confundas más pantallas con más contenido.
- No confundas más currencies con mejor economía.
- No confundas más crafting con mejores decisiones.
- Todo debe servir al loop:
  **SANTUARIO → EXPEDICIÓN → EXTRACCIÓN → SANTUARIO**

Si un sistema no fortalece ese loop, evaluá:
- simplificarlo,
- moverlo,
- fusionarlo,
- o eliminarlo.

Tu estándar no es “funciona”.
Tu estándar es:
**coherencia sistémica, claridad, tensión, legibilidad, escalabilidad y potencial de excelencia.**