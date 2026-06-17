# 06 - Narraciones de Textos con OpenAI

Aplicacion de narracion (Text-to-Speech) implementada con **JavaScript**, **Node.js**, **Express** y la **API de Audio Speech de OpenAI**. El usuario introduce un texto en el chat, elige una de las voces disponibles y el backend llama a `openai.audio.speech.create()` con el modelo `tts-1` para generar un audio MP3 que se reproduce directamente en el frontend con un `<audio controls>`. Cada audio muestra ademas la voz utilizada para que sea facil identificarlo.

Repositorio: https://github.com/AntoniCut/01-udemy--01-victor-robles-web--08-desarrollo-web-ia-openai-deepseek--06-narraciones-openai

---

## Tabla de contenidos

1. [Stack tecnologico](#stack-tecnologico)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Variables de entorno](#variables-de-entorno)
4. [Despliegue en local](#despliegue-en-local)
5. [Despliegue en produccion (VPS + Nginx)](#despliegue-en-produccion-vps--nginx)
6. [Endpoint API](#endpoint-api)
7. [Voces disponibles](#voces-disponibles)
8. [UX del chat](#ux-del-chat)
9. [Build de produccion con Gulp](#build-de-produccion-con-gulp)
10. [Licencia](#licencia)

---

## Stack tecnologico

- **Backend:** Node.js (ES Modules), Express 5, OpenAI Node SDK 6 (Audio Speech API).
- **Frontend:** HTML + CSS + JS estaticos servidos desde `public/`. `main.js` como modulo ES, reproductor `<audio>` nativo y mensaje temporal "Narrando..." mientras llega la respuesta.
- **Build:** Gulp 5 (terser, clean-css, htmlmin) para generar `dist/`.
- **Dev server:** Nodemon.
- **Despliegue:** Nginx como reverse proxy + PM2 como process manager.

Dependencias principales (`package.json`):

| Paquete     | Version  | Uso                                              |
|-------------|----------|--------------------------------------------------|
| express     | ^5.2.1   | Servidor HTTP y middleware                       |
| openai      | ^6.16.0  | SDK de OpenAI (Audio Speech API)                |
| dotenv      | ^17.2.3  | Carga de variables de entorno                    |
| axios       | 1.8.1    | Cliente HTTP (utilidades internas)               |
| markdown-it | ^14.2.0  | (Dependencia presente, no usada en este chat)   |

---

## Estructura del proyecto

```
06-narraciones-openai/
├── app.js                  # Servidor Express + endpoint /api/speak
├── gulpfile.js             # Tareas de build (minificacion, copia a dist/)
├── package.json
├── pnpm-lock.yaml
├── .env                    # Variables de entorno (NO subir al repo)
├── .gitignore
├── jsconfig.json
├── public/                 # Frontend estatico
│   ├── index.html
│   └── assets/
│       ├── css/
│       ├── img/
│       └── js/
│           └── main.js             # Modulo ES principal del chat
└── types/                  # Tipos JSDoc
```

---

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto:

```env
# Puerto del servidor (en produccion, > 1024 para no necesitar root)
PORT=1116

# API key de OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

Notas:

- `OPENAI_API_KEY` es **obligatoria**. Sin ella, el endpoint devolvera `500`.
- Este proyecto **no usa Assistants API**, por lo que no se necesita `OPENAI_ASSISTANT_ID`.
- El archivo `.env` esta incluido en `.gitignore`. **No lo subas al repositorio**.

---

## Despliegue en local

### Requisitos

- Node.js >= 18 (recomendado 20 LTS o superior).
- npm (incluido con Node) o pnpm.

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/AntoniCut/01-udemy--01-victor-robles-web--08-desarrollo-web-ia-openai-deepseek--06-narraciones-openai.git
cd 06-narraciones-openai

# 2. Instalar dependencias
npm install
# o, si prefieres pnpm:
pnpm install

# 3. Crear el archivo .env
nano .env
#   PORT=1116
#   OPENAI_API_KEY=sk-proj-...

# 4. Arrancar en modo desarrollo (con nodemon)
npm run start
# o en modo produccion simple:
npm run serve
```

La aplicacion estara disponible en:

```
http://localhost:1116/victor-robles-web/08-desarrollo-web-ia-openai-deepseek-javascript-nodejs/06-narraciones-openai/
```

> El puerto por defecto del codigo es `3000`, pero este proyecto usa `1116` para evitar conflicto con otros proyectos del portfolio. Puedes cambiar `PORT` en `.env`.

---

## Despliegue en produccion (VPS + Nginx)

Arquitectura: **Nginx** (reverse proxy + SSL con Let's Encrypt) -> **Node.js** gestionado con **PM2** en el mismo VPS.

### 1. Subir el codigo al VPS

Con FileZilla, sube todo el contenido del proyecto (excepto `node_modules`, `.env` y `dist/`) a:

```
/var/www/udemy.antonydev.tech/victor-robles-web/08-desarrollo-web-ia-openai-deepseek-javascript-nodejs/06-narraciones-openai
```

### 2. Instalar dependencias en el VPS (sin devDependencies)

Conecta por SSH y ejecuta:

```bash
cd /var/www/udemy.antonydev.tech/victor-robles-web/08-desarrollo-web-ia-openai-deepseek-javascript-nodejs/06-narraciones-openai

# Crear el .env de produccion (con tus claves reales)
nano .env
#   PORT=1116
#   OPENAI_API_KEY=sk-proj-...

# Instalar solo dependencias de produccion
npm install --omit=dev
```

> Importante: en Linux, los puertos < 1024 requieren root. Usa `PORT=1116` o cualquier puerto >= 1024 para no necesitar privilegios.

### 3. Arrancar con PM2 (persiste al cerrar SSH)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Arrancar la app
pm2 start app.js --name narraciones-openai

# Configurar arranque automatico tras reinicio del servidor
pm2 startup
pm2 save
```

Comandos utiles de PM2:

```bash
pm2 status                          # Ver estado
pm2 logs narraciones-openai         # Ver logs en tiempo real
pm2 restart narraciones-openai      # Reiniciar
pm2 stop narraciones-openai         # Detener
pm2 delete narraciones-openai       # Eliminar del registro
```

### 4. Configurar Nginx como reverse proxy

Edita el bloque `server` de tu vhost (`/etc/nginx/sites-available/udemy.antonydev.tech` o donde lo tengas) y anade una `location`:

```nginx
location ^~ /victor-robles-web/08-desarrollo-web-ia-openai-deepseek-javascript-nodejs/06-narraciones-openai {
    proxy_pass http://localhost:1116;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

> Usa `^~` para que Nginx no intente servir archivos estaticos directamente desde `root` antes de hacer proxy.

Recarga Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Verificar

```
https://udemy.antonydev.tech/victor-robles-web/08-desarrollo-web-ia-openai-deepseek-javascript-nodejs/06-narraciones-openai/
```

---

## Endpoint API

### `POST /api/speak`

Recibe un texto y una voz, llama a la Audio Speech API de OpenAI (modelo `tts-1`, formato `mp3`) y devuelve el audio generado como binario.

**Request body:**

```json
{
  "text": "Hola, esto es una prueba de narracion.",
  "speaker": "alloy"
}
```

**Respuesta 200 (exito):**

- Header `Content-Type: audio/mpeg`
- Header `Content-Disposition: attachment; filename="narracion.mp3"`
- Body: buffer binario con el MP3.

**Respuesta 400 (solicitud invalida):**

```json
{ "error": "Debes mandar un audio" }
```

**Respuesta 500 (error interno / voz no soportada / fallo de OpenAI):**

```json
{ "error": "Error interno del servidor" }
```

Tambien accesible en la ruta con prefijo:

```
POST /victor-robles-web/08-desarrollo-web-ia-openai-deepseek-javascript-nodejs/06-narraciones-openai/api/speak
```

---

## Voces disponibles

El frontend muestra unicamente las **6 voces validas para el modelo `tts-1`** de OpenAI. Otras voces como `ash`, `ballad`, `coral`, `sage`, `verse`, `marin` o `cedar` pertenecen al modelo `gpt-4o-mini-tts` y provocarian un `500` en este backend.

| value      | Label     |
|------------|-----------|
| `alloy`    | Alloy     |
| `echo`     | Echo      |
| `fable`    | Fable     |
| `nova`     | Nova      |
| `onyx`     | Onyx      |
| `shimmer`  | Shimmer   |

---

## UX del chat

1. El usuario escribe el texto a narrar y elige una voz en el `<select>`.
2. Al pulsar **Narrar Texto** (o `Enter`), se anade el texto al chat con el prefijo `Tú:`.
3. Se inserta un mensaje temporal con el prefijo `Narrador: Narrando.` y la clase `chat__message--typing` (estilo italic + opacidad 0.75). Un `setInterval` anima los puntos cada 500 ms.
4. El backend llama a `openai.audio.speech.create({ model: 'tts-1', voice: speaker, input: text, response_format: 'mp3' })` y devuelve el MP3.
5. Al recibir el blob, se detiene la animacion, se quita la clase `typing` del mensaje y se sustituye su contenido por:
   - Un `<audio controls>` con el MP3 (URL.createObjectURL + revokeObjectURL en `loadedmetadata`).
   - Una etiqueta `Voz: {speaker}` que identifica la voz utilizada.

---

## Build de produccion con Gulp

El proyecto incluye un `gulpfile.js` que genera una version minificada del frontend y copia el backend a `dist/`:

```bash
npm run build
```

Salida: carpeta `dist/` con HTML/CSS/JS minificados, `app.js` y un `package.json` minimo.

Para ejecutar el build:

```bash
npm run start:prod
```

---

## Licencia

ISC (c) AntonyDev
