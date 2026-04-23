# ONBOARDING_PLAN

Fecha: 2026-04-22 UTC

## 0. Base actual observada

### Archivos leídos

- `notes/onboarding.md`
- `notes/onboarding_tabla.md`
- `notes/onboarding_tips.md`
- `notes/onboarding_mio.md`
- `notes/onboarding_comentarios.md`
- `notes/beats.md`
- `src/engine/onboarding/onboardingEngine.js`
- `src/state/gameReducer.js`
- `src/hooks/useGame.js`
- `src/components/OnboardingOverlay.jsx`
- `src/App.jsx`
- `src/components/Sanctuary.jsx`
- `src/components/Laboratory.jsx`
- `src/components/Combat.jsx`
- `src/components/ExpeditionView.jsx`
- `src/components/HeroView.jsx`
- `src/components/Character.jsx`
- `src/components/Skills.jsx`
- `src/components/Talents.jsx`
- `src/components/Inventory.jsx`
- `src/components/ExtractionOverlay.jsx`
- `src/components/Prestige.jsx`
- `src/components/DistilleryOverlay.jsx`
- `src/components/DeepForgeOverlay.jsx`
- `src/components/BibliotecaOverlay.jsx`
- `src/components/EncargosOverlay.jsx`
- `src/components/SigilAltarOverlay.jsx`
- `src/components/Codex.jsx`

### Patrón visual existente

- El tutorial usa `OnboardingOverlay.jsx` con sombra recortada en 4 paneles fijos alrededor del target.
- El target real se detecta por `data-onboarding-target`, se mide con `getBoundingClientRect`, y el spotlight se recalcula en `resize` y `scroll`.
- La card del tutorial usa el skin base del juego: fondo claro, borde sutil, radio `16px`, `box-shadow` fuerte, label superior `Tutorial`, copy corto en segunda persona.
- La card se ancla con tres modos existentes: `top`, `subnav`, `bottom`.
- El spotlight no cambia el componente por otro: cada vista le agrega glow/pulse al control real con `z-index` local y `@keyframes` propios.

### Cómo avanza hoy

- El estado vive en `state.onboarding`.
- La forma actual es:
  - `completed`
  - `step`
  - `flags`
  - `equipKillTarget`
  - `bossHeroDelayTicks`
  - `bossHeroQueued`
  - `extractionReadyDelayTicks`
- El bloqueo de interacción se centraliza en `getBlockedOnboardingAction(...)`.
- El avance principal se centraliza en `advanceOnboarding(...)`.
- Hay una excepción importante en `gameReducer.js`: `SELECT_CLASS` fuerza `COMBAT_INTRO`.
- `App.jsx` además limita tabs primarias y rerutea a la tab requerida.

### Comportamiento temporal actual

- Mientras `state.onboarding.step` existe:
  - no corren `TICK` ni `BULK_TICK` offline en `useGame.js`
  - el juego queda efectivamente pausado en combate
- Hoy los jobs del Santuario siguen sincronizando aunque haya onboarding activo.

### Drift detectado entre docs y código actual

- `beats.md` y `notes/onboarding.md` ponen `CHOOSE_SPEC` antes de `HERO_INTRO`; el código actual hace `HERO_INTRO -> Atributos -> Talentos -> volver a Ficha -> CHOOSE_SPEC`.
- Desde la compra del primer nodo de `Ecos`, los beats tardios ya no fuerzan clicks reales: pasan a formato informativo.
- `FIRST_LIBRARY_RESEARCH`, `FIRST_ERRAND` y `FIRST_SIGIL_INFUSION` ya existen en engine y quedan pendientes de QA, no de definicion conceptual.
- `FIRST_BOSS_KILL_MILESTONE` queda descartado para no recargar la secuencia.

### Regla fija post-Ecos

- El onboarding principal termina en `BUY_FIRST_ECHO_NODE`.
- A partir de ahi, cualquier beat nuevo usa:
  - popup informativo
  - boton `Seguir`
  - hint fijo `En Mas > Glosario podes ver mas`
- Ningun beat tardio debe obligar interaccion sobre UI real.

### Arquitectura UX base

- `Santuario` = home operacional
- `Expedicion` = run activa
- `Heroe` = build actual
- `Ecos` = meta y resonancia
- `Mas` = utilitario, diagnostico y tooling

## A) MAPA COMPLETO DEL TUTORIAL

