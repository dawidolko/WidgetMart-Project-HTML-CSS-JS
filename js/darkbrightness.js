/**
 * Light/dark theme toggle.
 *
 * The original version dereferenced #container, #content, #button and #button2
 * at load time on every page, then called addEventListener on `.toggle`
 * unconditionally — on any page missing one of those the script threw and
 * stopped, taking the theme toggle with it.
 *
 * This version touches only the toggle, guards its existence, remembers the
 * choice, and keeps the button's accessible state in sync.
 */
(function () {
  "use strict";

  var THEME_KEY = "wm-theme";
  var storage = window.WM && window.WM.storage;

  function apply(theme) {
    var html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
    }

    var toggles = document.querySelectorAll(".toggle");
    Array.prototype.forEach.call(toggles, function (button) {
      var isDark = theme === "dark";
      // Label names the action, aria-pressed reports the current state.
      button.textContent = isDark ? "Bright mode" : "Dark mode";
      button.setAttribute("aria-pressed", isDark ? "true" : "false");
      button.setAttribute(
        "aria-label",
        isDark ? "Przełącz na tryb jasny" : "Przełącz na tryb ciemny"
      );
    });
  }

  function currentTheme() {
    var saved = storage ? storage.readJSON(THEME_KEY, null) : null;
    if (saved === "dark" || saved === "light") return saved;
    // No stored choice: follow the operating system.
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function init() {
    apply(currentTheme());

    var toggles = document.querySelectorAll(".toggle");
    Array.prototype.forEach.call(toggles, function (button) {
      button.addEventListener("click", function () {
        var next = document.documentElement.classList.contains("dark")
          ? "light"
          : "dark";
        apply(next);
        if (storage) storage.writeJSON(THEME_KEY, next);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
