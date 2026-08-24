// Recupera l'utente attualmente collegato.
const sharingUser = requireLoggedUser();

// Recupera il form per condividere una playlist.
const shareForm =
    document.getElementById("share-form");

// Recupera il menu delle playlist.
const playlistSelect =
    document.getElementById("share-playlist");

// Recupera il menu delle comunità.
const communitySelect =
    document.getElementById("share-community");

// Recupera il contenitore dei messaggi.
const shareMessage =
    document.getElementById("share-message");

// Recupera il form di ricerca.
const sharedSearchForm =
    document.getElementById("shared-search-form");

// Recupera il campo di ricerca.
const sharedSearchInput =
    document.getElementById("shared-search-input");

// Recupera il contenitore delle playlist condivise.
const sharedPlaylistList =
    document.getElementById("shared-playlist-list");


// Recupera le playlist condivise.
function getSharedPlaylists() {

    // Legge le playlist condivise dal localStorage.
    return readStorage(
        "sharedPlaylists",
        []
    );
}


// Salva le playlist condivise.
function saveSharedPlaylists(playlists) {

    // Salva le playlist condivise nel localStorage.
    writeStorage(
        "sharedPlaylists",
        playlists
    );
}


// Recupera le playlist dell'utente collegato.
function getMyPlaylists() {

    // Recupera tutte le playlist.
    const playlists =
        getPlaylists();

    // Mantiene soltanto quelle dell'utente.
    return playlists.filter(
        function (playlist) {

            // Confronta il proprietario.
            return (
                String(playlist.ownerId) ===
                String(sharingUser.id)
            );
        }
    );
}


// Recupera le comunità dell'utente.
function getMyCommunities() {

    // Recupera tutte le comunità.
    const communities =
        getCommunities();

    // Mantiene soltanto quelle alle quali l'utente è iscritto.
    return communities.filter(
        function (community) {

            // Recupera i membri.
            const members =
                Array.isArray(community.members)
                    ? community.members
                    : [];

            // Controlla se l'utente è membro.
            return members.some(
                function (memberId) {

                    // Confronta gli identificativi.
                    return (
                        String(memberId) ===
                        String(sharingUser.id)
                    );
                }
            );
        }
    );
}


// Recupera sempre i dati aggiornati di una playlist condivisa.
function getUpdatedSharedPlaylist(sharedPlaylist) {

    // Recupera tutte le playlist originali.
    const playlists =
        getPlaylists();

    // Cerca la playlist originale tramite sourcePlaylistId.
    const originalPlaylist =
        playlists.find(
            function (playlist) {

                // Confronta gli identificativi.
                return (
                    String(playlist.id) ===
                    String(sharedPlaylist.sourcePlaylistId)
                );
            }
        );

    // Controlla se la playlist originale non esiste più.
    if (!originalPlaylist) {

        // Restituisce i dati salvati nella condivisione.
        return {

            // Mantiene i dati della condivisione.
            ...sharedPlaylist,

            // Garantisce che i tag siano un array.
            tags:
                Array.isArray(sharedPlaylist.tags)
                    ? sharedPlaylist.tags
                    : [],

            // Garantisce che i brani siano un array.
            songs:
                Array.isArray(sharedPlaylist.songs)
                    ? sharedPlaylist.songs
                    : []
        };
    }

    // Restituisce la condivisione con i dati aggiornati della playlist originale.
    return {

        // Mantiene id, comunità e autore.
        ...sharedPlaylist,

        // Recupera il titolo aggiornato.
        title:
            originalPlaylist.title ||
            "Playlist",

        // Recupera la descrizione aggiornata.
        description:
            originalPlaylist.description ||
            "",

        // Recupera i tag aggiornati.
        tags:
            Array.isArray(originalPlaylist.tags)
                ? [...originalPlaylist.tags]
                : [],

        // Recupera i brani aggiornati.
        songs:
            Array.isArray(originalPlaylist.songs)
                ? originalPlaylist.songs.map(
                    function (song) {

                        // Crea una copia del brano.
                        return {
                            ...song
                        };
                    }
                )
                : []
    };
}


