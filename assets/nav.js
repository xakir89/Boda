/* =====================================================
   NAV.JS — Puente de navegación + utilidades globales
   Incluir en TODAS las páginas hijas (inicio, buscar,
   invitacion, index, fotos). NO incluir en boda.html.
===================================================== */

/**
 * Navega a otra "página" del sitio.
 * - Si esta página vive dentro del iframe de boda.html,
 *   le pide al padre que cambie de canal (la música y las
 *   flores del maestro nunca se reinician).
 * - Si se abrió esta página sola (modo prueba / enlace directo),
 *   navega normalmente.
 */
function irA(pagina, params) {
    let destino = pagina;
    if (params && Object.keys(params).length) {
        const qs = new URLSearchParams(params).toString();
        destino += (pagina.includes("?") ? "&" : "?") + qs;
    }

    if (window.self !== window.top) {
        window.parent.postMessage({ tipo: "boda:nav", pagina: destino }, "*");
    } else {
        window.location.href = destino;
    }
}
window.irA = irA;

/**
 * Avisa al maestro si esta página necesita silenciar/mostrar
 * elementos de chrome (por ejemplo, ocultar las flores durante
 * la animación del sobre). Opcional, se usa en inicio.html.
 */
function avisarMaestro(evento, data) {
    if (window.self !== window.top) {
        window.parent.postMessage({ tipo: "boda:evento", evento, data }, "*");
    }
}
window.avisarMaestro = avisarMaestro;

/* =====================================================
   ANIMACIONES AL HACER SCROLL (.reveal)
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const revealElements = document.querySelectorAll(".reveal");
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(el => observer.observe(el));
});
/* =====================================================
   PÉTALOS FLOTANTES (generador reutilizable)
   Uso: crearPetalos(document.querySelector('.mi-seccion'), 10)
===================================================== */
function crearPetalos(contenedor, cantidad = 8, simbolos = ['assets/4.png', 'assets/5.png', 'assets/6.png']) {
    if (!contenedor) return;
    const capa = document.createElement("div");
    capa.className = "petal-layer";
    capa.setAttribute("aria-hidden", "true");

    for (let i = 0; i < cantidad; i++) {
        const petalo = document.createElement("div");
        petalo.className = "drift-petal";

        // Crear el elemento de imagen <img> en vez de texto plano
        const img = document.createElement("img");
        img.src = simbolos[Math.floor(Math.random() * simbolos.length)];
        img.alt = "Pétalo";
        petalo.appendChild(img);

        const izquierda = Math.random() * 100;
        const duracion = 9 + Math.random() * 10;
        const demora = Math.random() * 10;
        const giroFinal = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 180);

        petalo.style.left = izquierda + "vw";
        petalo.style.animationDuration = duracion + "s";
        petalo.style.animationDelay = demora + "s";
        petalo.style.setProperty("--giro-final", giroFinal + "deg");

        capa.appendChild(petalo);
    }
    contenedor.appendChild(capa);
}
window.crearPetalos = crearPetalos;
