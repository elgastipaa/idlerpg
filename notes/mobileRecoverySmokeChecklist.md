# Mobile Recovery Smoke Checklist

## Objetivo
Validar en móvil que la expedición no quede congelada al volver a la app (background/foreground) y que, si detecta desalineación, el auto-recovery la repare sin romper progreso.

## Precondiciones
- Estar en un save con expedición iniciada (`Expedición > Combate` con ticks activos).
- Tener visible `Más > Sistema > Diagnóstico`.
- Probar en al menos 1 Android real (ideal: Chrome + PWA instalada).

## Campos a capturar (en cada escenario)
- `Fase expedición`
- `Jobs corriendo`
- `runtimeRecoveries`
- `runtimeRepairs`
- `runtimeOfflineJobStalls`
- `runtimeLastRecoveryReason`
- `runtimeLastRecoveryAt`

## Escenarios smoke

### 1) Salida corta (10-20s)
- [ ] Iniciar expedición y confirmar que los ticks avanzan.
- [ ] Enviar app a background 10-20 segundos.
- [ ] Volver a foreground.
- Esperado:
- [ ] Combate/ticks reanudan en menos de 2 segundos.
- [ ] No queda bloqueado en botón `Iniciar expedición`.

### 2) Salida media (2-3 min)
- [ ] Repetir flujo dejando la app en background 2-3 minutos.
- Esperado:
- [ ] La run continúa y el estado se sincroniza al volver.
- [ ] Si hubo reparación, `runtimeRecoveries` incrementa y `runtimeLastRecoveryReason` no queda vacío.

### 3) Salida larga (10+ min)
- [ ] Dejar app en background 10+ minutos.
- [ ] Volver y esperar 5 segundos.
- Esperado:
- [ ] No hay freeze de fase ni de jobs.
- [ ] Si detecta desalineación, se corrige sola (sin hard reset de partida).

### 4) App kill + reopen
- [ ] Con expedición en curso, cerrar la app completamente (swipe kill).
- [ ] Abrir de nuevo.
- Esperado:
- [ ] Save carga sin crash.
- [ ] El estado de expedición queda consistente (sin “run fantasma” ni bloqueo).

### 5) Cambio de red / offline temporal
- [ ] En expedición activa, activar modo avión 30-60s y volver a online.
- [ ] Reabrir la app si hace falta.
- Esperado:
- [ ] UI no queda congelada.
- [ ] `runtimeOfflineJobStalls` solo sube cuando corresponde.

## Matriz de resultado
| Escenario | Dispositivo | Resultado | Observación corta |
| --- | --- | --- | --- |
| 1 |  | Pass / Fail |  |
| 2 |  | Pass / Fail |  |
| 3 |  | Pass / Fail |  |
| 4 |  | Pass / Fail |  |
| 5 |  | Pass / Fail |  |

## Criterio de cierre
- [ ] 5/5 escenarios en `Pass`.
- [ ] Sin freeze reproducible de expedición en 2 corridas consecutivas.
- [ ] Si hay `Fail`, adjuntar dump de `Diagnóstico de Save` + pasos exactos.
