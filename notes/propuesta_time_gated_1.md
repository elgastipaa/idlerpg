# Diseño: Mecánicas Time-Gated
## Dos versiones: Retención Sana vs Retención + Monetización

Fecha: 2026-04-15
Contexto: IdleRPG con prestige, crafting, loot hunt, Abismo, bosses seededados, clases Warrior/Mage, sigils de run, rare como proyecto de crafting.

---

## TABLA RESUMEN — 20 MECÁNICAS

| # | Nombre | Era | Tipo | Timer | Decisión central | Monetización | Riesgo | Implementación |
|---|---|---|---|---|---|---|---|---|
| 1 | Forja en Reposo | Early | Pasiva | 2–6h | Qué item poner en cola | Safe | Bajo | Baja |
| 2 | Cola de Destilación | Early/Mid | Pasiva | 4–8h | Qué recurso destilar primero | Safe | Bajo | Baja |
| 3 | Resonancia de Ecos | Mid | Activa | 12–24h | Cuándo activar, qué amplificar | Safe | Medio | Media |
| 4 | Contrato de Cazador | Mid | Activa | 48–72h | Qué boss elegir, cuándo completar | Safe | Bajo | Media |
| 5 | Cámara de Incubación | Mid | Pasiva | 8–16h | Qué power incubar, orden de cola | Safe | Medio | Media |
| 6 | Ciclo de Abismo | Late | Activa | 72–96h | Qué estrato preparar, cuándo entrar | Safe | Medio | Alta |
| 7 | Altar de Prestige | Late | Activa | 24h | Qué bonus activar antes de prestigiar | Safe | Bajo | Baja |
| 8 | Memoria de Run | Mid/Late | Pasiva | 6–12h | Qué configuración guardar | Conveniencia | Bajo | Baja |
| 9 | Mercado Flotante | Mid | Activa | Rota 48h | Qué comprar antes que rote | Medio | FOMO suave | Media |
| 10 | Ritual de Clase | Mid | Activa | 7 días | Cuándo completar el ritual | Safe | Bajo | Media |
| 11 | Expedición Autónoma | Mid/Late | Pasiva | 4–12h | A qué zona enviar, qué traer | Safe | Bajo | Alta |
| 12 | Grieta Temporal | Late | Activa | 3 días | Cuándo entrar, qué build usar | Safe | Medio | Alta |
| 13 | Archivo de Codex | Late | Pasiva | Account-wide | Qué familia priorizar esta semana | Safe | Bajo | Baja |
| 14 | Taller del Herrero | Early/Mid | Activa | 3–8h | Qué receta construir, orden de materiales | Safe | Bajo | Media |
| 15 | Pacto de Sangre | Late/Abismo | Activa | Por run | Cuándo activar, qué sacrificar | Peligroso | Alto | Alta |
| 16 | Vela del Abismo | Late | Pasiva | 24h | Cuántas encender, cuándo apagar | Conveniencia | Medio | Media |
| 17 | Turno de Guardia | Early | Activa | 8h | A quién asignar, qué proteger | Safe | Bajo | Baja |
| 18 | Sintonía de Sigil | Mid | Pasiva | 48–72h | Qué sigil sintonizar esta semana | Safe | Bajo | Baja |
| 19 | Fragmentación de Boss | Late/Abismo | Activa | 5–7 días | Qué fragmentos priorizar | Conveniencia | Medio | Alta |
| 20 | Legado de Prestige | Account-wide | Pasiva | Permanente | Qué legado activar al iniciar run | Safe | Bajo | Media |

---

## DESARROLLO DE LAS 10 MEJORES MECÁNICAS

---

### 1. Forja en Reposo

**Fantasy de jugador**: "Puse mi arma a mejorar antes de dormir. Al despertar está lista."

**Inspiración**: Warframe (crafting queue), Clash of Clans (builder).

**Loop exacto**:
El jugador selecciona un item del inventario y lo pone en la Forja en Reposo. El item se somete a un proceso de upgrade automático — un nivel por ciclo. Al completarse, el item tiene +1 nivel de upgrade aplicado sin costo de fail chance. El jugador puede tener 1 slot de forja activo (2 con upgrade de monetización futura).

