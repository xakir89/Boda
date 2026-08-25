/* =====================================================
   PANTALLA DE BIENVENIDA
===================================================== */

const welcomeScreen =
    document.getElementById("welcomeScreen");

const openInvitation =
    document.getElementById("openInvitation");

const mainContent =
    document.getElementById("mainContent");


openInvitation.addEventListener("click", () => {

    welcomeScreen.classList.add("hide");

    mainContent.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    startMusic();

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