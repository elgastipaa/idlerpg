# Asset Generation

Carpeta operativa para generar assets raster de Forge Light con OpenAI Images API.

## Setup

```bash
cd /home/gmendoza/coding/idlerpg
export OPENAI_API_KEY="tu_api_key"
```

Las imagenes ya generadas se saltean automaticamente. Para regenerar una tanda, agrega `--force`.

## Items

Archivos:

- `global-item-rules.md`: reglas comunes para todos los items.
- `items-pilot-8.md`: tanda piloto representativa.
- `items-remaining-67.md`: el resto despues del piloto.
- `items-all.md`: los 75 prompts.
- `reference/`: pega aca tu imagen de referencia, idealmente como `item_style_reference.png`.

Salida:

```text
public/assets/items/
```

Comandos:

```bash
npm run assets:items:pilot -- --dry-run
npm run assets:items:pilot -- --reference uirefactor/asset-generation/reference/item_style_reference.png
npm run assets:items:remaining -- --reference uirefactor/asset-generation/reference/item_style_reference.png
npm run assets:items:all -- --reference uirefactor/asset-generation/reference/item_style_reference.png
```

Flujo recomendado:

Primero corre el piloto de 8 items con `quality medium`. Si el estilo funciona, corre los 67 restantes. Usa `--quality high` solo para rehacer assets clave.

## Bosses

Archivos:

- `bosses/global-boss-rules.md`: reglas comunes para bosses.
- `bosses/bosses-all.md`: los 12 prompts.
- `bosses/future-bosses-20.md`: 20 bosses inventados de reserva.
- `bosses/global-weekly-boss-rules.md`: reglas comunes para weekly bosses.
- `bosses/weekly-bosses-10.md`: 10 weekly bosses mas grandes y duros.
- `bosses/reference/`: referencia visual opcional, idealmente `boss_style_reference.png`.

Salida:

```text
public/assets/combat/bosses/
public/assets/combat/bosses/future/
public/assets/combat/weekly-bosses/
```

Comandos:

```bash
npm run assets:bosses:all -- --dry-run
npm run assets:bosses:all
npm run assets:bosses:future -- --dry-run
npm run assets:bosses:future
npm run assets:bosses:weekly -- --dry-run
npm run assets:bosses:weekly
npm run assets:bosses:all -- --reference uirefactor/asset-generation/bosses/reference/boss_style_reference.png
```

## Enemigos

Archivos:

- `enemies/global-enemy-rules.md`: reglas comunes para enemigos normales.
- `enemies/enemies-missing-3.md`: enemigos actuales faltantes (`wolf`, `skeleton`, `ancient_dragon`).
- `enemies/future-enemies-40.md`: 40 enemigos inventados de reserva.

Salida:

```text
public/assets/combat/enemies/
public/assets/combat/enemies/future/
```

Comandos:

```bash
npm run assets:enemies:missing -- --dry-run
npm run assets:enemies:missing
npm run assets:enemies:future -- --dry-run
npm run assets:enemies:future
```

## Santuario

Usa `uirefactor/Santuario.png` como referencia de direccion visual para las estaciones. Podes pasarla como imagen de referencia al generar.

Archivos:

- `illustrations/global-sanctuary-illustration-rules.md`: reglas comunes de ilustraciones de estaciones.
- `illustrations/sanctuary-stations.md`: 8 ilustraciones de estaciones.

Salida:

```text
public/assets/sanctuary/stations/
```

Comandos:

```bash
npm run assets:illustrations:sanctuary -- --dry-run
npm run assets:illustrations:sanctuary -- --reference uirefactor/Santuario.png
```

## Retratos

Archivos:

- `portraits/global-portrait-rules.md`: reglas comunes para retratos.
- `portraits/class-portraits.md`: retratos de clases y subclases actuales.

Salida:

```text
public/assets/portraits/classes/
```

Comandos:

```bash
npm run assets:portraits:classes -- --dry-run
npm run assets:portraits:classes
```

## Iconos y skills

Archivos:

- `icons/global-system-icon-rules.md`: reglas comunes para iconos de sistema.
- `icons/system-icons-core.md`: 64 iconos core.
- `skills/global-skill-icon-rules.md`: reglas comunes para Talentos y Ecos.
- `skills/class-talents.md`: 54 iconos de talentos visibles/conceptuales.
- `skills/echo-tree.md`: 56 iconos para Ecos/Prestige.

Salidas:

```text
public/assets/icons/system/
public/assets/skills/talents/
public/assets/skills/echoes/
```

Comandos:

```bash
npm run assets:icons:prepare
npm run assets:icons:system -- --dry-run
npm run assets:icons:system -- --reference "uirefactor/Iconos SVG.png"

npm run assets:skills:prepare
npm run assets:skills:talents -- --dry-run
npm run assets:skills:talents -- --reference "uirefactor/skills_reference.png"
npm run assets:skills:echoes -- --dry-run
npm run assets:skills:echoes -- --reference "uirefactor/skills_reference.png"
```

Notas:

- Probar iconos de sistema con `--limit 12` antes de gastar en los 64.
- Probar Talentos/Ecos con `--limit 12` antes de gastar en tandas grandes.
- Si un icono de Talentos/Ecos sale con borde, placa o fondo cuadrado, borra solo ese PNG y corre el comando de nuevo; los PNG existentes se saltean automaticamente.
- Los prompts de skills se regeneran desde datos reales del juego, no se mantienen a mano.
- `ASSET_GENERATION_PLAN.md` mantiene el plan profundo de fases y orden recomendado.

## Regenerar prompts separados

Si cambias los prompts de items en `uirefactor/imagenes.md`, podes regenerar el split:

```bash
npm run assets:items:prepare
```
