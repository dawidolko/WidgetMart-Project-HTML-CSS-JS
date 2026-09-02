/**
 * "Draw a quote" floating widget.
 *
 * Kept as an ES module because every page loads it with type="module".
 *
 * Fixes over the original:
 *  - The three addEventListener calls ran at top level against elements that
 *    do not exist on some pages, throwing before anything was wired up.
 *  - The collapsed panel used to stay in the tab order and be reachable by
 *    screen readers while visually hidden; it is now properly inert via
 *    the hidden attribute, with aria-expanded on the trigger.
 *  - The hard-coded background colour on success was dropped; it produced
 *    white-on-orange text well below the AA contrast threshold.
 *  - Escape now collapses the panel, and focus returns to the toggle.
 */
(function () {
  "use strict";

  // Local fallbacks, used when the network call fails.
  var localQuotes = [
    {
      content: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      content: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs",
    },
    {
      content: "Life is what happens when you're busy making other plans.",
      author: "John Lennon",
    },
    {
      content:
        "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
    },
    {
      content:
        "It is during our darkest moments that we must focus to see the light.",
      author: "Aristotle",
    },
    {
      content: "Be yourself; everyone else is already taken.",
      author: "Oscar Wilde",
    },
    {
      content:
        "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb",
    },
    {
      content:
        "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
    },
  ];

  function randomLocalQuote() {
    return localQuotes[Math.floor(Math.random() * localQuotes.length)];
  }

  function fetchQuote() {
    return fetch("https://dummyjson.com/quotes/random")
      .then(function (response) {
        if (!response.ok) throw new Error("Quote API responded " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (data && data.quote) {
          return { content: data.quote, author: data.author };
        }
        throw new Error("Unexpected quote payload");
      })
      .catch(function (error) {
        // A failed third-party call must not leave the user with nothing.
        console.warn("Quote API unavailable, using local quotes:", error);
        return randomLocalQuote();
      });
  }

  function init() {
    var chatContainer = document.querySelector(".chat-container");
    if (!chatContainer) return;

    var chatContent = chatContainer.querySelector(".chat-content");
    var toggleThemeButton = chatContainer.querySelector("#toggle-theme");
    var expandButton = chatContainer.querySelector("#expand-collapse-btn");
    var quoteButton = chatContainer.querySelector("#get-quote");
    var quoteDisplay = chatContainer.querySelector("#quote-display");

    function setExpanded(expanded) {
      chatContainer.classList.toggle("expanded", expanded);
      if (chatContent) {
        chatContent.hidden = !expanded;
        chatContent.style.display = expanded ? "block" : "none";
      }
      if (expandButton) {
        expandButton.textContent = expanded ? "−" : "+";
        expandButton.setAttribute("aria-expanded", expanded ? "true" : "false");
        expandButton.setAttribute(
          "aria-label",
          expanded ? "Zwiń panel z cytatem" : "Rozwiń panel z cytatem"
        );
      }
      chatContainer.style.transform = expanded
        ? "translateY(0)"
        : "translateY(calc(100% - 50px))";
    }

    if (expandButton) {
      expandButton.addEventListener("click", function () {
        setExpanded(!chatContainer.classList.contains("expanded"));
      });
    }

    if (toggleThemeButton) {
      toggleThemeButton.addEventListener("click", function () {
        var isDark = chatContainer.classList.toggle("dark-mode");
        toggleThemeButton.setAttribute("aria-pressed", isDark ? "true" : "false");
      });
      toggleThemeButton.setAttribute("aria-pressed", "false");
    }

    if (quoteButton && quoteDisplay) {
      quoteButton.addEventListener("click", function () {
        quoteDisplay.textContent = "Ładowanie cytatu…";
        quoteButton.disabled = true;

        fetchQuote()
          .then(function (data) {
            quoteDisplay.textContent =
              '"' + data.content + '" — ' + data.author;
            quoteDisplay.classList.add("quote-style");
          })
          .catch(function (error) {
            console.error("Could not display a quote:", error);
            quoteDisplay.textContent =
              "Nie udało się pobrać cytatu. Spróbuj ponownie później.";
          })
          .then(function () {
            quoteButton.disabled = false;
          });
      });
    }

    // Escape collapses the panel — it overlays page content when open.
    chatContainer.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && chatContainer.classList.contains("expanded")) {
        setExpanded(false);
        if (expandButton) expandButton.focus();
      }
    });

    // Start collapsed, matching the original load behaviour.
    setExpanded(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
