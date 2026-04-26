# Propuestas de refactor: Crafting, Afijos y Entropy

Fecha: 2026-04-26  
Base de análisis: `affixRefactor.md` + lectura puntual de motores/UI actuales.  
Objetivo: proponer 3 caminos completos de refactor para que el crafting sea más intuitivo, adictivo, divertido, mobile-friendly, monetizable de forma ética y compatible con timegating.  
Restricción explícita: sin gemas ni sockets.

---

## 0. Resumen ejecutivo

Mi recomendación es usar la **Propuesta 1: Forja por Entropy Budget** como núcleo del MVP, y tomar de la **Propuesta 2: Taller por Proyectos** sólo la capa de timers/colas para late-MVP o post-MVP.

La razón: el problema principal actual no es que falten acciones, sino que el sistema tiene demasiadas acciones que modifican cosas parecidas, dos dominios de forging con reglas distintas y Entropy fuera del loop donde realmente debería limitar la optimización. La Propuesta 1 ataca eso con menor riesgo técnico que una reconstrucción total y mantiene el loot como fuente de bases importantes.

Las 3 propuestas:

1. **Forja por Entropy Budget**
   - Cada item tiene un presupuesto visible de Entropy.
   - Crafting siempre resuelve, pero consume presupuesto.
   - Cuando se agota, el item queda estabilizado y no puede seguir perfeccionándose.
   - Es la opción más balanceada para MVP.

2. **Taller por Proyectos con timers**
   - El crafting fuerte vive en el Santuario como proyectos con duración real.
   - Los drops alimentan proyectos, memorias y materiales.
   - Es la opción con mejor timegating y monetización futura.

3. **Crafting por Intención**
   - El jugador no elige acciones técnicas sino intención: daño, defensa, sustain, economía, cierre.
   - La UI ofrece 2-3 resultados claros.
   - Es la opción más mobile-friendly y más legible, pero requiere rediseñar bastante el lenguaje de afijos.

---

## 1. Datos clave extraídos de la auditoría

### Estado actual

- Los items normales no tienen `entropy`.
- `entropy` existe sólo en reliquias de `sanctuary.relicArmory[]`.
- La UI de crafting de expedición hoy sólo expone `extract`, aunque el engine todavía tiene `upgrade`, `reroll`, `polish`, `reforge` y `ascend`.
- El Deep Forge sí expone una capa persistente con proyectos, jobs, ascensión y reforja profunda.
- Hay dos dominios de crafting con reglas distintas:
  - Item crafting de expedición: tiene límites por item.
  - Deep Forge: tiene costos crecientes y jobs, pero no tiene hard caps equivalentes para polish/reroll/reforge/ascend.
- El sistema actual permite convergencia fuerte a BIS en Deep Forge si hay suficiente tiempo y recursos.
- Hay ruido visual por T1/T2/T3, perfect rolls, rarity, itemTier, upgrade level, affix tier, rating y badges.
- El rating existe y ayuda, pero no es contextual por build.
- Los afijos son muchos, se aplican casi todos a weapon/armor, y hay duplicados por stat con diferencias difíciles de leer.

### Problema raíz

El juego ya tiene piezas valiosas:

- Drops con rareza, base, implícitos y affixes.
- Rating y comparador.
- Extracción como reciclaje.
- Reforge con preview y elección.
- Jobs/timers en Santuario.
- Telemetría útil para balance.

Pero el loop de crafting no tiene una única promesa clara. Hoy mezcla:

- Crafting inmediato.
- Crafting persistente.
- Proyectos.
- Upgrades.
- Reforge.
- Pulido.
- Ascensión.
- Entropy en reliquias.

El jugador necesita responder rápido:

- ¿Esta pieza vale?
- ¿Qué puedo mejorar?
- ¿Cuánto riesgo/presupuesto queda?
- ¿Cuándo debería parar?
- ¿Por qué no puedo convertir cualquier drop en perfecto?

El sistema actual responde eso parcialmente, pero con demasiado texto y demasiadas reglas.

---

## 2. Referencias externas relevantes

Estas referencias no son para copiar sistemas, sino para extraer patrones útiles.

### Last Epoch: Forging Potential

Fuente: https://forum.lastepoch.com/t/crafting-changes-coming-to-eternal-legends-update-0-8-4/45597

Patrones relevantes:

- Reemplazar falla/fractura por un presupuesto visible de craft.
- Cada craft consume una cantidad variable de presupuesto.
- Mientras queda presupuesto, el craft tiene resultado.
- El punto de no retorno se vuelve visible y entendible.
- Los buenos drops importan porque las mejores bases tienen más potencial y mejores líneas iniciales.
- El RNG positivo aparece cuando un craft consume menos de lo esperado o da progreso extra.
- El sistema evita que empezar desde un item vacío sea lo óptimo.

Aplicación local:

- Entropy puede convertirse en el equivalente conceptual de ese presupuesto.
- El objetivo no debería ser “fallar y romper”, sino “elegir bien dónde gastar presupuesto”.
- Los drops deben llegar con potencial distinto, no todos con el mismo techo.

### Diablo IV: menos affixes visibles, complejidad movida a crafting

Fuente: https://news.blizzard.com/en-gb/article/24077223/galvanize-your-legend-in-season-4-loot-reborn

