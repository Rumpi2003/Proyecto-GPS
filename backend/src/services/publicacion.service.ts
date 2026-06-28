import { AppDataSource } from "../config/db.config.js";
import { Publicacion, Estado } from "../entities/publicacion.entity.js"
import { Cercania } from "../entities/cercania.entity.js"
import { Foto } from "../entities/foto.entity.js"

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
            relations: ['publicante', 'etiquetas', 'fotos'],
        });
    }

    async findByPublicante(id_publicante: number) {
        return this.repository.find({
            where: { publicante: { id_usuario: id_publicante} },
            relations: ['publicante', 'etiquetas', 'fotos'],
        });
    }

    async findByPublicanteActivas(id_publicante: number) {
        return this.repository.find({
            where: {
                 publicante: { id_usuario: id_publicante},
                estado: Estado.ACTIVA,
             },
            relations: ['publicante', 'etiquetas', 'fotos'],
        });
    }

    async findByPublicanteInactivas(id_publicante: number) {
        return this.repository.find({
            where: {
                 publicante: { id_usuario: id_publicante},
                estado: Estado.INACTIVA,
             },
            relations: ['publicante', 'etiquetas', 'fotos'],
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
        const publicacion = await this.repository.findOneBy({ id_publicacion });
        if (!publicacion) throw new Error('Publicacion no encontrada');
        return this.repository.remove(publicacion);
    }

    // Falta método para que el admin "elimine" una publicación, es decir, no borrarla de la
    // base de datos si no que dejarla en estado "eliminada". esto sería para que no se eliminen
    // los reportes junto con las publicaciones (otra opción es sacar el OnDelete Cascade).

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
        return fotoRepository.remove(foto);
    }
}

// Middlewares necesarios para publicaciones:
// 1.De autenticación para que solo un usuario registrado o publicador las pueda crear
// 2.De negocio para ver que la dirección ([calle] [número], [comuna]) no se repita con otra.
// 3.De negocio para verificar que la dirección que se ingreso este a una distancia mínima de una
// universidad registrada.

// Flujo para la creación de una publicación:
// 1.El usuario ingresa la dirección y se verifica que esta cumpla con las reglas de negocio.
// 2.El usuario ingresa los campos (titulo, contacto, descripción, etc), las fotos y las etiquetas.
