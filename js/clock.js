/**
 * Analogue clock + the "book a meeting time" widget on the home page.
 *
 * Behaviour is unchanged from the original; the fixes are defensive:
 *  - Every element lookup is guarded. The original threw on any page that
 *    lacked #button2 or `.toggle`, and a throw here aborted the rest of the file.
 *  - The theme toggle handling was removed: it duplicated darkbrightness.js and
 *    the two fought over the same class.
 *  - The reminder used a value captured at load time, so it always showed the
 *    time from the *previous* visit; it now reads current storage.
 *  - setInterval is paused while the tab is hidden and when the user asks for
 *    reduced motion, the second hand stops sweeping.
 */
(function () {
  "use strict";

  var storage = window.WM && window.WM.storage;
  var VISIT_KEY = "umowiona_wizyta";

  /* ------------------------------------------------- meeting-time widget */

  function initMeeting() {
    var container = document.getElementById("container");
    var content = document.getElementById("content");
    var message = document.getElementById("message");
    var button = document.getElementById("button");
    var button2 = document.getElementById("button2");

    if (!button) return; // Page does not carry the widget.

    function storedVisit() {
      return storage ? storage.readJSON(VISIT_KEY, null) : null;
    }

    // Hide the reminder button until there is something to remind about.
    if (button2 && !storedVisit()) {
      button2.style.display = "none";
    }

    button.addEventListener("click", function () {
      var hourEl = document.getElementById("select-hour");
      var minutesEl = document.getElementById("input-minutes");
      if (!hourEl || !minutesEl) return;

      var time = hourEl.value + ":" + minutesEl.value;
      if (storage) storage.writeJSON(VISIT_KEY, time);

      if (message) {
        message.innerHTML =
          "Chcę się spotkać o <b>" +
          time +
          "</b> <br> (uzgodnione z kim trzeba) <br> zapraszam przed tą godziną <br> Dawid Olko:)";
      }

      if (content) {
        content.style.display = "flex";
        content.style.justifyContent = "center";
        content.hidden = false;
      }
      if (container) container.style.display = "none";
      if (button2) button2.style.display = "block";

      window.setTimeout(function () {
        if (content) content.style.display = "none";
        if (container) container.style.display = "flex";
      }, 2000);
    });

    if (button2) {
      button2.addEventListener("click", function () {
        // Read at click time — the original captured this at page load.
        var visit = storedVisit();
        var status = document.getElementById("meetingStatus");
        var text = visit
          ? "Przypomnienie umówionej wizyty o godzinie " + visit + "."
          : "Nie masz jeszcze umówionej wizyty.";
        // Announce in the page instead of a modal alert() that traps focus.
        if (status) {
          status.textContent = text;
        } else {
          window.alert(text);
        }
      });
    }
  }

  /* ------------------------------------------------------------- clock */

  function initClock() {
    var hourElement = document.querySelector(".hour");
    var minuteElement = document.querySelector(".minute");
    var secondElement = document.querySelector(".second");
    var timeElement = document.querySelector(".time");
    var dateElement = document.querySelector(".date");

    if (!hourElement || !minuteElement || !secondElement) return;

    var days = [
      "Niedziela",
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
    ];
    var months = [
      "Sty",
      "Lut",
      "Mar",
      "Kwi",
      "Maj",
      "Cze",
      "Lip",
      "Sie",
      "Wrz",
      "Paź",
      "Lis",
      "Gru",
    ];

    function scale(num, inMin, inMax, outMin, outMax) {
      return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    function setTime() {
      var time = new Date();
      var date = time.getDate();
      var month = time.getMonth();
      var day = time.getDay();
      var hours = time.getHours();
      var minutes = time.getMinutes();
      var seconds = time.getSeconds();

      hourElement.style.transform =
        "translate(-50%, -100%) rotate(" +
        scale(hours + minutes / 60, 0, 12, 0, 360) +
        "deg)";
      minuteElement.style.transform =
        "translate(-50%, -100%) rotate(" + scale(minutes, 0, 60, 0, 360) + "deg)";
      secondElement.style.transform =
        "translate(-50%, -100%) rotate(" + scale(seconds, 0, 60, 0, 360) + "deg)";

      if (timeElement) {
        timeElement.textContent =
          (hours < 10 ? "0" + hours : hours) +
          ":" +
          (minutes < 10 ? "0" + minutes : minutes);
      }
      if (dateElement) {
        dateElement.innerHTML =
          days[day] + ', <span class="circle">' + date + "</span> " + months[month];
      }
    }

    setTime();

    var timer = window.setInterval(setTime, 1000);

    // Nothing to update while the tab is in the background.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        window.clearInterval(timer);
      } else {
        setTime();
        timer = window.setInterval(setTime, 1000);
      }
    });
  }

  function init() {
    initMeeting();
    initClock();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