Patrones relevantes:

- Reducir cantidad de affixes visibles ayuda a entender upgrades.
- Mover parte de la complejidad desde el drop crudo hacia sistemas de crafting puede mejorar legibilidad.
- Los “Greater Affixes” funcionan como señal de loot-only: no se pueden fabricar directamente, se descubren.
- Masterworking agrega prestigio y cierre sobre piezas ya buenas.
- Tempering agrega personalización, pero con durabilidad/cargas limitadas.

Aplicación local:

- Mantener máximo 3 affixes en legendary es correcto para MVP.
- Si existe una línea “especial” tipo perfect/T1, conviene que sea loot-first o loot-only.
- Crafting puede ayudar a terminar una pieza, pero no debería crear desde cero la mejor línea del juego.

Fuente adicional sobre la dirección posterior de Diablo IV: https://news.blizzard.com/en-gb/article/24243142/sanctuary-ignites-with-itemization-38-systems-changes

Patrón relevante:

- Cuando la aleatoriedad de una etapa genera demasiada frustración, se puede volver más directa y mover la chase a otra parte del sistema.

### Warframe: Foundry, timers, rush y colas

Fuente: https://support.warframe.com/hc/en-us/articles/38385820873741-Foundry-and-Crafting-FAQ

Patrones relevantes:

- Los blueprints muestran componentes, cantidad owned/needed, costo y tiempo.
- Una vez iniciado, el progreso se muestra con timer y porcentaje.
- Se puede reclamar cuando termina o acelerar con premium currency.
- El costo premium de rush baja a medida que avanza la construcción.
- El sistema pide confirmación antes de gastar premium currency.
- La monetización fuerte se apoya en acelerar o ampliar capacidad, no en vender directamente el resultado perfecto.

Aplicación local:

- El Santuario ya tiene jobs y slots: es una base técnica válida para timegating.
- La monetización futura más segura es acelerar jobs, abrir slots/colas o comprar comodidad, no vender power directo.
- El costo de acelerar debería decrecer con el tiempo restante.

---

## 3. Principios de diseño para cualquier refactor

### Principios duros

1. **Loot primero**
   - El mejor item debe empezar como buen drop, no como item blanco fabricado desde cero.

2. **Crafting como cierre**
   - Crafting debe convertir “casi bueno” en “usable/excitante”, no convertir basura en BIS.

3. **Una sola metáfora**
   - Si usamos Entropy, debe significar una cosa clara en items: presupuesto/riesgo de manipulación.

4. **Mobile-first**
   - Tres acciones máximas en pantalla primaria.
   - Costos y resultado probable visibles sin leer tooltip largo.
   - Cards compactas, acciones grandes, selección de línea por chips.

5. **RNG positiva**
   - Evitar falla que borra progreso.
   - Preferir resultados: consume menos Entropy, opción extra, mejora crítica, preview buena.

6. **No pay-to-perfect**
   - Monetización futura puede acelerar, dar comodidad o ampliar cola.
   - No debe vender Entropy infinito ni una línea perfecta directa.

7. **Telemetría desde el día 1**
   - Cada craft debe registrar intención, costo, Entropy antes/después, resultado, rating delta y si el item terminó equipado.

---

## 4. Propuesta 1: Forja por Entropy Budget

### Idea central

Cada item craftable tiene una barra visible:

`Entropy: 18 / 100`

Crafting agrega Entropy. Cuando llega al máximo, la pieza queda **estabilizada** y ya no acepta modificaciones finas.

La promesa para el jugador:

> “Esta pieza tiene X margen para trabajarla. Cada mejora usa parte de ese margen. Elegí dónde gastar.”

### Qué reemplaza

Reduce las acciones actuales a 3 acciones primarias:

1. **Mejorar**
   - Sube base power / upgrade level.
   - Acción directa.
   - Usa oro y poca Entropy.
   - No cambia identidad de affixes.

2. **Reforjar línea**
   - Elegís una línea.
   - Pagás preview.
   - Ves 2-3 opciones.
   - Elegís una o mantenés la actual.
   - Usa esencia y Entropy media/alta.

3. **Afinar**
   - Elegís una línea existente.
   - Mejora o rerolles el valor dentro de su identidad.
   - Usa esencia y Entropy baja/media.
   - Reemplaza el pulido actual.

Acciones secundarias:

- **Ascender**
  - Sigue existiendo, pero como momento de cierre.
  - Requiere item con cierto upgrade y Entropy disponible.
  - No debería limpiar Entropy ni abrir loops infinitos.

- **Extraer**
  - Sigue como reciclaje terminal.

### Cómo funciona Entropy

Campos nuevos sugeridos en item:

```json
{
  "crafting": {
    "entropy": 28,
    "entropyCap": 100,
    "stabilized": false,
    "craftHistory": [
      {
        "mode": "reforge_line",
        "affixIndex": 1,
        "entropyAdded": 18,
        "ratingDelta": 74
      }
    ]
  }
}
```

Regla general:

- `entropy` arranca en 0 o bajo.
- `entropyCap` depende de rareza, itemTier, calidad de drop y origen.
- Cada craft muestra rango antes de confirmar:
  - Mejorar: `+4-8 Entropy`
  - Afinar: `+8-14 Entropy`
  - Reforjar línea: `+14-26 Entropy`
  - Ascender: `+24-40 Entropy`
