# Expediciones Automáticas — MVP Integrado con Proyectos

## Objetivo

Diseñar un sistema de expediciones time-gated que:

* complemente la Expedición principal
* alimente directamente el sistema de proyectos (afinidades)
* sea claro, útil y no ignorable
* escale con el progreso del jugador
* permita monetización futura basada en QoL

---

## Concepto Central

* Las expediciones NO usan al héroe principal
* Corren en tiempo real (offline compatible)
* El jugador elige qué misión hacer
* El RNG afecta SOLO el resultado final, no la dirección

---

## Selección de Misión

* El jugador **elige 100% la misión**
* No hay RNG en la elección
* Cada misión indica claramente:

  * tipo (Bleed / Crit / etc)
  * duración
  * reward esperado

Ejemplo:

* Expedición de Sangre (Bleed)
* Expedición de Precisión (Crit)
* Expedición Defensiva (Tank)

---

## Tipos de Expedición (MVP: 3)

### 1. Affinity Expedition

**Propósito:** generar cargas para proyectos

**Rewards:**

* BleedCharge
* CritCharge
* TankCharge
* TempoCharge

**Regla:**

* La misión define la familia principal
* RNG solo afecta cantidad exacta

---

### 2. Codex Expedition

**Propósito:** progresión del Codex

**Rewards:**

* codexInk
* fragmentos opcionales

---

### 3. Material Expedition

**Propósito:** alimentar Forja / Sigilos

**Rewards:**

* relicDust
* sigilFlux

---

## Duraciones

* Short: 15 minutos
* Medium: 1 hora
* Long: 4 horas

---

## Slots

* 2 slots base
* cada slot = 1 expedición activa
* no stacking en el mismo slot

---

## Cancelación

### ✔ Permitido cancelar

* Sí, el jugador puede cancelar

### ⚠ Penalización

* pierde el progreso de esa misión
* no recibe rewards

### Uso esperado

* corregir errores
* cambiar estrategia

---

## Reward Scaling

Escala con progreso del jugador:

```text
progressTier = maxTierReached

rewardMultiplier:
<=10 → x1.0
<=20 → x1.5
<=30 → x2.0
>30 → x2.5
```

---

## Rewards Base

### Affinity Expedition

Short:

* 4–6 cargas

Medium:

* 10–15 cargas

Long:

* 25–40 cargas

---

### Codex Expedition

Short:

* 5–10 codexInk

Medium:

* 15–25 codexInk

Long:

* 40–60 codexInk

---

### Material Expedition

Short:

* 3–5 relicDust
* 2–4 sigilFlux

Medium:

* 8–12 relicDust
* 5–8 sigilFlux

Long:

* 20–30 relicDust
* 10–15 sigilFlux

---

## Integración con Proyectos

### Generación de cargas

Al completar una expedición:

* se generan cargas por familia
* se almacenan en el Santuario

Ejemplo:

```text
BleedCharge: 120
CritCharge: 40
TankCharge: 10
```

---

### Uso en Santuario

El jugador decide:

* gastar cargas → subir afinidad del proyecto
* convertir cargas → recurso general (opcional)
* guardar

---

### Afinidad del proyecto

Ejemplo:

```text
Bleed: 60
Crit: 25
Tank: 15
```

---

### Efecto en materialización

* 1 afijo garantizado si afinidad alta
* resto generado por pesos

---

## Flujo del Jugador

1. Elige misión en Santuario
2. Inicia expedición
3. Sale del juego
4. Vuelve
5. Reclama rewards
6. Usa cargas en proyectos
7. Mejora afinidad
8. Entra a nueva run con mejor dirección

---

## UX Requirements

Debe mostrar claramente:

* tipo de expedición
* duración
* reward estimado
* familia afectada

Debe ser:

* rápido de usar
* entendible en 2 segundos

---

## Reglas de Diseño

* El jugador siempre elige dirección
* El RNG solo afecta cantidad
* No reemplaza el gameplay principal
* Siempre aporta valor útil

---

## Principio Final

"El jugador decide qué quiere mejorar.
El tiempo solo determina cuánto tarda."
