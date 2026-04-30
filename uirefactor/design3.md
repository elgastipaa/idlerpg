# Forge Light Design System v3

Fecha: 2026-04-29
Estado: contrato visual para documentacion v3. No autoriza implementar pantallas antes de completar `ui-kit.md`, `component-map.md` e `implementation-plan-v3.md`.

## 1. Objetivo

Forge Light v3 convierte las referencias de `uirefactor/fullpage/redesign/` en un sistema visual implementable para un Idle RPG mobile-first en React.

El objetivo no es copiar pantallas pixel a pixel. El objetivo es que Combat, Mochila, Forja, Santuario, Talentos, Ecos, Intel, Biblioteca, Destileria, Heroe, Atributos y Progreso Offline compartan:

- metal oscuro trabajado;
- bordes bronce/dorado facetados;
- fondos con textura, escena o profundidad;
- componentes reutilizables;
- jerarquia de RPG mobile;
- lectura rapida de combate, progreso, loot, riesgo y recompensa.

La implementacion futura debe poder tomar `Combat Full.png` como piloto y llegar al look propuesto sin inventar botones, panels, tabs, barras o cards locales.

## 2. Autoridades Visuales

Orden de decision:

1. `uirefactor/fullpage/redesign/UI KIT.png`
2. `uirefactor/design3.md`
3. `uirefactor/ui-kit.md`
4. `uirefactor/fullpage/redesign/<Pantalla> Full.png`
5. `ui-component-inventory.md`
6. `uirefactor/design2.md`
7. Codigo actual

Reglas de conflicto:

- El UI Kit manda sobre botoneria, cards, panels, barras, badges, rarezas, icon frames, navegacion, feedback y microelementos.
- Las fullpage mandan sobre composicion, orden vertical, densidad, anchos, gutters, presencia visual y continuidad de scroll.
- El codigo actual manda sobre datos, gameplay, reducers, balance y reglas funcionales.
- Si una pantalla muestra un componente distinto al UI Kit, se conserva la funcion y se normaliza al UI Kit.
- Si una pantalla no se parece a `Combat Full.png` en densidad, peso, fondo, bordes y jerarquia, el sistema visual todavia no esta listo.

Dimensiones auditadas:

| Referencia | Dimension |
|---|---:|
| `UI KIT.png` | 724 x 2172 |
| `Combat Full.png` | 802 x 1961 |
| `Mochila Full.png` | 941 x 1672 |
| `Forja Full.png` | 941 x 1672 |
| `Santuario Full.png` | 941 x 1672 |
| `Talentos Full.png` | 941 x 1672 |
| `Ecos Full.png` | 724 x 2172 |
| `Intel Full.png` | 930 x 1691 |
| `Biblioteca Full.png` | 941 x 1672 |
| `Destileria Full.png` | 941 x 1672 |
| `Ficha Heroe Full.png` | 941 x 1672 |
| `Atributos Heroe Full.png` | 941 x 1672 |
| `Progreso_Offline.png` | 1573 x 1000 |

La familia 941 x 1672 informa el ritmo vertical general de pantallas de gestion. `Combat Full.png` y `Ecos Full.png` son mas largos y deben leerse como scroll. `Progreso_Offline.png` es una referencia horizontal de modal/reporte, no una pantalla mobile vertical.

## 3. Identidad Visual

Forge Light significa dark fantasy premium con claridad tactil, no "dark mode con dorado".

Debe comunicar:

- combate fisico;
- progreso persistente;
- loot valioso;
- forja y transformacion;
- peligro;
- recompensa;
- permanencia de cuenta.

No debe comunicar:

- dashboard SaaS;
- app mobile generica;
- fantasy cartoon;
- UI plana minimalista;
- coleccion de cards grises;
- todo dorado;
- todo gris.

La referencia base es una interfaz de juego con peso material. Los controles parecen piezas metalicas, las barras tienen marco y fill, los iconos viven en relicarios, y los paneles se sienten incrustados sobre piedra/metal oscuro.

## 4. Principios Globales

