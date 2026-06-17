/*
    --------------------------------------------------
    -----  /global.d.ts  --  /types/global.d.ts  -----
    --------------------------------------------------
*/


/// <reference lib="dom" />
/// <reference lib="es2022" />


/**
 * ----------------------------------------------------------------
 * -----  Tipos DOM extendidos para compatibilidad            -----
 * -----  (por si tu versión de lib.dom.d.ts no los incluye)  -----
 * ----------------------------------------------------------------
 */

interface HTMLHeaderElement extends HTMLElement { }
interface HTMLFooterElement extends HTMLElement { }
interface HTMLMainElement extends HTMLElement { }
interface HTMLNavElement extends HTMLElement { }
interface HTMLSectionElement extends HTMLElement { }
interface HTMLArticleElement extends HTMLElement { }
interface HTMLAsideElement extends HTMLElement { }
interface HTMLFigureElement extends HTMLElement { }
interface HTMLFigcaptionElement extends HTMLElement { }


/**
 * -----------------------------------------------
 * -----  Tipos globales para la aplicación  -----
 * -----------------------------------------------
 */

declare global {
    

    /**  -----  `Voces disponibles para la narración (TTS)`  ----- */
    type NarracionVoice =
        | 'alloy'
        | 'ash'
        | 'ballad'
        | 'coral'
        | 'echo'
        | 'fable'
        | 'nova'
        | 'onyx'
        | 'sage'
        | 'shimmer'
        | 'verse'
        | 'marin'
        | 'cedar';


    /**  -----  `Cuerpo de la solicitud para narración (speak)`  ----- */
    type SpeakRequestBody = {

        /** -----  Texto a narrar  ----- */
        text: string;

        /** -----  Voz del narrador  ----- */
        speaker: NarracionVoice;
    }


    /**  -----  `Respuesta de error de la API de narración`  ----- */
    type NarracionErrorResponse = {

        /** -----  Mensaje de error  ----- */
        error: string;
    }
  
}


export { }
