import { getWalletsByUser, createWalletForUser, updateWalletForUser, deleteWalletForUser } from '../database.js';

export async function listWallets(req, res) {
  try {
    const userId = req.userId;
    const wallets = await getWalletsByUser(userId);
    res.json(wallets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}

export async function createWallet(req, res) {
  try {
    const userId = req.userId;
    const { name, balance, currency, type } = req.body; 
    if (!name) return res.status(400).json({ error: 'Missing name' });

    const wallet = await createWalletForUser(userId, name, balance || 0, currency || 'USD', type || 'other');
    res.status(201).json(wallet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}

export async function updateWallet(req, res) {
  try {
    const userId = req.userId;
    const walletId = req.params.id;
    const fields = req.body;
    const wallet = await updateWalletForUser(userId, walletId, fields);
    res.json(wallet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}

export async function removeWallet(req, res) {
  try {
    const userId = req.userId;
    const walletId = req.params.id;
    const ok = await deleteWalletForUser(userId, walletId);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}
