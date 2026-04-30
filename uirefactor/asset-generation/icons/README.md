# System Icon Asset Generation

Referencia visual primaria: `uirefactor/Iconos SVG.png`.

## Archivos

- `global-system-icon-rules.md`: reglas comunes para iconos chicos.
- `system-icons-core.md`: 64 iconos base para navegacion, recursos, stats, estados de combate y acciones del Santuario.

## Comandos

```bash
export OPENAI_API_KEY="tu_api_key"

npm run assets:icons:prepare
npm run assets:icons:system -- --dry-run
npm run assets:icons:system -- --reference "uirefactor/Iconos SVG.png"
```

Salida:

```text
public/assets/icons/system/
```

## Recomendacion

Generar primero un piloto con `--limit 12` y revisar legibilidad a 20, 24, 32 y 52 px antes de reemplazar SVGs existentes. Mantener SVG para iconos que necesiten recolor dinamico por CSS.
