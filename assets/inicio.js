/* =====================================================
   INICIO.JS — Bienvenida + sobre animado (un solo clic)
===================================================== */
const welcomeScreen = document.getElementById("welcomeScreen");
const openInvitation = document.getElementById("openInvitation");
const envelopeContainer = document.getElementById("envelopeContainer");
const envelope = document.getElementById("interactiveEnvelope");
const welcomeContent = document.querySelector(".welcome-content");

const TIEMPO_ANTES_DE_ABRIR = 900;   // pausa antes de iniciar la apertura automática
const TIEMPO_ANIMACION_SOBRE = 3000; // debe coincidir con la animación CSS (zoomEnvelope)

let yaIniciado = false;

function iniciarSecuencia() {
    if (yaIniciado) return; // evita doble disparo si tocan varias veces
    yaIniciado = true;

    // 1) Oculta el texto de bienvenida y revela el sobre cerrado
    welcomeContent.style.transition = "opacity 0.4s ease";
    welcomeContent.style.opacity = "0";
    envelopeContainer.classList.add("active");
    envelopeContainer.style.pointerEvents = "none"; // el usuario ya no necesita tocar nada más

    // 2) Tras una pausa breve (para que se vea el sobre), se abre solo
    setTimeout(() => {
        envelopeContainer.classList.add("opening");
        envelope.classList.add("animate");

        // Arranca la música global del maestro apenas empieza a abrirse
        avisarMaestro("iniciarMusica");
    }, TIEMPO_ANTES_DE_ABRIR);

    // 3) Cuando termina la animación del sobre, navega a la búsqueda
    setTimeout(() => {
        welcomeScreen.classList.add("hide");
        irA("buscar.html");
    }, TIEMPO_ANTES_DE_ABRIR + TIEMPO_ANIMACION_SOBRE);
}

openInvitation.addEventListener("click", iniciarSecuencia);
