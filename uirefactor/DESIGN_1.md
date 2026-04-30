# DESIGN.md — Dark Fantasy RPG UI System

> Generated from UI screenshot analysis. Intended for AI-assisted migration.
> Every detail documented at implementation level — no assumptions needed.

---

## 1. Filosofía Visual

Este sistema es **dark fantasy maximalista**. La UI vive *sobre* el juego, no aparte de él. Los fondos son arte generado, los paneles son semi-transparentes y con textura de piedra/madera/cuero, y cada elemento tiene un glow sutil que lo hace sentir mágico. No hay blanco puro ni negro puro — todo tiene temperatura cálida (ámbar/dorado) o fría (azul/verde) según el contexto.

El jugador debe sentir que está manipulando artefactos físicos, no tocando una pantalla.

---

## 2. Paleta de Colores

### Backgrounds

| Token | Hex | Uso |
|---|---|---|
| `--bg-void` | `#080808` | Fondo base absoluto |
| `--bg-deep` | `#0D0B09` | Background de screens principales |
| `--bg-panel` | `#141008` | Paneles, cards oscuras |
| `--bg-panel-warm` | `#1C1408` | Cards con contenido activo |
| `--bg-section` | `#111111` | Secciones dentro de un panel |
| `--bg-input` | `#0A0A0A` | Campos, filas de stats |

### Dorado / Ámbar (Color Primario — Acción, Riqueza, Activo)

| Token | Hex | Uso |
|---|---|---|
| `--gold-dim` | `#4A3010` | Bordes de cards inactivas |
| `--gold-mid` | `#7A5020` | Bordes de cards activas |
| `--gold-main` | `#C87018` | Color primario de botones CTA |
| `--gold-bright` | `#E89830` | Highlight de botones, texto activo |
| `--gold-glow` | `#FFD060` | Acentos, números grandes, críticos |
| `--gold-text` | `#D4A050` | Texto de sección headers |

### Verde (Éxito, Veneno, Crecimiento, Producción)

| Token | Hex | Uso |
|---|---|---|
| `--green-dark` | `#1A3A10` | Background de estados de veneno |
| `--green-main` | `#44CC22` | Healing, stats mejorados, producción |
| `--green-bright` | `#66FF44` | Efectos de veneno flotantes, críticos de veneno |
| `--green-glow` | `#88FF66` | Glow de nodos de árbol "Furia" |

### Rojo / Naranja (Peligro, HP, Fire)

| Token | Hex | Uso |
|---|---|---|
| `--red-dark` | `#3A0A0A` | Background HP bar track |
| `--red-main` | `#CC2222` | HP fill, estado de alerta |
| `--red-bright` | `#FF4433` | Daño crítico, notificaciones urgentes |
| `--orange-main` | `#FF6610` | Daño de fuego, iconos de fuego |
| `--orange-glow` | `#FF8820` | Glow de fuego, currency de fuego |

### Púrpura / Violeta (Épico, Magia, Gemas, Veneno alto)

| Token | Hex | Uso |
|---|---|---|
| `--purple-dark` | `#2A0A4A` | Background de ítems épicos |
| `--purple-main` | `#8A30CC` | Rarity épica, gemas de magia |
| `--purple-bright` | `#B060FF` | Texto de daño de veneno/magia, gemas |
| `--purple-glow` | `#C880FF` | Glow de ítems épicos |

### Azul (Mana, Defensa, Camino de guardián)

| Token | Hex | Uso |
|---|---|---|
| `--blue-dark` | `#0A1A3A` | Background nodos de defensa |
| `--blue-main` | `#2244CC` | Nodos activos árbol Defensa |
| `--blue-bright` | `#4488FF` | Mana bar, elementos de agua |
| `--blue-glow` | `#66AAFF` | Glow de camino de defensa |

### Texto

| Token | Hex | Uso |
|---|---|---|
| `--text-primary` | `#F0E8D0` | Texto body principal (blanco cálido, NO puro) |
| `--text-secondary` | `#9A8868` | Labels, subtítulos, stats secundarios |
| `--text-muted` | `#585040` | Texto deshabilitado, locked |
| `--text-gold` | `--gold-text` | Sección headers, labels importantes |
| `--text-success` | `--green-main` | Mejoras, stats superiores |
| `--text-danger` | `--red-bright` | Daño recibido, advertencias |

---

## 3. Tipografía

### Familia Principal

**Display / Títulos:** Cinzel, Trajan Pro, o cualquier serif romana con mayúsculas fuertes. Si no hay licencia, usar `Georgia` con `font-variant: small-caps`. Se usa **exclusivamente en MAYÚSCULAS**.

**Body / Stats / UI:** Fuente sans-serif condensada — `Roboto Condensed`, `Barlow Condensed`, o `Arial Narrow`. Limpia, funcional, legible en tamaños pequeños.

**Números de combate (daño flotante):** Fuente bold extra-condensada o display. Los números de crítico son más anchos que el resto.

### Escala Tipográfica

