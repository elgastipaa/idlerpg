# GAME DESIGN BRIEF

## 1. VISION GENERAL

- **Genero y concepto central**: RPG idle/incremental de combate automatico por ciclos de expedicion, con capa meta fuerte (Santuario + Ecos + Abismo). La fantasia central es "optimizar una maquina de progreso" mas que controlar habilidades activas en tiempo real.
- **Fantasia de jugador**: el jugador se siente como un estratega de build que ajusta equipo, sigilos y mejoras para romper techos de tier, no como un jugador de accion de input por input.
- **Inspiraciones detectables**: estructura de loot ARPG + meta-progresion incremental + reset con valor persistente. Referencias [INFERIDO]: Diablo-like en itemizacion y boss mechanics, idle/clicker en loop de ticks y progreso offline.
- **Plataforma target y stack tecnico relevante para diseno**: cliente web SPA en React 18 + Vite 5, sin backend. Implicacion: toda la experiencia depende de estado local, sesiones cortas/medias, y restricciones de persistencia en navegador.
- **Estado actual del proyecto**: ~70-80% de un "vertical slice extendido" [INFERIDO]. El core loop esta jugable de punta a punta (combate, loot, craft, prestige, santuario, abismo, contratos), pero hay zonas de contenido y tuning claramente incompletas.
- **Sesion tipica hoy**: entrar, preparar sigilos/contrato, correr expedicion auto, revisar drops, optimizar mochila/craft, extraer al Santuario, correr jobs persistentes, invertir Ecos, repetir. Una sesion util puede durar de 5-10 min (gestion rapida) a 30-90 min (push + cierre de run).

## 2. SISTEMAS IMPLEMENTADOS

### Combate por ticks
- **Que hace**: resuelve el combate automaticamente cada 1 segundo con dano, mitigacion, criticos, estados y mecanicas de enemigos/bosses.
- **Como funciona internamente**: cada tick calcula ataque jugador/enemigo, aplica estados (bleed, fracture, mark, veneno, etc.), resuelve muerte/avance de tier y actualiza analytics de run.
- **Parametros clave que lo gobiernan**: tick 1s, cap de critico 75%, cap de velocidad 70%, cap de multi-hit 45%, cap de chance de estados 80%, mitigacion por defensa con denominador 260.
- **Decisiones de diseno ya tomadas**: combate totalmente automatico, sin rotacion manual de skills activas [NO ENCONTRADO EN CODIGO].
- **Interacciones con otros sistemas**: depende de stats de equipo/talentos/prestigio/codex/sigilos; alimenta economia, progreso, contratos y prestige.
- **Limitaciones o edge cases conocidos**: muerte en expedicion reinicia a Tier 1 con 50% HP y corta auto-avance; puede sentirse penalizacion dura o blanda segun build [BALANCE PENDIENTE].

### Enrutado de encuentros y progresion de tiers
- **Que hace**: define que enemigo aparece en cada tier y cuando entra boss.
- **Como funciona internamente**: ciclo base de 25 tiers, boss cada 5 tiers, layout fijo en primera run y luego layout pseudo-aleatorio por seed de run.
- **Parametros clave que lo gobiernan**: 25 tiers por ciclo, 5 slots de boss, portal de Abismo atado al Tier 25.
- **Decisiones de diseno ya tomadas**: estructura por ciclos cerrados con progresion vertical fuerte y escalado por profundidades del Abismo.
- **Interacciones con otros sistemas**: activa unlocks de Abismo, define dificultad para prestige, condiciona calidad de drop y progreso de contratos.
- **Limitaciones o edge cases conocidos**: el modelo de rotacion de bosses puede generar repeticiones de contrajuego (anti-crit/anti-combo) en varias corridas [BALANCE PENDIENTE].