| # | ID del paso | Qué enseña | Dónde en la UI | Trigger | Estado |
|---|---|---|---|---|---|
| 1 | `EXPEDITION_INTRO` | Santuario como base y CTA real | `Santuario` | primera sesión / save nuevo | ✅ hecho |
| 2 | `CHOOSE_CLASS` | elegir clase base | `Santuario` | `ACK` del beat inicial | ✅ hecho |
| 3 | `COMBAT_INTRO` | combate automático | `Expedición > Combate` | `SELECT_CLASS` | ✅ hecho |
| 4 | `AUTO_ADVANCE` | activar botas / push automático | `Expedición > Combate` | `3 kills` o `Tier 2+` | ✅ hecho |
| 5 | `EQUIP_INTRO` | abrir `Mochila` | `Expedición` subnav | run asentada + `Tier 3+` | ✅ hecho |
| 6 | `EQUIP_FIRST_ITEM` | equipar el primer drop | `Expedición > Mochila` | abrir `Mochila` durante beat | ✅ hecho |
| 7 | `FIRST_BOSS` | reconocer el primer boss | `Expedición > Combate` | aparece boss en `Tier 5` | ✅ hecho |
| 8 | `FIRST_DEATH` | muerte segura del tutorial / leer vidas | `Expedición > Combate` | primera muerte | ✅ hecho |
| 9 | `OPEN_HERO` | abrir la tab real `Heroe` | nav primaria | delay post-muerte | ✅ hecho |
| 10 | `HERO_INTRO` | leer `Ficha` | `Heroe > Ficha` | abrir `Heroe` | ✅ hecho |
| 11 | `HERO_SKILLS_INTRO` | abrir `Atributos` | subnav de `Heroe` | `ACK` de `HERO_INTRO` | ✅ hecho |
| 12 | `SPEND_ATTRIBUTE` | gastar el primer atributo | `Heroe > Atributos` | entrar en `Atributos` | ✅ hecho |
| 13 | `HERO_TALENTS_INTRO` | abrir `Talentos` | subnav de `Heroe` | comprar primer atributo | ✅ hecho |
| 14 | `TALENT_INTRO` | explicación corta del árbol antes de comprar | `Heroe > Talentos` | al abrir `Talentos` por primera vez | ✅ hecho |
| 15 | `BUY_TALENT` | comprar el primer nodo | `Heroe > Talentos` | hoy entra directo al abrir `Talentos` | ✅ hecho |
| 16 | `HERO_CHARACTER_INTRO` | volver a `Ficha` para cerrar build | subnav de `Heroe` | comprar primer talento sin spec | ✅ hecho |
| 17 | `CHOOSE_SPEC` | elegir subclase | `Heroe > Ficha` | hoy se dispara después del primer talento | ✅ hecho |
| 18 | `COMBAT_AFTER_TALENT` | volver al boss y cerrar la run tutorial | `Expedición > Combate` | spec elegida | ✅ hecho |
| 19 | `FIRST_BOSS_KILL_MILESTONE` | hito separado del primer boss | `Expedición > Combate` | kill del boss de `Tier 5` | ⛔ descartado | absorbido en `HUNT_INTRO`
| 20 | `HUNT_INTRO` | abrir `Caza` por primera vez | `Expedición` subnav | primer boss derrotado | ✅ hecho |
| 21 | `EXTRACTION_READY` | entender que la run puede cerrarse | `Expedición > Combate` | progreso post-boss + `Tier 6+` | ✅ hecho |
| 22 | `EXTRACTION_SELECT_CARGO` | elegir cargo | `ExtractionOverlay` | abrir extracción tutorial | ✅ hecho |
| 23 | `EXTRACTION_SELECT_ITEM` | elegir item rescatado | `ExtractionOverlay` | cargo elegido + slot proyecto | ✅ hecho |
| 24 | `EXTRACTION_CONFIRM` | confirmar vuelta al Santuario | `ExtractionOverlay` | item elegido o sin slot | ✅ hecho |
| 25 | `FIRST_SANCTUARY_RETURN` | entender que la run se procesa en el hub | `Santuario` | primera extracción confirmada | ✅ hecho |
| 26 | `RESEARCH_DISTILLERY` | primer research obligatorio | `Laboratorio` | abrir `Laboratorio` | ✅ hecho | 
| 27 | `DISTILLERY_READY` | abrir la primera estación persistente | `Santuario` | reclamar research `unlock_distillery` | ✅ hecho | ///QUE NO SEA SÓLO "RECLAMAR", HACELO INICIAR LA INVESTIGACIÓN, QUE DURE 15 SEGUNDOS PONELE, Y QUE LA PUEDA CLAIMEAR, TODO EN EL MISMO BEAT.
| 28 | `FIRST_DISTILLERY_JOB` | iniciar la primera destilación real | `DistilleryOverlay` | abrir `Destilería` con bundles disponibles | 🔲 pendiente | ///HACELO, post destilería que empiece el tutorial de la destilería. Hacelo abrirla, elegir un bundle, y ponerlo a destilar. Que no espere necesariamente que termine, que pueda volver al santuario si quiere.
| 29 | `FIRST_ECHOES` | entender que existe progreso meta | `Ecos` | primer prestige real | ✅ hecho | ///Cuando vuelva de la destilería, mostrarle que existe esto! Misma lógica,spotlightear "Ecos" (que hasta ahora no lo podía seleccionar), luego epxlicarle cuántos ecos tiene disponibles con spotlight, luego hacerlo comprar un primer nodo base, etc.
| 30 | `BUY_FIRST_ECHO_NODE` | comprar el primer nodo de ecos | `Ecos` | `ACK` de `FIRST_ECHOES` | ✅ hecho | ///Decirle que puede volver al Santuario.
| 31 | `FIRST_PRESTIGE_CLOSE` | fijar mentalmente el loop `run -> hub -> ecos` | `Ecos` o `Santuario` | compra del primer nodo | ✅ hecho | informativo
| 32 | `BLUEPRINT_INTRO` | ubicar el `Stash temporal` y presentar persistencia de items | `Santuario` | `Prestige 2` | ✅ hecho | ///Mostrarle el Stash temporal (hasta este momento que esté oculto), explicarle para qué es.
| 33 | `BLUEPRINT_DECISION` | explicar `Blueprint` vs `Desguace` | `Santuario > Stash temporal` | `Prestige 2` con items rescatados | ✅ hecho | informativo
| 34 | `FIRST_BLUEPRINT_MATERIALIZATION` | explicar que el blueprint materializa una pieza nueva | inicio de una run con blueprint activo | primera materialización real | ✅ hecho | informativo
| 35 | `DEEP_FORGE_READY` | research de `Forja Profunda` | `Laboratorio` | `Prestige 3` | ✅ hecho |
| 36 | `FIRST_DEEP_FORGE_USE` | primer beat de Taller | `Santuario` | `Forja Profunda` desbloqueada + contexto valido | ✅ hecho | informativo
| 37 | `LIBRARY_READY` | research de `Biblioteca` | `Laboratorio` | `Prestige 4` | ✅ hecho |
| 38 | `FIRST_LIBRARY_RESEARCH` | presentar el primer uso real de Biblioteca | `Santuario` | `Biblioteca` abierta + tinta + target investigable | ✅ hecho | informativo
| 39 | `ERRANDS_READY` | research de `Encargos` | `Laboratorio` | `Prestige 5` | ✅ hecho |
| 40 | `FIRST_ERRAND` | presentar el primer uso real de Encargos | `Santuario` | `Encargos` abiertos + slot libre | ✅ hecho | informativo
| 41 | `SIGIL_ALTAR_READY` | research de `Altar de Sigilos` | `Laboratorio` | `Prestige 6` | ✅ hecho |
| 42 | `FIRST_SIGIL_INFUSION` | presentar el primer uso real del Altar | `Santuario` | altar abierto + flux suficiente | ✅ hecho | informativo
| 43 | `TIER25_CAP` | explicar que el mundo base terminó en `Tier 25` | `Expedición > Combate` | matar boss de `Tier 25` sin portal abierto | ✅ hecho | informativo
| 44 | `ABYSS_PORTAL_READY` | research del portal al endgame | `Laboratorio` | boss `Tier 25` + prerequisitos de Santuario | ✅ hecho |
| 45 | `FIRST_ABYSS` | explicar reglas del Abismo al entrar a `Tier 26+` | `Expedición > Combate` o interstitial dedicado | primera entrada a `Tier 26` con portal abierto | ✅ hecho | informativo

