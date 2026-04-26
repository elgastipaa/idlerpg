# Diseno Entregable - Auditoria Profunda

## Contexto y asunciones
- Base usada: codigo actual en `src/` (estado, loop, combate, Santuario, overlays, onboarding, economia, progression, telemetria).
- Asuncion A1: `src/data/events.js` no esta conectado al runtime de combate (no hay consumo en engine), por lo que se considera sistema no activo.
- Asuncion A2: la itemizacion anterior queda como capa legacy de compatibilidad en saves viejos, pero el loop de diseno activo migra a `relicArmory/extractedItems`.
- Asuncion A3: el objetivo es MVP releaseable single-player con foco mobile+desktop, no live-ops full ni multiplayer.

---

## FASE 1 - Comprension del juego actual

## 1) Loop completo de una sesion hoy

### 1.1 Entrada y carga de estado
- Se hidrata save con `mergeStateWithDefaults`.
- Se normaliza: player, codex, abyss, prestigio, onboarding, jobs, relicArmory/activeRelics, tabs, telemetria, weekly ledger.
- Se aplican guardrails de corrupcion y recovery.

### 1.2 Inicio de expedicion
- Si no hay clase: `ENTER_EXPEDITION_SETUP` abre setup y fuerza selector de clase.
- Si hay clase: `ENTER_EXPEDITION_SETUP` entra a setup de run (`pendingRunSetup: true`).
- Si hay run sigils desbloqueados (prestige >= 1), el jugador elige sesgo de run en overlay.
- `START_RUN`:
  - Consume infusiones de sigilo aplicables.
  - Materializa reliquias activas (weapon/armor) para esa run.
  - Limpia inventario de run, setea enemigo T1, resetea run stats.

### 1.3 Combate (auto-loop por tick)
- Tick base cada 1s.
- Combate automatico, con decisiones de jugador en paralelo:
  - Toggle auto-advance.
  - Equipar, vender, extraer, craftear.
  - Ajustar talentos/stats.
  - Elegir momento de extraccion.
- Muerte:
  - Si caes: vuelves a Tier 1, revive parcial y la expedicion continua.
  - No hay contador de vidas ni extraccion de emergencia.

### 1.4 Cierre de run por extraccion
- `OPEN_EXTRACTION` arma preview:
  - Cargo bundles posibles.
  - Item rescatable (si habilitado).
  - Ecos potenciales de salida voluntaria.
- La extraccion es siempre voluntaria:
  - Ya no existe extraccion de emergencia.
  - Si mueres en combate, vuelves a Tier 1 y reintentas dentro de la misma expedicion.
- `CONFIRM_EXTRACTION`:
  - Lleva bundles al Santuario.
  - Opcionalmente retiene item como `extractedItem`.
  - Si aplica prestige: reset duro de run/clase con entrega de Ecos.
  - Si no aplica prestige: vuelve a Santuario sin prestige.

### 1.5 Santuario (meta-loop)
- Procesa recursos asinc:
  - Laboratorio (desbloqueos/capacidad/eficiencia).
  - Destileria (bundle -> recursos).
  - Biblioteca (research de familias/bosses/poderes).
  - Encargos (equipos paralelos con rewards).
  - Altar de Sigilos (cargas de infusion para runs futuras).
  - Arsenal de Reliquias (equipo persistente, sintonia contextual, mantenimiento).
- Reclama jobs, invierte recursos, prepara siguiente run.

### 1.6 Cierre/salida y offline
- Se guarda estado con throttle + idle save.
- A la vuelta aplica simulacion offline en chunks.
- Hay runtime guards para reparar estados congelados.

---

## 2) Recursos: que los genera, que los consume, rol economico

