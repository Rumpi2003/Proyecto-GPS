import multer from 'multer';
import { type Request, type Response, type NextFunction } from 'express';
import { unlinkSync } from 'fs';
import { upload } from '../config/multer.config.js';
import { compressImage } from '../utils/compressImage.js';

/**
 * Elimina del disco todos los archivos que multer ya escribió en req.files.
 * Se llama cuando la validación posterior (o la del propio middleware) falla
 * y los archivos no deben persistir como basura.
 */
export function eliminarArchivosSubidos(req: Request): void {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  if (!files) return;

  for (const field of Object.keys(files)) {
    const fieldFiles = files[field];
    if (!fieldFiles) continue;
    for (const file of fieldFiles) {
      try {
        unlinkSync(file.path);
      } catch {
        // El archivo pudo no haberse escrito aún o ya no existe — se ignora
      }
    }
  }
}

/**
 * Middleware combinado: multer + compresión + validación de cantidad.
 *
 * Uso en rutas:
 *   router.post('/', authenticate, esRegistradoPublicante, uploadPublicacion, crearPublicacion);
 */
export function uploadPublicacion(req: Request, res: Response, next: NextFunction) {
  upload.fields([
    { name: 'portada', maxCount: 1 },
    { name: 'fotos', maxCount: 4 },
  ])(req, res, async (err) => {
    if (err) {
      eliminarArchivosSubidos(req);

      const message =
        err instanceof multer.MulterError
          ? err.code === 'LIMIT_FILE_SIZE'
            ? 'La imagen supera el tamaño máximo de 30 MB'
            : err.code === 'LIMIT_UNEXPECTED_FILE'
              ? 'Demasiados archivos. Máximo 4 fotos adicionales'
              : err.message
          : err.message;

      res.status(400).json({ status: 'error', message: [message] });
      return;
    }

    // Multer con fields() pone todo en req.files como { [fieldname]: File[] }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const portadaFile = files?.['portada']?.[0];
    const fotosFiles = files?.['fotos'] ?? [];

    if (!portadaFile) {
      eliminarArchivosSubidos(req);
      res.status(400).json({ status: 'error', message: ['La foto de portada es obligatoria'] });
      return;
    }

    const totalFotos = 1 + fotosFiles.length;
    if (totalFotos > 5) {
      eliminarArchivosSubidos(req);
      res.status(400).json({ status: 'error', message: ['Máximo 5 fotos por publicación (portada + 4 adicionales)'] });
      return;
    }

    // Compresión — no bloqueamos la respuesta
    const todas = [portadaFile, ...fotosFiles].filter((f): f is Express.Multer.File => f != null);
    Promise.all(todas.map((f) => compressImage(f.path))).catch((e) => {
      console.error('Error comprimiendo imágenes:', e);
    });

    next();
  });
}

/**
 * Middleware para ACTUALIZAR publicación — portada es OPCIONAL.
 * Solo comprime y valida si se subieron archivos.
 */
export function uploadPublicacionUpdate(req: Request, res: Response, next: NextFunction) {
  upload.fields([
    { name: 'portada', maxCount: 1 },
    { name: 'fotos', maxCount: 4 },
  ])(req, res, async (err) => {
    if (err) {
      eliminarArchivosSubidos(req);

      const message =
        err instanceof multer.MulterError
          ? err.code === 'LIMIT_FILE_SIZE'
            ? 'La imagen supera el tamaño máximo de 30 MB'
            : err.code === 'LIMIT_UNEXPECTED_FILE'
              ? 'Demasiados archivos. Máximo 4 fotos adicionales'
              : err.message
          : err.message;

      res.status(400).json({ status: 'error', message: [message] });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const portadaFile = files?.['portada']?.[0];
    const fotosFiles = files?.['fotos'] ?? [];

    // Portada es OPCIONAL en actualización — solo validar si se subió
    if (fotosFiles.length > 4) {
      eliminarArchivosSubidos(req);
      res.status(400).json({ status: 'error', message: ['Máximo 4 fotos adicionales'] });
      return;
    }

    // Compresión — no bloqueamos la respuesta
    const todas = [portadaFile, ...fotosFiles].filter((f): f is Express.Multer.File => f != null);
    if (todas.length > 0) {
      Promise.all(todas.map((f) => compressImage(f.path))).catch((e) => {
        console.error('Error comprimiendo imágenes:', e);
      });
    }

    next();
  });
}
