# Forge Light Design System (Operativo)

Estado: guía canónica para migrar UI con IA o manualmente, consistente con el kit vigente.

Fuente de verdad visual:
- `uirefactor/kit-demo-3/forge-light-kit-v4.html`

Objetivo:
- Mantener layouts funcionales actuales.
- Unificar skin en primitives/tokens.
- Evitar parches por pantalla, cascadas rotas y drift visual.

---

## 1) Principios Innegociables

1. Si hay conflicto entre app y kit v4, gana kit v4.
2. Se corrige primitive primero (`FlButton`, `FlCard`, etc.), después wrappers, después pantallas.
3. Skin y layout están separados:
   - skin en primitives,
   - layout en modules/screens.
4. No se crean variantes nuevas sin necesidad semántica real.
5. No se hardcodean colores/sombras/tipografía en JSX.
6. Cuando se corrige un conflicto visual, es obligatorio eliminar el legacy/override que lo causó.

---

## 2) Estado Canónico Actual (hoy)

Implementado y obligatorio:
- `FlButton variant="default"` es el botón default del kit.
- `primary` queda como alias compatible.
- `FlItemRow` canónico con variantes:
  - `inventory` (A1: stats inline + delta + `Equipar/Vender`),
  - `equipped` (A2: estado equipado + acción única).
- `Equipar` y `Detalle` deben salir de `FlButton default`, no de botones locales.

Referencia de trazabilidad:
- `notes/flbutton-canonical-parity-v4.md`

---

## 3) Ownership Técnico (dónde vive cada cosa)

### Tokens
- `src/styles/forge-light-v2/tokens.css`
- Canon: `--fl-*`
- Compat temporal: aliases `--fl2-*`

### Contratos de naming (canónico)
- Clases CSS canónicas: `fl-*` (no `fl2-*` en componentes ni selectors activos).
- Screen switch canónico del shell: `data-fl-screen="<screen>"`.
- `fl2-*` queda solo como compat de variables en `tokens.css` para no romper legacy externo.

### Skin de primitives
- `buttons.css`, `badges.css`, `progress.css`, `navigation.css`, `primitives.css`
- Aquí vive: borde, fondo, textura, sombra, tipografía, estados, tamaños.

### Layout/composición
- `layout.css`, `modules.css`, `screens/*.css`
- `modules`: estructura de wrappers de dominio.
- `screens`: distribución por pantalla.
- Prohibido en `modules/screens`: redefinir skin de primitives.

---

## 4) Protocolo de Migración Para IA (obligatorio)

1. Auditar en kit: base, variantes, tamaños, estados, pseudo-elementos.
2. Auditar en app: primitive + wrappers + consumidores.
3. Auditar cascada real: tokens -> primitives -> modules -> screens.
4. Escribir mapping canónico antes de editar.
5. Implementar en orden:
   - tokens,
   - primitive,
   - wrappers,
   - screens (solo layout).
6. Limpiar overrides locales que contradigan el canónico.
7. Eliminar reglas legacy que estaban interfiriendo (no dejarlas comentadas ni “por si acaso”).
8. Validar build.

No aceptado:
- “se parece” pero con patch local.
- subir especificidad para tapar problema en vez de resolver origen.
- inline de skin.

---

## 5) Reglas de Cascada y Overrides

Precedencia oficial:
1. `tokens.css`
2. CSS de primitives
3. `modules.css`
4. `screens/*.css`

Checklist anti-conflicto:
- ¿Wrapper toca `border/background/box-shadow/font` de un primitive?
- ¿Selector por pantalla pisa estados (`hover/active/disabled/loading`)?
- ¿Hay duplicación de skin entre `buttons.css` y `primitives.css`?
- ¿Hay `!important` heredado bloqueando el canónico?

Si sí: corregir en primitive/canónico y eliminar override local.

Regla de higiene (imperativa):
- Cada fix debe cerrar con limpieza de la causa raíz en cascada.
- No se permite dejar CSS/JS legacy que siga compitiendo con el contrato canónico.
- Si un override viejo ya no tiene dueño funcional, se borra.

---

## 6) Política de Inline Styles

Permitido (mínimo):
- Valores dinámicos runtime que no cierran con clases/tokens.
- CSS vars dinámicas puntuales.

No permitido:
- Skin inline (`background`, `border`, `shadow`, `font`, `radius`, estados).
- Layout repetido inline (`display`, `gap`, `grid`, paddings estructurales).

Regla:
- Si se repite 2+ veces, extraer a clase/helper/componente.

---

## 7) Contrato Canónico de Primitives

## `FlButton`
- Variantes: `default`, `primary`(alias), `secondary`, `ghost`, `danger`, `danger-ghost`, `destructive`, `success`, `cta`.
- Tamaños: `sm`, `md`, `lg`, `full`.
- Estados: `default`, `pressed`, `loading`, `disabled`, `selected`, `error`, `success`.
- Regla: wrappers no alteran skin.

