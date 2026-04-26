# Diseno Entregable 2 - Rediseno Profundo de Itemizacion

Fecha de corte investigacion: 2026-04-25

## 0) Objetivo

Replantear el sistema `extracted item -> blueprint -> charges -> afinidad -> materializacion` con una alternativa de menor carga cognitiva.

Condiciones de exito:

- El jugador pueda extraer un item completo y usarlo rapido.
- El sistema no colapse en un BIS unico y permanente.
- Se mantenga profundidad para jugadores de largo plazo.
- El rediseno sea migrable desde el estado actual del codigo.

---

## 1) Resumen ejecutivo

La propuesta principal es reemplazar el lane actual de blueprints por un sistema de **Arsenal de Reliquias**:

- En extraccion, el jugador rescata un **item completo**.
- Ese item entra al arsenal persistente y se puede equipar en la siguiente run.
- El progreso profundo pasa de "muchas capas de transformacion" a "pocas decisiones de alto impacto":
  - Conservar.
  - Desguazar.
  - Sintonizar para un contexto (boss, abismo, farm, etc).

Para evitar BIS estatico, se aplica un set de guardrails no punitivos:

- Poder contextual (no universal).
- Caps blandos con rendimientos decrecientes.
- Presupuesto de "rolls altos" por pieza.
- Rotacion de presiones de contenido (contratos/mutadores).
- Balance via tuning estacional, no via invalidacion dura de inventario.

---

## 2) Investigacion externa profunda (internet, foros, reddit, reviews)

## 2.1 Hallazgos oficiales (desarrolladores)

1. **Diablo IV (Blizzard) movio complejidad desde el drop hacia crafting**:
   - Redujo cantidad de afijos por item.
   - Explicitamente busco "mas tiempo matando, menos tiempo evaluando loot".
   - Insight util: separar "lectura rapida de upgrade" de "profundidad avanzada". [O1]

2. **Path of Exile (GGG) defendio RNG + dificultad de perfeccion**:
   - Declaro que items perfectos deben ser muy raros.
   - Identifico que crafting muy deterministico vuelve obsoletos otros sistemas.
   - Insight util: no dejar que una sola capa de crafting absorba todo el juego. [O2]

3. **Last Epoch rehizo crafting para bajar frustracion percibida**:
   - Introdujo Forging Potential para dar expectativa clara y evitar "fractura sorpresa".
   - Mantuvo aleatoriedad, pero mejoro legibilidad y control.
   - Insight util: incertidumbre puede existir sin que se sienta injusta u opaca. [O3]

4. **Destiny 2 retiro sunsetting duro por efecto negativo en valor percibido del loot**:
   - "Rewards feel like they have an expiration date".
   - Paso a estrategia de refresh por balance/meta, no por caducar todo.
   - Insight util: evitar invalidacion masiva como mecanismo principal anti-BIS. [O4]

5. **Warframe mantiene flujo blueprint->item final de lectura directa**:
   - Blueprint con materiales y timer claro.
   - Al terminar, se reclama el item ya utilizable.
   - Insight util: simplificar la ruta "quiero esto -> obtengo esto". [O5]

## 2.2 Hallazgos en foros oficiales

1. **Foro oficial de Diablo**:
   - Queja recurrente: fatiga mental por leer demasiadas variantes de stats.
   - Queja recurrente: exceso de pasos para optimizar una sola pieza endgame.
   - Insight util: demasiadas micro-capas convierten itemizacion en chore. [F1][F2]

2. **Foro oficial de Last Epoch**:
   - Feedback mixto: sistema gusta, pero se discute friccion de potencial de forja y RNG de costos.
   - Insight util: aun con buen sistema, sin predictibilidad minima vuelve a sentirse azar puro. [F3][F4]

## 2.3 Hallazgos en reddit (no oficial)

1. **r/diablo4**:
   - Alta frecuencia de posts historicos sobre "too many affixes" y dificultad para evaluar upgrades.
   - Insight util: saturacion de variables rompe flujo de combate. [R1]

2. **r/pathofexile**:
   - Debate continuo entre determinismo y preservacion del chase.
   - Insight util: extremos fallan en distinto publico; hay que disenar zona intermedia. [R2]

3. **r/LastEpoch**:
   - Se valora que crafting sea util sin abrir 10 herramientas externas.
   - Se reconoce RNG en techo de perfect item.
   - Insight util: onboarding suave + techo largo funciona mejor que complejidad frontal. [R3]

