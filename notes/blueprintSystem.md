# Sistema de Proyectos (versión final)

## Extracción
- El jugador elige **1 ítem por run**
- Va a **stash temporal del Santuario (2–3 slots)**
- Luego decide:
  - Convertir a **Blueprint**
  - **Desguazar** (job con timer)

## Blueprint (Proyecto)
Guarda:
- Rareza
- Poder legendario (si tiene)
- **Familia principal** (+ opcional secundaria)
- (Opcional) 1 afijo “ancla” débil

No guarda:
- Lista completa de afijos
- Valores exactos

## Cargas (materials)
- Al convertir a blueprint o desguazar:
  - Cada afijo → **cargas de su familia**
- Familias recomendadas (5–6):
  - Bleed / DoT
  - Crit / Burst
  - Tank / Defense
  - Tempo / Multi-hit
  - Utility

## Afinidad del proyecto
- Representada como pesos por familia
- Se mejora gastando cargas en Santuario
- **Cap: 60–70% para la familia principal**
- Afinidad **no es 100% determinista**

## Materialización (en Expedición)
- El proyecto entra como:
  - base + poder + afinidad
- Se generan afijos:
  - **1 línea garantizada** si afinidad alta
  - resto por pesos (RNG)

## Reglas clave
- El ítem **no se copia**, se “reinterpreta”
- El progreso del proyecto **no se pierde** si la materialización sale mal
- Desguazar usa **timer (5–30 min)**; blueprint es instantáneo
- Slots limitados:
  - 1–2 blueprints activos
  - 2–3 stash temporal

## Principio
“En la run encontrás valor.  
En el Santuario lo convertís en dirección.”



//// # 3 MECÁNICAS TIME-GATED (listas para implementar)

---

## 🧭 1) CONTRATOS

### Qué es
Objetivos cortos rotativos que guían la sesión.

### Setup
- 3 slots de contratos
- Refresh cada 8–12h
- 1 reroll gratis por ciclo

### Tipos
- Push: “alcanzar Tier 15”
- Hunt: “matar Boss X”
- Craft: “extraer 2 proyectos”
- Build: “aplicar 10 bleed kills”

### Rewards
- Cargas de familia (Bleed/Crit/Tank/Tempo)
- 1 material raro (relicDust/sigilFlux)
- Bonus pequeño de ecos

### Notas
- 1 contrato “premium” por día (mejor reward)
- No bloquear runs; sólo orientar

---

## 🗺️ 2) CARTOGRAFÍA (PREPARACIÓN DE RUN)

### Qué es
Elegís un “mapa” que sesga la seed de la próxima expedición.

### Setup
- 2 slots de mapas
- Preparación: 15–45 min
- Se consume al iniciar la run

### Ejemplos de mapas
- Blood Grounds: +chance Bleed, más elites
- Hunter’s Trail: +chance de Boss específico
- Dense Zone: más enemigos, más riesgo
- Forge Run: +materials, menos drops de items

### Efecto
- Modifica:
  - pool de enemigos
  - mods de elites
  - boss de la run
  - pesos de drop

### Notas
- No garantiza, sólo sesga
- Permite target farm sin RNG puro

---

## 🧪 3) LABORATORIO (RESEARCH)

### Qué es
Progreso pasivo de cuenta con beneficios persistentes.

### Setup
- 2 colas base
- Duración: 1h, 4h, 8h
- Persiste offline

### Líneas de research
- Affinity Boost:
  - +5% cap de afinidad de familia
- Extraction Efficiency:
  - +10% cargas al desguazar
- Forge Mastery:
  - -10% coste de Forja Profunda
- Sigil Mastery:
  - +1 carga máxima de sigil

### Progresión
- niveles crecientes (coste mayor)
- cada nivel mejora ligeramente el bonus

### Notas
- No power directo en combate
- Mejora eficiencia global

---

## PRINCIPIO

- Combate: siempre disponible
- Sistemas: mejoran eficiencia con tiempo

> “Jugás cuando querés.
> Progresás mejor si volvés.”


//// # Sistemas para gastar recursos (resource sinks) — simples y útiles

---

## 🔧 1) CALIBRACIÓN DE PROYECTO
**Qué hace:** ajustar finamente el proyecto sin romperlo.

- Coste: cargas de familia + oro/essence
- Acciones:
  - +X% a una afinidad (con -Y% a otra)
  - subir/bajar peso de subfamilia (ej: DoT dentro de Bleed)
- Límite: 2–3 calibraciones por proyecto (coste creciente)

👉 Uso: decisiones de build sin rehacer todo

---

## 🧿 2) INSCRIPCIÓN DE PODER (ENHANCE)
**Qué hace:** potenciar el poder legendario del proyecto.

- Coste: relicDust + sigilFlux
- Efecto:
  - +tier del poder (I → II → III)
  - o “mod” del poder (más fuerte pero con trade-off)
- Límite: 1 mejora activa por proyecto

👉 Uso: convertir un buen proyecto en uno top

---

## 🛡️ 3) ASEGURAR EXTRACCIÓN (INSURANCE)
**Qué hace:** asegurar parte del valor al morir.

- Coste: sigilFlux / moneda de santuario
- Efecto:
  - guardás 1 cargo o 1 proyecto aunque mueras
- Límite: 1 seguro por run

👉 Uso: decisiones de riesgo (overpush)

---

## 🧭 4) REROLL DE SEED (RUN SETUP)
**Qué hace:** rehacer la seed de la próxima run.

- Coste: oro/essence + pequeño cooldown
- Efecto:
  - cambia bosses/mods/encuentros
- Límite: 1–2 rerolls por preparación

👉 Uso: evitar runs pésimas, sin eliminar RNG

---

## 🧪 5) INFUSIÓN DE RUN (BUFF TEMPORAL)
**Qué hace:** consumir recursos para buffear la próxima run.

- Coste: cargas específicas (Bleed/Crit/Tank)
- Efecto (elegís 1):
  - +afinidad temporal
  - +drop de familia
  - +seguridad (mitigación ligera)
- Dura: solo esa run

👉 Uso: convertir recursos en ventaja táctica

---

## 📦 6) EXPANSIÓN DE SLOTS (LARGO PLAZO)
**Qué hace:** más capacidad en Santuario.

- Coste: relicDust + ecos
- Mejora:
  - +1 stash temporal
  - +1 slot de blueprint
  - +1 cola de jobs
- Cap: bajo (2–4 totales)

👉 Uso: QoL con impacto real

---

## 🔬 7) CONVERSIÓN DE RECURSOS
**Qué hace:** intercambiar recursos con pérdida.

- Coste: 100 → 70 (ratio desfavorable)
- Ej:
  - Bleed → General
  - General → Crit (caro)
- Límite: daily cap

👉 Uso: destrabar progresión sin trivializarla

---

## 🧾 8) CONTRATOS PREMIUM
**Qué hace:** objetivos más jugosos.

- Coste: sigilFlux / moneda
- Efecto:
  - contrato con reward alto
- Límite: 1–2 por día

👉 Uso: gastar para acelerar metas

---

## 🧠 REGLAS DE ORO

- Nada debe ser obligatorio para jugar
- Todo debe ser una **mejor forma** de jugar
- Costes crecientes en mejoras fuertes
- Siempre dejar alternativa gratis (más lenta)

---

## RESUMEN

Convertís recursos en:
- dirección (calibración)
- poder (inscripción)
- seguridad (insurance)
- control (seed reroll)
- eficiencia (infusión)

> “Los recursos no solo mejoran números,
> mejoran decisiones.”