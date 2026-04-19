# Auditoría y Rediseño de UI/UX — IdleRPG

Fecha: 2026-04-19 UTC  
Base analizada: navegación actual en `src/App.jsx`, estaciones del `Santuario`, `Expedición`, `Caza`, `Ecos`, `Laboratorio`, `Biblioteca`, overlays del Santuario y el loop `Santuario -> Expedición -> Extracción -> Santuario`.

## Problemas graves antes de proponer soluciones

1. La navegación actual sigue cargando demasiadas superficies top-level para mobile.
   Hoy existen `12` tabs visibles a nivel de arquitectura. Aunque en mobile parte queda bajo `Más`, conceptualmente el juego sigue comportándose como si casi todo fuese tab principal.

2. Hay mezcla de “contextos mentales”.
   En la misma capa conviven:
   - acción de run,
   - preparación persistente,
   - referencia,
   - debugging/meta,
   - progreso account-wide.

3. `Inventory` y `Crafting` quedaron sobredimensionadas como tabs.
   Después del refactor a extraction-lite, ambas son más bien vistas contextuales de `Expedición`, no pantallas primarias del producto.

4. `Santuario` ya es la home real, pero la arquitectura todavía no terminó de asumirlo.
   Muchas funciones ya viven bien como estaciones/overlays, pero la navegación general todavía arrastra la lógica del juego anterior.

5. `Lab/Laboratorio`, `Métricas` y parte de `Logros` siguen funcionando como superficies “de sistema” más que como capas naturales del jugador promedio.

6. La UI no diferencia bien sesión corta vs sesión larga.
   El jugador que entra 2 minutos necesita:
   - ver claims,
   - ver timers,
   - lanzar una expedición,
   - tocar 1-2 estaciones.
   No necesita ver 12 tabs como si todas compitieran por atención.

---

## 1. Auditoría de tabs actuales

| Tab actual | Función real hoy | Qué información es necesaria | Qué mover/fusionar/eliminar | Frecuencia | Tipo |
|---|---|---|---|---|---|
| `Santuario` | Home persistente y hub de estaciones | Claims, recursos, estado de expedición, CTA principal, resumen de estaciones | Mantener como home. Sacarle cualquier detalle inline que siga creciendo y llevarlo a overlays/estaciones | Cada sesión | Acción |
| `Heroe` | Ficha del personaje actual | clase/spec, stats de build, lectura de combate | Mantener, pero fusionar conceptualmente con `Atributos` y `Talentos` bajo una misma área de build | Cada run / ocasionalmente | Acción |
| `Expedición` | Combate y loop activo | progreso de tier, enemigo actual, muerte, extracción, estado de la run | Mantener como pilar principal | Cada sesión | Acción |
| `Mochila` | Inventario y comparación de drops | equipo actual, drops recientes, candidatos a vender/proteger | Mover dentro de `Expedición` como subvista o sheet | Cada run | Acción |
| `Atributos` | Stats base y upgrades del héroe | upgrades permanentes simples y lectura numérica | Fusionar dentro de `Heroe` | Ocasionalmente | Acción |
| `Talentos` | Árboles de build | nodos, keystones, puntos, sinks | Mantener como parte de `Heroe`, no como tab separada | Cada run / cada reset | Acción |
| `Forja` | Crafting de campo | hoy es más limitada y contextual que antes | Sacarla de top-level. Integrarla en `Expedición` como subvista contextual | Cada run | Acción |
| `Ecos` | meta-progression y árbol de prestige | resonancia, árbol, momentum, reset | Mantener como tab primaria o secundaria fuerte. Sigue siendo una capa central de meta | Cada run / cada reset | Acción |
| `Logros` | colección/hitos | progreso secundario y recompensas | Pasar a tab secundaria o a panel dentro de `Perfil/Registro` | Ocasionalmente | Referencia |
| `Métricas` | lectura analítica de sesión | telemetría, ratios, snapshots | Sacarla de navegación principal. Debe vivir en `Más`, `Perfil` o modo avanzado | Ocasionalmente | Referencia |
| `Laboratorio` | ahora infraestructura del Santuario | unlocks, slots, speed, progresión de estaciones | No debería competir como tab principal contra acción de run. Puede vivir como estación del Santuario o tab secundaria de meta | Ocasionalmente | Acción/meta |
| `Caza` | radar táctico de hunt | targets revelados, bosses seed actual, familias vistas en esta run | Sacarla de top-level. Integrarla como subvista contextual de `Expedición`; fuera de la run su valor cae demasiado | Durante algunas runs, no cada sesión | Referencia táctica contextual |