- Si el craft excede el cap, puede permitirse como “último craft” y luego estabilizar la pieza.
- La Entropy no regenera en items normales.
- No se compra Entropy adicional.

### Cómo evita fabricar BIS desde cero

1. **El item necesita buena base**
   - `entropyCap` alto sólo en buenos drops o proyectos extraídos de buenos drops.

2. **Las líneas top son loot-first**
   - Perfect roll, T1 visible/oculto o futura “línea mayor” puede venir de loot.
   - Crafting puede preservar o mejorar, pero no fabricar todas las mejores líneas desde cero.

3. **No hay reroll infinito**
   - Cada intento consume Entropy.

4. **Ascend no resetea Entropy**
   - Si ascender limpiara Entropy, sería un exploit directo.

5. **Bad base sigue siendo bad base**
   - Un item malo puede llegar a usable, pero queda sin presupuesto antes de convertirse en BIS.

### Loop de jugador

1. Drop.
2. Card muestra:
   - Rating delta.
   - 1-2 razones: `mejora arma`, `2 líneas build`, `alta estabilidad`.
   - Entropy disponible.
3. Jugador decide:
   - Equipar ahora.
   - Extraer.
   - Mandar a Forja.
4. En Forja:
   - Selecciona item.
   - Ve barra de Entropy.
   - Elige una de 3 acciones.
   - Ve preview/costo/rango de Entropy.
5. Cuando se estabiliza:
   - Item queda cerrado.
   - Puede equiparse, extraerse o conservarse.

### UX mobile

Pantalla primaria:

- Header compacto:
  - nombre, rareza, rating, delta vs equipado.
- Barra central:
  - `Entropy 28/100`
  - color según tramo: verde, ámbar, rojo.
- Líneas del item:
  - chips apilados.
  - cada chip muestra stat + valor + impacto.
  - tier técnico oculto por defecto.
- Bottom action rail:
  - `Mejorar`
  - `Afinar`
  - `Reforjar`
  - `Extraer`

Flujo de una acción:

- Tap en línea.
- Tap en acción.
- Bottom sheet con:
  - costo.
  - rango de Entropy.
  - resultado esperado.
  - botón confirmar.

### Monetización futura ética

Monetización posible:

- Acelerar trabajos de forja si una acción se manda como job.
- Comprar slots adicionales de cola.
- Comprar “preview extra” de reforja con límite diario y alternativa free.
- Comprar tokens de conveniencia que también se ganan jugando.
- Cosmetics del taller, animaciones, skins de UI.

Guardrails:

- No vender Entropy extra.
- No vender affix perfecto.
- No vender resultado garantizado BIS.
- No permitir comprar rerolls ilimitados sobre el mismo item.
- Si hay premium rush, el precio baja con el tiempo restante.
- Confirmación obligatoria antes de gastar premium.

### Timegating posible

MVP puede arrancar sin timers para no agregar fricción.

Late-MVP:

- Mejorar alto nivel tarda 15m, 1h, 4h.
- Ascender tarda 8h o 24h según rareza.
- La reforja puede ser instantánea, pero la estabilización final puede tardar.
- Slots de forja limitan trabajos simultáneos.
- Progreso offline.

### Cambios técnicos

Archivos principales:

- `src/engine/crafting/craftingEngine.js`
- `src/engine/sanctuary/projectForgeEngine.js`
- `src/constants/craftingCosts.js`
- `src/components/Crafting.jsx`
- `src/components/DeepForgeOverlay.jsx`
- `src/engine/stateInitializer.js`
- `src/utils/storage.js`
- `src/utils/runTelemetry.js`

Cambios:

- Agregar normalizador de `item.crafting.entropy`.
- Crear `getItemEntropyState(item)`.
- Crear `getEntropyCostRange(item, mode, affixIndex)`.
- Modificar craft actions para consumir Entropy.
- Hacer que Deep Forge use el mismo budget o tenga un budget derivado.
- Reemplazar límites por acción por un límite de presupuesto.
- Mantener `rerollCount`, `polishCount`, etc. como legacy/migración si hace falta.

### Migración de saves

Para items existentes:

- Si no tienen `crafting.entropy`, setear `0`.
- `entropyCap` inicial por rareza:
  - common: 30
  - magic: 45
  - rare: 70
  - epic: 85
  - legendary: 100
- Penalizar items ya muy trabajados:
  - sumar Entropy inicial por `rerollCount`, `polishCount`, `reforgeCount`, `ascendCount`.
- Mantener `affix.tier` interno al principio.

### Pros

- Muy entendible: barra de presupuesto.
- Reduce cantidad de reglas visibles.
- Baja riesgo de BIS infinito.
- Usa el concepto Entropy de forma central.
- Compatible con monetización futura sin vender poder directo.
- Se puede implementar incrementalmente.

### Contras

- Requiere tocar el shape de item y migración.
- Requiere recalibrar costos.
- Si los rangos de Entropy son demasiado amplios, puede frustrar.
- Si los caps son demasiado altos, no resuelve BIS.
- Si los caps son demasiado bajos, el crafting se siente irrelevante.

### Métricas de éxito