## B) PASOS PENDIENTES EN DETALLE

### 1. `TALENT_INTRO`

- ID único: `TALENT_INTRO`
- Elemento de UI: nuevo target sobre el panel raíz del árbol, sugerido `data-onboarding-target="talent-tree-panel"`
- Texto exacto:
  - `Aquí tomas la primera decisión real de build. Mira el árbol y después compras un nodo.`
- Tipo: `tooltip + highlight`
- Posición del tooltip: `bottom`
- Trigger: automático al entrar por primera vez a `Heroe > Talentos`
- Condición de avance: `ACK` info-only
- Estado del juego requerido:
  - `onboarding.step === HERO_TALENTS_INTRO`
  - subtab `talents` abierta
  - primer talento todavía no comprado

### 2. `FIRST_BOSS_KILL_MILESTONE`

- ID único: `FIRST_BOSS_KILL_MILESTONE`
- Elemento de UI: bloque del encounter actual o badge de tier, sugerido `data-onboarding-target="first-boss-kill"`
- Texto exacto:
  - `Boss abajo. Ahora la expedición ya te deja leer objetivos y cerrarla con intención.`
- Tipo: `tooltip + highlight`
- Posición del tooltip: `bottom`
- Trigger: automático al registrar la primera kill de boss de `Tier 5`
- Condición de avance: `ACK` info-only
- Estado del juego requerido:
  - primer boss muerto
  - `huntUnlocked === false`
