// Crea la costante registrationForm.
const registrationForm = document.getElementById("registration-form");

// Controlla se il form di registrazione esiste.
if (registrationForm) {

    // Collega una funzione all'invio del form.
    registrationForm.addEventListener("submit", function (event) {

        // Impedisce il comportamento automatico del form.
        event.preventDefault();

        // Crea la costante username.
        const username = document.getElementById("username").value.trim();

        // Crea la costante email.
        const email = document.getElementById("email").value.trim();

        // Crea la costante password.
        const password = document.getElementById("password").value;

        // Crea la costante musicalPreferences.
        const musicalPreferences = document
            // Recupera il campo delle preferenze musicali.
            .getElementById("musical-preferences")
            // Recupera il valore.
            .value.trim();

        // Crea la costante favoriteArtists.
        const favoriteArtists = document
            // Recupera il campo degli artisti preferiti.
            .getElementById("favorite-artists")
            // Recupera il valore.
            .value.trim();

        // Crea la costante message.
        const message = document.getElementById("registration-message");

        // Crea la costante users.
        const users = getUsers();

        // Crea la costante emailAlreadyUsed.
        const emailAlreadyUsed = users.some(function (user) {

            // Restituisce true se l'email è già utilizzata.
            return user.email.toLowerCase() === email.toLowerCase();
        });

        // Controlla se l'email è già utilizzata.
        if (emailAlreadyUsed) {

            // Mostra un messaggio di errore.
            message.textContent = "Esiste già un account con questa email.";

            // Imposta il colore rosso del messaggio.
            message.style.color = "#ff6b6b";

            // Interrompe la funzione.
            return;
        }

        // Crea la costante newUser.
        const newUser = {

            // Crea l'identificativo dell'utente.
            id: Date.now(),

            // Salva il nome utente.
            username: username,

            // Salva l'email.
            email: email,

            // Salva la password.
            password: password,

            // Salva le preferenze musicali.
            musicalPreferences: musicalPreferences,

            // Salva gli artisti preferiti.
            favoriteArtists: favoriteArtists
        };

        // Aggiunge il nuovo utente all'elenco degli utenti.
        users.push(newUser);

        // Salva l'elenco aggiornato degli utenti.
        saveUsers(users);

        // Salva subito il nuovo utente come utente autenticato.
        saveLoggedUser(newUser);

        // Mostra un messaggio di conferma.
        message.textContent = "Registrazione completata!";

        // Imposta il colore verde del messaggio.
        message.style.color = "#1ed760";

        // Avvia un breve ritardo prima di entrare nell'app.
        setTimeout(function () {

            // Porta direttamente l'utente nella pagina Playlist.
            window.location.href = "playlist.html";

        // Imposta il ritardo a mezzo secondo.
        }, 500);
    });
}

// Crea la costante loginForm.
const loginForm = document.getElementById("login-form");

// Controlla se il form di login esiste.
if (loginForm) {

    // Collega una funzione all'invio del form.
    loginForm.addEventListener("submit", function (event) {

        // Impedisce il comportamento automatico del form.
        event.preventDefault();

        // Crea la costante email.
        const email = document.getElementById("email").value.trim();

        // Crea la costante password.
        const password = document.getElementById("password").value;

        // Crea la costante errorMessage.
        const errorMessage = document.getElementById("messaggio-errore");

        // Crea la costante users.
        const users = getUsers();

        // Crea la costante foundUser.
        const foundUser = users.find(function (user) {

            // Restituisce true se email e password corrispondono.
            return (
                // Confronta le email senza distinguere maiuscole e minuscole.
                user.email.toLowerCase() === email.toLowerCase() &&

                // Confronta la password.
                user.password === password
            );
        });

        // Controlla se non è stato trovato nessun utente.
        if (!foundUser) {

            // Mostra il messaggio di errore.
            errorMessage.textContent = "Email o password non corretti.";

            // Interrompe la funzione.
            return;
        }

        // Salva l'utente autenticato.
        saveLoggedUser(foundUser);

        // Porta l'utente direttamente nella pagina Playlist.
        window.location.href = "playlist.html";
    });
}