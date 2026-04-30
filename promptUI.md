# Prompt para Segunda Pasada Iterativa Forge Light

Quiero que hagas una segunda pasada iterativa de UI, pantalla por pantalla, profundizando como hiciste con Combat, pero ahora con foco en estandarizar toda la app alrededor del UI Kit y los primitives Forge.

No quiero una pasada global superficial. Quiero iteracion profunda por pantalla, mejora progresiva de primitives y actualizacion de documentacion cuando consolides reglas nuevas del sistema.

## Fuentes obligatorias

Debes seguir obligatoriamente:

- `uirefactor/nuevoDesign/UI Kit Forge Light.png`
- `uirefactor/ref2/UI Kit 2.png` > Una mejora del KIT de UI
- `uirefactor/design2.md`
- `uirefactor/design-system-implementation-plan.md`
- `ui-component-inventory.md`
- capturas actuales generadas en `uirefactor/current/`
- referencias nuevas de pantalla en `uirefactor/ref2/`

## Fuentes prohibidas como referencia visual de pantalla

No uses las capturas base de `uirefactor/*.png` como referencia de layout, estilo ni composicion de pantalla.

Las referencias de pantalla validas estan en:

- `uirefactor/ref2/Combat.png`
- `uirefactor/ref2/Combate_Abajo.png`
- `uirefactor/ref2/Forja.png`
- `uirefactor/ref2/Mochila.png`
- `uirefactor/ref2/Mochila_Abajo.png`
- `uirefactor/ref2/Santuario.png`
- `uirefactor/ref2/Heroe_Atributos.png`
- `uirefactor/ref2/Heroe_Ficha.png`
- `uirefactor/ref2/Ecos.png`
- `uirefactor/ref2/Progreso_Offline.png`
- `uirefactor/ref2/Biblioteca.png`
- `uirefactor/ref2/Laboratorio.png`
- `uirefactor/ref2/Destileria.png`
- `uirefactor/ref2/Encargos.png`
- `uirefactor/ref2/Altar de Sigilos.png`

Si aparece una captura vieja fuera de `uirefactor/ref2/`, ignorala para esta pasada.

## Regla de autoridad

- El UI Kit manda en estilo, componentes, botones, cards, bordes, barras, badges, rarezas, feedback, icon frames y microelementos.
- `design2.md` manda en reglas del sistema visual, criterios de conflicto y estandarizacion.
- `design-system-implementation-plan.md` manda en orden tecnico, primitives, assets, gates y control de cumplimiento.
- `ui-component-inventory.md` manda en cobertura funcional de componentes, estados, variantes y usos.
- Las referencias de `uirefactor/ref2/` mandan solo en layout, composicion, jerarquia, proporciones y orden visual de pantalla.
- Si una referencia de `ref2` contradice el UI Kit en estilo de componente, gana el UI Kit.
- Si una referencia de `ref2` muestra un layout mejor resuelto, usala para acercar la composicion.
- No mezcles estilos de varias referencias. Usa el UI Kit como promedio visual y las referencias `ref2` como layout por pantalla.

## Objetivo

Iterar cada pantalla hasta acercarla lo mas posible a su referencia de layout en `uirefactor/ref2/`, manteniendo y mejorando la estetica Forge Light definida por el UI Kit.

El objetivo final no es copiar pantalla por pantalla. El objetivo es estandarizar:

- primitives;
- tabs;
- botones;
- cards;
- badges;
- barras;
- recursos;
- icon frames;
- assets;
- densidad;
- spacing;
- estados visuales;
- responsive.

Si al mejorar una pantalla detectas que el problema esta en un primitive compartido, mejora el primitive para que toda la app converja al UI Kit. No parchees pantalla por pantalla.

## Documento de progreso obligatorio

Antes de implementar, crea o actualiza:

- `uirefactor/segunda-pasada-ui-progress.md`

Ese archivo debe registrar el avance con esta estructura:

```md
# Segunda Pasada UI Forge Light

## Autoridad

- UI Kit: uirefactor/nuevoDesign/UI Kit Forge Light.png
- Design contract: uirefactor/design2.md
- Implementation plan: uirefactor/design-system-implementation-plan.md
- Component inventory: ui-component-inventory.md
- Screen references: uirefactor/ref2/

## Ledger

| Pantalla | Referencia ref2 | Estado | Primitives tocadas | Assets integrados | Capturas revisadas | Deuda residual |
|---|---|---|---|---|---|---|

## Decisiones de Sistema

Registrar aca reglas nuevas que deban pasar a design2.md o al implementation plan.

## Iteraciones

Registrar cada iteracion por pantalla.
```

Actualiza este archivo al terminar cada pantalla y cada iteracion relevante.

## Actualizacion de design2.md y plan

Si durante la iteracion mejoras tabs, cards, botones, barras, icon frames, assets o cualquier primitive de forma que defina mejor el sistema Forge Light:

