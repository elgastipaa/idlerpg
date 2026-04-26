# Refactor Entregable - Rediseño de Retención, Escalabilidad y Monetización Ética

Fecha de corte: 2026-04-25  
Alcance: Diseño de producto y sistemas (sin implementación)

---

## Resumen Ejecutivo

Tu juego ya tiene una base valiosa: `Expedición -> Extracción -> Santuario -> Expedición`, con meta-progresión (`Ecos`, `Abyss`, `Codex`, `Weekly`, `Deep Forge`) y capa asíncrona de jobs. El problema no es falta de sistemas; es **falta de dirección clara por sesión** y **falta de rituales de retorno previsibles**.

El rediseño propuesto no agrega complejidad por complejidad. Reordena el juego para que:

- Cada sesión tenga un objetivo explícito (no “farm difuso”).
- Cada retorno tenga una promesa concreta (“vuelve ahora por X”).
- Cada capa (run, santuario, semanal, mastery) tenga una decisión real.
- La monetización futura encaje como conveniencia/cosmética sin romper el balance.

North Star de diseño:

- `Run clarity`: siempre saber “qué estoy intentando lograr en esta salida”.
- `Return pressure saludable`: siempre tener 1-2 cosas que reclamar/decidir al volver.
- `Mastery depth`: largo plazo por optimización y sinergias, no por inflación lineal.

---

## FASE 1 - Análisis del Core Loop Actual y Mejora

## 1.1 Loop principal actual (minuto a minuto)

Loop actual observado:

1. Entrar a expedición y configurar run (clase/spec/sigilos/reliquias activas).
2. Auto-combate con decisiones puntuales (craft, equip, timing de extracción).
3. Abrir extracción y resolver cargo + pieza (conservar/desguazar).
4. Volver a Santuario: reclamar jobs, reinvertir recursos, preparar próxima salida.

Qué recompensa obtiene hoy:

- Corto plazo: progreso de run, drops, recursos.
- Medio plazo: mejores reliquias/proyectos y recursos de estaciones.
- Largo plazo: Ecos, nodos, desbloqueos y dominio del account.

Qué lo motiva hoy:

- Ver subir poder y desbloquear capas.
- “Carry-over” persistente (reliquias/proyectos/recursos).

## 1.2 Dónde pierde interés hoy

Puntos de fricción del loop:

- Objetivo de run ambiguo: empujar tiers “porque sí” en vez de perseguir un contrato concreto.
- Decisión de extracción valiosa, pero a veces aislada del resto de la run.
- Santuario con muchos paneles y claims; falta un “centro de mando” que priorice.
- Time-gates buenos para retención, pero sin suficiente expectativa narrativa (“qué pasa cuando termina”).

## 1.3 Mejora del core loop (concreta)

### Cambio estructural A - “Contrato de Expedición” obligatorio por salida

Antes de iniciar la run, elegir 1 contrato entre 2-3:

- Objetivo principal (ej: boss, horda, codex hunt, eco rush).
- Riesgo/modificador (penaliza una dimensión y premia otra).
- Recompensa foco (material de Deep Forge, Codex, Flux, progreso weekly, etc.).

Impacto:

- Convierte cada run en una apuesta con propósito.
- Aumenta agencia y rejugabilidad sin contenido nuevo masivo.

### Cambio estructural B - “Puntos de decisión dentro de la run”

Agregar bifurcaciones de run en hitos:

- Elegir entre 2 mejoras de tempo (seguridad vs greed).
- Elegir entre ruta de consistencia vs ruta de pico (near-miss controlado).

Impacto:

- Más decisiones reales minuto a minuto.
- Reduce sensación de auto-play pasivo.

### Cambio estructural C - Extracción como clímax de run (no solo cierre)

La extracción debe consolidar 3 capas:

- Resultado táctico de la run (cómo te fue).
- Decisión de economía (liquidez inmediata vs inversión persistente).
- Setup del próximo retorno (qué job/objetivo queda “cocinando”).