- Un foco por viewport: Combat prioriza enemigo y HP; Mochila prioriza equipo y upgrades; Forja prioriza preview y CTA; Santuario prioriza jobs/estaciones; Talentos prioriza nodos y compra; Ecos prioriza consecuencia de reset.
- Densidad con lectura: los datos pueden ser densos, pero deben agruparse en bandas claras con titulos cortos, numeros protagonistas y separadores finos.
- Fisicalidad primero: todo control core requiere borde, textura, profundidad, pressed visible y target tactil estable.
- Color semantico, dorado estructural: el dorado arma jerarquia; verde/rojo/azul/violeta/naranja explican estado.
- Scroll natural: las fullpage verticales definen continuidad, no obligan a comprimir todo en el primer viewport.
- Primitives antes que pantallas: si una pantalla necesita boton, card, barra, nav, badge o tab, debe usar primitive Forge.
- Assets dentro del sistema: imagenes de enemigos, items, estaciones, talentos e iconos se encajan en frames y panels, no reemplazan la gramatica visual.

## 5. Reglas De Color

Roles canonicos:

- Fondo principal: negro verdoso/azulado muy oscuro, nunca gris plano.
- Superficie: metal/piedra oscura con ruido, vignette o desgaste.
- Texto primario: blanco calido.
- Texto secundario: pergamino apagado.
- Texto muted: bronce/gris bajo contraste para metadata.
- Dorado/bronce: estructura, seleccion, CTA, borde activo y separadores.
- Rojo: dano, HP enemigo, peligro, bloqueo critico, reset/destructivo.
- Verde: listo, exito, vida, curacion, mejora positiva.
- Azul: defensa, estabilidad, progreso tactico, rareza rara, informacion persistente.
- Violeta: esencia, ecos, XP, arcano, epico, progreso magico.
- Naranja: recompensa, oro, fuego, forja, critico, legendario.

Reglas:

- No usar colores vivos como base de UI. Viven dentro de frames Forge.
- No usar rareza para pintar toda una card; rareza afecta borde, badge, glow leve e icon frame.
- No usar verde para CTA primario. El CTA primario es dorado/bronce.
- No usar rojo para botones comunes. Rojo queda para danger, reset, error o boss.
- No hardcodear hex en JSX. Todo color repetido debe ser token.

## 6. Reglas De Dorado Y Bronce

Usar dorado fuerte para:

- CTA primario;
- tab activo;
- seleccion activa;
- borde de panel destacado;
- marcas de progreso neutral;
- valor economico;
- ornamentacion corta de seccion;
- frame de icono importante.

Usar bronce tenue para:

- bordes de paneles secundarios;
- separadores;
- metadata;
- iconografia inactiva;
- outlines de rows.

No usar dorado fuerte para:

- textos largos;
- todos los bordes al mismo nivel;
- estados que ya tienen color semantico;
- decoracion repetida sin funcion;
- backgrounds grandes saturados.

Intensidad recomendada:

- Header/shell: borde dorado medio + destellos puntuales.
- Panels: borde bronce tenue + esquinas trabajadas.
- Cards destacadas: borde bronce medio + glow local.
- CTA: dorado profundo, bevel, inner highlight.
- Selected: borde dorado claro + glow controlado.

## 7. Tipografia Y Jerarquia

Roles:

- Display (`--fl-font-display`): titulos de pantalla, nombres de sistemas, titulos de panel mayor, nombres de item/personaje importantes.
- UI (`--fl-font-ui`): botones, tabs, labels, badges, rows, metadata.
- Numeros (`--fl-font-number`): HP, dano, recursos, porcentajes, timers, costes.

Reglas:

- Los numeros que cambian usan `font-variant-numeric: tabular-nums`.
- Titulos principales usan serif/display y escala heroica solo donde hay identidad de pantalla.
- Textos de cards/listas no deben parecer H1.
- Labels de botones/tabs pueden ir en uppercase/small caps.
- Descripciones largas no van en dorado.
- En mobile, priorizar cortes de texto y line-height sobre achicar hasta ilegible.

Escala mobile orientativa:

| Rol | Rango |
|---|---:|
| Titulo pantalla | 30-44px |
| Titulo panel | 18-26px |
| Card/row title | 16-22px |
| Label | 11-14px |
| Body corto | 13-17px |
| Numero protagonista | 24-44px |
| CTA | 18-28px |
| Bottom nav label | 11-15px |

## 8. Layout Mobile-First

Mobile 390x844:

- Ancho util con margen lateral 14-18px.
- Header compacto visible al inicio.
- Bottom nav persistente o claramente integrado al shell.
- Primer viewport muestra foco principal, no toda la fullpage.
- Panels full-width con gutter constante.
- Targets tactiles minimos de 40px; CTAs importantes 48-64px.
- No overflow horizontal.

Mobile 430x932:

- Mantener la misma escala base que 390, con algo mas de aire vertical.
- No aumentar densidad para meter mas cards.
- Usar el ancho extra para respirar margins/gutters, no para crear columnas nuevas salvo componentes que ya lo pidan.