1. Actualiza `uirefactor/design2.md` con la regla visual consolidada si cambia el contrato de diseno.
2. Actualiza `uirefactor/design-system-implementation-plan.md` si cambia el procedimiento tecnico, API de primitives, asset workflow o gates.
3. Registra la decision en `uirefactor/segunda-pasada-ui-progress.md`.

No dejes reglas nuevas solo en CSS o JSX. Si una mejora estandariza la app, documentala.

Ejemplos:

- Si redefinis tabs para acercarlas al UI Kit, documenta la regla de tabs en `design2.md`.
- Si agregas una variante reusable de `FlCard`, documenta su uso en el plan.
- Si cambias como entran assets a `FlIconFrame`, documenta el flujo en el plan.
- Si una referencia `ref2` revela un patron de layout reusable, documentalo como receta o decision.

## Orden sugerido

Trabaja pantalla por pantalla:

1. Forja / Crafting: `uirefactor/ref2/Forja.png`
2. Mochila / Inventario: `uirefactor/ref2/Mochila.png` y `uirefactor/ref2/Mochila_Abajo.png`
3. Santuario: `uirefactor/ref2/Santuario.png`
4. Heroe / Atributos: `uirefactor/ref2/Heroe_Atributos.png` y `uirefactor/ref2/Heroe_Ficha.png`
5. Ecos / Prestige: `uirefactor/ref2/Ecos.png`
6. Combat: `uirefactor/ref2/Combat.png` y `uirefactor/ref2/Combate_Abajo.png`, solo si detectas regresiones o desalineacion
7. Biblioteca / Intel: `uirefactor/ref2/Biblioteca.png`
8. Laboratorio: `uirefactor/ref2/Laboratorio.png`
9. Destileria: `uirefactor/ref2/Destileria.png`
10. Encargos: `uirefactor/ref2/Encargos.png`
11. Altar de Sigilos: `uirefactor/ref2/Altar de Sigilos.png`
12. Progreso Offline: `uirefactor/ref2/Progreso_Offline.png`

Si una pantalla no existe todavia como pantalla independiente o vive como overlay, no inventes gameplay. Adapta el layout dentro del flujo actual y documenta la limitacion.

## Ciclo obligatorio por pantalla

Para cada pantalla, segui este ciclo.

### 1. Comparacion inicial

Antes de editar:

- Abri la captura actual correspondiente en `uirefactor/current/`.
- Abri la referencia correspondiente en `uirefactor/ref2/`.
- Abri el UI Kit.
- Compara layout contra `ref2`.
- Compara componentes contra el UI Kit.
- Lista diferencias por zonas.
- Separa diferencias en:
  - layout;
  - primitive;
  - asset;
  - spacing/densidad;
  - estado visual;
  - responsive/mobile;
  - documentacion de sistema.

### 2. Diagnostico primitive vs pantalla

Para cada diferencia importante, decidi:

- Si afecta una sola pantalla: corregir layout local.
- Si afecta botones/cards/badges/barras/nav/icon frames en varias pantallas: corregir el primitive.
- Si afecta tabs o subtabs: mejorar `FlTabs` o el componente compartido equivalente.
- Si afecta assets: corregir `assetRegistry`, `FlAsset` o wrapper de dominio.
- Si afecta solo proporcion/orden de bloques: corregir layout de pantalla.
- Si consolida una regla del sistema: actualizar `design2.md` o el plan.

### 3. Plan corto de iteracion

Antes de editar, registra en `segunda-pasada-ui-progress.md`:

- pantalla;
- referencia `ref2` usada;
- captura actual revisada;
- diferencias principales;
- primitives que vas a tocar;
- assets que vas a integrar;
- archivos esperados a modificar;
- riesgo de regresion;
- si hace falta actualizar `design2.md` o el implementation plan.

### 4. Implementacion acotada

Reglas:

- Toca solo esa pantalla y los primitives necesarios.
- No cambies gameplay.
- No inventes estilos locales si corresponde primitive Forge.
- No agregues hex nuevos en JSX.
- No pegues paths `/assets/` directo en pantallas si existe o debe existir `assetRegistry`.
- Assets deben entrar por `assetRegistry`, `FlAsset`, `FlIconFrame` o wrapper de dominio.
- No uses emojis como iconos finales.
- No copies estilos de capturas viejas fuera de `ref2`.
- No mezcles refactor visual con cambios de balance, progresion o reglas.

### 5. Iteracion sobre primitives

Podes modificar primitives Forge para acercarlos mas al UI Kit:

- `FlButton`
- `FlIconButton`
- `FlCard`
- `FlBadge`
- `FlTag`
- `FlIconFrame`
- `FlProgressBar`
- `FlResourceCounter`
- `FlTabs`
- `FlStatRow`
- `FlAsset`
- wrappers de dominio como `FlItemRow`, `FlTalentNode`, `FlStationCard`, `FlJobCard`, `FlEchoUpgradeCard`

