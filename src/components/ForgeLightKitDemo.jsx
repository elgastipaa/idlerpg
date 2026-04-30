import React from "react";
import ForgeIcon from "./icons/ForgeIcon";

const tierNodes = [
  { id: "start", state: "done", label: "" },
  { id: "cult", state: "active", label: "Cult Adept" },
  { id: "next", state: "pending", label: "" },
  { id: "boss", state: "danger", label: "" },
];

const stats = [
  { id: "damage", icon: "combat", label: "DANO", value: "224" },
  { id: "defense", icon: "armor", label: "DEFENSA", value: "23" },
  { id: "crit", icon: "mark", label: "CRITICO", value: "5%" },
  { id: "speed", icon: "flow", label: "VELOCIDAD", value: "0%" },
];

const difficulties = [
  { id: "normal", label: "Normal", chance: "69% aprox", rewards: ["+300 oro", "+20 esencia"], tone: "success", icon: "armor" },
  { id: "veteran", label: "Veterano", chance: "29% aprox", rewards: ["+560 oro", "+36 esencia"], tone: "defense", icon: "mark" },
  { id: "elite", label: "Elite", chance: "8% aprox", rewards: ["+900 oro", "+56 esencia"], tone: "epic", icon: "essence" },
];

function IconButton({ icon, label, badge, className = "" }) {
  return (
    <button className={`flc-icon-button ${className}`} type="button" aria-label={label}>
      <ForgeIcon name={icon} size={22} />
      <span>{label}</span>
      {badge ? <em>{badge}</em> : null}
    </button>
  );
}

function CombatButton({ children, tone = "secondary", className = "" }) {
  return (
    <button className={`flc-button flc-button--${tone} ${className}`} type="button">
      {children}
    </button>
  );
}

function Bar({ type, value, label, thin = false, icon = null }) {
  return (
    <div className={`flc-bar flc-bar--${type} ${thin ? "flc-bar--thin" : ""}`}>
      {icon ? <span className="flc-bar__icon"><ForgeIcon name={icon} size={18} /></span> : null}
      <div className="flc-bar__track">
        <div className="flc-bar__fill" {...{ style: { width: `${value}%` } }} />
        <span className="flc-bar__label">{label}</span>
      </div>
    </div>
  );
}

function Panel({ title, icon, tone = "default", action = null, children }) {
  return (
    <section className={`flc-panel flc-panel--${tone}`}>
      <header className="flc-panel__header">
        <span className="flc-panel__title">
          {icon ? <ForgeIcon name={icon} size={18} /> : null}
          {title}
        </span>
        {action}
      </header>
      <div className="flc-panel__body">{children}</div>
    </section>
  );
}

