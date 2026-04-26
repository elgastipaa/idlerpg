    Sos el asistente que tiene acceso completo al código fuente de este proyecto de videojuego.

Tu tarea es generar un documento llamado `GAME_DESIGN_BRIEF.md` que funcione como **handoff completo para una sesión de diseño externa**. Este documento será leído por diseñadores o IAs que no tienen acceso al código y que necesitan entender el estado actual del proyecto para proponer mejoras, tomar decisiones de diseño y detectar problemas.

---

### INSTRUCCIONES GENERALES ANTES DE EMPEZAR

Antes de escribir una sola sección, hacé lo siguiente:

1. **Explorá el código completo**: recorré todos los archivos del proyecto, incluyendo constantes, configs, datos hardcodeados, comentarios TODO/FIXME, y cualquier archivo de datos (JSON, CSV, etc.).
2. **Identificá lo que está implementado vs. lo que es placeholder**: si una función existe pero retorna valores hardcodeados o está vacía, marcala como incompleta, no como implementada.
3. **No asumas nada**: si algo no está claro en el código, decilo explícitamente en el documento con la etiqueta `[INFERIDO]` o `[NO ENCONTRADO EN CÓDIGO]`.
4. **No incluyas código fuente**: solo descripciones funcionales, pseudocódigo donde sea necesario para explicar lógica, y fórmulas matemáticas simples.
5. **Sé exhaustivo pero no redundante**: cada sección debe aportar información nueva. Si algo ya se explicó, referencíalo en lugar de repetirlo.

El tono debe ser **técnico pero legible**: como si escribieras para un game designer senior que no es programador pero entiende sistemas. Sin jerga de código, sin variable names en crudo (traducílas a nombres descriptivos).

---

## 1. VISIÓN GENERAL

- **Género y concepto central**: describilo en 2-3 líneas. Incluí la fantasía que el juego quiere vender ("el jugador se siente como...").
- **Inspiraciones o referencias detectables**: si el código, comentarios o nombres de variables sugieren referencias a otros juegos, mencionálas.
- **Plataforma target y stack técnico relevante para diseño**: ¿web? ¿mobile? ¿desktop? ¿single-file HTML? ¿React? ¿qué implica eso para el diseño?
- **Estado actual del proyecto**: porcentaje estimado de completitud, qué está jugable hoy, qué no.
- **Sesión típica de juego hoy**: si alguien abre el juego ahora, ¿qué puede hacer? ¿cuánto dura esa experiencia?

---

## 2. SISTEMAS IMPLEMENTADOS

Por **cada sistema funcional** que encuentres en el código, generá una entrada con este formato:

### [Nombre del sistema]
- **Qué hace**: descripción funcional en 3-5 líneas. Qué problema resuelve para el jugador.
- **Cómo funciona internamente** (sin código): flujo de decisiones, triggers, condiciones.
- **Parámetros clave que lo gobiernan**: listá los valores relevantes (con sus valores actuales si están hardcodeados). Ejemplo: "Cooldown base: 3 segundos. Modificable por stat X."
- **Decisiones de diseño ya tomadas**: qué está fijo y no es fácilmente modificable sin refactoring.
- **Interacciones con otros sistemas**: qué otros sistemas afecta o de cuáles depende.
- **Limitaciones o edge cases conocidos**: bugs conocidos, comportamientos raros, casos no manejados.

Sistemas a buscar (no limitarse a estos): combate, progresión/XP/niveles, economía/monedas/recursos, inventario/loot/drops, habilidades/skills/cooldowns, crafting, mapa/exploración, IA de enemigos, guardado/carga de estado, sistema de quests o misiones, multijugador o async features, meta-progresión, sistema de tiempo (idle, offline progress), UI/HUD reactivo.

---

## 3. SISTEMAS PENDIENTES O INCOMPLETOS

Dividí en tres categorías:

### 3.1 Planeados pero no implementados
- Sistemas que existen como comentarios, TODOs, nombres de funciones vacías, o referencias en el código pero sin lógica real.

### 3.2 Implementados pero incompletos
- Sistemas que corren pero tienen lógica placeholder, valores hardcodeados temporales, o funcionalidad parcial. Describí qué falta específicamente.

### 3.3 Decisiones de diseño abiertas
- Preguntas de diseño que el código deja sin responder. Ejemplo: "El sistema de drops existe pero la distribución de rareza no está balanceada — los valores actuales parecen arbitrarios."

---

## 4. DATOS Y BALANCE ACTUALES

Esta sección es crítica. Extraé todos los números del juego y presentálos de forma legible:

- **Stats de personaje/entidades**: valores base, rangos, fórmulas de escalado.
- **Curvas de progresión**: XP por nivel, costo de upgrades, tiempo estimado por etapa si es calculable.
- **Economía**: tasas de generación de recursos, costos, inflación implícita.
- **Combate**: rangos de daño, fórmulas de hit/miss/crit si existen, cooldowns, duración de efectos.
- **Drop rates y loot**: probabilidades, tablas de loot si existen.
- **Timings**: cualquier valor de tiempo relevante para el diseño (spawns, cooldowns, duraciones).

