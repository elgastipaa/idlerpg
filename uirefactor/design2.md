# Forge Light Design System v2

Fecha: 2026-04-28
Estado: contrato candidato para unificar la UI refactorizada
Objetivo: reemplazar la logica de "copiar capturas" por una gramatica visual comun para toda la app.

Este documento no es un moodboard. Es una guia de implementacion para que Combat, Mochila, Crafting, Talentos, Santuario, Ecos, Heroe, Intel y Expedicion parezcan partes del mismo juego.

---

## 1. Autoridad de Referencias

### 1.1 Fuente primaria

La fuente visual principal es:

- `uirefactor/nuevoDesign/UI Kit Forge Light.png`

Ante cualquier duda entre una captura vieja y el UI Kit, predomina el UI Kit.

### 1.2 Fuente textual base

La fuente textual base es:

- `uirefactor/nuevoDesign/nuevoDesign.md`

Este archivo resume la intencion del sistema: dark fantasy, metal trabajado, claridad moderna, peso fisico, fondos oscuros, dorado estructural y color semantico.

### 1.3 Fuentes secundarias

Estas capturas sirven para entender layout, densidad y necesidades funcionales, no para copiar estilos locales inconsistentes:

- `uirefactor/Combat.png`
- `uirefactor/Combate_Abajo.png`
- `uirefactor/Mochila.png`
- `uirefactor/Mochila_Abajo.png`
- `uirefactor/Mochila_Completa.png`
- `uirefactor/Crafting.png`
- `uirefactor/Santuario.png`
- `uirefactor/Talentos.png`
- `uirefactor/Ecos.png`
- `uirefactor/Heroe_Atributos.png`
- `uirefactor/Heroe_Ficha.png`
- `uirefactor/Intel.png`
- `uirefactor/Progreso_Offline.png`

### 1.4 Regla de conflicto

Si una captura muestra un boton, card, badge, barra, tab o borde distinto al UI Kit:

- se conserva la funcion;
- se conserva la jerarquia si funciona;
- se normaliza el componente al UI Kit.

Ejemplo: si `Crafting.png` tiene un CTA dorado mas brillante que el UI Kit, el CTA final usa la estructura y estados del UI Kit. La captura solo informa que esa accion es primaria.

---

## 2. Identidad

Forge Light es:

- dark fantasy;
- metal trabajado;
- UI pesada y tactil;
- lectura rapida de progreso;
- mobile RPG, no dashboard SaaS;
- ornamental con control, no decoracion constante.

Debe transmitir:

- poder;
- progreso;
- control;
- recompensa;
- permanencia;
- peligro cuando corresponde.

No debe verse como:

- app mobile generica;
- dark mode plano;
- UI web con cards grises;
- fantasy saturado donde todo brilla;
- coleccion de pantallas copiadas de referencias distintas.

---

## 3. Principios Globales

### 3.1 Un foco por viewport

Cada pantalla debe tener una accion o lectura principal.

- Combat: enemigo, HP y progreso de tier.
- Mochila: upgrade/equipo relevante y volver a combate.
- Crafting: resultado de mejora y CTA.
- Santuario: jobs listos y timers activos.
- Talentos: nodo seleccionado/comprable y puntos disponibles.
- Ecos: ganancia de prestige y consecuencias.
- Expedicion: tier actual, boss y progreso.
- Heroe: identidad del build y atributos/equipo.

Si todo esta resaltado, nada esta resaltado.

### 3.2 El dorado estructura

El dorado no es decoracion libre. Se usa para:

- bordes;
- separadores;
- CTAs;
- seleccion activa;
- highlight de valor;
- icon frames;
- progreso neutral/importante.

No usar dorado fuerte para:

- textos largos;
- todos los bordes con la misma intensidad;
- estados que ya tienen semantica propia;
- elementos secundarios sin decision.

### 3.3 El color comunica estado

Los colores semanticos acompanan al dorado.

- Verde: vida, curacion, exito, listo, mejora positiva.
- Rojo: dano, peligro, error, bloqueo critico.
- Violeta: arcano, XP, ecos, epico, magia.
- Azul: defensa, estabilidad, rareza rara, mana/escudo si aplica.
- Naranja/amarillo: recompensa, oro, fuego, critico, forja.

No convertir todo lo positivo en verde boton. El CTA principal sigue siendo dorado.

