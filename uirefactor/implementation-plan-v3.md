# Forge Light Implementation Plan v3

Fecha: 2026-04-29
Estado: plan tecnico. No implementar pantallas antes de completar y aceptar documentacion v3.

## Principios Operativos

- Combat Full es el piloto real, pero no empieza hasta cerrar Documentacion v3, tokens/primitives y demo UI Kit.
- El UI Kit manda sobre primitives; las fullpage mandan sobre layout y scroll.
- El codigo actual manda sobre datos, reducers, balance y gameplay.
- No migrar toda la app antes de aceptar Combat Full.
- No poner estilos visuales Forge en `responsive.css` si pertenecen a primitives.
- No cambiar gameplay para resolver visual.

## Combat Full Visual Breakdown

Referencia:
- `uirefactor/fullpage/redesign/Combat Full.png`

Dimensiones de referencia:
- Imagen: 802 x 1961 px.
- Base horizontal: 802 px.
- 390x844 equivale a 48.6% del ancho de referencia y 43.0% del alto fullpage.
- 430x932 equivale a 53.6% del ancho de referencia y 47.5% del alto fullpage.
- La fullpage mide aproximadamente 2.32 viewports de 844px o 2.10 viewports de 932px.

Regla ancho-vs-alto:
- El ancho define escala horizontal: margenes, gutters, barras, panels, side rail y stage.
- El alto define continuidad de scroll.
- No comprimir toda la captura en el primer viewport.
- No achicar tipografia, iconos o barras para mostrar weekly/boss arriba del fold.

Mapa vertical:
- 0-15%: header + tier/progression.
- 15-45%: enemy stage + HP + side actions + player HUD.
- 45-55%: stat strip.
- 55-70%: active contract.
- 70-84%: weekly ledger.
- 84-96%: weekly boss.
- 96-100%: combat log/reset/bottom nav.

Primer viewport mobile esperado:
- Header, recursos, tier, enemy stage dominante, enemy HP, side actions y player HUD/stat strip parcial.
- Contrato, weekly ledger, weekly boss y combat log pueden quedar debajo del fold.

Assets actuales para Combat:
- Fondo: `public/assets/combat/backgrounds/ruinas_olvidadas.png`.
- Enemigos: `public/assets/combat/enemies/*.png`, registrados en `src/data/combatVisuals.js`.
- Weekly bosses: `public/assets/combat/weekly-bosses/*.png`.
- Registry general: `src/utils/assetRegistry.js`.
- Texturas: `public/assets/forge-light/textures/fl-metal-grain-overlay.png`, `public/assets/forge-light/textures/fl-panel-noise-overlay.png`.

Deuda probable:
- `FlHealthBar`, `FlPanel`, `FlBottomNav`, `FlHeaderBar`, `FlSideAction` pueden no existir todavia como archivos dedicados.
- Demo UI Kit aun no existe.
- QA v3 aun no existe.

## Fase 0: Auditoria

Objetivo:
- Confirmar estado actual de docs, styles, primitives, assets y rutas antes de tocar codigo visual.

Archivos a tocar:
- Ninguno, salvo notas temporales si se acuerda.

Archivos que no se deben tocar:
- Reducers, balance, engine, datos de gameplay.
- Pantallas reales.

Criterios de aceptacion:
- Se leyeron `uirefactor/design2.md`, `uirefactor/design-system-implementation-plan.md`, `ui-component-inventory.md`, `src/styles/forge-light.css`, `src/styles/responsive.css`.
- Se auditaron dimensiones de `uirefactor/fullpage/redesign/*.png`.
- Se confirmaron texturas y assets existentes.

Riesgos:
- Asumir que las capturas fullpage son viewports.
- Duplicar primitives ya iniciados.

Verificacion:
- `file uirefactor/fullpage/redesign/*.png`
- `rg --files public/assets/forge-light/textures`
- `rg --files src/components/ui/forge`

## Fase 1: Documentacion v3

Objetivo:
- Crear los cuatro contratos obligatorios antes de implementar pantallas.

