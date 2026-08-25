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

let filesToUpload = [];

// 3. SELECCIÓN DE ARCHIVOS
fileInput.addEventListener('change', (event) => {
    filesToUpload = Array.from(event.target.files);
    
    if (filesToUpload.length > 0) {
        selectedFilesText.textContent = `${filesToUpload.length} foto(s) seleccionada(s).`;
        uploadBtn.style.display = 'inline-flex'; // Mostrar botón de subir
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

    galleryContainer.innerHTML = '' // Limpiar

    if (data && data.length > 0) {
        data.forEach(file => {
            if(file.name === '.emptyFolderPlaceholder') return;

            const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name)
            
            // Extraer el nombre del uploader del nombre del archivo (formato: Nombre___timestamp.ext)
            let uploaderName = "Invitado especial";
            if (file.name.includes('___')) {
                // Decodificamos y quitamos los guiones bajos usados para espacios
                const decodedRaw = decodeURIComponent(file.name.split('___')[0]);
                uploaderName = decodedRaw.replace(/_/g, ' ');
            }
            
            // Crear la tarjeta de la foto
            const card = document.createElement('div');
            card.className = 'photo-card-item';

            const imgElement = document.createElement('img')
            imgElement.src = publicUrlData.publicUrl
            imgElement.alt = "Recuerdo de la boda"
            imgElement.loading = "lazy" 
            
            const nameElement = document.createElement('p');
            nameElement.className = 'photo-author';
            nameElement.textContent = `📸 Subida por: ${uploaderName}`;

            card.appendChild(imgElement);
            card.appendChild(nameElement);
            galleryContainer.appendChild(card);
        })
    } else {
        galleryContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Aún no hay fotos. ¡Anímate a ser el primero!</p>'
    }
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

    // Codificamos el nombre para que no rompa el enlace (sustituimos espacios por _)
    const safeName = encodeURIComponent(rawName.replace(/\s+/g, '_'));

    uploadBtn.disabled = true;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        uploadStatus.textContent = `Subiendo foto ${i + 1} de ${filesToUpload.length}... ⏳`;
        uploadStatus.style.color = 'var(--text)';
        
        const fileExt = file.name.split('.').pop();
        // Formato: NombreSeguro___1683939393___xyz.jpg
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
    
    // Restaurar el formulario
    fileInput.value = '';
    filesToUpload = [];
    selectedFilesText.textContent = '';
    uploadBtn.style.display = 'none';
    uploadBtn.disabled = false;
    uploaderNameInput.value = ''; // Limpiar el nombre opcionalmente

    loadImages(); // Recargar la galería

    setTimeout(() => { uploadStatus.textContent = '' }, 5000);
})

// Iniciar cargando las fotos
loadImages()