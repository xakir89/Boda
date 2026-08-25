import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 1. TUS CREDENCIALES DE SUPABASE
const supabaseUrl = 'https://wcsiymdddkvmkypuxzjp.supabase.co'
const supabaseKey = 'sb_publishable_aglQGTkxk497-Hv49IFbCQ_r8N3Ixoy' // <--- ¡Reemplaza esto!
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = 'boda-fotos'

// 2. ELEMENTOS DEL HTML
const uploadBtn = document.getElementById('uploadBtn')
const fileInput = document.getElementById('fileInput')
const galleryContainer = document.getElementById('galleryContainer')
const uploadStatus = document.getElementById('uploadStatus')

// 3. FUNCIÓN PARA MOSTRAR LAS FOTOS
async function loadImages() {
    galleryContainer.innerHTML = '<p>Cargando fotos...</p>'
    
    // Buscar fotos en el bucket
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
    })

    if (error) {
        console.error('Error al cargar fotos:', error)
        galleryContainer.innerHTML = '<p>No se pudieron cargar las fotos.</p>'
        return
    }

    galleryContainer.innerHTML = '' // Limpiar texto de carga

    // Si hay fotos, obtener su URL pública y mostrarlas
    if (data && data.length > 0) {
        data.forEach(file => {
            // Ignorar archivos vacíos por si acaso
            if(file.name === '.emptyFolderPlaceholder') return;

            const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name)
            
            const imgElement = document.createElement('img')
            imgElement.src = publicUrlData.publicUrl
            imgElement.alt = "Foto de la boda"
            imgElement.loading = "lazy" // Mejora la velocidad de la página
            
            galleryContainer.appendChild(imgElement)
        })
    } else {
        galleryContainer.innerHTML = '<p>Aún no hay fotos. ¡Sé el primero en subir una!</p>'
    }
}

// 4. FUNCIÓN PARA SUBIR FOTOS
uploadBtn.addEventListener('click', () => {
    fileInput.click() // Abre la ventana para elegir archivo
})

fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0]
    if (!file) return

    uploadStatus.textContent = 'Subiendo foto... ⏳'
    
    // Crear un nombre único para que no se sobreescriban
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

    // Subir a Supabase
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file)

    if (error) {
        console.error('Error al subir:', error)
        uploadStatus.textContent = 'Hubo un error al subir la foto. ❌'
        uploadStatus.style.color = 'red'
    } else {
        uploadStatus.textContent = '¡Foto subida con éxito! 🎉'
        uploadStatus.style.color = 'green'
        loadImages() // Recargar la galería para mostrar la nueva foto
    }
    
    // Quitar el mensaje después de 3 segundos
    setTimeout(() => { uploadStatus.textContent = '' }, 3000)
})

// 5. CARGAR LAS FOTOS AL INICIAR LA PÁGINA
loadImages()