## Next Steps 2

Estado: `1` en curso, `2-4` pendientes.

### 1. Forja Profunda v2 sobre blueprints
- Darle progresion estructural real a los blueprints.
- Consumir `relicDust` para subir `blueprintLevel`.
- Hacer que ese nivel mejore la base real del item materializado:
  - mejor base/implicit
  - mejor rating estructural
  - mejor sensacion de proyecto de largo plazo
- Mantener el guardrail principal:
  - un blueprint viejo mejorado no debe reemplazar para siempre a drops de tiers mas altos.
- Fase inicial:
  - upgrade estructural
  - preview de mejora
  - costo escalado
- Fase posterior:
  - sintonia de poder legendario
  - ascension del blueprint
  - garantia/ancla de familias

### 2. Investigacion del Codice
- Darle uso real a `codexInk`.
- Jobs cortos o acciones persistentes que mejoren direccion de hunt sin spoilear de mas.
- Posibles salidas:
  - mas precision en fuentes historicas
  - mejor lectura de familias/powers ya vistos
  - mejoras persistentes de descubrimiento

### 3. Progresion de estaciones
- Hacer que Santuario tambien tenga progreso horizontal.
- Ejemplos:
  - mas slots
  - mejores encargos
  - mas colas
  - recetas raras
  - mejores techos por estacion

### 4. Limpieza legacy
- Retirar o archivar lo que quedo del modelo viejo de `project`.
- Consolidar `Forja Profunda` sobre blueprints y sacar runtime muerto.
- Reducir ramas de reducer/engine que ya no deberian seguir activas.