- `crafting_engagement_rate`: porcentaje de sesiones con al menos 1 craft.
- `crafts_per_kept_item`: crafts promedio sobre items que terminan equipados.
- `entropy_exhaustion_rate`: porcentaje de items estabilizados.
- `drop_to_equip_rate`: cuántos equips vienen directo de loot.
- `craft_to_equip_rate`: cuántos equips vienen tras craft.
- `bis_convergence_sim`: simulación de probabilidad de llegar a top 1% en N runs.
- `regret_rate`: items craftados y extraídos inmediatamente después.
- `mobile_action_time`: segundos desde abrir forja hasta confirmar acción.

### Roadmap de implementación

Fase 1:

- Agregar campos Entropy con migración.
- UI mínima de barra en item card / forge.
- No cambiar todavía drops.

Fase 2:

- Hacer que `polish`, `reforge`, `reroll`, `ascend` consuman Entropy.
- Mantener acciones actuales internamente, pero renombrar/ocultar.

Fase 3:

- Fusionar `reroll` dentro de `reforge` o moverlo a acción avanzada.
- Dejar 3 acciones visibles.

Fase 4:

- Llevar Deep Forge al mismo modelo.
- Agregar hard caps de proyecto.

Fase 5:

- Simulación y balance automático.
- Ajustar costos/caps por telemetría.

---

## 5. Propuesta 2: Taller por Proyectos con timers

### Idea central

El crafting fuerte deja de ser “editar un item” y pasa a ser:

> “Convertir un buen drop en un proyecto de Santuario.”

El jugador no fabrica un item perfecto desde cero. Encuentra una buena base, la convierte en proyecto, y el Santuario la trabaja mediante jobs con tiempos reales.

Esta propuesta aprovecha lo que ya existe en Deep Forge, pero lo ordena y lo convierte en el loop principal de crafting persistente.

### Qué reemplaza

La forja de expedición queda simple:

- Equipar.
- Extraer.
- Marcar como proyecto.

El Santuario concentra:

1. **Subir proyecto**
   - Job con duración.
   - Mejora rating/base.

2. **Focalizar línea**
   - Job corto/medio.
   - Elige una línea o familia de stat.

3. **Injertar memoria**
   - Usa una memoria extraída de drops previos.
   - No crea stats sin haber encontrado antes algo parecido.

4. **Ascender proyecto**
   - Job largo.
   - Sube generación/rareza/cap.
   - Puede permitir poder legendario si la base lo merece.

### Memorias de affix

Cuando extraés un item importante, puede generar:

```json
{
  "memoryId": "critChance_weapon_rare_02",
  "stat": "critChance",
  "family": "offense_precision",
  "slot": "weapon",
  "quality": 0.72,
  "sourceItemTier": 14,
  "uses": 1
}
```

Uso:

- Las memorias permiten orientar un proyecto.
- La calidad de la memoria limita el techo de la línea injertada.
- Encontrar buenos drops sigue siendo necesario.
- Extraer items deja de ser sólo “esencia”: también alimenta el taller.

### Cómo funciona Entropy

Cada proyecto tiene:

```json
{
  "entropy": 42,
  "entropyCap": 120,
  "stability": "volatile",
  "generation": 2
}
```

Reglas:

- Cada job agrega Entropy.
- Los jobs largos agregan menos Entropy por unidad de poder que acciones instantáneas.
- Estabilizar proyecto consume tiempo y materiales, pero no resetea totalmente el historial.
- Al llegar al cap, el proyecto se cierra.
- Ascender puede subir `entropyCap`, pero no limpiar todo.

### Loop de jugador

1. Run idle genera drops.
2. Jugador ve un item “Base de proyecto”.
3. Lo manda al Santuario.
4. En Taller:
   - elige proyecto.
   - elige job.
   - espera progreso offline.
5. Vuelve y reclama.
6. Decide:
   - seguir trabajando.
   - equipar.
   - estabilizar/cerrar.
   - extraer memoria.

### UX mobile

Pantalla principal del Taller:

- Lista vertical de proyectos.
- Cada proyecto muestra:
  - nombre.
  - rating.
  - próximo job recomendado.
  - timer si está activo.
  - Entropy.
- Top strip:
  - slots ocupados.
  - polvo.
  - esencia.
  - tinta.
- Tap en proyecto:
  - bottom sheet con 3 jobs recomendados.
  - cada job muestra duración, costo y resultado.

No hace falta mostrar todos los detalles de affix en la pantalla principal. Eso queda en “detalle avanzado”.

### Monetización futura ética

Esta es la propuesta con mejor monetización futura.

Opciones:

- Rush de job con precio decreciente según tiempo restante.
- Slots extra de taller.
- Cola de jobs.
- “Planificador maestro” para encadenar jobs mientras el jugador está offline.
- Paquetes de cosméticos del Santuario.
- Pase opcional con más contratos de materiales, sin affixes exclusivos.

Guardrails:

- Rush no mejora RNG.
- Rush no agrega EntropyCap.
- Slots extra aumentan throughput, no techo por item.
- Las memorias de alta calidad siguen viniendo del loot.
- Los tokens premium no deben reemplazar un buen drop.

### Timegating

Es el corazón de la propuesta.

Ejemplo de duración:

- Subir proyecto temprano: 5-15 min.
- Subir proyecto medio: 30-90 min.
- Subir proyecto alto: 4-8 h.
- Proyecto maestro: 24 h.
- Ascensión: 12-24 h.

