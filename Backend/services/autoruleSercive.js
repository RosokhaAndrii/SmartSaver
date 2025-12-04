import pool, {query} from '../database.js'
export async function getAutoRulesForSourceWallet(userId, sourceWalletId) {
  return await query(
    `SELECT ar.*
     FROM auto_rules ar
     WHERE ar.user_id = ? AND ar.source_wallet_id = ? AND ar.is_active = 1`,
    [userId, sourceWalletId]
  );
}

export async function executeRuleForAmount(rule, amount) {
  if (!rule) throw new Error("No rule provided");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [walletRows] = await conn.query(
      "SELECT id, user_id, name, balance FROM wallets WHERE id IN (?, ?) FOR UPDATE",
      [rule.source_wallet_id, rule.target_wallet_id]
    );

    const source = walletRows.find(w => Number(w.id) === Number(rule.source_wallet_id));
    const target = walletRows.find(w => Number(w.id) === Number(rule.target_wallet_id));

    if (!source) throw new Error("Source wallet not found");
    if (!target) throw new Error("Target wallet not found");
    if (Number(source.user_id) !== Number(rule.user_id) || Number(target.user_id) !== Number(rule.user_id)) {
      throw new Error("Wallets do not belong to rule owner");
    }

    const amt = Math.round(Number(amount) * 100) / 100;
    if (amt <= 0) throw new Error("Amount must be > 0");
    if (Number(source.balance) < amt) throw new Error("Insufficient funds in source wallet");

    await conn.query("UPDATE wallets SET balance = balance - ? WHERE id = ?", [amt, source.id]);
    await conn.query("UPDATE wallets SET balance = balance + ? WHERE id = ?", [amt, target.id]);

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

    await conn.query("UPDATE auto_rules SET last_run = CURRENT_TIMESTAMP WHERE id = ?", [rule.id]);

    await conn.commit();
    conn.release();

    return {
      success: true,
      ruleId: rule.id,
      amount: amt,
      outTransactionId: resOut.insertId,
      inTransactionId: resIn.insertId
    };
  } catch (err) {
    try { await conn.rollback(); } catch (e) { /* ignore */ }
    conn.release();
    throw err;
  }
}
