// Recupera l'utente attualmente collegato.
const searchUser = requireLoggedUser();

// Recupera il form di ricerca.
const searchForm = document.getElementById("search-form");

// Recupera il campo di ricerca.
const searchInput = document.getElementById("search-input");

// Recupera il contenitore dei risultati.
const searchResults = document.getElementById("search-results");

// Recupera la sezione dei risultati.
const resultsSection = document.getElementById("results-section");

// Recupera il pulsante per collegare o scollegare Spotify.
const spotifyLoginButton = document.getElementById("spotify-login-button");

// Recupera lo stato del collegamento Spotify.
const spotifyStatus = document.getElementById("spotify-status");

// Crea la variabile che contiene il token Spotify.
let spotifyToken = null;


// Definisce la funzione che mostra un messaggio nei risultati.
function showSearchMessage(message) {

    // Mostra la sezione dei risultati.
    resultsSection.classList.remove("hidden");

    // Svuota i risultati precedenti.
    searchResults.innerHTML = "";

    // Crea un paragrafo.
    const paragraph = document.createElement("p");

    // Assegna la classe al paragrafo.
    paragraph.className = "empty-message";

    // Inserisce il messaggio.
    paragraph.textContent = message;

    // Inserisce il paragrafo nei risultati.
    searchResults.appendChild(paragraph);
}


// Definisce la funzione che aggiorna lo stato di Spotify.
function updateSpotifyStatus() {

    // Controlla se Spotify è collegato.
    if (spotifyToken) {

        // Svuota il contenuto precedente.
        spotifyStatus.innerHTML = "";

        // Crea il contenitore del messaggio.
        const successMessage = document.createElement("span");

        // Assegna la classe al messaggio.
        successMessage.className = "spotify-success";

        // Crea il contenitore della spunta.
        const checkIcon = document.createElement("span");

        // Assegna la classe alla spunta.
        checkIcon.className = "spotify-check";

        // Inserisce la spunta.
        checkIcon.textContent = "✓";

        // Crea il testo dello stato.
        const successText = document.createElement("span");

        // Inserisce il testo dello stato.
        successText.textContent = "Spotify collegato correttamente.";

        // Inserisce spunta e testo.
        successMessage.append(checkIcon, successText);

        // Mostra il messaggio.
        spotifyStatus.appendChild(successMessage);

        // Mostra il pulsante Spotify.
        spotifyLoginButton.style.display = "inline-block";

        // Cambia il testo del pulsante.
        spotifyLoginButton.textContent = "Scollega Spotify";

        // Aggiunge lo stile secondario.
        spotifyLoginButton.classList.add("secondary-button");

    } else {

        // Mostra il messaggio iniziale.
        spotifyStatus.textContent = "Collega Spotify per cercare i brani.";

        // Mostra il pulsante Spotify.
        spotifyLoginButton.style.display = "inline-block";

        // Ripristina il testo del pulsante.
        spotifyLoginButton.textContent = "Collega Spotify";

        // Rimuove lo stile secondario.
        spotifyLoginButton.classList.remove("secondary-button");
    }
}


// Definisce la funzione che inizializza Spotify.
async function initializeSpotify() {

    // Apre il blocco in cui viene tentata l'operazione.
    try {

        // Recupera il token Spotify.
        spotifyToken = await handleSpotifyCallback();

        // Aggiorna lo stato.
        updateSpotifyStatus();

        // Nasconde inizialmente i risultati.
        resultsSection.classList.add("hidden");

    } catch (error) {

        // Mostra l'errore nella console.
        console.error(error);

        // Elimina il token.
        spotifyToken = null;

        // Aggiorna lo stato.
        updateSpotifyStatus();

        // Mostra il messaggio di errore.
        showSearchMessage(error.message);
    }
}


