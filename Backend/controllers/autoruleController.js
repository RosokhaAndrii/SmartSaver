import {
  getAutoRulesByUser,
  getAutoRuleById,
  createAutoRuleForUser,
  updateAutoRuleForUser,
  deleteAutoRuleForUser,
  getWalletById,
  query 
} from "../database.js";

export async function listAutoRules(req, res) {
  try {
    const rules = await getAutoRulesByUser(req.userId);
    res.json(rules);
  } catch (err) {
    console.error("listAutoRules error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getAutoRule(req, res) {
  try {
    const rule = await getAutoRuleById(req.params.id);
    if (!rule || rule.user_id !== req.userId) return res.status(404).json({ error: "Not found" });
    res.json(rule);
  } catch (err) {
    console.error("getAutoRule error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createAutoRule(req, res) {
  try {
    const userId = req.userId;
    const { title, percent, source_wallet_id, target_wallet_id, is_active, schedule_cron } = req.body;
    if (!title || !source_wallet_id || !target_wallet_id || percent === undefined) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (Number(percent) <= 0 || Number(percent) > 100) {
      return res.status(400).json({ error: "percent must be between 0 and 100" });
    }
    const source = await getWalletById(source_wallet_id);
    const target = await getWalletById(target_wallet_id);
    if (!source || source.user_id !== userId) return res.status(400).json({ error: "Invalid source wallet" });
    if (!target || target.user_id !== userId) return res.status(400).json({ error: "Invalid target wallet" });

    const created = await createAutoRuleForUser(userId, title, Number(percent), source_wallet_id, target_wallet_id, is_active ?? true, schedule_cron ?? null);
    res.status(201).json(created);
  } catch (err) {
    console.error("createAutoRule error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateAutoRule(req, res) {
  try {
    const userId = req.userId;
    const ruleId = req.params.id;
    const updates = req.body;
    const existing = await getAutoRuleById(ruleId);
    if (!existing || existing.user_id !== userId) return res.status(404).json({ error: "Not found" });

    if (updates.source_wallet_id) {
      const s = await getWalletById(updates.source_wallet_id);
      if (!s || s.user_id !== userId) return res.status(400).json({ error: "Invalid source wallet" });
    }
    if (updates.target_wallet_id) {
      const t = await getWalletById(updates.target_wallet_id);
      if (!t || t.user_id !== userId) return res.status(400).json({ error: "Invalid target wallet" });
    }

    if (updates.percent !== undefined && (Number(updates.percent) <= 0 || Number(updates.percent) > 100)) {
      return res.status(400).json({ error: "percent must be between 0 and 100" });
    }

    const updated = await updateAutoRuleForUser(userId, ruleId, updates);
    res.json(updated);
  } catch (err) {
    console.error("updateAutoRule error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function removeAutoRule(req, res) {
  try {
    const userId = req.userId;
    const ruleId = req.params.id;
    const existing = await getAutoRuleById(ruleId);
    if (!existing || existing.user_id !== userId) return res.status(404).json({ error: "Not found" });
    const success = await deleteAutoRuleForUser(userId, ruleId);
    if (success) return res.status(204).send();
    return res.status(500).json({ error: "Could not delete" });
  } catch (err) {
    console.error("removeAutoRule error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


export async function executeRule(ruleId) {
  const rule = await getAutoRuleById(ruleId);
  if (!rule) throw new Error("Rule not found");
  if (!rule.is_active && Number(rule.is_active) !== 1) throw new Error("Rule is not active");
  return executeRuleById(rule);
}

export async function executeRuleById(rule) {
  if (!rule) throw new Error("No rule provided");
  if (!rule.source_wallet_id || !rule.target_wallet_id) throw new Error("Rule wallet ids missing");
  if (Number(rule.source_wallet_id) === Number(rule.target_wallet_id)) throw new Error("Source and target wallets must be different");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [walletRows] = await conn.query(
      "SELECT id, user_id, name, balance FROM wallets WHERE id IN (?, ?) FOR UPDATE",
      [rule.source_wallet_id, rule.target_wallet_id]
    );

    const source = walletRows.find((r) => Number(r.id) === Number(rule.source_wallet_id));
    const target = walletRows.find((r) => Number(r.id) === Number(rule.target_wallet_id));

    if (!source) throw new Error("Source wallet not found");
    if (!target) throw new Error("Target wallet not found");

    if (Number(source.user_id) !== Number(rule.user_id) || Number(target.user_id) !== Number(rule.user_id)) {
      throw new Error("Wallets do not belong to rule owner");
    }

    const percent = Number(rule.percent);
    if (!isFinite(percent) || percent <= 0) throw new Error("Invalid percent value in rule");

    const srcBalance = Number(source.balance) || 0;
    const rawAmount = (srcBalance * percent) / 100;
    const amount = Math.round(rawAmount * 100) / 100;

    if (amount <= 0) {
      throw new Error("Computed amount is zero or negative — nothing to transfer");
    }

    if (srcBalance < amount) {
      throw new Error("Insufficient funds in source wallet");
    }

    
    await conn.query("UPDATE wallets SET balance = balance - ? WHERE id = ?", [amount, source.id]);
    await conn.query("UPDATE wallets SET balance = balance + ? WHERE id = ?", [amount, target.id]);

    const outDesc = `Auto-save "${rule.title}" → wallet ${target.name ?? target.id}`;
    const inDesc = `Auto-save from wallet ${source.name ?? source.id} "${rule.title}"`;

    const [resOut] = await conn.query(
      `INSERT INTO transactions (user_id, wallet_id, category_id, amount, description, date)
       VALUES (?, ?, NULL, ?, ?, CURDATE())`,
      [rule.user_id, source.id, -Math.abs(amount), outDesc]
    );

    const [resIn] = await conn.query(
      `INSERT INTO transactions (user_id, wallet_id, category_id, amount, description, date)
       VALUES (?, ?, NULL, ?, ?, CURDATE())`,
      [rule.user_id, target.id, Math.abs(amount), inDesc]
    );

     const [goalsRows] = await conn.query(
      `SELECT id, saved_amount, target_amount
       FROM goals
       WHERE user_id = ? AND wallet_id = ? AND saved_amount < target_amount
       FOR UPDATE`,
      [rule.user_id, target.id]
    );
    const goalsList = goalsRows || [];
    let remainingForGoals = Number(Math.abs(amount));

    for (const g of goalsList) {
      if (remainingForGoals <= 0) break;
      const saved = Number(g.saved_amount || 0);
      const target = Number(g.target_amount || 0);
      const need = Math.max(0, target - saved);
      if (need <= 0) continue;
      const add = Math.min(need, remainingForGoals);
      await conn.query(
        `UPDATE goals SET saved_amount = saved_amount + ? WHERE id = ? AND user_id = ?`,
        [add, g.id, rule.user_id]
      );
      remainingForGoals = Math.round((remainingForGoals - add) * 100) / 100;
    }

    await conn.query("UPDATE auto_rules SET last_run = CURRENT_TIMESTAMP WHERE id = ?", [rule.id]);

    await conn.commit();

    return {
      success: true,
      ruleId: rule.id,
      amount,
      outTransactionId: resOut.insertId,
      inTransactionId: resIn.insertId,
      sourceWalletId: source.id,
      targetWalletId: target.id
    };
  } catch (err) {
    try { await conn.rollback(); } catch (e) { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}