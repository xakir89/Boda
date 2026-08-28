import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 1. CREDENCIALES DE SUPABASE
const supabaseUrl = 'https://wcsiymdddkvmkypuxzjp.supabase.co'
const supabaseKey = 'sb_publishable_aglQGTkxk497-Hv49IFbCQ_r8N3Ixoy'
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = 'boda-fotos'

// 2. ELEMENTOS DEL HTML
const uploadBtn = document.getElementById('uploadBtn')
const fileInput = document.getElementById('fileInput')
const galleryContainer = document.getElementById('galleryContainer')
const uploadStatus = document.getElementById('uploadStatus')
const uploaderNameInput = document.getElementById('uploaderName')
const selectedFilesText = document.getElementById('selectedFiles')

const lightbox = document.getElementById('lightbox')
const lightboxImg = document.getElementById('lightboxImg')
const lightboxAuthor = document.getElementById('lightboxAuthor')
const lightboxDownload = document.getElementById('lightboxDownload')
const lightboxClose = document.getElementById('lightboxClose')
const lightboxPrev = document.getElementById('lightboxPrev')
const lightboxNext = document.getElementById('lightboxNext')

let filesToUpload = [];
let fotosCargadas = []; // [{url, autor, nombreArchivo}]
let indiceActual = 0;

// 3. SELECCIÓN DE ARCHIVOS
fileInput.addEventListener('change', (event) => {
    filesToUpload = Array.from(event.target.files);

    if (filesToUpload.length > 0) {
        selectedFilesText.textContent = `${filesToUpload.length} foto(s) seleccionada(s).`;
        uploadBtn.style.display = 'inline-flex';
    } else {
        selectedFilesText.textContent = '';
        uploadBtn.style.display = 'none';
    }
});

// 4. FUNCIÓN PARA MOSTRAR LAS FOTOS
async function loadImages() {
    galleryContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Cargando recuerdos...</p>'

    const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
    })

    if (error) {
        console.error('Error al cargar fotos:', error)
        galleryContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">No se pudieron cargar las fotos.</p>'
        return
    }

    galleryContainer.innerHTML = ''
    fotosCargadas = []

    const archivos = (data || []).filter(f => f.name !== '.emptyFolderPlaceholder')

    if (archivos.length === 0) {
        galleryContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Aún no hay fotos. ¡Anímate a ser el primero!</p>'
        return
    }

    archivos.forEach((file, i) => {
        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name)

        let uploaderName = "Invitado especial";
        if (file.name.includes('___')) {
            const decodedRaw = decodeURIComponent(file.name.split('___')[0]);
            uploaderName = decodedRaw.replace(/_/g, ' ');
        }

        fotosCargadas.push({ url: publicUrlData.publicUrl, autor: uploaderName, nombreArchivo: file.name })

        const card = document.createElement('div');
        card.className = 'photo-card-item';
        card.style.cursor = 'zoom-in';

        const imgElement = document.createElement('img')
        imgElement.src = publicUrlData.publicUrl
        imgElement.alt = "Recuerdo de la boda"
        imgElement.loading = "lazy"

        const nameElement = document.createElement('p');
        nameElement.className = 'photo-author';
        nameElement.textContent = `📸 Subida por: ${uploaderName}`;

        card.appendChild(imgElement);
        card.appendChild(nameElement);
        card.addEventListener('click', () => abrirLightbox(i));
        galleryContainer.appendChild(card);
    })
}

// 5. FUNCIÓN PARA SUBIR FOTOS
uploadBtn.addEventListener('click', async () => {
    if (filesToUpload.length === 0) return;

    let rawName = uploaderNameInput.value.trim();
    if (!rawName) {
        alert("Por favor, ingresa tu nombre para que sepamos de quién son las fotos 😊");
        uploaderNameInput.focus();
        return;
    }

    const safeName = encodeURIComponent(rawName.replace(/\s+/g, '_'));

    uploadBtn.disabled = true;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        uploadStatus.textContent = `Subiendo foto ${i + 1} de ${filesToUpload.length}... ⏳`;
        uploadStatus.style.color = 'var(--text)';

        const fileExt = file.name.split('.').pop();
        const fileName = `${safeName}___${Date.now()}___${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);

        if (error) {
            console.error('Error al subir:', error);
            errorCount++;
        } else {
            successCount++;
        }
    }

    if (errorCount === 0) {
        uploadStatus.textContent = `¡${successCount} foto(s) subida(s) con éxito! 🎉`;
        uploadStatus.style.color = 'green';
    } else {
        uploadStatus.textContent = `Se subieron ${successCount} fotos, pero fallaron ${errorCount}. ❌`;
        uploadStatus.style.color = 'red';
    }

    fileInput.value = '';
    filesToUpload = [];
    selectedFilesText.textContent = '';
    uploadBtn.style.display = 'none';
    uploadBtn.disabled = false;
    uploaderNameInput.value = '';

    loadImages();

    setTimeout(() => { uploadStatus.textContent = '' }, 5000);
})

/* =====================================================
   VISOR DE IMÁGENES (LIGHTBOX)
===================================================== */
function abrirLightbox(indice) {
    indiceActual = indice;
    mostrarFotoActual();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function mostrarFotoActual() {
    const foto = fotosCargadas[indiceActual];
    if (!foto) return;
    lightboxImg.src = foto.url;
    lightboxAuthor.textContent = `📸 Subida por: ${foto.autor}`;
    lightboxDownload.href = foto.url;
    lightboxDownload.setAttribute('download', foto.nombreArchivo || 'foto-boda.jpg');
}

function fotoSiguiente() {
    indiceActual = (indiceActual + 1) % fotosCargadas.length;
    mostrarFotoActual();
}

function fotoAnterior() {
    indiceActual = (indiceActual - 1 + fotosCargadas.length) % fotosCargadas.length;
    mostrarFotoActual();
}

lightboxClose.addEventListener('click', cerrarLightbox);
lightboxNext.addEventListener('click', fotoSiguiente);
lightboxPrev.addEventListener('click', fotoAnterior);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) cerrarLightbox(); });

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') cerrarLightbox();
    if (e.key === 'ArrowRight') fotoSiguiente();
    if (e.key === 'ArrowLeft') fotoAnterior();
});

// La descarga cross-origin desde Supabase Storage a veces abre la imagen
// en vez de descargarla directamente (comportamiento del navegador con
// enlaces a otro dominio). Forzamos la descarga vía blob para que
// funcione siempre igual que un archivo local.
lightboxDownload.addEventListener('click', async (e) => {
    e.preventDefault();
    const foto = fotosCargadas[indiceActual];
    try {
        const resp = await fetch(foto.url);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = foto.nombreArchivo || 'foto-boda.jpg';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
    } catch (err) {
        console.error(err);
        window.open(foto.url, '_blank');
    }
});

// Iniciar cargando las fotos
loadImages()
