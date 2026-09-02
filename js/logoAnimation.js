const canvas = document.getElementById("logoCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

canvas.width = 1200;
canvas.height = 300;

const logoImage = new Image();
logoImage.src = "../img/logo2transparent.webp"; // ścieżka do obrazka
logoImage.onload = () => {
  // Rysowanie logo w środku canvas
  ctx.drawImage(
    logoImage,
    canvas.width / 2 - logoImage.width / 2,
    canvas.height / 2 - logoImage.height / 2,
  );
};

let time = 0;
const animate = () => {
  time++;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Efekt rozproszenia pikseli
  for (let i = 0; i < data.length; i += 4) {
    const randX = (0.5 - Math.random()) * 10 * Math.sin(time * 0.05);
    const randY = (0.5 - Math.random()) * 10 * Math.cos(time * 0.05);

    // Przesunięcie pikseli
    const currentX = (i / 4) % canvas.width;
    const currentY = Math.floor(i / 4 / canvas.width);
    const newX = Math.floor(currentX + randX);
    const newY = Math.floor(currentY + randY);
    const newIndex = (newY * canvas.width + newX) * 4;

    // Zamiana pikseli miejscami
    for (let j = 0; j < 4; j++) {
      data[newIndex + j] = data[i + j];
    }
  }

  ctx.putImageData(imageData, 0, 0);
  requestAnimationFrame(animate);
};

requestAnimationFrame(animate);
