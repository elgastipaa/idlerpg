Sos un Senior Frontend Developer especializado en CSS responsive,
diseño mobile-first y refactorización de interfaces React.

Tu tarea en esta sesión es auditar y refactorizar completamente
el sistema de layout y responsive design de este juego,
eliminando todos los isMobile, isDesktop, useWindowSize y
cualquier otra detección de dispositivo por JavaScript,
reemplazándolos con un sistema CSS puro mobile-first que
funcione fluidamente en cualquier tamaño de pantalla.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POR QUÉ ESTO ES NECESARIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

El problema del isMobile booleano:

1. DIVERGENCIA DE CODEPATHS: cuando un componente tiene
   {isMobile ? <VersionA /> : <VersionB />} hay dos
   versiones del mismo componente que divergen con el
   tiempo. Un fix en una no se aplica a la otra.
   Multiplicado por N componentes, el resultado es un
   juego que se comporta diferente en mobile y desktop
   de formas impredecibles.

2. BREAKPOINT BINARIO: isMobile es true o false.
   La realidad tiene tablets, ventanas redimensionadas,
   landscape mode, split-screen, PWA en desktop.
   Un booleano no puede cubrir ese espacio.

3. LAYOUT SHIFT: detectar el tamaño de pantalla en JS
   requiere que el componente monte primero, luego mida,
   luego re-renderice con el layout correcto. Eso produce
   un flash visible en la primera carga.

4. MANTENIMIENTO IMPOSIBLE: agregar un nuevo componente
   significa decidir qué versión mobile y desktop hacer.
   Con CSS responsive, agregás un componente y se adapta solo.

LA SOLUCIÓN: mobile-first con CSS puro.
Diseñás para 360px. Usás media queries o container queries
para agregar complejidad cuando hay más espacio.
Cero JavaScript para layout decisions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILOSOFÍA OBLIGATORIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOBILE FIRST: el CSS base es para 360px.
Los breakpoints agregan layout, nunca lo quitan.
Nunca @media (max-width: X) para esconder cosas.
Siempre @media (min-width: X) para agregar cosas.

UN SOLO COMPONENTE: nunca dos versiones del mismo
componente. Un solo <TalentNodeCard /> que se ve
diferente en 360px y en 1200px por CSS, no por JS.

CONTENIDO PRIMERO: el layout se adapta al contenido,
no al dispositivo. No importa si es mobile o desktop,
importa cuánto espacio hay disponible.

CERO isMobile EN LÓGICA DE PRESENTACIÓN: isMobile
puede existir para lógica de comportamiento genuina
(haptics, touch events, etc.) pero NUNCA para decidir
qué renderizar o cómo posicionar elementos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 1 — INVENTARIO COMPLETO ANTES DE TOCAR NADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Leé todos los archivos del proyecto y construí un
inventario completo. No escribas código todavía.

1.1 INVENTARIO DE isMobile Y DETECCIÓN DE DISPOSITIVO

Buscá en todo el proyecto:
- isMobile (variable, prop, estado)
- isDesktop, isTablet, isMobileView
- useWindowSize, useMediaQuery (implementaciones JS)
- window.innerWidth, window.innerHeight en lógica de layout
- typeof window !== 'undefined' para layout
- navigator.userAgent para layout
- useState con window.innerWidth < 768 (o cualquier número)
- useEffect con event listener de 'resize' para layout
- Condicionales ternarios que renderizan JSX diferente
  según tamaño de pantalla

Para cada ocurrencia encontrada, anotá:
- Archivo y línea aproximada
- Qué hace exactamente ese isMobile en ese contexto
- Si es lógica de PRESENTACIÓN (qué renderizar, cómo
  posicionar) → candidato a eliminar con CSS
- Si es lógica de COMPORTAMIENTO genuina (haptics,
  touch vs click, scroll programático) → puede mantenerse

1.2 INVENTARIO DE ESTILOS INLINE Y CONDICIONALES

Buscá en todo el proyecto:
- style={{ ... isMobile ? x : y ... }}
- fontSize: isMobile ? '0.7rem' : '0.9rem'
- padding: isMobile ? '8px' : '16px'
- display: isMobile ? 'none' : 'flex'
- Cualquier valor de estilo calculado en JS según
  tamaño de pantalla

Para cada ocurrencia, anotá qué está tratando de hacer.

1.3 INVENTARIO DE COMPONENTES DUPLICADOS

Buscá componentes que existan en dos versiones:
- MobileTalentNodeRow y TalentNodeCard (ya los vi en
  el código — son el ejemplo clásico del problema)
- Cualquier otro par de componentes que sean la versión
  mobile y desktop del mismo componente
