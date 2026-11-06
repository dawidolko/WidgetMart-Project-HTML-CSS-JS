const hideCookieBanner = () => {
    const cookieContainer = document.querySelector('.cookie');
    cookieContainer.style.display = 'none';
};

const cookieAccepted = localStorage.getItem('cookieAccepted');
if (cookieAccepted) {
    hideCookieBanner();
}

document.addEventListener('DOMContentLoaded', (event) => {
    const acceptButton = document.querySelector('.cookie__btn');
    acceptButton.addEventListener('click', () => {
        localStorage.setItem('cookieAccepted', 'true');
        hideCookieBanner();
    });
});

/*
 * Save the form data to localStorage
 */
document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById("button");
    button.addEventListener("click", function () {
        let input_hour = document.getElementById("select-hour").value;
        let input_minutes = document.getElementById("input-minutes").value;

        localStorage.setItem('umowiona_wizyta', `${input_hour}:${input_minutes}`);
    });
});
