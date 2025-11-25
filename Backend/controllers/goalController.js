import {
  getGoalsByUser,
  createGoalForUser,
  updateGoalForUser,
  deleteGoalForUser,
  getGoalDetailsById
} from '../database.js';

export async function getGoal(req, res) {
  const goalId = req.params.id;

  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!goalId || isNaN(Number(goalId)) || Number(goalId) <= 0) {
      return res.status(400).json({ error: 'Invalid id parameter' });
    }

    const goal = await getGoalDetailsById(goalId);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    if (goal.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(200).json(goal);
  } catch (err) {
    console.error(`getGoal ${goalId} error:`, err);
    if (err && err.status && err.message) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
export async function listGoals(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const goals = await getGoalsByUser(userId);
    return res.status(200).json(goals);
  } catch (err) {
    console.error('listGoals error:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  }
}

export async function createGoal(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { wallet_id, title, target_amount, due_date, subtitle, note } = req.body ?? {};

    const errors = {};
    if (!wallet_id) errors.wallet_id = 'wallet_id is required';
    if (!title) errors.title = 'title is required';
    if (target_amount === undefined || target_amount === null || target_amount === '') {
      errors.target_amount = 'target_amount is required';
    } else if (isNaN(Number(target_amount)) || Number(target_amount) <= 0) {
      errors.target_amount = 'target_amount must be a positive number';
    }

    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const created = await createGoalForUser(
      userId,
      Number(wallet_id),
      title,
      Number(target_amount),
      due_date || null,
      subtitle || null,
      note || null,
    );

    return res.status(201).json(created);
  } catch (err) {
    console.error('createGoal error:', err);

    if (err && err.status && err.message) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function updateGoal(req, res) {
  const goalId = req.params.id;
  const updates = req.body ?? {};

  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!goalId) return res.status(400).json({ error: 'Missing goal id' });

    const existingGoal = await getGoalDetailsById(goalId);
    if (!existingGoal) return res.status(404).json({ error: 'Goal not found' });
    if (existingGoal.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

    const errors = {};
    if ('target_amount' in updates) {
      if (updates.target_amount === '' || isNaN(Number(updates.target_amount)) || Number(updates.target_amount) <= 0) {
        errors.target_amount = 'target_amount must be a positive number';
      } else {
        updates.target_amount = Number(updates.target_amount);
      }
    }
    if ('saved_amount' in updates) {
      if (updates.saved_amount === '' || isNaN(Number(updates.saved_amount)) || Number(updates.saved_amount) < 0) {
        errors.saved_amount = 'saved_amount must be a number >= 0';
      } else {
        updates.saved_amount = Number(updates.saved_amount);
      }
    }
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const updatedGoal = await updateGoalForUser(userId, goalId, updates);
    return res.status(200).json(updatedGoal);
  } catch (err) {
    console.error(`updateGoal ${goalId} error:`, err);
    if (err && err.status && err.message) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function removeGoal(req, res) {
  const goalId = req.params.id;

  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!goalId) return res.status(400).json({ error: 'Missing goal id' });

    const existingGoal = await getGoalDetailsById(goalId);

    if (!existingGoal) return res.status(404).json({ error: 'Goal not found' });
    if (existingGoal.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

    const success = await deleteGoalForUser(userId, goalId);
    if (success) return res.status(204).send();
    return res.status(500).json({ error: 'Could not delete goal' });
  } catch (err) {
    console.error(`removeGoal ${goalId} error:`, err);
    if (err && err.status && err.message) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
