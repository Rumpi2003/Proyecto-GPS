import Joi from 'joi';

export const createValoracionSchema = Joi.object({
  id_publicacion: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID de la publicación debe ser un número',
    'any.required': 'El ID de la publicación es obligatorio',
  }),
  puntuacion: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'La puntuación debe ser un número',
    'number.min': 'La puntuación mínima es 1',
    'number.max': 'La puntuación máxima es 5',
    'any.required': 'La puntuación es obligatoria',
  }),
});