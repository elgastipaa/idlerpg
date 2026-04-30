# Forge Light Design System

Fecha: 2026-04-28
Estado: fuente de verdad visual para el refactor UI
Alcance: sistema visual derivado de `Crafting.png`, `Santuario.png`, `Combat.png`, `Combate_Abajo.png`, `Talentos.png`, `Mochila.png`, `Mochila_Abajo.png`, `Mochila_Completa.png`, `Ecos.png`, `Heroe_Atributos.png`, `Heroe_Ficha.png`, `Intel.png` y `Iconos SVG.png`.

---

## 1. Alcance y fuentes

Este documento define como debe verse y comportarse la UI Forge Light del juego. No es un moodboard, no es un prompt estetico y no es una descripcion superficial. Es un contrato de implementacion para recrear las capturas con fidelidad alta.

Fuentes primarias:

- `uirefactor/Crafting.png`
- `uirefactor/Santuario.png`
- `uirefactor/Combat.png`
- `uirefactor/Combate_Abajo.png`
- `uirefactor/Talentos.png`
- `uirefactor/Mochila.png`
- `uirefactor/Mochila_Abajo.png`
- `uirefactor/Mochila_Completa.png`
- `uirefactor/Ecos.png`
- `uirefactor/Heroe_Atributos.png`
- `uirefactor/Heroe_Ficha.png`
- `uirefactor/Intel.png`
- `uirefactor/Iconos SVG.png`

Fuentes secundarias:

- `uirefactor/DESIGN_1.md`
- `uirefactor/plan_1.md`
- `designMDPlan.md`

Documentos auxiliares del sistema:

- `uirefactor/iconos.md`: catalogo canonico de iconos y prioridad de generacion SVG.
- `uirefactor/imagenes.md`: prompts para generar assets visuales de Combat y assets PNG transparentes de items para Mochila/Crafting.
- `uirefactor/plan_migracion_profunda_forge_light.md`: plan operativo por fases para migrar todas las pantallas y repetir auditorias visuales.

Reglas de prioridad:

- Si una captura contradice un texto, gana la captura.
- Si `DESIGN_1.md` aporta detalle que coincide con las capturas, se adopta.
- Si `plan_1.md` alerta sobre exceso de dorado, exceso de gris o falta de jerarquia, se usa como criterio de validacion.
- Si el codigo actual limita un flujo, el diseno debe adaptarse sin inventar features nuevas.
- `stitch/` no es fuente visual y no debe usarse para justificar decisiones esteticas.

Objetivo de fidelidad:

- Una persona o IA debe poder implementar una primera version creible leyendo este documento aunque no tenga las capturas abiertas.
- Las capturas siguen siendo autoridad final para ajuste fino.
- El documento debe evitar tanto una UI dorada sobrecargada como una UI gris generica sin identidad Forge Light.

---

## 2. Filosofia visual

Forge Light es una UI dark fantasy premium, mobile-first, densa y legible. La sensacion buscada es la de manipular un artefacto de forja, no la de usar una app web generica.

Lo que debe transmitir:

- Peso fisico: paneles, botones e iconos parecen piezas talladas o metalicas.
- Calor controlado: el dorado y naranja sugieren fuego, forja, recompensa y progreso.
- Profundidad: fondos oscuros, bordes iluminados, glows internos y separadores ornamentales crean capas.
- Legibilidad rapida: cada pantalla debe responder en 2 segundos que esta listo, que progresa y donde tocar.
- Fantasia funcional: hay ornamentacion, pero no debe tapar decisiones ni saturar informacion.

Lo que diferencia a Forge Light de UI generica:

- Los controles no son rectangulos planos; tienen esquinas cortadas, marcos, brillos y siluetas fuertes.
- Los iconos son protagonistas, con estilo fantasy y alto contraste.
- Los estados usan color semantico constante: verde para listo/exito, azul para progreso, rojo para peligro/bloqueo, violeta para esencia/magia, dorado para valor/accion/seleccion.
- El fondo no es un gris plano; siempre hay profundidad, textura, gradiente o arte ambiental.

Lo que diferencia a Forge Light de fantasy recargado:

- No todo brilla.
- No todos los textos son dorados.
- Las acciones principales son pocas y claras.
- El contenido repetido usa jerarquia, no decoracion uniforme.
- Las pantallas densas mantienen alineacion y ritmo.

Lo que diferencia a Forge Light de dark mode estandar:

- El dark mode estandar usa superficies grises y bordes neutros.
- Forge Light usa superficies casi negras con temperatura calida, borde dorado controlado y brillo ritual en acciones.
- El contraste no depende solo de blanco sobre negro; depende de capas, marcos, iconos y estados.

---

## 3. Principios de reconstruccion

### 3.1 Primero la jerarquia, despues el ornamento

Cada pantalla debe tener una prioridad visual clara:

- `Santuario`: trabajos listos -> acciones de job -> estaciones -> volver a expedicion.
- `Crafting`: resultado/accion de mejora -> item -> materiales/probabilidad -> stats -> feedback.
- `Combat`: enemigo y combate vivo -> supervivencia del jugador -> side actions -> reportes/log.
- `Talentos`: nodos comprables -> arbol actual/progreso -> detalle seleccionado -> clases.
- `Mochila`: upgrade disponible -> volver a combate -> items equipados -> inventario/filtros.

Si una decoracion compite con la accion principal, se baja intensidad.

### 3.2 El dorado guia, no tapa

El dorado aparece en marcos, seleccion, acciones, valor y ornamentos. No se usa como color universal para texto largo ni para todos los bordes con la misma fuerza.

La regla practica:

- Dorado fuerte para CTAs, seleccion activa, hitos y valor.
- Dorado medio para marcos principales y botones secundarios importantes.
- Dorado sutil para divisores, rows, paneles repetidos y ornamentacion.
- Sin dorado fuerte en texto descriptivo, bloques largos o estados que tienen semantica propia.

### 3.3 Gris oscuro no significa Forge Light por si solo

Las superficies son oscuras, pero no deben verse como tarjetas SaaS. Necesitan:

- Subtono calido.
- Bordes finos dorados/bronze.
- Gradientes internos.
- Textura o ruido sutil.
- Esquinas cortadas o detalles ornamentales.
- Glow interno en elementos activos.

### 3.4 Los iconos no son decoracion secundaria

Las capturas dependen fuertemente de iconografia:

- Header: avatar, recursos, menu.
- Bottom nav: icono grande por dominio.
- Santuario: estaciones con imagen/icono grande.
- Talentos: nodos como decisiones visuales.
- Combat: estados, side actions, skill cooldowns.
- Crafting: item, material, entropia, stats.

No reemplazar iconos Forge Light por emojis. Si un icono todavia no existe, crear SVG simple alineado al sheet.

### 3.5 Mobile-first y denso

Las capturas son mobile portrait. La densidad es alta pero ordenada. El refactor debe compactar sin perder targets tactiles.

Reglas:

- Mantener botones principales entre 40 y 56px de alto.
- Mantener rows entre 64 y 92px segun contenido.
- Evitar cards altas si no contienen decision real.
- Usar texto corto y jerarquia por tamanio/peso/color.
- Reservar detalles largos para overlays o secciones expandibles.

---

## 4. Sistema de capas

Forge Light se construye por niveles. Cada nivel tiene responsabilidad visual distinta.

| Nivel | Nombre | Rol | Tratamiento |
|---|---|---|---|
| 0 | Fondo | Atmosfera y contexto | Casi negro, arte o gradiente profundo, textura sutil |
| 1 | Superficie | Lectura de contenido | Panel oscuro, borde bronze/dorado sutil, sombra interna |
| 2 | Interactivo | Acciones y navegacion | Botones, tabs, rows clickables, icon frames |
| 3 | Estado | Progreso, exito, bloqueo | Verde, azul, rojo, violeta, badges, bars |
| 4 | Highlight ritual | Foco principal | Dorado fuerte, glow, diamante, CTA grande |
| 5 | Overlay temporal | Modales/toasts/floating text | Por encima de HUD, con sombra y feedback |

### 4.1 Fondo

Uso:

- Base de todas las pantallas.
- En `Combat`, el fondo es arte ambiental y domina la pantalla.
- En `Santuario`, `Crafting` y `Talentos`, el fondo es una superficie profunda con textura y paneles encima.

Reglas:

- No usar blanco puro ni negro plano puro como experiencia final.
- Usar `#05070a`, `#080908`, `#0b0d0d`, `#0e0c08` como base.
- Agregar gradientes radiales o lineales muy sutiles para profundidad.
- En pantallas con arte, aplicar overlay oscuro para legibilidad.

### 4.2 Superficies

Uso:

- Paneles de seccion.
- Cards.
- Rows.
- Containers de stats.
- Barras de nav.

Reglas:

- Fondo: negro calido o azul-negro muy oscuro.
- Borde: bronze/dorado con opacidad variable.
- Interior: gradient sutil de arriba a abajo.
- Esquinas: radius bajo o esquinas cortadas.
- Divisores: lineas finas bronze, nunca gris claro plano.

### 4.3 Interactivos

Uso:

- Botones.
- Tabs.
- Bottom nav.
- Side buttons.
- Rows de estaciones.
- Nodos de talentos.

Reglas:

- Todo interactivo debe tener estado `idle`, `hover`, `pressed`, `active`, `disabled`.
- El hover/pressed no debe cambiar layout.
- El elemento activo puede tener glow y borde mas claro.
- El elemento disabled debe verse apagado, no roto.

### 4.4 Estados

Uso:

- Listo para reclamar.
- En progreso.
- Bloqueado.
- Peligro.
- Exito.
- Magia/recurso especial.

Reglas:

- Verde significa listo/exito/mejora.
- Azul significa progreso/energia/mana/defensa.
- Rojo significa peligro, HP, bloqueo o notificacion urgente.
- Violeta significa esencia, magia, epico, veneno o recurso arcano.
- Dorado significa accion, valor, seleccion o hito.

### 4.5 Highlight ritual

Uso:

- CTA principal.
- Bottom nav activo.
- Boton de compra/mejora/reclamo.
- Hito de slider.
- Diamante/ornamento de seleccion.

Reglas:

- Debe haber pocos highlights rituales visibles por viewport.
- Si todo tiene glow dorado, nada tiene foco.
- El highlight ritual debe coincidir con la siguiente accion importante.

