1. Vamos a tener 25 Tiers, 1 boss en cada múltiplo de 5.
Los bosses van a ser seedeados por run, con una pool de 12+ bosses que voy a diseñar.

2. Abismo como repetición escalada de los mismos 25 tiers
Luego del Tier 25, repetimos los mismos 25 tiers, bosses en mismo orden seedeado que 1-25, pero ahora es "Abismo". Los monstruos escalan más fuerte, en lo posible exponencialmente, y los bosses tienen mejoras.
- Abismo I (26-50): Escalado stats aprox. Tier 50 es x3.4 de Tier 25. Bosses tienen +1 affix, +1 mecánica.
- Abismo II (51-75): Escalado stats aprox. Tier 75 es x8.2 de Tier 50. Bosses tienen +2 affixes, +2 mecánicas.
- Abismo III (76-100): Escalado stats aprox. Tier 100 es x18 de Tier 75. Bosses tienen +2 affixes, +2 mecánicas, mecánicas base más fuertes
- Abismo IV (101+): Escalado stats aprox. Escalado infinito. Bosses tienen +2 affixes, +3 mecánicas, todas más fuertes.

El seed de la run determina qué bosses caen en qué slots, y ese mismo seed se propaga a los Ecos del Abismo. Elegancia de diseño: el jugador puede decir "esta run tiene seed de Void Titan en slot 1 — en Abismo II va a ser un infierno".

3. Unlocks por Abismo
Vamos a hacer un unlock por abismo.
Abismo I - Rama de talentos "Abismo" en el prestige tree.
Abismo II - Pool de Affixes de "Abismo" disponibles en Crafting.
Abismo III - Legendary powers de "Abismo" disponibles en Codex.
Abismo IV - Slot de Sigil Run Adicional.

6. A sumar en el futuro:
Stash de items — un número limitado de items que podés guardar entre runs (PoE hace esto con la stash tab). Podría ser desbloqueable por Abismos o por monetización futura.
Memoria de build — guardar una configuración de talentos para "recordarla" al inicio de una run nueva y aplicarla rápido. Podría ser Abismos o monetización futura.
Leaderboard. 

Ninguno de estos da poder directo, pero hacen que el jugador sienta que su historia en el juego persiste.



//// DISEÑO DE BOSSES Y ABYSS

# Diseño: Boss Pool, Abismo Unlocks y Seeding

Fecha: 2026-04-15
Scope: Sistema de bosses seededados, escalado por Abismo, unlocks por umbral, keystones de rama Abismo, trigger de seeding.

---

## 1. Estructura de Tiers y Slots de Boss

- **25 tiers base** por ciclo (run o Abismo).
- **1 boss por múltiplo de 5**: slots en tiers 5, 10, 15, 20, 25.
- **Slot 1 (Tier 5)**: siempre arquetipo Agresivo o Defensivo. Nunca Control. Garantiza una intro accesible.
- **Slot 5 (Tier 25)**: siempre Void Sovereign o Chronolith. Boss de cierre temático fijo de los dos "finales".
- **Slots 2, 3, 4** (tiers 10, 15, 20): cualquier arquetipo, determinados por seed.

---

## 2. Pool de Bosses (12)

### Arquetipo Agresivo
Te matan rápido si no tenés DPS suficiente o sustain. Contraplay: burst, leech, velocidad de ataque.

| # | Nombre | Fantasy | Mecánicas base |
|---|---|---|---|
| 1 | Orc Warlord | Bruto físico, entra en frenzy | `enrage_low_hp` + `double_strike` |
| 2 | Blood Matriarch | Vampírica, se cura con tu daño | `lifesteal_reflect` + `enrage_low_hp` |
| 3 | Void Berserker | Caos puro, impredecible | `double_strike` + `crit_immunity` |
| 4 | Plague Herald | Veneno, DoT acumulativo | `armor_shred` + `poison_stacks` |

### Arquetipo Defensivo
Te matan lento si no tenés penetración o burst sostenido. Contraplay: armor pen, reforge de líneas ofensivas, affixes de penetración.

| # | Nombre | Fantasy | Mecánicas base |
|---|---|---|---|
| 5 | Iron Sentinel | Gólem de metal, casi indestructible | `shield_every_n` + `armor_shred` |
| 6 | Juggernaut Prime | Tanque absoluto, thorns masivo | `absorb_first_crit` + `thorns_aura` |
| 7 | Stone Colossus | Lento pero regenera constantemente | `regen_passive` + `shield_every_n` |
| 8 | Void Titan | Masivo, absorbe magia | `crit_immunity` + `absorb_first_crit` |

### Arquetipo Control
Te matan si no entendés su patrón. Contraplay: builds que no dependan de una sola mecánica (puro crit, puro mark, etc.).

| # | Nombre | Fantasy | Mecánicas base |
|---|---|---|---|
| 9 | Arcane Lich | Mago oscuro, interrumpe tu flow | `spell_mirror` + `crit_immunity` |
| 10 | Soul Weaver | Manipula marks y buffs | `mark_reversal` + `armor_shred` |
| 11 | Void Sovereign | Boss final temático, mecánicas combinadas | `enrage_low_hp` + `shield_every_n` + `crit_immunity` |
| 12 | Chronolith | Entidad temporal, resetea su vida | `phase_reset` + `absorb_first_crit` |

> **Nota de implementación**: Void Sovereign y Chronolith son los únicos elegibles para Slot 5 (Tier 25). Deben excluirse del pool de Slots 1–4 en el seeding.

---

## 3. Pool de Mecánicas de Boss (expandida)

### Mecánicas existentes (6)
- `absorb_first_crit`
- `enrage_low_hp`
- `shield_every_n`
- `armor_shred`
- `crit_immunity`
- `double_strike`

### Mecánicas nuevas a implementar (7)

