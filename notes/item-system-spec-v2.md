# Item System Spec v2

Estado: Draft
Owner: Game Design + Systems
Última actualización: 2026-04-12

## 1. Objetivo
Definir un sistema de ítems legible, balanceable y escalable para mobile/desktop, con identidad de familias y progresión clara por rareza.

## 2. Decisiones cerradas

### 2.1 Densidad por rareza
- Common: 2 líneas
- Magic: 3 líneas
- Rare: 4 líneas
- Epic: 6 líneas
- Legendary: 8 líneas

### 2.2 Blueprint por rareza
- Common: 1 Base + 1 Implicit + 0 Affix
- Magic: 1 Base + 1 Implicit + 1 Affix
- Rare: 1 Base + 1 Implicit + 2 Affix
- Epic: 2 Base + 1 Implicit + 3 Affix
- Legendary: 3 Base + 1 Implicit + 4 Affix

### 2.3 Reglas globales
- Upgrade no agrega líneas nuevas.
- No duplicar stat dentro del mismo item.
- Límite de stats porcentuales por item: [TODO definir].
- Soft bias por familia/slot (pesos, no hard lock salvo casos extremos).

## 3. Catálogo de stats

### 3.1 Stats flat
- [TODO]

### 3.2 Stats percent
- [TODO]

### 3.3 Caps globales (si aplica)
| Stat | Cap | Nota |
|---|---:|---|
| [TODO] | [TODO] | [TODO] |

## 4. Slots y familias

## 4.1 Slots
- Weapon
- Helmet
- Chest
- Gloves
- Boots
- Ring
- Amulet
- [TODO]

## 4.2 Familias por slot
| Slot | FamilyId | Identidad | Base Primary | Implicit |
|---|---|---|---|---|
| Weapon | [TODO] | [TODO] | [TODO] | [TODO] |

## 5. Base stat pools (por familia)

Definir posibles bases extra para Epic/Legendary, con pesos.

| FamilyId | Base Candidate Stat | Min | Max | Weight | Tags/Notas |
|---|---|---:|---:|---:|---|
| [TODO] | [TODO] | [TODO] | [TODO] | [TODO] | [TODO] |

Reglas:
- Base primaria siempre presente.
- Base extra se selecciona sin duplicados.
- Bases extra deben respetar identidad de familia.

## 6. Implicit por rareza

| FamilyId | Common | Magic | Rare | Epic | Legendary |
|---|---:|---:|---:|---:|---:|
| [TODO] | [TODO] | [TODO] | [TODO] | [TODO] | [TODO] |

## 7. Affix pools

Separar por prefijo/sufijo/categoría y slot.

| AffixId | Stat | Kind (flat/% ) | Slot Allowlist | Min | Max | Tier | Weight | Tags |
|---|---|---|---|---:|---:|---|---:|---|
| [TODO] | [TODO] | [TODO] | [TODO] | [TODO] | [TODO] | [TODO] | [TODO] | [TODO] |

Reglas:
- No duplicar stat entre base/implicit/affix.
- Validar restricciones por slot/familia.
- Fallback si no hay candidato válido.

## 8. Soft bias

## 8.1 Matriz de pesos
| FamilyId | Tag | Weight Modifier |
|---|---|---:|
| [TODO] | [TODO] | [TODO] |

## 8.2 Defaults sugeridos
- Afinidad: +25%
- Neutral: 0%
- Opuesta: -15%

## 9. Upgrade

## 9.1 Regla actual v2
- Upgrade mejora valores existentes según tipo de línea.
- No agrega líneas nuevas.

## 9.2 Fórmula (placeholder)
- `final = basePart * [TODO] + affixPart * [TODO]`
- Definir crecimiento por nivel 1..N: [TODO]

## 10. Economía de crafting

## 10.1 Acciones
- Upgrade
- Reroll
- Reforge
- [TODO]

## 10.2 Curvas de costo
| Acción | Base Cost | Growth | Notas |
|---|---:|---:|---|
| Upgrade | [TODO] | [TODO] | [TODO] |
| Reroll | [TODO] | [TODO] | [TODO] |
| Reforge | [TODO] | [TODO] | [TODO] |

## 11. Algoritmo de generación (orden)
1. Seleccionar slot y familia.
2. Determinar rareza.
3. Aplicar blueprint de rareza.
4. Roll base primary.
5. Roll bases extra (si aplica).
6. Roll implicit.
7. Roll affixes con soft bias y validaciones.
8. Validar constraints; reroll de líneas inválidas.

## 12. UI/UX requirements
- Item Stats compacto para 6-8 líneas.
- Diferenciar Base/Implicit/Affix con etiqueta sutil.
- Comparativa clara (badge +/- color).
- Evitar redundancia de total + comparativa.

## 13. Telemetría mínima
| Métrica | Objetivo |
|---|---|
| % drops equipados por rareza | [TODO] |
| rerolls por item equipado | [TODO] |
| tiempo para reemplazar slot | [TODO] |
| distribución de stats % por item | [TODO] |

## 14. Plan de rollout
- Fase 1: datos + validadores.
- Fase 2: generador + simulación drops.
- Fase 3: UI + tuning + telemetría.

## 15. Pendientes abiertos
- Definir lista final de stats activos del engine.
- Definir caps definitivos (%).
- Definir familias finales por slot.
- Definir curva final de costos por acción.
