# WidgetMart

> 🛍️ **Nine pages, one browser** — a shop built with plain HTML, CSS and JavaScript, where the cart, the notes, the theme and the weather all live in `localStorage`

**WidgetMart** is a full shop front built without a framework or a backend: home, products, product detail, gallery, cart, services, about, FAQ, contact and privacy. The cart persists between visits, a live weather panel pulls from OpenWeatherMap, a note manager keeps its own list, the theme switch remembers your choice and the cookie banner remembers that you dismissed it.

Everything that would normally need a server is done in the browser, which is exactly what the project set out to demonstrate.

![HTML5](https://img.shields.io/badge/HTML5-semantic-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-per%20page-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-API-EB6E4B?logo=openweathermap&logoColor=white)
![WebP](https://img.shields.io/badge/Images-WebP-0A84FF)
![License](https://img.shields.io/badge/License-MIT-green)

**Live:** [projekt2.dawidolko.pl](https://projekt2.dawidolko.pl)

---

## 🎯 Key Features

- **A cart in `localStorage`** — add, list, remove and a live counter in the header, all persisted, so the basket is still there tomorrow.
- **Live weather with a search history** — `api.js` queries OpenWeatherMap for a city, shows temperature, humidity, wind and UV index, and keeps the cities you searched so you can return to them.
- **A note manager as a real class** — `NoteManager` is an ES module with its own storage handling, rather than a handful of functions on the global object.
- **Light and dark theme, remembered** — the switch writes the choice to `localStorage`, so the second visit opens in the theme you chose.
- **A cookie banner that stays dismissed** — acceptance is stored, so it does not greet you on every page.
- **A live clock and an appointment reminder** — the booking details are kept in the browser and shown back when the page reloads.
- **An animated logo** — its own module, so the animation is not tangled into page scripts.
- **One stylesheet per page** — `styleIndex.css`, `styleCart.css`, `styleGallery.css` and so on, which keeps page-specific rules from leaking into each other.

---

## 🧩 The Pages

| Page            | What it holds                                        |
| --------------- | ---------------------------------------------------- |
| `index.html`    | Home, with the weather panel and the theme switch.   |
| `product.html`  | Product detail.                                      |
| `gallery.html`  | Image gallery.                                       |
| `cart.html`     | The basket and its totals.                           |
| `services.html` | What is offered.                                     |
| `aboutUs.html`  | About the shop.                                      |
| `faq.html`      | Frequently asked questions.                          |
| `contact.html`  | Contact form and details.                            |
| `privacy.html`  | Privacy notice.                                      |

---

## 🛠️ Technology Stack

| Technology         | Role                                                        |
| ------------------ | ----------------------------------------------------------- |
| **HTML5**          | Nine semantic pages.                                         |
| **CSS3**           | One stylesheet per page.                                     |
| **JavaScript**     | Cart, notes, clock, theme, cookie banner, logo animation.    |
| **ES modules**     | `NoteManager` as a class rather than loose functions.        |
| **localStorage**   | Cart, theme, cookie consent, notes, appointment, search history. |
| **OpenWeatherMap** | Current conditions and UV index.                             |

---

## 🚀 Getting Started

### Prerequisites

- Any static web server (ES modules need `http://`, not `file://`)
- An OpenWeatherMap API key for the weather panel

### 1. Clone the repository

```bash
git clone https://github.com/dawidolko/WidgetMart-Project-HTML-CSS-JS.git
cd WidgetMart-Project-HTML-CSS-JS
```

### 2. Add your API key

Set `APIKey` in `js/api.js` to your own OpenWeatherMap key.

### 3. Serve it

```bash
python3 -m http.server    # http://localhost:8000
```

---

## 📁 Project Structure

```
WidgetMart-Project-HTML-CSS-JS/
├── index.html  product.html  gallery.html  cart.html
├── services.html  aboutUs.html  faq.html  contact.html  privacy.html
├── js/
│   ├── app.js             # shared page behaviour
│   ├── cart.js            # basket in localStorage, counter, removal
│   ├── api.js             # OpenWeatherMap: weather, UV index, search history
│   ├── NoteManager.js     # ES module class for notes
│   ├── clock.js           # live clock and appointment reminder
│   ├── darkbrightness.js  # theme switch, remembered
│   ├── cookie.js          # consent banner
│   └── logoAnimation.js
├── css/                   # one stylesheet per page
├── img/                   # product and gallery images (WebP)
└── docs/                  # course documentation
```

A Polish version of this document is in [README_POLISH.md](README_POLISH.md).

---

## 📄 License

MIT © [Dawid Olko](https://dawidolko.pl)
