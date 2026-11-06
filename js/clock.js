let container = document.getElementById("container"),
    content = document.getElementById("content"),
    message = document.getElementById("message"),
    button = document.getElementById("button"),
    button2 = document.getElementById("button2");

/*
 * Check whether a booked appointment is stored in localStorage
 */
const umowionaWizyta = localStorage.getItem('umowiona_wizyta');
if (!umowionaWizyta) {
    /*
     * Hide button 2 when no appointment is booked
     */
    button2.style.display = "none";
}

button.addEventListener("click", function () {
    let input_hour = document.getElementById("select-hour").value;
    let input_minutes = document.getElementById("input-minutes").value;

    localStorage.setItem('umowiona_wizyta', `${input_hour}:${input_minutes}`);

    message.innerHTML = `Chcę się spotkać o <b>${input_hour}:${input_minutes}</b> <br> (uzgodnione z kim trzeba) <br> zapraszam przed tą godziną <br> Dawid Olko:)`;

    /*
     * Show the message container
     */
    content.style.display = "flex"; 
    content.style.justifyContent = "center";
    
    /*
     * Hide the container with the hour and minute selects
     */
    container.style.display = "none";

    /*
     * Show button 2 once the appointment is booked
     */
    button2.style.display = "block";
    setTimeout(function () {
        content.style.display = "none"; 
        container.style.display = "flex"; 
    }, 2000); 
});

button2.addEventListener("click", function () {
    alert(`Przypomnienie umówionej wizyty o godzinie ${umowionaWizyta}`);
});

/*
 * The rest of the code handles the clock and the light/dark theme switch; it is
 * not related to the appointment feature.
 */
const hourElement = document.querySelector(".hour");
const minuteElement = document.querySelector(".minute");
const secondElement = document.querySelector(".second");
const timeElement = document.querySelector(".time");
const dateElement = document.querySelector(".date");
const toggle = document.querySelector(".toggle");

const days = [
    "Niedziela",
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
];
const months = [
    "Sty",
    "Lut",
    "Mar",
    "Kwi",
    "Maj",
    "Cze",
    "Lip",
    "Sie",
    "Wrz",
    "Paz",
    "Lis",
    "Gru",
];

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

const scale = (num, in_min, in_max, out_min, out_max) => {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

const setTime = () => {
    const time = new Date();
    const date = time.getDate();
    const month = time.getMonth();
    const day = time.getDay();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const ampm = "";

    hourElement.style.transform = `translate(-50%, -100%) rotate(${scale(
        hours + minutes / 60, 0, 12, 0, 360
    )}deg)`;
    minuteElement.style.transform = `translate(-50%, -100%) rotate(${scale(
        minutes, 0, 60, 0, 360
    )}deg)`;
    secondElement.style.transform = `translate(-50%, -100%) rotate(${scale(
        seconds, 0, 60, 0, 360
    )}deg)`;

    timeElement.innerHTML = `${hours < 10 ? `0${hours}` : hours}:${
        minutes < 10 ? `0${minutes}` : minutes
    } ${ampm}`;
    dateElement.innerHTML = `${days[day]},  <span class="circle">${date}</span> ${months[month]} `;
};

setTime();

setInterval(setTime, 1000);
