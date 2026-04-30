# Prompt Maestro Forge Light v3

Objetivo: convertir las referencias fullpage de `uirefactor/fullpage/redesign/` en un sistema visual implementable, no en una coleccion de pantallas copiadas. La meta es que una IA pueda tomar `Combat Full.png` como piloto y llegar al look propuesto en una pasada controlada, usando componentes reutilizables y reglas verificables.

Este prompt reemplaza recomendaciones sueltas. Seguilo en orden. No saltees la fase de documentacion ni la fase de UI Kit.

---

## 0. Contexto Del Repo

Proyecto:

- Idle RPG mobile-first en React.
- Estilos Forge actuales en `src/styles/forge-light.css` y `src/styles/responsive.css`.
- Componentes principales en `src/components/`.
- Inventario funcional de componentes en `ui-component-inventory.md`.

Referencias nuevas:

- `uirefactor/fullpage/redesign/UI KIT.png`
- `uirefactor/fullpage/redesign/Combat Full.png`
- `uirefactor/fullpage/redesign/Mochila Full.png`
- `uirefactor/fullpage/redesign/Forja Full.png`
- `uirefactor/fullpage/redesign/Santuario Full.png`
- `uirefactor/fullpage/redesign/Talentos Full.png`
- `uirefactor/fullpage/redesign/Ecos Full.png`
- `uirefactor/fullpage/redesign/Intel Full.png`
- `uirefactor/fullpage/redesign/Biblioteca Full.png`
- `uirefactor/fullpage/redesign/Destileria Full.png`
- `uirefactor/fullpage/redesign/Ficha Heroe Full.png`
- `uirefactor/fullpage/redesign/Atributos Heroe Full.png`
- `uirefactor/fullpage/redesign/Progreso_Offline.png`

Documentos existentes que se deben leer antes de escribir:

- `uirefactor/design2.md`
- `uirefactor/design-system-implementation-plan.md`
- `ui-component-inventory.md`
- `src/styles/forge-light.css`
- `src/styles/responsive.css`

Importante sobre las capturas fullpage:

- `Combat Full.png` es una captura vertical completa, no un viewport unico.
- La referencia manda principalmente por su ancho: proporciones horizontales, margenes laterales, ancho de panels, ubicacion de side actions, escala de barras, ritmo de columnas y densidad visual.
- El alto extra de la captura representa scroll vertical, no contenido que deba entrar en un viewport.
- En 390x844 y 430x932 solo se vera una porcion de la pantalla.
- El objetivo no es meter toda la captura en el primer viewport.
- El objetivo tampoco es reescalar la fullpage completa hasta que entre: eso destruiria la legibilidad y la densidad.
- El objetivo es que cada viewport visible conserve la estetica, densidad, bordes, fondos, jerarquia y lenguaje Forge Light de la referencia.
- La implementacion debe definir que se ve en el primer viewport, que queda debajo del fold y como continua el scroll.
- Traduccion correcta: conservar el ancho/distribucion horizontal de la referencia y dejar que el alto fluya naturalmente en scroll.

---

## 1. Regla De Autoridad

Usar este orden de decision:

1. `uirefactor/fullpage/redesign/UI KIT.png`
2. `uirefactor/design3.md`, cuando exista
3. `uirefactor/ui-kit.md`, cuando exista
4. `uirefactor/fullpage/redesign/<Pantalla> Full.png`
5. `ui-component-inventory.md`
6. `uirefactor/design2.md`
7. Codigo actual

Reglas de conflicto:

- El UI Kit manda sobre botones, cards, panels, barras, badges, rarezas, icon frames, navegacion, feedback y microelementos.
- Las referencias fullpage mandan sobre composicion, layout, jerarquia visual, densidad, proporciones horizontales, ancho de bloques y orden vertical de zonas.
- El alto de una referencia fullpage no manda como viewport; manda como continuidad de scroll.
- El codigo actual manda sobre datos, gameplay, reducers, balance y reglas funcionales.
- Si una referencia muestra un componente distinto al UI Kit, se conserva la funcion y se normaliza el componente al UI Kit.
- Si una pantalla no se parece a `Combat Full.png` en densidad, peso, fondo, bordes y jerarquia, el sistema visual todavia no esta listo.

---

## 2. Objetivo Visual

Forge Light no significa "oscuro con dorado".

Forge Light significa:

- dark fantasy premium;
- metal oscuro trabajado;
- UI tactil con peso fisico;
- fondos con textura, escena o profundidad;
- dorado/bronce como estructura, seleccion y accion principal;
- color vivo solo para semantica;
- lectura rapida de progreso, loot, peligro y recompensa;
- estetica de RPG mobile, no dashboard SaaS.

