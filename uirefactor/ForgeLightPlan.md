# Forge Light UI Refactor Plan

Fecha: 2026-04-27
Fuente canonica visual: `uirefactor/*.png`
Estado: plan inicial para guiar el refactor, sin usar material de `stitch/`.

## 1. Objetivo

Refactorizar la UI actual hacia el sistema visual Forge Light mostrado en las capturas de `uirefactor`, manteniendo la logica de juego existente y reduciendo deuda de estilos inline.

El objetivo no es "pintar encima" la app actual. El objetivo es crear una base visual compartida que permita que `Combat`, `Crafting`, `Sanctuary`, `Talents` y el shell global evolucionen con el mismo lenguaje: fondo oscuro, bordes dorados, iconografia clara, tipografia fuerte, botones consistentes y layout mobile-first.

## 2. Fuentes De Referencia

Las referencias validas para este rediseño son exclusivamente:

- `uirefactor/Combat.png`
- `uirefactor/Crafting.png`
- `uirefactor/Santuario.png`
- `uirefactor/Talentos.png`
- `uirefactor/Iconos SVG.png`

Material explicitamente fuera de scope:

- `stitch/`
- clases `*-stitch-*`
- tokens `--stitch-*`
- documentos o prototipos Stitch previos

Si algo existente del repo se parece a Forge Light pero viene de Stitch, no debe tomarse como guia. Puede servir solo como ejemplo tecnico de "como no duplicar deuda", pero no como direccion visual.

## 3. Lectura Del Proyecto Actual

Arquitectura general:

- React 18 + Vite.
- CSS global actual en `src/styles/tokens.css` y `src/styles/responsive.css`.
- Shell principal en `src/App.jsx`.
- Pantallas objetivo:
  - `src/components/Combat.jsx`
  - `src/components/Crafting.jsx`
  - `src/components/Sanctuary.jsx`
  - `src/components/Talents.jsx`
- Navegacion secundaria:
  - `src/components/ExpeditionView.jsx`
  - `src/components/HeroView.jsx`
  - `src/components/ui/SubtabDock.jsx`

Problemas visuales/tecnicos actuales:

- Hay mucho `style={{ ... }}` dentro de componentes grandes.
- Los mismos conceptos visuales se repiten como objetos inline: botones, chips, paneles, barras, badges, cards, headers.
- Cambiar un criterio global hoy exige tocar muchas pantallas.
- `responsive.css` contiene estilos globales mezclados con experimentos visuales antiguos.
- `App.jsx` define parte importante del theme en JS, lo cual vuelve mas dificil iterar visualmente solo desde CSS.

Conclusion tecnica:

Conviene avanzar hacia tokens + clases CSS + primitives React compartidas. No todo debe migrarse de una vez, pero cada pantalla que se refactorice deberia dejar menos estilos inline que antes.

## 4. Respuesta Al Criterio De Inline Styles

Si, unificar criterios globales y reducir inline styles nos va a ahorrar tiempo a futuro.

La razon concreta:

- Un cambio de color, borde, radio, sombra o tipografia pasa a ser un cambio de token/clase.
- Las pantallas nuevas heredan el sistema sin copiar objetos de estilo.
- Los estados visuales (`active`, `disabled`, `danger`, `success`, `selected`, `locked`) se vuelven coherentes.
- Es mas facil hacer QA visual porque los mismos componentes se comportan igual.
- Se reduce el riesgo de arreglar una pantalla y romper la consistencia de otra.

Pero no conviene eliminar todos los inline styles por dogma.

Inline aceptable:

- Valores realmente dinamicos: `width: ${percent}%`, color por rareza si viene de data, posiciones calculadas, delays de animacion.
- Estilos de layout muy locales que no se repiten.
- Variables CSS por componente cuando ayudan a parametrizar una clase.

Inline a migrar:

- Botones.
- Cards/paneles.
- Chips/badges.
- Barras de progreso.
- Headers de seccion.
- Nav items.
- Item cards.
- Marcos dorados.
- Estados active/disabled/locked/selected.

Regla practica:

Si un estilo aparece en dos o mas pantallas, debe vivir en CSS global o en un primitive compartido.

## 5. Identidad Forge Light

Forge Light, segun las capturas, no es una UI minimalista generica. Es una UI RPG mobile-first con peso visual fuerte.

Pilares:

- Fantasia oscura de alto contraste.
- Fondo casi negro con textura/sensacion de profundidad.
- Dorado como color de estructura, seleccion y recompensa.
- Rojo, verde, azul, violeta y naranja reservados para estados jugables.
- Marcos con esquinas ornamentales, lineas dobles y brillo moderado.
- Iconos grandes, legibles y con silueta reconocible.
- Texto serif para titulos importantes.
- Labels condensados/caps para estados y navegacion.
- Densidad alta, pero con jerarquia clara.

Lo que se debe evitar:

