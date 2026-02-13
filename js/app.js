// Nasłuchuj kliknięcia na przycisk o id 'toggle-theme' i wywołaj funkcję toggleTheme
document.getElementById("toggle-theme").addEventListener("click", toggleTheme);

// Nasłuchuj kliknięcia na przycisk o id 'expand-collapse-btn' i wywołaj funkcję toggleChat
document
  .getElementById("expand-collapse-btn")
  .addEventListener("click", toggleChat);

// Nasłuchuj kliknięcia na przycisk o id 'get-quote' i wywołaj funkcję fetchRandomQuote
document
  .getElementById("get-quote")
  .addEventListener("click", fetchRandomQuote);

// Funkcja zmieniająca motyw (ciemny/jasny)
function toggleTheme() {
  // Pobierz element kontenera czatu
  const chatContainer = document.querySelector(".chat-container");
  // Przełącz klasę 'dark-mode', która kontroluje motyw
  chatContainer.classList.toggle("dark-mode");
}

// Funkcja rozwijania/zwijania kontenera czatu
function toggleChat() {
  // Pobierz elementy, które będą zmieniane w trakcie rozwijania/zwijania
  const chatContainer = document.querySelector(".chat-container");
  const chatContent = document.querySelector(".chat-content");
  const chatHeaderSpan = chatContainer.querySelector(".chat-header span");
  const toggleThemeButton = chatContainer.querySelector("#toggle-theme");
  // Sprawdź, czy kontener jest rozwinięty (expanded)
  const isExpanded = chatContainer.classList.toggle("expanded");
  // Ustaw widoczność zawartości czatu w zależności od stanu rozwinięcia
  chatContent.style.display = isExpanded ? "block" : "none";
  // Zmień tekst przycisku rozwijania/zwijania
  document.getElementById("expand-collapse-btn").textContent = isExpanded
    ? "−"
    : "+";
  // Zmień transformację kontenera w zależności od stanu rozwinięcia
  chatContainer.style.transform = isExpanded
    ? "translateY(0)"
    : "translateY(calc(100% - 50px))";

  // Dla urządzeń o szerokości do 600px
  if (window.innerWidth <= 600) {
    if (isExpanded) {
      // Rozwiń kontener czatu do pełnego widoku
      chatContainer.style.width = "350px"; // Przywróć standardową szerokość
      chatHeaderSpan.style.display = "block"; // Pokaż tytuł
      toggleThemeButton.style.display = "block"; // Pokaż przycisk zmiany motywu
    } else {
      // Zwiń kontener czatu do widoku z tylko przyciskiem '+'
      chatContainer.style.width = "70px"; // Zmień szerokość na minimalną
      chatHeaderSpan.style.display = "none"; // Ukryj tytuł
      toggleThemeButton.style.display = "none"; // Ukryj przycisk zmiany motywu
    }
  }

  // Zmień widoczność zawartości czatu
  chatContent.style.display = isExpanded ? "block" : "none";

  // Zmień tekst przycisku rozwijania/zwijania
  const expandCollapseBtn = document.getElementById("expand-collapse-btn");
  expandCollapseBtn.textContent = isExpanded ? "−" : "+";
}

// Funkcja wyświetlająca przysłowie i obsługująca nawigację
function displayProverbAndNavigate(data) {
  const quoteDisplay = document.getElementById("quote-display");
  quoteDisplay.textContent = `"${data.content}" — ${data.author}`;
  // uzywanie bom do nawigacji po stronie (hash)
  window.location.hash = "quote";
}

// Funkcja, która zwraca Promise do pobrania cytatu z API
function fetchQuote() {
  return new Promise((resolve, reject) => {
    // Pierwsze API - ZenQuotes (bardziej niezawodne)
    fetch("https://zenquotes.io/api/random")
      .then((response) => {
        if (!response.ok) throw new Error("Primary API failed");
        return response.json();
      })
      .then((data) => {
        // ZenQuotes zwraca tablicę
        if (data && data[0]) {
          resolve({ content: data[0].q, author: data[0].a });
        } else {
          throw new Error("Invalid response format");
        }
      })
      .catch((error) => {
        console.warn("Primary API failed, trying fallback:", error);
        // Fallback API - Quotable
        fetch("https://api.quotable.io/random")
          .then((response) => {
            if (!response.ok) throw new Error("Fallback API failed");
            return response.json();
          })
          .then((data) => resolve(data))
          .catch((fallbackError) => {
            console.warn(
              "Fallback API also failed, trying alternative:",
              fallbackError,
            );
            // Drugi fallback - API Adviceslip
            fetch("https://api.adviceslip.com/advice")
              .then((response) => response.json())
              .then((data) => {
                if (data && data.slip) {
                  resolve({ content: data.slip.advice, author: "Anonymous" });
                } else {
                  reject(new Error("All APIs failed"));
                }
              })
              .catch((err) => reject(err));
          });
      });
  });
}

// Funkcja asynchroniczna do pobierania losowego cytatu i zmiany tła
async function fetchRandomQuote() {
  const chatContainer = document.querySelector(".chat-container");
  const quoteDisplay = document.getElementById("quote-display");

  // Pokaż loading
  quoteDisplay.textContent = "Loading quote...";

  try {
    const data = await fetchQuote(); // Pobierz cytatu korzystając z Promise
    quoteDisplay.textContent = `"${data.content}" — ${data.author}`;
    quoteDisplay.classList.add("quote-style"); // Stylizacja cytatu
    chatContainer.style.backgroundColor = "#7c4200"; // Sukces: zmiana koloru tła na pomarańczowy
  } catch (error) {
    quoteDisplay.textContent = "Could not fetch quote. Please try again later.";
    console.error("Error fetching random quote:", error);
    chatContainer.style.backgroundColor = ""; // Niepowodzenie: przywrócenie standardowego koloru tła
  }
}

// Nasłuchuj zdarzenia DOMContentLoaded i uruchom funkcję toggleChat przy załadowaniu strony
window.addEventListener("DOMContentLoaded", () => {
  toggleChat();
});