Diseño de pacing:

- Early game: jobs cortos para enseñar.
- Mid game: 1-3 h para retorno diario.
- Late game: 8-24 h para aspiracional.
- Siempre progreso offline.

### Cómo evita fabricar BIS desde cero

- Todo proyecto nace de un drop.
- Las mejores memorias nacen de drops.
- Las memorias tienen calidad y usos.
- Cada proyecto tiene EntropyCap.
- Cada generación aumenta costo y tiempo.
- El número de slots de taller limita throughput.
- Una base mala no puede superar el techo de su calidad/origen.

### Cambios técnicos

Archivos principales:

- `src/engine/sanctuary/projectForgeEngine.js`
- `src/state/reducerDomains/blueprintForgeReducer.js`
- `src/engine/sanctuary/jobEngine.js`
- `src/state/reducerDomains/sanctuaryJobsReducer.js`
- `src/engine/sanctuary/extractionEngine.js`
- `src/components/DeepForgeOverlay.jsx`
- `src/components/ExtractionOverlay.jsx`
- `src/engine/stateInitializer.js`

Cambios:

- Convertir Deep Forge en sistema principal, no paralelo.
- Definir schema único de `project`.
- Agregar `affixMemories`.
- Hacer que extracción pueda generar memoria.
- Agregar Entropy y caps a proyecto.
- Bloquear loops infinitos de polish/reroll/reforge.
- Reducir Crafting de expedición a extracción/proyecto.

### Pros

- Excelente para idle/incremental.
- Excelente para timegating.
- Monetización futura natural y ética.
- Hace que volver al juego tenga motivo.
- Usa infraestructura existente de jobs.
- Evita spam de clicks de crafting.

### Contras

- Refactor más profundo.
- Riesgo de que el jugador sienta que todo está bloqueado por timers.
- Requiere muy buena UX de colas.
- Requiere calibrar duración/recompensa con cuidado.
- Puede sentirse menos inmediato que una forja directa.

### Métricas de éxito

- `job_start_rate`: proyectos iniciados por sesión.
- `job_claim_rate`: jobs reclamados vs iniciados.
- `return_after_job_rate`: retorno después de timer completo.
- `rush_intent_rate`: cuántas veces el jugador toca acelerar sin comprar real todavía.
- `project_abandon_rate`: proyectos empezados y nunca reclamados/equipados.
- `memory_use_rate`: memorias generadas vs usadas.
- `direct_drop_equip_rate`: preservar valor del loot directo.

### Roadmap de implementación

Fase 1:

- Formalizar project schema.
- Agregar EntropyCap y hard caps.
- Corregir loops infinitos actuales de Deep Forge.

Fase 2:

- Agregar memorias desde extracción.
- UI compacta para memorias.

Fase 3:

- Simplificar `DeepForgeOverlay` a lista de proyectos + jobs.
- Ocultar acciones técnicas redundantes.

Fase 4:

- Conectar Crafting de expedición con “Enviar a proyecto”.

Fase 5:

- Agregar rush simulado con moneda earnable.
- Medir intención antes de cualquier monetización real.

---

## 6. Propuesta 3: Crafting por Intención

### Idea central

El jugador no elige `reroll`, `polish`, `reforge`, `ascend`.

Elige intención:

- “Quiero más daño”
- “Quiero aguantar más”
- “Quiero curarme/sostenerme”
- “Quiero farmear mejor”
- “Quiero cerrar esta pieza”

El sistema traduce esa intención a pools de affixes, costos, riesgos y opciones.

La promesa para el jugador:

> “Decime qué querés lograr; la forja te muestra 2-3 caminos claros.”

### Qué reemplaza

Acciones visibles:

1. **Empujar daño**
   - Usa pool offense/crit/speed/status.

2. **Reforzar defensa**
   - Usa pool defense/sustain.

3. **Mejorar economía**
   - Usa pool loot/xp/essence/luck.

4. **Cerrar pieza**
   - Mejora valor, estabiliza o asciende.

Internamente puede seguir usando reforge/polish/reroll, pero el jugador no ve esa taxonomía.

### Cómo funciona Entropy

Entropy representa “cuánto forzaste el destino de esta pieza”.

- Cada intención agrega Entropy.
- Repetir la misma intención sobre el mismo item agrega más Entropy.
- Cambiar intención también agrega un extra, para evitar pivot infinito.
- Al Entropy alto, el sistema te avisa:
  - “Último intento antes de estabilizar.”

### Resultados posibles

Al confirmar intención, se abre una selección de cartas:

1. Opción segura
   - Mejora pequeña.
   - Bajo Entropy.

2. Opción enfocada
   - Cambia una línea hacia la intención.
   - Entropy medio.

3. Opción audaz
   - Mayor upside.
   - Entropy alto.
   - Puede traer línea rara o mejor valor, pero cierra antes la pieza.

Esto genera tensión positiva sin esconder reglas.

### Cómo evita fabricar BIS desde cero

- La opción audaz no puede crear líneas loot-only.
- Las mejores cartas sólo aparecen si la base ya tiene señal relevante.
- Cada item tiene EntropyCap.
- “Cerrar pieza” es terminal o casi terminal.
- Comprar rerolls de cartas no compra más Entropy.

