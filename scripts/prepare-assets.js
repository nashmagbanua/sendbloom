const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_FLOWERS = path.join(__dirname, '../public/flowers');
const PUBLIC_WRAPS = path.join(__dirname, '../public/wraps');

fs.mkdirSync(PUBLIC_FLOWERS, { recursive: true });
fs.mkdirSync(PUBLIC_WRAPS, { recursive: true });

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h / 360 + 1/3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

async function removeBlackBackground(inputPath, options = {}) {
  const {
    threshold = 28,
    feather = 16,
    targetWidth = 512,
    targetHeight = 512,
    isWrap = false,
  } = options;

  const image = sharp(inputPath);
  const { data, info } = await image
    .resize(targetWidth, targetHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const r = data[idx * channels];
      const g = data[idx * channels + 1];
      const b = data[idx * channels + 2];
      const maxVal = Math.max(r, g, b);

      let alpha = 255;

      // Wrap-specific floor removal: the bottom table outside the cone cone
      if (isWrap) {
        // Table floor is at y > height * 0.8
        if (y > height * 0.82) {
          const coneCenter = width * 0.5;
          const coneHalfWidth = (1 - (y - height * 0.82) / (height * 0.18)) * (width * 0.18) + (width * 0.08);
          if (x < coneCenter - coneHalfWidth || x > coneCenter + coneHalfWidth) {
            alpha = 0;
          }
        }
        if (y > height * 0.94) {
          // extreme bottom
          const coneCenter = width * 0.5;
          if (x < coneCenter - width * 0.08 || x > coneCenter + width * 0.08) {
            alpha = 0;
          }
        }
      }

      // Check threshold
      if (alpha > 0) {
        const thresh = isWrap ? 42 : threshold;
        if (maxVal < thresh) {
          alpha = 0;
        } else if (maxVal < thresh + feather) {
          alpha = Math.round(((maxVal - thresh) / feather) * 255);
        }
      }

      // Clean rose bottom right table artifact if rose
      if (!isWrap && inputPath.includes('rose') && y > height * 0.68 && x > width * 0.65) {
        const [h, s, l] = rgbToHsl(r, g, b);
        if (s < 0.22 && l > 0.25) {
          alpha = 0;
        }
      }

      out[idx * 4] = r;
      out[idx * 4 + 1] = g;
      out[idx * 4 + 2] = b;
      out[idx * 4 + 3] = alpha;
    }
  }

  return { buffer: out, width, height };
}

async function createColorVariant(baseBuffer, width, height, targetHex, flowerType) {
  const [targetR, targetG, targetB] = hexToRgb(targetHex);
  const [targetH, targetS, targetL] = rgbToHsl(targetR, targetG, targetB);
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = baseBuffer[i * 4];
    const g = baseBuffer[i * 4 + 1];
    const b = baseBuffer[i * 4 + 2];
    const a = baseBuffer[i * 4 + 3];

    if (a === 0) {
      out[i * 4] = 0;
      out[i * 4 + 1] = 0;
      out[i * 4 + 2] = 0;
      out[i * 4 + 3] = 0;
      continue;
    }

    const [h, s, l] = rgbToHsl(r, g, b);

    // Check if pixel should be preserved (e.g. green stems or daisy yellow center)
    const isGreenStem = (h >= 60 && h <= 165 && s > 0.18);
    const isDaisyCenter = (flowerType === 'daisy' && h >= 32 && h <= 65 && s > 0.45);
    const isSunflowerCenter = (flowerType === 'sunflower' && (l < 0.28 || (h < 40 && s > 0.5)));

    if (isGreenStem || isDaisyCenter || isSunflowerCenter) {
      out[i * 4] = r;
      out[i * 4 + 1] = g;
      out[i * 4 + 2] = b;
      out[i * 4 + 3] = a;
      continue;
    }

    // Blend lightness and shift hue/saturation towards target
    let newH = targetH;
    let newS = targetS;
    let newL = l;

    if (targetHex.toLowerCase() === '#ffffff' || targetHex.toLowerCase() === '#fff1f2') {
      // White / cream flower variant: clean bright ivory petals
      newS = 0.05;
      newL = Math.min(0.98, l * 1.5 + 0.12);
    } else if (targetHex.toLowerCase() === '#ff8fa3' || targetHex.toLowerCase() === '#ffe0ea' || targetHex.toLowerCase() === '#ffafcc') {
      // Soft pink variant
      newH = targetH;
      newS = Math.min(0.85, Math.max(0.4, targetS * 0.8));
      newL = Math.min(0.92, l * 1.25 + 0.08);
    } else {
      newH = targetH;
      newS = Math.min(0.95, Math.max(0.65, s * 0.7 + targetS * 0.5));
      newL = Math.max(0.12, Math.min(0.88, l * (targetL / 0.48)));
    }

    const [newR, newG, newB] = hslToRgb(newH, newS, newL);
    out[i * 4] = newR;
    out[i * 4 + 1] = newG;
    out[i * 4 + 2] = newB;
    out[i * 4 + 3] = a;
  }

  return out;
}

