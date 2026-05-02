# Próximos 5 Frentes de Mayor Impacto Visual (Migración UI Kit v4)

## Resumen

Objetivo: avanzar en 5 bloques con máximo impacto perceptual y mínima deuda, usando la regla acordada: primitives → wrappers de dominio → layout por pantalla, sin skin inline.  
Base visual: `forge-light-kit-v4.html` (y módulos cuando hay fit semántico).  
Prioridad: unificar “lenguaje premium” visible en navegación, superficies principales, filas densas y estados.

---

## 1) App Shell Canónico (Header + Bottom Nav + Tabs Desktop)

Impacto: altísimo (se ve en todas las pantallas).  
Referencia kit: Top Status Bar + Bottom Navigation Bar.

- Consolidar `FlHeaderBar`, `FlBottomNav` y tabs desktop en un único contrato visual (tipografía, alturas, estados, badges, recursos).
- Eliminar divergencias de cascada entre `navigation.css`, `shared.css` y estilos heredados del shell.
- Estabilizar estados `inactive/hover/active/disabled/spotlight` con clases canónicas (`FlTabs`, `FlBottomNav`, `FlBadge`), sin overrides por pantalla.
- Recomendación layout:
  - Desktop: header fijo + tabs desktop canónicas.
  - Mobile: top status + bottom nav siempre consistente con safe-area.

Entregable: shell 100% kit-faithful y reutilizable en todas las vistas.

---

## 2) Superficies de Sección (FlPanel/FlCard) + Jerarquía Tipográfica Global

Impacto: altísimo (define “cara” de todo el juego).  
Referencia kit: panel/card premium base (doble borde, textura, corner brackets, volumen).

- Normalizar `FlPanel` y `FlCard` como superficies madre: radios, bordes, textura, sombras y pseudo-elementos en una sola capa.
- Corregir conflictos de tipografía global:
  - títulos de sección, subtítulos, labels, copy secundaria.
- Quitar contaminación de wrappers legacy (`fl-sanctuary-panel`, variantes viejas) donde rompan la estética canónica.
- Recomendación layout:
  - paneles de sección con header consistente,
  - body sin re-skin local (solo spacing/layout).

Entregable: misma gramática visual de paneles en `Sanctuary`, `Codex`, `Stats`, `Prestige`, `Character`.

---

## 3) Santuario Completo: Jobs + Stations + Relics como Módulos Canónicos

Impacto: muy alto (pantalla densa y frecuente).  
Referencia kit: Tab 11 (Modules) + estados extendidos de Station/Job donde aplique.

- Cerrar migración de Estaciones (wrapper + rows) a paridad fina Tab 11.
- Migrar Jobs al mismo estándar modular (header, body, row actions, progress, claim/ready).
- Migrar Relics a wrapper de fila canónica (sin sistema paralelo).
- Definir 2 modos explícitos en wrappers:
  - `module-row` (Tab 11 base),
  - `state-row` (cuando necesite variación de estado tipo Tab 19).
- Recomendación layout:
  - mantener estructura funcional actual de Sanctuary,
  - homogeneizar solo paneles y filas internas.

Entregable: Sanctuary con look cohesivo y sin formato legacy mezclado.

---

## 4) Combat UI (sin forzar módulo 16): barras, side actions, paneles de log/contract

Impacto: muy alto (pantalla crítica del gameplay).  
Referencia kit: primitives + patrones de barra/estado (sin copiar literal Tab 16).

- Estandarizar:
  - side action buttons,
  - HP/XP/progreso con wrappers (`CombatHealthBar`, `CombatTierTrack`),
  - paneles de log/contract/weekly usando `FlPanel`/`FlCard`.
- Unificar semántica de color por estado (`success/danger/defense/arcane`) y evitar fondos de rareza completos.
- Mantener layout funcional actual del stage y HUD; migrar estética interna.
- Recomendación layout:
  - conservar arquitectura de combate,
  - usar wrappers para bloques repetidos (boss phases, rewards, log entries).

Entregable: combate visualmente premium y consistente con el resto del sistema.

---

## 5) Codex + Stats + Prestige (normalización final de densidad y microcomponentes)

Impacto: alto (pantallas de lectura y progreso, hoy heterogéneas).  
Referencia kit: paneles compactos, badges/tags, micro-elementos (paginación/stepper/dividers).

- Consolidar grids/rows de métricas con utilidades compartidas (`fl-grid--metrics`, `fl-dense-list`, `fl-section-stack`).
- Reemplazar chips/botones/progress locales por `FlBadge`, `FlTag`, `FlButton`, `FlProgressBar`.
- Formalizar `FlPagination` y micro-divisores ornamentales donde sea semántico.
- Recomendación layout:
  - mantener navegación y flujo actuales,
  - solo estandarizar composición interna de tarjetas/listados.

Entregable: pantallas de datos uniformes, legibles y 100% integradas al kit.

---

## Plan de Ejecución (orden y control)

1. Shell canónico.
2. Superficies + tipografía global.
3. Sanctuary completo.
4. Combat.
5. Codex/Stats/Prestige.

En cada paso:
- auditoría de cascada (tokens → primitives → modules → screens),
- implementación sin inline de skin,
- `npm run build`,
- QA visual en `390x844`, `430x932`, `1280x800`,
- checklist: estados, legibilidad, no solapamientos, paridad con kit.

---

## Supuestos / Defaults

- Se mantiene layout funcional actual de pantallas salvo ajuste mínimo de ergonomía.
- Los módulos 15/16/18 no se fuerzan como copia literal; se usan como referencia parcial cuando corresponda.
- No se agregan assets externos.
- Toda skin nueva vive en `forge-light-v2` (`primitives/modules/screens`), no en estilos inline.