## `FlCard` / `FlPanel`
- `FlPanel`: contención de sección.
- `FlCard`: unidad repetible/selectable.
- Rareza se expresa por borde/frame/badge/glow, nunca fondo completo.

## `FlBadge` / `FlTag`
- `FlBadge`: estado corto.
- `FlTag`: contexto/filtro/afijo.
- Acción relevante -> `FlButton`.

## `FlProgressBar` / `FlHealthBar`
- Progreso por semántica (`type`), no por color ad-hoc por pantalla.

## `FlTabs` / `FlHeaderBar` / `FlBottomNav`
- Navegación canónica; no recrear nav/tab/header local.

---

## 8) Mapeo Semántico Rápido

- Acción: `FlButton`
- Acción icon-only: `FlIconButton`
- Cambio de vista: `FlTabs` / `FlBottomNav`
- Estado corto: `FlBadge`
- Contexto/filtro: `FlTag`
- Progreso: `FlProgressBar` / `FlHealthBar`
- Contenedor principal: `FlPanel`
- Unidad repetida: `FlCard`
- Item/equipo: `FlItemRow` / `FlItemCard`
- Recurso/costo: `FlResourceCounter` / `FlResourcePill` / `FlCostDisplay`
- Bloqueo explicable: `FlRequirementHint`

---

## 9) Recomendaciones de Layout por Pantalla

- Mantener layout funcional existente salvo necesidad explícita.
- Migrar visualmente “de adentro hacia afuera”:
  1. acciones,
  2. estados,
  3. rows/cards,
  4. paneles y navegación.
- Patrones recomendados:
  - `fl-screen-stack`,
  - `fl-section-stack`,
  - `fl-chip-row`,
  - `fl-action-row`,
  - `fl-grid--metrics`,
  - `fl-dense-list`,
  - `fl-split--52-48`, `fl-split--54-46`.

Regla:
- si un layout actual funciona, conservarlo y migrar piezas internas al sistema.

---

## 10) Uso de Módulos del UI Kit v4 (Fit Matrix)

### Se usa como referencia directa (si hay match semántico)
- Top Status Bar (`Navegación`): para `FlHeaderBar`.
- Bottom Navigation Bar: para `FlBottomNav` (estados inactive/active/pressed).
- Buttons, Cards, Bars, Badges, Resource Pills: referencia base de primitives.
- Tab 23 (Item Rows A): referencia principal de `FlItemRow` inventario/equipado.

### Se usa parcialmente (solo piezas)
- Tab 18 (Crafting): usar piezas puntuales (cards de stats, patrón CTA upgrade) sin forzar layout completo.
- Tab 19/20/21: usar patrones de estado/detalle/paginación si encajan con flujo real.

### No forzar como layout completo
- Tab 15 (Inventario Dense Row + Item Detail) no forzar como módulo entero.
- Tab 16 (Combat HUD) no forzar como módulo entero.
- Tab 18 (Crafting) no forzar como módulo entero.

Regla final de módulos:
- Si hay duda de fit, mantener layout actual + skin/primitives canónicos.

---

## 11) Componentes Recomendados a Crear (futuro)

Si faltan o están débiles frente al kit:
- `FlToggle` (toggle canónico, evita variantes locales).
- `FlStepper` / `FlPagination` (microelementos Tab 21).
- `FlDivider` (ornamental y vertical, microelementos).
- `FlBottomSheet` (modal mobile semántico).
- `FlItemCompareTable` (bloque reusable para modal de item).

Condición:
- crear solo si elimina duplicación real en 2+ pantallas.

---

## 12) Definition of Done por Migración

1. Usa primitive canónico, no clon local.
2. Coincide con kit en base + hover + active + disabled + loading + selected.
3. Sin overrides de skin en `modules/screens`.
4. Inline minimizado y solo dinámico.
5. `npm run build` OK.
6. Si no hay lint/tests, dejar nota explícita.
7. Documentar mapping y conflictos resueltos.

---

## 13) Prompt Plantilla Para Otras IAs

```txt
Migra <COMPONENTE/PANTALLA> usando como fuente de verdad forge-light-kit-v4.html.

Obligatorio:
1) Auditar kit + componente actual + cascada completa.
2) Definir mapping canónico antes de editar.
3) Corregir tokens/primitives primero; wrappers después; screens solo layout.
4) Eliminar overrides locales de skin e inline innecesario.
5) Mantener layout funcional actual salvo instrucción explícita.
6) Verificar estados y build.
7) Documentar decisiones en flDesign.md y nota de trazabilidad.

No aceptado:
- Parches por pantalla para “aproximar”.
- Nuevas variantes locales sin necesidad semántica.
- Hardcodes visuales en JSX.
```

Este archivo es la guía vigente del sistema de diseño Forge Light.

