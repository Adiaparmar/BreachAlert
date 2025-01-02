const sharp = require("sharp");
const fs = require("fs");

const sizes = [16, 48, 128];

async function convertIcons() {
  const svgBuffer = fs.readFileSync("./assets/icon.svg");

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`./assets/icon${size}.png`);
  }
}

convertIcons().catch(console.error);
