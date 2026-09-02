/**
 * Safe localStorage wrapper.
 *
 * Why this exists: the original code called localStorage.getItem/setItem
 * directly and JSON.parse'd the result. Three things can throw there and each
 * one used to take down the whole script (and with it the cart badge and the
 * rest of the page):
 *   1. Safari in Private Browsing and any browser with site data blocked throw
 *      on *access* to window.localStorage, not just on write.
 *   2. setItem throws QuotaExceededError once the origin's quota is full.
 *   3. JSON.parse throws on data corrupted by an older/other version of the site.
 *
 * Everything here degrades to an in-memory fallback so the shop keeps working
 * for the session even when persistence is unavailable.
 */
window.WM = window.WM || {};

window.WM.storage = (function () {
  "use strict";

  // Session-only fallback used when the real localStorage is unreachable.
  var memory = Object.create(null);
  var available = null; // Lazily probed, then cached.

  function isAvailable() {
    if (available !== null) return available;
    try {
      var probe = "__wm_probe__";
      window.localStorage.setItem(probe, probe);
      window.localStorage.removeItem(probe);
      available = true;
    } catch (err) {
      available = false;
    }
    return available;
  }

  /**
   * Read and JSON-parse a key.
   * @param {string} key
   * @param {*} fallback returned when missing, unreadable or corrupt
   */
  function readJSON(key, fallback) {
    var raw;
    try {
      raw = isAvailable() ? window.localStorage.getItem(key) : memory[key];
    } catch (err) {
      raw = memory[key];
    }
    if (raw === null || raw === undefined) return fallback;
    try {
      var parsed = JSON.parse(raw);
      return parsed === null ? fallback : parsed;
    } catch (err) {
      // Corrupt payload: drop it rather than letting every later read throw.
      remove(key);
      return fallback;
    }
  }

  /**
   * Serialise and store a value.
   * @returns {boolean} false when the value could not be persisted.
   */
  function writeJSON(key, value) {
    var raw;
    try {
      raw = JSON.stringify(value);
    } catch (err) {
      return false;
    }
    memory[key] = raw; // Always keep the session copy in sync.
    if (!isAvailable()) return false;
    try {
      window.localStorage.setItem(key, raw);
      return true;
    } catch (err) {
      // Quota exceeded, or storage revoked mid-session.
      return false;
    }
  }

  function remove(key) {
    delete memory[key];
    try {
      if (isAvailable()) window.localStorage.removeItem(key);
    } catch (err) {
      /* Nothing useful to do — the memory copy is already gone. */
    }
  }

  return {
    isAvailable: isAvailable,
    readJSON: readJSON,
    writeJSON: writeJSON,
    remove: remove,
  };
})();
