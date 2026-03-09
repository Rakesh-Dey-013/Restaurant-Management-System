import express from 'express';
import { 
  createMenuItem, 
  getMenuItems, 
  getMenuItemById, 
  updateMenuItem, 
  deleteMenuItem 
} from '../controllers/menuController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'manager'));

router.route('/')
  .post(upload.single('image'), createMenuItem)
  .get(getMenuItems);

router.route('/:id')
  .get(getMenuItemById)
  .put(upload.single('image'), updateMenuItem)
  .delete(deleteMenuItem);

export default router;