# Dudas pendientes para comentar

Fecha: 2026-04-29

## Crafting

- Confirmar si el drawer de items debe convertirse en primitive/wrapper compartido para Inventario, Deep Forge y futuras pantallas de item detail.
- Confirmar si los modos `Afinar`, `Reforjar`, `Imbuir` y `Extraer` deben tener previews dedicadas en la misma composicion visual de `Mejorar`, o si alcanza con abrir controles contextuales dentro del drawer/panel derecho.

## Overlays de estaciones

- Confirmar prioridad para migracion interna profunda: mi recomendacion es `DeepForge -> Laboratorio -> Destileria -> Encargos -> Altar -> Biblioteca`.
- Confirmar si Deep Forge debe adoptar el mismo drawer de seleccion de proyecto/item que te gusto en Crafting.

## Capturas

- El script actual captura pantallas principales, no cada overlay de estacion. Conviene agregar targets automatizados para abrir Laboratorio, Destileria, Encargos, Altar, Biblioteca y Deep Forge desde Santuario.

## Visual

- Santuario desktop quedo muy ordenado y denso. Si queres mas cercania al UI Kit, el proximo ajuste seria bajar el marco gris exterior y hacerlo mas metal/dorado, no tocar la jerarquia.
- Talentos mobile ya funciona, pero todavia tiene convivencia CSS legacy + wrappers. Si buscamos limpieza real, hay que retirar estilos viejos y dejar `FlTalentNode` como unica fuente visual.
