import Joi from 'joi';
import { Estado } from '../entities/publicacion.entity.js';

export const createPublicacionSchema = Joi.object({
  place_id: Joi.string().trim().required().messages({
    'string.empty': 'La dirección es obligatoria',
    'any.required': 'La dirección es obligatoria',
  }),
  titulo: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'El título es obligatorio',
    'any.required': 'El título es obligatorio',
    'string.min': 'El título debe tener al menos 3 caracteres',
    'string.max': 'El título no puede tener más de 255 caracteres',
  }),
  descripcion: Joi.string().min(10).max(255).required().messages({
    'string.empty': 'La descripción es obligatoria',
    'any.required': 'La descripción es obligatoria',
    'string.min': 'La descripción debe tener al menos 10 caracteres',
    'string.max': 'La descripción no puede tener más de 255 caracteres',
  }),
  precio: Joi.number().integer().min(0).required().messages({
    'number.base': 'El precio debe ser un número',
    'number.integer': 'El precio debe ser un número entero',
    'number.min': 'El precio no puede ser negativo',
    'any.required': 'El precio es obligatorio',
  }),
  telefono: Joi.string().trim().min(7).max(20).required().messages({
    'string.empty': 'El teléfono es obligatorio',
    'any.required': 'El teléfono es obligatorio',
    'string.min': 'El teléfono debe tener al menos 7 caracteres',
    'string.max': 'El teléfono no puede tener más de 20 caracteres',
  }),
  permitir_comentarios: Joi.boolean().default(false),
  url_fotos: Joi.array().items(Joi.string().uri().messages({
    'string.uri': 'Cada foto debe ser una URL válida',
  })).default([]),
  url_portada: Joi.string().uri().required().messages({
    'string.empty': 'La foto de portada es obligatoria',
    'any.required': 'La foto de portada es obligatoria',
    'string.uri': 'La foto de portada debe ser una URL válida',
  }),
  etiquetas: Joi.array().items(Joi.number().integer().positive()).default([]),
});

export const updatePublicacionSchema = Joi.object({
  titulo: Joi.string().min(3).max(255).messages({
    'string.min': 'El título debe tener al menos 3 caracteres',
    'string.max': 'El título no puede tener más de 255 caracteres',
  }),
  descripcion: Joi.string().min(10).max(255).messages({
    'string.min': 'La descripción debe tener al menos 10 caracteres',
    'string.max': 'La descripción no puede tener más de 255 caracteres',
  }),
  precio: Joi.number().integer().min(0).messages({
    'number.base': 'El precio debe ser un número',
    'number.integer': 'El precio debe ser un número entero',
    'number.min': 'El precio no puede ser negativo',
  }),
  telefono: Joi.string().trim().min(7).max(20).messages({
    'string.min': 'El teléfono debe tener al menos 7 caracteres',
    'string.max': 'El teléfono no puede tener más de 20 caracteres',
  }),
  permitir_comentarios: Joi.boolean(),
  estado: Joi.string().valid(Estado.ACTIVA, Estado.INACTIVA, Estado.ELIMINADA),
  eliminar_fotos: Joi.array().items(Joi.number().integer().positive()).default([]),
  nuevas_fotos: Joi.array().items(Joi.string().uri().messages({
    'string.uri': 'Cada foto debe ser una URL válida',
  })).default([]),
  eliminar_etiquetas: Joi.array().items(Joi.number().integer().positive()).default([]),
  nuevas_etiquetas: Joi.array().items(Joi.number().integer().positive()).default([]),
}).min(1);

export const idPublicacionParamSchema = Joi.object({
  id_publicacion: Joi.number().integer().positive().required(),
});

export const idUsuarioParamSchema = Joi.object({
  id_usuario: Joi.number().integer().positive().required(),
});

export const filtrosPublicacionSchema = Joi.object({
  id_universidad: Joi.number().integer().positive().required(),
  distancia_max: Joi.number().positive(),
  precio_max: Joi.number().min(0),
  valoracion_min: Joi.number().min(0).max(5),
  ids_etiquetas: Joi.string().pattern(/^\d+(,\d+)*$/),
});