Archivos a tocar:
- `uirefactor/design3.md`
- `uirefactor/ui-kit.md`
- `uirefactor/component-map.md`
- `uirefactor/implementation-plan-v3.md`

Archivos que no se deben tocar:
- `src/components/Combat.jsx`
- `src/styles/forge-light.css`
- `src/styles/responsive.css`
- cualquier pantalla real

Criterios de aceptacion:
- `design3.md` tiene las 20 secciones requeridas.
- `design3.md` incluye recipes de todas las pantallas obligatorias.
- `design3.md` incluye `Combat Full Visual Breakdown`.
- `ui-kit.md` define primitives y compuestos con uso, anatomia, variantes, estados, tamanos, tokens, API, clases y prohibiciones.
- `component-map.md` mapea zonas por pantalla.
- `implementation-plan-v3.md` define fases 0-10 con gates.

Riesgos:
- Documentacion generica sin reglas ejecutables.
- Omitir Combat como fullpage scroll.

Verificacion:
- Leer los cuatro archivos.
- Buscar headings obligatorios.

## Fase 2: Reverse engineering visual de Combat Full

Objetivo:
- Convertir Combat Full en blueprint de layout antes de escribir codigo.

Archivos a tocar:
- `uirefactor/design3.md` si falta detalle.
- `uirefactor/implementation-plan-v3.md` si falta detalle.
- Opcional: `uirefactor/visual-qa-v3.md` para preparar matriz.

Archivos que no se deben tocar:
- `src/components/Combat.jsx`
- reducers/balance.

Criterios de aceptacion:
- Se documenta que aparece en primer viewport 390x844 y 430x932.
- Se documenta que queda debajo del fold.
- Se separa escala horizontal de scroll vertical.
- Se listan assets actuales y deuda visual.

Riesgos:
- Empezar Combat antes de cerrar primitives.
- Resolver stage con CSS plano.

Verificacion:
- Comparar breakdown con `Combat Full.png`.

## Fase 3: Tokens

Objetivo:
- Consolidar tokens semanticos en `src/styles/forge-light.css` sin romper tokens legacy.

Archivos a tocar:
- `src/styles/forge-light.css`

Archivos que no se deben tocar:
- `src/styles/responsive.css` para tokens.
- Pantallas reales salvo si se requiere import/clase no visual.
- Reducers/gameplay.

Criterios de aceptacion:
- Aliases semanticos v3 presentes.
- Texturas expuestas como rutas/tokens si conviene.
- No se eliminan tokens legacy.
- No aparecen hex nuevos en JSX.

Riesgos:
- Duplicar tokens actuales.
- Cambiar colores legacy y romper pantallas migradas.

Verificacion:
- `rg "#[0-9a-fA-F]{3,8}" src/components`
- Revisar `src/styles/forge-light.css`.

## Fase 4: Primitives Forge

Objetivo:
- Crear/completar primitives necesarios antes de Combat.

Archivos a tocar:
- `src/components/ui/forge/index.js`
- `src/components/ui/forge/FlButton.jsx`
- `src/components/ui/forge/FlIconButton.jsx`
- `src/components/ui/forge/FlPanel.jsx`
- `src/components/ui/forge/FlCard.jsx`
- `src/components/ui/forge/FlSectionHeader.jsx`
- `src/components/ui/forge/FlBadge.jsx`
- `src/components/ui/forge/FlTag.jsx`
- `src/components/ui/forge/FlProgressBar.jsx`
- `src/components/ui/forge/FlHealthBar.jsx`
- `src/components/ui/forge/FlResourceCounter.jsx`
- `src/components/ui/forge/FlResourcePill.jsx`
- `src/components/ui/forge/FlStatRow.jsx`
- `src/components/ui/forge/FlStatStrip.jsx`
- `src/components/ui/forge/FlIconFrame.jsx`
- `src/components/ui/forge/FlTabs.jsx`
- `src/components/ui/forge/FlBottomNav.jsx`
- `src/components/ui/forge/FlHeaderBar.jsx`
- `src/components/ui/forge/FlSideAction.jsx`
- `src/components/ui/forge/FlModal.jsx`
- `src/components/ui/forge/FlToast.jsx`
- `src/components/ui/forge/FlTooltip.jsx`
- `src/components/ui/forge/FlEmptyState.jsx`
- `src/components/ui/forge/FlRequirementHint.jsx`
- `src/styles/forge-light.css`

