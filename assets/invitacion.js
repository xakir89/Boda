import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Configuración Supabase
const supabaseUrl = 'https://wcsiymdddkvmkypuxzjp.supabase.co'
const supabaseKey = 'sb_publishable_aglQGTkxk497-Hv49IFbCQ_r8N3Ixoy'
const supabase = createClient(supabaseUrl, supabaseKey)

// Configuración Telegram API
const TELEGRAM_BOT_TOKEN = '8741822084:AAFf6F1pQ6iZpWvWNZLYR9MkuNnXhjPIUBo'
const TELEGRAM_CHAT_ID = '6190824662'

async function enviarNotificacionTelegram(mensaje) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: mensaje // Se remueve parse_mode para evitar bloqueos por caracteres especiales
            })
        })
        const data = await res.json()
        if (!data.ok) {
            console.error('Error de Telegram:', data.description)
        }
    } catch (e) {
        console.warn('Error al enviar notificación:', e)
    }
}

// Elementos HTML
const estadoCargando = document.getElementById('estadoCargando')
const estadoError = document.getElementById('estadoError')
const tarjeta = document.getElementById('tarjetaInvitacion')
const nombrePareja = document.getElementById('nombrePareja')
const numPases = document.getElementById('numPases')
const numMesa = document.getElementById('numMesa')
const selectorPasesContainer = document.getElementById('selectorPasesContainer')
const pasesSelect = document.getElementById('pasesSelect')
const rsvpBotones = document.getElementById('rsvpBotones')
const btnSi = document.getElementById('btnSi')
const btnNo = document.getElementById('btnNo')
const mensajeConfirmado = document.getElementById('mensajeConfirmado')
const accionesPost = document.getElementById('accionesPostConfirmacion')
const btnDescargarPng = document.getElementById('btnDescargarPng')
const btnContinuar = document.getElementById('btnContinuar')
const detallesEvento = document.getElementById('detallesEvento')
// Parámetros URL
const params = new URLSearchParams(window.location.search)
const invitadoId = params.get('id')
const invitadoNombre = params.get('nombre')

let invitadoActual = null

async function cargarInvitado() {
    if (!invitadoId && !invitadoNombre) {
        mostrarError()
        return
    }

    let query = supabase.from('invitados').select('id, nombre_pareja, pases, mesa, confirmado, pases_confirmados')

    if (invitadoId) {
        query = query.eq('id', invitadoId)
    } else if (invitadoNombre) {
        query = query.or(`nombre_busqueda.ilike.%${invitadoNombre}%,nombre_pareja.ilike.%${invitadoNombre}%`)
    }

    const { data, error } = await query.limit(1).maybeSingle()

    if (error || !data) {
        mostrarError()
        return
    }

    invitadoActual = data
    pintarTarjeta(data)
}

function mostrarError() {
    if (estadoCargando) estadoCargando.classList.add('hidden')
    if (estadoError) estadoError.classList.remove('hidden')
}

function pintarTarjeta(inv) {
    if (estadoCargando) estadoCargando.classList.add('hidden')
    if (tarjeta) tarjeta.classList.remove('hidden')

    if (nombrePareja) nombrePareja.textContent = inv.nombre_pareja
    if (numMesa) numMesa.textContent = inv.mesa ?? '—'

    // Determina los pases a mostrar según el estado
    const pasesAMostrar = (inv.confirmado === 'asistira' && inv.pases_confirmados != null)
        ? inv.pases_confirmados
        : (inv.pases ?? 1)

    if (numPases) numPases.textContent = pasesAMostrar

    // Llenar selector desplegable
    if (pasesSelect) {
        pasesSelect.innerHTML = ''
        const limitePases = inv.pases || 1
        for (let i = 1; i <= limitePases; i++) {
            const option = document.createElement('option')
            option.value = i
            option.textContent = `${i} persona${i > 1 ? 's' : ''}`
            if (i === pasesAMostrar) option.selected = true
            pasesSelect.appendChild(option)
        }
    }

    // Si ya confirmó asistencia previamente
    if (inv.confirmado === 'asistira' || inv.confirmado === 'no_asistira') {
        if (rsvpBotones) rsvpBotones.classList.add('hidden')
        if (selectorPasesContainer) selectorPasesContainer.classList.add('hidden')

        if (mensajeConfirmado) {
            mensajeConfirmado.classList.remove('hidden')
            mensajeConfirmado.textContent = inv.confirmado === 'asistira'
                ? '¡Gracias por confirmar!'
                : 'Gracias por confirmar.'
        }

        if (inv.confirmado === 'asistira' && accionesPost) {
            accionesPost.classList.remove('hidden')
            if (detallesEvento) detallesEvento.classList.remove('hidden')
        }
    } else {
        if (selectorPasesContainer) selectorPasesContainer.classList.remove('hidden')
        if (rsvpBotones) rsvpBotones.classList.remove('hidden')
    }
}

