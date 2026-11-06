/*
 * Stores the searched city
 */
var city = "";
var searchCity = document.getElementById("search-city");
var searchButton = document.getElementById("search-button");
var clearButton = document.getElementById("clear-history");
var currentCity = document.getElementById("current-city");
var currentTemperature = document.getElementById("temperature");
var currentHumidity = document.getElementById("humidity");
var currentWSpeed = document.getElementById("wind-speed");
var currentUvindex = document.getElementById("uv-index");
var sCity = [];

/*
 * Checks whether the city is in the history
 */
function find(c) {
  for (var i = 0; i < sCity.length; i++) {
    if (c.toUpperCase() === sCity[i]) {
      return -1;
    }
  }
  return 1;
}

var APIKey = "a0aca8a89948154a4182dcecc780b513";

/*
 * Shows the current and future weather after a city is entered
 */
function displayWeather(event) {
  event.preventDefault();
  if (searchCity.value.trim() !== "") {
    city = searchCity.value.trim();
    currentWeather(city);
  }
}

/*
 * Calls the weather API
 */
function currentWeather(city) {
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&APPID=" +
    APIKey;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", queryURL, true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);

      var weatherIcon = response.weather[0].icon;
      var iconURL = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";

      var date = new Date(response.dt * 1000).toLocaleDateString();

      currentCity.innerHTML = response.name + " (" + date + ") " + "<img src=" + iconURL + ">";
      var tempF = (response.main.temp - 273.15);
      currentTemperature.innerHTML = tempF.toFixed(2) + "&#8451";
      currentHumidity.innerHTML = response.main.humidity + "%";
      var ws = response.wind.speed;
      var windSmph = (ws * 2.237).toFixed(1);
      currentWSpeed.innerHTML = windSmph + "MPH";
      UVIndex(response.coord.lon, response.coord.lat);
      forecast(response.id);

      /*
       * Save the city to the history
       */
      sCity = JSON.parse(localStorage.getItem("cityname")) || [];
      if (find(city) > 0) {
        sCity.push(city.toUpperCase());
        localStorage.setItem("cityname", JSON.stringify(sCity));
        addToList(city);
      }
    } else if (xhr.status === 404) {
      /*
       * City not found
       */
      alert("Błąd: Nie znaleziono miasta. Spróbuj ponownie.");
    } else {
      /*
       * Other errors
       */
      console.log("Błąd: " + xhr.status);
      alert("Wystąpił błąd podczas wyszukiwania miasta. Sprawdź połączenie internetowe lub spróbuj ponownie później.");
    }
  };
  xhr.onerror = function () {
    /*
     * Network error
     */
    alert("Błąd sieci: Nie można nawiązać połączenia z serwerem.");
  };
  xhr.send();
}

/*
 * Fetches the UV index
 */
function UVIndex(ln, lt) {
  var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", uvqURL, true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      currentUvindex.innerHTML = response.value;
    } else {
      console.log("Błąd: " + xhr.status);
    }
  };
  xhr.send();
}

/*
 * Shows the 5-day forecast
 */
function forecast(cityid) {
  var dayover = false;
  var queryForcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", queryForcastURL, true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);

      for (var i = 0; i < 5; i++) {
        var date = new Date(response.list[((i + 1) * 8) - 1].dt * 1000).toLocaleDateString();
        var iconCode = response.list[((i + 1) * 8) - 1].weather[0].icon;
        var iconURL = "https://openweathermap.org/img/wn/" + iconCode + ".png";
        var tempK = response.list[((i + 1) * 8) - 1].main.temp;
        var tempF = ((tempK - 273.5)).toFixed(2);
        var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

        document.getElementById("fDate" + i).innerHTML = date;
        document.getElementById("fImg" + i).innerHTML = "<img src=" + iconURL + ">";
        document.getElementById("fTemp" + i).innerHTML = tempF + "&#8451";
        document.getElementById("fHumidity" + i).innerHTML = humidity + "%";
      }
    } else {
      console.log("Błąd: " + xhr.status);
    }
  };
  xhr.send();
}

function addToList(c) {
  var listEl = document.createElement("li");
  listEl.textContent = c.toUpperCase();
  listEl.className = "list-group-item";
  listEl.dataset.value = c.toUpperCase();
  document.querySelector(".list-group").appendChild(listEl);
}

/*
 * Re-runs an earlier search when a history item is clicked
 */
function invokePastSearch(event) {
  var liEl = event.target;
  if (liEl.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

/*
 * Loads the last city from the history
 */
function loadLastCity() {
  document.querySelector("ul").innerHTML = "";
  var sCity = JSON.parse(localStorage.getItem("cityname"));
  if (sCity !== null) {
    for (var i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    city = sCity[i - 1];
    currentWeather(city);
  }
}

function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  location.reload();
}

/*
 * Handle keydown on the city input
 */
searchCity.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    displayWeather(event);
  }
});

/*
 * Updated displayWeather that also handles the Enter key
 */
function displayWeather(event) {
  if (event) {
    event.preventDefault();
  }
  if (searchCity.value.trim() !== "") {
    city = searchCity.value.trim();
    currentWeather(city);
  }
}

/*
 * Event handlers
 */
searchButton.addEventListener("click", displayWeather);
document.addEventListener("click", invokePastSearch);
window.addEventListener("load", loadLastCity);
clearButton.addEventListener("click", clearHistory);
