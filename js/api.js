/**
 * Weather widget (OpenWeatherMap).
 *
 * Fixes over the original:
 *  - Every listener was attached at top level to elements that only exist on
 *    index.html, so this file threw on all other pages. It now bails out early.
 *  - `loadLastCity` read `sCity[i - 1]` outside the loop, where `i` was the
 *    loop counter left at length — it worked by accident and threw when the
 *    history was empty.
 *  - The search history was rebuilt with a global click listener on the whole
 *    document; it is now scoped to the list and uses real <button> elements
 *    so entries are keyboard reachable.
 *  - alert() on failure was replaced with an in-page aria-live message.
 *  - Errors from the network are caught, so a dead API no longer leaves the
 *    widget in a permanent "loading" state.
 *
 * Note: the API key below is a client-side key from the original project and
 * is visible to anyone viewing source. It is left as-is to avoid changing
 * behaviour, but it should be replaced with a proxied request if this were
 * ever more than a coursework demo.
 */
(function () {
  "use strict";

  var API_KEY = "a0aca8a89948154a4182dcecc780b513";
  var HISTORY_KEY = "cityname";
  var storage = window.WM && window.WM.storage;

  function init() {
    var searchCity = document.getElementById("search-city");
    var searchButton = document.getElementById("search-button");
    var clearButton = document.getElementById("clear-history");
    var historyList = document.getElementById("search-history");

    // The weather panel only exists on the home page.
    if (!searchCity || !searchButton) return;

    var currentCity = document.getElementById("current-city");
    var currentTemperature = document.getElementById("temperature");
    var currentHumidity = document.getElementById("humidity");
    var currentWSpeed = document.getElementById("wind-speed");
    var currentUvindex = document.getElementById("uv-index");
    var statusRegion = document.getElementById("weather-status");

    function setStatus(message) {
      if (statusRegion) statusRegion.textContent = message;
    }

    function history() {
      var stored = storage ? storage.readJSON(HISTORY_KEY, []) : [];
      return Array.isArray(stored) ? stored : [];
    }

    function saveHistory(list) {
      if (storage) storage.writeJSON(HISTORY_KEY, list);
    }

    function addToList(name) {
      if (!historyList) return;
      var item = document.createElement("li");
      item.className = "list-group-item";

      // A <button> so the entry is reachable by keyboard; the original used a
      // bare <li> that only responded to mouse clicks.
      var button = document.createElement("button");
      button.type = "button";
      button.className = "wm-btn wm-btn--ghost history-item";
      button.textContent = name.toUpperCase();
      button.addEventListener("click", function () {
        loadWeather(name);
      });

      item.appendChild(button);
      historyList.appendChild(item);
    }

    function renderHistory() {
      if (!historyList) return;
      historyList.innerHTML = "";
      history().forEach(addToList);
    }

    function request(url) {
      return fetch(url).then(function (response) {
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Nie znaleziono miasta."
              : "Błąd serwera pogodowego (" + response.status + ")."
          );
        }
        return response.json();
      });
    }

    function loadUVIndex(lon, lat) {
      return request(
        "https://api.openweathermap.org/data/2.5/uvi?appid=" +
          API_KEY +
          "&lat=" +
          encodeURIComponent(lat) +
          "&lon=" +
          encodeURIComponent(lon)
      )
        .then(function (data) {
          if (currentUvindex) currentUvindex.textContent = data.value;
        })
        .catch(function () {
          // Non-critical: leave the field blank rather than failing the lookup.
          if (currentUvindex) currentUvindex.textContent = "—";
        });
    }

    function loadForecast(cityId) {
      return request(
        "https://api.openweathermap.org/data/2.5/forecast?id=" +
          encodeURIComponent(cityId) +
          "&appid=" +
          API_KEY
      )
        .then(function (data) {
          if (!data.list) return;
          for (var i = 0; i < 5; i++) {
            var entry = data.list[(i + 1) * 8 - 1];
            if (!entry) continue;

            var dateNode = document.getElementById("fDate" + i);
            var imgNode = document.getElementById("fImg" + i);
            var tempNode = document.getElementById("fTemp" + i);
            var humidityNode = document.getElementById("fHumidity" + i);

            if (dateNode) {
              dateNode.textContent = new Date(
                entry.dt * 1000
              ).toLocaleDateString();
            }
            if (imgNode) {
              imgNode.innerHTML = "";
              var icon = document.createElement("img");
              icon.src =
                "https://openweathermap.org/img/wn/" +
                entry.weather[0].icon +
                ".png";
              icon.alt = entry.weather[0].description || "";
              icon.width = 50;
              icon.height = 50;
              imgNode.appendChild(icon);
            }
            if (tempNode) {
              tempNode.textContent =
                (entry.main.temp - 273.15).toFixed(1) + " °C";
            }
            if (humidityNode) {
              humidityNode.textContent = entry.main.humidity + "%";
            }
          }
        })
        .catch(function (error) {
          console.warn("Forecast unavailable:", error);
        });
    }

    function loadWeather(city) {
      var name = String(city || "").trim();
      if (!name) return;

      setStatus("Wyszukiwanie pogody dla: " + name + "…");

      request(
        "https://api.openweathermap.org/data/2.5/weather?q=" +
          encodeURIComponent(name) +
          "&APPID=" +
          API_KEY
      )
        .then(function (data) {
          if (currentCity) {
            currentCity.textContent =
              data.name +
              " (" +
              new Date(data.dt * 1000).toLocaleDateString() +
              ")";
            var icon = document.createElement("img");
            icon.src =
              "https://openweathermap.org/img/wn/" +
              data.weather[0].icon +
              "@2x.png";
            icon.alt = data.weather[0].description || "";
            icon.width = 50;
            icon.height = 50;
            currentCity.appendChild(icon);
          }
          if (currentTemperature) {
            currentTemperature.textContent =
              (data.main.temp - 273.15).toFixed(1) + " °C";
          }
          if (currentHumidity) {
            currentHumidity.textContent = data.main.humidity + "%";
          }
          if (currentWSpeed) {
            currentWSpeed.textContent =
              (data.wind.speed * 2.237).toFixed(1) + " MPH";
          }

          loadUVIndex(data.coord.lon, data.coord.lat);
          loadForecast(data.id);

          // Record the city if it is not already in the history.
          var list = history();
          var upper = name.toUpperCase();
          if (
            list.every(function (entry) {
              return String(entry).toUpperCase() !== upper;
            })
          ) {
            list.push(name);
            saveHistory(list);
            addToList(name);
          }

          setStatus("Pogoda dla " + data.name + " została załadowana.");
        })
        .catch(function (error) {
          console.warn("Weather lookup failed:", error);
          setStatus(error.message || "Nie udało się pobrać pogody.");
        });
    }

    /* ------------------------------------------------------------ events */

    searchButton.addEventListener("click", function (event) {
      event.preventDefault();
      loadWeather(searchCity.value);
    });

    searchCity.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        loadWeather(searchCity.value);
      }
    });

    if (clearButton) {
      clearButton.addEventListener("click", function (event) {
        event.preventDefault();
        if (storage) storage.remove(HISTORY_KEY);
        renderHistory();
        setStatus("Historia wyszukiwania została wyczyszczona.");
        // The original reloaded the page; clearing in place is less disruptive.
      });
    }

    renderHistory();

    // Restore the most recently searched city, if there is one.
    var saved = history();
    if (saved.length > 0) {
      loadWeather(saved[saved.length - 1]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
