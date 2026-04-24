# Entregables Onboarding

## Alcance y método

- Auditoría estática de arquitectura y flujo sobre:
  - `src/engine/onboarding/onboardingEngine.js`
  - `src/components/OnboardingOverlay.jsx`
  - `src/App.jsx`
  - `src/state/gameReducer.js`
  - `src/hooks/useGame.js`
  - `src/engine/stateInitializer.js`
- Sin implementación de cambios en este documento (solo diagnóstico + propuesta).

---

## Sección A — Mapa completo de beats

| # | ID | Mensaje/Descripción | Target elemento (selector principal) | Tab requerida | Tipo de avance | Estado |
|---|---|---|---|---|---|---|
| 1 | `expedition_intro` | Intro Santuario | `start-expedition` | `sanctuary` | `tap` (`ACK_ONBOARDING_STEP`) | ✅ ok |
| 2 | `choose_class` | Elegir clase | `choose-class` | `sanctuary` | `acción` (`SELECT_CLASS`) | ✅ ok |
| 3 | `combat_intro` | Intro combate | `combat-encounter` | `combat` | `tap` | ✅ ok |
| 4 | `auto_advance` | Activar autoavance | `auto-advance` | `combat` | `acción` (`TOGGLE_AUTO_ADVANCE`) | ✅ ok |
| 5 | `first_death` | Protección de tutorial | `expedition-lives` | `combat` | `tap` | ✅ ok |
| 6 | `open_hero` | Abrir héroe | `primary-hero-tab` | `character` | `acción` (`SET_TAB`) | ✅ ok |
| 7 | `hero_intro` | Intro ficha | `hero-overview` | `character` | `tap` | ✅ ok |
| 8 | `hero_skills_intro` | Abrir atributos | `hero-subview-skills` | `character/skills` | `acción` (`SET_TAB`) | ✅ ok |
| 9 | `spend_attribute` | Comprar fuerza | `upgrade-attribute` | `skills` | `acción` (`UPGRADE_PLAYER`) | ✅ ok |
| 10 | `hero_talents_intro` | Abrir talentos | `hero-subview-talents` | `character/talents` | `acción` (`SET_TAB`) | ✅ ok |
| 11 | `talent_intro` | Intro talentos | `buy-talent-card` | `talents` | `tap` | ✅ ok |
| 12 | `buy_talent` | Comprar talento | `buy-talent` / `data-onboarding-node-id` | `talents` | `acción` (`UPGRADE_TALENT_NODE`) | ⚠️ bug/riesgo |
| 13 | `hero_character_intro` | Volver a ficha | `hero-subview-character` | `character` | `acción` (`SET_TAB`) | ✅ ok |
| 14 | `choose_spec` | Elegir subclase | `choose-spec` | `character` | `acción` (`SELECT_SPECIALIZATION`) | ✅ ok |
| 15 | `combat_after_talent` | Volver combate | `combat-encounter` | `combat` | `tap` | ✅ ok |
| 16 | `equip_intro` | Abrir mochila | `subview-inventory` | `combat` | `acción` (`SET_TAB`) | ✅ ok |
| 17 | `equip_first_item` | Equipar primer ítem | `tutorial-first-item` / `equip-item` | `inventory` | `acción` (`EQUIP_ITEM`) | ⚠️ bug/riesgo |
| 18 | `first_boss` | Intro boss | `combat-encounter` | `combat` | `tap` | ✅ ok |
| 19 | `hunt_intro` | Intro Intel/Codex | `subview-codex` | `combat/codex` | `acción` o `tap` (modo dual) | ⚠️ bug/riesgo menor |
| 20 | `extraction_ready` | Abrir extracción | `open-extraction` | `combat` | `acción` (`OPEN_EXTRACTION`) | ✅ ok |
| 21 | `extraction_select_cargo` | Elegir cargo | `tutorial-extraction-cargo` | `sanctuary` | `acción` (`SELECT_EXTRACTION_CARGO`) | ✅ ok |
| 22 | `extraction_select_item` | Elegir item | `tutorial-extraction-item` | `sanctuary` | `acción` (`SELECT_EXTRACTION_PROJECT`) | ✅ ok |
| 23 | `extraction_confirm` | Confirmar extracción | `tutorial-extraction-confirm` | `sanctuary` | `acción` (`CONFIRM_EXTRACTION`) | ✅ ok |
| 24 | `first_sanctuary_return` | Vuelta Santuario | sin spotlight (`[]`) | `sanctuary` | `tap` | ✅ ok |
| 25 | `open_laboratory` | Abrir laboratorio | `open-laboratory` | `sanctuary` | `acción` (`OPEN_LABORATORY`) | ⚠️ bug/riesgo |
| 26 | `research_distillery` | Investigar destilería | `research-card-unlock_distillery` | `sanctuary` | `acción` (`START_LAB_RESEARCH`) | ⚠️ bug/riesgo |
| 27 | `distillery_ready` | Esperar/reclamar research | `claim-distillery-research` (dinámico) | `sanctuary` | `acción` (`CLAIM_SANCTUARY_JOB`) | ⚠️ bug/riesgo |
| 28 | `return_to_sanctuary` | Volver al hub | `primary-sanctuary-tab` / `close-laboratory` | `sanctuary` | `acción` (`CLOSE_LABORATORY`) | ⚠️ bug/riesgo |
| 29 | `open_distillery` | Abrir destilería | `open-distillery` | `sanctuary` | `acción` (`OPEN_DISTILLERY`) | ⚠️ bug/riesgo |
| 30 | `first_distillery_job` | Iniciar destilación | `tutorial-distillery-bundle` / `tutorial-distillery-start` | `sanctuary` | `acción` (`START_DISTILLERY_JOB`) | ⚠️ bug/riesgo |
| 31 | `first_echoes` | Intro Ecos | `primary-prestige-tab` o `prestige-summary` | `prestige` (forzado) / `info` (ya dentro) | `acción` o `tap` | ⚠️ bug/riesgo |
| 32 | `buy_first_echo_node` | Comprar nodo | `buy-first-echo-node` | `prestige` | `acción` (`BUY_PRESTIGE_NODE`) | ✅ ok |
| 33 | `first_prestige_close` | Cierre primer loop | sin spotlight (info) | `prestige` | `tap` | ✅ ok |
| 34 | `blueprint_intro` | Intro stash temporal | `blueprint-stash` | `sanctuary` | `tap` | ✅ ok |
| 35 | `blueprint_decision` | Blueprint vs desguace | `blueprint-stash` / `tutorial-blueprint-action` | `sanctuary` | `tap` (informativo) | ✅ ok |
| 36 | `first_blueprint_materialization` | Qué materializa un blueprint | sin spotlight (info) | `sanctuary` | `tap` | ✅ ok |
| 37 | `deep_forge_ready` | Taller listo para investigar | `research-card-unlock_deep_forge` | `sanctuary` | `tap` | ✅ ok |
| 38 | `first_deep_forge_use` | Intro Taller | `open-deep-forge` / `tutorial-deep-forge-project` | `sanctuary` | `tap` | ✅ ok |
| 39 | `library_ready` | Biblioteca lista | `research-card-unlock_library` | `sanctuary` | `tap` | ✅ ok |
| 40 | `first_library_research` | Intro Biblioteca | sin spotlight (info) | `sanctuary` | `tap` | ✅ ok |
| 41 | `errands_ready` | Encargos listos | `research-card-unlock_errands` | `sanctuary` | `tap` | ✅ ok |
| 42 | `first_errand` | Intro Encargos | sin spotlight (info) | `sanctuary` | `tap` | ✅ ok |
| 43 | `sigil_altar_ready` | Altar listo | `research-card-unlock_sigil_altar` | `sanctuary` | `tap` | ✅ ok |
| 44 | `first_sigil_infusion` | Intro infusión | sin spotlight (info) | `sanctuary` | `tap` | ✅ ok |
| 45 | `abyss_portal_ready` | Portal listo | `research-card-unlock_abyss_portal` | `sanctuary` | `tap` | ✅ ok |
| 46 | `tier25_cap` | Techo T25 | `combat-encounter` | `combat` | `tap` | ✅ ok |
| 47 | `first_abyss` | Intro Abismo | sin spotlight (info) | `combat` | `tap` | ✅ ok |

