import express from 'express';
import { getTransactionsByUser, createTransactionForUser, getCategoryIdByName, updateTransactionForUser, deleteTransactionForUser, getTransaction } from '../database.js';
import { authMiddleware } from '../helpers/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await getTransactionsByUser(userId);
    res.status(200).json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tx = await getTransaction(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Not found' });
    // optionally check ownership here (if getTransaction doesn't include user check)
    res.status(200).json(tx);
  } catch (err) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    let { wallet_id, category_id, amount, description, date, type } = req.body;

    if (!wallet_id || amount === undefined || !date) {
      return res.status(400).json({ error: 'wallet_id, amount and date are required' });
    }

    if (typeof category_id === 'string' && category_id) {
      category_id = await getCategoryIdByName(category_id);
      if (category_id === null) {
        return res.status(400).json({ error: 'Invalid category name provided.' });
      }
    }


    const newTx = await createTransactionForUser(userId, wallet_id, category_id, Number(amount), description || null, date, 0);
    res.status(201).json(newTx);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const txId = req.params.id;
    let { wallet_id, category_id, amount, description, date, type } = req.body;

    if (category_id && typeof category_id === 'string') {
      category_id = await getCategoryIdByName(category_id);
      if (category_id === null) {
        return res.status(400).json({ error: 'Invalid category name provided.' });
      }
    }
    if (amount !== undefined) amount = Number(amount);

    const updated = await updateTransactionForUser(userId, txId, { wallet_id, category_id, amount, description, date, type });
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating transaction:', err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const txId = req.params.id;
    const ok = await deleteTransactionForUser(userId, txId);
    if (ok) return res.status(204).send();
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
  }
});

export default router;