// ACTUALIZACIÓN EN TIEMPO REAL AL CAMBIAR EL DESPLEGABLE
if (pasesSelect) {
    pasesSelect.addEventListener('change', (e) => {
        if (numPases) numPases.textContent = e.target.value
    })
}

async function confirmarAsistencia(asiste) {
    if (!invitadoActual || !invitadoActual.id) return

    // Bloquear botones inmediatamente al hacer clic para evitar doble envío
    if (btnSi) btnSi.disabled = true
    if (btnNo) btnNo.disabled = true

    const pasesElegidos = asiste 
        ? (pasesSelect ? parseInt(pasesSelect.value, 10) : (invitadoActual.pases || 1)) 
        : 0

    // 1. Guardar en Supabase
    const { error } = await supabase
        .from('invitados')
        .update({
            confirmado: asiste ? 'asistira' : 'no_asistira',
            pases_confirmados: pasesElegidos,
            confirmado_en: new Date().toISOString()
        })
        .eq('id', invitadoActual.id)

    if (error) {
        alert('Ocurrió un error al guardar tu respuesta. Intenta de nuevo.')
        if (btnSi) btnSi.disabled = false
        if (btnNo) btnNo.disabled = false
        return
    }

    // 2. Ocultar formulario de botones y pases
    if (rsvpBotones) rsvpBotones.classList.add('hidden')
    if (selectorPasesContainer) selectorPasesContainer.classList.add('hidden')

    if (asiste) {
        if (numPases) numPases.textContent = pasesElegidos
        if (detallesEvento) detallesEvento.classList.remove('hidden')
        if (mensajeConfirmado) {
            mensajeConfirmado.classList.remove('hidden')
            mensajeConfirmado.textContent = '¡Gracias por confirmar!'
        }

        if (accionesPost) accionesPost.classList.remove('hidden')

        // Notificación Telegram
        const msj = `🎉 NUEVA CONFIRMACIÓN\n\nInvitado: ${invitadoActual.nombre_pareja}\nAsistencia: SÍ\nPases confirmados: ${pasesElegidos}\nMesa: ${invitadoActual.mesa ?? 'Sin asignar'}`
        enviarNotificacionTelegram(msj)

    } else {
        if (mensajeConfirmado) {
            mensajeConfirmado.classList.remove('hidden')
            mensajeConfirmado.textContent = 'Gracias por confirmar.'
        }

        // Notificación Telegram
        const msj = `💔 CONFIRMACIÓN DE INASISTENCIA\n\nInvitado: ${invitadoActual.nombre_pareja}\nAsistencia: NO ASISTIRÁ`
        enviarNotificacionTelegram(msj)

        // Redirigir a buscar.html tras 2 segundos
        setTimeout(() => {
            window.location.href = 'buscar.html'
        }, 2000)
    }
}

// Descargar imagen
if (btnDescargarPng) {
    btnDescargarPng.addEventListener('click', async () => {
        if (typeof html2canvas === 'undefined') {
            alert('Falta incluir html2canvas en invitacion.html')
            return
        }

        btnDescargarPng.textContent = 'Generando imagen...'
        btnDescargarPng.disabled = true

        try {
            const canvas = await html2canvas(tarjeta, {
                backgroundColor: null,
                scale: 2,
                useCORS: true
            })

            const link = document.createElement('a')
            link.download = `Invitacion_${invitadoActual.nombre_pareja.replace(/\s+/g, '_')}.jpg`
            link.href = canvas.toDataURL('image/jpeg', 0.95)
            link.click()
        } catch (e) {
            console.error('Error generando la imagen:', e)
            alert('No se pudo descargar la imagen.')
        } finally {
            btnDescargarPng.textContent = '📥 Descargar mi invitación'
            btnDescargarPng.disabled = false
        }
    })
}

if (btnSi) btnSi.addEventListener('click', () => confirmarAsistencia(true))
if (btnNo) btnNo.addEventListener('click', () => confirmarAsistencia(false))
if (btnContinuar) btnContinuar.addEventListener('click', () => { window.location.href = 'contenido.html' })

cargarInvitado()