// Recupera l'utente attualmente collegato.
const playlistUser = requireLoggedUser();


// Recupera gli elementi principali della pagina.
const newPlaylistButton =
    document.getElementById("new-playlist-button");

// Recupera la sezione contenente il form.
const playlistFormSection =
    document.getElementById("playlist-form-section");

// Recupera il form della playlist.
const playlistForm =
    document.getElementById("playlist-form");

// Recupera il campo nascosto dell'id.
const playlistIdInput =
    document.getElementById("playlist-id");

// Recupera il campo del titolo.
const playlistTitleInput =
    document.getElementById("playlist-title");

// Recupera il campo della descrizione.
const playlistDescriptionInput =
    document.getElementById("playlist-description");

// Recupera il campo dei tag.
const playlistTagsInput =
    document.getElementById("playlist-tags");

// Recupera il pulsante Annulla.
const cancelPlaylistButton =
    document.getElementById("cancel-playlist-button");

// Recupera il contenitore delle playlist.
const playlistList =
    document.getElementById("playlist-list");


// Mostra il form per creare una playlist.
function showPlaylistForm() {

    // Svuota l'id perché stiamo creando una nuova playlist.
    playlistIdInput.value = "";

    // Svuota il titolo.
    playlistTitleInput.value = "";

    // Svuota la descrizione.
    playlistDescriptionInput.value = "";

    // Svuota i tag.
    playlistTagsInput.value = "";

    // Cambia il titolo del form.
    playlistFormSection
        .querySelector("h2")
        .textContent =
        "Nuova playlist";

    // Mostra il form.
    playlistFormSection.classList.add(
        "visible"
    );

    // Porta il cursore nel campo titolo.
    playlistTitleInput.focus();
}


// Nasconde il form.
function hidePlaylistForm() {

    // Nasconde la sezione.
    playlistFormSection.classList.remove(
        "visible"
    );

    // Svuota il form.
    playlistForm.reset();

    // Svuota l'id.
    playlistIdInput.value = "";
}


// Recupera soltanto le playlist dell'utente collegato.
function getUserPlaylists() {

    // Recupera tutte le playlist.
    const playlists =
        getPlaylists();

    // Restituisce soltanto quelle dell'utente.
    return playlists.filter(
        function (playlist) {

            // Confronta l'id del proprietario con quello dell'utente.
            return (
                String(playlist.ownerId) ===
                String(playlistUser.id)
            );
        }
    );
}


// Gestisce il caso in cui non esistano playlist.
function renderEmptyState() {

    // Svuota semplicemente il contenitore delle playlist.
    playlistList.innerHTML = "";
}


// Elimina una playlist.
function deletePlaylist(playlistId) {

    // Recupera tutte le playlist.
    const playlists =
        getPlaylists();

    // Elimina la playlist selezionata.
    const updatedPlaylists =
        playlists.filter(
            function (playlist) {

                // Mantiene tutte le playlist diverse da quella selezionata.
                return (
                    String(playlist.id) !==
                    String(playlistId)
                );
            }
        );

    // Salva le playlist aggiornate.
    savePlaylists(
        updatedPlaylists
    );

    // Aggiorna immediatamente la pagina.
    renderPlaylists();
}


// Apre il form per modificare una playlist.
function editPlaylist(playlistId) {

    // Recupera tutte le playlist.
    const playlists =
        getPlaylists();

    // Cerca la playlist selezionata.
    const playlist =
        playlists.find(
            function (item) {

                // Confronta gli identificativi.
                return (
                    String(item.id) ===
                    String(playlistId)
                );
            }
        );

    // Controlla se la playlist non è stata trovata.
    if (!playlist) {

        // Interrompe la funzione.
        return;
    }

    // Inserisce l'id nel campo nascosto.
    playlistIdInput.value =
        playlist.id;

    // Inserisce il titolo.
    playlistTitleInput.value =
        playlist.title || "";

    // Inserisce la descrizione.
    playlistDescriptionInput.value =
        playlist.description || "";

    // Inserisce i tag.
    playlistTagsInput.value =
        Array.isArray(playlist.tags)
            ? playlist.tags.join(", ")
            : playlist.tags || "";

    // Cambia il titolo del form.
    playlistFormSection
        .querySelector("h2")
        .textContent =
        "Modifica playlist";

    // Mostra il form.
    playlistFormSection.classList.add(
        "visible"
    );

    // Porta il cursore sul titolo.
    playlistTitleInput.focus();
}


