# Guía del proyecto para William

## En palabras simples

La página actual seguirá funcionando con el Excel como hasta ahora. La copia local fue organizada para que sea más fácil mantenerla y para poder agregar otros dashboards.

El acceso con usuario todavía no está encendido. Esto es intencional: primero hay que crear el servicio seguro donde vivirán los usuarios, permisos y datos privados. Encender una pantalla de acceso sin mover los datos no protegería la información.

## Lo que yo puedo hacer desde esta copia

- Corregir y mejorar la página.
- Integrar el segundo dashboard cuando tengas sus archivos o datos.
- Preparar la lectura de sus datos.
- Conectar la página con Supabase después de que crees el proyecto.
- Probar todo antes de publicarlo.

## Lo único que necesitaré de ti para activar usuarios

1. Crear una cuenta gratuita en Supabase.
2. Crear un proyecto nuevo.
3. Entregarme la **Project URL** y la **Publishable key** de ese proyecto.
4. No compartir la contraseña del proyecto, la `service_role key` ni ninguna `secret key`.

Con esos dos datos públicos podré conectar la página. Después se crearán los usuarios y se decidirá qué dashboard puede ver cada persona.

## Cómo quedará el acceso

- Cada persona entra con su correo y contraseña.
- Un usuario normal solo ve los dashboards que le fueron asignados.
- Un administrador puede asignar permisos y actualizar información.
- Los datos dejan de estar guardados como un Excel público en GitHub.
- Si se desactiva un usuario, pierde el acceso.

## Cómo integrar el segundo dashboard

Cuando estés listo, copia su carpeta o archivos dentro de este proyecto y dime:

- qué información muestra;
- de dónde salen los datos;
- quiénes deben verlo;
- cada cuánto se actualiza.

No necesitas modificar código. Yo revisaré su estructura, lo adaptaré al menú común y conservaré una apariencia uniforme.

## Qué no debes hacer todavía

- No reemplaces la página pública con esta copia sin probarla.
- No publiques claves secretas en GitHub.
- No crees usuarios hasta que la base de datos y los permisos estén activados.
- No elimines el Excel actual mientras la página siga usando el modo público.

## Orden recomendado

1. Probar y publicar las mejoras del dashboard actual.
2. Corregir el dominio y su certificado HTTPS.
3. Crear Supabase y activar usuarios/permisos.
4. Mover los datos a la fuente privada.
5. Integrar el segundo dashboard.
6. Hacer la revisión final con un usuario de prueba.