Debe transmitir:

- combate;
- progreso;
- loot;
- forja;
- peligro;
- recompensa;
- permanencia.

No debe verse como:

- app mobile generica;
- dark mode plano;
- dashboard web;
- UI minimalista limpia;
- coleccion de cards grises;
- fantasia cartoon;
- todo dorado;
- todo gris.

---

## 3. Entregables Obligatorios Antes De Implementar Pantallas

Crear o reemplazar estos archivos:

```txt
uirefactor/design3.md
uirefactor/ui-kit.md
uirefactor/component-map.md
uirefactor/implementation-plan-v3.md
```

No implementar una pantalla completa antes de tener estos cuatro artefactos.

Definition of Done de esta fase:

- `design3.md` explica la direccion visual con reglas ejecutables.
- `ui-kit.md` define componentes, variantes, estados, anatomia y restricciones.
- `component-map.md` mapea cada zona de pantalla a primitives concretas.
- `implementation-plan-v3.md` define fases, archivos, gates y orden de migracion.

---

## 4. Crear `design3.md`

Crear `uirefactor/design3.md` como contrato visual profundo y accionable.

Estructura obligatoria:

```md
# Forge Light Design System v3

## 1. Objetivo
## 2. Autoridades Visuales
## 3. Identidad Visual
## 4. Principios Globales
## 5. Reglas De Color
## 6. Reglas De Dorado Y Bronce
## 7. Tipografia Y Jerarquia
## 8. Layout Mobile-First
## 9. Shell Global
## 10. Tokens Canonicos
## 11. Componentes Primitivos
## 12. Componentes Compuestos
## 13. Screen Recipes
## 14. Estados Visuales
## 15. Feedback Y Microinteracciones
## 16. Assets Y Fondos
## 17. Reglas Responsive
## 18. Anti-Patrones Prohibidos
## 19. Checklist De Aceptacion
## 20. Reglas Para IA/Codex
```

Requisitos:

- No ser generico.
- No decir solo "usar dorado".
- Explicar cuando usar dorado, cuando no usarlo y con que intensidad.
- Explicar cuando usar rojo, verde, azul, violeta y naranja.
- Explicar como respetar layout de una referencia.
- Explicar como traducir una captura fullpage vertical a viewports reales.
- Explicar que zonas deben aparecer arriba del fold en mobile.
- Explicar que zonas pueden quedar debajo del fold sin romper la experiencia.
- Incluir reglas especificas para mobile 390x844, 430x932 y desktop/tablet 1280x800.
- Incluir la seccion: `Si una pantalla no se parece a Combat Full, revisar estos puntos`.

### Screen Recipes Obligatorias

Cada recipe debe tener:

```md
## <Pantalla> Recipe

Referencia:
- `uirefactor/fullpage/redesign/<archivo>.png`

Objetivo:
- Que comunica la pantalla.

Zonas:
- Lista ordenada de bloques visuales.

Componentes usados:
- Lista de primitives y componentes compuestos.

Reglas de composicion:
- Proporcion, jerarquia, scroll, foco visual.

Diferencias permitidas:
- Variaciones aceptables por datos reales/responsive.

Diferencias no permitidas:
- Cosas que rompen el look.
```

Recipes minimas:

- Combat Full
- Mochila Full
- Forja Full
- Santuario Full
- Talentos Full
- Ecos Full
- Intel Full
- Biblioteca Full
- Destileria Full
- Ficha Heroe Full
- Atributos Heroe Full
- Progreso Offline

### Anti-Patrones Prohibidos

Incluir explicitamente:

- No usar botones verdes como CTA primario.
- No usar cards planas sin textura, borde ni profundidad.
- No usar bordes grises genericos para componentes Forge.
- No usar sombras SaaS suaves como base visual.
- No usar gradientes modernos tipo dashboard.
- No usar colores de rareza como base de UI.
- No hacer todo dorado.
- No hacer todo gris.
- No crear botones/cards/barras diferentes por pantalla.
- No hardcodear colores en JSX.
- No poner estilos Forge nuevos en `responsive.css` si pertenecen a un primitive.
- No cambiar gameplay, balance ni reducers para resolver problemas visuales.

---

## 5. Crear `ui-kit.md`

Crear `uirefactor/ui-kit.md` como especificacion tecnica del UI Kit, usando `uirefactor/fullpage/redesign/UI KIT.png` como referencia principal.

No alcanza con listar componentes. Cada componente debe tener:

