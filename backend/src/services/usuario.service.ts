import { AppDataSource } from '../config/db.config.js';
import { Usuario } from '../entities/usuario.entity.js';

const usuarioRepository = AppDataSource.getRepository(Usuario);

export async function findAll(): Promise<Usuario[]> {
  return await usuarioRepository.find();
}

export async function findById(id: number): Promise<Usuario | null> {
  return await usuarioRepository.findOneBy({ id_usuario: id });
}

export async function create(data: Partial<Usuario>): Promise<Usuario> {
  const usuario = usuarioRepository.create(data);
  return await usuarioRepository.save(usuario);
}

export async function update(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
  const usuario = await findById(id);
  if (!usuario) return null;

  usuarioRepository.merge(usuario, data);
  return await usuarioRepository.save(usuario);
}

export async function remove(id: number): Promise<boolean> {
  const result = await usuarioRepository.delete(id);
  return (result.affected ?? 0) > 0;
}

export async function findByCorreo(correo: string): Promise<Usuario | null> {
  return await usuarioRepository.findOneBy({ correo });
}