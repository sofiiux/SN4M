// Recupera l'utente attualmente collegato.
const communityUser = requireLoggedUser();

// Recupera il pulsante per creare una nuova comunità.
const newCommunityButton = document.getElementById(
    "new-community-button"
);

// Recupera la sezione contenente il form.
const communityFormSection = document.getElementById(
    "community-form-section"
);

// Recupera il form della comunità.
const communityForm = document.getElementById(
    "community-form"
);

// Recupera il campo nascosto contenente l'id della comunità.
const communityIdInput = document.getElementById(
    "community-id"
);

// Recupera il campo contenente il nome della comunità.
const communityTitleInput = document.getElementById(
    "community-name"
);

// Recupera il campo della descrizione.
const communityDescriptionInput = document.getElementById(
    "community-description"
);

// Recupera il campo nascosto contenente i tag.
const communityTagsInput = document.getElementById(
    "community-tags"
);

// Recupera il pulsante Annulla.
const cancelCommunityButton = document.getElementById(
    "cancel-community-button"
);

// Recupera il contenitore delle comunità.
const communityList = document.getElementById(
    "community-list"
);

// Recupera il form di ricerca.
const communitySearchForm = document.getElementById(
    "community-search-form"
);

// Recupera il campo di ricerca.
const communitySearchInput = document.getElementById(
    "community-search-input"
);


// Nasconde inizialmente il form.
communityFormSection.style.display = "none";


// Definisce la funzione che nasconde il form.
function hideCommunityForm() {

    // Resetta tutti i campi del form.
    communityForm.reset();

    // Svuota i tag selezionati.
    communityTagsInput.value = "";

    // Recupera il selettore grafico dei generi.
    const genreSelector = document.querySelector(
        '[data-genre-input="community-tags"]'
    );

    // Controlla se il selettore esiste.
    if (genreSelector) {

        // Aggiorna graficamente i pulsanti dei generi.
        syncGenreSelector(
            genreSelector,
            communityTagsInput
        );
    }

    // Svuota l'id della comunità.
    communityIdInput.value = "";

    // Nasconde il form.
    communityFormSection.style.display = "none";
}


// Definisce la funzione che mostra il form.
function showCommunityForm() {

    // Mostra il form.
    communityFormSection.style.display = "block";

    // Porta il cursore nel campo Nome.
    communityTitleInput.focus();
}