Desktop/tablet 1280x800:

- No convertir la app en dashboard.
- Usar max-width centrado o layout de juego con stage/panels, no cards SaaS dispersas.
- Los panels pueden formar dos columnas solo si la referencia lo sugiere o si el contenido gana lectura.
- Header y bottom/nav deben seguir viendose como marco del juego.

Traduccion de fullpage vertical:

- El ancho de la referencia define escala, proporciones horizontales, margenes, gutters, ancho de barras y posicion relativa.
- El alto completo define continuidad de scroll y orden vertical.
- No reescalar la imagen completa para que quepa en un viewport real.
- Si hay conflicto entre mostrar mas contenido y mantener escala legible, gana la escala legible.

## 9. Shell Global

El shell global incluye:

- `FlHeaderBar`: portrait/clase/nivel, estado, recursos, menu.
- `FlBottomNav`: navegacion principal con icono, label, badge y selected.
- Contenedor de pantalla con fondo oscuro/textura y safe areas.
- Capa de overlays/toasts/modales.

Reglas:

- El header es compacto, pesado y ornamental. No es un hero.
- Los recursos aparecen en `FlResourceCounter`/`FlResourcePill`, no como texto suelto.
- El bottom nav es parte del marco, no una barra web plana.
- Las pantallas station/overlay pueden tener back control grande, pero deben conservar tokens y borde Forge.
- El shell puede variar por pantalla con clase semantica, pero no redefinir primitives.

## 10. Tokens Canonicos

Base actual: `src/styles/forge-light.css` ya contiene tokens legacy y aliases semanticos. v3 conserva compatibilidad y agrega aliases solo si faltan.

Tokens semanticos obligatorios:

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

  --fl-space-1: 4px;
  --fl-space-2: 6px;
  --fl-space-3: 8px;
  --fl-space-4: 10px;
  --fl-space-5: 12px;
  --fl-space-6: 16px;
  --fl-space-7: 20px;
  --fl-space-8: 24px;
  --fl-space-9: 32px;

  --fl-font-display: "Cinzel", "Cormorant SC", Georgia, serif;
  --fl-font-ui: "Barlow Condensed", "Roboto Condensed", "Arial Narrow", sans-serif;
  --fl-font-number: "Barlow Condensed", "Roboto Condensed", "Arial Narrow", sans-serif;
}
```

Reglas:

- No eliminar tokens legacy en la primera migracion.
- Primitives nuevos leen aliases semanticos.
- `responsive.css` no define colores/bordes de primitive.
- Repeticion de sombra, borde, clip-path o textura se convierte en clase primitive.

## 11. Componentes Primitivos

Primitives obligatorios:

- `FlButton`, `FlIconButton`;
- `FlPanel`, `FlCard`, `FlSectionHeader`;
- `FlBadge`, `FlTag`;
- `FlProgressBar`, `FlHealthBar`;
- `FlResourceCounter`, `FlResourcePill`;
- `FlStatRow`, `FlStatStrip`;
- `FlIconFrame`;
- `FlTabs`, `FlBottomNav`, `FlHeaderBar`, `FlSideAction`;
- `FlItemCard`, `FlItemRow`;
- `FlTalentNode`;
- `FlModal`, `FlToast`, `FlTooltip`, `FlEmptyState`, `FlRequirementHint`.

Reglas:

- Anatomia con capas: surface base, overlay de textura, border/bevel, highlight, contenido.
- Variantes por `variant`, `size`, `tone`, `rarity`, `selected`, `disabled`, `loading`.
- Estados interactivos visibles: default, hover/focus, pressed, selected, disabled, loading, success, error.
- Loading conserva ancho/alto.
- Disabled explica razon con `FlRequirementHint`, tooltip o copy contextual.
- No crear un primitive nuevo si ya existe uno que cubre el rol.

## 12. Componentes Compuestos

Compuestos minimos:

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

Reglas:

- Un compuesto ordena datos y primitives; no inventa estilos visuales propios.
- Si aparece un patron repetido en dos pantallas, subirlo a compuesto.
- Si aparece un estilo repetido en dos compuestos, bajarlo a primitive/token.

## 13. Screen Recipes

## Combat Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Combat Full.png`

Objetivo:
- Comunicar combate activo, tier actual, enemigo dominante, progreso inmediato, acciones tacticas y recompensas semanales.

