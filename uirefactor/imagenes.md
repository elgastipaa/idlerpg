# Prompts de imagenes para Combat

Fecha: 2026-04-27
Objetivo: generar assets base para la pantalla `Combat` del redisenio Forge Light.

Reglas generales para todos los prompts:

- Sin UI.
- Sin texto.
- Sin logos.
- Sin watermark.
- Mantener lectura mobile.
- Estetica dark fantasy premium compatible con Forge Light.
- Alto contraste, bordes legibles y atmosfera oscura.

---

## 1. Fondo de combate: Ruinas Olvidadas

Archivo sugerido: `combat_bg_ruinas_olvidadas.png`

Uso:

- Fondo vertical principal de la pantalla Combat.
- Debe tener espacio visual para HUD arriba, enemigo al centro y paneles abajo.

Prompt:

```text
Vertical mobile game combat background, 1024x1536, dark fantasy ancient forgotten ruins inside a wet stone dungeon, broken arches, mossy walls, deep perspective corridor, cold blue-green fog in the distance, subtle toxic green bioluminescent slime on the floor, warm golden torch glints on stone edges, cinematic high contrast, premium RPG key art, painterly realistic style, center area open and readable for a large enemy, darker top band reserved for HUD readability, darker bottom floor area reserved for combat panels, no characters, no monsters, no user interface, no text, no logos, no watermark.
```

Negative prompt:

```text
modern objects, sci-fi panels, bright daylight, cartoon style, cute style, low contrast, UI elements, text, numbers, logo, watermark, frame, border, character, monster, weapon in foreground
```

---

## 2. Enemigo comun: Slime Corrupto

Archivo sugerido: `enemy_slime_corrupto.png`

Uso:

- Enemigo base para validar floating text, HP bar y debuffs.
- Silueta baja y ancha, parecida a la referencia de `Combat.png`.

Prompt:

```text
Corrupted slime monster for a dark fantasy mobile RPG, transparent background PNG, centered full body creature, low wide silhouette, glossy black-green translucent body, toxic neon green veins and sparks inside the slime, two bright yellow-green glowing eyes, irregular melting edges, small acid droplets, sinister but readable shape, premium game enemy art, painterly realistic rendering, strong rim light, high contrast, designed to be readable at mobile size, no environment, no UI, no text, no logo, no watermark.
```

Negative prompt:

```text
cute slime, cartoon, chibi, flat vector, humanoid body, weapon, armor, background scene, floor, shadow too large, UI, text, watermark, logo
```

---

## 3. Enemigo elite: Caballero Hueco

Archivo sugerido: `enemy_caballero_hueco.png`

Uso:

- Enemigo humanoide para validar enemigos verticales y lectura contra el fondo.
- Sirve para tiers medios o elites.

Prompt:

```text
Hollow knight enemy for a dark fantasy mobile RPG, transparent background PNG, centered full body, tall armored undead warrior, blackened steel armor with worn bronze edges, cracked helmet with cold blue ghost light inside, tattered dark cape, long sword held downward, subtle ember glow in armor cracks, premium RPG enemy art, painterly realistic style, strong silhouette, high contrast, readable at mobile size, no environment, no UI, no text, no logo, no watermark.
```

Negative prompt:

```text
hero pose, friendly character, anime style, cartoon style, overly bulky armor, sci-fi armor, bright clean armor, background, castle scene, UI, text, watermark, logo
```

---

## 4. Enemigo jefe: Golem de Forja Abisal

Archivo sugerido: `enemy_golem_forja_abisal.png`

Uso:

- Boss grande para validar escala, HP bar, floating text critico y estados de peligro.
- Silueta pesada y vertical/ancha.

Prompt:

```text
Abyssal forge golem boss for a dark fantasy mobile RPG, transparent background PNG, centered full body, massive stone and black iron construct, cracked obsidian plates, molten orange forge light glowing from the chest and joints, bronze-gold worn edges, heavy shoulders, ancient runes carved into armor, intimidating boss silhouette, premium RPG enemy key art, painterly realistic rendering, high contrast, strong rim light, readable at mobile size, no environment, no UI, no text, no logo, no watermark.
```

Negative prompt:

```text
robot, sci-fi mech, clean metal, cute proportions, cartoon, low detail, background scene, lava landscape, UI, text, numbers, watermark, logo
```

---

## 5. Enemigo magico: Aparicion de Esencia

Archivo sugerido: `enemy_aparicion_esencia.png`

Uso:

- Enemigo magico/arcano para validar paleta violeta, estados de esencia y efectos no fisicos.
- Util si necesitamos variedad mas alla de slime/humanoide/boss.

Prompt:

```text
Arcane essence wraith enemy for a dark fantasy mobile RPG, transparent background PNG, centered full body, floating spectral figure made of violet crystal shards and smoky dark robes, glowing purple core, sharp angular silhouette, faint golden occult markings, elegant but dangerous, premium RPG enemy art, painterly realistic style, high contrast, readable at mobile size, no environment, no UI, no text, no logo, no watermark.
```

Negative prompt:

```text
friendly ghost, cute ghost, cartoon, anime, angel, clean white spirit, background scene, UI, text, watermark, logo, low contrast
```

---

## Prioridad

Si solo generamos lo minimo:

1. `combat_bg_ruinas_olvidadas.png`
2. `enemy_slime_corrupto.png`
3. `enemy_caballero_hueco.png`
4. `enemy_golem_forja_abisal.png`

`enemy_aparicion_esencia.png` es opcional, pero recomendable para probar efectos violetas y enemigos magicos.

---

## Prompts por enemigo actual del juego

Fuente: `src/data/enemies.js`

Regla de uso:

- Estos prompts usan el `id` real del enemigo como nombre sugerido de archivo.
- Pedir PNG con fondo transparente para enemigos.
- Mantener todos centrados, full body y sin UI.
- Si una imagen previa ya existe y gusta, conservarla; estos prompts sirven para completar o normalizar el set.

Negative prompt comun para enemigos:

```text
cartoon, chibi, cute style, anime, flat vector, low contrast, blurry silhouette, cropped body, partial body, background scene, floor, UI, text, numbers, logo, watermark, frame, border, modern clothing, sci-fi gun
```

### 6. Slime

Archivo sugerido: `enemy_slime.png`

Prompt:

```text
Dark fantasy RPG slime enemy, transparent background PNG, centered full body, low wide silhouette, glossy black-green translucent ooze, toxic green inner glow, small acid bubbles, two simple glowing yellow-green eyes, dripping irregular edges, sinister but readable at mobile size, premium painterly game art, strong rim light, high contrast, no environment, no UI, no text, no logo, no watermark.
```

### 7. Goblin

Archivo sugerido: `enemy_goblin.png`