### Conclusiones de auditoría

- `Mochila` y `Forja` ya no deberían ser tabs top-level.
- `Atributos` y `Talentos` deberían ser una sola área: `Heroe`.
- `Laboratorio` funciona mejor como **estación del Santuario** que como tab principal permanente.
- `Métricas` y `Logros` deben ir a una capa secundaria.
- `Caza` sí justifica seguir accesible durante expedición, pero no como tab primaria.
- `Registro` debe absorber las superficies secundarias del producto: `Logros`, `Métricas`, `Opciones` y herramientas avanzadas.

---

## 2. Nueva arquitectura de navegación propuesta

## Objetivo
Reducir la navegación mobile a **5 tabs primarias como máximo**, y pasar el resto a:
- subnavegación interna,
- overlays,
- o un contenedor `Más / Registro`.

## Propuesta principal

### Tabs primarias mobile

Arquitectura final:

1. `Santuario`
2. `Expedición`
3. `Heroe`
4. `Ecos`
5. `Registro`

Arquitectura de onboarding, antes del primer prestige:

1. `Santuario`
2. `Expedición`
3. `Heroe`
4. `Registro`

### Capas secundarias

- `Registro`
  - `Logros`
  - `Métricas`
  - `Opciones`
  - export/import/dev avanzado si siguen existiendo

### Qué sale de top-level

- `Mochila` -> subvista de `Expedición`
- `Forja` -> subvista o overlay de `Expedición`
- `Caza` -> subvista contextual de `Expedición`
- `Atributos` -> subtab de `Heroe`
- `Talentos` -> subtab de `Heroe`
- `Laboratorio` -> estación dentro de `Santuario`

## Resultado conceptual

### Santuario
Base persistente.  
Todo lo que no requiere estar en combate debe converger acá.

### Expedición
Pantalla de run viva.  
Combate + mochila + forja de campo + caza + extracción.

### Heroe
Toda la capa de build:
- ficha
- atributos
- talentos

### Ecos
Meta-progression account-wide:
- resonancia
- árbol
- reset
- resumen de Abyss/profundidad si hace falta

### Registro
Contenedor de lectura y referencia secundaria:
- logros
- métricas
- opciones
- herramientas avanzadas

## 2.1 Desbloqueo progresivo de navegación

### Principio
En mobile, las tabs del bottom nav no deberían mostrarse vacías “por promesa”.  
En juegos de referencia, los sistemas grandes suelen:
- ocultarse hasta que tengan valor real,
- desbloquearse al primer uso,
- o vivir bloqueados sólo en hubs con espacio suficiente para explicarlos.

Patrones relevantes:
- `Warframe` desbloquea segmentos del Orbiter y nuevas consolas a medida que el jugador progresa; no llena la navegación principal con superficies muertas.
- `Diablo 4`, `Path of Exile`, `Last Epoch` y `Grim Dawn` ubican la información táctica y de caza como paneles contextuales, journals o overlays ligados a la actividad, no como navegación primaria permanente.
- `Genshin Impact` y otros juegos de servicio suelen reservar la navegación primaria para acciones frecuentes y mover archivo/logros/opciones a menús secundarios.

### Regla recomendada para este proyecto
- `Santuario`, `Expedición`, `Heroe` y `Registro` están disponibles desde el inicio.
- `Ecos` no ocupa slot de bottom nav hasta completar el primer prestige.
- `Caza` no ocupa slot de bottom nav; se desbloquea como subvista de `Expedición` al llegar al primer boss real (`Tier 5`) o al primer momento donde ya tenga información útil.

### Por qué
- Una tab vacía en el bottom nav se siente como ruido o deuda.
- Un sistema bloqueado dentro del `Santuario` sí enseña progresión y expectativa.
- Un sistema de referencia táctica dentro de `Expedición` coincide mejor con el momento en que el jugador realmente lo necesita.