---

## 5. Color y tokens

Los hex son aproximaciones de implementacion. El ajuste fino se valida contra capturas porque los fondos ilustrados y glows alteran la percepcion.

### 5.1 Tokens base

```css
:root {
  --fl-bg-void: #050608;
  --fl-bg-deep: #090b0d;
  --fl-bg-panel: #101315;
  --fl-bg-panel-warm: #15120c;
  --fl-bg-row: #111517;
  --fl-bg-raised: #191715;
  --fl-bg-input: #090a0b;

  --fl-border-dim: rgba(137, 88, 32, 0.42);
  --fl-border-mid: rgba(198, 138, 39, 0.62);
  --fl-border-strong: rgba(243, 198, 95, 0.92);

  --fl-gold-0: #fff0b8;
  --fl-gold-1: #f3c65f;
  --fl-gold-2: #d99a2b;
  --fl-gold-3: #a96516;
  --fl-gold-4: #5b3512;

  --fl-text-1: #f4ead2;
  --fl-text-2: #c8b99b;
  --fl-text-3: #8f8067;
  --fl-text-disabled: #5c554a;

  --fl-success: #69e24f;
  --fl-success-deep: #173611;
  --fl-progress: #4aa3ff;
  --fl-progress-deep: #0d2038;
  --fl-danger: #ff4338;
  --fl-danger-deep: #3a0b08;
  --fl-purple: #b35cff;
  --fl-purple-deep: #25103c;
  --fl-orange: #ff8a1c;
  --fl-fire: #ff4d19;
  --fl-blue: #3da4ff;

  --fl-shadow-panel: 0 18px 42px rgba(0, 0, 0, 0.52);
  --fl-glow-gold: 0 0 18px rgba(243, 198, 95, 0.28);
  --fl-glow-success: 0 0 18px rgba(105, 226, 79, 0.24);
  --fl-glow-progress: 0 0 18px rgba(74, 163, 255, 0.22);
  --fl-glow-danger: 0 0 18px rgba(255, 67, 56, 0.24);
}
```

### 5.2 Roles de color

| Rol | Token | Uso |
|---|---|---|
| Fondo absoluto | `--fl-bg-void` | Body, zonas detras de arte |
| Fondo profundo | `--fl-bg-deep` | Pantallas sin arte central |
| Panel | `--fl-bg-panel` | Cards, bloques, nav |
| Row | `--fl-bg-row` | Filas repetidas de estaciones/jobs |
| Doble fondo calido | `--fl-bg-panel-warm` | Superficies con foco dorado |
| Borde sutil | `--fl-border-dim` | Rows repetidas, divisores |
| Borde medio | `--fl-border-mid` | Panels, botones secundarios |
| Borde fuerte | `--fl-border-strong` | Activo, CTA, item especial |
| Texto primario | `--fl-text-1` | Titulos, valores importantes |
| Texto secundario | `--fl-text-2` | Descripcion corta, labels |
| Texto terciario | `--fl-text-3` | Metadatos, hints, timestamps |
| Disabled | `--fl-text-disabled` | Locks, inactivos, no disponible |

### 5.3 Estados

| Estado | Color | Uso |
|---|---|---|
| Success | `--fl-success` | Listo para reclamar, mejora exitosa, stat mejorado |
| Progress | `--fl-progress` | En progreso, mana, barra temporal |
| Danger | `--fl-danger` | Bloqueado, HP, notificacion urgente |
| Purple | `--fl-purple` | Esencia, XP/magia, epico, veneno |
| Orange/fire | `--fl-orange`, `--fl-fire` | Entropia, fuego, critico, forja |
| Gold | `--fl-gold-*` | Valor, accion principal, seleccion, borde ritual |

### 5.4 Texto

Reglas:

- Titulo principal: blanco calido o dorado claro, nunca blanco puro.
- Titulo de seccion: dorado claro, uppercase, tracking positivo.
- Descripcion: gris calido claro.
- Texto largo: gris calido, no dorado.
- Estados: usar color semantico.
- Numeros de valor: blanco calido o dorado segun contexto.
- Costos: dorado/moneda.
- Recompensas: color del recurso.

---

## 6. Reglas de dorado

Esta es la regla mas sensible del sistema. El dorado es identidad Forge Light, pero si se aplica con la misma intensidad a todo, la UI se vuelve ruidosa.

### 6.1 Dorado fuerte

Usar dorado fuerte en:

- CTA principal de pantalla: `MEJORAR`, `COMPRAR`, `RECLAMAR`, `VOLVER A EXPEDICION` cuando es la accion clara.
- Bottom nav activo.
- Diamante o punto central de seleccion.
- Marco de item destacado.
- Hitos del slider de mejora.
- Valor economico: oro, costo, recompensa principal.
- Titulo grande cuando la pantalla lo usa como identidad.

No usar dorado fuerte en:

- Todo el texto de una card.
- Todas las cards repetidas.
- Texto descriptivo largo.
- Estados success/progress/danger que ya tienen color.
- Botones utilitarios secundarios como settings si no son accion principal.

### 6.2 Dorado medio

Usar dorado medio en:

- Bordes de paneles principales.
- Botones secundarios importantes.
- Rows interactivas.
- Tabs activas.
- Icon frames.
- Separadores de seccion.

### 6.3 Dorado sutil

Usar dorado sutil en:

- Divisores internos.
- Bordes de rows repetidas.
- Sombras internas.
- Ornamentacion de esquinas.
- Hover de cards.
- Lineas de conexion de talentos.

### 6.4 Ejemplos correctos

- `Santuario`: job listo con borde dorado medio, estado verde, CTA `RECLAMAR` dorado fuerte.
- `Crafting`: boton `MEJORAR` dorado fuerte, estadisticas nuevas verdes, material con marco dorado medio.
- `Combat`: bottom nav activo dorado fuerte, HP rojo, veneno violeta, curacion verde.
- `Talentos`: nodos comprables brillan por categoria; boton `COMPRAR` dorado, locks apagados.

### 6.5 Ejemplos incorrectos

- Poner dorado fuerte en todos los bordes de todas las rows con la misma opacidad.
- Convertir `En progreso` a dorado cuando debe ser azul.
- Convertir `Bloqueada` a dorado cuando debe ser rojo.
- Usar texto dorado para descripciones de 2 lineas.
- Bajar todo a gris neutro y dejar dorado solo en un boton; eso pierde la identidad de la captura.

---

## 7. Tipografia

### 7.1 Familias

Display:

- Uso: titulos de pantalla, nombres de seccion, labels grandes, nombres de clase, titulos de panel.
- Estilo: serif romana/fantasy, uppercase o small caps.
- Fuente final recomendada: `Cinzel`.
- Stack CSS: `"Cinzel", "Cormorant SC", Georgia, serif`.
- Razon: `Cinzel` es la opcion web mas cercana al tono romano/fantasy de las capturas sin volverse ilegible en mobile.

UI condensada:

- Uso: labels, botones, stats, rows, subtitulos.
- Estilo: sans condensada, peso alto, legible en mobile.
- Fuente final recomendada: `Barlow Condensed`.
- Stack CSS: `"Barlow Condensed", "Roboto Condensed", "Arial Narrow", sans-serif`.
- Razon: `Barlow Condensed` da mejor lectura en labels densos y numeros que una serif, pero mantiene el peso compacto de la referencia.

Numeros:

- Uso: dano flotante, costos, stats principales.
- Estilo: bold, condensado, con sombra.
- Fuente final recomendada: `Barlow Condensed`.
- Activar `font-variant-numeric: tabular-nums` donde haya valores que cambian frecuentemente.

Tokens recomendados:

```css
:root {
  --fl-font-display: "Cinzel", "Cormorant SC", Georgia, serif;
  --fl-font-ui: "Barlow Condensed", "Roboto Condensed", "Arial Narrow", sans-serif;
  --fl-font-number: "Barlow Condensed", "Roboto Condensed", "Arial Narrow", sans-serif;
}
```

### 7.2 Escala

| Uso | Tamano mobile | Peso | Color |
|---|---:|---:|---|
| Titulo pantalla | 34-46px | 700-900 | `--fl-text-1` o `--fl-gold-1` |
| Titulo panel | 20-28px | 700 | `--fl-gold-1` |
| Header seccion | 18-24px | 700 | `--fl-gold-1` |
| Nombre row/card | 18-24px | 700 | `--fl-text-1` o dorado suave |
| Descripcion | 14-18px | 400-600 | `--fl-text-2` |
| Label pequeno | 11-13px | 700 | `--fl-text-3` |
| Boton principal | 18-26px | 800-900 | `--fl-text-1` o dark sobre dorado |
| Boton secundario | 14-20px | 700 | `--fl-gold-1` |
| Bottom nav label | 12-16px | 700 | segun estado |
| Damage critico | 44-68px | 900 | orange/gold |
| Damage normal | 24-42px | 800 | `--fl-text-1` |

### 7.3 Tracking y casing

Reglas:

- Titulos principales: uppercase o small caps con tracking bajo/medio.
- Secciones: uppercase con tracking medio.
- Botones: uppercase.
- Descripcion: sentence case, sin tracking exagerado.
- Numeros: sin tracking o levemente negativo si son grandes.

---

## 8. Espaciado, densidad y responsive

### 8.1 Referencia mobile

Las capturas son portrait:

- `Crafting.png`: 941 x 1672
- `Santuario.png`: 1024 x 1536
- `Combat.png`: 1024 x 1536
- `Talentos.png`: 1024 x 1536

No implementar como desktop primero. La experiencia base es mobile.

### 8.2 Escala

```css
--fl-space-1: 4px;
--fl-space-2: 6px;
--fl-space-3: 8px;
--fl-space-4: 10px;
--fl-space-5: 12px;
--fl-space-6: 16px;
--fl-space-7: 20px;
--fl-space-8: 24px;
--fl-space-9: 32px;
```

### 8.3 Densidad por componente

| Componente | Alto recomendado | Padding |
|---|---:|---|
| Header global | 76-100px | 10-16px |
| Bottom nav | 86-112px | 8-12px |
| Row de job Santuario | 72-96px | 8-14px |
| Row de estacion | 76-104px | 8-14px |
| Boton CTA grande | 48-64px | 12-20px |
| Boton medio | 36-48px | 8-16px |
| Icon frame row | 52-72px | 4-8px |
| Talent node | 56-76px | 6-8px |
| Side action combat | 64-96px | 6-10px |