### Beats con ⚠️: bug puntual y condición de reproducción

- `buy_talent`
  - Bug: spotlight puede tardar o apuntar a fallback no óptimo si el nodo tutorial no está montado o cambia de árbol.
  - Condición: cambio de árbol/lista de talentos + render asíncrono.
- `equip_first_item`
  - Bug: en mobile puede necesitar múltiples intentos para que el ítem quede realmente visible antes de spotlight.
  - Condición: inventario largo + scroll previo del usuario.
- `hunt_intro`
  - Bug: modo dual (`forced`/`info`) puede generar comportamiento percibido inconsistente.
  - Condición: usuario ya está en `codex` al entrar al beat.
- Corredor Destilería (`open_laboratory`, `research_distillery`, `distillery_ready`, `return_to_sanctuary`, `open_distillery`, `first_distillery_job`)
  - Bug: delays visibles (retries) y spotlight tardío o intermitente.
  - Condición: target tarda en montar o queda fuera de viewport/scroll container.
- `first_echoes`
  - Bug/riesgo: dos modos de interacción según tab actual (`forced` fuera de prestige, `info` dentro) incrementa ambigüedad de avance.
  - Condición: navegación rápida entre tabs o estado previo parcial.

---

## Sección B — Bugs catalogados

### BUG-01
- Descripción: spotlight tardío/intermitente en corredor de Laboratorio/Destilería.
- Beat(s) afectados: `open_laboratory`, `research_distillery`, `distillery_ready`, `return_to_sanctuary`, `open_distillery`, `first_distillery_job`.
- Dispositivo: ambos (más notorio en mobile).
- Causa raíz: estrategia de retry por timeout sin señal fuerte de “scroll finalizado + layout estable”.
- Archivo y línea aprox: `src/components/OnboardingOverlay.jsx:350-453`, `166-174`.
- Severidad: ALTO.

