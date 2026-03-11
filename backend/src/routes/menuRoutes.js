import express from 'express';
import { 
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories
} from '../controllers/menuController.js';
import { protect, isManager } from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/categories/all', getCategories);
router.route('/')
  .get(getMenuItems)
  .post(protect, isManager, upload.single('image'), uploadToCloudinary, createMenuItem);

router.route('/:id')
  .get(getMenuItemById)
  .put(protect, isManager, upload.single('image'), uploadToCloudinary, updateMenuItem)
  .delete(protect, isManager, deleteMenuItem);

export default router;