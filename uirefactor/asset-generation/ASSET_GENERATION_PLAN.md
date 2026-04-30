# Asset Generation Expansion Plan

Fecha: 2026-04-28

Objetivo: aprovechar las tandas de generacion masiva para construir un banco de arte futuro sin mezclarlo con los assets ya integrados. Cada lote debe tener reglas globales, prompts individuales, comando npm y carpeta de salida propia.

## Principios

- No mezclar arte canonico actual con arte futuro sin revisar.
- Mantener nombres estables: `boss_`, `weekly_boss_`, `enemy_`, `station_`, `portrait_`, `icon_`, `skill_`, `echo_`.
- Generar primero en `quality medium`. Usar `high` solo para piezas aprobadas o de alto impacto.
- Mantener alpha real en personajes, enemigos, bosses, retratos, iconos y skills.
- Mantener fondos opacos solo cuando el asset sea ilustracion de pantalla o banner.
- Usar referencias visuales como input opcional, no como fuente a copiar.

## Lotes Implementados

### Items

- Prompts: `items-pilot-8.md`, `items-remaining-67.md`, `items-all.md`.
- Salida: `public/assets/items/`.
- Estado: listo.

### Bosses Actuales

- Prompts: `bosses/bosses-all.md`.
- Salida: `public/assets/combat/bosses/`.
- Estado: listo.

### Bosses Futuros

- Prompts: `bosses/future-bosses-20.md`.
- Salida: `public/assets/combat/bosses/future/`.
- Uso: banco de arte para expandir rutas, codex, dungeons o bosses de temporada.
- Estado: listo.

### Weekly Bosses

- Prompts: `bosses/weekly-bosses-10.md`.
- Salida: `public/assets/combat/weekly-bosses/`.
- Uso: bosses de varios intentos, mas grandes y mas intimidantes que bosses normales.
- Estado: listo.

### Enemigos

- Prompts faltantes: `enemies/enemies-missing-3.md`.
- Prompts futuros: `enemies/future-enemies-40.md`.
- Salida faltantes: `public/assets/combat/enemies/`.
- Salida futuros: `public/assets/combat/enemies/future/`.
- Estado: listo.

### Santuario

- Prompts: `illustrations/sanctuary-stations.md`.
- Salida: `public/assets/sanctuary/stations/`.
- Uso: ilustraciones/miniaturas para estaciones y filas del Santuario.
- Estado: listo.

### Retratos

- Prompts: `portraits/class-portraits.md`.
- Salida: `public/assets/portraits/classes/`.
- Uso: header, ficha de heroe, selector de clase, overlays y posibles barras superiores.
- Estado: listo.

### Iconos de Sistema

Referencia: `uirefactor/Iconos SVG.png`.

- Prompts: `icons/system-icons-core.md`.
- Reglas: `icons/global-system-icon-rules.md`.
- Salida: `public/assets/icons/system/`.
- Cantidad: 64 iconos core.
- Uso: navegacion, recursos, stats, estados de combate y acciones de Santuario.
- Estado: listo.

### Skill Icons

Hay dos fuentes distintas:

- Talentos de clase: `src/data/talentTree.js` + `src/data/talents.js`.
- Ecos/prestige: `src/data/prestige.js`.

- Prompts: `skills/class-talents.md` y `skills/echo-tree.md`.
- Reglas: `skills/global-skill-icon-rules.md`.
- Preparador: `scripts/prepare-skill-icon-prompts.mjs`.
- Salida: `public/assets/skills/talents/` y `public/assets/skills/echoes/`.
- Cantidad: 54 talentos conceptuales y 56 Ecos.
- Estado: listo.

## Pendiente de Segunda Pasada

### Revision e Integracion de Iconos

- Probar `assets:icons:system` con `--limit 12` antes de gastar en los 64.
- Revisar legibilidad a 20, 24, 32 y 52 px.
- Mantener SVG donde haga falta recolor dinamico por CSS.
- Despues de aprobar, crear un registry de iconos raster o reemplazar casos puntuales.

### Integracion

Los assets generados no se integran automaticamente. Despues de revisar calidad:

1. Copiar o mantener en la carpeta publica final.
2. Crear mapas visuales en `src/data/combatVisuals.js` u otro registry nuevo.
3. Ajustar escala/offset por asset en la UI.
4. Capturar con `npm run ui:capture` y revisar mobile/desktop.
