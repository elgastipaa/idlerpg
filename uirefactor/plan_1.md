Necesito que analices TODAS las capturas de UI del juego (incluyendo las versiones iteradas y referencias estilo Forge Light) y construyas un DESIGN.MD profundo.

IMPORTANTE:
No quiero una descripción superficial del estilo.
No quiero copiar visuales.
Quiero un SISTEMA DE DISEÑO que permita reconstruir ese estilo correctamente.

---

## OBJETIVO

Capturar la esencia visual real del estilo Forge Light aplicado al juego:

- oscuro pero legible
- premium pero no recargado
- cálido (gold/orange) pero controlado
- moderno pero con identidad fantasy

---

## PROBLEMA ACTUAL

Las implementaciones fallan porque:

- usan demasiado dorado → saturación
- usan demasiado gris → pierde identidad
- no hay jerarquía clara
- no entienden cuándo usar cada color
- no entienden capas visuales

---

## LO QUE NECESITO QUE GENERES

Un design.md estructurado en estas secciones:

---

### 1. FILOSOFÍA VISUAL

- Qué transmite el estilo
- Qué sensaciones debe generar
- Qué lo diferencia de:
  - UI genérica
  - fantasy recargado
  - dark mode estándar

---

### 2. SISTEMA DE CAPAS (CRÍTICO)

Definir claramente:

- background (nivel 0)
- surface/cards (nivel 1)
- elementos interactivos (nivel 2)
- highlights (nivel 3)

Explicar:
- colores
- contraste
- cómo se separan visualmente

---

### 3. SISTEMA DE COLOR (MUY IMPORTANTE)

NO listar colores sueltos.

Definir:

#### Base
- fondo
- cards
- bordes

#### Texto
- primario
- secundario
- deshabilitado

#### Estados
- success (verde)
- progress (azul)
- error (rojo)

#### Accento (CLAVE)
- dorado:
  - cuándo usar
  - cuándo NO usar
  - intensidad
  - ejemplos correctos vs incorrectos

---

### 4. REGLAS DE DORADO (ESTO ES LO QUE MÁS FALLA)

Definir reglas estrictas:

- qué elementos pueden usar dorado fuerte
- qué elementos solo dorado suave
- qué elementos NO deben usar dorado

Incluir ejemplos tipo:

❌ incorrecto:
- bordes dorados en todas las cards

✅ correcto:
- dorado solo en acciones primarias

---

### 5. COMPONENTES BASE

Definir cómo se construyen:

- cards
- botones
- badges
- barras de progreso
- iconos
- secciones

Para cada uno:
- fondo
- borde
- estados (hover, active, disabled)

---

### 6. JERARQUÍA VISUAL

Explicar:

- cómo se identifica el foco de la pantalla
- cómo se diferencian:
  - primario
  - secundario
  - terciario

Ejemplo:
- trabajos > estaciones

---

### 7. FEEDBACK VISUAL

Definir:

- qué acciones generan feedback
- cómo se ve ese feedback

Ejemplo:
- reclamar → glow + toast
- progreso → barra animada

---

### 8. ESPACIADO Y DENSIDAD

Definir:

- padding de cards
- spacing entre secciones
- densidad ideal mobile

---

### 9. ERRORES COMUNES (MUY IMPORTANTE)

Listar:

- demasiado dorado
- demasiado gris
- falta de jerarquía
- botones indistinguibles
- saturación visual

---

### 10. PRINCIPIOS DE VALIDACIÓN

Reglas para saber si está bien implementado:

- ¿se entiende en 2 segundos?
- ¿hay un foco claro?
- ¿el dorado guía la atención?

---

## FORMATO

El design.md debe ser:

- claro
- estructurado
- accionable
- usable por otra IA para implementar UI correctamente

---

## RESTRICCIÓN

No diseñar pantallas nuevas.
No hacer mockups.
No inventar estilos nuevos.

Solo abstraer el sistema visual que ya está implícito en las capturas.

---

## OBJETIVO FINAL

Que cualquier IA pueda reconstruir la UI correctamente SIN ver las imágenes, solo leyendo este design.md.