| Mecánica | Efecto |
|---|---|
| `lifesteal_reflect` | El boss recupera vida equivalente a un % del daño recibido |
| `poison_stacks` | Aplica stacks de veneno acumulativos que escalan con duración del combate |
| `thorns_aura` | Devuelve daño fijo por cada hit recibido |
| `phase_reset` | Al llegar a 30% de vida, resetea a 60% una vez. Requiere dos "kills" efectivos |
| `mark_reversal` | Si el jugador tiene `mark` activo, se refleja y daña al jugador |
| `regen_passive` | Regenera vida constantemente. Requiere burst alto o DPS sostenido para superar la regen |
| `spell_mirror` | Refleja un % del daño mágico recibido de vuelta al jugador |

**Pool total de mecánicas: 13.**

---

## 4. Escalado por Abismo

Cada ciclo de 25 tiers posterior al base es un "Abismo". Los bosses aparecen en los mismos slots seededados que en tiers 1–25, pero con escalado de stats y complejidad creciente.

| Ciclo | Tiers | Nombre | Escalado de stats (relativo al inicio del ciclo) | Mejora de bosses |
|---|---|---|---|---|
| Base | 1–25 | El Mundo | Lineal, authored | Mecánicas base únicamente |
| Ciclo 2 | 26–50 | Abismo I | Tier 50 ≈ ×3.4 vs Tier 25 | +1 affix, +1 mecánica aleatoria del pool |
| Ciclo 3 | 51–75 | Abismo II | Tier 75 ≈ ×8.2 vs Tier 50 | +2 affixes, +2 mecánicas aleatorias |
| Ciclo 4 | 76–100 | Abismo III | Tier 100 ≈ ×18 vs Tier 75 | +2 affixes, +2 mecánicas, mecánicas base con mayor intensidad |
| Ciclo 5+ | 101+ | Abismo IV / Sin Fondo | Escalado infinito exponencial | +2 affixes, +3 mecánicas, todas escaladas |

> **Nota de diseño**: las mecánicas adicionales en los Ecos del Abismo deben tener contraplay real en el sistema de builds. Si se agrega `crit_immunity`, el jugador crit-heavy tiene que repensar su build o cambiar de sigil. La dificultad debe ser de decisión, no de stat-check puro.

---

## 5. Unlocks por Umbral de Abismo

Un unlock por umbral. Cada uno es permanente (account-wide, sobrevive al prestige).

### Abismo I — Rama de Prestige "Abismo"

Se desbloquea la rama `abismo` en el árbol de prestige. Estructura: 3 basics + 3 gameplay + 2 keystones.

**Basics (3):**
- Bonus de stats contra enemigos del Abismo (+X% daño, escala pequeña)
- Reducción de penalización de affixes enemigos en Abismo
- Bonus de loot quality en tiers del Abismo

**Gameplay (3):**
- Reducción de affixes en enemigos normales del Abismo (no bosses)
- Mayor drop rate de esencia en tiers del Abismo
- Chance de "corrupción favorable" en tier: el modificador negativo activo del tier se convierte en neutral

**Keystones (2):**

| Keystone | Efecto | Intención de diseño |
|---|---|---|
| **Pacto del Abismo** | −15% a todos los stats base. +40% a todos los stats únicamente contra enemigos del Abismo | Full commitment: el jugador apuesta todo al endgame. Penaliza correr tiers 1–25 pero potencia el Abismo |
| **Ojo del Vacío** | Los modificadores negativos de tier del Abismo también otorgan un bonus ofensivo proporcional a su severidad | Riesgo = recompensa explícito. Cuanto peor el modificador, mayor el upside ofensivo |

> Ambos keystones son mutuamente excluyentes por diseño de árbol (no por regla de código).

---

### Abismo II — Pool de Affixes de Abismo en Crafting

Se habilita un nuevo pool de affixes exclusivo del Abismo, disponible en la pantalla de Crafting. Estos affixes no dropean en tiers 1–25 y no se obtienen por reroll normal.

**Affixes ofensivos (4):**

| Affix | Efecto |
|---|---|
| `Void Strike` | Cada X hits, el siguiente ignora toda la defensa del enemigo |
| `Abyssal Crit` | Los crits tienen chance de aplicar un stack de "fractura de vacío" (DoT escalable) |
| `Echo Hit` | 20% de chance de que un ataque se repita con 40% del daño original |
| `Corruption Amp` | Daño aumentado contra enemigos que tengan al menos 1 affix activo |

**Affixes defensivos (4):**

| Affix | Efecto |
|---|---|
| `Void Leech` | Recuperás vida equivalente a un % del daño absorbido de affixes enemigos |
| `Phase Skin` | 1 vez por combate, absorbés el primer hit que te mataría |
| `Abyssal Regen` | Regeneración de vida que escala con el tier actual del Abismo |
| `Fracture Ward` | Reducís el daño recibido de mecánicas de boss en X% |

> Los valores numéricos exactos se ajustan por telemetría post-implementación.

---

### Abismo III — Legendary Powers de Abismo en Codex

Se habilitan 5 legendary powers exclusivos del Abismo en el sistema de Codex. Más dramáticos que los powers base — son recompensas de jugadores que llegaron lejos.

| Power | Efecto | Fantasy / Clase target |
|---|---|---|
| **Ojo del Vacío** | Tus crits contra bosses aplican `void_exposed` por 3 hits (daño amplificado en esos hits) | General, cazador de bosses |
| **Pacto de Sangre** | Al morir en combate, en vez de morir perdés 30% del oro de la run y continuás con 1 HP. 1 vez por combate | General, superviviente extremo |
| **Resonancia del Abismo** | Cada Estrato completado en esta run otorga +X% a todos los stats permanente hasta el prestige | General, escala con profundidad |
| **Memoria Eterna** | Los stacks de `memory` no se resetean entre combates en el Abismo | Arcanist endgame |
| **Furia Sin Fondo** | Cada boss muerto en esta run otorga +X% crit chance acumulativo permanente hasta el prestige | Berserker endgame |

