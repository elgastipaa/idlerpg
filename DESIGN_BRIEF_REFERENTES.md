# DESIGN_BRIEF_REFERENTES

Fecha: 2026-04-20 UTC  
Proyecto base: `IdleRPG` en transicion hacia `Santuario -> Expedicion -> Extraccion -> Santuario`, con combate automatico, mobile browser first, progresion persistente y onboarding guiado.

## 1. Resumen ejecutivo

La investigacion converge en una idea simple: este juego no necesita parecerse mas a un ARPG enorme; necesita parecerse mas a un ARPG enorme que sabe podar.

Los referentes mas utiles no son los mas complejos, sino los que separan bien tres capas:

- `loop inmediato`
- `progresion de cuenta`
- `rituales de retorno`

`PoE1`, `Grim Dawn` y `Last Epoch` prueban que la profundidad real viene de identidad de build, no de tener mil botones visibles. `Travian`, `Warframe` y `Genshin` prueban que los time-gates solo funcionan si el jugador entiende rapido que esta listo, que esta corriendo y por que volver. `Diablo 3`, `Diablo 4`, `Torchlight Infinite` y `Diablo Immortal` prueban que el combate se disfruta mas cuando el HUD carga poco y el resto vive en capas contextuales. `OSRS` y `WoW` recuerdan que la longevidad sostenida no sale solo del poder vertical: sale de objetivos visibles, coleccion, identidad y retorno sin confusion.

La direccion recomendada para este proyecto es:

- consolidar `Santuario` como home operacional y emocional
- simplificar `Expedicion` a combate, mochila e intel
- hacer que `Heroe` y `Ecos` den identidad de build mucho antes
- usar time-gates como razon para volver, no como pared
- introducir monetizacion solo sobre confianza ya ganada
- construir longevidad sobre progreso horizontal, coleccion, proyectos y temporadas ligeras, no sobre inflation infinita

La propuesta de valor mas fuerte del juego no es "otro idle con prestige". Es:

`un idle ARPG extraction-lite donde la expedicion genera proyectos persistentes que el Santuario cocina a largo plazo`

Eso es suficientemente distinto, legible y monetizable de forma etica si se protege bien.

## PASADA 1 - Sintesis de referentes

### Gladiatus

- `Lo que hace bien`: funciona porque comprime la fantasia de "salir, volver, invertir" en sesiones cortas. La estructura ciudad -> expedicion -> arena -> mercado sigue siendo muy leible incluso cuando el producto esta saturado.[^gladiatus-official]
- `Lo que hace mal`: la comunidad lo castiga por premium sobre cooldowns, slots y velocidad. Cuando el tiempo y la friccion parecen diseñados para empujarte a pagar, la fantasia se rompe.[^gladiatus-rubies][^gladiatus-reviews]
- `Lo mas trasladable`: el loop asincrono de expedicion corta con retorno al hub.
- `Lo que este juego debe evitar`: saturar demasiadas mejoras de conveniencia sobre el loop core.
- `Monetizacion`: premium acelerador y de conveniencia. Trasladable solo como ejemplo de lo que hay que moderar mucho.

### Travian

- `Lo que hace bien`: su overview central reduce ansiedad operacional. El jugador sabe rapido que esta construyendo, que termina pronto y que decision duele postergar.[^travian-overview]
- `Lo que hace mal`: la comunidad asocia parte de la competitividad con gasto, sobre todo cuando Gold Club y velocidad pesan demasiado en servidores intensos.[^travian-goldclub][^travian-reddit]
- `Lo mas trasladable`: el overview operacional como home real.
- `Lo que este juego debe evitar`: dejar que la mejor experiencia de timers dependa de premium duro.
- `Monetizacion`: conveniencia competitiva. Leccion: si cobras por ahorrar gestion, no conviertas eso en "si no pago, juego mal".

### Path of Exile 1

- `Lo que hace bien`: su profundidad funciona porque el jugador siente agencia irreversible. El arbol pasivo, los keystones y el item chase convierten cada personaje en una declaracion personal.[^poe-tree]
- `Lo que hace mal`: la comunidad sigue marcando la hostilidad inicial y la cantidad de conocimiento externo requerido para disfrutarlo de verdad.[^poe-newplayers][^poe-hostile]
- `Lo mas trasladable`: build identity real mediante decisiones que cambian reglas, no solo numeros.
- `Lo que este juego debe evitar`: complejidad que exige wiki desde el minuto uno.
- `Monetizacion`: stash tabs, cosméticos y supporter packs. La comunidad la respeta porque casi nunca vende poder directo y porque las compras de identidad pesan mas que la ventaja bruta.[^poe-stash][^poe-tabs]

### Path of Exile 2

- `Lo que hace bien`: simplifica selectivamente. Hace mas legible el combate y la entrada sin matar la fantasía de profundidad. Tambien protege continuidad de cuenta al compartir MTX y stash tabs con PoE1.[^poe2-faq]
- `Lo que hace mal`: cuando simplifica o rebalancea bajo presion, la comunidad reacciona fuerte si percibe que algo central queda a medias o cambia sin suficiente claridad.[^poe2-review][^poe2-patch]
- `Lo mas trasladable`: simplificar friccion, no profundidad.
- `Lo que este juego debe evitar`: presentar "accessibility" como sinónimo de quitar capas interesantes.
- `Monetizacion`: Early Access por supporter packs y continuidad de MTX. Trasladable como modelo de confianza para jugadores ya comprometidos, no para el lanzamiento inicial de este proyecto.[^poe2-faq]

### Grim Dawn

- `Lo que hace bien`: su identidad de build sale de masteries combinadas y reputaciones de faccion. El jugador siente pronto que no esta jugando "el guerrero", sino su variante del guerrero.[^grimdawn-masteries][^grimdawn-factions]
- `Lo que hace mal`: parte de su profundidad depende de modales y pantallas densas que funcionan en desktop pero no traducen directo a mobile.
- `Lo mas trasladable`: fantasias de build que se cruzan, no ramas aisladas.
- `Lo que este juego debe evitar`: esconder la identidad de build demasiado tarde.
- `Monetizacion`: juego premium + expansiones. Muy respetado porque cobra por contenido, no por evitar dolor.

### Diablo Immortal

- `Lo que hace bien`: adapta el ARPG a sesion corta con controles claros, ciudad-hub fuerte y Codex como checklist operativo. Mucha critica tapa que la base de loop y controles esta muy pulida.[^di-gameplay][^di-codex]
- `Lo que hace mal`: la comunidad describe bloat, chores y demasiados sistemas sociales/diarios superpuestos. Incluso jugadores que lo disfrutan lo llaman "checklist" y "game, not a job".[^di-overwhelming][^di-checklist][^di-claims]
- `Lo mas trasladable`: una bandeja que te diga que tocar hoy.
- `Lo que este juego debe evitar`: chore list obligatoria y venta de progreso en sistemas paralelos.
- `Monetizacion`: el ejemplo mas claro de reputacion destruida por monetizacion ligada a poder y a loops psicológicos de extorsion.

### Genshin Impact

- `Lo que hace bien`: organiza sistemas enormes sin ensuciar el espacio de juego principal. El menu Paimon y el Adventurer Handbook separan exploracion, meta y rutina diaria con mucha disciplina.[^genshin-paimon][^genshin-handbook]
- `Lo que hace mal`: resin sigue siendo una friccion famosa, aunque la evolucion de cap, condensed resin y mejoras de UX muestra aprendizaje gradual.[^genshin-resin][^genshin-condensed][^genshin-resin-history]
- `Lo mas trasladable`: rutina diaria compacta, no invasiva.
- `Lo que este juego debe evitar`: dejar que la rutina diaria se coma la fantasia principal.
- `Monetizacion`: gacha, resin y battle pass. No trasladable directamente. Lo trasladable es la obsesion por hacer agradable la sesion corta.

