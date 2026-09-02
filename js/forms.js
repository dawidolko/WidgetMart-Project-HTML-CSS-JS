/**
 * Accessible client-side validation for the contact and newsletter forms.
 *
 * The markup keeps `required` and the correct input types, so with JavaScript
 * off the browser's own validation still applies. This module replaces the
 * native bubbles with messages that live in the page: each one is bound to its
 * field through aria-describedby, the field is marked aria-invalid, and a
 * role="alert" summary lists every problem with links straight to the control.
 *
 * No-ops on pages without the relevant forms.
 */
(function () {
  "use strict";

  /** Set or clear the error message attached to one field. */
  function setError(field, message) {
    if (!field) return;
    var errorNode = document.getElementById(field.id + "-error");
    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (errorNode) {
        errorNode.textContent = message;
        var described = field.getAttribute("aria-describedby") || "";
        if (described.indexOf(field.id + "-error") === -1) {
          field.setAttribute(
            "aria-describedby",
            (described + " " + field.id + "-error").trim()
          );
        }
      }
    } else {
      field.setAttribute("aria-invalid", "false");
      if (errorNode) errorNode.textContent = "";
    }
  }

  /** Render the error summary above the form and move focus to it. */
  function renderSummary(summary, errors) {
    if (!summary) return;
    summary.innerHTML = "";

    if (errors.length === 0) {
      summary.hidden = true;
      return;
    }

    summary.hidden = false;
    summary.className = "checkout-summary checkout-summary--error";

    var heading = document.createElement("h3");
    heading.textContent =
      "Formularz zawiera " + errors.length + " błąd(ów). Popraw poniższe pola:";
    summary.appendChild(heading);

    var list = document.createElement("ul");
    errors.forEach(function (error) {
      var li = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + error.field.id;
      link.textContent = error.label + " — " + error.message;
      link.addEventListener("click", function (event) {
        event.preventDefault();
        error.field.focus();
      });
      li.appendChild(link);
      list.appendChild(li);
    });
    summary.appendChild(list);

    summary.setAttribute("tabindex", "-1");
    summary.focus();
  }

  /** Human-readable label for a field, taken from its own <label>. */
  function labelFor(field) {
    var label = document.querySelector('label[for="' + field.id + '"]');
    return label ? label.textContent.trim() : field.name || field.id;
  }

  /* --------------------------------------------------------- contact form */

  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var summary = document.getElementById("contactSummary");

    var rules = [
      {
        id: "contact-name",
        test: function (v) {
          return v.length >= 3;
        },
        message: "Podaj imię i nazwisko (min. 3 znaki).",
      },
      {
        id: "contact-email",
        test: function (v) {
          // Deliberately loose: the strict RFC pattern rejects valid addresses.
          return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        },
        message: "Podaj poprawny adres e-mail, np. jan@example.com.",
      },
      {
        id: "contact-dob",
        test: function (v) {
          if (!v) return false;
          var date = new Date(v);
          return !isNaN(date.getTime()) && date < new Date();
        },
        message: "Podaj poprawną datę urodzenia z przeszłości.",
      },
      {
        id: "contact-phone",
        test: function (v) {
          return /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/.test(v);
        },
        message: "Numer telefonu musi mieć format 123-456-789.",
      },
      {
        id: "contact-message",
        test: function (v) {
          return v.length >= 10;
        },
        message: "Wiadomość musi mieć co najmniej 10 znaków.",
      },
    ];

    form.addEventListener("submit", function (event) {
      var errors = [];

      rules.forEach(function (rule) {
        var field = document.getElementById(rule.id);
        if (!field) return;
        var value = field.value.trim();
        if (rule.test(value)) {
          setError(field, "");
        } else {
          setError(field, rule.message);
          errors.push({
            field: field,
            label: labelFor(field),
            message: rule.message,
          });
        }
      });

      if (errors.length > 0) {
        event.preventDefault();
        renderSummary(summary, errors);
        return;
      }

      // Valid: report success in place. The form has no backend, so let the
      // #thankyou anchor do its job rather than pretending to submit.
      if (summary) {
        summary.hidden = false;
        summary.className = "checkout-summary checkout-summary--success";
        summary.innerHTML = "";
        var heading = document.createElement("h3");
        heading.textContent = "Wiadomość gotowa do wysłania";
        var text = document.createElement("p");
        text.textContent = "Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.";
        summary.appendChild(heading);
        summary.appendChild(text);
      }
    });

    // Clear a message as soon as the user edits the field it belongs to.
    rules.forEach(function (rule) {
      var field = document.getElementById(rule.id);
      if (!field) return;
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") setError(field, "");
      });
    });
  }

  /* ------------------------------------------------------ newsletter form */

  function initNewsletter() {
    var form = document.querySelector(".newsletter-form");
    if (!form) return;

    var input = form.querySelector('input[type="email"]');
    var status = document.getElementById("newsletterStatus");
    if (!input) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault(); // No backend to post to.
      var value = input.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

      input.setAttribute("aria-invalid", valid ? "false" : "true");

      if (status) {
        status.textContent = valid
          ? "Dziękujemy! Adres " + value + " został zapisany."
          : "Podaj poprawny adres e-mail, np. jan@example.com.";
        status.className = valid
          ? "wm-hint newsletter-status newsletter-status--ok"
          : "wm-error newsletter-status";
      }

      if (valid) form.reset();
    });

    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") {
        input.setAttribute("aria-invalid", "false");
        if (status) status.textContent = "";
      }
    });
  }

  function init() {
    initContactForm();
    initNewsletter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