Impacto:

- Más anticipación post-run.
- Mejor puente expedición <-> santuario.

### Cambio estructural D - “Feedforward UI” de progresión

En cada pantalla principal, mostrar siempre:

- Próximo desbloqueo significativo.
- Qué acción lo acelera.
- ETA cualitativa (“hoy”, “próxima sesión”, “esta semana”).

Impacto:

- Mantiene dirección y reduce abandono por falta de horizonte.

---

## FASE 2 - Retención y Hábito (3–5 min, 15–30 min, 1h+)

## 2.1 Diseño de sesión corta (3–5 min)

Objetivo: “abrir, decidir, dejar valor cocinando”.

Ritual:

1. Reclamar jobs listos (1 toque por estación o claim all inteligente).
2. Elegir 1 contrato de expedición.
3. Iniciar una run corta orientada al contrato.
4. Resolver extracción y dejar 1 job nuevo activo.

Resultado psicológico:

- Sensación de progreso diario incluso con poco tiempo.
- Hábito estable de apertura.

## 2.2 Diseño de sesión media (15–30 min)

Objetivo: “cerrar un micro-ciclo completo”.

Ritual:

1. Ejecutar 1-2 contratos distintos (diversidad de recursos).
2. Tomar al menos una decisión de build/proyecto (forge, codex o ecos).
3. Ajustar setup de próxima sesión (sigilos/reliquias/contexto).

Resultado psicológico:

- Sensación de control y planificación.
- Progreso visible en varias capas.

## 2.3 Diseño de sesión larga (1h+)

Objetivo: “pico de mastery”.

Ritual:

1. Cadena de contratos con objetivo semanal.
2. Empuje de benchmark personal (abyss/tier/boss objetivo).
3. Optimización profunda de cuenta (reliquias/proyectos/nodos).

Resultado psicológico:

- Estado de flow + dominio.
- Construcción de metas de largo plazo.

## 2.4 Sistemas de retorno (5min / 1h / 8h / 24h)

### Retorno 5 min

- Claims instantáneos y micro-decisiones de alto impacto.
- Notificación in-game de “1 decisión pendiente” (no spam).

### Retorno 1 h

- Primer bloque de jobs de valor medio termina.
- Aparece oportunidad táctica: relanzar job o cambiar foco.

### Retorno 8 h

- Ventana ideal de progreso offline + evento de santuario.
- “Recomendación del día” automática según estado de cuenta.

### Retorno 24 h

- Reset diario de objetivos ligeros + refresh de contratos premium semanales.
- Recompensa de consistencia progresiva sin castigo extremo por perder un día.

## 2.5 Engagement psicológico aplicado

- Anticipación: “en X tiempo desbloqueas Y decisión importante”.
- Colección: álbum de reliquias/proyectos/contextos completos.
- Progreso visible: barra de mastery por sistema (no solo nivel global).
- Near-miss: recompensas parciales cuando fallas objetivo mayor (sin sentir run perdida).

---

## FASE 3 - Sistemas Time-Gated (planificación, no frustración)

## 3.1 Principios

- Cada timer debe venir con una decisión, no solo espera.
- Cada timer debe tener “salida alternativa” (cambiar de foco sin perder todo).
- Cada timer debe escalar en complejidad, no solo en duración.

## 3.2 Sistemas propuestos

### A) Deep Forge por “Fases de Proyecto”

Emoción: inversión y apego al proyecto.

- Early: acciones de mejora base con resultado claro.
- Mid: ramas de especialización del proyecto (rol/contexto).
- Late: decisiones de riesgo controlado para techo de poder.

Decisión clave: consistencia estable vs pico situacional.

### B) Encargos como “Escuadrones de Operación”

Emoción: delegación inteligente.

- Early: un escuadrón genérico de recursos.
- Mid: especializar escuadrones por recurso/meta.
- Late: contratos encadenados que habilitan recompensas raras.

