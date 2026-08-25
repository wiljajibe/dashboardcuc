# Guía del proyecto para William

## Cómo funciona ahora

1. La persona entra en `wiljajibe.com`.
2. Si no tiene una sesión activa, la página la envía al inicio de sesión.
3. Supabase comprueba su correo, contraseña y estado.
4. Las reglas de la base de datos revisan qué dashboard puede consultar.
5. Solamente entonces se envía la información autorizada.

La pantalla de acceso bloquea durante 15 minutos un correo que acumule 3 intentos fallidos en el mismo navegador. Esta barrera adicional trabaja junto con los límites automáticos de Supabase.

La página puede seguir alojada gratuitamente en GitHub Pages porque allí solo permanece el código. Los datos institucionales viven en Supabase.

## Crear un usuario

Los visitantes no pueden registrarse por su cuenta.

1. En Supabase abre **Authentication → Users**.
2. Selecciona **Add user → Send invitation**.
3. Escribe el correo autorizado.
4. Asigna permiso al dashboard correspondiente.
5. La persona abre el correo y crea una contraseña de al menos 12 caracteres.

Si alguien deja de necesitar acceso, se desactiva su perfil o se elimina su permiso. No es necesario modificar la página.

## Actualizar los datos

Continúa enviando los PDF del nuevo corte en esta conversación. El proceso será:

1. Extraer y validar las cifras.
2. Entregarte el Excel para tu respaldo local.
3. Cargar el corte validado en Supabase.
4. Comprobar que el dashboard muestre la fecha y los totales nuevos.

No se publicarán PDF, Excel ni CSV en GitHub.

## Integrar otro dashboard

El segundo dashboard utilizará el mismo inicio de sesión. Cada usuario podrá recibir permiso para Matrículas, Cruce de Matriculados o ambos. No hace falta crear otro proyecto de Supabase.

## Reglas que debes recordar

- Nunca envíes ni publiques una `secret key`, `service_role` o contraseña administrativa.
- La clave `publishable` no es secreta; las políticas RLS son las que protegen los datos.
- No agregues PDF, Excel o CSV al repositorio.
- Conserva respaldos locales de los archivos fuente.
- Crea usuarios únicamente por invitación.
- Desactiva inmediatamente a quien ya no deba consultar la información.