```md
## FlButton

Uso:
- Donde se usa y para que.

Anatomia:
- Capas visuales internas.

Variantes:
- primary, secondary, ghost, danger, success, compact, icon-only, etc.

Estados:
- default, hover/focus, pressed, selected, disabled, loading, success, error.

Tamanos:
- sm, md, lg, full-width.

Tokens:
- Tokens CSS que debe usar.

API React:
- Props esperadas.

Clases CSS:
- `.fl-button`, `.fl-button--primary`, etc.

No permitido:
- Reglas que rompen el sistema.
```

Componentes minimos:

- `FlButton`
- `FlIconButton`
- `FlPanel`
- `FlCard`
- `FlSectionHeader`
- `FlBadge`
- `FlTag`
- `FlProgressBar`
- `FlHealthBar`
- `FlResourceCounter`
- `FlResourcePill`
- `FlStatRow`
- `FlStatStrip`
- `FlIconFrame`
- `FlTabs`
- `FlBottomNav`
- `FlHeaderBar`
- `FlSideAction`
- `FlItemCard`
- `FlItemRow`
- `FlTalentNode`
- `FlModal`
- `FlToast`
- `FlTooltip`
- `FlEmptyState`
- `FlRequirementHint`

Componentes compuestos minimos:

- `CombatTierTrack`
- `CombatEnemyStage`
- `CombatPlayerHud`
- `CombatSideActions`
- `ContractCard`
- `WeeklyLedgerCard`
- `WeeklyBossCard`
- `InventoryEquippedCard`
- `InventoryItemList`
- `ForgeUpgradePanel`
- `SanctuaryJobCard`
- `TalentTreePanel`
- `EchoPrestigePanel`

---

## 6. Crear `component-map.md`

Crear `uirefactor/component-map.md`. Este documento evita que la IA invente cada pantalla desde cero.

Formato:

```md
# Component Map Forge Light

## Combat Full

Referencia:
- `uirefactor/fullpage/redesign/Combat Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Resource counters -> `FlResourceCounter`
- Tier track -> `CombatTierTrack`
- Enemy stage -> `CombatEnemyStage`
- Enemy HP -> `FlHealthBar variant="enemy"`
- Player HUD -> `CombatPlayerHud`
- Side actions -> `CombatSideActions` + `FlSideAction`
- Stat strip -> `FlStatStrip`
- Active contract -> `ContractCard`
- Weekly ledger -> `WeeklyLedgerCard`
- Weekly boss -> `WeeklyBossCard`
- Combat log -> `FlPanel` + collapsible content
- Reset action -> `FlButton variant="danger-ghost"`
- Bottom nav -> `FlBottomNav`

Notas:
- Layout local permitido solo para ordenar zonas.
- Estilo visual debe venir de primitives.
```

Pantallas obligatorias en el map:

- Combat Full
- Mochila Full
- Forja Full
- Santuario Full
- Talentos Full
- Ecos Full
- Intel Full
- Biblioteca Full
- Destileria Full
- Ficha Heroe Full
- Atributos Heroe Full
- Progreso Offline

---

## 7. Crear `implementation-plan-v3.md`

Crear `uirefactor/implementation-plan-v3.md` con fases tecnicas claras.

Fases obligatorias:

```txt
Fase 0: Auditoria
Fase 1: Documentacion v3
Fase 2: Reverse engineering visual de Combat Full
Fase 3: Tokens
Fase 4: Primitives Forge
Fase 5: Demo UI Kit
Fase 6: Shell global
Fase 7: Combat Full piloto
Fase 8: Captura y QA visual
Fase 9: Migracion por pantallas
Fase 10: Limpieza de deuda visual
```

Cada fase debe incluir:

- objetivo;
- archivos a tocar;
- archivos que no se deben tocar;
- criterios de aceptacion;
- riesgos;
- verificacion.

Orden recomendado:

1. Consolidar tokens en `src/styles/forge-light.css`.
2. Crear primitives en `src/components/ui/forge/`.
3. Crear demo visual del kit.
4. Migrar header/resources/nav si corresponde.
5. Implementar `Combat Full` como piloto.
6. Capturar y comparar.
7. Migrar pantallas restantes.

No migrar toda la app antes de aceptar `Combat Full`.

---

## 7.1 Reverse Engineering Visual De Combat Full

Antes de escribir codigo para Combat, crear una seccion en `design3.md` y otra en `implementation-plan-v3.md` llamada `Combat Full Visual Breakdown`.

Esta seccion debe analizar `uirefactor/fullpage/redesign/Combat Full.png` como si fuera un blueprint.

Debe incluir:

```md
## Combat Full Visual Breakdown