### 3.4 Nada flat

Todo componente importante debe tener peso visual:

- borde;
- profundidad;
- sombra interna o externa;
- facetas/esquinas trabajadas;
- estado pressed visible;
- respuesta tactil clara.

### 3.5 Densidad mobile controlada

La UI puede ser densa, pero debe escanearse rapido.

- Texto corto.
- Numeros protagonistas.
- Detalle largo en sheet, tooltip o seccion expandible.
- Targets tactiles estables.
- Sin cambios de layout al hover/pressed/loading.

---

## 4. Tokens Canonicos

Estos tokens son la base candidata para alinear `src/styles/forge-light.css` y `src/styles/responsive.css`. Los valores pueden ajustarse finamente, pero los roles no deben cambiar.

```css
:root {
  --fl-bg-main: #0B0F14;
  --fl-bg-surface: #121821;
  --fl-bg-card: #161D27;
  --fl-bg-card-deep: #0D1118;
  --fl-bg-input: #0A0D12;

  --fl-gold-border: #C6A15B;
  --fl-gold-glow: #E6C47A;
  --fl-gold-hover: #F0D28A;
  --fl-gold-deep: #7C531F;
  --fl-gold-muted: rgba(198, 161, 91, 0.38);

  --fl-text-primary: #F2E6C8;
  --fl-text-secondary: #B8AA8F;
  --fl-text-muted: #7F7564;
  --fl-text-disabled: #55504A;

  --fl-success: #4FD18B;
  --fl-danger: #E05A5A;
  --fl-arcane: #8A5BE8;
  --fl-defense: #4A8FE7;
  --fl-reward: #F2B84B;

  --fl-rarity-common: #8E8E8E;
  --fl-rarity-magic: #4FD18B;
  --fl-rarity-rare: #4A8FE7;
  --fl-rarity-epic: #B455E8;
  --fl-rarity-legendary: #F29A2E;

  --fl-radius-sm: 4px;
  --fl-radius-md: 6px;
  --fl-radius-lg: 8px;

  --fl-border-thin: 1px;
  --fl-border-card: 1px;
  --fl-border-active: 2px;

  --fl-shadow-card: 0 12px 30px rgba(0, 0, 0, 0.42);
  --fl-shadow-inset: inset 0 1px 0 rgba(255, 232, 180, 0.08);
  --fl-glow-gold-soft: 0 0 16px rgba(230, 196, 122, 0.22);
  --fl-glow-gold-strong: 0 0 28px rgba(230, 196, 122, 0.36);
  --fl-glow-success: 0 0 20px rgba(79, 209, 139, 0.26);
  --fl-glow-danger: 0 0 20px rgba(224, 90, 90, 0.26);

  --fl-space-1: 4px;
  --fl-space-2: 6px;
  --fl-space-3: 8px;
  --fl-space-4: 10px;
  --fl-space-5: 12px;
  --fl-space-6: 16px;
  --fl-space-7: 20px;
  --fl-space-8: 24px;
  --fl-space-9: 32px;

  --fl-font-display: "Cinzel", "Cormorant SC", Georgia, serif;
  --fl-font-ui: "Barlow Condensed", "Roboto Condensed", "Arial Narrow", sans-serif;
  --fl-font-number: "Barlow Condensed", "Roboto Condensed", "Arial Narrow", sans-serif;
}
```

### 4.1 Regla de tokens

No crear colores locales por pantalla si ya existe un rol global. Si una pantalla necesita un tono nuevo, primero decidir si es:

- superficie;
- borde;
- texto;
- estado;
- rareza;
- recompensa;
- peligro;
- recurso especifico.

---

## 5. Tipografia

### 5.1 Roles

Display:

- titulos de pantalla;
- nombres de sistemas;
- nombres de items importantes;
- titulos de modal;
- labels de bottom nav.

UI:

- botones;
- tabs;
- labels;
- rows;
- descripcion corta;
- metadata.

Numeros:

- dano;
- HP;
- poder;
- costes;
- recursos;
- progreso;
- porcentajes.

### 5.2 Reglas

- Los numeros son protagonistas.
- Los titulos pueden ser blancos calidos o dorados.
- Las descripciones no deben ser doradas.
- Labels secundarios usan texto muted.
- Botones y tabs usan uppercase o small caps.
- Evitar bloques largos en pantalla principal.
- Usar `font-variant-numeric: tabular-nums` en valores que cambian.