Prompt:

```text
Dark fantasy RPG goblin raider enemy, transparent background PNG, centered full body, short hunched wiry creature, sharp ears, bronze scrap armor, ragged leather straps, cruel grin, curved rusty dagger, small stolen trinkets, green-gray skin, warm torch rim light, premium painterly game art, strong readable silhouette for mobile, no environment, no UI, no text, no logo, no watermark.
```

### 8. Wolf

Archivo sugerido: `enemy_wolf.png`

Prompt:

```text
Dark fantasy RPG wolf enemy, transparent background PNG, centered full body, lean aggressive dire wolf, charcoal fur, glowing amber eyes, raised hackles, scarred muzzle, subtle frost breath, bronze collar fragments, low stalking pose, premium painterly game art, high contrast, readable mobile silhouette, no environment, no UI, no text, no logo, no watermark.
```

### 9. Skeleton

Archivo sugerido: `enemy_skeleton.png`

Prompt:

```text
Dark fantasy RPG skeleton enemy, transparent background PNG, centered full body, ancient undead warrior bones, cracked skull with faint blue soul light in eye sockets, broken bronze armor plates, old round shield, chipped sword, dusty burial cloth, premium painterly game art, strong silhouette, high contrast, readable at mobile size, no environment, no UI, no text, no logo, no watermark.
```

### 10. Orc Brute

Archivo sugerido: `enemy_orc_brute.png`

Prompt:

```text
Dark fantasy RPG orc brute enemy, transparent background PNG, centered full body, massive muscular orc, dark olive skin, heavy jaw tusks, crude black iron shoulder armor, spiked wooden club, battle scars, red war paint, aggressive forward stance, premium painterly game art, strong bulky silhouette, high contrast, readable mobile size, no environment, no UI, no text, no logo, no watermark.
```

### 11. Dark Knight

Archivo sugerido: `enemy_dark_knight.png`

Prompt:

```text
Dark fantasy RPG dark knight enemy, transparent background PNG, centered full body, tall blackened steel knight, worn bronze edges, horned closed helmet, crimson glow through visor, tattered dark cape, long sword held downward, subtle ember cracks in armor, premium painterly game art, intimidating vertical silhouette, high contrast, readable mobile size, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 12. Cult Adept

Archivo sugerido: `enemy_cult_adept.png`

Prompt:

```text
Dark fantasy RPG cult adept enemy, transparent background PNG, centered full body, hooded occult caster in dark burgundy robes, bronze ritual mask, thin hands holding a small violet flame, dangling bone charms, gold sigil embroidery, mysterious dangerous posture, premium painterly game art, sharp readable silhouette, high contrast, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 13. Blood Hound

Archivo sugerido: `enemy_blood_hound.png`

Prompt:

```text
Dark fantasy RPG blood hound enemy, transparent background PNG, centered full body, demonic hunting dog, lean muscular body, dark red-black hide, exposed sharp fangs, glowing red eyes, spiked bronze collar, aggressive crouched pose, premium painterly game art, high contrast, readable mobile silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette, edges must fade directly into transparency, no white background, no soft background fill
```

### 14. Infernal Raider

Archivo sugerido: `enemy_infernal_raider.png`

Prompt:

```text
Dark fantasy RPG infernal raider enemy, transparent background PNG, centered full body, demon marauder with charred armor, ember cracks across skin, curved axe, ragged banner cloth, small horns, molten orange glow from chest and eyes, bronze-gold worn armor edges, premium painterly game art, high contrast, strong silhouette, readable mobile size, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette, edges must fade directly into transparency, no white background, no soft background fill
```

### 15. Bone Reaver

Archivo sugerido: `enemy_bone_reaver.png`

Prompt:

```text
Dark fantasy RPG bone reaver enemy, transparent background PNG, centered full body, undead assassin made of bones and torn black cloth, elongated skull mask, twin jagged bone blades, hunched predatory stance, pale green corpse glow in ribcage, bronze grave ornaments, premium painterly game art, sharp silhouette, high contrast, readable mobile size, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette, edges must fade directly into transparency, no white background, no soft background fill
```

### 16. Steel Guardian

Archivo sugerido: `enemy_steel_guardian.png`

Prompt:

```text
Dark fantasy RPG steel guardian enemy, transparent background PNG, centered full body, ancient animated armor construct, heavy steel plates with bronze trim, tower shield, halberd, blue arcane core glowing inside chest, helmet without face, stable defensive stance, premium painterly game art, high contrast, readable mobile silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette, edges must fade directly into transparency, no white background, no soft background fill
```

### 17. Void Scout

Archivo sugerido: `enemy_void_scout.png`

Prompt:

```text
Dark fantasy RPG void scout enemy, transparent background PNG, centered full body, lean occult scout wrapped in black fabric, faceless hood with violet star-like eyes, curved short blades, floating purple void shards around shoulders, agile sneaking posture, faint gold sigil marks, premium painterly game art, high contrast, readable mobile silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette, edges must fade directly into transparency, no white background, no soft background fill
```

### 18. Flame Lord

Archivo sugerido: `enemy_flame_lord.png`

Prompt:

```text
Dark fantasy RPG flame lord enemy, transparent background PNG, centered full body, regal fire elemental warlord, humanoid silhouette made of molten obsidian and living flame, crown-like horns of fire, bronze-gold armor fragments, burning cloak, intense orange core, premium painterly game art, high contrast, powerful readable silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette, edges must fade directly into transparency, no white background, no soft background fill
```

### 19. Abyss Harvester

Archivo sugerido: `enemy_abyss_harvester.png`

Prompt:

```text
Dark fantasy RPG abyss harvester enemy, transparent background PNG, centered full body, tall demonic reaper-like creature, black chitin armor, long hooked scythe, violet abyss glow in chest and eyes, insectoid sharp limbs, ragged shadow cloak, bronze occult charms, premium painterly game art, high contrast, menacing silhouette readable in mobile, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette, edges must fade directly into transparency, no white background, no soft background fill
```

### 20. Grave Executor

Archivo sugerido: `enemy_grave_executor.png`

Prompt:

```text
Dark fantasy RPG grave executor enemy, transparent background PNG, centered full body, undead executioner in rusted black armor, oversized grave axe, skull-like iron mask, torn funeral cloth, pale green soul mist escaping armor gaps, heavy boots, premium painterly game art, high contrast, strong brutal silhouette, readable mobile size, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 21. Warlord Champion

Archivo sugerido: `enemy_warlord_champion.png`

Prompt:

```text
Dark fantasy RPG warlord champion enemy, transparent background PNG, centered full body, elite orc warlord, huge armored body, ornate bronze-black plate armor, fur mantle, double-bladed axe, red war banner fragments, tusks with gold rings, confident boss-like stance, premium painterly game art, high contrast, powerful readable silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 22. Rift Stalker

