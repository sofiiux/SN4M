// Crea la costante currentUser.
const currentUser = requireLoggedUser();
// Crea la costante profileForm.
const profileForm = document.getElementById("profile-form");
// Crea la costante usernameInput.
const usernameInput = document.getElementById("username");
// Crea la costante emailInput.
const emailInput = document.getElementById("email");
// Crea la costante passwordInput.
const passwordInput = document.getElementById("password");
// Crea la costante preferencesInput.
const preferencesInput = document.getElementById("musical-preferences");
// Crea la costante artistsInput.
const artistsInput = document.getElementById("favorite-artists");
// Crea la costante profileMessage.
const profileMessage = document.getElementById("profile-message");
// Crea la costante deleteAccountButton.
const deleteAccountButton = document.getElementById(
    // Continua il valore testuale dell’istruzione precedente.
    "delete-account-button"
// Chiude o completa il blocco di codice precedente.
);
// Controlla se questa condizione è vera.
if (currentUser) {
    // Esegue questa parte dell’istruzione JavaScript.
    usernameInput.value = currentUser.username;
    // Esegue questa parte dell’istruzione JavaScript.
    emailInput.value = currentUser.email;
    // Esegue questa parte dell’istruzione JavaScript.
    passwordInput.value = "";
    // Esegue questa parte dell’istruzione JavaScript.
    preferencesInput.value = currentUser.musicalPreferences || "";
    // Aggiorna i pulsanti delle preferenze musicali.
    syncGenreSelector(document.querySelector('[data-genre-input="musical-preferences"]'), preferencesInput);
    // Esegue questa parte dell’istruzione JavaScript.
    artistsInput.value = currentUser.favoriteArtists || "";
// Chiude o completa il blocco di codice precedente.
}
// Collega una funzione a un evento dell’utente.
profileForm.addEventListener("submit", function (event) {
    // Impedisce il comportamento automatico del form.
    event.preventDefault();
    // Crea la costante users.
    const users = getUsers();
    // Crea la costante emailAlreadyUsed.
    const emailAlreadyUsed = users.some(function (user) {
        // Restituisce questo valore e termina la funzione.
        return (
            // Esegue questa parte dell’istruzione JavaScript.
            user.id !== currentUser.id &&
            // Esegue questa parte dell’istruzione JavaScript.
            user.email.toLowerCase() ===
                // Esegue questa parte dell’istruzione JavaScript.
                emailInput.value.trim().toLowerCase()
        // Chiude o completa il blocco di codice precedente.
        );
    // Chiude o completa il blocco di codice precedente.
    });
    // Controlla se questa condizione è vera.
    if (emailAlreadyUsed) {
        // Imposta il testo mostrato nell’elemento HTML.
        profileMessage.textContent =
            // Continua il valore testuale dell’istruzione precedente.
            "Questa email è già utilizzata da un altro account.";
        // Esegue questa parte dell’istruzione JavaScript.
        profileMessage.style.color = "#ff5f5f";
        // Interrompe la funzione in questo punto.
        return;
    // Chiude o completa il blocco di codice precedente.
    }
    // Crea la costante updatedUser.
    const updatedUser = {
        // Copia gli elementi già presenti nell’oggetto o nell’array.
        ...currentUser,
        // Esegue questa parte dell’istruzione JavaScript.
        username: usernameInput.value.trim(),
        // Esegue questa parte dell’istruzione JavaScript.
        email: emailInput.value.trim(),
        // Esegue questa parte dell’istruzione JavaScript.
        password: passwordInput.value.trim() || currentUser.password,
        // Esegue questa parte dell’istruzione JavaScript.
        musicalPreferences: preferencesInput.value.trim(),
        // Esegue questa parte dell’istruzione JavaScript.
        favoriteArtists: artistsInput.value.trim()
    // Chiude o completa il blocco di codice precedente.
    };
    // Crea la costante updatedUsers.
    const updatedUsers = users.map(function (user) {
        // Controlla se questa condizione è vera.
        if (user.id === currentUser.id) {
            // Restituisce questo valore e termina la funzione.
            return updatedUser;
        // Chiude o completa il blocco di codice precedente.
        }
        // Restituisce questo valore e termina la funzione.
        return user;
    // Chiude o completa il blocco di codice precedente.
    });
    // Esegue questa parte dell’istruzione JavaScript.
    saveUsers(updatedUsers);
    // Esegue questa parte dell’istruzione JavaScript.
    saveLoggedUser(updatedUser);
    // Aggiorna anche l'oggetto usato dalla pagina corrente.
    Object.assign(currentUser, updatedUser);
    // Svuota il campo password dopo il salvataggio.
    passwordInput.value = "";
    // Aggiorna subito i dati mostrati nel menu del profilo.
    setupProfileMenu();
    // Imposta il testo mostrato nell’elemento HTML.
    profileMessage.textContent = "Profilo modificato correttamente.";
    // Esegue questa parte dell’istruzione JavaScript.
    profileMessage.style.color = "#1ed760";
// Chiude o completa il blocco di codice precedente.
});
// Collega una funzione a un evento dell’utente.
deleteAccountButton.addEventListener("click", function () {
    // Crea la costante confirmed.
    const confirmed = confirm(
        // Continua il valore testuale dell’istruzione precedente.
        "Vuoi davvero eliminare definitivamente il tuo account?"
    // Chiude o completa il blocco di codice precedente.
    );
    // Controlla se questa condizione è vera.
    if (!confirmed) {
        // Interrompe la funzione in questo punto.
        return;
    // Chiude o completa il blocco di codice precedente.
    }
    // Crea la costante updatedUsers.
    const updatedUsers = getUsers().filter(function (user) {
        // Restituisce questo valore e termina la funzione.
        return user.id !== currentUser.id;
    // Chiude o completa il blocco di codice precedente.
    });
    // Crea la costante updatedPlaylists.
    const updatedPlaylists = getPlaylists().filter(function (playlist) {
        // Restituisce questo valore e termina la funzione.
        return playlist.ownerId !== currentUser.id;
    // Chiude o completa il blocco di codice precedente.
    });
    // Crea la costante updatedCommunities.
    const updatedCommunities = getCommunities()
        // Crea un nuovo array mantenendo solo gli elementi che rispettano la condizione.
        .filter(function (community) {
            // Restituisce questo valore e termina la funzione.
            return community.ownerId !== currentUser.id;
        // Esegue questa parte dell’istruzione JavaScript.
        })
        // Crea un nuovo array trasformando gli elementi esistenti.
        .map(function (community) {
            // Restituisce questo valore e termina la funzione.
            return {
                // Copia gli elementi già presenti nell’oggetto o nell’array.
                ...community,
                // Crea un nuovo array mantenendo solo gli elementi che rispettano la condizione.
                members: community.members.filter(function (memberId) {
                    // Restituisce questo valore e termina la funzione.
                    return memberId !== currentUser.id;
                // Esegue questa parte dell’istruzione JavaScript.
                })
            // Chiude o completa il blocco di codice precedente.
            };
        // Chiude o completa il blocco di codice precedente.
        });
    // Esegue questa parte dell’istruzione JavaScript.
    saveUsers(updatedUsers);
    // Esegue questa parte dell’istruzione JavaScript.
    savePlaylists(updatedPlaylists);
    // Esegue questa parte dell’istruzione JavaScript.
    saveCommunities(updatedCommunities);
    // Esegue questa parte dell’istruzione JavaScript.
    removeLoggedUser();
    // Cambia la pagina visualizzata dal browser.
    window.location.href = "index.html";
// Chiude o completa il blocco di codice precedente.
});
// Esegue questa parte dell’istruzione JavaScript.
setupLogout();