> Tres powers son de uso general. Dos son específicos de clase. Un jugador que los descubre con la clase equivocada igual los quiere para cuando juegue esa clase — esto es intencional para el Codex chase.

---

### Abismo IV — Slot de Sigil Adicional

Se desbloquea un segundo slot de Run Sigil. El jugador puede activar 2 sigils simultáneamente al iniciar una run.

**Pares de sigils — guía de sinergia y tensión (para documentación in-game o tooltips):**

| Par | Tipo | Nota |
|---|---|---|
| `ascend` + `hunt` | Sinergia fuerte | Subís rápido y cazás powers en el camino |
| `forge` + `dominion` | Sinergia fuerte | Crafteás y completás Codex en la misma run |
| `ascend` + `forge` | Tensión | Ascend empuja avanzar, Forge quiere quedarse en tiers rentables de esencia |
| `hunt` + `free` | Neutro | `free` no aporta dirección si ya tenés `hunt` activo |
| `dominion` + `hunt` | Sinergia media | Ambos apuntan a progresión horizontal pero por distintos ejes |

> La tensión entre pares es contenido de theorycraft gratuito. No requiere implementación adicional — emerge del diseño existente de sigils.

---

## 6. Sistema de Seeding

### Regla general
El seed determina qué boss cae en cada slot (tiers 5, 10, 15, 20). El slot 5 (tier 25) siempre es Void Sovereign o Chronolith, también determinado por seed. El seed se propaga a todos los ciclos de Abismo — el boss en slot 3 de la run base es el mismo boss (como Eco corrompido) en slot 3 de Abismo I, II, III y IV.

### Primera run
**La primera run de cada jugador es idéntica para todos.** Seed fijo predefinido. Objetivos:
- Garantizar una curva de dificultad authored para el onboarding.
- Evitar que un jugador nuevo reciba un seed desfavorable (ej. boss Control en Tier 5).
- Permitir que el equipo de diseño balancee y testee ese arco específico.

Seed fijo sugerido para primera run:
```
Slot 1 (T5)  → Orc Warlord       (Agresivo, intro accesible)
Slot 2 (T10) → Iron Sentinel     (Defensivo, introduce tankeo)
Slot 3 (T15) → Blood Matriarch   (Agresivo, introduce sustain check)
Slot 4 (T20) → Soul Weaver       (Control, introduce complejidad de build)
Slot 5 (T25) → Void Sovereign    (Final temático)
```

### Runs posteriores (post-primer prestige)
A partir del primer prestige, cada run recibe un seed aleatorio generado en el momento del prestige. El jugador **no ve el seed** — la variabilidad es una sorpresa que se descubre en juego.

El seed se guarda en el estado de run activo para que sea reproducible (útil para telemetría y replay).

### Restricciones del seeding aleatorio
- Slot 1: solo pool Agresivo o Defensivo (bosses 1–8).
- Slot 5: solo Void Sovereign o Chronolith (bosses 11–12).
- Slots 2, 3, 4: cualquier boss del pool 1–10 (excluye los finales temáticos).
- No puede repetirse el mismo boss en dos slots de la misma run.

### Fuente de verdad sugerida
```
src/engine/progression/runSeeder.js
```
Función principal: `generateRunSeed(isFirstRun: boolean) → RunSeed`

---

## 7. Features Persistentes entre Runs (Futuro)

No implementar ahora. Registrar como backlog de diseño.

| Feature | Descripción | Vector de desbloqueo sugerido |
|---|---|---|
| **Stash de items** | Número limitado de items guardables entre runs. Similar a stash tab de PoE | Abismo o monetización |
| **Memoria de build** | Guardar configuración de talentos para aplicar al inicio de run nueva | Abismo o monetización |
| **Leaderboard** | Tabla de tier máximo alcanzado por sigil activo, por clase, global | Feature de lanzamiento o post-launch |

> Ninguno de estos da poder directo. Su función es hacer que la historia del jugador en el juego persista y sea visible.

---

*Documento generado como parte del diseño de IdleRPG. Revisión: Lead GD session 2026-04-15.*


//// DESIGN PRESTIGE PACING

# Diseño: Prestige Pacing y Árbol de PP

Fecha: 2026-04-15
Scope: Sistema de acumulación de PP, curva de pacing por era, estructura del árbol de prestige, sistema de tags por nodo, Prestige Momentum.

---

## 1. Filosofía de Diseño

El prestige loop es el corazón de la retención a largo plazo. El objetivo central es que **siempre haya un nodo a distancia de "una run más"** — esa sensación es la que crea el loop compulsivo.

El árbol no es una lista de mejoras. Es una progresión con tres eras distintas, cada una con su propio ritmo y sensación objetivo.

---

## 2. Las Tres Eras del Prestige

### Era 1 — "Cada run importa" (Prestigios 1–10)
El jugador aprende el loop. Los PP fluyen relativamente rápido. Cada prestige desbloquea 1–2 nodos visibles.

**Sensación objetivo**: "Cada vez que prestigio, algo cambia visiblemente en mi personaje."

### Era 2 — "Construyendo identidad" (Prestigios 11–30)
El jugador construye una build de prestige con intención. Los PP fluyen más lento, los nodos son más impactantes. Algunos nodos cuestan varias runs.

**Sensación objetivo**: "Sé exactamente a qué nodo voy, y estoy dispuesto a hacer 3 runs para llegar."

### Era 3 — "El grind eterno" (Prestigios 31+)
El jugador hardcore. Los keystones y sinks cuestan muchísimo. El Abismo es necesario para acumular PP a ritmo útil. Una run puede no alcanzar para un nodo.

**Sensación objetivo**: "Cada run en Abismo III vale 10 runs normales en PP. Vale la pena ir profundo."

---

## 3. Acumulación de PP — Reglas Base

- Los PP son **parcialmente acumulativos**: los PP nuevos ganados al prestigiar se suman a los PP no gastados del ciclo anterior.
- Los PP gastados no se recuperan ni se resetean.
- No hay pérdida de PP al prestigiar.