| Recurso | Sources | Sinks | Rol en economia |
|---|---|---|---|
| Oro | Kills, logros, goals/weekly, venta | Player upgrades, upgrade de items | Combustible rapido de run |
| XP | Kills | Subir nivel (indirecto) | Ritmo base de poder |
| Esencia | Kills, auto-extract, goals/weekly, Destileria (`essence_cache`) | Reroll, polish, reforge, ascend, research Lab | Moneda de calidad/crafting |
| Talent Points | Leveling, rewards puntuales | Talentos | Identidad de build en run |
| Ecos | Extraccion con prestige | Nodos de arbol de Ecos | Meta-progreso de cuenta |
| Codex Ink | Destileria (`codex_trace`), Encargos | Research de Biblioteca, Lab research | Moneda de conocimiento |
| Sigil Flux | Destileria (`sigil_residue`), Encargos | Infusiones en Altar, sintonia contextual de reliquias | Preparacion de run futura |
| Relic Dust | Destileria (`relic_shard`), Encargos, codex rewards puntuales | Lab, Biblioteca, temper/estabilizacion de reliquias | Moneda premium de meta |
| Cargo bundles | Extraccion | Destileria | Puente run -> meta |
| Extracted Items | Extraccion | Conservar como reliquia o desguazar | Materia prima persistente |
| Reliquias (Arsenal) | Conservar en extraccion, migracion legacy | Equipar, sintonizar, estabilizar o desmontar | Sesgo de build persistente por contexto |
| Sigil Infusion charges | Claims de Altar | Se consumen al iniciar run (si sigilo matchea) | Meta-buffer tactico |
| Codex progress (familia/boss/poder) | Kills, drops, duplicados | Se "fija" con research jobs | Convertir historial en bonus permanentes |

Notas:
- Hay doble economia: run (oro/xp/esencia) y meta (ink/flux/dust/reliquias/ecos).
- El puente critico del juego es Extraccion + Destileria + Laboratorio.

---

## 3) Sistema de Reliquias (Arsenal) y sesgo de progresion

### Flujo
- En extraccion, el jugador puede retener 1 item elegible como `extractedItem`.
- Ese item puede:
  - Conservarse como reliquia completa (usable en la siguiente run).
  - Desguazarse (retorno inmediato en recursos).
- La decision de item se toma dentro del overlay de extraccion:
  - El retorno de recursos se muestra solo cuando esta seleccionada la opcion de desguace.
  - Si el stash del Santuario esta lleno, conservar no guarda la pieza y la salida cae en desguace automatico.
- Reliquia guarda:
  - Slot (weapon/armor), rareza, rating, item tier y afijos.
  - Contexto de sintonia (boss/horde/abyss/farm/speed).
  - Niveles de mantenimiento (`temper/mastery`) y `entropy`.
- En `START_RUN`, reliquias activas se materializan como equipo de run sin lane intermedio adicional.

### Como sesga la progresion
- Cambia el paradigma de "drop transitorio" a "drop utilizable y persistente":
  - El item rescatado mantiene identidad y entra directo al loadout.
- Convierte loot bueno en inversion de cuenta.
- Sostiene progreso horizontal via contextos y rotacion de contenido, incluso con mala suerte de drop en runs cortas.

### Riesgo actual
- Si el jugador no entiende la diferencia entre "retorno inmediato" y "valor de largo plazo", siente sistema opaco.
- Sin feedback claro de contexto y entropy, el jugador puede caer en "BIS unico" percibido.

---

## 4) Arbol de Ecos y relacion con runs

### Como se obtiene Ecos
- Solo via extraccion que convierte a prestige.
- Ganancia depende de:
  - Tier maximo, nivel maximo, bosses en ciclo.
  - Multiplicadores de run sigil.
  - Multiplicador de momentum segun comparacion con best historic tier.

### Como impacta en runs
- Compra de nodos permanentes de poder/economia/crafting/abismo.
- Resonance por `totalEchoesEarned` agrega escalado permanente con rendimientos decrecientes.
- Desbloquea run sigils (prestige >= 1) y potencia decisiones pre-run.

### Relacion de diseno
- Run -> Extraccion -> Ecos -> Nodos -> Run mas fuerte.
- Es el "motor meta" principal del juego.

---

## 5) Decisiones reales del jugador hoy

## Pre-run
- Clase/spec (cuando aplica).
- Sigilo(s) de run (si desbloqueado).
- Equipar reliquias activas por slot.
- Uso de cargas de infusion (indirectamente via eleccion de sigilo).

## Durante run
- Auto-advance ON/OFF.
- Timing de crafting.
- Equipar vs vender vs extraer.
- Extraer temprano para asegurar valor vs seguir push.

## Post-run (extraccion)
- Que bundles rescatar.
- Que item retener.
- Confirmar salida ahora o seguir en riesgo.

## Santuario
- Que research iniciar primero.
- Que jobs correr por slots limitados.
- Conservar/desguazar item extraido y decidir sintonia contextual.
- Donde gastar dust/ink/flux y que reliquias mantener.

