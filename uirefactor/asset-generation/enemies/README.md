# Enemy Asset Generation

Carpeta operativa para generar enemigos faltantes y banco futuro.

## Archivos

- `global-enemy-rules.md`: reglas comunes para enemigos normales.
- `enemies-missing-3.md`: `wolf`, `skeleton`, `ancient_dragon`.
- `future-enemies-40.md`: banco futuro no canon hasta integrarlo.

## Comandos

```bash
export OPENAI_API_KEY="tu_api_key"

npm run assets:enemies:missing -- --dry-run
npm run assets:enemies:missing
npm run assets:enemies:future -- --dry-run
npm run assets:enemies:future
```

Salida:

```text
public/assets/combat/enemies/
public/assets/combat/enemies/future/
```

