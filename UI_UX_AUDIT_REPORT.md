# UI/UX Audit Report — IdleRPG

## Problemas graves detectados

1. La arquitectura actual mezcla `acción`, `referencia`, `meta-progresión` y `tooling` al mismo nivel. En mobile eso destruye la jerarquía mental.
2. `Santuario` ya funciona como home, agenda, panel de recursos, lanzador de overlays, bandeja de claims y mapa de infraestructura al mismo tiempo. Está sobrecargado.
3. `Registro` ocupa una tab primaria aunque contiene contenido de visita ocasional y herramientas de QA/dev (`Sistema`), algo que no debería competir con loops core.
4. `Expedición` y `Santuario` no separan con suficiente claridad lo que es `run-critical` de lo que es `account-critical`.
5. Los sistemas time-gated viven repartidos entre cards del hub y overlays separados. El jugador no tiene una `bandeja operacional` compacta para entender qué está listo, qué está corriendo y qué debería tocar ahora.
6. El conocimiento está partido: `Caza` vive dentro de `Expedición`, mientras `Biblioteca` vive como estación del `Santuario`. Esa separación tiene sentido técnico, pero no mental.
7. En mobile hay triple navegación simultánea: bottom nav primaria + subnav horizontal + grilla de cards. Eso sube mucho la fricción por sesión corta.

---

## 1. Resumen de conclusiones de la investigación de juegos

### Hallazgos por juego

| Juego | Patrón de navegación | Qué hace bien | Qué no conviene repetir |
|---|---|---|---|
| Gladiatus | Muchas secciones separadas por ciudad/wilderness/shops/sistemas | Hace explícitos los sistemas del loop | Saturación de destinos y poca jerarquía de prioridad |
| Travian | Vista central + pantallas específicas + overview agregado | Excelente resumen de timers, colas y actividad en una vista operacional | Mucha dispersión si el overview no es la entrada principal |
| Path of Exile 1 | UI muy densa, paneles especializados, stash masivo | Separa sistemas complejos en ventanas completas; excelente profundidad para desktop | No es una referencia válida para mobile-first: demasiada densidad y paneles paralelos |
| Path of Exile 2 | Mantiene profundidad, pero suaviza lectura y onboarding del HUD | Mejor legibilidad y menos fricción inicial que PoE1 | Sigue siendo una UI de desktop, no una receta de navegación mobile |
| Grim Dawn | Ventanas grandes y especializadas para Character/Skills/Inventory | La build está claramente agrupada; no mezcla todo con el hub | En mobile sería demasiado modal si se replica literal |
| Diablo Immortal | Hub central + accesos rápidos + menús + vendors/estaciones | Muy bueno separando ciudad/hub de sistemas; el town funciona como home operacional | Puede caer en exceso de iconos y notificaciones visuales |
| Genshin Impact | Mundo limpio + un menú sistémico grande (`Paimon Menu`) | Excelente separación entre gameplay y meta-sistemas; no pone todo en bottom nav | El menú puede inflarse demasiado si no se jerarquiza |
| Torchlight Infinite | Menos ramas visibles durante gameplay; progresión fuerte en pantallas dedicadas | Buen recorte de acciones durante combate; foco claro en build y loot | Algunas capas de progresión quedan poco visibles sin guía |
| Diablo 3 | Simplificación deliberada; town vendors y paneles claros | Muy buen recorte de complejidad visible; town y artisans son contextuales | Menos flexible para sistemas meta muy amplios |
| Diablo 4 | HUD limpio + paneles completos para character/map/journal | Buen principio de “combate limpio, sistemas en pantallas dedicadas” | Sigue cargando varias secciones importantes en menús grandes |

### Patrones que sí conviene adoptar

- `Home operacional resumida` inspirada en `Travian`:
  mostrar timers, claims, colas y estado de sesión en una sola vista.
- `Hub central con estaciones contextuales` inspirado en `Diablo Immortal` y `Diablo 3`:
  las estaciones no necesitan tab propia; pueden ser overlays o pantallas completas lanzadas desde el hub.