---

## 6) Donde el juego espera al jugador sin darle mucho para hacer

- Timers largos con pocos slots:
  - Lab research (10-30m),
  - Biblioteca (10m-3h),
  - Altar (2h-12h),
  - Encargos (15m-4h),
  - Destileria (20m-60m).
- Cuando no hay recursos para iniciar jobs, el jugador solo puede volver a run.
- Muchos pasos de UI para acciones simples (especialmente en overlays de estacion).
- Overhead cognitivo alto en onboarding tardio por densidad de conceptos.
- Pocos eventos de "decision de alto valor" durante el tiempo muerto de jobs.

---

## FASE 2 - Benchmarking de referentes

## Lectura por referente (mecanica, psicologia, encaje)

| Referente | Mecanica util | Por que funciona psicologicamente | Encaje con loop actual |
|---|---|---|---|
| Diablo 3 | Temporadas | Reinicio con objetivo claro + novedad periodica | Encaja con adaptacion (mini-temporadas livianas, no full reset global) |
| Diablo 3 | Greater Rifts | Escalada limpia, objetivo medible, mastery loop | Encaja (Abismo ya es base para esto) |
| Diablo 3 | Paragon | Progreso siempre util, anti-frustracion | Encaja (resonance de Ecos ya cumple parte) |
| Diablo 3 | Sets definidos | Fantasia de build cerrada y perseguible | Encaja con adaptacion (loadouts de reliquias + codex) |
| Diablo 4 | Masterworking | Inversion incremental sobre pieza favorita | Encaja (temper/mantenimiento de reliquias) |
| Diablo 4 | Reroll de afijos | Control parcial del RNG | Encaja (ya existe en crafting) |
| Diablo 4 | Pit escalable | Endgame con stress test progresivo | Encaja (Abismo puede formalizarse asi) |
| Diablo Immortal | Ciclos semanales de poder | Retencion por ritual recurrente | Encaja con adaptacion (weekly ledger ya existe) |
| Diablo Immortal | Helliquary co-op | Social accountability + metas de grupo | No encaja (MVP actual es single-player) |
| Path of Exile 1 | Atlas (mapa endgame) | Macro-eleccion de ruta y agencia alta | Encaja con adaptacion (board de contratos de run) |
| Path of Exile 1 | Crafting profundo por monedas | Meta de dominio largo | Encaja con adaptacion (sin complejidad extrema en MVP) |
| Path of Exile 1 | Ligas | Renovacion de metajuego | Encaja con adaptacion |
| Path of Exile 1 | Trade economy | Meta social y valor de mercado | No encaja (rompe alcance MVP y balance actual) |
| Path of Exile 2 | Pace mas lento/intencional | Mejora legibilidad y valor de decision | Encaja con adaptacion (micro-pausas de decision claras) |
| Last Epoch | Monolith | Selector de eco con riesgo/recompensa | Encaja (expedicion contracts) |
| Last Epoch | Forge deterministica | Sensacion de control justo | Encaja fuerte (alineado a mantenimiento de reliquias) |
| Last Epoch | Cycle content | Freshness sin romper base | Encaja con adaptacion |
| Grim Dawn | Facciones duales con consecuencias | Compromiso y sacrificio significativo | Encaja con adaptacion (Encargos por faccion) |
| Grim Dawn | Devotion tree | Meta-build transversal | Encaja (Prestige tree + nodos situacionales) |
| Grim Dawn | Componentes | Progresion modular, goals intermedios | Encaja con adaptacion |
| Warframe | Extraction + Foundry | Loop de "run alimenta fabrica" muy adictivo | Encaja con adaptacion (run alimenta arsenal persistente) |
| Warframe | Mastery loop | Meta de cuenta de largo plazo | Encaja con adaptacion (mastery de codex/abyss) |
| Warframe | Mods/build | Personalizacion profunda | Encaja con adaptacion (talentos+sigilos+reliquias) |
| Melvor Idle | Skills paralelas offline | Sensacion de progreso continuo sin friccion | Encaja fuerte (jobs del Santuario) |
| Melvor Idle | Log de actividad | Feedback concreto de tiempo invertido | Encaja (telemetria ya existe, falta UI) |
| IdleOn | Multi-personaje por roles | Multiplica agencia asincrona | Encaja con adaptacion parcial (Encargos como proxy) |
| Idle Skilling | Prestigios anidados | "Reset con sentido" en capas | Encaja con adaptacion (Ecos + Abismo) |
| Tap Titans 2 | Artefactos RNG meta | Sorpresa + chase de build | Encaja con adaptacion (drops codex/power milestones) |
| Tap Titans 2 | Torneos/rankings | Competencia social recurrente | No encaja en MVP single-player |
| AFK Arena | Sinergias de composicion | Decisiones tacticas de equipo | Encaja con adaptacion (sigilo+reliquia+talento como composicion) |
| AFK Arena | Catch-up | Evita abandono temprano/tardio | Encaja fuerte |
| OSRS | Drop tables profundas | Goals visibles de largo plazo | Encaja con adaptacion |
| OSRS | Diary/achievements largos | Checklists de progreso persistente | Encaja (goals + weekly) |
| WoW | Weekly lockouts | Ritmo saludable de consumo de contenido | Encaja con adaptacion |
| WoW | Tier set bonuses | Picos de poder por set | Encaja con adaptacion (contextos de reliquia/codex) |
| Rune Factory | Vida+combate+craft integrados | Variedad diaria y menor fatiga | Encaja con adaptacion (Santuario como segunda capa jugable) |
| Genshin | Resin gate | Control de economia y sesion | Encaja con adaptacion cuidadosa (sin volverlo punitivo) |
| Genshin | Artefacto RNG capado | Chase con limites | Encaja con adaptacion |
| Black Desert | Enhancing con riesgo | Tension alta y peaks emocionales | Encaja con adaptacion suave (modo riesgo opcional, no base) |
| Black Desert | AFK lifeskills | Retencion pasiva | Encaja (ya presente via jobs) |

