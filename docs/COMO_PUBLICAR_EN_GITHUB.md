# Cómo publicar los cambios sin riesgo

## La forma recomendada para ti

Cuando la copia local esté aprobada, escríbeme: **“Publica esta versión en GitHub”**.

Antes de publicarla, yo comprobaré nuevamente el Excel, los indicadores y los archivos modificados. Después prepararé una versión identificada y te pediré autorización justo antes de enviarla a GitHub.

## Qué ocurrirá durante la publicación

1. Se conserva una copia de seguridad local.
2. Se revisa que no existan contraseñas ni claves secretas.
3. Se registra la versión con una descripción de los cambios.
4. Se envían los archivos al repositorio `wiljajibe/dashboardcuc`.
5. GitHub Pages actualiza la página automáticamente.
6. Se comprueba la página pública y sus cifras.

## Si prefieres hacerlo manualmente en GitHub

No lo hagas hasta que la versión esté aprobada.

1. Abre `https://github.com/wiljajibe/dashboardcuc` e inicia sesión.
2. Selecciona **Add file → Upload files**.
3. Arrastra únicamente los archivos aprobados del proyecto.
4. Comprueba que `CNAME` continúe diciendo `wiljajibe.com`.
5. Escribe una descripción sencilla del cambio.
6. Selecciona **Commit changes**.
7. Espera unos minutos y verifica la página publicada.

La carpeta `backups` nunca debe cargarse en GitHub. Está excluida automáticamente mediante `.gitignore`.

## Revisión de HTTPS

En GitHub abre el repositorio y entra en **Settings → Pages**. Allí se debe comprobar:

- que la fuente de publicación sea la rama `main`;
- que el dominio personalizado sea `wiljajibe.com`;
- que la comprobación DNS aparezca correcta;
- que **Enforce HTTPS** esté disponible y activado.

Si GitHub indica que el certificado no está creado, primero se revisa el mensaje exacto. No elimines ni vuelvas a agregar el dominio sin conservar una copia del archivo `CNAME`.