### Enemigos, familias, afijos y mecanicas de boss
- **Que hace**: agrega identidad de combate por familia, afijos de monstruo y mecanicas especiales de boss.
- **Como funciona internamente**: a stats base por tier se suman multiplicadores de familia, afijos y mecanicas; en Abismo se agregan mutadores de ciclo.
- **Parametros clave que lo gobiernan**: afijos por tramo de tier, pools de mecanicas por arquetipo de boss, intensidad extra en boss semanal por dificultad.
- **Decisiones de diseno ya tomadas**: fuerte uso de "reglas numericas" hardcodeadas por mecanica (escudo cada N ticks, phase reset, reflect, etc.).
- **Interacciones con otros sistemas**: cruza con Codex (mastery por familia/boss), loot hunt targets y dificultad de push.
- **Limitaciones o edge cases conocidos**: alta combinatoria de penalizaciones en Abismo puede volver opacas algunas derrotas [BALANCE PENDIENTE].

### Progresion de heroe (nivel, atributos, talentos)
- **Que hace**: convierte XP y decisiones de build en crecimiento de dano, vida y especializacion.
- **Como funciona internamente**: curva de XP por tramos, level up con +1 dano base y +12 HP base, puntos de talento por cadencia escalonada; sub-vistas de Heroe para ficha/atributos/talentos.
- **Parametros clave que lo gobiernan**: XP por nivel por tramos (160x, 320x, 520x, 760x, 1040x, 1380x), talento por nivel segun bracket, upgrades de oro con costo exponencial.
- **Decisiones de diseno ya tomadas**: build centrada en stats pasivos y sin arbol de skill activa manual [NO ENCONTRADO EN CODIGO].
- **Interacciones con otros sistemas**: impacta combate, chance de limpiar contratos, readiness para boss semanal y valor del prestige.
- **Limitaciones o edge cases conocidos**: coexistencia de claves legacy de stats (equivalencias antiguas) aumenta complejidad de balance y lectura.

### Economia de recursos
- **Que hace**: define ingreso y gasto de oro, esencia y recursos de Santuario (tinta, flux, polvo).
- **Como funciona internamente**: rewards por enemigo/boss + modificadores de build/sigil/abismo + sumideros de crafting/laboratorio/encargos.
- **Parametros clave que lo gobiernan**: formulas de reward por tier, costos de craft por rareza/uso acumulado, costos de investigacion por estacion.
- **Decisiones de diseno ya tomadas**: economia multi-moneda con rol claro por capa (run vs meta).
- **Interacciones con otros sistemas**: conecta expedicion, santuario, codex y progression horizontal.
- **Limitaciones o edge cases conocidos**: hay multiples escalados superpuestos (run sigil + prestige + codex + abyss + craft multipliers), dificil de calibrar sin tooling continuo [BALANCE PENDIENTE].

### Inventario, equipo y loot
- **Que hace**: administra drops, comparacion por rating, equipar/vender/extraer y desborde de mochila.
- **Como funciona internamente**: cada item entra con rating calculado; inventario se ordena por rating y limita a 50 slots; al exceder, se desplaza o pierde item segun ranking.
- **Parametros clave que lo gobiernan**: cap inventario 50, chance drop base 8% (cap 55%), bonus de boss/suerte/loot, floors de rareza en bosses por slot.
- **Decisiones de diseno ya tomadas**: pipeline de loot orientado a "filtrar rapido" y automatizar venta/extraccion por rareza.
- **Interacciones con otros sistemas**: influye en progreso de poder, contratos de forja, blueprint extraction y economia.
- **Limitaciones o edge cases conocidos**: overflow puede descartar loot util si reglas automaticas estan mal configuradas; UX depende mucho de filtros.