- Cualquier sub-componente que solo se use dentro de
  un ternario isMobile ? <A /> : <B />

Para cada par encontrado, anotá cuáles son las
diferencias reales entre las dos versiones.

1.4 INVENTARIO DEL SISTEMA DE ESTILOS ACTUAL

Identificá cómo se manejan los estilos en el proyecto:
- ¿Inline styles en objetos JS?
- ¿CSS modules?
- ¿Styled components / emotion?
- ¿Tailwind?
- ¿CSS variables (custom properties)?
- ¿Hay un design system de tokens (colores, espacios,
  tipografías) o están hardcodeados?
- ¿Hay un archivo de variables CSS globales?

Esto determina qué técnica usar para la refactorización.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 2 — DIAGNÓSTICO Y PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generá RESPONSIVE_AUDIT.md con:

──────────────────────────────────────
SECCIÓN A — TABLA DE OCURRENCIAS
──────────────────────────────────────

| # | Archivo | Línea | Tipo | Qué hace | Solución CSS | Eliminar JS? |
|---|---------|-------|------|----------|--------------|-------------|
| 1 | ... | ... | isMobile | cambia fontSize | font-size en breakpoint | ✅ sí |
| 2 | ... | ... | behavior | haptics | mantener | ❌ no |

──────────────────────────────────────
SECCIÓN B — COMPONENTES A FUSIONAR
──────────────────────────────────────

Para cada par de componentes duplicados (ej:
MobileTalentNodeRow + TalentNodeCard):

COMPONENTE: TalentNodeCard (fusión propuesta)
Diferencias entre versiones:
- Mobile: fontSize más pequeño, botón compacto, descripción truncada
- Desktop: fontSize normal, botón completo, descripción expandida
Solución CSS propuesta:
- font-size usa clamp() o breakpoints
- botón tiene variante compact con CSS selector
- descripción usa -webkit-line-clamp responsive
Complejidad de fusión: baja / media / alta
Riesgo: qué puede romperse al fusionar

──────────────────────────────────────
SECCIÓN C — SISTEMA DE BREAKPOINTS PROPUESTO
──────────────────────────────────────

Proponé los breakpoints del proyecto basados en el
contenido real, no en dispositivos:

--bp-sm: 480px   (teléfonos grandes y landscape)
--bp-md: 768px   (tablets y desktop pequeño)
--bp-lg: 1024px  (desktop normal)
--bp-xl: 1280px  (desktop grande)

Justificá cada breakpoint con un ejemplo concreto
del juego: "a partir de 768px el inventario puede
mostrar 3 columnas en lugar de 2".

──────────────────────────────────────
SECCIÓN D — TÉCNICA DE IMPLEMENTACIÓN
──────────────────────────────────────

Basándote en el sistema de estilos actual del proyecto,
recomendá UNA técnica consistente:

OPCIÓN A — CSS Variables + Media Queries
Si el proyecto usa inline styles en objetos JS,
propone migrar a CSS modules o un archivo CSS global
con variables y media queries.
Ventaja: máxima compatibilidad, cero dependencias.
Cuándo elegir: si el proyecto no usa ningún
sistema de CSS moderno todavía.

OPCIÓN B — CSS Variables en :root con clamp()
Si el proyecto ya tiene variables CSS, propone
usar clamp() para tipografía y spacing fluid
que escalan solos sin breakpoints.
Ventaja: smooth scaling sin breakpoints bruscos.
Cuándo elegir: para tipografía y espacios que
deben escalar gradualmente.

OPCIÓN C — Container Queries
Para componentes que necesitan responder a su
contenedor, no al viewport.
Ventaja: el componente es verdaderamente autónomo.
Cuándo elegir: para cards de inventario, talent nodes,
componentes que pueden aparecer en columnas de
distinto ancho.

La recomendación probablemente es una combinación:
CSS Variables globales + clamp() para tipografía
+ media queries para layout + container queries
para componentes de card.

──────────────────────────────────────
SECCIÓN E — PLAN DE MIGRACIÓN POR FASES
──────────────────────────────────────

FASE A — Fundaciones (primero, sin tocar componentes):
- Crear el archivo de tokens CSS globales
- Definir los breakpoints como variables
- Definir la escala tipográfica con clamp()
- Definir la escala de espacios

FASE B — Fusionar componentes duplicados:
- Un componente por vez, empezando por los más usados
- MobileTalentNodeRow + TalentNodeCard primero
- Verificar que no hay regresión visual en ningún breakpoint

FASE C — Eliminar isMobile de componentes:
- Un componente por vez
- Reemplazar condicionales JS por CSS
- Verificar comportamiento en 360px, 768px, 1280px