### UX mobile

Es la mejor propuesta para mobile.

Pantalla:

- Item arriba.
- Debajo: `Qué querés hacer?`
- 4 botones grandes:
  - Daño
  - Defensa
  - Sustain
  - Botín
- Luego aparecen 2-3 cartas.
- Cada carta muestra:
  - impacto estimado.
  - costo.
  - Entropy.
  - una frase corta.

No se necesita mostrar T1/T2/T3 en la vista primaria.

### Monetización futura ética

Opciones:

- Comprar/ganar “cartas extra” con límite.
- Acelerar “cerrar pieza” si se convierte en job.
- Más presets de intención/build.
- Cola de crafting automatizado.
- Cosmetics de cartas/forja.

Guardrails:

- Las cartas extra no pueden ignorar Entropy.
- No vender intención “perfecta”.
- No vender acceso exclusivo a un pool de stat.
- Si hay compra de rerolls, tiene cap por item o por día.

### Timegating posible

- Las intenciones usan cargas.
- Cargas se regeneran con tiempo.
- Cargas también se ganan por contratos/weekly/expedición.
- “Cerrar pieza” puede ser job de Santuario.

Ejemplo:

- 3 cargas de intención rápidas por día.
- 1 carga de cierre por día.
- Proyectos largos usan slots de taller.

### Cambios técnicos

Archivos principales:

- `src/data/affixes.js`
- `src/engine/affixesEngine.js`
- `src/engine/crafting/craftingEngine.js`
- `src/components/Crafting.jsx`
- `src/utils/itemPresentation.js`
- `src/utils/lootHighlights.js`

Cambios:

- Definir taxonomía de affixes por intención.
- Arreglar categorías para que no sean sobrescritas de forma confusa.
- Crear `craftIntentEngine`.
- Crear generador de opciones por intención.
- UI nueva de cartas.
- Telemetría por intención.

### Pros

- Muy legible.
- Muy mobile-friendly.
- Baja clutter técnico.
- Buena para nuevos jugadores.
- Permite copy y UX más expresivos.
- Puede convivir con EntropyCap.

### Contras

- Más abstracta: jugadores expertos pueden sentir menos control.
- Requiere buen mapeo de afijos a intención.
- Si las cartas son demasiado obvias, el jugador siempre elige la misma.
- Si las cartas son demasiado vagas, se siente opaco.
- Puede ocultar demasiado el sistema para balance fino.

### Métricas de éxito

- `intent_selection_distribution`: distribución entre daño/defensa/sustain/economía.
- `option_pick_distribution`: segura/enfocada/audaz.
- `craft_confirm_rate`: cuántas previews terminan en confirmación.
- `craft_cancel_rate`: previews canceladas.
- `time_to_first_craft`: desde desbloqueo hasta primer craft.
- `mobile_misclick_rate`: selección/cancelación rápida accidental.
- `post_craft_equip_rate`: si el resultado termina equipado.

### Roadmap de implementación

Fase 1:

- Crear tags de intención en data de affixes.
- No cambiar todavía generación.

Fase 2:

- Implementar preview de intención usando engine actual.

Fase 3:

- UI mobile-first de cartas.

Fase 4:

- Agregar EntropyCap y límites.

Fase 5:

- Integrar charges/timegating.

---

## 7. Matriz comparativa

| Criterio | Propuesta 1: Entropy Budget | Propuesta 2: Proyectos + timers | Propuesta 3: Intención |
|---|---:|---:|---:|
| Legibilidad | Alta | Media/alta | Muy alta |
| Mobile-friendly | Alta | Media/alta | Muy alta |
| Riesgo técnico | Medio | Alto | Medio/alto |
| Control anti-BIS | Alto | Muy alto | Alto |
| Sensación idle/incremental | Media | Muy alta | Media |
| Monetización futura ética | Alta | Muy alta | Alta |
| Timegating | Media | Muy alta | Alta |
| Compatibilidad con sistema actual | Alta | Media | Media |
| Profundidad endgame | Alta | Muy alta | Media/alta |
| Velocidad para MVP | Alta | Media/baja | Media |

Conclusión de matriz:

- Para MVP: **Propuesta 1**.
- Para Santuario/timegating: tomar piezas de **Propuesta 2**.
- Para UX mobile: tomar lenguaje y cartas de **Propuesta 3**, aunque el motor sea Propuesta 1.

---

## 8. Recomendación concreta

### Camino recomendado

Implementar un híbrido ordenado:

1. Núcleo de sistema: **Propuesta 1**
   - Entropy budget por item/proyecto.
   - Crafting limitado por presupuesto, no por muchos contadores separados.

2. Capa de UX: tomar de **Propuesta 3**
   - Acciones visibles simples.
   - Cards de opciones.
   - Ocultar T1/T2/T3 en primaria.

3. Capa de timegating futura: tomar de **Propuesta 2**
   - Jobs para ascensión/proyectos maestros.
   - Rush/slots como monetización ética futura.

### Por qué no arrancaría directamente con Propuesta 2 completa

Porque el juego ya tiene muchas capas de Santuario, contratos, weekly, extracción, codex y deep forge. Si todo el crafting pasa de golpe a proyectos con timers, se puede volver lento y difícil de evaluar antes de que el core de Entropy esté calibrado.