Reglas para modificar primitives:

- No rompas APIs existentes sin actualizar usos.
- No agregues variantes que solo sirven para una pantalla.
- Si agregas una variante, debe tener nombre semantico y uso esperado.
- El primitive debe acercarse al UI Kit, no a una referencia aislada.
- Despues de tocar un primitive, revisa si afecto pantallas ya migradas.
- Documenta cambios relevantes en `design2.md` o en el implementation plan.

### 6. Captura y validacion

Despues de implementar:

```bash
npm run build
npm run ui:capture
```

Si no podes correr alguno, explica por que.

Luego revisa:

- captura nueva vs referencia `ref2`;
- primitives visibles vs UI Kit;
- mobile 390x844;
- mobile 430x932;
- desktop/tablet 1280x800;
- safe areas;
- bottom nav;
- headers;
- assets reales;
- texto y overflow.

### 7. Revision post-captura

Actualiza `segunda-pasada-ui-progress.md` con:

```txt
Pantalla:
Referencia ref2 usada:
Captura actual revisada:
Diferencias principales antes:
Diagnostico primitive vs pantalla:
Cambios realizados en layout:
Cambios realizados en primitives:
Cambios realizados en docs:
Primitives usadas/modificadas:
Assets integrados:
Comandos corridos:
Resultado post-captura:
Regresiones detectadas:
Deuda residual:
Requiere otra iteracion antes de avanzar: Si/No
```

No avances a la siguiente pantalla hasta que:

- el layout general este razonablemente cerca de la referencia `ref2`;
- los componentes principales respeten mejor el UI Kit;
- no haya diferencias grandes obvias en estructura;
- los primitives modificados no hayan empeorado pantallas previas;
- hayas reportado deuda residual.

Si la diferencia sigue siendo significativa, hace otra iteracion sobre la misma pantalla antes de avanzar.

## Hard gates

Detenete y corregi si aparece cualquiera de estos casos:

- Creaste un boton local nuevo en una pantalla.
- Creaste una card local nueva que podria ser `FlCard`.
- Creaste un badge/tag local nuevo que podria ser `FlBadge` / `FlTag`.
- Agregaste un nuevo hex en JSX.
- Agregaste un path `/assets/...` dentro de un componente de pantalla.
- Usaste emoji como icono final.
- Copiaste estilo de una captura vieja fuera de `uirefactor/ref2/`.
- Cambiaste logica de juego para resolver un problema visual.
- La pantalla solo se ve bien en un viewport.
- Mejoraste un primitive pero no revisaste impactos en otras pantallas.
- Consolidaste una regla visual nueva y no la documentaste.

## Auditorias por busqueda

Despues de cada pantalla o slice relevante, ejecuta o justifica si no podes:

```bash
rg "background:|borderRadius|boxShadow|#[0-9A-Fa-f]{3,6}" src/components
rg "/assets/" src/components src/data src/utils
rg "🎒|📦|🏺|⚔|🛡|🏹|✦|⬢" src
rg "button" src/components
rg "fl-button|FlButton|fl-card|FlCard|fl-badge|FlBadge|fl-progress|FlProgressBar|FlTabs|fl-tabs" src
```

Interpretacion:

- Estos comandos no tienen que dar cero siempre.
- Todo resultado nuevo sospechoso debe estar justificado.
- Hex nuevos en JSX son sospechosos por defecto.
- Emojis en UI final son deuda.
- Paths `/assets/` deben concentrarse en `assetRegistry`, data visual centralizada o wrappers.

## Criterio de calidad por pantalla

Una pantalla puede avanzar cuando:

- se reconoce claramente su referencia `ref2` en layout y jerarquia;
- los componentes se sienten del UI Kit, no de una captura aislada;
- usa primitives Forge o wrappers de dominio;
- los assets reales se integran con frames/componentes Forge;
- no hay overflow importante en mobile;
- no hay bottom nav/header inconsistentes;
- no hay CTA ambiguo;
- no hay colores semanticos usados como decoracion arbitraria;
- la deuda residual esta documentada.

## Cierre final obligatorio

Al terminar esta pasada, entrega un resumen con:

```txt
Pantallas iteradas:
Pantallas que requieren otra pasada:
Primitives mejoradas:
Docs actualizados:
Assets integrados:
Comandos corridos:
Capturas revisadas:
Deuda residual:
Siguiente recomendacion:
```

Recordatorio final:

No quiero que copies pantalla por pantalla. Quiero que uses `ref2` para composicion y el UI Kit para estandarizar el sistema completo. Si una mejora de tabs, cards, botones o frames sirve para varias pantallas, debe vivir en primitives y quedar documentada en `design2.md` o en el plan.
