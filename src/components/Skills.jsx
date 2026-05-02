import React, { useEffect, useState } from "react";
import { ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import { formatHeaderResource } from "../utils/formatHeaderResource";
import ForgeIcon from "./icons/ForgeIcon";
import { FlButton, FlScreenHeaderModule, FlStatRow, FlTabs } from "./ui/forge";

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

export default function Skills({ state, dispatch }) {
  const { player } = state;
  const onboardingStep = state?.onboarding?.step || null;
  const spotlightAttributes = onboardingStep === ONBOARDING_STEPS.SPEND_ATTRIBUTE;
  const playerUpgrades = player.upgrades || {};
  const [activeSectionId, setActiveSectionId] = useState(ATTRIBUTE_SECTIONS[0]?.id || "");
  const upgradeSections = ATTRIBUTE_SECTIONS.map(section => ({
    ...section,
    upgrades: section.upgradeIds
      .map(id => UPGRADES_UI.find(entry => entry.id === id))
      .filter(Boolean),
  }));
  const activeSection = upgradeSections.find(section => section.id === activeSectionId) || upgradeSections[0] || null;
  const visibleSections = activeSection ? [activeSection] : [];
  const sectionTabs = upgradeSections.map(section => ({
    id: section.id,
    label: section.label,
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

  useEffect(() => {
    if (!upgradeSections.length) return;
    if (!activeSectionId || !upgradeSections.some(section => section.id === activeSectionId)) {
      setActiveSectionId(upgradeSections[0].id);
    }
  }, [activeSectionId, upgradeSections]);

  useEffect(() => {
    if (!spotlightAttributes) return;
    if (activeSectionId !== "combat") {
      setActiveSectionId("combat");
    }
  }, [spotlightAttributes, activeSectionId]);

  return (
    <div className="skills-root skills-root--forge-light">
      <FlScreenHeaderModule
        title="Atributos"
        headline=""
        className="forge-skills-screen"
        bodyClassName="forge-skills-screen__body"
      >
        <FlTabs
          items={sectionTabs}
          activeId={activeSectionId}
          onChange={id => setActiveSectionId(id)}
          variant="segmented"
          size="sm"
          fullWidth
          scrollable={false}
          showStepArrows
          prevAriaLabel="Categoria anterior"
          nextAriaLabel="Categoria siguiente"
          ariaLabel="Categorias de atributos"
          className="forge-skills-selector fl-subtabs-segmented"
        />

        <div className="forge-attributes-panel">
          {visibleSections.map(section => (
            <section key={section.id} className="forge-attribute-section">
              <div className="forge-attribute-list">
                {section.upgrades.map(up => {
                  const currentLevel = playerUpgrades[up.id] || 0;
                  const isMaxed = currentLevel >= up.maxLevel;
                  const cost = Math.floor(up.baseCost * Math.pow(up.costMultiplier, currentLevel));
                  const canAfford = player.gold >= cost;
                  const spotlightUpgrade = spotlightAttributes && up.id === "damage" && !isMaxed;
                  const lockedByTutorial = spotlightAttributes && up.id !== "damage";
                  const visual = ATTRIBUTE_VISUALS[up.id] || ATTRIBUTE_VISUALS.damage;
                  return (
                    <FlStatRow
                      key={up.id}
                      variant="attribute"
                      tone={visual.tone}
                      icon={<ForgeIcon name={visual.icon} size={30} />}
                      label={up.name}
                      meta={`${currentLevel}/${up.maxLevel}`}
                      description={up.description}
                      currentLevel={currentLevel}
                      maxLevel={up.maxLevel}
                      milestoneStep={5}
                      trackFrame="none"
                      action={(
                        <FlButton
                          disabled={lockedByTutorial || !canAfford || isMaxed}
                          onClick={() => dispatch({ type: "UPGRADE_PLAYER", upgradeId: up.id })}
                          data-onboarding-target={spotlightUpgrade ? "upgrade-attribute" : undefined}
                          className="forge-attribute-buy-action"
                          variant={isMaxed ? "ghost" : canAfford ? "default" : "secondary"}
                          size="sm"
                          icon={!isMaxed ? <span className="forge-attribute-buy-glyph" aria-hidden="true">🪙</span> : null}
                        >
                          {isMaxed ? "MAX" : formatHeaderResource(cost)}
                        </FlButton>
                      )}
                      data-onboarding-target={spotlightUpgrade ? "upgrade-attribute-card" : undefined}
                      className={[
                        spotlightUpgrade ? "forge-attribute-row--spotlight" : "",
                        lockedByTutorial ? "forge-attribute-row--tutorial-locked" : "",
                      ].filter(Boolean).join(" ")}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </FlScreenHeaderModule>
    </div>
  );
}