// Definisce la funzione che cerca le canzoni su Spotify.
async function searchSpotifyTracks(searchText) {

    // Controlla se Spotify è collegato.
    if (!spotifyToken) {

        // Genera un errore.
        throw new Error("Devi prima collegare Spotify.");
    }

    // Crea i parametri della ricerca.
    const parameters = new URLSearchParams({

        // Imposta il testo cercato.
        q: searchText,

        // Imposta il tipo di risultato.
        type: "track",

        // Limita il numero dei risultati.
        limit: "10",

        // Imposta il mercato italiano.
        market: "IT"
    });

    // Crea l'indirizzo della richiesta.
    const endpoint =
        "https://api.spotify.com/v1/search?" +
        parameters.toString();

    // Invia la richiesta.
    const response = await fetch(endpoint, {

        // Imposta il metodo GET.
        method: "GET",

        // Imposta gli header.
        headers: {

            // Inserisce il token.
            Authorization: `Bearer ${spotifyToken}`
        }
    });

    // Controlla se il token è scaduto.
    if (response.status === 401) {

        // Disconnette Spotify.
        disconnectSpotify();

        // Elimina il token.
        spotifyToken = null;

        // Aggiorna lo stato.
        updateSpotifyStatus();

        // Genera un errore.
        throw new Error(
            "La sessione Spotify è scaduta. Collegala nuovamente."
        );
    }

    // Controlla l'errore 403.
    if (response.status === 403) {

        // Genera un errore.
        throw new Error(
            "Spotify ha bloccato la richiesta."
        );
    }

    // Controlla l'errore 429.
    if (response.status === 429) {

        // Genera un errore.
        throw new Error(
            "Sono state effettuate troppe richieste. Attendi qualche minuto."
        );
    }

    // Controlla gli altri errori.
    if (!response.ok) {

        // Genera un errore.
        throw new Error(
            "Non è stato possibile completare la ricerca."
        );
    }

    // Converte la risposta in JSON.
    const data = await response.json();

    // Controlla che esistano i risultati.
    if (
        !data.tracks ||
        !Array.isArray(data.tracks.items)
    ) {

        // Restituisce un array vuoto.
        return [];
    }

    // Restituisce le canzoni.
    return data.tracks.items;
}


// Definisce la funzione che aggiunge una canzone a una playlist.
function addSongToPlaylist(track, playlistId, genre) {

    // Recupera tutte le playlist.
    const playlists = getPlaylists();

    // Crea la variabile che indica se la playlist esiste.
    let playlistFound = false;

    // Crea la variabile che indica se la canzone è già presente.
    let songAlreadyPresent = false;

    // Aggiorna le playlist.
    const updatedPlaylists = playlists.map(function (playlist) {

        // Controlla se questa è la playlist selezionata.
        if (
            String(playlist.id) !==
            String(playlistId)
        ) {

            // Restituisce la playlist senza modificarla.
            return playlist;
        }

        // Controlla che la playlist appartenga all'utente collegato.
        if (
            String(playlist.ownerId) !==
            String(searchUser.id)
        ) {

            // Restituisce la playlist senza modificarla.
            return playlist;
        }

        // Indica che la playlist è stata trovata.
        playlistFound = true;

        // Recupera le canzoni.
        const songs =
            Array.isArray(playlist.songs)
                ? playlist.songs
                : [];

        // Controlla se la canzone è già presente.
        songAlreadyPresent = songs.some(function (song) {

            // Confronta gli identificativi Spotify.
            return song.spotifyId === track.id;
        });

        // Controlla se la canzone è già presente.
        if (songAlreadyPresent) {

            // Restituisce la playlist senza modificarla.
            return playlist;
        }

        // Recupera i nomi degli artisti.
        const artists =
            track.artists
                .map(function (artist) {

                    // Restituisce il nome dell'artista.
                    return artist.name;
                })
                .join(", ");

        // Recupera la data.
        const releaseDate =
            track.album.release_date || "";

        // Crea la nuova canzone.
        const newSong = {

            // Salva l'identificativo Spotify.
            spotifyId: track.id,

            // Salva il titolo.
            title: track.name,

            // Salva gli artisti.
            artist: artists,

            // Salva l'album.
            album: track.album.name,

            // Salva l'anno.
            year: releaseDate.substring(0, 4),

            // Salva la durata.
            duration: track.duration_ms,

            // Salva il genere.
            genre: genre
        };

        // Restituisce la playlist aggiornata.
        return {

            // Mantiene i dati precedenti.
            ...playlist,

            // Aggiunge la nuova canzone.
            songs: [...songs, newSong]
        };
    });

    // Controlla che la playlist esista.
    if (!playlistFound) {

        // Mostra un messaggio.
        alert(
            "Non puoi aggiungere il brano: crea prima una playlist."
        );

        // Comunica che l'aggiunta non è riuscita.
        return false;
    }

    // Controlla se la canzone è già presente.
    if (songAlreadyPresent) {

        // Comunica che la canzone era già presente.
        return false;
    }

    // Salva le playlist.
    savePlaylists(updatedPlaylists);

    // Comunica che l'aggiunta è riuscita.
    return true;
}