**Timer**: 2h por nivel de upgrade. Un item a +5 desde cero tarda 10h total.

**Decisión que genera**:
- ¿Qué item vale la pena poner? (el que uso ahora o el que estoy craftando)
- ¿Lo pongo antes de dormir para que esté listo mañana?
- ¿Cancelo para poner otro item más urgente?

**Recurso que consume**: ninguno de los existentes — consume "tiempo de forja" (nuevo recurso implícito).

**Recompensa**: upgrade sin fail chance. No es más rápido que el crafting manual, pero es seguro. El upgrade manual sigue siendo más flexible — podés hacer varios en una sesión. La forja es para el jugador que no va a estar.

**Impacto en retención**: crea razón de abrir el juego a la mañana. "Ver qué salió de la forja" es el loop de Warframe en miniatura.

**Monetización futura**: slot adicional de forja ($4.99 permanente). Acelerar el timer con Ecos. Nunca acelerar con dinero directo.

**Riesgo de diseño**: bajo. No da ventaja sobre crafting manual, solo conveniencia.

**Complejidad de implementación**: baja. Es una cola con timestamp y una función que aplica upgrade sin fail chance al completarse.

---

### 2. Cola de Destilación

**Fantasy de jugador**: "Mis runs generan materia prima. La destilo para convertirla en algo útil."

**Inspiración**: OGame (producción de recursos), Melvor Idle (procesamiento offline).

**Loop exacto**:
Los items que el jugador no equipa ni vende pueden ponerse en la Cola de Destilación. En lugar de descartarse instantáneamente, se "procesan" en un timer y producen esencia o fragmentos de affix. La calidad del item determina el output: un common da esencia básica, un rare da fragmentos de affix de su familia.

**Timer**: 
- Common: 30 min → esencia pequeña
- Magic: 1h → esencia media
- Rare: 3h → fragmento de affix de su familia
- Epic: 6h → fragmento de affix + fragmento de poder

**Decisión que genera**:
- ¿Destilo este rare o lo uso para crafting directo?
- ¿Qué familia de affix necesito más esta semana?
- ¿Lleno la cola antes de cerrar el juego?

**Recurso que consume**: slots de cola (2 base, expandible).

**Recompensa**: esencia y fragmentos de affix. Los fragmentos son un recurso nuevo — se usan para "garantizar" un affix específico en el próximo reroll (reduce el RNG sin eliminarlo).

**Impacto en retención**: el jugador que antes descartaba items ahora los pone en cola. Cada item tiene valor. Abre el juego para ver qué destilaron.

**Monetización futura**: slots adicionales de cola. Acelerar con Ecos. Fragmentos como item vendible en tienda de Ecos (rotativo).

**Riesgo de diseño**: medio. Los fragmentos de affix reducen el RNG del crafting — hay que calibrar cuánto garantizan para no romper la economía de crafting del rare.

**Complejidad de implementación**: baja/media. Cola con timestamps. Nuevo recurso (fragmento) que interactúa con craftingEngine.js.

---

### 3. Resonancia de Ecos

**Fantasy de jugador**: "El Abismo deja una resonancia en mi personaje. Si la activo en el momento justo, amplifica mi próxima run."

**Loop exacto**:
Cada vez que el jugador completa tiers en el Abismo, acumula "Resonancia" — un recurso que se carga pasivamente después de cada run de Abismo (no de runs normales). Al iniciar una nueva run, puede activar la Resonancia para obtener un bonus temporal que dura esa run completa. La Resonancia se descarga al usarla y tarda 12–24h en recargarse.

**Timer**: 12h recarga en Abismo I, 18h en Abismo II, 24h en Abismo III.

**Bonus de Resonancia (elige uno al activar)**:
- +20% PP ganados esta run
- +15% loot quality esta run
- +25% esencia drop esta run
- Primer boss de la run no tiene mecánicas adicionales (Abismo only)

