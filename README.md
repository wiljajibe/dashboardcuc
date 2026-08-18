# Dashboard CUC

Esta es la copia local del proyecto publicado en `wiljajibe.com`. La página muestra los indicadores de matrículas y admisiones leyendo el archivo de Excel incluido en el proyecto.

## Qué está listo

- Lectura y validación automática del Excel.
- Fechas, periodo e indicadores tomados de los datos, sin cifras escritas manualmente.
- Filtros, búsqueda, ordenamiento y diseño adaptable a celular.
- Mensajes claros si el Excel falta, está dañado o cambia de estructura.
- Estructura modular para agregar más dashboards.
- Inicio de sesión y fuente privada preparados para activarse con Supabase.
- Reglas de permisos por usuario y dashboard en `supabase/schema.sql`.

## Actualizar los datos actuales

1. Conserva el nombre `Dashboard_Matriculas_CUC_2026-2.xlsx`.
2. Reemplaza el archivo por la versión nueva.
3. No cambies los nombres de las hojas ni de las columnas.
4. Abre la copia local y verifica las cifras antes de publicar.

El sistema revisa que existan estas hojas: `Resumen ejecutivo`, `Consolidado por programa`, `Matrícula académica` y `Embudo de admisiones`.

## Estructura sencilla

- `index.html`: página principal.
- `login.html`: acceso para usuarios, todavía desactivado.
- `assets/css/dashboard.css`: diseño visual.
- `assets/js/config.js`: registro de dashboards y fuente de datos.
- `assets/js/excel-loader.js`: lectura y validación del Excel.
- `assets/js/dashboard-matriculas.js`: presentación del dashboard actual.
- `assets/js/auth-config.js`: activación futura del inicio de sesión.
- `supabase/schema.sql`: usuarios, permisos y almacenamiento privado.
- `docs/GUIA_PARA_WILLIAM.md`: explicación paso a paso sin tecnicismos.
- `docs/COMO_PUBLICAR_EN_GITHUB.md`: publicación segura y revisión de HTTPS.
- `docs/ESTADO_HTTPS.md`: diagnóstico actual del dominio y certificado.
- `backups/`: copias de seguridad locales excluidas de GitHub.

## Importante sobre seguridad

Mientras el Excel permanezca dentro del repositorio público, cualquier persona con el enlace puede descargarlo. Un formulario de acceso por sí solo no lo vuelve privado. Para restringir la información se debe activar Supabase, mover allí los datos y asignar permisos a cada usuario.

Nunca escribas aquí una contraseña, una clave `service_role` ni una `secret key`. Para configurar la página solo se utiliza la URL del proyecto y la clave pública/publishable de Supabase.

## Publicación

Los cambios de esta copia local no modifican `wiljajibe.com`. La publicación se hace después de probar y aprobar la versión local.
