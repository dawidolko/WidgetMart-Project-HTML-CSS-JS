/**
 * Product search, category filter and sorting.
 *
 * Works entirely off the markup already in product.html: every product card is
 * read once into an index, then shown/hidden and reordered in place. Nothing is
 * fetched and no card is destroyed, so the inline addToCart handlers on each
 * button keep pointing at live elements.
 *
 * The whole module is a no-op on pages without a [data-shop] container, which
 * is why it is safe to load site-wide.
 */
(function () {
  "use strict";

  function init() {
    var root = document.querySelector("[data-shop]");
    if (!root) return; // Not the products page.

    var searchInput = document.getElementById("productSearch");
    var sortSelect = document.getElementById("productSort");
    var chips = document.querySelectorAll("[data-category-filter]");
    var resultCount = document.getElementById("productResultCount");
    var emptyState = document.getElementById("productEmptyState");
    var clearButton = document.getElementById("productFilterClear");

    // Snapshot each card once. Reading price/category from data attributes
    // avoids re-parsing the rendered text on every keystroke.
    var cards = Array.prototype.map.call(
      root.querySelectorAll("[data-product]"),
      function (element) {
        var price = parseFloat(element.getAttribute("data-price"));
        return {
          element: element,
          parent: element.parentNode,
          name: (element.getAttribute("data-name") || "").toLowerCase(),
          category: element.getAttribute("data-category") || "",
          price: isNaN(price) ? 0 : price,
        };
      }
    );

    if (cards.length === 0) return;

    var state = { query: "", category: "all", sort: "default" };

    /* Debounce keystrokes: filtering on every input event is wasteful and
       makes the aria-live count chatter for screen reader users. */
    function debounce(fn, wait) {
      var timer = null;
      return function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(fn, wait);
      };
    }

    function matches(card) {
      if (state.category !== "all" && card.category !== state.category) {
        return false;
      }
      if (state.query && card.name.indexOf(state.query) === -1) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;

      cards.forEach(function (card) {
        var show = matches(card);
        // `hidden` keeps the card out of the accessibility tree as well as
        // out of the layout — display:none alone via a class would too, but
        // the attribute also survives the page stylesheets' own rules.
        card.element.hidden = !show;
        if (show) visible++;
      });

      // Reorder only the currently visible cards, within their own section so
      // the "Men / Women / Kids" grouping headings stay meaningful.
      if (state.sort !== "default") {
        var byParent = new Map();
        cards.forEach(function (card) {
          if (card.element.hidden) return;
          if (!byParent.has(card.parent)) byParent.set(card.parent, []);
          byParent.get(card.parent).push(card);
        });

        byParent.forEach(function (group, parent) {
          group.sort(function (a, b) {
            if (state.sort === "price-asc") return a.price - b.price;
            if (state.sort === "price-desc") return b.price - a.price;
            if (state.sort === "name-asc") return a.name.localeCompare(b.name);
            if (state.sort === "name-desc") return b.name.localeCompare(a.name);
            return 0;
          });
          // appendChild moves existing nodes; listeners and state survive.
          group.forEach(function (card) {
            parent.appendChild(card.element);
          });
        });
      }

      if (resultCount) {
        resultCount.textContent =
          visible === 1
            ? "Znaleziono 1 produkt."
            : "Znaleziono " + visible + " produktów.";
      }

      if (emptyState) emptyState.hidden = visible !== 0;

      // Section wrappers with nothing left in them would leave a stray
      // heading and a gap, so hide those too.
      Array.prototype.forEach.call(
        root.querySelectorAll("[data-product-section]"),
        function (section) {
          var anyVisible = section.querySelector("[data-product]:not([hidden])");
          section.hidden = !anyVisible;
          var heading = document.querySelector(
            '[data-section-heading="' + section.getAttribute("data-product-section") + '"]'
          );
          if (heading) heading.hidden = !anyVisible;
        }
      );
    }

    /* ------------------------------------------------------------ events */

    if (searchInput) {
      var runSearch = debounce(function () {
        state.query = searchInput.value.trim().toLowerCase();
        apply();
      }, 180);
      searchInput.addEventListener("input", runSearch);

      // The field sits in a form only so Enter behaves; never actually submit.
      searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") event.preventDefault();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        state.sort = sortSelect.value;
        apply();
      });
    }

    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener("click", function () {
        state.category = chip.getAttribute("data-category-filter") || "all";
        Array.prototype.forEach.call(chips, function (other) {
          other.setAttribute(
            "aria-pressed",
            other === chip ? "true" : "false"
          );
        });
        apply();
      });
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        state.query = "";
        state.category = "all";
        state.sort = "default";
        if (searchInput) searchInput.value = "";
        if (sortSelect) sortSelect.value = "default";
        Array.prototype.forEach.call(chips, function (chip) {
          chip.setAttribute(
            "aria-pressed",
            chip.getAttribute("data-category-filter") === "all" ? "true" : "false"
          );
        });
        apply();
        if (searchInput) searchInput.focus();
      });
    }

    // Deep links such as product.html#men1 should preselect that category.
    var hash = window.location.hash.replace("#", "");
    var hashMap = { men1: "men", women1: "women", kid1: "kids" };
    if (hashMap[hash]) {
      state.category = hashMap[hash];
      Array.prototype.forEach.call(chips, function (chip) {
        chip.setAttribute(
          "aria-pressed",
          chip.getAttribute("data-category-filter") === hashMap[hash]
            ? "true"
            : "false"
        );
      });
    }

    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
