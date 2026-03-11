import express from 'express';
import { 
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus
} from '../controllers/tableController.js';
import { protect, isManager, isStaff } from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTables)
  .post(protect, isManager, upload.single('image'), uploadToCloudinary, createTable);

router.route('/:id')
  .get(getTableById)
  .put(protect, isManager, upload.single('image'), uploadToCloudinary, updateTable)
  .delete(protect, isManager, deleteTable);

router.patch('/:id/status', protect, isStaff, updateTableStatus);

export default router;