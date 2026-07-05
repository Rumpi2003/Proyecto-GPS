import { type Request, type Response } from 'express';
import Joi from 'joi';
import * as usuarioService from '../services/usuario.service.js';
import { encriptarContraseña, compararContraseña, generarToken } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../handlers/responseHandlers.js';
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

export async function registrarUsuario(req: Request, res: Response): Promise<void> {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      sendError(res, error.details.map((d: { message: string }) => d.message).join(', '), 400);
      return;
    }

    const existente = await usuarioService.obtenerPorCorreo(value.correo);
    if (existente) {
      sendError(res, 'El correo ya está registrado', 409);
      return;
    }

    const hashed = await encriptarContraseña(value.contraseña);
    const usuario = await usuarioService.crear({
      correo: value.correo,
      contraseña: hashed,
      nombre: value.nombre,
      rol: Rol.REGISTRADO,
    });

    const token = generarToken({ id: usuario.id_usuario, rol: usuario.rol });
    sendSuccess(res, { usuario, token }, 'Registro exitoso', 201);

    res.cookie('jwt-auth', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
      path: '/',
    });      
  } catch {
    sendError(res, 'Error al registrar usuario');
  }
}

export async function iniciarSesion(req: Request, res: Response): Promise<void> {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      sendError(res, error.details.map((d: { message: string }) => d.message).join(', '), 400);
      return;
    }

    const usuario = await usuarioService.obtenerPorCorreo(value.correo);
    if (!usuario) {
      sendError(res, 'Credenciales inválidas', 401);
      return;
    }

    const valida = await compararContraseña(value.contraseña, usuario.contraseña);
    if (!valida) {
      sendError(res, 'Credenciales inválidas', 401);
      return;
    }

    const token = generarToken({ id: usuario.id_usuario, rol: usuario.rol });
    sendSuccess(res, { usuario, token }, 'Inicio de sesión exitoso');

    res.cookie('jwt-auth', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
      path: '/',
    });
  } catch {
    sendError(res, 'Error al iniciar sesión');
  }
}