Referencia:
- `uirefactor/fullpage/redesign/Combat Full.png`

Dimensiones de referencia:
- ancho/alto de la imagen;
- ancho de referencia como base de escala horizontal;
- relacion aproximada entre ancho de referencia y viewport mobile;
- diferencia entre alto fullpage y alto de viewport;
- zonas visibles por fold.

Regla ancho-vs-alto:
- El ancho de la referencia define la escala del layout.
- Los margenes laterales, gutters, ancho de cards, ancho de barras, posicion de side actions y proporcion del enemy stage deben traducirse al viewport disponible.
- El alto completo no se comprime ni se reescala: se divide en tramos de scroll.
- La fullpage es una guia de continuidad vertical, no una exigencia de contenido above-the-fold.

Mapa vertical:
- 0-15%: header + tier/progression
- 15-45%: enemy stage + HP + side actions + player HUD
- 45-55%: stat strip
- 55-70%: active contract
- 70-84%: weekly ledger
- 84-96%: weekly boss
- 96-100%: combat log/reset/bottom nav

Primer viewport mobile esperado:
- Debe mostrar header, tier, enemy stage dominante, enemy HP, side actions y parte del player HUD/stat strip.
- No necesita mostrar todas las cards inferiores.
- Debe sentirse completo aunque el usuario todavia no scrollee.

Reglas de proporcion:
- Conservar primero las proporciones horizontales de la referencia.
- Header compacto, no hero.
- Stage enemigo dominante.
- Cards inferiores full-width con padding consistente.
- Bottom nav fijo o persistentemente reconocible segun arquitectura actual.
- No reducir tipografia, barras, iconos o cards para forzar que entren mas zonas verticales.
- Si hay conflicto entre mostrar mas contenido y mantener escala legible, gana la escala legible.

