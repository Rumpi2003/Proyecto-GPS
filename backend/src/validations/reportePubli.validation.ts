import Joi from 'joi';
import { Motivo, Estado } from '../entities/reportePubli.entity.js';

export const createReportePubliSchema = Joi.object({
  id_publicacion: Joi.number().integer().positive().required(),
  motivo: Joi.string().valid(...Object.values(Motivo)).required(),
  detalle: Joi.string().max(255).optional().allow(null, ''),
});

export const evaluarReportePubliSchema = Joi.object({
  estado: Joi.string().valid(Estado.PENDIENTE, Estado.CONFIRMADO, Estado.DESESTIMADO, Estado.ARCHIVADO).required(),
});