### Crafting de expedicion (forja de campo)
- **Que hace**: mejora piezas con upgrade/reroll/polish/reforge/ascend.
- **Como funciona internamente**: cada accion consume recursos y aumenta contador de uso; hay limites por rareza, falla de upgrade por nivel alto y caps por nivel de item.
- **Parametros clave que lo gobiernan**: fail chance de upgrade +2 a +10 (3% a 66%), limites de acciones por rareza, costos escalados por intentos y reducciones desde bonuses.
- **Decisiones de diseno ya tomadas**: rare +7+ habilita tramo de poder relevante de afijos; ascend exige niveles minimos por rareza.
- **Interacciones con otros sistemas**: usa economia de esencia/oro, sinergiza con sigilo de Forja y bonuses de Prestige/Codex.
- **Limitaciones o edge cases conocidos**: escalados de costo y limites tienen picos no triviales entre rare/epic/legendary [BALANCE PENDIENTE].

### Santuario persistente (estaciones, blueprints, proyectos)
- **Que hace**: capa meta de progreso fuera de combate con trabajos temporizados e infraestructura.
- **Como funciona internamente**: el jugador abre estaciones (Destileria, Biblioteca, Altar, Encargos, Taller, Laboratorio), ejecuta jobs y acumula progreso persistente en blueprints/proyectos/reliquias.
- **Parametros clave que lo gobiernan**: reduccion de tiempo por investigacion de 15% por paso (tope efectivo 50%), caps blueprint (nivel 12, tune 5, ascension 3), cargas de familia cap 120.
- **Decisiones de diseno ya tomadas**: Santuario como capa de "produccion pasiva" paralela al push de run.
- **Interacciones con otros sistemas**: alimenta recursos meta, mejora preparacion de run, habilita capas de Codex y Abismo.
- **Limitaciones o edge cases conocidos**: onboarding condiciona fuertemente cuando se desbloquea cada estacion, lo que puede ocultar profundidad temprana [INFERIDO].

### Meta-progresion (Prestige, Ecos, Codex, Abismo, Sigilos)
- **Que hace**: define el reset con ganancia permanente y la progresion horizontal de cuenta.
- **Como funciona internamente**: prestige calcula ecos por score de run, aplica momentum por comparacion contra mejor historico, y habilita arbol de nodos + resonancia; Abismo desbloquea capas y slot extra de sigilo; Codex da mastery por familias/bosses/poderes.
- **Parametros clave que lo gobiernan**: score base de ecos dividido por 15, momentum 0.6 a 2.2, min primer prestige 1 eco, unlocks de Abismo en tiers 26/51/76/101.
- **Decisiones de diseno ya tomadas**: reset frecuente con valor permanente y fuerte sesgo a metas de medio/largo plazo.
- **Interacciones con otros sistemas**: modifica rewards de run, costos de craft y capacidad de progresar en contenido profundo.
- **Limitaciones o edge cases conocidos**: lectura del valor real de cada nodo/sigil no siempre es obvia sin conocimiento numerico [BALANCE PENDIENTE].

### Contratos y eventos temporales
- **Que hace**: agrega objetivos rotativos de corto y mediano plazo.
- **Como funciona internamente**: contratos de expedicion rotan cada 8h UTC en 2 carriles; ledger semanal rota por semana UTC (inicio lunes); boss semanal tiene 3 intentos/semana con 3 dificultades.
- **Parametros clave que lo gobiernan**: reroll de contratos con costo creciente, boss semanal con umbral de poder y chance proyectada 8%-96%.
- **Decisiones de diseno ya tomadas**: eventos temporales totalmente locales, sin servidor.
- **Interacciones con otros sistemas**: usa estadisticas de run, empuja objetivos de forja/meta y entrega recursos de Santuario.
- **Limitaciones o edge cases conocidos**: al no haber backend, no hay validacion externa de calendario o anti-manipulacion de reloj [NO ENCONTRADO EN CODIGO].

