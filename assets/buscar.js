async function realizarBusqueda() {
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

    const { data, error } = await supabase
        .from('invitados')
        .select('id, nombre_busqueda, nombre_pareja, pases, mesa')
        .or(`nombre_busqueda.ilike.%${termino}%,nombre_pareja.ilike.%${termino}%`)
        .limit(10)

    // Validar si el texto cambió mientras Supabase respondía para evitar duplicaciones asíncronas
    if (input.value.trim().toLowerCase() !== termino) return

    // Limpiar el contenedor justo antes de pintar los resultados nuevos
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

    // ELIMINAR DUPLICADOS: Filtrar registros por nombre_pareja o id único
    const resultadosUnicos = Array.from(
        new Map(data.map(inv => [inv.nombre_pareja || inv.id, inv])).values()
    )

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