### Torchlight Infinite

- `Lo que hace bien`: mantiene pelea rapida, muchisimo build space y temporadas con fantasias marcadas. La UI intenta dejar el farmeo fluir.[^torchlight-steam]
- `Lo que hace mal`: la recepcion mixta sugiere que buena parte de la comunidad ve ruido de sistema, monetizacion cuestionable o suficiente falta de peso en los hallazgos para no engancharse a largo plazo.[^torchlight-steam]
- `Lo mas trasladable`: alta build diversity con ritmo rápido.
- `Lo que este juego debe evitar`: meter demasiadas capas de progreso si el loot no genera historias.
- `Monetizacion`: F2P con compras y temporadas. Transferible solo con fuerte poda y limites eticos claros.

### Diablo 3

- `Lo que hace bien`: se volvio querido cuando entendio que el jugador queria accion limpia, loot util y town contextual. Loot 2.0 y Reaper of Souls rehicieron la promesa del juego.[^d3-ah][^d3-loot2][^d3-ros]
- `Lo que hace mal`: el Auction House es una leccion permanente sobre matar el loot chase al permitir saltarse emocionalmente la fantasia del drop.[^d3-ah]
- `Lo mas trasladable`: si el loot no emociona, todo el edificio alrededor se cae.
- `Lo que este juego debe evitar`: cualquier monetizacion o sistema que haga sentir que conviene comprar el resultado y no jugar el proceso.
- `Monetizacion`: premium + expansiones. Muy claro y poco ambiguo.

### Diablo 4

- `Lo que hace bien`: escucha feedback duro y itera fuerte sobre claridad, itemizacion y experiencia moment to moment. Sus quarterly updates muestran disciplina de UX y su equipo reconoce cuando demasiados cambios confunden al jugador.[^d4-feb2020][^d4-dec2020][^d4-keep-up]
- `Lo que hace mal`: el jugador promedio siente a veces que el piso cambia demasiado rapido, especialmente si vuelve despues de meses.[^d4-season-feedback][^d4-keep-up][^d4-negative]
- `Lo mas trasladable`: sacrificar una parte de la elegancia teorica por claridad tactica inmediata.
- `Lo que este juego debe evitar`: rehacer sistemas base tantas veces que volver se sienta estudiar otra vez.
- `Monetizacion`: premium + cosméticos + battle pass. Respetable cuando no toca poder; mas discutida cuando precio y valor no coinciden.[^d4-mtx]

### RuneScape / OSRS

- `Lo que hace bien`: OSRS convierte coleccion, logros visibles y progreso horizontal en una fabrica de objetivos autogenerados. El collection log es una herramienta de longevidad brutal.[^osrs-clog]
- `Lo que hace mal`: RS3 arrastra años de desgaste de confianza por Treasure Hunter y capas de monetizacion agresivas.[^rs3-th][^rs3-integrity]
- `Lo mas trasladable`: collection log persistente y progreso horizontal visible.
- `Lo que este juego debe evitar`: contaminar progreso identitario con ventas intrusivas.
- `Monetizacion`: OSRS con membresia y bonds acotados; RS3 con membresia + bonds + MTX. La comparacion es una leccion perfecta de confianza versus cinismo.[^osrs-bonds][^rs-bonds]

### Warframe

- `Lo que hace bien`: hace aceptables los time-gates porque siempre hay otra cosa valiosa para hacer, y porque el hub, la Foundry y la Companion App convierten la espera en progreso distribuido.[^warframe-foundry][^warframe-companion]
- `Lo que hace mal`: el early/midgame puede ser muy opaco y el retorno despues de mucho tiempo puede abrumar.
- `Lo mas trasladable`: time-gate sano = proyecto cocinandose mientras jugas a otra cosa en el mismo ecosistema.
- `Lo que este juego debe evitar`: dejar que el jugador sienta que el timer es la unica pared entre el y la diversion.
- `Monetizacion`: platinum, cosméticos, slots y trading entre jugadores. Muy respetada porque la premium currency tambien circula in-game y porque casi todo se puede perseguir jugando.[^warframe-trading]

### World of Warcraft

- `Lo que hace bien`: el HUD/quest tracking sobrevivio veinte años porque entiende que el jugador necesita siempre una lectura de objetivo proximo. Dragonflight modernizo esa idea sin matar legibilidad.[^wow-hud][^wow-feedback]
- `Lo que hace mal`: WoW tambien es un aviso contra el bloat de expansion sobre expansion y contra monetizar demasiado encima de un producto ya pago.
- `Lo mas trasladable`: tracker persistente de "que hago ahora" visible sin abrir menus.
- `Lo que este juego debe evitar`: confiar en que el jugador recuerde solo que sistema importa hoy.
- `Monetizacion`: suscripcion, expansiones, servicios y cosméticos. Muy estable, pero tambien un recordatorio de no apilar demasiado sobre una base ya cobrada.

### Last Epoch

- `Lo que hace bien`: convierte cada skill en un mini-árbol y hace que la build se sienta propia muy rapido. La comunidad valora mucho su crafting deterministico y su postura publica anti pay-to-win.[^le-steam]
- `Lo que hace mal`: parte de la recepcion reciente muestra que contenido y estabilidad tambien importan; un gran sistema no compensa todo.
- `Lo mas trasladable`: decisiones fuertes de skill identity muy temprano.
- `Lo que este juego debe evitar`: suponer que profundidad de build sola sostiene el retorno durante meses.
- `Monetizacion`: premium, supporter packs y cosméticos. Muy buen norte etico para este proyecto.[^le-steam]

## Ranking de referentes por relevancia para este proyecto

1. `Warframe` - mejor referente para Santuario, time-gates y monetizacion respetada.
2. `Travian` - mejor referente para home operacional y lectura instantanea de timers/colas.
3. `Path of Exile 1` - mejor referente para build identity y profundidad real.
4. `Genshin Impact` - mejor referente para sesion corta, menu utilitario y rutina compacta.
5. `Diablo 3` - mejor referente para limpieza del loop de combate y town contextual.
6. `Diablo 4` - mejor referente para iteracion moderna de UX y reentrada.
7. `Last Epoch` - mejor referente para skill identity temprana y crafting controlado.
8. `OSRS` - mejor referente para longevidad horizontal y collection log.
9. `Grim Dawn` - mejor referente para fantasia de build cruzada.
10. `Torchlight Infinite` - util para ritmo y diversidad, menos fiable para monetizacion.
11. `WoW` - util para trackeo persistente y retorno.
12. `Path of Exile 2` - valioso por simplificacion selectiva, todavia inestable como referencia final.
13. `Diablo Immortal` - util para checklist y mobile ARPG, peligroso como modelo de monetizacion.
14. `Gladiatus` - util como advertencia y para loops cortos, no como referencia de confianza.

## Las 15 ideas de diseño mas valiosas