- Nota:
  - si se decide no separar este hito, se absorbe en `HUNT_INTRO`.

  ///Para mi absorbamos este en Hunt.

### 3. `FIRST_DISTILLERY_JOB`

- ID único: `FIRST_DISTILLERY_JOB`
- Elemento de UI: primer botón real `Destilar` disponible en `DistilleryOverlay`, sugerido `data-onboarding-target="start-distillery-job"`
- Texto exacto:
  - `Ahora procesa tu primer bundle. Toca Destilar en la opción marcada.`
- Tipo: `spotlight`
- Posición del tooltip: `bottom`
- Trigger: automático al abrir `Destilería` por primera vez con bundles disponibles
- Condición de avance: `START_DISTILLERY_JOB`
- Estado del juego requerido:
  - `distilleryUnlocked === true`
  - al menos un bundle en `cargoInventory`, si no lo tiene, crear uno genérico.
  - ningún job tutorial de destilería iniciado todavía.
- Forzar el inicio de un job, pero no obligarlo a esperar que termine.

///Luego de este, explicarle que vamos a aprender qué son los Ecos (y spotlightear Ecos)

### 4. `FIRST_PRESTIGE_CLOSE`

- ID único: `FIRST_PRESTIGE_CLOSE`
- Elemento de UI: puede vivir sin target o sobre `prestige-summary`
- Texto exacto:
  - `Ya dejaste progreso fuera de una sola run. Desde acá cada expedición hace crecer la cuenta.`
- Tipo: `tooltip` info-only
- Posición del tooltip: `bottom`
- Trigger: automático al comprar el primer nodo de `Ecos`
- Condición de avance: `ACK` info-only
- Estado del juego requerido:
  - primer nodo de ecos comprado
  - beat mostrado solo una vez

///Una vezz que haga el tutorial de Ecos, decirle que ya puede volver a iniciar una expedición. Que nos vemos de nuevo en su segunda extracción.

### 5. `BLUEPRINT_DECISION`

- ID único: `BLUEPRINT_DECISION`
- Elemento de UI: fila del primer item rescatado y sus botones reales, sugeridos:
  - `data-onboarding-target="blueprint-decision-row"`
  - `data-onboarding-target="blueprint-convert"`
  - `data-onboarding-target="blueprint-scrap"`
- Texto exacto:
  - `Ahora decide qué guardas de verdad. Blueprint sesga futuras materializaciones; Desguace devuelve materia prima.`
- Tipo: `spotlight`
- Posición del tooltip: `bottom`
- Trigger: automático tras `BLUEPRINT_INTRO`
- Condición de avance: `CONVERT_EXTRACTED_ITEM_TO_BLUEPRINT` o `START_SCRAP_EXTRACTED_ITEM_JOB`
- Estado del juego requerido:
  - `Prestige 2+`
  - al menos un item válido en `Stash temporal`, sino crear hasta 2 genéricos.
  - idealmente `2-3` items para que la decisión se lea mejor

### 6. `FIRST_BLUEPRINT_MATERIALIZATION`

- ID único: `FIRST_BLUEPRINT_MATERIALIZATION`
- Elemento de UI: sin target fijo; toast/beat contextual al entrar a la run
- Texto exacto:
  - `Este blueprint no copió un item viejo: materializó una pieza nueva sesgada por tu cuenta.`
