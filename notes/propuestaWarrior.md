You are implementing a simplified but high-impact talent system for an idle ARPG.

The goal is to design a clean, scalable, mobile-friendly class system with:

* low complexity
* strong build identity
* meaningful decisions
* compatibility with a tick-based combat system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

* Each tree must have EXACTLY 8 nodes:

  * 3 base stat nodes
  * 3 gameplay nodes (build-defining)
  * 2 keystones (rule-changing)

* Nodes must:

  * be easy to understand
  * have strong impact
  * avoid minor % clutter
  * support multiple build archetypes

* Keystones must:

  * change gameplay rules
  * create trade-offs
  * alter stat evaluation

* The system must remain readable for casual players

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLASS: WARRIOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### BASE NODES (3)

1. Physical Training

* Increase Physical Damage

2. Battle Hardened

* Increase Max HP
* Increase Armor

3. Precision Strikes

* Increase Critical Chance

---

### GAMEPLAY NODES (3)

4. Heavy Impact

* First hit against an enemy deals significantly increased damage
* Multi-hit deals reduced damage

Purpose:

* Enables heavy-hit / boss killer builds
* Discourages multi-hit synergy

---

5. Blood Strikes

* Hits apply Bleed
* Bleed deals increased damage

Purpose:

* Enables bleed / DoT builds
* Synergizes with multi-hit and sustained combat

---

6. Combat Flow

* Consecutive hits against the same target increase damage
* Bonus resets when switching targets

Purpose:

* Enables sustained DPS builds
* Rewards focus on a single enemy (bossing)

---

### KEYSTONES (2)

7. Iron Conversion

* A percentage of Armor contributes to Physical Damage

Purpose:

* Enables tank/damage hybrid builds
* Makes Armor an offensive stat

Trade-off:

* Reduces effectiveness of Crit scaling (implementation choice)

---

8. Crushing Weight

* Multi-hit is disabled
* First hit damage is massively increased

Purpose:

* Pure heavy-hit build identity

Trade-off:

* Removes all multi-hit/on-hit synergy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLASS: BERSERKER (Specialization)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### BASE NODES (3)

1. Savage Power

* Increase Critical Damage

2. Bloodlust

* Increase Life Leech

3. Frenzy

* Increase Multi-Hit Chance

---

### GAMEPLAY NODES (3)

4. Last Stand

* Gain increased damage when below a health threshold

Purpose:

* Core low-life build enabler

---

5. Frenzy Engine

* Multi-hits grant temporary damage increase

Purpose:

* Enables aggressive multi-hit scaling builds

---

6. Execution

* Increased damage against low HP enemies
* Increased execute threshold

Purpose:

* Boss finisher / execute builds

---

### KEYSTONES (2)

7. Last Breath

* Massive damage scaling at low HP

Trade-off:

* Increased damage taken or reduced defenses

Purpose:

* High-risk, high-reward playstyle

---

8. Frenzied Chain

* Hits can chain into additional hits
* Each additional hit reduces defense temporarily

Purpose:

* Explosive multi-hit builds

Trade-off:

* Defensive instability

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLASS: JUGGERNAUT (Specialization)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### BASE NODES (3)

1. Iron Body

* Increase Armor

2. Unbreakable

* Increase Max HP

3. Recovery

* Increase Health Regeneration

---

### GAMEPLAY NODES (3)

4. Iron Core

* A percentage of Armor contributes to damage

Purpose:

* Core Juggernaut scaling mechanic

---

5. Fortress

* Blocking or mitigating damage increases next hit damage

Purpose:

* Defense converts into offense

---

6. Spiked Defense

* Reflect a portion of damage taken

Purpose:

* Enables retaliation builds

---

### KEYSTONES (2)

7. Unmoving Mountain

* Massive increase to defense
* Significant reduction to damage output

Purpose:

* Pure tank build

---

8. Titanic Momentum

* Gain stacking damage and defense over time while maintaining high HP
* Lose stacks when taking heavy damage

Purpose:

* Ramp-based push build

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

* Each node should be defined as data (not hardcoded logic)

* Each node must support:

  * stat modifiers
  * conditional modifiers
  * event-based triggers (optional)
  * rule overrides (for keystones)

* The system must integrate with:

  * tick-based combat
  * multi-hit logic
  * on-hit effects
  * bleed / DoT system
  * damage calculation pipeline

* Nodes should be easy to display in a mobile UI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN GOAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This system should enable:

* heavy-hit builds
* bleed builds
* multi-hit builds
* tank builds
* low-life builds
* sustain builds

With only 8 nodes per tree.

Focus on:

* clarity
* strong identity
* minimal complexity
* maximum build diversity