### BUG-02
- Descripción: acciones bloqueadas por onboarding pueden sentirse “freezadas” (no-op).
- Beat(s) afectados: todos los `forced`.
- Dispositivo: ambos.
- Causa raíz: el reducer bloquea silenciosamente acciones (`return state`) y no todos los botones tienen feedback contextual.
- Archivo y línea aprox: `src/state/gameReducer.js:897-899`, `src/engine/onboarding/onboardingEngine.js:1005-1143`.
- Severidad: ALTO.

### BUG-03
- Descripción: click-through amplio en corredor permite interacción fuera del target spotlight.
- Beat(s) afectados: corredor de Santuario/Destilería.
- Dispositivo: ambos.
- Causa raíz: backdrop con `pointerEvents: none` en modo corridor y dependencia exclusiva del guard de reducer.
- Archivo y línea aprox: `src/components/OnboardingOverlay.jsx:208-215`, `547-560` (máscaras).
- Severidad: MEDIO.

### BUG-04
- Descripción: complejidad de guardias en 3 capas puede crear desalineación de UX.
- Beat(s) afectados: navegación/tab durante onboarding.
- Dispositivo: ambos.
- Causa raíz: reglas duplicadas entre `App` (guard visual), `onboardingEngine` (guard funcional) y `advanceOnboarding` (forzado de tab).
- Archivo y línea aprox: `src/App.jsx:325-340`, `648-688`; `src/engine/onboarding/onboardingEngine.js:375-443`, `1005-1143`, `2510-2536`.
- Severidad: MEDIO.

### BUG-05
- Descripción: el spotlight puede “armarse” con fallback cuando target principal aún no está disponible.
- Beat(s) afectados: pasos con selector múltiple (ej. `distillery_ready`, `first_distillery_job`).
- Dispositivo: ambos.
- Causa raíz: fallback por selector visible + retries; al agotar intentos marca `spotlightReady=true` igual.
- Archivo y línea aprox: `src/components/OnboardingOverlay.jsx:362-373`, `441-453`.
- Severidad: MEDIO.