async function processAll() {
  console.log('Processing flowers and wraps...');

  const flowerFiles = {
    rose: 'src/assets/images/realistic_rose_1792023174268.jpg',
    tulip: 'src/assets/images/realistic_tulip_1792023174927.jpg',
    daisy: 'src/assets/images/realistic_daisy_1792023175940.jpg',
    sunflower: 'src/assets/images/realistic_sunflower_1792023176378.jpg',
    lily: 'src/assets/images/realistic_lily_1792023176138.jpg',
    foliage: 'src/assets/images/realistic_foliage_1792023430307.jpg',
  };

  const flowerColors = {
    rose: ['#e63956', '#ff8fa3', '#fff1f2', '#f4a261', '#b5179e'],
    tulip: ['#ff5d8f', '#ffd166', '#ffffff', '#9b5de5', '#ef476f'],
    daisy: ['#ffffff', '#ffe0ea', '#d8c4f0', '#ffe08a'],
    sunflower: ['#ffc300', '#ff9f1c'],
    lily: ['#ffffff', '#ffafcc', '#ff8a3d', '#c77dff'],
  };

  for (const [flowerType, srcPath] of Object.entries(flowerFiles)) {
    if (!fs.existsSync(srcPath)) {
      console.warn(`File not found: ${srcPath}`);
      continue;
    }

    console.log(`Extracting ${flowerType}...`);
    const { buffer: baseBuffer, width, height } = await removeBlackBackground(srcPath, {
      threshold: flowerType === 'rose' ? 18 : 22,
      feather: 16,
      targetWidth: 512,
      targetHeight: 512,
      isWrap: false,
    });

    if (flowerType === 'foliage') {
      await sharp(baseBuffer, { raw: { width, height, channels: 4 } })
        .webp({ quality: 90 })
        .toFile(path.join(PUBLIC_FLOWERS, 'foliage_eucalyptus.webp'));
      console.log('Saved foliage_eucalyptus.webp');
      continue;
    }

    const colors = flowerColors[flowerType] || [];
    for (let cIdx = 0; cIdx < colors.length; cIdx++) {
      const hex = colors[cIdx];
      let finalBuffer = baseBuffer;

      // Base original color checks
      const isBaseMatch = (
        (flowerType === 'rose' && cIdx === 0) ||
        (flowerType === 'tulip' && cIdx === 0) ||
        (flowerType === 'daisy' && cIdx === 0) ||
        (flowerType === 'sunflower' && cIdx === 0) ||
        (flowerType === 'lily' && cIdx === 0)
      );

      if (isBaseMatch) {
        finalBuffer = baseBuffer;
      } else {
        finalBuffer = await createColorVariant(baseBuffer, width, height, hex, flowerType);
      }

      const outName = `${flowerType}_${cIdx}.webp`;
      await sharp(finalBuffer, { raw: { width, height, channels: 4 } })
        .webp({ quality: 90 })
        .toFile(path.join(PUBLIC_FLOWERS, outName));
      console.log(`Saved ${outName} (${hex})`);
    }
  }

  // Process Wraps
  const wrapFiles = {
    kraft: 'src/assets/images/empty_wrap_kraft_1792023470855.jpg',
    rose: 'src/assets/images/empty_wrap_rose_1792023507215.jpg',
    mint: 'src/assets/images/empty_wrap_mint_1792023546437.jpg',
    night: 'src/assets/images/empty_wrap_night_1792023587535.jpg',
  };

  for (const [wrapId, srcPath] of Object.entries(wrapFiles)) {
    if (!fs.existsSync(srcPath)) continue;
    console.log(`Extracting wrap ${wrapId}...`);

    const { buffer: wrapBuffer, width, height } = await removeBlackBackground(srcPath, {
      threshold: 38,
      feather: 16,
      targetWidth: 500,
      targetHeight: 670,
      isWrap: true,
    });

    // Save full wrap
    await sharp(wrapBuffer, { raw: { width, height, channels: 4 } })
      .webp({ quality: 90 })
      .toFile(path.join(PUBLIC_WRAPS, `wrap_${wrapId}_full.webp`));

    // Also create wrap_front: The front cone and ribbon starting from ~33% height down
    const frontBuffer = Buffer.from(wrapBuffer);
    const cutY = Math.round(height * 0.35);

    for (let y = 0; y < cutY; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        frontBuffer[idx + 3] = 0;
      }
    }
    for (let y = cutY; y < Math.min(height, cutY + 20); y++) {
      const factor = (y - cutY) / 20;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        frontBuffer[idx + 3] = Math.round(frontBuffer[idx + 3] * factor);
      }
    }

    await sharp(frontBuffer, { raw: { width, height, channels: 4 } })
      .webp({ quality: 90 })
      .toFile(path.join(PUBLIC_WRAPS, `wrap_${wrapId}_front.webp`));

    console.log(`Saved wrap_${wrapId}_full.webp and wrap_${wrapId}_front.webp`);
  }

  console.log('Asset preparation complete!');
}

processAll().catch(err => {
  console.error('Asset preparation error:', err);
  process.exit(1);
});