| Uso | Familia | Tamaño | Peso | Color | Tracking |
|---|---|---|---|---|---|
| Damage crítico | Display | 52–68px | 900 | `--gold-glow` | -1px |
| Damage normal | Display | 32–42px | 700 | `--text-primary` | 0 |
| Damage special (veneno/fuego) | Display | 28–36px | 700 | matching element | 0 |
| Label "CRÍTICO!" | Display | 20px | 700 | `--gold-glow` | 2px |
| Nombre enemigo / título screen | Display | 22–26px | 700 | `--text-primary` | 1px |
| Tier / Zona combat | Display | 28px | 900 | `--gold-glow` | 2px |
| Subtítulo zona | Display | 14px | 400 | `--text-secondary` | 1px |
| Section header (TALENTOS, FORJAR) | Display | 18px | 700 | `--text-primary` | 2px |
| Subsection header (ENCARGOS EN PROCESO) | Body | 12px | 700 | `--text-gold` | 3px |
| Nombre de skill/ítem | Body | 13–14px | 600 | matching rarity | 0 |
| Stats label | Body | 11px | 400 | `--text-secondary` | 1px |
| Stats valor | Body | 12–13px | 600 | `--text-primary` | 0 |
| Contadores (3/3, 0/5) | Body | 10px | 600 | `--text-secondary` | 0 |
| Bottom nav label | Body | 10px | 600 | según estado | 1px |
| Currency amounts | Body | 14px | 700 | `--text-primary` | 0 |
| Timer (00:00:00) | Body mono | 13px | 600 | `--gold-bright` | 0 |
| Notif badge | Body | 9–10px | 700 | white | 0 |

---

## 4. Header / Top Bar

**Altura:** ~56–60px. Fondo: `--bg-void` con opacidad 0.95 + muy sutil gradiente hacia transparent en el bottom edge.

**Estructura (de izquierda a derecha):**

1. **Avatar del jugador** — Círculo de ~48px de diámetro.
   - Borde: 2px `--gold-mid` con un glow exterior sutil `box-shadow: 0 0 8px --gold-dim`.
   - Dentro del círculo: ilustración del personaje (busto).
   - **Badge de nivel:** Pequeño círculo (~20px) posicionado `bottom: -2px, left: -2px` sobre el avatar. Fondo dorado `--gold-main`, texto blanco bold 10px. Tiene borde fino `--bg-void`.

2. **Info del jugador** — A la derecha del avatar, verticalmente apilado:
   - Línea 1: Nombre del jugador (ej: "Forjador") — 14px bold `--text-primary`
   - Línea 2: Nivel o XP info (ej: "Nv. 58") — 11px `--text-secondary`. En algunas screens se muestra "XP: 1.234M".
   - Línea 3: **Barra de XP** — Muy delgada (~4px alto), ancho ~80px. Fondo oscuro, fill ámbar `--gold-main`. Texto de porcentaje encima `92%` en 9px.

3. **Currencies** — A la derecha de la info, en fila horizontal. Hay **dos variantes** según el contexto:

   **Variante compacta** (mayoría de screens — Combate, Forja, Talentos):
   - Icono de moneda (~16px) + número 13px bold + botón `+` (~18x18px).
   - Sin label de texto bajo el número.
   - Separación entre currencies: ~8px.

   **Variante con label** (Santuario y screens tipo "hub"):
   - Icono de moneda (~18px) + número 14px bold, centrado.
   - **Debajo del número:** label de 9px uppercase `--text-gold` que identifica el recurso: "ORO", "ESENCIA", "FUEGO".
   - Botón `+` a la derecha del par icono+número.
   - Más espaciada, ocupa más ancho porque los tres pares tienen más presencia visual.

   **Currencies siempre visibles:** Oro (moneda circular dorada), Esencia/Gemas (cristal facetado morado), Fuego/Energía (llama roja-naranja).

4. **Menú hamburguesa** — Extremo derecho. 3 líneas horizontales doradas, ~24x20px. Sin borde visible, icono puro. Tiene un badge rojo (dot sin número) si hay notificaciones pendientes.

**Nota importante:** El header es el mismo en TODAS las screens. Nunca cambia de posición ni desaparece.

---

## 5. Bottom Navigation Bar

**Altura:** ~70px. Fondo: `--bg-panel` con borde superior 1px `--gold-dim`.

**Ítems:** 5 por screen, centrados horizontalmente con igual espaciado.

### Los tabs son fijos y globales

El bottom nav muestra siempre los mismos 5 tabs en todas las pantallas. Las variaciones observadas en los prototipos son artefactos de generación de imagen y no reflejan el diseño real. El set de tabs debe definirse una sola vez al implementar y mantenerse constante.

### Estado INACTIVO:
- Icono: ~28px, desaturado/oscurecido al 40–50%.
- Label: 10px `--text-muted`, uppercase, tracking 1px.
- Sin indicador visible.

### Estado ACTIVO (tab seleccionada):
- Icono: Mismo tamaño pero a brillo completo + glow sutil.
- Label: 10px `--gold-bright`, uppercase.
- **Indicador especial:** Encima del icono (entre el icono y el borde superior de la navbar) hay un pequeño rombo/diamante (~8x8px) de color `--gold-glow` con un glow radial: `box-shadow: 0 0 6px 2px --gold-glow`. Es como una gema brillante que flota sobre el ícono activo. Este detalle es CRÍTICO para la estética del sistema.

### Badges de notificación:
Hay dos tipos de badge, ambos posicionados `top: 0, right: 0` del ícono:
- **Dot rojo** (sin número): ~8px círculo `#CC2020`. Indica actividad sin contar.
- **Badge numérico:** ~16px círculo `#CC2020`, número blanco 9px bold dentro. Para cantidades grandes como `24` o `7`.

Los badges numéricos pueden ser grandes (24, 7) — el círculo crece para contener el número, no se trunca.

---

## 6. Cards / Paneles

### Card Base

```
background: --bg-panel
border: 1px solid --gold-dim
border-radius: 8px
padding: 12px
```

Versión "activa" o "highlight":
```
border-color: --gold-mid
box-shadow: 0 0 12px 1px rgba(200, 112, 24, 0.2) (inward glow sutil)
```