// Definisce la funzione che crea una playlist.
function createQuickPlaylist(title, description, tags) {

    // Recupera tutte le playlist.
    const playlists = getPlaylists();

    // Crea la nuova playlist.
    const newPlaylist = {

        // Genera un nuovo identificativo.
        id: generateId(),

        // Salva il proprietario.
        ownerId: searchUser.id,

        // Salva il titolo.
        title: title,

        // Salva la descrizione.
        description: description,

        // Salva i tag.
        tags: tags,

        // Crea l'elenco vuoto delle canzoni.
        songs: []
    };

    // Aggiunge la playlist.
    playlists.push(newPlaylist);

    // Salva le playlist.
    savePlaylists(playlists);

    // Restituisce la nuova playlist.
    return newPlaylist;
}


// Definisce la funzione che apre la finestra per creare una playlist.
function openQuickPlaylistModal(track) {

    // Cerca un eventuale modal già presente.
    const existingModal =
        document.getElementById(
            "quick-playlist-modal"
        );

    // Controlla se esiste già.
    if (existingModal) {

        // Rimuove il modal precedente.
        existingModal.remove();
    }

    // Crea lo sfondo scuro del modal.
    const overlay =
        document.createElement("div");

    // Imposta l'identificativo.
    overlay.id =
        "quick-playlist-modal";

    // Assegna la classe.
    overlay.className =
        "quick-playlist-overlay";

    // Crea la finestra centrale.
    const modal =
        document.createElement("div");

    // Assegna la classe.
    modal.className =
        "quick-playlist-modal";

    // Crea il titolo della finestra.
    const heading =
        document.createElement("h2");

    // Imposta il testo del titolo.
    heading.textContent =
        "Crea una nuova playlist";

    // Crea la descrizione della finestra.
    const subtitle =
        document.createElement("p");

    // Imposta il testo della descrizione.
    subtitle.textContent =
        `La canzone "${track.name}" verrà aggiunta automaticamente.`;

    // Crea il gruppo del titolo.
    const titleGroup =
        document.createElement("div");

    // Assegna la classe.
    titleGroup.className =
        "quick-form-group";

    // Crea l'etichetta del titolo.
    const titleLabel =
        document.createElement("label");

    // Imposta il testo dell'etichetta.
    titleLabel.textContent =
        "Titolo";

    // Crea il campo del titolo.
    const titleInput =
        document.createElement("input");

    // Imposta il tipo del campo.
    titleInput.type =
        "text";

    // Imposta il testo segnaposto.
    titleInput.placeholder =
        "Nome della playlist";

    // Inserisce etichetta e campo.
    titleGroup.append(
        titleLabel,
        titleInput
    );

    // Crea il gruppo della descrizione.
    const descriptionGroup =
        document.createElement("div");

    // Assegna la classe.
    descriptionGroup.className =
        "quick-form-group";

    // Crea l'etichetta della descrizione.
    const descriptionLabel =
        document.createElement("label");

    // Imposta il testo dell'etichetta.
    descriptionLabel.textContent =
        "Descrizione";

    // Crea il campo della descrizione.
    const descriptionInput =
        document.createElement("textarea");

    // Imposta il numero di righe.
    descriptionInput.rows =
        3;

    // Imposta il testo segnaposto.
    descriptionInput.placeholder =
        "Descrivi brevemente la playlist";

    // Inserisce etichetta e campo.
    descriptionGroup.append(
        descriptionLabel,
        descriptionInput
    );

    // Crea il gruppo dei tag.
    const tagsGroup =
        document.createElement("div");

    // Assegna la classe.
    tagsGroup.className =
        "quick-form-group";

    // Crea l'etichetta dei tag.
    const tagsLabel =
        document.createElement("label");

    // Imposta il testo dell'etichetta.
    tagsLabel.textContent =
        "Tag";

    // Crea il campo nascosto che conserva i generi selezionati.
    const tagsInput =
        document.createElement("input");

    // Imposta il tipo nascosto.
    tagsInput.type =
        "hidden";

    // Crea il contenitore dei pulsanti dei generi.
    const tagsSelector =
        document.createElement("div");

    // Assegna la classe grafica comune.
    tagsSelector.className =
        "genre-selector";

    // Crea i pulsanti dei generi e li collega al campo nascosto.
    createGenreSelector(
        tagsSelector,
        tagsInput
    );

    // Inserisce etichetta, campo nascosto e pulsanti.
    tagsGroup.append(
        tagsLabel,
        tagsInput,
        tagsSelector
    );

    // Crea il contenitore dei pulsanti.
    const actions =
        document.createElement("div");

    // Assegna la classe.
    actions.className =
        "quick-modal-actions";

    // Crea il pulsante Annulla.
    const cancelButton =
        document.createElement("button");

    // Imposta il tipo.
    cancelButton.type =
        "button";

    // Assegna le classi.
    cancelButton.className =
        "page-button secondary-button";

    // Imposta il testo.
    cancelButton.textContent =
        "Annulla";

    // Crea il pulsante di creazione.
    const createButton =
        document.createElement("button");

    // Imposta il tipo.
    createButton.type =
        "button";

    // Assegna la classe.
    createButton.className =
        "page-button";

    // Imposta il testo.
    createButton.textContent =
        "Crea e aggiungi";

    // Collega una funzione al pulsante Annulla.
    cancelButton.addEventListener(
        "click",
        function () {

            // Rimuove la finestra.
            overlay.remove();
        }
    );

    // Collega una funzione al click sullo sfondo.
    overlay.addEventListener(
        "click",
        function (event) {

            // Controlla se è stato cliccato lo sfondo.
            if (event.target === overlay) {

                // Rimuove la finestra.
                overlay.remove();
            }
        }
    );

    // Collega una funzione al pulsante Crea e aggiungi.
    createButton.addEventListener(
        "click",
        function () {

            // Recupera il titolo.
            const title =
                titleInput.value.trim();

            // Recupera la descrizione.
            const description =
                descriptionInput.value.trim();

            // Recupera i tag selezionati.
            const tagsText =
                tagsInput.value.trim();

            // Controlla il titolo.
            if (!title) {

                // Mostra un messaggio.
                alert(
                    "Inserisci il titolo della playlist."
                );

                // Interrompe la funzione.
                return;
            }

            // Controlla la descrizione.
            if (!description) {

                // Mostra un messaggio.
                alert(
                    "Inserisci una descrizione."
                );

                // Interrompe la funzione.
                return;
            }

            // Controlla i tag.
            if (!tagsText) {

                // Mostra un messaggio.
                alert(
                    "Seleziona almeno un genere musicale."
                );

                // Interrompe la funzione.
                return;
            }

            // Trasforma i tag in un array.
            const tags =
                tagsText
                    .split(",")
                    .map(function (tag) {

                        // Rimuove gli spazi.
                        return tag.trim();
                    })
                    .filter(function (tag) {

                        // Mantiene solamente i tag non vuoti.
                        return tag !== "";
                    });

            // Usa il primo tag selezionato come genere della canzone.
            const genre =
                tags[0];

            // Crea la playlist.
            const newPlaylist =
                createQuickPlaylist(
                    title,
                    description,
                    tags
                );

            // Aggiunge la canzone alla playlist.
            addSongToPlaylist(
                track,
                newPlaylist.id,
                genre
            );

            // Chiude la finestra.
            overlay.remove();

            // Controlla se esiste ancora un testo di ricerca.
            if (
                searchInput.value.trim()
            ) {

                // Ripete la ricerca per aggiornare i menu delle playlist.
                searchForm.requestSubmit();
            }
        }
    );

    // Inserisce i pulsanti.
    actions.append(
        cancelButton,
        createButton
    );

    // Inserisce tutti gli elementi nel modal.
    modal.append(
        heading,
        subtitle,
        titleGroup,
        descriptionGroup,
        tagsGroup,
        actions
    );

    // Inserisce il modal nello sfondo.
    overlay.appendChild(
        modal
    );

    // Inserisce tutto nella pagina.
    document.body.appendChild(
        overlay
    );

    // Porta il cursore nel campo titolo.
    titleInput.focus();
}