---

## 3. Wireframe de pantalla principal

La pantalla principal fuera de run debe ser `Santuario`.

## Wireframe ASCII — Santuario Home

```text
┌─────────────────────────────────────┐
│ SANTUARIO                           │
│ Estado: En Santuario                │
│ Heroe: Warrior · Juggernaut         │
│ CTA: Ir a Expedición                │
├─────────────────────────────────────┤
│ CLAIMS                              │
│ [Biblioteca lista] [Encargo listo]  │
│ [Reclamar todo]                     │
├─────────────────────────────────────┤
│ RECURSOS                            │
│ Tinta   Polvo   Flux   Esencia      │
├─────────────────────────────────────┤
│ ESTACIONES                          │
│ [Biblioteca]  Activa · 1/2 · 6m     │
│ [Destilería]  Activa · 0/2 · libre  │
│ [Altar]       Bloqueada / activa    │
│ [Encargos]    1/3 · 28m             │
│ [Forja Prof.] 0/2 · libre           │
│ [Laboratorio] 1 estudio listo       │
├─────────────────────────────────────┤
│ STASH TEMPORAL                      │
│ 2 items rescatados · 3 blueprints   │
└─────────────────────────────────────┘
Bottom nav inicial: Santuario / Expedición / Heroe / Registro
Bottom nav post-primer prestige: Santuario / Expedición / Heroe / Ecos / Registro
```

## Sesión corta (2–5 min)

El jugador debería poder:
- ver claims,
- reclamar,
- lanzar 1-2 jobs,
- revisar si conviene salir a expedición,
- o volver a una expedición activa.

## Sesión larga (20–40 min)

El jugador debería:
- preparar sigilos,
- revisar biblioteca,
- gestionar blueprints,
- abrir forja profunda,
- entrar en expedición,
- consultar caza dentro de expedición,
- cerrar con extracción.

---

## 4. Layout por pantalla

## 4.1 Santuario

### Qué muestra
- estado global
- CTA de expedición
- claims
- recursos
- estaciones
- stash temporal / blueprints resumidos

### Qué acciones permite
- reclamar jobs
- abrir estaciones
- ir a expedición
- ver si hay cuellos de botella

### Jerarquía visual
- arriba: estado + CTA
- centro: claims y recursos
- abajo: estaciones
- stash temporal como sección final o colapsable

### Overlays vs inline
- `Biblioteca`, `Destilería`, `Altar`, `Encargos`, `Forja Profunda`: overlay/estación
- `Laboratorio`: idealmente también overlay desde Santuario, aunque hoy exista como tab

### Thumb zone
- CTA principal y claims deben estar accesibles sin scroll largo
- cards de estación con botón único grande

---

## 4.2 Expedición

### Qué muestra
- combate
- tier actual / enemigo / boss state
- vidas de expedición
- extracción
- mutador/anomalía si aplica

### Qué acciones permite
- autoavance on/off
- ver mochila
- abrir forja de campo
- abrir caza táctica
- extraer al santuario

### Layout recomendado

#### Top
- tier
- enemigo
- vida del héroe y del enemigo
- indicador de vidas de expedición

#### Center
- combate / estados / intel del enemigo

#### Bottom actions
- `Mochila`
- `Forja`
- `Caza`
- `Extraer`
- `Autoavance`

### Overlays
- `Mochila` como bottom sheet o pantalla interna
- `Forja` como sheet contextual
- `Caza` como sheet o subpestaña interna
- `Extracción` como overlay full-screen, como hoy

### Importante
`Expedición` no necesita que `Mochila` y `Forja` compitan como tabs globales.

---

## 4.3 Heroe

### Qué unifica
- ficha
- atributos
- talentos

### Layout

#### Header
- clase / spec
- identidad de build

#### Segmented control
- `Ficha`
- `Atributos`
- `Talentos`

### Beneficio
Reduce 3 tabs a 1 dominio mental: “armar mi build”.

---

## 4.4 Caza dentro de Expedición

### Dónde vive
No como tab primaria.  
Vive como subvista o sheet contextual dentro de `Expedición`.

