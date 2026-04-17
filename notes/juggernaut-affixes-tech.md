## Juggernaut Late Scaling

- La defensa plana sigue siendo la primera capa. No se cambió la identidad base.
- Se agregó una segunda capa para golpes pesados en `processTickRuntime`:
  - `enemyRawHit`
  - `- defense`
  - `- heavy hit guard` sobre la porción que excede un umbral ligado a `maxHp`
- `heavyHitGuard` se deriva en `statEngine` desde:
  - `fortress`
  - `unmovingMountain`
  - `titanicMomentum`
  - y además suma contribución dinámica de `defense` y `maxHp` contra el hit enemigo.
- Cap actual de esa guardia: `58%` sobre la porción pesada del golpe.

### Fortress

- `Fortress` ya no proccea por el umbral fijo viejo.
- Ahora entra si:
  - bloqueaste, o
  - preveniste suficiente porcentaje del golpe bruto, o
  - preveniste una cantidad relevante en flat.
- El threshold actual baja con `fortress` y `unmovingMountain`.

### Daño Juggernaut

- `armorAsDamage` se buffeó:
  - mejor ratio de `ironCore`
  - suma extra desde `fortress`
  - `unmovingMountain` multiplica esa conversión
- También se agregó `guardRetaliationRatio`:
  - parte del daño prevenido vuelve como represalia
  - se suma al paquete de `thorns`
  - escala con `fortress`, `unmovingMountain` y `titanicMomentum`

### Boss Mechanics

- `Juggernaut` ahora aporta mitigación real de mecánicas de boss desde su propio kit.
- La mitigación base se deriva en `statEngine` y se suma a `bossMechanicMitigation`.

## Affix Categories Refactor

- La partición ya no depende de categorías viejas tipo `offense/defense/economy/special`.
- El motor normaliza categorías semánticas por familia de stat:
  - `offense_damage_flat`
  - `offense_precision`
  - `offense_speed`
  - `offense_combo`
  - `offense_mark`
  - `offense_mark_power`
  - `offense_bleed`
  - `offense_bleed_power`
  - `offense_fracture`
  - `offense_leech`
  - `offense_retaliation`
  - `defense_armor`
  - `defense_vitality`
  - `defense_regen`
  - `defense_evasion`
  - `defense_guard`
  - `economy_gold`
  - `economy_gold_pct`
  - `economy_xp`
  - `economy_essence`
  - `economy_loot`
  - `economy_luck`
  - más las categorías `abyss_*`
- Esto impacta:
  - roll inicial
  - reroll total
  - reforge
  - addAffix
  - normalización de items viejos al cargar

## Nuevos Affixes

- `suffix_mark_chance_2`
- `suffix_bleed_chance_2`
- `suffix_dodge_2`
- `suffix_health_max_2`
- `suffix_damage_3`

Objetivo:
- abrir builds híbridas sin meter nuevas mecánicas de runtime
- sacar presión artificial de categorías demasiado anchas
- permitir más combinaciones reales por item sin tocar el cap de líneas