1. `Home operacional con timers, claims y CTA dominante` - `Travian`
2. `Time-gates como proyectos paralelos, no como muro principal` - `Warframe`
3. `Build identity visible antes del midgame` - `PoE1`, `Grim Dawn`, `Last Epoch`
4. `Loop de combate limpio y pocas superficies run-critical` - `Diablo 3`, `Diablo 4`
5. `Ritual diario corto y compacto` - `Genshin`
6. `Collection log persistente como ancla de largo plazo` - `OSRS`
7. `Tracker visible de "que hago ahora"` - `WoW`
8. `Monetizacion de identidad y conveniencia, no de poder` - `PoE`, `Warframe`, `Last Epoch`
9. `Proyectos persistentes que siguen cocinando fuera de la run` - `Warframe`, `Travian`
10. `Late-game horizontal que abre objetivos en vez de solo inflar stats` - `OSRS`, `Warframe`
11. `Onboarding que enseña tocando el juego real` - `Genshin`, `WoW`, `Warframe`
12. `Feedback fuerte para drops, craft y bosses` - `Diablo`
13. `Seasons o ciclos que cambian prioridades sin invalidar toda la cuenta` - `PoE`, `Diablo 4`
14. `Utility menu separado del loop central` - `Genshin`
15. `Podar y renombrar sistemas segun modelo mental, no segun implementacion tecnica` - `Diablo 4`, `Warframe`

## Las 5 trampas de diseño mas comunes

1. `Confundir profundidad con saturacion visible`.
   Caso: `PoE1` es poderoso a pesar de esa trampa, no gracias a ella. La comunidad nueva sigue describiendolo como hostil.[^poe-hostile]

2. `Hacer chore lists obligatorias para sostener retencion`.
   Caso: `Diablo Immortal` recibe esa critica todo el tiempo incluso entre jugadores que lo defienden.[^di-overwhelming][^di-checklist]

3. `Vender atajos sobre el core fantasy`.
   Caso: `Diablo 3 Auction House` y la reputacion historica de `Diablo Immortal`.[^d3-ah][^di-claims]

4. `Cambiar sistemas base tan seguido que volver sea estudiar`.
   Caso: `Diablo 4` admite que es duro seguirle el ritmo si no estas al dia.[^d4-keep-up]

5. `Meter premium en cada friccion temporal`.
   Caso: `Gladiatus` y browser games clasicos erosionan confianza con eso.[^gladiatus-rubies][^gladiatus-reviews]

## Las 3 filosofias de monetizacion mas exitosas

1. `Gratis, cosmetico y conveniencia acotada`
   Referentes: `PoE`, `Warframe`.
   Funciona porque el jugador siente que paga para quedarse, no para competir.

2. `Premium + expansiones`
   Referentes: `Grim Dawn`, `Diablo 3`, `Last Epoch`.
   Funciona porque el contrato es claro: pagas por contenido, no por aliviar dolor artificial.

3. `Suscripcion o membresia con ecosistema persistente`
   Referentes: `OSRS`, `WoW`.
   Funciona cuando la comunidad percibe que la continuidad del mundo y el mantenimiento justifican el costo, y cuando no se apilan demasiadas capas extra encima.

## PASADA 2 - Sistemas: que agregar, que modificar, que sacar

## Sistemas a agregar

### 1. `Tracker de expedicion y Santuario`

`Sensacion`: siempre se que importa ahora.  
`Inspiracion`: `WoW` objective tracker + `Travian` overview.[^wow-hud][^travian-overview]  
`Momento`: early.  
`Conexion`: onboarding, Santuario, run, retorno.  
`Riesgo`: convertirse en lista ruidosa.  
`Mitigacion`: mostrar solo 1 objetivo primario y hasta 2 secundarios.  
`Tutorial`: se entiende con onboarding liviano.  
`Monetizacion etica`: ninguna directa; mejora retencion y retorno.

### 2. `Collection Log de reliquias, bosses y proyectos`

`Sensacion`: siempre tengo algo pendiente aunque no suba puro poder.  
`Inspiracion`: `OSRS` collection log.[^osrs-clog]  
`Momento`: mid.  
`Conexion`: drops de expedicion, bosses, blueprints, codex.  
`Riesgo`: ser solo checklist muerto.  
`Mitigacion`: atar hitos a cosmeticos menores, titulos, variantes de Santuario y memoria de cuenta.  
`Tutorial`: no necesita tutorial fuerte.  
`Monetizacion etica`: cosméticos tematicos y book skins, nunca progreso.

### 3. `Proyectos de Santuario de largo aliento`

`Sensacion`: lo que traje de la expedicion importa despues.  
`Inspiracion`: `Warframe` Foundry + `Travian` colas.[^warframe-foundry][^travian-overview]  
`Momento`: early-mid.  
`Conexion`: Destileria, Biblioteca, Deep Forge, Laboratorio.  
`Riesgo`: que se sienta burocracia.  
`Mitigacion`: cada proyecto debe cambiar el juego, no solo numeritos invisibles.  
`Tutorial`: si.  
`Monetizacion etica`: slots cosmeticos o cola visual; nunca acortar timer core al punto de romper balance.

### 4. `Mutadores de run legibles`

`Sensacion`: cada expedicion tiene tema y tono.  
`Inspiracion`: `PoE` leagues, `Diablo 4` seasonal theme, `Torchlight Infinite` seasons.[^poe-tree][^d4-season-feedback][^torchlight-steam]  
`Momento`: mid.  
`Conexion`: sigilos, hunt, Abismo.  
`Riesgo`: inflar combinatoria incomprensible.  
`Mitigacion`: 1 mutador principal por run y 1 secundario maximo.  
`Tutorial`: contextual.  
`Monetizacion etica`: cosméticos de temporada y supporter packs.

### 5. `Momentos de build signature`

`Sensacion`: este personaje es mio.  
`Inspiracion`: `Grim Dawn`, `Last Epoch`, `PoE1`.[^grimdawn-masteries][^le-steam][^poe-tree]  
`Momento`: early.  
`Conexion`: talentos, ecos, skills, rare items, sigilos.  
`Riesgo`: sobreprometer variedad falsa.  
`Mitigacion`: menos builds, pero mas distintas en fantasía.  
`Tutorial`: si, por descubrimiento guiado.  
`Monetizacion etica`: cosméticos por arquetipo.

### 6. `Resumen de retorno`

`Sensacion`: puedo dejar el juego y volver sin sentirme perdido.  
`Inspiracion`: `Warframe` y `Diablo 4` aprendiendo a resumir cambios y estado.[^warframe-companion][^d4-keep-up]  
`Momento`: siempre.  
`Conexion`: login, patch notes resumidas, Santuario.  
`Riesgo`: pantalla demasiado densa.  
`Mitigacion`: maximo 3 bloques: "lo listo", "lo nuevo", "lo sugerido".  
`Tutorial`: no, es autoexplicativo.  
`Monetizacion etica`: ninguna directa.

## Sistemas a modificar

### `Santuario`

Problema: hoy es correcto conceptualmente pero visualmente plano.  
Cambio: convertirlo en `overview + CTA + bandeja operacional + estaciones`.  
Referente: `Travian`, `Warframe`, `Diablo Immortal`.[^travian-overview][^warframe-foundry][^di-gameplay]  
Riesgo: quitar demasiada informacion y volverlo vacio.

### `Expedicion`

Problema: mezcla run-critical con subcapas secundarias.  
Cambio: quedarse con `Combate / Mochila / Intel`.  
Referente: `Diablo 3`, `Diablo 4`, `Torchlight Infinite`.[^d3-ros][^d4-feb2020][^torchlight-steam]  
Riesgo: perder herramientas utiles si no aparecen contextualmente desde mochila.

### `Heroe`

Problema: build identity llega tarde o demasiado repartida.  
Cambio: hacer que una o dos decisiones tempranas cambien de verdad el comportamiento del run.  
Referente: `Grim Dawn`, `Last Epoch`.[^grimdawn-masteries][^le-steam]  
Riesgo: generar ramas dominantes si no se cuida fantasía versus numerito.

### `Ecos`