- Tipo: `tooltip` o `toast contextual`
- Posición del tooltip: `top`
- Trigger: automático al iniciar una expedición con una materialización proveniente de blueprint
- Condición de avance: automática con timeout corto o `ACK`
- Estado del juego requerido:
  - al menos un blueprint activo materializado en la run
  - no haber mostrado este beat antes

### 7. `FIRST_DEEP_FORGE_USE`

- ID único: `FIRST_DEEP_FORGE_USE`
- Elemento de UI: primer botón real `Subir proyecto` utilizable, sugerido `data-onboarding-target="deep-forge-upgrade"`
- Texto exacto:
  - `Ahora el plano deja de ser estático. Súbelo una vez para sentir progreso persistente real.`
- Tipo: `spotlight`
- Posición del tooltip: `bottom`
- Trigger: automático al abrir `Forja Profunda` por primera vez con un proyecto válido
- Condición de avance: `START_DEEP_FORGE_JOB`
- Estado del juego requerido:
  - estación `deepForge` desbloqueada
  - al menos un proyecto válido visible
  - recursos mínimos suficientes o proyecto tutorial garantizado

### 8. `FIRST_LIBRARY_RESEARCH`

- ID único: `FIRST_LIBRARY_RESEARCH`
- Elemento de UI: primer botón `Investigar ...` de `Codex` en modo `library`, sugerido `data-onboarding-target="library-first-research"`
- Texto exacto:
  - `Ahora activa un hito real. Sin investigar, los descubrimientos no se convierten en bonus.`
- Tipo: `spotlight`
- Posición del tooltip: `bottom`
- Trigger: automático al abrir `Biblioteca` con tinta y algún objetivo investigable
- Condición de avance: `START_CODEX_RESEARCH`
- Estado del juego requerido:
  - estación `Biblioteca` desbloqueada
  - `codexInk > 0`
  - al menos un target con `canResearchNext === true`

### 9. `FIRST_ERRAND`

- ID único: `FIRST_ERRAND`
- Elemento de UI: primer botón `Asignar` disponible en `Encargos`, sugerido `data-onboarding-target="errand-first-assign"`
- Texto exacto:
  - `Asigna un encargo simple. El Santuario puede traer valor mientras tu héroe sigue empujando runs.`
- Tipo: `spotlight`
- Posición del tooltip: `bottom`
- Trigger: automático al abrir `Encargos` con slot libre
- Condición de avance: `START_SANCTUARY_ERRAND`
- Estado del juego requerido:
  - estación `errands` desbloqueada
  - `availableSlots > 0`
  - catálogo visible

### 10. `FIRST_SIGIL_INFUSION`

- ID único: `FIRST_SIGIL_INFUSION`
- Elemento de UI: primer botón real `Infusionar` utilizable en `SigilAltarOverlay`, sugerido `data-onboarding-target="sigil-first-infusion"`
- Texto exacto:
  - `Prepara una carga para la próxima expedición. Esto no mejora la run actual: prepara la siguiente.`
- Tipo: `spotlight`
- Posición del tooltip: `bottom`
- Trigger: automático al abrir `Altar de Sigilos` con flux suficiente
- Condición de avance: `START_SIGIL_INFUSION`
- Estado del juego requerido:
  - estación `sigilInfusion` desbloqueada
  - `sigilFlux` suficiente
  - al menos un slot libre

### 11. `TIER25_CAP`

- ID único: `TIER25_CAP`
- Elemento de UI: encounter card o badge de tier, sugerido `data-onboarding-target="tier-cap-warning"`
- Texto exacto:
  - `Llegaste al borde del mundo base. Para pasar de Tier 25 necesitas abrir el Portal al Abismo desde el Laboratorio.`
- Tipo: `tooltip + highlight`
- Posición del tooltip: `bottom`
- Trigger: automático al matar el boss de `Tier 25` con portal todavía cerrado
- Condición de avance: `ACK` info-only
- Estado del juego requerido:
  - `tier25BossCleared === true`
  - `portalUnlocked === false`

### 12. `FIRST_ABYSS`

- ID único: `FIRST_ABYSS`
- Elemento de UI: interstitial propio o encounter card de `Combate`
- Texto exacto:
  - `Desde Tier 26 cambia el juego: más presión, mejores recompensas y progresión de endgame.`
- Tipo: `tooltip` o `interstitial corto`
- Posición del tooltip: `center` o `bottom`
- Trigger: automático al entrar por primera vez a `Tier 26+`
- Condición de avance: `ACK` info-only
- Estado del juego requerido:
  - `portalUnlocked === true`
  - primera entrada real a `Tier 26+`