Decisión clave: liquidez hoy vs materiales estratégicos.

### C) Biblioteca con “Investigación por Rutas”

Emoción: descubrimiento y mastery.

- Early: desbloqueos de comprensión (tooltips/insight).
- Mid: rutas de investigación por familia/objetivo.
- Late: sinergias entre rutas con costos de oportunidad.

Decisión clave: breadth (variedad) vs depth (especialización).

### D) Bosses con cooldown inteligente (Cacerías)

Emoción: cita importante y preparación.

- Early: cacería accesible que enseña mecánicas.
- Mid: variantes semanales con mutadores.
- Late: jefes aspiracionales con condiciones de entrada.

Decisión clave: gastar entrada ahora o esperar mejor setup.

### E) Upgrades largos de Santuario (Infraestructura)

Emoción: construcción de base.

- Early: mejoras que reducen fricción.
- Mid: mejoras que habilitan decisiones nuevas.
- Late: mejoras de eficiencia/capacidad y automatización selectiva.

Decisión clave: throughput global vs poder de run.

### F) Eventos temporales de cuenta (no obligatorios)

Emoción: urgencia positiva.

- Early: objetivos simples con recompensa útil.
- Mid: variantes con puntuación personal.
- Late: reglas especiales para mastery players.

Decisión clave: perseguir evento o seguir plan principal.

---

## FASE 4 - Profundidad y Decisiones Reales

## 4.1 Capas de decisión

### Capa Run

- Contrato elegido.
- Carga de sigilos/reliquias por contexto.
- Rutas de bifurcación durante el push.

### Capa Santuario

- Qué estación priorizar en el ciclo actual.
- Qué proyecto/reliquia recibe inversión.
- Qué cuello de botella resolver primero.

### Capa Semanal

- Objetivo macro de la semana (codex, forge, abyss, economy).
- Configuración de recompensas del weekly ledger por estilo.

### Capa Mastery

- Especialización de cuenta (doctrina de ecos/codex/abyss).
- Trade-offs semipermanentes.

## 4.2 Trade-offs que sí importan

- Poder pico vs consistencia de run.
- Progreso vertical de una pieza vs amplitud de arsenal.
- Liquidez inmediata vs inversión de largo plazo.
- Riesgo de contrato alto vs objetivo seguro.

## 4.3 Elecciones irreversibles / semi-reversibles

Irreversibles blandas:

- “Doctrina semanal” de enfoque (se puede cambiar en próximo ciclo, no al instante).

Semi-reversibles:

- Reespecialización de proyectos/reliquias con costo de fricción.

Regla clave:

- Nunca bloquear al jugador para siempre; sí imponer costo de oportunidad real.

## 4.4 Cómo evitar falsas decisiones

Checklist de diseño para cada elección nueva:

- Cambia el resultado de la sesión actual.
- Cambia el plan de la próxima sesión.
- Cambia la economía de la cuenta.

Si no cumple al menos dos de las tres, la decisión es cosmética y debe simplificarse.

---

## FASE 5 - Dopamina y Recompensas

## 5.1 Auditoría actual (resumen)

- Frecuencia: buena en micro-progreso, irregular en momentos wow.
- Variabilidad: existe, pero a veces sin framing claro de valor.
- Picos: extracción y algunos drops; faltan más “highlights” en santuario.

## 5.2 Arquitectura de recompensa propuesta

### Capa 1 - Micro-recompensa frecuente

- Feedback táctil/visual fuerte por hitos de run y claims.
- Reforzar “avance visible” en cada sesión corta.

### Capa 2 - Recompensa objetivo

- Contratos con recompensa de foco.
- Milestones semanales por especialización elegida.

### Capa 3 - Recompensa wow

- Drops raros con identidad (no solo número).
- Eventos de descubrimiento codex con presentación especial.
- Logros aspiracionales con impacto sistémico.

## 5.3 Sistema Loot Hunt mejorado

