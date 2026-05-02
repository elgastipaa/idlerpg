# Forge Light - Pedidos Extra Para UI Kit

Estado: sugerencia antes de seguir con migracion grande.

Respuesta corta: no necesitamos mas UI Kit para seguir con primitives base, header, bottom nav y Crafting.  
Si vamos a migrar pantallas completas sin inventar visuales en codigo, si conviene pedir algunos modulos mas.

---

## Prioridad Alta

### 1. Empty State / Estado Vacio

Por que falta:

- El checklist marco `FlEmptyState` como "no la veo esta".
- La app tiene muchos casos: sin item seleccionado, inventario vacio, sin jobs, estacion bloqueada, lista sin resultados.

Pedido sugerido:

> Diseña 3 variantes de Empty State para Forge Light Premium:
> 1. compacto para listas densas;
> 2. panel mediano para "sin item seleccionado";
> 3. estado bloqueado/no disponible.
> Debe usar el lenguaje del kit: borde dorado tenue, textura sutil, icono simple, tag opcional, accion opcional. Sin glow fuerte constante.

---

### 2. Inventory Dense Row + Item Detail

Por que falta:

- El kit tiene rareza, item frame y stat comparison, pero no un modulo completo de fila densa de inventario.
- Necesitamos preservar compare, pending sell, equipped, selected, actions y rarity.

Pedido sugerido:

> Diseña un modulo de Inventario para Forge Light Premium con:
> - fila densa de item;
> - item seleccionado;
> - item equipado;
> - item marcado para vender;
> - acciones compactas;
> - rareza por borde/frame/badge, no por fondo completo.
> Tambien diseña un panel de detalle de item con stats, affixes, comparacion Actual vs Nuevo y action row.

---

### 3. Combat HUD / Enemy Stage

Por que falta:

- Combat es la pantalla mas riesgosa.
- El kit tiene barras HP y feedback, pero no el modulo completo: enemigo, stage, HP con delayed damage, side actions, log, boss semanal.

Pedido sugerido:

> Diseña un modulo Combat HUD para Forge Light Premium:
> - stage de enemigo;
> - barra HP jugador y enemigo;
> - barra con "damage shadow/delayed damage";
> - estado boss con multiples barras o fases;
> - side actions compactas;
> - combat log compacto;
> - feedback flotante de daño/crit/heal.
> La estetica de las barras debe seguir el kit actual.

---

### 4. Weekly Boss Card

Por que falta:

- El usuario quiere que el weekly boss siga pudiendo mostrar varias barras de vida.
- La decision fue panel normal con badge danger y glow rojo, no danger fuerte completo.

Pedido sugerido:

> Diseña una Weekly Boss Card para Forge Light Premium:
> - panel normal con badge danger;
> - glow rojo oscuro sutil;
> - portrait o icon frame;
> - multiples barras de vida/fases visibles;
> - rewards;
> - attempts/estado semanal;
> - CTA principal y accion secundaria.
> Evitar fondo rojo completo.

---

### 5. Crafting Result / Forge Action Module

Por que falta:

- Crafting ya tiene una direccion, pero el kit no muestra un modulo completo de resultado de forja.
- El usuario marco que el costo puede ir en el boton para Forja.

Pedido sugerido:

> Diseña un modulo de Forja para Forge Light Premium:
> - item seleccionado;
> - CTA Principal especial para forjar/mejorar con costo embebido en el boton;
> - resultado exitoso/fallido;
> - preview de cambio de stats;
> - entropy bar;
> - upgrade track;
> - selector de modo usando la tercera fila de Secondary / Segmented Tabs.

---

## Prioridad Media

### 6. Sanctuary Station Card Completa

Por que falta:

- El kit tiene Station Cards y al usuario le gustan.
- Pero faltan estados: locked, spotlight onboarding, claimable, active job, unavailable.

Pedido sugerido:

> Extiende Station Cards de Santuario con estados:
> - normal;
> - activa;
> - bloqueada;
> - con job en progreso;
> - con reward/claim disponible;
> - spotlight/onboarding.
> Mantener boton Abrir como primary/default segun el kit.

---

### 7. Talent Card / Locked State

Por que falta:

- El usuario aclaro que `FlRequirementHint` quizas deberia ser solo locked tag en la card del talento.
- Falta una referencia clara del panel detalle de talento.

Pedido sugerido:

> Diseña Talent Detail Card para Forge Light Premium:
> - nodo disponible;
> - nodo bloqueado con locked tag;
> - nodo comprado;
> - requisitos compactos;
> - CTA comprar/mejorar;
> - icon frame circular para nodo.

---

### 8. Pagination / Stepper

Por que falta:

- El kit tiene dots de paginacion y step indicators, pero Codex necesita botones prev/next + label.

Pedido sugerido:

> Diseña una paginacion compacta para Forge Light Premium:
> - previous/next icon buttons;
> - label central "2 / 8";
> - disabled state;
> - variante dots opcional.

---

## No Hace Falta Pedir Mas Por Ahora

Estos ya estan suficientemente cubiertos por el UI Kit y tus decisiones:

- `FlButton`
- `FlIconButton`
- `FlTabs`
- `FlBottomNav`
- `FlHeaderBar`
- `FlCard`
- `FlPanel`
- `FlBadge`
- `FlTag`
- `FlResourceCounter`
- `FlResourcePill`
- `FlProgressBar`
- `FlHealthBar` base
- `FlStatRow`
- `FlStatStrip`
- `FlIconFrame`
- rareza base de items

---

## Mi Recomendacion de Orden

1. Pedir ahora: Empty State, Inventory Dense Row, Combat HUD, Weekly Boss Card, Crafting Result Module.
2. Seguir implementando base mientras llegan esos diseños.
3. No migrar Combat completo hasta tener Combat HUD y Weekly Boss Card.
4. No migrar Inventory completo hasta tener Dense Row + Item Detail.
5. Sanctuary puede avanzar con el Station Card existente del kit, aunque seria mejor tener estados extendidos.

