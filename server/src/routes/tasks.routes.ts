import { Router } from 'express';
import taskController from '../controllers/task.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

// GET /api/tasks - Get all tasks (with optional filters)
router.get('/', taskController.getAllTasks.bind(taskController));

// GET /api/tasks/:id - Get single task by ID
router.get('/:id', taskController.getTaskById.bind(taskController));

// POST /api/tasks - Create new task
router.post('/', taskController.createTask.bind(taskController));

// PUT /api/tasks/:id - Update task
router.put('/:id', taskController.updateTask.bind(taskController));

// PATCH /api/tasks/:id/complete - Toggle task completion
router.patch('/:id/complete', taskController.toggleCompletion.bind(taskController));

// POST /api/tasks/archive-completed - Archive all completed tasks
router.post('/archive-completed', taskController.archiveCompleted.bind(taskController));

// PATCH /api/tasks/:id/unarchive - Unarchive a task
router.patch('/:id/unarchive', taskController.unarchiveTask.bind(taskController));

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', taskController.deleteTask.bind(taskController));

export default router;