### 8.4 Reglas responsive

- En mobile, conservar una columna para Santuario.
- En mobile, Combat puede superponer HUD sobre arte, pero debe reservar bottom nav.
- En mobile, Crafting puede usar una composicion densa de columnas internas si el viewport lo permite; si no, apilar por prioridad.
- En mobile, Talentos debe preservar grilla por categorias; si no entra completa, permitir scroll horizontal controlado o compactar nodos, no convertir a lista plana.
- En desktop, ampliar ancho maximo y permitir columnas, pero sin cambiar lenguaje visual.

### 8.5 Safe areas

Reglas:

- El bottom nav no debe tapar CTAs.
- Las pantallas con contenido largo deben tener padding-bottom equivalente a bottom nav + 12px.
- Combat floating text no debe aparecer debajo del header ni detras de side panels.
- Los botones fijos deben respetar safe area mobile.

---

## 9. Geometria, bordes y ornamentacion

### 9.1 Forma base

Forge Light usa rectangulos oscuros con:

- Esquinas levemente cortadas u ornamentadas.
- Bordes finos bronze/dorado.
- Inner stroke o highlight arriba.
- Separadores centrales pequenos tipo diamante.
- No usa cards redondeadas tipo SaaS con radius alto.

### 9.2 Radios

| Elemento | Radio |
|---|---:|
| Panel principal | 8-12px o esquinas cortadas |
| Row repetida | 6-10px |
| Boton octagonal | clip-path con cortes 8-14px |
| Boton pequeno | 6-8px |
| Icon frame cuadrado | 8-10px |
| Icon frame circular | 999px |
| Badge circular | 999px |
| Progress bar | 999px o 2-4px |

### 9.3 Bordes

Reglas:

- Borde estructural: 1px `--fl-border-dim`.
- Borde activo: 1px `--fl-border-mid` o `--fl-border-strong`.
- Borde CTA: doble sensacion, con border externo y highlight interno.
- Borde bloqueado: oscuro/desaturado, con texto rojo si corresponde.
- Borde raro/epico: color de rareza mas borde dorado si es item destacado.

### 9.4 Ornamentos

Usar:

- Pequenos diamantes en centro de bordes.
- Esquinas con pseudo-elementos o background gradients.
- Lineas finas de separacion.
- Glow central en active nav.
- Marcos internos en botones.

Evitar:

- Ornamentos que cambian layout.
- SVGs pesados para cada borde si CSS alcanza.
- Decoracion distinta por pantalla sin regla compartida.
- Bordes grises planos sin temperatura.

---

## 10. Sombra, glow y profundidad

### 10.1 Sombras

Paneles:

```css
box-shadow:
  0 18px 42px rgba(0, 0, 0, 0.52),
  inset 0 1px 0 rgba(255, 230, 170, 0.05);
```

Rows:

```css
box-shadow:
  inset 0 1px 0 rgba(255, 230, 170, 0.04),
  0 8px 18px rgba(0, 0, 0, 0.28);
```

CTA:

```css
box-shadow:
  0 0 18px rgba(243, 156, 38, 0.42),
  inset 0 1px 0 rgba(255, 245, 190, 0.32),
  inset 0 -10px 18px rgba(82, 35, 0, 0.28);
```

### 10.2 Glow

Reglas:

- Glow dorado solo para activos, CTAs y marcos destacados.
- Glow verde solo para success real.
- Glow azul solo para progreso o defensa/mana.
- Glow rojo solo para peligro, HP, badge o bloqueo.
- No usar `filter: drop-shadow` masivo en listas largas si afecta performance.

### 10.3 Text shadow

Obligatorio en:

- Combat floating text.
- Texto sobre arte.
- Labels dentro de botones dorados.
- Valores grandes sobre fondos con glow.

Recomendado:

```css
text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);
```

---

## 11. Iconografia y SVG

### 11.1 Fuente

`Iconos SVG.png` define la direccion visual.

No usar el PNG como spritesheet final. Debe traducirse a SVGs limpios y semanticos.

### 11.2 Reglas SVG

- Formato: componentes React SVG inline.
- ViewBox base: `0 0 24 24`.
- Export: un componente por icono o registry `ForgeIcon`.
- Nombres canonicos en ingles simple o dominio del repo: `combat`, `inventory`, `sanctuary`, `talents`, `shop`.
- Usar `currentColor` en stroke/fill cuando sea viable.
- Permitir iconos multicolor cuando el significado depende del color: fuego, esencia, veneno, cristal.
- Stroke visible en 20-24px.
- Evitar detalles que solo se entienden a 64px.
- Mantener silueta reconocible sin label.
- No usar emojis como fallback final.

### 11.3 Estilo visual de iconos

Los iconos del sheet comparten:

- Marco oscuro cuadrado con borde bronze/dorado.
- Alto contraste.
- Silueta central grande.
- Iluminacion superior o lateral.
- Color semantico fuerte.
- Sombras internas para volumen.
- Labels uppercase debajo en el sheet, pero en la app el label lo controla el componente.

### 11.4 Catalogo externo

El catalogo canonico de iconos vive en `uirefactor/iconos.md`. Ese archivo es parte del sistema Forge Light y debe consultarse junto con este documento antes de crear, renombrar o reemplazar iconos.

Este `design.md` mantiene las reglas visuales generales; `iconos.md` mantiene:

- Categorias del icon sheet.
- Nombres canonicos.
- Alias de UI.
- Usos por pantalla.
- Prioridad de generacion SVG.
- Mapeo sugerido de archivos React.

Regla: si se agrega un icono nuevo al juego, primero se registra en `uirefactor/iconos.md` y despues se implementa en `ForgeIcon` o en la libreria SVG correspondiente.

---

## 12. Componentes canonicos

### 12.1 `AppHeader`

Uso:

- Header global visible en las 4 capturas.

Estructura:

- Avatar circular a la izquierda.
- Badge de nivel sobre avatar.
- Nombre del jugador y nivel/XP.
- Barra XP delgada.
- Resource pills.
- Menu button a la derecha con badge si corresponde.

Dimensiones:

- Alto mobile: 76-100px.
- Avatar: 64-86px segun viewport.
- Badge nivel: 22-30px.
- Resource pill: 96-170px de ancho segun variante.

Variantes:

- Compacta: recursos sin label bajo numero, usada en `Crafting`, `Combat`, `Talentos`.
- Etiquetada: recursos con label `ORO`, `ESENCIA`, `FUEGO`, usada en `Santuario`.

Estados:

- Badge rojo en menu si hay notificaciones.
- Boton `+` en resource pill con hover/pressed.

Errores comunes:

- Achicar demasiado el avatar.
- Hacer resource pills como chips planos.
- Quitar la barra de XP.
- Usar header distinto por pantalla.

### 12.2 `ResourcePill`

Uso:

- Oro, esencia, fuego, XP y recursos principales.

Estructura:

- Icono grande a la izquierda.
- Valor numerico.
- Label opcional.
- Boton `+` al final.

Estilo:

- Fondo oscuro con gradiente.
- Borde dorado/bronze.
- Esquinas cortadas.
- Icono con glow propio.

Estados:

- Hover: borde mas claro.
- Pressed: leve `scale(0.98)`.
- Disabled: sin `+` o `+` apagado.

### 12.3 `MenuButton`

Uso:

- Acceso a menu/hamburger global.

Estilo:

- Cuadrado oscuro con borde dorado.
- Tres lineas doradas gruesas.
- Badge rojo arriba derecha si hay notificacion.

### 12.4 `BottomNav`

Uso:

- Navegacion global fija inferior.

Estructura:

- 5 tabs visibles.
- Cada tab tiene icono grande y label uppercase.
- Fondo oscuro con borde superior dorado/bronze.
- Separadores verticales sutiles.

Nota de labels:

- Las capturas muestran sets distintos. El patron visual es global; los labels exactos se adaptan a dominios reales del juego.
- En el juego actual puede mapearse a `Santuario`, `Expedicion`, `Heroe`, `Ecos`, `Mas`.
- En pantallas de referencia aparecen variantes como `Ciudad`, `Inventario`, `Forjar`, `Tienda`, `Equipo`. Tratarlas como mock visual, no como obligacion funcional.

Estado inactivo:

- Icono desaturado o bronze apagado.
- Label `--fl-text-3`.
- Sin glow.

Estado activo:

- Boton con outline dorado mas visible.
- Glow central dorado/naranja dentro del boton.
- Icono mas grande o mas brillante.
- Label dorado claro.
- Diamante/punto luminoso centrado en borde superior.
- La seleccion se lee aunque el usuario ignore el label.

Badges:

- Posicion arriba derecha del boton.
- Dot rojo para alerta simple.
- Badge circular/oval rojo con numero para conteo.
- Consistencia: Santuario, Expedicion y Heroe usan top-right, no alternar lados salvo decision documentada.

### 12.5 `Panel`

Uso:

- Contenedor de seccion.
- Bloque principal de pantalla.

Estilo:

- Fondo `--fl-bg-panel`.
- Borde `--fl-border-dim`.
- Sombra profunda.
- Esquinas cortadas o radius bajo.
- Ornamentos en esquinas si el panel es principal.

Variantes:

- `panel.screen`: contenedor principal debajo de header.
- `panel.section`: bloque de seccion.
- `panel.raised`: bloque con mayor foco.
- `panel.overlay`: overlay modal/estacion.

### 12.6 `SectionHeader`

Uso:

- Titulos de secciones como `TRABAJOS`, `ESTACIONES`, `ARTES DE GUERRA`, `REGISTRO DE COMBATE`.

Estructura:

- Label principal.
- Contador/chip opcional.
- Acciones opcionales a la derecha.
- Subtitulo opcional debajo.

Reglas:

- Label principal dorado claro.
- Contadores de estado usan color semantico.
- Acciones no deben romper alineacion.

### 12.7 `SurfaceRow`

Uso:

- Jobs de Santuario.
- Estaciones.
- Recursos por minuto.
- Rows de log si necesitan separacion.

Estructura:

- Icon frame izquierda.
- Contenido principal centro.
- Estado/acciones derecha.

Estilo:

- Fondo oscuro.
- Borde bronze/dorado sutil.
- Alto compacto.
- Separadores internos si hay icon frame.

Estados:

- Default.
- Hover.
- Active.
- Claimable/success.
- Progress.
- Locked.
- Disabled.

### 12.8 `IconFrame`

Uso:

- Nav icons.
- Job icons.
- Station icons.
- Talent nodes.
- Side actions.

Variantes:

- Cuadrado ornamentado.
- Circular con anillo de progreso.
- Circular con anillo success.
- Item rarity frame.
- Node frame.

Reglas:

- Icono ocupa 60-75% del frame.
- Frame oscuro siempre.
- Borde segun estado.
- Glow solo si activo, comprable o claimable.

### 12.9 `ActionButton`

Uso:

- Toda accion clickable.

Variantes:

| Variante | Uso | Estilo |
|---|---|---|
| `primary` | Accion principal inmediata | Dorado fuerte, glow, texto alto contraste |
| `secondary` | Accion importante no primaria | Fondo oscuro, borde dorado medio, texto dorado |
| `ghost` | Icon-only o utilitario bajo | Fondo muy sutil, borde bajo |
| `danger` | Destructiva o bloqueo accionable | Rojo controlado |
| `disabled` | No disponible | Opacidad baja, sin glow |

Forma:

- Preferir octagonal/esquinas cortadas para botones medianos/grandes.
- Botones pequenos pueden tener radius bajo, pero deben conservar marco Forge.

Reglas:

- Maximo 1 CTA grande primario visible por bloque principal.
- `RECLAMAR`, `MEJORAR`, `COMPRAR` suelen ser primarios.
- `ABRIR` puede ser secondary fuerte si hay muchas estaciones; no debe verse plano.
- `REINICIAR`, `VISTA PREVIA`, `VER MAS`, settings son secundarios/ghost.

### 12.10 `StatusChip`

Uso:

- Contadores y estados cortos.

Ejemplos:

- `3 DISPONIBLES`
- `1 listos`
- `0 activo(s)`
- `BLOQUEADA`
- `22 TP`

Reglas:

- 1-3 palabras.
- Color semantico.
- Fondo oscuro translucido.
- Borde del color con baja opacidad.
- No duplicar el mismo estado en titulo, chip y descripcion si no aporta.

### 12.11 `ProgressBar`

Uso:

- XP.
- HP/mana.
- Jobs.
- Entropia.
- Recursos por minuto.
- Slider de crafting.

Variantes:

- Linear thin.
- Segmented.
- Milestone slider.
- Circular/ring en icon frame.

Reglas:

- Track oscuro.
- Fill semantico.
- Transicion `width 250-450ms ease-out`.
- Texto encima solo si la barra es gruesa.
- Nunca usar fill dorado para progreso azul/verde/rojo si el estado semantico indica otra cosa.

### 12.12 `RewardRow`

Uso:

- Recompensas de jobs.
- Recursos por minuto.
- Costos.

Estructura:

- Pares icono + valor.
- Separacion compacta.
- Valor color blanco/dorado.
- Icono mantiene color del recurso.

### 12.13 `TalentNode`

Uso:

- Grilla de talentos.

Estructura:

- Frame cuadrado.
- Icono central.
- Contador `0/5`.
- Conector vertical si pertenece a columna.

Estados:

- Locked.
- Available.
- Purchasable.
- Partial.
- Maxed.
- Selected.

Reglas:

- Comprable debe ser visible en 2 segundos.
- Bloqueado se ve apagado, no ausente.
- Conectores son sutiles, no convierten la pantalla en diagrama libre.

### 12.14 `SideActionButton`

Uso:

- Combat side actions como Pase, Misiones, Eventos, Arena, Clasificacion, Correo, Botin.

Estilo:

- Card vertical compacta.
- Icono grande arriba.
- Label abajo.
- Badge top-right.
- Borde dorado medio.

### 12.15 `CombatFloatingText`

Uso:

- Numeros de dano, critico, veneno, curacion.

Reglas:

- Z-index alto.
- Text shadow fuerte.
- Animacion de entrada rapida, subida y fade.
- Critico domina el stack.
- Colores por tipo de evento.

### 12.16 `OverlayShell`

Uso:

- Estaciones del Santuario y pantallas profundas.

Reglas:

- Fondo oscurecido.
- Superficie Forge Light real.
- Header con titulo, resumen y volver.
- No usar overlays transparentes sin superficie salvo efecto especial documentado.

---

## 13. Estados visuales y feedback

### 13.1 Estados canonicos

| Estado | Visual |
|---|---|
| Default | Fondo oscuro, borde sutil, texto secundario |
| Hover | Borde mas claro, leve lift, glow muy bajo |
| Pressed | `scale(0.98)`, sombra reducida |
| Active | Borde fuerte, glow controlado, texto principal |
| Selected | Igual active mas indicador/diamante si aplica |
| Disabled | Opacidad baja, texto disabled, sin glow |
| Locked | Oscuro, texto rojo o disabled, requisito visible |
| Claimable | Verde, punto/halo success, CTA visible |
| Progress | Azul, barra animada, timer visible |
| Danger | Rojo, uso limitado y claro |

### 13.2 Feedback por accion

| Accion | Feedback |
|---|---|
| Reclamar | CTA pressed, glow verde/dorado breve, toast/reward row |
| Reclamar + repetir | Feedback de claim mas estado info/repeat |
| Mejorar | Flash verde, stat delta, banner resultado |
| Comprar talento | Nodo scale/flash, contador TP actualiza |
| Abrir estacion | Pressed y transicion a overlay |
| Bloqueado | Shake muy leve opcional o tooltip/requisito |
| Combat hit | Floating text, HP bar transition, log entry |

### 13.3 Movimiento

Reglas:

- Usar movimiento para confirmar eventos reales, no para decorar constantemente.
- Duraciones cortas: 120-220ms para hover/pressed, 250-450ms para progress, 900-1600ms para floating text.
- Evitar animar sombras pesadas en listas largas.
- Respetar `prefers-reduced-motion`.

---

## 14. Screen contract: Crafting

Fuente: `uirefactor/Crafting.png`

Nota de implementacion actual:

- La captura `crafting` abre la Forja desde Santuario mediante `SanctuaryForgeOverlay`.
- El bloque visual principal vive en `Crafting.jsx` como showcase superior.
- La lista de items no debe competir con la composicion principal: el item card abre un drawer/popup de seleccion.
- El overlay de Forja respeta el header global de `App.jsx`; no duplica un top nav/header propio.

### 14.1 Rol funcional

Crafting es la mesa ritual de mejora. Debe mostrar claramente:

- Que item se esta modificando.
- Que resultado se obtuvo o se espera.
- Que recurso/material se consume.
- Que probabilidad/costo aplica.
- Donde ejecutar la accion principal.

### 14.2 Anatomia visible

Estructura:

- Header global compacto.
- Subheader `Forja` con back e info.
- Tabs de modo: `MEJORAR`, `REFINAR`, `EXTRAER`, `TRANSMUTAR`.
- Area principal con item card grande a la izquierda y vista previa a la derecha.
- Fila inferior de material principal, probabilidad de exito y coste.
- Slider de nivel/hitos.
- Comparacion de stats.
- Acciones inferiores.
- Banner de resultado.
- Bottom nav.

### 14.3 Jerarquia de lectura

Orden:

1. Item seleccionado + vista previa.
2. CTA `MEJORAR`.
3. Material/probabilidad/costo.
4. Slider de progreso.
5. Stats actuales vs nuevas.
6. Feedback inferior.

### 14.4 Header de crafting

`Forja`:

- Titulo display compacto.
- Back icon dorado a la izquierda.
- Info icon pequeno a la derecha del titulo.
- No duplica recursos ni modulo de entropia en el header.

Entropia:

- Vive dentro de la vista previa, debajo de `Poder`.
- Muestra valor actual, por ejemplo `72/100`.
- Muestra en sombra/proyeccion la entropia que ocuparia la accion actual.
- No muestra boton `+` en esta etapa.

### 14.5 Tabs

Tabs:

- `MEJORAR`
- `REFINAR`
- `EXTRAER`
- `TRANSMUTAR`
- Implementacion actual preserva los 5 modos del juego si existen (`MEJORAR`, `AFINAR`, `REFORJAR`, `IMBUIR`, `EXTRAER`); no se elimina logica para igualar labels de mock.

Activa:

- Fondo oscuro calido con glow inferior.
- Icono dorado.
- Texto claro/dorado.
- Underline dorado con pequeno diamante central.

Inactiva:

- Texto gris calido.
- Icono apagado.
- Sin glow.

### 14.6 Item card

Requisitos visuales:

- Card alta con marco dorado fuerte y borde de rareza violeta para epico.
- Label de rareza arriba izquierda.
- Estrella arriba derecha.
- Arte del item grande.
- Sin frame cuadrado de asset, esquineros internos ni circulo/ring dibujado detras del item.
- Nivel `+12` grande sobre arte.
- Nombre item en violeta.
- Poder con icono y numero dorado/blanco.

No debe:

- Parecer card comun.
- Perder color de rareza.
- Achicar el arte a icono pequeno.

### 14.7 Resultado central

Estado neutral `Vista previa`:

- Panel oscuro sin glow verde.
- Texto de estado dorado/neutral.
- Valores nuevos y flechas en dorado.
- Entropia embebida bajo `Poder`.

Estado `MEJORA EXITOSA`:

- Panel central con glow verde.
- Texto success uppercase.
- Cambio de nivel `+12 >> +13`.
- Label `PODER`.
- Cambio de poder `48.750 >> 51.260`.
- Efecto de luz verde desde base/forja.

Regla:

- Verde se usa porque es resultado exitoso. No reemplazar por dorado.

### 14.8 Material panel

Secciones:

- `MATERIAL PRINCIPAL`
- `PROBABILIDAD DE EXITO`
- `COSTO`

Estilo:

- Panel oscuro vertical.
- Divisores finos.
- Icono de material grande en frame.
- Valor disponible verde si alcanza.
- Probabilidad grande verde.
- Costo con icono oro.

### 14.9 Slider de mejora

Estructura:

- Linea horizontal dorada.
- Marcas `+0`, `+5`, `+10`, `+15`.
- Diamantes en hitos.
- Fill dorado hasta posicion actual.
- Marcador actual `+13` con marco mas grande y glow.
- Texto `Bonificacion de Hito`.
- Boton `VISTA PREVIA`.

