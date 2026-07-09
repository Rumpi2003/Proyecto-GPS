import { type Request, type Response, type NextFunction } from 'express';
import { AppDataSource } from '../config/db.config.js';
import { Publicacion } from '../entities/publicacion.entity.js';

const publicacionRepository = AppDataSource.getRepository(Publicacion);

export async function esDueñoPublicacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id_publicacion);
    if (Number.isNaN(id)) {
        res.status(400).json({ status: 'error', message: 'id_publicación inválido' });
        return;
    }

    const publicacion = await publicacionRepository.findOne({
         where: { id_publicacion: id },
          relations: ['publicante'],
    });

    if (!publicacion)  {
        res.status(404).json({ status: 'error', message: 'Publicación no encontrada' });
        return;
    }

    if (!req.user || (publicacion.publicante.id_usuario !== req.user.id && req.user.rol !== 'administrador')) {
        res.status(403).json({ status: 'error', message: 'No tienes permiso para modificar esta publicación' });
        return;
    }
    next();
}