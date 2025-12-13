import express from "express";
import cors from "cors";
import authRoutes from './routes/loginRoutes.js'; 
import walletsRoutes from './routes/walletsRoutes.js'; 
import transactionsRoutes from './routes/transactionsRoutes.js'; 
import goalRoutes from './routes/goalRoutes.js';
import autorulesRoutes from './routes/autorulesRoutes.js';
import dashBoardRoutes from './routes/dashBoardRoutes.js';
import { authMiddleware } from './helpers/authMiddleware.js';
import { createTransactionForUser } from './database.js';

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.get('/', (req, res) => res.send('OK'));

app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletsRoutes);
app.use('/api/transactions', transactionsRoutes)
app.use('/api/goals', goalRoutes);
app.use('/api/auto-rules', autorulesRoutes);
app.use('/api/dashboard', dashBoardRoutes);

import { getAllCategories, getUsers, getUser, getWallets, getWallet, getTransactions, getTransaction } from './database.js';

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch (err) {
    console.error("Error in /api/categories:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error in /users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    console.error("Error in /users/:id", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/wallets", async (req, res) => {
  try {
    const wallets = await getWallets();
    res.status(200).json(wallets);
  } catch (err) {
    console.error("Error in /wallets:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/wallets/:id", async (req, res) => {
  try {
    const wallet = await getWallet(req.params.id);
    res.status(200).json(wallet);
  } catch (err) {
    console.error("Error in /wallets/:id", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/transactions", async (req, res) => {
  try {
    const transactions = await getTransactions();
    res.status(200).json(transactions);
  } catch (err) {
    console.error("Error in /transactions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/transactions/:id", async (req, res) => {
  try {
    const transaction = await getTransaction(req.params.id);
    res.status(200).json(transaction);
  } catch (err) {
    console.error("Error in /transactions/:id", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.userId);
    const { wallet_id, category_id = null, amount, description = null, date = null } = req.body;

    if (!wallet_id || isNaN(Number(amount))) {
      return res.status(400).json({ error: "wallet_id and amount are required" });
    }

    const tx = await createTransactionForUser(
      userId,
      Number(wallet_id),
      category_id ?? null,
      Number(amount),
      description,
      date ?? new Date().toISOString().slice(0,10),
      0 
    );

    res.status(201).json(tx);
  } catch (err) {
    console.error("POST /api/transactions error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  }
});

export default app;