### Card de Encargo (misión/timer)

Estructura vertical:
1. Título del encargo — 12px bold uppercase `--text-primary`
2. Subtítulo/ubicación — 11px `--text-secondary`
3. **Timer** — 16px bold `--gold-bright`, formato `HH:MM:SS`, fuente monoespaciada.
4. Barra de progreso del timer — thin ~3px, fill ámbar, sobre fondo dark.
5. Rewards row: pares icono+número (oro + XP) en pequeño.
6. Botón `RECLAMAR` — si está disponible, button CTA pequeño (ver sección Botones).

### Card de Estación (Forja, Taller, etc.)

Estructura vertical:
1. Header row: nombre uppercase bold + badge de nivel (`Nv. 24`) + flecha verde up (▲) indicando activa.
   - Punto rojo de "activo" en esquina superior derecha del card — ~8px círculo rojo.
2. Imagen ilustrativa: ~100px de alto, arte del environment (forja, laboratorio). Full-width del card, sin padding horizontal. Slight gradient overlay en el bottom de la imagen que hace transición a `--bg-panel`.
3. Label "Producción" — 11px `--text-secondary`
4. Porcentaje — 18px bold `--green-main` + flecha up verde: `+240% ▲`
5. Botón `MEJORAR` — full-width del card (ver sección Botones).

### Card de Mejora Permanente (permanente upgrades)

Cards más pequeñas, formato cuadrado o casi cuadrado.
1. **Badge de notificación** rojo arriba a la derecha si hay upgrade disponible.
2. Icono central grande representativo (~40px).
3. Nombre en 10px uppercase `--text-secondary`.
4. Nivel actual — `Nv. 14` en 11px bold `--text-primary`.
5. Progress bar: `14/20` — fill verde, fondo dark, muy delgado.
6. Flecha verde up (▲) a la derecha del nivel si es upgradeable.

### Card de Ítem Equipado

El más elaborado. Describe un ítem con rareza.

1. **Borde de rareza:** El borde del card adopta el color de rareza:
   - Épico: `--purple-main` con `box-shadow: 0 0 16px 2px rgba(138, 48, 204, 0.4)`.
   - El background interno tiene un sutil tinte de rareza: para épico, `rgba(42, 10, 74, 0.6)`.

2. **Label de rareza** — arriba izquierda: "ÉPICO" en 11px uppercase `--purple-bright`.

3. **Estrella de calidad** — arriba derecha: icono ★ en `--gold-glow`.

4. **Imagen del ítem** — centered, ~120x120px, sobre fondo con glow ambiental del arma (fuego, magia, etc.).

5. **Nivel de mejora overlay** — texto grande `+12` posicionado bottom-left de la imagen del ítem. 28px bold `--gold-glow`. Tiene sombra de texto oscura para legibilidad.

6. **Nombre del ítem** — debajo de la imagen. 13px uppercase bold, color de rareza (`--purple-bright` para épico).

7. **Label "PODER"** — 10px `--text-secondary`, centrado, debajo del nombre.

8. **Valor de poder** — ícono de espadas cruzadas + número. 14px bold `--text-primary`.

---

## 7. Botones

### Botón CTA Principal (MEJORAR, RECLAMAR TODO, etc.)

Este botón es **el centro visual de acción**. Tiene una forma especial — no es un rectángulo simple:

- **Forma:** `clip-path: polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)` — octágono/esquinas cortadas a 45°.
- **Background:** Gradiente `linear-gradient(180deg, #E89830 0%, #C87018 50%, #A05010 100%)`.
- **Borde:** 1px solid `#F0A840` (más claro que el background).
- **Inner highlight:** `box-shadow: inset 0 1px 0 rgba(255, 220, 100, 0.3)` — simula luz de arriba.
- **Outer glow:** `box-shadow: 0 0 14px 2px rgba(200, 120, 24, 0.35)`.
- **Texto:** Uppercase, 14–16px, bold, `--text-primary` (blanco cálido). Centrado.
- **Padding:** 14px vertical, 20px horizontal (o full-width con height fija ~48px).
- **Icono de currency:** Si el botón muestra costo (ej: `MEJORAR ⊙ 24,500`), el icono de moneda precede al número en texto más pequeño.
- **Hover/Active state:** Brighten 15%, escalar `scale(0.98)`, glow más intenso.
- **Versión grande (pantalla full):** El mismo tratamiento pero `height: 56px`, texto 18px, es el botón primario de la pantalla.

### Botón Secundario (REINICIAR, VER DETALLES, VISTA PREVIA)

- Misma forma octagonal.
- **Background:** `--bg-panel` `#1A1510`.
- **Borde:** 1px solid `#4A3820`.
- **Texto:** `--gold-text` `#D4A050`, 13px, uppercase, bold.
- Sin glow, o glow muy sutil `rgba(100, 60, 10, 0.2)`.
- `padding: 10px 16px`.

### Botón de Tab / Filtro (MEJORAR, REFINAR, EXTRAER, TRANSMUTAR)

- Layout horizontal en fila, igual width cada uno.
- **Inactivo:**
  - Fondo transparente.
  - Ícono en ~16px gris `--text-muted`.
  - Texto 12px `--text-muted` uppercase.
  - Sin borde.
- **Activo:**
  - Fondo: sutil highlight `rgba(200, 112, 24, 0.1)`.
  - Ícono brightened al 100%.
  - Texto `--text-primary` bold.
  - **Underline indicator:** Línea de 2px `--gold-bright` en el bottom del tab, full-width.

### Botón Pequeño (RECLAMAR individual, VER MÁS)