### 5.3 Escala mobile recomendada

| Rol | Rango |
|---|---:|
| Titulo principal | 30-44px |
| Titulo de panel | 18-26px |
| Nombre de card/row | 16-22px |
| Label | 11-14px |
| Texto secundario | 13-17px |
| Numero principal | 24-44px |
| Dano critico | 42-64px |
| CTA | 18-26px |
| Bottom nav label | 11-15px |

---

## 6. Componentes Canonicos

Estos componentes deben ser visualmente iguales en toda la app. Una pantalla puede variar composicion, no reinventar el componente.

### 6.1 Button

Variantes:

- primary;
- secondary;
- ghost;
- icon;
- destructive;
- disabled;
- loading.

Primary:

- estructura dorada;
- superficie oscura o dorado profundo segun importancia;
- borde dorado claro;
- glow controlado;
- texto fuerte;
- pressed con escala leve o inset, sin mover layout.

Secondary:

- superficie oscura;
- borde dorado tenue o gris metalico;
- menos glow;
- no compite con primary.

Ghost:

- texto/label sobre fondo minimo;
- para acciones menores;
- sin parecer CTA.

Reglas:

- No usar verde como boton principal.
- No usar botones planos sin borde.
- Disabled debe verse apagado, no roto.
- Loading mantiene ancho/alto.

### 6.2 Icon Button

Uso:

- cerrar;
- filtros;
- settings;
- plus de recurso;
- acciones compactas;
- preview;
- auto.

Reglas:

- frame metalico;
- icono centrado;
- estado pressed visible;
- badge opcional arriba a la derecha;
- no usar iconos cartoon ni emojis.

### 6.3 Toggle

Uso:

- auto;
- filtros;
- opciones;
- repetir job;
- usar automatico.

Reglas:

- off oscuro;
- on con nucleo dorado o semantico si representa estado;
- knob pesado;
- label externo si hace falta.

### 6.4 Card

Variantes del UI Kit:

- normal;
- hover;
- seleccionada;
- premium/rareza;
- compacta;
- panel seccion.

Reglas:

- fondo oscuro;
- borde dorado fino;
- sombra interna leve;
- esquinas trabajadas;
- selected con borde/glow mas claro;
- hover/pressed no cambia tamano;
- premium usa rareza sutil, no saturacion completa.

### 6.5 Panel de seccion

Uso:

- bloques de stats;
- job groups;
- comparaciones;
- recompensas;
- resumen de pantalla.

Reglas:

- mas ancho que card individual;
- borde dorado tenue;
- titulo claro;
- contenido alineado;
- separadores internos consistentes.

### 6.6 Modal / Bottom Sheet

Uso:

- detalle de item;
- confirmaciones;
- recompensas;
- filtros;
- prestige;
- detalle de talento/job.

Reglas:

- header con titulo display;
- boton cerrar iconico;
- contenido scrollable;
- footer sticky si hay accion;
- primary action dorada;
- destructive requiere confirmacion clara.

### 6.7 Badge / Tag

Tipos:

- nuevo;
- equipado;
- bloqueado;
- listo;
- mejorable;
- rareza;
- tipo;
- contador.

Reglas:

- borde visible;
- fondo oscuro;
- texto corto;
- color semantico solo cuando comunica estado;
- no convertir badges en mini-botones salvo que sean filtros.

### 6.8 Rarity Indicator

Escala:

- Comun: gris;
- Magico: verde;
- Raro: azul;
- Epico: violeta;
- Legendario: naranja/dorado.

Aplicacion:

- borde de item;
- badge;
- glow leve;
- icon frame;
- highlight de recompensa.

Regla:

- rareza debe leerse en 1 segundo;
- no pintar toda la card con el color de rareza.

### 6.9 Icon Frame

Variantes:

- normal;
- activo;
- mejorado;
- epico;
- legendario.

Uso:

- items;
- talentos;
- stats;
- recursos;
- estaciones;
- rewards.

Reglas:

- frame reutilizable;
- contenido centrado;
- rareza/estado por borde y glow;
- mantener proporcion cuadrada o circular estable.

### 6.10 Progress Bar

Tipos:

- HP;
- XP;
- progreso;
- loading;
- success;
- error;
- hitos.

Reglas:

- HP no usa verde si representa enemigo en peligro: puede usar rojo como en combat.
- XP usa violeta o azul-violeta.
- Progreso neutral usa dorado.
- Success usa verde.
- Error usa rojo.
- Texto dentro de la barra solo si es legible.
- Hitos usan diamantes o marcas del UI Kit.

### 6.11 Resource Counter

Uso:

- oro;
- esencia;
- fuego/entropia;
- ecos;
- materiales;
- puntos.

Reglas:

- frame compacto;
- icono grande;
- numero protagonista;
- boton plus consistente;
- recurso especial puede usar color semantico, pero mantiene frame Forge.

### 6.12 Stat Row

Uso:

- atributos;
- comparacion;
- crafting;
- combat stats;
- item detail.

Reglas:

- icono a la izquierda;
- label corto;
- valor alineado a derecha;
- delta semantico;
- separador fino;
- numeros tabulares.

### 6.13 Feedback Visual

Tipos:

- dano normal;
- critico;
- curacion;
- exito;
- error;
- nuevo/recompensa;
- level up;
- recurso obtenido;
- item obtenido.

Reglas:

- 400-600ms para feedback corto;
- critico mas grande que dano normal;
- exito con glow verde;
- error con rojo y shake breve;
- recompensa con dorado/naranja;
- animacion funcional, no decorativa constante.

### 6.14 Navigation

Bottom nav:

- icono + label;
- activo dorado;
- frame pesado;
- badge arriba a la derecha;
- altura estable;
- no usar estilos distintos por pantalla.

Tabs:

- superficie oscura;
- activo con borde/glow dorado;
- icono opcional;
- disabled apagado;
- sin duplicar tabs si hay subnav equivalente.

Subtabs:

- misma gramatica que tabs;
- version mas compacta;
- scroll horizontal si no entra.
- los subtabs de Expedicion (`Combate`, `Mochila`, `Intel`) usan la misma superficie oscura y activo dorado; nunca vuelven al estilo claro legacy aunque el subview activo sea Combat.

---

## 7. Layout Mobile

### 7.1 Estructura base

Toda pantalla principal debe poder describirse asi:

1. Header global o header contextual.
2. Resumen de estado/recurso si aplica.
3. Foco principal.
4. Contenido secundario.
5. Accion principal o nav inferior.

### 7.2 Safe areas

- Bottom nav y sticky footers respetan safe area.
- Sheets no tapan la accion principal sin alternativa.
- Header no debe empujar el contenido principal fuera del viewport en mobile.

### 7.3 Densidad

| Elemento | Alto recomendado |
|---|---:|
| Header global | 72-96px |
| Bottom nav | 76-104px |
| CTA grande | 48-64px |
| Boton medio | 36-48px |
| Card compacta | 64-96px |
| Row de item | 112-180px segun contenido |
| Row de job | 72-104px |
| Talent node | 56-76px |
| Icon button | 40-56px |

### 7.4 Scroll

- Una pantalla puede scrollear verticalmente, pero el foco principal debe aparecer temprano.
- Evitar scroll interno dentro de scroll salvo en sheets.
- Listas largas usan rows/cards compactas.
- El contenido clave no debe quedar escondido bajo bottom nav.

---

## 8. Recetas de Pantalla

Estas recetas definen como aplicar el sistema comun sin copiar inconsistencias visuales de las capturas.

### 8.1 Combat

Fuentes secundarias:

- `Combat.png`
- `Combate_Abajo.png`

Objetivo:

- combate vivo;
- lectura inmediata de enemigo, HP, progreso y rewards/min;
- HUD integrado con arte.

Estructura:

- header global compacto con avatar y recursos;
- fondo de combate con overlay oscuro;
- tier/progress track con hitos del UI Kit;
- enemy card/HUD central;
- barras HP/status con componentes canonicos;
- floating damage con feedback canonico;
- panel inferior de stats;
- rewards/min en cards compactas;
- combat log como panel de seccion;
- bottom nav canonico.

Normalizar:

- botones laterales usan Icon Button/Card canonico;
- badges de notificacion usan Notification Badge canonico;
- progress track usa diamantes/hitos del UI Kit;
- stats usan Stat Row/Value Display canonico.

No hacer:

- inventar estilos exclusivos para side buttons;
- usar barras con tratamiento distinto a UI Kit;
- saturar el centro con demasiados glows permanentes.

### 8.2 Mochila / Inventario

Fuentes secundarias:

- `Mochila.png`
- `Mochila_Abajo.png`
- `Mochila_Completa.png`

Objetivo:

- detectar upgrades;
- comparar items;
- equipar o volver a combate rapido;
- gestionar capacidad.

Estructura:

- screen header con titulo y recursos;
- callout de upgrade/accion recomendada;
- CTA `VOLVER A COMBATE` si corresponde;
- seccion `EQUIPADO`;
- item rows/cards con icon frame, rareza, poder, tags y afijos;
- filtros/sort como controles canonicos;
- bottom nav canonico.

Normalizar:

- item frame segun rareza del UI Kit;
- tags de afijo/tipo con Badge/Tag canonico;
- poder como numero protagonista;
- card seleccionada segun UI Kit, no borde local.

No hacer:

- cada rareza con layout distinto;
- chips sin borde/jerarquia;
- texto largo en item row si puede ir a detail sheet.

### 8.3 Crafting / Forja

Fuente secundaria:

- `Crafting.png`

Objetivo:

- comunicar transformacion;
- mostrar coste/probabilidad/material;
- hacer que el CTA sea obvio.

Estructura:

- header contextual `FORJAR`;
- recurso/entropia como Resource Counter + Progress Bar;
- tabs canonicos para modos;
- item objetivo con Item Card premium;
- resultado central con Feedback/Result Panel;
- panel lateral de material, probabilidad y coste;
- track de mejora con hitos;
- comparacion de stats;
- CTA primario dorado;
- feedback final como toast/panel.
- banda post-CTA de estado persistente: lista, bloqueada o ultima accion.

Normalizar:

- tabs usan componente canonico;
- `MEJORAR` usa Button primary;
- success usa verde semantico, no boton verde;
- track usa Progress Bar con hitos del UI Kit.
- el estado post-CTA usa `FlRequirementHint` cuando esta bloqueado y `FlCard` de feedback cuando esta listo o acaba de resolver.

No hacer:

- duplicar navs de modo;
- mezclar buttons dorados solidos con otros estilos locales;
- usar card de item distinta a inventario.

### 8.4 Santuario

Fuente secundaria:

- `Santuario.png`

Objetivo:

- ver jobs activos/listos;
- iniciar o reclamar timers;
- navegar estaciones.

Estructura:

- header de sistema;
- resumen de jobs listos y recursos;
- station cards canonicas;
- job rows/cards;
- timer progress bars;
- claim/claim-all con primary button;
- detail sheet para jobs.

Normalizar:

- station card deriva de Card normal/selected;
- job listo usa verde semantico + CTA dorado;
- job en progreso usa barra progress;
- locked usa Progression Gate canonico.
- overlays de estacion usan una superficie Forge compartida; los acentos semanticos pueden vivir en textos/estado, pero la estructura de panel, borde y boton debe seguir el dorado del UI Kit.

No hacer:

- cada estacion con borde distinto;
- dorado fuerte en todos los jobs;
- ocultar el timer real.

### 8.5 Talentos

Fuente secundaria:

- `Talentos.png`

Objetivo:

- entender puntos disponibles;
- identificar nodos comprables;
- ver detalle del nodo seleccionado;
- comprar/resetear sin confusion.

Estructura:

- header con clase/arbol y puntos;
- tree canvas/grid;
- talent nodes como Icon Frame canonico;
- conexiones sutiles si se usan;
- detail panel/sheet;
- CTA `COMPRAR` primary;
- reset como secondary/destructive segun contexto.

Normalizar:

- nodo activo usa icon frame activo;
- nodo maxed usa estado maxed;
- nodo bloqueado usa opacity + requirement badge;
- coste usa Cost Display canonico.

No hacer:

- usar nodos con formas/colores fuera del UI Kit;
- dejar requisitos vacios;
- hacer que todos los nodos brillen igual.

### 8.6 Heroe / Atributos

Fuentes secundarias:

- `Heroe_Atributos.png`
- `Heroe_Ficha.png`

Objetivo:

- mostrar identidad de build;
- leer atributos principales;
- entender mejoras disponibles.

Estructura:

- hero summary;
- equipment layout o attribute grid;
- stat rows canonicas;
- upgrade/cost buttons;
- detail sheet para breakdowns;
- tabs canonicas si hay Ficha/Atributos/Talentos.

Normalizar:

- stats siempre con icono, label y valor alineado;
- deltas usan Delta Indicator semantico;
- botones de coste usan Button/Cost Display canonico.

No hacer:

- inventar headers distintos para cada subtab;
- usar chips de stats sin jerarquia.

### 8.7 Ecos / Prestige

Fuente secundaria:

- `Ecos.png`

Objetivo:

- explicar ganancia de prestige;
- mostrar consecuencias;
- comprar mejoras permanentes.

Estructura:

- readiness card;
- echo currency counter;
- preview de ganancia/perdida;
- upgrade cards/tree nodes;
- reset impact list;
- confirmation modal bloqueante.

Normalizar:

- ecos usan violeta/arcano pero dentro de frame Forge;
- CTA de prestige usa dorado si es accion primaria;
- advertencias irreversibles usan danger + modal canonico.

No hacer:

- tratar prestige como pantalla de settings;
- ocultar perdidas/resets;
- usar violeta para todo el layout.

### 8.8 Expedicion

Fuentes secundarias:

- `Mochila.png` como referencia de Expedicion actual si aplica;
- `Combat.png` para tier/progress;
- futuras capturas especificas si existen.

Objetivo:

- elegir tier;
- ver boss/progreso;
- iniciar o volver a combate;
- entender recompensas y requisitos.

Estructura:

- title/screen header;
- tier selector;
- progress track;
- boss card;
- requirement list;
- reward track;
- CTA start/continue/return;
- bottom nav canonico.

Normalizar:

- tier cards usan Card canonica;
- boss usa Boss Card con icon frame/panel;
- progress usa hitos del UI Kit;
- requirements usan Progression Gate.

No hacer:

- mezclar estilo de mochila con botones propios;
- usar chips verdes como CTAs;
- esconder bloqueos sin camino de accion.

### 8.9 Intel / Codex

Fuente secundaria:

- `Intel.png`

Objetivo:

- consultar informacion;
- filtrar/buscar;
- abrir detalle.

Estructura:

- header;
- search/filter;
- entry cards/list rows;
- detail sheet/view;
- glossary/tooltips.

Normalizar:

- rows usan List Row canonica;
- tags usan Tag canonico;
- empty states usan Empty State canonico.

No hacer:

- convertir Intel en documento plano;
- usar cards sin icono o jerarquia.

### 8.10 Progreso Offline

Fuente secundaria:

- `Progreso_Offline.png`

Objetivo:

- mostrar que progreso ocurrio;
- resumir loot/XP/recursos;
- reclamar sin friccion.

Estructura:

- panel global Forge sobre el viewport activo o sheet si el flujo lo requiere;
- tiempo offline;
- barra de resolucion con Progress Bar canonica;
- metricas agrupadas en Cards compactas con iconos;
- highlight de drop raro con asset real y rareza;
- accion de cierre con Button/Icon Button canonico;
- detalle expandible solo si aporta diagnostico.

Normalizar:

- recompensas usan `FlCard`/Reward Display canonico y no cards light inline;
- barra usa `FlProgressBar`;
- cierre usa `FlButton` o `FlIconButton`;
- rare drops usan `FlAsset` + Rarity Indicator.

No hacer:

- mostrar todo como log plano;
- ocultar limites/caps alcanzados.

---

## 9. Estados Globales

Todo componente interactivo debe considerar:

- default;
- hover/focus;
- pressed;
- active/selected;
- disabled;
- loading;
- success;
- error.

En mobile:

- hover equivale a focus/pressed visible donde corresponda;
- long press puede abrir preview;
- disabled debe tener razon visible por tooltip/sheet/hint;
- loading no debe cambiar el tamano del control.

---

## 10. Microelementos

Los microelementos del UI Kit son obligatorios para coherencia:

- separador horizontal ornamental;
- divisor vertical;
- punto/bullet;
- flecha;
- paginacion;
- indicador de pasos;
- scrollbar;
- badge de contador;
- notification dot;
- small icon frame.

Reglas:

- usar la misma familia de microelementos en todas las pantallas;
- no introducir separadores grises planos;
- no usar bullets tipograficos comunes donde el UI Kit tiene punto ornamental;
- paginacion y step indicators deben compartir diamantes/puntos del kit.

---

## 11. Iconografia

### 11.1 Reglas

- Iconos fantasy/metalicos.
- Silueta clara en mobile.
- Grosor consistente.
- Sin emojis.
- Sin iconos cartoon.
- Sin mezclar familias visuales.

### 11.2 Uso

- Bottom nav: iconos grandes con label.
- Stats: icono pequeno + label + valor.
- Items: asset o placeholder dentro de icon frame.
- Talentos: icon frame como nodo.
- Jobs/estaciones: icono protagonista.
- Recursos: icono + numero + plus si aplica.

### 11.3 Fallback

Si falta un icono:

- usar `ForgeIcon` o SVG simple alineado a la familia;
- no usar emoji temporal en UI final;
- documentar el icono pendiente si afecta una pantalla Core.

---

## 12. Animacion y Game Feel

Animaciones permitidas:

- pressed scale/inset;
- glow breve en success;
- shake breve en error;
- floating number;
- reward reveal;
- progress fill;
- toast enter/exit;
- sheet slide.

Duraciones:

- microinteraccion: 100-180ms;
- feedback corto: 400-600ms;
- reward reveal: 600-1200ms;
- modal/sheet: 180-260ms.

Reglas:

- animacion siempre responde a evento real;
- no loops decorativos constantes salvo progreso/loading;
- respetar reduced motion.

---

## 13. Anti-Patrones

Prohibido:

- botones verdes como CTA principal;
- UI blanca o clara;
- sombras suaves tipo SaaS;
- gradientes modernos saturados;
- cards grises planas;
- iconos cartoon o emojis;
- dorado fuerte en todo;
- textos largos en dorado;
- cada pantalla con tabs/botones propios;
- bordes de rareza saturando toda la card;
- scroll interno innecesario dentro de pantalla principal;
- cambiar layout entre default/pressed/loading;
- copiar una captura vieja por encima del UI Kit.

---

## 14. Criterio de Implementacion

Una pantalla esta bien migrada si cumple:

- usa tokens Forge globales;
- sus botones coinciden con Button canonico;
- sus cards coinciden con Card canonica;
- sus badges/tags coinciden con UI Kit;
- bottom nav y tabs no varian por pantalla;
- el estado activo es evidente;
- hay una accion principal clara;
- colores semanticos son consistentes;
- numeros importantes dominan;
- rarezas se leen rapido;
- no parece una captura aislada de otro sistema.

Una pantalla no esta terminada si solo cambio colores.

---

## 15. Checklist de Auditoria Visual

Antes de cerrar una pantalla:

1. Abrir la captura actual en `uirefactor/current/`.
2. Comparar contra `UI Kit Forge Light.png`, no solo contra la captura vieja.
3. Revisar Button, Card, Badge, Progress Bar, Resource Counter y Bottom Nav.
4. Confirmar que el CTA primario es unico y dorado.
5. Confirmar que verde/rojo/violeta/azul/naranja se usan por semantica.
6. Confirmar que disabled/loading/success/error existen.
7. Confirmar que no hay componentes locales duplicados.
8. Confirmar que mobile 390x844 no corta contenido clave.
9. Confirmar que desktop/tablet no estira cards de forma torpe.
10. Confirmar que el texto cabe sin solaparse.

---

## 16. Plan de Uso para Refactor

Orden recomendado:

1. Consolidar tokens en CSS.
2. Consolidar primitives visuales: Button, Card, Badge, Progress, Resource, Modal/Sheet.
3. Normalizar App Shell, header, bottom nav y tabs.
4. Pasar pantalla por pantalla reemplazando componentes locales por canonicos.
5. Capturar con `npm run ui:capture`.
6. Auditar contra UI Kit.
7. Solo despues ajustar layouts especificos por pantalla.

Regla practica:

- Primero coherencia.
- Despues fidelidad secundaria a capturas.
- Nunca al reves.

---

## 17. Decision Final

Forge Light v2 se rige por esta regla:

El UI Kit define el lenguaje. Las capturas definen casos de uso. El codigo implementa componentes reutilizables. Si una pantalla necesita una excepcion, debe justificarla por funcion, no por parecido a una referencia vieja.
