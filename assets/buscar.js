import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Reutiliza las mismas credenciales que el resto del sitio
const supabaseUrl = 'https://wcsiymdddkvmkypuxzjp.supabase.co'
const supabaseKey = 'sb_publishable_aglQGTkxk497-Hv49IFbCQ_r8N3Ixoy'
const supabase = createClient(supabaseUrl, supabaseKey)

const form = document.getElementById('searchForm')
const input = document.getElementById('searchInput')
const status = document.getElementById('searchStatus')
const resultsList = document.getElementById('resultsList')

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const termino = input.value.trim().toLowerCase()
    if (termino.length < 2) return

    status.textContent = 'Buscando... 🔎'
    status.style.color = 'var(--gold-light)'
    resultsList.innerHTML = ''

    const { data, error } = await supabase
        .from('invitados')
        .select('id, nombre_busqueda, nombre_pareja, pases, mesa')
        .ilike('nombre_busqueda', `%${termino}%`)
        .limit(8)

    if (error) {
        console.error(error)
        status.textContent = 'Ocurrió un error buscando tu invitación. Intenta de nuevo.'
        status.style.color = '#ffb4b4'
        return
    }

    if (!data || data.length === 0) {
        status.textContent = 'No encontramos ese nombre. Verifica cómo lo escribiste o contáctanos.'
        status.style.color = '#ffb4b4'
        return
    }

    status.textContent = ''

    if (data.length === 1) {
        // Coincidencia única: pasa directo a la invitación
        irA('invitacion.html', { id: data[0].id })
        return
    }

    // Varias coincidencias: deja elegir
    status.textContent = 'Encontramos varias coincidencias, toca la tuya:'
    status.style.color = 'white'

    data.forEach(inv => {
        const card = document.createElement('button')
        card.type = 'button'
        card.className = 'result-item'
        card.innerHTML = `<strong>${inv.nombre_pareja}</strong><span>Mesa ${inv.mesa ?? '—'} · ${inv.pases ?? '—'} pases</span>`
        card.addEventListener('click', () => irA('invitacion.html', { id: inv.id }))
        resultsList.appendChild(card)
    })
})
