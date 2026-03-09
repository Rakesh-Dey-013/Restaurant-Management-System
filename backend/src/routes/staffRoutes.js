import express from 'express';
import {
    createStaff,
    getStaff,
    getStaffById,
    updateStaff,
    deleteStaff
} from '../controllers/staffController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .post(createStaff)
    .get(getStaff);

router.route('/:id')
    .get(getStaffById)
    .put(updateStaff)
    .delete(deleteStaff);

export default router;