Primero conviene resolver:

- Qué significa Entropy.
- Cuánto presupuesto tiene un item.
- Qué acciones lo consumen.
- Qué hace que una base sea buena.

Después tiene sentido timegatear las partes de mayor impacto.

---

## 9. MVP propuesto sin gems/sockets

### Crafting visible MVP

Acciones visibles:

1. **Mejorar**
   - Sube `+N`.
   - Costo: oro.
   - Entropy baja.

2. **Afinar línea**
   - Seleccionás una línea.
   - Mejora/reroll de valor dentro de esa stat.
   - Costo: esencia.
   - Entropy media.

3. **Reforjar línea**
   - Seleccionás una línea.
   - Preview de 2-3 opciones.
   - Costo: esencia + polvo si es profundo.
   - Entropy alta.

4. **Extraer**
   - Destruye item.
   - Devuelve esencia/materiales/memoria si aplica.

Acción avanzada:

- **Ascender**
  - Sólo aparece si el item cumple condiciones.
  - Idealmente se vuelve job o cierre significativo.

### Qué se oculta

- T1/T2/T3 en card primaria.
- Duplicados técnicos de affix.
- Contadores individuales de reroll/polish/reforge.
- Detalles de categoría interna.

### Qué se muestra

- Rating delta.
- Entropy.
- Costo.
- Resultado esperado.
- Si la acción puede cerrar el item.
- Razón de recomendación.

---

## 10. Modelo de monetización futura ética

### Permitido

- Acelerar un job ya iniciado.
- Aumentar slots de taller.
- Aumentar cola offline.
- Comprar previews extra con límite.
- Comprar cosmetics.
- Comprar convenience packs de materiales comunes si también se ganan jugando y no rompen caps.

### Evitar

- Vender affix perfecto.
- Vender EntropyCap.
- Vender BIS directo.
- Vender protección ilimitada contra límites.
- Vender reroll infinito.
- Vender acceso exclusivo a mejores pools.

### Reglas de seguridad

- Todo efecto con poder debe tener ruta free.
- Todo gasto premium debe mostrar confirmación.
- El precio de rush debe bajar con el tiempo restante.
- El pago no debe cambiar odds escondidas.
- Si hay probabilidades, deben ser visibles.
- Cada item debe mantener un techo no comprable.

---

## 11. Analytics necesarios para balance inteligente

Eventos nuevos o ampliados:

```json
{
  "event": "craft_preview_opened",
  "mode": "reforge_line",
  "itemRarity": "epic",
  "itemTier": 14,
  "entropyBefore": 42,
  "entropyCap": 100,
  "selectedAffixStat": "critChance",
  "costEssence": 380,
  "optionCount": 3
}
```

```json
{
  "event": "craft_applied",
  "mode": "reforge_line",
  "entropyAdded": 21,
  "entropyAfter": 63,
  "ratingBefore": 1840,
  "ratingAfter": 1925,
  "equippedAfter": true,
  "keptCurrent": false,
  "source": "item_forge"
}
```

Métricas globales:

- Tiempo hasta primer craft.
- Crafts por sesión.
- Crafts por item.
- Porcentaje de items estabilizados.
- Porcentaje de items que se equipan tras craft.
- Ratio de extracción vs conservación.
- Rating delta promedio por acción.
- Costo por punto de rating ganado.
- Entropy promedio gastada por rareza.
- Distribución de acciones por rareza.
- Porcentaje de piezas con 0, 1, 2, 3 affixes alineados a build.
- Probabilidad simulada de llegar a top 1%, top 5%, top 10%.

Para IA de balance:

- Exportar snapshots con distribución de drops, crafts, costos, resultados y equip decisions.
- Versionar reglas de crafting (`craftingRulesVersion`).
- Guardar `entropyBefore/After` para analizar dónde el sistema se siente demasiado generoso o demasiado restrictivo.

---

## 12. Riesgos técnicos por propuesta

### Propuesta 1

Riesgos:

1. Migración de save por nuevo `crafting.entropy`.
2. Doble sistema temporal si conviven counters viejos y Entropy.
3. Desbalance inicial de caps.
4. Necesidad de recalcular preview/costos.
5. UI puede quedar con demasiada info si no se retiran badges viejos.

Mitigación:

- Agregar Entropy sin eliminar campos legacy.
- Mantener compatibilidad por una versión.
- Simular 10k-100k crafts por rareza antes de ajustar.
- Ocultar counters viejos en UI.

### Propuesta 2

Riesgos:

1. Requiere rehacer ownership entre Crafting, Deep Forge y Extraction.
2. Timers mal calibrados pueden matar momentum.
3. Más estados persistidos y más migración.
4. Jobs pendientes pueden romperse si cambia el schema.
5. UI de colas puede ocupar mucho espacio en mobile.

Mitigación:

- Primero hard caps y schema.
- Después memorias.
- Después timers/rush.
- Mantener jobs versionados.

### Propuesta 3

Riesgos:

1. Requiere taxonomía sólida de affixes.
2. Puede ocultar demasiado para jugadores avanzados.
3. Balancear cartas es más complejo que balancear acciones directas.
4. Las recomendaciones pueden parecer arbitrarias si no explican impacto.
5. Puede duplicar lógica con engine actual si se implementa como capa superficial.

