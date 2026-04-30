# Plan para generar `uirefactor/design.md`

Fecha: 2026-04-27
Estado: plan operativo
Objetivo: definir como producir un `uirefactor/design.md` suficientemente especifico para recrear las capturas Forge Light con alta fidelidad, sin depender de "mas o menos" ni de interpretaciones sueltas.

---

## 1. Objetivo del documento final

`uirefactor/design.md` debe ser la fuente de verdad visual del redisenio Forge Light.

El resultado esperado no es un moodboard ni una descripcion estetica. Debe ser un contrato de implementacion que permita que otra IA, o una persona, reconstruya el sistema visual aunque no tenga las imagenes abiertas.

Debe permitir responder con precision:

- Que colores usar y en que rol.
- Cuando usar dorado fuerte, dorado sutil, gris oscuro, verde, azul, rojo o violeta.
- Como se construyen header, bottom nav, cards, filas, botones, chips, barras, icon frames, badges y overlays.
- Como se diferencian estados: activo, inactivo, bloqueado, listo, en progreso, seleccionado, hover, pressed, disabled.
- Como se traduce el icon sheet `Iconos SVG.png` a una libreria SVG consistente.
- Como se ve cada pantalla objetivo: `Crafting`, `Santuario`, `Combat`, `Talentos`.
- Que reglas no se pueden romper para no perder el estilo Forge Light.

---

## 2. Fuentes y prioridad

### 2.1 Fuente primaria absoluta

Estas fuentes mandan sobre cualquier texto previo:

1. `uirefactor/Crafting.png`
2. `uirefactor/Santuario.png`
3. `uirefactor/Combat.png`
4. `uirefactor/Talentos.png`
5. `uirefactor/Iconos SVG.png`

Regla: si un documento dice algo que contradice una captura, gana la captura.

### 2.2 Fuentes secundarias

Estas fuentes se usan para acelerar analisis, detectar detalles y proponer estructura, pero no son autoridad final:

1. `uirefactor/DESIGN_1.md`
2. `uirefactor/plan_1.md`

Uso esperado:

- `DESIGN_1.md`: aprovechar inventario de patrones, nombres de componentes, tokens sugeridos y observaciones por pantalla.
- `plan_1.md`: usar como guia de secciones minimas y como recordatorio de problemas que ya vimos: exceso de dorado, exceso de gris, falta de jerarquia, botones indistinguibles.

### 2.3 Fuentes de contexto, no de direccion visual

Estas fuentes pueden ayudar a no romper la app real, pero no definen la estetica:

- `src/components/Crafting.jsx`
- `src/components/Sanctuary.jsx`
- `src/components/Combat.jsx`
- `src/components/Talents.jsx`
- `src/App.jsx`
- `src/styles/tokens.css`
- `src/styles/responsive.css`
- `src/styles/forge-light.css`
- `design.md` actual del repo

Uso esperado:

- Extraer nombres reales de acciones, estados y pantallas.
- Detectar que componentes existen hoy.
- Evitar que el design system pida layouts imposibles para la logica actual.
- Separar decisiones visuales nuevas de deuda legacy.

### 2.4 Fuentes excluidas

No usar `stitch/` como fuente visual ni como direccion de estilo.

Regla: si aparece una idea de Stitch, solo puede usarse como anti-patron o como referencia tecnica de deuda a evitar. No debe entrar al `design.md` como estetica objetivo.

---

## 3. Principio rector

El documento final se genera desde evidencia visual, no desde preferencias.

Cada regla importante del `design.md` debe poder rastrearse a una de estas bases:

- Se ve repetida en 2 o mas capturas.
- Se ve de forma clara en 1 captura y es central para esa pantalla.
- Sale del icon sheet y define iconografia.
- Sale del codigo actual porque es una restriccion funcional real.
- Sale de `DESIGN_1.md` o `plan_1.md` y fue validada contra capturas.

Evitar frases vagas como:

- "usar dorado lindo"
- "hacer cards premium"
- "dar mas profundidad"
- "parecido a la captura"

Reemplazarlas por reglas verificables:

- "El boton activo de bottom nav usa outline dorado, glow central y diamante superior centrado."
- "Los botones primarios usan fill dorado solo para acciones de alto valor inmediato."
- "Las filas de Santuario tienen icon frame a la izquierda, contenido al centro y accion alineada a la derecha."

