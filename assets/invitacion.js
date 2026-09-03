import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://wcsiymdddkvmkypuxzjp.supabase.co'
const supabaseKey = 'sb_publishable_aglQGTkxk497-Hv49IFbCQ_r8N3Ixoy'
const supabase = createClient(supabaseUrl, supabaseKey)

/* =====================================================
   NOTIFICACIÓN POR WHATSAPP (CallMeBot)
   1. Desde el WhatsApp de los novios, agrega el contacto
      +34 644 59 71 67 y envíale: "I allow callmebot to send me messages"
   2. Te responderá con tu API KEY personal.
   3. Reemplaza las 2 constantes de abajo con tu número (con
      indicativo, sin '+' ni espacios) y tu apikey.
   Nota: es un servicio gratuito de terceros pensado para
   notificaciones personales, no para uso masivo. Si algún día
   deja de funcionar, la confirmación seguirá guardándose
   correctamente en Supabase de todas formas.
===================================================== */
const WHATSAPP_NUMERO_NOVIOS = '573106334641' // <-- CAMBIAR
const WHATSAPP_APIKEY = 'TU_APIKEY_AQUI'       // <-- CAMBIAR

async function notificarWhatsApp(texto) {
    try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMERO_NOVIOS}&text=${encodeURIComponent(texto)}&apikey=${WHATSAPP_APIKEY}`
        await fetch(url, { mode: 'no-cors' })
    } catch (err) {
        console.warn('No se pudo enviar la notificación de WhatsApp:', err)
    }
}

/* =====================================================
   ELEMENTOS
===================================================== */
const estadoCargando = document.getElementById('estadoCargando')
const estadoError = document.getElementById('estadoError')
const tarjeta = document.getElementById('tarjetaInvitacion')
const nombrePareja = document.getElementById('nombrePareja')
const lineaHijos = document.getElementById('lineaHijos')
const numPases = document.getElementById('numPases')
const numMesa = document.getElementById('numMesa')
const rsvpBotones = document.getElementById('rsvpBotones')
const btnSi = document.getElementById('btnSi')
const btnNo = document.getElementById('btnNo')
const mensajeConfirmado = document.getElementById('mensajeConfirmado')
const accionesPost = document.getElementById('accionesPostConfirmacion')
const btnDescargarPng = document.getElementById('btnDescargarPng')
const btnContinuar = document.getElementById('btnContinuar')

const params = new URLSearchParams(window.location.search)
const invitadoId = params.get('id')

let invitadoActual = null

/* =====================================================
   CARGA DEL INVITADO
===================================================== */
async function cargarInvitado() {
    if (!invitadoId) {
        mostrarError()
        return
    }

    const { data, error } = await supabase
        .from('invitados')
        .select('id, nombre_pareja, hijos, pases, mesa, confirmado')
        .eq('id', invitadoId)
        .single()

    if (error || !data) {
        console.error(error)
        mostrarError()
        return
    }

    invitadoActual = data
    pintarTarjeta(data)
}

function mostrarError() {
    estadoCargando.classList.add('hidden')
    estadoError.classList.remove('hidden')
}

function pintarTarjeta(inv) {
    estadoCargando.classList.add('hidden')
    tarjeta.classList.remove('hidden')

    nombrePareja.textContent = inv.nombre_pareja
    if (inv.hijos) lineaHijos.classList.remove('hidden')
    numPases.textContent = inv.pases ?? '—'
    numMesa.textContent = inv.mesa ?? '—'

    // Llenar el selector de pases dinámicamente según el límite (1 hasta inv.pases)
    const select = document.getElementById('pasesSelect')
    select.innerHTML = ''
    const limitePases = inv.pases || 1
    for (let i = 1; i <= limitePases; i++) {
        const option = document.createElement('option')
        option.value = i
        option.textContent = `${i} persona${i > 1 ? 's' : ''}`
        if (i === limitePases) option.selected = true
        select.appendChild(option)
    }

    if (inv.confirmado === 'asistira' || inv.confirmado === 'no_asistira') {
        rsvpBotones.classList.add('hidden')
        document.getElementById('selectorPasesContainer').classList.add('hidden')
        mensajeConfirmado.classList.remove('hidden')
        
        if (inv.confirmado === 'asistira') {
            mensajeConfirmado.textContent = '✅ Ya confirmaste tu asistencia. ¡Te esperamos!'
            accionesPost.classList.remove('hidden')
        } else {
            mensajeConfirmado.textContent = 'Ya registramos que no podrás acompañarnos. ¡Gracias por avisarnos!'
            setTimeout(() => irA('contenido.html'), 2500)
        }
    }
}

async function confirmarAsistencia(asiste) {
    rsvpBotones.querySelectorAll('button').forEach(b => b.disabled = true)
    const select = document.getElementById('pasesSelect')
    const pasesElegidos = asiste ? parseInt(select.value, 10) : 0

    // Guardado directo en la base de datos sin invocar RPC
    const { error } = await supabase
        .from('invitados')
        .update({
            confirmado: asiste ? 'asistira' : 'no_asistira',
            pases_confirmados: pasesElegidos,
            confirmado_en: new Date().toISOString()
        })
        .eq('id', invitadoId)

    if (error) {
        console.error('Error guardando en Supabase:', error)
        alert('Ocurrió un problema guardando tu confirmación. Intenta de nuevo.')
        rsvpBotones.querySelectorAll('button').forEach(b => b.disabled = false)
        return
    }

    rsvpBotones.classList.add('hidden')
    document.getElementById('selectorPasesContainer').classList.add('hidden')
    mensajeConfirmado.classList.remove('hidden')

    if (asiste) {
        // Actualizamos el número visible en la tarjeta para que la foto capturada lleve el número correcto
        numPases.textContent = pasesElegidos
        mensajeConfirmado.textContent = `✅ ¡Gracias por confirmar! (${pasesElegidos} pase(s)). Te esperamos.`
        accionesPost.classList.remove('hidden')
        notificarWhatsApp(`🎉 ${invitadoActual.nombre_pareja} confirmó SÍ asistirá con ${pasesElegidos} pases (mesa ${invitadoActual.mesa}).`)
    } else {
        mensajeConfirmado.textContent = '¡Gracias por confirmar! Lamentamos que no puedas acompañarnos.'
        notificarWhatsApp(`💔 ${invitadoActual.nombre_pareja} confirmó que NO podrá asistir.`)
        // Redirección a contenido.html
        setTimeout(() => irA('contenido.html'), 2500)
    }
}

/* =====================================================
   CONFIRMAR ASISTENCIA (vía función RPC — ver SUPABASE-SETUP.md)
===================================================== */
async function confirmarAsistencia(asiste) {
    rsvpBotones.querySelectorAll('button').forEach(b => b.disabled = true)

    const { error } = await supabase.rpc('confirmar_asistencia', {
        p_id: invitadoId,
        p_asiste: asiste
    })

    if (error) {
        console.error(error)
        alert('Ocurrió un problema guardando tu confirmación. Intenta de nuevo.')
        rsvpBotones.querySelectorAll('button').forEach(b => b.disabled = false)
        return
    }

    rsvpBotones.classList.add('hidden')
    mensajeConfirmado.classList.remove('hidden')

    if (asiste) {
        mensajeConfirmado.textContent = '✅ ¡Gracias por confirmar! Te esperamos.'
        accionesPost.classList.remove('hidden')
        notificarWhatsApp(`🎉 ${invitadoActual.nombre_pareja} confirmó SÍ asistirá (${invitadoActual.pases} pases, mesa ${invitadoActual.mesa}).`)
    } else {
        mensajeConfirmado.textContent = 'Gracias por avisarnos. ¡Los extrañaremos!'
        notificarWhatsApp(`💔 ${invitadoActual.nombre_pareja} confirmó que NO podrá asistir.`)
        setTimeout(() => irA('contenido.html'), 2200)
    }
}

btnSi.addEventListener('click', () => confirmarAsistencia(true))
btnNo.addEventListener('click', () => confirmarAsistencia(false))
btnContinuar.addEventListener('click', () => irA('contenido.html'))

/* =====================================================
   DESCARGAR INVITACIÓN COMO PNG
===================================================== */
btnDescargarPng.addEventListener('click', async () => {
    btnDescargarPng.disabled = true
    btnDescargarPng.textContent = 'Generando imagen...'

    // Oculta temporalmente los botones para que no salgan en la foto
    rsvpBotones.classList.add('hidden')
    accionesPost.style.visibility = 'hidden'

    try {
        const canvas = await html2canvas(tarjeta, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true
        })
        const link = document.createElement('a')
        link.download = `invitacion-${invitadoActual.nombre_pareja.replace(/\s+/g, '_')}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
    } catch (err) {
        console.error(err)
        alert('No se pudo generar la imagen. Intenta de nuevo.')
    } finally {
        accionesPost.style.visibility = 'visible'
        btnDescargarPng.disabled = false
        btnDescargarPng.textContent = '📥 Descargar mi invitación'
    }
})

cargarInvitado()
