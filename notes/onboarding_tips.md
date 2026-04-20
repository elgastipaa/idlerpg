# Tips de implementación — Tutorial del juego

## Filosofía general
El tutorial no enseña. El tutorial hace que el jugador
haga la acción correcta y sienta que la descubrió solo.
Nunca explicar lo que se puede demostrar.
Nunca esperar que el jugador lea antes de actuar.

---

## Control de flujo

- Siempre pausar el combate y todos los ticks del juego
  mientras hay un paso de tutorial activo. Sin excepciones.
  El jugador no puede estar leyendo y viendo números cambiar
  al mismo tiempo. O muriendo.

- El tutorial es lineal y bloqueante. El jugador no puede
  avanzar hasta completar el paso actual. No hay forma de
  saltear, cerrar, ni ignorar un paso activo.

- Un paso = una acción. Nunca pedirle al jugador dos cosas
  en el mismo paso. Si necesitás que abra una tab Y haga
  click en un botón, son dos pasos separados.

- El tutorial detecta la acción completada y avanza solo.
  El jugador nunca aprieta "siguiente" — el sistema lo
  detecta y avanza. "Siguiente" rompe la ilusión de que
  el jugador está descubriendo algo. A menos que no le estmeos pidiendo nada y sólo explicando algo, claro está.

---

## Copy y mensajes

- Que el texto esté simple, es un tutorial largo, no queremos abrumarlo.

- El copy habla en segunda persona y en presente:
  "Tocá el botón de combate" no "El botón de combate
  sirve para iniciar el combate".

- El copy dice qué hacer, no por qué. El por qué viene
  después, cuando el jugador ya lo hizo y lo sintió. Ahí le explicamos más teórica / temáticamente qué hace cada cosa.

- El mensaje aparece cerca de la acción que pedís,
  no en el centro de la pantalla. Si pedís que toque
  algo abajo a la derecha, el mensaje está abajo
  a la derecha — no arriba centrado.

- Sin jerga del juego en los primeros pasos. "Tocá
  Atacar" no "Iniciá el loop de combate automático".
  La jerga se introduce gradualmente, después de que
  el jugador ya vivió el concepto.

---

## Spotlight y foco visual

- Spotlight en el elemento exacto que querés que toque.
  Todo lo demás oscurecido o con pointer-events: none.
  El jugador no puede tocar nada que no sea el objetivo
  del paso actual.

- El spotlight tiene un pulso o animación suave para
  guiar la mirada. No es solo un recorte — respira.

- Si el elemento objetivo está fuera de la pantalla,
  el tutorial hace scroll automático hasta mostrarlo
  antes de activar el spotlight. El jugador nunca
  busca algo que no ve.

- El overlay de oscurecimiento no bloquea el elemento
  objetivo — el elemento objetivo queda en z-index
  superior al overlay, clickeable y visible.

---

## Timing y ritmo

- Entre paso y paso, dar 400–600ms de pausa antes de
  mostrar el siguiente mensaje. El jugador necesita
  procesar que su acción tuvo efecto antes de recibir
  la próxima instrucción.

- Si el paso implica una animación o feedback visual
  (ej: ver el primer golpe de combate), esperar a que
  la animación termine antes de avanzar al siguiente
  paso. El jugador tiene que ver el resultado de lo
  que hizo.

- No apresurar. El tutorial puede sentirse lento para
  el dev que lo probó 50 veces. Para el jugador nuevo
  es la primera vez.

---

## Errores y casos borde

- Si el jugador de alguna forma cierra o rompe el estado
  del tutorial (reload, navegación inesperada), el tutorial
  vuelve al inicio del paso actual — no al inicio del
  tutorial completo, no al paso anterior.

- Si un paso depende de un estado del juego que no se
  cumplió (ej: "equipá este item" pero el item no dropeó),
  el tutorial garantiza ese estado antes de mostrarlo.
  El tutorial nunca asume — siempre garantiza.

- El tutorial no compite con notificaciones, overlays
  ni popups del juego. Mientras el tutorial está activo,
  todo lo demás está silenciado.

---

## Qué no hacer

- No usar tooltips flotantes sin spotlight. El jugador
  no los lee.

- No mostrar más de un elemento destacado a la vez.
  Si dos cosas están iluminadas, ninguna importa.

- No explicar sistemas completos en el tutorial.
  El tutorial enseña el primer paso de cada sistema.
  El resto lo aprende jugando.

- No poner el botón de "saltar tutorial". Si el diseño
  del tutorial es bueno, nadie lo quiere saltear.
  Si muchos lo saltean, el tutorial está mal — no
  agregar un botón de skip, arreglar el tutorial.

- No mostrar el tutorial completo en la primera sesión.
  Dividirlo en capas: primera run, primer prestige,
  primer sistema time-gated. Cada capa aparece cuando
  el sistema es relevante por primera vez.

- Nunca anticipar sistemas que el jugador no puede
  usar todavía. Si no está disponible, no existe.