4. **r/Warframe**:
   - Modding es poderoso pero para nuevos jugadores puede ser opaco.
   - En discusiones de "best weapons" emerge contexto y sinergia como criterio real.
   - Insight util: declarar contexto reduce fantasia de BIS universal. [R4][R5]

## 2.4 Reviews y senales de mercado

1. **PC Gamer (Last Epoch review)**:
   - Resalta peso de crafting/trading en la experiencia central.
   - Insight util: cuando item systems son columna vertebral, UX de decision importa mas que cantidad de subsistemas. [V1]

2. **Steam (Last Epoch)**:
  - Base de resenas amplia y mayormente positiva en historico.
   - Insight util: hay demanda real para ARPG con crafting claro y loot filter fuerte. [V2]

3. **Metacritic (Diablo IV user score)**:
   - Polarizacion alta y feedback historico duro en itemizacion.
   - Insight util: problemas de legibilidad de loot impactan narrativa publica del producto. [V3]

## 2.5 Conclusiones de investigacion aplicables al IdleRPG

- La carga cognitiva no se reduce quitando profundidad, sino moviendo profundidad al lugar correcto.
- El anti-BIS sano no invalida inventarios completos cada poco tiempo.
- La experiencia post-run debe parecer "cosecha y decision", no "tramite multi-panel".
- Si hay 5+ capas para convertir un drop en valor, la mayoria no internaliza el sistema.

---

## 3) Diagnostico del sistema actual en este proyecto

Estado actual (resumen del codigo y docs existentes):

- Extraccion ofrece item candidato.
- Ese item pasa por decision blueprint/desguace.
- Blueprint guarda capas (familias, afinidad, niveles, tune, ascension).
- En run se materializa con re-roll parcial de afijos.

Problemas de diseno detectados:

1. **Cadena larga de conversion**:
   - El jugador no siente "me lleve este item", siente "inicie un proceso".

2. **Costo de comprension alto**:
   - `extracted item`, `blueprint`, `family charges`, `affinity`, `materialization count` compiten por atencion.

3. **Riesgo de BIS por inversion acumulada**:
   - Cuando una pieza concentra demasiada inversion, se vuelve dificil reemplazarla sin dolor.

4. **Feedback diferido**:
   - Muchas decisiones dan resultado util recien varias sesiones despues.

5. **Onboarding tardio pesado**:
   - Cuando se desbloquean estaciones, el jugador tiene que entender varias economias simultaneas.

---

## 4) Principios de rediseno (obligatorios)

1. **Drop legible en 3-5 segundos**:
   - "Me sirve ahora / me sirve luego / no me sirve".

2. **Una decision post-run principal**:
   - Evitar embudos de 3 overlays consecutivos.

3. **Profundidad en capas opcionales**:
   - Base simple, mastery avanzada.

4. **Anti-BIS por contexto, no por castigo**:
   - Evitar sunsetting agresivo.

5. **Preservar fantasia de mejora permanente**:
   - El jugador no puede sentir que todo progreso se evapora sin agencia.

---

## 5) Propuesta principal: Sistema de Arsenal de Reliquias (item completo)

## 5.1 Flujo de jugador

### Post-run (Extraccion)

El jugador elige 1 de 3 opciones sobre un item elegible:

1. **Conservar como Reliquia**
   - Entra al arsenal persistente.
   - Disponible para equipar en siguiente run.

2. **Desguazar**
   - Retorna recursos inmediatos (`essence`, `relicDust`, `sigilFlux` segun rareza/tier).

3. **Archivar para fusion futura** (opcional desbloqueable)
   - Item queda bloqueado como material de combinacion avanzada.

### Pre-run

- Equipas reliquia directamente (sin materializacion adicional de blueprint).
- Opcional: asignas una **Sintonia de contexto**.

## 5.2 Modelo de datos recomendado

```txt
relic {
  id
  sourceItemId
  slot (weapon/armor)
  rarity
  itemTier
  baseStats
  affixes[]
  legendaryPowerId?
  contextAttunement (none|boss|horde|abyss|farm|speed)
  temperLevel (0..N)
  masteryLevel (0..N)
  entropy (0..100)
  createdAt
}
```

## 5.3 Acciones sobre reliquia

1. **Temperar**:
   - Sube potencia general y un afijo destacado cada cierto breakpoint.
   - Incrementa `entropy`.

2. **Reajustar un afijo**:
   - Reroll acotado de 1 afijo por ciclo de mantenimiento.

3. **Sintonizar contexto**:
   - Asignar tag de contenido (boss, abismo, etc).
   - Da bonus significativo solo en ese contexto.

