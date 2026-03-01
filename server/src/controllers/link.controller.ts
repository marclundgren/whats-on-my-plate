import { Request, Response, NextFunction } from 'express';
import linkService from '../services/link.service';
import { AppError } from '../middleware/error.middleware';
import {
  createLinkSchema,
  updateLinkSchema
} from '../services/validation.service';

export class LinkController {
  async createLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const result = createLinkSchema.safeParse(req.body);
      if (!result.success) {
        throw new AppError(result.error.errors[0].message, 400);
      }

      const link = await linkService.createLink(taskId, result.data);
      res.status(201).json(link);
    } catch (error) {
      if ((error as any).code === 'P2003') {
        next(new AppError('Task not found', 404));
      } else {
        next(error);
      }
    }
  }

  async updateLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId, linkId } = req.params;
      const result = updateLinkSchema.safeParse(req.body);
      if (!result.success) {
        throw new AppError(result.error.errors[0].message, 400);
      }

      const link = await linkService.updateLink(taskId, linkId, result.data);
      res.json(link);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        next(new AppError('Link not found', 404));
      } else {
        next(error);
      }
    }
  }

  async deleteLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId, linkId } = req.params;
      await linkService.deleteLink(taskId, linkId);
      res.status(204).send();
    } catch (error) {
      if ((error as any).code === 'P2025') {
        next(new AppError('Link not found', 404));
      } else {
        next(error);
      }
    }
  }
}

export default new LinkController();
