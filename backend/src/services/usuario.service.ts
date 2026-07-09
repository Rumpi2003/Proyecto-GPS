import { AppDataSource } from '../config/db.config.js';
import { Usuario, Rol } from '../entities/usuario.entity.js';
import { encriptarContraseña } from './auth.service.js';

const usuarioRepository = AppDataSource.getRepository(Usuario);

// Campos seguros para exponer en la API (nunca se devuelve el hash de la contraseña)
const SAFE_SELECT: (keyof Usuario)[] = ['id_usuario', 'correo', 'nombre', 'rol', 'fecha_registro'];

export async function obtenerTodos(): Promise<Omit<Usuario, 'contraseña'>[]> {
  return await usuarioRepository.find({ select: SAFE_SELECT });
}

export async function obtenerPorId(id: number): Promise<Omit<Usuario, 'contraseña'> | null> {
  return await usuarioRepository.findOne({ where: { id_usuario: id }, select: SAFE_SELECT });
}

export async function crear(data: Partial<Usuario>): Promise<Omit<Usuario, 'contraseña'>> {
  const usuario = usuarioRepository.create(data);
  const guardado = await usuarioRepository.save(usuario);
  const { contraseña, ...usuarioSeguro } = guardado;
  return usuarioSeguro;
}

export async function actualizar(id: number, data: Partial<Usuario>): Promise<Omit<Usuario, 'contraseña'> | null> {
  const usuario = await usuarioRepository.findOneBy({ id_usuario: id });
  if (!usuario) return null;

  usuarioRepository.merge(usuario, data);
  const guardado = await usuarioRepository.save(usuario);
  const { contraseña, ...usuarioSeguro } = guardado;
  return usuarioSeguro;
}

export async function eliminar(id: number): Promise<boolean> {
  const result = await usuarioRepository.delete(id);
  return (result.affected ?? 0) > 0;
}

export async function obtenerPorCorreo(correo: string): Promise<Usuario | null> {
  return await usuarioRepository.findOneBy({ correo });
}

export async function crearAdminSiNoExiste(correo: string, nombre: string, contraseña: string): Promise<void> {
  const existente = await obtenerPorCorreo(correo);
  if (existente) {
    console.log(`Admin ya existe: ${correo}`);
    return;
  }

  const hashed = await encriptarContraseña(contraseña);
  await crear({
    correo,
    contraseña: hashed,
    nombre,
    rol: Rol.ADMINISTRADOR,
  });

  console.log(`Admin inicial creado: ${correo}`);
}