**Decisión que genera**:
- ¿Activo la Resonancia en una run corta o la guardo para una run larga?
- ¿Qué bonus elige según el sigil activo?
- ¿Vale la pena esperar las 24h para tener Resonancia en una run importante?

**Recurso que consume**: la Resonancia acumulada (se gasta al activar).

**Recompensa**: bonus de run temporal, no permanente. Nunca cambia el poder del personaje — cambia el output de una run específica.

**Impacto en retención**: crea un ritual de "revisar si tengo Resonancia cargada antes de arrancar una run seria". Ciclo de 12–24h perfectamente alineado con sesiones diarias.

**Monetización futura**: "Cristal de Resonancia" — ítem de tienda que permite tener 2 cargas de Resonancia simultáneas ($3.99). Safe porque no da poder, da flexibilidad.

**Riesgo de diseño**: medio. Si el bonus es demasiado grande, el jugador siente que las runs sin Resonancia son "runs perdidas". Mantener el bonus en rango 15–25% lo hace valioso pero no obligatorio.

**Complejidad de implementación**: media. Nuevo recurso con timer, UI de selección de bonus al iniciar run, integración con gameReducer.

---

### 4. Contrato de Cazador

**Fantasy de jugador**: "Acepté un contrato para cazar al Void Titan. Tengo 3 días para completarlo."

**Inspiración**: Monster Hunter (contratos), Warframe (misiones de caza).

**Loop exacto**:
Cada 48h aparece un nuevo Contrato de Cazador — un objetivo específico de boss con condiciones y recompensa definida. El jugador puede aceptarlo (solo 1 activo a la vez) y tiene una ventana de tiempo para completarlo. Completarlo da una recompensa especial. Rechazarlo o dejarlo expirar no penaliza — simplemente aparece uno nuevo en 48h.

**Ejemplos de contratos**:
```
"Mata al Iron Sentinel antes del tier 20 — Recompensa: Fragmento épico + 200 Ecos"
"Mata al boss de tier 25 sin morir — Recompensa: Legendary power guaranteed"
"Mata a cualquier boss Eco de Abismo I — Recompensa: Pack de esencia grande"
```

**Timer**: ventana de 72h para completar una vez aceptado.

**Decisión que genera**:
- ¿Acepto este contrato o espero el próximo?
- ¿Tengo la build correcta para completar la condición?
- ¿Cambio de sigil para facilitar el contrato?

**Recurso que consume**: ninguno para aceptar. El costo es el tiempo y la planificación de run.

**Recompensa**: siempre mejor que el loot normal — el contrato justifica el esfuerzo adicional.

**Impacto en retención**: crea urgencia suave con ventana generosa. El jugador planifica su próxima run alrededor del contrato.

**Monetización futura**: "Tablero de Contratos Premium" — 2 contratos simultáneos en lugar de 1 ($4.99 permanente). Safe porque no da poder directo, da más opciones de elección.

**Riesgo de diseño**: bajo. La ventana de 72h es generosa. No expira progreso — solo la oportunidad.

**Complejidad de implementación**: media. Sistema de generación de contratos con pool de condiciones, timer de expiración, integración con sistema de bosses seededados.

---

### 5. Cámara de Incubación

**Fantasy de jugador**: "Tengo un poder legendario incubando. En 8 horas voy a ver qué salió."

**Inspiración**: Warframe (incubación de companions), Pokémon GO (huevos).

**Loop exacto**:
Los fragmentos de poder legendario que dropean en el Abismo no se revelan instantáneamente. Van a la Cámara de Incubación, donde "maduran" durante un timer. Al completarse, el jugador descubre qué poder legendario era. Puede tener 2 fragmentos incubando simultáneamente.

El jugador sabe la familia del fragmento antes de incubar (ej: "Fragmento de poder — familia Void") pero no el poder específico hasta que completa. Esto crea anticipación sin información completa.

**Timer**: 
- Fragmento common: 2h
- Fragmento rare: 6h
- Fragmento epic: 12h
- Fragmento de Abismo: 16h

**Decisión que genera**:
- ¿Qué fragmento incubo primero — el que necesito más o el más valioso?
- ¿Cancelo una incubación para meter un fragmento mejor?
- ¿Espero a tener 2 fragmentos buenos antes de incubar?

