# DESIGN_BRIEF_REFERENTES.md

## Informe maestro para un idle ARPG web mobile-first

---

## 0. Resumen ejecutivo

Este documento sintetiza la investigación de catorce referentes (Gladiatus, Travian, PoE1, PoE2, Grim Dawn, Diablo Immortal, Genshin Impact, Torchlight Infinite, Diablo 3, Diablo 4, RS3, OSRS, Warframe, WoW) para extraer las decisiones de diseño aplicables a un idle ARPG web mobile-first con equipo pequeño, sin backend complejo y monetización ética estricta.

**La tesis central es simple**: el proyecto no debe competir por profundidad bruta —PoE y Grim Dawn dominan ese espacio— sino por **densidad semántica por tap** en pantalla de 360–430px, con una filosofía "vender inventario y vanidad, nunca poder" tomada de GGG/Warframe, un ritmo de retención híbrido entre resin de Genshin y leagues de PoE, y un compendio estilo RuneScape/Transmog-WoW que convierta cada drop en memoria permanente. La longevidad no vendrá de un endgame infinito clásico (ese camino es caro) sino de **variedad lateral bien calibrada**: Devotions de Grim Dawn + Codex de D4 + Sigils de Prestige propios, operando como tres ejes ortogonales que se cruzan.

**El mayor riesgo detectado** es replicar la trampa que hundió a Gladiatus, Travian Kingdoms, Diablo Immortal y RS3: monetizar el ritmo del loop core. El riesgo secundario es el que atrapó a PoE2 en 0.2 y a D4 en S1: castigar la experimentación del jugador. Todo lo demás —layout, feedback, onboarding— es ejecución.

El juego, si ejecuta estas decisiones, puede ocupar un nicho que ningún referente del mercado cubre hoy: un idle ARPG que se juega en minutos pero se recuerda en meses, con la integridad económica de OSRS y la accesibilidad mobile de Diablo Immortal despojada de sus dark patterns.

---

## 1. Pasada 1 — Síntesis de referentes

### 1.1 Ranking de referentes por relevancia para el proyecto

