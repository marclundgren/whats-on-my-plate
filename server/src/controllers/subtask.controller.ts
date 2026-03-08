import { Request, Response, NextFunction } from 'express';
import subtaskService from '../services/subtask.service';
import taskService from '../services/task.service';
import { AppError } from '../middleware/error.middleware';
import {
  createSubtaskSchema,
  updateSubtaskSchema
} from '../services/validation.service';

export class SubtaskController {
  async createSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      if (!await taskService.verifyTaskOwnership(taskId, req.userId)) {
        return next(new AppError('Task not found', 404));
      }

      const result = createSubtaskSchema.safeParse(req.body);
      if (!result.success) {
        throw new AppError(result.error.errors[0].message, 400);
      }

      const subtask = await subtaskService.createSubtask(taskId, result.data);
      res.status(201).json(subtask);
    } catch (error) {
      if ((error as any).code === 'P2003') {
        next(new AppError('Task not found', 404));
      } else {
        next(error);
      }
    }
  }

  async updateSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      const subtaskId = req.params.subtaskId as string;
      if (!await taskService.verifyTaskOwnership(taskId, req.userId)) {
        return next(new AppError('Task not found', 404));
      }

      const result = updateSubtaskSchema.safeParse(req.body);
      if (!result.success) {
        throw new AppError(result.error.errors[0].message, 400);
      }

      const subtask = await subtaskService.updateSubtask(taskId, subtaskId, result.data);
      res.json(subtask);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        next(new AppError('Subtask not found', 404));
      } else {
        next(error);
      }
    }
  }

  async toggleCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      const subtaskId = req.params.subtaskId as string;
      if (!await taskService.verifyTaskOwnership(taskId, req.userId)) {
        return next(new AppError('Task not found', 404));
      }

      const subtask = await subtaskService.toggleSubtaskCompletion(taskId, subtaskId);
      if (!subtask) {
        throw new AppError('Subtask not found', 404);
      }

      res.json(subtask);
    } catch (error) {
      next(error);
    }
  }

  async deleteSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      const subtaskId = req.params.subtaskId as string;
      if (!await taskService.verifyTaskOwnership(taskId, req.userId)) {
        return next(new AppError('Task not found', 404));
      }

      await subtaskService.deleteSubtask(taskId, subtaskId);
      res.status(204).send();
    } catch (error) {
      if ((error as any).code === 'P2025') {
        next(new AppError('Subtask not found', 404));
      } else {
        next(error);
      }
    }
  }
}

export default new SubtaskController();