### BUG-06
- Descripción: la estabilidad visual depende de mediciones por `getBoundingClientRect` en raf/mutation/scroll; en layouts con overflow no scrollable puede fallar la expectativa de foco.
- Beat(s) afectados: principalmente overlays y listas largas.
- Dispositivo: ambos.
- Causa raíz: solo se corrigen ancestros con overflow scroll/auto; contenedores con clipping (`overflow:hidden`) no aportan estrategia de visibilidad.
- Archivo y línea aprox: `src/components/OnboardingOverlay.jsx:13-32`, `34-114`.
- Severidad: MEDIO.

---

## Sección C — Análisis estructural

### 1) Spotlight positioning

- ¿Usa `getBoundingClientRect()`?
  - Sí. Evidencia: `OnboardingOverlay.jsx:284-293`, `487-488`.
- ¿Considera `window.scrollY + rect.top`?
  - No explícitamente, pero el overlay es `position: fixed` y trabaja en coordenadas de viewport (`left/top` de rect), por lo que no necesita offset absoluto de documento.
- ¿Considera viewport size para visibilidad?
  - Sí (`visibleTop`, `visibleBottom`, `window.innerHeight`) en `383-403`, `421-431`.
- ¿Tiene retry si target no está en DOM?
  - Sí (`attempts`, `maxAttempts`, `retryDelayMs`) en `352-373`, `446-453`.
- ¿Funciona igual con overflow hidden vs root?
  - Parcial. Hay soporte para contenedores scrollables (`13-114`), pero no hay manejo específico de clipping no scrollable.

### 2) Scroll-to-element

- ¿Hace scroll antes de medir spotlight?
  - Sí: `scrollTargetIntoView` corre antes de marcar `spotlightReady`.
- ¿Método?
  - `scrollIntoView`, `window.scrollBy`, y scroll en ancestros (`container.scrollBy`).
- ¿Espera fin de scroll?
  - No hay detector robusto de “scroll terminado”; usa timeouts + RAF + intentos.
- ¿Hay señal confiable de fin?
  - No, solo convergencia por “no hubo ajuste” o agotamiento de intentos.

### 3) Bloqueo de navegación

- ¿Existe mecanismo de bloqueo?
  - Sí, doble:
    - UI/primaria en `App` (`isPrimaryTabAllowed`, `handlePrimaryTabPress`).
    - Funcional global en reducer (`getBlockedOnboardingAction`).
- ¿Funciona en todos los casos?
  - Funcionalmente bloquea mucho, pero UX no siempre es explícita en acciones no-tab.
- ¿Dónde debería consolidarse?
  - En un guard central con “motivo de bloqueo” reutilizable por UI y reducer.
- ¿Bloqueo total o contextual?
  - Contextual (actual diseño): permite tabs auxiliares y sub-tabs equivalentes.

### 4) Persistencia de estado

- ¿Estado del tutorial global o local?
  - Global (`state.onboarding`) y evoluciona vía `advanceOnboarding(...)`.
- ¿Se persiste en save?
  - Sí, dentro del estado completo (`saveGame` en `useGame`, merge/normalización en `stateInitializer`).
- ¿Qué pasa al cerrar/reabrir?
  - Se recupera por save; además hay flush en `visibilitychange/pagehide/beforeunload`.
- Evidencias:
  - `gameReducer.js:1743-1748`
  - `stateInitializer.js:1032-1044`
  - `useGame.js:359-413`

### 5) Limpieza de listeners

- ¿Hay cleanup en onboarding overlay?
  - Sí: wheel/touch/keydown, resize/scroll, mutation observer, raf/timeouts.
- ¿Se desregistran listeners al avanzar beat?
  - Sí, por cleanup de effects dependientes de `step`.
- ¿Timers/intervals limpios?
  - Sí en overlay (`interval` de `DISTILLERY_READY` y timeouts/raf).

---

## Sección D — Propuesta de arquitectura

### 1) Dónde vive el estado

- Mantener estado en store global persistido, sin estado local de progresión.
- Estructura sugerida:
  - `onboarding.currentBeatId` (string/null)
  - `onboarding.completed` (boolean)
  - `onboarding.skipped` (boolean)
  - `onboarding.completedBeats` (map/set serializable)
  - `onboarding.runtime` (no persistido): intentos de spotlight, timestamp inicio, motivo de bloqueo