**Recurso que consume**: slots de incubación (2 base).

**Recompensa**: descubrimiento de legendary power. Si ya lo tenés en el Codex, avanza el mastery. Si es nuevo, lo desbloquea.

**Impacto en retención**: "Tengo un fragmento incubando" es el loop de Warframe más puro. El jugador vuelve a ver qué salió. Alta frecuencia de retorno.

**Monetización futura**: slot adicional de incubación ($3.99). Acelerar con Ecos. Safe porque no cambia qué power sale — solo cuándo lo sabés.

**Riesgo de diseño**: medio. Si los timers son muy largos, frustra. Si son muy cortos, pierden el valor de anticipación. 6–12h es el rango correcto para el fragmento principal.

**Complejidad de implementación**: media. Cola con timestamps, sistema de revelación, integración con Codex engine.

---

### 6. Expedición Autónoma

**Fantasy de jugador**: "Mandé a mis exploradores al Abismo mientras yo no estaba. Volvieron con botín."

**Inspiración**: Warframe (Railjack crew missions), Grim Dawn (facciones).

**Loop exacto**:
El jugador desbloquea slots de Expedición en mid-game. Puede enviar una "expedición" a una zona específica — un tier del Abismo o una familia de enemigos — y después de un timer, la expedición regresa con loot. El loot es proporcional a la dificultad de la zona enviada, pero siempre menor que el loot de una run activa al mismo tier.

No reemplaza el gameplay activo — lo complementa. Una expedición al Abismo I trae loot de calidad Abismo I, pero menos cantidad que una run completa.

**Timer**: 4h (zona early) a 12h (Abismo III).

**Decisión que genera**:
- ¿A qué zona envío? (mayor riesgo, mayor recompensa)
- ¿Envío ahora o espero a tener un mejor slot disponible?
- ¿Priorizo loot de familia específica para el Codex o loot general?

**Recurso que consume**: "Cartas de Expedición" — recurso que se genera 1 por día, máximo 3 en stock.

**Recompensa**: loot de la zona enviada — items, esencia, fragmentos de Codex.

**Impacto en retención**: el jugador que se va a dormir manda una expedición. Al despertar tiene loot esperando. Loop de Warframe/Clash sin ser idle puro.

**Monetización futura**: slot adicional de expedición ($5.99). Cartas adicionales en tienda de Ecos. Peligroso si se venden muchas cartas — puede convertirse en P2W de loot.

**Riesgo de diseño**: alto si el loot de expedición es demasiado bueno. Tiene que ser claramente inferior al gameplay activo para no reemplazarlo.

**Complejidad de implementación**: alta. Sistema de zonas, cálculo de loot proporcional, UI de envío y retorno, integración con inventario.

---

### 7. Altar de Prestige

**Fantasy de jugador**: "Antes de abandonar este ciclo, activo el altar. Me llevo algo extra al siguiente."

**Loop exacto**:
24h antes de hacer prestige, el jugador puede "activar" el Altar de Prestige — una acción que congela un bonus específico de la run actual y lo lleva al próximo ciclo como un buff temporal que dura las primeras 2 horas de la run siguiente.

El bonus disponible en el altar rota cada 24h (independiente de si el jugador prestigia o no):

```
Lunes:    +30% oro primeras 2h de run
Martes:   +20% loot quality primeras 2h
Miércoles: +1 talent point bonus al iniciar run
Jueves:   Primer upgrade de la run sin fail chance
Viernes:  +25% XP primeras 2h
Sábado:   Item guaranteed en tier 5
Domingo:  +50% Ecos producidos primeras 2h
```

**Timer**: el bonus del altar dura exactamente 2h de run activa (no tiempo real).

**Decisión que genera**:
- ¿Prestigio hoy para aprovechar el bonus de mañana?
- ¿Espero al domingo para llevarme el bonus de Ecos?
- ¿Cuál bonus encaja mejor con mi sigil de la próxima run?

