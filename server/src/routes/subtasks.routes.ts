import { Router } from 'express';
import subtaskController from '../controllers/subtask.controller';

const router = Router();

// POST /api/tasks/:taskId/subtasks - Create subtask
router.post('/:taskId/subtasks', subtaskController.createSubtask.bind(subtaskController));

// PUT /api/tasks/:taskId/subtasks/:subtaskId - Update subtask
router.put('/:taskId/subtasks/:subtaskId', subtaskController.updateSubtask.bind(subtaskController));

// PATCH /api/tasks/:taskId/subtasks/:subtaskId/complete - Toggle subtask completion
router.patch('/:taskId/subtasks/:subtaskId/complete', subtaskController.toggleCompletion.bind(subtaskController));

// DELETE /api/tasks/:taskId/subtasks/:subtaskId - Delete subtask
router.delete('/:taskId/subtasks/:subtaskId', subtaskController.deleteSubtask.bind(subtaskController));

export default router;
