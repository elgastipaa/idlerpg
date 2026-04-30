# Forge Light Design System - Implementation Plan

Fecha: 2026-04-28
Estado: plan operativo para migrar la app completa sin volver a fragmentar estilos

Este plan traduce tres entradas en trabajo implementable:

- `uirefactor/design2.md`: contrato visual y regla de autoridad.
- `uirefactor/nuevoDesign/UI Kit Forge Light.png`: autoridad visual primaria.
- `ui-component-inventory.md`: inventario funcional de componentes, variantes, estados y usos.

La meta no es "hacer que cada pantalla se parezca a su captura". La meta es que toda la app use el mismo lenguaje Forge Light, con componentes compartidos y estilos reutilizables.

---

## 1. Resultado Esperado

Al final de la migracion:

- Todas las pantallas Core usan primitives Forge compartidas.
- No hay botones, cards, badges, progress bars ni tabs locales inventados por pantalla.
- `UI Kit Forge Light.png` manda sobre las capturas viejas.
- Las capturas viejas solo informan layout, jerarquia y casos de uso.
- `src/styles/forge-light.css` contiene tokens y primitives globales.
- `src/styles/responsive.css` queda para layout responsive y excepciones de pantalla, no para redefinir el sistema visual.
- Cada pantalla pasa auditoria en mobile 390x844, mobile 430x932 y desktop/tablet 1280x800.

---

## 2. Reglas de Autoridad

Orden de decision:

1. `UI Kit Forge Light.png`
2. `uirefactor/design2.md`
3. `ui-component-inventory.md`
4. Capturas de `uirefactor/*.png`
5. Codigo actual

Regla critica:

Si una captura contradice el UI Kit, gana el UI Kit. Se conserva la funcion de la captura, no su componente local.

Ejemplo:

- Si `Crafting.png` muestra un CTA con brillo mas fuerte que el kit, la implementacion usa `FlButton variant="primary"`.
- Si `Mochila.png` tiene chips de item con proporciones distintas, la implementacion usa `FlBadge` / `FlTag`.
- Si `Talentos.png` usa nodos distintos, la implementacion usa `FlIconFrame` + `FlTalentNode`.

---

## 3. Arquitectura de Archivos

### 3.1 Nueva carpeta de primitives

Crear:

```txt
src/components/ui/forge/
  index.js
  FlButton.jsx
  FlIconButton.jsx
  FlCard.jsx
  FlPanel.jsx
  FlBadge.jsx
  FlTag.jsx
  FlIconFrame.jsx
  FlAsset.jsx
  FlProgressBar.jsx
  FlResourceCounter.jsx
  FlStatRow.jsx
  FlCostDisplay.jsx
  FlRewardDisplay.jsx
  FlTabs.jsx
  FlSectionHeader.jsx
  FlEmptyState.jsx
  FlRequirementHint.jsx
  FlConfirmDialog.jsx
```

No crear todos si no se usan inmediatamente, pero todo componente visual Core nuevo debe vivir ahi o justificar por que no.

### 3.2 Estilos

Mantener:

```txt
src/styles/tokens.css
src/styles/forge-light.css
src/styles/responsive.css
```

Responsabilidades:

- `tokens.css`: tokens neutrales de app, breakpoints si existen, compatibilidad general.
- `forge-light.css`: tokens Forge, primitives, estados, rarezas, microelementos.
- `responsive.css`: layout por viewport y ajustes de pantallas especificas.

Regla:

No agregar nuevos estilos visuales Forge en `responsive.css` si pertenecen a un componente reutilizable. Primero crear clase primitive en `forge-light.css`.

---

## 4. Convenciones Tecnicas

### 4.1 Naming

React:

- Components: `FlButton`, `FlCard`, `FlBadge`.
- Domain wrappers: `FlItemCard`, `FlJobCard`, `FlTalentNode`.
- Screen classes: `inventory-root--forge-light`, `talents-root--forge-light`.

CSS:

- Primitive classes: `.fl-button`, `.fl-card`, `.fl-badge`.
- Variants: `.fl-button--primary`, `.fl-card--selected`.
- State classes or data attributes: `[data-state="loading"]`, `[data-selected="true"]`.
- Rarity: `[data-rarity="epic"]` or `.fl-rarity--epic`.

### 4.2 Props estandar

Todos los primitives interactivos deben aceptar:

```js
variant
size
disabled
loading
selected
state
className
children
```

Cuando aplique:

```js
icon
trailingIcon
badge
tone
rarity
cost
onClick
ariaLabel
```

### 4.3 Estados obligatorios

Para componentes interactivos:

- default;
- hover/focus;
- pressed;
- selected/active;
- disabled;
- loading;
- success;
- error.

En mobile:

- hover no es requisito visual aislado, pero focus/pressed si.
- disabled debe tener razon via `FlRequirementHint`, tooltip o sheet.
- loading no cambia ancho ni alto.

---

## 5. Tokens: Paso de Consolidacion

El CSS actual ya tiene tokens `--fl-bg-0`, `--fl-gold-1`, `--fl-border`, etc. No conviene romperlos de golpe.

### 5.1 Estrategia

Agregar aliases semanticos de `design2.md` sin eliminar los existentes:

```css
:root {
  --fl-bg-main: var(--fl-bg-0, #0B0F14);
  --fl-bg-surface: var(--fl-bg-1, #121821);
  --fl-bg-card: var(--fl-bg-2, #161D27);

  --fl-gold-border: var(--fl-gold-2, #C6A15B);
  --fl-gold-glow: var(--fl-gold-1, #E6C47A);
  --fl-gold-hover: var(--fl-gold-0, #F0D28A);

  --fl-text-primary: var(--fl-text-0, #F2E6C8);
  --fl-text-secondary: var(--fl-text-1, #B8AA8F);
  --fl-text-muted: var(--fl-text-muted, #7F7564);

  --fl-success: var(--fl-green, #4FD18B);
  --fl-danger: var(--fl-red, #E05A5A);
  --fl-arcane: var(--fl-purple, #8A5BE8);
  --fl-defense: var(--fl-blue, #4A8FE7);
  --fl-reward: var(--fl-orange, #F2B84B);
}
```

### 5.2 Definition of Done

- No se rompen pantallas ya migradas.
- Nuevos primitives usan aliases semanticos.
- Estilos viejos pueden seguir usando tokens antiguos hasta migrarse.
- No aparecen hex nuevos dentro de componentes React.

---

## 6. Primitive Set Minimo

Esta es la primera tanda obligatoria. Sin esto, cada pantalla volvera a crear su propia UI.

### 6.1 FlButton

Fuente:

- `ui-component-inventory.md`: Button, Icon Button, Crafting Action Button, Claim Button, Expedition Start Button, Talent Purchase Button.
- `design2.md`: 6.1 Button.

API propuesta:

```jsx
<FlButton
  variant="primary | secondary | ghost | destructive"
  size="sm | md | lg | full"
  icon={null}
  trailingIcon={null}
  loading={false}
  disabled={false}
  selected={false}
  cost={null}
  onClick={handler}
>
  Mejorar
</FlButton>
```

Estados:

- default;
- focus;
- pressed;
- disabled;
- loading;
- success;
- error.

Uso inicial:

- CTAs de Crafting.
- Claim en Santuario.
- Comprar en Talentos.
- Volver a Combate en Mochila/Expedicion.

Regla:

No crear botones verdes como CTA principal. Exito puede ser estado o feedback, no variante principal.

### 6.2 FlIconButton

API propuesta:

```jsx
<FlIconButton
  icon={<ForgeIcon name="close" />}
  ariaLabel="Cerrar"
  variant="default | active | destructive"
  badge={null}
  loading={false}
  disabled={false}
/>
```

Uso inicial:

- cerrar overlays;
- plus de recurso;
- filtros;
- settings;
- auto;
- acciones compactas de item.

### 6.3 FlCard

Fuente:

- Card, List Row, Grid Tile, Station Card, Job Card, Expedition Tier Card, Echo Upgrade Card.

API propuesta:

```jsx
<FlCard
  variant="default | compact | panel | premium"
  selected={false}
  interactive={false}
  disabled={false}
  rarity={null}
  state="default"
>
  ...
</FlCard>
```

Estados:

- default;
- pressed;
- selected;
- disabled;
- locked;
- loading;
- success;
- error.

Uso inicial:

- Station cards.
- Item rows.
- Talent detail.
- Expedition tier cards.

### 6.4 FlBadge / FlTag

API propuesta:

```jsx
<FlBadge tone="success | danger | warning | arcane | defense | neutral" size="sm">
  Listo
</FlBadge>

<FlTag selected={false} removable={false} tone="arcane">
  Accesorio
</FlTag>
```

Uso:

- rarezas;
- nuevo;
- equipado;
- bloqueado;
- listo;
- mejorable;
- tipo de item;
- contador.

### 6.5 FlIconFrame

API propuesta:

```jsx
<FlIconFrame
  variant="normal | active | upgraded | epic | legendary"
  rarity="common | magic | rare | epic | legendary"
  selected={false}
  locked={false}
  size="sm | md | lg | xl"
>
  <ForgeIcon name="sword" />
</FlIconFrame>
```

Uso:

- item icon;
- talent node;
- stat icon;
- resource icon;
- station icon;
- reward icon.

### 6.6 FlProgressBar

API propuesta:

```jsx
<FlProgressBar
  type="hp | xp | progress | success | error | loading"
  value={current}
  max={max}
  label="7,850 / 12,500"
  milestones={[25, 50, 75]}
  segmented={false}
/>
```

Uso:

- HP;
- XP;
- jobs;
- crafting entropy;
- expedition tier progress;
- offline progress.

### 6.7 FlResourceCounter

API propuesta:

```jsx
<FlResourceCounter
  type="gold | essence | fire | echo | material"
  icon={<ForgeIcon name="gold" />}
  label="Oro"
  value={307300}
  compact
  onAdd={handler}
/>
```

Uso:

- top bar;
- crafting costs;
- prestige;
- inventory/sanctuary headers.

### 6.8 FlStatRow

API propuesta:

```jsx
<FlStatRow
  icon={<ForgeIcon name="attack" />}
  label="Ataque"
  value="1,250"
  delta="+12%"
  deltaTone="success"
/>
```

Uso:

- atributos;
- item comparison;
- crafting preview;
- combat stats;
- boss mechanics.

### 6.9 FlTabs

API propuesta:

```jsx
<FlTabs
  items={[
    { id: "upgrade", label: "Mejorar", icon: "upgrade", badge: null },
  ]}
  activeId={active}
  onChange={setActive}
  variant="primary | secondary | compact"
/>
```

Uso:

- Crafting modes.
- Hero tabs.
- Expedition tabs: Combate, Mochila, Intel.
- Inventory tabs.
- Sanctuary subtabs.
- Prestige subtabs.

Regla:

`SubtabDock` puede adaptarse o delegar internamente a `FlTabs`, pero no debe mantener estilo claro/legacy.