Archivos que no se deben tocar:
- Pantallas reales excepto imports para una demo.
- `responsive.css` para estilos de primitive.
- Reducers/gameplay.

Criterios de aceptacion:
- Props consistentes: `variant`, `size`, `tone`, `rarity`, `selected`, `disabled`, `loading`, `className`, `children`.
- Estados visibles.
- Loading mantiene dimensiones.
- Disabled puede mostrar razon.
- Texturas usadas via CSS/pseudo-elements.

Riesgos:
- Crear demasiados primitives no usados.
- Mezclar layout de pantalla dentro de primitive.

Verificacion:
- Smoke render de demo.
- Revisar exports de `index.js`.

## Fase 5: Demo UI Kit

Objetivo:
- Probar visualmente primitives antes de pantallas reales.

Archivos a tocar:
- Ruta/componente dev-only a definir, por ejemplo `src/components/ForgeLightKitDemo.jsx`.
- Routing/app shell solo si se decide montar `/forge-light-kit-demo`.
- `src/styles/forge-light.css` para ajustes de primitive.

Archivos que no se deben tocar:
- Combat real.
- Gameplay/reducers.

Criterios de aceptacion:
- Muestra botones en estados.
- Muestra cards, panels, progress, HP, recursos, badges, tags, rarezas, item cards, stat strips, bottom nav, side actions, modal/toast/tooltip si existen.
- Layout mobile-width.
- No depende de datos de gameplay.

Riesgos:
- Confundir demo con pantalla final.
- Ajustar demo con estilos locales.

Verificacion:
- Ejecutar dev server/captura disponible.
- Revisar visual contra `UI KIT.png`.

## Fase 6: Shell global

Objetivo:
- Normalizar header, recursos y bottom nav si hace falta antes del piloto.

Archivos a tocar:
- `src/App.jsx`
- componentes shell actuales si existen.
- `src/components/ui/forge/FlHeaderBar.jsx`
- `src/components/ui/forge/FlBottomNav.jsx`
- `src/styles/forge-light.css`
- `src/styles/responsive.css` solo para layout responsive global.

Archivos que no se deben tocar:
- Reducers/gameplay.
- Logica de pantallas.

Criterios de aceptacion:
- Header/nav usan primitives.
- Safe areas y padding bottom/top correctos.
- No overflow horizontal en 390/430.

Riesgos:
- Cambiar navegacion funcional.
- Romper overlays por z-index.

Verificacion:
- Capturas 390x844, 430x932, 1280x800 de pantallas existentes.

## Fase 7: Combat Full piloto

Objetivo:
- Implementar Combat como primera pantalla real usando primitives.

Archivos a tocar:
- `src/components/Combat.jsx`
- `src/components/ExpeditionView.jsx` si Combat vive dentro de expedicion/subtabs.
- `src/components/ui/forge/*` solo si falta primitive reusable.
- `src/styles/forge-light.css`
- `src/styles/responsive.css` solo para layout local/responsive.
- `src/data/combatVisuals.js` solo si se requiere mapear asset visual.
- `src/utils/assetRegistry.js` solo si falta resolver asset.

Archivos que no se deben tocar:
- Reducers de combate.
- Balance.
- Engine de progresion.
- Data economica.

Criterios de aceptacion:
- Primer viewport mobile muestra header, tier, stage enemigo, HP, side actions y HUD/stat parcial.
- Stage usa asset/fondo/profundidad.
- Cards inferiores siguen el orden de fullpage.
- No hay estilos locales para buttons/cards/bars/badges/nav.
- Datos reales siguen funcionando.

Riesgos:
- Comprimir fullpage.
- Crear CSS duplicado.
- Stage sin presencia.