### 14.10 Stats comparison

Layout:

- Dos paneles: actuales y nuevas.
- Flecha central grande dorada.
- Valores mejorados verdes con flecha.
- Valores iguales permanecen texto primario/secundario.
- Atributos especiales pueden usar violeta.

### 14.11 Acciones

Acciones:

- `MEJORA MAXIMA`: secondary fuerte, icono upgrade.
- `MEJORAR`: primary grande, centrado, dorado fuerte, con costo.
- `Usar automatico`: checkbox utilitario.
- Settings: ghost/secondary pequeno.

Regla:

- `MEJORAR` es el foco ritual. Ningun otro boton debe competir en intensidad.

### 14.12 Feedback

Banner inferior:

- Check verde grande.
- Titulo `Mejora Exitosa`.
- Subtexto con item y nuevo nivel.
- Boton `VER DETALLES`.

### 14.13 Checklist Crafting

- El CTA `MEJORAR` domina sin tapar el resultado.
- El item epico se reconoce por rareza.
- Entropia se entiende como recurso/medidor separado.
- La mejora exitosa se lee verde, no dorada.
- Stats nuevas se diferencian claramente de actuales.
- Bottom nav activo tiene glow y diamante.

---

## 15. Screen contract: Santuario

Fuente: `uirefactor/Santuario.png`

### 15.1 Rol funcional

Santuario es la home operacional. Debe responder:

- Que esta listo para reclamar.
- Que esta corriendo.
- Que estaciones puedo abrir.
- Que esta bloqueado y por que.
- Como volver a la expedicion.

### 15.2 Anatomia visible

Estructura:

- Header global con recursos etiquetados.
- Panel principal con titulo `SANTUARIO`.
- Boton cuadrado de modo/sol.
- Seccion `TRABAJOS`.
- Jobs listos y en progreso.
- Row `Anadir trabajo`.
- Seccion `ESTACIONES`.
- Lista de estaciones.
- CTA `VOLVER A EXPEDICION`.
- Bottom nav.

### 15.3 Jerarquia de lectura

Orden:

1. Trabajos listos.
2. Boton `RECLAMAR`.
3. Jobs en progreso/timer.
4. Estaciones disponibles.
5. Bloqueos/requisitos.
6. Volver a expedicion.

### 15.4 Header variante etiquetada

Recursos:

- Oro con label `ORO`.
- Esencia con label `ESENCIA`.
- Fuego con label `FUEGO`.
- Cada recurso tiene icono grande, valor, label y boton `+`.

Esta variante tiene mas presencia que el header compacto.

### 15.5 Panel principal

Requisitos:

- Fondo muy oscuro, no gris generico.
- Borde dorado/bronze visible.
- Ornamentacion en esquinas.
- Titulo grande `SANTUARIO`.
- Boton de modo arriba derecha con icono sol.

### 15.6 Trabajos

Header:

- Label `TRABAJOS` dorado.
- Estado `1 listos - 1 corriendo` en azul claro.
- Boton `Todo + repetir` secondary con icono repeat.

Si se agrega `Reclamar todo` por necesidades del juego actual:

- Debe ser primary compacto solo cuando hay varios listos.
- Debe ubicarse antes de `Todo + repetir` si ambos existen.
- No debe desplazar ni desalinear el contador.

### 15.7 Job listo

Layout:

- Row horizontal.
- Icon frame circular izquierda.
- Punto verde arriba/derecha del icon frame.
- Nombre job.
- Estado `Listo para reclamar` verde.
- Reward row con oro/esencia/fuego.
- Boton `RECLAMAR` primary con icono cofre.
- Boton repeat icon-only secundario.

Visual:

- Borde dorado medio.
- Leve glow verde solo en estado/listo.
- No pintar toda la row de verde.

### 15.8 Job en progreso

Layout:

- Icon frame circular con anillo azul parcial.
- Nombre job.
- Estado `En progreso...` azul.
- Label `Tiempo restante:`.
- Barra azul.
- Tiempo a la derecha.
- Boton fast-forward icon-only.

Visual:

- Azul comunica progreso.
- Dorado queda para marco y boton.
- Timer puede ser azul claro o dorado suave segun contraste, pero no debe competir con `RECLAMAR`.

### 15.9 Anadir trabajo

Visual:

- Row completa.
- Borde sutil.
- Plus grande dorado.
- Texto centrado.
- Menor peso que jobs activos.

### 15.10 Estaciones

Header:

- `ESTACIONES` dorado.
- Subtitulo `Accesos operativos del Santuario` gris calido.

Row disponible:

- Icono/ilustracion estacion izquierda en frame.
- Nombre uppercase dorado claro.
- Descripcion gris calido.
- Estado a la derecha: `0 activo(s)` o `0 / 1`.
- Boton `ABRIR` secondary fuerte, alineado a la derecha.

Row bloqueada:

- Icono dimmed.
- Nombre con menor intensidad.
- Estado `BLOQUEADA` rojo.
- Requisito en chip oscuro con borde sutil.
- Sin boton `ABRIR`.

Estaciones visibles:

- Laboratorio.
- Destileria.
- Biblioteca.
- Encargos.
- Altar de Sigilos.
- Forja.

### 15.11 Volver a expedicion

CTA:

- Centrado.
- Ancho medio/grande.
- Borde dorado.
- Icono flecha izquierda.
- Texto uppercase.
- Peso visual alto pero menor que un `RECLAMAR` listo si ambos estan en viewport.

### 15.12 Checklist Santuario

- El usuario ve en 2 segundos que puede reclamar.
- `RECLAMAR` esta alineado con la accion de job.
- Los `ABRIR` de estaciones estan alineados entre si.
- Las estaciones bloqueadas no parecen disponibles.
- Los iconos de estaciones son grandes y con personalidad.
- El panel conserva identidad dorada sin volverse gris generico.
- Bottom nav tiene badge top-right consistente.

---

## 16. Screen contract: Combat

Fuente principal: `uirefactor/Combat.png`
Fuente de scroll inferior: `uirefactor/Combate_Abajo.png`

Plan operativo de ajuste fino: `uirefactor/combatPlan.md`.

Regla de implementacion:

- Para Combat, `combatPlan.md` define el orden de fases y los criterios de comparacion contra screenshots actuales.
- Si se itera Combat por captura, actualizar o consultar primero ese plan para evitar cambios aislados de CSS que achican elementos pero no corrigen la composicion.
- En mobile combat, `Mochila` e `Intel` no deben ocupar un subtab horizontal fijo sobre el bottom nav. Deben integrarse como side actions cuadrados, alineados con el lenguaje de `Combat.png`.

### 16.1 Rol funcional

Combat es la pantalla viva de la run. Debe mostrar:

- Donde estoy.
- A que enemigo enfrento.
- Si estoy ganando/perdiendo.
- Que dano/eventos estan pasando.
- Que recursos entran.
- Que acciones secundarias tengo disponibles.

### 16.2 Anatomia visible

Estructura:

- Header global compacto.
- Fondo ilustrado dungeon/ruinas.
- Side actions izquierda y derecha.
- Tier/progreso superior.
- Enemy name + HP.
- Debuffs/buffs.
- Floating text.
- Player panel.
- Auto/speed control.
- Stats summary.
- Resources per minute.
- Combat log.
- Bottom nav.

### 16.3 Fondo

Reglas:

- El arte ocupa el protagonismo.
- Overlay oscuro sutil para legibilidad.
- HUD debe parecer montado sobre el mundo, no en cards que lo cubren todo.
- Evitar fondo plano en Combat si se busca fidelidad a captura.

### 16.4 Tier y progreso

Visual:

- `TIER 45` grande centrado.
- Nombre zona debajo.
- Barra/linea con nodos diamante.
- Nodo final boss/peligro rojo.
- Dorado para progreso/hitos.

### 16.5 Enemy panel

Visual:

- Nombre enemigo centrado.
- HP bar roja con marco ornamentado.
- Icono calavera a la izquierda.
- HP actual/max y porcentaje.
- Debuffs debajo en icon frames pequenos con stack count.

Reglas:

- HP rojo, no dorado.
- Nombre enemigo claro sobre fondo.
- Debuffs con color semantico.

### 16.6 Floating text

Jerarquia:

- Critico: mas grande, naranja/dorado, label `CRITICO!`.
- Dano normal: blanco calido.
- Veneno: violeta con label `VENENO`.
- Curacion: verde con prefijo `+`.
- Dano menor/secundario: tamano menor.

Animacion:

- Entrada rapida.
- Leve scale.
- Flota hacia arriba.
- Fade out.

Regla:

- Floating text es identidad de game feel. No reemplazar por solo combat log.

### 16.7 Player panel

Componentes:

- Avatar circular con level badge.
- HP bar roja con valor.
- Mana/energia bar azul con valor.
- Skill icons con cooldown debajo.

Ubicacion:

- Bottom-left, sobre el arte.
- No debe tapar el enemigo.

### 16.8 Side actions

Izquierda:

- Pase de Forja.
- Misiones.
- Eventos.

Derecha:

- Arena.
- Clasificacion.
- Correo.
- Botin.

Reglas:

- Cards verticales compactas.
- Icono grande.
- Label claro.
- Badge rojo top-right.
- No usar botones web planos.

### 16.9 Auto y velocidad

Visual:

- Panel a la derecha.
- Boton `AUTO` con icono repeat/refresh.
- `x2.5` grande.
- Label `Velocidad`.

### 16.10 Stats summary

Visual:

- Row horizontal de 4 stats.
- Labels: `DPS`, `DANO`, `DEFENSA`, `SUPERVIVENCIA`.
- Valores grandes.
- Cambio verde con flecha.
- Boton `DETALLES`.

### 16.11 Resources per minute

Visual:

- Tres cards: oro, experiencia, esencia.
- Icono grande.
- Texto `+12,430 /min`.
- Barra thin por recurso.

### 16.12 Combat log

Visual:

- Panel oscuro.
- Header `REGISTRO DE COMBATE`.
- Boton `VER MAS`.
- Filas con icono, texto y hora.
- Palabras clave coloreadas.

### 16.13 Scroll inferior de expedicion

