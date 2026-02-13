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
  // Użyj BOM do nawigacji, ustaw hasz na 'quote'
  window.location.hash = "quote";
}

// Lokalny fallback z cytatami
const localQuotes = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { content: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { content: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { content: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { content: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" }
];

// Funkcja, która zwraca Promise do pobrania cytatu z API
function fetchQuote() {
  return new Promise((resolve, reject) => {
    // Pierwsze API - DummyJSON (bez problemów z CORS)
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
        // Lokalny fallback - losowy cytat z tablicy
        const randomQuote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
        resolve(randomQuote);
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