Firma visual:
- Fondo oscuro con escena/arte, no color plano.
- Marcos dorado/bronce con esquinas facetadas.
- Tipografia display para titulos y numeros importantes.
- Barras con frame metalico y fill saturado.
- Icon frames ornamentales.
- Separadores finos con pequenos ornamentos.
```

Regla critica:

- No implementar Combat hasta tener este breakdown escrito.
- Si el breakdown no dice que se ve en el primer viewport, la IA va a intentar comprimir toda la captura y el resultado va a fallar.
- Si el breakdown no separa reglas de ancho y reglas de scroll vertical, la implementacion va a interpretar mal la referencia.

---

## 8. Tokens CSS Canonicos

Usar los tokens existentes como base y agregar aliases semanticos. No romper tokens viejos de golpe.

Los primitives deben leer tokens semanticos:

```css
:root {
  --fl-bg-main: var(--fl-bg-0, #0b0f14);
  --fl-bg-surface: var(--fl-bg-1, #121821);
  --fl-bg-card: var(--fl-bg-2, #161d27);
  --fl-bg-card-deep: #0d1118;
  --fl-bg-input: #0a0d12;

  --fl-gold-border: var(--fl-gold-2, #c6a15b);
  --fl-gold-glow: var(--fl-gold-1, #e6c47a);
  --fl-gold-hover: var(--fl-gold-0, #f0d28a);
  --fl-gold-deep: var(--fl-gold-3, #7c531f);
  --fl-gold-muted: var(--fl-border-soft, rgba(198, 161, 91, 0.38));

  --fl-text-primary: var(--fl-text-0, #f2e6c8);
  --fl-text-secondary: var(--fl-text-1, #b8aa8f);
  --fl-text-body: var(--fl-text-2, #b8aa8f);
  --fl-text-muted: #7f7564;
  --fl-text-disabled: #55504a;

  --fl-success: var(--fl-green, #4fd18b);
  --fl-danger: var(--fl-red, #e05a5a);
  --fl-arcane: var(--fl-purple, #8a5be8);
  --fl-defense: var(--fl-blue, #4a8fe7);
  --fl-reward: var(--fl-orange, #f2b84b);

  --fl-rarity-common: #8e8e8e;
  --fl-rarity-magic: var(--fl-success, #4fd18b);
  --fl-rarity-rare: var(--fl-defense, #4a8fe7);
  --fl-rarity-epic: var(--fl-arcane, #b455e8);
  --fl-rarity-legendary: #f29a2e;

  --fl-radius-sm: 4px;
  --fl-radius-md: 6px;
  --fl-radius-lg: 8px;

  --fl-border-thin: 1px;
  --fl-border-card: 1px;
  --fl-border-active: 2px;

  --fl-shadow-card: 0 12px 30px rgba(0, 0, 0, 0.42);
  --fl-shadow-inset: inset 0 1px 0 rgba(255, 232, 180, 0.08);
  --fl-glow-gold-soft: 0 0 16px rgba(230, 196, 122, 0.22);
  --fl-glow-gold-strong: 0 0 28px rgba(230, 196, 122, 0.36);
  --fl-glow-success: 0 0 20px rgba(79, 209, 139, 0.26);
  --fl-glow-danger: 0 0 20px rgba(224, 90, 90, 0.26);
}
```

Reglas:

- No agregar hex nuevos dentro de componentes React.
- No duplicar tokens locales por pantalla salvo layout muy especifico.
- Si un color se repite, convertirlo en token.
- Si una sombra, borde o clip-path se repite, convertirlo en primitive.

---

## 9. Implementar Primitives Antes De Combat

Crear o completar:

```txt
src/components/ui/forge/
  index.js
  FlButton.jsx
  FlIconButton.jsx
  FlPanel.jsx
  FlCard.jsx
  FlSectionHeader.jsx
  FlBadge.jsx
  FlTag.jsx
  FlProgressBar.jsx
  FlHealthBar.jsx
  FlResourceCounter.jsx
  FlResourcePill.jsx
  FlStatRow.jsx
  FlStatStrip.jsx
  FlIconFrame.jsx
  FlTabs.jsx
  FlBottomNav.jsx
  FlHeaderBar.jsx
  FlSideAction.jsx
  FlModal.jsx
  FlToast.jsx
  FlTooltip.jsx
  FlEmptyState.jsx
  FlRequirementHint.jsx
```

Reglas:

- Usar props consistentes: `variant`, `size`, `tone`, `rarity`, `selected`, `disabled`, `loading`, `className`, `children`.
- Los estados interactivos deben ser visibles.
- Loading no debe cambiar ancho ni alto.
- Disabled debe comunicar razon cuando aplique.
- No crear un primitive si no se usa, pero no resolver pantallas con CSS duplicado si el primitive es claramente necesario.

---

## 10. Crear Demo Del UI Kit

Antes de redisenar pantallas, crear una demo interna del kit.

Opciones aceptables:

- ruta interna `/forge-light-kit-demo`, si el routing lo permite;
- componente dev-only montable desde `App.jsx`;
- pantalla temporal documentada en el plan.

Debe mostrar:

- botones en todos los estados;
- cards y panels;
- progress bars;
- HP enemy/player;
- recursos;
- badges/tags;
- rarezas;
- item cards;
- stat strips;
- bottom nav;
- side actions;
- modal/toast/tooltip si existen;
- mobile-width layout.

No tocar logica de juego para la demo.

---

## 11. Assets, Fondos Y Texturas

El look de `Combat Full.png` no se logra solo con CSS. La pantalla depende de arte, fondos, retratos, icon frames, textura y capas de profundidad.

Texturas disponibles:

```txt
public/assets/forge-light/textures/fl-metal-grain-overlay.png
public/assets/forge-light/textures/fl-panel-noise-overlay.png
```

Estas texturas son PNG con fondo transparente y marcas de textura en escala de grises. Deben usarse como overlays sobre fondos oscuros, no como fondo principal opaco.

Antes de implementar Combat, auditar:

- `src/data/combatVisuals.js`
- `src/utils/assetRegistry.js`
- assets existentes en `public/` y `src/`
- fondos actuales usados por Combat
- iconos existentes en `src/components/icons/ForgeIcon.jsx`

Reglas:

- Si ya existen assets compatibles, usarlos.
- Si faltan assets, documentar placeholders y deuda visual.
- No reemplazar una escena ilustrada por un gradiente plano.
- No usar fondos borrosos genericos si la referencia necesita un lugar/personaje reconocible.
- No ocultar la falta de asset con exceso de glow o sombras.
- El enemy stage debe tener profundidad: fondo, personaje/visual, vignette, overlays y HUD.
- Usar `fl-metal-grain-overlay.png` para superficies metalicas, botones, barras, nav, marcos o panels con peso fisico.
- Usar `fl-panel-noise-overlay.png` para cards, panels, modales y superficies oscuras de lectura.
- Controlar color/intensidad desde CSS con background base, pseudo-elements, opacity, blend mode o masks.
- No editar las texturas para hardcodear un color unico; deben seguir siendo overlays reutilizables.

En `design3.md` documentar:

- tipos de fondo permitidos;
- tratamiento de vignette;
- tratamiento de personaje/enemigo;
- textura de paneles;
- reglas para iconos y frames.

En `implementation-plan-v3.md` documentar:

- que assets se usan ahora;
- que assets faltan;
- que componentes consumen assets;
- que deuda visual queda si no se generan assets nuevos.

---

## 12. Combat Full Como Piloto

Despues de aceptar documentacion, tokens, primitives y demo, implementar `Combat Full` como primera pantalla real.

Referencia principal:

- `uirefactor/fullpage/redesign/Combat Full.png`

Archivos probables:

- `src/components/Combat.jsx`
- `src/styles/forge-light.css`
- `src/styles/responsive.css`
- `src/components/ui/forge/*`
- assets o registry solo si hace falta

Objetivo:

Recrear la composicion de `Combat Full` sin cambiar logica de combate, preservando la escala horizontal y dejando que el alto se resuelva por scroll.

Zonas obligatorias:

1. App header con portrait/class, estado, recursos y menu.
2. Tier progression header.
3. Enemy stage full-bleed con fondo/arte dominante.
4. Enemy HP bar.
5. Side action rail.
6. Player HUD con HP y XP.
7. Stat strip.
8. Active contract card.
9. Weekly ledger card.
10. Weekly boss card.
11. Combat log accordion.
12. Reset action.
13. Bottom navigation.

Viewport mobile esperado:

- Primer viewport 390x844: header, recursos, tier, enemy stage dominante, enemy HP, side actions y player HUD/stat strip parcialmente visible.
- Segundo tramo de scroll: stat strip completo, active contract y weekly ledger.
- Tercer tramo de scroll: weekly boss, combat log, reset y bottom nav.
- No comprimir cards inferiores para que todo entre arriba del fold.
- No achicar la UI global para mostrar mas alto de la referencia.
- La similitud visual se evalua por ancho, ritmo horizontal, densidad, estilo y continuidad vertical; no por cantidad de bloques visibles en el primer viewport.

Reglas:

- El enemigo y el stage son el foco visual del primer viewport.
- El ancho util del contenido debe comportarse como la referencia: margenes laterales consistentes, panels full-width, barras largas, side actions alineados al borde derecho del stage.
- Las cards inferiores deben verse como paneles Forge, no como cards web.
- Los side actions deben parecer botones fisicos verticales.
- El bottom nav debe ser parte del marco del juego.
- No crear estilos visuales locales para botones, cards, barras, badges o nav.
- Si falta un primitive, crearlo y documentarlo.
- Layout local permitido solo para posicionar zonas.
- El stage enemigo debe usar asset/fondo/visual con profundidad. Si falta asset final, dejar placeholder documentado, no degradar el sistema completo.
- El scroll debe sentirse como una pantalla fullpage continua, no como modulos sueltos apilados.
- El alto del enemy stage puede adaptarse por viewport, pero no debe perder presencia ni convertirse en una card pequena.

Definition of Done:

- La jerarquia visual se parece a `Combat Full`.
- La escala horizontal se parece a `Combat Full`: margenes, anchos, barras, side rail y panels tienen proporciones equivalentes.
- El primer viewport comunica RPG/combat inmediatamente.
- Los datos reales siguen funcionando.
- Mobile 390x844 y 430x932 no tienen overflow horizontal.
- Desktop/tablet 1280x800 no parece dashboard web.
- No hay componentes visuales inventados fuera del sistema.

---

## 13. QA Visual Obligatorio

Despues de cada implementacion importante:

1. Ejecutar capturas disponibles del repo.
2. Comparar contra referencia fullpage.
3. Registrar diferencias.
4. Corregir antes de pasar a otra pantalla.

Crear o actualizar un reporte:

```txt
uirefactor/visual-qa-v3.md
```

Formato minimo:

```md
# Visual QA Forge Light v3

## Combat Full

Referencia:
- `uirefactor/fullpage/redesign/Combat Full.png`

Capturas revisadas:
- 390x844
- 430x932
- 1280x800

Comparacion por zonas:
| Zona | Referencia | Implementacion | Estado | Correccion |
|---|---|---|---|---|

Primer viewport:
- Que aparece.
- Que deberia aparecer.
- Que queda debajo del fold.

Deuda visual:
- Assets faltantes.
- Primitives faltantes.
- Diferencias aceptadas temporalmente.
```

Viewports obligatorios:

- 390x844
- 430x932
- 1280x800

Checklist:

- [ ] El foco visual se entiende en 2 segundos.
- [ ] El primer viewport no intenta comprimir toda la fullpage.
- [ ] El primer viewport muestra header, tier, stage enemigo y HUD principal.
- [ ] La pantalla parece RPG fantasy premium, no dashboard.
- [ ] El CTA principal usa dorado/bronce, no verde generico.
- [ ] Los colores vivos son semanticos.
- [ ] Las cards tienen borde, textura, profundidad y esquinas Forge.
- [ ] Las barras tienen marco, fill y lectura clara.
- [ ] Header y bottom nav parecen del mismo sistema.
- [ ] No hay overflow horizontal en mobile.
- [ ] El texto no se pisa ni desborda botones/cards.
- [ ] Loading/disabled/selected existen donde corresponde.
- [ ] No hay colores hardcodeados en JSX.
- [ ] No hay estilos duplicados por pantalla para primitives existentes.
- [ ] Los assets/fondos no fueron reemplazados por fondos planos.
- [ ] La continuidad vertical del scroll se parece a la fullpage.

Si falla 2 o mas puntos, la pantalla no esta aceptada.

---

## 14. Orden De Migracion Despues De Combat

No migrar todo en una sola pasada sin validar el piloto.

Orden recomendado:

1. Combat Full
2. Mochila Full
3. Forja Full
4. Santuario Full
5. Talentos Full
6. Ecos Full
7. Ficha Heroe Full
8. Atributos Heroe Full
9. Intel Full
10. Biblioteca Full
11. Destileria Full
12. Progreso Offline

Para cada pantalla:

1. Leer recipe en `design3.md`.
2. Leer map en `component-map.md`.
3. Comparar referencia fullpage.
4. Identificar gaps de primitives.
5. Mejorar primitive si el gap es reusable.
6. Ajustar layout local si el gap es solo composicion.
7. Capturar 390x844, 430x932, 1280x800.
8. Registrar deuda visual.

---

## 15. Prompt Para La IA Que Va A Crear Documentacion

Usar este prompt si la primera tarea es generar `design3.md`, `ui-kit.md`, `component-map.md` e `implementation-plan-v3.md`:

```txt
Necesito que conviertas mis referencias Forge Light en un sistema visual implementable para este repo.

Antes de escribir, lee:
- uirefactor/design2.md
- uirefactor/design-system-implementation-plan.md
- ui-component-inventory.md
- src/styles/forge-light.css
- src/styles/responsive.css

Referencias visuales principales:
- uirefactor/fullpage/redesign/UI KIT.png
- uirefactor/fullpage/redesign/Combat Full.png
- todas las pantallas en uirefactor/fullpage/redesign/

Entregables:
1. uirefactor/design3.md
2. uirefactor/ui-kit.md
3. uirefactor/component-map.md
4. uirefactor/implementation-plan-v3.md
5. Seccion Combat Full Visual Breakdown dentro de design3.md

Reglas:
- No implementar pantallas todavia.
- No escribir documentacion generica.
- El UI Kit manda sobre componentes.
- Las capturas fullpage mandan sobre composicion.
- El codigo actual manda sobre datos y gameplay.
- Combat Full debe quedar definido como piloto.
- Combat Full debe tener breakdown vertical y reglas de primer viewport.
- Incluir recipes por pantalla.
- Incluir anti-patrones prohibidos.
- Incluir checklist visual y reglas responsive.
- Incluir reglas de assets, fondos, texturas y placeholders.

Objetivo:
Que otra IA pueda implementar Combat Full en una pasada controlada usando primitives Forge reutilizables.
```

---

## 16. Prompt Para Crear UI Kit En Codigo

Usar este prompt despues de tener documentacion v3:

```txt
Implementa el Forge Light UI Kit en React/CSS antes de tocar pantallas reales.

Lee:
- uirefactor/design3.md
- uirefactor/ui-kit.md
- uirefactor/component-map.md
- uirefactor/implementation-plan-v3.md
- ui-component-inventory.md
- src/styles/forge-light.css

Objetivo:
Crear primitives reutilizables en src/components/ui/forge/ y consolidar tokens en src/styles/forge-light.css.

Entregables:
- primitives Forge necesarios;
- export central en src/components/ui/forge/index.js;
- estilos en src/styles/forge-light.css;
- demo interna del UI Kit;
- notas de componentes faltantes o deuda.

Reglas:
- No tocar logica de juego.
- No cambiar reducers.
- No cambiar balance.
- No hardcodear colores en JSX.
- No crear estilos por pantalla.
- No duplicar botones, cards, barras, badges ni nav.
- Usar mobile-first.
- Loading no cambia dimensiones.
- Disabled/selected/pressed deben ser visibles.

Verificacion:
- La demo debe mostrar variantes y estados.
- No debe haber errores de build.
```

---

## 17. Prompt Para Implementar Combat Full

Usar este prompt solo despues de aceptar documentacion y UI Kit:

```txt
Implementa Combat Full como pantalla piloto Forge Light.

Autoridades:
1. uirefactor/fullpage/redesign/UI KIT.png para componentes.
2. uirefactor/design3.md para reglas visuales.
3. uirefactor/ui-kit.md para API/anatomia/estados.
4. uirefactor/component-map.md para mapeo de zonas.
5. uirefactor/fullpage/redesign/Combat Full.png para composicion.
6. Codigo actual para logica y datos.

Objetivo:
Recrear la composicion y jerarquia de Combat Full usando primitives Forge reutilizables.

Restricciones:
- No cambiar logica de combate.
- No cambiar reducers ni balance.
- No crear CSS visual local si pertenece al UI Kit.
- No hardcodear colores fuera de tokens.
- No inventar botones/cards/barras/nav nuevos.
- Si falta un primitive reusable, crearlo en src/components/ui/forge y documentarlo.
- No intentar comprimir toda la fullpage dentro del primer viewport mobile.
- No reescalar toda la UI para mostrar mas contenido vertical.
- No sacrificar ancho, margenes, barras o legibilidad para perseguir el alto completo de la captura.
- No reemplazar stage/arte/fondo por un bloque plano o gradiente generico.

Zonas obligatorias:
- App header
- Resource counters
- Tier progression
- Enemy stage
- Enemy HP
- Side actions
- Player HUD
- Stat strip
- Active contract
- Weekly ledger
- Weekly boss
- Combat log
- Reset action
- Bottom nav

Viewport esperado:
- 390x844 y 430x932 deben mostrar solo la parte superior de la fullpage: header, recursos, tier, enemy stage, enemy HP, side actions y HUD principal.
- La escala se toma del ancho del viewport, no del alto completo de la captura.
- Las cards inferiores deben continuar en scroll con el mismo lenguaje visual.
- 1280x800 debe conservar sensacion de juego, no convertirse en dashboard.

Definition of Done:
- Capturas 390x844, 430x932 y 1280x800 revisadas.
- La pantalla se parece a Combat Full en foco, densidad, bordes, textura y jerarquia.
- La comparacion visual verifica ancho/proporciones horizontales por separado del orden vertical.
- No hay overflow horizontal mobile.
- Los componentes creados son reutilizables por otras pantallas.
- Se actualiza documentacion si aparece una regla nueva.
- Se actualiza uirefactor/visual-qa-v3.md con comparacion por zonas.
```

---

## 18. Prompt Para Migrar El Resto De Pantallas

Usar solo despues de que `Combat Full` este aceptada:

```txt
Migra la siguiente pantalla a Forge Light usando el sistema ya validado por Combat Full.

Lee:
- uirefactor/design3.md
- uirefactor/ui-kit.md
- uirefactor/component-map.md
- uirefactor/implementation-plan-v3.md
- referencia fullpage correspondiente en uirefactor/fullpage/redesign/

Reglas:
- Reusar primitives.
- Mejorar primitives si el problema es reusable.
- Layout local solo para composicion.
- No cambiar gameplay.
- No crear estilos aislados.
- Documentar reglas nuevas.
- Capturar 390x844, 430x932 y 1280x800.

Entregar:
- archivos modificados;
- primitives reutilizadas;
- primitives creadas o ajustadas;
- diferencias residuales contra referencia;
- deuda visual pendiente.
```

---

## 19. Criterio Para Saber Que La Pasada Esta Lista

La pasada completa no esta lista hasta tener:

- [ ] `uirefactor/design3.md` terminado.
- [ ] `uirefactor/ui-kit.md` terminado.
- [ ] `uirefactor/component-map.md` terminado.
- [ ] `uirefactor/implementation-plan-v3.md` terminado.
- [ ] `Combat Full Visual Breakdown` escrito.
- [ ] Tokens semanticos consolidados.
- [ ] Primitives base creados o completados.
- [ ] Demo del UI Kit disponible.
- [ ] `Combat Full` aceptada visualmente.
- [ ] `uirefactor/visual-qa-v3.md` actualizado.
- [ ] Capturas revisadas en 390x844, 430x932 y 1280x800.
- [ ] Mochila y Forja migradas sin inventar estilos nuevos.
- [ ] Deuda visual documentada.

Orden final:

1. Documentar.
2. Construir UI Kit.
3. Probar UI Kit.
4. Implementar Combat Full.
5. Capturar y corregir.
6. Migrar pantallas restantes una por una.