### 2) Cómo se define cada beat

- Definición declarativa (tabla única):
  - `id`
  - `targetSelector[]`
  - `requiredTab`
  - `message` (`title`, `body`)
  - `tooltipPosition` (`top|bottom|subnav|auto`)
  - `advanceOn`:
    - `next-button`
    - `action:<REDUCER_ACTION_TYPE>`
    - `element-click`
    - `auto:<ms>`
  - `scrollTo` (boolean)
  - `spotlight` (boolean)
  - `mobileOffset` (opcional)
  - `skipAllowed` (boolean)

### 3) Sistema de spotlight robusto

1. Resolver beat efectivo y tab requerida.
2. Forzar tab requerida (si no está), esperar montaje estable (`next paint` + `MutationObserver` corto).
3. Resolver target por selector con prioridad (sin fallback silencioso inmediato).
4. Ejecutar scroll (root + contenedores) con presupuesto de tiempo.
5. Esperar estabilidad visual por 2 frames sin delta de rect.
6. Medir rect final y renderizar spotlight.
7. Si falla: estado explícito `spotlightFailed` + CTA alternativo visible (sin freeze).

### 4) Bloqueo de navegación

- Guard central que devuelva:
  - `blocked: boolean`
  - `reasonCode`
  - `requiredTab`
  - `message`
- La bottom nav y controles usan esa respuesta para:
  - estilo bloqueado
  - tooltip/toast inmediato
  - bloqueo funcional coherente

### 5) Mecanismo de avance

- `next-button`:
  - `ACK_ONBOARDING_STEP` directo.
- `action:*`:
  - avance en reducer por `action.type` + validación de payload.
- `element-click`:
  - evitar listeners ad-hoc; usar action dispatch de ese elemento y observar en reducer.
- `auto`:
  - timer persistible (timestamp de inicio + duración), no timer local frágil.

### 6) Mobile vs desktop

- Overlay siempre `position: fixed`.
- Tooltip con flip automático por viewport.
- Mobile:
  - prioridad tercio inferior/medio según safe areas.
  - offsets centralizados en tokens (`--app-header-offset`, `--app-bottom-nav-offset`).
- Desktop:
  - posicionamiento relativo al target con fallback arriba/abajo.

---

## Sección E — Dudas y decisiones (máx 8)

1. ¿Mantener corredor click-through (sí/no)?
   - Opciones: `A) abierto actual`, `B) restringido a target`, `C) mixto por beat`.
   - Recomendación: `C`, y por defecto `B`.
   - Decisión: `B`

2. ¿Cuando falla spotlight, bloquear avance o permitir “Seguir”?
   - Opciones: `A) bloquear`, `B) permitir fallback`, `C) permitir con warning`.
   - Recomendación: `C`.
   - Decisión: `C`

3. ¿Unificar todos los beats info post-echo como popup sin target?
   - Opciones: `A) sí`, `B) no`, `C) solo algunos`.
   - Recomendación: `A`, reduce fragilidad.
   - Decisión: `A`

4. ¿Permitir navegar a tabs informativas (`Mas/System`) durante beats forced?
   - Opciones: `A) sí (actual)`, `B) no`, `C) sí pero sin acciones`.
   - Recomendación: `C`.
   - Decisión: `B`

5. ¿Agregar modo QA “reintentar spotlight” visible?
   - Opciones: `A) sí`, `B) no`.
   - Recomendación: `A`.
   - Decisión: `A`

6. ¿Centralizar copy de onboarding fuera de `getOnboardingStepMeta`?
   - Opciones: `A) archivo único`, `B) mantener inline`.
   - Recomendación: `A` (JSON/JS de copy + schema).
   - Decisión: `A`

7. ¿Persistir `completedBeats` además de `flags`?
   - Opciones: `A) sí`, `B) no`.
   - Recomendación: `A`, facilita migraciones y QA.
   - Decisión: `A`

8. ¿Unificar razón de bloqueo en UI/reducer?
   - Opciones: `A) sí`, `B) no`.
   - Recomendación: `A`, evita no-ops silenciosos.
   - Decisión: `A`