// Riempie un menu select.
function fillSelect(
    select,
    items,
    placeholder,
    textFunction
) {

    // Svuota il menu.
    select.innerHTML =
        "";

    // Crea l'opzione iniziale.
    const firstOption =
        document.createElement("option");

    // Imposta il valore vuoto.
    firstOption.value =
        "";

    // Imposta il testo iniziale.
    firstOption.textContent =
        placeholder;

    // Inserisce l'opzione.
    select.appendChild(
        firstOption
    );

    // Scorre gli elementi.
    items.forEach(
        function (item) {

            // Crea una nuova opzione.
            const option =
                document.createElement("option");

            // Salva l'id.
            option.value =
                item.id;

            // Mostra il testo.
            option.textContent =
                textFunction(item);

            // Inserisce l'opzione.
            select.appendChild(
                option
            );
        }
    );
}


// Carica il form di condivisione.
function loadShareForm() {

    // Recupera le playlist dell'utente.
    const myPlaylists =
        getMyPlaylists();

    // Recupera le comunità dell'utente.
    const myCommunities =
        getMyCommunities();

    // Riempie il menu delle playlist.
    fillSelect(
        playlistSelect,
        myPlaylists,
        "Scegli una playlist",
        function (playlist) {

            // Restituisce il titolo.
            return playlist.title;
        }
    );

    // Riempie il menu delle comunità.
    fillSelect(
        communitySelect,
        myCommunities,
        "Scegli una comunità",
        function (community) {

            // Restituisce il titolo.
            return community.title;
        }
    );

    // Controlla che esistano playlist e comunità.
    if (
        myPlaylists.length === 0 ||
        myCommunities.length === 0
    ) {

        // Mostra il messaggio.
        shareMessage.textContent =
            "Per condividere devi avere almeno una playlist ed essere iscritto a una comunità.";

    } else {

        // Svuota il messaggio.
        shareMessage.textContent =
            "";
    }
}


// Calcola la durata totale.
function calculateTotalDuration(songs) {

    // Somma la durata dei brani.
    return songs.reduce(
        function (total, song) {

            // Aggiunge la durata.
            return (
                total +
                Number(song.duration || 0)
            );
        },
        0
    );
}


// Formatta la durata totale.
function formatTotalDuration(milliseconds) {

    // Converte in minuti.
    const totalMinutes =
        Math.floor(
            milliseconds / 60000
        );

    // Calcola le ore.
    const hours =
        Math.floor(
            totalMinutes / 60
        );

    // Calcola i minuti rimanenti.
    const minutes =
        totalMinutes % 60;

    // Controlla se esiste almeno un'ora.
    if (hours > 0) {

        // Restituisce ore e minuti.
        return `${hours} h ${minutes} min`;
    }

    // Restituisce i minuti.
    return `${minutes} min`;
}


// Controlla se una playlist è già stata importata.
function isPlaylistImported(sharedPlaylist) {

    // Recupera tutte le playlist.
    const playlists =
        getPlaylists();

    // Cerca una playlist già importata.
    return playlists.some(
        function (playlist) {

            // Controlla che appartenga all'utente.
            if (
                String(playlist.ownerId) !==
                String(sharingUser.id)
            ) {

                // Ignora le playlist degli altri utenti.
                return false;
            }

            // Controlla l'id della condivisione.
            const sameImportedFrom =
                playlist.importedFrom !== undefined &&
                playlist.importedFrom !== null &&
                String(playlist.importedFrom) ===
                String(sharedPlaylist.id);

            // Controlla l'id della playlist originale.
            const sameSourcePlaylist =
                playlist.sourcePlaylistId !== undefined &&
                playlist.sourcePlaylistId !== null &&
                sharedPlaylist.sourcePlaylistId !== undefined &&
                sharedPlaylist.sourcePlaylistId !== null &&
                String(playlist.sourcePlaylistId) ===
                String(sharedPlaylist.sourcePlaylistId);

            // Restituisce true se trova una corrispondenza.
            return (
                sameImportedFrom ||
                sameSourcePlaylist
            );
        }
    );
}


