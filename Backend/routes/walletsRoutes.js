import express from 'express';
import { authMiddleware } from '../helpers/authMiddleware.js';
import { listWallets, createWallet, updateWallet, removeWallet } from '../controllers/walletController.js';

const router = express.Router();

router.use(authMiddleware); 

router.get('/', listWallets);
router.post('/', createWallet);
router.put('/:id', updateWallet);
router.delete('/:id', removeWallet);

export default router;
