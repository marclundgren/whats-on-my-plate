import { Request, Response, NextFunction } from 'express';
import taskService from '../services/task.service';
import { AppError } from '../middleware/error.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema
} from '../services/validation.service';

export class TaskController {
  async getAllTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const queryResult = taskQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw new AppError('Invalid query parameters', 400);
      }

      const tasks = await taskService.getAllTasks(queryResult.data);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);

      if (!task) {
        throw new AppError('Task not found', 404);
      }

      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createTaskSchema.safeParse(req.body);
      if (!result.success) {
        throw new AppError(result.error.errors[0].message, 400);
      }

      const task = await taskService.createTask(result.data);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = updateTaskSchema.safeParse(req.body);
      if (!result.success) {
        throw new AppError(result.error.errors[0].message, 400);
      }

      const task = await taskService.updateTask(id, result.data);
      res.json(task);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        next(new AppError('Task not found', 404));
      } else {
        next(error);
      }
    }
  }

  async toggleCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.toggleTaskCompletion(id);

      if (!task) {
        throw new AppError('Task not found', 404);
      }

      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await taskService.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      if ((error as any).code === 'P2025') {
        next(new AppError('Task not found', 404));
      } else {
        next(error);
      }
    }
  }

  async archiveCompleted(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.archiveCompletedTasks();
      res.json({ archived: result.count });
    } catch (error) {
      next(error);
    }
  }

  async unarchiveTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.unarchiveTask(id);
      res.json(task);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        next(new AppError('Task not found', 404));
      } else {
        next(error);
      }
    }
  }
}

export default new TaskController();