export default function ForgeLightKitDemo() {
  return (
    <main className="fl-kit-demo fl-kit-demo--combat-v2">
      <div className="flc-shell" aria-label="Forge Light Combat demo">
        <section className="flc-tier">
          <button className="flc-tier__arrow" type="button" aria-label="Tier anterior">
            <ForgeIcon name="chevron-left" size={26} />
          </button>
          <div className="flc-tier__center">
            <strong>TIER 7</strong>
            <span>Ruinas Olvidadas</span>
            <div className="flc-tier-track">
              <div className="flc-tier-track__line" />
              {tierNodes.map((node, index) => (
                <div key={node.id} className={`flc-tier-node flc-tier-node--${node.state}`} {...{ style: { left: `${8 + index * 28}%` } }}>
                  {node.state === "danger" ? <ForgeIcon name="skull" size={16} /> : null}
                  {node.label ? <small>{node.label}</small> : null}
                </div>
              ))}
            </div>
          </div>
          <button className="flc-tier__arrow" type="button" aria-label="Tier siguiente">
            <ForgeIcon name="chevron-right" size={26} />
          </button>
        </section>

        <section className="flc-stage">
          <img className="flc-stage__bg" src="/assets/combat/backgrounds/ruinas_olvidadas.png" alt="" />
          <img className="flc-stage__enemy" src="/assets/combat/enemies/cult_adept.png" alt="Cult Adept" />
          <div className="flc-stage__vignette" />

          <div className="flc-boss-hud">
            <h1>Cult Adept</h1>
            <div className="flc-boss-bar">
              <span><ForgeIcon name="skull" size={25} /></span>
              <Bar type="hp" value={100} label="279 / 279 · 100%" />
            </div>
          </div>

          <div className="flc-stage__side flc-stage__side--mid">
            <IconButton icon="inventory" label="MOCHILA" badge="1" />
            <IconButton icon="library" label="INTEL" />
          </div>
          <div className="flc-stage__side flc-stage__side--low">
            <CombatButton tone="primary">EXTRAER</CombatButton>
            <CombatButton tone="secondary">AUTO</CombatButton>
          </div>

          <div className="flc-hero-status">
            <div className="flc-level-badge">
              <ForgeIcon name="armor" size={34} />
              <strong>26</strong>
            </div>
            <div className="flc-hero-bars">
              <Bar type="success" value={100} label="796 / 796 · 100%" icon="bleed" />
              <Bar type="xp" value={31} label="387 / 1,238 · 31%" thin />
            </div>
          </div>
        </section>

        <section className="flc-stats">
          {stats.map((stat) => (
            <article key={stat.id} className="flc-stat">
              <ForgeIcon name={stat.icon} size={26} />
              <div>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            </article>
          ))}
        </section>

        <Panel
          title="CONTRATO ACTIVO"
          icon="library"
          action={<button className="flc-link-button" type="button"><ForgeIcon name="library" size={16} />Archivo del Santuario</button>}
        >
          <div className="flc-contract">
            <div>
              <h2>Inventario violeta</h2>
              <p>Encuentra 2 epicos.</p>
            </div>
            <CombatButton tone="secondary">En progreso</CombatButton>
            <div className="flc-contract__progress">
              <span>0/2</span>
              <Bar type="arcane" value={70} label="" thin />
            </div>
            <p className="flc-rewards">+26 esencia · +44 tinta · +2 flux · +1 polvo</p>
          </div>
        </Panel>

        <Panel title="WEEKLY LEDGER" icon="claim" tone="highlight" action={<span className="flc-tag flc-tag--success">1 para reclamar</span>}>
          <div className="flc-ledger">
            <div className="flc-ledger__sigil">
              <ForgeIcon name="mark" size={52} />
            </div>
            <div className="flc-ledger__content">
              <div className="flc-ledger__meta">
                <span className="flc-tag flc-tag--gold">META SEMANAL</span>
                <strong>Renacido Tres Veces</strong>
              </div>
              <p><strong>1 / 3</strong> · Realiza 1 prestigio.</p>
              <Bar type="success" value={33} label="" thin />
              <p className="flc-rewards">+884 oro · +115 esencia · +1 TP</p>
            </div>
            <div className="flc-ledger__actions">
              <CombatButton tone="primary">Reclamar weekly</CombatButton>
              <CombatButton tone="ghost">Ver weekly</CombatButton>
            </div>
          </div>
        </Panel>

        <Panel
          title="BOSS SEMANAL"
          icon="skull"
          tone="danger"
          action={<span className="flc-panel__aside">3 intento(s) · reset 19h 38m</span>}
        >
          <div className="flc-weekly">
            <span className="flc-tag flc-tag--danger">CICLO 22H · 2026-04-29-18</span>
            <div className="flc-weekly__boss">
              <div className="flc-weekly__portrait">
                <img src="/assets/combat/weekly-bosses/weekly_boss_void_cathedral.png" alt="" />
              </div>
              <div>
                <h2>Soul Weaver</h2>
                <p>Hilos de alma envuelven la arena mientras el Soul Weaver prepara un combate largo.</p>
              </div>
            </div>
            <div className="flc-difficulties">
              {difficulties.map((difficulty) => (
                <article key={difficulty.id} className={`flc-difficulty flc-difficulty--${difficulty.tone}`}>
                  <ForgeIcon name={difficulty.icon} size={26} />
                  <div>
                    <strong>{difficulty.label}</strong>
                    <span>{difficulty.chance}</span>
                    {difficulty.rewards.map((reward) => <small key={reward}>{reward}</small>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Panel>

        <section className="flc-log">
          <span><ForgeIcon name="library" size={20} />REGISTRO DE COMBATE</span>
          <button type="button">VER <ForgeIcon name="chevron-down" size={18} /></button>
        </section>

        <button className="flc-reset" type="button">
          <ForgeIcon name="repeat" size={18} />
          REINICIAR PROGRESO
        </button>
      </div>
    </main>
  );
}