**Recurso que consume**: ninguno. Solo requiere la acción de activar antes de prestigiar.

**Recompensa**: buff temporal de run, no permanente.

**Impacto en retención**: crea un "momento correcto para prestigiar" que varía según el día. El jugador piensa "hoy es buen día para prestigiar" — eso es planificación, no presión.

**Monetización futura**: "Ver los próximos 3 días de altar" ($1.99 permanente). Safe, es información, no poder.

**Riesgo de diseño**: bajo. El buff es temporal y pequeño. No cambia el power ceiling.

**Complejidad de implementación**: baja. Tabla de bonuses por día de semana, flag de activación, aplicación del buff al iniciar run.

---

### 8. Sintonía de Sigil

**Fantasy de jugador**: "Mi sigil de Forge lleva 3 días sintonizándose. Cuando lo active va a estar en su máximo poder."

**Loop exacto**:
Los sigils no solo se eligen al iniciar run — pueden "sintonizarse" entre runs. Cada sigil tiene un nivel de sintonía que sube pasivamente con el tiempo (no con uso). Un sigil completamente sintonizado da un bonus adicional cuando se usa en run.

```
Sintonía base (sin espera):   sigil funciona normal
Sintonía media (24h de espera): +10% efectividad del sigil
Sintonía completa (72h de espera): +20% efectividad + bonus exclusivo
```

El jugador solo puede sintonizar 1 sigil a la vez. Si cambia de sigil en sintonización, pierde el progreso.

**Timer**: 72h para sintonía completa.

**Decisión que genera**:
- ¿Qué sigil sintonizo esta semana? (implica compromiso de 3 días)
- ¿Uso el sigil sintonizado ahora o espero a tener la build correcta para maximizarlo?
- ¿Vale la pena cancelar la sintonía actual para cambiar de plan?

**Recurso que consume**: tiempo. Solo 1 sigil en sintonización simultánea.

**Recompensa**: efectividad aumentada del sigil y un bonus exclusivo por sigil:
```
Forge sintonizado:    reforge gratis 1 vez por run
Ascend sintonizado:   +3 tiers alcanzables esta run
Hunt sintonizado:     legendary power guaranteed si llegás a tier 20+
Dominion sintonizado: Codex kills cuentan doble esta run
Free sintonizado:     +40% PP esta run (el sigil baseline se vuelve rentable)
```

**Impacto en retención**: ciclo de 72h que crea planificación semanal. El jugador piensa en qué sigil quiere para el fin de semana y lo pone a sintonizar el miércoles.

**Monetización futura**: "Cristal de Sintonía" — acelera sintonía en 24h ($2.99). Safe, es conveniencia pura.

**Riesgo de diseño**: bajo/medio. Si el bonus de sintonía es demasiado grande, el jugador siente que las runs sin sintonía son subóptimas. Mantener en 10–20% es el rango correcto.

**Complejidad de implementación**: baja. Timer por sigil, tabla de bonus por sigil sintonizado, integración con sistema de sigils existente.

---

### 9. Grieta Temporal

**Fantasy de jugador**: "Se abrió una grieta en el Abismo. Tengo 3 días para entrar. Adentro, las reglas cambian."

**Inspiración**: Warframe (Void Fissures), PoE (league mechanics).

**Loop exacto**:
Cada 5–7 días aparece una Grieta Temporal — un evento de contenido especial con modificadores únicos que duran toda la grieta. La grieta dura 3 días. El jugador puede entrar en cualquier momento durante esos 3 días.

Adentro, los tiers se juegan con 2–3 modificadores globales activos (positivos y negativos mezclados). El loot dentro de la grieta tiene una tabla especial — incluye items con affixes que no existen fuera de ella.

```
Ejemplo de Grieta:
  Modificador negativo: Los bosses tienen +1 mecánica adicional
  Modificador positivo: Todo el loot es de rareza mínima Magic
  Modificador positivo: Los Ecos de Abismo se producen ×2 mientras estés en la grieta
  Loot exclusivo: "Fragmento Fracturado" — material de crafting de grieta
```

**Timer**: 3 días de ventana de acceso. Una vez que entrás, la run es normal.

