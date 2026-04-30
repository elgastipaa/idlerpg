# Skill And Echo Icon Generation

Objetivo: generar iconos cuadrados para talentos de clase y nodos de Ecos/Prestige.

Fuentes:

- `src/data/talentTree.js`
- `src/data/talents.js`
- `src/data/prestige.js`
- `uirefactor/Talentos.png`
- `uirefactor/Ecos.png`
- `uirefactor/Iconos SVG.png`
- `uirefactor/skills_reference.png`

## Archivos

- `global-skill-icon-rules.md`: reglas comunes para talentos y Ecos.
- `class-talents.md`: 54 iconos de talentos visibles/conceptuales. Los sinks repetidos se colapsan en un solo icono por maestria.
- `echo-tree.md`: 56 iconos para nodos del arbol de Ecos/Prestige.

## Comandos

```bash
export OPENAI_API_KEY="tu_api_key"

npm run assets:skills:prepare
npm run assets:skills:talents -- --dry-run
npm run assets:skills:talents -- --reference "uirefactor/skills_reference.png"
npm run assets:skills:echoes -- --dry-run
npm run assets:skills:echoes -- --reference "uirefactor/skills_reference.png"
```

Salidas:

```text
public/assets/skills/talents/
public/assets/skills/echoes/
```

## Mantenimiento

No escribir estos prompts a mano. Hay demasiados IDs y el riesgo de drift es alto. El preparador automatico:

1. Lea `src/data/talentTree.js`, `src/data/talents.js` y `src/data/prestige.js`.
2. Genere `skills/class-talents.md` con los talentos activos por arbol.
3. Genere `skills/echo-tree.md` con nodos de `PRESTIGE_TREE_NODES`.
4. Agregue prompts a partir de `id`, `name`, `description`, `branch`, `segment` y `classId`.
5. Si cambia el arbol, correr `npm run assets:skills:prepare`.

Para gastar tokens con control, usar `--limit 12` en tandas chicas. Si un icono sale con borde, placa o fondo cuadrado, borrar solo ese PNG y volver a correr el comando; el generador saltea automaticamente los archivos que ya existen.

## Reglas visuales deseadas

- PNG 1024x1024 con alpha real.
- Icono rico sin UI, sin texto, sin borde, sin placa y sin fondo cuadrado.
- Leer a 32px.
- Mantener la paleta por familia:
  - Warrior: rojo, hierro, bronce.
  - Berserker: sangre, rojo, negro.
  - Juggernaut: verde, hierro, piedra.
  - Mage: violeta, azul, oro.
  - Sorcerer: violeta, fuego, prisma.
  - Arcanist: azul, runas, control.
  - War: rojo/dorado.
  - Bulwark: verde/teal.
  - Fortune: oro.
  - Sorcery: violeta.
  - Dominion: azul.
  - Forge: cyan/bronce.
  - Abyss: negro/violeta/gris.