- Forma rectangular con bordes redondeados ~4px (no octagonal).
- Background: `#2A1A08`.
- Borde: 1px `--gold-dim`.
- Texto: `--gold-bright` 11px uppercase bold.
- `padding: 6px 12px`.

---

## 8. Pantalla de Talentos

> ⚠️ CORRECCIÓN CRÍTICA: El árbol de talentos NO es un árbol visual con nodos conectados por líneas. Es una **grilla de cards de habilidades** organizada en columnas por categoría. No hay líneas de conexión entre nodos.

### Estructura general de la pantalla

```
[Header global]
[Screen header: "TALENTOS" + TP counter + REINICIAR]
[Info bar del árbol actual]
[Section: ARTES DE GUERRA — filter tabs + contador de nodos]
[Grilla de habilidades por columnas de categoría]
[Panel de detalle del nodo seleccionado]
[Selector de clases secundario]
[Bottom nav]
```

### Screen Header (sub-header específico de Talentos)

- Título "TALENTOS" a la izquierda — Display font, 28px, `--gold-text`.
- A la derecha: **Talent Point counter** — Ícono de rombo pequeño (◆ `--gold-glow`) + número + "TP" en 14px bold `--text-primary`. Ej: `◆ 22 TP`.
- Botón **REINICIAR** — secondary button pequeño con ícono de refresh. Borde `--gold-dim`, texto `--text-secondary`.

### Info bar del árbol actual

Fila horizontal dentro de un card con borde `--gold-dim`:
- **Izquierda:** Ícono de la clase actual (~40px, circular con borde dorado) + labels apilados:
  - "ÁRBOL ACTUAL" — 9px `--text-muted` uppercase.
  - Nombre de clase — "WARRIOR" — 18px bold Display font `--text-primary`.
- **Centro:** Dos líneas de estado:
  - "0 NODOS COMPRADOS" — 12px `--text-secondary`.
  - "3 NODOS COMPRABLES AHORA" — 12px `--green-main`.
- **Derecha:** Botón **CAMBIAR ÁRBOL** — secondary button con ícono de árbol. Borde `--gold-mid`.

### Sección: Artes de Guerra

- Label "ARTES DE GUERRA" — 14px bold `--gold-text` uppercase, a la izquierda.
- Badge "3 DISPONIBLES" — pill verde `rgba(40, 120, 20, 0.4)` con borde `--green-main` 1px, texto `--green-main` 10px bold. Pegado al label.
- A la derecha: contador `0 / 45` en 16px bold + `NODOS DESBLOQUEADOS` en 9px `--text-secondary` debajo.

**Filter tabs** (COMPRABLES · ACTIVOS · TODOS):
- Row horizontal debajo del header de sección.
- Tab activa: borde exterior 1px `--gold-mid`, background `rgba(200, 112, 24, 0.1)`, texto `--text-primary` bold.
- Tabs inactivas: sin borde visible, texto `--text-muted`.
- Todos tienen `padding: 6px 14px`, border-radius 4px.

### Grilla de habilidades (columnas por categoría)

Las habilidades están organizadas en **4 columnas verticales**, cada una representando una categoría:

| Categoría | Color temático | Ejemplo |
|---|---|---|
| BÁSICOS | `--gold-bright` | Fuerza, resistencia |
| OFENSIVOS | `--red-bright` | Daño, crítico |
| DEFENSIVOS | `--blue-bright` | Escudo, armadura |
| SUPERVIVENCIA | `--green-main` | HP, regeneración |

**Columna header:**
- Nombre de categoría — 11px uppercase bold `--text-secondary`.
- Contador `0/9` — 11px `--text-muted` debajo.

**Nodo de habilidad (card individual):**
- Tamaño: ~64x64px, cuadrado con border-radius 6px.
- Background: `--bg-panel` `#141008`.
- Borde por defecto: 1px `--gold-dim` `#4A3010`.
- Ícono de la habilidad centrado, ~36px.
- Contador `0/5` debajo del ícono — 10px `--text-muted`.
- Separación entre nodos de la misma columna: conector vertical sutil — línea de 1px `--gold-dim` de ~8px de largo, centrada horizontalmente.

**Estados del nodo:**

| Estado | Borde | Background | Ícono | Contador |
|---|---|---|---|---|
| Disponible comprable | 1.5px color categoría + glow sutil | `rgba(cat-color, 0.15)` | Full brightness + saturado | `0/5` en `--green-main` |
| Desbloqueado parcial | 1px `--gold-mid` | `rgba(200,112,24,0.1)` | Full brightness | `X/5` en `--gold-bright` |
| Desbloqueado máximo | 1px `--gold-bright` + outer glow | `rgba(200,112,24,0.2)` | Full brightness + inner glow | `5/5` en `--gold-glow` |
| Bloqueado / sin points | 1px `#2A1A08` | `#0D0B09` | Dimmed al 20%, gris | `0/5` en `--text-muted` |

El **primer nodo comprable** de cada categoría es el más prominente visualmente — borde más grueso y glow del color de su categoría.

### Panel de detalle del nodo seleccionado

Panel fijo en la parte inferior de la pantalla (encima del selector de clases). NO es un popover — siempre visible cuando hay nodo seleccionado.

Layout horizontal:
- **Izquierda:** Ícono circular del talento (~64px). Borde 2px del color temático, fondo `--bg-panel`, ícono ~40px centrado.
- **Centro (70% del ancho):**
  - Nombre: "ENTRENAMIENTO FÍSICO" — 16px bold Display `--text-primary` uppercase.
  - Row de badges: `PASIVA` (o `ACTIVA`) — pill color según tipo + `NIVEL 0/5` — texto 10px.
    - PASIVA: fondo `rgba(100,100,100,0.3)`, texto `--text-secondary`.
    - ACTIVA: fondo `rgba(200,112,24,0.2)`, texto `--gold-bright`.
  - Descripción: 12px `--text-secondary`, 2–3 líneas.
  - "BASE: +1% daño" — 11px `--text-muted`.
  - "PRÓXIMO NIVEL: +2% daño" — 11px `--green-main` bold.
- **Derecha (~30% del ancho):**
  - Label "REQUISITOS" — 10px `--text-muted` uppercase.
  - Costo: ícono ◆ + `1 TP` — 13px bold `--gold-glow`.
  - Botón **COMPRAR** — CTA estándar, full-width de esta columna. Mismo estilo que MEJORAR.

### Selector de clases (navegación secundaria interna)

Barra horizontal posicionada **entre el panel de detalle y el bottom nav**. NO es el bottom nav — es una segunda fila de navegación dentro de la pantalla de Talentos.

- Fondo: `--bg-panel` con borde superior y borde inferior 1px `--gold-dim`.
- 5 clases: WARRIOR · GUARDIÁN · BERSERKER · MAESTRO DE ARMAS · COMANDANTE.
- Cada tab: ícono ~28px + nombre debajo 9px uppercase.
- **Tab activa (WARRIOR):**
  - Background: `rgba(200, 112, 24, 0.15)`.
  - Ícono a brillo completo.
  - Nombre en `--gold-bright`.
  - Indicador inferior: línea 2px `--gold-bright` full-width del tab.
- **Tabs desbloqueadas inactivas:** Ícono dim 60%, nombre `--text-muted`.
- **Tabs BLOQUEADAS:**
  - Ícono muy dim (~25%).
  - Nombre `--text-muted`.
  - **Ícono de candado (🔒)** posicionado `top-right` del ícono de clase, ~12px, color `--text-muted`. Este overlay indica que la clase no está disponible aún.
  - No son interactivas (o al tocarlas muestran un modal de requisitos).

---

## 9. Pantalla de Combate

### Background

Arte de environment full-screen (dungeon, ruinas). La imagen ocupa el 100% del viewport. Sobre ella, un overlay muy sutil `rgba(0, 0, 0, 0.2)` que mantiene legibilidad sin matar la inmersión.

### Enemy Display

Enemigo centrado horizontalmente, ocupa aproximadamente el 40–55% del alto de la pantalla. Arte estilo ilustración/render 3D sobre fondo transparente.

**Barra de vida del enemigo:**
- Posicionada sobre el enemigo, debajo de su nombre.
- Ancho: ~70% del viewport, centrada.
- **Izquierda:** Ícono de calavera (~20px) en `#883030`.
- **Centro:** Nombre del enemigo, 14px bold `--text-primary`.
- **Fill:** Rojo `--red-main` sobre track oscuro `--red-dark`. Bordes redondeados.
- **Porcentaje:** a la derecha de la barra, 11px `--text-secondary`.
- **HP actual/máximo:** formato `1.26M / 2.80M`, 11px `--text-muted`, debajo o dentro de la barra.

**Íconos de estado (debuffs/buffs activos):**
- Row horizontal de iconos pequeños (~22px cada uno) debajo de la HP bar.
- Cada ícono: círculo con color elemental, ícono dentro, número de stacks en badge esquina inferior derecha.
- Colores: Verde=veneno, Rojo=fuego, Naranja=burning, Violeta=magia.

### Floating Damage Numbers

Se generan sobre el enemigo y ascienden flotando. Son CRÍTICOS para la estética.

| Tipo | Tamaño | Color | Peso | Efecto extra |
|---|---|---|---|---|
| Daño base | 32–38px | `--text-primary` `#F0E8D0` | 700 | Sombra oscura suave |
| Daño grande | 42–50px | `--text-primary` | 800 | Sombra más fuerte |
| **CRÍTICO!** label | 18px | `--gold-glow` | 700 | Uppercase + tracking 2px |
| Número crítico | 56–68px | `#FF6622` naranja-rojo | 900 | `text-shadow: 0 0 20px rgba(255, 80, 10, 0.8)` |
| Veneno / VENENO label | 28–34px | `--purple-bright` `#B060FF` | 700 | Glow violeta |
| Curación / Healing | 28–34px | `--green-main` `#44CC22` | 700 | Glow verde, prefijo `+` |
| Fuego | 28–34px | `--orange-glow` `#FF8820` | 700 | Glow naranja |

**Layout del stack de floaters:**
- Los números aparecen uno debajo del otro en el momento del stack, pero cada uno flota independiente.
- El crítico siempre es el número MÁS GRANDE y aparece separado visualmente, centrado.
- El label "CRÍTICO!" aparece ARRIBA del número crítico, como título.
- Los daños secundarios (veneno, heal) aparecen a los lados del stack central con offsets horizontales (`left: -20%` o `right: +20%`).
- Animación: fade-in rápido + float upward + fade-out. Duración ~1.5s. Los críticos tienen un ligero scale-up al aparecer (spring animation).

### Panel del Jugador (bottom-left)

Posicionado absolutamente en bottom-left, sobre el background de combate.

1. **Avatar circular** del jugador (~52px), mismo estilo que header. Badge nivel.
2. **HP Bar** — Horizontal, ~160px wide, 8px height.
   - Fondo: `--red-dark`.
   - Fill: `--red-main`.
   - Texto: `24,850 / 31,200 (79%)` en 10px bold blanco, sobre la barra.
