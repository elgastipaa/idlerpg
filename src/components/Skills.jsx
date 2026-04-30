import React, { useEffect } from "react";
import { calcStats } from "../engine/combat/statEngine";
import { getClassBuildStatGroups } from "../utils/classBuildStats";
import { ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import ForgeIcon from "./icons/ForgeIcon";

const UPGRADES_UI = [
  { id: "damage", name: "Fuerza", description: "+2% dano total", baseCost: 180, costMultiplier: 1.18, maxLevel: 50, icon: "?" },
  { id: "maxHp", name: "Vitalidad", description: "+3.5% HP maximo", baseCost: 200, costMultiplier: 1.18, maxLevel: 50, icon: "?" },
  { id: "critChance", name: "Precision", description: "+0.4% prob. critico", baseCost: 260, costMultiplier: 1.3, maxLevel: 30, icon: "?" },
  { id: "attackSpeed", name: "Celeridad", description: "+0.7% vel. ataque", baseCost: 320, costMultiplier: 1.34, maxLevel: 25, icon: "?" },
  { id: "goldBonus", name: "Codicia", description: "+1 oro por victoria", baseCost: 220, costMultiplier: 1.16, maxLevel: 40, icon: "$" },
  { id: "xpBonus", name: "Sabiduria", description: "+1.5% XP ganada", baseCost: 240, costMultiplier: 1.18, maxLevel: 40, icon: "XP" },
];

const ATTRIBUTE_SECTIONS = [
  {
    id: "combat",
    label: "Combate",
    description: "Prioridad directa para dano, aguante y ritmo.",
    upgradeIds: ["damage", "maxHp", "critChance", "attackSpeed"],
  },
  {
    id: "economy",
    label: "Economia",
    description: "Oro y XP para acelerar la cuenta sin tocar combate directo.",
    upgradeIds: ["goldBonus", "xpBonus"],
  },
];

const ATTRIBUTE_VISUALS = {
  damage: { icon: "combat", tone: "red" },
  maxHp: { icon: "bleed", tone: "green" },
  critChance: { icon: "mark", tone: "purple" },
  attackSpeed: { icon: "upgrade", tone: "blue" },
  goldBonus: { icon: "gold", tone: "gold" },
  xpBonus: { icon: "xp", tone: "blue" },
};

function formatGold(value = 0) {
  return Math.floor(Number(value || 0)).toLocaleString();
}

function buildProgressNodes(currentLevel = 0, maxLevel = 1) {
  const nodeCount = 7;
  const ratio = Math.max(0, Math.min(1, currentLevel / Math.max(1, maxLevel)));
  return Array.from({ length: nodeCount }, (_, index) => {
    const threshold = nodeCount <= 1 ? 1 : index / (nodeCount - 1);
    return threshold <= ratio || (currentLevel > 0 && index === 0);
  });
}

export default function Skills({ state, dispatch }) {
  const { player } = state;
  const onboardingStep = state?.onboarding?.step || null;
  const spotlightAttributes = onboardingStep === ONBOARDING_STEPS.SPEND_ATTRIBUTE;
  const playerUpgrades = player.upgrades || {};
  const computedStats = calcStats(player);
  const buildGroups = getClassBuildStatGroups(player.class, computedStats);
  const classLabel = player.class ? `${player.class.charAt(0).toUpperCase()}${player.class.slice(1)}` : "Clase";
  const upgradeSections = ATTRIBUTE_SECTIONS.map(section => ({
    ...section,
    upgrades: section.upgradeIds
      .map(id => UPGRADES_UI.find(entry => entry.id === id))
      .filter(Boolean),
  }));

  useEffect(() => {
    if (!spotlightAttributes) return undefined;
    let cancelled = false;
    let attempt = 0;

    const scrollToForceUpgrade = () => {
      if (cancelled) return;
      const target = document.querySelector('[data-onboarding-target="upgrade-attribute"]');
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      attempt += 1;
      if (attempt < 8) {
        window.setTimeout(scrollToForceUpgrade, 80);
      }
    };

    const timer = window.setTimeout(scrollToForceUpgrade, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [spotlightAttributes]);

  return (
    <div className="skills-root skills-root--forge-light">
      <section className="forge-skills-shell">
        <header className="forge-skills-page-header">
          <div className="forge-skills-title-wrap">
            <span className="forge-skills-back" aria-hidden="true">«</span>
            <h2>Atributos</h2>
            <span className="forge-skills-info" aria-hidden="true">i</span>
          </div>
          <div className="forge-skills-header-actions">
            <span className="forge-skills-gold-chip">
              <ForgeIcon name="gold" size={16} />
              {formatGold(player.gold || 0)} oro
            </span>
          </div>
        </header>

        <div className="forge-skills-tabbar" aria-label="Categorias de atributos">
          {upgradeSections.map((section, index) => (
            <span
              key={section.id}
              className={[
                "forge-skills-tab",
                index === 0 ? "forge-skills-tab--active" : "",
              ].filter(Boolean).join(" ")}
            >
              <ForgeIcon name={section.id === "combat" ? "combat" : "gold"} size={18} />
              {section.label}
            </span>
          ))}
        </div>

        <div className="forge-attributes-panel">
          {upgradeSections.map(section => (
            <section key={section.id} className="forge-attribute-section">
              <div className="forge-attribute-section-header">
                <div className="forge-attribute-section-title">
                  <ForgeIcon name={section.id === "combat" ? "combat" : "repeat"} size={16} />
                  <span>{section.label}</span>
                  <small>{section.description}</small>
                </div>
                <div className="forge-attribute-section-count">
                  {section.upgrades.length} atributo{section.upgrades.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="forge-attribute-list">
                {section.upgrades.map(up => {
                  const currentLevel = playerUpgrades[up.id] || 0;
                  const isMaxed = currentLevel >= up.maxLevel;
                  const cost = Math.floor(up.baseCost * Math.pow(up.costMultiplier, currentLevel));
                  const canAfford = player.gold >= cost;
                  const spotlightUpgrade = spotlightAttributes && up.id === "damage" && !isMaxed;
                  const lockedByTutorial = spotlightAttributes && up.id !== "damage";
                  const progress = (currentLevel / up.maxLevel) * 100;
                  const visual = ATTRIBUTE_VISUALS[up.id] || ATTRIBUTE_VISUALS.damage;
                  const progressNodes = buildProgressNodes(currentLevel, up.maxLevel);
                  const progressFillProps = { style: { "--forge-attribute-progress": `${progress}%` } };

                  return (
                    <div
                      key={up.id}
                      data-onboarding-target={spotlightUpgrade ? "upgrade-attribute-card" : undefined}
                      className={[
                        "forge-attribute-row",
                        `forge-attribute-row--${visual.tone}`,
                        canAfford && !isMaxed ? "forge-attribute-row--affordable" : "",
                        spotlightUpgrade ? "forge-attribute-row--spotlight" : "",
                        lockedByTutorial ? "forge-attribute-row--tutorial-locked" : "",
                      ].filter(Boolean).join(" ")}
                    >
                      <div className="forge-attribute-icon" aria-hidden="true">
                        <ForgeIcon name={visual.icon} size={30} />
                      </div>

                      <div className="forge-attribute-copy">
                        <div className="forge-attribute-topline">
                          <span className="forge-attribute-name">{up.name}</span>
                          <span className="forge-attribute-level">
                            {currentLevel}/{up.maxLevel}
                          </span>
                        </div>
                        <div className="forge-attribute-description">{up.description}</div>
                        <div className="forge-attribute-track" aria-hidden="true">
                          <span className="forge-attribute-track-line" />
                          <span
                            className="forge-attribute-track-fill"
                            data-progress={Math.round(progress)}
                            {...progressFillProps}
                          />
                          {progressNodes.map((active, index) => (
                            <span
                              key={`${up.id}-${index}`}
                              className={[
                                "forge-attribute-node",
                                active ? "forge-attribute-node--active" : "",
                              ].filter(Boolean).join(" ")}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        disabled={lockedByTutorial || !canAfford || isMaxed}
                        onClick={() => dispatch({ type: "UPGRADE_PLAYER", upgradeId: up.id })}
                        data-onboarding-target={spotlightUpgrade ? "upgrade-attribute" : undefined}
                        className={[
                          "forge-attribute-buy",
                          canAfford && !isMaxed ? "forge-attribute-buy--ready" : "",
                          isMaxed ? "forge-attribute-buy--maxed" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {!isMaxed && <ForgeIcon name="gold" size={17} />}
                        <span>{isMaxed ? "MAX" : formatGold(cost)}</span>
                        {!isMaxed && <small>g</small>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>

      {buildGroups.length > 0 && (
        <section className="forge-skills-reading forge-skills-reading--secondary">
          <header className="forge-skills-section-header">
            <h2>Lectura actual</h2>
            <span>
              {classLabel}
            </span>
          </header>

          <div className="forge-skills-reading-grid">
            {buildGroups.map(group => (
              <div key={group.id} className="forge-skills-reading-card">
                <div className="forge-skills-reading-card-content">
                  <div className="forge-skills-reading-title">
                    {group.label}
                  </div>
                  <div className="forge-skills-reading-entries">
                    {group.entries.map(entry => (
                      <div key={entry.key} className="forge-skills-reading-entry">
                        <div>{entry.label}</div>
                        <strong>{entry.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