---

## 4. Herramientas a usar

### 4.1 Inspeccion visual directa

Usar visualizacion de imagenes para analizar las capturas completas y, si hace falta, crops por zonas.

Pasadas visuales obligatorias:

1. Vista completa por pantalla.
2. Header global.
3. Bottom nav.
4. Paneles y cards.
5. Botones y CTAs.
6. Iconos y marcos.
7. Estados visuales.
8. Densidad mobile.

El objetivo no es describir "lo que hay", sino convertirlo en reglas reutilizables.

### 4.2 Metadatos y medicion

Usar comandos locales para confirmar:

```bash
file uirefactor/Crafting.png uirefactor/Santuario.png uirefactor/Combat.png uirefactor/Talentos.png "uirefactor/Iconos SVG.png"
```

Datos ya detectados:

- `Crafting.png`: 941 x 1672
- `Santuario.png`: 1024 x 1536
- `Combat.png`: 1024 x 1536
- `Talentos.png`: 1024 x 1536
- `Iconos SVG.png`: 1536 x 1024

Si hace falta mas precision:

- Usar ImageMagick si esta disponible para crop, sampleo y comparacion.
- Usar `python` solo si una medicion de imagen lo justifica y no hay herramienta shell simple.
- Extraer colores dominantes por zonas, no de la imagen completa, porque fondos ilustrados contaminan la paleta.

Zonas utiles para sampleo:

- Fondos oscuros de paneles.
- Bordes dorados de cards.
- Fill de boton principal.
- Glow dorado de bottom nav.
- Verde de success.
- Azul de progreso.
- Rojo de peligro/badge.
- Violeta de esencia/epico.

### 4.3 Lectura de documentos previos

Leer `uirefactor/DESIGN_1.md` y `uirefactor/plan_1.md` con una matriz de decision:

| Tipo de afirmacion | Accion |
|---|---|
| Coincide con capturas | Adoptar y reescribir con precision |
| Parcialmente coincide | Ajustar y marcar condicion |
| Contradice capturas | Descartar |
| Es implementacion util pero no visual | Mover a notas de implementacion |
| Es opinion generica | No incluir |

### 4.4 Lectura del codigo actual

Usar `rg` para identificar componentes, estados y labels reales:

```bash
rg -n "Santuario|Forjar|Talentos|Combate|Reclamar|ABRIR|bloquead|locked|progress|claim|repeat" src
```

Objetivo:

- No inventar flujos nuevos.
- Mantener textos funcionales cuando correspondan.
- Detectar que estados existen en la app y deben tener especificacion visual.
- Alinear nombres del `design.md` con nombres del proyecto.

### 4.5 Icon sheet como especificacion visual

`uirefactor/Iconos SVG.png` no debe tratarse como asset final.

Uso correcto:

- Es la referencia visual para crear iconos SVG semanticos.
- Define silueta, peso, estilo, categorias, contraste y nombres esperados.
- Debe convertirse en un catalogo de iconos del `design.md`.

No hacer:

- No copiar el raster como spritesheet de produccion.
- No auto-vectorizar sin criterio, porque genera SVG sucio y dificil de mantener.
- No usar emojis como reemplazo final si el icon sheet ya define un simbolo.

Uso esperado para SVG:

- Crear iconos manuales o semi-manuales en SVG limpio.
- ViewBox base: `24 24`.
- Stroke/fill controlable con `currentColor` cuando sea posible.
- Soportar tamanios 16, 20, 24, 28, 32, 40 y 52 sin perder legibilidad.
- Mantener una silueta legible en mobile.
- Separar categorias: recursos, nav, acciones, estaciones, estados, stats, sistema.

---

## 5. Pipeline de trabajo

### Fase 0: Preflight

Objetivo: preparar fuentes y evitar mezclar direcciones.

Acciones:

1. Confirmar que existen las 4 capturas y el icon sheet.
2. Confirmar dimensiones de imagen.
3. Leer `DESIGN_1.md` y `plan_1.md`.
4. Revisar si existe `uirefactor/design.md`.
5. Confirmar que `stitch/` no se usa como input.
6. Crear una lista de conflictos potenciales antes de redactar.

Salida:

- Inventario de fuentes.
- Lista de reglas de prioridad.
- Lista inicial de secciones del documento final.

### Fase 1: Extraccion visual por pantalla

Objetivo: convertir cada captura en una ficha tecnica.

Crear una ficha por pantalla con esta estructura:

```md
## Pantalla: Nombre

### Rol funcional

### Anatomia visible

### Jerarquia de lectura

### Layout y densidad

### Componentes visibles

### Estados visibles

### Iconos usados

### Colores observados

### Reglas especificas de esta pantalla

### Detalles criticos que no se deben perder

### Riesgos de mala implementacion
```

#### Crafting

Aspectos a extraer:

- Header global con avatar, recursos y menu.
- Titulo `FORJAR` con back, info y modulo de entropia.
- Tabs de crafting: mejorar, refinar, extraer, transmutar.
- Card de item epico con marco dorado/violeta, estrella, nivel y poder.
- Panel central de resultado con glow verde, comparacion `+12` a `+13`, poder y efecto de exito.
- Panel lateral de material, probabilidad y costo.
- Slider de mejora con hitos y marcador actual.
- Comparacion de estadisticas actual vs nueva.
- CTA principal `MEJORAR` con costo.
- Boton secundario `MEJORA MAXIMA`.
- Checkbox/toggle utilitario.
- Banner inferior de resultado.
- Bottom nav activo con glow central y diamante.

Detalles criticos:

- El dorado fuerte concentra la accion principal y el progreso de mejora.
- El verde aparece como success real, no como decoracion.
- La pantalla es densa pero ordenada por bloques horizontales.
- El item card tiene identidad de rareza y no debe parecer una card generica.

#### Santuario

Aspectos a extraer:

- Header global con variante de recursos etiquetados.
- Titulo grande `SANTUARIO`.
- Boton cuadrado de modo en esquina superior derecha del panel.
- Seccion `TRABAJOS` con contador de listos/corriendo.
- Boton `Todo + repetir`.
- Job listo con icon frame circular, punto verde, texto success, recompensas y boton `RECLAMAR`.
- Job en progreso con aro azul, tiempo restante y barra.
- Row `Anadir trabajo`.
- Seccion `ESTACIONES` con subtitulo.
- Filas de estaciones con icono ilustrado, nombre, descripcion, estado y boton `ABRIR`.
- Estados bloqueados con rojo y requisito.
- CTA `VOLVER A EXPEDICION`.
- Bottom nav con badge de Santuario, Expedicion y Heroe.

Detalles criticos:

- Santuario usa bordes dorados y ornamentacion clara; no debe virarse a gris generico.
- El dorado es identidad estructural y de accion, pero la legibilidad depende de fondos muy oscuros.
- Las acciones de fila deben quedar alineadas a la derecha.
- `RECLAMAR`, `ABRIR` y `VOLVER A EXPEDICION` no pueden parecer botones planos.
- Los iconos de estaciones son parte central de la personalidad.

#### Combat

Aspectos a extraer:

- Fondo ilustrado como escenario principal.
- Header global.
- Side buttons izquierda y derecha con iconos, labels y badges.
- Tier, zona y barra de progreso superior con nodos.
- Enemy panel: nombre, HP, porcentaje y estados/debuffs.
- Floating combat text con tamanios, colores y jerarquia.
- Player combat panel con avatar, HP, mana/energia y skill cooldowns.
- Control `AUTO` y velocidad.
- Stats summary.
- Resources per minute.
- Combat log.
- Bottom nav activo en combate.

Detalles criticos:

- Combat no es una pantalla de cards; el escenario es protagonista.
- La UI se superpone al arte sin perder legibilidad.
- Los numeros flotantes tienen jerarquia: critico, dano normal, veneno, curacion.
- Los side buttons deben sentirse como accesos RPG, no como botones web.

#### Talentos

Aspectos a extraer:

- Header global.
- Titulo `TALENTOS`, TP y reiniciar.
- Panel de arbol actual.
- Seccion `ARTES DE GUERRA`, filtros y contador de nodos.
- Grid por categorias: basicos, ofensivos, defensivos, supervivencia.
- Nodos con icon frame, conectores, estado comprable, bloqueado, disponible y comprado.
- Panel de detalle del talento seleccionado.
- Requisitos y boton `COMPRAR`.
- Selector de clases.
- Bottom nav activo en talentos.