// Definisce la funzione che crea un risultato della ricerca.
function createTrackResult(track, userPlaylists) {

    // Crea la scheda della canzone.
    const result =
        document.createElement("article");

    // Assegna la classe.
    result.className =
        "song-result";

    // Crea il contenitore delle informazioni.
    const information =
        document.createElement("div");

    // Assegna la classe.
    information.className =
        "song-information";

    // Crea il titolo.
    const title =
        document.createElement("strong");

    // Inserisce il titolo.
    title.textContent =
        track.name;

    // Crea il paragrafo dei dettagli.
    const details =
        document.createElement("p");

    // Recupera gli artisti.
    const artists =
        track.artists
            .map(function (artist) {

                // Restituisce il nome dell'artista.
                return artist.name;
            })
            .join(", ");

    // Recupera il nome dell'album.
    const albumName =
        track.album.name;

    // Recupera la data.
    const releaseDate =
        track.album.release_date || "";

    // Recupera l'anno.
    const year =
        releaseDate
            ? releaseDate.substring(0, 4)
            : "Anno non disponibile";

    // Calcola la durata.
    const durationText =
        formatDuration(
            track.duration_ms
        );

    // Inserisce i dettagli.
    details.textContent =
        `${artists} · ${albumName} · ${year} · ${durationText}`;

    // Inserisce titolo e dettagli.
    information.append(
        title,
        details
    );

    // Crea il contenitore dei controlli.
    const controls =
        document.createElement("div");

    // Assegna la classe.
    controls.className =
        "song-controls";

    // Controlla se l'utente non possiede playlist.
    if (userPlaylists.length === 0) {

        // Crea il pulsante per creare una playlist.
        const createPlaylistButton =
            document.createElement("button");

        // Imposta il tipo.
        createPlaylistButton.type =
            "button";

        // Assegna la classe.
        createPlaylistButton.className =
            "page-button";

        // Imposta il testo.
        createPlaylistButton.textContent =
            "+ Crea playlist";

        // Collega una funzione al click.
        createPlaylistButton.addEventListener(
            "click",
            function () {

                // Apre la finestra di creazione.
                openQuickPlaylistModal(
                    track
                );
            }
        );

        // Inserisce il pulsante.
        controls.appendChild(
            createPlaylistButton
        );

    } else {

        // Crea il menu delle playlist.
        const select =
            document.createElement("select");

        // Crea l'opzione iniziale.
        const defaultOption =
            document.createElement("option");

        // Imposta il valore vuoto.
        defaultOption.value =
            "";

        // Imposta il testo.
        defaultOption.textContent =
            "Scegli una playlist";

        // Inserisce l'opzione.
        select.appendChild(
            defaultOption
        );

        // Scorre le playlist dell'utente.
        userPlaylists.forEach(
            function (playlist) {

                // Crea una nuova opzione.
                const option =
                    document.createElement("option");

                // Imposta il valore.
                option.value =
                    playlist.id;

                // Imposta il titolo.
                option.textContent =
                    playlist.title ||
                    playlist.name ||
                    "Playlist senza nome";

                // Inserisce l'opzione.
                select.appendChild(
                    option
                );
            }
        );

        // Crea l'opzione per creare direttamente una nuova playlist.
        const createNewPlaylistOption =
            document.createElement("option");

        // Usa un valore speciale che non può coincidere con l'id di una playlist.
        createNewPlaylistOption.value =
            "__create_new_playlist__";

        // Imposta il testo mostrato nel menu.
        createNewPlaylistOption.textContent =
            "+ Crea nuova playlist";

        // Inserisce l'opzione alla fine dell'elenco.
        select.appendChild(
            createNewPlaylistOption
        );

        // Crea il menu del genere.
        const genreSelect =
            document.createElement("select");

        // Crea l'opzione iniziale.
        const genreOption =
            document.createElement("option");

        // Imposta il valore vuoto.
        genreOption.value =
            "";

        // Imposta il testo.
        genreOption.textContent =
            "Scegli il genere";

        // Inserisce l'opzione.
        genreSelect.appendChild(
            genreOption
        );

        // Scorre i generi.
        [
            "Pop",
            "Rock",
            "Rap",
            "Indie",
            "Elettronica",
            "Jazz",
            "Classica",
            "R&B",
            "House",
            "Techno",
            "Reggaeton",
            "Metal",
            "Country",
            "Soul",
            "Funk",
            "Altro"
        ].forEach(
            function (genre) {

                // Crea una nuova opzione.
                const option =
                    document.createElement("option");

                // Imposta il valore.
                option.value =
                    genre;

                // Imposta il testo.
                option.textContent =
                    genre;

                // Inserisce l'opzione.
                genreSelect.appendChild(
                    option
                );
            }
        );

        // Crea il pulsante Aggiungi.
        const addButton =
            document.createElement("button");

        // Imposta il tipo.
        addButton.type =
            "button";

        // Assegna la classe.
        addButton.className =
            "page-button";

        // Imposta il testo iniziale.
        addButton.textContent =
            "Aggiungi";


        // Definisce la funzione che aggiorna lo stato del pulsante.
        function updateAddButton() {

            // Recupera l'identificativo della playlist selezionata.
            const selectedPlaylistId =
                select.value;

            // Controlla se non è stata selezionata una playlist.
            if (!selectedPlaylistId) {

                // Mostra il testo normale.
                addButton.textContent =
                    "Aggiungi";

                // Riattiva il pulsante.
                addButton.disabled =
                    false;

                // Imposta lo sfondo verde.
                addButton.style.background =
                    "#1ed760";

                // Imposta il colore del testo.
                addButton.style.color =
                    "#000000";

                // Ripristina il cursore.
                addButton.style.cursor =
                    "pointer";

                // Interrompe la funzione.
                return;
            }

            // Recupera le playlist aggiornate.
            const currentPlaylists =
                getPlaylists();

            // Cerca la playlist selezionata.
            const selectedPlaylist =
                currentPlaylists.find(
                    function (playlist) {

                        // Controlla id e proprietario.
                        return (
                            String(playlist.id) ===
                            String(selectedPlaylistId) &&
                            String(playlist.ownerId) ===
                            String(searchUser.id)
                        );
                    }
                );

            // Controlla se la playlist non esiste.
            if (!selectedPlaylist) {

                // Ripristina la selezione.
                select.value = "";

                // Mostra il testo normale.
                addButton.textContent =
                    "Aggiungi";

                // Disabilita il pulsante.
                addButton.disabled =
                    true;

                // Imposta lo sfondo grigio.
                addButton.style.background =
                    "#3a3a3c";

                // Imposta il colore del testo.
                addButton.style.color =
                    "#a9a9ad";

                // Imposta il cursore.
                addButton.style.cursor =
                    "default";

                // Interrompe la funzione.
                return;
            }

            // Recupera le canzoni della playlist.
            const songs =
                Array.isArray(selectedPlaylist.songs)
                    ? selectedPlaylist.songs
                    : [];

            // Controlla se la canzone è già presente.
            const songAlreadyPresent =
                songs.some(
                    function (song) {

                        // Confronta l'identificativo Spotify.
                        return (
                            song.spotifyId ===
                            track.id
                        );
                    }
                );

            // Controlla se la canzone è già presente.
            if (songAlreadyPresent) {

                // Cambia il testo del pulsante.
                addButton.textContent =
                    "Aggiunta";

                // Disabilita il pulsante.
                addButton.disabled =
                    true;

                // Imposta lo sfondo grigio.
                addButton.style.background =
                    "#3a3a3c";

                // Imposta il colore del testo.
                addButton.style.color =
                    "#a9a9ad";

                // Imposta il cursore normale.
                addButton.style.cursor =
                    "default";

            } else {

                // Mostra il testo normale.
                addButton.textContent =
                    "Aggiungi";

                // Riattiva il pulsante.
                addButton.disabled =
                    false;

                // Imposta lo sfondo verde.
                addButton.style.background =
                    "#1ed760";

                // Imposta il colore del testo.
                addButton.style.color =
                    "#000000";

                // Imposta il cursore.
                addButton.style.cursor =
                    "pointer";
            }
        }


        // Collega una funzione al cambio della playlist.
        select.addEventListener(
            "change",
            function () {

                // Controlla se l'utente vuole creare una nuova playlist.
                if (
                    select.value ===
                    "__create_new_playlist__"
                ) {

                    // Ripristina il menu sulla voce iniziale.
                    select.value =
                        "";

                    // Apre la finestra di creazione e collega il brano corrente.
                    openQuickPlaylistModal(
                        track
                    );

                    // Ripristina lo stato normale del pulsante Aggiungi.
                    updateAddButton();

                    // Interrompe la funzione.
                    return;
                }

                // Aggiorna lo stato del pulsante.
                updateAddButton();
            }
        );


        // Collega una funzione al click sul pulsante Aggiungi.
        addButton.addEventListener(
            "click",
            function () {

                // Controlla se è stata scelta una playlist.
                if (!select.value) {

                    // Mostra un messaggio.
                    alert(
                        "Seleziona una playlist."
                    );

                    // Interrompe la funzione.
                    return;
                }

                // Controlla se è stato scelto un genere.
                if (!genreSelect.value) {

                    // Mostra un messaggio.
                    alert(
                        "Seleziona il genere della canzone."
                    );

                    // Interrompe la funzione.
                    return;
                }

                // Prova ad aggiungere la canzone.
                const songAdded =
                    addSongToPlaylist(
                        track,
                        select.value,
                        genreSelect.value
                    );

                // Controlla se l'aggiunta è riuscita.
                if (songAdded === true) {

                    // Aggiorna immediatamente il pulsante.
                    updateAddButton();
                }
            }
        );

        // Inserisce i controlli.
        controls.append(
            select,
            genreSelect,
            addButton
        );
    }

    // Inserisce le informazioni e i controlli.
    result.append(
        information,
        controls
    );

    // Restituisce il risultato.
    return result;
}