Problema: hoy es meta fuerte pero puede leerse como "otro arbol".  
Cambio: dividirlo en `resumen de cuenta`, `arbol`, `late goals`.  
Referente: `OSRS`, `PoE`, `Diablo 4`.[^osrs-clog][^poe-tree][^d4-season-feedback]  
Riesgo: sobreexplicar.

### `Biblioteca/Caza`

Problema: conocimiento partido.  
Cambio: llevarlas a un mismo modelo mental aunque tecnicamente sigan separadas al principio.  
Referente: `Genshin` archive/guide separation y `Diablo Immortal` Codex paraguas.[^genshin-handbook][^di-codex]  
Riesgo: mover demasiado contenido de golpe.

### `Extraccion`

Problema: hoy cierra bien la run, pero puede volverse puro trámite si no deja huella.  
Cambio: siempre debe mostrar al menos una tension: que conserve, que procese, que arriesgue despues.  
Referente: `ARPG loot moment` + `extraction-lite` de producto.  
Riesgo: castigar demasiado y volverlo anti-idle.

## Sistemas a simplificar o sacar

### `Forja` dentro del primer nivel de Expedicion

No aporta suficiente valor top-level hoy.  
Lo correcto es convertirla en accion contextual de item o en parte del `Taller`.

### `Metrica` y `Sistema` en navegacion fuerte

Aportan a testing y tuning, no al jugador promedio.  
`Genshin` y `WoW` muestran que lo utilitario tiene mejor hogar fuera del loop principal.[^genshin-paimon][^wow-hud]

### `Multiples sugerencias simultaneas`

Si el juego muestra varias "proximas mejores acciones" a la vez, no esta guiando. Esta delegando criterio.

## Build diversity y fantasias de personaje

Hoy el juego ofrece fantasias base, pero todavia no las capitaliza del todo como historias compartibles.  
La recomendacion no es "mas builds", sino `6 a 10 fantasias reales` claramente distintas a mediano plazo, aunque compartan piezas.

Las fantasias mas compartibles para este juego son:

- `glass cannon que sobrevive por timing y extraccion`
- `lifesteal/sustain que aguanta runs largas`
- `thorns/reflect`
- `hunter de bosses`
- `economia/codex build`
- `forge-project build`
- `sigil control / mutador abuse`

`Grim Dawn` enseña que la fantasia nace cuando dos ejes se cruzan. `Last Epoch` enseña que una skill puede mutar la fantasia sola. Traduccion recomendada para este juego:

- una clase define el tono base
- una especializacion define el enfoque
- un eje de talentos o ecos define la regla rota
- un item o blueprint define el sello personal

## El momento "esto es mio"

Ese momento deberia llegar temprano: cuando el jugador toma una primera decision que no es reversible sin costo emocional y ve una consecuencia visible en el loop de combate o en el Santuario.

El referente que mejor lo logra de forma legible es `Last Epoch`, porque cada skill tree cambia el comportamiento del boton que ya conoces. Para este juego, el equivalente deberia ser:

- un primer talento o eco que cambie de verdad la run
- un primer blueprint/proyecto que altere el valor de futuros drops
- un primer sigilo o mutador que reescriba como vale la pena jugar la expedicion

## Output de Pasada 2

### Sistemas nuevos recomendados

- tracker de objetivo actual
- collection log persistente
- proyectos de Santuario de largo aliento
- mutadores de run legibles
- momentos de build signature
- resumen de retorno

### Sistemas a modificar

- Santuario
- Expedicion
- Heroe
- Ecos
- Biblioteca/Caza
- Extraccion

### Sistemas a simplificar o sacar

- Forja como subtab primaria de Expedicion
- Sistema/Metricas como superficies prominentes
- sugerencias multiples sin prioridad

### Filosofia de build diversity

`pocas fantasias, muy nitidas, visibles temprano y reforzadas por proyectos persistentes`

## PASADA 3 - Layout, UX y experiencia de jugador

## Arquitectura de navegacion recomendada

### Filosofia

- lo que el jugador toca cada sesion va en navegacion primaria
- lo que el jugador toca cada run va en subnavegacion contextual
- lo que el jugador toca por proyecto va en estaciones
- lo que el jugador toca rara vez va en `Mas`

### Arquitectura final recomendada

- `Santuario`
- `Expedicion`
- `Heroe`
- `Ecos`
- `Mas`

### Filosofia detras de cada una

- `Santuario`: home operacional y emocional. `Travian` + `Warframe`.
- `Expedicion`: loop vivo. `Diablo 3` + `Diablo 4`.
- `Heroe`: identidad de build. `Grim Dawn` + `Last Epoch`.
- `Ecos`: progresion de cuenta y largo plazo. `OSRS` + `PoE`.
- `Mas`: utilitario. `Genshin`.

## Jerarquia de informacion por pantalla

### Santuario

Sin tocar nada debe verse:

- estado de run
- CTA principal
- que esta listo
- que corre ahora
- siguiente mejor paso

En un tap debe encontrarse:

- estaciones
- recursos
- stash/proyectos

Puede estar enterrado:

- detalles largos de jobs
- historial
- sistemas de QA

### Expedicion

Sin tocar nada debe verse:

- enemigo actual
- tier o progreso
- riesgo
- extraccion disponible o no

En un tap debe encontrarse:

- loot comparado
- intel
- acciones de item

Puede estar enterrado:

- crafting profundo
- info secundaria de codex

### Heroe

Sin tocar nada debe verse:

- arquetipo actual
- eje principal de build
- poder real interpretado, no solo stats

En un tap debe encontrarse:

- talentos
- atributos
- sinergias

### Ecos

Sin tocar nada debe verse:

- estado de meta-progresion
- proximo unlock fuerte
- camino largo sugerido

### Mas

Sin tocar nada basta con una lista clara.

## Thumb zone y mobile-first

Principios aplicados desde `Genshin`, `Diablo Immortal` y `Torchlight Infinite`:

1. `CTA y claims en tercio inferior visible`.
2. `Tabs primarias siempre alcanzables con el pulgar`.
3. `Acciones secundarias en sheets u overlays, no microbotones arriba`.
4. `Scrollear para leer, no para encontrar la unica accion necesaria`.
5. `Comparacion de item en una sola columna dominante`.
6. `No usar dos barras de navegacion horizontales compitiendo arriba`.

## Feedback visual y dopamina

| Momento | Feedback recomendado | Referente |
|---|---|---|
| `drop raro` | destello corto, nombre fuerte, pausa de respiracion, color de rareza, opcion rapida de marcar proyecto | `Diablo`, `PoE` |
| `boss kill` | sello sonoro mas pesado, pantalla limpia un segundo, resumen de botin importante | `Diablo`, `WoW raid boss cues` |
| `craft exitoso` | animacion de tension y release, no fireworks infinitos | `Last Epoch`, `PoE` |
| `level up / eco unlock` | golpe visual y texto corto de impacto: "nuevo eje disponible" | `WoW`, `Diablo` |
| `extraccion` | alivio + evaluacion + promesa de proyecto futuro | identidad propia del juego |
| `perfect roll / blueprint` | momento fotografiable, card limpia con una sola pieza protagonista | `Diablo item shot`, `PoE showcase culture` |

## Momentos compartibles

El juego deberia fabricar cinco screenshots naturales:

1. `extraje este item/proyecto`
2. `mi build ya esta rota`
3. `mate este boss con esta seed`
4. `complete este tramo del collection log`
5. `mi Santuario finalmente desbloqueo esto`

## Onboarding

### Principios

- `WoW`: el primer minuto tiene que decir "aca haces cosas", no "aca lees sistemas".[^wow-hud]
- `Warframe`: introducir estaciones y time-gates despues de la fantasia principal, no antes.
- `Genshin`: el tutorial se siente mejor cuando parece un objetivo del mundo y no una clase teorica.