// Crea la scheda di una playlist.
function createPlaylistCard(playlist) {

    // Crea la scheda.
    const card =
        document.createElement("article");

    // Assegna la classe.
    card.className =
        "playlist-card";

    // Crea il titolo.
    const title =
        document.createElement("h3");

    // Inserisce il titolo.
    title.textContent =
        playlist.title ||
        "Playlist senza titolo";

    // Crea la descrizione.
    const description =
        document.createElement("p");

    // Inserisce la descrizione.
    description.textContent =
        playlist.description ||
        "Nessuna descrizione.";

    // Recupera i tag.
    const tags =
        Array.isArray(playlist.tags)
            ? playlist.tags
            : [];

    // Crea il testo dei tag.
    const tagsText =
        document.createElement("p");

    // Inserisce i tag.
    tagsText.textContent =
        tags.length > 0
            ? "Tag: " + tags.join(", ")
            : "Nessun tag";

    // Recupera le canzoni.
    const songs =
        Array.isArray(playlist.songs)
            ? playlist.songs
            : [];

    // Crea il testo del numero delle canzoni.
    const songsText =
        document.createElement("p");

    // Inserisce il numero delle canzoni.
    songsText.textContent =
        songs.length === 1
            ? "1 canzone"
            : songs.length + " canzoni";

    // Crea il contenitore dei pulsanti.
    const actions =
        document.createElement("div");

    // Assegna la classe.
    actions.className =
        "playlist-actions";

    // Crea il pulsante Modifica.
    const editButton =
        document.createElement("button");

    // Imposta il tipo.
    editButton.type =
        "button";

    // Assegna le classi.
    editButton.className =
        "page-button secondary-button";

    // Inserisce il testo.
    editButton.textContent =
        "Modifica";

    // Gestisce il click sul pulsante Modifica.
    editButton.addEventListener(
        "click",
        function () {

            // Apre la playlist selezionata nel form.
            editPlaylist(
                playlist.id
            );
        }
    );

    // Crea il pulsante Elimina.
    const deleteButton =
        document.createElement("button");

    // Imposta il tipo.
    deleteButton.type =
        "button";

    // Assegna le classi.
    deleteButton.className =
        "page-button danger-button";

    // Inserisce il testo.
    deleteButton.textContent =
        "Elimina";

    // Gestisce il click sul pulsante Elimina.
    deleteButton.addEventListener(
        "click",
        function () {

            // Elimina immediatamente la playlist.
            deletePlaylist(
                playlist.id
            );
        }
    );

    // Inserisce i pulsanti.
    actions.append(
        editButton,
        deleteButton
    );

    // Inserisce tutto nella scheda.
    card.append(
        title,
        description,
        tagsText,
        songsText,
        actions
    );

    // Restituisce la scheda.
    return card;
}


// Mostra le playlist dell'utente.
function renderPlaylists() {

    // Recupera le playlist dell'utente.
    const playlists =
        getUserPlaylists();

    // Controlla se l'utente non ha playlist.
    if (playlists.length === 0) {

        // Lascia vuota la zona delle playlist.
        renderEmptyState();

        // Interrompe la funzione.
        return;
    }

    // Svuota il contenitore.
    playlistList.innerHTML = "";

    // Mostra ogni playlist.
    playlists.forEach(
        function (playlist) {

            // Crea la scheda.
            const card =
                createPlaylistCard(
                    playlist
                );

            // Inserisce la scheda.
            playlistList.appendChild(
                card
            );
        }
    );
}


// Gestisce il salvataggio del form.
playlistForm.addEventListener(
    "submit",
    function (event) {

        // Impedisce il ricaricamento della pagina.
        event.preventDefault();

        // Recupera il titolo.
        const title =
            playlistTitleInput.value.trim();

        // Recupera la descrizione.
        const description =
            playlistDescriptionInput.value.trim();

        // Recupera i tag.
        const tags =
            playlistTagsInput.value
                .split(",")
                .map(
                    function (tag) {

                        // Rimuove gli spazi.
                        return tag.trim();
                    }
                )
                .filter(
                    function (tag) {

                        // Mantiene soltanto i tag non vuoti.
                        return tag !== "";
                    }
                );

        // Recupera tutte le playlist.
        const playlists =
            getPlaylists();

        // Recupera l'id della playlist.
        const playlistId =
            playlistIdInput.value;

        // Controlla se stiamo modificando una playlist.
        if (playlistId) {

            // Aggiorna le playlist.
            const updatedPlaylists =
                playlists.map(
                    function (playlist) {

                        // Mantiene inalterate le altre playlist.
                        if (
                            String(playlist.id) !==
                            String(playlistId)
                        ) {

                            // Restituisce la playlist originale.
                            return playlist;
                        }

                        // Restituisce la playlist modificata.
                        return {

                            // Mantiene tutti gli altri dati.
                            ...playlist,

                            // Aggiorna il titolo.
                            title:
                                title,

                            // Aggiorna la descrizione.
                            description:
                                description,

                            // Aggiorna i tag.
                            tags:
                                tags
                        };
                    }
                );

            // Salva le playlist aggiornate.
            savePlaylists(
                updatedPlaylists
            );

        // Gestisce la creazione di una nuova playlist.
        } else {

            // Crea la nuova playlist.
            const newPlaylist = {

                // Genera un identificativo.
                id:
                    generateId(),

                // Salva il proprietario.
                ownerId:
                    playlistUser.id,

                // Salva il titolo.
                title:
                    title,

                // Salva la descrizione.
                description:
                    description,

                // Salva i tag.
                tags:
                    tags,

                // Crea l'elenco inizialmente vuoto delle canzoni.
                songs:
                    []
            };

            // Aggiunge la nuova playlist.
            playlists.push(
                newPlaylist
            );

            // Salva le playlist.
            savePlaylists(
                playlists
            );
        }

        // Nasconde il form.
        hidePlaylistForm();

        // Aggiorna le playlist.
        renderPlaylists();
    }
);


// Gestisce il pulsante Crea playlist.
newPlaylistButton.addEventListener(
    "click",
    function () {

        // Mostra il form.
        showPlaylistForm();
    }
);


// Gestisce il pulsante Annulla.
cancelPlaylistButton.addEventListener(
    "click",
    function () {

        // Nasconde il form.
        hidePlaylistForm();
    }
);


// Mostra le playlist all'apertura della pagina.
renderPlaylists();

// Prepara il logout e il menu profilo.
setupLogout();