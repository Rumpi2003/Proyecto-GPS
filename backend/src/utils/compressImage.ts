import sharp from 'sharp';
import { extname } from 'path';
import { unlink, rename } from 'fs/promises';

/**
 * Comprime una imagen subida y la reemplaza en el mismo path.
 * - Redimensiona si el lado más largo supera 1920px (sin agrandar más chicas)
 * - Comprime JPEG a calidad 80, PNG a compressionLevel 8
 * - Si es PNG sin transparencia, lo convierte a JPEG para ahorrar espacio
 */
export async function compressImage(filePath: string): Promise<void> {
  const ext = extname(filePath).toLowerCase();
  const tempPath = filePath + '.tmp';

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    let pipeline = image;

    // Redimensionar si excede 1920px en el lado más largo
    if (
      (metadata.width && metadata.width > 1920) ||
      (metadata.height && metadata.height > 1920)
    ) {
      pipeline = pipeline.resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    if (ext === '.png') {
      // Verificar si tiene transparencia
      const hasAlpha = metadata.hasAlpha;

      if (hasAlpha) {
        // PNG con transparencia → mantener PNG comprimido
        await pipeline.png({ compressionLevel: 8 }).toFile(tempPath);
      } else {
        // PNG sin transparencia → convertir a JPEG (más liviano)
        await pipeline.jpeg({ quality: 80, mozjpeg: true }).toFile(tempPath);
      }
    } else {
      // JPEG / JPG
      await pipeline.jpeg({ quality: 80, mozjpeg: true }).toFile(tempPath);
    }

    // Reemplazar el original por el comprimido
    await unlink(filePath);
    await rename(tempPath, filePath);
  } catch (err) {
    // Si algo falla, limpiar el temporal si existe
    try { await unlink(tempPath); } catch { /* ignora */ }
    throw err;
  }
}