- `Menú de utilidades separado de la navegación core` inspirado en `Genshin`:
  logros, settings, stats, mail, ayudas y sistema no deberían vivir en tabs primarias.
- `Pantallas completas para sistemas densos` inspirado en `Grim Dawn`, `PoE`, `Diablo 4`:
  build, inventory denso, tech tree y árboles complejos funcionan mejor como pantallas dedicadas o overlays full-screen, no como mini-cards dentro del hub.
- `Gameplay HUD limpio` inspirado en `Diablo 3`, `Diablo 4`, `Torchlight Infinite`:
  durante la run el jugador debería ver pocas decisiones: combatir, loot/equipo, intel.

### Errores que no conviene repetir

- El `tab sprawl` de `Gladiatus` y la sobre-fragmentación browser clásica.
- La densidad de `PoE1` trasladada a mobile.
- El `icon clutter` de algunas vistas de `Diablo Immortal`.
- Convertir el menú de utilidades estilo `Paimon Menu` en un depósito sin prioridad.

---

## 2. Auditoría de tabs actuales

### Tabs primarias actuales

| Tab actual | Tipo | Frecuencia | Qué sí necesita | Qué sobra / qué movería |
|---|---|---|---|---|
| `Santuario` | Acción + home | Cada sesión | Estado de la cuenta, CTA principal, claims, timers, acceso a estaciones | Tiene demasiadas cards iguales; mover parte del detalle a overlays y unificar sistemas |
| `Heroe` | Acción/build | Cada run | Ficha, atributos, talentos | Está bien como dominio, pero hoy compite con inventario/crafting dispersos |
| `Expedicion` | Acción/run | Cada sesión | Combate, inventario rápido, intel de la run | `Forja` dentro de Expedición mete densidad innecesaria en la run |
| `Ecos` | Meta | Ocasional / al extraer | Resumen de ecos y gasto | Como tab primaria permanente en mobile pesa demasiado para su frecuencia |
| `Registro` | Referencia + tooling | Ocasional / rara vez | Logros y alguna métrica resumida | `Sistema` no debería estar en la navegación del jugador normal |

### Subtabs actuales

| Área | Subtab | Tipo | Frecuencia | Evaluación |
|---|---|---|---|---|
| `Heroe` | `Ficha` | Acción/build | Cada run | Bien |
| `Heroe` | `Atributos` | Acción/build | Cada run temprano, luego ocasional | Bien |
| `Heroe` | `Talentos` | Acción/build | Cada run / build moments | Bien |
| `Expedicion` | `Combate` | Acción | Cada sesión | Core |
| `Expedicion` | `Mochila` | Acción | Cada run | Core |
| `Expedicion` | `Forja` | Acción secundaria | Ocasional | Debería salir de esta capa |
| `Expedicion` | `Caza` | Referencia táctica | Situacional | Debería fusionarse con `Biblioteca` en un mismo dominio de conocimiento |
| `Registro` | `Logros` | Referencia | Ocasional | No necesita tab primaria |
| `Registro` | `Metricas` | Referencia | Ocasional / QA | No necesita tab primaria |
| `Registro` | `Sistema` | Tooling | Rara vez / dev-only | Debe salir del flujo jugador |

### Overlays y estaciones actuales

| Overlay / estación | Frecuencia | Evaluación UX |
|---|---|---|
| `ExtractionOverlay` | Cada cierre de run | Correcto como overlay crítico |
| `RunSigilOverlay` | Al iniciar run | Correcto si sigue siendo compacto |
| `LaboratoryOverlay` | Ocasional | Correcto como overlay, pero debería lanzarse desde un nodo más claro |
| `DistilleryOverlay` | Frecuente media | Bien como overlay; falta integrarlo en una bandeja de timers |
| `EncargosOverlay` | Frecuente media | Bien como overlay; hoy queda escondido |
| `SigilAltarOverlay` | Frecuente media | Bien como overlay; hoy queda escondido |
| `BibliotecaOverlay` | Frecuente media | Funcional, pero mentalmente está separada de `Caza` |
| `BlueprintForgeOverlay` / `DeepForgeOverlay` | Media / avanzada | Hoy están demasiado repartidos respecto al concepto `item persistente` |

---