- “Pools” de chase por contexto (boss/abyss/farm/speed).
- Protección de mala racha blanda (sin regalar perfects).
- Marcado de piezas objetivo y progreso hacia ellas.

## 5.4 Milestones importantes

- Milestones de build: desbloquean forma de jugar, no solo stats.
- Milestones de santuario: abren nueva decisión operativa.
- Milestones de mastery: cambian qué metas son óptimas.

---

## FASE 6 - Estructura de Progresión (early / mid / late)

## 6.1 Early game (enganche rápido)

Objetivo: entender el loop y sentir poder rápido.

Diseño:

- Tutorial orientado a “primera extracción con decisión significativa”.
- Desbloqueos en cadena corta: combate -> extracción -> santuario -> retorno.
- Contratos simples de un objetivo.

Riesgo a evitar: sobrecargar con demasiadas estaciones antes de que el loop base cierre.

## 6.2 Mid game (decisiones y sistemas)

Objetivo: consolidar hábito y especialización.

Diseño:

- Se abren rutas de santuario en paralelo (forge/codex/encargos/sigilos).
- Weekly ledger pasa de checklist a “plan semanal elegido”.
- Aparecen trade-offs genuinos por recursos escasos.

Riesgo a evitar: que todo se sienta obligatorio al mismo tiempo.

## 6.3 Late game (optimización y mastery)

Objetivo: profundidad y contenido aspiracional.

Diseño:

- Cacerías de boss/mutadores semanales.
- Aspiracionales de abyss y proyectos de alto riesgo/recompensa.
- Especialización de cuenta con identidad clara.

Riesgo a evitar: inflación de stats sin decisiones nuevas.

## 6.4 Pacing recomendado

- Inicio rápido para enganchar.
- Desaceleración controlada con más agencia, no más espera vacía.
- Endgame sostenido por rotación de objetivos y mastery.

---

## FASE 7 - Monetización Futura (sin implementarla aún)

## 7.1 Qué sí monetizar (ético, no P2W)

### Conveniencia

- Slots extra de cola/gestión en santuario.
- Presets adicionales de loadout/contratos.
- Herramientas de planificación (filtros, favoritos, tableros).

### Cosméticos

- Skins de héroe/reliquia/proyecto/estaciones.
- Temas visuales de UI, efectos de extracción y banners de hitos.

### Servicios de cuenta

- QoL de organización (historial extendido, analytics visuales).
- Personalización de perfil/logros.

### Pase estacional ético

- Recompensas cosméticas + conveniencia moderada + boosts no competitivos.

## 7.2 Qué no monetizar

- Poder directo de combate.
- Acceso exclusivo a contenido clave.
- Conversión premium que saltee mastery crítico.

## 7.3 Recursos acelerables sin romper experiencia

- Aceleración limitada de timers secundarios.
- Nunca saltar validaciones clave de progreso.
- Siempre ofrecer vía free equivalente por juego normal.

## 7.4 Guardrails de monetización

- Todo contenido funcional debe ser alcanzable gratis.
- La compra ahorra tiempo/gestión, no compra victorias.
- El diseño base debe ser divertido sin gastar.

---

## FASE 8 - Features Adictivas (mínimo 10)