// Definisce la funzione che mostra tutte le comunità.
function renderCommunities(searchText = "") {

    // Normalizza il testo cercato.
    const text = searchText
        .trim()
        .toLowerCase();

    // Recupera e filtra le comunità.
    const communities = getCommunities().filter(
        function (community) {

            // Recupera in sicurezza il titolo.
            const title =
                community.title || "";

            // Recupera in sicurezza la descrizione.
            const description =
                community.description || "";

            // Recupera in sicurezza i tag.
            const tags =
                Array.isArray(community.tags)
                    ? community.tags
                    : [];

            // Controlla titolo, descrizione e tag.
            return (
                title
                    .toLowerCase()
                    .includes(text) ||

                description
                    .toLowerCase()
                    .includes(text) ||

                tags.some(function (tag) {

                    // Controlla il singolo tag.
                    return tag
                        .toLowerCase()
                        .includes(text);
                })
            );
        }
    );

    // Svuota l'elenco precedente.
    communityList.innerHTML = "";

    // Controlla se non esistono comunità.
    if (communities.length === 0) {

        // Crea il messaggio.
        const message =
            document.createElement("p");

        // Assegna la classe.
        message.className =
            "empty-message";

        // Imposta il testo.
        message.textContent =
            "Non sono presenti comunità.";

        // Mostra il messaggio.
        communityList.appendChild(
            message
        );

        // Interrompe la funzione.
        return;
    }

    // Scorre tutte le comunità.
    communities.forEach(
        function (community) {

            // Crea la scheda della comunità.
            const card =
                document.createElement("article");

            // Assegna la classe.
            card.className =
                "community-card";

            // Crea il titolo.
            const title =
                document.createElement("h3");

            // Inserisce il titolo.
            title.textContent =
                community.title;

            // Crea la descrizione.
            const description =
                document.createElement("p");

            // Inserisce la descrizione.
            description.textContent =
                community.description;

            // Crea il testo dei tag.
            const tags =
                document.createElement("p");

            // Recupera i tag in sicurezza.
            const communityTags =
                Array.isArray(community.tags)
                    ? community.tags
                    : [];

            // Inserisce i tag.
            tags.textContent =
                `Tag: ${communityTags.join(", ")}`;

            // Crea il testo degli iscritti.
            const members =
                document.createElement("p");

            // Recupera i membri in sicurezza.
            const communityMembers =
                Array.isArray(community.members)
                    ? community.members
                    : [];

            // Mostra il numero degli iscritti.
            members.textContent =
                `Iscritti: ${communityMembers.length}`;

            // Crea il contenitore dei pulsanti.
            const actions =
                document.createElement("div");

            // Assegna la classe.
            actions.className =
                "form-actions";

            // Controlla se l'utente è il proprietario.
            const isOwner =
                String(community.ownerId) ===
                String(communityUser.id);

            // Controlla se l'utente è iscritto.
            const isMember =
                communityMembers.some(
                    function (memberId) {

                        // Confronta gli identificativi.
                        return (
                            String(memberId) ===
                            String(communityUser.id)
                        );
                    }
                );


            // Controlla se l'utente NON è il proprietario.
            if (!isOwner) {

                // Crea il pulsante di iscrizione.
                const membershipButton =
                    document.createElement("button");

                // Imposta il tipo.
                membershipButton.type =
                    "button";

                // Assegna la classe.
                membershipButton.className =
                    "page-button";

                // Imposta il testo in base allo stato.
                membershipButton.textContent =
                    isMember
                        ? "Abbandona"
                        : "Unisciti";

                // Gestisce il click.
                membershipButton.addEventListener(
                    "click",
                    function () {

                        // Aggiorna le comunità.
                        const updatedCommunities =
                            getCommunities().map(
                                function (savedCommunity) {

                                    // Controlla se è la comunità corretta.
                                    if (
                                        String(savedCommunity.id) !==
                                        String(community.id)
                                    ) {

                                        // Lascia invariata la comunità.
                                        return savedCommunity;
                                    }

                                    // Recupera i membri.
                                    const savedMembers =
                                        Array.isArray(
                                            savedCommunity.members
                                        )
                                            ? savedCommunity.members
                                            : [];

                                    // Controlla se l'utente è già iscritto.
                                    const alreadyMember =
                                        savedMembers.some(
                                            function (memberId) {

                                                // Confronta gli id.
                                                return (
                                                    String(memberId) ===
                                                    String(communityUser.id)
                                                );
                                            }
                                        );

                                    // Crea il nuovo elenco membri.
                                    let updatedMembers;

                                    // Se è già membro, lo rimuove.
                                    if (alreadyMember) {

                                        // Filtra l'utente.
                                        updatedMembers =
                                            savedMembers.filter(
                                                function (memberId) {

                                                    // Mantiene gli altri utenti.
                                                    return (
                                                        String(memberId) !==
                                                        String(communityUser.id)
                                                    );
                                                }
                                            );

                                    } else {

                                        // Aggiunge l'utente.
                                        updatedMembers = [
                                            ...savedMembers,
                                            communityUser.id
                                        ];
                                    }

                                    // Restituisce la comunità aggiornata.
                                    return {

                                        // Mantiene i dati precedenti.
                                        ...savedCommunity,

                                        // Aggiorna i membri.
                                        members:
                                            updatedMembers
                                    };
                                }
                            );

                        // Salva le comunità aggiornate.
                        saveCommunities(
                            updatedCommunities
                        );

                        // Aggiorna l'elenco.
                        renderCommunities(
                            communitySearchInput.value
                        );
                    }
                );

                // Inserisce il pulsante.
                actions.appendChild(
                    membershipButton
                );
            }


            // Controlla se l'utente è proprietario.
            if (isOwner) {

                // Crea il pulsante Modifica.
                const editButton =
                    document.createElement("button");

                // Imposta il tipo.
                editButton.type =
                    "button";

                // Assegna le classi.
                editButton.className =
                    "page-button secondary-button";

                // Imposta il testo.
                editButton.textContent =
                    "Modifica";

                // Gestisce il click su Modifica.
                editButton.addEventListener(
                    "click",
                    function () {

                        // Inserisce l'id nel form.
                        communityIdInput.value =
                            community.id;

                        // Inserisce il titolo.
                        communityTitleInput.value =
                            community.title;

                        // Inserisce la descrizione.
                        communityDescriptionInput.value =
                            community.description;

                        // Inserisce i tag.
                        communityTagsInput.value =
                            communityTags.join(", ");

                        // Recupera il selettore dei generi.
                        const genreSelector =
                            document.querySelector(
                                '[data-genre-input="community-tags"]'
                            );

                        // Controlla che esista.
                        if (genreSelector) {

                            // Aggiorna i pulsanti selezionati.
                            syncGenreSelector(
                                genreSelector,
                                communityTagsInput
                            );
                        }

                        // Recupera il titolo del form.
                        const formTitle =
                            document.getElementById(
                                "community-form-title"
                            );

                        // Controlla che esista.
                        if (formTitle) {

                            // Mostra il titolo di modifica.
                            formTitle.textContent =
                                "Modifica comunità";
                        }

                        // Mostra il form.
                        showCommunityForm();
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

                // Imposta il testo.
                deleteButton.textContent =
                    "Elimina";

                // Gestisce il click sul pulsante Elimina.
                deleteButton.addEventListener(
                    "click",
                    function () {

                        // Recupera tutte le comunità tranne quella selezionata.
                        const updatedCommunities =
                            getCommunities().filter(
                                function (savedCommunity) {

                                    // Mantiene tutte le altre comunità.
                                    return (
                                        String(savedCommunity.id) !==
                                        String(community.id)
                                    );
                                }
                            );

                        // Salva il nuovo elenco delle comunità.
                        saveCommunities(
                            updatedCommunities
                        );

                        // Recupera le playlist condivise.
                        const updatedSharedPlaylists =
                            readStorage(
                                "sharedPlaylists",
                                []
                            ).filter(
                                function (sharedPlaylist) {

                                    // Elimina anche le condivisioni collegate alla comunità.
                                    return (
                                        String(
                                            sharedPlaylist.communityId
                                        ) !==
                                        String(community.id)
                                    );
                                }
                            );

                        // Salva le playlist condivise aggiornate.
                        writeStorage(
                            "sharedPlaylists",
                            updatedSharedPlaylists
                        );

                        // Aggiorna immediatamente l'elenco delle comunità.
                        renderCommunities(
                            communitySearchInput.value
                        );
                    }
                );

                // Inserisce i pulsanti.
                actions.append(
                    editButton,
                    deleteButton
                );
            }

            // Inserisce tutti gli elementi nella card.
            card.append(
                title,
                description,
                tags,
                members,
                actions
            );

            // Inserisce la card nella pagina.
            communityList.appendChild(
                card
            );
        }
    );
}


// Gestisce il pulsante Nuova comunità.
newCommunityButton.addEventListener(
    "click",
    function () {

        // Resetta il form.
        hideCommunityForm();

        // Recupera il titolo del form.
        const formTitle =
            document.getElementById(
                "community-form-title"
            );

        // Controlla che esista.
        if (formTitle) {

            // Imposta il titolo corretto.
            formTitle.textContent =
                "Nuova comunità";
        }

        // Mostra il form.
        showCommunityForm();
    }
);


// Gestisce il pulsante Annulla.
cancelCommunityButton.addEventListener(
    "click",
    hideCommunityForm
);


// Gestisce il salvataggio della comunità.
communityForm.addEventListener(
    "submit",
    function (event) {

        // Impedisce il comportamento automatico del form.
        event.preventDefault();

        // Recupera il titolo.
        const title =
            communityTitleInput.value.trim();

        // Recupera la descrizione.
        const description =
            communityDescriptionInput.value.trim();

        // Recupera i tag.
        const tags =
            communityTagsInput.value
                .split(",")
                .map(function (tag) {

                    // Rimuove gli spazi.
                    return tag.trim();
                })
                .filter(Boolean);

        // Controlla che il nome sia presente.
        if (!title) {

            // Mostra un messaggio solo perché manca un campo obbligatorio.
            alert(
                "Inserisci il nome della comunità."
            );

            // Interrompe la funzione.
            return;
        }

        // Controlla che la descrizione sia presente.
        if (!description) {

            // Mostra un messaggio solo perché manca un campo obbligatorio.
            alert(
                "Inserisci una descrizione."
            );

            // Interrompe la funzione.
            return;
        }

        // Controlla che sia stato selezionato almeno un tag.
        if (tags.length === 0) {

            // Mostra un messaggio solo perché manca un campo obbligatorio.
            alert(
                "Seleziona almeno un tag."
            );

            // Interrompe la funzione.
            return;
        }

        // Recupera tutte le comunità.
        const communities =
            getCommunities();

        // Recupera l'id della comunità.
        const communityId =
            communityIdInput.value;

        // Controlla se stiamo modificando una comunità.
        if (communityId) {

            // Aggiorna la comunità esistente.
            const updatedCommunities =
                communities.map(
                    function (community) {

                        // Controlla se è la comunità da modificare.
                        if (
                            String(community.id) ===
                            String(communityId)
                        ) {

                            // Restituisce la comunità aggiornata.
                            return {

                                // Mantiene i dati esistenti.
                                ...community,

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

                        // Restituisce le altre comunità.
                        return community;
                    }
                );

            // Salva le comunità aggiornate.
            saveCommunities(
                updatedCommunities
            );

        } else {

            // Crea una nuova comunità.
            const newCommunity = {

                // Genera l'id.
                id:
                    generateId(),

                // Salva il proprietario.
                ownerId:
                    communityUser.id,

                // Salva il titolo.
                title:
                    title,

                // Salva la descrizione.
                description:
                    description,

                // Salva i tag.
                tags:
                    tags,

                // Il creatore è automaticamente il primo membro.
                members: [
                    communityUser.id
                ],

                // Crea l'elenco vuoto delle playlist condivise.
                sharedPlaylists:
                    []
            };

            // Aggiunge la nuova comunità.
            communities.push(
                newCommunity
            );

            // Salva le comunità.
            saveCommunities(
                communities
            );
        }

        // Nasconde e resetta il form.
        hideCommunityForm();

        // Aggiorna l'elenco delle comunità.
        renderCommunities();
    }
);


// Gestisce la ricerca tramite il form.
communitySearchForm.addEventListener(
    "submit",
    function (event) {

        // Impedisce il comportamento automatico.
        event.preventDefault();

        // Mostra le comunità filtrate.
        renderCommunities(
            communitySearchInput.value
        );
    }
);


// Aggiorna la ricerca mentre si scrive.
communitySearchInput.addEventListener(
    "input",
    function () {

        // Mostra le comunità filtrate.
        renderCommunities(
            communitySearchInput.value
        );
    }
);


// Mostra le comunità al caricamento della pagina.
renderCommunities();

// Ricarica l'elenco ogni volta che la pagina torna attiva.
// In questo modo, dopo un logout/login con un altro profilo,
// vengono sempre riletti i dati globali aggiornati dal localStorage.
window.addEventListener("pageshow", function () {
    renderCommunities(communitySearchInput.value);
});

// Aggiorna l'elenco anche quando la finestra torna in primo piano.
window.addEventListener("focus", function () {
    renderCommunities(communitySearchInput.value);
});

// Se il localStorage cambia da un'altra scheda/finestra,
// aggiorna immediatamente le comunità visualizzate.
window.addEventListener("storage", function (event) {
    if (event.key === "communities") {
        renderCommunities(communitySearchInput.value);
    }
});

// Configura il logout.
setupLogout();