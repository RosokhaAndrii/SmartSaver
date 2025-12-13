import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { executeRuleForAmount  } from "./services/autoruleService.js";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "smart_saver",
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true, 
});


export async function query(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    console.error("DB query error:", err.sql ?? sql, params, err.message);
    throw { status: 500, message: "Database error", details: err.message };
  }
}

export async function getUsers() {
  return await query("SELECT * FROM users");
}

export async function getTransactions() {
  return await query("SELECT * FROM transactions");
}

export async function getWallets() {
  return await query("SELECT * FROM wallets");
}

export async function getUser(id) {
  const rows = await query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function getTransaction(id) {
  const rows = await query("SELECT * FROM transactions WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function getWallet(id) {
  const rows = await query("SELECT * FROM wallets WHERE id = ?", [id]);
  return rows[0] ?? null;
}
export async function getWalletById(id) {
  return getWallet(id);
}


export async function createUser(name, email) {
  const res = await query("INSERT INTO users (name, email) VALUES (?, ?)", [
    name,
    email,
  ]);
  return getUser(res.insertId);
}


export async function createWallet(name, balance = 0, currency = "USD", type = "other") {
  const res = await query(
    "INSERT INTO wallets (name, balance, currency, type) VALUES (?, ?, ?, ?)",
    [name, balance, currency, type]
  );
  return getWallet(res.insertId);
}

export async function createWalletForUser(userId, name, balance = 0, currency = "USD", type = "other") {
  const res = await query(
    "INSERT INTO wallets (user_id, name, balance, currency, type) VALUES (?, ?, ?, ?, ?)",
    [userId, name, balance, currency, type]
  );
  return getWallet(res.insertId);
}

export async function createTransaction(wallet_id, category_id, amount, description, date) {
  const res = await query(
    "INSERT INTO transactions (wallet_id, category_id, amount, description, date) VALUES (?, ?, ?, ?, ?)",
    [wallet_id, category_id, amount, description, date]
  );
  return getTransaction(res.insertId);
}

export async function getWalletsByUser(userId) {
  return await query("SELECT * FROM wallets WHERE user_id = ?", [userId]);
}


export async function getTransactionsByUser(userId) {
  return await query(
    `SELECT
      t.id,
      t.user_id,
      t.wallet_id,
      t.category_id,
      t.amount,
      t.description,
      DATE_FORMAT(t.date, '%d.%m.%Y') as date,
      w.name as wallet_name,
      c.name as category_name,
      c.type as category_type
    FROM transactions t
    JOIN wallets w ON t.wallet_id = w.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
    ORDER BY t.date DESC, t.created_at DESC`,
    [userId]
  );
}

export async function getTransactionDetailsById(id) {
  const rows = await query(
    `SELECT
      t.id,
      t.user_id,
      t.wallet_id,
      t.category_id,
      t.amount,
      t.description,
      DATE_FORMAT(t.date, '%d.%m.%Y') as date,
      w.name as wallet_name,
      c.name as category_name,
      c.type as category_type
    FROM transactions t
    JOIN wallets w ON t.wallet_id = w.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?`,
    [id]
  );
  return rows[0] ?? null;
}


export async function getAllCategories() {
  return await query("SELECT id, name AS label, type FROM categories ORDER BY type DESC, name ASC");
}

export async function getCategoryIdByName(name) {
  const rows = await query("SELECT id FROM categories WHERE name = ?", [name]);
  return rows[0]?.id ?? null;
}

export async function createTransactionForUser(userId, wallet_id, category_id, amount, description, date, is_auto = 0) {
  const conn = await pool.getConnection();
  let insertId;
  try {
    await conn.beginTransaction();

    const [ins] = await conn.query(
      `INSERT INTO transactions (user_id, wallet_id, category_id, amount, description, date, is_auto)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, wallet_id, category_id, amount, description, date, is_auto ? 1 : 0]
    );
    insertId = ins.insertId;

    await conn.query(
      `UPDATE wallets SET balance = balance + ? WHERE id = ? AND user_id = ?`,
      [amount, wallet_id, userId]
    );

    if (Number(amount) > 0) {
      const [goalsRows] = await conn.query(
        `SELECT id, saved_amount, target_amount
         FROM goals
         WHERE user_id = ? AND wallet_id = ? AND saved_amount < target_amount
         FOR UPDATE`,
        [userId, wallet_id]
      );
      const goalsList = goalsRows || [];
      let remaining = Number(amount);

      for (const g of goalsList) {
        if (remaining <= 0) break;
        const saved = Number(g.saved_amount || 0);
        const target = Number(g.target_amount || 0);
        const need = Math.max(0, target - saved);
        if (need <= 0) continue;

        let add = Math.min(need, remaining);
        add = Math.round(add * 100) / 100;
        await conn.query(
          `UPDATE goals SET saved_amount = saved_amount + ? WHERE id = ? AND user_id = ?`,
          [add, g.id, userId]
        );
        remaining = Math.round((remaining - add) * 100) / 100;
      }
    }

    await conn.commit();
    conn.release();
  } catch (err) {
    try { await conn.rollback(); } catch (e) { }
    conn.release();
    console.error("createTransactionForUser error:", err);
    throw { status: 500, message: "Could not create transaction", details: err.message };
  }

  try {
    if (!is_auto && Number(amount) > 0) {
      console.log(`[auto-rules] fetching rules for user=${userId} sourceWallet=${wallet_id}`);
      const svc = await import('./services/autoruleService.js');
      const { getAutoRulesForSourceWallet, executeRuleForAmSount } = svc;

      const rules = await getAutoRulesForSourceWallet(userId, wallet_id);
      console.log(`[auto-rules] found ${rules.length} rules`);

      for (const r of rules) {
        try {
          const transfer = Math.round((Number(amount) * (Number(r.percent) / 100)) * 100) / 100;
          if (transfer > 0) {
            console.log(`[auto-rules] executing rule ${r.id} transfer=${transfer}`);
            await executeRuleForAmount(r, transfer);
            console.log(`[auto-rules] executed rule ${r.id}`);
          }
        } catch (e) {
          console.error("Auto-rule exec failed for rule", r.id, e && e.message ? e.message : e);
        }
      }
    }
  } catch (svcErr) {
    console.error("Failed to run autorules after transaction:", svcErr);
  }

  return getTransactionDetailsById(insertId);
}


export async function updateTransactionForUser(userId, transactionId, { wallet_id, category_id, amount, description, date, type = null } = {}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [txRows] = await conn.query(
      `SELECT id, user_id, wallet_id, category_id, amount
       FROM transactions
       WHERE id = ? FOR UPDATE`,
      [transactionId]
    );
    const tx = txRows[0];
    if (!tx) throw { status: 404, message: "Transaction not found" };
    if (Number(tx.user_id) !== Number(userId)) throw { status: 403, message: "Not allowed" };

    const oldAmount = Number(tx.amount || 0);
    const newAmount = Number(amount);

    const oldWalletId = tx.wallet_id;
    const newWalletId = wallet_id ?? oldWalletId;

    const walletIdsToLock = oldWalletId === newWalletId ? [oldWalletId] : [oldWalletId, newWalletId];
    const [walletRows] = await conn.query(
      `SELECT id, user_id, balance FROM wallets WHERE id IN (${walletIdsToLock.map(() => '?').join(',')}) FOR UPDATE`,
      walletIdsToLock
    );

    const walletsMap = {};
    for (const w of walletRows) walletsMap[w.id] = w;

    for (const wid of walletIdsToLock) {
      const w = walletsMap[wid];
      if (!w) throw { status: 400, message: `Wallet ${wid} not found` };
      if (Number(w.user_id) !== Number(userId)) throw { status: 403, message: "Wallet does not belong to user" };
    }

    if (oldWalletId === newWalletId) {
      const delta = (isNaN(newAmount) ? 0 : newAmount) - oldAmount;
      if (delta !== 0) {
        await conn.query(`UPDATE wallets SET balance = balance + ? WHERE id = ?`, [delta, oldWalletId]);
      }
    } else {
      await conn.query(`UPDATE wallets SET balance = balance - ? WHERE id = ?`, [oldAmount, oldWalletId]);
      await conn.query(`UPDATE wallets SET balance = balance + ? WHERE id = ?`, [newAmount, newWalletId]);
    }

    const setParts = [];
    const params = [];

    if (wallet_id !== undefined) { setParts.push("wallet_id = ?"); params.push(wallet_id); }
    if (category_id !== undefined) { setParts.push("category_id = ?"); params.push(category_id); }
    if (amount !== undefined) { setParts.push("amount = ?"); params.push(amount); }
    if (description !== undefined) { setParts.push("description = ?"); params.push(description); }
    if (date !== undefined) { setParts.push("date = ?"); params.push(date); }
    if (type !== null) { setParts.push("type = ?"); params.push(type); }

    if (setParts.length > 0) {
      params.push(transactionId);
      await conn.query(
        `UPDATE transactions SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        params
      );
    }

    if (newAmount > oldAmount && newAmount > 0) {
      let isIncome = false;
      if (category_id) {
        const [catRows] = await conn.query(`SELECT type FROM categories WHERE id = ?`, [category_id]);
        isIncome = !!(catRows[0] && catRows[0].type === 'income');
      } else {
        isIncome = true;
      }

      if (isIncome) {
        let diff = Math.round(((newAmount - oldAmount) || 0) * 100) / 100;
        if (diff > 0) {
          const [goalsRows] = await conn.query(
            `SELECT id, saved_amount, target_amount
             FROM goals
             WHERE user_id = ? AND wallet_id = ? AND saved_amount < target_amount
             FOR UPDATE`,
            [userId, newWalletId]
          );
          const goalsList = goalsRows[0] || goalsRows;
          let remaining = diff;
          for (const g of goalsList) {
            if (remaining <= 0) break;
            const saved = Number(g.saved_amount || 0);
            const target = Number(g.target_amount || 0);
            const need = Math.max(0, target - saved);
            if (need <= 0) continue;
            let add = Math.min(need, remaining);
            add = Math.round(add * 100) / 100;
            await conn.query(`UPDATE goals SET saved_amount = saved_amount + ? WHERE id = ? AND user_id = ?`, [add, g.id, userId]);
            remaining = Math.round((remaining - add) * 100) / 100;
          }
        }
      }
    }

    await conn.commit();
    conn.release();

    return getTransactionDetailsById(transactionId);
  } catch (err) {
    try { await conn.rollback(); } catch (e) { /* ignore */ }
    conn.release();
    console.error("updateTransactionForUser error:", err);
    throw { status: err.status || 500, message: err.message || "Could not update transaction", details: err.details || err.toString() };
  }
}

export async function deleteTransactionForUser(userId, transactionId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [txRows] = await conn.query(
      `SELECT id, user_id, wallet_id, amount FROM transactions WHERE id = ? FOR UPDATE`,
      [transactionId]
    );
    const tx = txRows[0];
    if (!tx) return false;
    if (Number(tx.user_id) !== Number(userId)) throw { status: 403, message: "Not allowed" };

    const walletId = tx.wallet_id;
    const amount = Number(tx.amount || 0);

    await conn.query(`UPDATE wallets SET balance = balance - ? WHERE id = ? AND user_id = ?`, [amount, walletId, userId]);

    const res = await conn.query(`DELETE FROM transactions WHERE id = ?`, [transactionId]);

    await conn.commit();
    conn.release();

    return res[0]?.affectedRows > 0 || (res.affectedRows && res.affectedRows > 0);
  } catch (err) {
    try { await conn.rollback(); } catch (e) { /* ignore */ }
    conn.release();
    console.error("deleteTransactionForUser error:", err);
    throw { status: err.status || 500, message: err.message || "Could not delete transaction", details: err.details || err.toString() };
  }
}