Para cada fórmula, escribila así:
```
daño_final = (ataque_base + bonus_equipo) × multiplicador_crítico - defensa_enemigo
```
Si los valores parecen placeholder o sin razonamiento aparente, indicálo con `[BALANCE PENDIENTE]`.

---

## 5. UX Y FLUJO DE JUEGO

- **Pantallas o vistas existentes**: listá cada una y describí qué hace el jugador ahí (1-3 líneas por pantalla).
- **Gameplay loop principal**: describilo como un ciclo. Ejemplo: "El jugador entra → combate auto → recibe loot → gasta recursos en upgrades → vuelve a combate".
- **Loop secundario o meta-loop** si existe.
- **Flujo idle vs. activo**: si el juego tiene componente idle, describí qué pasa cuando el jugador no está presente.
- **Puntos de decisión del jugador**: ¿dónde el jugador toma decisiones reales? ¿qué tan frecuentes son?
- **Feedback existente**: qué feedback visual o sonoro hay actualmente (animaciones, partículas, sonidos, texto flotante, shakes, etc.). Sé específico: "hay un shake de cámara al recibir daño crítico" vs. "hay feedback visual".
- **Friction points detectables**: momentos donde el flujo se corta, el jugador espera sin información, o la UI no da contexto suficiente.

---

## 6. INTERFAZ (UI)

- **Componentes visuales principales**: listá cada elemento de UI relevante (HUD, menús, popups, tooltips, barras, etc.) y describí su función y comportamiento.
- **Estética actual**: paleta de colores si es detectable, estilo visual (pixel art, flat, skeuomórfico, etc.), tipografía si es relevante.
- **Referencias estéticas inferidas**: si el estilo evoca algún juego o género conocido, mencionálo.
- **Responsividad y adaptación**: ¿la UI se adapta a distintos tamaños de pantalla? ¿hay breakpoints?
- **Problemas de UI conocidos**: bugs visuales, elementos que se superponen, falta de feedback, textos hardcodeados, falta de localización, etc.
- **Áreas de UI que claramente necesitan trabajo**: sé directo, no lo suavices.

---

## 7. PREGUNTAS ABIERTAS DE DISEÑO

Generá una lista priorizada de decisiones de diseño que el proyecto todavía no resolvió. Para cada una:

- **Pregunta**: formulada como pregunta concreta de diseño.
- **Contexto**: por qué es una pregunta abierta, qué hay actualmente en el código que la hace urgente o relevante.
- **Impacto estimado**: Alto / Medio / Bajo — qué tan bloqueante es para el resto del diseño.
- **Opciones posibles** (si las hay): no las respondas, solo enumerá las direcciones posibles si el código sugiere que se consideraron varias.

Ejemplo de formato:
> **¿Debe el jugador poder perder progresión al morir?**
> Actualmente la muerte resetea el combate pero no descuenta recursos. Esto puede hacer el juego trivial.
> Impacto: Alto. Opciones: permadeath parcial, penalización de recursos, sin penalización.

---

## 8. RESTRICCIONES TÉCNICAS RELEVANTES PARA DISEÑO

Cosas que el diseño NO puede ignorar:

- **Arquitectura**: ¿es single-file? ¿hay separación de concerns? ¿qué implica agregar un sistema nuevo?
- **Performance**: ¿hay limitaciones de rendering, loops pesados, o estructuras de datos que limiten la escala del contenido?
- **Persistencia**: ¿cómo se guarda el estado? ¿qué se puede y qué no se puede persistir fácilmente?
- **Dependencias externas**: APIs, bases de datos, servicios externos que el diseño debe considerar.
- **Deuda técnica relevante**: si hay partes del código que son frágiles y que el diseño debería evitar tocar o que limitan la expansión.
- **Tiempo estimado de implementación** para cambios de diseño comunes (si podés inferirlo): "agregar un nuevo tipo de enemigo requeriría modificar N sistemas".

---

## 9. GLOSARIO DEL PROYECTO

Listá los términos propios del juego con su definición funcional. Incluí:
- Nombres de entidades, mecánicas, o sistemas con nombres propios.
- Abreviaturas usadas en el código que se usan como conceptos de diseño.
- Cualquier término que una persona externa necesitaría conocer para entender el documento.

---

### INSTRUCCIONES FINALES

- El documento debe poder leerse de corrido sin necesidad de ver el código.
- Si encontrás inconsistencias entre distintas partes del código (por ejemplo, dos sistemas que se contradicen), marcálas explícitamente.
- Al final del documento, agregá una sección breve llamada **"Lo más urgente"**: las 3-5 cosas que, en tu evaluación, son las decisiones de diseño más críticas o los problemas más bloqueantes del proyecto en este momento.
- Guardá el archivo como `GAME_DESIGN_BRIEF.md` en la raíz del proyecto.