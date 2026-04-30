# Auditoria Forge Light - Heroe / Ficha

Fecha: 2026-04-28
Referencia: `uirefactor/Heroe_Ficha.png`
Capturas actuales:
- `uirefactor/current/hero-ficha-390x844.png`
- `uirefactor/current/hero-ficha-430x932.png`
- `uirefactor/current/hero-ficha-1280x800.png`

## Estado

Segunda migracion Forge Light aplicada y validada con capturas.

## Cambios aplicados

- `src/components/Character.jsx` ahora tiene layout Forge Light para Ficha cuando existe especializacion.
- Se agrego hero card oscura con retrato, nivel, clase, especializacion, build activa, kills y barras de Vida/Experiencia.
- Se agregaron cards de build actual y lectura rapida con iconos SVG.
- Se agrego shell Forge para toda la seccion Heroe desde `src/App.jsx` con clase `app-shell-root--forge-character`.
- El viewport desktop de Heroe queda transparente y ya no impone fondo blanco sobre Ficha/Atributos.
- `Character.jsx` ahora usa retratos reales por especializacion/clase desde `public/assets/portraits/classes/`.
- `responsive.css` agrega encuadre `forge-character-portrait-img` para integrar el PNG dentro del marco Forge con sombreado y crop responsive.

## Comparacion contra referencia

Mas cerca:
- Jerarquia principal de ficha: retrato a la izquierda, identidad/build a la derecha y nivel destacado.
- Barras de Vida/Experiencia con icono lateral y relleno de color.
- Cards inferiores oscuras, con borde dorado y lectura rapida.
- Mobile y desktop comparten lenguaje Forge sin panel claro exterior.
- El retrato ya no es placeholder SVG; se usa arte ilustrado real y el impacto visual se acerca mucho mas a `Heroe_Ficha.png`.

Diferencias pendientes:
- Las cards de build de la referencia tienen CTA `ELEGIR`; la implementacion actual evita agregar flujo nuevo y muestra build activa/identidad.
- El header global de la referencia es mas ornamental y con iconos de recurso grandes; el header actual esta compactado pero todavia es mas simple.
- Falta una segunda pasada de bevel/ornamentos finos para igualar mejor esquinas, separadores y glow.

## Criterio actual

Aceptable como segunda pasada MVP de Ficha. La siguiente iteracion deberia concentrarse en ornamentos finos y header global, no en asset de retrato.
