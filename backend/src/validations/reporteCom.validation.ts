import Joi from 'joi';
import { MotivoComentario, EstadoReporte } from '../entities/reporteCom.entity.js';

export const createReporteComSchema = Joi.object({
  id_comentario: Joi.number().integer().positive().required(),
  motivo: Joi.string().valid(...Object.values(MotivoComentario)).required(),
  detalle: Joi.string().max(255).optional().allow(null, ''),
});

export const evaluarReporteComSchema = Joi.object({
  estado: Joi.string().valid(EstadoReporte.PENDIENTE, EstadoReporte.CONFIRMADO, EstadoReporte.DESESTIMADO, EstadoReporte.ARCHIVADO).required(),
});