Archivo sugerido: `enemy_rift_stalker.png`

Prompt:

```text
Dark fantasy RPG rift stalker enemy, transparent background PNG, centered full body, agile rogue creature stepping through violet dimensional cracks, dark leather armor, masked face, twin daggers, blue-violet rift energy trailing behind, bronze buckles and knives, predatory crouched stance, premium painterly game art, high contrast, readable mobile silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 23. Catacomb Horror

Archivo sugerido: `enemy_catacomb_horror.png`

Prompt:

```text
Dark fantasy RPG catacomb horror enemy, transparent background PNG, centered full body, grotesque undead abomination assembled from bones and grave cloth, multiple rib-like spikes, long arms dragging claws, skulls fused into shoulders, sickly green soul glow, terrifying hunched silhouette, premium painterly game art, high contrast, readable mobile size, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 24. Storm Elemental

Archivo sugerido: `enemy_storm_elemental.png`

Prompt:

```text
Dark fantasy RPG storm elemental enemy, transparent background PNG, centered full body, floating humanoid made of dark clouds, blue-white lightning core, jagged crystal fragments orbiting, electric arms, glowing cyan eyes, bronze rune bands suspended around wrists, premium painterly game art, high contrast, readable mobile silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 25. Forge Colossus

Archivo sugerido: `enemy_forge_colossus.png`

Prompt:

```text
Dark fantasy RPG forge colossus enemy, transparent background PNG, centered full body, massive black iron and stone construct, molten orange forge light glowing through cracks, huge hammer arm, anvil-like shoulders, bronze-gold worn edges, ancient runes, heavy boss silhouette, premium painterly game art, high contrast, readable mobile size, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 26. Ancient Dragon

Archivo sugerido: `enemy_ancient_dragon.png`

Prompt:

```text
Dark fantasy RPG ancient dragon enemy, transparent background PNG, centered full body, old battle-scarred dragon, dark obsidian scales with bronze-gold horn edges, folded wings framing body, glowing ember eyes, cracked chest with faint fire core, majestic threatening pose, premium painterly game art, high contrast, readable mobile silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 27. Void Devourer

Archivo sugerido: `enemy_void_devourer.png`

Prompt:

```text
Dark fantasy RPG void devourer enemy, transparent background PNG, centered full body, monstrous occult beast made of black void matter, huge circular maw with violet inner glow, many shadow tendrils, floating broken gold sigil fragments, starless dark body with purple highlights, premium painterly game art, high contrast, readable mobile silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 28. Dread Reaper

Archivo sugerido: `enemy_dread_reaper.png`

Prompt:

```text
Dark fantasy RPG dread reaper enemy, transparent background PNG, centered full body, tall skeletal reaper, black torn robes, long crescent scythe, skull hidden under deep hood, pale blue-green soul fire, bronze chains and grave talismans, floating lower robe, premium painterly game art, high contrast, iconic readable silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 29. Abyss Tyrant

Archivo sugerido: `enemy_abyss_tyrant.png`

Prompt:

```text
Dark fantasy RPG abyss tyrant boss enemy, transparent background PNG, centered full body, towering demon king, black obsidian armor, massive horns, violet abyss core in chest, molten red cracks, clawed gauntlets, tattered royal cape, bronze-gold corrupted crown details, premium painterly boss art, high contrast, dominant readable silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

### 30. Eternal Warden

Archivo sugerido: `enemy_eternal_warden.png`

Prompt:

```text
Dark fantasy RPG eternal warden enemy, transparent background PNG, centered full body, ancient guardian construct, tall stone and bronze armor, serene faceless helmet, glowing blue-gold core, huge tower shield and spear, floating rune halo behind shoulders, timeless defensive stance, premium painterly game art, high contrast, readable mobile silhouette, no environment, no UI, no text, no logo, no watermark.perfect transparent background, no checker pattern, no shadow outside silhouette
```

---

## Checklist de cobertura de enemigos

Enemigos cubiertos desde `src/data/enemies.js`:

- `slime`
- `goblin`
- `wolf`
- `skeleton`
- `orc_brute`
- `dark_knight`
- `cult_adept`
- `blood_hound`
- `infernal_raider`
- `bone_reaver`
- `steel_guardian`
- `void_scout`
- `flame_lord`
- `abyss_harvester`
- `grave_executor`
- `warlord_champion`
- `rift_stalker`
- `catacomb_horror`
- `storm_elemental`
- `forge_colossus`
- `ancient_dragon`
- `void_devourer`
- `dread_reaper`
- `abyss_tyrant`
- `eternal_warden`

---

## Assets generados e integrados

Estos assets ya tienen copia estable en `public/assets/combat/`. Los archivos en `uirefactor/generated/` quedan como fuente de trabajo/referencia.

Fondo integrado:

| ID canonico | Asset publico | Fuente generada | Estado |
|---|---|---|---|
| `combat_bg_ruinas_olvidadas` | `public/assets/combat/backgrounds/ruinas_olvidadas.png` | `uirefactor/generated/background.png` | listo |

Enemigos con asset directo integrado:

| Enemy ID real | Asset publico | Fuente generada | Estado |
|---|---|---|---|
| `slime` | `public/assets/combat/enemies/slime.png` | `uirefactor/generated/enemy_slime.png` | listo |
| `goblin` | `public/assets/combat/enemies/goblin.png` | `uirefactor/generated/enemy_goblin.png` | listo |
| `orc_brute` | `public/assets/combat/enemies/orc_brute.png` | `uirefactor/generated/enemy_brute_orc.png` | listo con rename canonico |
| `dark_knight` | `public/assets/combat/enemies/dark_knight.png` | `uirefactor/generated/enemy_dark_knight_2.png` | listo |
| `cult_adept` | `public/assets/combat/enemies/cult_adept.png` | `uirefactor/generated/enemy_cult_adept.png` | listo |
| `blood_hound` | `public/assets/combat/enemies/blood_hound.png` | `uirefactor/generated/enemy_blood_hound.png` | listo |
| `infernal_raider` | `public/assets/combat/enemies/infernal_raider.png` | `uirefactor/generated/enemy_infernal_raider.png` | listo |
| `bone_reaver` | `public/assets/combat/enemies/bone_reaver.png` | `uirefactor/generated/enemy_bone_reaver.png` | listo |
| `steel_guardian` | `public/assets/combat/enemies/steel_guardian.png` | `uirefactor/generated/enemy_steel_guardian.png` | listo |
| `void_scout` | `public/assets/combat/enemies/void_scout.png` | `uirefactor/generated/enemy_void_scout.png` | listo |
| `flame_lord` | `public/assets/combat/enemies/flame_lord.png` | `uirefactor/generated/enemy_flame_lord.png` | listo |
| `abyss_harvester` | `public/assets/combat/enemies/abyss_harvester.png` | `uirefactor/generated/enemy_abyss_harvester.png` | listo |
| `grave_executor` | `public/assets/combat/enemies/grave_executor.png` | `uirefactor/generated/enemy_grave_executor.png` | listo |
| `warlord_champion` | `public/assets/combat/enemies/warlord_champion.png` | `uirefactor/generated/enemy_warlord_champion.png` | listo |
| `rift_stalker` | `public/assets/combat/enemies/rift_stalker.png` | `uirefactor/generated/enemy_rift_stalker.png` | listo |
| `catacomb_horror` | `public/assets/combat/enemies/catacomb_horror.png` | `uirefactor/generated/enemy_catacomb_horror.png` | listo |
| `storm_elemental` | `public/assets/combat/enemies/storm_elemental.png` | `uirefactor/generated/enemy_storm_elemental.png` | listo |
| `forge_colossus` | `public/assets/combat/enemies/forge_colossus.png` | `uirefactor/generated/enemy_forge_colossus.png` | listo |
| `void_devourer` | `public/assets/combat/enemies/void_devourer.png` | `uirefactor/generated/enemy_void_devourer.png` | listo |
| `dread_reaper` | `public/assets/combat/enemies/dread_reaper.png` | `uirefactor/generated/enemy_dread_reaper.png` | listo |
| `abyss_tyrant` | `public/assets/combat/enemies/abyss_tyrant.png` | `uirefactor/generated/enemy_abyss_tyrant.png` | listo |
| `eternal_warden` | `public/assets/combat/enemies/eternal_warden.png` | `uirefactor/generated/enemy_eternal_warden.png` | listo |

Enemigos pendientes o con fallback temporal:

| Enemy ID real | Estado actual | Fallback |
|---|---|---|
| `wolf` | falta asset propio | `blood_hound` por familia `beast` |
| `skeleton` | falta asset propio | `dread_reaper` por familia `undead` |
| `ancient_dragon` | falta asset propio | sin fallback final; ver reintento de prompt abajo |

Notas tecnicas:

- `background.png` es RGB y se usa como fondo completo.
- Los enemigos generados son PNG RGBA segun metadata del archivo. Validar en la integracion si el alpha real recorta bien; si aparece una vignette visible sobre el fondo, pedir una version con alpha transparente mas limpio o hacer cutout.
- `hollow_knight.png`, `abyssal_golem.png` y `arcane_wraith.png` tambien se copiaron a `public/assets/combat/enemies/` como material de fallback/futuro, pero no son enemy id canonicos actuales.

---

## Reintento recomendado: Ancient Dragon

Archivo sugerido: `enemy_ancient_dragon.png`

Objetivo:

- Reemplazar el prompt anterior si el dragon sale demasiado ancho, cortado, con alas fuera de canvas o con fondo falso.
- Mantener la misma calidad visual del resto de enemigos generados.
- Priorizar silueta vertical mobile, no una ilustracion panoramica de dragon.

Prompt:

```text
Dark fantasy mobile RPG ancient dragon enemy, transparent background PNG, centered full body, vertical readable silhouette, old battle-scarred obsidian dragon standing in a compact three-quarter pose, wings folded tightly behind the body so they stay inside the canvas, long tail coiled close around the feet, four legs visible, head and chest clearly readable, bronze-gold worn horns and spine ridges, glowing ember eyes, faint molten fire core inside cracked chest scales, premium painterly realistic game enemy art, strong rim light, high contrast, designed for a mobile combat HUD, entire creature fully visible with extra transparent padding around horns, wings, tail and feet, no environment, no floor, no shadow outside the silhouette, no UI, no text, no logo, no watermark, perfect transparent background.
```

Negative prompt:

```text
wide horizontal dragon, wings fully spread, cropped wings, cropped tail, cropped feet, only dragon head, flying pose, tiny distant dragon, background scene, cave, sky, fire breath covering silhouette, giant floor shadow, white background, gray background, checker pattern, UI, text, logo, watermark, frame, border, cartoon, chibi, anime, low contrast, blurry silhouette
```

Notas:

- Si la IA insiste en alas muy abiertas, pedir version "wingless silhouette pass" o "folded wings touching the back".
- Si sale con base/sombra, pedir "transparent cutout, no contact shadow".

---

## Bosses: plan de assets

Estado actual:

- Los enemigos comunes ya pueden cubrir temporalmente familias de boss por fallback.
- No conviene considerar esos fallbacks como arte final de boss: ayudan a no dejar el HUD vacio, pero los bosses necesitan lectura propia.

Fallback temporal actual recomendado:

| Boss ID | Familia | Fallback temporal |
|---|---|---|
| `orc_warlord` | `orc` | `warlord_champion` |
| `iron_sentinel` | `construct` | `eternal_warden` |
| `blood_matriarch` | `demon` | `abyss_tyrant` |
| `void_titan` | `elemental` | `storm_elemental` |
| `ash_colossus` | `construct` | `forge_colossus` o `abyssal_golem` |
| `storm_tyrant` | `elemental` | `storm_elemental` |
| `grave_regent` | `undead` | `dread_reaper` |
| `dusk_reaver` | `raider` | `rift_stalker` |
| `soul_weaver` | `occult` | `void_devourer` |
| `hex_archon` | `cultist` | `cult_adept` |
| `void_sovereign` | `dragon` | pendiente de dragon propio |
| `chronolith` | `construct` | `eternal_warden` |

Propuesta para siguiente tanda:

- Generar archivos con prefijo `boss_`, por ejemplo `boss_orc_warlord.png`.
- Mantener todos en PNG RGBA, 1024x1536, full body, sin UI, sin fondo, sin sombra fuera de silueta.
- Hacer primero 5 bosses clave: `orc_warlord`, `iron_sentinel`, `blood_matriarch`, `void_sovereign`, `chronolith`.
- Despues completar bosses laterales: `void_titan`, `ash_colossus`, `storm_tyrant`, `grave_regent`, `dusk_reaver`, `soul_weaver`, `hex_archon`.


---

## Prompts assets de items - Forge Light

Fecha: 2026-04-28
Fuente: `src/data/items.js` (75 items). Referencias visuales: `uirefactor/Crafting.png` y `uirefactor/Mochila.png`.

Objetivo: generar un PNG RGBA por item para reemplazar placeholders SVG en Mochila/Crafting. Naming sugerido: `item_<id>.png`, por ejemplo `item_mind_lens.png`.

### Regla anti fondo falso

Usar esta instruccion en todos los pedidos:

```text
Export as PNG with real alpha transparency. The background must be actually transparent pixels. Do not draw a checkerboard, white, gray, black, paper, canvas, room, floor, glow plate, or square card behind the item. If the preview UI shows a checkerboard, that is acceptable only as transparency preview, but the checkerboard must not be rendered into the image itself.
```

Negative prompt comun para todos:

```text
white background, gray background, black background, checkerboard background, checker pattern rendered in image, fake transparency, square card, frame, border, UI, text, letters, watermark, logo, inventory slot, environment scene, table, floor, huge cast shadow, cropped item, multiple items, hand holding item, character wearing item, blurry, low contrast, cartoon, chibi, anime, flat vector
```

### Prompts individuales

#### worn_sword - Espada Desgastada

Archivo sugerido: `item_worn_sword.png`

Metadata: `common` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Espada Desgastada, old nicked iron sword with dull edge and repaired leather grip. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### crude_axe - Hacha Tosca

Archivo sugerido: `item_crude_axe.png`

Metadata: `common` / `weapon` / familia `axe`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hacha Tosca, rough wood-handled axe with asymmetrical iron head. a heavy battle axe or cleaver, broad axe head, brutal forged edge, handle visible. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### rusty_mace - Maza Oxidada

Archivo sugerido: `item_rusty_mace.png`

Metadata: `common` / `weapon` / familia `mace`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Maza Oxidada, rusted mace with pitted metal head and simple grip. a heavy mace, hammer, club or maul, weighted head, forged metal and worn grip. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### iron_dagger - Daga de Hierro

Archivo sugerido: `item_iron_dagger.png`

Metadata: `common` / `weapon` / familia `dagger`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Daga de Hierro, small iron dagger with worn triangular blade. a curved dagger or fang blade, compact lethal silhouette, sharp point, ornate grip. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### battered_club - Garrote Abollado

Archivo sugerido: `item_battered_club.png`

Metadata: `common` / `weapon` / familia `mace`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Garrote Abollado, battered iron-bound club, blunt and heavy. a heavy mace, hammer, club or maul, weighted head, forged metal and worn grip. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### chipped_blade - Hoja Mellada

Archivo sugerido: `item_chipped_blade.png`

Metadata: `common` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hoja Mellada, short chipped blade with broken edge and improvised guard. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### training_sword - Espada de Entrenamiento

Archivo sugerido: `item_training_sword.png`

Metadata: `common` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Espada de Entrenamiento, simple training sword with practical guard, worn but balanced. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### spiked_club - Garrote con Puas

Archivo sugerido: `item_spiked_club.png`

Metadata: `common` / `weapon` / familia `mace`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Garrote con Puas, club with iron spikes and brutal silhouette. a heavy mace, hammer, club or maul, weighted head, forged metal and worn grip. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### cracked_focus - Foco Agrietado

Archivo sugerido: `item_cracked_focus.png`

Metadata: `common` / `weapon` / familia `focus`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Foco Agrietado, cracked circular focus lens with faint inner light. a magical focus lens, orb, sigil or arcane hand artifact, circular glass/metal centerpiece. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### tattered_vest - Chaleco Raido

Archivo sugerido: `item_tattered_vest.png`

Metadata: `common` / `armor` / familia `vest`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Chaleco Raido, ragged defensive vest with stitched leather panels. a reinforced vest or light torso armor, leather and metal plates, compact torso silhouette. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### leather_padding - Acolchado de Cuero

Archivo sugerido: `item_leather_padding.png`

Metadata: `common` / `armor` / familia `leather`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Acolchado de Cuero, padded leather armor with layered straps. agile leather armor or padding, dark leather, straps, layered stealth silhouette. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### worn_chestplate - Peto Gastado

Archivo sugerido: `item_worn_chestplate.png`

Metadata: `common` / `armor` / familia `plate`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Peto Gastado, worn iron chestplate with scratches and dents. heavy plate chest armor or cuirass, broad shoulders, metal plates, central breastplate readable. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### basic_tunic - Tunica Reforzada

Archivo sugerido: `item_basic_tunic.png`

Metadata: `common` / `armor` / familia `wrap`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Tunica Reforzada, reinforced combat tunic with cloth wraps and small plates. mystic battle wraps or robe-like armor, cloth bands, reinforced runic textile silhouette. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### crude_mail - Cota Rustica

Archivo sugerido: `item_crude_mail.png`

Metadata: `common` / `armor` / familia `mail`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Cota Rustica, rough chainmail shirt with uneven rings. chainmail armor, linked metal texture, shoulder and torso silhouette. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### bone_vest - Chaleco de Hueso

Archivo sugerido: `item_bone_vest.png`

Metadata: `common` / `armor` / familia `spiked`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Chaleco de Hueso, bone-plated vest with primitive rib-like armor pieces. spiked armor or thorned defensive gear, visible spikes, aggressive silhouette. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### padded_wrap - Envolturas Acolchadas

Archivo sugerido: `item_padded_wrap.png`

Metadata: `common` / `armor` / familia `wrap`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Envolturas Acolchadas, padded cloth wraps for torso and shoulders. mystic battle wraps or robe-like armor, cloth bands, reinforced runic textile silhouette. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### iron_buckler - Rodela de Hierro

Archivo sugerido: `item_iron_buckler.png`

Metadata: `common` / `armor` / familia `buckler`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Rodela de Hierro, small round iron buckler shield with worn rim. a compact round buckler shield, central boss, metal rim, defensive item silhouette. low-tier worn practical item, dark iron, chipped edges, muted leather, minimal glow, still readable and premium. subtle steel and warm leather palette. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### sharpened_longsword - Mandoble Afilado

Archivo sugerido: `item_sharpened_longsword.png`

Metadata: `magic` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Mandoble Afilado, sharpened longsword with clean steel blade and faint blue edge. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### bloodied_axe - Hacha Ensangrentada

Archivo sugerido: `item_bloodied_axe.png`

Metadata: `magic` / `weapon` / familia `axe`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hacha Ensangrentada, blood-stained axe with dark red runes and jagged edge. a heavy battle axe or cleaver, broad axe head, brutal forged edge, handle visible. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### swift_blade - Hoja Veloz

Archivo sugerido: `item_swift_blade.png`

Metadata: `magic` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hoja Veloz, slender fast blade with wind-like blue streaks. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### executioners_pick - Pico del Ejecutor

Archivo sugerido: `item_executioners_pick.png`

Metadata: `magic` / `weapon` / familia `spear`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Pico del Ejecutor, executioner pick polearm head, cruel hook and spike. a spear, pick or polearm head with short visible shaft, vertical item silhouette. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### jagged_cleaver - Cuchilla Dentada

Archivo sugerido: `item_jagged_cleaver.png`

