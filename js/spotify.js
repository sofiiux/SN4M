// Crea la costante SPOTIFY_CLIENT_ID.
const SPOTIFY_CLIENT_ID = "96b8218423054d36a0128598b404dff1";

// Crea la costante SPOTIFY_REDIRECT_URI.
const SPOTIFY_REDIRECT_URI = "http://127.0.0.1:5500/ricerca.html";

// Crea la costante SPOTIFY_AUTHORIZE_URL.
const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize";

// Crea la costante SPOTIFY_TOKEN_URL.
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

// Definisce la funzione generateRandomString.
function generateRandomString(length) {
    // Crea la stringa contenente i caratteri utilizzabili.
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // Crea la variabile che conterrà il risultato.
    let result = "";

    // Ripete l'operazione per il numero di caratteri richiesto.
    for (let index = 0; index < length; index++) {
        // Genera una posizione casuale.
        const randomIndex = Math.floor(Math.random() * characters.length);

        // Aggiunge il carattere casuale alla stringa.
        result += characters[randomIndex];
    }

    // Restituisce la stringa casuale.
    return result;
}

// Definisce la funzione asincrona generateCodeChallenge.
async function generateCodeChallenge(codeVerifier) {
    // Converte il code verifier in byte.
    const encodedVerifier = new TextEncoder().encode(codeVerifier);

    // Calcola l'hash SHA-256.
    const digest = await window.crypto.subtle.digest(
        "SHA-256",
        encodedVerifier
    );

    // Converte l'hash nel formato richiesto da Spotify.
    return btoa(
        String.fromCharCode(...new Uint8Array(digest))
    )
        // Sostituisce il carattere +.
        .replace(/\+/g, "-")

        // Sostituisce il carattere /.
        .replace(/\//g, "_")

        // Rimuove i caratteri = finali.
        .replace(/=+$/, "");
}

// Definisce la funzione asincrona connectSpotify.
async function connectSpotify() {
    // Controlla se il Client ID non è stato impostato.
    if (
        !SPOTIFY_CLIENT_ID ||
        SPOTIFY_CLIENT_ID === "INCOLLA_QUI_IL_TUO_CLIENT_ID"
    ) {
        // Mostra un messaggio di errore.
        alert("Devi inserire il Client ID nel file spotify.js.");

        // Interrompe la funzione.
        return;
    }

    // Genera il code verifier utilizzato da PKCE.
    const codeVerifier = generateRandomString(64);

    // Genera il valore state per la sicurezza.
    const state = generateRandomString(16);

    // Salva il code verifier nel localStorage.
    localStorage.setItem(
        "spotifyCodeVerifier",
        codeVerifier
    );

    // Salva lo state nel localStorage.
    localStorage.setItem(
        "spotifyAuthState",
        state
    );

    // Genera il code challenge.
    const codeChallenge = await generateCodeChallenge(
        codeVerifier
    );

    // Crea i parametri necessari per Spotify.
    const parameters = new URLSearchParams({
        // Inserisce il Client ID.
        client_id: SPOTIFY_CLIENT_ID,

        // Richiede un authorization code.
        response_type: "code",

        // Imposta l'indirizzo a cui Spotify deve tornare.
        redirect_uri: SPOTIFY_REDIRECT_URI,

        // Imposta il metodo PKCE.
        code_challenge_method: "S256",

        // Inserisce il code challenge.
        code_challenge: codeChallenge,

        // Inserisce lo state di sicurezza.
        state: state
    });

    // Reindirizza l'utente alla pagina di autorizzazione Spotify.
    window.location.href =
        `${SPOTIFY_AUTHORIZE_URL}?${parameters.toString()}`;
}

// Definisce la funzione saveSpotifyToken.
function saveSpotifyToken(tokenData) {
    // Salva il token di accesso.
    localStorage.setItem(
        "spotifyAccessToken",
        tokenData.access_token
    );

    // Calcola quando scadrà il token.
    const expirationTime =
        Date.now() + tokenData.expires_in * 1000;

    // Salva l'orario di scadenza.
    localStorage.setItem(
        "spotifyTokenExpiration",
        String(expirationTime)
    );

    // Controlla se Spotify ha restituito un refresh token.
    if (tokenData.refresh_token) {
        // Salva il refresh token.
        localStorage.setItem(
            "spotifyRefreshToken",
            tokenData.refresh_token
        );
    }
}

// Definisce la funzione getValidSpotifyToken.
function getValidSpotifyToken() {
    // Recupera il token salvato.
    const token = localStorage.getItem(
        "spotifyAccessToken"
    );

    // Recupera la data di scadenza.
    const expiration = Number(
        localStorage.getItem(
            "spotifyTokenExpiration"
        )
    );

    // Controlla se token o scadenza non esistono.
    if (!token || !expiration) {
        // Restituisce null.
        return null;
    }

    // Controlla se il token è scaduto.
    if (Date.now() >= expiration) {
        // Elimina il token.
        localStorage.removeItem(
            "spotifyAccessToken"
        );

        // Elimina la scadenza.
        localStorage.removeItem(
            "spotifyTokenExpiration"
        );

        // Restituisce null.
        return null;
    }

    // Restituisce il token valido.
    return token;
}

// Definisce la funzione asincrona exchangeSpotifyCode.
async function exchangeSpotifyCode(code) {
    // Recupera il code verifier.
    const codeVerifier = localStorage.getItem(
        "spotifyCodeVerifier"
    );

    // Controlla se il code verifier non esiste.
    if (!codeVerifier) {
        // Genera un errore.
        throw new Error(
            "Impossibile completare il collegamento Spotify."
        );
    }

    // Crea i dati da inviare a Spotify.
    const body = new URLSearchParams({
        // Inserisce il Client ID.
        client_id: SPOTIFY_CLIENT_ID,

        // Imposta il tipo di richiesta.
        grant_type: "authorization_code",

        // Inserisce il codice ricevuto da Spotify.
        code: code,

        // Inserisce lo stesso redirect URI usato durante il login.
        redirect_uri: SPOTIFY_REDIRECT_URI,

        // Inserisce il code verifier.
        code_verifier: codeVerifier
    });

    // Invia la richiesta per ottenere il token.
    const response = await fetch(
        SPOTIFY_TOKEN_URL,
        {
            // Utilizza il metodo POST.
            method: "POST",

            // Imposta gli header.
            headers: {
                // Imposta il tipo di contenuto.
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            // Inserisce i dati della richiesta.
            body: body
        }
    );

    // Controlla se Spotify ha restituito un errore.
    if (!response.ok) {
        // Recupera il testo dell'errore.
        const errorText = await response.text();

        // Mostra i dettagli nella console.
        console.error(
            "Errore token Spotify:",
            response.status,
            errorText
        );

        // Genera un errore.
        throw new Error(
            "Spotify non ha restituito un token valido."
        );
    }

    // Converte la risposta in JSON.
    const tokenData = await response.json();

    // Salva i dati del token.
    saveSpotifyToken(tokenData);

    // Elimina il code verifier ormai utilizzato.
    localStorage.removeItem(
        "spotifyCodeVerifier"
    );

    // Elimina lo state ormai utilizzato.
    localStorage.removeItem(
        "spotifyAuthState"
    );

    // Restituisce il token.
    return tokenData.access_token;
}

// Definisce la funzione asincrona handleSpotifyCallback.
async function handleSpotifyCallback() {
    // Recupera i parametri presenti nell'URL.
    const parameters = new URLSearchParams(
        window.location.search
    );

    // Recupera il codice restituito da Spotify.
    const code = parameters.get("code");

    // Recupera un eventuale errore.
    const error = parameters.get("error");

    // Recupera lo state restituito da Spotify.
    const returnedState = parameters.get(
        "state"
    );

    // Controlla se Spotify ha restituito un errore.
    if (error) {
        // Rimuove i parametri Spotify dall'URL.
        window.history.replaceState(
            {},
            document.title,
            SPOTIFY_REDIRECT_URI
        );

        // Genera un errore.
        throw new Error(
            "Il collegamento a Spotify è stato annullato."
        );
    }

    // Controlla se Spotify non ha restituito un nuovo codice.
    if (!code) {
        // Restituisce l'eventuale token ancora valido.
        return getValidSpotifyToken();
    }

    // Recupera lo state salvato prima del login.
    const savedState = localStorage.getItem(
        "spotifyAuthState"
    );

    // Controlla che lo state restituito corrisponda a quello salvato.
    if (
        !savedState ||
        returnedState !== savedState
    ) {
        // Genera un errore di sicurezza.
        throw new Error(
            "La verifica di sicurezza Spotify non è riuscita."
        );
    }

    // Scambia il codice con un token.
    const token = await exchangeSpotifyCode(
        code
    );

    // Rimuove code e state dall'indirizzo visualizzato.
    window.history.replaceState(
        {},
        document.title,
        SPOTIFY_REDIRECT_URI
    );

    // Restituisce il token.
    return token;
}

// Definisce la funzione disconnectSpotify.
function disconnectSpotify() {
    // Elimina il token di accesso.
    localStorage.removeItem(
        "spotifyAccessToken"
    );

    // Elimina la data di scadenza.
    localStorage.removeItem(
        "spotifyTokenExpiration"
    );

    // Elimina il refresh token.
    localStorage.removeItem(
        "spotifyRefreshToken"
    );

    // Elimina il code verifier.
    localStorage.removeItem(
        "spotifyCodeVerifier"
    );

    // Elimina lo state.
    localStorage.removeItem(
        "spotifyAuthState"
    );
}