### Qué muestra
- objetivos revelados reales
- bosses de la seed actual
- powers accesibles hoy
- familias vistas en esta expedición

### Qué NO debería mostrar
- recomendaciones fuertes
- spoilers
- tiers futuros no vistos
- “mejor target”

### Layout
- arriba: radar táctico corto
- centro: bloques simples
  - bosses actuales
  - objetivos revelados
  - powers activos
  - familias ya vistas esta run

### Tipo
Referencia táctica, lectura rápida, no tablero pesado.

---

## 4.5 Ecos

### Qué muestra
- conversión esperada de la run
- resonancia
- momentum
- árbol de ecos
- hitos de Abismo si suman

### Qué no necesita
- mezclarse con extracción
- mezclar progreso del Santuario

### Layout
- header: eco actual / potencial
- métricas de reset
- árbol
- resumen de perks permanentes

---

## 4.6 Registro

### Dónde vive
Sí como tab primaria, pero con intención claramente secundaria.

### Qué muestra
- `Logros`
- `Métricas`
- `Opciones`
- herramientas avanzadas o administrativas si siguen existiendo

### Qué no debería mostrar
- decisiones de run
- claims del Santuario
- sistemas time-gated
- progreso de build o prestige

### Layout
- arriba: resumen muy corto de progreso secundario
- abajo: cards o tabs internas
  - `Logros`
  - `Métricas`
  - `Opciones`

### Por qué
Le da un hogar estable a las pantallas secundarias sin obligarlas a competir contra acción, build o meta en la navegación principal.

---

## 4.7 Biblioteca

### Dónde vive
No como tab primaria.  
Vive como estación/overlay del Santuario.

### Qué muestra
- archivo
- familias
- bosses
- powers
- investigaciones
- jobs en curso/listos

### Layout
- arriba: tinta/polvo/claims
- tabs internas:
  - `Investigación`
  - `Familias`
  - `Bosses`
  - `Poderes`
  - `Glosario`

---

## 4.8 Forja Profunda

### Dónde vive
Estación/overlay del Santuario.

### Qué muestra
- blueprints
- afinidades
- estructura
- sintonía
- ascensión
- preview genérica de materialización

### Qué debe evitar
- competir con el hub del Santuario
- volverse tab top-level

---

## 4.9 Laboratorio

### Recomendación
Como arquitectura final, **no debería quedar como tab principal**.

### Mejor lugar
Estación del Santuario.

### Qué muestra
- unlocks de estaciones
- upgrades de slots
- upgrades de speed
- más adelante seguros/quality-of-life

### Por qué
Es progreso de infraestructura, no loop de sesión principal.

---

## 5. Sistemas time-gated en UI

## Dónde viven

- `Destilería`, `Biblioteca`, `Altar`, `Encargos`, `Forja Profunda`, `Laboratorio`
  viven como estaciones del Santuario, no como tabs propias.

## Cómo se notifican

### Recomendación
Un solo patrón de claims:
- en `Santuario`, bloque superior
- microbadges en las estaciones
- sin popups intrusivos

### Estado de timer compacto

Cada estación debería mostrar:
- `libre`
- `1/2 en curso`
- `listo`
- `bloqueada`

Y opcionalmente:
- tiempo restante del job más cercano

Ejemplo:
- `Biblioteca · 1/2 · 6m`
- `Forja Profunda · libre`
- `Encargos · listo`

## Regla
Los time-gated no necesitan tab propia si:
- se entienden desde el hub,
- tienen buen summary,
- y abren overlay dedicado al entrar.

Eso ya está bastante bien encaminado en el proyecto actual.

---

## 6. Tabs que deberían fusionarse

### Fusionar sí o sí

- `Heroe` + `Atributos` + `Talentos`
- `Expedición` + `Mochila` + `Forja de campo`

### Convertir a estación/overlay

- `Laboratorio`
- `Biblioteca` (ya encaminado)
- `Destilería` (ya encaminado)
- `Altar de Sigilos` (ya encaminado)
- `Encargos` (ya encaminado)
- `Forja Profunda` (ya encaminado)

### Mover a capa secundaria

- `Métricas`
- `Logros`
- `Opciones`

---

## 7. Información que debería moverse entre tabs