### Persistencia, idle y recuperacion
- **Que hace**: guarda estado, recupera sesion y simula progreso offline.
- **Como funciona internamente**: guardado en `localStorage`, payload depurado de claves transitorias, autosave con throttle, recuperacion offline por chunks y guardas de reparacion de estado.
- **Parametros clave que lo gobiernan**: key de save unica, throttle de guardado 800ms (dev) / 2200ms (prod), offline minimo 60s, chunk 120 ticks, cap 3600 ticks.
- **Decisiones de diseno ya tomadas**: modelo offline conservador para evitar freezes largos y corrupcion en cliente.
- **Interacciones con otros sistemas**: afecta telemetria de cuenta, jobs de Santuario, resumen offline y continuidad de expedicion.
- **Limitaciones o edge cases conocidos**: fuerte capa de migraciones/compatibilidad legacy; deuda alta en inicializacion y saneamiento de saves.

### Onboarding guiado y bloqueo de interacciones
- **Que hace**: fuerza un orden pedagogico de pasos iniciales y desbloqueos.
- **Como funciona internamente**: maquina de estados con decenas de pasos, targets de UI para spotlight, bloqueo de tabs/acciones hasta completar hitos.
- **Parametros clave que lo gobiernan**: gran set de flags de progreso tutorial, pasos forzados/informativos y gating por contexto.
- **Decisiones de diseno ya tomadas**: tutorial muy directivo y largo, con control fuerte sobre navegacion.
- **Interacciones con otros sistemas**: condiciona acceso a Heroe, Inventario, Santuario, laboratorio y Abismo.
- **Limitaciones o edge cases conocidos**: riesgo de friccion para jugadores que prefieren exploracion libre o para cuentas migradas [INFERIDO].

## 3. SISTEMAS PENDIENTES O INCOMPLETOS

### 3.1 Planeados pero no implementados

- **Mazmorras (Dungeons)**: existe dataset completo con progression, rewards y notas de futuro, pero no esta conectado al runtime actual (sin imports/uso en flujo real).
- **Capas roguelike de dungeon**: comentarios de futuro para rutas, rooms, eventos y modificadores; no hay ejecucion en el loop vigente.
- **Recetas/materiales avanzados de crafting**: comentarios en engine de crafting mencionan arquitectura futura, pero hoy no hay sistema de recetas real.
- **Sets/joyas/slots especiales**: comentados en inventario/talentos como extensiones futuras, sin implementacion funcional.

### 3.2 Implementados pero incompletos

- **Balance global de escalado**: la mayoria de curvas estan hardcodeadas con muchos multiplicadores acumulativos [BALANCE PENDIENTE].
- **Compatibilidad legacy de stats y afijos**: mapeos antiguos se sostienen para saves previos; funcional pero aumenta complejidad y ruido de mantenimiento.
- **Archivo de constantes historicas**: existe un bloque de constantes globales antiguas que ya no gobierna sistemas actuales (excepto tick), generando riesgo de confusion.
- **Sistema de talentos triggered**: funcional para triggers actuales, pero mantiene ramas "futuro" y mapeos de compatibilidad que sugieren evolucion incompleta.

### 3.3 Decisiones de diseno abiertas

- **Penalizacion real por muerte**: hoy hay retroceso a Tier 1 con revive parcial y corte de auto-avance; falta definir severidad objetivo del fracaso.
- **Profundidad de interaccion activa**: el loop es fuertemente auto; falta decidir si se quiere mantener full-idle o sumar capas de decision tactica en combate.
- **Complejidad deseada del onboarding**: tutorial actual guia mucho; falta decidir el equilibrio entre control pedagogico y agencia temprana.
- **Rol final de contratos semanales/8h**: estan operativos, pero falta definir si son "engagement soft" o gating fuerte de recursos meta.
- **Estrategia de largo plazo para deuda legacy**: mantener compat perpetua vs migracion dura de saves antiguos.

## 4. DATOS Y BALANCE ACTUALES

### Stats de personaje y entidades

- **Base de personaje**:
  - dano base inicial: 10
  - vida maxima base inicial: 100
  - al subir nivel: +1 dano base y +12 vida maxima base
- **Caps de combate**:
  - critico maximo: 75%
  - velocidad de ataque maxima: 70%
  - multi-hit maximo: 45%
  - chance de estados maxima: 80%
