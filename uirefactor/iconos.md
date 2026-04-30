# Forge Light Icon Catalog

Fecha: 2026-04-27
Fuente visual primaria: `uirefactor/Iconos SVG.png`
Uso: catalogo canonico para generar y mantener iconos SVG del sistema Forge Light.

---

## 1. Rol del icon sheet

`Iconos SVG.png` define la direccion visual, categorias, siluetas y nombres esperados. No es un asset final de produccion.

Uso correcto:

- Traducir cada icono necesario a SVG limpio.
- Mantener nombres canonicos estables.
- Agrupar por categoria.
- Usar el mismo peso visual en bottom nav, acciones, recursos, estados y estaciones.
- Priorizar legibilidad en 20-24px.

No hacer:

- No usar el PNG como spritesheet final.
- No auto-vectorizar sin limpieza manual.
- No reemplazar iconos definidos por emojis.
- No crear estilos de icono distintos por pantalla.

---

## 2. Reglas SVG

Formato:

- Componentes React SVG inline.
- ViewBox base: `0 0 24 24`.
- Export recomendado: `ForgeIcon` con registry interno.
- Stroke/fill con `currentColor` cuando el icono sea lineal o monocromatico.
- Acentos multicolor permitidos para fuego, esencia, veneno, cristal, rareza y estados.

Legibilidad:

- El icono debe entenderse a 20px.
- El icono debe verse premium a 32-52px.
- Evitar detalles finos que desaparezcan en mobile.
- Silueta reconocible sin label.
- Contraste alto sobre fondo oscuro.

Estilo:

- Fantasy limpio.
- Marco oscuro si el componente lo requiere, no siempre dentro del SVG.
- Bordes dorados/bronze en el frame, no necesariamente en el icono.
- Volumen sutil con fills o strokes dobles solo si no ensucia.

---

## 3. Categorias del sheet

El sheet organiza iconos en:

1. Estados / efectos de combate.
2. Recursos principales.
3. Navegacion principal.
4. Acciones principales.
5. Estaciones del Santuario.
6. Misiones / encargos.
7. Varios / sistema.
8. Atributos / estadisticas.
9. Otros utiles.

---

## 4. Catalogo canonico

### 4.1 Estados y efectos de combate

| Nombre canonico | Alias UI | Uso | Color |
|---|---|---|---|
| `poison` | Veneno | Debuff, combat log, floating text | Verde toxico |
| `bleed` | Sangrado | Debuff y dano persistente | Rojo |
| `burn` | Quemadura | Debuff de fuego | Naranja/rojo |
| `mark` | Marca | Debuff objetivo | Violeta |
| `block` | Bloqueo | Defensa/mitigacion | Azul |
| `dodge` | Esquiva | Evasion | Cyan |
| `stun` | Aturdimiento | Control | Amarillo electrico |
| `corruption` | Corrupcion | Magia oscura | Violeta |
| `freeze` | Congelacion | Control frio | Azul hielo |
| `sacred` | Sagrado | Buff/divino | Dorado |

### 4.2 Recursos principales

| Nombre canonico | Alias UI | Uso | Color |
|---|---|---|---|
| `gold` | Oro | Moneda, costos, recompensas | Dorado |
| `essence` | Esencia | Recurso magico | Violeta |
| `xp` | Experiencia | Progreso de jugador | Violeta/dorado |
| `fire` | Fuego | Energia/fuego de forja | Rojo/naranja |
| `crystal` | Cristal | Material raro | Azul |
| `soul` | Alma | Recurso persistente | Verde |

### 4.3 Navegacion principal

| Nombre canonico | Alias UI | Uso | Notas |
|---|---|---|---|
| `combat` | Combate, Expedicion | Bottom nav, domain combat | Espadas cruzadas |
| `inventory` | Inventario, Equipo | Bottom nav o subnav | Mochila/equipo segun contexto |
| `sanctuary` | Santuario, Ciudad | Bottom nav home | Templo/ciudad, no castillo generico |
| `talents` | Talentos | Bottom nav, clase/arbol | Arbol verde/dorado |
| `shop` | Tienda | Bottom nav/utilidad | Puesto/cofre tienda |
| `more` | Mas | Bottom nav utilidades | Grid 2x2 |
| `hero` | Heroe | Bottom nav actual del juego | Casco/armadura |
| `echoes` | Ecos | Meta/progreso | Triangulo/sigil |