4. **Desmontar reliquia**:
   - Recupera fraccion de inversion + materiales.

## 5.4 Que sale del core loop

Para bajar carga cognitiva de base:

- Sale del loop base:
  - `family charges` como requisito central.
  - Afinidad primaria/secundaria como paso obligatorio.
  - Materializacion por semilla cada inicio de run.

- Queda como capa avanzada opcional (futuro):
  - Sistema de afinidades, pero encima de reliquias ya usables.

---

## 6) Anti-BIS: como evitar "best in slot" unico y eterno

## 6.1 Pilar A - Poder contextual

Una reliquia sintonizada a `boss` no rinde igual en `horde`.

Efecto:

- Se vuelve valioso tener 2-4 piezas por rol.
- Se reduce dominancia de un unico item universal.

## 6.2 Pilar B - Caps blandos y rendimientos decrecientes

No prohibir stats altos; hacer que cada punto extra rinda menos despues de un umbral.

Efecto:

- Menos gap entre item casi-perfecto y perfecto.
- Menos presion por chase imposible.

## 6.3 Pilar C - Presupuesto de afijos premium

Cada reliquia tiene "budget" de afijos top.

Ejemplo:

- Puedes tener 1 afijo top + 2 medios, o 3 medios.
- No puedes tener 4 top al maximo en la misma pieza.

Efecto:

- Se fuerzan trade-offs reales.
- Se evita convergencia de todos a la misma pieza ideal.

## 6.4 Pilar D - Rotacion de demanda de contenido

Contratos semanales + mutadores de abismo empujan necesidades distintas.

Efecto:

- Cambia lo "mejor" segun semana/ciclo.
- Se incentiva arsenal variado.

## 6.5 Pilar E - Entropy para upgrades, no para uso

`entropy` solo afecta costo/chance de seguir mejorando.
No reduce poder del item que ya tienes.

Efecto:

- Anti power-creep infinito sin castigar uso.
- Evita sensacion de "me vencio el item".

## 6.6 Pilar F - Balance frecuente de outliers

Si una combinacion rompe meta:

- Nerf puntual de outlier.
- Buff de alternativas.

No:

- Caducar toda una generacion de items.

---

## 7) Economia y progreso con la propuesta

## 7.1 Sources / sinks simplificados

| Recurso | Source principal | Sink principal |
|---|---|---|
| essence | combate, destileria, goals | reroll/reajuste afijo |
| relicDust | bosses, destileria, weekly | temperar reliquias |
| sigilFlux | altar/destileria/encargos | sintonia contextual |
| echoes | prestige/extraccion | arbol de ecos |
| codexInk | codex/destileria | bonus de hunt board |

## 7.2 Decision post-run en una pantalla

Cada opcion muestra:

- Ganancia inmediata.
- Ganancia de mediano plazo.
- Recomendacion del sistema (explicable y no obligatoria).

---

## 8) Plan de migracion desde el estado actual del codigo

## 8.1 Fase 0 - Instrumentacion (1 sprint)

- Medir tiempos y friccion actual:
  - tiempo en overlay de extraccion,
  - tasa de conversion a blueprint,
  - abandono post-extraccion.

Impacto en codigo:

- `src/engine/sanctuary/extractionEngine.js`
- `src/utils/runTelemetry.js`
- `src/state/reducerDomains/extractionResolutionReducer.js`

## 8.2 Fase 1 - Modo dual (2 sprints)

- Introducir `reliquias` en paralelo a blueprints.
- Flag por perfil para comparar cohorts.

Impacto:

- Nuevo estado `sanctuary.relicArmory`.
- UI en `ExtractionOverlay` y `Inventory`.

## 8.3 Fase 2 - Cutover de default (1 sprint)

- Nuevo default para cuentas nuevas: reliquias.
- Cuentas viejas:
  - migracion de blueprint activo -> reliquia equivalente por slot.

## 8.4 Fase 3 - Retiro de deuda (1-2 sprints)

- Congelar rutas de blueprint no usadas.
- Mantener migrador de compatibilidad para saves antiguos.

---

## 9) KPIs de validacion

## 9.1 KPIs de comprension y friccion

- `median_extraction_decision_time`:
  - objetivo: -35% vs baseline.

- `first_session_item_keep_rate`:
  - objetivo: +20% (mas jugadores entienden "me quedo item").

- `post_run_overlay_dropoff`:
  - objetivo: -25%.

## 9.2 KPIs de anti-BIS

- `top_1_item_concentration` (uso del item mas usado en top clears):
  - objetivo: <35% por slot.

