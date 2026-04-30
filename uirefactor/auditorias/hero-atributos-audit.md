# Auditoria Forge Light - Heroe / Atributos

Fecha: 2026-04-28
Referencia: `uirefactor/Heroe_Atributos.png`
Capturas actuales:
- `uirefactor/current/hero-atributos-390x844.png`
- `uirefactor/current/hero-atributos-430x932.png`
- `uirefactor/current/hero-atributos-1280x800.png`

## Estado

Segunda pasada Forge Light aplicada y validada con capturas.

## Cambios aplicados

- `src/components/Skills.jsx` ahora usa root `skills-root--forge-light`.
- Se reemplazaron cards claras por panel oscuro Forge.
- Se agregaron iconos SVG por atributo usando `ForgeIcon`.
- Cada atributo usa row ornamental con icono circular, descripcion, nivel/cap y track de nodos.
- El costo se muestra en boton Forge oscuro/dorado con icono de oro.
- Se agrego tabbar visual `Combate / Economia` para acercarse a la referencia.
- Se skinneo el subnav de Heroe (`Ficha / Atributos / Talentos`) para que deje de verse default claro.
- `LECTURA ACTUAL` se movio debajo del panel principal para que el primer viewport no tape `ATRIBUTOS` ni las filas principales.

## Comparacion contra referencia

Mas cerca:
- Jerarquia general de `ATRIBUTOS`.
- Filas oscuras con borde dorado y accion a la derecha.
- Iconos grandes por atributo.
- Progreso por nodos en vez de barra plana.
- Densidad mobile: entran todos los atributos principales y el inicio de `LECTURA ACTUAL` en el primer viewport.

Diferencias pendientes:
- La referencia tiene un header global con retrato/avatar y XP de cuenta; el header actual de app todavia es mas simple.
- Los iconos son SVG sistemicos, no ilustraciones tan ricas como la referencia.
- El boton `REINICIAR` de la referencia no se agrego porque no existe flujo/logica actual de reset de atributos.
- Las tabs `Combate / Economia` son visuales; no filtran porque la pantalla actual muestra ambos grupos.
- El primer viewport ya se parece mas a la referencia, pero el header global todavia no tiene avatar/XP de cuenta como `Heroe_Atributos.png`.

## Criterio actual

Aceptable como segunda pasada MVP de Atributos. El siguiente salto de fidelidad depende del header global de Heroe y/o de iconos ilustrados mas ricos.