Mitigación:

- Crear `intentTags` en data.
- Mantener modo avanzado.
- Telemetría por carta.
- Mostrar razón corta por opción.

---

## 13. Riesgos de diseño a vigilar

1. **Crafting demasiado determinista**
   - Mata loot chase.

2. **Crafting demasiado aleatorio**
   - Se siente injusto y opaco.

3. **Timers demasiado tempranos**
   - El jugador todavía no está invertido y siente bloqueo.

4. **Monetización antes de confianza**
   - Primero hay que demostrar que el sistema es justo sin pagar.

5. **Entropy como castigo**
   - Debe sentirse como presupuesto estratégico, no como multa.

6. **Demasiadas monedas**
   - Oro, esencia, polvo, tinta, flux, Entropy y futuras cargas pueden saturar.

7. **Affixes sin identidad**
   - Si todas las stats son “más rating”, se pierde agencia.

---

## 14. Decisiones que conviene tomar antes de implementar

### Decisión 1: Qué significa Entropy

Recomendación:

- En items/proyectos, Entropy debe ser presupuesto de manipulación.
- No moneda.
- No regeneración pasiva.
- No recurso premium.
- No riesgo invisible.

### Decisión 2: Qué puede fabricar crafting

Recomendación:

- Puede mejorar valores.
- Puede cambiar una línea limitada.
- Puede cerrar una pieza.
- No puede crear todas las mejores líneas desde cero.

### Decisión 3: Qué queda loot-only

Opciones:

- Perfect roll.
- T1 interno.
- Affix mayor.
- Legendary power.
- High EntropyCap.

Recomendación MVP:

- Mantener T1 interno como loot-favored, ocultarlo en UI primaria.
- No permitir que crafting garantice T1/perfect.

### Decisión 4: Qué acciones quedan visibles

Recomendación:

- `Mejorar`
- `Afinar`
- `Reforjar`
- `Extraer`
- `Ascender` sólo contextual.

### Decisión 5: Timers ahora o después

Recomendación:

- Ahora: Entropy y simplificación.
- Después: timers para ascensión/proyectos maestros.

---

## 15. Implementación recomendada por fases

### Fase 0: Preparación

- Congelar ids de affixes actuales.
- Crear `craftingRulesVersion`.
- Agregar tests/simuladores de crafting.
- Definir naming final de Entropy en UI.

### Fase 1: Entropy mínimo

- Agregar `entropy` y `entropyCap` a items/proyectos.
- Migrar saves.
- Mostrar barra en UI.
- No cambiar todavía todos los costos.

### Fase 2: Costos por Entropy

- `polish`, `reforge`, `reroll`, `ascend` consumen Entropy.
- Si un craft agota presupuesto, estabiliza.
- Mantener logs claros.

### Fase 3: Simplificación visible

- Ocultar `reroll` como acción primaria.
- Fusionar lenguaje:
  - polish -> Afinar.
  - reforge -> Reforjar línea.
  - upgrade -> Mejorar.
- Ocultar T1/T2/T3 en vista primaria.

### Fase 4: Deep Forge coherente

- Aplicar EntropyCap a proyectos.
- Hard cap de ascension/generation.
- Evitar reroll/reforge/polish infinito.

### Fase 5: UX mobile

- Bottom sheets para acciones.
- Cards de opciones.
- Acción recomendada.
- Modo avanzado para detalle técnico.

### Fase 6: Timegating

- Mover ascensión/proyecto maestro a jobs.
- Agregar slots/colas.
- Agregar rush simulado con moneda earnable.
- Medir intención antes de monetización real.

### Fase 7: Balance IA

- Exportar payloads por versión.
- Simular progresión.
- Ajustar caps/costos.
- Medir BIS convergence.

---

## 16. Qué mantendría, qué eliminaría, qué rediseñaría

### Mantener

- Base + implicit + affixes.
- Máximo 3 affixes en legendary para MVP.
- Rating y comparador.
- Reforge con preview y elección.
- Extracción.
- Jobs del Santuario.
- Telemetría de drops/crafting.

### Eliminar o esconder

- T1/T2/T3 en UI primaria.
- Contadores separados visibles por acción.
- Reroll total como acción primaria.
- Deep Forge sin hard caps.
- Duplicados de affix sin identidad clara.
- Entropy periférica sólo en reliquias.

### Rediseñar

- Entropy como presupuesto.
- Ascend como cierre, no reset.
- Deep Forge como proyecto timegated.
- Affix categories para que realmente gobiernen pools.
- Rating contextual por build, al menos como capa de recomendación.

---

## 17. Cierre

El mejor camino para MVP no es sumar más crafting. Es hacer que cada item tenga una pregunta clara:

> “¿Vale gastar mi presupuesto de Entropy en esta base?”

Si la respuesta es sí, el jugador entra en un loop corto, legible y adictivo:

1. Encontré algo prometedor.
2. Tengo poco margen para mejorarlo.
3. Elijo dónde invertir.
4. Veo una mejora o una opción interesante.
5. La pieza queda más cerca de cerrarse.
6. Vuelvo a lootear porque necesito otra buena base.

Ese loop protege el loot, permite timegating, abre monetización ética futura y reduce la carga mental en mobile.
