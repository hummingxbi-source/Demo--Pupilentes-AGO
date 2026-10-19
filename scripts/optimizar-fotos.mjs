import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ORIGIN_DIR = path.resolve('public/img/originales');
const DEST_DIR = path.resolve('public/img/fotos');

const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function processDirectory(currentOrigin, currentDest) {
  if (!fs.existsSync(currentOrigin)) {
    return 0;
  }

  const entries = fs.readdirSync(currentOrigin, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const originPath = path.join(currentOrigin, entry.name);

    if (entry.isDirectory()) {
      const nextDest = path.join(currentDest, entry.name);
      if (!fs.existsSync(nextDest)) {
        fs.mkdirSync(nextDest, { recursive: true });
      }
      count += await processDirectory(originPath, nextDest);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!EXTENSIONS.has(ext)) continue;

      const baseName = path.basename(entry.name, ext)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9_-]/g, '');

      if (!fs.existsSync(currentDest)) {
        fs.mkdirSync(currentDest, { recursive: true });
      }

      const out1600 = path.join(currentDest, `${baseName}-1600.webp`);
      const out800 = path.join(currentDest, `${baseName}-800.webp`);
      const outDefault = path.join(currentDest, `${baseName}.webp`);

      console.log(`📸 Procesando: ${entry.name} -> ${baseName}*.webp`);

      try {
        const image = sharp(originPath);
        const metadata = await image.metadata();

        // Generar 1600px si es suficientemente grande, o al tamaño original
        await sharp(originPath)
          .resize({ width: Math.min(1600, metadata.width || 1600), withoutEnlargement: true })
          .webp({ quality: 84 })
          .toFile(out1600);

        // Generar 800px
        await sharp(originPath)
          .resize({ width: Math.min(800, metadata.width || 800), withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(out800);

        // Generar default
        await sharp(originPath)
          .resize({ width: Math.min(1200, metadata.width || 1200), withoutEnlargement: true })
          .webp({ quality: 84 })
          .toFile(outDefault);

        count++;
      } catch (err) {
        console.error(`❌ Error procesando ${originPath}:`, err.message);
      }
    }
  }

  return count;
}

async function main() {
  console.log('--- 👁️ Pupilentes AGO: Optimizador de Fotografías ---');
  if (!fs.existsSync(ORIGIN_DIR)) {
    fs.mkdirSync(ORIGIN_DIR, { recursive: true });
  }

  const processed = await processDirectory(ORIGIN_DIR, DEST_DIR);
  if (processed === 0) {
    console.log('ℹ️ La carpeta public/img/originales/ está lista pero vacía.');
    console.log('   Suelta aquí fotografías en alta resolución y vuelve a correr: npm run fotos');
  } else {
    console.log(`✅ ¡${processed} imágenes optimizadas y convertidas a WebP!`);
  }
}

main().catch(console.error);