## C) DUDAS Y DECISIONES PENDIENTES

1. Orden del tramo `Heroe` → opciones:
   - mantener el código actual: `Ficha -> Atributos -> Talentos -> Ficha -> Spec`
   - alinear con `beats.md`: `Open Hero -> Spec -> Ficha -> Atributos -> Talentos`
   - recomendación: alinear con `beats.md`, porque hoy docs y código se contradicen.
   ///DECISIÓN FINAL: mantener código actual que por lo menos ya funciona.

2. `TALENT_INTRO` → opciones:
   - restaurarlo como beat info-only separado
   - absorberlo dentro de `BUY_TALENT`
   - recomendación: separarlo, porque en tus docs un concepto y una compra son dos beats distintos.
   ///SI, MOSTRAR PRIMERO CONCEPTO, LUEGO FORZAR LA COMPRA.

3. Post kill del primer boss → opciones:
   - dejar un beat propio de hito y después `HUNT_INTRO`
   - fusionar todo en `HUNT_INTRO`
   - recomendación: fusionarlo salvo que quieras remarcar emocionalmente la caída del boss.
   ///FUSIONAR, DEJAR EN HUNT INTRO.

4. Primer loop de `Destilería` → opciones:
   - tutorializar sólo abrir la estación
   - forzar además el primer `Destilar`
   - recomendación: forzar también el primer job; sin eso el loop persistente queda a medio enseñar.
   ///FORZAR PRIMER JOB, NO FORZAR LA ESPERA OBVIO. QUE DESPUÉS DE ESTO PUEDA APRENDER ECOS.

5. `Blueprint vs Desguace` en `Prestige 2` → opciones:
   - enseñar la decisión con un solo item
   - garantizar `2-3` items en stash para que se compare mejor
   - recomendación: garantizar al menos `2` items.
   ///SIP, GARANTIZAR AL MENSO 2 ITEMS GENÉRICOS.

6. Resolución de `Blueprint vs Desguace` → opciones:
   - permitir cualquiera de los dos caminos como salida válida
   - forzar primero `Blueprint`
   - forzar primero `Desguace`
   - recomendación: dejar libre la decisión y sólo bloquear hasta que elija una.
   ///FORZAR AMBAS, EN EL ORDEN QUE SEA. EXPLICANDO PARA QUÉ SIRVE CADA UNA.

7. First-use beats de estaciones avanzadas → opciones:
   - hacer hard-guide en `Forja Profunda`, `Biblioteca`, `Encargos` y `Altar`
   - hacer hard sólo en `Forja Profunda` y soft/contextual en las demás
   - recomendación: hard sólo en `Forja Profunda`; el resto mejor contextual para no inflar el tutorial.
   ///DALE SI, HAGAMOS ESTO.

8. Techo de `Tier 25` → opciones:
   - mostrar beat específico `TIER25_CAP`
   - no mostrar nada y esperar directo a `ABYSS_PORTAL_READY`
   - recomendación: mostrar `TIER25_CAP`, porque explica por qué el jugador no progresa aunque siga empujando.
   ///PERFECTO. EXPLICARLE UQE TIENE QUE INVESTIGAR EL PORTAL AL ABISMO EN EL LABORATORIO.

9. Primer `Abismo` → opciones:
   - interstitial bloqueante corto
   - beat breve sobre el control real de `Combate`
   - recomendación: interstitial corto; es cambio de capa, no sólo de botón.

10. Alcance de “onboarding” → opciones:
   - considerar onboarding principal sólo hasta `BUY_FIRST_ECHO_NODE`
   - considerar onboarding extendido/contextual hasta `FIRST_ABYSS`
   - recomendación: onboarding extendido/contextual hasta `FIRST_ABYSS`, manteniendo el early bloqueante y el late como beats más livianos.
   ///SIP, EXTENDIDO COMO ME RECOMENDAS.

## SUGERENCIAS

- `TALENT_INTRO` hoy está definido pero muerto. Aunque no se agregue ningún beat nuevo, conviene corregir ese drift.
- `notes/onboarding_tips.md` dice “pausar todos los ticks sin excepciones”; hoy el código pausa combate/offline, pero no congela jobs del Santuario.
- `BLUEPRINT_INTRO` ya tiene base visual reutilizable. No conviene reemplazarla: conviene extenderla con un step nuevo de decisión real.
