// Pobranie referencji do elementów HTML
let container = document.getElementById("container"),
    content = document.getElementById("content"),
    message = document.getElementById("message"),
    button = document.getElementById("button"),
    button2 = document.getElementById("button2");

// Reszta kodu obsługuje zegar i zmianę motywu jasnego/ciemnego, ale nie jest związana z funkcją obsługi spotkania.
const toggle = document.querySelector(".toggle");


toggle.addEventListener("click", (e) => {
    const html = document.querySelector("html");
    if (html.classList.contains("dark")) {
        html.classList.remove("dark");
        e.target.innerHTML = "Dark mode";
    } else {
        html.classList.add("dark");
        e.target.innerHTML = "Bright mode";
    }
});