---

## 4. Prestige Momentum — Multiplicador por Profundidad

El Momentum es un multiplicador visible que se aplica encima de la fórmula base de PP. Premia al jugador que empuja más profundo que su récord histórico y desincentiva el farm de tiers bajos.

### Fórmula

```
PP_ganados = floor(PP_base * momentum_multiplier)

PP_base = floor(tier_maximo ^ 1.4 + nivel_final * 0.5)
```

### Tabla de Momentum

| Ratio tier actual vs mejor histórico | Multiplicador |
|---|---|
| < 50% del mejor histórico | ×0.6 |
| 50–80% del mejor histórico | ×1.0 |
| 80–99% del mejor histórico | ×1.3 |
| Igual al mejor histórico | ×1.8 |
| Supera el mejor histórico por 5+ tiers | ×2.5 |

> La primera run no tiene histórico — se trata como ratio 1.0 (momentum neutro ×1.0).

### Pseudocódigo de referencia

```javascript
const basePP = Math.floor(Math.pow(tierMax, 1.4) + playerLevel * 0.5);
const momentum = getMomentumMultiplier(tierMax, historicBestTier);
const totalPP = Math.floor(basePP * momentum);

function getMomentumMultiplier(current, best) {
  if (!best || best === 0) return 1.0; // primera run
  const ratio = current / best;
  if (current >= best + 5) return 2.5;
  if (ratio >= 1.0) return 1.8;
  if (ratio >= 0.8) return 1.3;
  if (ratio >= 0.5) return 1.0;
  return 0.6;
}
```

### UI de Momentum al hacer prestige

El multiplicador debe ser visible antes de confirmar el prestige:

```
┌─────────────────────────────────────┐
│  RESUMEN DE RUN                     │
│  Tier máximo alcanzado: 23          │
│  Tu récord: 25                      │
│  Momentum: ×1.3 (cerca del récord)  │
│                                     │
│  PP ganados: 847                    │
│  (sin momentum serían: 652)         │
└─────────────────────────────────────┘
```

---

## 5. Sistema de Tags por Nodo

### Regla general

El árbol es **compartido y account-wide** para todas las clases. Sin embargo, algunos nodos tienen un tag de clase o subclase que los hace **activos únicamente cuando el jugador juega esa clase/spec**.

Un nodo inactivo por tag puede ser comprado igualmente — los PP gastados no se pierden al cambiar de clase. El nodo simplemente no tiene efecto hasta que el jugador juega la clase/spec correspondiente.

### Niveles de tag

| Tag | Activo cuando |
|---|---|
| `universal` | Siempre, cualquier clase y spec |
| `warrior` | Clase Warrior (Berserker y Juggernaut) |
| `berserker` | Solo subclase Berserker |
| `juggernaut` | Solo subclase Juggernaut |
| `mage` | Clase Mage (Sorcerer y Arcanist) |
| `sorcerer` | Solo subclase Sorcerer |
| `arcanist` | Solo subclase Arcanist |

### Regla de tag por tipo de nodo

| Tipo de nodo | Tag |
|---|---|
| **Basic** (nodos 1–3 de cada rama) | Siempre `universal` |
| **Gameplay** (nodos 4–6 de cada rama) | Tag según rama (ver tabla de ramas) |
| **Keystone** (nodos 7–8 de cada rama) | Tag según rama (ver tabla de ramas) |

### Implementación sugerida

```javascript
// Check de activación de nodo
const isNodeActive = (node, currentSpec) => {
  if (node.tag === 'universal') return true;
  if (node.tag === currentSpec) return true;
  // Tag de clase padre (warrior activa nodos warrior aunque spec sea berserker)
  if (node.tag === 'warrior' && ['berserker', 'juggernaut'].includes(currentSpec)) return true;
  if (node.tag === 'mage' && ['sorcerer', 'arcanist'].includes(currentSpec)) return true;
  return false;
};
```

### UI sugerida

Los nodos inactivos por tag se muestran levemente desaturados con un ícono de clase/spec en la esquina. Tooltip explica el requisito de activación.

---

## 6. Estructura del Árbol — 7 Ramas

### Tabla de ramas y tags

| Rama | Identidad | Tag Basics | Tag Gameplay | Tag Keystones |
|---|---|---|---|---|
| `fortune` | Economía de run | universal | universal | universal |
| `forge` | Crafting y items | universal | universal | universal |
| `abismo` | Endgame Abismo | universal | universal | universal |
| `war` | Daño, crit, agresión | universal | `berserker` | `berserker` |
| `bulwark` | Defensa, block, thorns | universal | `juggernaut` | `juggernaut` |
| `sorcery` | Burst, volatile, opener | universal | `sorcerer` | `sorcerer` |
| `dominion` | Marca, flow, control | universal | `arcanist` | `arcanist` |

> La rama `abismo` está bloqueada hasta alcanzar Abismo I por primera vez (unlock permanente). Ver documento `design_abyss_bosses.md`.

---

## 7. Nodos por Rama — Detalle Completo

### Rama `fortune` — universal

**Basics (universal):**
1. +X% oro por kill
2. +X% XP ganado
3. +X% drop rate de esencia

**Gameplay (universal):**
4. +X% loot quality global
5. Reducción de costos de crafting
6. +X% gold bonus al hacer prestige

**Keystones (universal):**
7. **Codicia Eterna**: +40% oro ganado, −10% XP ganado. Optimización de run corta de farmeo.
8. **Fortuna del Abismo**: en tiers del Abismo, cada kill tiene chance de dropear una moneda de esencia extra.

---

### Rama `forge` — universal

**Basics (universal):**
1. Reducción de costo de upgrade
2. +1 intento de reroll extra por run (se resetea al prestigiar, no es permanente)
3. Reducción de costo de reforge

**Gameplay (universal):**
4. Chance de no consumir intento de polish al usar
5. Chance de "éxito garantizado" en el próximo upgrade +1, 1 vez por run
6. Affixes de Abismo disponibles antes del unlock de Abismo II (requiere que Abismo II esté desbloqueado en cuenta)

