import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://wcsiymdddkvmkypuxzjp.supabase.co'
const supabaseKey = 'sb_publishable_aglQGTkxk497-Hv49IFbCQ_r8N3Ixoy'
const supabase = createClient(supabaseUrl, supabaseKey)

const form = document.getElementById('searchForm')
const input = document.getElementById('searchInput')
const status = document.getElementById('searchStatus')
const resultsList = document.getElementById('resultsList')

let peticionActual = 0

async function realizarBusqueda() {
    if (!input) return
    const termino = input.value.trim().toLowerCase()
    
    if (termino.length < 2) {
        if (status) status.textContent = ''
        if (resultsList) resultsList.innerHTML = ''
        return
    }

    if (status) {
        status.textContent = 'Buscando... 🔎'
        status.style.color = 'var(--gold-light, #d4af37)'
    }

    // Guardar el número de petición para evitar respuestas viejas desordenadas
    const idBusqueda = ++peticionActual

    const { data, error } = await supabase
        .from('invitados')
        .select('id, nombre_busqueda, nombre_pareja, pases, mesa')
        .or(`nombre_busqueda.ilike.%${termino}%,nombre_pareja.ilike.%${termino}%`)
        .limit(10)

    // Si el usuario escribió algo nuevo mientras se consultaba, ignorar esta respuesta
    if (idBusqueda !== peticionActual) return

    if (resultsList) resultsList.innerHTML = ''

    if (error) {
        console.error('Error Supabase:', error)
        if (status) {
            status.textContent = 'Error al consultar. Intenta de nuevo.'
            status.style.color = '#ffb4b4'
        }
        return
    }

    if (!data || data.length === 0) {
        if (status) {
            status.textContent = 'No encontramos ese nombre. Verifica cómo lo escribiste.'
            status.style.color = '#ffb4b4'
        }
        return
    }

    // Filtrar duplicados exactos por el campo nombre_pareja
    const resultadosUnicos = []
    const nombresVistos = new Set()

    for (const inv of data) {
        const clave = (inv.nombre_pareja || '').trim().toLowerCase()
        if (!nombresVistos.has(clave)) {
            nombresVistos.add(clave)
            resultadosUnicos.push(inv)
        }
    }

    if (status) {
        status.textContent = 'Encontramos varias coincidencias, toca la tuya:'
        status.style.color = '#ffffff'
    }

    resultadosUnicos.forEach(inv => {
        const card = document.createElement('button')
        card.type = 'button'
        card.className = 'result-item'
        card.style.cssText = 'display:block; width:100%; margin:8px 0; padding:12px; cursor:pointer;'
        card.innerHTML = `<strong>${inv.nombre_pareja}</strong><br><small>Mesa ${inv.mesa ?? '—'} · ${inv.pases ?? '—'} pases</small>`
        card.addEventListener('click', () => {
            window.location.href = `invitacion.html?id=${inv.id}`
        })
        if (resultsList) resultsList.appendChild(card)
    })
}
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault()
        realizarBusqueda()
    })
}
let timer
if (input) {
    input.addEventListener('input', () => {
        clearTimeout(timer)
        timer = setTimeout(realizarBusqueda, 300)
    })
}