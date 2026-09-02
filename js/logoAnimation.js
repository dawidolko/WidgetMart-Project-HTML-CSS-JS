/**
 * Canvas logo scatter effect.
 *
 * Fixes over the original:
 *  - The image path was "../img/logo2transparent.webp", one level too high
 *    from a page at the site root, so the logo never actually loaded and the
 *    canvas animated an empty buffer.
 *  - The animation started before the image had loaded and ran forever at full
 *    rate over 1200x300 pixels (1.4M array writes per frame), pinning a core
 *    even when scrolled out of view. It now starts on load, throttles to ~24fps
 *    and pauses when off-screen or when the tab is hidden.
 *  - `newIndex` was computed without bounds checking, so displaced pixels wrote
 *    outside the buffer and wrapped onto the wrong rows.
 *  - Honours prefers-reduced-motion by drawing a single static frame.
 */
(function () {
  "use strict";

  function init() {
    var canvas = document.getElementById("logoCanvas");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 300;

    var logo = new Image();
    logo.src = "img/logo2transparent.webp";

    logo.addEventListener("error", function () {
      console.warn("Logo image could not be loaded for the canvas effect.");
    });

    logo.addEventListener("load", function () {
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          logo,
          canvas.width / 2 - logo.width / 2,
          canvas.height / 2 - logo.height / 2
        );
      }

      draw();

      var reduceMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return; // Static logo is the accessible default.

      var time = 0;
      var visible = true;
      var lastFrame = 0;
      var FRAME_MS = 1000 / 24;

      // Only animate while the canvas is actually on screen.
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
        }).observe(canvas);
      }

      function animate(timestamp) {
        window.requestAnimationFrame(animate);

        if (!visible || document.hidden) return;
        if (timestamp - lastFrame < FRAME_MS) return;
        lastFrame = timestamp;

        time++;
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        var width = canvas.width;
        var height = canvas.height;
        var amplitudeX = 10 * Math.sin(time * 0.05);
        var amplitudeY = 10 * Math.cos(time * 0.05);

        for (var i = 0; i < data.length; i += 4) {
          var pixel = i / 4;
          var currentX = pixel % width;
          var currentY = (pixel / width) | 0;
          var newX = Math.floor(currentX + (0.5 - Math.random()) * amplitudeX);
          var newY = Math.floor(currentY + (0.5 - Math.random()) * amplitudeY);

          // Skip displaced pixels that fall outside the canvas rather than
          // letting them wrap onto a neighbouring row.
          if (newX < 0 || newX >= width || newY < 0 || newY >= height) continue;

          var newIndex = (newY * width + newX) * 4;
          data[newIndex] = data[i];
          data[newIndex + 1] = data[i + 1];
          data[newIndex + 2] = data[i + 2];
          data[newIndex + 3] = data[i + 3];
        }

        ctx.putImageData(imageData, 0, 0);
      }

      window.requestAnimationFrame(animate);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
