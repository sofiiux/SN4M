// Definisce la funzione readStorage.
function readStorage(key, defaultValue = []) {
    // Recupera il valore dal localStorage.
    const value = localStorage.getItem(key);
    // Controlla se il valore non esiste.
    if (value === null) {
        // Restituisce il valore predefinito.
        return defaultValue;
    }
    // Apre il blocco in cui viene tentata la conversione.
    try {
        // Converte il valore JSON e lo restituisce.
        return JSON.parse(value);
    // Gestisce un eventuale errore.
    } catch (error) {
        // Mostra l'errore nella console.
        console.error(`Errore nella lettura di ${key}:`, error);
        // Restituisce il valore predefinito.
        return defaultValue;
    }
}
// Definisce la funzione writeStorage.
function writeStorage(key, value) {
    // Salva il valore nel localStorage.
    localStorage.setItem(key, JSON.stringify(value));
}
// Definisce la funzione generateId.
function generateId() {
    // Restituisce un identificativo numerico.
    return Date.now() + Math.floor(Math.random() * 1000);
}
// Definisce la funzione getUsers.
function getUsers() {
    // Restituisce l'elenco degli utenti salvati.
    return readStorage("users", []);
}
// Definisce la funzione saveUsers.
function saveUsers(users) {
    // Salva l'elenco degli utenti.
    writeStorage("users", users);
}
// Definisce la funzione getLoggedUser.
function getLoggedUser() {
    // Restituisce l'utente attualmente autenticato.
    return readStorage("loggedUser", null);
}
// Definisce la funzione saveLoggedUser.
function saveLoggedUser(user) {
    // Salva l'utente attualmente autenticato.
    writeStorage("loggedUser", user);
}
// Definisce la funzione removeLoggedUser.
function removeLoggedUser() {
    // Rimuove l'utente autenticato dal localStorage.
    localStorage.removeItem("loggedUser");
}
// Definisce la funzione requireLoggedUser.
function requireLoggedUser() {
    // Recupera l'utente autenticato.
    const user = getLoggedUser();
    // Controlla se non esiste un utente autenticato.
    if (!user) {
        // Riporta l'utente alla pagina di login.
        window.location.href = "index.html";
        // Restituisce null.
        return null;
    }
    // Restituisce l'utente autenticato.
    return user;
}
// Definisce la funzione setupLogout.
function setupLogout() {
    // Cerca l'eventuale vecchio pulsante Logout.
    const logoutButton = document.getElementById("logout-button");
    // Controlla se il pulsante non esiste.
    if (!logoutButton) {
        // Interrompe la funzione.
        return;
    }
    // Collega una funzione al click sul pulsante.
    logoutButton.addEventListener("click", function () {
        // Rimuove l'utente autenticato.
        removeLoggedUser();
        // Riporta l'utente alla pagina di login.
        window.location.href = "index.html";
    });
}
// Definisce la funzione getPlaylists.
function getPlaylists() {
    // Restituisce l'elenco delle playlist salvate.
    return readStorage("playlists", []);
}
// Definisce la funzione savePlaylists.
function savePlaylists(playlists) {
    // Salva l'elenco delle playlist.
    writeStorage("playlists", playlists);
}
// Definisce la funzione getCommunities.
function getCommunities() {
    // Restituisce l'elenco delle comunità salvate.
    return readStorage("communities", []);
}
// Definisce la funzione saveCommunities.
function saveCommunities(communities) {
    // Salva l'elenco delle comunità.
    writeStorage("communities", communities);
}
// Definisce la funzione formatDuration.
function formatDuration(milliseconds) {
    // Converte i millisecondi in secondi.
    const totalSeconds = Math.floor(milliseconds / 1000);
    // Calcola i minuti.
    const minutes = Math.floor(totalSeconds / 60);
    // Calcola i secondi rimanenti.
    const seconds = totalSeconds % 60;
    // Restituisce la durata nel formato minuti:secondi.
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
// Definisce la funzione setupProfileMenu.
function setupProfileMenu() {
    // Recupera il contenitore generale del menu profilo.
    const profileMenu = document.querySelector(".profile-menu");
    // Recupera il pulsante circolare del profilo.
    const profileButton = document.getElementById("profile-menu-button");
    // Recupera la tendina del profilo.
    const profileDropdown = document.getElementById("profile-dropdown");
    // Recupera l'elemento che mostra il nome utente.
    const profileUsername = document.getElementById("profile-menu-username");
    // Recupera l'elemento che mostra l'email.
    const profileEmail = document.getElementById("profile-menu-email");
    // Recupera il pulsante Logout della tendina.
    const profileLogoutButton = document.getElementById("profile-logout-button");
    // Controlla se gli elementi principali non esistono.
    if (!profileMenu || !profileButton || !profileDropdown) {
        // Interrompe la funzione.
        return;
    }
    // Recupera l'utente attualmente autenticato.
    const user = getLoggedUser();
    // Controlla se esiste un utente autenticato.
    if (user) {
        // Recupera lo username oppure usa un valore predefinito.
        const username = user.username || "Utente";
        // Recupera l'email oppure usa una stringa vuota.
        const email = user.email || "";
        // Mostra nel cerchio la prima lettera dello username.
        profileButton.textContent = username.charAt(0).toUpperCase();
        // Controlla se l'elemento del nome è presente.
        if (profileUsername) {
            // Mostra il nome dell'utente.
            profileUsername.textContent = username;
        }
        // Controlla se l'elemento dell'email è presente.
        if (profileEmail) {
            // Mostra l'email dell'utente.
            profileEmail.textContent = email;
        }
    }
    // Collega una funzione al click sul pulsante del profilo.
    profileButton.addEventListener("click", function (event) {
        // Impedisce al click di propagarsi al documento.
        event.stopPropagation();
        // Apre o chiude la tendina.
        profileDropdown.classList.toggle("open");
    });
    // Collega una funzione al click sulla tendina.
    profileDropdown.addEventListener("click", function (event) {
        // Impedisce al click interno di chiudere la tendina.
        event.stopPropagation();
    });
    // Collega una funzione al click in qualsiasi punto della pagina.
    document.addEventListener("click", function () {
        // Chiude la tendina.
        profileDropdown.classList.remove("open");
    });
    // Collega una funzione alla pressione dei tasti.
    document.addEventListener("keydown", function (event) {
        // Controlla se è stato premuto Escape.
        if (event.key === "Escape") {
            // Chiude la tendina.
            profileDropdown.classList.remove("open");
        }
    });
    // Controlla se il pulsante Logout è presente.
    if (profileLogoutButton) {
        // Collega una funzione al click sul pulsante Logout.
        profileLogoutButton.addEventListener("click", function () {
            // Rimuove l'utente autenticato.
            removeLoggedUser();
            // Riporta l'utente alla pagina di login.
            window.location.href = "index.html";
        });
    }
}
// Definisce la funzione che inizializza gli elementi comuni.
function initializeCommonLayout() {
    // Inizializza il menu del profilo.
    setupProfileMenu();
    // Inizializza l'eventuale vecchio pulsante Logout.
    setupLogout();
}
// Controlla se il documento è ancora in caricamento.
if (document.readyState === "loading") {
    // Aspetta che l'HTML sia completamente caricato.
    document.addEventListener("DOMContentLoaded", function () {
        // Inizializza gli elementi comuni.
        initializeCommonLayout();
    });
// Gestisce il caso in cui il documento sia già stato caricato.
} else {
    // Inizializza immediatamente gli elementi comuni.
    initializeCommonLayout();
}

// Elenca i generi musicali disponibili in tutti i selettori del sito.
const MUSIC_GENRES = [
    // Genere Pop.
    "Pop",
    // Genere Rock.
    "Rock",
    // Genere Rap.
    "Rap",
    // Genere Indie.
    "Indie",
    // Genere Elettronica.
    "Elettronica",
    // Genere Jazz.
    "Jazz",
    // Genere Classica.
    "Classica",
    // Genere R&B.
    "R&B",
    // Genere House.
    "House",
    // Genere Techno.
    "Techno",
    // Genere Reggaeton.
    "Reggaeton",
    // Genere Metal.
    "Metal",
    // Genere Country.
    "Country",
    // Genere Soul.
    "Soul",
    // Genere Funk.
    "Funk",
    // Genere Altro.
    "Altro"
];

// Definisce la funzione createGenreSelector.
function createGenreSelector(container, input) {
    // Controlla che contenitore e campo nascosto esistano.
    if (!container || !input) {
        // Interrompe la funzione.
        return;
    }
    // Svuota il contenitore prima di creare i pulsanti.
    container.innerHTML = "";
    // Scorre tutti i generi disponibili.
    MUSIC_GENRES.forEach(function (genre) {
        // Crea un pulsante per il genere corrente.
        const button = document.createElement("button");
        // Imposta il tipo button per non inviare il form.
        button.type = "button";
        // Imposta la classe grafica del pulsante.
        button.className = "genre-chip";
        // Salva il nome del genere nel pulsante.
        button.dataset.genre = genre;
        // Mostra il nome del genere.
        button.textContent = genre;
        // Collega una funzione al click sul genere.
        button.addEventListener("click", function () {
            // Recupera i generi già selezionati.
            const selectedGenres = input.value
                .split(",")
                .map(function (value) {
                    // Rimuove gli spazi superflui.
                    return value.trim();
                })
                .filter(Boolean);
            // Cerca il genere cliccato tra quelli selezionati.
            const genreIndex = selectedGenres.indexOf(genre);
            // Controlla se il genere era già selezionato.
            if (genreIndex >= 0) {
                // Rimuove il genere dalla selezione.
                selectedGenres.splice(genreIndex, 1);
            } else {
                // Aggiunge il genere alla selezione.
                selectedGenres.push(genre);
            }
            // Salva i generi nel campo nascosto mantenendo il formato precedente.
            input.value = selectedGenres.join(", ");
            // Aggiorna graficamente i pulsanti.
            syncGenreSelector(container, input);
        });
        // Inserisce il pulsante nel contenitore.
        container.appendChild(button);
    });
    // Aggiorna lo stato iniziale dei pulsanti.
    syncGenreSelector(container, input);
}

// Definisce la funzione syncGenreSelector.
function syncGenreSelector(container, input) {
    // Controlla che contenitore e campo nascosto esistano.
    if (!container || !input) {
        // Interrompe la funzione.
        return;
    }
    // Recupera i generi selezionati dal campo nascosto.
    const selectedGenres = input.value
        .split(",")
        .map(function (value) {
            // Rimuove gli spazi superflui.
            return value.trim();
        })
        .filter(Boolean);
    // Scorre tutti i pulsanti del selettore.
    container.querySelectorAll(".genre-chip").forEach(function (button) {
        // Controlla se il genere del pulsante è selezionato.
        const selected = selectedGenres.includes(button.dataset.genre);
        // Aggiunge o rimuove la classe selected.
        button.classList.toggle("selected", selected);
        // Comunica lo stato del pulsante anche alle tecnologie assistive.
        button.setAttribute("aria-pressed", String(selected));
    });
}

// Definisce la funzione initializeGenreSelectors.
function initializeGenreSelectors() {
    // Cerca tutti i selettori di generi presenti nella pagina.
    document.querySelectorAll(".genre-selector[data-genre-input]").forEach(function (container) {
        // Recupera il campo nascosto collegato al selettore.
        const input = document.getElementById(container.dataset.genreInput);
        // Crea i pulsanti del selettore.
        createGenreSelector(container, input);
    });
}

// Inizializza i selettori di generi presenti nella pagina.
initializeGenreSelectors();
