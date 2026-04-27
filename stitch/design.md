# Stitch -> IdleRPG Design.md

Fecha: 2026-04-27  
Estado: base de implementacion actualizada con `stitch/stitchDesign.md` real.

## 0. Fuentes revisadas

- `stitch/stitchDesign.md`: fuente principal (frontmatter + guideline completo).
- `stitch/santuario_ui/DESIGN.md`: documento equivalente al export principal.
- `stitch/santuario_ui_gu_a_de_estilo_estructurada/code.html` + `screen.png`.
- `stitch/santuario_ui_referencia_t_cnica_grid/code.html` + `screen.png`.
- `stitch/santuario_ui_manual_de_componentes_extenso/code.html` + `screen.png`.

## 1. Resumen ejecutivo

La direccion Stitch queda confirmada en tres ejes:

1. Fantasia oscura premium (violeta profundo + dorado ritual).
2. Superficies glassmorphism limpias (sin ruido medieval pesado).
3. UI densa y operativa, con jerarquia clara para decisiones rapidas.

Para el juego, la estrategia correcta sigue siendo un bridge:

- mantener arquitectura actual,
- aplicar la identidad Stitch via tokens + componentes,
- priorizar claridad de sistemas (contratos/weeklies) sobre decoracion.

## 2. Datos canonicos extraidos de stitchDesign.md

## 2.1 Colores

Colores clave confirmados:

- Base: `#15121b`
- Surface stack: `#0f0d15`, `#1d1a23`, `#211e27`, `#2c2832`, `#37333d`
- Texto: `#e7e0ed` (primario), `#cbc3d7` (secundario)
- Acento magico: `#d0bcff` / `#9f78ff`
- Acento dorado: `#e9c349` / `#af8d11`
- Error: `#93000a` / `#ffdad6`

## 2.2 Tipografia

- Display/Headlines: `Noto Serif`
- Body: `Manrope`
- Labels caps: `Inter`

Escalas canonicas Stitch:

- `headline-xl`: 40px / 700
- `headline-lg`: 32px / 600
- `headline-md`: 24px / 600
- `body-lg`: 18px / 400
- `body-md`: 16px / 400
- `label-caps`: 12px / 700 / tracking 0.1em

## 2.3 Espaciado y shape

Spacing canonico:

- base 8px
- xs 4px
- sm 12px
- md 24px
- lg 48px
- xl 80px
- container padding 32px
- card gutter 20px

Border radius canonico:

- sm 0.25rem
- default 0.5rem
- md 0.75rem
- lg 1rem
- xl 1.5rem
- full 9999px

## 2.4 Elevacion

Capas confirmadas por Stitch:

1. Base layer: fondo violeta solido.
2. Container layer: superficie semitransparente + borde interno fino dorado.
3. Active layer: blur aprox 16px + glow suave.
4. Overlay layer: blur fuerte aprox 32px para foco.

## 3. Decisiones de adaptacion a IdleRPG

## 3.1 Lo que si copiamos

- Paleta y contraste general.
- Jerarquia serif + labels caps.
- Card language con borde fino y glow controlado.
- Primary/Secondary/Ghost button semantics.
- Brackets ornamentales en headers de seccion.

## 3.2 Lo que no copiamos literal

- Tailwind CDN del prototipo.
- Imagenes remotas decorativas.
- Layout documental de style guide como pantalla final.

## 3.3 Regla de oro

Toda adaptacion visual debe sostener legibilidad de objetivos, progreso, recompensas y estado de claim.

## 4. Mapeo de tokens a CSS actual

Extender sobre tu base actual (`tokens.css` + `responsive.css`):

```css
/* Stitch bridge */
--stitch-bg-0: #100d16;
--stitch-bg-1: #15121b;
--stitch-surface-1: rgba(21, 18, 27, 0.9);
--stitch-surface-2: rgba(33, 30, 39, 0.86);
--stitch-border: rgba(233, 195, 73, 0.28);
--stitch-gold: #e9c349;
--stitch-gold-soft: rgba(233, 195, 73, 0.14);
--stitch-violet: #d0bcff;
--stitch-violet-strong: #9f78ff;
--stitch-text-1: #f3edf7;
--stitch-text-2: #cbc3d7;
--stitch-text-3: #a89fb4;
--stitch-error: #93000a;
```

Mapeo recomendado:

- `--tone-accent` -> `--stitch-gold`
- `--tone-violet` -> `--stitch-violet`
- `--color-background-secondary` -> `--stitch-surface-1`
- `--color-border-primary` -> `--stitch-border`

## 5. Componentes canonicos para contratos/weeklies

## 5.1 `SanctuarySectionHeader`

Props:

- `kicker`
- `title`
- `subtitle`
- `actions`

Visual:

- linea/bracket dorado
- titulo serif
- subtitulo compacto y legible

## 5.2 `TacticalTagRow`

Tags:

- `Bleed`, `Fracture`, `Mark`, `Block`, `Evade`, `Guard Play`

Estados:

- `available`
- `required`
- `unsupported`

## 5.3 `ContractCard`

Props:

- `laneLabel`
- `title`
- `objective`
- `progress` (`current`, `target`, `percent`)
- `reward`
- `state` (`locked|active|ready|claimed|expired`)
- `timeLeftLabel`
- `hint`
- `riskLevel`
- `recommendedBuild`

Debe incluir:

- barra de progreso
- chips de estado
- reward row
- CTA contextual

## 5.4 `WeeklyLaneCard`