**Keystones (universal):**
7. **Maestro del Yunque**: los items upgraded tienen +5% de stats base adicional por cada nivel de upgrade aplicado.
8. **Forja Sangrienta**: cada crafting fallido en la run actual aumenta 2% la chance de éxito del siguiente intento. Acumulativo, se resetea al prestigiar.

---

### Rama `abismo` — universal (bloqueada hasta Abismo I)

Ver documento `design_abyss_bosses.md` — Sección "Abismo I — Rama de Prestige Abismo" para el detalle completo de esta rama.

**Resumen:**
- Basics: bonuses de stats vs enemigos del Abismo, reducción de affixes enemigos, loot quality en Abismo.
- Gameplay: reducción de affixes en enemigos normales, mayor drop de esencia, chance de corrupción favorable.
- Keystones (universal): Pacto del Abismo, Ojo del Vacío.

---

### Rama `war` — Basics universal / Gameplay y Keystones tag `berserker`

**Basics (universal):**
1. +X% daño físico
2. +X% attack speed
3. +X% crit chance

**Gameplay (tag `berserker`):**
4. Chance pasiva de double strike
5. +X% daño contra enemigos con `armor_shred` activo
6. Reducción del umbral de enrage propio (Berserker activa sus bonuses de low life antes)

**Keystones (tag `berserker`):**
7. **Maestro de Guerra**: cada boss muerto en la run otorga +2% daño permanente hasta el prestige. Acumulativo.
8. **Sed de Sangre**: cuando la vida cae por debajo de 40%, +30% daño y +20% attack speed. Sinergiza directamente con la identidad low life de Berserker.

---

### Rama `bulwark` — Basics universal / Gameplay y Keystones tag `juggernaut`

**Basics (universal):**
1. +X% vida máxima
2. +X% block chance
3. +X% regeneración de vida

**Gameplay (tag `juggernaut`):**
4. Thorns escala con % de armor total
5. Reducción de daño recibido de mecánicas de boss
6. Block tiene chance de reflejar el daño bloqueado al atacante

**Keystones (tag `juggernaut`):**
7. **Fortaleza Eterna**: por cada 1.000 de vida máxima, +1% de reducción de daño recibido. Sin cap.
8. **Muro de Espinas**: al bloquear, el atacante recibe daño equivalente al 100% del daño bloqueado.

---

### Rama `sorcery` — Basics universal / Gameplay y Keystones tag `sorcerer`

**Basics (universal):**
1. +X% daño mágico
2. +X% crit chance mágico
3. Reducción de costo de recursos de habilidades

**Gameplay (tag `sorcerer`):**
4. Los stacks de volatile duran más tiempo
5. El daño de opener está amplificado
6. Chain burst tiene chance de no consumir el stack al activarse

**Keystones (tag `sorcerer`):**
7. **Catálisis**: el primer ataque de cada combate siempre cuenta como opener, sin importar condiciones previas.
8. **Masa Crítica**: al acumular 5 crits consecutivos, el siguiente hit es automáticamente un cataclysm.

---

### Rama `dominion` — Basics universal / Gameplay y Keystones tag `arcanist`

**Basics (universal):**
1. +X% duración de mark
2. +X% daño de mark
3. +X% stacks de flow ganados por acción

**Gameplay (tag `arcanist`):**
4. Mark se aplica más rápido (reducción de ticks para aplicar)
5. Los transfers copian X% adicional de intensidad del mark al nuevo objetivo
6. Los stacks de memory no se pierden al cambiar de enemigo dentro del mismo combate

**Keystones (tag `arcanist`):**
7. **Dominación Total**: cuando un enemigo muere con mark activo, el mark se transfiere al siguiente enemigo con 100% de intensidad original.
8. **Flujo Perpetuo**: el flow nunca decae durante un combate activo. Solo se resetea entre combates.

---

## 8. Curva de Costos por Era

| Tipo de nodo | Costo en PP | PP típicos por run | Runs necesarias |
|---|---|---|---|
| Basic 1–3 | 50–150 PP | Run T10–15: ~200 PP | 1 run por nodo |
| Basic 4–6 | 150–300 PP | Run T15–20: ~400 PP | 1 run por nodo |
| Gameplay 1–2 | 400–700 PP | Run T20–25: ~700 PP | 1–2 runs |
| Gameplay 3 | 700–1.200 PP | Run Abismo I: ~1.000 PP | 1–2 runs |
| Keystone | 2.500–5.000 PP | Run Abismo II: ~2.500 PP | 2–4 runs |
| Sink (×20 niveles) | 300 PP/nivel | Run Abismo III: ~4.000 PP | Largo plazo |

> Los valores numéricos exactos se ajustan por telemetría post-implementación. Esta tabla es la forma de la curva, no los valores finales.

---

## 9. Runs Cortas vs Runs Largas — Economía Diferenciada

Las runs cortas y largas no son la misma actividad con distinto resultado. Tienen economías distintas:

| Tipo de run | Tiers típicos | Óptimo para |
|---|---|---|
| Run corta | T10–15 | Farmeo de oro y esencia para crafting, goals de Codex, testeo de build |
| Run media | T15–25 | PP estables, loot de mid tier, progreso de Codex de familias |
| Run larga | T20–Abismo II+ | PP máximos, loot de alto tier, progreso en Abismo |

Los sigils refuerzan esta diferenciación: `forge` y `dominion` son sigils de run corta/media. `ascend` es el sigil de run larga.

**Objetivo de diseño**: el jugador no debe sentir que una run corta es una "run fallida". Es un tipo de run con objetivos distintos.

---

## 10. Feature de QoL — Nodo Objetivo

El jugador puede fijar un nodo del árbol como objetivo. El juego muestra progreso hacia ese nodo:

```
[ Nodo objetivo: Keystones Berserker — Sed de Sangre ]
[ PP actuales: 2.340 / 5.000                         ]
[ Runs estimadas al ritmo actual: ~3                  ]
```

El ritmo estimado se calcula con el promedio de PP de las últimas 3 runs.

---

## 11. Fuentes de Verdad Sugeridas

```
src/data/prestige.js          → definición de ramas, nodos, tags y costos
src/engine/progression/       → lógica de acumulación de PP y momentum
src/components/PrestigeTab.jsx → UI del árbol y feature de nodo objetivo
```

---

*Documento generado como parte del diseño de IdleRPG. Revisión: Lead GD session 2026-04-15.*


//// DISEÑO DE RARES ENDGAME

# Diseño: Rare como Endgame Crafteable

Fecha: 2026-04-15
Scope: Identidad del rare, diferenciación por rareza, límites de crafting, firma mecánica de upgrade, curva de obsolescencia, interacción con affixes de Abismo.

---

## 1. Filosofía de Diseño

### La identidad del Rare en una oración

> *"El rare es el único item que podés craftear hasta la perfección. No tiene el poder flashy del legendary, pero si tu build sabe lo que necesita, un rare perfecto lo supera."*

Todo el diseño del rare refuerza esta identidad. El legendary se encuentra — lo looteas, lo equipás. El rare se *construye*. Esa es la diferencia experiencial central.

### La jerarquía de poder bruto vs control

En el sistema actual, los legendaries tienen el poder más alto. Eso no cambia. Lo que cambia es que los rares tienen el **control más alto** sobre sus stats. La jerarquía se invierte según el eje:

| Eje | Ganador |
|---|---|
| Poder bruto máximo | Legendary |
| Flexibilidad de crafting | **Rare** |
| Precisión de stats | **Rare** |
| Mecánicas únicas | Legendary |
| Affixes de Abismo | Epic / Legendary |

---

## 2. Identidad por Rareza — Frases de Diseño

Para que el sistema sea legible sin tutorial, cada rareza tiene una identidad clara:

| Rareza | Frase de identidad |
|---|---|
| Common | "Lo que encontrás en el piso" |
| Magic | "Un upgrade rápido, nada más" |
| **Rare** | **"Tu item. Construido por vos."** |
| Epic | "Poder real con algo de flexibilidad" |
| Legendary | "El poder más alto, menos control" |

---

## 3. Tabla de Límites de Crafting por Rareza

| Operación | Common | Magic | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| Upgrade cap | +5 | +7 | **+10** | +10 | +10 |
| Reroll (por item) | 2 | 3 | **10** | 5 | 3 |
| Reforge (por item) | 1 | 2 | **8** | 4 | 3 |
| Polish (por línea) | 3 | 4 | **12** | 6 | 5 |
| Ascend disponible | ✓ | ✓ | ✓ | ✓ | — |
| Affixes de Abismo | — | — | — | ✓ | ✓ |
| Poder legendario | — | — | — | — | ✓ |
| Upgrade escala affixes | — | — | **✓ (+7 a +10)** | — | — |

> El rare tiene los límites de crafting más altos del juego. Su poder no viene de stats base más grandes sino de la capacidad de llevar cada línea al valor exacto que la build necesita.

---

## 4. Firma Mecánica del Rare — Upgrade que Escala Affixes

### Regla

El upgrade en rares funciona de forma diferente a todas las demás rarezas a partir de +7:

```
Rare upgrade +1 a +6  → escala base e implicit (igual que el resto de rarezas)
Rare upgrade +7 a +10 → escala base, implicit Y affixes (exclusivo de rare)
```

Esta mecánica es **exclusiva de rare**. Epic y legendary no escalan affixes con el upgrade, sin excepción.

### Implicación de diseño

Un rare +10 perfectamente crafteado es el item con mayor densidad de stats del juego en términos de control. Cada línea — base, implicit y todos los affixes — está en su valor máximo. El legendary +10 tiene más poder bruto por el poder legendario, pero sus affixes no crecen con el upgrade.

### Fail chance del upgrade (sin cambios hasta +6, ajuste en zona alta)

La curva de fail chance existente aplica hasta +6. En la zona exclusiva del rare (+7 a +10), la fail chance se mantiene igual — el costo adicional viene del multiplicador de precio, no de mayor riesgo de fallo.

```
+7:  39% fail chance  (igual que hoy)
+8:  48% fail chance  (igual que hoy)
+9:  57% fail chance  (igual que hoy)
+10: 66% fail chance  (igual que hoy)
```

> El riesgo ya está en la probabilidad de fallo. No hace falta sumar más fricción en la zona alta.

---

## 5. Costos de Crafting para Rare — Multiplicadores

| Operación | Multiplicador vs costo base | Justificación |
|---|---|---|
| Reroll | ×1.0 | El rare ya tiene más intentos, no hace falta encarecer |
| Reforge | ×1.2 | Levemente más caro por línea — el control tiene un precio |
| Polish | ×0.8 | Más barato — incentiva usar los 12 intentos disponibles |
| Upgrade +1 a +6 | ×1.0 | Igual que hoy |
| Upgrade +7 a +10 | ×1.5 | La zona donde escalan affixes tiene costo real de inversión |

> El polish más barato es intencional. Se quiere que el jugador use todos los intentos disponibles, no que los reserve por costo.

---

## 6. El Rare como Proyecto de Crafting

### Flujo natural de construcción de un rare

```
1. Dropea un rare con buena base y buen implicit
2. Reroll hasta conseguir los affixes correctos (hasta 10 intentos)
3. Reforge las líneas que quedaron con valores bajos (hasta 8 intentos)
4. Polish cada línea hasta el valor máximo (hasta 12 por línea)
5. Upgrade al +10 — en +7 los affixes también empiezan a escalar
6. Resultado: un item con stats exactamente donde la build los necesita
```

Este proceso consume recursos de múltiples runs. Es un proyecto de crafting con arco propio — no una transacción de una sola sesión.

### Comparación práctica vs Legendary

