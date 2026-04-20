# Onboarding Propuesto — IdleRPG MVP 2.0

Fecha: 2026-04-19 UTC  
Estado: versión consolidada después de iterar `notes/onboarding_mio.md` y `notes/onboarding_tabla.md`

## 1. Tesis

El onboarding correcto tiene que enseñar el juego en capas, no todo junto.

Orden correcto:

1. **Primero la run**
   - clase
   - combate automático
   - auto-avance
   - muerte
   - `spec`
   - `Heroe`
   - equiparse
   - primer boss
   - `Caza`
   - extracción

2. **Después el Santuario básico**
   - `Stash temporal`
   - `Laboratorio`
   - `Destilería`
   - `Ecos`

3. **Después la persistencia avanzada**
   - `Blueprint vs Desguace`
   - `Forja Profunda`
   - `Biblioteca`
   - `Encargos`
   - `Altar de Sigilos`

4. **Por último el endgame**
   - `Portal al Abismo`
   - `Abismo`

La regla central es esta:

**primero enseñamos a sobrevivir y cerrar una expedición; después enseñamos cómo el Santuario transforma esa expedición en progreso persistente.**

---

## 2. Principios

### 2.1 El juego arranca en Santuario, pero como vestíbulo

No mostramos el Santuario completo al minuto 0.

Mostramos:
- `Santuario`
- CTA grande `Elegir clase`
- una línea temática de qué trata el juego

No mostramos todavía:
- estaciones
- recursos raros
- overlays
- `Ecos`
- `Caza`

Objetivo:
- enseñar que `Santuario` es la home real
- sin abrumar

### 2.2 La primera decisión es la clase, no la subclase

Primero:
- `Warrior`
- `Mage`

Después, en `nivel 5`:
- `spec`

Eso mejora muchísimo el pacing del early y evita pedir demasiada información antes de la primera pelea real.

### 2.3 Forzamos sólo los beats que construyen modelo mental

Usamos tres niveles:

- `Hard force`
  - no puede seguir sin resolverlo
- `Soft force`
  - spotlight + recomendación
- `Passive`
  - chip, toast, copy contextual

Hard force sí o sí:
- elegir clase
- elegir primera `spec`
- gastar primer atributo
- comprar primer talento
- equipar primer item
- hacer primera extracción
- hacer primer research del `Laboratorio`
- arrancar la primera `Destilería`
- resolver `Blueprint vs Desguace` cuando llegue el momento

### 2.4 El Santuario se desbloquea por comprensión, no por ansiedad

El jugador no debería ver `Forja Profunda`, `Biblioteca`, `Encargos` o `Altar` cuando todavía no entendió:
- cómo termina una expedición
- qué significa extraer
- qué son los `Ecos`

Por eso el `Laboratorio` se vuelve el gran gateador de mitad de juego.

---

## 3. Arquitectura visible por etapa

## Etapa A — Inicio

Visible:
- `Santuario`
- `Expedición`
- `Registro`

Oculto o gris:
- `Heroe`
- `Ecos`
- `Caza`

Santuario visible:
- estado `Héroe no asignado`
- CTA `Elegir clase`

## Etapa B — Primera run

Visible en `Expedición`:
- `Combate`
- `Forja` de campo

No visible todavía:
- `Mochila` hasta el primer equip
- `Caza`

## Etapa C — Build básica

Al elegir `spec`:
- aparece `Heroe`
- se enseña `Ficha`
- se fuerza primer atributo
- se fuerza primer talento

## Etapa D — Primer boss y dirección

Tras derrotar el primer boss:
- aparece `Caza`

## Etapa E — Primer cierre de run

Tras la primera extracción:
- aparece `Stash temporal`
- aparece `Laboratorio`

Luego:
- primer research obligatorio: `Destilería`

## Etapa F — Primer prestige real

Tras la primera conversión a ecos:
- aparece `Ecos`

## Etapa G — Persistencia avanzada

Orden recomendado:
- `Prestige 2`: `Blueprint vs Desguace`
- `Prestige 3`: research de `Forja Profunda`
- `Prestige 4`: research de `Biblioteca`
- `Prestige 5`: research de `Encargos`
- `Prestige 6`: research de `Altar de Sigilos`

## Etapa H — Endgame

Tras derrotar el boss de `Tier 25`:
- aparece en `Laboratorio` el research `Portal al Abismo`

Sólo con ese portal investigado:
- se puede pasar a `Tier 26+`
- se enseña `Abismo`

---

## 4. Orden de unlocks recomendado

## Tabs

### Inicio

- `Santuario`
- `Expedición`
- `Registro`

### Luego

- `Heroe`: al elegir la primera `spec`
- `Caza`: al derrotar el primer boss
- `Ecos`: en la primera conversión real a ecos

## Estaciones y sistemas del Santuario

1. `Laboratorio` — primera extracción
2. `Destilería` — primer research obligatorio del `Laboratorio`
3. `Blueprint vs Desguace` — `Prestige 2`
4. `Forja Profunda` — research en `Prestige 3`
5. `Biblioteca` — research en `Prestige 4`
6. `Encargos` — research en `Prestige 5`
7. `Altar de Sigilos` — research en `Prestige 6`
8. `Portal al Abismo` — boss de `Tier 25` derrotado + sistemas previos ya desbloqueados