- `unique_relics_used_per_10_runs`:
  - objetivo: >3 en midgame, >4 en endgame.

- `context_attunement_diversity`:
  - objetivo: al menos 3 contextos usados por semana en cohort endgame.

## 9.3 KPIs de salud economica

- inflacion de `relicDust` y `essence`.
- tasa de desguace vs conservacion.
- tiempo medio para primera reliquia "alta" sin pagar costo excesivo de grind.

---

## 10) Riesgos y mitigaciones

1. **Riesgo: simplificar demasiado y perder profundidad**
   - Mitigacion: capa avanzada desbloqueable (sintonia + mantenimiento + fusion).

2. **Riesgo: jugadores actuales sientan perdida de progreso blueprint**
   - Mitigacion: migracion generosa (reliquias equivalentes + pack de materiales).

3. **Riesgo: nuevo BIS emerge igual por matematica**
   - Mitigacion: caps blandos, presupuesto premium, mutadores y tuning rapido.

4. **Riesgo: economia se desbalancea por desguace mas simple**
   - Mitigacion: tabla de retornos por rareza/tier + caps semanales suaves en conversiones.

---

## 11) Recomendacion final

Implementar **Arsenal de Reliquias** como camino principal.

Razon:

- Es el unico cambio que reduce carga cognitiva de forma estructural (no cosmetica).
- Responde al ejemplo que planteaste: "extraer item completo y listo".
- Permite anti-BIS robusto sin repetir errores de invalidez dura vistos en otros juegos.
- Es migrable por fases sin romper de golpe el save system.

---

## 12) Apendice de fuentes

## 12.1 Fuentes oficiales

- [O1] Blizzard News - Diablo IV Season 4 Loot Reborn (itemizacion simplificada, complejidad movida a crafting): https://news.blizzard.com/en-us/article/24077223/galvanize-your-legend-in-season-4-loot-reborn
- [O2] Path of Exile Development Manifesto - Harvest Crafting (filosofia RNG, items perfectos casi imposibles): https://www.pathofexile.com/forum/view-thread/3069670
- [O3] Last Epoch Developer Blog 0.8.4 (Forging Potential, clearer expectations, less frustration): https://forum.lastepoch.com/t/crafting-changes-coming-to-eternal-legends-update-0-8-4/45597
- [O4] Bungie - Destiny 2021 Update: The Road to The Witch Queen (retiro de infusion caps por expiracion percibida del loot): https://www.bungie.net/7/en/News/article/50124
- [O5] Warframe Support - Foundry and Crafting FAQ (flujo blueprint->item final claro): https://support.warframe.com/hc/en-us/articles/38385820873741-Foundry-and-Crafting-FAQ

## 12.2 Foros oficiales

- [F1] Diablo forum - "mental fatigue" por item stats: https://us.forums.blizzard.com/en/d4/t/1-problem-with-d4-itemization-and-not-how-you-think/133061
- [F2] Diablo forum - "too many optimization steps" endgame (2026): https://us.forums.blizzard.com/en/d4/t/endgame-itemization-specifically-reforging-is-the-wrong-direction/239476
- [F3] Last Epoch forum - Forging potential issue (2025): https://forum.lastepoch.com/t/forging-potential-issue/75076
- [F4] Last Epoch forum - The crafting problem (2025): https://forum.lastepoch.com/t/the-crafting-problem/78695

## 12.3 Reddit (no oficial)

- [R1] r/diablo4 - "too many affixes": https://www.reddit.com/r/diablo4/comments/11xh5aj
- [R2] r/pathofexile - debate determinismo vs vision del juego: https://www.reddit.com/r/pathofexile/comments/x393ef
- [R3] r/LastEpoch - crafting comparado con PoE: https://www.reddit.com/r/LastEpoch/comments/oo0rkc
- [R4] r/Warframe - problemas de mod screen para nuevos: https://www.reddit.com/r/Warframe/comments/x43v3l
- [R5] r/Warframe - "best weapons" y dependencia de contexto/sinergia: https://www.reddit.com/r/Warframe/comments/1kyxs67

## 12.4 Reviews

- [V1] PC Gamer - Last Epoch review (peso de crafting/trading): https://www.pcgamer.com/last-epoch-review/
- [V2] Steam Store - Last Epoch reviews agregadas: https://store.steampowered.com/app/899770/Last_Epoch/Rev
- [V3] Metacritic - Diablo IV user reviews (senal de polarizacion): https://www.metacritic.com/game/diablo-iv/user-reviews/