**Decisión que genera**:
- ¿Los modificadores de esta grieta favorecen mi build actual?
- ¿Entro ahora o espero a tener mejor gear?
- ¿Uso sigil Ascend o Hunt en la grieta?

**Recurso que consume**: ninguno para entrar. El costo es la dificultad aumentada.

**Recompensa**: loot especial de grieta, Fragmentos Fracturados (material de crafting exclusivo).

**Impacto en retención**: evento periódico que rompe la monotonía. "Esta semana hay grieta" es razón de jugar más activamente.

**Monetización futura**: peligroso si los Fragmentos Fracturados son demasiado poderosos. Safe si son cosméticos o comodidades. Vender "acceso extendido a la grieta" si expira sería dark pattern — no recomendado.

**Riesgo de diseño**: medio/alto. Si la grieta da items demasiado buenos, los jugadores que no pueden jugar esa semana se sienten FOMO real. Mantener el loot exclusivo en cosméticos o materiales de comodidad, nunca en poder directo.

**Complejidad de implementación**: alta. Sistema de generación de modificadores, tabla de loot especial, UI de grieta, integración con sistema de tiers.

---

### 10. Fragmentación de Boss

**Fantasy de jugador**: "Llevo semanas cazando al Blood Matriarch. Estoy coleccionando sus fragmentos para desbloquear algo único."

**Inspiración**: Monster Hunter (materiales de boss), Warframe (partes de warframe).

**Loop exacto**:
Cada boss tiene un set de 4 "Fragmentos de Esencia" que dropean con baja probabilidad al matarlo. Coleccionar los 4 fragmentos de un boss desbloquea una "Reliquia de Boss" — un item único con un affix exclusivo de ese boss que no existe en el loot normal.

Los fragmentos son account-wide y persisten entre runs. El drop rate es bajo pero aumenta con el Boss Mastery del Codex.

```
Ejemplo: Blood Matriarch
  Fragmento 1: Garra de la Matriarca    (drop ~15% por kill)
  Fragmento 2: Sangre Cristalizada      (drop ~10% por kill)
  Fragmento 3: Velo de Leech            (drop ~8% por kill)
  Fragmento 4: Corazón del Vacío        (drop ~5% por kill)
  
  Reliquia: "Manto de la Matriarca" — armor con affix exclusivo "Leech Oscuro"
```

**Timer**: no es time-gated en el sentido estricto — es RNG-gated con progreso visible. El timer es la frecuencia con que el boss aparece según el seed de run.

**Decisión que genera**:
- ¿Elijo el sigil Hunt para aumentar chances de fragmentos?
- ¿Priorizo un boss específico en el seed de esta run?
- ¿Uso el Contrato de Cazador para garantizar encuentros con el boss que necesito?

**Recurso que consume**: tiempo de run y planificación de seed.

**Recompensa**: Reliquia de Boss — item con affix exclusivo, no disponible de otra forma. No es el item más poderoso del juego pero tiene identidad única.

**Impacto en retención**: coleccionismo de largo plazo. El jugador que lleva 2 semanas cazando al Void Titan para completar su set tiene una razón muy concreta de volver.

**Monetización futura**: "Rastreador de Fragmentos" — muestra qué fragmentos tenés y cuántos kills necesitás estadísticamente para completar el set ($2.99 permanente). Información, no poder. Safe.

**Riesgo de diseño**: medio. Si los drop rates son demasiado bajos, se vuelve frustrante. Si son muy altos, no hay chase. El Codex mastery que aumenta el drop rate es el regulador natural.

**Complejidad de implementación**: alta. Sistema de fragmentos por boss, tabla de drop rates, crafting de Reliquias, integración con Codex mastery.

---

## SECCIÓN DE RIESGOS

### Mecánicas peligrosas o predatorias — señaladas explícitamente

