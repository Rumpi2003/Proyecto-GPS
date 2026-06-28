import Joi from 'joi';
import { Estado } from '../entities/publicacion.entity.js';

export const createPublicacionSchema = Joi.object({
  place_id: Joi.string().trim().required(),
  titulo: Joi.string().min(3).max(255).required(),
  descripcion: Joi.string().min(10).max(255).required(),
  precio: Joi.number().integer().min(0).required(),
  telefono: Joi.string().trim().min(7).max(20).required(),
  permitir_comentarios: Joi.boolean().default(false),
  url_fotos: Joi.array().items(Joi.string().uri()).default([]),
  url_portada: Joi.string().uri().required(),
  etiquetas: Joi.array().items(Joi.number().integer().positive()).default([]),
});

export const updatePublicacionSchema = Joi.object({
  titulo: Joi.string().min(3).max(255),
  descripcion: Joi.string().min(10).max(255),
  precio: Joi.number().integer().min(0),
  telefono: Joi.string().trim().min(7).max(20),
  permitir_comentarios: Joi.boolean(),
  estado: Joi.string().valid(Estado.ACTIVA, Estado.INACTIVA, Estado.ELIMINADA),
  eliminar_fotos: Joi.array().items(Joi.number().integer().positive()).default([]),
  nuevas_fotos: Joi.array().items(Joi.string().uri()).default([]),
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