- **Mitigacion por defensa enemiga**:
```text
multiplicador_contra_defensa = 1 / (1 + defensa_enemigo / 260)
dano_aplicado = dano_bruto x multiplicador_contra_defensa
```
- **Escalado base de enemigo por tier**:
```text
vida_enemigo = floor(58 x 1.27^(tier-1) + 6 x (tier-1))
dano_enemigo = floor(6 x 1.23^(tier-1) + 1 x (tier-1))
defensa_enemigo = floor(2 + 1.4 x tier + 0.55 x max(0, tier-5))
xp_enemigo = floor(16 x 1.255^(tier-1) + 4 x (tier-1))
oro_enemigo = floor(6 x 1.23^(tier-1) + 1.5 x (tier-1))
esencia_enemigo = 1 + floor((tier-1)/6)
```
- **Baselines de boss por slot (tiers 5/10/15/20/25)**:
  - HP: 460 / 1580 / 4600 / 13200 / 36000
  - Dano: 30 / 72 / 178 / 440 / 1040
  - Defensa: 10 / 26 / 40 / 60 / 78
  - XP: 240 / 620 / 1700 / 4200 / 9800
  - Oro: 120 / 260 / 900 / 2500 / 7800
  - Esencia: 3 / 4 / 5 / 6 / 8

### Curvas de progresion

- **XP por nivel**:
```text
si nivel <= 10:   xp_requerida = 160 x nivel
si 11-20:         xp_requerida = 320 x nivel
si 21-35:         xp_requerida = 520 x nivel
si 36-60:         xp_requerida = 760 x nivel
si 61-90:         xp_requerida = 1040 x nivel
si >90:           xp_requerida = 1380 x nivel
```
- **Puntos de talento por nivel**:
  - nivel <= 12: 1 punto por nivel
  - 13-30: 1 cada 2 niveles
  - 31-75: 1 cada 3 niveles
  - 76+: 1 cada 4 niveles
- **Upgrades de heroe con oro (ejemplos)**:
  - Fuerza: base 180, x1.18, max 50
  - Vitalidad: base 200, x1.18, max 50
  - Precision: base 260, x1.30, max 30
  - Velocidad: base 320, x1.34, max 25
```text
costo_upgrade = floor(costo_base x multiplicador^(nivel_actual_upgrade))
```

### Economia

- **Chance de drop de item**:
```text
chance_drop = min(0.55, 0.08 + bonus_jefe + (suerte x 0.0002) + (bonus_loot x 0.2))
```
  - bonus_jefe = +0.30
- **Rareza base (orden de chequeo)**: legendario, epico, raro, magico, comun.
- **Escalado por tier en rareza**: cada rareza suma termino lineal por tier + suerte + bonus especificos.
- **Bonus de tiers tempranos**:
  - raro: bonus extra hasta tier 6
  - magico: bonus extra hasta tier 4
- **Valor de venta / extraccion / auto-reglas**: activos y con protecciones de drops cazados o upgrades potenciales.
- **Sinks fuertes**: craft repetido, ascend, laboratorio y rerolls de contratos.
- **Evaluacion**: economia funcional, pero con alto riesgo de inflacion por stacking de multiplicadores [BALANCE PENDIENTE].

### Combate

- **Estados y limites relevantes**:
  - bleed: hasta 4 stacks, 4 ticks
  - fracture: hasta 5 stacks, 5 ticks, reduce defensa por stack
  - void fracture: hasta 3 stacks, 4 ticks
- **Mecanicas boss representativas**:
  - escudo cada N ticks
  - enrage bajo umbral de vida
  - inmunidad critico por umbral
  - doble golpe cada N ticks
  - phase reset una vez
  - reflect y espinas
- **Muerte en expedicion**:
```text
al_morir -> tier_actual = 1
vida_revivida = floor(vida_maxima x 0.5)
auto_avance = apagado
```
- **Boss semanal**:
  - intentos por semana: 3
  - dificultades: Normal / Veterano / Elite
  - poder requerido base: 34 / 48 / 62 (mas ajuste por tier del boss)
