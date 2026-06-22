import { type Request, type Response } from 'express';
import Joi from 'joi';
import * as usuarioService from '../services/usuario.service.js';
import { hashPassword, comparePassword, generateToken } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../handlers/usuario.handler.js';
import { Rol } from '../entities/usuario.entity.js';

const registerSchema = Joi.object({
  correo: Joi.string().email().required(),
  contraseña: Joi.string().min(6).max(255).required(),
  nombre: Joi.string().min(2).max(255).required(),
});

const loginSchema = Joi.object({
  correo: Joi.string().email().required(),
  contraseña: Joi.string().required(),
});

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      sendError(res, error.details.map((d: { message: string }) => d.message).join(', '), 400);
      return;
    }

    const existente = await usuarioService.findByCorreo(value.correo);
    if (existente) {
      sendError(res, 'El correo ya está registrado', 409);
      return;
    }

    const hashed = await hashPassword(value.contraseña);
    const usuario = await usuarioService.create({
      correo: value.correo,
      contraseña: hashed,
      nombre: value.nombre,
      rol: Rol.REGISTRADO,
    });

    const token = generateToken({ id: usuario.id_usuario, rol: usuario.rol });
    sendSuccess(res, { usuario, token }, 'Registro exitoso', 201);
  } catch {
    sendError(res, 'Error al registrar usuario');
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      sendError(res, error.details.map((d: { message: string }) => d.message).join(', '), 400);
      return;
    }

    const usuario = await usuarioService.findByCorreo(value.correo);
    if (!usuario) {
      sendError(res, 'Credenciales inválidas', 401);
      return;
    }

    const valida = await comparePassword(value.contraseña, usuario.contraseña);
    if (!valida) {
      sendError(res, 'Credenciales inválidas', 401);
      return;
    }

    const token = generateToken({ id: usuario.id_usuario, rol: usuario.rol });
    sendSuccess(res, { usuario, token }, 'Inicio de sesión exitoso');
  } catch {
    sendError(res, 'Error al iniciar sesión');
  }
}

//==========================================
//usuario admin inicial
export async function setupAdmin(req: Request, res: Response): Promise<void> {
  try {
    const existente = await usuarioService.findByCorreo('admin@gmail.com');
    if (existente) {
      sendError(res, 'El admin ya existe', 409);
      return;
    }

    const hashed = await hashPassword('admin123');
    const usuario = await usuarioService.create({
      correo: 'admin@gmail.com',
      contraseña: hashed,
      nombre: 'admin',
      rol: Rol.ADMINISTRADOR,
    });

    const token = generateToken({ id: usuario.id_usuario, rol: usuario.rol });
    sendSuccess(res, { usuario, token }, 'Admin creado exitosamente', 201);
  } catch {
    sendError(res, 'Error al crear admin');
  }
}