---

## 14) Runbook Real: Cómo Lograr Paridad Visual (caso FlSideAction)

Este es el procedimiento que funcionó cuando un componente “seguía viéndose viejo” aunque ya estaba migrado.

### Paso 1: Canonizar el componente (JSX)
- El componente debe montar clases canónicas del sistema.
- Ejemplo aplicado:
  - `FlSideAction` usa base de botón canónico (`fl-button` + variante/tamaño) y añade solo estructura (`icon + label + badge`).
- Regla: semántica propia en el componente, skin base en primitives globales.

### Paso 2: Llevar skin a global (`forge-light-v2/buttons.css`)
- Definir look completo del primitive ahí:
  - doble borde (borde exterior + inset),
  - degradado/fondo,
  - hover/active/disabled,
  - badge circular overflow.
- No resolver esto en `screens/*.css`.

### Paso 3: Auditar cascada legacy que pisa el canónico
- Buscar selectores antiguos por pantalla y por responsive:
  - `combat-forge-side-action`,
  - pseudo-elementos (`::before`, `::after`) decorativos,
  - overrides de borde/fondo/sombra/tipografía.
- En este caso, la fuente del drift era `src/styles/responsive.css` + parte de `screens/combat.css`.

### Paso 4: Limpiar overrides de skin fuera de primitives
- En `screens/*.css` y `responsive.css` dejar solo:
  - layout/posición/tamaño.
- Quitar/neutralizar:
  - bordes/fondos/sombras legacy,
  - ornamentos de esquina,
  - skins alternativos del badge.

### Paso 5: Confirmar que el badge pueda overflowear
- Asegurar `overflow: visible` en el botón side action.
- Badge circular sólida:
  - sin clip-path ornamental,
  - sin borde decorativo,
  - posicionada en esquina superior derecha.

### Paso 6: Verificación mínima obligatoria
1. `npm run build`.
2. Revisar estados visuales base: default/hover/disabled.
3. Confirmar que no reaparezca skin vieja en mobile (normalmente viene de `responsive.css`).

### Anti-patrones detectados (no repetir)
- “Arreglar rápido” desde `screens/combat.css` con skin completa.
- Mantener decoraciones legacy en `responsive.css`.
- Tener el componente correcto en JSX pero estilo final controlado por overrides viejos.

### Regla operativa final
- Si no coincide con kit: **primero revisar cascada y limpiar overrides**, no agregar más CSS local.

---

## 15) Runbook Real: Márgenes Globales Canónicos (toda la app)

Este procedimiento se usa cuando Forja/Santuario/Héroe/Más/Combat muestran márgenes distintos.

### Objetivo
- Un solo gutter lateral canónico para toda la app.
- Evitar acumulación de padding en contenedores anidados.
- Evitar diferencias entre pantalla normal y overlays de estaciones.

### Implementación canónica (vigente)
- Archivo canónico: `src/styles/forge-light-v2/screens/margins.css`
- Import obligatorio al final: `src/styles/forge-light-v2/index.css`
- Token único:
  - desktop: `--fl-screen-edge-pad: 10px`
  - mobile: `--fl-screen-edge-pad: 8px`

### Regla técnica clave (la más importante)
1. El margen lateral se aplica **solo al shell exterior de pantalla**:
   - selector tipo `app-primary-viewport > <screen-root>`.
2. Los roots internos y wrappers anidados se resetean a `padding-inline: 0`.
3. Overlays de estaciones usan el mismo gutter.
4. Si un overlay contiene un root de pantalla, ese root interno vuelve a `0` para no duplicar margen.

### Síntoma de error típico
- “Héroe tiene más margen que Forja” o “Más/Registry se ve distinto”.
- Causa real: padding sumado en cadena (`hero-view` + `hero-view-content` + `character-root`, etc.).

### Qué limpiar cuando reaparece drift
1. `screens/shared.css`: quitar reglas genéricas de padding lateral que afecten múltiples capas.
2. roots con `style={{ padding: ... }}` en JSX:
   - `Prestige`
   - `Codex`
   - `Talents`
3. reglas locales en `screens/*.css` que mezclen `width/max-width/margin:auto` en roots (ej. Talents).
4. overrides legacy en `responsive.css` que toquen padding de roots globales.

### Anti-patrones (no repetir)
- Poner padding lateral en cada pantalla por separado.
- Compensar con `margin-left/right` locales.
- Dejar `max-width + margin:auto` en roots que deben seguir gutter global.
- “Arreglar una pantalla” sin revisar su contenedor padre y su hijo inmediato.

### Checklist rápido de verificación
1. Forja, Santuario, Héroe, Más, Combate: mismo gutter visual.
2. Destilería/Encargos/Laboratorio/Biblioteca: mismo gutter que pantallas base.
3. No hay doble padding en estación abierta dentro de Santuario.
4. `npm run build` OK.