| Feature | Impacto en retención | Complejidad | Fase ideal |
|---|---|---|---|
| 1. Contratos de Expedición | Alta D1/D7 por objetivo claro cada run | Media | Inmediata |
| 2. Tablero “Centro de Mando” en Santuario | Alta D1 por claridad de próximas acciones | Baja | Inmediata |
| 3. Cacerías de Boss con cooldown | Alta D7/D30 por cita recurrente | Media | Mid |
| 4. Rutas de Investigación Codex | Alta D7 por especialización | Media | Mid |
| 5. Escuadrones de Encargos especializados | Media-Alta por retorno 8h/24h | Media | Mid |
| 6. Sistema de Near-Miss Rewards | Alta D1 por evitar frustración de runs fallidas | Baja | Inmediata |
| 7. Álbum de Colección de Reliquias/Contextos | Media D30 por completionism | Baja-Media | Mid |
| 8. Eventos semanales con mutadores | Alta D7/D30 por novedad | Alta | Mid-Late |
| 9. Ranking async personal (tu histórico, no PvP) | Media por auto-competencia | Baja | Inmediata |
| 10. Plan Semanal Elegido (Weekly Doctrine) | Alta D7 por compromiso | Media | Mid |
| 11. Presets de build por contrato | Media D1 por fricción reducida | Baja | Inmediata |
| 12. Objetivos “casi lo logras” contextualizados | Alta D1 por reintento inmediato | Baja | Inmediata |
| 13. Proyecto Maestro de largo plazo (Deep Forge) | Alta D30 por aspiración | Alta | Late |
| 14. Calendario de ventanas de oportunidad | Media-Alta por anticipación | Media | Mid |

Notas:

- Priorizar features que cambian comportamiento diario antes que features de volumen de contenido.
- Evitar lanzar múltiples sistemas semanales nuevos en el mismo sprint de UX.

---

## FASE 9 - Priorización

## 🔴 Alto impacto / baja complejidad (hacer primero)

1. Contratos de Expedición con 2-3 opciones por run.
2. Centro de Mando de Santuario (claim, cuello de botella, siguiente mejor acción).
3. Near-miss rewards en extracción/run summary.
4. Presets de setup por objetivo (sigilo/reliquia/contexto).
5. Objetivo semanal elegido (doctrina simple sobre weekly ledger).

Por qué primero: cambian hábito y claridad sin refactor masivo de motores.

## 🟡 Alto impacto / alta complejidad

1. Cacerías de boss con rotación y cooldown.
2. Eventos semanales con mutadores.
3. Rutas de investigación profundas de codex.
4. Deep Forge “Proyecto Maestro” multi-fase.
5. Escuadrones de encargos con especialización.

Por qué después: requieren nuevos modelos de contenido, balance y UX coordinada.

## 🔵 Bajo impacto

1. Micro-ajustes visuales sin cambio de loop.
2. Más variantes de rewards sin cambiar decisiones.
3. Nuevos números de economía sin nueva estructura de objetivos.

Por qué no priorizar: mejoran “color”, no mejoran hábito estructural.

---

## Cambios Estructurales de Diseño Recomendados

## A) Arquitectura de diseño (conceptual)

Crear 4 directores de experiencia (a nivel de diseño de sistema):

- `Expedition Director`: define contratos, riesgos y objetivos de run.
- `Sanctuary Director`: decide recomendaciones y prioridades de jobs.
- `Reward Director`: garantiza cadencia micro/medio/wow.
- `Calendar Director`: orquesta ritmos diario/semanal/evento.

No implica implementación inmediata; implica ordenar decisiones futuras bajo estos ejes.

## B) Diseño de contenido escalable (2+ años)

Diseñar contenido como plantillas, no como contenido único:

- Plantillas de contratos.
- Plantillas de mutadores.
- Plantillas de cacerías.
- Plantillas de rutas codex.

Así escalas por combinación de reglas, no por producir assets infinitos.

## C) Telemetría mínima para validar retención

Instrumentar y seguir:

- Tasa de sesión corta completada.
- Tiempo hasta primera decisión de valor por sesión.
- Tasa de retorno por ventana (5m/1h/8h/24h).
- % de runs con objetivo explícito vs runs “sin plan”.
- Conversión de near-miss a reintento inmediato.

---

## Riesgos de Producto y Mitigaciones

Riesgo 1: sobrecarga de sistemas simultáneos.  
Mitigación: desbloqueo por capas con foco semanal.

Riesgo 2: timers percibidos como bloqueo.  
Mitigación: cada timer con decisión asociada y alternativa jugable.

