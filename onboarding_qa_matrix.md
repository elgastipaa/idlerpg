# Onboarding QA Matrix

Fecha: 2026-04-22 UTC

## Regla base

- Todo beat posterior a `BUY_FIRST_ECHO_NODE` es informativo.
- Formato esperado:
  - popup
  - boton `Seguir`
  - hint `En Mas > Glosario podes ver mas`
- Ninguno debe exigir click real sobre UI.

## Beats tardios

| Beat | Trigger esperado | Pantalla esperada | Popup | Bloquea UI real | Cierre esperado | Notas |
|---|---|---|---|---|---|---|
| `FIRST_PRESTIGE_CLOSE` | primer nodo de `Ecos` comprado | `prestige` | si | no | `ACK_ONBOARDING_STEP` | fija el loop meta |
| `BLUEPRINT_INTRO` | `Prestige 2+` con stash temporal relevante | `sanctuary` | si | no | `ACK_ONBOARDING_STEP` | presenta persistencia de items |
| `BLUEPRINT_DECISION` | despues de `BLUEPRINT_INTRO` | `sanctuary` | si | no | `ACK_ONBOARDING_STEP` | explica `Blueprint` vs `Desguace` |
| `FIRST_BLUEPRINT_MATERIALIZATION` | primera materializacion real | `sanctuary` o corrida | si | no | `ACK_ONBOARDING_STEP` | contextual |
| `FIRST_DEEP_FORGE_USE` | `deepForge` desbloqueada | `sanctuary` | si | no | `ACK_ONBOARDING_STEP` | taller informativo |
| `FIRST_LIBRARY_RESEARCH` | biblioteca abierta + tinta | `sanctuary` | si | no | `ACK_ONBOARDING_STEP` | biblioteca informativa |
| `FIRST_ERRAND` | encargos abiertos + slot libre | `sanctuary` | si | no | `ACK_ONBOARDING_STEP` | encargos informativos |
| `FIRST_SIGIL_INFUSION` | altar abierto + flux | `sanctuary` | si | no | `ACK_ONBOARDING_STEP` | altar informativo |
| `TIER25_CAP` | boss de `Tier 25` derrotado sin portal | `combat` | si | no | `ACK_ONBOARDING_STEP` | explica cap del mundo base |
| `FIRST_ABYSS` | primera entrada a `Tier 26+` | `combat` | si | no | `ACK_ONBOARDING_STEP` | explica reglas del endgame |

## Regresion previa a Ecos

- `EXPEDITION_INTRO` sigue abriendo la primera salida desde `Santuario`.
- `CHOOSE_CLASS` sigue ocurriendo en setup, no antes.
- `EQUIP_FIRST_ITEM` scrollea igual en desktop y mobile.
- `BUY_TALENT` spotlight-ea un nodo realmente comprable y garantiza `TP`.
- `RETURN_TO_SANCTUARY` no rompe render con error de hooks.
- `FIRST_DISTILLERY_JOB` mantiene loop real y no espera claim obligatorio.

## Helper disponible

- `Mas > Sistema > QA onboarding tardio`
- Botones para forzar:
  - `FIRST_PRESTIGE_CLOSE`
  - `BLUEPRINT_INTRO`
  - `BLUEPRINT_DECISION`
  - `FIRST_DEEP_FORGE_USE`
  - `FIRST_LIBRARY_RESEARCH`
  - `FIRST_ERRAND`
  - `FIRST_SIGIL_INFUSION`
  - `TIER25_CAP`
  - `FIRST_ABYSS`
