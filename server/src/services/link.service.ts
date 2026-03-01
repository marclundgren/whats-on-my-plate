import { PrismaClient, Prisma } from '@prisma/client';
import { CreateLinkInput, UpdateLinkInput } from './validation.service';

const prisma = new PrismaClient();

export class LinkService {
  async createLink(taskId: string, data: CreateLinkInput) {
    return await prisma.link.create({
      data: {
        url: data.url,
        title: data.title,
        taskId
      }
    });
  }

  async updateLink(taskId: string, linkId: string, data: UpdateLinkInput) {
    const updateData: Prisma.LinkUpdateInput = {};

    if (data.url !== undefined) updateData.url = data.url;
    if (data.title !== undefined) updateData.title = data.title;

    return await prisma.link.update({
      where: { id: linkId, taskId },
      data: updateData
    });
  }

  async deleteLink(taskId: string, linkId: string) {
    return await prisma.link.delete({
      where: { id: linkId, taskId }
    });
  }
}

export default new LinkService();