### De `Expedición` hacia `Santuario`
- cualquier resumen persistente de jobs
- infraestructura
- claims

### De `Codex`/archivo hacia `Biblioteca`
- todo lo que sea archivo
- mastery
- investigación
- glosario

### De `Caza` hacia `Expedición`
- radar táctico de la run
- bosses de la seed actual
- familias vistas en esta expedición
- objetivos revelados sin spoilers

### De `Mochila`/`Forja` hacia `Expedición`
- manipulación táctica de loot de run

### De `Lab` hacia `Santuario`
- toda la progresión de estaciones

---

## 8. Qué simplificar o eliminar

1. Eliminar `Lab` como tab primaria en la arquitectura final.
2. Eliminar `Mochila` como tab principal.
3. Eliminar `Forja` como tab principal.
4. Eliminar `Caza` como tab principal.
5. Eliminar `Atributos` y `Talentos` como tabs separadas.
6. Dejar `Métricas` fuera del flujo principal.
7. No seguir agregando tabs nuevas para sistemas time-gated.

---

## 9. Nueva arquitectura recomendada

## Arquitectura final ideal

### Tabs primarias

1. `Santuario`
2. `Expedición`
3. `Heroe`
4. `Ecos`
5. `Registro`

### Secundarias dentro de `Registro`

- `Logros`
- `Métricas`
- `Opciones`

### Estaciones del Santuario

- `Biblioteca`
- `Destilería`
- `Altar de Sigilos`
- `Encargos`
- `Forja Profunda`
- `Laboratorio`

### Subvistas de Expedición

- `Combate`
- `Mochila`
- `Forja de campo`
- `Caza`
- `Extracción`

### Lógica de desbloqueo recomendada

- Inicio:
  - `Santuario`
  - `Expedición`
  - `Heroe`
  - `Registro`
- Al primer boss real o `Tier 5`:
  - se habilita `Caza` dentro de `Expedición`
- Tras completar el primer prestige:
  - aparece `Ecos` como tab primaria

### Regla de onboarding

- En bottom nav: ocultar hasta que tenga valor real.
- En estaciones del `Santuario`: sí se puede mostrar bloqueado, porque el hub tolera mejor comunicar progresión futura.

---

## 10. Cambios recomendados por impacto / esfuerzo

## Alto impacto / bajo-medio esfuerzo

1. Fusionar `Heroe + Atributos + Talentos`.
2. Mover `Mochila` a `Expedición`.
3. Mover `Forja` de campo a `Expedición`.
4. Mover `Caza` dentro de `Expedición`.
5. Sacar `Laboratorio` de top-level y volverlo estación del Santuario.
6. Sacar `Métricas` del flujo principal.

## Alto impacto / medio esfuerzo

7. Rediseñar `Santuario` como dashboard de sesión corta.
8. Reordenar mobile nav a `Santuario / Expedición / Heroe / Ecos / Registro`, con `Ecos` desbloqueado recién tras el primer prestige.
9. Crear subnavegación interna de `Expedición`.
10. Crear subnavegación interna de `Heroe`.

## Medio impacto / bajo esfuerzo

11. Unificar lenguaje visual de estados:
- `bloqueada`
- `libre`
- `en curso`
- `listo`

12. Añadir resumen compacto de tiempo restante por estación.
13. Mantener un solo bloque de claims arriba en Santuario.

## Alto impacto / alto esfuerzo

14. Replantear por completo la arquitectura mobile bottom-nav para consolidarla en `Santuario / Expedición / Heroe / Ecos / Registro`.
15. Rehacer `Expedición` como contenedor con pestañas internas.

---

## Recomendación ejecutiva

Si hay que elegir el siguiente refactor fuerte de UI, haría este orden:

1. `Heroe` unificado
2. `Expedición` con `Mochila + Forja` adentro
3. `Caza` absorbida por `Expedición`
4. `Laboratorio` movido a estación del `Santuario`
5. `Métricas` y `Logros` fuera del primer nivel
6. bottom-nav final de 5 tabs con desbloqueo progresivo de `Ecos`

Eso baja mucho la saturación, consolida el loop nuevo y le da un hogar claro a todos los sistemas time-gated sin volver la UI barroca.
