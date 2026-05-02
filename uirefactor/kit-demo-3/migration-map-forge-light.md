 # Plan Maestro — Fase 1 de Migración Masiva UI Kit v4 (Ejecución Continua)

  ## Resumen

  Objetivo: ejecutar una primera fase masiva de migración visual y estructural de la app al sistema Forge Light v4, aprovechando primitives/
  wrappers ya creados, sin frenar entre fases ni pedir autorizaciones intermedias.
  Alcance acordado para Fase 1: App Shell + Sanctuary + Inventory + Crafting (Combat, Stats, Codex, Prestige quedan para Fase 2).

  Fuentes de verdad (prioridad):

  1. uirefactor/kit-demo-3/forge-light-kit-v4.html (autoridad visual primaria).
  2. uirefactor/kit-demo-3/flDesign.md (reglas de cascada, canónicos, anti-overrides).
  3. Sistema canónico implementado en app: src/components/ui/forge/* + src/styles/forge-light-v2/*.
  4. Módulos de apoyo: forge-light-kit-premium-modules.html solo cuando coincidan semánticamente.

  ———

  ## Cambios Clave de Implementación (Decision-Complete)

  ### 1) Regla de ejecución continua (sin interrupciones)

  - La migración se ejecuta en una sola corrida por lotes: Foundation Lock → Shell → Sanctuary → Inventory → Crafting → Hardening.
  - No se detiene entre lotes por approvals; solo se detiene ante bloqueador técnico real (build roto sin causa localizable o conflicto de
    arquitectura).
  - Cada lote incluye: refactor de wrappers/primitives + limpieza legacy local + build + smoke funcional mínima.

  ### 2) Foundation Lock (congelar lenguaje visual antes de pantallas)

  - Consolidar en forge-light-v2:
      - botones (FlButton, FlIconButton, FlSideAction),
      - badges/tags (FlBadge, FlTag, FlNotifBadge),
      - paneles/cards (FlPanel, FlCard),
      - progress (FlProgressBar, FlHealthBar),
      - navegación (FlHeaderBar, FlBottomNav, FlTabs, FlSwitch).
  - Cerrar shape policy:
      - rareza rectangular canónica (sin pill),
      - notification badge circular top-right,
      - no clip-paths legacy en variantes rect.
  - Prohibición explícita: nuevos estilos inline de skin (solo layout/posición excepcional y justificada).

  ### 3) App Shell canónico (impacto global)

  - Unificar header y navegación:
      - Top Status Bar parity (oro/esencia/recursos),
      - Bottom Navigation Bar parity (icon + label + selected/inactive + notif badge circular).
  - Eliminar divergencias entre navigation.css, shared.css y overrides viejos del shell.
  - Garantías:
      - mobile safe-area,
      - estados selected/disabled consistentes,
      - mismo alto/tipografía/espaciado entre tabs.

  ### 4) Sanctuary (migración completa por módulos)

  - Estaciones: cerrar FlStationCard a paridad de módulo Stations Card. Esto creo que ya está.
  - Jobs: mantener FlJobRow canónico (sin card-anidada), compacidad y CTA consistente. Esto creo que ya está.
  - Reliquias: mantener FlRelicRow estilo FlItemRow sin card, badges canónicas, acciones Activar/Extraer/Estabilizar. Esto creo que ya está.
  - Limpieza:
      - retirar clases legacy de panel/row que dupliquen skin,
      - separadores/texture/bordes definidos en módulo global, no por pantalla.

  ### 5) Inventory (migración de alta visibilidad) - Esto creo que está casi hecho, sólo revisar y proponer ajustes.

  - ItemRow y EquippedRow en wrappers canónicos (look Tab 23 A1/A2). Esto está casi terminado, revisar nomas.
  - Botones de acción (Detalle/Equipar/Vender) desde FlButton variantes canónicas. Ídem, creo que está casi terminado.
  - Modal detalle:
      - FlModal + bloque detalle canónico,
      - layout compacto,
      - badges de variación consistentes,
      - scroll interno/sticky footer según reglas ya establecidas.
  - Filtros/chips/tabs/paginación: todo sobre FlTag/FlTabs/FlPagination canónicos.

  ### 6) Crafting (consolidación de piloto a estándar)

  - Mantener layout funcional actual, migrar piezas internas:
      - tabs de modo, CTA principal/secundario,
      - cards de costo/material/probabilidad,
      - tracks de progreso/upgrade/entropy.
  - Don’t-force:
      - no copiar módulo tab 18 completo; solo patrones aprobados (stats cards + CTA mejorar con costo).
  - Cerrar fallback legacy fl-crafting-legacy-* cuando exista paridad funcional y visual.

  ### 7) Limpieza de deuda visual (obligatoria en cada lote)

  - Remover overrides que compitan con primitives canónicos.
  - No crear “segundo sistema” por pantalla.
  - Cualquier excepción visual debe vivir como variante explícita de componente (variant/size/tone), no clase ad-hoc local.

  ———

  ## QA / Validación / Criterios de Aceptación

  ### Validación técnica por lote

  - npm run build obligatorio en cada lote.
  - Si hay lint/tests disponibles: ejecutar al final de Fase 1 completa.

  ### QA visual mínima obligatoria

  Viewports:

  - 390x844
  - 430x932
  - 1280x800

  Checklist transversal:

  - botones con altura estable (default/disabled/loading/pressed),
  - badges y tags correctas por semántica (rareza rect, notif circular),
  - rareza por borde/glow/badge (no fondo plano de card),
  - panel/card con textura+borde doble+profundidad coherente,
  - bottom nav/header consistentes en todas las pantallas de fase 1,
  - sin solapamientos ni cortes de texto en mobile.

  Escenarios críticos:

  - Sanctuary: estaciones bloqueadas/activas/claimable + jobs en progreso/listos.

  ———

  ## Pendientes de Decisión (requieren respuesta para Fase 2, no bloquean Fase 1)

  1. ¿Combat entra completo en Fase 2 o se divide en HUD + panels y luego logs/contracts? Combat lo dejamos para más adelante.
  2. ¿Stats/Codex/Prestige se migran por “módulos de métricas” compartidos o por pantalla completa? Esto si, entra todo en la migración.
  3. ¿Se estandariza FlBadge para reemplazar también todos los chips legacy fuera de fase 1? Usemos tags para los chips legacy.
  4. ¿Se define política de deprecación formal (legacy.css freeze + fecha de retiro)? Si.

  ———

  ## Supuestos y Defaults elegidos

  - Se conserva layout funcional actual de pantallas; se migra sistema visual/componente.
  - No se agregan assets externos.
  - No se fuerzan módulos explícitamente prohibidos (Inventario tab 15, Combat HUD tab 16, Crafting tab 18 completo).
  - La implementación de Fase 1 se considera cerrada cuando shell + sanctuary + inventory + crafting pasan build y checklist visual en los 3
    viewports.

  ———

  ## Entregable documental esperado

  Crear/actualizar un único documento operativo (recomendado: notes/plan-fase1-migracion-masiva-ui-kit-v4.md) con:

  - alcance y orden de ejecución,
  - matriz componente actual → canónico,
  - decisiones tomadas,
  - pendientes Fase 2,
  - checklist de aceptación firmado por pantalla.