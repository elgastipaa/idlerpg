# Talent Rework Plan (3 fases)

## Objetivo general
Reworkear el sistema de talentos para que:
- tenga precedencias claras (qué desbloquea qué),
- evite puntos muertos en late-game,
- mantenga decisiones de build reales,
- sea migrable sin romper saves existentes.

Arquitectura objetivo:
- `tracks + bridges + nodos infinitos (softcap)`
- `talentLevels` por nodo (no solo unlock binario)
- UI con conexiones explícitas.

---

## Fase 1 — Fundaciones (datos + compatibilidad)

### Objetivo
Preparar la base técnica sin romper gameplay actual.

### Cambios técnicos
- Agregar modelo nuevo de talentos:
  - `player.talentLevels: { [nodeId]: number }`
  - mantener `unlockedTalents` temporalmente para compatibilidad.
- Crear estructura de catálogo nueva:
  - `TALENT_NODES` (nodos)
  - `TALENT_EDGES` (conexiones visuales/lógicas)
  - `costRules` y `validationRules`.
- Implementar funciones core (sin `eval`):
  - `canUnlockNode(state, nodeId)`
  - `getNodeUpgradeCost(state, nodeId)`
  - `applyNodeUpgrade(state, nodeId)`
  - `getAvailableNodes(state)`.

### Migración de save
- Añadir `talentSystemVersion`.
- Si save viejo (`version < 2`):
  - mapear talentos viejos -> nodos nuevos (nivel inicial),
  - convertir duplicados/"talent II" en niveles,
  - refund de exceso a `talentPoints`,
  - fallback: talento viejo desconocido => refund controlado.

### Entregables
- [ ] Nuevo schema en state inicial.
- [ ] Migrador estable en `stateInitializer`.
- [ ] Tests básicos de migración (si hay harness) o script manual de validación.

### Criterios de aceptación
- Cargar save viejo no crashea.
- El jugador conserva progreso de talentos de forma razonable.
- Se puede subir nivel de un nodo con costo variable.

### Riesgos
- Riesgo de desbalance inicial por mapeo incompleto.
- Riesgo de doble aplicación de efectos (viejo + nuevo) durante transición.

---

## Fase 2 — Gameplay MVP (Warrior Core + Berserker)

### Objetivo
Lanzar el nuevo sistema con contenido jugable real y balanceable.

### Alcance de contenido (MVP)
- Warrior Core completo con 3 tracks:
  - Damage
  - Sustain
  - Utility
- 2 bridges máximo (para reducir complejidad inicial).
- 1 nodo infinito por track (3 total).
- 1 spec completa: Berserker.
- Juggernaut queda para Fase 3.

### Cambios técnicos
- Integrar efectos de nodos en pipeline de stats/combat:
  - pasivos planos/%
  - triggers simples ya soportados por motor.
- Marcar nodos que requieren engine adicional como `requiresEngine` y excluirlos del MVP si no están soportados.
- Ajustar economía TP para evitar puntos sobrantes:
  - early generoso,
  - mid moderado,
  - late más lento,
  - infinitos como sink.

### Balance inicial sugerido
- Costos por tier:
  - Tier 1: 1 TP
  - Tier 2: 1-2 TP
  - Tier 3: 2-3 TP
  - Keystone: 4-5 TP
  - Infinito: exponencial suave
- Softcap de infinitos:
  - diminishing returns por nivel.

### Entregables
- [ ] Warrior Core jugable end-to-end.
- [ ] Berserker jugable end-to-end.
- [ ] Compra/reset de talentos estable.
- [ ] Telemetría mínima de picks por nodo (si existe analytics).

### Criterios de aceptación
- A nivel medio/alto no sobran grandes cantidades de puntos sin uso.
- Se pueden armar al menos 2 builds Warrior realmente distintas.
- No hay talento "must-pick" obvio que rompa todo en early.

### Riesgos
- Overpower de combinaciones crit/attack speed.
- Curva de costo demasiado agresiva y sensación de estancamiento.

---

## Fase 3 — UX + expansión (Juggernaut + polish)

### Objetivo
Completar sistema, mejorar legibilidad y cerrar balance.

### Contenido
- Agregar segunda spec completa: Juggernaut.
- Agregar bridges spec-core pendientes.
- Habilitar nodos más avanzados que requieran soporte extra de engine (si se decidió incluirlos).

### UX/UI
- Vista por tracks con conexiones claras (`edges`).
- Estados visuales:
  - bloqueado
  - desbloqueable
  - comprado
  - maxeado
  - infinito activo
- Indicador de "pasos disponibles" por track (sin imponer build).
- Mobile:
  - tracks colapsables,
  - foco en legibilidad sobre densidad.

### Telemetría / tuning
- Métricas clave:
  - pick-rate por nodo
  - win/death por build-tag
  - tiempo en desbloquear keystones
  - TP gastados vs acumulados por tramo de nivel
- Balance patches cortos (iterativos) sobre:
  - costos
  - caps
  - efectos extremos.

### Entregables
- [ ] Juggernaut integrado.
- [ ] UI de árbol final.
- [ ] Documento de balance v1.0.
- [ ] Migración validada con saves reales.

### Criterios de aceptación
- Jugador entiende precedencia sin leer documentación externa.
- No hay muros de progreso por falta de opciones de gasto.
- Hay al menos 3 rutas de build viables para Warrior.

### Riesgos
- Complejidad visual excesiva en mobile.
- Inflación de poder por stacking de infinitos + puentes.

---

## Checklist global
- [ ] Save viejo migra sin romper.
- [ ] Sin puntos muertos relevantes en late-game.
- [ ] Precedencias claras en UI.
- [ ] Warrior + 2 specs con identidad distinta.
- [ ] Costos y softcaps estabilizados.

---

## Decisions Log
- Fecha:
- Decisión:
- Motivo:
- Impacto esperado:

