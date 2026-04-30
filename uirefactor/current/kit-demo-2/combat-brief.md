# Forge Light — Brief de Implementación
## Pantalla: Combat (Expedición activa)
## Versión: Piloto v1

---

## 0. Contexto del proyecto

Juego idle RPG mobile. Stack: React + CSS (sin build step, Babel standalone). Deploy en Netlify via GitHub. Archivo destino: `Combat.jsx` o equivalente.

El **top header** y el **bottom nav** ya existen en `App.jsx` — **no reimplementarlos**. El brief cubre solo el cuerpo de la pantalla Combat, desde el borde inferior del header hasta el borde superior del nav.

---

## 1. Fuentes de referencia obligatorias

| Archivo | Rol |
|---|---|
| `forge-light-kit-v2.html` | Fuente de todos los tokens CSS, patrones de componentes y estados |
| `Combat_Full.png` | Referencia de layout, densidad y proporciones reales |
| Este documento | Reglas de implementación y descripción estructural |

**Regla de autoridad:** si hay conflicto entre la captura y el HTML del kit, predomina el kit. La captura define qué elementos van y en qué orden. El kit define cómo se ven.

---

## 2. Tokens CSS — extracto crítico

Copiar desde `forge-light-kit-v2.html` el bloque `:root` completo. Los valores clave para Combat:

```css
--fl-bg-main:       #0B0F14;
--fl-bg-card:       #141B25;
--fl-bg-card-deep:  #0B0F17;
--fl-bg-inset:      #080C11;

--fl-gold-border:   #C6A15B;
--fl-gold-glow:     #E6C47A;
--fl-gold-muted:    rgba(198,161,91,0.25);

--fl-text-primary:  #F2E6C8;
--fl-text-secondary:#B8AA8F;
--fl-text-muted:    #7F7564;

--fl-success:       #4FD18B;
--fl-danger:        #E05A5A;
--fl-arcane:        #8A5BE8;
--fl-defense:       #4A8FE7;
--fl-reward:        #F2B84B;

--fl-rarity-epic:   #B455E8;
--fl-rarity-rare:   #4A8FE7;
```

**Regla de chamfer:** todos los botones, cards y panels usan `clip-path` con esquinas cortadas, no `border-radius` redondeado. Extraer el patrón exacto del HTML del kit.

---

## 3. Estructura de pantalla — Combat

La pantalla es un scroll vertical único. El foco principal (boss + HP) aparece en el primer viewport. El resto se accede con scroll.

```
┌─────────────────────────────────────┐
│  [App.jsx — TOP HEADER — no tocar]  │
├─────────────────────────────────────┤
│  TIER HEADER                        │  ← zona 1
│  BOSS ARTWORK + HP                  │  ← zona 2 (foco principal)
│  HERO STATUS                        │  ← zona 3
│  STATS STRIP                        │  ← zona 4
│  CONTRATO ACTIVO                    │  ← zona 5
│  WEEKLY LEDGER                      │  ← zona 6
│  BOSS SEMANAL                       │  ← zona 7
│  REGISTRO DE COMBATE (collapsible)  │  ← zona 8
│  REINICIAR PROGRESO                 │  ← zona 9
├─────────────────────────────────────┤
│  [App.jsx — BOTTOM NAV — no tocar]  │
└─────────────────────────────────────┘
```

---

## 4. Zona 1 — Tier Header

**Posición:** inmediatamente bajo el top header.

**Componentes:**
- Flecha izquierda `<` (Icon Button ghost, navega tier anterior)
- Centro: label `TIER 7` en display font dorado, subtítulo `Ruinas Olvidadas` en text-muted
- Flecha derecha `>` (Icon Button ghost, navega tier siguiente)

**Progress track de tier** (debajo del texto):
- Barra horizontal de progreso con hitos (diamantes ornamentales)
- Estado: posición actual marcada con diamante dorado sólido
- Posición siguiente pendiente: diamante hueco
- Label del boss actual visible en la posición marcada: `Cult Adept`
- Ícono de calavera al final del track (boss final del tier)

**Estilo:** fondo `--fl-bg-card`, borde inferior `--fl-gold-muted`. Ancho completo.

---

## 5. Zona 2 — Boss Artwork + HP (FOCO PRINCIPAL)

Esta zona debe ocupar al menos 45–55% del viewport inicial. Es el foco de la pantalla.

**Estructura:**
- Imagen de fondo full-bleed del boss (asset de arte, usar placeholder oscuro con gradiente si no está disponible)
- Overlay oscuro radial desde los bordes hacia el centro para legibilidad: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)`

**Sobre la imagen, arriba-centro:**
- Nombre del boss: `Cult Adept` — font display, ~22px, blanco cálido
- HP bar del boss (barra tipo `fl-bar-hp`): relleno rojo, texto overlay `279 / 279 · 100%`
- Ícono de calavera a la izquierda de la barra

**Sobre la imagen, derecha-media:**
- Icon Button `MOCHILA` con badge `1` (dorado) — chamfered, fondo semitransparente oscuro
- Icon Button `INTEL` — mismo estilo, sin badge

**Sobre la imagen, derecha-baja:**
- Botón `EXTRAER` — Button primary chamfered
- Botón `AUTO` — Button secondary chamfered (toggle state cuando está activo)

**Nota de comportamiento:** los botones sobre la imagen tienen fondo `rgba(11,15,20,0.75)` con `backdrop-filter: blur(4px)` para legibilidad.

---

## 6. Zona 3 — Hero Status

Banda horizontal debajo del artwork. Fondo `--fl-bg-card`, borde superior `--fl-gold-muted`.

**Layout:** dos filas de barras a la izquierda + badge de nivel a la izquierda extremo.

**Badge de nivel (esquina inferior-izquierda del artwork / inicio de zona 3):**
- Escudo ícono con número `26`
- Fondo `--fl-bg-card`, borde `--fl-gold-border`, chamfered
- Posición: overlapping entre artwork y zona 3

**Barras (izquierda, apiladas verticalmente):**

Barra 1 — HP del héroe:
- Ícono de gota verde a la izquierda
- Relleno: verde (`--fl-success`)
- Texto overlay: `796 / 796 · 100%`
- Estado: llena (100%)

Barra 2 — XP:
- Label `XP` a la izquierda
- Relleno: azul (`--fl-defense`) o azul-violeta
- Texto overlay: `387 / 1,238 · 31%`
- Más delgada que la HP bar (usar `fl-bar-thin` o altura ~14px)

**Estilo barras:** ancho que ocupe ~70% del ancho de zona (deja espacio para botones a la derecha).

---

## 7. Zona 4 — Stats Strip

Panel compacto horizontal con 4 stats en fila. Fondo `--fl-bg-card-deep`, borde `--fl-gold-muted`.

Cada stat: `[ícono] LABEL\nVALOR`

| Stat | Ícono | Valor |
|------|-------|-------|
| DAÑO | ⚔ | 224 |
| DEFENSA | 🛡 | 23 |
| CRÍTICO | 💥 | 5% |
| VELOCIDAD | ⚡ | 0% |

- Label: 10px, uppercase, `--fl-text-muted`
- Valor: 22–26px, font bold, `--fl-text-primary`, `tabular-nums`
- Separadores verticales ornamentales entre cada stat (línea `--fl-gold-muted` con punto central)

---

## 8. Zona 5 — Contrato Activo

Panel sección (`fl-panel`). Aparece si hay contrato activo.

**Header del panel:**
- Ícono de libro violeta + label `CONTRATO ACTIVO` (dorado, uppercase)
- Link `Archivo del Santuario` alineado a la derecha (ghost, texto pequeño)

**Contenido:**
- Nombre del contrato: `Inventario violeta` — texto primary, 16px
- Descripción: `Encuentra 2 épicos.` — text-secondary, 13px
- Progress bar: relleno violeta (`--fl-arcane`), sin texto overlay
- Contador: `0/2` a la izquierda de la barra, pequeño
- Rewards del contrato: `• +26 esencia • +44 tinta • +2 flux • +1 polvo` — text-muted, 12px
- Botón `En progreso` — Button secondary chamfered, alineado derecha

---

## 9. Zona 6 — Weekly Ledger

Panel sección con borde `--fl-gold-border` (es un panel destacado, no muted).

**Header:**
- Ícono de pergamino + label `WEEKLY LEDGER` dorado

**Contenido:**
- Badge `META SEMANAL` (tag activo dorado) + texto `Renacido Tres Veces` inline
- Subtext: `1 / 3 · Realiza 1 prestigio.` — text-secondary
- Tag `1 para reclamar` — verde, alineado derecha del header
- Progress bar: relleno verde (`--fl-success`), estado ~33%
- Rewards: `+884 oro · +115 esencia · +1 TP` — text-muted, 12px
- Dos botones en fila: `Reclamar weekly` (primary) + `Ver weekly` (ghost)

---

## 10. Zona 7 — Boss Semanal

Panel sección con borde `--fl-danger` (zona de peligro/desafío). Glow rojo muy sutil.

**Header:**
- Label `BOSS SEMANAL` — danger color, uppercase
- Badge `CICLO 22H · 2026-04-29-18` — tag rojo pequeño
- Info: `3 intento(s) · reset 19h 38m` alineado derecha — text-muted

**Contenido — Boss info:**
- Ícono del boss (frame cuadrado, borde rojo, rarity epic o similar) + nombre `Soul Weaver` en display font, tamaño 20px
- Descripción breve en text-secondary

**Contenido — Dificultades (3 opciones en fila):**

Cada opción es una card compacta chamfered:

| Dificultad | Borde | % aprox | Recompensas |
|---|---|---|---|
| Normal | `--fl-success` | 69% aprox | +300 oro · +20 esencia |
| Veterano | `--fl-defense` | 29% aprox | +560 oro · +36 esencia |
| Élite | `--fl-rarity-epic` | 8% aprox | +900 oro · +56 esencia |

- Cada card: ícono de rareza del nivel, label de dificultad (uppercase), porcentaje de éxito (text-muted), rewards debajo
- Borde del color correspondiente, glow muy sutil

---

## 11. Zona 8 — Registro de Combate (collapsible)

Panel colapsable. Por defecto: cerrado.

- Header clickeable: `REGISTRO DE COMBATE` + botón `VER ▾`
- Al expandir: log de líneas de texto, scroll interno, fondo `--fl-bg-inset`
- Cada línea: timestamp + descripción de evento
- Separador ornamental entre entradas

---

## 12. Zona 9 — Reiniciar Progreso

Link de acción destructiva al fondo del scroll.

- Ícono de refresh + texto `REINICIAR PROGRESO`
- Color: `--fl-danger` o `--fl-text-muted`
- Al tocar: debe disparar modal de confirmación con advertencia (danger modal del kit)
- No debe parecer un botón CTA — es una acción secundaria destructiva

---

## 13. Reglas de implementación

### Componentes del kit a usar

| Elemento en pantalla | Componente del kit |
|---|---|
| HP bar boss y héroe | `fl-bar-hp` |
| XP bar | `fl-bar-xp` (thin) |
| Tier progress track | Barra dorada con milestone diamonds |
| Botones EXTRAER / AUTO | `btn-primary` / `btn-secondary` chamfered |
| Botones MOCHILA / INTEL | `btn-icon` con backdrop blur |
| Stats DAÑO / DEFENSA... | Stat Strip (4 columnas) |
| CONTRATO / WEEKLY / BOSS panels | `fl-panel` con `fl-panel-header` |
| Cards de dificultad del boss | `fl-card-wrap` con border semántico |
| Tags META SEMANAL, CICLO | `fl-tag` activo / danger |
| Badge de nivel | Chamfered overlay badge |

### Restricciones

- No usar `border-radius` redondeado en ningún componente nuevo — solo `clip-path` chamfered
- No inventar colores fuera de los tokens del kit
- No duplicar top header ni bottom nav (vienen de App.jsx)
- El artwork del boss puede ser un `div` con `background-image` o un `<img>` — si no hay asset, usar un gradiente oscuro de placeholder: `linear-gradient(180deg, #1a0f2e, #0B0F14)`
- El scroll es vertical y único — sin scroll interno excepto en el Registro de Combate expandido
- Mobile first: diseñar para 390px de ancho, escalar hacia arriba

### Tipografía

- Títulos de zona y nombres importantes: `font-family: 'Cinzel', Georgia, serif`
- Todo lo demás: `font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif`
- Valores numéricos: `font-variant-numeric: tabular-nums`
- Google Fonts: `https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Barlow+Condensed:wght@400;500;600;700&display=swap`

### Estados a implementar

- HP boss al 100%: barra roja llena
- HP héroe al 100%: barra verde llena
- XP al 31%: barra azul parcial
- Contrato en progreso: barra violeta ~0%, botón "En progreso" (secondary)
- Weekly 1/3: barra verde ~33%, botón "Reclamar" activo (primary)
- Boss Semanal: 3 intentos disponibles, sin selección activa

---

## 14. Checklist de validación

Antes de considerar el piloto aprobado:

- [ ] El boss y su HP bar son lo primero visible sin scroll
- [ ] Los botones usan `clip-path` chamfered — ningún `border-radius` redondeado
- [ ] Las barras tienen texto overlay legible
- [ ] El stats strip tiene separadores verticales ornamentales entre stats
- [ ] El panel Boss Semanal tiene borde rojo visible (danger)
- [ ] Las 3 dificultades tienen colores semánticos distintos
- [ ] Registro de Combate está colapsado por defecto
- [ ] Reiniciar Progreso es claramente una acción secundaria, no un CTA
- [ ] Fonts Cinzel + Barlow Condensed cargadas desde Google Fonts
- [ ] No hay `border-radius` mayores a 3px en ningún componente nuevo
- [ ] Funciona correctamente en 390px de ancho

---

## 15. Prompt sugerido para la IA implementadora

```
Implementá la pantalla Combat de Forge Light en [React JSX / HTML].

Tenés tres referencias:
1. forge-light-kit-v2.html — fuente de todos los tokens CSS y patrones visuales
2. Combat_Full.png — layout y densidad de referencia
3. combat-brief.md — descripción estructural detallada y reglas de implementación

Reglas clave:
- Extraer los tokens CSS del HTML del kit y usarlos en un bloque :root
- Todos los componentes usan clip-path chamfered, no border-radius redondeado
- No reimplementar el top header ni el bottom nav (vienen de App.jsx)
- Priorizá fidelidad al kit sobre fidelidad exacta a la captura
- No inventar colores fuera de los tokens

Arrancá por la estructura de zonas del brief, luego implementá zona por zona empezando por el foco principal (Zona 2 — Boss Artwork + HP).
```

---

*Forge Light · Combat Brief v1 · Referencia: forge-light-kit-v2.html + Combat_Full.png*
