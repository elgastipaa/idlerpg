# Migration Pass 2026-05-02 — Forge v4

| componente actual | intención semántica | componente/wrapper destino | archivo a tocar | conservar layout (sí/no) |
|---|---|---|---|---|
| `EncargosOverlay` paneles inline | Contenedor de estación principal y secciones | `fl-station-panel` (capa v2 reusable) | `src/components/EncargosOverlay.jsx`, `src/styles/forge-light-v2/screens/sanctuary.css` | sí |
| `EncargosOverlay` chips inline | Estado rápido (slots/listos/reward) | `fl-station-chip` | `src/components/EncargosOverlay.jsx`, `src/styles/forge-light-v2/screens/sanctuary.css` | sí |
| `EncargosOverlay` action buttons inline | CTA primario/secundario/ritual compact | `fl-station-action` | `src/components/EncargosOverlay.jsx`, `src/styles/forge-light-v2/screens/sanctuary.css` | sí |
| `EncargosOverlay` metric cards inline | Métricas compactas de estación | `fl-station-metric-card` | `src/components/EncargosOverlay.jsx`, `src/styles/forge-light-v2/screens/sanctuary.css` | sí |
| `DistilleryOverlay` paneles/chips/botones/cards inline | Gramática de estación coherente v4 | `fl-station-panel`, `fl-station-chip`, `fl-station-action`, `fl-station-metric-card` | `src/components/DistilleryOverlay.jsx`, `src/styles/forge-light-v2/screens/sanctuary.css` | sí |
| `SigilAltarOverlay` paneles/chips/botones/cards inline | Inicio de expedición (sigilos/previo run) con sistema único | `fl-station-panel`, `fl-station-chip`, `fl-station-action`, `fl-station-metric-card` | `src/components/SigilAltarOverlay.jsx`, `src/styles/forge-light-v2/screens/sanctuary.css` | sí |
| `SanctuaryClassSelector` | Selección de clase de inicio | Se mantiene clase existente (ya en capa v2) | `src/components/SanctuaryClassSelector.jsx` | sí |
| `HeroView` + subtabs | Navegación de subtabs y badges | `SubtabDock` existente (canónico local) | `src/components/HeroView.jsx` | sí |
| `Character`/`Talents` | Superficies hero/subtab | estilos `forge-light-v2/screens/character.css` y `talents.css` | `src/styles/forge-light-v2/screens/character.css`, `src/styles/forge-light-v2/screens/talents.css` | sí |
| `Ecos` (`Prestige`) | Tablero meta de ecos y progreso | Se mantiene base actual; sin cambio estructural en este pase | `src/components/Prestige.jsx`, `src/styles/forge-light-v2/screens/prestige.css` | sí |
