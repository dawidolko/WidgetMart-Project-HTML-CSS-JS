/**
 * Cookie consent banner.
 *
 * Fixes over the original:
 *  - The duplicate #button handler that also wrote 'umowiona_wizyta' was
 *    removed. It fought with the identical handler in clock.js, wrote the same
 *    key twice per click, and threw on every page without the meeting widget.
 *  - Element lookups are guarded; the banner is optional markup.
 *  - Dismissing moves focus back to the page and the banner is a labelled
 *    region so screen readers announce it rather than meeting a stray div.
 */
(function () {
  "use strict";

  var storage = window.WM && window.WM.storage;
  var CONSENT_KEY = "cookieAccepted";

  function init() {
    var banner = document.querySelector(".cookie");
    if (!banner) return;

    var accepted = storage ? storage.readJSON(CONSENT_KEY, null) : null;
    if (accepted) {
      banner.hidden = true;
      banner.style.display = "none";
      return;
    }

    var acceptButton = banner.querySelector(".cookie__btn");
    if (!acceptButton) return;

    acceptButton.addEventListener("click", function () {
      if (storage) storage.writeJSON(CONSENT_KEY, true);
      banner.hidden = true;
      banner.style.display = "none";
      // The dismissed button held focus; hand it back to the document.
      var main = document.getElementById("main-content");
      if (main) main.focus();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
