# Talent Rework — Checklist Operativo (Fase 1)

## Objetivo de esta checklist
Ejecutar Fase 1 del plan (`fundaciones + compatibilidad`) con tareas accionables por archivo.

---

## 1) Modelo de datos nuevo (talentLevels)

### Archivo: `src/engine/stateInitializer.js`
- [ ] Agregar en `freshState.player`:
  - [ ] `talentLevels: {}`
  - [ ] `talentSystemVersion: 2` (o en raíz, pero consistente)
- [ ] Mantener `unlockedTalents` por compatibilidad temporal.
- [ ] En merge de saves:
  - [ ] normalizar `talentLevels` si existe
  - [ ] fallback seguro a `{}` si falta
  - [ ] ejecutar migración cuando `talentSystemVersion < 2`.

### Archivo: `src/state/gameReducer.js`
- [ ] En acciones de talentos (`UNLOCK_TALENT`, `RESET_TALENT_TREE`):
  - [ ] no romper flujo viejo
  - [ ] preparar ruta para `UPGRADE_TALENT_NODE` (nueva acción)
- [ ] Agregar case nuevo:
  - [ ] `UPGRADE_TALENT_NODE` => usa nuevas funciones de engine

---

## 2) Catálogo y reglas del nuevo árbol

### Archivo nuevo: `src/data/talentNodes.js`
- [ ] Definir `TALENT_NODES` (MVP Warrior Core + Berserker, sin nodos que requieran engine nuevo).
- [ ] Definir campos mínimos por nodo:
  - [ ] `id`, `name`, `type`, `maxLevel`, `track`, `tier`
  - [ ] `baseCost`, `costType` (evitar `eval`)
  - [ ] `prereqs`, `prereqLevels`
  - [ ] `classId`, `specId` (si aplica)
  - [ ] `effect` estructurado (no string)

### Archivo nuevo: `src/data/talentEdges.js`
- [ ] Definir `TALENT_EDGES` para render de conexiones.
- [ ] Incluir puentes (`type: bridge`) para resaltado visual.

---

## 3) Engine de talentos v2

### Archivo nuevo: `src/engine/talents/talentTreeEngine.js`
- [ ] Implementar:
  - [ ] `getNodeLevel(state, nodeId)`
  - [ ] `getNodeUpgradeCost(state, nodeId)`
  - [ ] `canUnlockNode(state, nodeId)`
  - [ ] `applyNodeUpgrade(state, nodeId)`
  - [ ] `getAvailableNodes(state)`
- [ ] Reglas de costo sin `eval`:
  - [ ] `flat`
  - [ ] `tierScaled`
  - [ ] `infiniteExp`
- [ ] Validaciones:
  - [ ] TP suficientes
  - [ ] prereqs completos
  - [ ] clase/spec correcta
  - [ ] no superar `maxLevel`.

### Archivo: `src/engine/combat/statEngine.js` (o módulo donde apliquen talentos)
- [ ] Crear adaptador que traduzca `talentLevels` -> modificadores.
- [ ] Mantener compatibilidad temporal con `unlockedTalents` mientras dura migración.

---

## 4) Migración de saves

### Archivo nuevo: `src/engine/migrations/talentsV2Migration.js`
- [ ] Crear `TALENT_MIGRATION_MAP` (viejo -> nuevo).
- [ ] Implementar `migrateTalentsToV2(savedState)`:
  - [ ] convertir talentos viejos a `talentLevels`
  - [ ] refund controlado de extras
  - [ ] setear `talentSystemVersion = 2`
  - [ ] preservar `unlockedTalents` derivado de niveles > 0

### Archivo: `src/engine/stateInitializer.js`
- [ ] Ejecutar migrador al cargar save viejo.
- [ ] Asegurar idempotencia (si corre dos veces, no duplica refund).

---

## 5) UI mínima compatible (sin rediseño grande aún)

### Archivo: `src/components/Talents.jsx`
- [ ] Leer niveles desde `player.talentLevels`.
- [ ] Mostrar por nodo:
  - [ ] nivel actual (`N/max`)
  - [ ] costo siguiente nivel
  - [ ] estado (bloqueado/desbloqueable/max)
- [ ] Botón de upgrade -> dispatch `UPGRADE_TALENT_NODE`.
- [ ] Mantener vista vieja como fallback si falta data nueva.

---

## 6) Telemetría mínima de transición

### Archivo: `src/state/gameReducer.js` (donde ya existe analytics)
- [ ] Incrementar métrica al subir nodo:
  - [ ] `talentNodeUpgrades`
  - [ ] opcional: `talentNodeUpgradesById[nodeId]`

---

## 7) QA manual (bloqueante antes de merge)

### Smoke tests
- [ ] Save nuevo inicia con `talentLevels {}`.
- [ ] Save viejo migra sin crash.
- [ ] Subir nodo descuenta TP correcto.
- [ ] Prereq bloquea/desbloquea correctamente.
- [ ] Reset devuelve puntos correctamente.
- [ ] Stats cambian al subir talento.

### Edge cases
- [ ] Nodo en max no permite compra.
- [ ] TP exactos permite compra.
- [ ] TP insuficientes bloquea compra.
- [ ] Cambio de spec no rompe niveles existentes.

---

## 8) Definición de “Done” para Fase 1
- [ ] Datos nuevos persistidos en save.
- [ ] Migración v1->v2 estable.
- [ ] Engine v2 funcional para compra de nodos.
- [ ] UI mínima operativa con niveles/costos/estado.
- [ ] Sin regressions críticas en combate/progresión.

---

## Próximo paso (Fase 2)
- Implementar contenido MVP completo:
  - Warrior Core (3 tracks)
  - Berserker
  - 1-2 puentes
  - 1 infinito por track
- Primer pase de balance con telemetría real.
