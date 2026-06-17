/*
    *  ----------------------------------  *
    *  -----  /app.js  --  /app.js  -----  *
    *  ----------------------------------  *
*/


import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


/*
    * ----------------------------------------------------------
    * -----  Servidor Express para chatbots usando OpenAI  -----
    * ----------------------------------------------------------
    * - Sirve frontend estático.
    * - Expone endpoint POST /api/chatbot.
    * - Interactúa con un modelo de OpenAI para generar respuestas.
    * --------------------------------------------------------------
*/


/*
    *  -----------------------------  *
    *  -----  Configuraciones  -----  *
    *  -----------------------------  *  
*/


/**  -----  Configuracion de variables de entorno con dotenv  ----- */
dotenv.config();

/** -----  `Ruta absoluta del archivo actual`  ----- */
const currentFilePath = fileURLToPath(import.meta.url);

/** -----  `Ruta absoluta del directorio actual`  ----- */
const currentDirPath = path.dirname(currentFilePath);

/** -----  `Ruta absoluta del frontend estatico`  ----- */
const publicDirPath = path.join(currentDirPath, 'public');

/**   -----  `Inicializacion de la aplicacion Express`  ----- */
const app = express();

/**  -----  `Puerto del servidor`  ----- */
const PORT = process.env.PORT || 3000;

/** @type {string} -----  `Ruta base del proyecto`  ----- */
const base = '/victor-robles-web/08-desarrollo-web-ia-openai-deepseek-javascript-nodejs/06-narraciones-openai';


/*
    *  --------------------  *
    *  -----  OpenAI  -----  *
    *  --------------------  *  
*/

/** -----  `Validar que la API key de OpenAI está definida`  ----- */
if (!process.env.OPENAI_API_KEY) {
    throw new Error('La variable de entorno OPENAI_API_KEY es requerida.');
}

/**  -----  `Inicialización del cliente de OpenAI`  ----- */
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});



/*
    *  -------------------------  *
    *  -----  Middlewares  -----  *
    *  -------------------------  *
*/

//*  -----  Servir archivos estaticos desde la carpeta 'public'  -----
app.use(base, express.static(publicDirPath));

//*  -----  Middleware para parsear JSON -----
app.use(express.json());

//*  -----  Middleware para parsear datos URL-encoded -----
app.use(express.urlencoded({ extended: true }));



/*
    *  ----------------------------------  *
    *  -----  Funciones de negocio  -----  *
    *  ----------------------------------  *
*/






/*  
    *  ----------------------------------------------  *
    *  -----  Endpoint POST /api/nutri-chatbot  -----  *
    *  ----------------------------------------------  *
*/


/**
 * --------------------------------------------
 * -----  `handleSpeakRequest(req, res)`  -----
 * --------------------------------------------
 * - `Maneja la solicitud del chatbot: valida, genera respuesta y maneja errores`
 * @async
 * @param {express.Request<unknown, unknown, SpeakRequestBody>} req - La solicitud HTTP de Express
 * @param {express.Response} res - La respuesta HTTP de Express
 */

const handleSpeakRequest = async (req, res) => {

    const { text, speaker } = req.body;


    if(!text)
        return res.status(400).json({ error: 'Debes mandar un audio' });


    //  -----  Llamar al LLM o modelo de openAI
    try {

        const completion =await openai.audio.speech.create({
            model: 'tts-1',
            voice: speaker,
            input: text,
            response_format: 'mp3'
        });


        //  -----  convertr el buffer de audio en un archivo temporal  -----
        
        /** -----  `buffer de audio` ----- */
        const audioBuffer = Buffer.from(await completion.arrayBuffer());
        
        /** -----  `Ruta del archivo de audio para descarga` ----- */
        const audioFilePath = path.join(process.cwd(), 'narracion.mp3');
        
        /** -----  `Guardar el archivo en el servidor para descarga directa` ----- */
        fs.writeFileSync(audioFilePath, audioBuffer);
        console.log(`✅ Audio guardado en: ${audioFilePath}`);

        //  -----  Enviar el buffer de audio directamente como respuesta  -----
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="narracion.mp3"');
        res.setHeader('Content-Length', audioBuffer.length);
        
        res.send(audioBuffer);
        
    }


    catch (error) {
        console.error('Error en handleSpeakRequest => ', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
    


}



//*  -----  Endpoint POST /api/speak que maneja la solicitud del chatbot usando la funcion handleSpeakRequest  -----
app.post(`${base}/api/speak`, handleSpeakRequest);



/*
    *  ---------------------------------------------------------------  *
    *  -----  Inicia el servidor HTTP en el puerto especificado  -----  * 
    *  -----  y muestra un mensaje en consola                    -----  *
    *  ---------------------------------------------------------------  *
*/

app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en http://localhost:${PORT}${base} ✅`);
});