- Superficies blancas o grises claras.
- Cards planas sin borde.
- Purple UI generica.
- Botones redondeados modernos sin caracter.
- Emojis como iconografia final.
- Gradientes suaves tipo SaaS.
- Layouts demasiado aireados que desperdicien vertical en mobile.

## 6. Mapeo De Capturas A Componentes

### Combat

Referencia: `uirefactor/Combat.png`
Componente actual: `src/components/Combat.jsx`
Wrapper: `src/components/ExpeditionView.jsx`

Elementos clave del mock:

- Header fijo con avatar, nivel, barra XP y recursos.
- Vista central de combate con fondo ilustrado/escenario.
- Tier y progreso de tramo arriba del enemigo.
- Nombre enemigo, vida, porcentaje y estados.
- Floating combat text grande y dramatico.
- HUD del jugador abajo del enemigo: avatar, HP, mana/energia, cooldowns.
- Boton auto/velocidad lateral.
- Panel de stats principales.
- Panel de ingresos por minuto.
- Registro de combate.
- Bottom nav con iconos Forge Light.
- Accesos laterales a misiones, eventos, arena, ranking, correo, botin.

Observacion:

El componente actual ya tiene mucha logica de combate, logs, status pills, paneles y barras. La primera pasada no deberia reescribir la logica; deberia reestructurar el JSX en subcomponentes visuales y aplicar clases Forge Light.

### Crafting

Referencia: `uirefactor/Crafting.png`
Componente actual: `src/components/Crafting.jsx`

Elementos clave del mock:

- Header de Forja con recursos.
- Modo activo en tabs grandes: Mejorar, Refinar, Extraer, Transmutar.
- Entropia destacada arriba.
- Item card grande a la izquierda.
- Resultado de mejora en el centro con feedback visual.
- Panel de material/probabilidad/costo a la derecha.
- Slider o track de niveles de upgrade.
- Comparacion de estadisticas actuales vs nuevas.
- CTA principal grande dorado.
- Acciones secundarias: mejora maxima, usar automatico, detalles.
- Toast inferior de resultado.
- Bottom nav con Forjar activo.

Observacion:

El componente actual tiene una mesa de trabajo funcional, pero su layout es operativo y no ceremonial. El refactor debe separar "seleccion de item", "workbench", "modo activo", "preview de resultado" y "CTA" para que cada parte pueda estilizarse sin repetir inline.

### Santuario

Referencia: `uirefactor/Santuario.png`
Componente actual: `src/components/Sanctuary.jsx`

Elementos clave del mock:

- Titulo grande `SANTUARIO`.
- Header global con avatar, recursos y menu.
- Panel `TRABAJOS` con claims, timers y accion `Todo + repetir`.
- Job rows con icono circular, estado, recompensa y CTA.
- Separador claro hacia `ESTACIONES`.
- Lista vertical de estaciones con icono, descripcion, estado y boton.
- Estados bloqueados con requisito en tag.
- CTA inferior `Volver a Expedicion`.
- Bottom nav con Santuario activo.

Observacion:

Esta es la mejor pantalla piloto. Tiene estructura clara, menos riesgo que Combat y muestra casi todos los primitives necesarios: panel, row, icon frame, chip, progress, button, locked state y nav.

### Talentos

Referencia: `uirefactor/Talentos.png`
Componente actual: `src/components/Talents.jsx`
Wrapper: `src/components/HeroView.jsx`

Elementos clave del mock:

- Titulo grande `TALENTOS`.
- Header con TP, reset y arbol actual.
- Barra/summary de rama actual.
- Tabs de filtro: Comprables, Activos, Todos.
- Grid tipo arbol con columnas: Basicos, Ofensivos, Defensivos, Supervivencia.
- Nodos cuadrados con icono grande, borde segun estado y progreso `0/5`.
- Lineas verticales de conexion.
- Panel inferior de detalle del nodo seleccionado.
- Requisitos + CTA comprar.
- Tabs inferiores de arbol/clase.
- Bottom nav con Talentos activo.

Observacion:

El componente actual renderiza talentos como listas/columns funcionales. El mock propone un arbol visual mas iconografico. Esta pantalla probablemente requiere mas decision de UX que Santuario, porque no es solo skin: cambia la representacion mental del arbol.

### Iconos SVG

Referencia: `uirefactor/Iconos SVG.png`

Categorias detectadas:

- Estados/efectos de combate.
- Recursos principales.
- Navegacion principal.
- Acciones principales.
- Estaciones del Santuario.
- Misiones/encargos.
- Sistema/varios.
- Atributos/estadisticas.
- Otros utiles.

Decision recomendada:

Crear una libreria propia de iconos React/SVG para Forge Light, en vez de usar emojis.

Ubicacion propuesta:

- `src/components/icons/ForgeIcon.jsx`
- `src/components/icons/forgeIconRegistry.js`
- opcional por categoria:
  - `src/components/icons/StatusIcons.jsx`
  - `src/components/icons/ResourceIcons.jsx`
  - `src/components/icons/NavIcons.jsx`
  - `src/components/icons/ActionIcons.jsx`
  - `src/components/icons/StationIcons.jsx`

## 7. Arquitectura Visual Propuesta

### 7.1 CSS

Crear un archivo nuevo:

```txt
src/styles/forge-light.css
```

Importarlo en `src/main.jsx` despues de `tokens.css` y antes o despues de `responsive.css` segun la estrategia final.

Recomendacion:

- `tokens.css`: breakpoints, spacing base, variables compartidas neutrales.
- `forge-light.css`: identidad Forge Light, components classes, tokens visuales.
- `responsive.css`: reglas estructurales existentes y transiciones mientras se migra.

Idealmente, con el tiempo `responsive.css` deberia dejar de ser el lugar donde viven skins especificas.

### 7.2 Prefijo de clases

Usar prefijo `fl-` para Forge Light.

Ejemplos:

- `.fl-shell`
- `.fl-topbar`
- `.fl-panel`
- `.fl-panel__header`
- `.fl-button`
- `.fl-button--primary`
- `.fl-chip`
- `.fl-progress`
- `.fl-resource`
- `.fl-nav-item`
- `.fl-icon-frame`
- `.fl-section-title`
- `.fl-work-row`
- `.fl-station-row`
- `.fl-talent-node`

Ventaja:

- No colisiona con clases actuales `app-*`, `combat-*`, `talents-*`.
- Permite migracion incremental.
- Permite encontrar todo el sistema con `rg "fl-"`.

### 7.3 Tokens

Tokens base propuestos:

```css
:root {
  --fl-bg-0: #05080a;
  --fl-bg-1: #081014;
  --fl-bg-2: #101417;
  --fl-surface-0: rgba(4, 8, 10, 0.94);
  --fl-surface-1: rgba(10, 14, 17, 0.96);
  --fl-surface-2: rgba(17, 20, 23, 0.96);

  --fl-gold-0: #fff1b8;
  --fl-gold-1: #f3c65f;
  --fl-gold-2: #c68a27;
  --fl-gold-3: #6f4217;

  --fl-text-0: #fff4d8;
  --fl-text-1: #ead7b5;
  --fl-text-2: #bda98b;
  --fl-text-muted: #7d7263;

  --fl-red: #e2382f;
  --fl-red-dark: #7b1617;
  --fl-green: #72dd4f;
  --fl-blue: #4fa7ff;
  --fl-purple: #b34cff;
  --fl-orange: #ff9f1a;

  --fl-border: rgba(198, 138, 39, 0.72);
  --fl-border-soft: rgba(198, 138, 39, 0.34);
  --fl-border-strong: rgba(255, 193, 79, 0.94);

  --fl-shadow-panel: 0 10px 28px rgba(0, 0, 0, 0.58);
  --fl-glow-gold: 0 0 18px rgba(243, 198, 95, 0.28);
  --fl-glow-red: 0 0 18px rgba(226, 56, 47, 0.28);

  --fl-radius-sm: 4px;
  --fl-radius-md: 6px;
  --fl-radius-lg: 8px;
}
```

Nota:

Estos colores son punto de partida aproximado extraido visualmente de las capturas. Deben ajustarse con la app corriendo y capturas reales.

### 7.4 Relacion con tokens actuales

Hay dos opciones:

Opcion A, migracion compatible:

- Mantener `--color-*` y `--tone-*`.
- Cuando Forge Light este activo, mapear esos tokens a valores Forge Light.
- Agregar `--fl-*` para componentes nuevos.

Opcion B, migracion directa:

- Usar solo `--fl-*` en pantallas refactorizadas.
- Dejar `--color-*` para pantallas legacy.

Recomendacion:

Empezar con Opcion B para evitar romper pantallas no migradas. Luego, cuando el shell y pantallas clave esten convertidas, podemos decidir si `--color-*` pasa a apuntar a Forge Light globalmente.

## 8. Componentes Compartidos Propuestos

Crear carpeta:

```txt
src/components/forge/
```

Componentes iniciales:

### `ForgePanel`

Uso:

- Contenedor principal de seccion.
- Trabajos.
- Estaciones.
- Logs.
- Comparadores.
- Estadisticas.

Props:

- `title`
- `eyebrow`
- `actions`
- `variant`: `default | strong | danger | success`
- `className`

### `ForgeButton`

Uso:

- CTAs principales y secundarios.

Props:

- `variant`: `primary | secondary | ghost | danger | success`
- `size`: `sm | md | lg`
- `icon`
- `disabled`
- `pressed`

### `ForgeChip`

Uso:

- Estados cortos: Listo, En progreso, Bloqueada, Equipado, Reclamable.

Props:

- `tone`: `neutral | gold | success | danger | warning | info | purple`
- `children`

### `ForgeProgress`

Uso:

- XP, HP, timers, jobs, entropia, upgrade tracks.

Props:

- `value`
- `max`
- `tone`
- `label`
- `rightLabel`
- `segmented`

### `ForgeResourcePill`

Uso:

- Oro, esencia, fuego, XP, TP.

Props:

- `icon`
- `label`
- `value`
- `action`

### `ForgeIconFrame`

Uso:

- Iconos de nav, estaciones, jobs, talents, efectos.

Props:

- `icon`
- `tone`
- `active`
- `locked`
- `badge`
- `size`

### `ForgeNavBar`

Uso:

- Bottom nav.
- Posible nav lateral de Combat.

Props:

- `items`
- `activeId`
- `onSelect`

### `ForgeSectionTitle`

Uso:

- Titulos grandes tipo `SANTUARIO`, `TALENTOS`, `FORJAR`.

Props:

- `children`
- `right`
- `size`

## 9. Estrategia De Migracion

### Fase 0: Documento y decision de sistema

Resultado esperado:

- Este documento aprobado.
- Definir si `fl-` sera el prefijo final.
- Definir si queremos Forge Light como unico tema o como tema seleccionable.

Recomendacion:

Forge Light deberia convertirse en el look principal, no un experimento paralelo. Mantener tema light/dark antiguo va a duplicar trabajo visual y QA. Si hace falta una bandera temporal para migrar, que sea tecnica y corta.

### Fase 1: Base CSS y primitives

Crear:

- `src/styles/forge-light.css`
- `src/components/forge/ForgePanel.jsx`
- `src/components/forge/ForgeButton.jsx`
- `src/components/forge/ForgeChip.jsx`
- `src/components/forge/ForgeProgress.jsx`
- `src/components/forge/ForgeIconFrame.jsx`

Objetivo:

- Tener lenguaje visual reusable antes de tocar pantallas grandes.

Criterio de salida:

- Build verde.
- `SubtabDock` o shell puede usar al menos una clase Forge Light sin romper layout.

### Fase 2: Shell global

Archivos:

- `src/App.jsx`
- `src/styles/forge-light.css`
- posiblemente `src/components/forge/ForgeTopBar.jsx`
- posiblemente `src/components/forge/ForgeBottomNav.jsx`

Cambios:

- Header superior como mock: avatar, nombre/clase, nivel, barra XP, recursos, menu.
- Reemplazar emojis de tabs por `ForgeIcon`.
- Bottom nav Forge Light.
- Recursos como pills con icono.
- Fondo global oscuro.

Riesgo:

- Alto impacto visual.
- Bajo impacto logico si se mantiene la navegacion actual.

Criterio de salida:

- Todas las pantallas siguen navegando.
- Mobile no tapa contenido con bottom nav.
- Header no corta textos ni recursos.

### Fase 3: Santuario piloto

Archivos:

- `src/components/Sanctuary.jsx`
- `src/components/JobProgressBar.jsx` o reemplazo gradual por `ForgeProgress`
- nuevos primitives Forge si hacen falta

Cambios:

- `SANTUARIO` como titulo de pantalla.
- `TRABAJOS` como panel principal.
- Work rows con icon frame, estado, recompensa, progress y CTA.
- `ESTACIONES` como lista vertical.
- Locked states como en mock.
- Boton `Volver a Expedicion` con estilo Forge.
- Reducir objetos inline repetidos.

Por que primero:

- Es la pantalla mas clara para validar el sistema.
- Tiene botones, progress, chips, rows, locked states y paneles.
- Menor complejidad visual que Combat.

Criterio de salida:

- Claims y timers funcionan igual.
- Estaciones abren overlays igual.
- Onboarding targets no se pierden.
- Layout mobile se parece a `Santuario.png`.

### Fase 4: Crafting / Forja

Archivos:

- `src/components/Crafting.jsx`
- `src/components/crafting/craftingUi.js`
- `src/components/ui/SubtabDock.jsx` o reemplazo visual por Forge

Cambios:

- Reorganizar pantalla alrededor de workbench.
- Modo activo como tabs grandes con iconos.
- Entropia visible y segmentada.
- Item destacado con frame de rareza.
- Preview actual vs nuevo.
- CTA principal grande.
- Toast/log de resultado Forge.

Riesgo:

- Medio/alto porque Crafting tiene muchos modos.

Criterio de salida:

- Mejorar, afinar, reforjar, imbuir y extraer siguen funcionando.
- La pantalla no se vuelve mas larga que el mock en mobile.
- El CTA principal siempre es obvio.

### Fase 5: Talentos

Archivos:

- `src/components/Talents.jsx`
- `src/data/talentNodes.js`
- primitives de iconos/talent node

Cambios:

- Header `TALENTOS`.
- Summary de arbol actual.
- Filtros Forge.
- Nodos con iconos, borde y nivel.
- Panel de detalle del nodo seleccionado.
- Tabs de ramas/clases al estilo mock.

Decision pendiente:

