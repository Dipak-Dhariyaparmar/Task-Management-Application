import { Router } from 'express';
import { createTask, getTasks, updateTaskStatus, getUsers } from '../controllers/task.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', authorizeRoles('admin'), createTask);
router.get('/', getTasks);
router.patch('/:id/status', updateTaskStatus);
router.get('/all/users', authorizeRoles('admin'), getUsers);

export default router;