// Importa una playlist.
function importPlaylist(sharedPlaylist) {

    // Recupera i dati aggiornati della playlist.
    const updatedSharedPlaylist =
        getUpdatedSharedPlaylist(
            sharedPlaylist
        );

    // Controlla se è già stata importata.
    if (
        isPlaylistImported(
            updatedSharedPlaylist
        )
    ) {

        // Blocca una seconda importazione.
        return false;
    }

    // Recupera tutte le playlist.
    const playlists =
        getPlaylists();

    // Recupera i tag.
    const tags =
        Array.isArray(updatedSharedPlaylist.tags)
            ? updatedSharedPlaylist.tags
            : [];

    // Recupera i brani.
    const songs =
        Array.isArray(updatedSharedPlaylist.songs)
            ? updatedSharedPlaylist.songs
            : [];

    // Crea la playlist importata.
    const importedPlaylist = {

        // Genera un nuovo identificativo.
        id:
            generateId(),

        // Imposta il proprietario.
        ownerId:
            sharingUser.id,

        // Memorizza la condivisione originale.
        importedFrom:
            updatedSharedPlaylist.id,

        // Memorizza la playlist originale.
        sourcePlaylistId:
            updatedSharedPlaylist.sourcePlaylistId ||
            null,

        // Copia il titolo aggiornato.
        title:
            updatedSharedPlaylist.title ||
            "Playlist importata",

        // Copia la descrizione aggiornata.
        description:
            updatedSharedPlaylist.description ||
            "",

        // Copia i tag.
        tags:
            [...tags],

        // Copia i brani aggiornati.
        songs:
            songs.map(
                function (song) {

                    // Crea una copia del brano.
                    return {
                        ...song
                    };
                }
            )
    };

    // Aggiunge la playlist.
    playlists.push(
        importedPlaylist
    );

    // Salva le playlist.
    savePlaylists(
        playlists
    );

    // Comunica il successo.
    return true;
}


// Imposta il pulsante come Importata.
function setImportedButton(button) {

    // Cambia il testo.
    button.textContent =
        "Importata";

    // Disabilita il pulsante.
    button.disabled =
        true;

    // Imposta lo sfondo.
    button.style.background =
        "#3a3a3c";

    // Imposta il colore.
    button.style.color =
        "#a9a9ad";

    // Imposta il cursore.
    button.style.cursor =
        "default";

    // Mantiene l'opacità.
    button.style.opacity =
        "1";
}


// Crea una piccola etichetta.
function createInfoPill(text) {

    // Crea l'elemento.
    const pill =
        document.createElement("span");

    // Inserisce il testo.
    pill.textContent =
        text;

    // Imposta il padding.
    pill.style.padding =
        "6px 12px";

    // Imposta lo sfondo.
    pill.style.background =
        "#29292c";

    // Imposta il bordo.
    pill.style.border =
        "1px solid #3d3d41";

    // Arrotonda l'elemento.
    pill.style.borderRadius =
        "999px";

    // Imposta la dimensione.
    pill.style.fontSize =
        "13px";

    // Impedisce di andare a capo.
    pill.style.whiteSpace =
        "nowrap";

    // Restituisce l'elemento.
    return pill;
}