```text
chance_proyectada = clamp(0.08, 0.96, 0.18 + (poder_jugador - umbral) x 0.028)
```

### Drop rates y loot

- **Escalado de stats del item por tier**:
```text
stat_porcentual_escalada = stat_base x (1 + 0.025 x (tier-1))
stat_plana_escalada = stat_base x (1 + 0.1 x (tier-1))
```
- **Rare affix upgrade (niveles altos)**:
  - multiplicadores secuenciales en +7/+8/+9/+10: 1.09, 1.09, 1.18, 1.18
- **Inventario**:
  - cap duro: 50 items
  - overflow con reemplazo por rating o perdida de drop

### Timings

- **Runtime**:
  - tick de juego: 1s
  - tracking de cuenta: cada 5s
  - guardado throttle: 800ms dev / 2200ms prod
- **Offline**:
  - minimo para simular progreso: 60s
  - procesamiento por chunks: 120 ticks
  - tope por recuperacion: 3600 ticks
- **Contratos**:
  - expedicion: rotacion cada 8h UTC
  - semanal: rotacion por semana UTC (inicio lunes)
- **Jobs de Santuario**:
  - Destileria: 20m / 30m / 45m / 60m
  - Infusion de sigilos: 2h / 6h / 12h
  - Encargos: 15m / 1h / 4h
  - Proyecto maestro: 24h

## 5. UX Y FLUJO DE JUEGO

- **Pantallas o vistas existentes**:
  - `Santuario`: capa meta, estaciones, recursos persistentes, jobs y overlays de gestion.
  - `Heroe`: Ficha, Atributos y Talentos.
  - `Expedicion`: Combate, Mochila, Intel (Codex) y Forja de campo (acceso contextual).
  - `Ecos`: reset de run, arbol de prestigio, lectura de momentum y unlocks de Abismo.
  - `Mas`: Cuenta, Logros, Metricas y Sistema (save/replay/herramientas).
- **Gameplay loop principal**:
```text
Preparar run -> combatir auto por tiers -> loot y decisiones de mochila/craft ->
extraer al Santuario -> invertir recursos/meta -> volver a correr
```
- **Loop secundario o meta-loop**:
```text
Push de run -> ganar Ecos -> invertir en arbol/resonancia -> desbloquear Abismo/Codex ->
mejorar Santuario -> siguiente push mas profundo
```
- **Flujo idle vs activo**:
  - activo: decisiones frecuentes en preparacion, loot filtering, craft, cambio de tab y timing de extraccion.
  - idle: combate y jobs progresan solos; al volver se aplica resumen offline si hubo tiempo suficiente.
- **Puntos de decision del jugador**:
  - seleccion de sigilo(s)
  - cuando extraer/cerrar run
  - que items conservar/equipar/vender/extraer
  - en que gastar recursos (craft vs santuario vs prestige)
  - que contrato priorizar
- **Feedback existente**:
  - toasts de acciones/contexto
  - eventos flotantes de dano/curacion
  - pulsos y spotlight de onboarding
  - indicadores de upgrades potenciales
  - panel de resumen offline con animacion de progreso
  - [NO ENCONTRADO EN CODIGO] feedback sonoro/audio
- **Friction points detectables**:
  - onboarding largo con bloqueos de tabs.
  - alta densidad de sub-sistemas puede saturar lectura de prioridad.
  - formulas y multiplicadores no siempre explicados dentro de UI.
  - overflow de mochila puede frustrar si no se configuran filtros temprano.

## 6. INTERFAZ (UI)

- **Componentes visuales principales**:
  - header fijo con recursos y tema.
  - navegacion primaria (Santuario, Heroe, Expedicion, Ecos, Mas).
  - subnavegacion por vista (ejemplo Heroe/Expedicion/Registry).
  - overlays modales/sheet para setup de run, extraccion y estaciones de Santuario.
  - paneles de feedback (toasts, resumen offline, warnings de save legacy).