### Filosofia de onboarding en 3 palabras o menos por capa

- `Primer minuto`: `ver y tocar`
- `Primera run`: `peligro sin castigo`
- `Primer retorno`: `lo traido importa`
- `Primer meta layer`: `elegi una direccion`
- `Primer time-gate`: `deja algo cocinando`

## Output de Pasada 3

### Arquitectura de navegacion recomendada

`Santuario / Expedicion / Heroe / Ecos / Mas`, con estaciones persistentes y subnavegacion contextual.

### Principios de jerarquia de informacion

- una sola prioridad visible por vez
- estado de run y claims arriba del fold
- detalles densos en overlays o pantallas dedicadas
- el juego siempre debe contestar "que hago ahora"

### Principios de layout mobile-first

- CTA en thumb zone
- comparaciones en una sola columna
- scroll para ampliar, no para descubrir lo obligatorio
- timers compactos
- badges discretos

### Lista de momentos de alta dopamina

- drop raro
- boss kill
- craft exitoso
- level/eco unlock
- extraccion
- perfect roll / blueprint

### Filosofia de onboarding

`ver / tocar / volver / elegir / cocinar`

## PASADA 4 - Monetizacion etica y modelos de negocio

## Analisis de monetizacion por referente

| Juego | Modelo | Lo que la comunidad tolera | Lo que castiga | Leccion aplicable |
|---|---|---|---|---|
| `Gladiatus` | F2P premium de conveniencia | progresar offline y volver | premium encima de friccion y timers | no vender demasiados atajos de loop core |
| `Travian` | F2P competitivo + boosts | overview y eficiencia | Gold Club y gasto competitivo excesivo | si cobras conveniencia, limita su impacto competitivo |
| `PoE1` | F2P + stash + cosmeticos + supporter packs | pagar por identidad y orden | friccion de stash si parece obligatoria | vender orden y expresion, no poder |
| `PoE2` | EA/supporter packs + continuidad MTX | continuidad de compras | ambiguedad de acceso o cambios de criterio | la confianza se rompe rapido si cambias el contrato |
| `Grim Dawn` | premium + expansiones | contenido nuevo real | casi nada en monetizacion | contrato simple inspira confianza |
| `Diablo Immortal` | F2P + BP + bundles + poder | BP barato y PvE base pulido | loops psicologicos hacia gasto y poder | jamas vender progreso que vacie el juego |
| `Genshin` | gacha + BP + resin | rutina corta, updates fuertes | gating si se siente extorsion | el time-gate se tolera mejor cuando la rutina es amable |
| `Torchlight Infinite` | F2P + temporadas + compras | build fantasy y farmeo | sospecha sobre monetizacion y peso de sistemas | si sos F2P, la confianza debe ser clarisima |
| `Diablo 3` | premium + expansion | valor claro | Auction House historico | nunca intermediar el loot fantasy con dinero |
| `Diablo 4` | premium + cosméticos + BP | poder fuera de tienda | precio/valor dudoso | en ARPG paid, lo cosmetico caro se tolera solo si el juego base ya convence |
| `OSRS` | membresia + bonds acotados | continuidad y posibilidad de financiar con oro | casi todo lo que huela a RS3 | la integridad vale mas que monetizar cada hueco |
| `RS3` | membresia + bonds + MTX | costumbre de largo plazo | Treasure Hunter y fatiga de confianza | cada capa extra de MTX deja cicatriz |
| `Warframe` | F2P + platinum + trading + cosmetics | poder farmear o tradear casi todo | slots/timegates cuando el early es opaco | premium respetada si el jugador siente agencia real |
| `WoW` | suscripcion + expansiones + servicios | mundo vivo y soporte continuo | apilar demasiadas capas pagas | no mezclar demasiados modelos |
| `Last Epoch` | premium + supporter packs + cosmetics | claridad anti-p2w | poca paciencia si algo parece romper esa promesa | la promesa etica debe ser explicitamente publica |

## Principios de monetizacion etica mas respetados del genero

1. `Nunca vendas poder final`.
2. `Vende identidad, expresion y comodidad no dominante`.
3. `Lo que pagas debe sentirse opcional, no la solucion al dolor diseñado`.
4. `La moneda premium no debe invalidar el loot chase`.
5. `Toda compra debe respetar a quien no paga`.
6. `Primero confianza, despues tienda`.

## Propuesta completa de modelo para este juego

### Filosofia central

`Nunca se vende poder, nunca se vende exito de run; siempre se puede vender identidad, expresion y conveniencia no decisiva.`

### Capas de monetizacion

`Capa 1: cosmeticos de interfaz y fantasia`

- skins de Santuario
- marcos de item destacado
- temas visuales de expedicion
- estilos de extraction card
- efectos de eco/level/boss

Etica: no alteran balance ni ritmo.

`Capa 2: supporter packs`

- nombre
- titulo
- tema visual
- soundtrack / artbook / cosmetic bundle

Etica: compran pertenencia.

`Capa 3: conveniencia suave`

- presets cosmeticos
- slots visuales de loadouts
- espacio de archivo historico
- decoracion adicional del Santuario

Etica: ayudan a ordenar y expresarse, no a ganar una run.

`Capa 4: expansiones o seasons premium ligeras`

- mini campaign de lore
- set de bosses tematicos
- linea cosmetica de temporada

Etica: compran contenido o vanity, nunca stats.

### Lo que nunca se vende

1. vidas
2. probabilidad de loot
3. exito garantizado de craft
4. progreso directo de ecos o talentos
5. reduccion de dificultad de boss o extraccion segura paga

### Momento correcto para monetizar

Antes de cobrar el primer centavo, el juego necesita:

- home clara
- loop Santuario/Expedicion/Extraccion estabilizado
- first-time user experience pulida
- al menos una capa clara de build identity
- una forma fuerte de retorno a la semana 1

### Secuencia de lanzamiento recomendada

1. `sin monetizacion o solo supporter pack fundador`
2. `cosmeticos de UI/Santuario`
3. `supporter packs tematicos`
4. `conveniencia suave de archivo/presets`
5. `season pass cosmetico liviano`

### Monetizacion y retencion

- los cosmeticos refuerzan identidad
- los supporter packs refuerzan pertenencia
- la conveniencia suave refuerza orden y continuidad
- el pass cosmetico refuerza retorno si ya existe sesion semanal sana

### El jugador que paga vs el que no paga

`Jugador que no paga`:

- completa todo el contenido jugable
- puede perseguir todas las builds
- progresa a la misma profundidad sistémica

`Jugador que paga`:

- se expresa mas
- organiza mejor su archivo
- apoya el juego y se siente parte

Nunca debe sentirse "el que paga juega bien y el otro juega lento".

## Time-gating y monetizacion

### Cuando un time-gate es sano

- cuando hay otra cosa util para hacer
- cuando el timer produce anticipacion
- cuando el jugador entiende por que existe
- cuando no hay venta agresiva del alivio

### Cuando un time-gate es disfraz monetario

- cuando tapa contenido que ya deberia estar disponible
- cuando el juego te deja aburrido mientras esperas
- cuando la tienda aparece como solucion obvia al dolor

### Aplicacion a este juego

- `Destileria`, `Biblioteca`, `Altar`, `Deep Forge` pueden tener time-gate sano
- `iniciar expedicion`, `extraer`, `equipar`, `invertir en build` no

## Output de Pasada 4

### Principios de monetizacion etica mas respetados

- no vender poder
- no vender alivio a dolor artificial
- vender identidad, pertenencia y orden

