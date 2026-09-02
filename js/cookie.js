// Funkcja do ukrywania komunikatu o cookie
const hideCookieBanner = () => {
    const cookieContainer = document.querySelector('.cookie');
    cookieContainer.style.display = 'none';
};

// Sprawdź, czy użytkownik już zaakceptował pliki cookie
const cookieAccepted = localStorage.getItem('cookieAccepted');
if (cookieAccepted) {
    hideCookieBanner();
}

// Dodaj obsługę zdarzenia kliknięcia do przycisku "Akceptuj"
document.addEventListener('DOMContentLoaded', (event) => {
    const acceptButton = document.querySelector('.cookie__btn');
    acceptButton.addEventListener('click', () => {
        localStorage.setItem('cookieAccepted', 'true');
        hideCookieBanner();
    });
});

// Dodaj obsługę zapisu danych z formularza do localStorage
document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById("button");
    button.addEventListener("click", function () {
        // Pobranie wartości z pól wyboru godziny i minut
        let input_hour = document.getElementById("select-hour").value;
        let input_minutes = document.getElementById("input-minutes").value;

        // Zapis informacji do localStorage
        localStorage.setItem('umowiona_wizyta', `${input_hour}:${input_minutes}`);
    });
});