### Referentes extra recomendados
- Hades:
  - Mecanica: boons con elecciones de run muy legibles.
  - Por que: da agencia fuerte cada 1-2 minutos.
  - Encaje: Encaja con adaptacion (cartas de contrato/encuentro en expedicion).
- Vampire Survivors:
  - Mecanica: feedback visual brutal + decisiones simples de alto impacto.
  - Por que: recompensa inmediata y lectura instantanea.
  - Encaje: Encaja con adaptacion (claridad de milestones y drops en combate).

---

## FASE 3 - FODA completo

## Fortalezas
- Loop run -> extraccion -> Santuario -> run ya esta implementado y funciona como columna vertebral.
- Sistema de reliquias extraidas da identidad propia frente a otros idle looters.
- Meta dual bien definida: poder de run y progreso persistente de cuenta.
- Sistemas de estaciones ya existen y se conectan entre si por recursos.
- Arbol de Ecos con ramas por clase + universal + abismo da espacio de buildcraft largo.
- Guardrails de estado y telemetria son superiores al promedio de proyectos indie de este scope.
- Onboarding ahora esta centralizado en copy/meta y no disperso en cada componente.

## Debilidades
- Exceso de tiempo muerto por timers largos y slots limitados.
- Muchas decisiones son "falsas": el orden de unlocks y muchos claims son casi obligatorios.
- UI de estaciones puede sentirse densa y de alto costo de clicks en mobile.
- Biblioteca/Arsenal de Reliquias tienen curva cognitiva alta para un jugador nuevo.
- Falta de "metas de run declaradas": hoy hay push difuso, no contrato explicito.
- Economias paralelas son buenas, pero falta tabla de conversion clara para jugador.
- Parte del contenido esta subutilizado o desconectado (ejemplo `events.js`).
- Endgame puede sentirse lineal si Abismo no agrega variacion de reglas real.

## Oportunidades
- Formalizar contratos de expedicion con risk/reward antes de cada run.
- Convertir weekly ledger en pilar de rutina semanal real.
- Integrar catch-up dinamico usando telemetria ya disponible.
- Reforzar Codex como objetivo activo de caza, no solo panel de progreso.
- Hacer jobs mas "chunked" (recompensa intermedia) para reducir abandono.
- Consolidar UI shell de estaciones para cohesion y menor friccion.
- Usar removal selectivo de capas redundantes para ganar claridad.