### 6.10 FlRequirementHint

API propuesta:

```jsx
<FlRequirementHint
  type="resource | locked | level | inventory | prereq"
  label="Faltan 12 Piedras de Forja"
  actionLabel="Ver fuentes"
  onAction={handler}
/>
```

Uso:

- botones disabled;
- locked content;
- crafting insufficient;
- talent prereqs;
- expedition gates.

---

## 7. Componentes Compuestos por Dominio

Despues de los primitives, crear wrappers compuestos para evitar duplicacion entre pantallas.

### 7.1 Inventory

Crear o normalizar:

- `FlItemFrame`
- `FlItemRow`
- `FlItemTile`
- `FlItemDetailBlock`
- `FlAffixList`
- `FlRarityBadge`

Usan:

- `FlCard`;
- `FlIconFrame`;
- `FlBadge`;
- `FlTag`;
- `FlStatRow`;
- `FlButton`.

### 7.2 Crafting

Crear o normalizar:

- `FlCraftingModeTabs`
- `FlCraftingResultPreview`
- `FlMaterialRequirementList`
- `FlUpgradeTrack`
- `FlCraftingCostPanel`

Usan:

- `FlTabs`;
- `FlProgressBar`;
- `FlResourceCounter`;
- `FlCostDisplay`;
- `FlStatRow`;
- `FlButton`.

### 7.3 Talents

Crear o normalizar:

- `FlTalentNode`
- `FlTalentDetailPanel`
- `FlTalentPointCounter`
- `FlTalentRequirementBadge`

Usan:

- `FlIconFrame`;
- `FlBadge`;
- `FlProgressBar`;
- `FlCostDisplay`;
- `FlButton`.

### 7.4 Sanctuary

Crear o normalizar:

- `FlStationCard`
- `FlJobCard`
- `FlJobProgress`
- `FlClaimPanel`

Usan:

- `FlCard`;
- `FlProgressBar`;
- `FlRewardDisplay`;
- `FlButton`;
- `FlRequirementHint`.

### 7.5 Expedition / Combat

Crear o normalizar:

- `FlTierProgressTrack`
- `FlBossCard`
- `FlCombatantPanel`
- `FlStatusEffectIcon`
- `FlRewardTrack`

Usan:

- `FlProgressBar`;
- `FlCard`;
- `FlIconFrame`;
- `FlBadge`;
- `FlRewardDisplay`.

---

## 8. Assets Generados en public/assets

La migracion visual debe contemplar que ya se estan generando assets reales en `public/assets`. No deben tratarse como una tarea separada sin relacion con el Design System: deben integrarse progresivamente en los mismos componentes Forge, sin bloquear la creacion de primitives.

### 8.1 Directorios actuales

Assets ya presentes o en generacion:

```txt
public/assets/items/
public/assets/icons/system/
public/assets/combat/backgrounds/
public/assets/combat/enemies/
public/assets/combat/bosses/
public/assets/combat/weekly-bosses/
public/assets/portraits/classes/
public/assets/sanctuary/stations/
public/assets/skills/talents/
public/assets/skills/echoes/
```

### 8.2 Regla de integracion

Los assets no reemplazan el Design System. Los assets viven dentro de componentes Forge.

Ejemplos:

- item PNG -> dentro de `FlIconFrame` / `FlItemRow`;
- system icon PNG -> dentro de `FlIconButton`, `FlBadge`, `FlResourceCounter` o nav;
- enemy PNG -> dentro de `FlCombatantPanel`;
- station PNG -> dentro de `FlStationCard`;
- skill/talent PNG -> dentro de `FlTalentNode`;
- echo PNG -> dentro de `FlEchoUpgradeCard` / `FlTalentNode`;
- class portrait PNG -> dentro de `FlHeroSummary` / header.

No insertar assets directamente en cada pantalla con estilos locales. Primero pasarlos por un wrapper o primitive.

### 8.3 Asset registry

Crear una capa liviana para resolver paths y fallbacks:

```txt
src/utils/assetRegistry.js
```

Responsabilidades:

- mapear ids del juego a paths de `public/assets`;
- resolver fallback si falta un asset;
- evitar strings duplicados en pantallas;
- centralizar naming y normalizacion de slugs;
- permitir migracion gradual sin romper UI.

API sugerida:

```js
getItemAsset(item)
getSystemIconAsset(iconId)
getEnemyAsset(enemyId)
getWeeklyBossAsset(bossId)
getClassPortraitAsset(classId)
getStationAsset(stationId)
getTalentAsset(talentId)
getEchoAsset(echoId)
```

Regla:

- El componente recibe `assetSrc` o `assetId`; no arma paths manualmente.
- Si el asset no existe, usar `ForgeIcon` / placeholder Forge, no emoji.

### 8.4 Naming convention

Mantener nombres estables y predecibles:

```txt
items: item_<slug>.png
system icons: icon_<slug>.png
enemies: <enemy_slug>.png
weekly bosses: weekly_boss_<slug>.png
class portraits: portrait_<class_slug>.png
stations: station_<slug>.png
talents: skill_<class_slug>_<talent_slug>.png
echoes: echo_<tree_slug>_<node_slug>.png
```

Si un asset generado no sigue la convencion:

- no renombrar destructivamente sin revisar referencias;
- agregar alias en `assetRegistry`;
- normalizar el siguiente batch.

### 8.5 Componente de asset reusable

Crear un wrapper opcional:

```txt
src/components/ui/forge/FlAsset.jsx
```

API propuesta:

```jsx
<FlAsset
  src={assetSrc}
  alt="Hacha Infernal"
  kind="item | icon | enemy | portrait | station | skill"
  fallback={<ForgeIcon name="weapon" />}
  framed
  rarity="epic"
/>
```

Responsabilidades:

- renderizar `img` con sizing consistente;
- controlar `object-fit`;
- manejar fallback;
- evitar layout shift;
- integrarse con `FlIconFrame` cuando `framed` es true;
- soportar lazy loading donde no afecte feedback inmediato.

### 8.6 Integracion por dominio

Items:

- Reemplazar glyphs/emoji de `src/utils/itemVisuals.js` por assets de `public/assets/items`.
- Mantener `getItemGlyph` solo como fallback temporal.
- `FlItemRow` y `FlItemTile` deben usar el mismo resolver.
- Crafting e Inventario deben mostrar el mismo asset para el mismo item.

System icons:

- Integrar `public/assets/icons/system` con `ForgeIcon` o `FlAsset`.
- Bottom nav, resource counters, stat rows y station cards deben compartir iconografia.
- No mezclar iconos PNG generados con emojis legacy.

Combat:

- `src/data/combatVisuals.js` ya apunta a `/assets/combat`.
- Consolidar enemigos, backgrounds y weekly bosses en `assetRegistry`.
- `Combat.jsx` no debe armar paths nuevos manualmente.
- Mantener fallback por familia solo hasta que exista asset real.

Sanctuary:

- Station cards deben usar `public/assets/sanctuary/stations`.
- La imagen de estacion vive dentro de `FlStationCard`, no como decoracion local.

Talents / Echoes:

- Talent nodes deben usar `public/assets/skills/talents`.
- Echo nodes deben usar `public/assets/skills/echoes`.
- El icon frame sigue siendo el UI Kit; el PNG solo llena el contenido del nodo.

Hero:

- Class portraits deben usar `public/assets/portraits/classes`.
- Header, ficha y selector de clase deben compartir el mismo resolver.

### 8.7 Asset readiness checklist

Antes de marcar un asset como integrado:

- Existe en `public/assets`.
- Tiene nombre estable o alias en registry.
- Se renderiza dentro de un componente Forge.
- Tiene fallback si falta.
- No produce layout shift al cargar.
- Se ve bien en mobile dentro del frame asignado.
- No tiene fondo opaco inesperado si debe ser transparente.
- Tiene `alt` util o `aria-hidden` si es decorativo.
- No se duplica el path en varias pantallas.

### 8.8 Orden recomendado para assets

Los assets deben integrarse en paralelo a las fases de UI:

1. Crear `assetRegistry`.
2. Crear `FlAsset` o resolver assets dentro de `FlIconFrame`.
3. Integrar system icons en primitives.
4. Integrar item assets en Inventario y Crafting.
5. Integrar station assets en Santuario.
6. Integrar talent/echo assets en Talentos y Ecos.
7. Integrar enemy/boss/background assets en Combat y Expedicion.
8. Integrar class portraits en Heroe.
9. Eliminar emojis/placeholders legacy.

Regla practica:

- La falta de un asset no bloquea una primitive.
- La existencia de un asset no justifica crear estilo local.
- El asset se integra cuando el componente contenedor ya esta normalizado.

---

## 9. Orden de Implementacion

### Fase 0 - Preparacion

Objetivo:

- Congelar autoridad visual.
- Evitar trabajo contradictorio.

Tareas:

- Mantener `uirefactor/design2.md` como guia principal.
- Mantener `UI Kit Forge Light.png` como autoridad visual.
- Usar `ui-component-inventory.md` para verificar cobertura.
- Reconocer `public/assets` como fuente de assets reales en integracion progresiva.
- No borrar `uirefactor/design.md` hasta completar migracion.
- Documentar en `uirefactor/progreso_actual.md` que `design2.md` es la nueva fuente candidata.

Verificacion:

- El equipo/IA puede responder que UI Kit gana sobre capturas.

### Fase 1 - Tokens y Aliases

Objetivo:

- Alinear CSS actual con los tokens canonicos sin romper pantallas ya migradas.

Archivos:

- `src/styles/forge-light.css`

Tareas:

- Agregar aliases de `design2.md`.
- Definir tokens de rareza.
- Definir tokens de estado.
- Definir shadows/glows compartidos.
- Definir clases base para focus/pressed/disabled/loading.

No hacer:

- Renombrar todos los tokens existentes de golpe.
- Cambiar layouts de pantalla en esta fase.

Verificacion:

- `npm run build`
- Captura visual sin regresiones fuertes.

### Fase 2 - Asset Registry y FlAsset

Objetivo:

- Permitir que los assets generados entren al juego sin duplicar paths ni estilos.

Archivos nuevos:

- `src/utils/assetRegistry.js`
- `src/components/ui/forge/FlAsset.jsx` si hace falta wrapper visual.

Tareas:

- Mapear assets existentes de `public/assets`.
- Definir fallbacks por tipo: item, icon, enemy, portrait, station, skill.
- Conectar `FlIconFrame` con assets cuando aplique.
- Mantener `ForgeIcon` como fallback vectorial.

No hacer:

- Reemplazar todos los placeholders en esta fase.
- Agregar estilos locales por asset.

Verificacion:

- Un item, un icono de sistema y una estacion pueden resolverse por registry.
- Si falta un asset, la UI no rompe.

### Fase 3 - Primitives Core

Objetivo:

- Crear componentes base que reemplazan estilos locales.

Archivos nuevos:

- `src/components/ui/forge/*`

