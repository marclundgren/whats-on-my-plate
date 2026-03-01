import { PrismaClient, Task, Prisma } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput, TaskQuery } from './validation.service';

const prisma = new PrismaClient();

export class TaskService {
  async getAllTasks(query: TaskQuery) {
    const where: Prisma.TaskWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.completed !== undefined) {
      where.completed = query.completed;
    }

    // By default, don't show archived tasks unless explicitly requested
    if (query.archived !== undefined) {
      where.archived = query.archived;
    } else {
      where.archived = false;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    let orderBy: Prisma.TaskOrderByWithRelationInput | Prisma.TaskOrderByWithRelationInput[];
    if (query.sortBy) {
      orderBy = { [query.sortBy]: query.order || 'asc' };
    } else {
      // Default sorting: incomplete tasks first, then by due date, then by creation date
      orderBy = [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ];
    }

    return await prisma.task.findMany({
      where,
      orderBy,
      include: {
        subtasks: {
          orderBy: { order: 'asc' }
        },
        links: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async getTaskById(id: string) {
    return await prisma.task.findUnique({
      where: { id },
      include: {
        subtasks: {
          orderBy: { order: 'asc' }
        },
        links: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async createTask(data: CreateTaskInput) {
    const taskData: Prisma.TaskCreateInput = {
      title: data.title,
      description: data.description,
      notes: data.notes,
      category: data.category,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    };

    return await prisma.task.create({
      data: taskData,
      include: {
        subtasks: true,
        links: true
      }
    });
  }

  async updateTask(id: string, data: UpdateTaskInput) {
    const updateData: Prisma.TaskUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      updateData.completedAt = data.completed ? new Date() : null;
    }
    if (data.archived !== undefined) {
      updateData.archived = data.archived;
      updateData.archivedAt = data.archived ? new Date() : null;
    }

    return await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        subtasks: {
          orderBy: { order: 'asc' }
        },
        links: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async toggleTaskCompletion(id: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return null;

    return await prisma.task.update({
      where: { id },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null
      },
      include: {
        subtasks: {
          orderBy: { order: 'asc' }
        },
        links: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async deleteTask(id: string) {
    return await prisma.task.delete({
      where: { id }
    });
  }

  async archiveCompletedTasks() {
    return await prisma.task.updateMany({
      where: {
        completed: true,
        archived: false
      },
      data: {
        archived: true,
        archivedAt: new Date()
      }
    });
  }

  async unarchiveTask(id: string) {
    return await prisma.task.update({
      where: { id },
      data: {
        archived: false,
        archivedAt: null
      },
      include: {
        subtasks: {
          orderBy: { order: 'asc' }
        },
        links: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }
}

export default new TaskService();
