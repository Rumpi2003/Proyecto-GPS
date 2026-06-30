import Joi from 'joi';

export const createComentarioSchema = Joi.object({
  id_publicacion: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID de la publicación debe ser un número',
    'any.required': 'El ID de la publicación es obligatorio',
  }),
  texto: Joi.string().max(255).required().messages({
    'string.empty': 'El comentario no puede estar vacío',
    'string.max': 'El comentario no puede exceder los 255 caracteres',
    'any.required': 'El texto del comentario es obligatorio',
  }),
});