## Amenazas
- Si los timers dominan sobre decisiones, cae la retencion (sensacion de espera pasiva).
- Si no se controla inflacion de esencia/dust, se rompe el valor del loot.
- Si hay estados congelados o saltos de fase, se rompe confianza en progreso.
- Si onboarding tardio sigue cargado, frena adopcion de sistemas clave.
- Si se agregan sistemas nuevos sin quitar redundancias, aumenta deuda UX.
- Si Abismo no ofrece reglas nuevas y solo numeros mas altos, se agota rapido.

---

## FASE 4 - Las 10 intervenciones prioritarias

## 1. Contratos de Expedicion (pre-run intent)
- Sistema: loop de run + extraccion.
- Problema: hoy el jugador "sale a correr" sin objetivo declarado.
- Inspiracion: Greater Rifts (D3), Monolith (Last Epoch), Hades.
- Implementacion:
  - Antes de `START_RUN`, elegir 1 contrato entre 3 (Push / Hunt / Forge).
  - Cada contrato altera 1-2 multiplicadores y define bonus de cierre.
  - Reusar run sigils y extraction preview para evitar sistemas nuevos pesados.
- Impacto esperado: sube agencia por run y mejora claridad de decision.
- Esfuerzo: Medio.
- Riesgo: superposicion con sigilos.
- Mitigacion: contrato define objetivo de run; sigilo define sesgo numerico.

## 2. Job Chunking y Claim Intermedio
- Sistema: Santuario (jobs largos).
- Problema: timers largos generan desconexion.
- Inspiracion: Melvor, idle hybrids.
- Implementacion:
  - Jobs >60m generan 1 hito intermedio reclammable.
  - Ejemplo: infusion de 12h da micro-reward a las 6h.
  - Sin aumentar output total, solo redistribuir entrega.
- Impacto esperado: reduce abandono por espera, mas check-ins.
- Esfuerzo: Medio.
- Riesgo: inflar ritmo economico.
- Mitigacion: dividir recompensa total, no duplicar.

## 3. Prioridad de estaciones por "valor/minuto"
- Sistema: Lab + estaciones.
- Problema: orden actual puede sentirse obligado y opaco.
- Inspiracion: WoW weekly objective framing.
- Implementacion:
  - Mostrar score simple de ROI por accion de estacion.
  - Etiquetas: "Rinde ahora", "Rinde luego", "Solo preparacion".
  - No bloquea decisiones, solo clarifica costo de oportunidad.
- Impacto esperado: menos decision falsa, mejor aprendizaje.
- Esfuerzo: Bajo-Medio.
- Riesgo: sobre-tutorializar.
- Mitigacion: UI compacta en chips, no texto largo.

## 4. Lane de Reliquias claro (Inmediato vs Largo Plazo)
- Sistema: extracted item -> conservar/desguazar/sintonizar.
- Problema: confusion entre retorno instantaneo y valor persistente inmediato.
- Inspiracion: Warframe foundry + Last Epoch deterministic bias.
- Implementacion:
  - Modal de decision con comparativa corta:
    - Conservar: equipable en siguiente run.
    - Desguazar: retorno inmediato de recursos.
    - Sintonizar (si aplica): bonus fuerte en contexto especifico.
  - Mostrar delta tangible: rating/contexto/entropy vs recursos por desguace.
- Impacto esperado: reduce friccion cognitiva y errores de eleccion.
- Esfuerzo: Bajo.
- Riesgo: ruido de UI.
- Mitigacion: max 3 lineas por opcion.

## 5. Codex Hunt Board activo
- Sistema: Biblioteca + combate.
- Problema: codex se percibe pasivo.
- Inspiracion: OSRS diaries + D4 target-farm behavior.
- Implementacion:
  - Elegir 1 target de familia y 1 de boss antes de run.
  - Bonus de progreso codex para esos targets por run.
  - Integrar en Expedition UI, no en pantalla separada pesada.
- Impacto esperado: objetivos claros y mejor uso de codex.
- Esfuerzo: Medio.
- Riesgo: romper balance de progreso codex.
- Mitigacion: caps por run y diminishing returns.

## 6. Abismo con mutadores "de eleccion" y no solo de escalado
- Sistema: Abismo/endgame.
- Problema: riesgo de endgame lineal por solo +numeros.
- Inspiracion: PoE map mods, D4 pits.
- Implementacion:
  - En entrada de ciclo Abismo, elegir 1 de 2 mutadores.
  - Mutador da penalidad + bonus de recompensa.
  - Reusar estructura existente de `abyssMutators`.
