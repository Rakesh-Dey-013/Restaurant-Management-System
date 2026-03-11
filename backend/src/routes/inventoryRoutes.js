import express from 'express';
import { 
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateQuantity,
  getLowStockItems
} from '../controllers/inventoryController.js';
import { protect, isManager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/low-stock/all', protect, isManager, getLowStockItems);

router.route('/')
  .get(protect, isManager, getInventoryItems)
  .post(protect, isManager, createInventoryItem);

router.route('/:id')
  .get(protect, isManager, getInventoryItemById)
  .put(protect, isManager, updateInventoryItem)
  .delete(protect, isManager, deleteInventoryItem);

router.patch('/:id/quantity', protect, isManager, updateQuantity);

export default router;