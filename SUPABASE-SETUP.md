# Configuración de Supabase — Boda Anderson & Esmeralda

Sigue estos pasos **en orden**, dentro de tu proyecto de Supabase
(`wcsiymdddkvmkypuxzjp`), en el menú **SQL Editor**.

## 1. Crear la tabla `invitados`

Pega y ejecuta esto en el SQL Editor:

```sql
create table public.invitados (
    id uuid primary key default gen_random_uuid(),
    nombre_busqueda text not null,        -- ej: "carlos" (minúsculas, sin apellido)
    nombre_pareja   text not null,        -- ej: "Carlos Gómez y Laura Ruiz"
    hijos           boolean not null default false,
    pases           integer not null default 1,
    mesa            integer,
    confirmado      text not null default 'pendiente'
                    check (confirmado in ('pendiente', 'asistira', 'no_asistira')),
    confirmado_en   timestamptz,
    creado_en       timestamptz not null default now()
);

-- Índice para que la búsqueda por nombre sea rápida
create index invitados_nombre_busqueda_idx
    on public.invitados using gin (nombre_busqueda gin_trgm_ops);

-- Necesario para el índice de búsqueda por texto parcial (ilike)
create extension if not exists pg_trgm;
```

## 2. Activar seguridad a nivel de fila (RLS)

Esto es importante: sin esto, cualquiera con la URL de tu proyecto
podría leer o modificar la tabla completa.

```sql
alter table public.invitados enable row level security;

-- Permite que la página de búsqueda LEA los datos (nombre, pases, mesa)
create policy "Lectura pública de invitados"
    on public.invitados
    for select
    to anon
    using (true);

-- OJO: NO creamos política de UPDATE para "anon".
-- Los invitados solo podrán confirmar su asistencia a través de la
-- función segura del paso 3, nunca modificando la tabla directamente.
```

## 3. Función segura para confirmar asistencia

Esta función es la única forma en que un invitado puede "escribir" en
la base de datos, y solo puede tocar las columnas `confirmado` y
`confirmado_en` — nunca `pases`, `mesa` ni los nombres.

```sql
create or replace function public.confirmar_asistencia(p_id uuid, p_asiste boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.invitados
    set
        confirmado = case when p_asiste then 'asistira' else 'no_asistira' end,
        confirmado_en = now()
    where id = p_id;
end;
$$;

-- Permite que cualquier visitante (anon) pueda EJECUTAR esta función
-- (pero no tocar la tabla directamente)
grant execute on function public.confirmar_asistencia(uuid, boolean) to anon;
```

## 4. Cargar tus invitados

Ejemplo de cómo insertar filas (repite una por familia/pareja):

```sql
insert into public.invitados (nombre_busqueda, nombre_pareja, hijos, pases, mesa)
values
    ('david',   'David Ortega y Yamileth Burgos', true,  4, 4),
    ('carlos',  'Carlos Gómez y Laura Ruiz',       false, 2, 7),
    ('familia', 'Familia Restrepo Londoño',        true,  5, 3);
```

- **`nombre_busqueda`**: escribe SOLO el primer nombre en minúsculas —
  es lo que la persona escribirá en `buscar.html` (ej: `"david"`).
- **`nombre_pareja`**: el texto completo que se mostrará en la
  invitación (ej: `"David Ortega y Yamileth Burgos"`).
- **`hijos`**: `true` si deben mostrar "e hijos" en la invitación.
- **`pases`**: número total de personas invitadas en ese grupo.
- **`mesa`**: número de mesa asignada.

Puedes editar `pases` y `mesa` en cualquier momento desde el **Table
Editor** de Supabase sin tocar nada de código.

## 5. Storage para las fotos (si aún no lo hiciste)

En **Storage**, crea un bucket llamado `boda-fotos`, márcalo como
**público**, y agrega esta política para permitir subidas anónimas:

```sql
create policy "Subida pública de fotos"
    on storage.objects
    for insert
    to anon
    with check (bucket_id = 'boda-fotos');

create policy "Lectura pública de fotos"
    on storage.objects
    for select
    to anon
    using (bucket_id = 'boda-fotos');
```

## 6. Notificación por WhatsApp cuando alguien confirma

El sitio usa **CallMeBot** (gratuito, pensado para notificaciones
personales) para avisarte por WhatsApp cada vez que alguien confirma:

1. Desde el WhatsApp de los novios, agrega el número **+34 644 59 71 67**.
2. Envíale el mensaje exacto: `I allow callmebot to send me messages`.
3. Te responderá con tu **apikey** personal.
4. Abre `assets/invitacion.js` y reemplaza:
   ```js
   const WHATSAPP_NUMERO_NOVIOS = '573000000000' // tu número con indicativo, sin '+'
   const WHATSAPP_APIKEY = 'TU_APIKEY_AQUI'
   ```

Si en algún momento CallMeBot deja de responder, no pasa nada grave:
la confirmación de asistencia se sigue guardando perfectamente en
Supabase, solo no llegará el mensaje de WhatsApp. Para algo más
robusto a futuro (multi-número, garantía de entrega), lo ideal sería
mover este envío a una **Supabase Edge Function** con la API oficial
de WhatsApp Business — puedo ayudarte a montarlo si más adelante lo
necesitas.