- Impacto esperado: alta rejugabilidad y agencia endgame.
- Esfuerzo: Medio-Alto.
- Riesgo: combinaciones rotas.
- Mitigacion: lista curada y bloqueos por tag.

## 7. Catch-up dinamico por estancamiento real
- Sistema: economia/meta progression.
- Problema: si jugador se queda atras, frena fuerte.
- Inspiracion: AFK Arena/WoW catch-up.
- Implementacion:
  - Si no mejora maxTier X sesiones, activar bonus temporal moderado.
  - Bonus solo en recursos meta bajos (ink/flux) o ecos minimos.
  - Telemetria ya existe para medir estancamiento.
- Impacto esperado: menor churn por pared dura.
- Esfuerzo: Medio.
- Riesgo: trivializar dificultad.
- Mitigacion: bonus acotado, temporal y decreciente.

## 8. Weekly Ledger como loop principal semanal
- Sistema: goals/weekly.
- Problema: hoy existe pero puede quedar secundario.
- Inspiracion: weekly lockouts sanos (WoW).
- Implementacion:
  - 3 contratos semanales visibles en Santuario.
  - Recompensas orientadas a desbloqueos de estacion y codex.
  - Boton unico "Reclamar semanal".
- Impacto esperado: rutina clara de retorno semanal.
- Esfuerzo: Bajo-Medio.
- Riesgo: checklist tedioso.
- Mitigacion: objetivos amplios y compatibles con loop normal.

## 9. Compactacion UX de overlays por patron unico
- Sistema: UX/UI estaciones.
- Problema: variabilidad de layout y exceso de scroll/click en algunos flows.
- Inspiracion: mobile-first live-service panels.
- Implementacion:
  - Header unico de estacion + secciones con selector horizontal.
  - Regla: una sola capa expandida por defecto, pero no todo colapsado.
  - CTA de accion principal siempre en zona de pulgar.
- Impacto esperado: menos friccion y mayor velocidad operativa.
- Esfuerzo: Medio.
- Riesgo: ocultar demasiado.
- Mitigacion: defaults inteligentes + resumen visible siempre.

## 10. Recorte de sistemas redundantes/no activos
- Sistema: producto y deuda.
- Problema: complejidad crece por capas redundantes y data no usada.
- Inspiracion: enfoque MVP estricto.
- Implementacion:
  - Marcar y congelar sistemas no conectados (ej: events runtime).
  - Eliminar bloques de UI duplicados que repiten estado.
  - Dejar backlog explicitamente fuera del MVP.
- Impacto esperado: menor deuda, menos bugs, mejor foco.
- Esfuerzo: Bajo-Medio.
- Riesgo: eliminar algo que parecia util.
- Mitigacion: feature flags + checklist de dependencia antes de quitar.

---

## FASE 5 - Definicion del MVP final

## Vision en una oracion
Un idle ARPG de extraccion para jugadores que disfrutan optimizar builds y convertir cada run en progreso persistente de cuenta via Santuario.

## Loop completo del MVP (sesion ideal)
1. Entras, reclamas jobs listos y ajustas una inversion rapida del Santuario.
2. Defines objetivo de run (contrato), eliges sigilo y sales.
3. Combate auto con decisiones tacticas (push/craft/extraccion timing).
4. Cierras run con extraccion: bundles + decision de item.
5. Si aplica, conviertes a Ecos y reinicias con ventaja real.
6. En Santuario transformas recursos en infraestructura/poder.
7. Repetis ciclo con un objetivo distinto y progreso visible.

## Sistemas incluidos en MVP y estado recomendado

| Sistema | Estado recomendado |
|---|---|
| Combate auto por tick + bosses | Mantener, ajustar legibilidad de objetivos |
| Clases/spec + talentos | Mantener |
| Loot + crafting run | Mantener, ajustar claridad de costos y sugerencias |
| Extraccion | Mantener, mejorar decision UX |
| Destileria | Mantener |
| Laboratorio (unlock/capacidad/eficiencia) | Mantener |
| Biblioteca/Codex research | Modificar (mas orientado a objetivos activos) |
| Encargos | Mantener, mejorar retorno de informacion |
| Altar de Sigilos | Mantener, chunking de tiempos largos |
| Arsenal de Reliquias (equipo persistente) | Mantener, clarificar decision de extraccion y tuning contextual |
| Arbol de Ecos | Mantener |
| Abismo | Modificar (mas variacion de reglas, no solo escala) |
| Weekly Ledger + goals | Mantener y elevar a pilar semanal |
| Runtime recovery + telemetria | Mantener (sistema critico) |

