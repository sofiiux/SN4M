// Crea la costante SPOTIFY_CLIENT_ID.
const SPOTIFY_CLIENT_ID = "96b8218423054d36a0128598b404dff1";


// Imposta automaticamente il Redirect URI corretto.
// In locale usa Live Server.
// Online usa GitHub Pages.
const SPOTIFY_REDIRECT_URI =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
        ? "http://127.0.0.1:5500/ricerca.html"
        : "https://sofiiux.github.io/SN4M/ricerca.html";


// Crea la costante SPOTIFY_AUTHORIZE_URL.
const SPOTIFY_AUTHORIZE_URL =
    "https://accounts.spotify.com/authorize";


// Crea la costante SPOTIFY_TOKEN_URL.
const SPOTIFY_TOKEN_URL =
    "https://accounts.spotify.com/api/token";


// Definisce la funzione generateRandomString.
function generateRandomString(length) {

    // Crea la stringa contenente i caratteri utilizzabili.
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // Crea la variabile che conterrà il risultato.
    let result = "";

    // Ripete l'operazione per il numero di caratteri richiesto.
    for (let index = 0; index < length; index++) {

        // Genera una posizione casuale.
        const randomIndex =
            Math.floor(
                Math.random() * characters.length
            );

        // Aggiunge il carattere casuale alla stringa.
        result += characters[randomIndex];
    }

    // Restituisce la stringa casuale.
    return result;
}


// Definisce la funzione asincrona generateCodeChallenge.
async function generateCodeChallenge(codeVerifier) {

    // Converte il code verifier in byte.
    const encodedVerifier =
        new TextEncoder().encode(codeVerifier);

    // Calcola l'hash SHA-256.
    const digest =
        await window.crypto.subtle.digest(
            "SHA-256",
            encodedVerifier
        );

    // Converte l'hash nel formato richiesto da Spotify.
    return btoa(
        String.fromCharCode(
            ...new Uint8Array(digest)
        )
    )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


// Definisce la funzione asincrona connectSpotify.
async function connectSpotify() {

    // Controlla se il Client ID non è stato impostato.
    if (
        !SPOTIFY_CLIENT_ID ||
        SPOTIFY_CLIENT_ID ===
            "INCOLLA_QUI_IL_TUO_CLIENT_ID"
    ) {

        alert(
            "Devi inserire il Client ID nel file spotify.js."
        );

        return;
    }

    // Genera il code verifier utilizzato da PKCE.
    const codeVerifier =
        generateRandomString(64);

    // Genera il valore state per la sicurezza.
    const state =
        generateRandomString(16);

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
    const codeChallenge =
        await generateCodeChallenge(
            codeVerifier
        );

    // Crea i parametri necessari per Spotify.
    const parameters =
        new URLSearchParams({

            client_id:
                SPOTIFY_CLIENT_ID,

            response_type:
                "code",

            redirect_uri:
                SPOTIFY_REDIRECT_URI,

            code_challenge_method:
                "S256",

            code_challenge:
                codeChallenge,

            state:
                state
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
        Date.now() +
        tokenData.expires_in * 1000;

    // Salva l'orario di scadenza.
    localStorage.setItem(
        "spotifyTokenExpiration",
        String(expirationTime)
    );

    // Controlla se Spotify ha restituito un refresh token.
    if (tokenData.refresh_token) {

        localStorage.setItem(
            "spotifyRefreshToken",
            tokenData.refresh_token
        );
    }
}


// Definisce la funzione getValidSpotifyToken.
function getValidSpotifyToken() {

    // Recupera il token salvato.
    const token =
        localStorage.getItem(
            "spotifyAccessToken"
        );

    // Recupera la data di scadenza.
    const expiration =
        Number(
            localStorage.getItem(
                "spotifyTokenExpiration"
            )
        );

    // Controlla se token o scadenza non esistono.
    if (!token || !expiration) {
        return null;
    }

    // Controlla se il token è scaduto.
    if (Date.now() >= expiration) {

        localStorage.removeItem(
            "spotifyAccessToken"
        );

        localStorage.removeItem(
            "spotifyTokenExpiration"
        );

        return null;
    }

    // Restituisce il token valido.
    return token;
}


// Definisce la funzione asincrona exchangeSpotifyCode.
async function exchangeSpotifyCode(code) {

    // Recupera il code verifier.
    const codeVerifier =
        localStorage.getItem(
            "spotifyCodeVerifier"
        );

    // Controlla se il code verifier non esiste.
    if (!codeVerifier) {

        throw new Error(
            "Impossibile completare il collegamento Spotify."
        );
    }

    // Crea i dati da inviare a Spotify.
    const body =
        new URLSearchParams({

            client_id:
                SPOTIFY_CLIENT_ID,

            grant_type:
                "authorization_code",

            code:
                code,

            redirect_uri:
                SPOTIFY_REDIRECT_URI,

            code_verifier:
                codeVerifier
        });

    // Invia la richiesta per ottenere il token.
    const response =
        await fetch(
            SPOTIFY_TOKEN_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: body
            }
        );

    // Controlla se Spotify ha restituito un errore.
    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            "Errore token Spotify:",
            response.status,
            errorText
        );

        throw new Error(
            "Spotify non ha restituito un token valido."
        );
    }

    // Converte la risposta in JSON.
    const tokenData =
        await response.json();

    // Salva i dati del token.
    saveSpotifyToken(
        tokenData
    );

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
    const parameters =
        new URLSearchParams(
            window.location.search
        );

    // Recupera il codice restituito da Spotify.
    const code =
        parameters.get("code");

    // Recupera un eventuale errore.
    const error =
        parameters.get("error");

    // Recupera lo state restituito da Spotify.
    const returnedState =
        parameters.get("state");

    // Controlla se Spotify ha restituito un errore.
    if (error) {

        window.history.replaceState(
            {},
            document.title,
            SPOTIFY_REDIRECT_URI
        );

        throw new Error(
            "Il collegamento a Spotify è stato annullato."
        );
    }

    // Se non è presente un nuovo codice,
    // restituisce l'eventuale token ancora valido.
    if (!code) {
        return getValidSpotifyToken();
    }

    // Recupera lo state salvato prima del login.
    const savedState =
        localStorage.getItem(
            "spotifyAuthState"
        );

    // Controlla che lo state restituito corrisponda.
    if (
        !savedState ||
        returnedState !== savedState
    ) {

        throw new Error(
            "La verifica di sicurezza Spotify non è riuscita."
        );
    }

    // Scambia il codice con un token.
    const token =
        await exchangeSpotifyCode(
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
