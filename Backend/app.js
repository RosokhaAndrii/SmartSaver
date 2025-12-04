
import express from "express";
import { getUsers, getUser, getWallet, getWallets,
  getTransaction, getTransactions, 
  createUser, createTransaction, createWallet, getAllCategories  } from "./database.js";
import cors from 'cors';
import authRoutes from './routes/loginRoutes.js'; 
import walletsRoutes from './routes/walletsRoutes.js'
import transactionsRoutes from './routes/transactionsRoutes.js'
import goalRoutes from './routes/goalRoutes.js'
import autorulesRoutes from './routes/autorulesRoutes.js'
import dashBoardRoutes from './routes/dashBoardRoutes.js'

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.get('/', (req, res) => res.send('OK'));
app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletsRoutes);
app.use('/api/transactions', transactionsRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/auto-rules', autorulesRoutes)
app.use('/api/dashboard', dashBoardRoutes)

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
  const userId = req.params.id;
  const user = await getUser(userId);
  res.status(200).json(user);
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
  const walletId = req.params.id;
  const wallet = await getWallet(walletId);
  res.status(200).json(wallet);
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
  const transactionId = req.params.id;
  const transaction = await getTransaction(transactionId);
  res.status(200).json(transaction);
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  const user = await createUser(name, email);
  res.status(201).send(user)
});

app.post('/wallets', async (req, res) => {
  try {
    const userId = req.userId ?? 1; 
    const { name, balance, currency } = req.body;
    const wallet = await createWalletForUser(userId, name, balance, currency);
    res.status(201).json(wallet);
  } catch (err) {
    console.error("Error creating wallet:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post('/transactions', async (req, res) => {
  const { wallet_id, category_id, amount, description, date } = req.body;
  const transaction = await createTransaction(wallet_id, category_id, amount, description, date);
  res.status(201).send(transaction)
});



export default app;
