import { Router } from 'express';
import linkController from '../controllers/link.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

// POST /api/tasks/:taskId/links - Create link
router.post('/:taskId/links', linkController.createLink.bind(linkController));

// PUT /api/tasks/:taskId/links/:linkId - Update link
router.put('/:taskId/links/:linkId', linkController.updateLink.bind(linkController));

// DELETE /api/tasks/:taskId/links/:linkId - Delete link
router.delete('/:taskId/links/:linkId', linkController.deleteLink.bind(linkController));

export default router;
