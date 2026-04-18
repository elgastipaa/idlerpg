import os

# Contenido del archivo Markdown basado en la propuesta de Lead Game Designer
md_content = """# Propuesta de Diseño: Mecánicas Time-Gated para RPG Web
**Rol:** Lead Game Designer
**Objetivo:** Aumentar retención de largo plazo, profundidad estratégica y potencial de monetización sin comprometer el balance P2W.

---

## 1. Resumen de Mecánicas Propuestas

| Nombre | Fase | Ámbito | Tipo | Inspiración | Impacto en Retención |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Forja de Almas** | Early | Run | Pasivo | Warframe | Muy Alto (Deseo de Item) |
| **Expediciones de Gremio** | Mid | Account | Activo | Gladiatus | Alto (Gestión de Slots) |
| **Destilería de Esencia** | Early | Account | Pasivo | Incremental | Medio (Economía) |
| **Cartografía del Abismo** | Late | Run | Activo | PoE (Maps) | Muy Alto (Endgame) |
| **Cápsula de Maduración** | Mid | Item | Pasivo | - | Alto (Optimización) |
| **Entrenamiento de Maestría** | Mid | Account | Pasivo | Travian | Muy Alto (Progreso Permanente) |
| **Sintonía de Códice** | Mid | Account | Activo | - | Medio (RNG Control) |
| **Llamado del Boss** | Mid | Run | Activo | Monster Hunter | Alto (Target Farming) |
| **Refinería de Sigilos** | Late | Account | Pasivo | - | Medio (Estrategia) |
| **Cosecha de Ecos** | Late | Account | Pasivo | Prestige | Alto (Pacing post-prestigio) |
| **Subasta de Chatarra** | Early | Account | Activo | WoW | Medio (Social/Económico) |
| **Restauración de Reliquias** | Mid | Account | Activo | - | Alto (Coleccionismo) |
| **Infundido Elemental** | Mid | Item | Pasivo | - | Medio (Build Tuning) |
| **Construcción de Ciudadela** | Late | Account | Pasivo | Clash of Clans | Muy Alto (Meta-Progreso) |
| **Purificación de Corrupción** | Late | Run | Activo | - | Alto (Dificultad) |

---

## 2. Desarrollo Detallado de las 10 Mejores Mecánicas

### 1. Forja de Almas (El motor de deseo)
* **Fantasy:** Imbuir un objeto con un poder legendario requiere que la energía se asiente.
* **Loop:** Al obtener un poder del Códice, su inserción en un item *Rare/Epic* toma tiempo real.
* **Duración:** 1h (Rare), 12h (Epic), 24h (Legendary).
* **Decisión:** ¿Qué pieza de equipo es prioritaria para mi build actual?
* **Recurso:** Esencia + Oro. Solo 2 slots de forja base.
* **Monetización:** **Safe (Conveniencia).** Compra de slots de cola adicionales o aceleración del proceso.
* **Complejidad:** Media.

### 2. Cartografía del Abismo (Exploración Planificada)
* **Fantasy:** Tus exploradores mapean las peligrosas capas del Abismo (Tiers 26+).
* **Loop:** Envías un Sigil de Run a "Mapear". Al terminar, se desbloquean nodos de combate con mutadores específicos.
* **Duración:** 2h a 8h según la profundidad.
* **Decisión:** ¿Mapeo una zona de "Hunt" (drops) o de "Forge" (recursos)?
* **Recompensa:** Un conjunto de encuentros con loot superior.
* **Monetización:** **Safe.** Aceleración del scouting para jugadores impacientes.
* **Complejidad:** Alta (Generación procedimental de nodos).

### 3. Expediciones de Gremio (Gestión de Slots)
* **Fantasy:** Envías mercenarios a zonas ya conquistadas mientras tú haces push en el Abismo.
* **Loop:** Eliges una zona (Tiers 1-25). El "slot" queda ocupado y vuelve con materiales. Inspirado en el sistema de misiones de **Gladiatus**.
* **Duración:** 15m, 1h, 8h.
* **Decisión:** ¿Envío al mercenario a una zona de alto riesgo (mejor loot pero chance de fallo) o a una segura?
* **Recurso:** Stamina de expedición (regeneración horaria).
* **Monetización:** **Convenience.** Slots de expedición extra.
* **Complejidad:** Baja.

### 4. Cápsula de Maduración (Item-Proyecto)
* **Fantasy:** El equipo de alta calidad mejora con el tiempo en una cámara de vacío.
* **Loop:** Depositas un item *Rare* (no puedes usarlo). Al salir, sus affixes mejoran de Tier o gana un "Implicit".
* **Duración:** 24h a 72h.
* **Decisión:** ¿Me quito mi arma principal ahora para que sea un 15% mejor en 3 días?
* **Recurso:** Energía de Maduración (recurso raro).
* **Monetización:** **Peligrosa.** Solo permitiría acelerar un % limitado para evitar P2W extremo.
* **Complejidad:** Media.

### 5. Entrenamiento de Maestría (Progreso Vertical)
* **Fantasy:** Tu personaje estudia tácticas para perfeccionar sus atributos base. Inspirado en los tiempos de construcción de **Travian/OGame**.
* **Loop:** Eliges un stat (Crit, Block, Attack Speed) para entrenar permanentemente. 
* **Duración:** Escala exponencialmente (de 4h a semanas). Solo 1 activo a la vez.
* **Decisión:** ¿Especializo mi Juggernaut en Thorns o en HP Máximo?
* **Recompensa:** Bonus porcentual permanente a la cuenta.
* **Monetización:** **Safe.** Segundo slot de entrenamiento activo.
* **Complejidad:** Baja.

### 6. Destilería de Esencia (Conversión Económica)
* **Fantasy:** Una máquina transmuta el oro sobrante en esencia de crafteo.
* **Loop:** Depositas oro; la máquina lo procesa por hora. 
* **Decisión:** ¿Uso el oro para upgrades rápidos o lo invierto en la destilería para el endgame?
* **Monetización:** **Convenience.** Aumentar capacidad de almacenamiento de la máquina.
* **Complejidad:** Baja.

### 7. Llamado del Boss (Target Farming)
* **Fantasy:** Rastrear a un enemigo específico para asegurar el encuentro. Inspirado en el rastreo de **Monster Hunter**.
* **Loop:** Colocas un cebo en una zona. Tras el tiempo de espera, el siguiente boss en esa zona está garantizado.
* **Duración:** 4h.
* **Decisión:** ¿Qué boss necesito matar para completar mi maestría del Códice?
* **Monetización:** **Safe.** Cebo instantáneo.
* **Complejidad:** Media.

### 8. Sintonía de Códice (Control de RNG)
* **Fantasy:** Estudiar un poder legendario para dominar su esencia sin necesitar duplicados.
* **Loop:** Sintonizas un poder descubierto para subir su rango (Discovery -> Sintonizado -> Dominado).
* **Duración:** 12h por nivel.
* **Decisión:** ¿Mejoro el poder que ya tengo o espero a dropear otro?
* **Monetización:** **Safe.** Slot de sintonía extra.
* **Complejidad:** Media.

### 9. Refinería de Sigilos (Customizing the Run)
* **Fantasy:** Grabar runas en tus Sigils para alterar las reglas de la siguiente run.
* **Loop:** Aplicas modificadores a un Sigil (ej: "Enemigos tienen -10% HP"). El grabado toma tiempo.
* **Duración:** 2h.
* **Decisión:** ¿Preparo varios sigilos débiles para farmear oro o uno potente para progresar?
* **Monetización:** **Convenience.** Cola de grabado de sigilos.
* **Complejidad:** Media.

### 10. Cosecha de Ecos (Suavizado de Prestige)
* **Fantasy:** Extraer la energía residual de vidas pasadas.
* **Loop:** Tras un Prestigio, los puntos ganados se depositan en un banco que se "cosecha" gradualmente.
* **Duración:** 24h para vaciar el depósito.
* **Decisión:** ¿Gasto recursos para acelerar la cosecha y desbloquear nodos de prestigio antes?
* **Impacto:** Evita el pico de poder instantáneo que rompe el pacing.
* **Complejidad:** Media.

---

## 3. Análisis de Riesgos y Mitigaciones

1. **El Muro de Inactividad:** Si todo está bloqueado por tiempo, el jugador no tiene nada que hacer.
   * *Mitigación:* El combate base (Tiers 1-25) siempre debe ser accesible y dar recompensas inmediatas. Los time-gates deben ser para *optimización*, no para *acceso básico*.
2. **Complejidad Cognitiva:** Demasiados timers pueden abrumar.
   * *Mitigación:* Introducir los sistemas progresivamente (Early -> Mid -> Late).
3. **P2W Percibido:** Si pagar permite saltarse días de progreso, la comunidad competitiva se aleja.
   * *Mitigación:* Los aceleradores comprables deben tener un CAP diario o ser obtenibles mediante gameplay activo.

---

## 4. Roadmap de Implementación

### Fase 1: Cimientos (Impacto/Costo óptimo)
* **Forja de Almas:** Unifica el Códice con el Crafting.
* **Destilería de Esencia:** Da uso al exceso de oro.
* **Llamado del Boss:** Incentiva el uso del Códice.

### Fase 2: Retención Diaria
* **Entrenamiento de Maestría:** El factor "login diario" para ver el progreso.
* **Expediciones de Gremio:** Introduce la gestión de "personajes en segundo plano".
* **Refinería de Sigilos:** Añade capa estratégica antes de cada run.

### Fase 3: Endgame (Abismo)
* **Cartografía del Abismo:** Convierte el Tier 26+ en un juego de planificación.
* **Cápsula de Maduración:** Crea el "Chase" de items perfectos.
* **Cosecha de Ecos:** Refina el flujo del Prestigio.

---

## 5. Rankings y Recomendaciones Finales

* **Top 5 Monetización (Safe):** 1. Slots de Forja, 2. Slots de Maestría, 3. Slots de Expedición, 4. Capacidad de Destilería, 5. Cebo de Boss instantáneo.
* **Top 5 Impacto/Costo:** 1. Destilería, 2. Maestría, 3. Forja, 4. Cosecha de Ecos, 5. Llamado del Boss.
* **Combinación Ganadora:** **Cartografía + Sigilos + Boss Hunting.** El jugador prepara el mapa, refina el sigilo y pone el cebo. Una sesión de 5 minutos de preparación que genera una expectativa de 4 horas para una sesión de combate épica de 15 minutos.
"""

file_path = "propuesta_mecanicas_timegated_v1.md"
with open(file_path, "w", encoding="utf-8") as f:
    f.write(md_content)

print(f"Archivo generado: {file_path}")