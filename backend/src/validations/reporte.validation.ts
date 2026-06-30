import Joi from 'joi';
import { Motivo, Estado } from '../entities/reporte.entity.js';

export const createReporteSchema = Joi.object({
  id_publicacion: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID de la publicación debe ser un número',
    'any.required': 'El ID de la publicación es obligatorio',
  }),
  motivo: Joi.string().valid(...Object.values(Motivo)).required().messages({
    'any.only': `El motivo debe ser uno de los siguientes: ${Object.values(Motivo).join(', ')}`,
    'any.required': 'El motivo es obligatorio',
  }),
  detalle: Joi.string().max(255).optional().allow(null, '').messages({
    'string.max': 'El detalle no puede superar los 255 caracteres',
  }),
});

export const evaluarReporteSchema = Joi.object({
  estado: Joi.string().valid(Estado.EN_REVISION, Estado.RESUELTO, Estado.DESESTIMADO).required().messages({
    'any.only': 'El estado debe ser válido para evaluación',
    'any.required': 'El estado es obligatorio para evaluar',
  }),
});