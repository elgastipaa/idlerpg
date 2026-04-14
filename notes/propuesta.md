You are a senior ARPG systems designer and gameplay engineer.

Your task is to analyze and propose an implementation-ready design for a Warrior class (with Berserker and Juggernaut specializations) in an idle ARPG with a tick-based combat system.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Game type:

* Idle ARPG
* Mobile-first
* Session length: 5–20 minutes
* Combat runs on a fixed tick system (no real attack speed timing)
* No multiplayer yet
* Small dev team (solo or near solo)
* Must remain readable and accessible to casual players

Design goals:

* Avoid PoE-level complexity
* Avoid MMO-style system bloat
* Create meaningful build diversity
* Avoid “monocarril” (everything becoming just more DPS)
* Enable long-term replayability (months/years)
* Generate “moments” (drops, builds, milestones)

Current systems already exist:

* loot with affixes
* crafting (reroll, reforge, upgrade)
* talents
* prestige
* basic combat

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIGH LEVEL DESIGN GOAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design a COMPLETE final conceptual system for:

* Warrior (base class)
* Berserker (offensive specialization)
* Juggernaut (defensive specialization)

The system must:

* support multiple distinct builds
* create real trade-offs
* be compatible with a tick-based combat system
* be implementable incrementally
* remain readable for casual players
* scale into future content (new classes, damage types)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE DESIGN RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Do NOT design for maximum complexity
2. Prefer fewer systems with stronger identity
3. Every stat must change gameplay, not just numbers
4. Every build must be good at something and bad at something
5. Keystones must change rules, not just increase stats
6. Items must be understandable at a glance
7. The system must support both:

   * casual players (clarity, simplicity)
   * hardcore players (synergy depth)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU MUST DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide a FULL SYSTEM DESIGN including:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CORE STAT SYSTEM
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Define:

* all offensive stats
* all defensive stats
* utility stats

Include:

* Physical Damage
* Crit
* Multi-hit / tempo system (tick-based)
* Bleed / damage over time (physical)
* Life, Armor, Sustain
* Optional systems (block, guard, retaliation)

Explain:

* what each stat does
* why it exists
* what builds it enables

Avoid:

* unnecessary PoE-style stat bloat

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. DAMAGE MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design:

* Physical damage system (mandatory)
* Damage over time (bleed or equivalent)
* Multi-hit system adapted to tick combat
* Optional future support for elemental/magic damage (conceptual only)

Explain:

* how hits work per tick
* how multi-hit works
* how on-hit effects work
* how DoT interacts with hits

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. CLASS ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Define structure:

Warrior (base class):

* general stats
* shared identity
* limited keystones (1–2 max)

Berserker:

* offensive identity
* high risk / high reward
* rage, low-life, chaining, bleed aggression

Juggernaut:

* defensive identity
* armor scaling
* block/guard, retaliation, slow power builds

Explain:

* what goes in base vs specialization
* why

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. KEYSTONE SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design:

* 2 keystones for Warrior (general)
* 3–4 keystones for Berserker
* 3–4 keystones for Juggernaut

Each keystone must:

* change gameplay rules
* introduce trade-offs
* alter how items are evaluated

For each keystone:

* describe effect
* describe build fantasy
* describe downside

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. BUILD ARCHETYPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Define at least:

Warrior builds:

* heavy hit
* balanced bruiser
* bleed
* multi-hit/on-hit
* armor-scaling

Berserker builds:

* glass cannon
* low-life rage
* execute boss killer
* bleed frenzy
* leech sustain

Juggernaut builds:

* tank push
* thorns/retaliation
* armor to damage
* slow crusher
* regen wall

For each:

* what it excels at
* what it is bad at
* what stats it uses

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. ITEM SYSTEM DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design:

Weapon bases:

* greataxe
* greatsword
* mace/hammer
  (each with identity)

Armor bases:

* heavy plate
* hybrid armor
* offensive armor

Affix system:

* fewer affixes, higher impact
* no more than 2–3 affixes early
* 3–4 only for endgame

Provide:

* list of core affixes
* explanation of each

Legendary system:

* 2 affixes + 1 power (preferred)
  OR
* 3 affixes + 1 power (endgame)

Explain:

* how items drive builds
* how to keep items readable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. ON-HIT & DOT SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design:

* on-hit effects (bleed, leech, triggers)
* DoT stacking behavior
* synergy with multi-hit

Explain:

* how this creates new builds
* how to avoid pure DPS scaling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. CASUAL FRIENDLY DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Explain:

* how to keep UI readable
* how to make items understandable
* how to guide builds without forcing them
* how to ensure constant progression

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. IMPLEMENTATION ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Propose phases:

Phase 1:

* minimal viable stat system
* basic builds
* simple item system

Phase 2:

* keystones
* deeper synergies
* new enemy roles

Phase 3:

* defensive layers
* advanced interactions

Phase 4:

* future-proofing (damage types, new class)

Each phase must:

* be realistic for a solo dev
* be testable
* avoid overengineering

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. WHAT NOT TO IMPLEMENT YET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Explicitly list systems to avoid for now:

* excessive damage types
* complex resist systems
* too many currencies
* overcomplicated affix pools
* MMO-style systems

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respond with:

1. System overview
2. Detailed breakdown of each section
3. Clear reasoning for decisions
4. Trade-offs and risks
5. Implementation-friendly notes

Be practical, not theoretical.
Focus on systems that will actually work in a small-team idle ARPG.