// Definisce la funzione che mostra i risultati.
function renderSearchResults(tracks) {

    // Mostra la sezione risultati.
    resultsSection.classList.remove(
        "hidden"
    );

    // Svuota i risultati precedenti.
    searchResults.innerHTML =
        "";

    // Controlla se non ci sono risultati.
    if (tracks.length === 0) {

        // Mostra il messaggio.
        showSearchMessage(
            "Nessuna canzone trovata."
        );

        // Interrompe la funzione.
        return;
    }

    // Recupera tutte le playlist.
    const playlists =
        getPlaylists();

    // Mantiene soltanto le playlist dell'utente.
    const userPlaylists =
        playlists.filter(
            function (playlist) {

                // Confronta gli identificativi.
                return (
                    String(playlist.ownerId) ===
                    String(searchUser.id)
                );
            }
        );

    // Scorre le canzoni trovate.
    tracks.forEach(
        function (track) {

            // Crea la scheda.
            const result =
                createTrackResult(
                    track,
                    userPlaylists
                );

            // Inserisce la scheda nei risultati.
            searchResults.appendChild(
                result
            );
        }
    );
}


// Collega una funzione al pulsante Spotify.
spotifyLoginButton.addEventListener(
    "click",
    function () {

        // Controlla se Spotify è già collegato.
        if (spotifyToken) {

            // Elimina i dati del collegamento Spotify.
            disconnectSpotify();

            // Elimina il token dalla variabile.
            spotifyToken = null;

            // Aggiorna lo stato grafico.
            updateSpotifyStatus();

            // Svuota i risultati.
            searchResults.innerHTML =
                "";

            // Nasconde la sezione dei risultati.
            resultsSection.classList.add(
                "hidden"
            );

            // Interrompe la funzione.
            return;
        }

        // Avvia il collegamento con Spotify.
        connectSpotify();
    }
);


// Collega una funzione al form di ricerca.
searchForm.addEventListener(
    "submit",
    async function (event) {

        // Impedisce il comportamento automatico.
        event.preventDefault();

        // Recupera il testo cercato.
        const searchText =
            searchInput.value.trim();

        // Controlla se il campo è vuoto.
        if (!searchText) {

            // Mostra un messaggio.
            showSearchMessage(
                "Inserisci il titolo di una canzone o il nome di un artista."
            );

            // Interrompe la funzione.
            return;
        }

        // Mostra il caricamento.
        showSearchMessage(
            "Ricerca in corso..."
        );

        // Apre il blocco in cui viene tentata la ricerca.
        try {

            // Cerca le canzoni.
            const tracks =
                await searchSpotifyTracks(
                    searchText
                );

            // Mostra i risultati.
            renderSearchResults(
                tracks
            );

        } catch (error) {

            // Mostra l'errore nella console.
            console.error(
                error
            );

            // Mostra il messaggio.
            showSearchMessage(
                error.message
            );
        }
    }
);


// Inizializza Spotify.
initializeSpotify();

// Configura il logout.
setupLogout();