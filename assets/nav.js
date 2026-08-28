/* =====================================================
   NAV.JS — Puente de navegación + utilidades globales
   Incluir en TODAS las páginas hijas (inicio, buscar,
   invitacion, index, fotos). NO incluir en boda.html.
===================================================== */

/**
 * Navega a otra "página" del sitio.
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
 * Avisa al maestro si esta página necesita silenciar/mostrar elementos.
 */
function avisarMaestro(evento, data) {
    if (window.self !== window.top) {
        window.parent.postMessage({ tipo: "boda:evento", evento, data }, "*");
    }
}
window.avisarMaestro = avisarMaestro;

/* =====================================================
   ANIMACIONES Y PÉTALOS GLOBALES
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // Revelar elementos al hacer scroll
    const revealElements = document.querySelectorAll(".reveal");
    if (revealElements.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        }, { threshold: 0.12 });

        revealElements.forEach(el => observer.observe(el));
    }

    // Activa la caída de pétalos automáticamente
    crearPetalos();
});

function crearPetalos(contenedor = document.body, cantidad = 12, simbolos = ['assets/4.png', 'assets/5.png', 'assets/6.png']) {
    const target = contenedor || document.body;
    if (!target) return;

    const capa = document.createElement("div");
    capa.className = "petal-layer petal-layer--global";
    capa.setAttribute("aria-hidden", "true");

    for (let i = 0; i < cantidad; i++) {
        const petalo = document.createElement("div");
        petalo.className = "drift-petal";

        const img = document.createElement("img");
        img.src = simbolos[Math.floor(Math.random() * simbolos.length)];
        img.alt = "Pétalo";
        petalo.appendChild(img);

        const izquierda = Math.random() * 100;
        const duracion = 8 + Math.random() * 8;
        const demora = Math.random() * 6;
        const giroFinal = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 180);

        petalo.style.left = izquierda + "vw";
        petalo.style.animationDuration = duracion + "s";
        petalo.style.animationDelay = demora + "s";
        petalo.style.setProperty("--giro-final", giroFinal + "deg");

        capa.appendChild(petalo);
    }
    target.appendChild(capa);
}
window.crearPetalos = crearPetalos;