## 3. Nueva arquitectura de navegación propuesta

## Recomendación central

Para mobile browser first, el juego debería tener **4 tabs primarias visibles** y **1 menú utilitario no primario**.

### Tabs primarias nuevas

1. `Inicio`
2. `Expedición`
3. `Build`
4. `Codex`

### Menú utilitario

- `Menú`
  contiene `Logros`, `Métricas`, `Configuración`, `Ayuda`, `Sistema/QA`.

---

## Cómo se agrupan los sistemas

### 1. `Inicio`
Inspiración: `Travian` central overview + `Diablo Immortal` Westmarch hub.

Viven acá:
- estado actual de sesión
- CTA principal (`Retomar run`, `Extraer`, `Iniciar expedición`)
- bandeja de claims
- timers activos
- recursos persistentes
- acceso a estaciones
- objetivo sugerido / next best action
- entrada a `Abismo` cuando corresponda

No deberían vivir acá como cards densas:
- árboles completos
- build extensa
- pantallas de referencia largas

### 2. `Expedición`
Inspiración: `Diablo 3`, `Diablo 4`, `Torchlight Infinite`.

Subniveles recomendados:
- `Combate`
- `Mochila`
- `Intel`

`Intel` reemplaza la parte táctica de `Caza` durante la run.

`Forja` sale de Expedición.

### 3. `Build`
Inspiración: `Grim Dawn` Character/Skill split + `Diablo 4` full-screen character panels.

Subniveles recomendados:
- `Heroe`
- `Equipo`
- `Ecos`

`Equipo` absorbe:
- inventario profundo
- crafting contextual de item
- blueprint loadout activo

`Ecos` sale de la home principal, pero conserva entidad propia dentro del dominio de progresión.

### 4. `Codex`
Inspiración: `Genshin Archive` + `Diablo Immortal Codex`.

Subniveles recomendados:
- `Caza`
- `Biblioteca`
- `Guías/Objetivos`

Esto corrige el problema mental actual: hoy `Caza` y `Biblioteca` son el mismo dominio de conocimiento, pero están partidos.

### 5. `Menú`
Inspiración: `Paimon Menu` de `Genshin`.

Contiene:
- `Logros`
- `Métricas`
- `Configuración`
- `Sistema`

`Sistema` sólo visible detrás de un gesto secundario, toggle o modo debug.

---

## Fusiones y conversiones explícitas

### Tabs a fusionar

- `Caza` + `Biblioteca` -> `Codex`
- `Heroe` + parte del manejo profundo de `Equipo` + `Ecos` -> mismo dominio `Build`
- `Stash temporal` + `Blueprints` + `Forja Profunda` -> un único flujo de `Taller`

### Tabs a sacar de navegación primaria

- `Registro`
- `Ecos` como primaria fija

### Sistemas que deberían seguir como overlays

- `Extracción`
- `Laboratorio`
- `Destilería`
- `Operaciones`
- `Taller`
- `Run Sigils`

### Sistemas que deberían convertirse en overlays agrupados

- `Encargos` + `Altar de Sigilos` -> `Operaciones`
  inspiración: town vendors/functional stations de `Diablo 3` y `Diablo Immortal`

- `Stash temporal` + `Blueprints` + `Forja Profunda` -> `Taller`
  inspiración: unificación por fantasía de uso, no por implementación técnica

---

## 4. Wireframe en texto / ASCII de la pantalla principal

```text
┌──────────────────────────────────────┐
│ Inicio                               │
│ Heroe: Warrior · Berserker           │
│ Estado: Run activa · Tier 12         │
│ [ Retomar expedición ]               │
├──────────────────────────────────────┤
│ Siguiente mejor paso                 │
│ “Tienes 2 claims y 1 research listo” │
│ [ Abrir operaciones ]                │
├──────────────────────────────────────┤
│ Bandeja operacional                  │
│ Claim listo: Destilería           [>]│
│ Claim listo: Encargo              [>]│
│ Research: Portal al Abismo 08:12  [ ]│
│ Sigilo: Free 12:40                [ ]│
├──────────────────────────────────────┤
│ Estaciones                           │
│ [Laboratorio] [Destilería]           │
│ [Taller]      [Operaciones]          │
│ [Codex]       [Abismo]               │
├──────────────────────────────────────┤
│ Recursos                              │
│ Tinta 120  Flux 18  Polvo 34  Es. 210 │
└──────────────────────────────────────┘

Bottom bar:
[Inicio] [Expedición] [Build] [Codex] [Menú]
```

