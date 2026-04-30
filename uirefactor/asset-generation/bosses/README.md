# Boss Asset Generation

Carpeta operativa para generar bosses actuales, bosses futuros de reserva y weekly bosses.

## Archivos

- `global-boss-rules.md`: reglas comunes para todos los bosses.
- `bosses-all.md`: los 12 prompts individuales.
- `future-bosses-20.md`: 20 bosses inventados de reserva, marcados como futuros.
- `global-weekly-boss-rules.md`: reglas comunes para bosses semanales.
- `weekly-bosses-10.md`: 10 weekly bosses con escala mas grande y amenaza mas pesada.
- `reference/`: opcional, pega aca una imagen de referencia si queres empujar consistencia visual.

## Comandos

```bash
export OPENAI_API_KEY="tu_api_key"

npm run assets:bosses:all -- --dry-run
npm run assets:bosses:all
npm run assets:bosses:future -- --dry-run
npm run assets:bosses:future
npm run assets:bosses:weekly -- --dry-run
npm run assets:bosses:weekly
```

Si queres usar referencia visual:

```bash
npm run assets:bosses:all -- --reference uirefactor/asset-generation/bosses/reference/boss_style_reference.png
npm run assets:bosses:weekly -- --reference uirefactor/asset-generation/bosses/reference/boss_style_reference.png
```

Salidas:

```text
public/assets/combat/bosses/
public/assets/combat/bosses/future/
public/assets/combat/weekly-bosses/
```
