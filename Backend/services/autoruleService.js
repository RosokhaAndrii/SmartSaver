import pool from '../database.js'

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export async function getAutoRulesForSourceWallet(userId, sourceWalletId) {
  if (!userId) throw new Error("userId required");
  if (!sourceWalletId) throw new Error("sourceWalletId required");

  const [rows] = await pool.query(
    `SELECT ar.id, ar.user_id, ar.title, ar.percent, ar.source_wallet_id, ar.target_wallet_id,
            ar.is_active, ar.schedule_cron, ar.last_run, ar.created_at, ar.updated_at,
            ws.name AS source_wallet_name, wt.name AS target_wallet_name,
            ws.currency AS source_wallet_currency, wt.currency AS target_wallet_currency
     FROM auto_rules ar
     JOIN wallets ws ON ar.source_wallet_id = ws.id
     JOIN wallets wt ON ar.target_wallet_id = wt.id
     WHERE ar.user_id = ? AND ar.source_wallet_id = ? AND ar.is_active = 1
     ORDER BY ar.created_at ASC`,
    [userId, sourceWalletId]
  );

  return rows;
}

export async function executeRuleForAmount(ruleOrId, amount) {
  if (!ruleOrId) throw new Error("rule required");
  const amt = round2(amount);
  if (amt <= 0) throw new Error("Amount must be > 0");

  let rule = null;
  if (typeof ruleOrId === 'object') rule = ruleOrId;
  else {
    const [rows] = await pool.query(`SELECT * FROM auto_rules WHERE id = ?`, [ruleOrId]);
    rule = rows[0] ?? null;
  }
  if (!rule) throw new Error("Rule not found");
  if (!rule.is_active || Number(rule.is_active) !== 1) throw new Error("Rule is not active");

  if (Number(rule.source_wallet_id) === Number(rule.target_wallet_id))
    throw new Error("Source and target wallets must be different");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const ids = [Number(rule.source_wallet_id), Number(rule.target_wallet_id)].sort((a,b)=>a-b);
    const [walletRows] = await conn.query(
      `SELECT id, user_id, name, balance FROM wallets WHERE id IN (?, ?) ORDER BY id FOR UPDATE`,
      ids
    );

    const source = walletRows.find(w => Number(w.id) === Number(rule.source_wallet_id));
    const target = walletRows.find(w => Number(w.id) === Number(rule.target_wallet_id));

    if (!source) throw new Error("Source wallet not found");
    if (!target) throw new Error("Target wallet not found");

    if (Number(source.user_id) !== Number(rule.user_id) || Number(target.user_id) !== Number(rule.user_id)) {
      throw new Error("Wallets do not belong to rule owner");
    }

    if (Number(source.balance) < amt) throw new Error("Insufficient funds in source wallet");

    await conn.query(`UPDATE wallets SET balance = balance - ? WHERE id = ?`, [amt, source.id]);
    await conn.query(`UPDATE wallets SET balance = balance + ? WHERE id = ?`, [amt, target.id]);

    const outDesc = `Auto-save "${rule.title}" → ${target.name ?? target.id}`;
    const inDesc = `Auto-save from ${source.name ?? source.id} "${rule.title}"`;

    const [resOut] = await conn.query(
      `INSERT INTO transactions (user_id, wallet_id, category_id, amount, description, date, is_auto)
       VALUES (?, ?, NULL, ?, ?, CURDATE(), 1)`,
      [rule.user_id, source.id, -Math.abs(amt), outDesc]
    );

    const [resIn] = await conn.query(
      `INSERT INTO transactions (user_id, wallet_id, category_id, amount, description, date, is_auto)
       VALUES (?, ?, NULL, ?, ?, CURDATE(), 1)`,
      [rule.user_id, target.id, Math.abs(amt), inDesc]
    );

    const [goalsRows] = await conn.query(
      `SELECT id, saved_amount, target_amount
       FROM goals
       WHERE user_id = ? AND wallet_id = ? AND saved_amount < target_amount
       ORDER BY created_at ASC
       FOR UPDATE`,
      [rule.user_id, target.id]
    );
    const goalsList = goalsRows || [];
    let remaining = Math.abs(amt);

    for (const g of goalsList) {
      if (remaining <= 0) break;
      const saved = Number(g.saved_amount || 0);
      const targetAmt = Number(g.target_amount || 0);
      const need = Math.max(0, targetAmt - saved);
      if (need <= 0) continue;
      let add = Math.min(need, remaining);
      add = round2(add);
      if (add <= 0) continue;
      await conn.query(`UPDATE goals SET saved_amount = saved_amount + ? WHERE id = ? AND user_id = ?`, [add, g.id, rule.user_id]);
      remaining = round2(remaining - add);
    }

    await conn.query(`UPDATE auto_rules SET last_run = CURRENT_TIMESTAMP WHERE id = ?`, [rule.id]);

    await conn.commit();

    return {
      success: true,
      ruleId: rule.id,
      amount: amt,
      outTransactionId: resOut.insertId,
      inTransactionId: resIn.insertId,
      sourceWalletId: source.id,
      targetWalletId: target.id,
    };
  } catch (err) {
    try { await conn.rollback(); } catch (e) { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

export async function executeRuleById(ruleOrId) {
  let rule = null;
  if (typeof ruleOrId === 'object') rule = ruleOrId;
  else {
    const [rows] = await pool.query(`SELECT * FROM auto_rules WHERE id = ?`, [ruleOrId]);
    rule = rows[0] ?? null;
  }
  if (!rule) throw new Error('Rule not found');
  if (!rule.is_active || Number(rule.is_active) !== 1) throw new Error('Rule is not active');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const ids = [Number(rule.source_wallet_id), Number(rule.target_wallet_id)].sort((a,b)=>a-b);
    const [walletRows] = await conn.query(
      `SELECT id, user_id, name, balance FROM wallets WHERE id IN (?, ?) ORDER BY id FOR UPDATE`,
      ids
    );

    const source = walletRows.find(w => Number(w.id) === Number(rule.source_wallet_id));
    if (!source) throw new Error('Source wallet not found');
    const srcBalance = round2(source.balance || 0);
    const percent = Number(rule.percent || 0);
    if (!isFinite(percent) || percent <= 0) throw new Error('Invalid percent in rule');

    const computed = round2((srcBalance * percent) / 100);

    await conn.commit();
    conn.release();

    if (computed <= 0) {
      return { success: false, reason: 'computed_amount_zero', amount: computed };
    }

    return await executeRuleForAmount(rule, computed);
  } catch (err) {
    try { await conn.rollback(); } catch(e) { /* ignore */ }
    conn.release();
    throw err;
  }
}