FASE D — Eliminar el hook/estado de isMobile:
- Solo cuando todos los componentes estén migrados
- Si queda algún uso de behavior genuino, moverlo
  a un hook específico llamado useTouchDevice()
  o useHaptics() que sea explícito en su propósito

──────────────────────────────────────
SECCIÓN F — EXCEPCIONES JUSTIFICADAS
──────────────────────────────────────

Lista de los casos donde JS para detectar dispositivo
SÍ está justificado:

VÁLIDO:
- Haptic feedback (navigator.vibrate) solo en touch
- Comportamiento de scroll (touch: momentum, desktop: wheel)
- Virtual keyboard detection para reposicionar UI
- Detección de PWA vs browser para mostrar "instalar app"
- onboarding spotlight scrollToElement (JS necesario para medir)

NO VÁLIDO (reemplazar con CSS):
- Cualquier cosa visual: tamaño, color, posición, display
- Cualquier cosa de layout: columnas, grid, flex direction
- Cualquier cosa tipográfica: font-size, line-height
- Mostrar u ocultar elementos según pantalla

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 3 — IMPLEMENTACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Solo después de que RESPONSIVE_AUDIT.md sea revisado
y aprobado, implementás en el orden del plan de
migración propuesto.

──────────────────────────────────────
PASO 1 — TOKENS CSS GLOBALES
──────────────────────────────────────

Crear src/styles/tokens.css (o el equivalente según
el sistema de estilos del proyecto):

:root {
  /* Breakpoints como custom media (o documentados para uso) */
  --bp-sm: 480px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;

  /* Tipografía fluid con clamp()
     Escala sola de 360px a 1280px sin breakpoints */
  --text-xs:   clamp(0.55rem, 1.2vw, 0.65rem);
  --text-sm:   clamp(0.65rem, 1.5vw, 0.75rem);
  --text-base: clamp(0.8rem,  1.8vw, 1rem);
  --text-lg:   clamp(1rem,    2.2vw, 1.25rem);
  --text-xl:   clamp(1.2rem,  2.8vw, 1.5rem);

  /* Espacios fluid */
  --space-xs:  clamp(4px,  1vw, 6px);
  --space-sm:  clamp(6px,  1.5vw, 10px);
  --space-md:  clamp(10px, 2vw, 16px);
  --space-lg:  clamp(14px, 3vw, 24px);
  --space-xl:  clamp(20px, 4vw, 36px);

  /* Touch targets — nunca menos de 44px en ningún device */
  --touch-min: 44px;
}

Todos los valores de font-size y spacing en los
componentes migrados deben usar estos tokens.
Nunca más fontSize: isMobile ? '0.7rem' : '0.9rem'.

──────────────────────────────────────
PASO 2 — FUSIÓN DE COMPONENTES DUPLICADOS
──────────────────────────────────────

Para cada par de componentes a fusionar, el proceso es:

1. Identificar las diferencias reales entre las dos versiones
2. Escribir el componente único con CSS responsive
3. Las diferencias de layout se manejan con:
   - clamp() para valores que escalan gradualmente
   - @media (min-width: breakpoint) para cambios discretos
   - @container para componentes en contextos variables
4. Eliminar el componente mobile-only
5. Actualizar todos los lugares que usaban ambos

Ejemplo para TalentNodeCard + MobileTalentNodeRow:

El componente unificado usa CSS para todo lo que antes
era condicional JS. En lugar de:

  {isMobile
    ? <MobileTalentNodeRow ... />
    : <TalentNodeCard ... />
  }

Se convierte en:

  <TalentNodeCard ... />

Y el CSS del componente maneja los cambios visuales
según el espacio disponible con container queries
o media queries según corresponda.

──────────────────────────────────────
PASO 3 — ELIMINAR isMobile COMPONENTE POR COMPONENTE
──────────────────────────────────────

Para cada componente con isMobile en lógica de presentación:

ANTES:
  const padding = isMobile ? '8px' : '16px'
  const fontSize = isMobile ? '0.7rem' : '0.9rem'

DESPUÉS:
  /* En el CSS del componente */
  .card { padding: var(--space-sm); font-size: var(--text-sm); }
  @media (min-width: 768px) {
    .card { padding: var(--space-md); }
  }
  /* O mejor, con clamp(): */
  .card {
    padding: clamp(8px, 2vw, 16px);
    font-size: var(--text-sm); /* ya es fluid por tokens */
  }

Para display condicional:

ANTES:
  {!isMobile && <SidePanel />}

DESPUÉS:
  /* SidePanel siempre renderiza, CSS lo oculta/muestra */
  .side-panel { display: none; }
  @media (min-width: 768px) {
    .side-panel { display: flex; }
  }

