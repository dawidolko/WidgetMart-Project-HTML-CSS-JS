/*
 * Pixel scatter on the logo. The canvas works at half the displayed resolution and only
 * touches opaque pixels, so a frame stays cheap, and the loop stops while the canvas is
 * off screen. With reduced motion the logo stays still.
 */
const canvas = document.getElementById("logoCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const SCALE = 0.5;
const FRAME_MS = 50;

canvas.width = 1200 * SCALE;
canvas.height = 300 * SCALE;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let visible = false;
let running = false;
let last = 0;
let time = 0;

const step = (now) => {
  if (!visible) {
    running = false;
    return;
  }
  requestAnimationFrame(step);
  if (now - last < FRAME_MS) {
    return;
  }
  last = now;
  time++;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const spreadX = 5 * Math.sin(time * 0.05);
  const spreadY = 5 * Math.cos(time * 0.05);

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) {
      continue;
    }
    const start = i - 3;
    const currentX = (start / 4) % width;
    const currentY = Math.floor(start / 4 / width);
    const newX = Math.floor(currentX + (0.5 - Math.random()) * spreadX);
    const newY = Math.floor(currentY + (0.5 - Math.random()) * spreadY);
    const newIndex = (newY * width + newX) * 4;
    for (let j = 0; j < 4; j++) {
      data[newIndex + j] = data[start + j];
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

const start = () => {
  if (!running && !reducedMotion) {
    running = true;
    requestAnimationFrame(step);
  }
};

const logoImage = new Image();
logoImage.src = "img/logo2transparent.webp";
logoImage.onload = () => {
  const width = logoImage.width * SCALE;
  const height = logoImage.height * SCALE;
  ctx.drawImage(logoImage, canvas.width / 2 - width / 2, canvas.height / 2 - height / 2, width, height);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) {
      start();
    }
  }).observe(canvas);
};