Verificacion:
- Capturas 390x844, 430x932, 1280x800.
- Comparacion por zonas contra `Combat Full.png`.

## Fase 8: Captura y QA visual

Objetivo:
- Medir visualmente antes de migrar otra pantalla.

Archivos a tocar:
- `uirefactor/visual-qa-v3.md`
- Capturas bajo `uirefactor/current/` o carpeta equivalente si el script lo usa.

Archivos que no se deben tocar:
- Pantallas no piloto.

Criterios de aceptacion:
- Reporte incluye 390x844, 430x932, 1280x800.
- Reporte indica primer viewport, debajo del fold y deuda visual.
- Si fallan 2 o mas checklist items, se corrige Combat antes de seguir.

Riesgos:
- Avanzar a otras pantallas con piloto no aceptado.
- Comparar por contenido visible en vez de escala/jerarquia.

Verificacion:
- Scripts existentes de captura si estan disponibles.
- Revision manual contra referencia.

## Fase 9: Migracion por pantallas

Objetivo:
- Migrar pantallas restantes con recipes y component-map.

Archivos a tocar:
- Segun pantalla:
  - `src/components/Inventory.jsx`
  - `src/components/Crafting.jsx`
  - `src/components/Sanctuary.jsx`
  - `src/components/Talents.jsx`
  - `src/components/Prestige.jsx`
  - `src/components/HeroView.jsx`
  - `src/components/Character.jsx`
  - `src/components/BibliotecaOverlay.jsx`
  - `src/components/DistilleryOverlay.jsx`
  - `src/components/EncargosOverlay.jsx`
  - overlays/station components relacionados
  - primitives Forge reutilizables si falta capacidad
  - CSS global/layout correspondiente

Archivos que no se deben tocar:
- Reducers/balance salvo bug funcional explicitamente solicitado.

Orden:
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

Criterios de aceptacion:
- Cada pantalla usa recipe de `design3.md`.
- Cada zona esta mapeada en `component-map.md`.
- Se capturan 390x844, 430x932, 1280x800.
- Se registra deuda visual.

Riesgos:
- Pantallas migradas antes de Combat aceptado.
- Estilos locales por prisa.

Verificacion:
- Visual QA por pantalla.
- Busqueda de colores hardcodeados en JSX.

## Fase 10: Limpieza de deuda visual

Objetivo:
- Eliminar duplicacion y deuda tras migracion.

Archivos a tocar:
- `src/styles/forge-light.css`
- `src/styles/responsive.css`
- componentes legacy visuales reemplazados.
- `uirefactor/visual-qa-v3.md`

Archivos que no se deben tocar:
- Gameplay no relacionado.

Criterios de aceptacion:
- No hay buttons/cards/bars/badges/tabs locales duplicados.
- `responsive.css` contiene layout, no sistema visual.
- Primitives documentados coinciden con codigo.
- Deuda visual registrada o resuelta.

Riesgos:
- Refactor amplio que cambia comportamiento.
- Borrar estilos aun usados por pantallas no migradas.

Verificacion:
- `rg "button|card|badge|progress|tab" src/styles`
- Capturas finales.
- Smoke test manual de rutas principales.

## Gates De Aceptacion

Gate A: Documentacion
- Los cuatro documentos v3 existen.
- Combat breakdown existe en `design3.md` e `implementation-plan-v3.md`.

Gate B: UI Kit
- Primitives requeridos existen o deuda documentada.
- Demo muestra estados.

Gate C: Combat Piloto
- Combat pasa checklist visual.
- No hay overflow mobile.
- Primer viewport no comprime fullpage.

Gate D: Migracion
- Cada pantalla se migra una por una.
- QA visual actualizado.

## Verificacion Recomendada

Comandos locales orientativos:

```txt
rg --files src/components/ui/forge
rg "#[0-9a-fA-F]{3,8}" src/components
rg "fl-metal-grain-overlay|fl-panel-noise-overlay" src/styles/forge-light.css
npm run ui:capture
npm run ui:capture:full
```

No ejecutar comandos de captura hasta que haya implementacion que capturar.