## Sistemas excluidos del MVP (post-launch)
- Multiplayer/co-op/clanes/rankings.
- Trade economy entre jugadores.
- Temporadas full reset de gran escala.
- Sistema de facciones completo con reputacion separada.
- PvP.

Justificacion:
- Alto costo y alto riesgo de balance.
- No son necesarios para validar core loop single-player.

## Economia de recursos del MVP (mapa sources/sinks)

| Recurso | Sources MVP | Sinks MVP |
|---|---|---|
| Oro | Kills, logros, goals/weekly, venta | Upgrades de run |
| XP | Kills | Leveling |
| Esencia | Kills, auto-extract, goals/weekly, Destileria | Crafting run, reajuste de afijos, research Lab |
| Ecos | Extraccion con prestige | Arbol de Ecos |
| Codex Ink | Destileria, Encargos | Biblioteca, Lab |
| Sigil Flux | Destileria, Encargos | Altar de Sigilos, sintonia contextual de reliquias |
| Relic Dust | Destileria, Encargos | Biblioteca, Lab, mantenimiento de reliquias |
| Sigil Infusions | Altar claim | Consumo al iniciar run |

## Curva de progresion esperada

### Hora 1
- Clase + spec + primer boss.
- Primeras mejoras de equipo/crafting basico.
- Primera extraccion entendida.

### Hora 5
- Primer prestige y primeros nodos de Ecos.
- Destileria activa y primer loop de recursos meta.
- Primer contrato de run entendido.

### Hora 10
- Primera reliquia activa (arma o armadura) y primera sintonia contextual.
- Arsenal de Reliquias desbloqueado o en via de desbloqueo.
- Mejor lectura de costo de oportunidad entre run y Santuario.

### Hora 20
- Biblioteca y Encargos integrados al ciclo normal.
- Sigilos usados con intencion (no por defecto).
- Alternancia entre runs de push y runs de farm dirigida.

### Hora 50
- Portal de Abismo desbloqueado.
- Meta build de cuenta definida (Ecos + Codex + lane de reliquias).
- Loop semanal estable (contracts + objetivos).

### Hora 100
- Endgame estable con elecciones de mutadores/contratos.
- Varias rutas viables de progreso (push, codex, reliquias).
- Retorno por mastery, no solo por +numeros.

## Identidad irrenunciable del juego
No es solo "otro idle ARPG de numero grande": su identidad fuerte es que cada expedicion alimenta una fabrica persistente (Santuario) que redefine la siguiente run, con extraccion como bisagra principal de decisiones.

---

## Plan de accion recomendado (profundo, por lotes)

## Lote A - Hardening + claridad (sin romper sistemas criticos)
- Completar hardening de fases setup/active/extraction y smoke checklist.
- Unificar shell de overlays y patron de secciones.
- UI de decision de item extraido (conservar vs desguazar) ultra-clara.
- KPI de exito:
  - 0 freezes en reingreso de app en 7 dias.
  - Menor tiempo medio para iniciar run desde Santuario.

## Lote B - Agencia de run
- Contratos de expedicion + tablero de objetivo activo en combate.
- Integracion liviana con run sigils y codex targets.
- KPI:
  - Mayor variedad de sigilos usados.
  - Mayor retencion D1->D3 en usuarios nuevos.

## Lote C - Santuario anti-espera
- Job chunking, claim intermedio y mejor feedback de progreso.
- Weekly ledger como capa semanal visible.
- KPI:
  - Mas check-ins diarios cortos.
  - Menor abandono en ventanas de jobs largos.

## Lote D - Endgame Abismo
- Mutadores de eleccion por ciclo + recompensas coherentes.
- Balance pass de dust/ink/essence para no inflar sinks.
- KPI:
  - Sesiones >20h mantienen crecimiento sin estancarse.
  - No colapso de economia premium.

## Lote E - Recorte y foco MVP
- Congelar o remover sistemas no conectados/redundantes.
- Dejar backlog post-launch explicitamente fuera de alcance.
- KPI:
  - Menos regresiones por release.
  - Menor deuda UX y menor costo de mantenimiento.