export async function getGoalDetailsById(goalId) {
  const rows = await query(
    `SELECT
      g.id,
      g.user_id,
      g.title,
      g.subtitle,
      g.note,
      g.target_amount,
      g.saved_amount,
      g.currency,
      DATE_FORMAT(g.due_date, '%Y-%m-%d') as due_date,
      g.wallet_id,
      w.name as wallet_name,
      w.currency as wallet_currency
    FROM goals g
    JOIN wallets w ON g.wallet_id = w.id
    WHERE g.id = ?`,
    [goalId]
  );
  return rows[0] ?? null;
}

export async function getGoalsByUser(userId) {
  return await query(
    `SELECT
      g.id,
      g.user_id,
      g.title,
      g.subtitle,
      g.note,
      g.target_amount,
      g.saved_amount,
      g.currency,
      DATE_FORMAT(g.due_date, '%Y-%m-%d') as due_date,
      g.wallet_id,
      w.name as wallet_name,
      w.currency as wallet_currency
    FROM goals g
    JOIN wallets w ON g.wallet_id = w.id
    WHERE g.user_id = ?
    ORDER BY g.due_date ASC, g.created_at ASC`,
    [userId]
  );
}


export async function createGoalForUser(userId, wallet_id, title, target_amount, due_date = null, subtitle = null, note = null) {
  const wallet = await getWalletById(wallet_id);
  if (!wallet) throw { status: 400, message: "Wallet not found" };
  if (wallet.user_id !== userId) throw { status: 403, message: "Wallet does not belong to user" };

  const currency = wallet.currency || "USD";
  const initial_saved_amount = 0;

  const res = await query(
    `INSERT INTO goals (user_id, wallet_id, title, target_amount, saved_amount, currency, due_date, subtitle, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, wallet_id, title, target_amount, initial_saved_amount, currency, due_date || null, subtitle, note]
  );

  return getGoalDetailsById(res.insertId);
}


function buildUpdate(allowed, fields) {
  const setParts = [];
  const params = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key] !== undefined) {
      setParts.push(`${key} = ?`);
      params.push(fields[key]);
    }
  }
  if (setParts.length === 0) return { setSql: null };
  return { setSql: setParts.join(", "), params };
}

export async function updateGoalForUser(userId, goalId, fields = {}) {
  if (fields.wallet_id !== undefined && fields.wallet_id !== null) {
    const newWallet = await getWalletById(fields.wallet_id);
    if (!newWallet) throw { status: 400, message: "New wallet not found" };
    if (newWallet.user_id !== userId) throw { status: 403, message: "Wallet does not belong to user" };
    fields.currency = newWallet.currency;
  }

  const allowed = ["title", "target_amount", "saved_amount", "due_date", "wallet_id", "currency", "subtitle", "note"];
  const { setSql, params } = buildUpdate(allowed, fields);

  if (!setSql) return getGoalDetailsById(goalId);

  params.push(goalId, userId);

  const sql = `UPDATE goals SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
  await query(sql, params);

  return getGoalDetailsById(goalId);
}

export async function deleteGoalForUser(userId, goalId) {
  const res = await query("DELETE FROM goals WHERE id = ? AND user_id = ?", [goalId, userId]);
  return res.affectedRows > 0;
}


export async function updateWalletForUser(userId, walletId, fields = {}) {
  const allowed = ["name", "balance", "currency", "hidden", "type"];
  const { setSql, params } = buildUpdate(allowed, fields);
  if (!setSql) return getWalletById(walletId);

  params.push(walletId, userId);
  const sql = `UPDATE wallets SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
  await query(sql, params);
  return getWalletById(walletId);
}



export async function deleteWalletForUser(userId, walletId) {
  await query("DELETE FROM goals WHERE wallet_id = ? AND user_id = ?", [walletId, userId]);
  const res = await query("DELETE FROM wallets WHERE id = ? AND user_id = ?", [walletId, userId]);
  return res.affectedRows > 0;
}

export async function getAutoRulesByUser(userId) {
  return await query(
    `SELECT ar.id, ar.user_id, ar.title, ar.percent, ar.source_wallet_id, ar.target_wallet_id,
            ar.is_active, ar.schedule_cron, ar.last_run, ar.created_at, ar.updated_at,
            ws.name AS source_wallet_name, wt.name AS target_wallet_name,
            ws.currency AS source_wallet_currency, wt.currency AS target_wallet_currency
     FROM auto_rules ar
     JOIN wallets ws ON ar.source_wallet_id = ws.id
     JOIN wallets wt ON ar.target_wallet_id = wt.id
     WHERE ar.user_id = ?
     ORDER BY ar.created_at DESC`,
    [userId]
  );
}

export async function getAutoRuleById(ruleId) {
  const rows = await query(
    `SELECT id, user_id, title, percent, source_wallet_id, target_wallet_id, is_active, schedule_cron, last_run, created_at, updated_at
     FROM auto_rules WHERE id = ?`,
    [ruleId]
  );
  return rows[0] ?? null;
}

export async function createAutoRuleForUser(userId, title, percent, sourceWalletId, targetWalletId, isActive = true, scheduleCron = null) {
  const res = await query(
    `INSERT INTO auto_rules (user_id, title, percent, source_wallet_id, target_wallet_id, is_active, schedule_cron)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, title, percent, sourceWalletId, targetWalletId, isActive ? 1 : 0, scheduleCron]
  );
  return getAutoRuleById(res.insertId);
}

export async function updateAutoRuleForUser(userId, ruleId, fields = {}) {
  const allowed = ["title", "percent", "source_wallet_id", "target_wallet_id", "is_active", "schedule_cron"];
  const setParts = [];
  const params = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key] !== undefined) {
      setParts.push(`${key} = ?`);
      params.push(fields[key]);
    }
  }
  if (setParts.length === 0) return getAutoRuleById(ruleId);
  params.push(ruleId, userId);
  await query(`UPDATE auto_rules SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, params);
  return getAutoRuleById(ruleId);
}

export async function deleteAutoRuleForUser(userId, ruleId) {
  const res = await query(`DELETE FROM auto_rules WHERE id = ? AND user_id = ?`, [ruleId, userId]);
  return res.affectedRows > 0;
}


export default pool;
