import { type Request, type Response, type NextFunction } from 'express';
import { type ObjectSchema } from 'joi';
import { sendError } from '../handlers/responseHandlers.js';

export const validateSchema = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map((d) => d.message).join(', ');
      sendError(res, errorMessage, 400);
      return;
    }
    
    // Reemplazamos el body con los datos ya validados y limpios
    req.body = value; 
    next();
  };
};