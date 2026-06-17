/*
    *  -----------------------------------------------------  *
    *  -----  /main.js  --  /public/assets/js/main.js  -----  *
    *  -----------------------------------------------------  *
*/


(() => {


    /** @type {string} -----  `Ruta base del proyecto`  ----- */
    const base = '/victor-robles-web/08-desarrollo-web-ia-openai-deepseek-javascript-nodejs/06-narraciones-openai';


    //  -----  Referencias al DOM  -----

    /** @type {HTMLButtonElement | null} - `botón de narración` */
    const $sendButton = document.querySelector('#sendButton');

    /** @type {HTMLTextAreaElement | null} - `input de texto` */
    const $inputText = document.querySelector('#inputText');

    /** @type {HTMLSelectElement | null} - `select de voz del narrador` */
    const $targetSpeaker = document.querySelector('#targetSpeaker');

    /** @type {HTMLDivElement | null} - `contenedor de mensajes del chat` */
    const $chatMessages = document.querySelector('.chat__messages');



    /**
     * ----------------------------
     * -----  `scrollChat()`  -----
     * ----------------------------
     * - Desplaza el contenedor de mensajes del chat hacia abajo para mostrar el nuevo mensaje.
     */

    const scrollChat = () => {

        //  -----  Desplazar el contenedor de mensajes del chat hacia abajo para mostrar el nuevo mensaje  -----
        if ($chatMessages)
            $chatMessages.scrollTop = $chatMessages.scrollHeight;
    };



    /**
     * ------------------------------------
     * -----  `appendUserMessage()`  -----
     * ------------------------------------
     * - Crea y agrega el mensaje del usuario al contenedor del chat.
     * @param {string} text - `texto ingresado por el usuario`
     */
    
    const appendUserMessage = (text) => {

        /** @type {HTMLDivElement} - `crear mensaje de usuario` */
        const $userMessage = document.createElement('div');

        //  -----  Agregar clases CSS para el mensaje de usuario  -----
        $userMessage.classList.add('chat__message', 'chat__message--user');

        //  -----  Establecer el contenido del mensaje de usuario  -----
        $userMessage.textContent = text;

        //  -----  Agregar el mensaje de usuario al contenedor de mensajes del chat  -----
        $chatMessages?.appendChild($userMessage);

        //  -----  Desplazar el contenedor de mensajes del chat hacia abajo para mostrar el nuevo mensaje  -----
        scrollChat();

    };



    /**
     * -------------------------------------
     * -----  `generateUserMessage()`  -----
     * -------------------------------------
     * - Genera el mensaje del usuario a partir del texto ingresado en el input y la selección de la voz del narrador, y lo agrega al chat.
     * @returns {SpeakRequestBody | undefined} - Objeto con el texto ingresado y la voz del narrador, o `undefined` si hay un error.
     */

    const generateUserMessage = () => {

        /**  -----  `texto ingresado en el input` -----  */
        const text = $inputText?.value.trim();

        /**  -----  `selección de la voz del narrador`  -----  */
        const speaker = /** @type {NarracionVoice} */ ($targetSpeaker?.value);

        //  -----  Validar texto ingresado  -----
        if (!text) {
            alert('Por favor, ingresa un texto para narrar.');
            return;
        }

        //  -----  Validar selección de voz del narrador  -----
        if (!speaker) {
            alert('Por favor, selecciona una voz para el narrador.');
            return;
        }

        //  -----  Agregar mensaje del usuario al chat  -----
        appendUserMessage(text);

        
        /** @type {SpeakRequestBody} */
        const speakRequestBody = {
            text, 
            speaker
        };

        //  -----  Retornar texto y voz del narrador para su uso en la función de narración  -----
        return speakRequestBody;

    }



    /**
     * --------------------------------
     * -----  `fetchNarration()`  -----
     * --------------------------------
     * @async
     * - Realiza la petición a la API de narración y retorna el blob de audio.
     * @param {string} text - `texto a narrar`
     * @param {string} speaker - `voz del narrador`
     * @returns {Promise<Blob>} - Blob de audio MP3.
     * @throws {Error} - Lanza un error si la API falla o no devuelve un audio válido.
     */

    const fetchNarration = async (text, speaker) => {


        /**  -----  `Petición asincrónica a la API de narración`  -----  */
        const response = await fetch(`${base}/api/speak`, {

            //  -----  Método HTTP POST para enviar los datos de narración  -----
            method: 'POST',

            //  -----  Encabezados para indicar que el cuerpo de la solicitud es JSON  -----
            headers: {
                'Content-Type': 'application/json'
            },

            //  -----  Cuerpo de la solicitud con el texto a narrar y la voz del narrador  -----
            body: JSON.stringify({
                text,
                speaker
            })

        });


        //  -----  Validar respuesta de la API  -----
        if (!response.ok) {

            /** @type {NarracionErrorResponse} */
            const errorData = await response.json();

            throw new Error(errorData.error || 'Error desconocido al narrar el texto');
        }


        /** @type {Blob} - `Blob de audio MP3` */
        const audioBlob = await response.blob();

        //  -----  Validar que se haya recibido un audio válido  -----
        if (!audioBlob || audioBlob.size === 0) {
            throw new Error('La API no devolvió un audio válido');
        }

        //  -----  Retornar el blob de audio obtenido de la API  -----
        return audioBlob;

    };



    /**
     * -----------------------------------------
     * -----  `appendBotMessage(message, isTyping)`  -----
     * -----------------------------------------
     * - Crea y agrega un mensaje de texto del bot al contenedor del chat.
     * - Si se indica `isTyping`, marca el mensaje como "Narrando..." con su clase específica.
     * - Devuelve la referencia al elemento creado para poder actualizarlo después (p. ej. reemplazar "Narrando..." por la respuesta final).
     * @param {string} message - `texto del mensaje del bot`
     * @param {boolean} [isTyping=false] - `true` para aplicar el estilo del estado "Narrando..."`
     * @returns {HTMLDivElement | undefined} - `elemento del mensaje del bot añadido al chat`
     */

    const appendBotMessage = (message, isTyping = false) => {

        /** @type {HTMLDivElement} - `crear mensaje de la IA` */
        const $botMessage = document.createElement('div');

        //  -----  Agregar clases CSS para el mensaje de la IA  -----
        $botMessage.classList.add('chat__message', 'chat__message--bot');

        //  -----  Si es el estado "Narrando...", añadimos su clase específica  -----
        if (isTyping)
            $botMessage.classList.add('chat__message--typing');

        //  -----  Establecer el contenido del mensaje de la IA  -----
        $botMessage.textContent = `Narrador: ${message}`;

        //  -----  Agregar el mensaje de la IA al contenedor de mensajes del chat  -----
        $chatMessages?.appendChild($botMessage);

        //  -----  Desplazar el contenedor de mensajes del chat hacia abajo para mostrar el nuevo mensaje  -----
        scrollChat();

        return $botMessage;

    };



    /**
     * -----------------------------------------
     * -----  `appendBotAudio(audioBlob, $typingMessage)`  -----
     * -----------------------------------------
     * - Crea y agrega un reproductor de audio al contenedor del chat.
     * - Si se pasa un elemento `$typingMessage` (mensaje temporal "Narrando..."), se reemplaza su contenido por el reproductor de audio.
     * @param {Blob} audioBlob - `blob de audio MP3 generado por la API`
     * @param {HTMLDivElement} [messageEl] - `elemento del mensaje del bot donde se insertará el audio`
     */

    const appendBotAudio = (audioBlob, messageEl) => {

        /** @type {HTMLDivElement} - `elemento del mensaje de la IA` */
        const $botMessage = messageEl ?? document.createElement('div');

        //  -----  Si no se ha pasado un elemento, agregar las clases CSS  -----
        if (!messageEl)
            $botMessage.classList.add('chat__message', 'chat__message--bot');

        //  -----  Limpiar el contenido del mensaje (por si viene del estado "Narrando...")  -----
        $botMessage.textContent = '';

        /** @type {HTMLAudioElement} - `crear elemento de audio` */
        const $audio = document.createElement('audio');

        //  -----  Configurar el elemento de audio  -----
        $audio.controls = true;
        $audio.src = URL.createObjectURL(audioBlob);

        //  -----  Liberar el ObjectURL cuando el audio se haya cargado  -----
        $audio.addEventListener('loadedmetadata', () => {
            URL.revokeObjectURL($audio.src);
        });

        //  -----  Agregar el reproductor de audio al mensaje de la IA  -----
        $botMessage.appendChild($audio);

        //  -----  Si no se ha pasado un elemento, agregarlo al contenedor de mensajes del chat  -----
        if (!messageEl)
            $chatMessages?.appendChild($botMessage);

        //  -----  Desplazar el contenedor de mensajes del chat hacia abajo para mostrar el nuevo mensaje  -----
        scrollChat();

    };



    /**
     * -----------------------------------
     * -----  `generateNarration()`  -----
     * ----------------------------------- 
     * @async
     * - Genera la narración del texto ingresado por el usuario utilizando la API de narración.
     * - Muestra un mensaje "Narrando..." con animación de puntos mientras se espera la respuesta.
     * @returns {Promise<void>} - No devuelve ningún valor, pero actualiza el DOM con los mensajes del usuario y el audio generado.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la narración, como una respuesta no válida de la API o problemas de red.
     */
    
    const generateNarration = async () => {


        /** @type {SpeakRequestBody | undefined}  - `Generar mensaje del usuario y obtener texto y voz`  */
        const userMessage = generateUserMessage();

        //  -----  Si la validación falla, no continuar  -----
        
        if (!userMessage) 
            return;

        //  -----  Extraer texto y voz del narrador del mensaje del usuario  -----
        const { text, speaker } = userMessage;


        //  -----  Intentar narrar el texto usando la API de narración  -----
        try {


            /** @type {HTMLDivElement | undefined} - `elemento temporal con el texto "Narrando..." que se reemplazará al recibir la respuesta` */
            const $typingMessage = appendBotMessage('Narrando.', true);

            /** @type {number} - `contador de puntos para la animación de "Narrando..."` */
            let dots = 1;

            /** @type {ReturnType<typeof setInterval> | undefined} - `intervalo que actualiza los puntos del mensaje "Narrando..."` */
            const typingInterval = setInterval(() => {

                //  -----  Ciclar entre 1, 2 y 3 puntos  -----
                dots = (dots % 3) + 1;

                //  -----  Actualizar el texto del mensaje "Narrando..." con los puntos correspondientes  -----
                if ($typingMessage)
                    $typingMessage.textContent = `Narrador: Narrando${'.'.repeat(dots)}`;

            }, 500);


            /**  -----  Obtener el audio narrado usando la API de narración  -----  */
            const audioBlob = await fetchNarration(text, speaker);


            //  -----  Detenemos la animación de "Narrando..."  -----
            clearInterval(typingInterval);


            //  -----  Reemplazamos el contenido del mensaje "Narrando..." por el reproductor de audio  -----
            //  -----  y quitamos la clase de "Narrando..."                              -----
            if ($typingMessage) {

                $typingMessage.classList.remove('chat__message--typing');
                appendBotAudio(audioBlob, $typingMessage);

            } else
                appendBotAudio(audioBlob);


            //  -----  Desplazar el contenedor de mensajes del chat hacia abajo para mostrar la nueva respuesta  -----
            scrollChat();

        }

        //  -----  Manejo de errores  -----
        catch (error) {

            console.error('Error al narrar el texto:', error);
            alert('Ocurrió un error al narrar el texto. Por favor, intenta nuevamente.');
        }

        //  -----  vaciar el input  -----
        if ($inputText)
            $inputText.value = '';

    }



    /*
        ---------------------
        -----  EVENTOS  -----
        ---------------------
    */


    //  -----  Agregar evento click al botón de narrar  ----- 
    $sendButton?.addEventListener('click', generateNarration);


    //  -----  Agregar evento keydown al input de texto para detectar Enter  -----
    $inputText?.addEventListener('keydown', (event) => {

        //  -----  Si se presiona Enter, generar la narración  -----
        if (event.key === 'Enter') {

            event.preventDefault();
            
            //  -----  Generar la narración al presionar Enter  -----
            generateNarration();
        }

    });



})();
