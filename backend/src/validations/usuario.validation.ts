import Joi from 'joi';

export const createUsuarioSchema = Joi.object({
  correo: Joi.string().email().required(),
  contraseña: Joi.string().min(6).max(255).required(),
  nombre: Joi.string().min(2).max(255).required(),
  rol: Joi.string().valid('registrado', 'publicante', 'administrador').optional(),
});

export const updateUsuarioSchema = Joi.object({
  correo: Joi.string().email().optional(),
  nombre: Joi.string().min(2).max(255).optional(),
  rol: Joi.string().valid('registrado', 'publicante', 'administrador').optional(),
});