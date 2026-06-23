import { AppDataSource } from '../config/db.config.js';
import { Usuario } from '../entities/usuario.entity.js';

const usuarioRepository = AppDataSource.getRepository(Usuario);

export async function obtenerTodos(): Promise<Usuario[]> {
  return await usuarioRepository.find();
}

export async function obtenerPorId(id: number): Promise<Usuario | null> {
  return await usuarioRepository.findOneBy({ id_usuario: id });
}

export async function crear(data: Partial<Usuario>): Promise<Usuario> {
  const usuario = usuarioRepository.create(data);
  return await usuarioRepository.save(usuario);
}

export async function actualizar(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
  const usuario = await obtenerPorId(id);
  if (!usuario) return null;

  usuarioRepository.merge(usuario, data);
  return await usuarioRepository.save(usuario);
}

export async function eliminar(id: number): Promise<boolean> {
  const result = await usuarioRepository.delete(id);
  return (result.affected ?? 0) > 0;
}

export async function obtenerPorCorreo(correo: string): Promise<Usuario | null> {
  return await usuarioRepository.findOneBy({ correo });
}