### Qué cambia respecto al home actual

- desaparece la grilla larga de cards iguales en prioridad
- claims y timers pasan arriba
- estaciones pasan a ser accesos, no mini-pantallas dentro de la home
- el CTA principal domina la primera pantalla

---

## 5. Layout por pantalla

## `Inicio`

### Qué muestra
- estado actual del héroe y la run
- CTA principal
- next best action
- claims listos
- timers activos
- estaciones
- recursos

### Qué va arriba / centro / abajo
- arriba: estado de sesión + CTA
- centro: bandeja operacional + next best action
- abajo: estaciones + recursos

### Qué va en modal u overlay
- estaciones completas
- claims detail
- panel de job queue expandido

### Thumb zone
- CTA y claims dentro del tercio inferior visible en mobile
- estaciones en grilla 2xN con botones grandes

---

## `Expedición`

### Qué muestra
- `Combate`: HUD limpio, progress de tier, enemy info, auto-advance, extraction readiness
- `Mochila`: upgrades reales, equipar, filtros rápidos
- `Intel`: objetivos, familia actual, boss, ruta, drop bias

### Qué va arriba / centro / abajo
- arriba: segment control `Combate | Mochila | Intel`
- centro: vista principal
- abajo: acciones puntuales y CTA de extracción si aplica

### Qué va en overlay
- detalles profundos de item
- confirmaciones de extracción

### Decisión fuerte

`Forja` sale de acá.

Inspiración:
- `Diablo 3` y `Diablo 4` mantienen el combate limpio
- `Torchlight Infinite` reduce ramas visibles durante gameplay

---

## `Build`

### Qué muestra
- `Heroe`: ficha, atributos, talentos
- `Equipo`: gear, comparaciones, crafting contextual, blueprint loadout
- `Ecos`: summary, gasto, árbol

### Qué va arriba / centro / abajo
- arriba: segment control `Heroe | Equipo | Ecos`
- centro: la pantalla principal de cada subdominio
- abajo: CTA de confirmación o inversión

### Qué va en overlay
- detalle de item
- crafting profundo
- compare sheet

### Decisión fuerte

`Ecos` deja de ocupar tab primaria independiente y pasa al dominio `Build`, porque mentalmente es progresión del avatar/cuenta, no navegación base de cada sesión.

Inspiración:
- `Grim Dawn` agrupa build
- `PoE` y `PoE2` tratan build como un dominio separado y profundo

---

## `Codex`

### Qué muestra
- `Caza`: info táctica y descubrimientos de run
- `Biblioteca`: progreso de investigación y maestrías
- `Objetivos`: objetivos sugeridos, milestones, ayuda sistémica

### Qué va arriba / centro / abajo
- arriba: segment control `Caza | Biblioteca | Objetivos`
- centro: contenido principal
- abajo: CTA de research si corresponde

### Qué va en overlay
- detalle de familia / boss
- research details

### Decisión fuerte

`Caza` y `Biblioteca` se fusionan por modelo mental de `conocimiento`.

Inspiración:
- `Genshin` separa bien archive/quest/character
- `Diablo Immortal` usa Codex como paraguas de progreso e información

---

## `Menú`

### Qué muestra
- `Logros`
- `Métricas`
- `Configuración`
- `Sistema`

### Tratamiento
- hoja/modal full-screen
- no compite con la navegación core

Inspiración:
- `Paimon Menu` de `Genshin`

---

## 6. Tratamiento de sistemas time-gated

## Principio

Los sistemas time-gated no deberían pedir tab propia si su interacción principal es:
- iniciar trabajo
- esperar
- reclamar

## Propuesta

### Crear una `Bandeja Operacional`
Vive en `Inicio`.

Muestra:
- claims listos
- trabajos corriendo
- tiempo restante
- color por prioridad

