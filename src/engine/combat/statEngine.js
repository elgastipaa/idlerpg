// Fuente única de verdad para stats del jugador.
// Futuro: joyas, sets, mapas hookean acá agregando modificadores.

const CRIT_CAP = 0.75;
const ATTACK_SPEED_CAP = 0.7;
const MULTI_HIT_CAP = 0.45;
const STATUS_CHANCE_CAP = 0.8;

export function calcStats(player) {
  const eq     = player.equipment || {};
  const weapon = eq.weapon;
  const armor  = eq.armor;
  const prestige = player.prestigeBonuses || {};
  const codex = player.codexBonuses || {};

  const eqFlatDmg  = (weapon?.bonus?.damage     || 0) + (armor?.bonus?.damage     || 0);
  const eqFlatDef  = (weapon?.bonus?.defense    || 0) + (armor?.bonus?.defense    || 0);
  const eqFlatCrit = (weapon?.bonus?.critChance || 0) + (armor?.bonus?.critChance || 0);
  const eqFlatGold = (weapon?.bonus?.goldBonus  || 0) + (armor?.bonus?.goldBonus  || 0);
  const eqGoldPct  = (weapon?.bonus?.goldBonusPct || 0) + (armor?.bonus?.goldBonusPct || 0);
  const eqXpPct    = (weapon?.bonus?.xpBonus    || 0) + (armor?.bonus?.xpBonus    || 0);
  const eqFlatHp   = (weapon?.bonus?.healthMax  || 0) + (armor?.bonus?.healthMax  || 0);
  const eqRegen    = (weapon?.bonus?.healthRegen || 0) + (armor?.bonus?.healthRegen || 0);
  const eqAttackSpeed = (weapon?.bonus?.attackSpeed || 0) + (armor?.bonus?.attackSpeed || 0);
  const eqLifesteal = (weapon?.bonus?.lifesteal || 0) + (armor?.bonus?.lifesteal || 0);
  const eqDodgeChance = (weapon?.bonus?.dodgeChance || 0) + (armor?.bonus?.dodgeChance || 0);
  const eqBlockChance = (weapon?.bonus?.blockChance || 0) + (armor?.bonus?.blockChance || 0);
  const eqCritDamage = (weapon?.bonus?.critDamage || 0) + (armor?.bonus?.critDamage || 0);
  const eqCritOnLowHp = (weapon?.bonus?.critOnLowHp || 0) + (armor?.bonus?.critOnLowHp || 0);
  const eqDamageOnKill = (weapon?.bonus?.damageOnKill || 0) + (armor?.bonus?.damageOnKill || 0);
  const eqThorns = (weapon?.bonus?.thorns || 0) + (armor?.bonus?.thorns || 0);
  const eqEssenceBonus = (weapon?.bonus?.essenceBonus || 0) + (armor?.bonus?.essenceBonus || 0);
  const eqLootBonus = (weapon?.bonus?.lootBonus || 0) + (armor?.bonus?.lootBonus || 0);
  const eqLuck = (weapon?.bonus?.luck || 0) + (armor?.bonus?.luck || 0);
  const eqLegacyCooldownReduction = (weapon?.bonus?.cooldownReduction || 0) + (armor?.bonus?.cooldownReduction || 0);
  const eqLegacySkillPower = (weapon?.bonus?.skillPower || 0) + (armor?.bonus?.skillPower || 0);
  const eqMultiHitChance = (weapon?.bonus?.multiHitChance || 0) + (armor?.bonus?.multiHitChance || 0);
  const eqBleedChance = (weapon?.bonus?.bleedChance || 0) + (armor?.bonus?.bleedChance || 0);
  const eqBleedDamage = (weapon?.bonus?.bleedDamage || 0) + (armor?.bonus?.bleedDamage || 0);
  const eqFractureChance = (weapon?.bonus?.fractureChance || 0) + (armor?.bonus?.fractureChance || 0);
  const eqMarkChance = (weapon?.bonus?.markChance || 0) + (armor?.bonus?.markChance || 0);
  const eqMarkEffectPerStack = (weapon?.bonus?.markEffectPerStack || 0) + (armor?.bonus?.markEffectPerStack || 0);

  const battleHardened = Math.max(0, player.battleHardened || 0);
  const heavyImpact = Math.max(0, player.heavyImpact || 0);
  const bloodStrikes = Math.max(0, player.bloodStrikes || 0);
  const combatFlow = Math.max(0, player.combatFlow || 0);
  const ironConversion = Math.max(0, player.ironConversion || 0);
  const crushingWeight = Math.max(0, player.crushingWeight || 0);
  const frenziedChain = Math.max(0, player.frenziedChain || 0);
  const bloodDebt = Math.max(0, player.bloodDebt || 0);
  const lastBreath = Math.max(0, player.lastBreath || 0);
  const execution = Math.max(0, player.execution || 0);
  const ironCore = Math.max(0, player.ironCore || 0);
  const fortress = Math.max(0, player.fortress || 0);
  const unmovingMountain = Math.max(0, player.unmovingMountain || 0);
  const titanicMomentum = Math.max(0, player.titanicMomentum || 0);
  const arcaneEcho = Math.max(0, player.arcaneEcho || 0);
  const arcaneMark = Math.max(0, player.arcaneMark || 0);
  const arcaneFlow = Math.max(0, player.arcaneFlow || 0);
  const overchannel = Math.max(0, player.overchannel || 0);
  const perfectCast = Math.max(0, player.perfectCast || 0);
  const freshTargetDamage = Math.max(0, player.freshTargetDamage || 0);
  const chainBurst = Math.max(0, (player.chainBurst || 0) + (prestige.chainBurst || 0) + (codex.chainBurst || 0));
  const unstablePower = Math.max(0, player.unstablePower || 0);
  const overload = Math.max(0, player.overload || 0);
  const baseVolatileCasting = Math.max(0, player.volatileCasting || 0);
  const controlMastery = Math.max(0, player.controlMastery || 0);
  const markTransfer = Math.max(0, player.markTransfer || 0);
  const temporalFlow = Math.max(0, player.temporalFlow || 0);
  const spellMemory = Math.max(0, player.spellMemory || 0);
  const timeLoop = Math.max(0, player.timeLoop || 0);
  const absoluteControl = Math.max(0, player.absoluteControl || 0);
  const baseCataclysm = Math.max(0, player.cataclysm || 0);
  const hasVolatilityCore = unstablePower > 0 || baseVolatileCasting > 0 || baseCataclysm > 0;
  const volatileCasting = Math.max(
    0,
    baseVolatileCasting + (hasVolatilityCore ? (prestige.volatileCasting || 0) + (codex.volatileCasting || 0) : 0)
  );
  const cataclysm = Math.max(
    0,
    baseCataclysm + (hasVolatilityCore ? (prestige.cataclysm || 0) + (codex.cataclysm || 0) : 0)
  );
  const isMage = player.class === "mage";
  const effectiveControlMastery = controlMastery + (prestige.controlMastery || 0) + (codex.controlMastery || 0);
  const effectiveFreshTargetDamage = freshTargetDamage + (prestige.freshTargetDamage || 0) + (codex.freshTargetDamage || 0);

  const battleHardenedDefenseMult = 1 + battleHardened * 0.012;
  const battleHardenedHpMult = 1 + battleHardened * 0.01;
  let defense = Math.max(0, Math.floor(
    (player.baseDefense + eqFlatDef + (player.flatDefense || 0) + (prestige.flatDefense || 0)) *
      (1 + (player.defensePct || 0) + (prestige.defensePct || 0) + (codex.defensePct || 0)) *
      battleHardenedDefenseMult *
      (1 + unmovingMountain * 0.18)
  ));
  const armorAsDamage =
    (ironConversion > 0 ? Math.floor(defense * (0.08 + ironConversion * 0.06)) : 0) +
    (ironCore > 0 ? Math.floor(defense * (0.02 + ironCore * 0.02)) : 0);
  let maxHp = Math.max(1, Math.floor(
    (player.baseMaxHp + (player.flatHp || 0) + eqFlatHp) *
      (1 + (player.hpPct || 0) + (prestige.hpPct || 0) + (codex.hpPct || 0)) *
      battleHardenedHpMult
  ));
  const currentHpPct = Math.max(0, Math.min(1, (player.hp || maxHp) / Math.max(1, maxHp)));
  const lowHpDamageMult = lastBreath > 0 && currentHpPct <= 0.35 ? 1.15 + lastBreath * 0.12 : 1;
  if (lastBreath > 0 && currentHpPct <= 0.35) {
    defense = Math.floor(defense * Math.max(0.55, 1 - lastBreath * 0.12));
  }
  const damage = Math.max(1, Math.floor(
      (player.baseDamage + eqFlatDmg + (player.flatDamage || 0) + (prestige.flatDamage || 0) + armorAsDamage) *
      (1 + (player.damagePct || 0) + (prestige.damagePct || 0) + (codex.damagePct || 0)) *
      lowHpDamageMult *
      Math.max(0.75, 1 - unmovingMountain * 0.06)
  ));
  const critChance = Math.min(CRIT_CAP,
    (player.baseCritChance || 0.05) + (player.flatCrit || 0) + (prestige.flatCrit || 0) + (codex.flatCrit || 0) + eqFlatCrit
  );
  let damageRangeMin = 1;
  let damageRangeMax = 1;
  if (isMage) {
    damageRangeMin = 0.9;
    damageRangeMax = 1.1;
    if (unstablePower > 0) {
      damageRangeMin = Math.max(0.55, damageRangeMin - unstablePower * 0.04);
      damageRangeMax = damageRangeMax + unstablePower * 0.07;
    }
    if (perfectCast > 0) {
      damageRangeMin = Math.max(damageRangeMin, 0.97 + perfectCast * 0.01);
      damageRangeMax = Math.max(damageRangeMin + 0.04, 1.06 + perfectCast * 0.02);
    }
  }
  const markChance =
    arcaneMark > 0
      ? Math.min(
          STATUS_CHANCE_CAP,
          0.08 +
            arcaneMark * 0.04 +
            effectiveControlMastery * 0.15 +
            (prestige.markChance || 0) +
            (codex.markChance || 0) +
            eqMarkChance
        )
      : 0;
  const markEffectPerStack =
    arcaneMark > 0
      ? 0.02 +
        arcaneMark * 0.01 +
        effectiveControlMastery * 0.35 +
        (prestige.markEffectPerStack || 0) +
        (codex.markEffectPerStack || 0) +
        eqMarkEffectPerStack
      : 0;
  const markMaxStacks = arcaneMark > 0 ? Math.min(5, 2 + Math.ceil(arcaneMark / 2) + Math.floor(effectiveControlMastery * 2)) : 0;
  const markDuration = arcaneMark > 0 ? 4 + Math.floor(arcaneMark / 2) + Math.floor(effectiveControlMastery * 4) : 0;
  const flowBonusMult =
    arcaneFlow > 0
      ? 1 + (0.08 + arcaneFlow * 0.04 + chainBurst * 0.05 + cataclysm * 0.12 + (prestige.flowBonusMult || 0) + (codex.flowBonusMult || 0))
      : 1;
  const flowHits = arcaneFlow > 0 ? 1 + (timeLoop > 0 ? 1 : 0) + (prestige.flowHits || 0) + (codex.flowHits || 0) : 0;
  const freshTargetDamageMult = 1 + effectiveFreshTargetDamage + (cataclysm > 0 ? cataclysm * 0.08 : 0);
  const markTransferPct = Math.min(
    0.95,
    (markTransfer > 0 ? 0.2 + markTransfer * 0.1 : 0) +
      (timeLoop > 0 ? 0.1 + timeLoop * 0.05 : 0) +
      (prestige.markTransferPct || 0) +
      (codex.markTransferPct || 0)
  );
  const echoDamageMult = isMage
    ? Math.max(0.35, 0.45 + arcaneEcho * 0.07 + overchannel * 0.06)
    : heavyImpact > 0
      ? Math.max(0.65, 1 - heavyImpact * 0.05)
      : 1;
  const overchannelPenaltyPerExtraHit = overchannel > 0 ? 0.04 + overchannel * 0.02 : 0;
  const overloadExtraMarks = overload > 0 ? 1 + Math.floor(overload / 2) : 0;
  const temporalFlowPerStack = temporalFlow > 0 ? 0.015 + temporalFlow * 0.01 : 0;
  const temporalFlowMaxStacks = temporalFlow > 0 ? 2 + temporalFlow : 0;
  const spellMemoryMarkEffectPerStack = spellMemory > 0 ? 0.01 + spellMemory * 0.006 : 0;
  const spellMemoryMaxStacks = spellMemory > 0 ? 2 + spellMemory : 0;
  const absoluteControlMarkedMult = absoluteControl > 0 ? 1 + absoluteControl * 0.08 : 1;
  const absoluteControlUnmarkedMult = absoluteControl > 0 ? Math.max(0.6, 1 - absoluteControl * 0.05) : 1;
  const cataclysmSustainMult = cataclysm > 0 ? Math.max(0.7, 1 - cataclysm * 0.08) : 1;
  const volatileCritNextHitMult = volatileCasting > 0 ? 1.1 + volatileCasting * 0.08 : 1;
  const volatileFailNextHitMult = volatileCasting > 0 ? Math.max(0.55, 1 - volatileCasting * 0.07) : 1;

  return {
    damage,
    defense,
    critChance,
    maxHp,
    regen: (player.flatRegen || 0) + (prestige.healthRegen || 0) + (codex.healthRegen || 0) + eqRegen,
    goldPct:  (player.goldPct  || 0) + (prestige.goldPct || 0) + (codex.goldPct || 0) + eqGoldPct,
    flatGold: (player.flatGold || 0) + eqFlatGold,
    xpPct:    (player.xpPct   || 0) + (prestige.xpPct || 0) + (codex.xpPct || 0) + eqXpPct,
    attackSpeed: Math.max(
      0,
      Math.min(
        ATTACK_SPEED_CAP,
      (player.attackSpeed || 0) +
        (prestige.attackSpeed || 0) +
        (codex.attackSpeed || 0) +
        eqAttackSpeed +
        (bloodDebt > 0 ? 0.005 + bloodDebt * 0.005 : 0) +
        (unmovingMountain > 0 ? -0.01 * unmovingMountain : 0)
      )
    ),
    lifesteal: (player.lifesteal || 0) + (prestige.lifesteal || 0) + (codex.lifesteal || 0) + eqLifesteal,
    dodgeChance: (player.dodgeChance || 0) + (prestige.dodgeChance || 0) + (codex.dodgeChance || 0) + eqDodgeChance,
    blockChance: (player.blockChance || 0) + (prestige.blockChance || 0) + (codex.blockChance || 0) + eqBlockChance,
    critDamage:
      ((player.critDamage || 0) +
        (prestige.critDamage || 0) +
        (codex.critDamage || 0) +
        eqCritDamage +
        (player.skillPower || 0) +
        (prestige.skillPower || 0) +
        (codex.skillPower || 0) +
        eqLegacySkillPower) *
      Math.max(0.85, 1 - ironConversion * 0.05),
    critOnLowHp: (player.critOnLowHp || 0) + (prestige.critOnLowHp || 0) + eqCritOnLowHp,
    damageOnKill: (player.damageOnKill || 0) + (prestige.damageOnKill || 0) + eqDamageOnKill,
    thorns: (player.thorns || 0) + (prestige.thorns || 0) + (codex.thorns || 0) + eqThorns,
    essenceBonus: (player.essenceBonus || 0) + (prestige.essenceBonus || 0) + (codex.essenceBonus || 0) + eqEssenceBonus,
    lootBonus: (player.lootBonus || 0) + (prestige.lootBonus || 0) + (codex.lootBonus || 0) + eqLootBonus,
    luck: (player.luck || 0) + (prestige.luck || 0) + (codex.luck || 0) + eqLuck,
    multiHitChance: Math.min(
      MULTI_HIT_CAP,
      (
        crushingWeight > 0
          ? 0
          : (player.multiHitChance || 0) +
            (prestige.multiHitChance || 0) +
            (codex.multiHitChance || 0) +
            eqMultiHitChance +
            (player.cooldownReduction || 0) +
            (prestige.cooldownReduction || 0) +
            (codex.cooldownReduction || 0) +
            eqLegacyCooldownReduction +
            (frenziedChain > 0 ? 0.04 + frenziedChain * 0.04 : 0)
      )
    ),
    bleedChance: Math.min(
      STATUS_CHANCE_CAP,
      (player.bleedChance || 0) +
        (prestige.bleedChance || 0) +
        (codex.bleedChance || 0) +
        eqBleedChance +
        (bloodStrikes > 0 ? bloodStrikes * 0.025 : 0)
    ),
    bleedDamage:
      (player.bleedDamage || 0) +
      (prestige.bleedDamage || 0) +
      (codex.bleedDamage || 0) +
      eqBleedDamage +
      (bloodStrikes > 0 ? bloodStrikes * 0.03 : 0),
    fractureChance: Math.min(
      STATUS_CHANCE_CAP,
      (player.fractureChance || 0) + (prestige.fractureChance || 0) + (codex.fractureChance || 0) + eqFractureChance + (frenziedChain > 0 ? 0.04 + frenziedChain * 0.05 : 0)
    ),
    sellValueBonus: (player.sellValueBonus || 0) + (prestige.sellValueBonus || 0),
    armorAsDamage,
    openingHitDamageMult:
      (crushingWeight > 0 ? 1.35 + crushingWeight * 0.2 : 1) *
      (heavyImpact > 0 ? 1 + heavyImpact * 0.04 : 1),
    multiHitDamageMult: echoDamageMult,
    lowHpDamageMult,
    executeDamageMult: execution > 0 ? 1 + execution * 0.08 : 1,
    executeThreshold: execution > 0 ? 0.15 + execution * 0.02 : 0.15,
    bloodDebt,
    combatFlow,
    combatFlowPerStack: combatFlow > 0 ? 0.005 + combatFlow * 0.003 : 0,
    combatFlowMaxStacks: combatFlow > 0 ? 2 + combatFlow : 0,
    fortress,
    disableComboHits: crushingWeight > 0 || perfectCast > 0,
    titanicMomentum,
    isMage,
    damageRangeMin,
    damageRangeMax,
    markChance,
    markEffectPerStack,
    markMaxStacks,
    markDuration,
    flowBonusMult,
    flowHits,
    freshTargetDamageMult,
    freshTargetDamage: effectiveFreshTargetDamage,
    markTransferPct,
    controlMastery: effectiveControlMastery,
    chainBurst,
    volatileCasting,
    overchannelPenaltyPerExtraHit,
    overloadExtraMarks,
    temporalFlowPerStack,
    temporalFlowMaxStacks,
    spellMemoryMarkEffectPerStack,
    spellMemoryMaxStacks,
    absoluteControlMarkedMult,
    absoluteControlUnmarkedMult,
    cataclysmSustainMult,
    volatileCritNextHitMult,
    volatileFailNextHitMult,
  };
}

export function refreshStats(player) {
  const s = calcStats(player);
  return {
    ...player,
    damage:     s.damage,
    defense:    s.defense,
    critChance: s.critChance,
    maxHp:      s.maxHp,
  };
}