---

## 5. Journey completo

## Beat 0 — Primer login

### Trigger
Primera vez que entra.

### Qué ve
- `Santuario` vestíbulo
- CTA `Elegir clase`

### Fuerza
`Hard`

### Objetivo mental
El juego empieza en `Santuario`, pero todavía no es un hub lleno de sistemas.

## Beat 1 — Elegir clase

### Trigger
Toca `Elegir clase`.

### Qué ve
- `Warrior`
- `Mage`

Con descripción conceptual breve de cada clase.

### Fuerza
`Hard`

### Objetivo mental
La primera decisión es simple y con identidad.

## Beat 2 — Primera entrada a Expedición

### Trigger
Clase elegida.

### Qué ve
Copy breve:
- combate automático
- subir de nivel
- conseguir equipo

### Fuerza
`Soft`

### Objetivo mental
Primero se aprende la run.

## Beat 3 — Auto-avance

### Trigger
Mata `3` enemigos.

### Qué ve
Spotlight del botón `Auto-avance`.

### Fuerza
`Soft`

### Objetivo mental
La run también puede progresar sola.

## Beat 4 — Primera muerte

### Trigger
Primera muerte.

### Qué ve
Se frenan ticks y se explica:
- vidas de expedición
- retroceso
- que la run no se borra

### Fuerza
`Soft`

### Objetivo mental
Morir importa, pero no destruye la cuenta.

## Beat 5 — Elegir spec

### Trigger
Llega a `nivel 5`.

### Qué ve
Selector de las `2` specs de su clase.

### Fuerza
`Hard`

### Reglas especiales
- se frenan ticks
- no puede cambiar de tab hasta resolverlo

### Objetivo mental
Ahora la build ya no es genérica.

## Beat 6 — Presentación de Heroe

### Trigger
Spec elegida.

### Qué ve
Tutorial tab por tab:
- `Ficha`
- `Atributos`
- `Talentos`

### Fuerza
`Soft`

### Objetivo mental
`Heroe` es la casa de la build.

## Beat 7 — Primer atributo

### Trigger
Primera vez que entra a `Atributos`.

### Qué ve
Forzar gastar `1` punto.

### Fuerza
`Hard`

### Reglas especiales
- atributo libre
- si no tiene oro, se le da lo suficiente
- no puede irse de la vista hasta resolverlo

### Objetivo mental
Gastar cambia el personaje.

## Beat 8 — Primer talento

### Trigger
Termina el primer atributo.

### Qué ve
Forzar comprar `1` nodo básico de tramo 1.

### Fuerza
`Hard`

### Objetivo mental
Cada nivel ya tiene una dirección real.

## Beat 9 — Primer equip

### Trigger
Vuelve a combate, mata `2` enemigos más y recibe el primer drop garantizado si hiciera falta.

### Qué ve
- aparece `Mochila`
- spotlight para equipar `1` item

### Fuerza
`Hard`

### Objetivo mental
El loot sirve ahora, no más adelante.

## Beat 10 — Primer boss

### Trigger
Aparece el boss de `Tier 5`.

### Qué ve
Se frenan ticks y se explica:
- qué es un boss
- por qué es más peligroso
- por qué importa matarlo

### Fuerza
`Soft fuerte`

### Objetivo mental
La expedición ya tiene hitos mayores.

## Beat 11 — Desbloqueo de Caza

### Trigger
Derrota al primer boss.

### Qué ve
Spotlight de `Caza`.

### Resultado
`Caza` aparece como subvista de `Expedición`.

### Objetivo mental
La run también tiene dirección y objetivos.

## Beat 12 — Forja de campo

### Trigger
Primer item razonable para tocar `Forja`.

### Qué ve
Copy breve:
- `Reroll` arregla esta run
- la persistencia vendrá después

### Fuerza
`Passive`

### Objetivo mental
La forja de campo es táctica, no el lugar del proyecto persistente.

## Beat 13 — Extracción disponible

### Trigger
Después de que el jugador ya vio combate, muerte, build, equip y `Caza`; idealmente cerca de `Tier 9`.

### Qué ve
Se habilita el botón `Extraer al Santuario`.

### Fuerza
`Soft fuerte`

### Objetivo mental
Ya puede cerrar la run de forma controlada.

## Beat 14 — Primera extracción

### Trigger
Confirma la primera extracción.

### Qué ve
`ExtractionOverlay` muy guiado.

### Reglas especiales
- el item puede elegirse automáticamente la primera vez
- se fuerza al menos `1` bundle si hiciera falta

### Fuerza
`Hard`

### Objetivo mental
La expedición termina en `Extracción`, no en confusión.

## Beat 15 — Primer retorno al Santuario

### Trigger
Vuelve tras la primera extracción.

### Qué ve
- explicación breve del `Santuario`
- `Stash temporal`
- `Laboratorio`