### Crear un overlay `Operaciones`
Fusiona:
- `Encargos`
- `Sigilos`

Porque ambos son:
- preparación paralela
- time-gated
- no run-critical por segundo

### Mantener overlays separados sólo para:
- `Laboratorio`
- `Destilería`
- `Taller`

Razón:
- su densidad y fantasía son distintas

### Notificaciones no intrusivas

Usar:
- badges discretos en `Inicio`
- contador en estación
- fila “Listo para reclamar”

Evitar:
- popups modales automáticos
- overlays que secuestran el flujo
- animaciones ruidosas permanentes

### Visual de progreso compacto

Cada job debería representarse así:

`Destilería · Tinta x20 · 08:14`

o

`Encargo de Archivo · listo`

No hace falta mostrar barras grandes en todas las cards del hub.

Inspiración:
- `Travian` overview
- `Diablo Immortal` town loops

---

## 7. Recomendaciones por impacto / esfuerzo

### Alto impacto / bajo esfuerzo

1. Sacar `Registro` de la navegación primaria y moverlo a `Menú`.
2. Convertir `Santuario` en una home resumida con `CTA + claims + timers + estaciones`.
3. Agregar una `Bandeja Operacional` arriba del fold.
4. Mover `Sistema` detrás de acceso secundario o modo debug.

### Alto impacto / esfuerzo medio

5. Sacar `Forja` de `Expedición`.
6. Fusionar `Caza` + `Biblioteca` en `Codex`.
7. Reubicar `Ecos` dentro de `Build`.

### Alto impacto / esfuerzo alto

8. Fusionar `Stash temporal + Blueprints + Forja Profunda` en `Taller`.
9. Fusionar `Encargos + Altar de Sigilos` en `Operaciones`.
10. Rediseñar el `Inicio` para que deje de ser una lista larga de cards de igual jerarquía.

### Medio impacto / bajo esfuerzo

11. Reemplazar múltiples métricas grandes por chips compactos.
12. Mostrar siempre `1 next best action`, no varias sugerencias en paralelo.
13. Reducir la profundidad visible de recursos y estaciones cuando el jugador está en sesión corta.

---

## Propuesta final resumida

### Arquitectura recomendada

- `Inicio`
- `Expedición`
- `Build`
- `Codex`
- `Menú`

### Overlays recomendados

- `Extracción`
- `Laboratorio`
- `Destilería`
- `Taller`
- `Operaciones`
- `Run Sigils`

### Sistemas nuevos sin romper la navegación

- `Abismo`: acceso desde `Inicio` como estación/objetivo de late game, no como tab primaria temprana
- `Prestige expandido / Ecos`: dentro de `Build`
- `Time-gated`: bandeja operacional + overlays de estación

---

## Fuentes usadas

- Gladiatus overview: https://www.f2p.com/games/gladiatus/
- Travian Central Village Overview: https://support.travian.com/en/support/solutions/articles/7000062844-central-village-overview
- Travian village docs: https://travian.fandom.com/wiki/Village
- Path of Exile passive tree: https://www.pathofexile.com/passive-skill-tree
- Path of Exile stash/tab affinity: https://pathofexile.fandom.com/wiki/Stash
- PoE2 UI guide: https://mobalytics.gg/poe-2/guides/user-interface
- Grim Dawn character basics: https://www.grimdawn.com/guide/character/character-basics
- Diablo Immortal gameplay overview: https://news.blizzard.com/en-us/diablo-immortal/23557147/diablo-immortal-gameplay-overview-everything-you-need-to-know
- Genshin Paimon Menu: https://genshin-impact.fandom.com/wiki/Paimon_Menu
- Genshin Character Menu: https://genshin-impact.fandom.com/wiki/Character/Menu
- Diablo 3 interface/artisan references: https://www.diablowiki.net/Interface
- Diablo 4 interface references: https://www.gamepressure.com/diablo-iv/interface/z0109a5
- Diablo 4 HUD references: https://www.purediablo.com/diablo4/HUD
- Torchlight Infinite references: https://www.androidpolice.com/torchlight-infinite-beginners-guide/
