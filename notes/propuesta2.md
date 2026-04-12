# Propuesta 2 — Ajuste de Ítems y Crafting (alineado a tu feedback)

## 1) Decisiones cerradas (baseline)

- Densidad máxima objetivo: **8 stats efectivos** (no 10).
- Drops por rareza (actual objetivo):
  - **Common: 2**
  - **Magic: 3**
  - **Rare: 4**
  - **Epic: 6**
  - **Legendary: 8**
- **Soft bias**: se mantiene.
- **Sin complejidad nueva** por ahora (nada de sistemas extra tipo blessing/enchant nuevo).

---

## 2) ¿Qué es “Upgrade Mixto” y en qué se diferencia de hoy?

### Hoy (según propuesta1 / comportamiento discutido)
- El upgrade apunta principalmente a **affixes** (o los escala más fuerte que al resto).
- Resultado: puede sentirse que el poder “real” está concentrado en affixes y no tanto en base/implicit.

### Upgrade Mixto (propuesto)
- Cada nivel de upgrade reparte potencia en **dos carriles**:
  1. **Flat base/implicit** (pequeño, estable, siempre útil).
  2. **Escala de affixes** (moderada, no explosiva).
- Objetivo: evitar que un item sea “todo affix” y mejorar legibilidad de progreso.

Ejemplo simple por nivel (referencial):
- `+2%` a base+implicit (flat equivalente por stat)
- `+4%` al bloque de affixes
- En lugar de un único `+8%` solo en affixes.

Beneficios:
- Menos picos raros en items con affixes perfectos.
- Mejor sensación de progreso en cualquier item “decente”.
- Más fácil balancear early/mid sin romper late.

---

## 3) ¿Crafting ya está “así” o no?

Parcialmente sí:
- Ya tenemos flujo de crafting y control de recursos.
- Ya hay decisiones de reroll/upgrade/focus.

Lo que **no** está plenamente consolidado (a revisar en implementación):
- Normalización matemática del upgrade para que no escale de forma despareja entre fuentes.
- Soft bias parametrizado y visible para balance (no hardcode opaco).
- Curvas de costo consistentes entre acciones (hoy hay tramos donde una acción domina demasiado).

---

## 4) Curvas de costo — opciones

La idea es elegir una y testear 2-3 días con métricas.

### Opción A: Exponencial suave (recomendada)
- Fórmula tipo: `cost = base * (1.16 ^ nivel)`
- Ventajas:
  - Escala claro y predecible.
  - Evita spam infinito en niveles altos.
- Riesgo:
  - Si base es alto, castiga early.

Uso sugerido:
- Upgrade item: `1.16`
- Reroll focalizado: `1.14`
- Reforge/potente: `1.18`

### Opción B: Híbrida por tramos (early amable, late duro)
- Niveles 1-4: casi lineal
- 5-8: exponencial suave
- 9-12: exponencial más dura

Ejemplo:
- `L1-L4: base + n*delta`
- `L5-L8: base2 * (1.14 ^ tramo)`
- `L9+: base3 * (1.20 ^ tramo)`

Ventajas:
- Buen onboarding.
- Late controlado.

Riesgo:
- Más compleja de mantener.

### Opción C: Costo por poder ganado (dinámica)
- El costo depende del “power delta” real que obtuvo el item.
- Si el reroll salió mediocre, cuesta menos el siguiente.
- Si salió god-roll, el siguiente intento se encarece fuerte.

Ventajas:
- Muy justa para jugador.
- Menos sensación de castigo injusto.

Riesgo:
- Requiere más instrumentación y puede sentirse menos transparente.

---

## 5) Soft Bias — opciones de pesos

Objetivo: mantener identidad de familia sin bloquear creatividad.

### Set 1: Conservador (recomendado para arrancar)
- Afinidad familia: `+25%` peso
- Stats neutrales: `+0%`
- Stats “opuestas” a identidad: `-15%`
- Hard exclude: solo casos extremos (muy pocos)

Resultado esperado:
- Items con personalidad, pero todavía salen combinaciones raras divertidas.

### Set 2: Marcado
- Afinidad familia: `+40%`
- Neutral: `0%`
- Opuesta: `-25%`

Resultado esperado:
- Más consistencia por clase/build.
- Menos variedad sorpresa.

### Set 3: Libre
- Afinidad: `+15%`
- Neutral: `0%`
- Opuesta: `-10%`

Resultado esperado:
- Más caos y experimentación.
- Más difícil balancear curva de poder.

---

## 6) Recomendación concreta (para cerrar rápido)

Si querés avanzar sin atascar diseño:

1. Adoptar **Curva A (exponencial suave)**.
2. Usar **Soft Bias Set 1 (conservador)**.
3. Implementar **Upgrade Mixto** con reparto moderado (base/implicit + affix).
4. Mantener densidad objetivo **2/3/4/6/8** tal como definiste.
5. Dejar fuera complejidad nueva por ahora.

---

## 7) Qué medir luego (mínimo)

- `% de ítems equipados por rareza` (si epic/legendary no se equipan, el sistema no seduce).
- `intentos de reroll por item equipado` (si es muy alto, costos/pool están mal).
- `delta de poder por upgrade` promedio (si se dispara en late, hay snowball).
- `tiempo para reemplazar item` por slot (si nunca se reemplaza, progreso muerto).

Con esto podemos ajustar costos y bias con datos, no intuición.