1. **Path of Exile 1** — máxima relevancia. Currency-as-crafting y monetización de stash tabs son trasladables casi 1:1 al brief (crafting complejo + inventario en pantalla pequeña). Benchmark ético del género.
2. **Warframe** — el único live-service F2P que sobrevivió doce años con reputación intacta. Su filosofía "play for free, pay to save time" y Nightwave gratuito son el modelo de ingresos más defendible.
3. **Grim Dawn** — referente supremo de build diversity con contenido estático, ideal para equipo pequeño sin backend. Devotions son la mecánica más adaptable del grupo.
4. **Genshin Impact** — escuela de time-gating éticamente aceptado (resin), onboarding invisible con micro-reward, y anti-FOMO maduro (Chronicled Wish, Paimon's Bargains).
5. **Old School RuneScape** — grind "elegido", bonds como time-as-currency bidireccional, polling democrático. Modelo de confianza comunitaria que ningún otro juego ha replicado.
6. **Diablo 4 (post-Season 4)** — Codex of Power + Tempering/Masterworking resuelven el "vendor trash" que afecta a todo ARPG con inventario limitado. Crítico para mobile.
7. **World of Warcraft** — Transmog wardrobe account-wide y Trading Post son el modelo cosmético más maduro. Level-up ceremonial como plantilla de keystone ritual.
8. **Diablo 3** — Greater Rifts como contenedor infinito con timer. El formato más económico de endgame (una actividad cubre cuatro funciones).
9. **Path of Exile 2** — más útil como advertencia (respec punitivo, nerfs apilados) que como plantilla, aunque el Atlas Passive Tree merece trasplante.
10. **Diablo Immortal** — producción mobile de referencia (radial skills, drag-to-aim) envuelta en el peor caso de estudio ético del género.
11. **Torchlight Infinite** — demuestra que ARPG denso cabe en 360–430px, pero con errores de UX/monetización documentados que el proyecto puede evitar gratuitamente.
12. **Travian** — alliance bonuses por donación colectiva son la mecánica social trasladable; todo lo demás es advertencia.
13. **Gladiatus** — daily login con refuerzo intermitente y arena asincrónica con cap de ataques son las dos cosas rescatables. El resto es cautionary tale.
14. **RuneScape 3** — relevancia casi exclusivamente negativa. Es el manual de cómo MTX mal ejecutada canibaliza un MMO saludable.

### 1.2 Las 15 ideas de diseño más valiosas extraídas

1. **Currency-as-crafting con doble función mecánica/económica** — PoE1. Cada craft consume un ítem-moneda que también puede intercambiarse; elimina la inflación del oro y da valor residual a drops low-tier.
2. **Compendio agregador tipo Completionist Cape** — RS3/OSRS. Un ítem/título visible que une Boss Codex + Quest Log + crafting mastery + keystones; siempre hay "una casilla más".
3. **Transmog/Appearances account-wide** — WoW. Cada drop queda catalogado como apariencia permanente aunque se venda/destruya. Resuelve inventario y crea identidad visual.
4. **Codex of Power como biblioteca de aspects permanentes** — D4 post-S4. Salvar un legendary imprime un aspect reutilizable; el drop no se pierde, su utilidad se conserva.
5. **Tempering + Masterworking como capas de agencia post-drop** — D4 post-S4. El drop es materia prima, no sentencia; el jugador elige qué afixes imprimir y refinar.
6. **Devotion Constellations con celestial powers asignables** — Grim Dawn. Grid de constelaciones con affinity gates + procs que se anclan a skills propias; eje ortogonal al árbol de talentos.
7. **Resin-style energy sobre recompensas, no sobre combate** — Genshin. El jugador siempre puede pelear y probar; solo la reclamación de recompensas de contenido instanciado consume energía.
8. **Greater Rifts como contenedor infinito con timer** — D3. Una sola actividad escalable cubre progresión vertical, loot, leaderboard y meta; económico para equipo pequeño.
9. **Leagues trimestrales con economy reset opcional** — PoE + OSRS Leagues/Deadman. Temporada con Sigils/relics que rompen reglas; el jugador conserva su Standard paralelo.
10. **Bonds / Platinum tradeables como time-as-currency bidireccional** — OSRS + Warframe. El rico en tiempo paga con juego, el rico en dinero paga con dinero; nadie se excluye.
11. **Nightwave-style battle pass 100% gratis** — Warframe. El pase narrativo/retención no se monetiza; el ingreso viene de cosméticos, slots y acceleradores opcionales.
12. **Trading Post cosmético rotativo con currency free** — WoW. Currency ganada por logueo + tasks; los ítems rotan y eventualmente regresan, eliminando FOMO terminal.
13. **Radial skill layout con drag-to-aim + upgrade transfer al swap** — Diablo Immortal. Ataque básico grande en zona del pulgar, skills fan-out, transferencia de mejoras al equipar gear nuevo.
14. **Onboarding invisible por tooltips con micro-reward** — Genshin. Ningún modal bloqueante; cada tutorial visto da una unidad de moneda premium; archivo consultable.
15. **Alliance bonuses por donación colectiva escalable** — Travian. Guilds donan un recurso para desbloquear modifiers globales por tier; compromiso social sin presencia sincrónica y con backend trivial.

### 1.3 Las 5 trampas de diseño más comunes a evitar

1. **Monetizar el ritmo del loop core.** RS3 vendió XP con Treasure Hunter y lo desmanteló en 2025 tras admitir que "erosionó la integridad del juego". Travian Gold Club vende farm-list automático y resetea la experiencia PvE. Cada hora de grind dejó de tener sentido para el no-pagador.
2. **Castigar la experimentación con respec punitivo.** PoE2 en 0.2 pidió 2000 gold por respec en nivel 51; comentarios destacados en Reddit (citados por GamesRadar) describían jugadores que "sostenían puntos de habilidad por miedo a equivocarse" y streamers top (Zizaran, Quin69) calificando la experiencia como "la peor que hemos tenido".
3. **Apilar nerf + reducción de loot + aumento de dificultad en un solo parche.** PoE2 0.2 "Dawn of the Hunt" derrumbó las reviews recientes a Mostly Negative. La lección: cambia un eje por parche, nunca tres a la vez.
4. **Borrowed power que se pierde al prestigiar.** WoW Shadowlands (Covenants, Conduits, Soulbinds) generó más de mil comentarios en un solo hilo de Reddit y llevó a Blizzard a abandonar la fórmula en Dragonflight. La sensación de "salgo de la expansión más débil que entré" destruyó retención.
5. **F2P-friendly en el onboarding, paywall revelado en late-game.** Diablo Immortal dejó correr veinte horas amables antes de mostrar que las Legendary Gems 5★ exigen inversiones estimadas en seis cifras; la disingenuidad del director ("no hay forma de conseguir gear con dinero") cristalizó la palabra "PlsBuy" y un review-bomb histórico en Metacritic.

### 1.4 Las 3 filosofías de monetización más sostenibles

1. **"Vender inventario y vanidad, nunca poder" (PoE/GGG).** Stash tabs + cosméticos + supporter packs con cosmético exclusivo + battle pass cosmético trimestral. Lo que se vende escala con el engagement legítimo (el que más juega necesita más inventario). Chris Wilson en foros oficiales mantiene esta línea desde 2013.
2. **"Todo lo vendible es también farmeable" (Warframe/DE).** Steve Sinclair en Gamescom 2024: "fair monetization — colores gratis, skins raras con currency in-game o dinero real". Platinum tradeable con fricción anti-abuso, Prime Access siempre farmeable, Nightwave 100% gratis. Doce años sin escándalo mayor.
3. **"Sub mínima + bonds bidireccionales" (OSRS).** Membership simple y bonds como puente entre tiempo y dinero. Jagex cobra una vez por bond; el trading P2P subsiguiente subsidia a jugadores ricos en tiempo. El CEO admitió en 2026 que RS3 "erosionó la integridad" —OSRS, con menos revenue inmediato, terminó reputacionalmente más fuerte y con crecimiento más sostenido.

---

## 2. Pasada 2 — Sistemas: qué agregar, qué modificar, qué sacar

### 2.1 Sistemas nuevos recomendados

**Appearance Wardrobe account-wide (inspiración: WoW Transmog).** Genera sensación de **identidad curada**: cada drop, incluso el vendido, queda coleccionado visualmente. Aparece en **early-mid**, al desbloquear la primera rareza épica. Se conecta al Inventory (liberándolo de "guardar skins"), al Boss Codex (trofeos visibles) y al eventual cosmetic pass. Riesgo: si el transmog tiene costos punitivos, se siente como impuesto; mitigar con costo simbólico en moneda-de-craft. No requiere tutorial (una sola tab "Collection" con filtros). Monetización ética asociada: presets premium, tintes exclusivos, efectos de skill VFX — todos cosméticos.

**Codex of Power / Aspect Library (inspiración: D4 post-Season 4).** Genera la sensación de que **ningún legendary se desperdicia jamás**. Al salvage de un ítem legendario se extrae el aspect a una biblioteca reutilizable; si aparece uno de mejor roll, upgradea el Codex. Aparece en **mid**, después del primer boss significativo. Se conecta con crafting (aspects imprimibles sobre gear base vía reforge/ascend) y con el Talent Tree (algunos aspects interactúan con keystones). Riesgo: puede homogeneizar builds si los aspects cubren todo; mitigar manteniendo affixes T1/T2/T3 como fuente principal de identidad. Tutorial corto al primer legendary. Monetización ética: categorías cosméticas de "engraving" (no más slots, sino presentación de aspects desbloqueados).

**Devotion Constellations (inspiración: Grim Dawn).** Genera la sensación de **buildcraft paralelo con gates orgánicos**: el jugador completa estrellas pequeñas para desbloquear estrellas mayores por afinidad. Aparece en **mid-late**, como capa adicional al árbol de talentos. Cada constelación completa otorga passive + procs asignables a skills propias (celestial power). Se conecta con specs (algunas constelaciones tienen sinergia con Berserker o Juggernaut) y con enemy families (afinidades que matchean traits). Riesgo: paralysis si el grid se muestra completo; mitigar con progressive reveal (solo ves lo que estás a un nodo de alcanzar). Tutorial mínimo, se explica al entrar. Cero potencial de monetización —y debe ser así para preservar integridad.

**Infinite Rift Ladder (inspiración: D3 Greater Rifts).** Genera la sensación de **techo personal siempre visible**: el tier máx alcanzado es el número más importante del perfil. Una actividad escalable por tiers con timer, donde completar bajo el tiempo habilita el siguiente tier. Aparece en **late**, tras terminar campaign. Se conecta con dungeons con modificadores (son sub-variantes), con Prestige (Ecos y Sigils amplifican tier max), y con leaderboards seasonales. Riesgo: si se convierte en única actividad de endgame, burnout tipo D3; mitigar acoplando explícitamente al Codex, Devotions y contratos. Sin tutorial, se presenta como "Torre". Monetización ética: título cosmético por tier, nada mecánico.

**Energy/Resin sobre recompensas (inspiración: Genshin).** Genera la sensación de **permiso de cerrar la app sin perder**. El combate tick corre siempre; solo la **reclamación de rewards de contenido instanciado** (dungeon loot, sigil farm, boss drop chest) gasta energía, que regenera lentamente con cap acumulable tipo Condensed Resin. Aparece en **early-mid**, al desbloquear la primera dungeon. Se conecta con contratos diarios (los contratos son la forma óptima de gastar energía), con Prestige (Ecos pueden incrementar cap). Riesgo crítico: si se gate combate o XP, se vuelve Diablo Immortal; mitigar con regla dura "el tick nunca gasta energía". Tutorial al aparecer la primera dungeon. Monetización ética: refill diario con cap (nunca unlimited), incluido en battle pass cosmético como drip.

**Compendium / Legacy Journal (inspiración: RuneScape Comp Cape + WoW achievement system).** Genera la sensación de **biografía del personaje visible**. Tab que agrega Boss Codex + Quest Log + crafting milestones + Devotions completas + keystones desbloqueados + Prestige count + collection % del wardrobe, cada uno con timestamp del unlock. Aparece **desde day 1** pero con pocas entradas iniciales. Se conecta con todo. Riesgo: si solo muestra números, se siente hoja de cálculo; mitigar con screenshots automáticos y micro-narrativa ("El día que caíste por primera vez en [Boss]"). Sin tutorial. Monetización ética: sellos cosméticos, firmas de página, frames para los hitos compartibles.

**Guild/Alliance Bonus Pool (inspiración: Travian alliance bonuses, pero despojado del modelo P2W).** Genera la sensación de **pertenencia útil**. Gremios de 10–20 jugadores donan una moneda-de-craft para desbloquear modifiers globales temporales (drop rate, forging success, energy cap). Aparece en **mid**. Se conecta con economía de currency-crafting. Riesgo: presión social de donar; mitigar con cap individual por ventana y con que el bonus beneficie también a quien no donó. Tutorial corto al unirse a primer guild. Monetización ética: banners de guild cosméticos, slots extra para guild stash.

**Seasonal League con Sigils radicales (inspiración: OSRS Leagues/Deadman + PoE Leagues + D3 Seasons).** Genera la sensación de **reset ritual con payoff**. Temporada trimestral con Sigils que modifican reglas (ej: drops triples pero salud enemiga alta, o crafting garantizado pero solo tres piezas de gear, o combo loco). Eternal/Standard paralelo conserva al main. Aparece **post-launch**, cuando el core esté estable. Se conecta con Prestige (Ecos de liga convertibles a Standard), con Leaderboards, con Compendium (entradas de temporada permanentes). Riesgo: power creep liga-a-liga si las mecánicas se apilan; mitigar con rotación explícita dentro/fuera como D4. Tutorial narrativo de 30 segundos al inicio de cada liga. Monetización ética: cosmetic pass seasonal tipo Kirac's Vault, con free track sustancial.

**Chronicled Wish-style selector para unlocks raros (inspiración: Genshin).** Genera la sensación de **agencia sobre RNG**. Si existe algún unlock con componente aleatorio (keystone raro, spec cosmética exclusiva), el jugador elige el objetivo, con pity visible y determinístico. Aparece en **late**, cuando el pool de targets es suficiente. Se conecta con Paimon's Bargains-style shop de subproducts. Riesgo: banalizar la rareza; mitigar con que el selector sea un canal entre muchos, no el principal. Tutorial breve. Monetización ética: el selector es siempre F2P-accesible; solo se monetiza el battle pass que acelera el farm del recurso.

### 2.2 Sistemas existentes que necesitan cambio

**Crafting (upgrade/reroll/polish/reforge/ascend/fuse/extract/corrupt) + Forging Potential.** Problema: ocho verbos distintos son incomprensibles sin tutorial largo, algo que el género ya falló (PoE2 0.2 fue criticado justamente por crafting RNG-heavy con pocas opciones determinísticas, según PoE-Vault). Cambio: colapsar el vocabulario a tres tiers visibles (**Modificar / Mejorar / Reforjar**) que engloben los ocho verbos como sub-operaciones contextuales; Forging Potential se muestra como barra de "vida" del item y cada operación consume cantidades visibles. Filosofía aplicada: Tempering/Masterworking de D4 post-S4 — "drops como materia prima, decisión del jugador sobre qué afixes imprimir".

**Talent Tree con tracks, keystones e infinitos.** Problema: si es demasiado denso, repele a casual (Shadowlands-Covenant paralysis, PoE complexity wall). Cambio: aplicar **progressive reveal** (como Grim Dawn devotion affinity gates) — el jugador solo ve nodos que están a un paso de alcanzar, más keystones visibles como faros lejanos; respec cheap en early/mid, cost-escalado solo en optimización endgame (inversión exacta del error de PoE2). Filosofía aplicada: Grim Dawn "Reclaim Skill Points barato alivia el miedo a gimp permanente".

**Prestige con Ecos y Sigils.** Problema: si Ecos se pierden entre prestigios sin conversión, es borrowed power estilo WoW Shadowlands (Covenants) que fatiga. Cambio: Ecos como **moneda acumulativa permanente** que compra Sigils (rerollables) y nunca se "resetean"; los Sigils pueden rotar entre leagues, los Ecos no. Filosofía aplicada: D4 Paragon Board + Eternal Realm — "la progresión base nunca se pierde, solo el skin seasonal se rota".

**Quest Log tipo MMO.** Problema: en mobile con sesiones cortas, quests largas/encadenadas se abandonan; además "kill 10 rats" es lo opuesto a RuneScape writing. Cambio: **quests como vignettes narrativas cortas con payoff único** (escena, decisión, recompensa memorable) más una línea de "background quests" pasivas que se completan al jugar normal. Filosofía aplicada: RuneScape quest design (narrativa fija, personajes recurrentes) + Genshin tooltip rewards (cada tutorial paga primogem).

**Contratos diarios seed-based.** Problema: las dailies obligatorias crean "Dailyscape" (término peyorativo que Jagex mismo usa) y ansiedad de login. Cambio: contratos como **ventana semanal con banking** (puedes completar 7 en un día o esparcirlos), bonus escalado por variedad no por cantidad. Filosofía aplicada: Warframe Nightwave (weekly + elite challenges, no strict dailies).

**Build tags + enemy families con traits.** Problema: si los tags son meramente descriptivos, no generan decisiones. Cambio: conectarlos explícitamente con **Devotion Constellations** (afinidades) y con **Codex aspects** (algunos aspects solo activan contra cierta family). Filosofía aplicada: Grim Dawn devotion affinity + D4 Codex contextual modifiers.

### 2.3 Sistemas a simplificar o eliminar

**Rarezas common → legendary tal cual están.** Problema: cinco rarezas crean ruido visual en pantalla pequeña y la rareza más baja termina siendo vendor trash sin lectura. Diablo 3 Loot 1.0 y D4 pre-Season 4 fueron exactamente este caso: demasiados drops sin información útil. Simplificación: mantener el ladder de rarezas pero que **el drop de rareza baja alimente directamente la economía de currency-crafting** (vendor no da gold sino fragmentos de moneda mecánica). No se elimina el sistema, se elimina su irrelevancia.

**Contratos diarios puramente fillers.** Problema: si un contrato es "mata 50 enemigos", duplica lo que ya haces; Grim Dawn evitó deliberadamente seasons porque su filosofía es "no wacky mechanics every two months" (post comunitario en Crate Forums). Simplificación: contratos solo cuando introduzcan un **modifier temporal con identidad** (ej: "hoy los enemigos drop aspects duplicados"); si no hay twist, no hay contrato.

**Specs tipo Berserker/Juggernaut si son solo stat swaps.** Problema: si Berserker y Juggernaut son el mismo Warrior con porcentajes distintos, es el error de WoW homogeneization que Ion Hazzikostas reconoció al abandonar "bring the player not the class". Simplificación o refuerzo: cada spec debe tener una **mecánica-firma única** (el Berserker tiene una barra de rage visible, el Juggernaut tiene stacks de armor que se consumen). Si no se puede diseñar esa mecánica, fusionar specs.

**Stats tab separada si no agrega narrativa.** Problema: en pantalla 360–430px, una tab dedicada a números abstractos compite con espacio de tabs de juego real. Simplificación: integrar stats como **drawer expandible dentro de Character**, no como tab primaria. Torchlight Infinite cometió el error de apilar UI mobile en PC; el camino inverso es igual de aplicable.

### 2.4 Filosofía de build diversity recomendada

El brief actual ofrece aproximadamente dos fantasías reales de build por clase (Berserker DPS / Juggernaut tank, por caso). Un idle ARPG mobile-first con ambición de longevidad **necesita seis a ocho fantasías reales por clase**, entendiendo fantasía como "arquetipo con mecánica-firma identificable, no como stat swap".

La comparación Grim Dawn vs Last Epoch ilumina el camino. Grim Dawn ofrece matriz combinatoria real (dual-class × devotion map) pero con combat feel tibio que limita su alcance mainstream. Last Epoch ofrece skill-tree per skill (cada habilidad es customizable) con menos combinatoria pero más personalización por skill. **Para mobile con equipo pequeño, la vía Grim Dawn es más eficiente**: contenido estático (constelaciones + aspects + keystones) se diseña una vez y vive años; la vía Last Epoch exige mucha más iteración de balance por skill.

Filosofía recomendada: **tres ejes ortogonales que se cruzan**. Eje 1: Class + Spec (firma mecánica). Eje 2: Codex aspects equipados (capa 1 de identidad sobre gear). Eje 3: Devotion Constellation path (afinidades que matchean con families de enemy o elemento). Las combinaciones viables son el producto de los tres, pero los gates (affinity, pool de aspects disponibles) guían al jugador para que no haya paralysis. Grim Dawn demuestra que esto funciona; D4 post-S4 demuestra que la "biblioteca de aspects" es la forma mobile-eficiente.

### 2.5 El momento "esto es mío"

El jugador siente que su personaje es único cuando la combinación de sus elecciones es **improbable y visualmente identificable**. Warframe lo logra mejor que nadie: Mastery Rank + elección de warframe + build de mods + arcanes + focus + skin Tennogen + colores produce un personaje literalmente único en captura.

Para el idle ARPG mobile-first, el momento "esto es mío" debe ocurrir en un unlock de **tercera capa**: el jugador ya eligió Class+Spec (primera capa), ya imprimió un set de aspects (segunda capa), y ahora asigna la primera constelación con celestial power sobre una skill específica, mientras el transmog muestra la silueta que eligió. Ese cuádruple coincidir genera la captura memorable. Warframe tarda decenas de horas en eso; el juego puede comprimirlo a mid-game si las tres capas están alineadas desde el diseño.

---

## 3. Pasada 3 — Layout, UX y experiencia de jugador

### 3.1 Arquitectura de navegación

Las ocho tabs actuales (Combat, Inventory, Crafting, Talents, Character, Stats, Prestige, Achievements) son demasiadas para 360–430px. La filosofía D4 separa HUD ("lo que necesitas ahora mientras peleas") de menús ("lo que planificas entre peleas"); la filosofía Warframe centraliza acciones críticas en un Hub (Orbiter) al que se retorna constantemente. Combinadas, sugieren **cinco tabs primarias más un Hub persistente**:

- **Combat** (HUD principal, siempre visible)
- **Character** (absorbe Inventory + Stats + Talents + Specs como sub-drawers swipeables)
- **Forge** (absorbe Crafting + Codex/aspect library)
- **Ascension** (absorbe Prestige + Devotion Constellations)
- **Compendium** (absorbe Achievements + Boss Codex + Quest Log + Legacy Journal)

El Hub persistente es una barra inferior fija de cinco iconos + un FAB (floating action button) central para la acción contextual más importante (reclamar energy rewards, iniciar dungeon, activar ability). Esto replica el pulgar-natural de Diablo Immortal sin sacrificar profundidad.

### 3.2 Jerarquía de información por pantalla

**Sin tocar nada** el jugador debe ver: tick-rate y DPS actual, rareza del último drop con su color distintivo (loot-beam inspired), barra de energy/resin, contador de currency-craft principal, y el FAB contextual. Esto cumple la regla de Torchlight Infinite ("la UI mobile densa funciona si está agrupada") sin su pecado ("la misma UI en PC es incomprensible").

**En un tap** debe encontrar: detalles del último drop con diff vs equipped (el tooltip +/- que Torchlight falla en mostrar), acceso a la ability rotation activa, siguiente keystone a desbloquear, estado del contrato activo.

**Enterrado** (dos o más taps) puede estar: historial completo de drops, árbol de devotions completo, biografía/Compendium extenso, settings, logs de combate verbosos.

### 3.3 Principios de layout mobile-first

- **Zona del pulgar** (Genshin): ataque básico, FAB de acción crítica y skills rotativas en el tercio inferior, con tamaño mínimo 44px siguiendo HIG. Cualquier acción de alta frecuencia debe ser alcanzable sin reajuste del agarre.
- **Densidad con agrupamiento** (Diablo Immortal): los cuatro botones de skill fan-out alrededor del ataque básico; tooltip por long-press, no por tap corto, para evitar taps accidentales.
- **Inventario en tabs horizontales swipeables con scroll vertical** (Torchlight Infinite bien ejecutado): cada tab tiene contexto (Inventory / Aspects / Appearance / Materials), los swipes laterales no compiten con scroll vertical.
- **Tooltip con diff numérica y semántica vs equipped**: no solo "+12 daño" sino "+12 daño, mejora tu DPS frente a Demonios" conectando con build tags.
- **Safe-area iOS y notch Android respetados**; el FAB nunca cae bajo el notch ni bajo la home-indicator bar.
- **Dark/light mode ambos tratados como ciudadanos primarios**: no "dark con parche claro"; cada uno con paleta propia para los colores de rareza (common→legendary) para que la jerarquía sea legible en ambos.

### 3.4 Momentos dopamina con feedback visual recomendado

**Drop épico/legendario** debe tener loot-beam digital (haz de color desde el enemy hasta el item en suelo) + shake leve de pantalla + audio sting específico por rareza + haptics en mobile. Lo que el loot beam de Diablo tiene y otros no replican es que **traduce rareza a signal pre-texto** — el jugador sabe antes de leer. En 360–430px esto es doblemente crítico porque leer cuesta atención.

**Level up / unlock de keystone** debe tener freeze del tick por dos a tres segundos + overlay full-screen con nombre del keystone y breve descripción + audio sting único por spec-family + haptic + screenshot automático opcional shareable. Lo que el level-up de WoW mantiene como referente es que **reserva el ritual para los momentos de identidad**, no para cada incremento numérico; la ceremonia es cara pero infrecuente.

**Prestige (Ascension)** debe tener una transición cinematográfica de cinco a diez segundos con zoom-out del personaje, flash white, re-entrada con un Eco flotando en HUD, y un chapter-marker en el Compendium. Debe sentirse como cambio de acto.

**Craft exitoso (especialmente perfect roll)** debe tener partículas con color de rareza + sonido de forja distintivo + el nuevo stat destacándose con pulse durante dos segundos + entrada automática al Codex si es aspect nuevo. La asimetría clave: **los fails de craft no deben penalizarse con feedback negativo dramático**, solo neutro; PoE2 0.2 falló aquí (la comunidad reportó frustración excesiva con crafting) mientras D4 post-S4 acertó (Tempering/Masterworking se sienten como inversión, no castigo).

**Boss kill** debe tener cámara fija en el boss cayendo + slow-mo del último hit + pop del Boss Codex con "primer kill" si aplica + chest con preview animado + screenshot auto. Genshin sobre-usa cinematicas pero acertó al asociar cada boss a un momento "framed".

**Perfect roll / affix T3 legendario** merece un audio sting único que solo se escucha en este caso. La escasez del sonido lo convierte en marca sonora; el jugador lo reconoce.

### 3.5 Momentos compartibles

Diablo genera screenshots por builds enormes en endgame y loot excepcional. PoE genera screenshots por hideouts y crafts perfectos. Genshin genera screenshots por teampose con personaje favorito en paisaje. **El idle ARPG puede generar momentos compartibles si acopla tres cosas**: un Legacy Journal que auto-captura hitos con framing cuidado, un Appearance Wardrobe con preset nombrable, y un Rift Ladder con cartel de "nuevo tier personal".

Cambios de diseño que maximizan sharing orgánico: botón de share nativo mobile en cada pop de keystone unlock; plantilla visual consistente (el branding del juego siempre visible pero discreto); nombres generados para builds complejos ("Berserker / Embers of Morrigan / Rift 87").

### 3.6 Filosofía de onboarding

Primer minuto memorable (**WoW**): el jugador mata algo, sube al menos un nivel, escucha un sonido distintivo, y ve una línea de narrativa que ubica quién es. Introducir sistemas sin abrumar (**Warframe advertencia invertida**): nunca explicar más de un sistema por minuto; mostrarlo en acción antes de nombrarlo. Tutorial que no se siente tutorial (**Genshin**): tooltips pulsantes no modales, micro-reward por cada uno, archivo consultable.

Traducido al idle ARPG:

- Minuto 1: el personaje ya está peleando, hay un drop, el jugador equipa con un tap, ve la diff, sube a un micro-milestone con fanfare.
- Minuto 2–5: se revela energy/resin (al primer intento de reclamar dungeon reward), tooltip explica con micro-reward.
- Minutos 5–15: campaign quest vignette corta con decisión; al finalizar, se desbloquea el primer aspect.
- Primera hora: se introducen secuencialmente Codex, Forge, Talents, uno por cada hito natural. Nunca dos tutoriales seguidos.
- Compendium registra todo para re-consulta sin bloquear.

La regla dura: **cero modales bloqueantes**. Todo tutorial es un tooltip que el jugador puede despachar con tap-fuera.

---

## 4. Pasada 4 — Monetización ética y modelos de negocio

### 4.1 Análisis por referente (síntesis de monetización ya cubierta en 1.4)

PoE/GGG y Warframe son los dos estándares éticos del género, por razones distintas y complementarias. OSRS es el tercer pilar con su modelo minimalista + bonds. Genshin es el referente más sofisticado en time-gating ético (resin, Welkin stipend). WoW Trading Post es la mejor implementación de cosmetic pass con free-tier genuino. D4 post-S4 demuestra que un AAA puede corregir un mal lanzamiento si escucha a PTR.

El anti-modelo es Diablo Immortal: disingenuidad comunicativa + paywall de techo de poder + push notifications de presión temporal + dark patterns documentados al punto de abrir investigación AGCM italiana en 2026 (Game World Observer). Torchlight Infinite es el caso gris (monetización F2P decente pero "drowning in payment options"). Travian Gold Club y Gladiatus Yakut son pay-for-power puro y están en mantenimiento/decadencia. RS3 Treasure Hunter fue desmantelado por la propia empresa tras una década de erosión.

### 4.2 Principios éticos más respetados del género

- **Transparencia absoluta sobre qué compra cada transacción**; la disingenuidad de Wyatt Cheng ("no puedes comprar gear") destruyó Diablo Immortal reputacionalmente más que los gastos mismos.
- **Determinismo sobre RNG**; Paimon's Bargains y Chronicled Wish canalizan cada pull perdido en valor no-RNG. Ningún loot box con probabilidades ocultas.
- **Desfase temporal como compromiso justo** (Torchlight Infinite bien aplicado): premium day 1, F2P tras desfase; aceptable si el desfase no convierte al objeto premium en meta-obligado durante la ventana.
- **Battle pass con free track realmente valioso**, no drip simbólico; el recorte de Reliquaries en D4 S8 es el caso de cómo degradar el valor percibido destruye confianza.
- **Stipend mensual pequeño sobre big packs**: Welkin de Genshin a cinco dólares genera mejor retención y menos whale dependency que packs de cien. ARPU estable > ARPU extractivo.

### 4.3 Propuesta de modelo completa

**Filosofía central (una oración)**: nunca se vende poder, conveniencia competitiva, ni tiempo de grind core; siempre se pueden vender vanidad, organización personal y expansiones de contenido real.

**Capas de monetización** (ordenadas por ingreso esperado y justificadas):

- *Capa 1 — Stash/Inventory expansion y filtros* (PoE stash tabs model). Ética porque alinea gasto con engagement legítimo; el que más juega necesita más inventario. Sin impacto en poder.
- *Capa 2 — Cosméticos individuales* (skins de clase, VFX de skill, footprints, pets cosméticos, frames de Compendium page). Ética porque es vanidad pura.
- *Capa 3 — Season/Eco Pass cosmético* (Trading Post model combinado con Kirac's Vault). Dos tracks: free track generoso (currency premium, ecos, cosméticos base) y premium track (currency premium extra, skin exclusiva seasonal, marco exclusivo). Rotación con retorno eventual — **sin FOMO terminal**.
- *Capa 4 — Supporter Packs trimestrales* (PoE model). Bundle de currency premium + cosmético exclusivo + nombre en créditos. Para jugadores que quieren sostener el desarrollo con respeto.
- *Capa 5 — Expansion packs* (Grim Dawn model adaptado). Nueva class, nueva región, nuevas Devotions cada ~18 meses. Coste premium one-time, cosméticos iniciales incluidos.
- *Capa 6 — Energy refill con cap diario* (Genshin resin refresh ético). Máximo un refill comprable por día con coste escalado, nunca unlimited.
- *Capa 7 (opcional, post-validación) — Bonds* (OSRS/Warframe model). Currency premium tradeable con fricción (level mínimo, cap diario, bazaar asincrónico). Permite al rico-en-tiempo convertir juego en pass/cosmético, al rico-en-dinero ayudar al F2P sin excluirlo.

**Lo que nunca se vende**, explícitamente:

- Aspects del Codex, Devotion constellations, keystones, specs, clases base.
- Currency de crafting (upgrade/reroll/polish/reforge/ascend/fuse/extract/corrupt).
- Drop rate boosters, XP boosters fuera del cap diario ético.
- Respec de talentos.
- Slots de personaje en cantidad limitante (mínimo cinco gratis).
- Acceso a dungeons, bosses, rifts, contratos.
- Loot boxes con probabilidades ocultas de cualquier tipo, incluidos cosméticos (Trading Post model > mystery box).
- Advantage competitivo en Rift Ladder / leaderboards (bonds no aceleran Ladder).

**Momento correcto para monetizar**: antes de introducir monetización, deben estar en pie el core loop de combate, tres fantasías de build por clase viables, Codex + Forge + Devotions funcionales, y una liga de prueba completa. Warframe y PoE demuestran que un F2P con reputación intacta requiere que el core sea bueno antes de cobrar. Lanzar monetización sobre un core débil es el error de Torchlight Infinite y Diablo Immortal.

**Secuencia de lanzamiento de capas**:

1. Launch: Capa 1 + Capa 2 (stash tabs, cosméticos básicos).
2. Primera liga post-launch: Capa 3 (Season Pass cosmético).
3. Segunda liga: Capa 4 (Supporter Pack primera edición).
4. Año 1: Capa 5 (primera expansion real).
5. Post-año 1, con KPI de retención estables: Capa 6 (energy refill).
6. Post-año 2, con economía validada: Capa 7 (Bonds).

Nunca lanzar Capa 6 o Capa 7 sin economía madura; es el error que disparó los dark patterns de Immortal.

**Monetización y retención**: cada capa debe reforzar el loop. Stash tabs reducen fricción al jugar más. Cosméticos celebran identidad (Compendium). Season Pass da objetivo paralelo al grind normal. Supporter packs canalizan impulso en gasto positivo (coleccionismo) en lugar de loot-box gambling. Expansions renuevan el hype cada 18 meses (Warframe cadence). Energy refill solo aparece si el jugador ya agotó su energy del día — es opción, no presión. Bonds crean economía horizontal (time↔money) sin competencia.

**El jugador que paga vs el que no paga**: el jugador que paga tiene más stash tabs, skins, Season Pass completo, acceso a expansions day 1, cap de energy marginalmente mayor vía bonds. El jugador que no paga tiene acceso al 100% de contenido, 100% de specs/aspects/devotions, puede completar Compendium al 100%, puede alcanzar tier máximo del Rift Ladder, puede ganar leaderboards, puede farmear bonds con su tiempo para adquirir cosméticos. **Ambos completan el juego; solo difieren en velocidad y ornamento**. Esta es la línea de Warframe que el proyecto debe sostener sin excepciones.

### 4.4 Time-gating y monetización

Genshin resin funciona como feature, no paywall, porque (a) el jugador siempre puede pelear, solo se gate la recompensa instanciada; (b) el cap acumulable permite sesiones grandes si se ausentó; (c) Condensed Resin permite burst gasto; (d) la comunidad percibe el cap como "permiso de parar" no como "obligación de volver". El contra-ejemplo es Diablo Immortal con sus caps ocultos de drops en dungeons y Hidden Lairs —mismo mecanismo, enfoque opuesto, percepción inversa.

Un time-gate es feature cuando cumple: visible, predecible, con upper cap acumulable, con acción offline nunca gated. Es mecanismo de monetización disfrazado cuando cumple: oculto, con presión temporal push-notificada, sin upper cap, y cuando la compra directamente desgatea lo que el juego te impide.

Diseño de time-gate orgánico con opción de monetización sin p2w: el energy refill diario existe pero tiene cap; los bonds pueden canjearse por refills extra dentro del cap; el rift ladder y el crafting core **nunca consumen energy**. Así el gasto acelera la reclamación de rewards en contenido específico, nunca desbloquea poder ni velocidad de combate.

### 4.5 Las 5 cosas que nunca se venden

1. **Velocidad de tick o multiplicador de XP/drop por encima del cap diario ético.** Vender ritmo es el pecado original de RS3 Treasure Hunter.
2. **Currency de crafting, aspects, devotion points, keystone unlocks.** Vender buildcraft es el pecado de Diablo Immortal Legendary Gems.
3. **Respec de talentos.** Cobrar por experimentación es el pecado de PoE2 0.2.
4. **Loot boxes con probabilidades ocultas**, incluyendo cosméticas (sustituir por Trading Post model).
5. **Advantage directo en leaderboards o Rift Ladder.** Warframe mantiene sus leaderboards limpios porque platinum no acelera ranking; esta es la línea que preserva integridad competitiva.

---

## 5. Pasada 5 — Longevidad, retención y adictividad

### 5.1 Filosofía de curvas de progresión por sistema

- **XP de personaje** → **logarítmica**. El jugador acepta el grind late-game porque ya está enganchado por la densidad early. OSRS demuestra que esta forma sostiene diez años si hay goals paralelos.
- **Poder de items (stat ceiling por rareza)** → **escalonada**. Plateaus con saltos de rareza (common → magic → rare → épico → legendario) crean tensión/release tipo actos narrativos. D4 post-S4 acertó aquí; D4 pre-S4 falló por plana.
- **Crafting (Forging Potential / tier de affix)** → **logarítmica con techo visible**. Los primeros rolls mejoran mucho, los perfect rolls cuestan mucho. Esto es el T3 de PoE aplicado correctamente.
- **Prestige (Ecos, Sigils)** → **lineal con bumps en milestones**. Predecibilidad es virtud aquí: el jugador planifica. D3 Paragon es lineal y funciona veinte años después.
- **Colección (Compendium, Appearance Wardrobe)** → **asíntota inalcanzable**. Siempre falta un ítem más; el 98% completo es el mejor retention hook que existe. Warframe Mastery Rank y WoW Transmog lo prueban.
- **Rift Ladder tier** → **exponencial suave con timer**. Cada tier es algo más duro; el techo personal es sensación de "siempre queda un escalón". D3 Greater Rifts.
- **Devotion affinity** → **lineal con gates por umbrales**. Cada punto vale lo mismo pero los umbrales desbloquean celestial powers — escalonada dentro de lineal.

Evitar **exponencial puro** en stats base; es lo que rompió D3 pre-Loot-2.0 y obligó a Blizzard a poner techo (150) en GRifts. Evitar **lineal puro** en XP; es honesto pero monótono.

### 5.2 Mecanismos de adictividad éticos aplicables

De la lista clásica (variable reward schedule, sunk cost, identidad, social, colección, optimización, narrativa), los éticos y aplicables son:

- **Variable reward schedule**: drops con rareza variable es el core del género y éticamente aceptable si las probabilidades son visibles y no gated por paywall.
- **Identidad**: Appearance Wardrobe + Compendium + spec firma son el eje identitario. Éticamente limpio.
- **Colección**: Boss Codex, Aspect Library, Devotion completa, Appearance Wardrobe. Limpio si no hay items paywall-only.
- **Optimización**: Rift Ladder tier, perfect rolls. Limpio si respec es cheap y si ladder no se paga.
- **Narrativa**: quest vignettes, leagues con lore. Limpio por diseño.

Evitar: **sunk cost manipulation** (Diablo Immortal whales gastando $6k-$10k sin 5★ es el ejemplo) y **social pressure FOMO** (event-only rewards que no regresan).

### 5.3 Loops ideales por escala temporal

- **5 minutos**: abres la app, el idle generó X energy y Y progreso offline; reclamas con un tap, ves un drop nuevo que equipas con diff tooltip, revisas si desbloqueaste un aspect o achievement, activas un contract semanal, cierras. Queda pendiente: el aspect que quieres imprimir en tu item actual. *Referente*: Genshin daily check-in, ajustado a mobile.
- **1 hora**: completar un nivel de liga o una ejecución de Rift tier alto, craftear tres piezas con Forge, activar una Devotion nueva. Objetivo de sesión: "subir un tier". *Referente*: PoE mapping, comprimido.
- **1 día**: completar contratos, quest vignette si hay, farmear energy dos veces, avanzar un keystone. Razón para volver: la Devotion parcialmente completada. *Referente*: Warframe Sortie + Nightwave.
- **1 semana**: completar el Weekly Contract track, subir meaningfully en Rift Ladder seasonal, terminar un mini-arc narrativo. Meta visible: posición en leaderboard de liga. *Referente*: WoW Mythic+ affix semanal + OSRS goal weekly.
- **1 mes**: avanzar notablemente Prestige, completar set de Devotions temáticas, terminar chunk del Season Pass. *Referente*: PoE league mid-point.
- **6 meses**: completar la liga, tener una build "firma" asentada, Compendium ~70%, posición top-X en algún tier. *Referente*: OSRS skill rolling milestones + Warframe Prime completion.

### 5.4 Time-gating sano vs frustrante

Warframe funciona porque el gate es el tiempo de craft (24h para un warframe) con preview visible y rush opcional barato; el jugador acepta porque **sabe exactamente cuándo termina y qué obtiene**. Diablo Immortal falla porque sus caps de drops en Hidden Lairs **no son visibles**; el jugador farmea sin saber que ya no va a caer nada. La línea entre "razón para volver" y "muro artificial" es **visibilidad del contador** y **imposibilidad de ser cheeseado por pago**.

Genshin resin se siente feature porque (a) sesiones cortas son suficientes para gastar el día, (b) cap acumulable perdona ausencia, (c) combate ilimitado, (d) el sistema es parte del onboarding de expectativas desde el minuto uno. El juego no "te quita" resin después; el jugador entró sabiendo.

OSRS hace el grind de 200h elegido porque (a) el jugador ve el XP table con precisión, (b) el skill es opcional entre 28 tracks paralelos, (c) cada milestone es anunciado socialmente (level 99 broadcast), (d) no hay presión temporal, solo goal auto-impuesto. Esta es probablemente la maestría de game design que el idle ARPG debe emular.

### 5.5 Diseño para jugador de largo plazo

PoE hace volver cada liga porque **la mecánica temporal es suficientemente distinta** para forzar rediseño de build. OSRS sostiene miles de horas porque **los 28 skills paralelos nunca se agotan**. Warframe sostiene cinco años porque **cada expansion introduce un universo nuevo coherente** (Plains of Eidolon → Railjack → Duviri → 1999) sin apilarse geológicamente. El ancla de longevidad común es **horizontalidad bien calibrada**, no verticalidad infinita.

El juego debe adoptar como ancla de longevidad: **Compendium inalcanzable + Devotions expansibles por DLC + Leagues trimestrales con Sigils rotativos**. Tres ejes que siempre renuevan objetivo.

### 5.6 El jugador que vuelve después de 3 meses

Warframe lo resuelve con **Nightwave actual visible al login + resumen de "qué cambió" en un ticker** y personaje preservado tal cual se dejó. WoW con **catch-up gear en Adventure Mode**. Para el idle ARPG: al re-login tras ausencia larga, pop-up con resumen de la liga actual (Sigil activo, tiempo restante), un "welcome back" con energy full-cap regalado una sola vez, y el Legacy Journal actualizado con "estuviste fuera X, pasó Y". **Cero tutorial de re-onboarding**; todo por descubrimiento con el Compendium como lifeline.

### 5.7 Progresión horizontal vs vertical por etapa

- **Early (semanas 1–2)**: 80% vertical, 20% horizontal. Subir stats y rarezas es el enganche primario. OSRS Tutorial Island model.
- **Mid (mes 1–3)**: 50/50. Aparece Codex, primeras Devotions, primera spec alternativa. Transmog empieza a importar.
- **Late (mes 3–6)**: 30% vertical, 70% horizontal. El jugador ya tiene su build base; ahora colecciona Devotions, rota builds, sube Compendium. D4 post-S4 model.
- **Ultra-late (6 meses+)**: 10% vertical, 90% horizontal. Vertical se concentra en Rift Ladder tier personal; todo lo demás es colección, liga seasonal, experimentación de builds. OSRS maxer model.

La vertical deja de generar satisfacción cuando los incrementos no cambian qué puedes hacer, solo cuánto más rápido. OSRS es el referente supremo de pivote horizontal: cuando los stats dejan de importar, los skills paralelos toman el relevo.

### 5.8 Diferenciación real

Ningún referente investigado combina: **idle con ticks offline + crafting denso tipo PoE + Devotions tipo Grim Dawn + Compendium tipo RuneScape + Appearance Wardrobe tipo WoW + leagues tipo PoE/OSRS, todo en 360–430px, con monetización Warframe-OSRS híbrida**. PoE es desktop. Grim Dawn no tiene seasons. Warframe no es idle. OSRS no es ARPG. Torchlight Infinite es mobile ARPG pero no idle y con monetización deteriorada. Diablo Immortal es mobile ARPG pero traicionado por p2w.

**Propuesta de valor única en una oración**: un ARPG que juegas en minutos pero recuerdas en meses, con la profundidad de Grim Dawn, la integridad económica de OSRS y la gramática mobile de Genshin.

### 5.9 Cinco momentos memorables a 1 año

1. **Primer perfect-roll legendary con aspect que definió tu build-firma.** Memoria de "el día que mi Berserker se volvió mío". Pattern: WoW Legendary Cloak memory + PoE mirror-tier drop.
2. **El prestige #1: la primera Ascension, con Eco flotando en HUD y Legacy Journal marcando "Chapter 2".** Memoria ritual. Pattern: Prestige-as-rite aprendido de D3 Seasons + WoW cinematic tradition.
3. **Cerrar tu primera Devotion Constellation completa con celestial power asignado.** Memoria de buildcraft epifánica. Pattern: Grim Dawn endgame constellation.
4. **Posicionarte top-100 en Rift Ladder seasonal sin haber pagado un céntimo.** Memoria de mérito puro. Pattern: D3 leaderboard + OSRS grind respect.
5. **Completar el Appearance Wardrobe al 95% y hacer screenshot con tu outfit firmado para compartir.** Memoria de identidad pública. Pattern: WoW Transmog pride + Warframe fashion frame.

---

## 6. Las 20 decisiones de diseño más importantes (ordenadas por impacto)

1. **Adoptar currency-as-crafting en lugar de oro como sink primario** (PoE1). Resuelve economía, da valor a low-tier loot, crea decision density en pantalla pequeña. Implicancia de monetización: elimina tentación de vender currency con dinero real. Implicancia de longevidad: el sistema nunca se satura porque el sink es mecánico.

2. **Instalar el Compendium como North Star agregador desde day 1** (RuneScape Comp Cape + WoW achievements). Genera retención de Zeigarnik en todas las escalas temporales. Implicancia de longevidad: el 98% completado es el mejor retention hook de largo plazo del género.

3. **Implementar Appearance Wardrobe account-wide que colecciona apariencia al drop/vender** (WoW Transmog). Resuelve ansiedad de inventario en pantalla pequeña y crea eje cosmético natural. Implicancia de monetización: canaliza gasto cosmético en lugar de mecánico; Trading Post-style rotation sin FOMO terminal.

4. **Adoptar la regla "el combate tick nunca consume energía; solo la reclamación de recompensas instanciadas"** (Genshin resin). Garantiza que el time-gate se siente como feature. Implicancia de monetización: habilita refill ético con cap diario, nunca unlimited. Implicancia de longevidad: permite sesiones cortas mobile-natural sin quemar al jugador.

5. **Construir Codex of Power / Aspect Library permanente alimentada por salvage** (D4 post-S4). Convierte cada legendary en progreso que nunca se pierde. Implicancia de longevidad: resuelve el "vendor trash" que mata a ARPG en mobile, donde inventario cuesta doble.

6. **Diseñar Devotion Constellations con affinity gates y celestial powers asignables** (Grim Dawn). Eje ortogonal al talent tree con contenido estático, ideal para equipo pequeño. Implicancia de longevidad: provee horizontalidad de mid-late sin backend complejo.

7. **Sostener la filosofía "vender inventario y vanidad, nunca poder"** (GGG). Regla dura, no concesiones. Implicancia de monetización: es el moat reputacional que se aprecia con el tiempo; PoE lo demostró en 12 años.

8. **Respec cheap en early-mid, cost-escalado solo en optimización endgame** (inverso de PoE2 0.2). Protege experimentación. Implicancia de longevidad: casuals no huyen y theorycraft se mantiene vivo.

9. **Una sola actividad infinita escalable tipo Rift Ladder con timer** (D3 Greater Rifts). Económicamente eficiente: cubre progresión, loot, leaderboard y meta con un solo sistema. Implicancia de longevidad: ancla de endgame que no requiere contenido nuevo para seguir ofreciendo desafío.

10. **Leagues trimestrales con Sigils radicales que rotan dentro/fuera** (PoE + OSRS + D4). Genera picos de hype cíclicos y permite experimentación de diseño. Implicancia de monetización: canaliza season pass cosmético.

11. **Battle pass con free track generoso y premium track cosmético** (Trading Post WoW + Warframe Nightwave). Implicancia de monetización: el free track sostiene retention del 80% de la base, el premium monetiza al 20% sin excluir a nadie.

12. **Onboarding invisible con tooltips pulsantes, micro-reward por tutorial visto, archivo consultable** (Genshin). Cero modales bloqueantes. Implicancia de longevidad: primer minuto memorable al estilo WoW reduce churn day-1.

13. **Radial skill layout con ataque básico en zona del pulgar + upgrade transfer al equipar gear** (Diablo Immortal combat + mobile craft). Implicancia de UX: resuelve input mobile sin traicionar combat feel.

14. **Five tabs primarias + FAB contextual + bottom navigation persistente** (D4 HUD-vs-menú + Warframe Hub). Colapsar las ocho tabs actuales en arquitectura mobile-first. Implicancia de longevidad: menos fricción = más sesiones.

15. **Loot-beam digital + audio sting por rareza + haptics** para drops épico/legendario (D3). Implicancia de UX: traducir rareza a signal pre-texto es crítico en 360–430px.

16. **Keystone unlock como momento ceremonial** con freeze, overlay, audio único, screenshot shareable (WoW level cap). Implicancia de longevidad: reserva el budget de atención para los 5–10 momentos de identidad que el jugador recordará.

17. **Alliance Bonus Pool con donación colectiva escalable, sin FOMO sincrónico** (Travian sin P2W). Implicancia de longevidad: crea compromiso social con backend trivial y sin pay-for-automation.

18. **Quest vignettes cortas con decisión y payoff memorable, no kill-10-rats** (RuneScape writing). Implicancia de longevidad: la narrativa es la razón emocional para volver; Genshin y Warframe lo demuestran.

19. **Compendium con Legacy Journal que auto-captura hitos con framing shareable** (WoW achievements + Instagram-ready). Implicancia de longevidad: amplifica momentos memorables y genera marketing orgánico.

20. **Bonds como time-as-currency bidireccional con fricción anti-abuso**, lanzados solo después del año 2 con economía madura (OSRS + Warframe). Implicancia de monetización: el modelo más respetado del F2P vivo; cobra una vez, el trading P2P subsidia retención.

---

## 7. Las 5 cosas a no hacer nunca

1. **Nunca vender XP, currency de crafting, aspects, devotion points ni respec de talentos.** Jagex vendió XP durante una década con Treasure Hunter; en 2025–2026 el CEO Jon Bellamy admitió públicamente que "erosionó la integridad" y la empresa eliminó 225 ítems tras una votación de más de 100k participantes. La comunidad del género no olvida.

2. **Nunca implementar loot boxes con probabilidades ocultas ni pity engañoso.** Diablo Immortal estimó 1% real de drop 5★ en sus Legendary Crests; Bellular News calculó inversiones de seis cifras para maximizar; la disingenuidad del director cristalizó el meme "PlsBuy" y disparó investigación AGCM italiana en 2026. El backlash fue proporcional al engaño, no al gasto.

3. **Nunca apilar nerf + reducción de loot + aumento de dificultad en un solo parche.** PoE2 0.2 "Dawn of the Hunt" hizo exactamente eso; streamers top (Zizaran, Quin69, ds_lily) publicaron videos titulados literalmente "no juegues esto ahora"; las reviews recientes cayeron a Mostly Negative y llevaron más de un año en recuperarse. Cambia un eje por parche.

4. **Nunca atar progresión clave a sistemas que se resetean en el siguiente prestige/expansion sin conversión.** WoW Shadowlands Covenants/Conduits/Soulbinds generó un hilo de Reddit con más de mil comentarios pidiendo eliminar borrowed power; Blizzard abandonó la fórmula en Dragonflight y admitió el error. La sensación de "salgo más débil que entré" destruye retención.

5. **Nunca prometer F2P-friendly y revelar paywall en late-game.** Diablo Immortal dejó veinte horas amables y luego mostró awakening/legendary gems detrás de Eternal Orbs no farmeables; reviewers (VGC, Kotaku, Forbes) documentaron la traición percibida. Torchlight Infinite tuvo el mismo patrón con pets de rank 6 que separan 30M de 18M DPS. La confianza del jugador mobile es un recurso escaso; traicionarla en un punto de curva termina el juego reputacionalmente.

---

## 8. Mapa de longevidad por etapa

**Semana 1 — La puerta memorable.** Lo que mantiene: primer minuto con fanfare WoW-style, primer drop legendario con loot-beam, primer keystone desbloqueado ceremonialmente. Capa abierta: combate tick, inventory, primer tutorial de Forge. Curva dominante: vertical pura (stats y rarezas subiendo rápido; forma **logarítmica** rica en dopamina temprana). Riesgo: un onboarding pesado perderá al jugador antes del minuto cinco; Genshin tooltip model es obligatorio.

**Mes 1 — La decisión de quedarse.** Lo que mantiene: primera Devotion parcialmente completa, Compendium visible al 15-25%, primer contrato semanal cumplido, primera spec alternativa probada. Capa abierta: Codex of Power, Appearance Wardrobe, energy/resin. Curva dominante: **escalonada** (rarezas como plateaus con saltos de poder). Riesgo: si el jugador siente que ya vio todo en mes 1, churn; antídoto es revelar Devotions al final del mes como promesa de mes 2.

**Mes 3 — El techo personal.** Lo que mantiene: Rift Ladder tier personal subiendo, primera liga seasonal iniciada/completada, build-firma asentada con aspect imprinted, Compendium ~50%. Capa abierta: Rift Ladder, Seasonal League con Sigils, Guild Alliance Bonus. Curva dominante: **50/50 vertical-horizontal**. Riesgo: PoE y D4 muestran que la liga mala en este punto pierde al 30% de la base; la liga siempre debe tener un Sigil distintivo.

**Mes 6 — La biografía visible.** Lo que mantiene: Appearance Wardrobe ~70%, Devotions múltiples, primera expansion insight revelado, Legacy Journal con páginas visualmente densas. Capa abierta: modo hardcore/elite opcional, primer supporter pack disponible. Curva dominante: **70% horizontal, 30% vertical** (verticalidad concentrada en Rift Ladder). Riesgo: estancamiento si las ligas se repiten sin mecánica nueva; Grim Dawn tiene este problema reputacionalmente al no tener seasons.

**Año 1+ — El ancla emocional.** Lo que mantiene: Compendium inalcanzable visible siempre, rotación de leagues que renueva sin apilar, expansion pack real con nueva clase/región/Devotions, bonds introducidos para economía madura, leaderboards seasonales competitivos sin pay. Capa abierta: DLC de contenido, Bonds trading, modos especiales (Deadman-style). Curva dominante: **90% horizontal, 10% vertical**. Ancla: el Compendium siempre tiene una casilla más; Warframe, OSRS y PoE demuestran que este modelo sostiene base de jugadores por una década.

---

## 9. El juego dentro de 1 año: review ficticia de un jugador con 6 meses

> ★★★★★ — Review en Steam, user "lethalclover", 847 horas jugadas
>
> Vine a este juego buscando un idle para matar ratos muertos; seis meses después es el único juego en mi barra. No sé cómo lo explicar a mis amigos sin sonar obsesivo, así que dejo esto aquí.
>
> Lo primero que me sorprendió fue que **nunca me sentí presionado a pagar**. Llevo dos ligas completas, subí mi Berserker al Rift tier 62, y lo único que compré es el Season Pass cosmético porque me gustaban las skins. Pude haber farmeado bonds —sé que lo hacen mucho— pero no tuve ganas. El juego respeta eso. En Diablo Immortal me sentí estafado en veinte horas; aquí llevo ochocientas y mis amigos pagadores y yo competimos en el mismo leaderboard.
>
> Lo segundo: **cada unlock de keystone lo recuerdo**. El día que completé "Embers of Morrigan" y asigné el celestial power a mi Whirlwind, el juego se congeló tres segundos, sonó algo que todavía me eriza, y apareció una captura automática con mi personaje y el nombre del build. Tengo esa screenshot guardada. Tres semanas después, cuando terminé mi primera Devotion de Grieving Widow, pasó algo igual pero distinto. El juego tiene como diez de esos momentos repartidos, y todos se sintieron ganados.
>
> Lo tercero, lo que me sorprende que otros idle no hacen: el **Compendium**. Abro la app, veo que me falta un 2% para completar el Wardrobe de Undead family, y eso me hace elegir qué farmear el domingo. No es una daily obligatoria; es un goal que me puse yo. Mi primo juega OSRS y dice que es la misma sensación de "yo decido mi grind". Le creo.
>
> Cosas que no me gustan: el crafting todavía es denso; tardé tres semanas en entender por qué un Reforge no es un Reroll. Los contratos semanales a veces son repetitivos. Y aunque la liga pasada estaba genial (Sigil que duplicaba drops pero con boss con el doble de vida), la anterior fue floja y casi dejo.
>
> Pero volví. Porque al abrir la app recibí un "welcome back" con energy full, mi personaje tal cual lo dejé, y el Legacy Journal actualizado con "estuviste fuera 11 días, cayeron 2 Prime Aspects al Pool de Guild". Me enganché de vuelta en cinco minutos sin tutorial.
>
> Si quieren un idle para cerrar la app y olvidarlo, este no es. Si quieren uno que los acompañe en el metro, al dormirse, y les dé un momento ritual cada tantas semanas, este sí.
>
> 10/10, perdón familia.

---

*Fin del documento. Fuentes citadas a lo largo de las pasadas corresponden a investigación web activa en foros oficiales (pathofexile.com, runescape.com, forums.blizzard.com, forum.gladiatus.gameforge.com, support.travian.com), Steam Community y reviews recientes, Kotaku, PC Gamer, GameSpot, GamesRadar, PCGamesN, Dexerto, Game Rant, Screen Rant, Game World Observer, Wowpedia/Icy-Veins/Maxroll, wikis comunitarias, y agregadores que citan textualmente posts de subreddits. Las afirmaciones sobre percepción comunitaria están respaldadas por hilos citados o artículos que los referencian.*