### Propuesta completa

- supporter packs
- cosmeticos
- conveniencia suave no dominante
- seasons premium ligeras solo despues de estabilizar el core

### Las 5 cosas que nunca se deberian vender

- poder directo
- loot chance
- craft success
- meta-progresion directa
- seguridad de extraccion

### Secuencia recomendada

- fundador
- vanity
- pertenencia
- conveniencia suave
- season cosmetic

## PASADA 5 - Longevidad, retencion y adictividad

## Filosofia de curvas de progresion por sistema

| Sistema | Curva recomendada | Por que |
|---|---|---|
| `XP del heroe` | logaritmica suave | early rapido para enganchar, luego mas espaciada para que build y loot tomen protagonismo |
| `poder de items de run` | escalonada | crea picos memorables de upgrade en vez de linea plana |
| `blueprints / proyectos persistentes` | lineal con saltos | debe sentirse estable, con momentos de desbloqueo fuerte |
| `crafting persistente` | escalonada con riesgo controlado | tension y release, no spam determinista sin drama |
| `Ecos / meta` | logaritmica + horizontal | cada punto vale, pero despues importa abrir opciones y no solo mas numero |
| `collection log` | infinita horizontal | siempre deja objetivos sin romper balance |
| `Abismo / ultra late` | exponencial muy controlada en dificultad, horizontal en recompensa identitaria | necesita aspiracion sin vaciar el resto del juego |

## Mapa de mecanismos de adictividad por referente

| Juego | Mecanismo central | Sano o manipulativo | Aplicable |
|---|---|---|---|
| `Gladiatus` | retorno por timer y rutina | mixto | solo la parte de retorno corto |
| `Travian` | planificacion y anticipacion | sano | si hay overview claro |
| `PoE1` | identidad + loot chase + league reset | sano si respetas tiempo | si la complejidad entra gradual |
| `PoE2` | combate atento + descubrimiento | sano | si no destruyes claridad |
| `Grim Dawn` | fantasias de build | sano | si das decisiones fuertes temprano |
| `Diablo Immortal` | chores + social obligation + progreso constante | mixto tirando a manipulativo | evitar la obligacion temporal |
| `Genshin` | rutina corta + coleccion + expectativa de update | sano con fricciones | si la sesion corta es amable |
| `Torchlight Infinite` | build experimentation + season novelty | sano | si la novedad no reemplaza la profundidad |
| `Diablo 3` | burst de accion + loot usable | sano | totalmente aplicable |
| `Diablo 4` | season restart + loot + social/media beats | sano si el retorno es claro | aplicable con ciclos mas suaves |
| `OSRS` | coleccion + metas autogeneradas + progreso horizontal | muy sano | altamente aplicable |
| `Warframe` | proyectos paralelos + coleccion + regreso por quest/update | sano | muy aplicable |
| `WoW` | tracker + social + patch return | mixto pero potente | aplicable en tracker y retorno |
| `Last Epoch` | ownership de build + crafting controlado | sano | muy aplicable |

## El loop de retencion ideal para este juego

### Loop ideal de 5 minutos

- entrar
- cobrar 1 a 3 cosas
- lanzar 1 proyecto
- tocar una decision de build o preparacion
- salir o entrar a una run

Sensacion: `avance sin friccion`  
Referentes: `Travian`, `Genshin`, `Warframe`.

### Loop ideal de 1 hora

- preparar Santuario
- correr una o varias expediciones
- encontrar al menos una pieza o blueprint interesante
- extraer
- dejar cocinando algo significativo

Sensacion: `caceria con consecuencia`  
Referentes: `Diablo 3`, `PoE`, `Warframe`.

### Loop ideal de 1 dia

- revisar progreso de proyectos
- completar una meta diaria corta
- mover un eje de build
- acercarse a un objetivo de collection log o boss

Sensacion: `mi cuenta avanzo`  
Referentes: `Genshin`, `OSRS`, `Warframe`.

### Loop ideal de 1 semana

- cerrar un proyecto largo
- desbloquear una estacion, un eco o un arquetipo nuevo
- completar una pagina de coleccion o una mini meta de temporada

Sensacion: `cerre un capitulo`  
Referentes: `Warframe`, `Diablo 4`, `OSRS`.

### Loop ideal de 1 mes

- haber probado al menos una variante nueva de build
- haber cambiado el Santuario de manera visible
- perseguir una meta horizontal o un boss largo

Sensacion: `esta cuenta ya es mia`  
Referentes: `PoE`, `OSRS`, `Last Epoch`.

### Loop ideal de 6 meses

- volver por un tema nuevo sin perder la cuenta
- reencontrar objetivos viejos y nuevos
- tener memoria emocional de items, bosses y proyectos

Sensacion: `vuelvo porque este mundo todavia me conoce`  
Referentes: `PoE`, `Warframe`, `WoW`.

## Principios de time-gating sano para este juego

1. el timer siempre debe dejar otra decision significativa abierta
2. el timer debe producir una mejora visible y recordable
3. el juego debe resumir timers en un solo lugar
4. nunca monetizar el timer de forma agresiva
5. algunos timers deben poder acumular valor para que faltar un dia no se sienta castigo

## Diseñar para el jugador de largo plazo

### Ancla de longevidad recomendada

La mejor ancla no es solo `Ecos`. Debe ser la suma de:

- `build identity`
- `collection log`
- `Santuario que cambia visual y funcionalmente`

Eso mezcla lo mejor de `PoE`, `OSRS` y `Warframe`.

### El jugador que vuelve despues de 3 meses

Debe encontrarse con:

- un resumen de cambios
- un tracker activo de 1 objetivo prioritario
- jobs listos o a punto
- una recomendacion clara de build/expedicion

Feature concreta recomendada:

`Panel de Retorno` con tres bloques:

- `Esto quedo listo`
- `Esto cambio`
- `Tu siguiente mejor paso`

## Progresion vertical vs horizontal

### Early

Predominio vertical.  
El jugador debe sentir que sube rapido y se vuelve mas fuerte de forma obvia.

### Mid

Mezcla equilibrada.  
Sigue habiendo poder, pero empieza a importar mas `que tipo de cuenta estoy armando`.

### Late

Predominio horizontal.  
Collection log, variantes de build, bosses, proyectos de Santuario, cosmeticos, memorias de cuenta.

### Ultra-late

Muy poca vertical pura.  
Mas prestigio social, completismo, mastery y retos.

## Diferenciacion real

### Lo que ningun referente hace igual

Ninguno de estos referentes mezcla exactamente:

- combate auto-idle
- tension de extraccion liviana
- Santuario persistente con proyectos
- loop corto mobile/browser

### Propuesta de valor unica en una oracion

`IdleRPG es un ARPG idle extraction-lite donde cada expedicion no solo te hace mas fuerte: te trae proyectos que transforman tu Santuario y redefinen el valor de las siguientes runs.`

## Los 5 momentos que el juego deberia volver memorables a 1 año de distancia

1. mi primer blueprint verdaderamente definitorio
2. la primera extraccion que salvo una run caotica
3. el primer boss que senti "semilla mia"
4. el dia que el Santuario desbloqueo una estacion clave
5. la build rara que me hizo jugar distinto durante semanas

## Output de Pasada 5

### Filosofia de curvas

- XP: logaritmica
- poder de run: escalonada
- proyectos persistentes: lineal con saltos
- crafting: escalonada con tension
- meta: logaritmica + horizontal
- coleccion: horizontal infinita

### Balance vertical/horizontal

- early: vertical
- mid: mixto
- late: horizontal dominante
- ultra-late: mastery y memorias