Tareas:

- Crear `FlButton`.
- Crear `FlIconButton`.
- Crear `FlCard`.
- Crear `FlBadge` y `FlTag`.
- Crear `FlIconFrame`.
- Crear `FlProgressBar`.
- Crear `FlResourceCounter`.
- Crear `FlStatRow`.
- Crear `FlTabs`.
- Crear `FlRequirementHint`.
- Exportar todo desde `index.js`.

No hacer:

- Migrar todas las pantallas mientras los primitives estan incompletos.
- Meter estilos inline salvo para variables puntuales.

Verificacion:

- Build pasa.
- Una pantalla piloto usa al menos `FlButton`, `FlCard`, `FlBadge`, `FlProgressBar`.

### Fase 4 - Shell, Header, Nav y Overlays

Objetivo:

- Normalizar la estructura compartida antes de tocar pantallas profundas.

Archivos:

- `src/App.jsx`
- `src/components/OverlayShell.jsx`
- `src/components/ui/OverlayStationShell.jsx`
- `src/components/ui/SubtabDock.jsx`
- `src/styles/forge-light.css`
- `src/styles/responsive.css`

Tareas:

- Normalizar bottom nav con primitives o clases globales.
- Adaptar `SubtabDock` a `FlTabs` o al mismo CSS.
- Adaptar overlay surfaces al lenguaje de `FlPanel` / `FlCard`.
- Asegurar safe areas.
- Asegurar badges de navegacion consistentes.

Verificacion:

- Todas las pantallas conservan navegacion.
- No hay bottom nav distinto por pantalla.
- Overlays no tapan header/nav de forma accidental.

### Fase 5 - Pantalla Piloto: Crafting

Por que Crafting:

- Tiene muchos componentes Core: tabs, item card, progress, cost, stats, CTA, success.
- Es buena prueba del UI Kit.

Archivos:

- `src/components/Crafting.jsx`
- `src/components/SanctuaryForgeOverlay.jsx`
- `src/components/crafting/craftingUi.js`
- `src/styles/responsive.css`
- `src/styles/forge-light.css`

Tareas:

- Reemplazar CTA local por `FlButton`.
- Reemplazar tabs locales por `FlTabs`.
- Reemplazar paneles por `FlCard` / `FlPanel`.
- Reemplazar stat comparison por `FlStatRow`.
- Reemplazar material/cost/probability por `FlResourceCounter`, `FlCostDisplay`, `FlProgressBar`.
- Integrar item asset real si existe en `public/assets/items`; si no existe, fallback Forge.
- Reservar una banda post-CTA con primitives: `FlRequirementHint` para bloqueo y `FlCard` de feedback para accion lista o ultima accion.
- Mantener logica existente.

Definition of Done:

- `MEJORAR` es un unico CTA primario dorado.
- Success usa verde como estado, no como CTA base.
- No hay tabs duplicadas.
- El item frame coincide con rareza del UI Kit.
- En mobile no queda hueco bajo el CTA sin feedback/estado visible.
- Capturas pasan en 390x844, 430x932, 1280x800.

### Fase 6 - Mochila / Inventario

Archivos:

- `src/components/Inventory.jsx`
- `src/styles/responsive.css`
- `src/styles/forge-light.css`

Tareas:

- Crear/usar `FlItemRow`.
- Integrar assets de `public/assets/items`.
- Normalizar rareza con `FlIconFrame` y `FlBadge`.
- Normalizar tags de afijos con `FlTag`.
- Normalizar CTA `VOLVER A COMBATE` con `FlButton`.
- Normalizar capacity/upgrades con `FlBadge` y `FlProgressBar` si aplica.

Definition of Done:

- Item rows no inventan bordes propios.
- Rarezas son consistentes con UI Kit.
- Upgrade disponible se lee en 1 segundo.
- El detalle largo queda en sheet o seccion expandible.

### Fase 7 - Santuario

Archivos:

- `src/components/Sanctuary.jsx`
- `src/components/JobProgressBar.jsx`
- overlays de santuario relacionados.

Tareas:

- Migrar station cards a `FlStationCard`.
- Integrar assets de `public/assets/sanctuary/stations`.
- Migrar job cards a `FlJobCard`.
- Usar `FlProgressBar` en timers.
- Usar `FlButton` para claim/start/cancel.
- Usar `FlRequirementHint` para locks.
- Mantener overlays de estacion sobre `OverlayShell`/`OverlaySurface` variant Forge y evitar superficies light inline nuevas.

Definition of Done:

- Job listo combina estado verde + CTA dorado.
- Job en progreso usa progress semantico.
- Estaciones comparten card grammar.
- No todas las cards tienen dorado fuerte.
- Overlays de estacion comparten borde/superficie Forge aunque cada estacion mantenga su color semantico de estado.

### Fase 8 - Talentos

Archivos:

- `src/components/Talents.jsx`
- `src/styles/responsive.css`
- `src/styles/forge-light.css`

Tareas:

- Migrar nodos a `FlTalentNode`.
- Integrar assets de `public/assets/skills/talents`.
- Migrar frames a `FlIconFrame`.
- Migrar requisitos a `FlTalentRequirementBadge`.
- Migrar comprar/reset a `FlButton`.
- Mantener layout actual de tramos si funciona.

Definition of Done:

- Comprable, comprado, maxed y locked son distinguibles.
- Requisitos no quedan vacios.
- Solo nodo seleccionado/comprable brilla con fuerza.
- Todo entra en mobile sin scroll incoherente.

### Fase 9 - Combat

