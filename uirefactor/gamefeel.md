# Consejos para el refactor visual — Feedback y Game Feel

Objetivo:
La app hoy funciona, pero se siente plana. El foco del refactor no es cambiar reglas ni lógica, sino hacer que cada acción importante tenga respuesta visual clara, inmediata y satisfactoria.

---

# 1. Principio central

Cada vez que el jugador hace algo, la UI debe responder.

Si el jugador:
- ataca
- recibe daño
- sube de nivel
- mejora un item
- reclama un trabajo
- compra un talento
- equipa un item
- gana recursos

Entonces debe haber:
- cambio visual inmediato
- microanimación
- texto/feedback claro
- confirmación de resultado

Nada importante debe pasar “silenciosamente”.

---

# 2. Prioridad máxima: combate

## 2.1 Floating combat text

Implementar textos flotantes sobre el enemigo y cerca del jugador.

Tipos mínimos:

### Daño normal al enemigo
- color rojo claro
- tamaño medio
- sube y desaparece
- duración 450–600ms

Ejemplo:
`-248`

### Crítico
- color dorado/naranja
- tamaño mayor
- bold
- pequeña animación de escala
- debe sentirse más importante que daño normal

Ejemplo:
`CRÍTICO -1,240`

### Daño recibido por el jugador
- color rojo
- aparece cerca del panel del héroe
- animación más corta

Ejemplo:
`-66`

### Curación / regeneración
- color verde
- sube lentamente
- duración un poco más larga

Ejemplo:
`+124`

### Daño por estado
- veneno: verde
- sangrado: rojo oscuro
- quemadura: naranja/rojo
- debe ser más chico que daño directo

Ejemplo:
`Veneno -42`

---

## 2.2 Barras de vida animadas

No actualizar HP de golpe de forma seca.

Usar:
- transición suave del fill
- overlay de “daño reciente” con pequeño delay
- flash muy breve cuando el enemigo recibe golpe

Para enemigo:
- HP roja
- flash blanco/rojo al hit
- shake leve si el golpe es crítico

Para jugador:
- HP verde o roja según decisión visual
- si HP < 30%, pulso sutil de peligro
- si recibe golpe fuerte, shake corto del panel

---

## 2.3 Estados activos

Los estados no deben ser texto plano.

Usar badges o iconos para:
- veneno
- sangrado
- quemadura
- bloqueo
- esquiva
- marca
- aturdimiento

Cada estado debería mostrar:
- icono
- color
- duración o stacks si aplica

Ejemplo:
`[☠ 5s] [🔥 3s]`

---

# 3. Crafting / Forja

El crafting es una de las partes más importantes del juego. No puede sentirse como apretar un botón plano.

## 3.1 Mejorar item

Secuencia recomendada:

1. jugador toca “Mejorar”
2. botón se hunde inmediatamente
3. aparece barra/progreso corto de forja
4. item/card hace glow naranja
5. número de upgrade salta
6. aparece toast de resultado
7. recursos consumidos hacen pequeño flash

Ejemplo:
`+7 → +8`

---

## 3.2 Éxito

Feedback:
- glow naranja/verde
- número animado
- toast

Texto:
`Mejora exitosa`
`Hacha mejorada a +8`

---

## 3.3 Fallo

No debe pasar desapercibido.

Feedback:
- shake corto
- flash rojo
- sonido futuro opcional
- toast claro

Texto:
`La forja resistió`
`No hubo mejora`

---

## 3.4 Hitos

Los hitos deben sentirse especiales.

Recomendado:
- +5: glow leve
- +10: glow fuerte + partículas
- +15: animación especial

Textos:
`Pieza refinada +5`
`Pieza magistral +10`
`Obra maestra +15`

---

# 4. Santuario / trabajos con timer

El Santuario debe comunicar progreso constante.

## 4.1 Trabajo en progreso

Mostrar:
- barra de progreso animada
- tiempo restante
- estado claro

Ejemplo:
`En progreso... 34m 59s`
`42%`

La barra no debe ser estática. Debe actualizarse suavemente.

---

## 4.2 Trabajo listo

Debe llamar la atención sin ser molesto.

Feedback:
- badge verde “Listo”
- pequeño glow del card
- botón principal “Reclamar”
- botón secundario con icono de repetir

Evitar texto largo tipo:
`Reclamar + repetir`

Mejor:
`[Reclamar] [↻]`

---

## 4.3 Reclamar recompensa

Al reclamar:
- card hace pulse
- recursos ganados flotan hacia el header
- toast con resumen

Ejemplo:
`+12,430 oro`
`+320 esencia`

---

# 5. Talentos

Comprar talentos debe sentirse como desbloquear poder.

## 5.1 Nodo disponible