Zonas:
- Header global con portrait, nivel, estado, recursos y menu.
- Tier/progression track.
- Enemy stage dominante con fondo, enemigo, nombre y HP.
- Side action rail.
- Player HUD con HP/XP.
- Stat strip.
- Contrato activo.
- Weekly ledger.
- Weekly boss.
- Combat log/reset.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `FlResourceCounter`, `CombatTierTrack`, `CombatEnemyStage`, `FlHealthBar`, `CombatSideActions`, `FlSideAction`, `CombatPlayerHud`, `FlStatStrip`, `ContractCard`, `WeeklyLedgerCard`, `WeeklyBossCard`, `FlPanel`, `FlButton`, `FlBottomNav`.

Reglas de composicion:
- El ancho de 802px de referencia manda escala horizontal.
- El stage enemigo domina el primer viewport; no se convierte en card pequena.
- Side actions se alinean al borde derecho del stage.
- Cards inferiores full-width con margen lateral consistente.
- Bottom nav queda integrado al marco.

Diferencias permitidas:
- Enemigo/fondo real segun data.
- Altura del stage adaptada a 390/430/1280.
- Log cerrado por defecto si el viewport lo requiere.

Diferencias no permitidas:
- Comprimir contrato, weekly y boss arriba del fold.
- Sustituir stage por fondo plano.
- Usar botones verdes para extraer/reclamar.
- Cambiar side rail por links de texto.

## Mochila Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Mochila Full.png`

Objetivo:
- Comunicar gestion tactica de equipo con upgrades potenciales, filtro de loot y retorno rapido a combate.

Zonas:
- Header global.
- Expedition context strip con tier/boss/upgrades y `Volver a combate`.
- Titulo Mochila con capacidad y orden.
- Equipado destacado.
- Filtro de loot por rareza/caza/proteccion.
- Inventario con tabs de rareza/orden.
- Lista de item rows con acciones equipar/vender.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `FlButton`, `FlTag`, `FlSectionHeader`, `InventoryEquippedCard`, `FlItemCard`, `FlItemRow`, `FlTabs`, `FlBadge`, `FlIconFrame`, `FlBottomNav`.

Reglas de composicion:
- Lista densa y full-width; icono grande a la izquierda y poder a la derecha.
- Rareza colorea borde/badge, no toda la fila.
- Filtro es panel funcional, no toolbar web.

Diferencias permitidas:
- Cantidad de rows segun inventario real.
- Filtros colapsables en 390 si no hay espacio.

Diferencias no permitidas:
- Cards blancas/grises o borders genericos.
- Acciones de item sin frame Forge.
- Separar filtro e inventario con estilos distintos.

## Forja Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Forja Full.png`

Objetivo:
- Comunicar transformacion de item, comparacion antes/despues, coste, riesgo/entropia y CTA de mejora.

Zonas:
- Header global.
- Station header con back, titulo e info.
- Tabs de modos.
- Item preview grande.
- Preview numerico antes/despues.
- Material/probabilidad/coste.
- Upgrade track.
- Stats actuales vs nuevas.
- CTA primario.
- Feedback de resultado.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `FlIconButton`, `FlTabs`, `ForgeUpgradePanel`, `FlIconFrame`, `FlProgressBar`, `FlStatRow`, `FlResourceCounter`, `FlButton`, `FlToast`, `FlBottomNav`.

Reglas de composicion:
- Dos columnas principales solo cuando el ancho lo permite; en 390 se apilan manteniendo item y preview arriba.
- CTA primario grande, dorado y fisico.
- Entropia usa barra framed, no input plano.

Diferencias permitidas:
- Modos bloqueados ocultos o disabled.
- Costes reales.

Diferencias no permitidas:
- CTA verde.
- Comparacion como tabla SaaS.
- Item sin relicario/rareza.

## Santuario Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Santuario Full.png`

Objetivo:
- Comunicar hub operativo con trabajos listos/en curso, estaciones desbloqueadas y acceso a expedicion.

Zonas:
- Header global.
- Titulo Santuario con home/action icon.
- Trabajos con resumen y controles todo/repetir.
- Job listo y job en progreso.
- Estaciones como filas con icono, descripcion y abrir.
- Arsenal de reliquias.
- CTA iniciar expedicion.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `FlSectionHeader`, `SanctuaryJobCard`, `FlProgressBar`, `FlButton`, `FlIconButton`, `FlIconFrame`, `FlStationCard`, `FlRequirementHint`, `FlBottomNav`.

Reglas de composicion:
- Rows altas con icono circular/relicario a la izquierda y accion a la derecha.
- Estado listo verde, progreso azul, estructura bronce.
- CTA iniciar expedicion separado y dominante.