Metadata: `magic` / `weapon` / familia `axe`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Cuchilla Dentada, jagged cleaver axe with saw-like bite marks. a heavy battle axe or cleaver, broad axe head, brutal forged edge, handle visible. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### hunters_spear - Lanza del Cazador

Archivo sugerido: `item_hunters_spear.png`

Metadata: `magic` / `weapon` / familia `spear`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Lanza del Cazador, hunter spear with leather tassels and sharp leaf-shaped tip. a spear, pick or polearm head with short visible shaft, vertical item silhouette. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### runed_focus - Foco Rúnico

Archivo sugerido: `item_runed_focus.png`

Metadata: `magic` / `weapon` / familia `focus`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Foco Rúnico, rune-engraved arcane focus with glowing ring. a magical focus lens, orb, sigil or arcane hand artifact, circular glass/metal centerpiece. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### reinforced_breastplate - Coraza Reforzada

Archivo sugerido: `item_reinforced_breastplate.png`

Metadata: `magic` / `armor` / familia `plate`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Coraza Reforzada, reinforced breastplate with bronze bands. heavy plate chest armor or cuirass, broad shoulders, metal plates, central breastplate readable. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### ironwood_vest - Chaleco de Hierromadera

Archivo sugerido: `item_ironwood_vest.png`

Metadata: `magic` / `armor` / familia `vest`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Chaleco de Hierromadera, wood and iron reinforced vest, natural grain plus metal studs. a reinforced vest or light torso armor, leather and metal plates, compact torso silhouette. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### spiked_pauldrons - Hombreras con Puas

Archivo sugerido: `item_spiked_pauldrons.png`

Metadata: `magic` / `armor` / familia `spiked`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hombreras con Puas, spiked shoulder pauldrons, defensive thorn silhouette. spiked armor or thorned defensive gear, visible spikes, aggressive silhouette. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### fortress_wrap - Envolturas de Fortaleza

Archivo sugerido: `item_fortress_wrap.png`

Metadata: `magic` / `armor` / familia `wrap`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Envolturas de Fortaleza, fortress-like battle wraps with stone-gray plates and cloth bands. mystic battle wraps or robe-like armor, cloth bands, reinforced runic textile silhouette. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### warden_mail - Cota del Guardian

Archivo sugerido: `item_warden_mail.png`

Metadata: `magic` / `armor` / familia `mail`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Cota del Guardian, warden chainmail with blue ward sigil on chest. chainmail armor, linked metal texture, shoulder and torso silhouette. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### shadow_padding - Acolchado de las Sombras

Archivo sugerido: `item_shadow_padding.png`

Metadata: `magic` / `armor` / familia `leather`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Acolchado de las Sombras, shadowy leather padding with stealthy dark blue highlights. agile leather armor or padding, dark leather, straps, layered stealth silhouette. uncommon enchanted item, cleaner silhouette, subtle blue or green rune glow, polished metal accents, brighter than common but not overpowered. cool blue-green magical accent light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### warbringer_axe - Hacha Portaguerra

Archivo sugerido: `item_warbringer_axe.png`

Metadata: `rare` / `weapon` / familia `axe`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hacha Portaguerra, war axe with banner-like metal accents and battle-worn red detail. a heavy battle axe or cleaver, broad axe head, brutal forged edge, handle visible. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### bloodfang_blade - Hoja Colmillo de Sangre

Archivo sugerido: `item_bloodfang_blade.png`

Metadata: `rare` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hoja Colmillo de Sangre, bloodfang sword with fang-shaped guard and crimson core. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### stormstrike_hammer - Martillo del Golpe Tormentoso

Archivo sugerido: `item_stormstrike_hammer.png`

Metadata: `rare` / `weapon` / familia `mace`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Martillo del Golpe Tormentoso, storm hammer with blue lightning cracks in the head. a heavy mace, hammer, club or maul, weighted head, forged metal and worn grip. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### ravager_cleaver - Cuchilla Devastadora

Archivo sugerido: `item_ravager_cleaver.png`

Metadata: `rare` / `weapon` / familia `axe`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Cuchilla Devastadora, massive ravager cleaver with brutal chipped edge. a heavy battle axe or cleaver, broad axe head, brutal forged edge, handle visible. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### duskblade - Hoja del Crepusculo

Archivo sugerido: `item_duskblade.png`

Metadata: `rare` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hoja del Crepusculo, dark twilight blade with violet-blue glow along edge. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### mind_lens - Lente de la Mente

Archivo sugerido: `item_mind_lens.png`

Metadata: `rare` / `weapon` / familia `focus`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Lente de la Mente, ornate mind lens focus, blue glass eye in golden metal frame. a magical focus lens, orb, sigil or arcane hand artifact, circular glass/metal centerpiece. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### titanplate - Placa del Titan

Archivo sugerido: `item_titanplate.png`

Metadata: `rare` / `armor` / familia `plate`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Placa del Titan, titan plate armor, heavy broad golden-bronze breastplate. heavy plate chest armor or cuirass, broad shoulders, metal plates, central breastplate readable. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### thornwall_armor - Armadura Muro de Espinas

Archivo sugerido: `item_thornwall_armor.png`

Metadata: `rare` / `armor` / familia `spiked`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Armadura Muro de Espinas, thornwall armor with spikes and defensive brambles in metal. spiked armor or thorned defensive gear, visible spikes, aggressive silhouette. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### ironhide_mantle - Manto Piel de Hierro

Archivo sugerido: `item_ironhide_mantle.png`

Metadata: `rare` / `armor` / familia `plate`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Manto Piel de Hierro, ironhide mantle armor, dark fur collar and heavy iron torso. heavy plate chest armor or cuirass, broad shoulders, metal plates, central breastplate readable. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### shadowdancer_vest - Chaleco del Danzador Sombrio

Archivo sugerido: `item_shadowdancer_vest.png`

Metadata: `rare` / `armor` / familia `leather`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Chaleco del Danzador Sombrio, shadowdancer vest, elegant dark leather with subtle violet trim. agile leather armor or padding, dark leather, straps, layered stealth silhouette. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### bulwark_cuirass - Coraza Baluarte

Archivo sugerido: `item_bulwark_cuirass.png`

Metadata: `rare` / `armor` / familia `plate`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Coraza Baluarte, bulwark cuirass with shield motif and reinforced plate ribs. heavy plate chest armor or cuirass, broad shoulders, metal plates, central breastplate readable. high quality rare item, richer silhouette, blue arcane accents, bronze-gold trim, elegant readable material detail. blue arcane accent with bronze-gold trim. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### soulreaper_axe - Hacha Segadora de Almas

Archivo sugerido: `item_soulreaper_axe.png`