Debe ser visualmente distinto del bloqueado:
- borde más claro
- glow sutil
- badge “Disponible”

---

## 5.2 Nodo comprado

Feedback:
- pulse dorado
- línea hacia el siguiente nodo se ilumina
- puntos disponibles bajan con animación
- toast

Texto:
`Talento aprendido: Entrenamiento Físico`

---

## 5.3 Nodo bloqueado

No alcanza con deshabilitarlo.

Debe explicar:
- por qué está bloqueado
- qué falta

Ejemplo:
`Requiere 3 puntos en Básicos`

---

# 6. Inventario e items

## 6.1 Equipar item

Al equipar:
- item se mueve o hace flash hacia slot equipado
- aparece delta de stats
- toast corto

Ejemplo:
`Equipado`
`DPS +7.4%`

---

## 6.2 Comparación

Mostrar primero impacto global:
- DPS
- supervivencia
- economía

Después detalle.

Ejemplo:
```text
DPS +7.4%
SUP -1.2%
ECO +0.0%

## 6.3 Extraer / vender

**Al extraer:**
- el item se disuelve / fade out
- los recursos ganados aparecen
- el contador de recursos hace flash

**Ejemplo:**
- `+24 esencia`

---

## 7. Botones

Todos los botones deben tener estados.

### Estados mínimos:
- default  
- hover  
- pressed  
- disabled  
- loading  
- success  
- error  

### Pressed
- scale: 0.97  
- duración: 50–80ms  

### Hover
- glow o borde más claro  
- scale muy leve  

### Disabled
- opacidad menor  
- tooltip o texto que explique por qué  

### Loading
- spinner o barra  
- texto temporal  

**Ejemplos:**
- `Forjando...`  
- `Reclamando...`  

---

## 8. Toasts y mensajes

Usar toasts para confirmar acciones importantes.

### Tipos:
- success  
- error  
- warning  
- milestone  
- loot  

### Duración:
- normal: 2s  
- error: 3s  
- hito: 4s  

### Ejemplos:
- `Mejora exitosa: +8`  
- `No hay suficiente esencia`  
- `Trabajo reclamado`  
- `Nuevo talento aprendido`  
- `Obra maestra alcanzada: +15`  

---

## 9. Recursos

Cuando cambia oro, esencia, XP o fuego:

- el contador debe animar el cambio  
- flash breve en el recurso  
- si viene de una recompensa, mostrar mini *fly-to-header* si es viable  

**Ejemplo:**
- `+320 esencia` aparece cerca del botón y viaja / fadea hacia el contador  

---

## 10. Reglas de timing

Usar animaciones rápidas. La UI debe sentirse responsiva, no lenta.

### Recomendado:
- click / pressed: 50–80ms  
- hover: 120–160ms  
- floating text: 450–650ms  
- barras: 250–500ms  
- crafting importante: 400–700ms  
- milestone: 800–1200ms  

### Evitar:
- animaciones largas para acciones repetitivas  
- bloquear demasiado la UI  
- exceso de partículas  

---

## 11. Performance

Como es mobile-first:

- limitar cantidad de floating texts simultáneos  
- agrupar daño si hay demasiados ticks por segundo  
- evitar sombras muy pesadas en muchos elementos  
- usar transform / opacity para animaciones  
- evitar animar layout si se puede  
- preferir CSS transitions simples  

### Si hay más de 5 textos flotantes simultáneos:
- combinar daño en un solo número  
- o reducir tamaño / opacidad de los secundarios  

---

## 12. Implementación sugerida

Crear componentes reutilizables:

- `FloatingCombatText`  
- `AnimatedProgressBar`  
- `GameToast`  
- `GameButton`  
- `StatusBadge`  
- `ResourceCounter`  
- `RewardFlyout`  
- `ItemUpgradeFeedback`  
- `TalentNode`  
- `JobCard`  

No hardcodear animaciones por pantalla si pueden ser componentes.

---

## 13. Criterio de éxito

Después del refactor, estas preguntas deben responderse con “sí”:

- ¿Se siente cuando pego un golpe?  
- ¿Se siente cuando recibo daño?  
- ¿Se siente cuando mejoro un item?  
- ¿Se entiende cuándo un trabajo está listo?  
- ¿Se siente bien reclamar recompensas?  
- ¿Se nota cuando compro un talento?  
- ¿Los botones responden al toque?  
- ¿La UI parece viva aunque el juego sea idle?  

Si la respuesta es “no”, falta feedback visual.

---

## 14. Regla final

No cambiar la lógica del juego para este refactor.

### El objetivo es:
- mantener sistemas actuales  
- mejorar percepción  
- mejorar claridad  
- mejorar satisfacción  
- hacer que la app se sienta como juego real  

**Primero game feel.  
Después balance.**