// Mostra le playlist condivise.
function renderSharedPlaylists(searchText = "") {

    // Recupera le comunità dell'utente.
    const myCommunities =
        getMyCommunities();

    // Recupera gli id delle comunità.
    const communityIds =
        myCommunities.map(
            function (community) {

                // Restituisce l'id.
                return String(
                    community.id
                );
            }
        );

    // Normalizza il testo cercato.
    const text =
        searchText
            .trim()
            .toLowerCase();

    // Recupera tutte le condivisioni.
    const sharedPlaylists =
        getSharedPlaylists();

    // Aggiorna ogni condivisione con i dati della playlist originale.
    const updatedSharedPlaylists =
        sharedPlaylists.map(
            function (sharedPlaylist) {

                // Recupera la versione aggiornata.
                return getUpdatedSharedPlaylist(
                    sharedPlaylist
                );
            }
        );

    // Filtra le playlist visibili.
    const visiblePlaylists =
        updatedSharedPlaylists.filter(
            function (playlist) {

                // Controlla che appartenga a una comunità dell'utente.
                if (
                    !communityIds.includes(
                        String(playlist.communityId)
                    )
                ) {

                    // Nasconde la playlist.
                    return false;
                }

                // Se non esiste una ricerca mostra tutto.
                if (!text) {

                    // Mantiene la playlist.
                    return true;
                }

                // Recupera il titolo.
                const title =
                    playlist.title || "";

                // Recupera la descrizione.
                const description =
                    playlist.description || "";

                // Recupera i tag.
                const tags =
                    Array.isArray(playlist.tags)
                        ? playlist.tags
                        : [];

                // Recupera i brani.
                const songs =
                    Array.isArray(playlist.songs)
                        ? playlist.songs
                        : [];

                // Cerca nel titolo.
                const matchesTitle =
                    title
                        .toLowerCase()
                        .includes(text);

                // Cerca nella descrizione.
                const matchesDescription =
                    description
                        .toLowerCase()
                        .includes(text);

                // Cerca nei tag.
                const matchesTags =
                    tags.some(
                        function (tag) {

                            // Controlla il tag.
                            return String(tag)
                                .toLowerCase()
                                .includes(text);
                        }
                    );

                // Cerca nei brani.
                const matchesSongs =
                    songs.some(
                        function (song) {

                            // Recupera il titolo.
                            const songTitle =
                                song.title || "";

                            // Recupera l'artista.
                            const songArtist =
                                song.artist || "";

                            // Cerca titolo oppure artista.
                            return (
                                songTitle
                                    .toLowerCase()
                                    .includes(text) ||

                                songArtist
                                    .toLowerCase()
                                    .includes(text)
                            );
                        }
                    );

                // Restituisce il risultato.
                return (
                    matchesTitle ||
                    matchesDescription ||
                    matchesTags ||
                    matchesSongs
                );
            }
        );


    // Svuota il contenitore.
    sharedPlaylistList.innerHTML =
        "";

    // Utilizza Flexbox.
    sharedPlaylistList.style.display =
        "flex";

    // Dispone le card verticalmente.
    sharedPlaylistList.style.flexDirection =
        "column";

    // Imposta lo spazio.
    sharedPlaylistList.style.gap =
        "14px";

    // Occupa tutta la larghezza.
    sharedPlaylistList.style.width =
        "100%";


    // Controlla se non ci sono risultati.
    if (
        visiblePlaylists.length === 0
    ) {

        // Crea il messaggio.
        const message =
            document.createElement("p");

        // Assegna la classe.
        message.className =
            "empty-message";

        // Imposta il testo.
        message.textContent =
            "Nessuna playlist condivisa trovata.";

        // Inserisce il messaggio.
        sharedPlaylistList.appendChild(
            message
        );

        // Interrompe.
        return;
    }


    // Recupera le comunità.
    const communities =
        getCommunities();

    // Recupera gli utenti.
    const users =
        getUsers();


    // Scorre le playlist.
    visiblePlaylists.forEach(
        function (playlist) {

            // Cerca la comunità.
            const community =
                communities.find(
                    function (item) {

                        // Confronta gli id.
                        return (
                            String(item.id) ===
                            String(playlist.communityId)
                        );
                    }
                );

            // Cerca l'autore.
            const owner =
                users.find(
                    function (user) {

                        // Confronta gli id.
                        return (
                            String(user.id) ===
                            String(playlist.ownerId)
                        );
                    }
                );

            // Recupera i tag aggiornati.
            const playlistTags =
                Array.isArray(playlist.tags)
                    ? playlist.tags
                    : [];

            // Recupera i brani aggiornati.
            const playlistSongs =
                Array.isArray(playlist.songs)
                    ? playlist.songs
                    : [];


            // Crea la card.
            const card =
                document.createElement(
                    "article"
                );

            // Assegna la classe.
            card.className =
                "shared-card";

            // Utilizza una griglia.
            card.style.display =
                "grid";

            // Imposta tre colonne.
            card.style.gridTemplateColumns =
                "220px minmax(0, 1fr) 170px";

            // Allinea verticalmente.
            card.style.alignItems =
                "center";

            // Imposta lo spazio.
            card.style.columnGap =
                "28px";

            // Imposta il padding.
            card.style.padding =
                "18px 24px";

            // Occupa tutta la larghezza.
            card.style.width =
                "100%";

            // Include il padding.
            card.style.boxSizing =
                "border-box";

            // Imposta lo sfondo.
            card.style.background =
                "#1c1c1e";

            // Imposta il bordo.
            card.style.border =
                "1px solid #353538";

            // Arrotonda la card.
            card.style.borderRadius =
                "16px";

            // Imposta l'altezza minima.
            card.style.minHeight =
                "124px";


            // Crea la colonna sinistra.
            const leftColumn =
                document.createElement("div");

            // Utilizza Flexbox.
            leftColumn.style.display =
                "flex";

            // Dispone verticalmente.
            leftColumn.style.flexDirection =
                "column";

            // Centra verticalmente.
            leftColumn.style.justifyContent =
                "center";

            // Imposta lo spazio.
            leftColumn.style.gap =
                "8px";

            // Impedisce problemi di larghezza.
            leftColumn.style.minWidth =
                "0";


            // Crea il titolo.
            const title =
                document.createElement("h3");

            // Mostra il titolo aggiornato.
            title.textContent =
                playlist.title ||
                "Playlist";

            // Elimina i margini.
            title.style.margin =
                "0";

            // Imposta la dimensione.
            title.style.fontSize =
                "18px";

            // Imposta l'altezza.
            title.style.lineHeight =
                "1.3";


            // Crea la descrizione.
            const description =
                document.createElement("p");

            // Mostra la descrizione aggiornata.
            description.textContent =
                playlist.description ||
                "";

            // Elimina i margini.
            description.style.margin =
                "0";

            // Imposta il colore.
            description.style.color =
                "#dddddf";

            // Imposta la dimensione.
            description.style.fontSize =
                "14px";

            // Imposta l'altezza.
            description.style.lineHeight =
                "1.35";


            // Inserisce titolo e descrizione.
            leftColumn.append(
                title,
                description
            );


            // Crea la colonna centrale.
            const centerColumn =
                document.createElement("div");

            // Utilizza Flexbox.
            centerColumn.style.display =
                "flex";

            // Dispone verticalmente.
            centerColumn.style.flexDirection =
                "column";

            // Centra verticalmente.
            centerColumn.style.justifyContent =
                "center";

            // Imposta lo spazio.
            centerColumn.style.gap =
                "10px";

            // Impedisce problemi di larghezza.
            centerColumn.style.minWidth =
                "0";


            // Crea la riga delle informazioni.
            const informationRow =
                document.createElement("div");

            // Utilizza Flexbox.
            informationRow.style.display =
                "flex";

            // Allinea gli elementi.
            informationRow.style.alignItems =
                "center";

            // Imposta lo spazio.
            informationRow.style.gap =
                "22px";

            // Imposta l'altezza minima.
            informationRow.style.minHeight =
                "20px";


            // Crea l'informazione della comunità.
            const communityInformation =
                document.createElement("span");

            // Mostra la comunità.
            communityInformation.textContent =
                `Comunità: ${
                    community
                        ? community.title
                        : "Non disponibile"
                }`;

            // Imposta il colore.
            communityInformation.style.color =
                "#c0c0c5";

            // Imposta la dimensione.
            communityInformation.style.fontSize =
                "14px";

            // Impedisce di andare a capo.
            communityInformation.style.whiteSpace =
                "nowrap";


            // Crea l'informazione dell'autore.
            const authorInformation =
                document.createElement("span");

            // Mostra l'autore.
            authorInformation.textContent =
                `Autore: ${
                    owner
                        ? owner.username
                        : "Utente"
                }`;

            // Imposta il colore.
            authorInformation.style.color =
                "#c0c0c5";

            // Imposta la dimensione.
            authorInformation.style.fontSize =
                "14px";

            // Impedisce di andare a capo.
            authorInformation.style.whiteSpace =
                "nowrap";


            // Inserisce comunità e autore.
            informationRow.append(
                communityInformation,
                authorInformation
            );


            // Crea la riga dei dettagli.
            const detailsRow =
                document.createElement("div");

            // Utilizza Flexbox.
            detailsRow.style.display =
                "flex";

            // Allinea verticalmente.
            detailsRow.style.alignItems =
                "center";

            // Imposta lo spazio.
            detailsRow.style.gap =
                "10px";

            // Imposta l'altezza.
            detailsRow.style.minHeight =
                "32px";


            // Crea il pill dei tag.
            const tags =
                createInfoPill(
                    playlistTags.length > 0
                        ? `Tag: ${playlistTags.join(", ")}`
                        : "Tag: nessuno"
                );

            // Crea il pill della durata.
            const duration =
                createInfoPill(
                    `Durata totale: ${
                        formatTotalDuration(
                            calculateTotalDuration(
                                playlistSongs
                            )
                        )
                    }`
                );


            // Crea il pill del numero di canzoni.
            const songCount =
                createInfoPill(
                    playlistSongs.length === 1
                        ? "1 canzone"
                        : `${playlistSongs.length} canzoni`
                );


            // Inserisce tag, durata e numero canzoni.
            detailsRow.append(
                tags,
                duration,
                songCount
            );


            // Inserisce le righe nella colonna centrale.
            centerColumn.append(
                informationRow,
                detailsRow
            );


            // Crea la colonna destra.
            const rightColumn =
                document.createElement("div");

            // Utilizza Flexbox.
            rightColumn.style.display =
                "flex";

            // Allinea verticalmente.
            rightColumn.style.alignItems =
                "center";

            // Allinea a destra.
            rightColumn.style.justifyContent =
                "flex-end";

            // Imposta la larghezza.
            rightColumn.style.width =
                "170px";


            // Mostra Importa soltanto per playlist di altri utenti.
            if (
                String(playlist.ownerId) !==
                String(sharingUser.id)
            ) {

                // Crea il pulsante.
                const importButton =
                    document.createElement(
                        "button"
                    );

                // Imposta il tipo.
                importButton.type =
                    "button";

                // Assegna la classe.
                importButton.className =
                    "page-button";

                // Imposta il testo.
                importButton.textContent =
                    "Importa playlist";

                // Imposta la larghezza minima.
                importButton.style.minWidth =
                    "148px";

                // Impedisce di andare a capo.
                importButton.style.whiteSpace =
                    "nowrap";

                // Arrotonda.
                importButton.style.borderRadius =
                    "999px";

                // Imposta il padding.
                importButton.style.padding =
                    "10px 18px";


                // Controlla se è già stata importata.
                if (
                    isPlaylistImported(
                        playlist
                    )
                ) {

                    // Mostra Importata.
                    setImportedButton(
                        importButton
                    );
                }


                // Gestisce il click.
                importButton.addEventListener(
                    "click",
                    function () {

                        // Controlla nuovamente se è già importata.
                        if (
                            isPlaylistImported(
                                playlist
                            )
                        ) {

                            // Imposta il pulsante.
                            setImportedButton(
                                importButton
                            );

                            // Interrompe.
                            return;
                        }

                        // Importa la versione aggiornata.
                        const imported =
                            importPlaylist(
                                playlist
                            );

                        // Controlla il risultato.
                        if (
                            imported === true
                        ) {

                            // Trasforma il pulsante.
                            setImportedButton(
                                importButton
                            );

                            // Aggiorna il form.
                            loadShareForm();
                        }
                    }
                );

                // Inserisce il pulsante.
                rightColumn.appendChild(
                    importButton
                );
            }


            // Inserisce le colonne.
            card.append(
                leftColumn,
                centerColumn,
                rightColumn
            );


            // Gestisce gli schermi piccoli.
            if (
                window.innerWidth < 850
            ) {

                // Dispone verticalmente.
                card.style.gridTemplateColumns =
                    "1fr";

                // Imposta lo spazio.
                card.style.rowGap =
                    "16px";

                // Rimuove la larghezza fissa.
                rightColumn.style.width =
                    "auto";

                // Allinea il pulsante a sinistra.
                rightColumn.style.justifyContent =
                    "flex-start";
            }


            // Inserisce la card.
            sharedPlaylistList.appendChild(
                card
            );
        }
    );
}


