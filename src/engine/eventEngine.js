import { EVENTS } from "../data/events";

const MAX_ACTIVE_EVENTS = 3;

// ============================================================
// STACKING — no stackear mismo tipo, cap de 3 simultáneos
// ============================================================
export function addActiveEvent(activeEvents, newEvent) {
  const sameType = activeEvents.filter(e => e.type === newEvent.type);
  let events = [...activeEvents];

  if (sameType.length > 0) {
    const weakest = sameType.reduce((a, b) => a.value < b.value ? a : b);
    if (newEvent.value > weakest.value) {
      events = events.filter(e => e !== weakest);
    } else {
      return events;
    }
  }

  if (events.length >= MAX_ACTIVE_EVENTS) {
    const weakest = events.reduce((a, b) => a.value < b.value ? a : b);
    events = events.filter(e => e !== weakest);
  }

  return [...events, newEvent];
}

// ============================================================
// PROCESS — dispara eventos por trigger, máximo 1 por llamada
// ============================================================
export function processEvents(trigger, state) {
  const tier = state.combat.currentTier || 1;

  const eligible = EVENTS.filter(e =>
    e.trigger === trigger && e.minTier <= tier
  );

  if (!eligible.length) {
    return {
      newPlayer: state.player,
      newActiveEvents: state.combat.activeEvents || [],
      logs: [],
    };
  }

  // Weighted pick — 1 evento por trigger
  const totalChance = eligible.reduce((sum, e) => sum + e.chance, 0);
  let roll = Math.random() * totalChance;
  let chosen = null;
  for (const e of eligible) {
    roll -= e.chance;
    if (roll <= 0) { chosen = e; break; }
  }

  if (!chosen || Math.random() > chosen.chance) {
    return {
      newPlayer: state.player,
      newActiveEvents: state.combat.activeEvents || [],
      logs: [],
    };
  }

  let newPlayer = { ...state.player };
  let newActiveEvents = [...(state.combat.activeEvents || [])];
  const logs = [];

  const { type, value, duration, message } = chosen.effect;

  // Instantáneos
  if (!duration) {
    if (type === "goldBonus")    newPlayer.gold    = (newPlayer.gold    || 0) + value;
    if (type === "essenceBonus") newPlayer.essence = (newPlayer.essence || 0) + value;
    if (type === "heal") {
      const healAmt = Math.floor(newPlayer.maxHp * value);
      newPlayer.hp  = Math.min(newPlayer.maxHp, (newPlayer.hp || 0) + healAmt);
    }
    if (type === "lootDrop") {
      newPlayer.nextLootBonus = (newPlayer.nextLootBonus || 0) + value;
    }
  }

  // Temporales
  const temporalTypes = ["curse_damage", "curse_gold", "xpBonus", "goldBonus", "blessing", "rarityBonus", "essenceBonus"];
  if (duration && temporalTypes.includes(type)) {
    newActiveEvents = addActiveEvent(newActiveEvents, {
      id: chosen.id, type, value, ticksLeft: duration,
    });
  }

  logs.push(`✨ ${chosen.name}: ${message}`);
  return { newPlayer, newActiveEvents, logs };
}

// ============================================================
// APPLY — aplica modificadores de eventos activos al TICK
// ============================================================
export function applyActiveEvents(state) {
  const active = state.combat.activeEvents || [];
  const mods = {
    damageMult:  1,
    goldMult:    1,
    xpMult:      1,
    essenceMult: 1,
    lootBonus:   0,
    rarityBonus: 0,
    regenMult:   1,
  };
  const remaining = [];

  for (const ev of active) {
    switch (ev.type) {
      case "curse_damage":  mods.damageMult  *= (1 - ev.value); break;
      case "curse_gold":    mods.goldMult    *= (1 - ev.value); break;
      case "xpBonus":       mods.xpMult      *= (1 + ev.value); break;
      case "goldBonus":     mods.goldMult    *= (1 + ev.value); break;
      case "essenceBonus":  mods.essenceMult *= (1 + ev.value); break;
      case "rarityBonus":   mods.rarityBonus += ev.value;       break;
      case "lootDrop":      mods.lootBonus   += ev.value;       break;
      case "blessing":
        mods.damageMult  *= (1 + ev.value);
        mods.goldMult    *= (1 + ev.value);
        mods.xpMult      *= (1 + ev.value);
        mods.regenMult   *= (1 + ev.value);
        break;
    }
    if (ev.ticksLeft > 1) remaining.push({ ...ev, ticksLeft: ev.ticksLeft - 1 });
  }

  return { mods, remaining };
}