Riesgo 3: meta dominante única (build obligatoria).  
Mitigación: poder contextual + rotación de objetivos + costos de oportunidad.

Riesgo 4: monetización futura que erosione confianza.  
Mitigación: conveniencia/cosmética only, guardrails públicos y consistentes.

---

## Cierre

El juego no necesita más sistemas aislados; necesita una **columna de intención por sesión** y un **ritmo de retorno predecible con decisiones reales**.

Si ejecutás este rediseño por capas, obtenés:

- Mejor hábito diario sin castigo tóxico.
- Más profundidad real en mid/late sin inflar complejidad inútil.
- Base sólida para live-ops y monetización ética de largo plazo.


---

## Plan Cerrado v1

Este bloque reemplaza la iteración abierta y define el alcance cerrado de diseño para la siguiente etapa.

## Alcance confirmado (entra en v1)

1. Contratos de Expedición v1:
   - 2 contratos visibles por rotación.
   - Rotación cada 8 horas.
   - Reroll opcional pagando recurso de Santuario.
   - Completar contratos pasa a ser la fuente principal de recursos objetivo.
2. UI de Expedición orientada a contrato:
   - Reemplazar la card “Sesión actual” por “Contrato activo”.
   - Mostrar objetivo, progreso y recompensa del contrato.
3. Santuario con pendientes visibles:
   - Badge/blob de acciones pendientes en la tab Santuario (alineado con Héroe/Expedición).
4. Deep Forge con acción larga de 24h:
   - Introducir “Proyecto Maestro” como primera acción de 24 horas.
   - Arrancar con 1 solo slot para preservar decisión.
5. Boss semanal v1:
   - 1 boss semanal.
   - 3 intentos por semana.
   - 3 dificultades (`Normal`, `Veterano`, `Élite`) con rewards escaladas.
   - Misma mecánica base y una mutación extra por dificultad para reducir costo de contenido.
6. Biblioteca por capas:
   - El farmeo de familias, maestría de poderes y maestría de bosses se desbloquea progresivamente desde Biblioteca.
7. Weekly con variedad por spec:
   - Rotar al menos 1 objetivo semanal con sesgo por especialización, sin bloquear otras specs.

## Ajustes transversales confirmados

1. Próximos desbloqueos significativos:
   - Mostrar “qué desbloqueas” y “qué falta”, sin ETA por ahora.
2. Feedback táctil/visual:
   - Tratarlo como workstream transversal (botones, upgrades, talentos, claims, forge).
   - Corregir problemas actuales de feedback visual (ejemplo: notificación de logros con fondo transparente).
3. Retorno 8 horas:
   - No usar recomendación automática.
   - Mantener elección del jugador y diseñar opciones significativas no intrusivas.

## Fuera de alcance v1 (postergado explícitamente)

1. Bifurcaciones durante el push de run.
2. Sistema near-miss en extracción/run summary.
3. Eventos semanales con mutadores.
4. Expansión profunda de masteries/codex antes de pulir el loop actual.
5. Pity global de mala racha (si existe, solo contextual y acotado en futuras fases).
6. Rework grande de presets si el alcance actual ya cubre la necesidad.

## Orden de ejecución recomendado

1. Contratos v1 + card de contrato activo en Expedición.
2. Badge de pendientes en Santuario.
3. Proyecto Maestro 24h en Deep Forge.
4. Boss semanal v1 con intentos y dificultades.
5. Desbloqueos por capas en Biblioteca.
6. Weekly sesgado por spec.
7. Pulido transversal de feedback táctil/visual.

## Criterios de validación de v1

1. Cada sesión de Expedición inicia con objetivo explícito de contrato.
2. El jugador identifica rápido qué reclamar/hacer al entrar al Santuario.
3. Existe al menos una decisión de alto valor de 24h en Deep Forge.
4. El loop semanal tiene un pico claro (boss semanal) y variedad por spec en weekly.
5. El early/mid no expone de golpe todas las capas de Biblioteca.