Metadata: `epic` / `weapon` / familia `axe`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hacha Segadora de Almas, soulreaper axe with ghostly blue-green soul flame on blade. a heavy battle axe or cleaver, broad axe head, brutal forged edge, handle visible. epic item, dramatic silhouette, vivid magical glow, strong rim light, premium fantasy crafting energy, ornate but readable. vivid violet, ember or soul-blue glow with strong rim light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### carnage_greatsword - Gran Espada de la Carniceria

Archivo sugerido: `item_carnage_greatsword.png`

Metadata: `epic` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Gran Espada de la Carniceria, huge carnage greatsword, red molten edge and black steel. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. epic item, dramatic silhouette, vivid magical glow, strong rim light, premium fantasy crafting energy, ornate but readable. vivid violet, ember or soul-blue glow with strong rim light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### berserker_cleaver - Cuchilla del Berserker

Archivo sugerido: `item_berserker_cleaver.png`

Metadata: `epic` / `weapon` / familia `axe`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Cuchilla del Berserker, berserker cleaver axe, savage heavy blade, ember cracks. a heavy battle axe or cleaver, broad axe head, brutal forged edge, handle visible. epic item, dramatic silhouette, vivid magical glow, strong rim light, premium fantasy crafting energy, ornate but readable. vivid violet, ember or soul-blue glow with strong rim light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### relic_warblade - Hoja Reliquia de Guerra

Archivo sugerido: `item_relic_warblade.png`

Metadata: `epic` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hoja Reliquia de Guerra, ancient relic warblade, gold runes and polished battle steel. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. epic item, dramatic silhouette, vivid magical glow, strong rim light, premium fantasy crafting energy, ornate but readable. vivid violet, ember or soul-blue glow with strong rim light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### starcall_focus - Foco de la Llamada Estelar

Archivo sugerido: `item_starcall_focus.png`

Metadata: `epic` / `weapon` / familia `focus`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Foco de la Llamada Estelar, starcall focus, celestial orb and ring artifact, star sparks. a magical focus lens, orb, sigil or arcane hand artifact, circular glass/metal centerpiece. epic item, dramatic silhouette, vivid magical glow, strong rim light, premium fantasy crafting energy, ornate but readable. vivid violet, ember or soul-blue glow with strong rim light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### juggernaut_plate - Placa del Juggernaut

Archivo sugerido: `item_juggernaut_plate.png`

Metadata: `epic` / `armor` / familia `plate`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Placa del Juggernaut, juggernaut plate armor, massive shield-like front and heavy shoulders. heavy plate chest armor or cuirass, broad shoulders, metal plates, central breastplate readable. epic item, dramatic silhouette, vivid magical glow, strong rim light, premium fantasy crafting energy, ornate but readable. vivid violet, ember or soul-blue glow with strong rim light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### abyssal_fortress - Fortaleza Abisal

Archivo sugerido: `item_abyssal_fortress.png`

Metadata: `epic` / `armor` / familia `spiked`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Fortaleza Abisal, abyssal fortress armor, spiked dark armor with purple abyss glow. spiked armor or thorned defensive gear, visible spikes, aggressive silhouette. epic item, dramatic silhouette, vivid magical glow, strong rim light, premium fantasy crafting energy, ornate but readable. vivid violet, ember or soul-blue glow with strong rim light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### wraithbound_shroud - Sudario Ligado a Espectros

Archivo sugerido: `item_wraithbound_shroud.png`

Metadata: `epic` / `armor` / familia `shroud`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Sudario Ligado a Espectros, wraithbound shroud, spectral cloak armor with ghostly blue edges. dark shroud armor or spectral mantle, layered cloak-like torso piece, occult fabric and metal trims. epic item, dramatic silhouette, vivid magical glow, strong rim light, premium fantasy crafting energy, ornate but readable. vivid violet, ember or soul-blue glow with strong rim light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### warlord_cuirass - Coraza del Senor de la Guerra

Archivo sugerido: `item_warlord_cuirass.png`

Metadata: `epic` / `armor` / familia `plate`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Coraza del Senor de la Guerra, warlord cuirass, commanding heavy armor with red-gold battle marks. heavy plate chest armor or cuirass, broad shoulders, metal plates, central breastplate readable. epic item, dramatic silhouette, vivid magical glow, strong rim light, premium fantasy crafting energy, ornate but readable. vivid violet, ember or soul-blue glow with strong rim light. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### godslayer_blade - Hoja Asesina de Dioses

Archivo sugerido: `item_godslayer_blade.png`

Metadata: `legendary` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Hoja Asesina de Dioses, godslayer blade, iconic divine-killer sword with radiant gold edge and dark core. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### doom_harbinger - Heraldo de la Condena

Archivo sugerido: `item_doom_harbinger.png`

Metadata: `legendary` / `weapon` / familia `mace`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Heraldo de la Condena, doom harbinger mace, apocalyptic black-gold hammer with ominous ember aura. a heavy mace, hammer, club or maul, weighted head, forged metal and worn grip. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### warlord_chainaxe - Cadena del Warlord

Archivo sugerido: `item_warlord_chainaxe.png`

Metadata: `legendary` / `weapon` / familia `axe`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Cadena del Warlord, warlord chainaxe, chained axe weapon with brutal red warlord sigils. a heavy battle axe or cleaver, broad axe head, brutal forged edge, handle visible. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### matriarch_fang - Colmillo de la Matriarca

Archivo sugerido: `item_matriarch_fang.png`

Metadata: `legendary` / `weapon` / familia `dagger`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Colmillo de la Matriarca, matriarch fang dagger, organic demonic fang blade with crimson venom glow. a curved dagger or fang blade, compact lethal silhouette, sharp point, ornate grip. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### sentinel_core_mace - Nucleo del Centinela

Archivo sugerido: `item_sentinel_core_mace.png`

Metadata: `legendary` / `weapon` / familia `mace`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Nucleo del Centinela, sentinel core mace, construct core hammer with blue mechanical energy. a heavy mace, hammer, club or maul, weighted head, forged metal and worn grip. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### warlord_signal_blade - Senal del Warlord

Archivo sugerido: `item_warlord_signal_blade.png`

Metadata: `legendary` / `weapon` / familia `sword`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Senal del Warlord, warlord signal blade, sword with banner-like guard and command sigil glow. a one-handed or two-handed sword blade, sharp central silhouette, guard and pommel visible. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### crimson_feast_fang - Fauces del Banquete

Archivo sugerido: `item_crimson_feast_fang.png`

Metadata: `legendary` / `weapon` / familia `dagger`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Fauces del Banquete, crimson feast fang dagger, blood-red ornate fang with vampiric sheen. a curved dagger or fang blade, compact lethal silhouette, sharp point, ornate grip. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### anchorbreaker_maul - Maul Rompeanclas

