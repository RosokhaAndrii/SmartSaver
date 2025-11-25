import express from 'express';
import { authMiddleware } from '../helpers/authMiddleware.js';
import {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  removeGoal
} from '../controllers/goalController.js';

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Базовий валідаційний middleware для POST / PUT (не замінює валідацію в контроллері)
function validateCreateBody(req, res, next) {
  const { wallet_id, title, target_amount } = req.body ?? {};
  const errors = {};
  if (!wallet_id) errors.wallet_id = 'wallet_id is required';
  if (!title) errors.title = 'title is required';
  if (target_amount === undefined || target_amount === null || target_amount === '') {
    errors.target_amount = 'target_amount is required';
  } else if (isNaN(Number(target_amount)) || Number(target_amount) <= 0) {
    errors.target_amount = 'target_amount must be a positive number';
  }
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  return next();
}

function validateIdParam(req, res, next) {
  const { id } = req.params;
  if (!id || Number.isNaN(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ error: 'Invalid id parameter' });
  }
  next();
}

router.use(authMiddleware);

router.get('/', asyncHandler(listGoals));               // GET /api/goals
router.post('/', validateCreateBody, asyncHandler(createGoal)); // POST /api/goals
router.get('/:id', validateIdParam, asyncHandler(getGoal));     // GET /api/goals/:id
router.put('/:id', validateIdParam, asyncHandler(updateGoal)); // PUT /api/goals/:id
router.delete('/:id', validateIdParam, asyncHandler(removeGoal)); // DELETE /api/goals/:id

export default router;
