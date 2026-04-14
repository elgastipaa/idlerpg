# Mage Class Design (Idle ARPG - Single Target Flow System)

## Objetivo

Diseñar una clase Mage que funcione en un sistema single-target sin AoE real,
pero que genere sensación de limpieza y control mediante **flujo entre enemigos**.

El Mage no debe pegar a múltiples enemigos al mismo tiempo.
Debe:

- preparar enemigos
- transferir estados
- encadenar ventajas entre kills
- escalar con control y consistencia

---

# CORE IDENTITY

El Mage se basa en:

- daño condicionado (marks, estados)
- flujo entre enemigos (transfer, opener)
- consistencia vs volatilidad
- builds de setup, control y ramp

No usa AoE directo.

---

# MAGE BASE TREE (8 nodes)

## BASE NODES (3)

### 1. Arcane Power
- Increase Spell Damage

---

### 2. Focus
- Increase Critical Chance

---

### 3. Channeling
- Increase Multi-Hit Chance (spell echo flavor)

---

## GAMEPLAY NODES (3)

### 4. Arcane Echo
- Extra hits deal reduced damage
- Extra hits apply on-hit effects

**Purpose**
- Enables multi-hit builds
- Enables bleed / mark stacking

---

### 5. Elemental Mark
- Hitting an enemy applies a Mark
- Marked enemies take increased damage

**Purpose**
- Core setup mechanic
- Enables target preparation

---

### 6. Arcane Flow
- Killing an enemy grants a temporary damage bonus
- Bonus applies to next enemy

**Purpose**
- Introduces flow between enemies
- Enables chain-kill builds

---

## KEYSTONES (2)

### 7. Overchannel
- Multi-hit is stronger
- Each extra hit reduces total damage slightly

**Purpose**
- Enables aggressive multi-hit builds

**Trade-off**
- Lower efficiency per hit

---

### 8. Perfect Cast
- Multi-hit disabled
- Damage becomes consistent and near max range

**Purpose**
- Enables consistent, non-RNG builds

**Trade-off**
- No synergy with multi-hit or on-hit

---

# ELEMENTALIST (Specialization) — 8 nodes

## IDENTITY

- burst damage
- unstable power
- strong openers
- flow via kill chaining

---

## BASE NODES (3)

### 1. Elemental Power
- Increase Spell Damage

---

### 2. Volatility
- Increase Critical Damage

---

### 3. Surge
- Increase damage to fresh targets

---

## GAMEPLAY NODES (3)

### 4. Chain Burst
- Killing an enemy grants a strong bonus to next hit

**Purpose**
- Strong opener chaining
- Simulates burst AoE via flow

---

### 5. Unstable Power
- High damage variance
- Increased max damage, lower minimum

**Purpose**
- High-risk burst builds

---

### 6. Overload
- Big hits apply stronger marks
- Marks amplify next hit significantly

**Purpose**
- Setup → payoff gameplay

---

## KEYSTONES (2)

### 7. Cataclysm
- First hit after a kill deals massive bonus damage
- Reduced sustained damage

**Purpose**
- Chain-kill burst fantasy

**Trade-off**
- Weak in long boss fights

---

### 8. Volatile Casting
- Crits massively increase next hit
- Non-crits reduce next hit power

**Purpose**
- High variance burst builds

**Trade-off**
- Inconsistent output

---

# ARCANIST (Specialization) — 8 nodes

## IDENTITY

- control
- consistency
- ramp over time
- strong state transfer

---

## BASE NODES (3)

### 1. Precision
- Increase Critical Chance

---

### 2. Efficiency
- Increase sustained damage

---

### 3. Control
- Increase duration of applied effects

---

## GAMEPLAY NODES (3)

### 4. Mark Transfer
- When a marked enemy dies, the next enemy starts marked

**Purpose**
- Core flow mechanic
- Enables consistent setup

---

### 5. Temporal Flow
- Damage increases over time on the same target

**Purpose**
- Ramp builds
- Strong vs bosses

---

### 6. Spell Memory
- Repeated hits increase effect strength (mark, DoT, etc.)

**Purpose**
- Focus-based builds

---

## KEYSTONES (2)

### 7. Time Loop
- Effects repeat at reduced strength

**Purpose**
- Extends value of hits and effects

**Trade-off**
- Lower peak damage

---

### 8. Absolute Control
- Marked enemies take much more damage
- Unmarked enemies take less damage

**Purpose**
- Pure setup gameplay

**Trade-off**
- Requires correct targeting flow

---

# DESIGN SUMMARY

This Mage design achieves:

- No AoE needed
- Flow between enemies
- Multiple build archetypes:
  - burst chain
  - ramp
  - multi-hit
  - control
  - consistent caster

---

# CORE DESIGN PRINCIPLE

Mage does not clear by hitting multiple enemies.

Mage clears by:

> "carrying advantage from one enemy into the next"

---

# IMPLEMENTATION NOTES

System must support:

- on-hit effects
- state application (mark, bleed, etc.)
- state transfer on kill
- temporary buffs (momentum)
- multi-hit resolution per tick
- conditional damage (marked enemies, fresh targets)

Avoid:

- multi-target simulation
- AoE damage systems
- complex targeting logic

---

# FINAL GOAL

The player should feel:

- "I prepared that enemy"
- "I chained that kill"
- "my next hit matters"

Not:

- "I hit everything at once"