import React from "react";
import { ITEM_FAMILIES } from "../data/itemFamilies";

const STAT_DESCRIPTIONS = [
  ["damage", "Dano base de tus golpes normales y de varias skills."],
  ["defense", "Reduce el dano recibido antes de block o evade."],
  ["critChance", "Chance de que un golpe sea critico."],
  ["critDamage", "Aumenta el multiplicador del critico."],
  ["healthMax", "Vida maxima."],
  ["healthRegen", "Vida recuperada por tick."],
  ["lifesteal", "Curacion basada en el dano que infligis."],
  ["attackSpeed", "Chance de un golpe extra del heroe dentro del mismo tick."],
  ["dodgeChance", "Chance de esquivar por completo un golpe enemigo."],
  ["blockChance", "Chance de bloquear por completo un golpe enemigo."],
  ["damageOnKill", "Dano extra para el siguiente golpe tras matar."],
  ["critOnLowHp", "Critico adicional cuando estas con poca vida."],
  ["thorns", "Dano reflejado cuando recibis golpes."],
  ["goldBonus", "Oro plano extra por kill o por item."],
  ["xpBonus", "XP porcentual extra."],
  ["essenceBonus", "Esencia plana extra por kill."],
  ["lootBonus", "Aumenta la chance global de drop."],
  ["luck", "Mejora la calidad/frecuencia del loot."],
  ["cooldownReduction", "Reduce el cooldown efectivo de las skills."],
  ["skillPower", "Escala el dano o curacion de las skills."],
];

const SYSTEMS = [
  ["Items base", "Definen la pieza inicial: nombre, rareza, familia y stats base."],
  ["Familias de items", "Cada familia da un implicit fijo segun rareza, como espada=crit o plate=bloqueo."],
  ["Affixes", "Prefijos y sufijos rolados con tiers T3/T2/T1 y valores variables."],
  ["Perfect roll", "Un affix que cae en el 10% superior de su rango."],
  ["Arbol de talentos", "Los talentos se desbloquean con Talent Points y siguen prerequisitos de rama."],
  ["Auto loot", "Permite auto-vender o auto-extraer rarezas elegidas para aliviar inventario."],
  ["Crafting", "Upgrade, reroll, ascend, extract y fuse para mejorar o reciclar equipo."],
  ["Progreso offline", "Simula hasta 1 hora de ticks cuando no estabas mirando el juego."],
];

const AFFIX_TIERS = [
  ["T1", "El tier mas poderoso y el mas raro."],
  ["T2", "Un tier intermedio, bueno para piezas solidas."],
  ["T3", "El tier mas comun, ideal para bases tempranas o rerolls."],
];

const RARITY_GUIDE = [
  ["Common", "Base simple y limpia. Sirve para equiparte temprano o reciclar."],
  ["Magic", "Empieza a mostrar identidad sin quedar sobrecargado."],
  ["Rare", "Loot serio. Suele abrir decisiones reales de build."],
  ["Epic", "Piezas deseables con mucho potencial de crafting."],
  ["Legendary", "Drops de persecucion, muy raros y con fantasias fuertes."],
];

function formatImplicit(bonus = {}) {
  return Object.entries(bonus)
    .map(([key, value]) => `${key}: ${typeof value === "number" && value < 1 ? `${Math.round(value * 100)}%` : value}`)
    .join(" · ");
}

export default function Codex() {
  return (
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <section style={panelStyle}>
        <div style={titleStyle}>Codex</div>
        <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>
          Glosario rapido de stats, sistemas y familias de items del juego.
        </div>
      </section>

      <section style={panelStyle}>
        <div style={sectionStyle}>Sistemas</div>
        <div style={gridStyle}>
          {SYSTEMS.map(([name, description]) => (
            <div key={name} style={cardStyle}>
              <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={panelStyle}>
        <div style={sectionStyle}>Rarezas y Tiers</div>
        <div style={gridStyle}>
          {RARITY_GUIDE.map(([name, description]) => (
            <div key={name} style={cardStyle}>
              <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
            </div>
          ))}
          {AFFIX_TIERS.map(([name, description]) => (
            <div key={name} style={cardStyle}>
              <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={panelStyle}>
        <div style={sectionStyle}>Atributos</div>
        <div style={gridStyle}>
          {STAT_DESCRIPTIONS.map(([name, description]) => (
            <div key={name} style={cardStyle}>
              <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={panelStyle}>
        <div style={sectionStyle}>Familias</div>
        <div style={gridStyle}>
          {Object.entries(ITEM_FAMILIES).map(([id, family]) => (
            <div key={id} style={cardStyle}>
              <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{family.name}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", marginTop: "2px" }}>{id}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginTop: "6px", lineHeight: 1.35 }}>
                {Object.entries(family.implicitByRarity || {}).map(([rarity, implicit]) => (
                  <div key={rarity}><strong>{rarity}:</strong> {formatImplicit(implicit)}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const panelStyle = {
  background: "var(--color-background-secondary, #fff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "16px",
  padding: "14px",
  boxShadow: "0 2px 10px var(--color-shadow, rgba(0,0,0,0.03))",
};

const titleStyle = {
  fontSize: "1rem",
  fontWeight: "900",
  color: "var(--color-text-primary, #1e293b)",
};

const sectionStyle = {
  fontSize: "0.68rem",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: "900",
  marginBottom: "10px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "10px",
};

const cardStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "12px",
  padding: "10px",
};