- Si mantenemos la estructura actual de grupos/listas y solo la estilizamos.
- O si cambiamos a representacion tipo arbol visual con conexiones.

Recomendacion:

Primera pasada: estilizar sin cambiar profundamente la data.
Segunda pasada: arbol visual con conexiones si el sistema de talentos lo justifica.

Criterio de salida:

- Comprar talentos funciona igual.
- Onboarding de compra sigue encontrando targets.
- Mobile permite entender el arbol sin scroll horizontal excesivo.

### Fase 6: Combat

Archivos:

- `src/components/Combat.jsx`
- `src/components/ExpeditionView.jsx`
- `src/components/RunSigilCallout.jsx`

Cambios:

- Layout HUD similar al mock.
- Fondo/escenario de combate.
- Tier tracker.
- Enemy card y HP dramatico.
- Floating text mas grande.
- Player HUD.
- Stats e ingresos.
- Combat log Forge.
- Posibles accesos laterales, si tienen sentido con el juego actual.

Riesgo:

- Alto. Es la pantalla mas compleja y mas viva.

Recomendacion:

Hacerla al final, cuando tokens, nav, icons, progress y paneles ya esten probados.

Criterio de salida:

- No perder legibilidad de HP/estado/logs.
- No tapar floating text con HUD.
- No degradar performance por fondos o sombras excesivas.

## 10. Estrategia Para Iconos

La captura `Iconos SVG.png` define direccion, no entrega assets listos.

Plan recomendado:

1. Crear `ForgeIcon` con API estable:

```jsx
<ForgeIcon name="combat" size={24} tone="gold" />
```

2. Empezar con SVGs simples manuales para navegacion y recursos.

3. Migrar emojis existentes a `ForgeIcon`.

4. Solo despues expandir a iconos de talentos/estaciones/estados.

Nombres iniciales:

- `combat`
- `inventory`
- `sanctuary`
- `talents`
- `shop`
- `hero`
- `forge`
- `more`
- `gold`
- `essence`
- `fire`
- `xp`
- `blood`
- `poison`
- `burn`
- `shield`
- `mission`
- `mail`
- `loot`
- `settings`
- `locked`
- `add`
- `upgrade`
- `extract`

Regla:

Los iconos deben ser legibles a 20-24px. Si un icono solo funciona grande, no sirve para nav mobile.

## 11. Tipografia

Las capturas usan una sensacion de serif medieval/fantasia para titulos y labels fuertes.

Propuesta:

- Titulos de pantalla: serif (`Georgia`, o fuente web si decidimos agregar una).
- Labels/nav/buttons: serif o condensed bold segun legibilidad.
- Numeros y recursos: fuente con buen peso y tabular nums.

Como el proyecto no tiene dependencias de fuentes, hay dos caminos:

Opcion A:

- Usar fuentes del sistema disponibles:
  - Titulos: `Georgia, "Times New Roman", serif`
  - UI: `Trebuchet MS, Verdana, sans-serif` o `system-ui`

Opcion B:

- Agregar fuente web en `index.html` o self-hosted.

Recomendacion inicial:

Empezar sin dependencia externa. Si el resultado no alcanza el caracter del mock, agregar fuente luego.

## 12. Layout Mobile

Las capturas son claramente mobile portrait. La app debe priorizar ese formato.

Reglas:

- Header fijo arriba.
- Bottom nav fijo abajo.
- Contenido con padding suficiente para no quedar tapado.
- CTAs principales cerca del pulgar cuando corresponda.
- Panels full-width.
- Evitar grids de mas de 2 columnas en mobile salvo icon grids.
- Texto de botones debe poder partir linea.
- Recursos deben hacer scroll horizontal si no entran.

Desktop:

- No escalar todo a ancho completo.
- Mantener max-width.
- Permitir layout de 2-3 columnas en Crafting/Combat si aporta.
- Conservar el look mobile como fuente primaria, no inventar otra UI.

## 13. Estados Visuales Canonicos

Estados:

- `default`: borde dorado suave, fondo oscuro.
- `active`: borde dorado fuerte, glow moderado, texto dorado.
- `selected`: similar a active, pero sin competir con CTA.
- `disabled`: menor opacidad, borde gris/dorado apagado.
- `locked`: icono candado, texto rojo/dorado, requisito visible.
- `success`: verde, solo para listo/mejora/claim.
- `danger`: rojo, solo para dano, riesgo, bloqueo fuerte o accion destructiva.
- `warning`: naranja/dorado, timers o atencion.
- `resource`: color propio por recurso.

Regla:

Dorado no significa "success". Dorado significa estructura, rareza, seleccion o accion principal.

## 14. Performance

Forge Light puede volverse pesado si abusamos de:

- box-shadows grandes en listas largas.
- filtros blur.
- backgrounds enormes sin optimizar.
- animaciones continuas.
- SVGs complejos repetidos por cientos.

Reglas:

- Glow fuerte solo en active/CTA, no en cada card.
- Animaciones cortas y de evento, no loops constantes.
- Iconos SVG simples.
- Fondos de combate optimizados y con fallback.
- Evitar `backdrop-filter` como base de toda la app.

## 15. QA Visual

Cada fase debe validarse en:

- Mobile narrow: 360px.
- Mobile normal: 390-430px.
- Tablet/desktop: 768px.
- Desktop ancho: 1180-1280px.

Checklist:

- No hay texto cortado en botones.
- Header no se superpone con contenido.
- Bottom nav no tapa CTAs.
- Estados active/disabled/locked son claros.
- Barras de progreso muestran valor real.
- Onboarding sigue apuntando al elemento correcto.
- Build pasa.

Comandos esperados:

```bash
npm run build
```

Si luego sumamos tests visuales, idealmente usar capturas automatizadas con Playwright, pero no es requisito para la primera fase.

## 16. Riesgos

### Riesgo 1: Reescritura demasiado grande

Mitigacion:

- Migrar por pantalla.
- Crear primitives antes.
- Mantener logica actual.

### Riesgo 2: CSS global rompiendo pantallas legacy

Mitigacion:

- Prefijo `fl-`.
- Evitar selectores globales agresivos.
- No usar `!important` salvo transicion puntual y documentada.

### Riesgo 3: Iconos atrasan el refactor

Mitigacion:

- Crear set minimo primero.
- Reemplazar emojis principales.
- Completar categorias despues.

### Riesgo 4: Combat se vuelve pesado

Mitigacion:

- Dejar Combat para fase final.
- Validar performance.
- Usar fondo optimizado.

### Riesgo 5: Talentos requiere rediseño funcional

Mitigacion:

- Primera fase visual compatible.
- Segunda fase arbol visual si se confirma.

## 17. Decisiones Pendientes

1. Forge Light sera el unico tema principal o convivira temporalmente con el tema actual.
2. Usamos `fl-` como prefijo definitivo.
3. Agregamos fuente externa o arrancamos con fuentes del sistema.
4. La primera pantalla piloto sera `Santuario`.
5. Combat tendra fondo ilustrado propio o fondo CSS/gradiente temporal.
6. Talentos se queda en lista/grupos inicialmente o pasa directo a arbol visual.

## 18. Recomendacion Inicial

Mi recomendacion tecnica:

1. Aprobar `uirefactor` como unica fuente visual.
2. Crear `forge-light.css` y primitives `src/components/forge/*`.
3. Migrar shell global y bottom nav.
4. Migrar `Sanctuary` como pantalla piloto.
5. Ajustar tokens reales con la app corriendo.
6. Seguir con `Crafting`, `Talents` y `Combat` en ese orden.

Esto maximiza aprendizaje temprano y minimiza riesgo. Si el sistema funciona en Santuario, despues las demas pantallas tienen una base real en vez de estilos nuevos por archivo.

## 19. Integracion De Game Feel

Fuente complementaria: `uirefactor/gamefeel.md`

El documento de game feel es compatible con Forge Light siempre que se aplique como feedback visual sobre eventos reales del juego, no como cambio de reglas.

Principio adoptado:

- Toda accion importante debe tener respuesta visual inmediata.
- La respuesta debe ser corta, legible y consistente.
- No debe bloquear el loop idle ni volver lenta una accion repetitiva.
- No debe agregar sistemas nuevos de balance.

### 19.1 Lo Que Ya Existe En El Codigo

El juego no parte de cero:

- `Combat` ya usa `combat.floatEvents` para daño, curacion y XP.
- `Combat` ya tiene toast/flash de level up.
- `Combat` ya anima HP/XP con transiciones.
- `Combat` ya detecta racha critica y zonas de cierre.
- `JobProgressBar` ya tiene shimmer/pulse y transicion de ancho.
- `Sanctuary` ya tiene `ActionToast` para reclamos masivos.
- `Talents` ya tiene `recentUnlocks` y glow temporal al comprar nodos.
- `Crafting` ya registra actividad en `craftingLog`.

Conclusion:

La prioridad no es inventar feedback desde cero, sino convertir estos mecanismos en primitives Forge Light y completar los gaps.

### 19.2 Adoptar Directo

Estas recomendaciones tienen buen fit con el juego actual:

- Botones con estados `default`, `hover`, `pressed`, `disabled`, `success`, `error`.
- Pressed state corto: `scale(0.97)` durante 50-80ms.
- Barras con transicion suave.
- Estados activos como icon/chip, no texto plano.
- Toasts para acciones importantes.
- Feedback de compra de talento.
- Feedback de reclamar trabajos.
- Feedback de upgrade de item.
- Hitos de crafting en +5, +10, +15.
- Recurso que cambia debe hacer flash breve.
- Limitar animaciones a `transform` y `opacity` cuando sea posible.
- Evitar particulas excesivas.