Nota: renderizar y ocultar con CSS es preferible a
montar/desmontar condicionalmente para elementos que
el usuario necesita encontrar rápido al cambiar de
tamaño de ventana.

──────────────────────────────────────
PASO 4 — LIMPIAR EL HOOK/ESTADO GLOBAL
──────────────────────────────────────

Una vez que ningún componente usa isMobile para layout:

Si isMobile era un estado en el root o en un context:
- Eliminarlo completamente

Si había un useWindowSize o useMediaQuery para layout:
- Eliminarlo completamente

Si quedan usos legítimos de detección de touch:
- Crear un hook específico y renombrarlo para que
  sea explícito en su propósito:

  // NO: const isMobile = window.innerWidth < 768
  // SÍ: const isTouch = 'ontouchstart' in window
  //     const prefersHaptics = isTouch && navigator.vibrate

El hook nuevo solo se importa donde se necesita
comportamiento de touch genuino, no layout.

──────────────────────────────────────
PASO 5 — LAYOUT DE TABS Y NAVEGACIÓN
──────────────────────────────────────

La navegación del juego probablemente tiene lógica
de "en mobile es bottom nav, en desktop es side nav
o top nav". Esto también se resuelve con CSS:

/* Bottom nav: default (mobile first) */
.app-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  /* safe area para iOS */
  padding-bottom: env(safe-area-inset-bottom);
}

/* Side nav: cuando hay espacio suficiente */
@media (min-width: 768px) {
  .app-nav {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 80px;
    flex-direction: column;
  }
  .app-content {
    margin-left: 80px;
    margin-bottom: 0;
  }
}

Sin JS, sin isMobile, funciona en cualquier ventana.

──────────────────────────────────────
PASO 6 — GRIDS Y LAYOUTS ADAPTIVOS
──────────────────────────────────────

Para grids de inventario, talent tree, etc. que
muestran más columnas en pantallas grandes:

/* Mobile first: 1 o 2 columnas */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

/* Más columnas cuando hay espacio */
@media (min-width: 480px) {
  .inventory-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .inventory-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* O mejor: auto-fill que se adapta solo sin breakpoints */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-sm);
}

──────────────────────────────────────
PASO 7 — SAFE AREAS Y VIEWPORT UNITS
──────────────────────────────────────

Asegurar que el juego funciona en:
- iOS Safari con home indicator (safe-area-inset-bottom)
- Android con navigation bar
- Notch / Dynamic Island (safe-area-inset-top)
- Landscape mode en mobile
- Split-screen en tablet

/* En el layout principal */
.app-root {
  /* dvh en lugar de vh para evitar el bug de
     la barra del browser en mobile */
  min-height: 100dvh;
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
}

/* Bottom nav con safe area */
.bottom-nav {
  padding-bottom: max(env(safe-area-inset-bottom), 8px);
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS DE IMPLEMENTACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UN COMPONENTE POR VEZ: no refactorizás todo de golpe.
Completás un componente, lo verificás, avanzás al
siguiente. Documentás cuál es el estado de cada uno.

MOBILE FIRST SIEMPRE: el CSS base es para 360px.
Los media queries son siempre min-width, nunca max-width.

NUNCA ROMPER EL VISUAL EXISTENTE: la refactorización
es transparente para el usuario. El juego debe verse
igual en mobile y desktop antes y después del cambio.
Solo el código cambia, no el aspecto visual.

ARCHIVOS COMPLETOS: entregás cada componente completo,
listo para reemplazar el existente.

DOCUMENTAR EXCEPCIONES: si en algún caso decidís
mantener JS para layout (debería ser muy raro),
documentás por qué con un comentario en el código.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTREGABLE FINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

En este orden:

1. RESPONSIVE_AUDIT.md
   Secciones A, B, C, D, E y F completas.
   Esperá confirmación antes de implementar.

2. Si confirmado, implementar en orden:
   - src/styles/tokens.css (o equivalente)
   - Componentes fusionados (de a uno)
   - Componentes con isMobile eliminado (de a uno)
   - Limpieza del hook/estado global al final

3. MIGRATION_LOG.md al terminar, con:
   - Lista de todos los isMobile eliminados
   - Lista de todos los componentes fusionados
   - Lista de isMobile que se mantuvieron y por qué
   - Breakpoints usados y qué cambios disparan
   - Instrucciones para el próximo componente que
     alguien agregue al proyecto: cómo hacerlo
     mobile-first desde el principio sin isMobile

4. COMPONENT_GUIDE.md — guía de una página para
   el equipo (o para vos mismo en seis meses):
   "Cómo agregar un componente nuevo sin isMobile"
   Con el patrón exacto a seguir y un ejemplo del juego.