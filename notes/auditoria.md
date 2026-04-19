# Prompt: Auditoría y Rediseño de UI/UX — IdleRPG

## Tu rol
Actuá como Lead UI/UX Designer especializado en mobile-first 
idle games y ARPGs. Analizá todos los archivos del proyecto 
antes de responder.

## El problema
El juego tiene demasiadas tabs y sistemas. La UI está saturada 
para el jugador mobile. No hay jerarquía clara de qué es 
importante ver en cada sesión. Los sistemas nuevos (time-gated, 
Abismo, prestige expandido) no tienen lugar definido en la 
arquitectura actual.

## Lo que necesito

### 1. Auditoría de tabs actuales
Para cada tab existente:
- ¿Qué información es realmente necesaria ahí?
- ¿Qué puede moverse, fusionarse o eliminarse?
- Frecuencia de visita: cada sesión / cada run / ocasionalmente / una vez
- Tipo: tab de "acción" vs tab de "referencia"

### 2. Nueva arquitectura de navegación
- ¿Cuántas tabs debería tener el juego en mobile?
- ¿Cómo se agrupan los sistemas actuales?
- ¿Qué va en tabs primarias vs secundarias vs overlays/modales?
- ¿Dónde viven los sistemas nuevos sin romper la navegación actual?

### 3. Jerarquía de información por sesión
El jugador abre el juego. ¿Qué ve primero?
Proponé una pantalla principal que muestre el estado más 
relevante sin saturar. Distinguí entre sesión corta (2–5 min) 
y sesión larga (20–40 min).

### 4. Layout por pantalla
Para cada pantalla propuesta:
- Qué información muestra y qué acciones permite
- Qué va arriba / centro / abajo
- Qué va en modal u overlay vs inline
- Consideraciones de thumb zone y scroll en mobile

### 5. Sistemas time-gated en UI
Los sistemas time-gated necesitan:
- Un lugar donde vivir sin tab propia si es posible
- Notificaciones de "listo" no intrusivas
- Visual de progreso de timer compacto

### 6. Señalá explícitamente
- Tabs que deberían fusionarse
- Tabs que deberían convertirse en overlays
- Información que debería moverse entre tabs
- Qué debería simplificarse o eliminarse

## Restricciones
- Mobile browser first, no app nativa
- Text-based, sin sprites ni mapas visuales
- Combate automático — no requiere input constante
- Navegación alcanzable con el pulgar
- React 18 componentes modulares

## Formato de respuesta
1. Tabla de auditoría de tabs actuales
2. Nueva arquitectura de navegación propuesta
3. Wireframe en texto o ASCII de la pantalla principal
4. Layout por pantalla
5. Tratamiento de sistemas time-gated
6. Cambios recomendados ordenados por impacto/esfuerzo

Si encontrás problemas de UX graves en la estructura actual, 
señalalos antes de proponer soluciones.