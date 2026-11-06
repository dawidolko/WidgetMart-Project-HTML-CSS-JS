document.getElementById("toggle-theme").addEventListener("click", toggleTheme);

document
  .getElementById("expand-collapse-btn")
  .addEventListener("click", toggleChat);

document
  .getElementById("get-quote")
  .addEventListener("click", fetchRandomQuote);

/*
 * Switches the theme (dark/light)
 */
function applyTheme(isDark) {
  document.documentElement.classList.toggle("dark", isDark);

  /*
   * The chat window has its own dark style; keep it in sync with the page.
   */
  const chatContainer = document.querySelector(".chat-container");
  if (chatContainer) {
    chatContainer.classList.toggle("dark-mode", isDark);
  }

  /*
   * Both buttons (navbar and chat) show the same state.
   */
  const chatButton = document.getElementById("toggle-theme");
  if (chatButton) {
    chatButton.textContent = isDark ? "bright mode" : "change theme";
    chatButton.setAttribute("aria-pressed", String(isDark));
  }

  const navButton = document.querySelector(".toggle");
  if (navButton) {
    navButton.textContent = isDark ? "Bright mode" : "Dark mode";
    navButton.setAttribute("aria-pressed", String(isDark));
  }

  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch (e) {
    /*
     * A private browser window can block saving: the theme still works, it just
     * will not be remembered.
     */
  }
}

function toggleTheme() {
  applyTheme(!document.documentElement.classList.contains("dark"));
}

/*
 * The navbar button goes through the same function as the chat button.
 *
 * It used to be handled by a separate listener in `clock.js` that only changed
 * the class on <html>: the chat window stayed light and the labels of the two
 * buttons went out of sync. We register in the capture phase and stop the event
 * so that listener does not revert the change.
 */
document.addEventListener(
  "click",
  function (event) {
    const navButton = event.target.closest(".toggle");
    if (!navButton) return;
    event.stopImmediatePropagation();
    event.preventDefault();
    toggleTheme();
  },
  true
);

/*
 * Restores the remembered theme on page entry.
 */
(function restoreTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (e) {
    saved = null;
  }

  if (saved === "dark") {
    applyTheme(true);
  }
})();

/*
 * Expands or collapses the chat container
 */
function toggleChat() {
  const chatContainer = document.querySelector(".chat-container");
  const chatContent = document.querySelector(".chat-content");
  const chatHeaderSpan = chatContainer.querySelector(".chat-header span");
  const toggleThemeButton = chatContainer.querySelector("#toggle-theme");
  const isExpanded = chatContainer.classList.toggle("expanded");
  chatContent.style.display = isExpanded ? "block" : "none";
  document.getElementById("expand-collapse-btn").textContent = isExpanded
    ? "−"
    : "+";
  chatContainer.style.transform = isExpanded
    ? "translateY(0)"
    : "translateY(calc(100% - 50px))";

  /*
   * Devices up to 600px wide
   */
  if (window.innerWidth <= 600) {
    if (isExpanded) {
      /*
       * Expand the chat container to the full view
       */
      /*
       * Restore the standard width
       */
      chatContainer.style.width = "350px";
      chatHeaderSpan.style.display = "block";
      toggleThemeButton.style.display = "block";
    } else {
      /*
       * Collapse the chat container to show only the '+' button
       */
      /*
       * Minimum width
       */
      chatContainer.style.width = "70px";
      chatHeaderSpan.style.display = "none";
      toggleThemeButton.style.display = "none";
    }
  }

  chatContent.style.display = isExpanded ? "block" : "none";

  const expandCollapseBtn = document.getElementById("expand-collapse-btn");
  expandCollapseBtn.textContent = isExpanded ? "−" : "+";
}

/*
 * Shows the proverb and handles navigation
 */
function displayProverbAndNavigate(data) {
  const quoteDisplay = document.getElementById("quote-display");
  quoteDisplay.textContent = `"${data.content}" — ${data.author}`;
  /*
   * Use the BOM to navigate the page (hash)
   */
  window.location.hash = "quote";
}

/*
 * Local quote fallback
 */
const localQuotes = [
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
    content: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
];

/*
 * Returns a Promise fetching a quote from the API
 */
function fetchQuote() {
  return new Promise((resolve, reject) => {
    /*
     * First API: DummyJSON (no CORS issues)
     */
    fetch("https://dummyjson.com/quotes/random")
      .then((response) => {
        if (!response.ok) throw new Error("Primary API failed");
        return response.json();
      })
      .then((data) => {
        if (data && data.quote) {
          resolve({ content: data.quote, author: data.author });
        } else {
          throw new Error("Invalid response format");
        }
      })
      .catch((error) => {
        console.warn("Primary API failed, using local quotes:", error);
        /*
         * Local fallback: random quote from the array
         */
        const randomQuote =
          localQuotes[Math.floor(Math.random() * localQuotes.length)];
        resolve(randomQuote);
      });
  });
}

/*
 * Fetches a random quote and changes the background
 */
async function fetchRandomQuote() {
  const chatContainer = document.querySelector(".chat-container");
  const quoteDisplay = document.getElementById("quote-display");

  quoteDisplay.textContent = "Loading quote...";

  try {
    const data = await fetchQuote();
    quoteDisplay.textContent = `"${data.content}" — ${data.author}`;
    quoteDisplay.classList.add("quote-style");
    /*
     * Success: orange background
     */
    chatContainer.style.backgroundColor = "#7c4200";
  } catch (error) {
    quoteDisplay.textContent = "Could not fetch quote. Please try again later.";
    console.error("Error fetching random quote:", error);
    /*
     * Failure: restore the standard background colour
     */
    chatContainer.style.backgroundColor = "";
  }
}

/*
 * Run toggleChat on DOMContentLoaded
 */
window.addEventListener("DOMContentLoaded", () => {
  toggleChat();
});