`Combate_Abajo.png` muestra la parte inferior que no entraba en el primer HUD de combate. No es un layout separado: es continuidad de Expedicion cuando se scrollea debajo del campo de batalla.

Orden visual esperado:

- Banda compacta de stats: `DANO`, `DEFENSA`, `CRITICO`, `VELOCIDAD`, con icono superior y valor grande.
- `CONTRATO ACTIVO`: card ancha con nombre del contrato, descripcion corta, recompensa/progreso y CTA de estado.
- `WEEKLY LEDGER`: card ancha con estado semanal, progreso 3/3, texto explicativo, barra verde y CTA `VER WEEKLY`.
- `BOSS SEMANAL`: card de evento con timer/ciclo, nombre de boss y tres opciones `NORMAL`, `VETERANO`, `ELITE`.
- `REGISTRO DE COMBATE`: row compacta con icono y boton `VER`.
- Accion peligrosa `REINICIAR PROGRESO` abajo, en rojo, sin competir con acciones principales.

Reglas:

- Esta zona puede scrollear. No hace falta meterla dentro del primer viewport.
- Debe mantener el mismo marco Forge Light de Expedicion: paneles oscuros, bordes bronze, textos display y chips coloreados.
- Los stats inferiores no deben volver a parecer cards SaaS claras ni pills default.
- `BOSS SEMANAL` usa rojo/naranja como acento de peligro/evento, no dorado fuerte en todo el bloque.
- Las opciones `NORMAL`, `VETERANO`, `ELITE` son cards compactas con icono grande, recompensa y borde segun peligro.
- El bottom nav sigue fijo/visible al final del viewport, pero no debe tapar `REINICIAR PROGRESO`.

### 16.14 Assets visuales aprobados

Los assets generados y aprobados se registran en `uirefactor/imagenes.md`.

Fondo aprobado:

- `combat_bg_ruinas_olvidadas` -> `/assets/combat/backgrounds/ruinas_olvidadas.png`

Enemies aprobados para primer mapping:

| Enemy ID real | Asset publico | Nota |
|---|---|---|
| `slime` | `/assets/combat/enemies/slime.png` | Asset directo. |
| `goblin` | `/assets/combat/enemies/goblin.png` | Asset directo. |
| `dark_knight` | `/assets/combat/enemies/dark_knight.png` | Alias visual aprobado desde `enemy_hollow_knight.png`. |
| `forge_colossus` | `/assets/combat/enemies/forge_colossus.png` | Alias construct/boss aprobado desde `enemy_abyssal_golem.png`. |
| `void_scout` | `/assets/combat/enemies/void_scout.png` | Alias occult aprobado desde `enemy_arcane_wraith.png`. |

Reglas de integracion:

- Los assets aprobados viven en `public/assets/combat/`.
- Mantener un mapping `enemy.id -> asset path`; no inferir path desde nombre si hay aliases.
- Si un enemy id no tiene asset, usar fallback por familia solo temporalmente.
- Si el PNG RGBA muestra vignette o fondo visible al componer, pedir una version cutout/alpha mas limpia antes de integrarlo como definitivo.

### 16.15 Checklist Combat

- El enemigo y el dano son el foco, no las cards inferiores.
- HP y estados se leen sobre el arte.
- Critico domina visualmente.
- Side actions parecen parte del RPG.
- El log existe pero no compite con combate.
- Al scrollear, stats/contrato/weekly/boss/log mantienen el mismo sistema Forge y no parecen UI legacy.
- Bottom nav activo en combate conserva glow/diamante.

---

## 17. Screen contract: Talentos

Fuente: `uirefactor/Talentos.png`

### 17.1 Rol funcional

Talentos es la pantalla de decision de build. Debe mostrar:

- Clase/arbol actual.
- Puntos disponibles.
- Nodos comprables.
- Progreso de desbloqueo.
- Detalle del talento seleccionado.
- Clases/arboles disponibles o bloqueados.

### 17.2 Anatomia visible

Estructura:

- Header global compacto.
- Titulo `TALENTOS`.
- TP counter y `REINICIAR`.
- Panel `ARBOL ACTUAL`.
- Seccion `ARTES DE GUERRA`.
- Filtros.
- Grid de talentos por categorias.
- Panel de detalle.
- Selector de clases.
- Bottom nav.

### 17.3 Jerarquia de lectura

Orden:

1. Nodos comprables y disponibles.
2. TP disponible.
3. Categoria/progreso.
4. Detalle del nodo seleccionado.
5. Selector de clase.

### 17.4 Header de pantalla

Visual:

- `TALENTOS` grande.
- Counter `22 TP` en chip oscuro con icono diamante.
- Boton `REINICIAR` secondary.

Regla:

- `REINICIAR` no debe parecer CTA principal.

### 17.5 Arbol actual

Panel:

- Icono clase grande izquierda.
- Label `ARBOL ACTUAL`.
- Nombre `WARRIOR`.
- Estado `0 NODOS COMPRADOS`.
- Estado verde `3 NODOS COMPRABLES AHORA`.
- Boton `CAMBIAR ARBOL`.

### 17.6 Artes de guerra

Header:

- `ARTES DE GUERRA`.
- Chip `3 DISPONIBLES` verde.
- Contador `0 / 45`.
- Label `NODOS DESBLOQUEADOS`.

Filtros:

- `COMPRABLES` activo.
- `ACTIVOS`.
- `TODOS`.

Reglas:

- Filtro activo con borde dorado.
- Inactivos oscuros/apagados.

### 17.7 Grid de talentos

Categorias:

- `BASICOS`: color dorado/verde segun nodo.
- `OFENSIVOS`: rojo/naranja.
- `DEFENSIVOS`: azul.
- `SUPERVIVENCIA`: verde.

Estructura:

- 4 columnas.
- Cada columna tiene titulo y contador.
- Nodos en grilla vertical.
- Conectores verticales sutiles.
- No es arbol libre; es grilla categorizada con conectores.

### 17.8 Talent node states

| Estado | Visual |
|---|---|
| Locked | Icono gris, frame oscuro, contador gris |
| Disponible | Icono visible, borde tenue de categoria |
| Comprable | Glow de categoria, contador verde, mayor brillo |
| Parcial | Borde dorado medio, contador `x/5` dorado |
| Maxed | Borde dorado fuerte o success, icono full, contador max |
| Selected | Frame mas brillante y panel detalle sincronizado |

Regla:

- Los primeros nodos comprables por categoria deben saltar visualmente.
- Los bloqueados siguen visibles para planificacion.

### 17.9 Panel de detalle

Layout:

- Icono circular grande izquierda.
- Nombre talento.
- Badges `PASIVA` y `NIVEL 0/5`.
- Descripcion.
- Base.
- Proximo nivel verde.
- Panel requisitos derecha.
- Costo `1 TP`.
- Boton `COMPRAR`.

Regla:

- El detalle explica la decision actual, no debe convertirse en modal.

### 17.10 Selector de clases

Tabs:

- `WARRIOR`.
- `GUARDIAN`.
- `BERSERKER`.
- `MAESTRO DE ARMAS`.
- `COMANDANTE`.

Estado activo:

- Icono brillante.
- Label dorado.
- Borde/glow dorado.
- Indicador inferior/diamante.

Estado bloqueado:

- Icono apagado.
- Candado top-right.
- Label gris.

### 17.11 Checklist Talentos

- Los nodos comprables se identifican en 2 segundos.
- `22 TP` se ve claro.
- `REINICIAR` no compite con `COMPRAR`.
- El grid sigue siendo compacto y no se convierte en lista.
- Los conectores son sutiles.
- El panel detalle esta alineado con el nodo seleccionado.
- Selector de clases no se confunde con bottom nav.

---

## 18. Screen contract: Mochila

Fuente principal: `uirefactor/Mochila.png`
Fuentes de scroll inferior/completo: `uirefactor/Mochila_Abajo.png`, `uirefactor/Mochila_Completa.png`

Mochila es una pantalla de decision rapida dentro de Expedicion. Debe responder:

- Si hay upgrades potenciales.
- Que item esta equipado en arma y armadura.
- Que item conviene revisar/equipar.
- Como volver a combate sin buscar la accion.

### 18.1 Jerarquia

Orden de lectura:

- Estado de run: tier, bosses y upgrades disponibles.
- CTA `VOLVER A COMBATE`.
- Titulo `MOCHILA (x/50)` y subtitulo de orden/filtro.
- Seccion `EQUIPADO`.
- Card de arma.
- Card de armadura.
- Loot Filter e Inventario quedan por debajo; no deben competir con los equipados en el primer viewport mobile, pero tienen contrato visual propio cuando se scrollea.

### 18.2 Header contextual

El panel superior de Mochila dentro de Expedicion debe usar el mismo lenguaje de Forge Light:

- Fondo casi negro con borde dorado sutil.
- Chips `T7`, `Boss 0`, `+1 upgrade(s)` compactos.
- Texto de ayuda gris calido.
- CTA `VOLVER A COMBATE` con marco dorado, superficie oscura y glow leve.

No usar botones azules/default para esta pantalla.

### 18.3 Cards equipadas

Las cards equipadas son protagonistas. Deben verse como placas forjadas:

- Superficie oscura, no azul.
- Borde dorado/bronze fino.
- Marco interior o lineas ornamentales cortas.
- Columna visual izquierda grande para el item.
- Contenido textual a la derecha.
- Poder `P 485` arriba a la derecha con glow dorado.

La columna visual puede usar temporalmente icono SVG Forge (`combat` para arma, `armor` para armadura) hasta tener arte especifico de items. Si se generan assets de items, reemplazar icono por imagen manteniendo el mismo contenedor.

### 18.4 Texto y badges

- Tipo de slot: `ARMA`, `ARMADURA`, en dorado apagado y uppercase.
- Rarity badge mantiene color semantico; `RARE` azul esta permitido porque diferencia rareza.
- Nombre de item: grande, serif/display, blanco calido.
- Familia: gris calido.
- Highlights como `EXCELENTE`, `SINERGIA`: chips oscuros con borde dorado/azul sutil, no pills SaaS.
- `AFIJOS`: label dorado apagado + diamantes.
- Stats principales: chips rectangulares oscuros.
- Implicito: azul/violeta legible, sin saturar.

### 18.5 Subtab Expedicion

En mobile, cuando la subvista es Mochila, el subtab `Combate / Mochila / Intel` debe dejar de verse como default/azul:

- Fondo oscuro.
- Botones con borde bronze.
- Activo con dorado y glow.
- Badge de upgrade verde arriba o dentro del boton activo.

En Combat mobile, Mochila/Intel siguen como side actions cuadrados segun `Combat.png`; no mezclar ambos patrones.

### 18.6 Scroll y densidad

Mochila puede scrollear porque el inventario puede crecer, pero el primer viewport debe mostrar:

- Hint superior completo.
- Titulo de Mochila.
- Header `EQUIPADO`.
- Arma equipada.
- Armadura equipada o al menos el inicio claro de la segunda card segun alto real.

No bloquear scroll global en Mochila, a diferencia de Talentos mobile.

### 18.7 Loot Filter

`Mochila_Abajo.png` y `Mochila_Completa.png` muestran que el Loot Filter no es un bloque secundario generico. Es una consola de decisiones rapidas por rareza.

Estructura:

- Panel ancho con titulo `FILTRO DE LOOT` e icono ornamental.
- Subtitulo explicativo: accion rapida por rareza, presets, caza y protecciones.
- Boton `AJUSTES` a la derecha con icono de engranaje.
- Row superior de modo/presets: `SIN CAZA ACTIVA`, `GUARDAR TODO`, `PROTEGE CAZA`, `PROTEGE UPGRADES`, `VER DESDE COM`.
- Row de accion global: `GUARDAR TODO`, `VENDER C/M` y texto de estado de automatizacion.
- Cuatro cards por rareza: `COMUN`, `MAGICO`, `RARO`, `EPICO`, cada una con icono diamante coloreado y botones `GUARDAR` / `VENDER`.

Reglas:

- Cada rareza mantiene color semantico: comun gris, magico verde, raro azul, epico violeta.
- Los botones de proteccion usan verde, no dorado, porque indican seguridad/proteccion.
- Los botones de accion mantienen marco Forge facetado, no pills redondas ni botones default.
- El panel puede ser grande porque esta debajo de equipados, pero debe conservar densidad y alineacion de grilla.

### 18.8 Inventario inferior

El Inventario inferior es una lista de decision/economia, no solo una tabla.

Estructura:

- Header `INVENTARIO` con icono de cofre.
- Subtitulo de modo, por ejemplo `Vender por rareza (doble tap)`.
- Control de orden a la derecha: `MEJOR` + contador `x VISIBLES`.
- Resumen por rareza en cuatro cards compactas, con icono, cantidad y valor en oro.
- Lista de items con icono/arte a la izquierda, rarity badge, nombre, familia, affixes, chips de stats, poder `P xxx` a la derecha y lock/proteccion.

Reglas:

- La lista debe usar rows altas pero densas, con arte cuadrado y borde por rareza.
- El poder `P xxx` se mantiene dorado fuerte porque es el valor de comparacion rapido.
- Los locks/protecciones deben verse como acciones utilitarias pequenas, no CTAs principales.
- Cuando lleguen PNG de items, deben reemplazar placeholders en estas rows sin cambiar el contenedor.

### 18.9 Checklist Mochila

- En 2 segundos se ve si hay upgrades.
- `VOLVER A COMBATE` es el CTA dominante.
- Las cards equipadas no parecen cards azules/default.
- El item equipado tiene presencia visual grande.
- Poder del item se identifica rapido.
- El subtab de Expedicion no rompe el lenguaje Forge.
- Loot Filter e Inventario existen debajo, con el mismo lenguaje Forge, pero no compiten visualmente con `EQUIPADO`.

### 18.10 Implementacion actual

Estado al 2026-04-28:

- `src/components/Inventory.jsx` usa `inventory-root--forge-light`.
- `FILTRO DE LOOT` tiene icono SVG, boton `AJUSTES` con `ForgeIcon`, presets facetados y grilla de rarezas con diamantes coloreados.
- `INVENTARIO` tiene header con icono, resumen por rareza en cards oscuras y rows de item con marco de arte placeholder.
- Los placeholders de item usan `ForgeIcon` segun tipo/familia hasta que existan PNG reales en `public/assets/items/`.
- `scripts/captureForgeLightScreens.mjs` genera `mochila` y `mochila-abajo`; en mobile `mochila-abajo` se ancla en Loot Filter porque el viewport no puede contener filtro + inventario completo sin perder detalle.
- Capturas de validacion: `uirefactor/current/mochila-*.png` y `uirefactor/current/mochila-abajo-*.png`.

---

## 18B. Screen contract: Intel

Fuente principal: `uirefactor/Intel.png`

Intel es la lectura tactica de la expedicion actual. No debe parecer Biblioteca permanente ni una tabla de codex. Debe responder:

- Que tier/frontera esta leyendo.
- Cuantos targets tacticos ya son accesibles.
- Cuantos bosses hay en ruta y cuantos son alcanzables.
- Cuantos powers activos/conocidos ya existen.
- Si la expedicion esta activa y donde volver a combate.

### 18B.1 Jerarquia

Orden de lectura:

- Header contextual de Expedicion con `T7`, `Boss 0`, upgrades y `VOLVER A COMBATE`.
- Panel `RADAR TACTICO`.
- `Tier 7 / 10` como numero grande.
- Chips de build, bosses en ruta y powers ocultos.
- Tres metric cards: targets revelados, bosses accesibles, powers activos.
- Banner `EXPEDICION Activa`.
- Seccion `OBJETIVOS REVELADOS`.

No usar cuatro metric cards si una de ellas es el estado de expedicion; ese estado debe ser banner propio, como en la referencia.

### 18B.2 Radar

El radar/compas debe ser un foco visual a la derecha del panel tactico.

Implementacion actual:

- Placeholder CSS con circulos, conic-gradient y glow azul.
- Aumentar presencia visual sin tapar texto en mobile.
- Si se genera asset, mantenerlo como capa decorativa no interactiva.

### 18B.3 Datos de captura

La captura automatizada debe sembrar datos representativos:

- 6 targets revelados.
- 3 bosses en ruta.
- 2 bosses accesibles.
- 2 powers activos.

Esto evita auditar una UI vacia con todo en cero.

### 18B.4 Implementacion actual

Estado al 2026-04-28:

- `src/components/Codex.jsx` usa `codex-root--forge-light`.
- En modo Intel se oculta intro legacy y el primer foco es `RADAR TACTICO`.
- El radar tiene chips facetados, tres metric cards y banner `Expedicion Activa`.
- `scripts/captureForgeLightScreens.mjs` siembra codex y run context representativos.
- Capturas de validacion: `uirefactor/current/intel-*.png`.

---

## 18C. Screen contract: Heroe

Fuentes principales: `uirefactor/Heroe_Ficha.png`, `uirefactor/Heroe_Atributos.png`

La tab Heroe se divide en `Ficha`, `Atributos` y `Talentos`. Las tres deben compartir subnav Forge, fondo oscuro y jerarquia mobile-first.

### 18C.1 Ficha

Objetivo:

- Mostrar identidad del heroe, clase/especializacion, nivel, vida, experiencia, build actual y lectura rapida.
- El retrato/portrait es protagonista visual. Usar PNG ilustrado desde `public/assets/portraits/classes/` cuando exista; el SVG queda solo como fallback.
- `Build actual` y `Lectura rapida` deben quedar debajo del bloque principal, no competir con vida/XP.

### 18C.2 Atributos

Objetivo:

- Mostrar `ATRIBUTOS` primero, con tabs `COMBATE / ECONOMIA`, oro disponible y lista de upgrades.
- Cada row usa icono grande, nombre, descripcion, nivel/cap, nodos de progreso y costo a la derecha.
- `LECTURA ACTUAL` es util, pero secundaria: debe ir debajo del panel principal para no tapar las filas en el primer viewport.
- No agregar `REINICIAR` ni TP si la logica actual compra atributos con oro y no tiene reset.

Implementacion actual al 2026-04-28:

- `src/components/Character.jsx` usa `character-root--forge-light`.
- `src/components/Character.jsx` mapea portraits por especializacion/clase con `portrait_<id>.png`.
- `src/components/Skills.jsx` usa `skills-root--forge-light`.
- `LECTURA ACTUAL` en Atributos se movio debajo de la lista para acercarse a `Heroe_Atributos.png`.
- Capturas de validacion: `uirefactor/current/hero-ficha-*.png`, `uirefactor/current/hero-atributos-*.png`.

---

## 19. Game feel compatible

El game feel debe reforzar el redisenio, no agregar ruido.

Adoptar:

- Pressed feedback en todos los botones.
- Transiciones de progress bars.
- Glow corto al reclamar/mejorar/comprar.
- Floating text de combat.
- Toasts o banners de resultado con icono.
- Badges de notificacion con actualizacion visible.

Adaptar:

- Combat damage: usar jerarquia de tamano/color definida en `CombatFloatingText`.
- Santuario claim: glow verde/dorado breve sobre row o CTA, luego estado desaparece/actualiza.
- Crafting success: flash verde + banner + stat delta.
- Talentos purchase: node flash + update de TP + panel detalle.

Posponer:

- Particulas complejas.
- Animaciones de borde constantes.
- Efectos que corran en todas las rows.
- Nuevos sistemas de reward que cambien flujo.

Regla:

- Cada animacion debe responder a un evento real o estado importante.

---

## 20. Implementacion recomendada en React/CSS

### 19.1 Arquitectura CSS

Crear o consolidar:

- `src/styles/forge-light.css` para tokens y clases Forge Light.
- Componentes React compartidos para primitives.
- `ForgeIcon` o registry de iconos SVG.

Prefijos:

- Tokens: `--fl-*`.
- Clases: `fl-*`.
- Componentes: `Forge*`.

### 19.2 Primitives recomendadas

Orden de extraccion:

1. `ForgeIcon`.
2. `ForgeButton`.
3. `ForgePanel`.
4. `ForgeIconFrame`.
5. `ForgeProgress`.
6. `ForgeChip`.
7. `ForgeResourcePill`.
8. `ForgeBottomNav`.
9. `ForgeSurfaceRow`.
10. `ForgeSectionHeader`.

### 19.3 Estrategia de migracion

Orden recomendado:

1. Consolidar tokens, bottom nav e iconos base.
2. Terminar Santuario como piloto.
3. Migrar Crafting.
4. Migrar Talentos.
5. Migrar Combat al final.

Razon:

- Santuario prueba paneles, rows, buttons, chips, progress e iconos sin requerir arte de combate.
- Crafting prueba item card, CTA grande, material panels y stat comparison.
- Talentos prueba node grid e icon density.
- Combat prueba overlay sobre arte y floating text, que es mas riesgoso.

### 19.4 Inline styles

Reglas:

- Tokens, color, borde, sombra, radius y tipografia deben vivir en CSS global o primitives.
- Inline solo para valores dinamicos: percent, width de progress, color semantico calculado, posicion puntual de animacion.
- Si una decision visual se repite dos veces, se vuelve clase o primitive.

### 19.5 Accesibilidad

Reglas:

- Targets tactiles minimos 40px.
- Contraste alto para texto sobre fondo.
- Texto no depende solo del color para estados criticos: incluir label.
- Badges con `aria-label`.
- Icon buttons con label accesible.
- Respetar `prefers-reduced-motion`.

---

## 21. Anti-patrones

No hacer:

- Usar `stitch/` como guia visual.
- Reemplazar iconos Forge con emojis.
- Usar dorado fuerte en todos los textos.
- Usar gris neutro como base sin borde/ornamento/glow.
- Crear botones planos tipo web.
- Hacer todas las acciones primarias.
- Quitar el diamante/glow del bottom nav activo.
- Poner badges en posiciones inconsistentes.
- Convertir Santuario en cards altas con demasiado aire.
- Convertir Talentos en lista plana si la referencia es grilla visual.
- Tapar el arte de Combat con panels pesados.
- Usar animaciones constantes sin evento.
- Meter estilos inline nuevos para cada pantalla.

Corregir si aparece:

- Si todo brilla, bajar intensidad de bordes repetidos.
- Si todo se ve gris, subir marcos bronze/dorado y ornamentacion.
- Si no se entiende la accion principal, reducir secundarios y aumentar CTA.
- Si una pantalla requiere scroll excesivo, compactar rows antes de achicar texto critico.

---

## 22. Checklist de validacion

### 21.1 Global

- El header se reconoce como el mismo sistema en las 4 pantallas.
- Bottom nav activo tiene icono brillante, outline dorado, glow central y diamante.
- Badges aparecen top-right de forma consistente.
- Los iconos son Forge Light, no emojis.
- El dorado guia la vista, no invade todo.
- El gris oscuro no pierde identidad fantasy.
- Texto largo es legible y no dorado fuerte.
- Cada pantalla tiene un foco primario claro.
- Cada estado usa color semantico.
- El layout es mobile-first.

### 21.2 Santuario

- `Listo para reclamar` se detecta en 2 segundos.
- `RECLAMAR` es el CTA mas claro del job listo.
- `En progreso` usa azul y barra.
- `ABRIR` esta alineado en estaciones.
- Bloqueadas muestran requisito.
- `VOLVER A EXPEDICION` existe y no tapa contenido.

### 21.3 Crafting

- `MEJORAR` domina como accion principal.
- Resultado exitoso se ve verde.
- Item card tiene rareza.
- Material/costo/probabilidad se entienden.
- Slider de mejora tiene hitos.
- Stats actuales/nuevas se comparan rapido.

### 21.4 Combat

- Enemigo y floating text son protagonistas.
- HP enemigo y jugador se leen.
- Side actions tienen icono, label y badge.
- Auto/velocidad se entienden.
- Combat log no compite con combate.
- Recursos por minuto se leen sin robar foco.

### 21.5 Talentos

- Nodos comprables se ven rapido.
- TP disponible se entiende.
- Categorias estan separadas.
- Panel detalle corresponde al nodo.
- `COMPRAR` es claro.
- Clases bloqueadas tienen candado y menor intensidad.

---

## 23. Glosario

Forge Light:

- Estilo dark fantasy premium con base oscura, bordes dorados, iconografia fuerte y alto contraste mobile.

Ritual:

- Accion o estado de alto valor que merece dorado fuerte y glow.

Bronze:

- Borde dorado oscuro/desaturado usado para estructura.

Icon frame:

- Contenedor visual de iconos con borde, fondo oscuro y estado.

Surface row:

- Fila compacta con icono, contenido y accion.

Claimable:

- Estado listo para reclamar; se comunica con verde y CTA claro.

Progress:

- Estado en curso; se comunica con azul, timer y barra.

Locked:

- Estado no disponible; se comunica con rojo o gris apagado y requisito.

Screen contract:

- Especificacion concreta por pantalla para poder recrearla sin reinterpretar el sistema.

---

## 24. Supuestos de trabajo

Supuestos adoptados:

- Las capturas tienen pequenas inconsistencias de labels de bottom nav; el patron visual es autoridad, no cada label individual.
- `Talentos` no es un arbol libre; es una grilla por categorias con conectores verticales sutiles.
- `Iconos SVG.png` es direccion visual y catalogo, no asset listo.
- Los tokens de color son aproximados y deben ajustarse visualmente en implementacion.
- Si el juego actual necesita una accion no visible en captura, debe usar una variante canonica, no inventar estilo nuevo.

Decisiones futuras no bloqueantes:

- Ajustar los tokens de color con capturas reales de la app una vez que cada pantalla este implementada.
- Separar otros anexos solo si `design.md` vuelve a crecer demasiado.

---

## 25. Screen contract: Ecos

Fuente: `uirefactor/Ecos.png`

Ecos es una pantalla de reset/meta. Debe responder rapido:

- Cuantos ecos se obtienen al extraer.
- Que momentum aplica.
- Que se conserva.
- Que se reinicia.
- Que sigilos afectan la run.
- Donde seguir invirtiendo en el tablero meta.

### 25.1 Jerarquia

Orden de lectura:

- Header global con identidad `ECOS` y recursos.
- Panel principal de extraccion.
- Crest/diamante de Ecos.
- Valor principal `+x ecos al extraer`.
- Badges `disponibles` y `momentum`.
- Resumen `Conservas` / `Se reinicia`.
- Metric cards: tier actual, momentum, base sin momentum.
- Sigilos activos de la run.
- Reset de prestige y tablero de ramas por debajo.

El primer viewport mobile debe contener el panel principal y al menos el inicio claro del panel de sigilos, como en la referencia.

### 25.2 Panel principal

El panel principal usa una superficie oscura premium:

- Fondo casi negro, con gradiente violeta/dorado muy sutil.
- Borde bronze/dorado fino.
- Esquinas bajas con detalle ornamental o bevel.
- Crest grande a la izquierda en mobile/desktop cuando el espacio lo permite.
- Texto principal en blanco calido/dorado claro, no violeta.
- Badges de cantidad/momentum con borde violeta controlado.

El crest puede ser SVG/CSS temporalmente, pero la direccion final es un diamante/eco cristalino similar a la referencia.

### 25.3 Conservas y Se reinicia

Estas cards son explicacion critica del reset. Deben verse como advertencia/garantia, no como panels neutros:

- `Conservas`: verde, borde verde sutil, icono o diamante verde.
- `Se reinicia`: rojo/naranja, borde rojo sutil, icono o diamante rojo.
- Fondo de ambas: oscuro, no verde/rojo solido.
- Texto de bullets en gris calido legible.
- Mantenerlas compactas: no deben empujar el panel principal fuera del primer viewport.

### 25.4 Metric cards

Las metric cards deben sostener lectura de progreso sin competir con el valor principal:

- `Tier actual`: numero grande, puede sumar icono de brujula/estrella en baja opacidad.
- `Momentum`: multiplicador grande + label corto.
- `Base sin momentum`: numero grande + icono de diamante/eco en baja opacidad.
- Bordes bronze, glow interno minimo, fondo oscuro.

### 25.5 Sigilos activos

El panel de sigilos usa violeta como acento magico:

- Titulo en violeta/dorado apagado.
- Nombre del sigilo en blanco calido.
- Badge de estado (`SI LIBRE`) arriba/derecha.
- Filas `Premia` y `Cede` con verde y rojo respectivamente.
- No usar fondo claro ni chips default.

### 25.6 Header y navegacion

Pendiente de segunda pasada global:

- La referencia tiene header con icono grande de Ecos, titulo display y recursos ornamentales.
- El header actual compacto es aceptable temporalmente por consistencia con el resto de la app.
- Cuando se rehaga header global, Ecos debe adoptar el icono/crest del dominio y recursos con marco Forge.

Bottom nav:

- Ecos activo mantiene el mismo patron aprobado: boton grande, borde dorado, glow central y diamante superior.
- Notificaciones mantienen posicion arriba a la derecha si aplican.

### 25.7 Checklist Ecos

- En 2 segundos se entiende si conviene extraer.
- `+x ecos al extraer` domina el primer panel.
- `Conservas` y `Se reinicia` son visibles sin buscar.
- `Momentum` se entiende como modificador, no como recurso separado.
- Sigilos activos no parecen una card default.
- La pantalla no usa superficies blancas/default.
- La segunda mitad del tablero puede scrollear; el resumen principal no debe sentirse enterrado.

### 25.8 Implementacion actual

Estado actual:

- `src/components/Prestige.jsx` usa `prestige-root--forge-light` y `prestige-summary-panel--hero` como shell principal.
- El crest actual usa `ForgeIcon name="essence"` dentro de `forge-prestige-crest`; es placeholder SVG/CSS hasta tener asset ilustrado.
- `prestige-hero-badges` define placas facetadas para `disponibles` y `momentum`, con breakpoint especifico para 390px.
- `prestige-breakdown-row` usa chips facetados para `Base +x` y otros aportes del reset.
- `prestige-outcome-column--keep` y `prestige-outcome-column--reset` representan `Conservas` y `Se reinicia` con icono, borde/glow propio y superficie oscura.
- `prestige-metric-card` agrega ornamento circular en baja opacidad para sostener el lenguaje Forge sin competir con el valor principal.
- `prestige-run-sigil-panel` envuelve `RunSigilCallout` para evitar UI default y mantener violeta como acento magico.

Pendiente para fidelidad alta:

- Header global tipo referencia, con icono de dominio y recursos ornamentales.
- Corners ornamentales reales o pseudo-elementos por panel, no solo borde simple.
- Skin Forge profunda para tablero de ramas/meta debajo del resumen.
- Asset de diamante/eco dedicado para reemplazar el crest CSS.