// Gestisce la condivisione.
shareForm.addEventListener(
    "submit",
    function (event) {

        // Impedisce il comportamento automatico.
        event.preventDefault();

        // Cerca la playlist selezionata.
        const playlist =
            getMyPlaylists().find(
                function (item) {

                    // Confronta gli id.
                    return (
                        String(item.id) ===
                        String(playlistSelect.value)
                    );
                }
            );

        // Cerca la comunità selezionata.
        const community =
            getMyCommunities().find(
                function (item) {

                    // Confronta gli id.
                    return (
                        String(item.id) ===
                        String(communitySelect.value)
                    );
                }
            );

        // Controlla le selezioni.
        if (
            !playlist ||
            !community
        ) {

            // Mostra il messaggio.
            shareMessage.textContent =
                "Seleziona una playlist e una comunità.";

            // Interrompe.
            return;
        }

        // Recupera le condivisioni.
        const sharedPlaylists =
            getSharedPlaylists();

        // Controlla se è già condivisa.
        const alreadyShared =
            sharedPlaylists.some(
                function (item) {

                    // Confronta playlist e comunità.
                    return (
                        String(item.sourcePlaylistId) ===
                        String(playlist.id) &&

                        String(item.communityId) ===
                        String(community.id)
                    );
                }
            );

        // Blocca i duplicati.
        if (alreadyShared) {

            // Mostra il messaggio.
            shareMessage.textContent =
                "Questa playlist è già condivisa nella comunità selezionata.";

            // Interrompe.
            return;
        }

        // Recupera i tag.
        const playlistTags =
            Array.isArray(playlist.tags)
                ? playlist.tags
                : [];

        // Recupera i brani.
        const playlistSongs =
            Array.isArray(playlist.songs)
                ? playlist.songs
                : [];

        // Crea la condivisione.
        const newSharedPlaylist = {

            // Genera un identificativo.
            id:
                generateId(),

            // Permette di recuperare sempre la playlist originale aggiornata.
            sourcePlaylistId:
                playlist.id,

            // Salva l'autore.
            ownerId:
                sharingUser.id,

            // Salva la comunità.
            communityId:
                community.id,

            // Salva il titolo come copia di sicurezza.
            title:
                playlist.title ||
                "Playlist",

            // Salva la descrizione come copia di sicurezza.
            description:
                playlist.description ||
                "",

            // Salva i tag come copia di sicurezza.
            tags:
                [...playlistTags],

            // Salva i brani come copia di sicurezza.
            songs:
                playlistSongs.map(
                    function (song) {

                        // Restituisce una copia.
                        return {
                            ...song
                        };
                    }
                )
        };

        // Aggiunge la condivisione.
        sharedPlaylists.push(
            newSharedPlaylist
        );

        // Salva le condivisioni.
        saveSharedPlaylists(
            sharedPlaylists
        );

        // Mostra il messaggio.
        shareMessage.textContent =
            "Playlist condivisa correttamente.";

        // Resetta la playlist.
        playlistSelect.value =
            "";

        // Resetta la comunità.
        communitySelect.value =
            "";

        // Aggiorna immediatamente la pagina.
        renderSharedPlaylists(
            sharedSearchInput.value
        );
    }
);


