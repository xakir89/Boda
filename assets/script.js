/* =====================================================
   SCRIPT.JS — index.html (cuerpo principal de la boda)
   La animación del sobre vive ahora en inicio.js
===================================================== */

/* =====================================================
   MÚSICA — solo se activa aquí si la página se abre SUELTA
   (sin pasar por boda.html). Dentro del iframe maestro, la
   música y su botón ya los controla boda.html.
===================================================== */
const music = document.getElementById("weddingMusic");
const musicButton = document.getElementById("musicButton");
let musicPlaying = false;

if (window.self === window.top) {
    // Página abierta directamente: mostramos nuestro propio control
    musicButton.classList.remove("hidden");

    musicButton.addEventListener("click", () => {
        if (musicPlaying) {
            music.pause();
            musicPlaying = false;
            musicButton.textContent = "🔇";
        } else {
            music.volume = 0.35;
            music.play().then(() => {
                musicPlaying = true;
                musicButton.textContent = "🔊";
            });
        }
    });
} else {
    // Vive dentro del maestro: no necesitamos audio propio
    music.remove();
}

/* =====================================================
   CUENTA REGRESIVA
===================================================== */
const weddingDate = new Date("2026-12-07T17:00:00-05:00");

function updateCountdown() {
    const now = new Date();
    const difference = weddingDate.getTime() - now.getTime();

    if (difference <= 0) {
        ["days", "hours", "minutes", "seconds"].forEach(id => {
            document.getElementById(id).textContent = "00";
        });
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);



/* =====================================================
   BOTÓN COMPARTIR
===================================================== */
const shareButton = document.getElementById("shareButton");

shareButton.addEventListener("click", async () => {
    const shareData = {
        title: "Anderson & Esmeralda | Nuestra Boda",
        text: "Te invitamos a compartir con nosotros este día tan especial ❤️",
        url: window.top.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            console.log("El usuario canceló el compartir.");
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareData.url);
            shareButton.textContent = "✓ Enlace copiado";
            setTimeout(() => { shareButton.textContent = "🔗 Compartir invitación"; }, 2500);
        } catch (error) {
            alert("Copia manualmente el enlace de la invitación.");
        }
    }
});