- **Estetica actual**:
  - estilo UI 2D flat con tarjetas, chips y bordes suaves.
  - paletas light/dark por variables CSS.
  - iconografia mixta (texto + iconos emoji en tabs primarias).
  - tipografia: stack por defecto del navegador [NO ENCONTRADO EN CODIGO un font branding dedicado].
- **Referencias esteticas inferidas**: mezcla de dashboard incremental + ARPG management [INFERIDO].
- **Responsividad y adaptacion**:
  - breakpoints definidos: 480 / 768 / 1024 / 1280.
  - en mobile hay header fijo + bottom nav fijo.
  - overlays en mobile se comportan como bottom-sheet y en desktop como modal centrado.
- **Problemas de UI conocidos**:
  - gran volumen de estilos inline dificulta consistencia global.
  - densidad de informacion alta en algunas vistas avanzadas (Codex/Prestige/Santuario).
  - textos hardcodeados en espanol; no hay capa de localizacion [NO ENCONTRADO EN CODIGO].
- **Areas de UI que claramente necesitan trabajo**:
  - clarificar prioridad entre "que hacer ahora" vs "que optimizar despues".
  - exponer mejor impacto numerico de decisiones de sigilo/craft/prestige.
  - simplificar lectura de estados complejos en late game (Abismo + mutadores + contratos + codex).

## 7. PREGUNTAS ABIERTAS DE DISENO

1. **Debe mantenerse el combate 100% automatico o sumar ventanas activas de habilidad?**
Contexto: hoy casi toda la agencia esta en meta-gestion. Impacto: **Alto**. Opciones posibles: mantener full-idle, agregar activas ligeras por cooldown, agregar "burst windows" en bosses.

2. **Que severidad de castigo debe tener la muerte durante expedicion?**
Contexto: actualmente hay reset a Tier 1 con revive parcial. Impacto: **Alto**. Opciones posibles: mantener actual, penalizar recursos, penalizar menos para favorecer ritmo.

3. **Cual es el ritmo objetivo de prestige ideal por tipo de jugador?**
Contexto: el sistema incentiva reset frecuente pero no hay "tempo target" explicitado en UI. Impacto: **Alto**. Opciones posibles: pushes largos, ciclos cortos, modo mixto recomendado por señales dinamicas.

4. **El onboarding debe ser mas abierto despues del primer logro fuerte?**
Contexto: tutorial actual bloquea navegacion de forma extensa. Impacto: **Medio-Alto**. Opciones posibles: modo guiado estricto, modo recomendado no bloqueante, bypass por perfil avanzado.

5. **Que rol estrategico final tendran los contratos (8h/semanales)?**
Contexto: hoy recompensan bien pero su peso en progresion total no esta explicitado. Impacto: **Medio**. Opciones posibles: engagement opcional, fuente principal de materiales meta, hibrido.

6. **Como se va a tratar la deuda de compatibilidad legacy?**
Contexto: hay mapeos y afijos legacy para saves antiguos. Impacto: **Medio-Alto**. Opciones posibles: mantener compat indefinida, ventana de migracion con corte, conversion asistida en UI.

7. **La economia multi-moneda necesita simplificacion o mas especializacion?**
Contexto: oro/esencia/tinta/flux/polvo compiten por prioridad en varias capas. Impacto: **Medio**. Opciones posibles: simplificar sinks, separar roles por etapa, introducir conversiones controladas.

8. **Se desea mantener roadmap de Dungeons como capa paralela real?**
Contexto: hay data y direccion de diseno, pero no runtime conectado. Impacto: **Medio**. Opciones posibles: integrar como modo alterno, absorber ideas en Abismo, descartar para enfocar profundidad actual.

## 8. RESTRICCIONES TECNICAS RELEVANTES PARA DISENO

- **Arquitectura**:
  - SPA React con estado central por reducer grande + dominios auxiliares.
  - sistemas muy acoplados por estado compartido; agregar una mecanica suele tocar varios dominios.