### Propuesta de valor unica

`ARPG idle extraction-lite con Santuario persistente que convierte botin en proyectos duraderos.`

## 2. Las 20 decisiones de diseño mas importantes

1. `Hacer de Santuario la home operacional definitiva`.  
   Viene de `Travian` y `Warframe`.  
   Importa porque hoy el jugador ya vuelve ahi; solo falta que la UI lo asuma.  
   Implica retencion y claridad.

2. `Dejar Expedicion en Combate, Mochila e Intel`.  
   Viene de `Diablo 3`, `Diablo 4`, `Torchlight Infinite`.  
   Importa porque el loop vivo no tolera bloat.  
   Mejora retencion por sesion corta.

3. `Construir un tracker de "que hago ahora"`.  
   Viene de `WoW` y `Travian`.  
   Importa porque retorno y onboarding dependen de eso.  
   Impacta longevidad.

4. `Adelantar el momento de build identity`.  
   Viene de `Last Epoch`, `Grim Dawn`, `PoE1`.  
   Importa porque hoy el juego corre el riesgo de sentirse generico demasiado tiempo.  
   Impacta compartibilidad.

5. `Crear collection log persistente`.  
   Viene de `OSRS`.  
   Importa porque da objetivos horizontales infinitos.  
   Impacta longevidad directa.

6. `Unificar mentalmente Caza y Biblioteca`.  
   Viene de `Genshin` y `Diablo Immortal` Codex.  
   Importa porque hoy el conocimiento esta partido.  
   Mejora UX y onboarding.

7. `Convertir proyectos del Santuario en transformaciones visibles`.  
   Viene de `Warframe`.  
   Importa porque time-gate sin cambio visible es burocracia.  
   Ayuda retencion.

8. `Tratar extraccion como momento emocional, no pantalla de cierre`.  
   Viene del propio nucleo del proyecto y del ARPG loot ritual.  
   Importa porque ahi vive la propuesta unica.  
   Impacta identidad.

9. `Mantener la monetizacion fuera del poder`.  
   Viene de `PoE`, `Warframe`, `Last Epoch`.  
   Importa porque un ARPG pierde credibilidad muy rapido.  
   Impacta negocio y confianza.

10. `Separar utility menu del loop principal`.  
    Viene de `Genshin`.  
    Importa porque mobile no perdona tabs utilitarias fuertes.  
    Mejora sesion corta.

11. `Diseñar los time-gates como razon para volver`.  
    Viene de `Warframe` y `Genshin`.  
    Importa porque ya hay estaciones persistentes.  
    Impacta retencion.

12. `Podar sugerencias a una sola prioridad`.  
    Viene de `WoW` y de buenas practicas de HUD modernos.  
    Importa porque muchas sugerencias equivalen a ninguna.  
    Mejora claridad.

13. `Fabricar cinco momentos fotografiables`.  
    Viene de `Diablo`, `PoE`, `OSRS`.  
    Importa porque compartibilidad organica es adquisicion barata.  
    Impacta comunidad.

14. `Hacer que faltarse unos dias no castigue fuerte`.  
    Viene de `Warframe`, `Genshin`, `OSRS`.  
    Importa porque el juego es browser/mobile.  
    Impacta retencion sana.

15. `No invalidar la cuenta en cada ciclo`.  
    Viene de `Warframe`, `Diablo Immortal`, `OSRS`, reaccionando contra ciclos demasiado destructivos.  
    Importa porque el Santuario pide continuidad.  
    Impacta longevidad.

16. `Introducir mutadores tematicos de run`.  
    Viene de `PoE` y `Diablo 4`.  
    Importa porque da variedad sin crear veinte sistemas nuevos.  
    Impacta retorno.

17. `Hacer que los proyectos persistentes cambien el valor del loot futuro`.  
    Viene de `Warframe` y del alma extraction-lite del proyecto.  
    Importa porque cierra el loop Santuario/Expedicion.  
    Impacta identidad y retencion.

18. `Poner el resumen de retorno como feature de producto`.  
    Viene de `Diablo 4`, `Warframe`, `WoW`.  
    Importa porque la gente va a entrar y salir.  
    Impacta retencion real.

19. `Limitar la verticalidad infinita y abrir horizontalidad`.  
    Viene de `OSRS`, `Warframe`, `PoE`.  
    Importa porque si todo es mas stats, el vacio llega rapido.  
    Impacta longevidad.

20. `Monetizar recien despues de que el juego ya explique bien por que importa volver`.  
    Viene de la comparacion entre `PoE/Warframe/Last Epoch` y `Diablo Immortal/RS3`.  
    Importa porque monetizar temprano sobre confusion parece oportunismo.  
    Impacta negocio sostenible.

## 3. Las 5 cosas a no hacer nunca

1. `No vender loot, craft success ni meta-progresion directa.`  
   A `Diablo Immortal` le destruyo la reputacion porque el jugador deja de creer en el chase.[^di-claims]

2. `No poner chore lists obligatorias como base de retencion.`  
   La comunidad de `Diablo Immortal` lo verbaliza como checklist y trabajo.[^di-overwhelming][^di-checklist]

3. `No saturar el home con diez cards del mismo peso.`  
   `Travian` funciona cuando el overview ordena; no cuando todo compite igual.[^travian-overview]

4. `No retrasar demasiado la build identity.`  
   `Grim Dawn`, `Last Epoch` y `PoE` prueban que el jugador necesita sentir apropiacion temprano.[^grimdawn-masteries][^le-steam][^poe-tree]

5. `No obligar a reaprender el juego entero en cada gran update.`  
   `Diablo 4` ya reconoce ese problema y no conviene heredarlo.[^d4-keep-up]

## 4. Mapa de longevidad

| Etapa | Que mantiene al jugador | Que capa se abre | Curva dominante |
|---|---|---|---|
| `Semana 1` | progreso rapido, primeras decisiones, primer loop Santuario/Expedicion | build identity temprana | logaritmica vertical |
| `Mes 1` | primeros proyectos persistentes, bosses, mejor lectura de valor | estaciones y mutadores | escalonada |
| `Mes 3` | collection log, variantes de build, metas horizontales | goals de cuenta y late objectives | mixta |
| `Mes 6` | proyectos largos, Santuario reconocible, rutas personales | horizontalidad fuerte | horizontal dominante |
| `Año 1+` | retorno por tema nuevo, memoria emocional, mastery y completismo | seasons tematicas y ultra-late | horizontal + mastery |

## 5. El juego dentro de 1 año

> "Entre por una partida corta y me quede una hora. Eso me pasa todo el tiempo con este juego. Arranco en el Santuario, cobro dos cosas, dejo una tercera cocinandose y digo 'bueno, hago una expedicion nomas'. En esa run casi siempre saco algo que no es solo mas stat: a veces es un proyecto, a veces una pieza para completar el log, a veces un item que empuja una build rara.  
>
> Lo mejor es que nunca siento que me fui al pedo. Si no tuve suerte de drop, avance un proyecto. Si no cerre un proyecto, desbloquee intel. Si no subi daño, me acerque a un objetivo de cuenta.  
>
> No me presiona como un mobile toxico ni me exige estudiar como un ARPG de desktop ultradenso. Pero tampoco es un idle vacio: cuando saco algo bueno o termino un blueprint, se siente mio de verdad.  
>
> Lo banco mucho porque no me vende poder. Gasto si quiero verme mejor o apoyar una season, no para arreglar un dolor artificial. Y cada vez que vuelvo despues de una pausa, la UI me dice exactamente que quedo listo y que me conviene hacer.  
>
> Es de esos juegos que parecen livianos hasta que te das cuenta de que ya armaste una cuenta con historia propia." 

