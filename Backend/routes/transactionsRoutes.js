import express from 'express';
import { getTransactionsByUser, createTransactionForUser, getCategoryIdByName } from '../database.js';
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

router.post('/', async (req, res) => {
    try {
        const userId = req.userId; 
        let { wallet_id, category_id, amount, description, date } = req.body;
        
        if (!wallet_id || !amount || !date) {
            return res.status(400).json({ error: 'Wallet ID, amount, and date are required.' });
        }

        if (typeof category_id === 'string' && category_id) {
            category_id = await getCategoryIdByName(category_id);
            if (category_id === null) {
                 return res.status(400).json({ error: 'Invalid category name provided.' });
            }
        }
        
        const newTransaction = await createTransactionForUser(
            userId, 
            wallet_id, 
            category_id, 
            amount, 
            description, 
            date
        );

        res.status(201).json(newTransaction);
    } catch (err) {
        console.error('Error creating transaction:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;