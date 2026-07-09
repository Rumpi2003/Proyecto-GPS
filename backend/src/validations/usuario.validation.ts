import Joi from 'joi';

export const createUsuarioSchema = Joi.object({
  correo: Joi.string().email().required().messages({
    'string.empty': 'El correo es obligatorio',
    'any.required': 'El correo es obligatorio',
    'string.email': 'El formato del correo no es válido',
  }),
  contraseña: Joi.string().min(6).max(255).required().messages({
    'string.empty': 'La contraseña es obligatoria',
    'any.required': 'La contraseña es obligatoria',
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'string.max': 'La contraseña no puede tener más de 255 caracteres',
  }),
  nombre: Joi.string().min(3).max(255).pattern(/^[a-zA-ZÁáÉéÍíÓóÚúÑñüÜ\s]+$/).required().messages({
    'string.empty': 'El nombre es obligatorio',
    'any.required': 'El nombre es obligatorio',
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede tener más de 255 caracteres',
    'string.pattern.base': 'El nombre solo puede contener letras',
  }),
  rol: Joi.string().valid('registrado', 'publicante', 'administrador').optional(),
});

export const updateUsuarioSchema = Joi.object({
  correo: Joi.string().email().optional().messages({
    'string.email': 'El formato del correo no es válido',
  }),
  nombre: Joi.string().min(3).max(255).pattern(/^[a-zA-ZÁáÉéÍíÓóÚúÑñüÜ\s]+$/).optional().messages({
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede tener más de 255 caracteres',
    'string.pattern.base': 'El nombre solo puede contener letras',
  }),
  rol: Joi.string().valid('registrado', 'publicante', 'administrador').optional(),
});