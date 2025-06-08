const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputImage = '1.jpg';  // Use your main image
const outputDir = 'icons';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

sizes.forEach(size => {
    sharp(inputImage)
        .resize(size, size)
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
        .then(info => console.log(`Created ${size}x${size} icon`))
        .catch(err => console.error(`Error creating ${size}x${size} icon:`, err));
});
