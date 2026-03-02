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

      const tasks = await taskService.getAllTasks(queryResult.data, req.userId);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const task = await taskService.getTaskById(id, req.userId);

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

      const task = await taskService.createTask(result.data, req.userId);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = updateTaskSchema.safeParse(req.body);
      if (!result.success) {
        throw new AppError(result.error.errors[0].message, 400);
      }

      const task = await taskService.updateTask(id, result.data, req.userId);
      if (!task) {
        throw new AppError('Task not found', 404);
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async toggleCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const task = await taskService.toggleTaskCompletion(id, req.userId);

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
      const id = req.params.id as string;
      const result = await taskService.deleteTask(id, req.userId);
      if (!result) {
        throw new AppError('Task not found', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async archiveCompleted(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.archiveCompletedTasks(req.userId);
      res.json({ archived: result.count });
    } catch (error) {
      next(error);
    }
  }

  async unarchiveTask(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const task = await taskService.unarchiveTask(id, req.userId);
      if (!task) {
        throw new AppError('Task not found', 404);
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