// Gestisce la ricerca.
sharedSearchForm.addEventListener(
    "submit",
    function (event) {

        // Impedisce il comportamento automatico.
        event.preventDefault();

        // Aggiorna i risultati.
        renderSharedPlaylists(
            sharedSearchInput.value
        );
    }
);


// Aggiorna i risultati mentre si scrive.
sharedSearchInput.addEventListener(
    "input",
    function () {

        // Aggiorna i risultati.
        renderSharedPlaylists(
            sharedSearchInput.value
        );
    }
);


// Gestisce il ridimensionamento della finestra.
window.addEventListener(
    "resize",
    function () {

        // Ridisegna le card.
        renderSharedPlaylists(
            sharedSearchInput.value
        );
    }
);


// Aggiorna la pagina quando torna visibile.
document.addEventListener(
    "visibilitychange",
    function () {

        // Controlla che la pagina sia tornata visibile.
        if (
            document.visibilityState ===
            "visible"
        ) {

            // Aggiorna le playlist condivise.
            renderSharedPlaylists(
                sharedSearchInput.value
            );

            // Aggiorna il form.
            loadShareForm();
        }
    }
);


// Carica il form.
loadShareForm();

// Mostra le playlist condivise.
renderSharedPlaylists();

// Configura il logout.
setupLogout();