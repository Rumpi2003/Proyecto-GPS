import { AppDataSource } from "../config/db.config.js";
import { Publicacion, Estado } from "../entities/publicacion.entity.js"
import { Cercania } from "../entities/cercania.entity.js"
import { Foto } from "../entities/foto.entity.js"
import { unlink } from 'fs/promises';
import { resolve, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicacionRepository = AppDataSource.getRepository(Publicacion);
const cercaniaRepository = AppDataSource.getRepository(Cercania);
const fotoRepository = AppDataSource.getRepository(Foto);

type PublicacionFiltros = {
    id_universidad: number;
    distancia_max?: number;
    ids_etiquetas?: number[];
    precio_max?: number;
    valoracion_min?: number;
}

/** Convierte una url_foto de BD (ej: /uploads/abc.jpg) a la ruta absoluta en disco */
function rataAbsolutaFoto(url_foto: string): string {
    const archivo = basename(url_foto);
    return resolve(__dirname, '../../uploads', archivo);
}

/** Borra un archivo físico si existe, ignora si no está */
async function borrarArchivo(url_foto: string): Promise<void> {
    try {
        await unlink(rataAbsolutaFoto(url_foto));
    } catch {
        // El archivo ya no existe, no es un error
    }
}

export class PublicacionService {
    // CRUDs para manejar las publicaciones
    
    private repository = publicacionRepository;

    async create(data: Partial<Publicacion>) {
        const publicacion = this.repository.create(data);
        return this.repository.save(publicacion);
    }

    // Filtros por los que se buscan las publicaciones
    // 1.Cercania a una universidad en concreto (ej. retornar publicaciones que estén a máximo 2km de la UBB)
    // 2.Etiquetas (ej. retornar publicaciones que tengan todas las etiquetas seleccionadas)
    // 3.Precio (ej. retornar publicaciones que tengan un precio máximo de 160.000)
    // 4.Valoración (ej. retornar publicaciones que tengan como mínimo 3 puntos de 5)

    async findByFiltros(filtros: PublicacionFiltros) {
        const { id_universidad, distancia_max , ids_etiquetas, precio_max, valoracion_min } = filtros;

        const consulta = this.repository
            .createQueryBuilder('publicacion')
            .leftJoinAndSelect('publicacion.etiquetas', 'etiqueta')
            .leftJoinAndSelect('publicacion.fotos', 'foto')
            .leftJoinAndSelect('publicacion.cercanias', 'cercania')
            .andWhere('cercania.id_universidad = :id_universidad', { id_universidad })
            .andWhere('publicacion.estado = :estado', { estado: Estado.ACTIVA });


        if (precio_max != null) {
            consulta.andWhere('publicacion.precio <= :precio_max', { precio_max });
        }

        if (valoracion_min != null) {
            consulta.andWhere('publicacion.promedio_valoracion >= :valoracion_min', { valoracion_min});
        }

        if (distancia_max != null) {
            consulta.andWhere('cercania.distancia_metros <= :distancia_max', { distancia_max });
        }

        if (ids_etiquetas?.length) {
            consulta.andWhere((qb) => {
                const subconsulta = qb.subQuery()
                    .select('pe.id_publicacion')
                    .from('publicacion_etiqueta', 'pe')
                    .where('pe.id_etiqueta IN (:...ids_etiquetas)', { ids_etiquetas })
                    .groupBy('pe.id_publicacion')
                    .having('COUNT(DISTINCT pe.id_etiqueta) = :cantidad_etiquetas', {
                        cantidad_etiquetas: ids_etiquetas.length,
                    })
                    .getQuery();
                
                return `publicacion.id_publicacion IN ${subconsulta}`;
            });
        }

        return consulta.getMany();
    }

    async findOne(id_publicacion: number) {
        return this.repository.findOne({
            where: { id_publicacion },
            relations: ['publicante', 'etiquetas', 'fotos', 'cercanias', 'cercanias.universidad'],
        });
    }

    async findOneDetalle(id_publicacion: number) {
        return this.repository.findOne({
            where: { id_publicacion },
            relations: [
                'publicante',
                'etiquetas',
                'fotos',
                'comentarios',
                'comentarios.usuario',
                'cercanias',
                'cercanias.universidad',]
        });
    }

    async findByPublicante(id_publicante: number) {
        return this.repository.find({
            where: { publicante: { id_usuario: id_publicante} },
            relations: ['publicante', 'etiquetas', 'fotos', 'cercanias', 'cercanias.universidad'],
        });
    }

    async findByPublicanteActivas(id_publicante: number) {
        return this.repository.find({
            where: {
                 publicante: { id_usuario: id_publicante},
                estado: Estado.ACTIVA,
             },
            relations: ['publicante', 'etiquetas', 'fotos', 'cercanias'],
        });
    }

    async findByPublicanteInactivas(id_publicante: number) {
        return this.repository.find({
            where: {
                 publicante: { id_usuario: id_publicante},
                estado: Estado.INACTIVA,
             },
            relations: ['publicante', 'etiquetas', 'fotos', 'cercanias'],
        });
    }

    async update(id_publicacion: number, data: Partial<Publicacion>) {
        const publicacion = await this.repository.findOneBy({ id_publicacion });
        if (!publicacion) throw new Error('Publicación no encontrada');

        await this.repository.update(id_publicacion, data);
        return this.repository.findOne({
            where: { id_publicacion },
            relations: ['publicante', 'etiquetas', 'fotos'],
        });
    }

    async delete(id_publicacion: number) {
        const publicacion = await this.repository.findOne({
            where: { id_publicacion },
            relations: ['fotos'],
        });
        if (!publicacion) throw new Error('Publicacion no encontrada');

        // Borrar archivos físicos antes de eliminar la publicación
        for (const foto of publicacion.fotos ?? []) {
            await borrarArchivo(foto.url_foto);
        }

        return this.repository.remove(publicacion);
    }

    // Método para crear la cercanía una vez se valída la distancia mínima con universidad
    // debería de ser llamado desde la funcion para crear una publicación en el controlador
    async createCercania(id_publicacion: number, id_universidad: number, distancia_metros: number) {
        const cercania = cercaniaRepository.create({
            id_publicacion,
            id_universidad,
            distancia_metros,
        });

        return cercaniaRepository.save(cercania);
    }

    // Métodos para añadir y eliminar fotos de una publicación, estos se usan para que el usuario 
    // publicador pueda manejar las fotos de sus publicaciones.
    async addFoto(id_publicacion: number, url_foto: string, es_portada = false) {
        const publicacion = await this.repository.findOneBy({ id_publicacion });
        if (!publicacion) throw new Error('Publicación no encontrada');

        const foto = fotoRepository.create({
            publicacion,
            url_foto,
            es_portada
        });

        return fotoRepository.save(foto);
    }

    async removeFoto(id_foto: number) {
        const foto = await fotoRepository.findOneBy({ id_foto });
        if (!foto) throw new Error('Foto no encontrada');

        // Borrar archivo físico antes de eliminar el registro
        await borrarArchivo(foto.url_foto);

        return fotoRepository.remove(foto);
    }
}
