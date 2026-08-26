/* =====================================================
   PANTALLA DE BIENVENIDA (ACTUALIZADA CON ANIMACIÓN)
===================================================== */
/* =====================================================
   PANTALLA DE BIENVENIDA (INTERACTIVA)
===================================================== */
const welcomeScreen = document.getElementById("welcomeScreen");
const openInvitation = document.getElementById("openInvitation");
const mainContent = document.getElementById("mainContent");

const envelopeContainer = document.getElementById("envelopeContainer");
const envelope = document.getElementById("interactiveEnvelope");
const welcomeContent = document.querySelector(".welcome-content");

// 1er CLIC: El usuario presiona el botón "Abrir invitación" original
openInvitation.addEventListener("click", () => {
    // Desvanece el texto de bienvenida
    welcomeContent.style.transition = "opacity 0.4s ease";
    welcomeContent.style.opacity = "0";

    // Muestra el sobre cerrado con su efecto de latido para invitar a tocarlo
    envelopeContainer.classList.add("active");
});

// 2do CLIC: El usuario presiona físicamente el sobre o el sello
envelope.addEventListener("click", () => {
    
    // Evita que hagan doble clic
    envelopeContainer.style.pointerEvents = "none"; 
    
    // Oculta el texto de pista ("Toca el sello para abrir")
    envelopeContainer.classList.add("opening");

    // Inicia la magia: rompe el sello, levanta solapa y hace zoom
    envelope.classList.add("animate");

    // Espera a que termine la animación visual (aprox 2.4 segundos)
    setTimeout(() => {
        // Ejecuta la transición de la página y arranca la música
        welcomeScreen.classList.add("hide");
        envelopeContainer.classList.remove("active");
        mainContent.classList.remove("hidden");
        
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        startMusic();
    }, 3000);

});

/* =====================================================
   MÚSICA
===================================================== */

const music =
    document.getElementById("weddingMusic");

const musicButton =
    document.getElementById("musicButton");


let musicPlaying = false;


function startMusic() {

    music.volume = 0.35;

    music.play()
        .then(() => {

            musicPlaying = true;

            musicButton.textContent = "🔊";

        })
        .catch(() => {

            musicPlaying = false;

            musicButton.textContent = "🔇";

        });

}


musicButton.addEventListener("click", () => {

    if (musicPlaying) {

        music.pause();

        musicPlaying = false;

        musicButton.textContent = "🔇";

    } else {

        music.play()
            .then(() => {

                musicPlaying = true;

                musicButton.textContent = "🔊";

            });

    }

});


/* =====================================================
   CUENTA REGRESIVA
===================================================== */

const weddingDate =
    new Date("2026-12-07T17:00:00-05:00");


function updateCountdown() {

    const now = new Date();

    const difference =
        weddingDate.getTime() -
        now.getTime();


    if (difference <= 0) {

        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";

        return;

    }


    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            (difference /
                (1000 * 60 * 60)) % 24
        );


    const minutes =
        Math.floor(
            (difference /
                (1000 * 60)) % 60
        );


    const seconds =
        Math.floor(
            (difference / 1000) % 60
        );


    document.getElementById("days")
        .textContent =
        String(days).padStart(2, "0");


    document.getElementById("hours")
        .textContent =
        String(hours).padStart(2, "0");


    document.getElementById("minutes")
        .textContent =
        String(minutes).padStart(2, "0");


    document.getElementById("seconds")
        .textContent =
        String(seconds).padStart(2, "0");

}


updateCountdown();

setInterval(updateCountdown, 1000);


/* =====================================================
   ANIMACIONES AL HACER SCROLL
===================================================== */

const revealElements =
    document.querySelectorAll(".reveal");


const observer =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                }

            });

        },
        {
            threshold: 0.12
        }
    );


revealElements.forEach(element => {

    observer.observe(element);

});


/* =====================================================
   BOTÓN COMPARTIR
===================================================== */

const shareButton =
    document.getElementById("shareButton");


shareButton.addEventListener("click", async () => {

    const shareData = {

        title:
            "Anderson & Esmeralda | Nuestra Boda",

        text:
            "Te invitamos a compartir con nosotros este día tan especial ❤️",

        url:
            window.location.href

    };


    if (navigator.share) {

        try {

            await navigator.share(shareData);

        } catch (error) {

            console.log(
                "El usuario canceló el compartir."
            );

        }

    } else {

        try {

            await navigator.clipboard.writeText(
                window.location.href
            );

            shareButton.textContent =
                "✓ Enlace copiado";

            setTimeout(() => {

                shareButton.textContent =
                    "🔗 Compartir invitación";

            }, 2500);

        } catch (error) {

            alert(
                "Copia manualmente el enlace de la invitación."
            );

        }

    }

});