Lanes:

- Push
- Forge
- Meta

Cada lane:

- 1 contrato visible
- estado
- claim/remaining

## 5.5 `WeeklyBossCard`

Debe mostrar:

- dificultad
- intentos restantes
- estado de ciclo
- recompensa resumida
- CTA de entrar/cobrar

## 5.6 `TalentCardCompact` (adicion Stitch, aprobada)

Aplicacion recomendada:

- listas densas de perks/talentos/beneficios tacticos
- no para cards principales de contrato (esas necesitan mas contexto)

Especificacion adaptada:

- padding interno: 8px
- radius: 11-12px
- gap interno: 5px
- titulo serif compacto (aprox 0.68-0.72rem)
- boton de accion chico en esquina superior derecha (`surface-bright` + acento dorado)

Regla:

- usar este patron solo cuando la lista tenga alta repeticion y scroll corto por viewport.

## 5.7 `SacredFadeScroll` (adicion Stitch, aprobada con fallback)

Uso:

- contenedores scrollables de lore largo, logs, historial, listas extensas.

Estilo:

- fade superior/inferior con `mask-image`.
- scrollbar oculto o minimizado.

Fallback obligatorio:

- si `mask-image` no esta disponible, mantener scroll normal sin degradar legibilidad.

## 5.8 `FieldUnderline` (adicion Stitch, aprobada parcialmente)

Stitch propone inputs con borde inferior. En el juego:

- usar `FieldUnderline` para filtros rapidos o search liviano.
- mantener inputs tradicionales en formularios criticos (confirmaciones, costos, acciones sensibles).

Regla:

- nunca depender solo del borde inferior para estados de error/focus; sumar color + label/helper text.

## 5.9 `BadgeRectMicro` (adicion Stitch, aprobada como variante)

Stitch agrega chips rectangulares de radio bajo.

Decision:

- mantener `StatusChip` pill como default.
- agregar `BadgeRectMicro` (radius 2-4px) para metadatos secundarios: tier, rarity, lane, source.

Regla:

- no mezclar pill y micro-rect en el mismo cluster sin jerarquia visual clara.

## 6. Matriz de estados UX

## 6.1 Contratos

- `locked`: CTA disabled + texto de desbloqueo.
- `active`: CTA track/select + progreso vivo.
- `ready`: CTA dorado claim + glow suave.
- `claimed`: badge final, CTA oculto.
- `expired`: badge warning + texto de recambio.

## 6.2 Weeklies

- `in_progress`: `x/y` visible.
- `completed_unclaimed`: no ocultar hasta claim.
- `claimed`: remover del selector visible cuando corresponda.

## 6.3 Weekly boss

- `available`
- `active encounter`
- `resolved_win`
- `resolved_loss`
- `cycle_reset_pending`

## 7. Layout de referencia

## 7.1 Mobile

- stack vertical
- orden:
  1. resumen/hub
  2. contratos expedicion
  3. weeklies por lane
  4. weekly boss

## 7.2 Desktop

- grid 2 columnas
  - izquierda: contratos + filtros tacticos
  - derecha: weeklies + weekly boss + resumen rewards

## 8. Motion y feedback

Aplicar microinteracciones utiles:

- hover: elevacion leve + borde dorado.
- ready-to-claim: pulso suave (no invasivo).
- claim success: flash corto + toast.
- disabled: contraste y cursor claros.

Limite tecnico:

- evitar blur costoso en listas largas.
- reservar blur alto para overlays y hero blocks.

## 9. Accesibilidad minima

- contraste AA para texto principal/secundario.
- focus ring visible en botones/chips/tabs.
- target tactil >= 44px.
- no depender solo de color para estado.

## 10. Plan por fases

## Fase 1: Tokens y superficie

Archivos:

- `src/styles/tokens.css`
- `src/styles/responsive.css`
- `src/components/OverlayShell.jsx`

Objetivo:

- alinear tokens al canon Stitch real
- normalizar panel glass/border/shadow

## Fase 2: Encargos overlay piloto

Archivo:

- `src/components/EncargosOverlay.jsx`

Objetivo:

- aplicar visual language Stitch con logica intacta
- validar densidad, claim states y legibilidad

## Fase 3: Paridad contratos/weeklies

Archivos:

- `src/components/ExpeditionView.jsx`
- `src/components/AccountProgressView.jsx`
- `src/components/ui/*`

Objetivo:

- reutilizar `ContractCard`, `TacticalTagRow`, `WeeklyLaneCard`, `WeeklyBossCard`
- agregar variantes compactas: `TalentCardCompact`, `BadgeRectMicro`
- introducir `SacredFadeScroll` en listas largas y `FieldUnderline` en filtros rapidos

## Fase 4: QA visual y tecnica

Checklist:

- mobile 360-430
- tablet 768
- desktop 1280+
- modo stitch-trial vs default
- perf de overlays/listas
- contraste/focus

## 11. Riesgos y decisiones cerradas

- no usar assets remotos de Stitch en produccion.
- no acoplar Tailwind runtime a la app.
- no sacrificar UX de progreso por ornamentacion.
- mantener una sola semantica de estados entre contratos/weeklies/boss.

## 12. Resultado esperado

Con este ajuste, el juego mantiene su arquitectura actual y gana coherencia visual Stitch real:

- identidad mas fuerte en Santuario,
- mejor jerarquia operativa para contratos/weeklies,
- y feedback de estado mas claro sin perder rendimiento ni densidad.