Diferencias permitidas:
- Estaciones ocultas/locked segun progreso.
- Jobs listos/en curso variables.

Diferencias no permitidas:
- Estaciones como grid de cards SaaS sin borde Forge.
- Estados sin color semantico.

## Talentos Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Talentos Full.png`

Objetivo:
- Comunicar arbol de progreso por clase, puntos disponibles, ramas y compra de nodo.

Zonas:
- Header global.
- Hero talent header con clase/build y TP.
- Subtabs Ficha/Atributos/Talentos.
- Rama activa.
- Panel de arbol con columnas T1/T2/T3.
- Nodo seleccionado.
- Detail panel con requisitos y comprar.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `FlTabs`, `TalentTreePanel`, `FlTalentNode`, `FlIconFrame`, `FlBadge`, `FlRequirementHint`, `FlButton`, `FlBottomNav`.

Reglas de composicion:
- Nodos grandes, circulares/facetados, conectados por columnas.
- El detalle no tapa el arbol; aparece debajo en mobile.
- TP es numero protagonista.

Diferencias permitidas:
- Scroll horizontal interno para ramas si el arbol crece.
- Nodos locked con opacity y razon visible.

Diferencias no permitidas:
- Nodos como botones planos.
- Arbol demasiado pequeno para meter todo.

## Ecos Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Ecos Full.png`

Objetivo:
- Comunicar extraccion/prestige, consecuencias de reset, ecos disponibles y ramas persistentes.

Zonas:
- Header global.
- Hero de extraccion con icono grande y valor de ecos.
- Conservas vs se reinicia.
- Stats resumen.
- Sigilos activos de run.
- Reset/prestige explanation.
- Ecos disponibles y modificadores.
- Hitos.
- Ramas y nodos comprables.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `EchoPrestigePanel`, `FlPanel`, `FlStatStrip`, `FlBadge`, `FlTag`, `FlIconFrame`, `FlTalentNode`, `FlButton`, `FlBottomNav`.

Reglas de composicion:
- Violeta/arcane se usa para ecos y ramas, no para toda la pantalla.
- Consecuencias deben estar en panels semanticos verde/rojo/azul.
- Scroll largo permitido; no comprimir ramas arriba.

Diferencias permitidas:
- Ramas colapsadas si hay muchas.
- CTA de comprar deshabilitado con requisito.

Diferencias no permitidas:
- Reset sin warning visual.
- Ecos como dashboard numerico plano.

## Intel Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Intel Full.png`

Objetivo:
- Comunicar lectura tactica de run: tier, bosses, poderes revelados y objetivos accesibles.

Zonas:
- Header global.
- Context strip con volver a combate.
- Radar tactico hero.
- Chips de build/bosses/powers.
- Stat cards tacticas.
- Expedicion activa.
- Objetivos revelados.
- Listas de poderes/bosses.
- Panels colapsables.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `FlButton`, `FlPanel`, `FlStatStrip`, `FlBadge`, `FlTag`, `FlIconFrame`, `FlItemRow`, `FlIconButton`, `FlBottomNav`.

Reglas de composicion:
- Radar/arte tactico a la derecha en referencia ancha; en mobile estrecho puede pasar a fondo/ornamento.
- Listas densas con icono circular, copy y accion `Ir`.
- Azul informa progreso persistente/tactico.

Diferencias permitidas:
- Secciones colapsables segun data.
- Radar simplificado si no hay asset final.

Diferencias no permitidas:
- Convertir listas en tablas.
- Perder el `Volver a combate` prominente.

## Biblioteca Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Biblioteca Full.png`

Objetivo:
- Comunicar archivo permanente, registro de poderes/familias/bosses y progreso de investigacion.

Zonas:
- Header global.
- Hero de Biblioteca con icono grande, descripcion y counters.
- Recursos de investigacion.
- Tabs Archivo/Glosario.
- Bonos activos.
- Poderes legendarios con carousel/tabs.
- Lista de registros ocultos.
- CTA iniciar expedicion.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `FlResourcePill`, `FlTabs`, `FlPanel`, `FlCard`, `FlItemRow`, `FlIconFrame`, `FlBadge`, `FlButton`, `FlBottomNav`.

Reglas de composicion:
- Hero superior en panel ancho con icono grande.
- Registros ocultos usan violeta/oculto y lock claro.
- CTA flotante/persistente solo si no tapa lectura critica.

Diferencias permitidas:
- Carousel como tabs/segmented control.
- Listas virtualizadas.

Diferencias no permitidas:
- Locks sin frame.
- Biblioteca como pagina informativa plana.