### 4.4 Acciones principales

| Nombre canonico | Alias UI | Uso |
|---|---|---|
| `upgrade` | Mejorar | Crafting, talentos, estaciones |
| `forge` | Forjar | Crafting/forja |
| `extract` | Extraer | Extraccion de items |
| `sell` | Vender | Inventario |
| `equip` | Equipar | Inventario/equipo |
| `compare` | Comparar | Items |
| `locked` | Bloqueado | Locks |
| `add` | Anadir | Nuevo job/slot |
| `claim` | Reclamar | Cofre/recompensa |
| `repeat` | Repetir | Repetir jobs |
| `back` | Volver | Navegacion atras |
| `fastForward` | Acelerar | Jobs en progreso |

### 4.5 Estaciones del Santuario

| Nombre canonico | Alias UI | Uso |
|---|---|---|
| `forgeStation` | Forja | Estacion, crafting |
| `workshop` | Taller | Estacion futura o crafting auxiliar |
| `laboratory` | Laboratorio | Research/transmutacion |
| `distillery` | Destileria | Esencias/liquidos |
| `library` | Biblioteca | Codex/conocimiento |
| `errands` | Encargos | Misiones paralelas |
| `sigilAltar` | Altar de Sigilos | Sigilos/permanentes |

### 4.6 Misiones y encargos

| Nombre canonico | Alias UI | Uso |
|---|---|---|
| `missions` | Misiones | Side action, jobs |
| `expedition` | Expedicion | Run/salida |
| `hunt` | Caceria | Eventos o contratos |
| `alchemy` | Alquimia | Destileria |
| `research` | Investigacion | Biblioteca/laboratorio |

### 4.7 Sistema

| Nombre canonico | Alias UI | Uso |
|---|---|---|
| `settings` | Ajustes | Configuracion |
| `mail` | Correo | Mensajes |
| `loot` | Botin | Recompensas |
| `daily` | Diario | Misiones diarias |
| `achievements` | Logros | Logros |
| `menu` | Menu | Hamburger global |

### 4.8 Atributos y estadisticas

| Nombre canonico | Alias UI | Uso |
|---|---|---|
| `damage` | Dano | Stats |
| `life` | Vida | HP |
| `defense` | Defensa | Defensa |
| `speed` | Velocidad | Attack speed/move |
| `critical` | Critico | Crit chance/damage |
| `precision` | Precision | Accuracy |
| `resistance` | Resistencia | Resist |
| `survival` | Supervivencia | Sustento |

### 4.9 Otros utiles

| Nombre canonico | Alias UI | Uso |
|---|---|---|
| `time` | Tiempo | Timers |
| `energy` | Energia | Energia/recarga |
| `rank` | Rango | Ranking |
| `tier` | Tier | Expedicion |
| `boss` | Jefe | Boss |
| `unknown` | Desconocido | Placeholder |

---

## 5. Prioridad de generacion SVG

Primero:

- `sanctuary`, `combat`, `hero`, `talents`, `more`, `shop`.
- `gold`, `essence`, `fire`, `xp`.
- `claim`, `repeat`, `upgrade`, `forge`, `locked`, `add`, `back`.
- `laboratory`, `distillery`, `library`, `errands`, `sigilAltar`, `forgeStation`.

Despues:

- Combat statuses.
- Stats.
- Sistema.
- Misiones secundarias.

---

## 6. Mapeo sugerido de archivos

Opcion simple inicial:

- `src/components/icons/ForgeIcon.jsx`

Opcion escalable:

- `src/components/icons/ForgeIcon.jsx`
- `src/components/icons/forgeIconRegistry.js`
- `src/components/icons/ResourceIcons.jsx`
- `src/components/icons/NavIcons.jsx`
- `src/components/icons/ActionIcons.jsx`
- `src/components/icons/StationIcons.jsx`
- `src/components/icons/StatusIcons.jsx`
- `src/components/icons/StatIcons.jsx`

Regla:

- Empezar simple con `ForgeIcon.jsx`.
- Separar archivos cuando el registry sea dificil de leer o cuando varias pantallas ya dependan de la libreria.
