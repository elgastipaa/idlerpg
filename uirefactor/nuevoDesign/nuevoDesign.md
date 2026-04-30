# Forge Light Design System
Sistema visual y de interacción para Idle RPG mobile  
Versión: v1.0 (baseline estable)

---

# 1. FILOSOFÍA VISUAL

## Objetivo
Transmitir:
- poder
- progreso
- control
- peso (no UI liviana tipo app)

## Identidad
Forge Light =  
**dark fantasy + metal trabajado + claridad moderna**

---

## Reglas base

- Fondo oscuro SIEMPRE
- Dorado = estructura (NO decoración)
- Color = semántica (NO base)
- Nada flat
- Nada “mobile app genérica”

---

## Anti-estilo (PROHIBIDO)

- ❌ botones verdes como CTA principal  
- ❌ UI blanca / clara  
- ❌ sombras suaves tipo SaaS  
- ❌ gradientes modernos saturados  
- ❌ iconos cartoon  

---

# 2. PALETA Y USO DE COLOR

## Base
- Fondo principal: #0B0F14
- Superficie: #121821
- Card: #161D27

---

## Dorado (estructura)
- Borde: #C6A15B
- Glow leve: #E6C47A
- Hover: #F0D28A

👉 uso:
- bordes
- separadores
- highlights
- botones primarios

---

## Colores semánticos

### Verde (vida / positivo)
- #4FD18B

### Rojo (daño / negativo)
- #E05A5A

### Violeta (arcano / XP / ecos)
- #8A5BE8

### Azul (defensa / estabilidad)
- #4A8FE7

### Amarillo/Naranja (recompensa / oro)
- #F2B84B

---

## Regla crítica

👉 El dorado manda  
👉 Los colores acompañan  

---

# 3. TIPOGRAFÍA

## Jerarquía

### Título principal
- peso alto
- tracking leve
- color blanco o dorado

### Subtítulo
- gris claro
- menor tamaño

### Label
- gris medio

### Número
- blanco fuerte
- a veces dorado si es importante

---

## Reglas

- Los números son protagonistas
- Evitar bloques largos de texto
- Siempre priorizar escaneo rápido

---

# 4. BOTONES

## Tipos

### Primario (DORADO)
Uso:
- acciones principales

Estados:
- default → borde dorado + fondo oscuro
- hover → glow dorado
- pressed → scale 0.97
- disabled → gris oscuro + baja opacidad
- loading → spinner interno

---

### Secundario (OSCuro)
Uso:
- acciones secundarias

Estados:
- borde gris/dorado tenue
- hover → leve iluminación
- pressed → scale

---

### Ghost (texto)
Uso:
- acciones menores

---

## Reglas

- ❌ NO botones verdes como base
- ✔ Dorado para acciones clave

---

# 5. CARDS / CONTENEDORES

## Tipos

### Card base
- fondo oscuro
- borde dorado fino
- sombra interna leve

---

### Card hover
- glow dorado leve
- borde más visible

---

### Card seleccionada
- glow más fuerte
- borde activo

---

### Card premium (items raros)
- borde + color de rareza (sutil)
- leve glow

---

## Reglas

- Siempre sensación de “placa metálica”
- Evitar flat design

---

# 6. RAREZAS

## Escala

- Común → gris
- Mágico → verde
- Raro → azul
- Épico → violeta
- Legendario → dorado intenso

---

## Aplicación

- borde del item
- badge
- glow leve

---

## Regla

👉 Nunca saturar  
👉 Siempre sutil

---

# 7. ICON FRAMES

Tipos:

- normal
- activo
- mejorado
- épico
- legendario

Uso:
- talentos
- items
- stats

---

# 8. BARRAS

## Tipos

### HP
- verde
- glow leve

### XP
- violeta

### Progreso
- dorado o neutro

---

## Estados

- progreso normal
- éxito (verde glow)
- error (rojo)
- loading (animada)

---

## Reglas

- animaciones rápidas
- no saturar efectos

---

# 9. TEXTO / NÚMEROS

## Reglas

- números grandes
- texto corto
- jerarquía clara

---

## Ejemplo

- DPS → grande
- descripción → secundaria

---

# 10. FEEDBACK VISUAL (CRÍTICO)

## Tipos

### Daño
- rojo
- flota hacia arriba

### Crítico
- más grande
- color destacado

### Curación
- verde

### Éxito
- glow + texto

### Error
- rojo + breve shake

---

## Timing

- 400–600ms

---

# 11. BADGES / TAGS

Uso:
- estados
- rarezas
- filtros

Tipos:
- nuevo
- equipado
- bloqueado
- mejorable

---

# 12. LOOT / ITEMS

## Item Card

Debe tener:

- icono claro
- rareza visible
- stats en chips
- poder visible

---

## Interacción

- tap → detalle
- long press → preview
- hover → glow

---

# 13. LAYOUT

## Reglas

- 1 foco por pantalla
- spacing generoso
- scroll vertical
- headers claros

---

## Estructura base

- header
- contenido
- footer/nav

---

# 14. NAVEGACIÓN

## Bottom Nav
- iconos + label
- activo → dorado
- notificaciones → badge

---

## Tabs
- claros
- activos → resaltados

---

# 15. FEEDBACK DE SISTEMA

## Toasts
- éxito
- error
- recompensa

Duración:
- 2–4s

---

## Animaciones

- rápidas
- funcionales
- nunca decorativas

---

# 16. REGLAS DE ORO

1. El dorado estructura
2. El color comunica
3. Los números dominan
4. Nada flat
5. Todo responde al input
6. Menos UI → más claridad
7. Todo se debe sentir “pesado” y real

---

# 17. CRITERIO DE ÉXITO

La UI está bien si:

- se siente cada click
- se entiende cada decisión
- el loot se siente valioso
- el progreso se percibe
- no hay ruido visual
- todo parece parte del mismo juego

---

# 18. USO CON IA

Siempre acompañar con:

- este documento
- UI Kit visual
- prompt fijo

---

# FINAL

Este documento define el lenguaje visual Forge Light.  
Cualquier desviación rompe coherencia.

👉 Si algo no encaja, NO se usa.