```
Legendary genérico (arma):
  Base:     180 daño
  Implicit: +22% crit damage  ← poder legendario
  Affix 1:  +14% daño          (valor mid, sin polish)
  Affix 2:  +8% attack speed   (valor mid, sin polish)
  Upgrade:  +6

Rare crafteado (misma familia de arma):
  Base:     165 daño            (base menor)
  Implicit: +18% daño físico   (sin poder legendario, pero sólido)
  Affix 1:  +19% daño           (polisheado al máximo)
  Affix 2:  +12% attack speed   (polisheado al máximo)
  Upgrade:  +10                 (affixes también escalados)
```

Para una build que no activa el poder legendario de crit damage, el rare gana en daño total. Para una build Berserker que vive del crit, el legendary gana. Esa es exactamente la decisión que el jugador debe tomar.

---

## 7. Affixes de Abismo y los Rares

### Regla

Los rares **no tienen acceso a affixes de Abismo**. Este pool es exclusivo de epic y legendary.

### Por qué esto no hace al rare obsoleto

Los affixes de Abismo escalan con la profundidad del Abismo. En sus valores iniciales (Abismo I, tiers bajos del pool), un rare perfectamente crafteado con stats base en máximo puede superar a un epic con un affix de Abismo de valor bajo y sin craftear.

### Curva de obsolescencia del rare — intencional

```
Tiers 1–25     → Rare compite directamente con epic y legendary
Abismo I       → Rare sigue siendo viable con crafting óptimo
Abismo II+     → Rare empieza a quedar atrás vs epic/legendary con affixes de Abismo escalados
```

Esta curva es un arco de juego: el jugador invierte en su rare, lo usa durante una parte significativa del juego, y eventualmente lo reemplaza cuando los affixes de Abismo superan lo que el crafting base puede alcanzar. El reemplazo fue *ganado* — no fue un descarte en tier 10.

---

## 8. Cuándo el Rare es BiS

Un rare perfectamente crafteado puede ser Best in Slot en las siguientes condiciones:

- La build **no activa** el poder legendario del legendary disponible en ese slot
- El jugador está en **Abismo I o antes** (donde los affixes de Abismo no superan aún los stats crafteados)
- La build necesita **dos affixes muy específicos** que el legendary genérico disponible no tiene en combinación
- El jugador prioriza **consistencia de stats** sobre potencial máximo de pico

Estas condiciones son reales para jugadores ARPG con builds definidas. El casual va a usar el legendary flashy. El jugador que conoce su build va a craftear el rare.

---

## 9. Rangos de Valores — Principio de Diseño

Para que la promesa de "rare BiS" sea real, los affixes base necesitan rangos de valores suficientemente amplios como para que un rare polisheado al máximo supere el valor base de un legendary sin polish.

**Regla de diseño para los rangos de affixes:**

```
Valor mínimo de affix en rare polisheado al máximo
  > Valor promedio del mismo affix en legendary sin polish
```

Esto garantiza que el esfuerzo de craftear tenga recompensa matemática real. Los valores exactos se ajustan por telemetría, pero la forma de la curva es esta.

---

## 10. Feature Futura — Pool de Affixes Exclusivos de Rare (Backlog)

No implementar en esta versión. Registrar como expansión futura.

**Concepto**: affixes condicionales que solo existen en rares — modificadores muy específicos que amplifican mecánicas exactas de build y son BiS solo si la build los activa consistentemente.

Ejemplos de dirección:
- `Filo Calculado`: +X% daño si el hit anterior fue un crit
- `Cadencia Perfecta`: cada 3er ataque consecutivo hace +X% daño
- `Tempo`: +X% attack speed si no recibiste daño en los últimos 2 ticks

**Cuándo implementar**: cuando el juego tenga jugadores que ya dominan el sistema de crafting base y necesitan una capa adicional de profundidad.

---

## 11. Fuentes de Verdad Sugeridas

```
src/engine/crafting/craftingEngine.js   → límites de crafting por rareza, lógica de upgrade con scaling de affixes
src/constants/craftingCosts.js          → multiplicadores de costo por rareza y operación
src/data/items.js                       → rangos de valores de affixes por rareza
```

### Cambio puntual en craftingEngine.js

Agregar condición en la función de upgrade:

```javascript
// Pseudocódigo
function applyUpgrade(item, currentLevel) {
  const scalesAffixes = item.rarity === 'rare' && currentLevel >= 7;
  
  // escala base e implicit siempre
  item.baseValue = scaleBase(item.baseValue);
  item.implicit = scaleImplicit(item.implicit);
  
  // escala affixes solo en rare +7 a +10
  if (scalesAffixes) {
    item.affixes = item.affixes.map(affix => scaleAffix(affix));
  }
  
  return item;
}
```

---

*Documento generado como parte del diseño de IdleRPG. Revisión: Lead GD session 2026-04-15.*


/// SINKS DE LATE DE MAGO

# Diseño: Sinks de Late Game para Mage

Fecha: 2026-04-15
Scope: Tres sinks de talento de late game para Mage, paridad con Warrior, identidad de escalado por clase y subclase.

---

## 1. Contexto y Problema

Warrior tiene tres sinks de late game con 20 niveles cada uno:
- `warrior_iron_mastery`
- `berserker_blood_mastery`
- `juggernaut_eternal_bastion`

Mage no tiene ningún equivalente. Un jugador que llega al late game con Mage se queda sin progresión horizontal de talentos antes que un jugador Warrior. En un juego de retención diaria, eso es una razón concreta para dejar de jugar o cambiar de clase.

---

## 2. Filosofía de Diseño

### Estructura idéntica a Warrior
Los tres sinks de Mage siguen exactamente la misma estructura que los de Warrior:
- 20 niveles por sink
- Flat acumulativo por nivel (sin hitos especiales)
- Se compran con talent points del árbol de talentos

La consistencia entre clases es intencional. El jugador no necesita aprender un sistema nuevo.