| Mecánica | Riesgo | Por qué |
|---|---|---|
| Pacto de Sangre (#15) | Alto | Sacrificar progreso de run por poder — puede crear ansiedad de decisión y frustración si sale mal |
| Grieta Temporal (#9) | Medio/Alto | Si el loot exclusivo es poder directo, crea FOMO real para jugadores que no pueden jugar esa semana |
| Expedición Autónoma (#6) | Medio | Si se venden muchas cartas de expedición, el jugador pagador lootea significativamente más que el F2P |
| Mercado Flotante (#9 tabla) | Medio | Rotación de 48h crea presión de "comprar antes que se vaya" — FOMO clásico de gacha |

### Regla de oro para no volverse tóxico

> Ningún item time-gated debe dar poder que el F2P no pueda obtener por otros medios. La diferencia entre pagador y F2P debe ser **velocidad y comodidad**, nunca **poder máximo alcanzable**.

---

## LAS DOS VERSIONES

---

### VERSIÓN A — Retención Sana

**Filosofía**: el jugador siempre se siente bien. Si no juega una semana, no perdió nada — solo no ganó los bonuses de esa semana. Sin FOMO de poder.

**Mecánicas recomendadas** (en orden de prioridad):

1. Forja en Reposo — conveniencia pura, sin ansiedad
2. Cámara de Incubación — anticipación positiva, sin pérdida
3. Altar de Prestige — planificación, no presión
4. Sintonía de Sigil — compromiso semanal voluntario
5. Contrato de Cazador — urgencia suave con ventana generosa
6. Fragmentación de Boss — coleccionismo de largo plazo
7. Resonancia de Ecos — ritual diario sin obligación
8. Cola de Destilación — valor agregado a items que antes se descartaban

**Lo que esta versión NO incluye**: Mercado Flotante con rotación agresiva, Grieta con loot de poder exclusivo, Expedición con cards vendibles.

**Retención esperada**: alta en jugadores ARPG y casual-ARPG. Baja en jugadores que necesitan presión externa para volver. Ideal para tu audiencia objetivo.

---

### VERSIÓN B — Retención + Monetización

**Filosofía**: más fricciones suaves, más oportunidades de acelerar o expandir. El F2P puede llegar a todo, pero más lento o con menos comodidad.

**Mecánicas adicionales sobre Versión A**:

1. **Mercado Flotante** — rotación de 48h con ítems de comodidad. Crea urgencia de revisión frecuente. Monetizable con "reservar un ítem del mercado por 24h adicionales" ($0.99 por reserva).

2. **Expedición Autónoma con Cards** — las cartas de expedición se generan 1/día F2P, 2/día con pack ($3.99/mes o $1.99 pack de 10 cartas). Borderline — requiere que el loot de expedición sea claramente inferior al activo.

3. **Grieta Temporal con loot cosmético exclusivo** — el loot exclusivo de grieta son cosméticos y títulos, nunca stats. Monetizable con "extensión de acceso de 24h" si la grieta expiró ($1.99). Safe si el loot no es poder.

4. **Vela del Abismo** — el jugador puede "encender velas" antes de entrar al Abismo que amplifican el loot durante X tiers. Las velas se generan pasivamente (1 cada 8h, cap 3). Monetizable con pack de velas extra en tienda de Ecos.

5. **Cola de Destilación con slots extra vendibles** — base 2 slots, hasta 4 comprables ($2.99 por slot adicional). Safe porque el output de destilación no es poder directo.

**Tensiones a monitorear en Versión B**:
- Las cartas de expedición vendibles son el elemento más borderline. Si el loot de expedición supera cierto umbral de calidad, se vuelve P2W.
- El mercado flotante tiene que tener solo ítems de comodidad — nunca legendary powers, talent points, o items directos.
- La extensión de grieta solo funciona como monetización safe si el loot de grieta es cosmético.

---

## ROADMAP RECOMENDADO EN 3 FASES

### Fase 1 — Lanzamiento (implementar primero)

Sistemas de baja complejidad, alto impacto en retención, sin riesgo de diseño.

```
1. Forja en Reposo              → razón de volver a la mañana
2. Cola de Destilación          → valor a items descartados
3. Altar de Prestige            → ritual de prestige con planning
4. Sintonía de Sigil            → compromiso semanal voluntario
5. Contrato de Cazador          → urgencia suave, Monster Hunter feel
```

**Objetivo de Fase 1**: que el jugador tenga razones de abrir el juego todos los días aunque no tenga tiempo para una run larga.

---

### Fase 2 — Post-lanzamiento (1–3 meses)

Sistemas de complejidad media que expanden el loop sin romper el balance.

```
6. Cámara de Incubación         → anticipación de legendary powers
7. Resonancia de Ecos           → ritual diario de Abismo
8. Fragmentación de Boss        → coleccionismo de largo plazo
9. Expedición Autónoma          → loot pasivo complementario
10. Mercado Flotante (Versión B) → revisión frecuente, monetización suave
```

**Objetivo de Fase 2**: que el jugador de mid-game tenga siempre 3–4 cosas "cocinando" simultáneamente.

---

### Fase 3 — Endgame (3–6 meses)

Sistemas de alta complejidad para el jugador hardcore que llegó al Abismo.

```
11. Grieta Temporal              → evento periódico de contenido especial
12. Ciclo de Abismo              → meta-planificación de estratos
13. Legado de Prestige           → progresión account-wide adicional
14. Vela del Abismo (Versión B)  → recurso pasivo de Abismo
15. Sintonía de Sigil avanzada   → doble sintonía con Abismo IV unlock
```

**Objetivo de Fase 3**: que el jugador que completó el árbol de prestige y llegó al Abismo III todavía tenga sistemas nuevos descubriendo.

---

## TOP 5 POR CATEGORÍA

### Top 5 para implementar primero
1. Forja en Reposo — impacto inmediato, complejidad mínima
2. Altar de Prestige — cambia el ritual de prestige sin tocar el sistema
3. Sintonía de Sigil — expande los sigils existentes sin nuevo sistema
4. Cola de Destilación — da valor a items que hoy no tienen uso
5. Contrato de Cazador — Monster Hunter feel, muy alineado con la audiencia ARPG

### Top 5 con mejor monetización futura
1. Cámara de Incubación — slots adicionales, modelo probado (Warframe)
2. Expedición Autónoma — cards vendibles, alto engagement
3. Cola de Destilación — slots adicionales, compra natural
4. Forja en Reposo — slot adicional de forja, primera compra obvia
5. Sintonía de Sigil — cristales de aceleración, safe y conveniente

### Top 5 con mejor relación impacto / costo de implementación
1. Altar de Prestige — baja implementación, alto impacto en ritual de prestige
2. Sintonía de Sigil — baja implementación, expande sistema existente
3. Resonancia de Ecos — media implementación, ritual diario claro
4. Forja en Reposo — baja implementación, loop de Warframe en miniatura
5. Contrato de Cazador — media implementación, urgencia semanal natural

### Top 3 combinaciones más adictivas

**Combinación 1 — "El jugador que planifica"**
```
Sintonía de Sigil + Altar de Prestige + Contrato de Cazador
```
El jugador sintoniza el sigil el miércoles, revisa el altar del domingo, acepta el contrato que encaja con ambos, y planifica la run del fin de semana. Tres sistemas que se refuerzan sin pisarse. Ciclo semanal natural.

**Combinación 2 — "El jugador que colecciona"**
```
Cámara de Incubación + Fragmentación de Boss + Cola de Destilación
```
El jugador destila items para conseguir fragmentos, incuba los powers que dropean los bosses que caza, y completa sets de Reliquias de Boss. Tres sistemas de largo plazo que crean progreso visible siempre activo.

**Combinación 3 — "El jugador de Abismo"**
```
Resonancia de Ecos + Grieta Temporal + Expedición Autónoma
```
El jugador manda expediciones al Abismo mientras duerme, vuelve con la Resonancia cargada para aprovechar la Grieta de la semana, y entra a la grieta con el máximo de recursos acumulados. Ciclo de 3–5 días muy satisfactorio para el jugador hardcore.

---

*Documento generado como parte del diseño de IdleRPG. Revisión: Lead GD session 2026-04-15.*
*Versión A: Retención Sana. Versión B: Retención + Monetización.*
