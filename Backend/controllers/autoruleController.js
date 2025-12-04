import {
  getAutoRulesByUser,
  getAutoRuleById,
  createAutoRuleForUser,
  updateAutoRuleForUser,
  deleteAutoRuleForUser,
  getWalletById,
} from '../database.js';

import { executeRuleById   } from '../services/autoruleService.js';

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
    if (!rule || Number(rule.user_id) !== Number(req.userId)) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(rule);
  } catch (err) {
    console.error("getAutoRule error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createAutoRule(req, res) {
  try {
    const userId = Number(req.userId);
    const {
      title,
      percent: rawPercent,
      source_wallet_id: rawSource,
      target_wallet_id: rawTarget,
      is_active,
      schedule_cron = null,
    } = req.body ?? {};

    const percent = Number(rawPercent);
    const source_wallet_id = Number(rawSource);
    const target_wallet_id = Number(rawTarget);

    if (!title || !source_wallet_id || !target_wallet_id || Number.isNaN(percent)) {
      return res.status(400).json({ error: "Missing or invalid fields (title, percent, source_wallet_id, target_wallet_id)" });
    }
    if (percent <= 0 || percent > 100) {
      return res.status(400).json({ error: "percent must be between 0 and 100" });
    }
    if (source_wallet_id === target_wallet_id) {
      return res.status(400).json({ error: "source and target wallets must be different" });
    }

    const source = await getWalletById(source_wallet_id);
    const target = await getWalletById(target_wallet_id);
    if (!source || Number(source.user_id) !== userId) return res.status(400).json({ error: "Invalid source wallet" });
    if (!target || Number(target.user_id) !== userId) return res.status(400).json({ error: "Invalid target wallet" });

    const created = await createAutoRuleForUser(userId, title, percent, source_wallet_id, target_wallet_id, is_active ?? 1, schedule_cron);
    res.status(201).json(created);
  } catch (err) {
    console.error("createAutoRule error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateAutoRule(req, res) {
  try {
    const userId = Number(req.userId);
    const ruleId = Number(req.params.id);
    const updates = { ...req.body };

    const existing = await getAutoRuleById(ruleId);
    if (!existing || Number(existing.user_id) !== userId) {
      return res.status(404).json({ error: "Not found" });
    }

    if (updates.source_wallet_id !== undefined) {
      const sId = Number(updates.source_wallet_id);
      if (Number.isNaN(sId)) return res.status(400).json({ error: "Invalid source_wallet_id" });
      const s = await getWalletById(sId);
      if (!s || Number(s.user_id) !== userId) return res.status(400).json({ error: "Invalid source wallet" });
      updates.source_wallet_id = sId;
    }
    if (updates.target_wallet_id !== undefined) {
      const tId = Number(updates.target_wallet_id);
      if (Number.isNaN(tId)) return res.status(400).json({ error: "Invalid target_wallet_id" });
      const t = await getWalletById(tId);
      if (!t || Number(t.user_id) !== userId) return res.status(400).json({ error: "Invalid target wallet" });
      updates.target_wallet_id = tId;
    }

    if (updates.percent !== undefined) {
      const p = Number(updates.percent);
      if (Number.isNaN(p) || p <= 0 || p > 100) {
        return res.status(400).json({ error: "percent must be between 0 and 100" });
      }
      updates.percent = p;
    }

    const newSource = updates.source_wallet_id ?? existing.source_wallet_id;
    const newTarget = updates.target_wallet_id ?? existing.target_wallet_id;
    if (Number(newSource) === Number(newTarget)) {
      return res.status(400).json({ error: "source and target wallets must be different" });
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
    const userId = Number(req.userId);
    const ruleId = Number(req.params.id);

    const existing = await getAutoRuleById(ruleId);
    if (!existing || Number(existing.user_id) !== userId) return res.status(404).json({ error: "Not found" });

    const success = await deleteAutoRuleForUser(userId, ruleId);
    if (success) return res.status(204).send();
    return res.status(500).json({ error: "Could not delete" });
  } catch (err) {
    console.error("removeAutoRule error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function runAutoRule(req, res) {
  const ruleId = Number(req.params.id);
  const userId = Number(req.userId);

  if (Number.isNaN(ruleId) || ruleId <= 0) {
    return res.status(400).json({ executed: false, reason: "invalid_rule_id" });
  }

  try {
    const rule = await getAutoRuleById(ruleId);
    if (!rule || Number(rule.user_id) !== userId) {
      return res.status(404).json({ executed: false, reason: "not_found" });
    }
    if (!rule.is_active || Number(rule.is_active) !== 1) {
      return res.status(400).json({ executed: false, reason: "rule_inactive" });
    }

    const result = await executeRuleById(rule);

    if (!result || result.success === false) {
      return res.status(200).json({ executed: false, reason: result?.reason || "not_executed" });
    }

    return res.status(200).json({ executed: true, amount: result.amount ?? 0, details: result });
  } catch (err) {
    console.error("runAutoRule error:", err);
    const message = err && err.message ? err.message : "Internal Server Error";
    return res.status(500).json({ executed: false, reason: message });
  }
}
