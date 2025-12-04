import { query, getWalletsByUser, getGoalsByUser } from "../database.js";


function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function monthRangeFromQuery(qMonth, qYear) {
  const now = new Date();
  const month = qMonth ? Number(qMonth) - 1 : now.getMonth();
  const year = qYear ? Number(qYear) : now.getFullYear();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0); 
  return { start: isoDate(start), end: isoDate(end) };
}

export async function getDashboard(req, res) {
  try {
    const userId = req.userId;
    const { month, year } = req.query;
    const { start, end } = monthRangeFromQuery(month, year);

    const wallets = await getWalletsByUser(userId);
    const total_balance = wallets.reduce((s, w) => s + Number(w.balance || 0), 0);

    const goals = await getGoalsByUser(userId);
    const goalsTotal = goals.length;
    
    const goalsDone = goals.filter(g => {
    const saved = Math.round(Number(g.saved_amount || 0) * 100) / 100;
    const target = Math.round(Number(g.target_amount || 0) * 100) / 100;
    return saved >= target;
}).length;

    const totalsRows = await query(
      `SELECT COALESCE(c.type, 'unknown') AS type, SUM(t.amount) AS total
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? AND t.date BETWEEN ? AND ?
       GROUP BY c.type`,
      [userId, start, end]
    );

    let monthly_income = 0;
    let monthly_expense = 0;
    for (const r of totalsRows) {
      if (r.type === 'income') monthly_income = Number(r.total || 0);
      else if (r.type === 'expense') monthly_expense = Math.abs(Number(r.total || 0));
      else {
        if (Number(r.total) > 0) monthly_income += Number(r.total);
        else monthly_expense += Math.abs(Number(r.total));
      }
    }

    const spendings = await query(
      `SELECT c.id, c.name, SUM(t.amount) AS total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? AND c.type = 'expense' AND t.date BETWEEN ? AND ?
       GROUP BY c.id
       ORDER BY total DESC
       LIMIT 12`,
      [userId, start, end]
    );

    const spendingsByCategory = spendings.map(s => ({
      name: s.name,
      value: Math.abs(Number(s.total || 0)),
    }));

    const todayStr = isoDate(new Date());
    const periodEnd = end > todayStr ? todayStr : end; 

    const dailyNets = await query(
      `SELECT DATE(t.date) AS date, SUM(t.amount) AS net
       FROM transactions t
       WHERE t.user_id = ? AND t.date BETWEEN ? AND ?
       GROUP BY DATE(t.date)
       ORDER BY DATE(t.date) ASC`,
      [userId, start, periodEnd]
    );

    const netByDate = {};
    let sumNetsFromStartToToday = 0;
    for (const r of dailyNets) {
      const d = isoDate(new Date(r.date));
      const netVal = Number(r.net || 0);
      netByDate[d] = netVal;
      sumNetsFromStartToToday += netVal;
    }

    const balanceAtStart = Math.round((Number(total_balance) - sumNetsFromStartToToday) * 100) / 100;

    const startDate = new Date(start);
    const endDate = new Date(periodEnd);
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(isoDate(new Date(d)));
    }

    const balance_history = [];
    let cumulative = 0;
    for (const date of dates) {
      const net = netByDate[date] || 0;
      cumulative += net;
      const bal = Math.round((balanceAtStart + cumulative) * 100) / 100;
      balance_history.push({ date, balance: bal, net });
    }

    if (end > periodEnd) {
      const futureDates = [];
      const futureStart = new Date(periodEnd);
      futureStart.setDate(futureStart.getDate() + 1);
      const requestedEnd = new Date(end);
      for (let d = new Date(futureStart); d <= requestedEnd; d.setDate(d.getDate() + 1)) {
        const dt = isoDate(new Date(d));
        // no net known => show last known balance (or null); here we repeat last balance
        const lastBalance = balance_history.length ? balance_history[balance_history.length - 1].balance : balanceAtStart;
        balance_history.push({ date: dt, balance: lastBalance, net: 0 });
      }
    }

    res.json({
      wallets,
      total_balance: Math.round(total_balance * 100) / 100,
      monthly_income: Math.round(monthly_income * 100) / 100,
      monthly_expense: Math.round(monthly_expense * 100) / 100,
      goals: { total: goalsTotal, completed: goalsDone },
      spendings_by_category: spendingsByCategory,
      balance_history,
      period: { start, end }
    });
  } catch (err) {
    console.error("getDashboard error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
