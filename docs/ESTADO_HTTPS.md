# Estado del dominio y HTTPS — resuelto

Revisión realizada el 14 de agosto de 2026.

## Lo que está correcto

- `wiljajibe.com` apunta a las cuatro direcciones oficiales de GitHub Pages:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- `www.wiljajibe.com` apunta a `wiljajibe.github.io`.
- El archivo `CNAME` del proyecto contiene `wiljajibe.com`.
- La página responde correctamente mediante HTTP.

## Problema encontrado inicialmente

La conexión HTTPS devuelve un error porque el certificado presentado no corresponde a `wiljajibe.com`. Además, la dirección predeterminada de GitHub Pages redirige todavía a la versión `http://` del dominio.

Esto indicaba que los registros principales del dominio estaban bien, pero GitHub Pages necesitaba repetir la emisión del certificado.

## Corrección realizada

Se retiró temporalmente `wiljajibe.com` de la configuración de GitHub Pages y se agregó nuevamente. GitHub ejecutó una nueva publicación correctamente y emitió el certificado.

El resultado final fue comprobado:

- `https://wiljajibe.com` responde correctamente mediante HTTPS.
- `http://wiljajibe.com` redirige a `https://wiljajibe.com`.
- `https://www.wiljajibe.com` redirige a `https://wiljajibe.com`.
- `https://wiljajibe.github.io/dashboardcuc/` redirige a `https://wiljajibe.com`.
- GitHub Pages muestra **Enforce HTTPS** activado.