## Destileria Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Destileria Full.png`

Objetivo:
- Comunicar misiones auxiliares con equipos, duraciones, recompensas listas y asignacion de trabajos.

Zonas:
- Header global.
- Hero de Encargos/Destileria con icono grande y stats.
- Catalogo de encargos.
- Encargo expandido con duraciones y asignar.
- Encargos colapsados.
- Recompensas listas.
- CTA iniciar expedicion.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `FlPanel`, `FlStatStrip`, `FlCard`, `FlIconFrame`, `FlButton`, `FlProgressBar`, `SanctuaryJobCard`, `FlBottomNav`.

Reglas de composicion:
- El encargo expandido muestra tres duraciones en cards compactas.
- Rows colapsadas tienen icono, titulo, reward chip y plus/minus.
- Recompensa lista usa verde semantico dentro de frame.

Diferencias permitidas:
- Nombre de station puede ser Encargos si el repo lo modela asi.
- Duraciones dinamicas.

Diferencias no permitidas:
- Duraciones como radio buttons planos.
- Recompensas sin CTA claro.

## Ficha Heroe Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Ficha Heroe Full.png`

Objetivo:
- Comunicar identidad del heroe, build activa, nivel, vida/XP y lectura rapida de stats.

Zonas:
- Header global.
- Hero profile con portrait grande.
- Clase/build tags.
- Nivel, bajas, HP, XP.
- Build actual.
- Lectura rapida de stats.
- Subtabs Ficha/Atributos/Talentos.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `FlPanel`, `FlIconFrame`, `FlHealthBar`, `FlProgressBar`, `FlTag`, `FlStatRow`, `FlTabs`, `FlBottomNav`.

Reglas de composicion:
- Portrait domina la zona superior pero no sustituye datos.
- Build rows son grandes, con icono rombo y chevron.
- Stats en tabla Forge con separadores bronce finos.

Diferencias permitidas:
- Portrait por clase real desde `public/assets/portraits/classes/`.
- Stats ocultas si no aplican.

Diferencias no permitidas:
- Perfil sin arte.
- Stats como cards sueltas sin ritmo.

## Atributos Heroe Full Recipe

Referencia:
- `uirefactor/fullpage/redesign/Atributos Heroe Full.png`

Objetivo:
- Comunicar gasto de oro en atributos de combate/economia y lectura actual del build.

Zonas:
- Header global.
- Titulo Atributos con recurso oro.
- Tabs combate/economia.
- Filas de atributo con icono grande, nivel, track y coste.
- Lectura actual.
- Subtabs Ficha/Atributos/Talentos.
- Bottom nav.

Componentes usados:
- `FlHeaderBar`, `FlResourceCounter`, `FlTabs`, `FlStatRow`, `FlIconFrame`, `FlProgressBar`, `FlButton`, `FlPanel`, `FlBottomNav`.

Reglas de composicion:
- Cada atributo es una row alta, no un card aislado.
- Track segmentado con diamantes.
- Coste es boton/pill dorado con icono oro.

Diferencias permitidas:
- Comprar inline o boton si el repo lo requiere.
- Economia puede quedar debajo del fold.

Diferencias no permitidas:
- Sliders nativos.
- Costes verdes o azules.

## Progreso Offline Recipe

Referencia:
- `uirefactor/fullpage/redesign/Progreso_Offline.png`

Objetivo:
- Comunicar resumen de progreso offline como modal/reporte premium con recompensas y mejor drop.

Zonas:
- Modal/panel ancho con close.
- Titulo Cronica Offline.
- Tiempo resuelto y barra de progreso.
- Grid de recompensas.
- Mejor drop destacado.

Componentes usados:
- `FlModal`, `FlIconButton`, `FlProgressBar`, `FlStatStrip`, `FlResourceCounter`, `FlItemCard`, `FlIconFrame`, `FlBadge`.

Reglas de composicion:
- En desktop puede ser modal horizontal 1573x1000 de referencia.
- En mobile se vuelve panel vertical scrollable con close sticky.
- Mejor drop conserva rareza en icon frame y texto.

Diferencias permitidas:
- Recompensas cero ocultas solo si reduce ruido sin romper layout.
- Modal full-screen en 390.

Diferencias no permitidas:
- Toast simple para resumen completo.
- Grid sin marco ni jerarquia.

## 14. Estados Visuales

Estados globales:

- Default: superficie oscura, borde bronce, texto calido.
- Hover/focus: borde mas claro, glow suave, outline accesible.
- Pressed: inset/translate leve sin cambiar layout.
- Selected/active: dorado claro, indicador ornamental, glow controlado.
- Disabled/locked: contraste bajo, lock/requisito visible, sin parecer roto.
- Loading: spinner/stripe dentro del frame, mismo tamano.
- Success: verde semantico en badge/fill/glow local.
- Error/danger: rojo semantico en copy/borde local.
- Warning/reward: naranja/dorado, no rojo.

## 15. Feedback Y Microinteracciones

Duraciones:

- Pressed: 80-120ms.
- Toast/reward: 2-4s.
- Dano/curacion flotante: 400-700ms.
- Progress fill update: 180-320ms.
- Modal/sheet: 160-240ms.

Reglas:

- Animaciones apoyan feedback, no decoran constantemente.
- Numeros grandes pueden pulsear cuando suben.
- Dano critico es mayor y rojo/naranja; curacion verde; XP violeta/azul.
- Recompensa usa dorado/naranja y no cubre controles criticos.
- Respeta `prefers-reduced-motion`.

## 16. Assets Y Fondos

Texturas disponibles:

- `public/assets/forge-light/textures/fl-metal-grain-overlay.png`
- `public/assets/forge-light/textures/fl-panel-noise-overlay.png`

Uso:

- `fl-metal-grain-overlay.png`: botones, barras, nav, marcos, superficies metalicas.
- `fl-panel-noise-overlay.png`: panels, cards, modales, superficies de lectura.
- Ambas son overlays transparentes; se aplican con pseudo-elements, opacity y blend mode. No son fondos opacos.

Assets existentes relevantes:

- Combat background: `public/assets/combat/backgrounds/ruinas_olvidadas.png`
- Combat enemies: `public/assets/combat/enemies/*.png`
- Weekly bosses: `public/assets/combat/weekly-bosses/*.png`
- Items: `public/assets/items/*.png`
- System icons: `public/assets/icons/system/*.png`
- Portraits: `public/assets/portraits/classes/*.png`
- Stations: `public/assets/sanctuary/stations/*.png`
- Talents/Echoes: `public/assets/skills/talents/*.png`, `public/assets/skills/echoes/*.png`

Reglas:

- No reemplazar una escena ilustrada por gradiente plano.
- Enemy stage requiere fondo, personaje, vignette, overlays y HUD.
- Iconos bitmap viven dentro de `FlIconFrame`.
- Si falta asset final, usar placeholder documentado dentro del mismo frame, no cambiar el sistema visual.
- Fondos de pantalla usan vignette oscuro para legibilidad.
- No tapar assets deficientes con exceso de glow.

## 17. Reglas Responsive

390x844:

- Header visible, compacto.
- Primer viewport de Combat: header, tier, stage dominante, HP enemigo, side actions y parte del player HUD/stat strip.
- Cards inferiores quedan debajo del fold.
- Bottom nav no tapa CTA critico; si es fixed, sumar padding bottom.

430x932:

- Igual a 390, con mas aire vertical.
- No meter weekly boss completo arriba del fold en Combat si achica el stage.

1280x800:

- Mantener layout de juego.
- Combat puede centrar un canvas/screen max-width o usar stage dominante con rail y panels, pero no convertir todo en tres columnas de dashboard.
- Progreso Offline puede usar modal ancho horizontal como referencia.

Regla fullpage:

- Ancho manda escala horizontal.
- Alto manda scroll.
- No escalar fullpage completa al viewport.

## 18. Anti-Patrones Prohibidos

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
- No meter estilos Forge nuevos en `responsive.css` si pertenecen a un primitive.
- No cambiar gameplay, balance ni reducers para resolver problemas visuales.
- No usar emojis como iconografia.
- No achicar tipografia/barras/cards para forzar mas zonas above-the-fold.
- No sustituir assets de RPG por fondos abstractos borrosos.

## 19. Checklist De Aceptacion

- [ ] Usa `UI KIT.png` para primitives y la fullpage para layout.
- [ ] Header, nav, botones, panels, badges y barras comparten sistema.
- [ ] El foco visual se entiende en 2 segundos.
- [ ] El primer viewport no intenta comprimir toda la fullpage.
- [ ] Combat muestra header, tier, enemy stage, HP y HUD principal arriba del fold.
- [ ] Los colores vivos son semanticos.
- [ ] CTA primario es dorado/bronce.
- [ ] Cards/panels tienen textura, borde, profundidad y esquinas Forge.
- [ ] Barras tienen marco, fill y label legible.
- [ ] No hay overflow horizontal en 390/430.
- [ ] El texto no pisa ni desborda controles.
- [ ] Loading/disabled/selected existen.
- [ ] No hay hex hardcodeados en JSX.
- [ ] No hay primitives duplicados por pantalla.
- [ ] Assets/fondos no fueron reemplazados por planos.
- [ ] La continuidad vertical del scroll se parece a la fullpage.