### 19.3 Adaptar

Algunas ideas son buenas, pero deben ajustarse al estado actual del juego.

#### Combat Floating Text

El sistema actual ya emite:

- `damage`
- `heal`
- `xp`
- `thornsDamage`
- source como `bleed`, `void`, `regen`, `lifesteal`

Adaptacion Forge Light:

- Mantener `combat.floatEvents`.
- Crear `ForgeFloatingText` o `CombatFloatingText`.
- Diferenciar visualmente por `kind` y `source`.
- Critico debe mostrar texto tipo `CRITICO -1,240`, no solo numero dorado.
- Bleed/void/poison/burn deben tener etiqueta corta si el source existe.
- Limitar simultaneos y agrupar secundarios si hay demasiados eventos.

Gap actual:

- No parece haber float especifico para daño recibido por el jugador.
- Si queremos mostrar daño recibido, el reducer/tick debe emitir un evento nuevo tipo `playerDamage`.

#### Barras De Vida

Adaptacion:

- Crear `ForgeProgress` con opcion `recentValue` para mostrar daño reciente con delay.
- Enemigo: barra roja/dorada, flash corto al golpe, shake solo para critico fuerte.
- Heroe: peligro visual si HP < 30%, sin loop agresivo.

Gap actual:

- Las barras ya transicionan, pero no tienen overlay de daño reciente.

#### Santuario

Adaptacion:

- `JobProgressBar` debe migrar visualmente a `ForgeProgress`.
- Job listo debe usar glow controlado, badge `Listo`, CTA `Reclamar` y boton iconico de repetir.
- Reclamar todo puede seguir existiendo, pero rows individuales deberian comunicar recompensa mejor.

El fly-to-header de recursos es viable, pero no debe ser fase 1. Primero flash + toast.

#### Crafting

Adaptacion:

- El boton principal debe tener pressed state inmediato.
- El item card debe recibir glow al mejorar.
- El nivel `+N` debe animarse.
- El resultado debe generar toast contextual.
- Recursos consumidos deben hacer flash.

Importante:

- En el sistema actual `Mejorar` se describe como subir +1 sin fallo hasta +15. Por eso no corresponde meter feedback de "fallo" para `upgrade` si la regla no falla.
- Feedback de error si aplica para acciones bloqueadas: falta recurso, item con imbuir pendiente, item equipado en extraccion, etc.

#### Talentos

Adaptacion:

- El nodo comprable debe ser claramente distinto del bloqueado.
- El nodo comprado debe pulsear y luego estabilizarse.
- El texto de bloqueo ya existe como `prereqText`; en Forge Light debe pasar a chip/requisito mas legible.
- Toast `Talento aprendido` seria util si no genera ruido.

#### Inventario

Adaptacion:

- Tiene sentido, pero no es parte de las 4 pantallas piloto salvo por `Crafting`.
- Equipar item con delta global es valioso, pero queda despues de shell + Santuario + Crafting.

### 19.4 Posponer Por Ahora

No conviene meter esto en la primera iteracion:

- Sonido.
- Particulas complejas.
- Fly-to-header completo para todos los recursos.
- Movimiento fisico de item hacia slot equipado.
- Animaciones largas de milestone.
- Cambiar reglas para introducir fallos donde hoy no existen.
- Rehacer inventario completo antes de estabilizar Forge Light.

### 19.5 Primitives De Feedback

Agregar a la propuesta `src/components/forge/`:

- `ForgeButton`: estados visuales completos.
- `ForgeProgress`: barra base, shimmer opcional, recent-damage overlay.
- `ForgeToast`: success, error, warning, milestone, loot.
- `ForgeFloatingText`: combat/resource text con pooling simple.
- `ForgeResourcePill`: flash cuando cambia valor.
- `ForgeStatusBadge`: icono + stacks/duracion.
- `ForgeMilestoneBurst`: feedback corto para +5/+10/+15 o level up.

CSS recomendado:

- `src/styles/forge-light.css`: componentes.
- `src/styles/forge-motion.css`: keyframes compartidos.

Regla:

Animaciones compartidas viven en CSS. Los componentes solo eligen `className`, `tone` y variables CSS dinamicas.

### 19.6 Prioridad De Game Feel Por Fase

Fase 1, primitives:

- `ForgeButton`
- `ForgeProgress`
- `ForgeToast`
- keyframes globales de press, pulse, float, flash

Fase 2, shell:

- `ForgeResourcePill` con flash al cambiar valor.
- Bottom nav con active/pressed claros.

Fase 3, Santuario:

- Job listo con glow.
- Reclaim toast Forge.
- Barra de trabajo Forge.
- Boton repetir iconico.

Fase 4, Crafting:

- Upgrade glow.
- `+N -> +N+1` animado.
- Hitos +5/+10/+15.
- Recursos consumidos con flash.

Fase 5, Talentos:

- Nodo comprado con pulse.
- Nodo disponible con borde/glow.
- Requisito bloqueado claro.
- Toast opcional.

Fase 6, Combat:

- Re-skin de floating text.
- Critico mas dramatico.
- Eventos por source.
- Daño recibido si agregamos evento.
- Barra con overlay de daño reciente.

### 19.7 Criterio De Aceptacion

Una pantalla Forge Light no esta terminada si solo cambio colores.

Debe cumplir:

- Hay respuesta visual al click principal.
- Hay confirmacion clara de resultado.
- El estado activo se reconoce en menos de un segundo.
- Los cambios de recursos no pasan silenciosamente.
- Las animaciones no bloquean acciones repetidas.
- En mobile no hay solapamiento con header/bottom nav.

## 20. Estado Actual De Bottom Nav

Implementacion inicial aplicada en:

- `src/App.jsx`
- `src/components/icons/ForgeIcon.jsx`
- `src/styles/forge-light.css`

Criterio visual actual:

- La unidad visual principal es el boton completo, no el icono aislado.
- El icono SVG vive dentro del boton sin marco propio dominante.
- El boton activo tiene borde dorado, glow central naranja/dorado y fondo oscuro con calor en el centro.
- El boton activo muestra un diamante pequeno arriba al centro, inspirado en las capturas de `Crafting.png`, `Santuario.png` y `Talentos.png`.
- Los iconos de mobile son ligeramente mas grandes que la primera pasada para acercarse a la referencia.
- Las notificaciones/badges de bottom nav quedan arriba a la derecha de cada boton para consistencia visual.
- El estado pressed usa escala corta para mejorar game feel.

Decision:

Este patron queda como base para `ForgeNavBar` futuro. Por ahora vive integrado en `App.jsx` y `forge-light.css` para minimizar refactor prematuro.

Pendiente:

- Extraer `PrimaryTabIcon`/nav button a un primitive cuando empecemos a reutilizarlo fuera del shell.
- Ajustar iconos individuales si alguna silueta no lee bien en 20-25px.
- Aplicar el mismo lenguaje a subtabs (`SubtabDock`) cuando se migren `Crafting`, `Heroe/Talentos` y `Expedicion`.

## 21. Estado Inicial De Santuario

Implementacion inicial aplicada en:

- `src/components/Sanctuary.jsx`
- `src/styles/forge-light.css`
- `src/components/icons/ForgeIcon.jsx`

Referencia principal:

- `uirefactor/Santuario.png`

Alcance de esta pasada:

- La pantalla adopta `sanctuary-root--forge-light` como scope visual.
- Se remapean tokens locales de Santuario a la paleta Forge Light para que estilos inline heredados dejen de forzar look claro.
- Se agrega header de pantalla con titulo grande `Santuario`, panel oscuro y sigilo decorativo.
- `Trabajos` pasa a filas oscuras con borde dorado, icono grande, estado visible, chip de conteo y botones Forge.
- Los jobs reclamables muestran glow/estado verde y punto de disponibilidad sobre el icono.
- El boton secundario de `Reclamar + repetir` pasa a accion iconica con `repeat`, siguiendo la idea de game feel de reducir texto repetitivo.
- `Estaciones` pasa de cards compactas en grilla a lista vertical, mas cercana a la captura.
- Cada estacion tiene icono Forge, titulo serif uppercase, descripcion funcional y accion separada.
- La CTA fija de expedicion adopta boton Forge Light para integrarse con la bottom nav.
- `Arsenal de Reliquias` usa el mismo formato de filas Forge Light que Estaciones/Trabajos.
- La pantalla se compacto despues de la primera pasada: menos padding, filas mas bajas, iconos mas chicos, botones/chips mas densos y gaps reducidos.

Decisiones:

- No se cambia ninguna regla de jobs, estaciones, onboarding, reliquias ni expedicion.
- No se introduce un primitive React nuevo todavia; esta pantalla sigue siendo piloto. Si el patron sobrevive a Santuario + Crafting, se extrae a `ForgePanel`, `ForgeRow`, `ForgeButton` y `ForgeChip`.
- Los iconos son SVG inline desde `ForgeIcon.jsx`, no assets raster, para poder recolorear y ajustar tamano desde CSS.
- Se mantiene la CTA fija por compatibilidad con el flujo actual, aunque la referencia la muestra visualmente dentro del bloque inferior. Puede revisarse cuando midamos solapamientos reales en mobile.

Pendiente:

- Revisar captura manual en navegador porque el entorno automatico no pudo lanzar Chromium por dependencia de sistema faltante (`libnspr4.so`).
- Ajustar iconos de estaciones si las siluetas actuales se sienten demasiado abstractas frente a la referencia ilustrada.
- Revisar si `Arsenal de Reliquias` debe quedar visible en Santuario o pasar a un panel secundario si visualmente compite con `Estaciones`.
- Extraer botones/chips/paneles a primitives compartidos despues de validar una segunda pantalla.
