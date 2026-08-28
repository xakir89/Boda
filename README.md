# Sitio de boda — Anderson & Esmeralda

## Estructura de archivos

```
boda.html              ← ARCHIVO MAESTRO. Este es el link que compartes con los invitados.
inicio.html             ← Bienvenida + sobre animado (1er "canal" que carga boda.html)
buscar.html              ← Búsqueda de invitado por nombre
invitacion.html          ← Invitación personalizada + RSVP + descarga PNG
index.html                ← Cuerpo principal (historia, agenda, countdown, dress code…)
fotos.html                 ← Galería con visor de imágenes y descarga
SUPABASE-SETUP.md           ← Guía paso a paso para crear la base de datos
assets/
    style.css                ← Todos los estilos del sitio (un solo archivo, compartido)
    nav.js                    ← Puente de navegación + pétalos + animaciones scroll (compartido)
    inicio.js                  ← Lógica del sobre animado
    buscar.js                   ← Búsqueda contra Supabase
    invitacion.js                ← RSVP + PNG + notificación WhatsApp
    script.js                     ← Countdown + compartir (para index.html)
    app.js                         ← Galería + lightbox (para fotos.html)
    1.mp3    ← TU ARCHIVO: música de fondo (nombre exacto: 1.mp3)
    2.png    ← TU ARCHIVO: decoración lado izquierdo (flores, fondo transparente)
    3.png    ← TU ARCHIVO: decoración lado derecho (flores, fondo transparente)
    fondo-boda.jpg ← Imagen de fondo del hero (ya la tenías como assets/fondo-boda.jpg)
    pareja.jpg     ← Foto de la sección "Nuestra historia"
```

**Importante sobre 2.png y 3.png**: úsalas como imágenes PNG con
**fondo transparente**, en formato vertical/alargado (ideal: 300×1200px
o similar), así se ven como una "cenefa" de flores pegada a cada
borde de la pantalla sin tapar el contenido. Si solo tienes una foto
de flores cuadrada, dímelo y te ayudo a adaptar el CSS para que se
repita en mosaico vertical en vez de estirarse.

## Cómo funciona el "televisor" (archivo maestro)

`boda.html` no muestra contenido propio: solo tiene la música, las
flores fijas de los costados, y un `<iframe id="channel">` de pantalla
completa. Cada página (`inicio.html`, `buscar.html`, etc.) vive
**dentro** de ese iframe. Cuando un botón dice "ir a tal página", en
vez de navegar normalmente, le avisa al maestro por `postMessage` para
que cambie el `src` del iframe — así la música y las flores nunca se
reinician entre pantallas.

Esto significa que **debes compartir el link de `boda.html`**, nunca
el de `inicio.html` directamente (si alguien abre `inicio.html` suelto,
el sitio sigue funcionando perfecto, solo que sin el marco de flores
fijas y sin música continua entre páginas — cada página cae de vuelta
a su propio comportamiento normal como respaldo).

## Sobre los pétalos animados (tu pregunta)

Ya te dejé montado un generador reutilizable: `crearPetalos(contenedor, cantidad)`
en `assets/nav.js`. Genera pétalos con:
- posición horizontal aleatoria,
- duración y retraso de animación aleatorios (para que no se vean
  sincronizados / "en fila"),
- tamaño aleatorio,
- y un giro final aleatorio al llegar abajo.

Esto es mejor que pétalos fijos porque escala solo a cualquier
cantidad, no se ve repetitivo, y es liviano (CSS puro, sin canvas ni
librerías). Ya está usado en el hero de `index.html`
(`crearPetalos(document.getElementById('heroInicio'), 10)`). Puedes
llamarlo en cualquier otra sección con `position: relative` y
`overflow: hidden`, por ejemplo en el hero de `inicio.html` si quieres
pétalos cayendo detrás del sobre.

## Antes de publicar

1. Sigue `SUPABASE-SETUP.md` completo (tabla, seguridad, función RSVP, WhatsApp).
2. Sube `1.mp3`, `2.png`, `3.png`, `fondo-boda.jpg` y `pareja.jpg` dentro de `assets/`.
3. Cambia el número de WhatsApp del botón de contacto general en `index.html` si lo sigues usando en otro lado.
4. Sube **todos** los archivos juntos (misma carpeta/dominio) a tu hosting — Netlify, Vercel o GitHub Pages funcionan perfecto y son gratis. El iframe requiere que todo viva en el mismo dominio.
5. Comparte el link de `boda.html`.

## Supuesto que tomé por ti

Interpreté la frase "cuando la persona ya haya confirmado la
invitación" como: si alguien vuelve a abrir su link de invitación
después de haber confirmado, **ya no le mostramos los botones de Sí/No
de nuevo** — solo vemos su estado guardado, y si dijo que sí, puede
volver a descargar su PNG. Si querías otro comportamiento (por
ejemplo, permitir cambiar la respuesta), dime y lo ajusto en dos
minutos.