Si una pantalla no se parece a Combat Full, revisar estos puntos:

- El fondo es plano o parece dashboard.
- Los panels no tienen ruido/textura.
- Los bordes son grises, redondeados o sin facetas.
- El dorado aparece como decoracion uniforme en vez de jerarquia.
- El primer viewport intenta mostrar demasiadas zonas.
- Los recursos o acciones no usan frames.
- Las barras parecen inputs/progress nativos.
- Los iconos no viven en `FlIconFrame`.
- El bottom nav parece app web, no marco de juego.
- La rareza pinta superficies completas.
- Los textos largos usan dorado o escala hero.
- El layout ignora margenes/gutters de la referencia.

## 20. Reglas Para IA/Codex

- Antes de implementar una pantalla, leer `design3.md`, `ui-kit.md`, `component-map.md` e `implementation-plan-v3.md`.
- No implementar Combat antes de completar el `Combat Full Visual Breakdown`.
- No tocar reducers/gameplay para resolver visual.
- No crear estilos locales si existe primitive.
- Si falta primitive, crearlo en `src/components/ui/forge/` y documentarlo.
- Si falta asset, registrar placeholder/deuda visual.
- Comparar en 390x844, 430x932 y 1280x800.
- Registrar QA visual en `uirefactor/visual-qa-v3.md` despues de implementar pantallas.

## Combat Full Visual Breakdown

Referencia:
- `uirefactor/fullpage/redesign/Combat Full.png`

Dimensiones de referencia:
- Imagen: 802 x 1961 px.
- Ancho de referencia como base de escala horizontal: 802 px.
- Relacion aproximada contra 390: 390 / 802 = 0.486.
- Relacion aproximada contra 430: 430 / 802 = 0.536.
- Relacion aproximada contra 1280: 1280 / 802 = 1.596.
- Alto fullpage 1961 px equivale a 2.32 viewports de 844 px o 2.10 viewports de 932 px.
- El alto fullpage no se comprime; se divide en tramos de scroll.

Regla ancho-vs-alto:

- El ancho define escala del layout.
- Margenes laterales, gutters, ancho de cards, barras, side actions y proporcion del enemy stage se traducen al viewport disponible.
- El alto completo no se reescala.
- La fullpage es guia de continuidad vertical, no exigencia de contenido above-the-fold.

Mapa vertical:

- 0-15%: header + tier/progression.
- 15-45%: enemy stage + HP + side actions + player HUD.
- 45-55%: stat strip.
- 55-70%: active contract.
- 70-84%: weekly ledger.
- 84-96%: weekly boss.
- 96-100%: combat log/reset/bottom nav.

Primer viewport mobile esperado:

- Debe mostrar header, recursos, tier, enemy stage dominante, enemy HP, side actions y player HUD/stat strip parcial.
- No necesita mostrar contrato completo, weekly ledger, weekly boss ni combat log.
- Debe sentirse completo aunque el usuario no scrollee.

Segundo tramo de scroll:

- Stat strip completo.
- Contrato activo.
- Weekly ledger.

Tercer tramo de scroll:

- Weekly boss.
- Combat log.
- Reset.
- Bottom nav.

Reglas de proporcion:

- Header compacto, no hero.
- Stage enemigo dominante.
- Enemy HP larga y centrada con frame.
- Side actions son botones fisicos verticales, no links.
- Player HUD anclado visualmente debajo del enemigo.
- Cards inferiores full-width con padding consistente.
- Bottom nav fijo o persistentemente reconocible segun arquitectura actual.
- No reducir tipografia, barras, iconos o cards para forzar mas zonas verticales.

Firma visual:

- Fondo oscuro con escena/arte.
- Marcos dorado/bronce con esquinas facetadas.
- Tipografia display para titulos y numeros importantes.
- Barras con frame metalico y fill saturado.
- Icon frames ornamentales.
- Separadores finos con pequenos ornamentos.

Riesgos principales:

- Interpretar 1961 px como un viewport unico.
- Hacer el stage demasiado bajo.
- Meter weekly/boss arriba del fold.
- Reemplazar el fondo por gradiente.
- Crear side actions locales sin `FlSideAction`.