Detalles criticos:

- El arbol visual se basa en iconos y conectores, no en listas planas.
- Los nodos comprables brillan mas y usan color semantico por categoria.
- El panel de detalle debe explicar la decision sin competir con el arbol.
- Los locks de clases/nodos deben ser claros pero no dominar.

Salida de Fase 1:

- Cuatro fichas visuales completas.
- Lista de patrones compartidos.
- Lista de reglas especificas por pantalla.

### Fase 2: Extraccion del sistema compartido

Objetivo: abstraer lo comun sin borrar diferencias entre pantallas.

Secciones a derivar:

1. Filosofia visual.
2. Sistema de capas.
3. Paleta por roles.
4. Tipografia.
5. Espaciado y densidad.
6. Geometria y ornamentacion.
7. Sombra, glow y profundidad.
8. Iconografia.
9. Componentes base.
10. Estados y feedback.
11. Reglas de dorado.
12. Reglas de mobile.

Regla clave:

El sistema debe explicar por que `Santuario`, `Crafting`, `Combat` y `Talentos` se sienten del mismo universo aunque tengan layouts distintos.

### Fase 3: Reconciliacion de documentos previos

Objetivo: usar `DESIGN_1.md` y `plan_1.md` sin copiar errores.

Proceso:

1. Extraer de `DESIGN_1.md` las secciones que ya tienen detalle util:
   - Header.
   - Bottom nav.
   - Cards/paneles.
   - Botones.
   - Pantallas especificas.
   - Iconos de recursos.
   - Animaciones.
2. Comparar cada seccion contra capturas.
3. Ajustar tono si el documento exagera:
   - Si dice "maximalista" pero la captura se sostiene por claridad, reescribir como "dark fantasy premium, denso y legible".
   - Si dice que todo debe tener borde dorado fuerte, matizar por jerarquia.
   - Si dice que el dorado solo va en CTAs y la captura muestra marcos dorados estructurales, corregir.
4. Usar `plan_1.md` como checklist de secciones obligatorias.
5. Eliminar contradicciones antes de redactar el `design.md`.

Salida:

- Matriz Adoptar/Ajustar/Descartar.
- Lista de decisiones finales.

### Fase 4: Catalogo de iconos desde `Iconos SVG.png`

Objetivo: convertir el icon sheet en reglas y nombres implementables.

El `design.md` debe incluir un catalogo con estas categorias:

1. Estados / efectos de combate.
2. Recursos principales.
3. Navegacion principal.
4. Acciones principales.
5. Estaciones del Santuario.
6. Misiones / encargos.
7. Varios / sistema.
8. Atributos / estadisticas.
9. Otros utiles.

Para cada icono documentar:

```md
| Nombre canonico | Alias UI | Categoria | Uso | Tamanios | Color base | Estado activo | Notas |
```

Ejemplo:

```md
| `sanctuary` | Santuario, Ciudad | Nav | Bottom nav, acceso home | 24, 28, 32 | dorado/stone | glow dorado + diamante si activo | Edificio/templo, no castillo generico |
```

Reglas SVG:

- Nombre semantico estable: `combat`, `inventory`, `sanctuary`, `talents`, `shop`, etc.
- No atar nombres a un unico componente si se reutilizan.
- Usar `currentColor` para line art cuando se pueda.
- Permitir acentos internos por variante si el icono lo necesita: fuego, esencia, veneno, success.
- Evitar detalles finos que desaparezcan a 20px.
- Mantener contraste alto sobre fondo oscuro.
- Los iconos de nav deben tener silueta reconocible sin texto.

Salida:

- Seccion `Iconografia` en `uirefactor/design.md`.
- Tabla de mapeo icono -> uso.
- Reglas para generar futuros SVG.

### Fase 5: Definicion de componentes canonicos

Objetivo: que el `design.md` describa componentes, no solo pantallas.

Componentes minimos:

1. `AppHeader`
2. `ResourcePill`
3. `MenuButton`
4. `BottomNav`
5. `NavButton`
6. `Panel`
7. `SectionHeader`
8. `SurfaceRow`
9. `IconFrame`
10. `ActionButton`
11. `StatusChip`
12. `ProgressBar`
13. `RewardRow`
14. `StatComparison`
15. `TalentNode`
16. `SideActionButton`
17. `CombatFloatingText`
18. `OverlayShell`