## Fuentes

[^gladiatus-official]: Gladiatus official page - https://gameforge.com/en-GB/games/gladiatus.html
[^gladiatus-rubies]: Gladiatus rubies guide - https://gladiatus.gamerz-bg.com/game-guide/premium/rubies
[^gladiatus-reviews]: Gladiatus user reviews - https://www.metacritic.com/game/gladiatus/user-reviews/
[^travian-overview]: Travian `Central Village Overview` - https://support.travian.com/en/support/solutions/articles/7000062844-central-village-overview
[^travian-goldclub]: Travian `Gold Club` support page - https://support.travian.com/id/support/solutions/articles/7000060368-klub-emas
[^travian-reddit]: Reddit, Travian monetization criticism - https://www.reddit.com/r/travian/comments/1qqe04p/i_dislike_the_ad_system_such_an_incentive_to_not/
[^poe-tree]: Path of Exile passive skill tree - https://www.pathofexile.com/passive-skill-tree
[^poe-stash]: Path of Exile stash tabs shop - https://www.pathofexile.com/shop/category/stash-tabs
[^poe-tabs]: Community discussion around stash tabs and value perception - https://www.reddit.com/r/pathofexile/comments/1gq5dxs/stash_tab_sale_is_live_what_tabs_are_worth_it/
[^poe-newplayers]: Reddit, PoE complexity for casual/new players - https://www.reddit.com/r/pathofexile/comments/1h21y2h/is_poe_that_difficult_for_a_casual_player/
[^poe-hostile]: Reddit, PoE hostile to new players - https://www.reddit.com/r/pathofexile/comments/ypmkbf/why_is_poe_so_hostile_towards_new_players/
[^poe2-faq]: Path of Exile 2 Early Access FAQ - https://www.pathofexile.com/forum/view-thread/3587981
[^poe2-review]: Polygon, PoE2 patch reduces frustration - https://www.polygon.com/news/498491/path-exile-2-early-access-patch-notes-difficulty
[^poe2-patch]: PC Gamer, PoE2 reacting to feedback - https://www.pcgamer.com/games/rpg/path-of-exile-2-devs-had-so-much-negativity-around-druids-not-being-able-to-dodge-roll-in-animal-forms-that-they-spent-the-last-month-making-it-happen-man-it-was-tough-to-get-that-to-work-right/
[^grimdawn-masteries]: Grim Dawn Masteries - https://grimdawn.fandom.com/wiki/Masteries
[^grimdawn-factions]: Grim Dawn factions guide - https://www.grimdawn.com/guide/character/factions/
[^di-gameplay]: Diablo Immortal gameplay overview - https://news.blizzard.com/en-us/diablo-immortal/23557147/diablo-immortal-gameplay-overview-everything-you-need-to-know
[^di-codex]: Diablo Immortal Codex - https://diablo.fandom.com/wiki/Codex_%28Diablo_Immortal%29
[^di-checklist]: Reddit, Diablo Immortal daily/weekly checklist - https://www.reddit.com/r/DiabloImmortal/comments/1hb5la6
[^di-overwhelming]: Reddit, Diablo Immortal feature overload - https://www.reddit.com/r/DiabloImmortal/comments/1knhw9t
[^di-claims]: Reddit, Diablo/Immortal complaints around popups and pressure - https://www.reddit.com/r/Diablo/comments/v3r66p/diablo_immortal_all_the_damn_pop_ups/
[^genshin-paimon]: Genshin Impact Wiki, Paimon Menu - https://genshin-impact.fandom.com/wiki/Paimon_Menu
[^genshin-handbook]: Genshin Impact Wiki, Adventurer Handbook - https://genshin-impact.fandom.com/wiki/Adventurer_Handbook
[^genshin-resin]: Genshin Impact Wiki, Tutorial/Original Resin - https://genshin-impact.fandom.com/wiki/Tutorial/Original_Resin
[^genshin-condensed]: Genshin Impact Wiki, Condensed Resin - https://genshin-impact.fandom.com/wiki/Condensed_Resin
[^genshin-resin-history]: Genshin Impact Wiki, Original Resin change history - https://genshin-impact.fandom.com/wiki/Original_Resin/Change_History
[^torchlight-steam]: Torchlight: Infinite on Steam - https://store.steampowered.com/app/1974050/Torchlight_Infinite
[^d3-ah]: Wired, Diablo Auction House lessons - https://www.wired.com/2013/09/diablo-auction-house/
[^d3-loot2]: Digital Trends, Loot 2.0 changes - https://www.digitaltrends.com/gaming/diablo-iii-reaper-souls-guide-loot-2-0-changes/
[^d3-ros]: PCGamesN, Reaper of Souls review - https://www.pcgamesn.com/diablo/diablo-iii-reaper-souls-review
[^d4-feb2020]: Diablo IV quarterly update February 2020 - https://news.blizzard.com/en-gb/article/23308274/diablo-iv-quarterly-updatefebruary-2020
[^d4-dec2020]: Diablo IV quarterly update December 2020 - https://news.blizzard.com/en-us/diablo4/23583664
[^d4-season-feedback]: Diablo IV Campfire Chat summary - https://news.blizzard.com/en-us/diablo4/23985148/catch-up-on-the-season-of-the-malignant-campfire-chat
[^d4-keep-up]: GamesRadar, D4 hard to keep up - https://www.gamesradar.com/games/diablo/diablo-4-game-director-admits-its-really-hard-for-players-to-keep-up-with-the-ever-changing-arpg-especially-if-you-arent-at-the-cutting-edge-of-everything-all-the-time/
[^d4-negative]: Reddit, criticism of Diablo 4 depth/endgame - https://www.reddit.com/r/diablo4/comments/1neeodl/why_is_diablo4_so_negatively_reviewed/
[^d4-mtx]: GameSpot, Diablo 4 cheap MTX reaction - https://www.gamespot.com/articles/diablo-4-finally-gets-cheap-microtransactions-but-players-arent-impressed/1100-6533003/
[^osrs-clog]: OSRS Collection Log - https://oldschool.runescape.wiki/w/Collection_log
[^osrs-bonds]: Old School RuneScape bonds - https://www.runescape.com/oldschool/bonds
[^rs-bonds]: RuneScape bonds - https://www.runescape.com/bonds
[^rs3-th]: RuneScape Wiki, Treasure Hunter - https://runescape.wiki/w/Treasure_Hunter
[^rs3-integrity]: GamesRadar, RS3 removing Treasure Hunter by 2026 - https://www.gamesradar.com/games/mmo/over-120-000-microtransaction-haters-have-successfully-campaigned-to-remove-the-controversial-feature-from-mmo-by-2026-jagex-declares-the-start-of-a-new-era/
[^warframe-foundry]: Warframe Foundry - https://wiki.warframe.com/w/Foundry
[^warframe-companion]: Warframe Companion - https://wiki.warframe.com/w/Warframe_Companion
[^warframe-trading]: Warframe Trading FAQ - https://support.warframe.com/hc/en-us/articles/200092259-Trading-FAQ-Safe-Trading-Tips
[^wow-hud]: WoW Dragonflight HUD and UI revamp - https://news.blizzard.com/en-us/article/23841481/world-of-warcraft-dragonflight-hud-and-ui-revamp
[^wow-feedback]: GameSpot, WoW Dragonflight UI feedback - https://www.gamespot.com/articles/wow-dragonflight-players-have-a-few-notes-on-the-games-ui-overhaul/1100-6508658/
[^le-steam]: Last Epoch on Steam - https://store.steampowered.com/app/899770/Last_Epoch/