Archivo sugerido: `item_anchorbreaker_maul.png`

Metadata: `legendary` / `weapon` / familia `mace`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Maul Rompeanclas, anchorbreaker maul, massive oceanic maul with broken anchor silhouette. a heavy mace, hammer, club or maul, weighted head, forged metal and worn grip. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### eternal_titan_plate - Placa del Titan Eterno

Archivo sugerido: `item_eternal_titan_plate.png`

Metadata: `legendary` / `armor` / familia `plate`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Placa del Titan Eterno, eternal titan plate, ancient colossal armor chest with golden titan lines. heavy plate chest armor or cuirass, broad shoulders, metal plates, central breastplate readable. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### void_sovereign_shroud - Sudario del Soberano del Vacio

Archivo sugerido: `item_void_sovereign_shroud.png`

Metadata: `legendary` / `armor` / familia `shroud`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Sudario del Soberano del Vacio, void sovereign shroud, regal dark mantle armor with violet void crown motif. dark shroud armor or spectral mantle, layered cloak-like torso piece, occult fabric and metal trims. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### citadel_mail - Cota de la Ciudadela

Archivo sugerido: `item_citadel_mail.png`

Metadata: `legendary` / `armor` / familia `mail`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Cota de la Ciudadela, citadel mail, fortress chainmail armor with gold citadel emblem. chainmail armor, linked metal texture, shoulder and torso silhouette. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### last_oath_bulwark - Baluarte del Ultimo Juramento

Archivo sugerido: `item_last_oath_bulwark.png`

Metadata: `legendary` / `armor` / familia `plate`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Baluarte del Ultimo Juramento, last oath bulwark, oathbound plate armor with shield crest and solemn gold light. heavy plate chest armor or cuirass, broad shoulders, metal plates, central breastplate readable. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### void_titan_mantle - Manto del Titan del Vacio

Archivo sugerido: `item_void_titan_mantle.png`

Metadata: `legendary` / `armor` / familia `shroud`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Manto del Titan del Vacio, void titan mantle, immense dark mantle armor with cosmic purple cracks. dark shroud armor or spectral mantle, layered cloak-like torso piece, occult fabric and metal trims. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### eclipse_wand - Vara del Eclipse

Archivo sugerido: `item_eclipse_wand.png`

Metadata: `legendary` / `weapon` / familia `wand`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Vara del Eclipse, eclipse wand, black-gold wand with small eclipsed sun disk at top. a wand, rod or magical spire, vertical slim artifact with crystal or glowing tip. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### resonance_spire - Aguja Resonante

Archivo sugerido: `item_resonance_spire.png`

Metadata: `legendary` / `weapon` / familia `wand`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Aguja Resonante, resonance spire wand, tall crystalline spire rod with harmonic blue rings. a wand, rod or magical spire, vertical slim artifact with crystal or glowing tip. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### chaos_prism_rod - Vara Prisma del Caos

Archivo sugerido: `item_chaos_prism_rod.png`

Metadata: `legendary` / `weapon` / familia `wand`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Vara Prisma del Caos, chaos prism rod, prism-tipped rod with controlled multicolor arcane refractions. a wand, rod or magical spire, vertical slim artifact with crystal or glowing tip. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### astral_lens - Lente Astral

Archivo sugerido: `item_astral_lens.png`

Metadata: `legendary` / `weapon` / familia `focus`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Lente Astral, astral lens focus, cosmic glass lens with stars inside and gold frame. a magical focus lens, orb, sigil or arcane hand artifact, circular glass/metal centerpiece. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### cataclysm_wraps - Vestiduras del Cataclismo

Archivo sugerido: `item_cataclysm_wraps.png`

Metadata: `legendary` / `armor` / familia `wrap`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Vestiduras del Cataclismo, cataclysm wraps, fiery runic battle wraps with molten cloth edges. mystic battle wraps or robe-like armor, cloth bands, reinforced runic textile silhouette. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### control_lattice_shroud - Sudario de la Reticula

Archivo sugerido: `item_control_lattice_shroud.png`

Metadata: `legendary` / `armor` / familia `shroud`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Sudario de la Reticula, control lattice shroud, dark shroud with geometric blue control lattice lines. dark shroud armor or spectral mantle, layered cloak-like torso piece, occult fabric and metal trims. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### recursive_tapestry - Tapiz Recursivo

Archivo sugerido: `item_recursive_tapestry.png`

Metadata: `legendary` / `armor` / familia `shroud`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Tapiz Recursivo, recursive tapestry shroud, impossible woven cloak armor with looping gold sigils. dark shroud armor or spectral mantle, layered cloak-like torso piece, occult fabric and metal trims. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### deep_void_iris - Iris del Vacio Profundo

Archivo sugerido: `item_deep_void_iris.png`

Metadata: `legendary` / `weapon` / familia `focus`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Iris del Vacio Profundo, deep void iris focus, black-violet eye-like lens artifact with blue singularity center. a magical focus lens, orb, sigil or arcane hand artifact, circular glass/metal centerpiece. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### sanguine_contract - Contrato Sanguineo

Archivo sugerido: `item_sanguine_contract.png`

Metadata: `legendary` / `armor` / familia `wrap`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Contrato Sanguineo, sanguine contract wraps, crimson ritual cloth armor with sealed contract tags. mystic battle wraps or robe-like armor, cloth bands, reinforced runic textile silhouette. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### abyssal_resonator - Resonador Abisal

Archivo sugerido: `item_abyssal_resonator.png`

Metadata: `legendary` / `weapon` / familia `wand`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Resonador Abisal, abyssal resonator wand, abyssal tuning rod with purple resonating crystal. a wand, rod or magical spire, vertical slim artifact with crystal or glowing tip. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### eternal_archive - Archivo Eterno

Archivo sugerido: `item_eternal_archive.png`

Metadata: `legendary` / `armor` / familia `shroud`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Archivo Eterno, eternal archive shroud, archival cloak armor with floating scroll plates and gold seals. dark shroud armor or spectral mantle, layered cloak-like torso piece, occult fabric and metal trims. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```

#### bottomless_warcry - Clamor Sin Fondo

Archivo sugerido: `item_bottomless_warcry.png`

Metadata: `legendary` / `weapon` / familia `axe`

Prompt:

```text
Forge Light dark fantasy mobile RPG item asset, Clamor Sin Fondo, bottomless warcry axe, huge roaring axe with abyssal mouth-like blade and ember runes. a heavy battle axe or cleaver, broad axe head, brutal forged edge, handle visible. legendary chase item, iconic silhouette, intense controlled magical aura, gold/ember/violet highlights, masterwork artifact detail, visually unique and powerful. iconic gold, ember, crimson or void-violet aura with masterwork contrast. Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.
```
