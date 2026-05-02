Estoy refactorizando la UI de un juego idle RPG dark fantasy y necesito que construyas un sistema de diseño completo, pero trabajando por FASES y partiendo de lo que ya existe.

IMPORTANTE:

* No quiero que diseñes todo de una sola vez
* Quiero que estructures el trabajo en fases claras y ejecutes cada fase de forma ordenada
* El objetivo es evolucionar el sistema actual, no rehacer todo desde cero

Contexto:

* El juego ya tiene todas las pantallas diseñadas
* Hay mucha inconsistencia por CSS inline y estilos aislados
* Existe un archivo previo de estilos/componentes (te voy a indicar el nombre) que debe tomarse como referencia parcial (no como verdad absoluta)
* El layout de las pantallas YA está definido (NO rediseñarlo), pero debe integrarse al sistema como patrones reutilizables

Objetivo final:
Definir un sistema de diseño coherente, escalable y reutilizable que incluya:

1. Tokens (colores, spacing, tipografía, radios, sombras, texturas, etc.)
2. Componentes con variantes controladas
3. Layouts existentes convertidos en patrones reutilizables
4. Documentación clara en un único archivo tipo Design System (Markdown)

---

# FASES OBLIGATORIAS

FASE 1 — Auditoría

* Identificar todos los componentes actuales:
  cards, panels, buttons, badges, item containers, modals, logs, etc.
* Analizar el layout de las pantallas:
  estructura, spacing, jerarquía, patrones repetidos
* Detectar inconsistencias:
  estilos duplicados, componentes similares con diferencias mínimas, problemas de jerarquía visual
* Analizar el archivo de referencia:
  qué sirve, qué sobra, qué contradice el resto

Output Fase 1:

* Lista de componentes detectados
* Agrupaciones iniciales
* Problemas principales del sistema actual

---

FASE 2 — Simplificación y agrupación

* Agrupar componentes por intención (no por pantalla)
* Detectar redundancias y proponer unificación
* Definir un set reducido de variantes (ej: ghost, surface, raised, ornate, danger)

Output Fase 2:

* Mapa simplificado de componentes
* Lista de redundancias eliminadas
* Set inicial de variantes

---

FASE 3 — Definición de tokens

* Definir tokens base:
  colores, superficies, bordes, sombras, spacing, radios, tipografía, estados, rarezas
* Evitar valores hardcodeados
* Alinear tokens con la estética dark fantasy / RPG premium

Output Fase 3:

* Lista estructurada de tokens
* Naming consistente

---

FASE 4 — Sistema de componentes

* Definir componentes base reutilizables:
  Panel, Card, Button, Badge, Section, ItemCard, Modal, etc.
* Cada componente debe usar tokens y aceptar variantes:
  variant, tone, size, density, rarity, etc.

Output Fase 4:

* Lista de componentes
* Props/variantes de cada uno
* Relación con tokens

---

FASE 5 — Sistema de layout

* NO rediseñar layouts existentes
* Identificar patrones de layout ya usados:
  stack, grid, split, focus, list, etc.
* Convertirlos en patrones reutilizables
* Definir reglas de spacing, estructura y jerarquía

Output Fase 5:

* Lista de patrones de layout
* Reglas de uso
* Estructura base de pantalla

---

FASE 6 — Reglas de uso

* Definir reglas claras:
  cuándo usar cada variante
  cuándo NO usarla
  qué es contenido principal vs secundario vs premium
* Evitar ambigüedad

Output Fase 6:

* Guía de decisiones

---

FASE 7 — Documentación final

* Unificar todo en un solo documento tipo Design System (Markdown)
* Incluir:

  * tokens
  * componentes
  * variantes
  * layouts
  * reglas de uso
* Estructurarlo para que sea fácil de mantener y expandir

---

CRITERIOS IMPORTANTES

* No buscar uniformidad total → buscar coherencia visual con variedad controlada
* Priorizar simplificación sobre cantidad de variantes
* Evitar sobre-diseño
* Todo debe poder implementarse en código de forma clara
* No inventar cosas que no existan en el juego sin justificación

---

MODO DE TRABAJO

* Avanzar fase por fase
* No saltar a la siguiente sin cerrar la anterior
* Explicar decisiones clave en cada fase
* Pensar como diseñador de sistemas, no como generador de UI

---

OUTPUT FINAL ESPERADO

Un sistema de diseño completo documentado, basado en el juego actual, listo para ser implementado y mantenido, con:

* consistencia visual
* claridad estructural
* reutilización de componentes
* integración del layout existente


# INPUT ADICIONAL:

Te voy a proporcionar un archivo HTML que contiene múltiples componentes UI ya diseñados, se llama kit-forge-light.html

* botones
* toggles (on/off switches)
* tabs
* iconos
* variaciones de estilos

Este archivo representa un intento previo de estandarización de componentes, pero:

* puede contener redundancias
* puede tener inconsistencias
* puede estar sobre-diseñado en algunas partes

Tu tarea con este archivo:

1. Analizar los componentes incluidos
2. Detectar patrones visuales y variantes
3. Identificar redundancias (componentes similares con pequeñas diferencias)
4. Evaluar qué partes son reutilizables dentro del sistema
5. Detectar qué componentes deberían unificarse o simplificarse
6. Integrar estos componentes dentro del sistema propuesto (tokens + componentes + layout)

IMPORTANTE:

* No tomar este archivo como fuente de verdad absoluta
* No replicar automáticamente su estructura
* Usarlo como input para mejorar y simplificar el sistema general

# FORMATO DE ENTREGA SUGERIDO:

Organizá el output por fases, respetando esta estructura:

FASE 1 — Auditoría

* Componentes detectados
* Agrupaciones iniciales
* Problemas principales

FASE 2 — Simplificación

* Redundancias encontradas
* Agrupación en variantes
* Componentes eliminados/unificados

FASE 3 — Tokens

* Lista de tokens propuesta
* Naming y categorías

FASE 4 — Componentes

* Componentes base definidos
* Variantes y props

FASE 5 — Layout

* Patrones de layout detectados
* Reglas de uso
* Estructura de pantalla

FASE 6 — Reglas de uso

* Guía de decisiones (cuándo usar cada cosa)

FASE 7 — Design System final

* Documento unificado (formato Markdown)
* Listo para implementación

IMPORTANTE:

* Mantené el output claro y estructurado
* Evitá redundancias entre fases
* Priorizá claridad sobre volumen
* No agregues contenido innecesario
