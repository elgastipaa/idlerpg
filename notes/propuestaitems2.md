================================================================
REWORK DE ITEMS - IDLE RPG (v2.0) - DOCUMENTO DE IMPLEMENTACIÓN
================================================================

1. BLUEPRINT DE RAREZA (ESTRUCTURA DE LÍNEAS)
----------------------------------------------------------------
Rareza     | Total | Composición (Base + Implicit + Affix)
----------------------------------------------------------------
Common     | 2     | 1 Base + 1 Implicit + 0 Affix
Magic      | 3     | 1 Base + 1 Implicit + 1 Affix
Rare       | 4     | 1 Base + 1 Implicit + 2 Affix
Epic       | 6     | 2 Base + 1 Implicit + 3 Affix
Legendary  | 8     | 3 Base + 1 Implicit + 4 Affix
----------------------------------------------------------------

2. TABLA DE FAMILIAS, BASES Y PESOS
----------------------------------------------------------------
SLOT: WEAPON
- Sword: Base[Damage] | Extras: CritDmg(70), AtkSpd(30) | Imp: %AtkSpd
- Axe:   Base[Damage] | Extras: CritCh(60), Thorns(40)  | Imp: %CritDmg
- Mace:  Base[Damage] | Extras: HP(50), Block(50)      | Imp: %Damage
- Dagger:Base[Damage] | Extras: Dodge(50), CritCh(50)   | Imp: %CritCh

SLOT: ARMOR
- Plate: Base[Armor]  | Extras: HP(70), Block(30)      | Imp: %Armor
- Mail:  Base[Armor]  | Extras: RegHP(50), Dodge(50)    | Imp: %HP
- Cloth: Base[Armor]  | Extras: SkillP(60), CDR(40)     | Imp: %SkillP
----------------------------------------------------------------

3. REGLAS ANTI-SNOWBALL (LIMITS & CAPS)
----------------------------------------------------------------
* REGLA DE EXCLUSIÓN: Un ítem no puede repetir el mismo STAT en 
  sus líneas de Affix, ni duplicar el STAT de la Base/Implicit.
* CAP INDIVIDUAL: Ningún Affix de tipo % puede superar el 15%.
* CAP POR ITEM: La suma total de un stat (ej. Damage%) entre 
  todas las líneas del ítem no puede exceder el 40%.
----------------------------------------------------------------

4. ECONOMÍA DE CRAFTING (NIVELES 1-20)
----------------------------------------------------------------
Fórmula Upgrade: CostoBase * Tier * 1.5^(Level-1)

Nivel | Costo Rare | Costo Legnd | Éxito %
------------------------------------------
1     | 100        | 500         | 100%
5     | 506        | 2,531       | 90%
10    | 3,844      | 19,221      | 70%
15    | 29,192     | 145,964     | 40%
20    | 221,683    | 1,108,417   | 15%
------------------------------------------

5. PLAN DE IMPLEMENTACIÓN TÉCNICA
----------------------------------------------------------------
FASE 1: DATA DEFINITION
- Actualizar 'src/data/itemFamilies.js' con pesos de bases extra.
- Centralizar 'rarityBlueprint' en un nuevo config.

FASE 2: ENGINE UPDATE
- Modificar 'src/utils/loot.js' (materializeItem) para iterar 
  según el conteo del Blueprint.
- Inyectar validación de duplicados en 'src/engine/affixesEngine.js'.

FASE 3: CRAFTING & BALANCE
- Aplicar nuevas fórmulas en 'src/engine/crafting/craftingEngine.js'.
- Ejecutar script de simulación para validar curvas de poder.
----------------------------------------------------------------

6. RIESGOS Y MITIGACIÓN
----------------------------------------------------------------
- RIESGO: Power Creep en Legendary.
  MITIGACIÓN: Caps estrictos del 40% total por ítem.
- RIESGO: Frustración por fallos en Upgrade.
  MITIGACIÓN: Implementar sistema de "Pity" (suerte acumulada).
================================================================