3. **Mana/Shield Bar** — Igual pero azul `--blue-main`, fondo `--blue-dark`. Texto: `320 / 520 (61%)`.
4. **Skill icons** — Row de iconos de habilidades activas (~28px cada uno).
   - Borde redondeado, fondo muy oscuro.
   - **Cooldown timer** debajo de cada ícono: `6s`, `4s`, `3s` en 10px `--gold-text`.
   - Fondo elemental del ícono según tipo (verde para veneno, etc.).

### Paneles Laterales (combat)

**Left panel** (vertical, pegado al borde izquierdo):
- Pills rectangulares apiladas verticalmente (~60x60px cada una).
- Cada pill: background `--bg-panel` opacity 0.85, borde `--gold-dim`, border-radius 8px.
- Ícono representativo centrado.
- Label de 10px debajo.
- Badge rojo de notificación si hay contenido.
- Items: Pase, Misiones, Eventos.

**Right panel** (vertical, pegado al borde derecho):
- Igual estructura.
- Items: Arena, Clasificación, Correo (con badge numérico), Botín.

### Botones de control de combate (bottom-right)

- **AUTO button:** Pill alargada, background `--bg-panel`, borde `--gold-dim`. Ícono de refresh + texto "AUTO" 11px uppercase.
- **Velocidad:** Debajo del auto, muestra `x2.5` en 14px bold `--gold-bright` + texto "Velocidad" 9px.

### Stats Summary Bar (bottom, encima del combat log)

Row horizontal de 4 stats:

| DPS | DAÑO | DEFENSA | SUPERVIVENCIA |
|---|---|---|---|

- Label: 11px `--text-muted` uppercase.
- Valor: 22–24px bold `--text-primary`.
- Subcambio: `+8.2% ▲` en 11px `--green-main`.
- Separadores verticales sutiles entre columnas.
- **Botón DETALLES** a la derecha: secondary button pequeño.

### Resources per Minute

Row de 3 columnas, debajo de stats:
- Ícono de recurso (~20px) + nombre + cantidad/min.
- Ej: `⊙ Oro ganado +12,430 /min`
- Label del recurso en `--text-secondary`, cantidad en `--text-primary` bold.
- Barra de progreso thin debajo de cada uno (distinto color por recurso).

### Combat Log

- Header row: "REGISTRO DE COMBATE" (label) + "VER MÁS" (secondary button small).
- Filas de log: texto a la izquierda, timestamp a la derecha.
  - Texto 12px `--text-secondary`.
  - Palabras clave coloreadas inline: nombres de habilidades en `--gold-bright`, tipos de daño en `--purple-bright` o `--green-main`.
  - Timestamp: 11px `--text-muted`, formato `HH:MM`.
  - Separación entre filas: 1px line `rgba(255,255,255,0.05)`.
- Máximo 5 filas visibles, scrolleable.

---

## 10. Pantalla de Forja (Enhancement)

### Barra de Entropía

Barra especial en el header de la screen (debajo del nav principal):
- Label: "ENTROPÍA" 11px `--text-secondary`.
- Barra: Segmentada en bloques (no gradiente continuo). ~12–15 bloques.
- Fill activo: `--orange-main`.
- Bloques inactivos: `--bg-section`.
- Valor numérico: `72 / 100` a la derecha.
- **Botón +** para recarga, mismo estilo que el `+` de currencies del header.

### Item Card (lado izquierdo)

Ver sección Cards → Card de Ítem Equipado. En esta pantalla es de ~160x220px.

### Enhancement Result Panel (centro)

Aparece después de mejorar. Background semi-transparente sobre el panel.

1. Texto animado `«→ MEJORA EXITOSA ←»` — 16px `--green-main`, con flechas decorativas apuntando al centro. Animación de aparición (fade + scale).
2. El cambio de nivel: `+12  »  +13` — números grandes. El viejo nivel en gris `--text-secondary`, la flecha `»` en `--gold-dim`, el nuevo nivel en `--gold-glow` grande (40px).
3. Label "PODER" centrado, 11px `--text-secondary`.
4. Cambio de poder: `48.750  »  51.260` — Valor anterior en gris, valor nuevo en `--green-main` bold.

### Enhancement Level Slider

Barra horizontal con marcas diamante:
- Track: línea de 2px `--gold-dim`.
- **Marcas de milestone** en `+0`, `+5`, `+10`, `+15`: pequeños rombos (◇) en `--text-secondary`, con label encima.
- **Thumb/Posición actual:** Rombo mayor (◆) en `--gold-glow` con `box-shadow: 0 0 10px --gold-glow`. Badge con el número actual `+13` arriba del thumb.
- **Track fill (izquierda del thumb):** color `--gold-main`.

**Bonus de milestone:**
- Debajo del slider: row "Bonificación de Hito: ◇+5 | ◇+10 | ◇+15" con cada milestone en `--text-secondary`.
- Botón `VISTA PREVIA` secondary button pequeño a la derecha.

### Stats Comparison

Dos columnas:
- **Header izquierdo:** "ESTADÍSTICAS ACTUALES" — 11px uppercase `--text-secondary`.
- **Header derecho:** "ESTADÍSTICAS NUEVAS" — 11px uppercase `--green-main`.
- **Flecha separadora** entre columnas: ícono `»` grande `--gold-mid`.
- Filas de stats: label 11px `--text-secondary` + valor. Si el valor mejoró: valor en `--green-main` + `▲` verde. Si igual: `--text-primary` + `▲` gris.
- Stats especiales (atributos como Fuerza): label en color de atributo (`--purple-main` para Fuerza), valor `+18` en mismo color.

### Material Principal Panel

- Card a la derecha del ítem.
- Label: "MATERIAL PRINCIPAL" uppercase pequeño.
- Ícono de material + nombre + cantidad: `248 / 12`. La cantidad en negrita, el `/12` en `--text-secondary`.
- "PROBABILIDAD DE ÉXITO" label + valor `85%` en `--green-main` grande.
- "COSTO" label + ícono moneda + `24,500`.

### Botones de acción principales

Row inferior:
- **MEJORA MÁXIMA** — secondary button con ícono de doble flecha arriba. Cuadrado casi, ~80px wide.
- **MEJORAR `⊙ 24,500`** — CTA principal full-width-ish. El ícono de moneda + costo están dentro del botón debajo del texto principal.
- **Checkbox "Usar automático"** + ícono settings: a la derecha. Checkbox estilo custom con borde dorado.

### Banner de resultado

Banner que aparece en la parte inferior cuando hay resultado:
- Fondo verde oscuro `rgba(20, 80, 10, 0.9)` + borde `--green-main` 1px.
- Ícono de check verde círculo a la izquierda (~32px).
- Texto: "¡Mejora Exitosa!" en 14px bold `--text-primary` + subtexto "Hacha Infernal mejoró a +13" en 12px `--text-secondary`.
- Botón "VER DETALLES ›" secondary a la derecha.

---

## 11. Selector de Clases en Talentos

> Ver Sección 8 — "Selector de clases (navegación secundaria interna)". Documentado allí con detalle completo incluyendo estados activo, inactivo y bloqueado con candado.

Clases confirmadas visualmente: WARRIOR, GUARDIÁN, BERSERKER, MAESTRO DE ARMAS, COMANDANTE. Los íconos tienen colores temáticos: Warrior=dorado/rojo, Guardián=plata/azul, Berserker=rojo oscuro, Maestro de Armas=gris metálico, Comandante=dorado con estrella.

---

## 12. Pantalla de Santuario

> ⚠️ CORRECCIÓN: La pantalla de Santuario no tiene un botón "RECLAMAR TODO" prominente como elemento central. Eso pertenecía a otra variante de la UI. La pantalla real está organizada en secciones scrolleables: TRABAJOS y ESTACIONES.

### Estructura general

```
[Header global — variante con labels de currency]
[Screen title: "SANTUARIO" + botón de modo (sol/luna)]
[Sección: TRABAJOS]
  - Job cards (listo / en progreso)
  - Row: + Añadir trabajo
[Sección: ESTACIONES]
  - Lista vertical de stations
[Botón: VOLVER A EXPEDICIÓN]
[Bottom nav — set del Santuario]
```

### Screen title row

- "SANTUARIO" — Display font, 28px, `--gold-text`, alineado a la izquierda.
- **Botón de modo** — esquina superior derecha. Ícono de sol (☀) dentro de un card cuadrado pequeño (~36px), borde `--gold-dim`. Sin texto. Alterna entre modo día/noche u otras vistas.

### Sección TRABAJOS

Header de sección:
- "TRABAJOS" — 13px bold uppercase `--gold-text`, izquierda.
- Status inline: "1 listos · 1 corriendo" — 11px `--text-secondary`, centro/derecha.
- Botón **Todo + repetir** — secondary pequeño con ícono de refresh a la izquierda del texto.

**Job Card — Estado "Listo para reclamar":**

Layout horizontal, full-width, ~80px alto, borde `--gold-dim`, background `--bg-panel`:
- **Izquierda:** Ícono circular de progreso (~52px). Círculo completo, color verde `--green-main`. Fondo del ícono: ilustración del tipo de encargo (poción, bolsa, etc.).
- **Centro:**
  - Nombre del encargo — 14px bold `--text-primary`. Ej: "Encargo de Sangre".
  - Estado — "Listo para reclamar" — 12px `--green-main`.
  - Row de recompensas — íconos pequeños + números: `⊙ 12,430  ◆ 320  🔥 15`.
- **Derecha:**
  - Botón **RECLAMAR** — CTA estándar con ícono de cofre, ~100px wide. Texto + ícono dentro.
  - Botón de refresh (ícono solo) — secondary pequeño (~36x36px), borde `--gold-dim`. Para reiniciar el encargo.

**Job Card — Estado "En progreso":**

Layout horizontal similar:
- **Izquierda:** Ícono circular de progreso (~52px). Círculo con fill parcial azul `--blue-main` que indica porcentaje completado. Fondo del ícono: ilustración del encargo.
- **Centro:**
  - Nombre del encargo — 14px bold `--text-primary`. Ej: "Encargo de Provision".
  - Estado — "En progreso..." — 12px `--blue-bright`.
  - Barra de progreso thin (~4px) en azul, debajo del estado. Fill `--blue-main`.
  - "Tiempo restante:" — 10px `--text-muted`.
- **Derecha:**
  - Tiempo restante — "34m 59s" — 14px bold `--gold-bright`.
  - Botón de fast-forward (⏩ ícono) — secondary pequeño (~36x36px) para acelerar/saltear.

**Row: + Añadir trabajo**

- Fila completa, altura ~44px.
- Background: `--bg-panel` con borde 1px `--gold-dim` y borde-dash o estilo más sutil que los job cards.
- Ícono `+` centrado horizontalmente + texto "Añadir trabajo" — 13px `--text-secondary`.
- Al tocar: expande o navega a selección de encargos.

### Sección ESTACIONES

Header:
- "ESTACIONES" — 13px bold uppercase `--gold-text`.
- Subtítulo: "Accesos operativos del Santuario" — 11px `--text-secondary` italic.

**Station Row (estación disponible):**

Layout horizontal full-width, ~72px alto, borde `--gold-dim`:
- **Izquierda:** Imagen cuadrada de la estación (~56x56px), border-radius 6px. Arte de ambiente (laboratorio, destilería, etc.).
- **Centro:**
  - Nombre — 14px bold uppercase Display `--text-primary`. Ej: "LABORATORIO".
  - Descripción — 11px `--text-secondary`, 2 líneas. Ej: "Experimentos y transmutaciones para mejorar tu equipo."
- **Derecha:**
  - Si tiene slots: "0 activo(s)" — 11px `--text-muted`. / Si tiene límite: "0 / 1" — mismo estilo.
  - Botón **ABRIR** — CTA estándar pero de tamaño medio (~80px wide, ~36px tall).

**Station Row (estación BLOQUEADA):**

Mismo layout, PERO:
- Imagen de la estación: dimmed al 40%, con overlay oscuro `rgba(0,0,0,0.5)`.
- Nombre: `--text-muted` en lugar de `--text-primary`.
- En lugar de contador + ABRIR: columna derecha muestra:
  - "BLOQUEADA" / "BLOQUEADO" — 12px bold `--red-bright`. Sin botón.
  - "Requiere: [nombre] Nv. X" — 10px `--text-muted`. Explica el requisito.

**Estaciones confirmadas:** Laboratorio, Destilería, Biblioteca (bloqueada), Encargos, Altar de Sigilos (bloqueado), Forja.

### Botón VOLVER A EXPEDICIÓN

Botón ancho al final del contenido scrolleable, antes del bottom nav:
- Full-width (con padding lateral de pantalla).
- Secondary button style — background `--bg-panel`, borde `--gold-dim`.
- Ícono de flecha izquierda (←) + texto "VOLVER A EXPEDICIÓN" — centrado.
- Función: navega al contexto anterior (expedición activa).

---

## 13. Espaciado y Layout

**Grid:** No hay grid rígido — el layout es relativo a pantalla móvil (~390px ancho, ~844px alto como referencia).

**Spacing scale:**
- `--space-xs`: 4px
- `--space-sm`: 8px
- `--space-md`: 12px
- `--space-lg`: 16px
- `--space-xl`: 24px
- `--space-2xl`: 32px

**Padding de pantalla:** 12–16px horizontal en la mayoría de screens.

**Gap entre cards:** 8–10px.

**Section headers:** Siempre con `margin-top: 16px, margin-bottom: 8px`.

**Border-radius:**
- Cards grandes: 8px
- Botones: 6px (o clip-path octagonal)
- Badges/pills: 50% (circular) o 4px (pill)
- Barras de progreso: 2–3px

---

## 14. Efectos y Animaciones

### Glow general
Todos los elementos activos/importantes tienen `box-shadow` externa de su color con baja opacidad. Nunca se usa `filter: glow` que es costoso — siempre `box-shadow`.

### Floating damage
```
@keyframes floatDamage {
  0%   { opacity: 0; transform: translateY(0) scale(0.6); }
  15%  { opacity: 1; transform: translateY(-10px) scale(1.1); }
  80%  { opacity: 1; transform: translateY(-60px) scale(1); }
  100% { opacity: 0; transform: translateY(-80px) scale(0.9); }
}
```
Críticos tienen `scale(1.2)` en el peak y un flash de color breve.

### Enhancement success flash
Al confirmar mejora: breve flash blanco/dorado sobre el ítem card (overlay `rgba(255, 220, 100, 0.4)` que fade in/out en ~300ms).

### Nodos de grilla de talentos al unlockear
Scale up del card + color change del borde al color de categoría + breve flash del background. NO hay animación de líneas propagándose porque no hay árbol visual con conexiones.

### Barra de progreso
Fill siempre tiene `transition: width 0.4s ease-out`.

### Bottom nav indicator (diamante)
El diamante tiene un gentle `animation: pulse 2s infinite` que varía la opacidad del glow entre 0.6 y 1.

---

## 15. Íconos de Recursos (referencia)

| Recurso | Forma | Color primario |
|---|---|---|
| Oro | Moneda circular con símbolo | `--gold-bright` |
| Gemas / Esencia | Cristal/diamante facetado | `--purple-bright` |
| Fuego / Energía | Llama | `--orange-main` |
| XP | Orbe con "XP" o estrella | `--gold-glow` |
| Piedra de Forja | Cristal rojo-naranja | `#CC4422` |
| Rombo de costo (◇) | Rombo outline | `--gold-text` |

---

## 16. Notas de Implementación

1. **Mobile-first:** Todo está diseñado para portrait mode en smartphones (390px+). Nunca asumas layout horizontal.
2. **Sin blancos puros:** Usar `--text-primary` `#F0E8D0` como máximo blanco.
3. **Fuentes:** Precargar Cinzel o similar para headers, Roboto Condensed para body.
4. **Sombras de texto:** En contextos de combate (texto sobre imágenes), siempre usar `text-shadow: 1px 1px 4px rgba(0,0,0,0.9)` para legibilidad.
5. **Z-index:** Floating damage numbers deben estar por encima de todo excepto modales. Usar z-index: 100+.
6. **Performance:** Los glows de los nodos del árbol son costosos — renderizar con `will-change: box-shadow` y solo animar los nodos visibles.
7. **Feedback táctil:** Todos los botones tienen `active:scale(0.96)` + ligera reducción de glow para feedback visual del tap.