Cada componente debe documentar:

```md
### Nombre

Uso:
Estructura:
Dimensiones:
Color:
Borde:
Radio:
Sombra/glow:
Tipografia:
Iconos:
Estados:
Mobile:
Errores comunes:
Ejemplos de uso:
```

Regla: si una pantalla usa un patron mas de una vez, debe convertirse en componente canonico o variante documentada.

### Fase 6: Reglas de color y dorado

Objetivo: resolver el problema mas delicado del estilo.

El documento final debe evitar dos fallos:

- Demasiado dorado: todo compite, se pierde jerarquia.
- Demasiado gris: se pierde Forge Light y se vuelve dark UI generica.

El `design.md` debe distinguir:

1. Dorado estructural:
   - Marcos principales.
   - Bottom nav activo.
   - Separadores ornamentales.
   - Titulos importantes.

2. Dorado de accion:
   - Botones primarios.
   - CTA de progreso.
   - Claim, mejorar, comprar, volver cuando sea accion principal de pantalla.

3. Dorado de valor:
   - Oro.
   - Costos.
   - Hitos.
   - Nivel o poder destacado.

4. Dorado sutil:
   - Bordes secundarios.
   - Divisores.
   - Hover.
   - Ornamentos.

5. Donde no usar dorado fuerte:
   - Texto largo.
   - Todas las cards repetidas con la misma intensidad.
   - Estados success/progress/danger que ya tienen color semantico.
   - Botones utilitarios de bajo valor.

El documento debe incluir ejemplos correctos e incorrectos.

### Fase 7: Redaccion de `uirefactor/design.md`

Estructura propuesta:

```md
# Forge Light Design System

## 1. Alcance y fuentes
## 2. Filosofia visual
## 3. Principios de reconstruccion
## 4. Sistema de capas
## 5. Color y tokens
## 6. Reglas de dorado
## 7. Tipografia
## 8. Espaciado, densidad y responsive
## 9. Geometria, bordes y ornamentacion
## 10. Sombra, glow y profundidad
## 11. Iconografia y SVG
## 12. Componentes canonicos
## 13. Estados visuales y feedback
## 14. Screen contract: Crafting
## 15. Screen contract: Santuario
## 16. Screen contract: Combat
## 17. Screen contract: Talentos
## 18. Game feel compatible
## 19. Implementacion recomendada en React/CSS
## 20. Anti-patrones
## 21. Checklist de validacion
## 22. Glosario de tokens y nombres
```

Cada screen contract debe incluir:

- Captura fuente.
- Rol de pantalla.
- Jerarquia de lectura.
- Estructura de layout.
- Componentes usados.
- Estados visibles.
- Iconos requeridos.
- Reglas especificas.
- Detalles criticos para fidelidad.
- Checklist visual.

### Fase 8: Validacion del documento

Objetivo: asegurar que el `design.md` permite recrear capturas, no solo inspirarse.

Checklist global:

- Cada color importante tiene rol, no solo hex.
- Cada componente tiene estados.
- Cada pantalla tiene estructura completa.
- Cada icono visible importante tiene nombre y uso.
- Las reglas de dorado resuelven exceso y falta de identidad.
- No hay menciones a Stitch como fuente visual.
- No se inventan pantallas nuevas.
- No se cambian flujos funcionales.
- Las diferencias entre capturas quedan documentadas como variantes, no como contradicciones ocultas.
- Una IA podria implementar una primera version sin abrir las capturas.

Checklist de fidelidad:

- Header comparable en las 4 capturas.
- Bottom nav comparable en activo, badges, glow y diamante.
- Santuario conserva rows, iconos grandes, botones alineados y marcos dorados.
- Crafting conserva item hero card, entropia, slider, stat comparison y CTA central.
- Combat conserva escenario protagonista, side actions, floating text y combat log.
- Talentos conserva grid de nodos, categorias, detalle y selector de clases.

Prueba recomendada:

1. Dar solo `uirefactor/design.md` a una IA implementadora.
2. Pedirle que reconstruya una pantalla sin ver imagenes.
3. Comparar contra captura.
4. Marcar gaps.
5. Actualizar `design.md` hasta que los gaps sean de ejecucion, no de especificacion.

---

## 6. Manejo de conflictos

### 6.1 Conflicto: capturas tienen bottom nav con labels distintos

Las capturas muestran sets de tabs que no son perfectamente iguales.

Resolucion propuesta:

- Documentar el patron visual de bottom nav como sistema global.
- Separar el patron visual de los labels exactos.
- Para implementacion en el juego actual, usar los dominios reales de la app.
- Si una captura usa otro label, tratarlo como variante de mock, no como fuente funcional.

### 6.2 Conflicto: dorado como identidad vs dorado como exceso

Resolucion propuesta:

- No eliminar dorado.
- No convertir todas las superficies en dorado.
- Mantener marcos, ornamentacion y acciones con dorado, pero graduar intensidad.
- Usar fondos oscuros para que el dorado tenga contraste sin saturar.

### 6.3 Conflicto: documentos previos hablan de "maximalista"

Resolucion propuesta:

- El estilo es denso y fantasy, pero debe seguir siendo legible.
- Reescribir como "dark fantasy premium, alto contraste, mobile-first, con ornamentacion controlada".
- No usar "maximalista" como permiso para llenar todo de efectos.

### 6.4 Conflicto: icon sheet muestra mas iconos que los necesarios hoy

Resolucion propuesta:

- Documentar todos los grupos del sheet.
- Priorizar iconos usados por las 4 pantallas.
- Marcar otros como backlog del sistema, no bloquear `design.md`.

---

## 7. Nivel de detalle esperado

`uirefactor/design.md` debe ser largo si hace falta.

Reglas de calidad:

- Mejor especifico que corto.
- Mejor repetir una regla critica en contexto que dejarla ambigua.
- Mejor incluir ejemplos correctos/incorrectos que confiar en una frase abstracta.
- Mejor separar "sistema global" de "contrato por pantalla" que mezclar todo.

No alcanza con:

- Una paleta de colores.
- Una lista de componentes.
- Una descripcion de atmosfera.
- Un prompt estetico.

Si el documento final no permite reconstruir `Santuario.png`, `Crafting.png`, `Combat.png` y `Talentos.png` con una desviacion razonable, esta incompleto.

---

## 8. Entregables del proceso

### Entregable principal

- `uirefactor/design.md`

### Entregable ya creado por este paso

- `designMDPlan.md`

### Entregables opcionales si el analisis crece

- `uirefactor/iconos.md`: catalogo de iconos separado cuando la tabla de iconos vuelva demasiado pesado el `design.md`.
- `uirefactor/imagenes.md`: prompts para generar assets visuales adicionales si una pantalla lo necesita.
- `uirefactor/visual-audit.md`: solo si necesitamos guardar observaciones crudas por captura antes de sintetizar.
- `uirefactor/design-decisions.md`: solo si aparecen conflictos que conviene historizar.

Preferencia:

- Mantener el sistema general en `uirefactor/design.md` y separar anexos cuando sean catalogos o prompts operativos.

---

## 9. Orden recomendado para ejecutar el plan

1. Hacer fichas visuales de las 4 capturas.
2. Hacer catalogo de iconos desde `Iconos SVG.png`.
3. Cruzar fichas contra `DESIGN_1.md`.
4. Usar `plan_1.md` como checklist de secciones.
5. Redactar sistema global.
6. Redactar componentes canonicos.
7. Redactar screen contracts.
8. Agregar anti-patrones.
9. Validar contra capturas.
10. Revisar que no haya dependencia de Stitch.

---

## 10. Criterio de finalizacion

El `uirefactor/design.md` esta listo cuando:

- Puede explicar por que las 4 capturas pertenecen al mismo sistema.
- Puede guiar la generacion de SVG desde el icon sheet.
- Puede guiar un refactor React/CSS sin crear estilos inline nuevos por pantalla.
- Evita tanto la sobrecarga dorada como la UI gris generica.
- Tiene reglas concretas para cada componente visible importante.
- Tiene contratos por pantalla con detalles suficientes para reconstruccion.
- No depende de tener las capturas abiertas para entender el sistema.

Si alguno de esos puntos falla, no se considera listo.