- **Performance**:
  - tick cada 1s con calculo de combate + efectos + analytics + log.
  - existe procesamiento offline por chunks para evitar bloqueos.
  - riesgo principal no es render 3D sino complejidad logica acumulada y tamaño de estado.
- **Persistencia**:
  - save local en navegador (sin nube), con saneamiento y migraciones.
  - facil para iterar rapido, fragil ante limpieza de navegador o dispositivos multiples.
- **Dependencias externas**:
  - [NO ENCONTRADO EN CODIGO] backend/API/multiplayer.
  - [NO ENCONTRADO EN CODIGO] audio middleware.
- **Deuda tecnica relevante**:
  - coexistencia de capas legacy (stats/afijos/saves).
  - constantes antiguas no utilizadas en runtime actual.
  - alto uso de estilos inline en UI compleja.
- **Inconsistencias explicitas detectadas**:
  - hay constantes globales historicas de economia/drop que no son la fuente real de verdad actual.
  - existe dataset de Dungeons completo pero sin integracion al flujo jugable.
- **Tiempo estimado de implementacion (inferido)**:
  - agregar un enemigo nuevo de ciclo: 0.5-1 dia [INFERIDO].
  - agregar boss con mecanica nueva: 1-2 dias [INFERIDO].
  - agregar nueva estacion de Santuario: 2-4 dias [INFERIDO].
  - agregar modo nuevo (ej. Dungeons operativo): 1-3 semanas [INFERIDO].

## 9. GLOSARIO DEL PROYECTO

- **Expedicion**: corrida activa de combate por tiers.
- **Tier**: nivel de profundidad de combate dentro de la corrida.
- **Run Sigil / Sigilo**: modificador de corrida que cambia rewards, progreso meta y/o costos.
- **Ecos**: moneda de prestige para nodos permanentes.
- **Prestige**: reset de corrida con conversion de progreso en Ecos.
- **Resonancia**: bonus pasivos por ecos historicos acumulados.
- **Abismo**: capa de progresion profunda post-tier 25 con unlocks por hitos.
- **Codex / Biblioteca**: mastery de familias, bosses y poderes legendarios.
- **Santuario**: hub meta persistente con estaciones y jobs.
- **Destileria**: convierte bundles/carga en recursos meta.
- **Altar de Sigilos**: prepara infusiones de sigilos con duracion real.
- **Encargos**: jobs temporizados que devuelven afinidad/materiales/tinta.
- **Taller / Deep Forge**: forja avanzada de proyectos persistentes.
- **Blueprint**: plantilla/item extraido para desarrollo persistente.
- **Proyecto**: pieza trabajable en forja profunda con upgrade/ascension.
- **Affix**: modificador de item (prefijo/sufijo), con tier de calidad.
- **Monster Affix**: modificador de enemigo.
- **Mochila overflow**: estado de inventario lleno con desplazamiento/perdida de drop.
- **Contrato de expedicion**: objetivo rotativo de 8h con recompensa meta.
- **Weekly Ledger**: tablero semanal de contratos de cuenta.
- **Boss semanal**: encuentro semanal con intentos limitados y 3 dificultades.

## Lo mas urgente

1. **Definir direccion de balance macro**: ritmo de prestige, severidad de muerte, y peso relativo de contratos/santuario vs push puro.
2. **Decidir estrategia de deuda legacy**: sin una politica clara, cada ajuste de sistema seguira costando mas.
3. **Cerrar roadmap de contenido pendiente (Dungeons vs profundidad de Abismo actual)**: hoy hay señales de dos direcciones de expansion.
4. **Mejorar legibilidad de decisiones en UI**: el jugador necesita entender impacto real de sigilos, craft y nodos sin leer formulas internas.
5. **Establecer metodologia de tuning continua**: muchos multiplicadores hardcodeados requieren ciclos de balance sistematicos [BALANCE PENDIENTE].
