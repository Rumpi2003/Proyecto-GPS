import { type Request, type Response } from 'express';
import * as usuarioService from '../services/usuario.service.js';
import { sendSuccess, sendError } from '../handlers/usuario.handler.js';
import {
  createUsuarioSchema,
  updateUsuarioSchema,
} from '../validations/usuario.validation.js';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const usuarios = await usuarioService.findAll();
    sendSuccess(res, usuarios, 'Usuarios obtenidos correctamente');
  } catch (error) {
    sendError(res, 'Error al obtener usuarios');
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      sendError(res, 'ID inválido', 400);
      return;
    }

    const usuario = await usuarioService.findById(id);
    if (!usuario) {
      sendError(res, 'Usuario no encontrado', 404);
      return;
    }

    sendSuccess(res, usuario, 'Usuario obtenido correctamente');
  } catch (error) {
    sendError(res, 'Error al obtener usuario');
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { error, value } = createUsuarioSchema.validate(req.body, { abortEarly: false });
    if (error) {
      sendError(res, error.details.map((d) => d.message).join(', '), 400);
      return;
    }

    const usuario = await usuarioService.create(value);
    sendSuccess(res, usuario, 'Usuario creado correctamente', 201);
  } catch (error) {
    sendError(res, 'Error al crear usuario');
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      sendError(res, 'ID inválido', 400);
      return;
    }

    const { error, value } = updateUsuarioSchema.validate(req.body, { abortEarly: false });
    if (error) {
      sendError(res, error.details.map((d) => d.message).join(', '), 400);
      return;
    }

    const usuario = await usuarioService.update(id, value);
    if (!usuario) {
      sendError(res, 'Usuario no encontrado', 404);
      return;
    }

    sendSuccess(res, usuario, 'Usuario actualizado correctamente');
  } catch (error) {
    sendError(res, 'Error al actualizar usuario');
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      sendError(res, 'ID inválido', 400);
      return;
    }

    const deleted = await usuarioService.remove(id);
    if (!deleted) {
      sendError(res, 'Usuario no encontrado', 404);
      return;
    }

    sendSuccess(res, null, 'Usuario eliminado correctamente');
  } catch (error) {
    sendError(res, 'Error al eliminar usuario');
  }
}