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
  const playerSpec = player.specialization || null;

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
  const eqAbyssDamagePct = (weapon?.bonus?.abyssDamagePct || 0) + (armor?.bonus?.abyssDamagePct || 0);
  const eqAbyssEnemyAffixPenaltyReduction = (weapon?.bonus?.abyssEnemyAffixPenaltyReduction || 0) + (armor?.bonus?.abyssEnemyAffixPenaltyReduction || 0);
  const eqAbyssNormalEnemyPenaltyReduction = (weapon?.bonus?.abyssNormalEnemyPenaltyReduction || 0) + (armor?.bonus?.abyssNormalEnemyPenaltyReduction || 0);
  const eqAbyssLootQuality = (weapon?.bonus?.abyssLootQuality || 0) + (armor?.bonus?.abyssLootQuality || 0);
  const eqAbyssEssenceMult = (weapon?.bonus?.abyssEssenceMult || 0) + (armor?.bonus?.abyssEssenceMult || 0);
  const eqAbyssBossMechanicMitigation = (weapon?.bonus?.abyssBossMechanicMitigation || 0) + (armor?.bonus?.abyssBossMechanicMitigation || 0);
  const eqAbyssMutatorOffensePct = (weapon?.bonus?.abyssMutatorOffensePct || 0) + (armor?.bonus?.abyssMutatorOffensePct || 0);
  const eqVoidStrikeChance = (weapon?.bonus?.voidStrikeChance || 0) + (armor?.bonus?.voidStrikeChance || 0);
  const eqAbyssalCritFractureChance = (weapon?.bonus?.abyssalCritFractureChance || 0) + (armor?.bonus?.abyssalCritFractureChance || 0);
  const eqEchoHitChance = (weapon?.bonus?.echoHitChance || 0) + (armor?.bonus?.echoHitChance || 0);
  const eqEnemyAffixDamagePct = (weapon?.bonus?.enemyAffixDamagePct || 0) + (armor?.bonus?.enemyAffixDamagePct || 0);
  const eqEnemyAffixLifesteal = (weapon?.bonus?.enemyAffixLifesteal || 0) + (armor?.bonus?.enemyAffixLifesteal || 0);
  const eqPhaseSkin = (weapon?.bonus?.phaseSkin || 0) + (armor?.bonus?.phaseSkin || 0);
  const eqAbyssRegenFlat = (weapon?.bonus?.abyssRegenFlat || 0) + (armor?.bonus?.abyssRegenFlat || 0);
  const eqBossMechanicMitigation = (weapon?.bonus?.bossMechanicMitigation || 0) + (armor?.bonus?.bossMechanicMitigation || 0);

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
  const isJuggernaut = playerSpec === "juggernaut";
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
  let maxHp = Math.max(1, Math.floor(
    (player.baseMaxHp + (player.flatHp || 0) + eqFlatHp) *
      (1 + (player.hpPct || 0) + (prestige.hpPct || 0) + (codex.hpPct || 0)) *
      battleHardenedHpMult
  ));
  const armorAsDamage =
    Math.floor(
      (
        (ironConversion > 0 ? defense * (0.08 + ironConversion * 0.06) : 0) +
        (ironCore > 0 ? defense * (0.03 + ironCore * 0.03) : 0) +
        (fortress > 0 ? defense * (0.01 + fortress * 0.005) : 0)
      ) *
      (1 + unmovingMountain * 0.08)
    );
  const crushingWeightJuggernautRamBonus =
    crushingWeight > 0 && isJuggernaut
      ? 0.08 + Math.min(0.24, defense / 300)
      : 0;
  const crushingWeightChainOpeningBonus =
    crushingWeight > 0 && frenziedChain > 0
      ? 0.08 + frenziedChain * 0.06
      : 0;
  const heavyHitGuard =
    (fortress > 0 ? 0.03 + fortress * 0.018 : 0) +
    (unmovingMountain > 0 ? 0.04 + unmovingMountain * 0.03 : 0) +
    (titanicMomentum > 0 ? 0.004 + titanicMomentum * 0.007 : 0);
  const guardRetaliationRatio =
    (fortress > 0 ? 0.04 + fortress * 0.018 : 0) +
    (unmovingMountain > 0 ? 0.02 + unmovingMountain * 0.01 : 0) +
    (titanicMomentum > 0 ? titanicMomentum * 0.004 : 0);
  const juggernautBossMechanicMitigation =
    (unmovingMountain > 0 ? 0.02 + unmovingMountain * 0.015 : 0) +
    (fortress > 0 ? 0.006 + fortress * 0.006 : 0) +
    (titanicMomentum > 0 ? titanicMomentum * 0.0015 : 0);
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
    damageRangeMin = 0.92;
    damageRangeMax = 1.1;
    if (unstablePower > 0) {
      damageRangeMin = Math.max(0.55, damageRangeMin - unstablePower * 0.04);
      damageRangeMax = damageRangeMax + unstablePower * 0.07;
    }
    if (perfectCast > 0) {
      damageRangeMin = Math.max(damageRangeMin, 0.98 + perfectCast * 0.012);
      damageRangeMax = Math.max(damageRangeMin + 0.03, 1.05 + perfectCast * 0.018);
    }
  }
  const markChance =
    arcaneMark > 0
      ? Math.min(
          STATUS_CHANCE_CAP,
          0.1 +
            arcaneMark * 0.045 +
            effectiveControlMastery * 0.15 +
            (prestige.markChance || 0) +
            (codex.markChance || 0) +
            eqMarkChance
        )
      : 0;
  const markEffectPerStack =
    arcaneMark > 0
      ? 0.024 +
        arcaneMark * 0.012 +
        effectiveControlMastery * 0.35 +
        (prestige.markEffectPerStack || 0) +
        (codex.markEffectPerStack || 0) +
        eqMarkEffectPerStack
      : 0;
  const markMaxStacks = arcaneMark > 0 ? Math.min(5, 2 + Math.ceil(arcaneMark / 2) + Math.floor(effectiveControlMastery * 2)) : 0;
  const markDuration = arcaneMark > 0 ? 4 + Math.floor(arcaneMark / 2) + Math.floor(effectiveControlMastery * 4) : 0;
  const flowBonusMult =
    arcaneFlow > 0
      ? 1 + (0.1 + arcaneFlow * 0.045 + chainBurst * 0.05 + cataclysm * 0.12 + (prestige.flowBonusMult || 0) + (codex.flowBonusMult || 0))
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
    ? Math.max(0.38, 0.5 + arcaneEcho * 0.075 + overchannel * 0.07)
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
  const volatileFailNextHitMult = volatileCasting > 0 ? Math.max(0.72, 1 - volatileCasting * 0.04) : 1;

  return {
    damage,
    defense,
    critChance,
    maxHp,
    regen: (player.flatRegen || 0) + (prestige.healthRegen || 0) + (codex.healthRegen || 0) + eqRegen,
    regenPctMaxHp: (player.regenPctMaxHp || 0) + (prestige.regenPctMaxHp || 0),
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
    thornsDefenseRatio: (player.thornsDefenseRatio || 0) + (prestige.thornsDefenseRatio || 0),
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
      (player.fractureChance || 0) +
        (prestige.fractureChance || 0) +
        (codex.fractureChance || 0) +
        eqFractureChance +
        (frenziedChain > 0 ? 0.04 + frenziedChain * 0.05 : 0) +
        (crushingWeight > 0 && frenziedChain > 0 ? 0.04 + frenziedChain * 0.04 : 0)
    ),
    sellValueBonus: (player.sellValueBonus || 0) + (prestige.sellValueBonus || 0),
    armorAsDamage,
    heavyHitGuard: Math.max(0, heavyHitGuard),
    guardRetaliationRatio: Math.max(0, guardRetaliationRatio),
    multiHitDamageMult: echoDamageMult,
    lowHpDamageMult,
    executeDamageMult: execution > 0 ? 1 + execution * 0.08 : 1,
    executeThreshold: execution > 0 ? 0.15 + execution * 0.02 : 0.15,
    bloodDebt,
    combatFlow,
    combatFlowPerStack: combatFlow > 0 ? 0.005 + combatFlow * 0.003 : 0,
    combatFlowMaxStacks: combatFlow > 0 ? 2 + combatFlow : 0,
    fortress,
    crushingWeight,
    crushingShieldBypassPct: crushingWeight > 0 ? Math.min(0.62, 0.22 + crushingWeight * 0.05 + (isJuggernaut ? 0.12 : 0)) : 0,
    crushingOpeningFractureStacks: crushingWeight > 0 && frenziedChain > 0 ? 1 + Math.floor(frenziedChain / 2) : 0,
    crushingFracturedDamageMult: crushingWeight > 0 && frenziedChain > 0 ? 1.08 + frenziedChain * 0.04 : 1,
    perfectCast,
    disableComboHits: crushingWeight > 0 || perfectCast > 0,
    titanicMomentum,
    titanicMomentumDamagePerStack: titanicMomentum > 0 ? 0.007 + titanicMomentum * 0.001 : 0,
    titanicMomentumDefensePerStack: titanicMomentum > 0 ? 0.002 + titanicMomentum * 0.0005 : 0,
    titanicMomentumAttackSpeedPerStack: titanicMomentum > 0 ? 0.004 + titanicMomentum * 0.002 : 0,
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
    abyssDamagePct: Math.max(0, (player.abyssDamagePct || 0) + (prestige.abyssDamagePct || 0) + (codex.abyssDamagePct || 0) + eqAbyssDamagePct),
    abyssEnemyAffixPenaltyReduction: Math.max(0, (player.abyssEnemyAffixPenaltyReduction || 0) + (prestige.abyssEnemyAffixPenaltyReduction || 0) + eqAbyssEnemyAffixPenaltyReduction),
    abyssNormalEnemyPenaltyReduction: Math.max(0, (player.abyssNormalEnemyPenaltyReduction || 0) + (prestige.abyssNormalEnemyPenaltyReduction || 0) + eqAbyssNormalEnemyPenaltyReduction),
    abyssLootQuality: Math.max(0, (player.abyssLootQuality || 0) + (prestige.abyssLootQuality || 0) + eqAbyssLootQuality),
    abyssEssenceMult: Math.max(0, (player.abyssEssenceMult || 0) + (prestige.abyssEssenceMult || 0) + eqAbyssEssenceMult),
    abyssBossMechanicMitigation: Math.max(0, (player.abyssBossMechanicMitigation || 0) + (prestige.abyssBossMechanicMitigation || 0) + eqAbyssBossMechanicMitigation),
    abyssMutatorOffensePct: Math.max(0, (player.abyssMutatorOffensePct || 0) + (prestige.abyssMutatorOffensePct || 0) + eqAbyssMutatorOffensePct),
    voidStrikeChance: Math.max(0, (player.voidStrikeChance || 0) + eqVoidStrikeChance),
    abyssalCritFractureChance: Math.max(0, (player.abyssalCritFractureChance || 0) + eqAbyssalCritFractureChance),
    echoHitChance: Math.max(0, (player.echoHitChance || 0) + eqEchoHitChance),
    enemyAffixDamagePct: Math.max(0, (player.enemyAffixDamagePct || 0) + eqEnemyAffixDamagePct),
    enemyAffixLifesteal: Math.max(0, (player.enemyAffixLifesteal || 0) + eqEnemyAffixLifesteal),
    phaseSkin: Math.max(0, (player.phaseSkin || 0) + eqPhaseSkin),
    abyssRegenFlat: Math.max(0, (player.abyssRegenFlat || 0) + eqAbyssRegenFlat),
    bossMechanicMitigation: Math.max(0, (player.bossMechanicMitigation || 0) + eqBossMechanicMitigation + juggernautBossMechanicMitigation),
    buildTempoDescriptor:
      perfectCast > 0
        ? "precision"
        : overchannel > 0
          ? "echo"
          : crushingWeight > 0
            ? "opener"
            : "standard",
    openingHitDamageMult:
      ((crushingWeight > 0 ? 1.35 + crushingWeight * 0.2 : 1) *
      (heavyImpact > 0 ? 1 + heavyImpact * 0.04 : 1) *
      (1 + crushingWeightJuggernautRamBonus + crushingWeightChainOpeningBonus)),
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
