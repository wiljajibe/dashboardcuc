# Dashboard CUC

Portal privado de indicadores publicado en `wiljajibe.com`. La página exige una sesión de Supabase y solo consulta datos autorizados mediante reglas Row Level Security (RLS).

## Seguridad activa

- Inicio de sesión con correo y contraseña.
- Registro público desactivado: los usuarios se crean únicamente por invitación.
- Permisos individuales por usuario y dashboard.
- Datos almacenados en Supabase, no en archivos públicos de GitHub.
- Tablas sin acceso para visitantes anónimos.
- Claves secretas y archivos institucionales excluidos mediante `.gitignore`.
- Pantalla segura para crear o recuperar la contraseña.

La URL del proyecto y la clave `publishable` pueden estar en el navegador porque las tablas están protegidas con RLS. Nunca se debe publicar una contraseña, una `secret key` ni una clave `service_role`.

## Actualizar Matrículas

1. Recibir los tres PDF institucionales del nuevo corte.
2. Generar y validar localmente el Excel de respaldo.
3. Comparar los totales y revisar advertencias.
4. Convertir la información al formato privado del dashboard.
5. Cargar un nuevo conjunto de datos en Supabase y desactivar el corte anterior.
6. Comprobar el resultado con un usuario autorizado.

Los PDF y Excel se conservan localmente y no se agregan al repositorio.

## Estructura principal

- `index.html`: dashboard de Matrículas.
- `login.html`: inicio de sesión.
- `set-password.html`: creación o recuperación de contraseña.
- `assets/js/auth-config.js`: conexión pública con Supabase.
- `assets/js/supabase-data.js`: consulta de datos protegidos.
- `assets/js/dashboard-matriculas.js`: presentación del dashboard.
- `supabase/schema.sql`: tablas, perfiles, permisos y políticas RLS.
- `docs/GUIA_PARA_WILLIAM.md`: guía sencilla de operación.

## Segundo dashboard

El mismo proyecto de Supabase admite varios dashboards. Cada panel se registra con un identificador propio y se asigna únicamente a los usuarios que deban verlo.