Archivos:

- `src/components/Combat.jsx`
- `src/components/Stats.jsx`
- `src/data/combatVisuals.js`

Tareas:

- Normalizar side buttons con `FlIconButton` / `FlCard`.
- Consolidar assets de `public/assets/combat/backgrounds`, `enemies`, `bosses` y `weekly-bosses`.
- Normalizar HP/XP con `FlProgressBar`.
- Normalizar status effects con `FlIconFrame` / `FlBadge`.
- Normalizar stats inferiores con `FlStatRow`.
- Normalizar combat log como `FlPanel`.

Definition of Done:

- Arte sigue dominando, UI no tapa al enemigo.
- Barras usan sistema comun.
- Floating damage respeta feedback visual.
- Bottom nav no cambia estilo.

### Fase 10 - Heroe / Atributos

Archivos:

- `src/components/Character.jsx`
- `src/components/HeroView.jsx`
- `src/components/Skills.jsx`

Tareas:

- Migrar attribute rows a `FlStatRow`.
- Integrar assets de `public/assets/portraits/classes`.
- Migrar equipment slots a `FlIconFrame` / `FlCard`.
- Migrar tabs a `FlTabs`.
- Migrar upgrade/cost buttons a `FlButton` + `FlCostDisplay`.

Definition of Done:

- Atributos son escaneables.
- Deltas usan semantica comun.
- Equipo usa el mismo item frame que inventario.

### Fase 11 - Ecos / Prestige

Archivos:

- `src/components/Prestige.jsx`

Tareas:

- Migrar readiness card a `FlCard`.
- Integrar assets de `public/assets/skills/echoes`.
- Migrar echo counter a `FlResourceCounter`.
- Migrar upgrade cards/nodes a `FlCard` / `FlIconFrame`.
- Migrar confirmation a `FlConfirmDialog`.
- Usar `FlRequirementHint` para locked states.

Definition of Done:

- Violeta comunica ecos/arcano, no domina toda la pantalla.
- CTA de prestige es dorado si es accion primaria.
- Perdidas y conservado se leen antes de confirmar.

### Fase 12 - Expedicion e Intel

Archivos:

- `src/components/ExpeditionView.jsx`
- `src/components/Codex.jsx`
- `src/components/RegistryView.jsx`

Tareas:

- Migrar tier cards a `FlCard`.
- Integrar bosses/enemies/rewards desde `assetRegistry` cuando aplique.
- Migrar tier progress a `FlTierProgressTrack`.
- Migrar boss cards a `FlBossCard`.
- Migrar codex entries a `FlCard` / `FlListRow`.
- Migrar search/filter a primitives o wrappers consistentes.

Definition of Done:

- Tier actual y boss se entienden rapido.
- Requirements usan el mismo patron que talentos/crafting.
- Intel no parece una pantalla documental plana.

### Fase 12b - Progreso Offline

Archivos:

- `src/App.jsx`
- `src/styles/forge-light.css`

Tareas:

- Mantener el resumen como panel global Forge o sheet, nunca como card light inline.
- Migrar metricas a `FlCard` compactas con `ForgeIcon`.
- Migrar barra de resolucion a `FlProgressBar`.
- Usar `FlButton` / `FlIconButton` para cerrar.
- Integrar el mejor drop con `FlAsset` y `assetRegistry`.

Definition of Done:

- El panel se ve como reward Forge en 390x844, 430x932 y 1280x800.
- La animacion no cambia dimensiones ni oculta texto importante.
- Drop raro muestra asset y rareza, con fallback si falta imagen.

### Fase 13 - Limpieza

Objetivo:

- Reducir deuda de estilos duplicados.

Tareas:

- Buscar botones locales restantes.
- Buscar hex directos en JSX.
- Buscar paths duplicados de `/assets/`.
- Buscar `borderRadius`, `boxShadow`, `background` inline en componentes migrados.
- Mover estilos repetidos a `forge-light.css`.
- Eliminar clases legacy no usadas.
- Eliminar emojis/placeholders reemplazados por assets reales.
- Actualizar `progreso_actual.md`.

Comandos utiles:

```bash
rg "background:|borderRadius|boxShadow|#[0-9A-Fa-f]{3,6}" src/components
rg "button" src/components
rg "fl-button|fl-card|fl-badge|fl-progress" src
rg "/assets/" src
```

---

## 10. Definition of Done Global

Una pantalla se considera migrada solo si cumple:

- Usa primitives Forge para botones, cards, badges/tags, progress y recursos.
- No crea variantes visuales locales para componentes Core.
- El CTA principal es unico y consistente.
- Disabled/loading/success/error estan contemplados.
- Los colores semanticos coinciden con `design2.md`.
- Rarity indicators coinciden con UI Kit.
- Assets reales se usan cuando existen y siempre dentro de wrappers Forge.
- Assets faltantes tienen fallback consistente.
- Mobile 390x844 no corta contenido clave.
- Mobile 430x932 no solapa texto ni nav.
- 1280x800 no estira cards de forma torpe.
- `npm run build` pasa.
- `npm run ui:capture` no genera errores JS.
- La captura se audita contra UI Kit, no solo contra una captura vieja.

---

## 11. Reglas Anti-Duplicacion para IAs

Cuando una IA toque una pantalla:

- Debe revisar `uirefactor/design2.md` antes de decidir visuales.
- Debe revisar si ya existe primitive en `src/components/ui/forge/`.
- Debe extender primitive existente antes de crear componente local.
- No debe crear hex nuevos salvo que actualice tokens.
- No debe crear botones/cards/badges locales si existe primitive.
- No debe usar emojis como iconos finales.
- No debe armar paths de `public/assets` manualmente dentro de pantallas si existe `assetRegistry`.
- No debe insertar assets con estilos locales si existe `FlAsset`, `FlIconFrame` o wrapper de dominio.
- No debe mover logica de juego salvo que sea necesario para presentar datos.
- No debe mezclar migracion visual con refactor de gameplay.
- Debe dejar la pantalla funcionando con datos reales, no solo mock visual.

Si necesita una excepcion:

- documentar por que;
- limitarla a la pantalla;
- abrir tarea para convertirla en primitive si se repite.

---

## 12. Mapping desde UI Component Inventory

### Core que deben convertirse en primitives o wrappers

- Button -> `FlButton`
- Icon Button -> `FlIconButton`
- Badge -> `FlBadge`
- Tag / Chip -> `FlTag`
- Progress Bar -> `FlProgressBar`
- Resource Counter -> `FlResourceCounter`
- Cost Display -> `FlCostDisplay`
- Reward Display -> `FlRewardDisplay`
- Stat Row -> `FlStatRow`
- Delta Indicator -> parte de `FlStatRow`
- Card -> `FlCard`
- List Row -> `FlCard` variant row o `FlListRow`
- Grid Tile -> `FlCard` variant tile
- Tooltip -> wrapper posterior
- Modal Dialog / Bottom Sheet -> extender `OverlayShell`
- Section Header -> `FlSectionHeader`
- Empty State -> `FlEmptyState`
- Error State -> `FlEmptyState` variant error
- Filter Panel -> wrapper posterior
- Sort Control -> `FlTabs` / select wrapper posterior

### Domain Core que deben usar wrappers

- Item Tile / Row / Detail -> `FlItemTile`, `FlItemRow`, `FlItemDetailBlock`
- Talent Node / Detail -> `FlTalentNode`, `FlTalentDetailPanel`
- Job Card / Progress -> `FlJobCard`, `FlJobProgress`
- Station Card -> `FlStationCard`
- Boss Card -> `FlBossCard`
- Expedition Tier Card -> `FlExpeditionTierCard`
- Echo Upgrade Card -> `FlEchoUpgradeCard`
- Character Sheet / Attribute Grid -> screen composition + `FlStatRow`

### Optional que no bloquean migracion

- Drawer
- Floating Action Button
- Tree Mini Map
- Reward Reveal Sequence
- Patch Notes
- Profile Summary
- Pull To Refresh
- Conflict Resolution Dialog

No implementar Optional hasta que Core e Important esten estabilizados.

---

## 13. Validacion y Capturas

Comandos esperados:

```bash
npm run build
npm run ui:capture
```

Capturas a revisar:

- `uirefactor/current/combat-390x844.png`
- `uirefactor/current/combat-430x932.png`
- `uirefactor/current/combat-1280x800.png`
- repetir para cada pantalla migrada.

Checklist por captura:

- CTA principal claro.
- Bottom nav consistente.
- Header consistente.
- Cards coinciden con UI Kit.
- Badges coinciden con UI Kit.
- Barras coinciden con UI Kit.
- Rarezas coinciden con UI Kit.
- Assets reales cargan sin fondos incorrectos, pixelado fuerte ni layout shift.
- Texto no se solapa.
- Nada queda bajo safe area.
- No hay apariencia SaaS/plana.

---

## 14. Slices de Trabajo Recomendados

Para evitar PRs gigantes, dividir asi:

1. Tokens + aliases + `FlButton`.
2. `assetRegistry` + `FlAsset` + primer fallback.
3. `FlCard`, `FlBadge`, `FlIconFrame`.
4. `FlProgressBar`, `FlResourceCounter`, `FlStatRow`.
5. `FlTabs`, `FlRequirementHint`, overlay normalization.
6. Crafting usando primitives + item assets.
7. Inventario usando primitives + item assets.
8. Santuario usando primitives + station assets.
9. Talentos usando primitives + skill assets.
10. Combat usando primitives + combat assets.
11. Heroe/Atributos usando primitives + portrait assets.
12. Ecos usando primitives + echo assets.
13. Expedicion/Intel usando primitives + boss/system assets.
14. Cleanup de estilos duplicados y placeholders.

Cada slice debe poder compilar y capturarse.

---

## 15. Criterio de Exito

La migracion es exitosa si:

- Un usuario no percibe que cada pantalla viene de una captura distinta.
- Una IA nueva puede tocar una pantalla sin inventar un sistema local.
- Los componentes Core de `ui-component-inventory.md` tienen implementacion compartida o wrapper claro.
- Los assets reales de `public/assets` estan conectados mediante registry/wrappers, no pegados pantalla por pantalla.
- El UI Kit es reconocible en todas las pantallas.
- Las capturas viejas siguen informando gameplay, pero ya no dictan estilos inconsistentes.

---

## 16. Control de Cumplimiento para IAs

Esta seccion existe para asegurar que una IA no ignore el plan y vuelva a crear estilos locales por pantalla.

### 16.1 Prompt obligatorio para cualquier IA que migre UI

Antes de pedirle trabajo a una IA, incluir este bloque en el prompt:

```txt
Estas migrando UI Forge Light. Debes seguir obligatoriamente:
- uirefactor/design2.md
- uirefactor/design-system-implementation-plan.md
- ui-component-inventory.md
- uirefactor/nuevoDesign/UI Kit Forge Light.png

Reglas duras:
- El UI Kit gana sobre cualquier captura vieja.
- No crees botones/cards/badges/progress/tabs locales si existe o debe existir un primitive Forge.
- Usa o crea primitives en src/components/ui/forge/.
- Usa src/utils/assetRegistry.js para assets de public/assets.
- No pegues paths /assets/ directo en pantallas salvo excepcion justificada.
- No agregues hex nuevos en JSX.
- No mezcles refactor visual con cambios de gameplay.
- Mantene la pantalla funcionando con datos reales.
- Al terminar, corre build/capturas si aplica y reporta que gates pasaron o que no pudieron correrse.
```

### 16.2 Pre-flight obligatorio

Antes de editar una pantalla, la IA debe declarar:

- pantalla o slice que va a tocar;
- primitives Forge que va a usar o crear;
- assets de `public/assets` que va a integrar;
- archivos esperados a modificar;
- referencias visuales secundarias que solo usara para layout;
- riesgos de overflow/mobile si existen.

Si no puede responder esto, no debe empezar a editar.

### 16.3 Hard gates durante implementacion

La IA debe detenerse y corregir si aparece cualquiera de estos casos:

- Creo un boton local nuevo en una pantalla.
- Creo una card local nueva que podria ser `FlCard`.
- Creo un badge/tag local nuevo que podria ser `FlBadge` / `FlTag`.
- Agrego un nuevo hex en JSX.
- Agrego un path `/assets/...` dentro de un componente de pantalla en vez de registry/wrapper.
- Uso emoji como icono final.
- Copio un estilo de captura vieja que contradice el UI Kit.
- Cambio logica de juego para resolver un problema visual.
- La pantalla solo se ve bien en un viewport.

### 16.4 Comandos de auditoria rapida

Despues de cada slice, ejecutar o justificar por que no se pudo ejecutar:

```bash
npm run build
npm run ui:capture
```

Auditorias por busqueda:

```bash
rg "background:|borderRadius|boxShadow|#[0-9A-Fa-f]{3,6}" src/components
rg "/assets/" src/components src/data src/utils
rg "🎒|📦|🏺|⚔|🛡|🏹|✦|⬢" src
rg "button" src/components
rg "fl-button|FlButton|fl-card|FlCard|fl-badge|FlBadge|fl-progress|FlProgressBar" src
```

Interpretacion:

- Los primeros comandos no tienen que dar cero siempre, pero todo resultado nuevo debe estar justificado.
- Hex nuevos en JSX son sospechosos por defecto.
- Emojis en UI final son deuda a eliminar.
- Paths `/assets/` deben concentrarse en `assetRegistry`, data visual centralizada o wrappers.

### 16.5 Reporte obligatorio al cerrar un slice

La IA debe cerrar cada slice con este formato:

```txt
Slice:
Pantallas tocadas:
Primitives creadas/usadas:
Assets integrados:
Estilos locales eliminados:
Excepciones justificadas:
Comandos corridos:
Capturas revisadas:
Riesgo residual:
Proximo slice recomendado:
```

No aceptar un cierre que solo diga "listo" sin indicar primitives, assets y validacion.

### 16.6 Checklist de review humano/IA

Antes de aprobar una pantalla:

- El CTA principal usa `FlButton`.
- Cards principales usan `FlCard` o wrapper de dominio.
- Badges/tags usan `FlBadge` / `FlTag`.
- Barras usan `FlProgressBar`.
- Recursos usan `FlResourceCounter`.
- Tabs/subtabs usan `FlTabs` o componente alineado.
- Assets entran por `assetRegistry` / `FlAsset` / wrapper de dominio.
- La pantalla no tiene una estetica distinta al UI Kit.
- La captura vieja solo se uso para layout y jerarquia.
- No hay colores semanticos usados como base visual arbitraria.
- Mobile y desktop comparten el mismo lenguaje, no dos disenos distintos.

### 16.7 Migration ledger

Mantener una tabla de avance en `uirefactor/progreso_actual.md` o en un archivo de auditoria equivalente:

```txt
Pantalla | Estado | Primitives usadas | Assets integrados | Capturas OK | Deuda pendiente
```

Estados sugeridos:

- Not started
- Primitive-ready
- Migrated first pass
- Captured
- Audited against UI Kit
- Needs polish
- Done

Regla:

- Una pantalla no puede marcarse `Done` si no fue capturada y auditada contra el UI Kit.
- Una pantalla con placeholders puede estar `Migrated first pass`, pero no `Done` si el asset real ya existe en `public/assets`.

### 16.8 Estrategia anti-deriva

Cada vez que una segunda pantalla necesite una variante parecida:

- no duplicar CSS;
- subir la variante al primitive;
- migrar la primera pantalla a la nueva variante;
- documentar la variante si cambia la API.

Ejemplo:

- Si Inventario y Crafting necesitan item card compacta, crear `FlItemCard variant="compact"`.
- Si Santuario y Expedicion necesitan card con progreso, crear variante de `FlCard` o wrapper comun.
- Si Talentos y Ecos usan nodos, compartir `FlIconFrame` y estados de node.

### 16.9 Gate final de coherencia

Antes de declarar completa la migracion:

- correr capturas de todas las pantallas;
- abrir el UI Kit al lado de las capturas actuales;
- revisar componentes repetidos pantalla por pantalla;
- buscar estilos inline nuevos;
- buscar assets pegados directo;
- buscar emojis legacy;
- actualizar ledger;
- listar deuda residual explicitamente.

La migracion solo se considera cerrada cuando el problema original desaparece: ninguna pantalla debe sentirse copiada de una referencia distinta.