### Resultado
Se desbloquea `Laboratorio`.

### Objetivo mental
Ahora aparece la segunda mitad del juego.

## Beat 16 — Primer research de Laboratorio

### Trigger
Entra al `Laboratorio` por primera vez.

### Qué ve
Research spotlighteado de `Destilería`.

### Reglas especiales
- tarda `15s`
- se espera y se reclama
- luego vuelve al hub

### Fuerza
`Hard`

### Objetivo mental
El tiempo real entra de forma pequeña y controlada.

## Beat 17 — Primera Destilería

### Trigger
`Destilería` ya desbloqueada + bundle garantizado de la primera extracción.

### Qué ve
Se fuerza iniciar una primera destilación.

### Fuerza
`Hard`

### Objetivo mental
El Santuario transforma botín en recursos.

## Beat 18 — Primeros Ecos

### Trigger
Segunda extracción con conversión real a ecos.

### Qué ve
Autoapertura de `Ecos`.

### Resultado
`Ecos` se vuelve visible.

### Objetivo mental
El prestige se siente como un quiebre real, no como un reset cualquiera.

## Beat 19 — Blueprint vs Desguace

### Trigger
Alcanza `Prestige 2`.

### Qué ve
Tutorial de las dos opciones sobre items rescatados.

### Qué explicamos
- `Desguace` convierte valor en cargas/materiales
- `Blueprint` no guarda el item exacto
- el plano se materializa en futuras runs como un item nuevo sesgado por su identidad

### Fuerza
`Hard`

### Objetivo mental
No me llevo el BIS final; me llevo dirección o materia prima.

## Beat 20 — Forja Profunda

### Trigger
`Prestige 3`.

### Qué ve
`Laboratorio` permite investigar `Forja Profunda`.

### Fuerza
`Soft fuerte`

### Reglas especiales
Si el jugador no tiene suficientes items para entender el sistema, podemos generar `2` items tutoriales.

### Objetivo mental
La persistencia avanzada llega recién cuando ya entiende planos.

## Beat 21 — Biblioteca

### Trigger
`Prestige 4`.

### Qué ve
`Laboratorio` permite investigar `Biblioteca`.

### Fuerza
`Soft`

### Objetivo mental
El conocimiento es otra capa del Santuario, no algo del early game.

## Beat 22 — Encargos

### Trigger
`Prestige 5`.

### Qué ve
`Laboratorio` permite investigar `Encargos`.

### Fuerza
`Soft`

### Objetivo mental
La progresión paralela entra recién cuando el loop base ya está asentado.

## Beat 23 — Altar de Sigilos

### Trigger
`Prestige 6`.

### Qué ve
`Laboratorio` permite investigar `Altar de Sigilos`.

### Fuerza
`Soft`

### Objetivo mental
La preparación avanzada de runs llega tarde a propósito.

## Beat 24 — Boss de Tier 25

### Trigger
Derrota al boss de `Tier 25`.

### Qué ve
Mensaje especial avisando que encontró el borde del Abismo.

### Resultado
En `Laboratorio` aparece `Portal al Abismo`.

### Objetivo mental
El endgame se gana; no se hereda sólo por push.

## Beat 25 — Portal al Abismo

### Trigger
Boss de `Tier 25` derrotado + `Forja Profunda`, `Biblioteca`, `Encargos` y `Altar` ya desbloqueados.

### Qué ve
Research de `Portal al Abismo`.

### Resultado
Recién ahora puede pasar de `Tier 25`.

### Objetivo mental
El Santuario también tiene que estar listo para el endgame.

## Beat 26 — Primer Abismo

### Trigger
Entra a `Tier 26` con el portal ya abierto.

### Qué ve
Interstitial corto del `Abismo`.

### Qué explicamos
- presión
- rewards
- cambio de ritmo
- nueva capa de progresión

### Objetivo mental
El juego cambió de fase.

---

## 6. Decisiones ya tomadas

- `Heroe` no se enseña al inicio.
- `spec` va en `nivel 5`.
- `Auto-avance` va después de `3` kills.
- la primera muerte frena ticks y explica el sistema
- `Caza` se desbloquea tras matar el primer boss, no al verlo
- la primera extracción se enseña tarde dentro de la primera run
- la primera extracción no da todavía `Ecos`
- `Ecos` entra en la segunda extracción
- `Blueprint vs Desguace` entra en `Prestige 2`
- `Forja Profunda` entra en `Prestige 3`
- `Biblioteca` entra en `Prestige 4`
- `Encargos` entra en `Prestige 5`
- `Altar de Sigilos` entra en `Prestige 6`
- `Abismo` se gatea con `Portal al Abismo` después del boss de `Tier 25`

---

## 7. Dudas abiertas

1. ¿`Heroe` al inicio conviene ocultarlo del todo o dejarlo gris como hint?
2. ¿El `Stash temporal` pre-`Prestige 2` necesita cap visible de `3` items para que el tutorial llegue limpio?
3. ¿`Portal al Abismo` debe requerir sólo unlocks previos o también costos fuertes de recursos?
