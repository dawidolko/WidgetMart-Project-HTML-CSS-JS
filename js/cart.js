/**
 * Shopping cart.
 *
 * Rewritten from the original script, but the public surface is deliberately
 * unchanged: addToCart / displayCart / removeFromCart / updateCartCount /
 * validateAndCheckout stay global because the product and cart markup calls
 * them from inline onclick attributes on 18+ buttons.
 *
 * What changed and why:
 *  - Storage goes through WM.storage, so private-browsing / full-quota no
 *    longer throws and kills the cart badge.
 *  - Identical products collapse into one line with a quantity, instead of
 *    pushing a duplicate entry per click. The stored shape stays an array of
 *    items so a cart saved by the old version still loads.
 *  - Cart changes are announced through an aria-live region; previously a
 *    click gave no feedback at all to a screen reader user.
 *  - Checkout validation reports per-field messages tied to the inputs with
 *    aria-describedby/aria-invalid instead of a series of alert() dialogs.
 */
(function () {
  "use strict";

  var CART_KEY = "cart";
  var storage = window.WM && window.WM.storage;

  /* ---------------------------------------------------------------- utils */

  function getCart() {
    var raw = storage ? storage.readJSON(CART_KEY, []) : [];
    if (!Array.isArray(raw)) return [];
    // Normalise: entries written by the previous version carry no quantity.
    return raw
      .filter(function (item) {
        return item && typeof item === "object" && item.name;
      })
      .map(function (item) {
        var price = parseFloat(item.price);
        var qty = parseInt(item.quantity, 10);
        return {
          name: String(item.name),
          price: isNaN(price) ? 0 : price,
          image: item.image ? String(item.image) : "",
          quantity: !isNaN(qty) && qty > 0 ? qty : 1,
        };
      });
  }

  function saveCart(cart) {
    if (!storage) return false;
    var ok = storage.writeJSON(CART_KEY, cart);
    if (!ok) {
      announce(
        "Uwaga: koszyk nie może zostać zapisany w tej przeglądarce. " +
          "Zawartość zniknie po zamknięciu karty."
      );
    }
    return ok;
  }

  function totalItems(cart) {
    return cart.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
  }

  function totalPrice(cart) {
    return cart.reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);
  }

  function formatPrice(value) {
    return "$" + value.toFixed(2);
  }

  /* ------------------------------------------------------- announcements */

  /** Politely announce a change to assistive tech, and show a visual toast. */
  function announce(message) {
    var live = document.getElementById("cartLiveRegion");
    if (live) {
      // Clearing first makes repeated identical messages re-announce.
      live.textContent = "";
      window.setTimeout(function () {
        live.textContent = message;
      }, 60);
    }
    showToast(message);
  }

  var toastTimer = null;
  function showToast(message) {
    var toast = document.getElementById("cartToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("wm-toast--visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("wm-toast--visible");
    }, 3200);
  }

  /* ------------------------------------------------------- public: badge */

  function updateCartCount() {
    var badge = document.getElementById("cartCount");
    if (!badge) return; // Not every page renders the header badge.
    var count = totalItems(getCart());
    badge.textContent = String(count);
    // The number alone is meaningless out of context for a screen reader.
    var label = count === 1 ? "1 produkt w koszyku" : count + " produktów w koszyku";
    badge.setAttribute("aria-label", label);
    var link = badge.closest(".cart-icon");
    if (link) {
      var anchor = link.querySelector("a");
      if (anchor) anchor.setAttribute("aria-label", "Koszyk — " + label);
    }
  }

  /* --------------------------------------------------------- public: add */

  /**
   * @param {HTMLElement} buttonElement button carrying data-name/-price/-image
   */
  function addToCart(buttonElement) {
    if (!buttonElement || !buttonElement.getAttribute) return;

    var name = buttonElement.getAttribute("data-name");
    var price = parseFloat(buttonElement.getAttribute("data-price"));
    var image = buttonElement.getAttribute("data-image") || "";

    if (!name || isNaN(price)) {
      // Bad markup should not silently add a broken row to the cart.
      announce("Nie udało się dodać produktu do koszyka.");
      return;
    }

    var cart = getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].name === name && cart[i].price === price) {
        existing = cart[i];
        break;
      }
    }

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name: name, price: price, image: image, quantity: 1 });
    }

    saveCart(cart);
    updateCartCount();
    displayCart(); // No-op unless we are on the cart page.
    announce("Dodano do koszyka: " + name + ".");
  }

  /* ------------------------------------------------------ public: render */

  function displayCart() {
    var container = document.getElementById("cartItems");
    if (!container) return; // Only the cart page has this node.

    var cart = getCart();
    container.innerHTML = "";

    if (cart.length === 0) {
      var empty = document.createElement("div");
      empty.className = "wm-empty";
      var emptyHeading = document.createElement("h2");
      emptyHeading.textContent = "Twój koszyk jest pusty";
      var emptyText = document.createElement("p");
      emptyText.textContent = "Dodaj produkty, aby kontynuować zakupy.";
      var emptyLink = document.createElement("a");
      emptyLink.className = "wm-btn";
      emptyLink.href = "./product.html";
      emptyLink.textContent = "Przejdź do produktów";
      empty.appendChild(emptyHeading);
      empty.appendChild(emptyText);
      empty.appendChild(emptyLink);
      container.appendChild(empty);
    } else {
      var list = document.createElement("ul");
      list.className = "cart-list";

      cart.forEach(function (item, index) {
        var row = document.createElement("li");
        row.className = "item cart-list__item";

        if (item.image) {
          var img = document.createElement("img");
          img.src = item.image;
          // The name is already in the adjacent text, so the image is
          // decorative here — an alt repeating it would be read twice.
          img.alt = "";
          img.width = 100;
          img.height = 100;
          img.loading = "lazy";
          img.className = "cart-list__img";
          row.appendChild(img);
        }

        var info = document.createElement("div");
        info.className = "cart-list__info";

        var title = document.createElement("span");
        title.className = "cart-list__name";
        title.textContent = item.name;
        info.appendChild(title);

        var meta = document.createElement("span");
        meta.className = "cart-list__meta";
        meta.textContent =
          formatPrice(item.price) +
          " × " +
          item.quantity +
          " = " +
          formatPrice(item.price * item.quantity);
        info.appendChild(meta);
        row.appendChild(info);

        // --- quantity stepper -------------------------------------------
        var qty = document.createElement("div");
        qty.className = "cart-list__qty";

        var minus = document.createElement("button");
        minus.type = "button";
        minus.className = "wm-btn wm-btn--ghost cart-qty-btn";
        minus.textContent = "−";
        minus.setAttribute("aria-label", "Zmniejsz ilość: " + item.name);
        minus.addEventListener("click", function () {
          changeQuantity(index, -1);
        });

        var value = document.createElement("span");
        value.className = "cart-list__qty-value";
        value.textContent = String(item.quantity);

        var plus = document.createElement("button");
        plus.type = "button";
        plus.className = "wm-btn wm-btn--ghost cart-qty-btn";
        plus.textContent = "+";
        plus.setAttribute("aria-label", "Zwiększ ilość: " + item.name);
        plus.addEventListener("click", function () {
          changeQuantity(index, 1);
        });

        qty.appendChild(minus);
        qty.appendChild(value);
        qty.appendChild(plus);
        row.appendChild(qty);

        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "wm-btn wm-btn--secondary cart-list__remove";
        remove.textContent = "Usuń";
        // Without the name this reads as a wall of identical "Usuń" buttons.
        remove.setAttribute("aria-label", "Usuń z koszyka: " + item.name);
        remove.addEventListener("click", function () {
          removeFromCart(index);
        });
        row.appendChild(remove);

        list.appendChild(row);
      });

      container.appendChild(list);
    }

    var totalNode = document.getElementById("totalPrice");
    if (totalNode) totalNode.textContent = formatPrice(totalPrice(cart));

    // Checkout makes no sense with an empty cart — disable rather than hide,
    // so its presence stays discoverable.
    var checkoutBtn = document.getElementById("checkoutButton");
    if (checkoutBtn) {
      var isEmpty = cart.length === 0;
      checkoutBtn.disabled = isEmpty;
      checkoutBtn.setAttribute("aria-disabled", isEmpty ? "true" : "false");
    }

    updateCartCount();
  }

  /* ------------------------------------------------------ public: remove */

  function removeFromCart(index) {
    var cart = getCart();
    if (index < 0 || index >= cart.length) return;
    var removed = cart[index];
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
    updateCartCount();
    announce("Usunięto z koszyka: " + removed.name + ".");

    // Focus would be lost on the removed button; move it somewhere sensible.
    var container = document.getElementById("cartItems");
    if (container) {
      var next =
        container.querySelector(".cart-list__remove") ||
        container.querySelector("a, button");
      if (next) next.focus();
    }
  }

  /** Adjust a line's quantity; dropping to zero removes the line. */
  function changeQuantity(index, delta) {
    var cart = getCart();
    if (index < 0 || index >= cart.length) return;
    var item = cart[index];
    var next = item.quantity + delta;

    if (next < 1) {
      removeFromCart(index);
      return;
    }

    item.quantity = next;
    saveCart(cart);
    displayCart();
    updateCartCount();
    announce(item.name + ": ilość " + next + ".");
  }

  /* -------------------------------------------------- checkout validation */

  /** Show or clear the error message bound to one field. */
  function setFieldError(fieldId, message) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    var errorNode = document.getElementById(fieldId + "-error");

    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (errorNode) {
        errorNode.textContent = message;
        // Bind lazily so the field is not described by an empty node.
        var describedBy = field.getAttribute("aria-describedby") || "";
        if (describedBy.indexOf(fieldId + "-error") === -1) {
          field.setAttribute(
            "aria-describedby",
            (describedBy + " " + fieldId + "-error").trim()
          );
        }
      }
    } else {
      field.setAttribute("aria-invalid", "false");
      if (errorNode) errorNode.textContent = "";
    }
  }

  function valueOf(id) {
    var el = document.getElementById(id);
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function validateAndCheckout() {
    var summary = document.getElementById("checkoutSummary");
    var errors = [];

    var name = valueOf("name");
    var phone = valueOf("phone");
    var address = valueOf("address");
    var cardNumber = valueOf("cardNumber").replace(/\s+/g, "");
    var cardMM = valueOf("cardMM");
    var cardYYYY = valueOf("cardYYYY");
    var cardCVV = valueOf("cardCVV");

    // Each check clears its own field first, so fixing one error removes it.
    if (name.length < 3) {
      setFieldError("name", "Podaj imię i nazwisko (min. 3 znaki).");
      errors.push({ id: "name", text: "Imię i nazwisko" });
    } else {
      setFieldError("name", "");
    }

    if (!/^[0-9]{9}$/.test(phone)) {
      setFieldError("phone", "Numer telefonu musi mieć dokładnie 9 cyfr.");
      errors.push({ id: "phone", text: "Numer telefonu" });
    } else {
      setFieldError("phone", "");
    }

    if (address.length < 5) {
      setFieldError("address", "Podaj pełny adres (min. 5 znaków).");
      errors.push({ id: "address", text: "Adres" });
    } else {
      setFieldError("address", "");
    }

    if (!/^[0-9]{16}$/.test(cardNumber)) {
      setFieldError("cardNumber", "Numer karty musi składać się z 16 cyfr.");
      errors.push({ id: "cardNumber", text: "Numer karty" });
    } else {
      setFieldError("cardNumber", "");
    }

    var mm = parseInt(cardMM, 10);
    var yyyy = parseInt(cardYYYY, 10);
    var currentYear = new Date().getFullYear();
    var currentMonth = new Date().getMonth() + 1;

    if (isNaN(mm) || mm < 1 || mm > 12) {
      setFieldError("cardMM", "Miesiąc musi być liczbą od 1 do 12.");
      errors.push({ id: "cardMM", text: "Miesiąc ważności karty" });
    } else {
      setFieldError("cardMM", "");
    }

    if (
      isNaN(yyyy) ||
      yyyy < currentYear ||
      yyyy > currentYear + 20 ||
      (yyyy === currentYear && !isNaN(mm) && mm >= 1 && mm <= 12 && mm < currentMonth)
    ) {
      setFieldError("cardYYYY", "Karta jest przeterminowana lub rok jest błędny.");
      errors.push({ id: "cardYYYY", text: "Rok ważności karty" });
    } else {
      setFieldError("cardYYYY", "");
    }

    if (!/^[0-9]{3}$/.test(cardCVV)) {
      setFieldError("cardCVV", "Kod CVV musi mieć 3 cyfry.");
      errors.push({ id: "cardCVV", text: "Kod CVV" });
    } else {
      setFieldError("cardCVV", "");
    }

    var cart = getCart();
    if (cart.length === 0) {
      errors.push({ id: "", text: "Koszyk jest pusty" });
    }

    if (errors.length > 0) {
      if (summary) {
        summary.innerHTML = "";
        summary.hidden = false;
        summary.className = "checkout-summary checkout-summary--error";

        var heading = document.createElement("h3");
        heading.textContent =
          "Formularz zawiera " + errors.length + " błąd(ów). Popraw poniższe pola:";
        summary.appendChild(heading);

        var list = document.createElement("ul");
        errors.forEach(function (error) {
          var li = document.createElement("li");
          if (error.id) {
            var link = document.createElement("a");
            link.href = "#" + error.id;
            link.textContent = error.text;
            // Jump straight to the offending control.
            link.addEventListener("click", function (event) {
              event.preventDefault();
              var target = document.getElementById(error.id);
              if (target) target.focus();
            });
            li.appendChild(link);
          } else {
            li.textContent = error.text;
          }
          list.appendChild(li);
        });
        summary.appendChild(list);

        // Move focus to the summary so the errors are read immediately.
        summary.setAttribute("tabindex", "-1");
        summary.focus();
      }
      return;
    }

    // --- success -------------------------------------------------------
    if (summary) {
      summary.innerHTML = "";
      summary.hidden = false;
      summary.className = "checkout-summary checkout-summary--success";
      var okHeading = document.createElement("h3");
      okHeading.textContent = "Zamówienie przyjęte";
      var okText = document.createElement("p");
      okText.textContent =
        "Dziękujemy! Szczegóły zamówienia wyślemy na podany e-mail lub SMS-em.";
      summary.appendChild(okHeading);
      summary.appendChild(okText);
      summary.setAttribute("tabindex", "-1");
      summary.focus();
    }

    if (storage) storage.remove(CART_KEY);

    var form = document.getElementById("personalInfoForm");
    if (form && typeof form.reset === "function") form.reset();

    displayCart();
    updateCartCount();
    announce("Zamówienie zostało złożone. Koszyk jest pusty.");
  }

  /* ------------------------------------------------------------- wiring */

  function init() {
    updateCartCount();
    displayCart();

    // Progressive enhancement: bind the data-attribute buttons directly so the
    // cart keeps working even if the inline onclick handlers are ever removed.
    var addButtons = document.querySelectorAll("[data-add-to-cart]");
    Array.prototype.forEach.call(addButtons, function (button) {
      button.addEventListener("click", function () {
        addToCart(button);
      });
    });

    var checkoutBtn = document.getElementById("checkoutButton");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", validateAndCheckout);
    }

    // Clear a field's error as soon as the user starts fixing it.
    var validated = ["name", "phone", "address", "cardNumber", "cardMM", "cardYYYY", "cardCVV"];
    validated.forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") {
          setFieldError(id, "");
        }
      });
    });

    // Another tab changed the cart — keep this one consistent.
    window.addEventListener("storage", function (event) {
      if (event.key === CART_KEY) {
        updateCartCount();
        displayCart();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Exported for the inline onclick attributes in the existing markup. */
  window.addToCart = addToCart;
  window.displayCart = displayCart;
  window.removeFromCart = removeFromCart;
  window.updateCartCount = updateCartCount;
  window.validateAndCheckout = validateAndCheckout;
})();