### Identidad distinta a Warrior
Lo que cambia es **qué escala**:
- **Warrior escala stats de combate** — números que suben de forma lineal y predecible.
- **Mage escala mecánicas de estado** — el valor del sink depende de qué tan bien el jugador activa esas mecánicas.

Esta asimetría es intencional y refleja la fantasía de cada clase:

> Warrior: *"cada nivel soy más fuerte"*
> Mage: *"cada nivel soy más eficiente cuando juego bien"*

**Nota para implementación**: esta diferencia no es un problema de balance a corregir. Es la expresión en los sinks de la misma asimetría que existe entre las clases en todo el sistema.

---

## 3. Distribución de Sinks

Uno general de Mage + uno por subclase, igual que Warrior:

| Sink | Scope | Equivalente Warrior |
|---|---|---|
| `mage_arcane_mastery` | Mage general (Sorcerer y Arcanist) | `warrior_iron_mastery` |
| `sorcerer_volatile_mastery` | Subclase Sorcerer | `berserker_blood_mastery` |
| `arcanist_mark_mastery` | Subclase Arcanist | `juggernaut_eternal_bastion` |

---

## 4. Detalle de Cada Sink

### `mage_arcane_mastery` — Mage general

**Identidad**: el dominio del poder arcano en su forma más pura. Escala el daño mágico base y la capacidad de penetrar resistencias. Útil para Sorcerer y Arcanist por igual.

**Qué escala por nivel:**

| Bonus | Por nivel | A nivel 20 |
|---|---|---|
| Daño mágico | +0.8% | +16% total |
| Penetración mágica | +0.3% | +6% total |

> La penetración mágica ignora un % de la resistencia mágica del enemigo. Es el equivalente funcional de `iron_mastery` para Mage — un stat que escala bien en todos los contextos y que se siente especialmente en el Abismo contra enemigos con resistencias altas.

---

### `sorcerer_volatile_mastery` — Subclase Sorcerer

**Identidad**: el Sorcerer vive del volatile casting, del burst y de las cadenas. Este sink escala exactamente esas mecánicas. El segundo bonus escala con stacks activos — tiene más valor cuanto mejor el jugador gestiona su rotación.

**Qué escala por nivel:**

| Bonus | Por nivel | A nivel 20 |
|---|---|---|
| Daño de volatile casting | +1% | +20% total |
| Daño de chain burst por stack activo | +0.5% | +10% total |

> El bonus de chain burst es proporcional a los stacks activos en el momento del burst. Un Sorcerer que no gestiona bien sus stacks siente menos el sink. Uno que los maximiza siente cada nivel. Esto crea un incentivo de skill expression sin cambiar la mecánica base.

---

### `arcanist_mark_mastery` — Subclase Arcanist

**Identidad**: el Arcanist controla, marca y transfiere. Este sink escala la profundidad de ese control — tanto el daño amplificado de mark como la acumulación de memory, el recurso más específico del Arcanist.

**Qué escala por nivel:**

| Bonus | Por nivel | A nivel 20 |
|---|---|---|
| Daño amplificado de mark | +1% | +20% total |
| Stacks de memory ganados por acción | +0.4% | +8% total |

> El daño amplificado de mark es el bonus de daño que aplica cuando el enemigo tiene mark activo. El bonus de memory escala la acumulación del recurso exclusivo del Arcanist. Solo el Arcanist siente este sink en profundidad — exactamente como `eternal_bastion` es irremplazable para Juggernaut.

---

## 5. Tabla de Paridad Completa — Warrior y Mage

| Sink | Clase/Spec | Qué escala | Niveles |
|---|---|---|---|
| `warrior_iron_mastery` | Warrior general | Armor y reducción de daño | 20 |
| `berserker_blood_mastery` | Berserker | Leech y daño low life | 20 |
| `juggernaut_eternal_bastion` | Juggernaut | Block y thorns | 20 |
| `mage_arcane_mastery` | Mage general | Daño mágico y penetración mágica | 20 |
| `sorcerer_volatile_mastery` | Sorcerer | Volatile casting y chain burst | 20 |
| `arcanist_mark_mastery` | Arcanist | Mark y memory | 20 |

Seis sinks, dos clases, tres por clase. Paridad total en estructura, identidad distinta en contenido.

---

## 6. Fuente de Verdad Sugerida

```
src/data/talentSinks.js
```

Agregar los tres sinks nuevos siguiendo la misma estructura de datos que los sinks de Warrior existentes. Los tres sinks de Mage son elegibles solo cuando `playerClass === 'mage'`, con subclase correspondiente para los dos de spec.

```javascript
// Estructura de referencia — adaptar al formato existente en talentSinks.js
{
  id: 'mage_arcane_mastery',
  classReq: 'mage',
  specReq: null, // null = toda la clase
  maxLevel: 20,
  bonusPerLevel: [
    { stat: 'magicDamage', value: 0.008 },       // +0.8% por nivel
    { stat: 'magicPenetration', value: 0.003 },   // +0.3% por nivel
  ]
},
{
  id: 'sorcerer_volatile_mastery',
  classReq: 'mage',
  specReq: 'sorcerer',
  maxLevel: 20,
  bonusPerLevel: [
    { stat: 'volatileDamage', value: 0.01 },      // +1% por nivel
    { stat: 'chainBurstPerStack', value: 0.005 }, // +0.5% por nivel por stack
  ]
},
{
  id: 'arcanist_mark_mastery',
  classReq: 'mage',
  specReq: 'arcanist',
  maxLevel: 20,
  bonusPerLevel: [
    { stat: 'markAmpDamage', value: 0.01 },       // +1% por nivel
    { stat: 'memoryStackGain', value: 0.004 },    // +0.4% por nivel
  ]
}
```

> Los valores numéricos exactos se ajustan por telemetría post-implementación. La forma de la curva es la que importa ahora.

---

*Documento generado como parte del diseño de IdleRPG. Revisión: Lead GD session 2026-04-15.*


