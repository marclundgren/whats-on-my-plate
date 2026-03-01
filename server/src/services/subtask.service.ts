import { PrismaClient, Prisma } from '@prisma/client';
import { CreateSubtaskInput, UpdateSubtaskInput } from './validation.service';

const prisma = new PrismaClient();

export class SubtaskService {
  async createSubtask(taskId: string, data: CreateSubtaskInput) {
    // If no order is provided, set it to the next available position
    let order = data.order;
    if (order === undefined) {
      const lastSubtask = await prisma.subtask.findFirst({
        where: { taskId },
        orderBy: { order: 'desc' }
      });
      order = lastSubtask ? lastSubtask.order + 1 : 0;
    }

    return await prisma.subtask.create({
      data: {
        title: data.title,
        order,
        taskId
      }
    });
  }

  async updateSubtask(taskId: string, subtaskId: string, data: UpdateSubtaskInput) {
    const updateData: Prisma.SubtaskUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      updateData.completedAt = data.completed ? new Date() : null;
    }

    return await prisma.subtask.update({
      where: { id: subtaskId, taskId },
      data: updateData
    });
  }

  async toggleSubtaskCompletion(taskId: string, subtaskId: string) {
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId, taskId }
    });
    if (!subtask) return null;

    return await prisma.subtask.update({
      where: { id: subtaskId, taskId },
      data: {
        completed: !subtask.completed,
        completedAt: !subtask.completed ? new Date() : null
      }
    });
  }

  async deleteSubtask(taskId: string, subtaskId: string) {
    return await prisma.subtask.delete({
      where: { id: subtaskId, taskId }
    });
  }
}

export default new SubtaskService();
