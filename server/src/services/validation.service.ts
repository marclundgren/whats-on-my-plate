import { z } from 'zod';

// Enums
export const CategoryEnum = z.enum(['WORK', 'PERSONAL']);
export const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  notes: z.string().optional(),
  category: CategoryEnum.default('PERSONAL'),
  priority: PriorityEnum.default('MEDIUM'),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  category: CategoryEnum.optional(),
  priority: PriorityEnum.optional(),
  dueDate: z.string().datetime().optional().nullable(),
  completed: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const taskQuerySchema = z.object({
  category: CategoryEnum.optional(),
  completed: z.string().transform(val => val === 'true').optional(),
  archived: z.string().transform(val => val === 'true').optional(),
  priority: PriorityEnum.optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

// Subtask validation schemas
export const createSubtaskSchema = z.object({
  title: z.string().min(1, 'Subtask title is required').max(255),
  order: z.number().int().min(0).optional(),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// Link validation schemas
export const createLinkSchema = z.object({
  url: z.string().url('Invalid URL format').max(2048),
  title: z.string().max(255).optional(),
});

export const updateLinkSchema = z.object({
  url: z.string().url('Invalid URL format').max(2048).optional(),
  title: z.string().max(255).optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
