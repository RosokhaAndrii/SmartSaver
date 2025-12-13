import React, { useEffect, useState, useCallback } from "react";
import usePageTitle from "../../hooks/usePageTitle/usePageTitle";
import GoalCard from "./components/GoalCard/GoalCard";
import AutoSavings from "./components/AutoSavings/AutoSavings";
import AddGoal from "./components/AddGoal/AddGoal";
import AddRule from "./components/AddRule/AddRule";
import GoalPopup from "./components/GoalsPopup/GoalPopup";
import AutoRulePopup from "./components/AutoRulePopup/AutoRulePopup";
import styles from "./Goals.module.css";
import { useAuth } from "../../hooks/useAuth/useAuth";

export default function Goals() {
  usePageTitle("Цілі");
  const { authFetch } = useAuth();

  const [goals, setGoals] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(true);

  const [goalPopupOpen, setGoalPopupOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [rulePopupOpen, setRulePopupOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const walletsRes = await authFetch("http://localhost:8080/api/wallets");
      if (!walletsRes.ok) throw new Error("Failed to load wallets");
      const walletsData = await walletsRes.json();
      const formattedWallets = walletsData.map((w) => ({
        id: w.id.toString(),
        label: w.name,
        currency: w.currency,
        balance: Number(w.balance),
      }));
      setWallets(formattedWallets);

      const walletBalanceMap = formattedWallets.reduce((acc, wallet) => {
        acc[wallet.id] = wallet.balance;
        return acc;
      }, {});

      const goalsRes = await authFetch("http://localhost:8080/api/goals");
      if (!goalsRes.ok) throw new Error("Не вдалося завантажити цілі");
      const goalsData = await goalsRes.json();

      const formattedGoals = goalsData.map((g) => {
        const targetWalletIdStr = g.wallet_id.toString();
        const currentProgress = walletBalanceMap[targetWalletIdStr] || 0;

        return {
          id: g.id.toString(),
          title: g.title,
          subtitle: g.subtitle || g.note || "",
          note: g.note || "",
          current: currentProgress,
          target: Number(g.target_amount),
          walletId: targetWalletIdStr,
          walletLabel: g.wallet_name,
          deadline: g.due_date,
          checked: currentProgress >= Number(g.target_amount),
        };
      });

      setGoals(formattedGoals);
    } catch (error) {
      console.error("Failed to load goals data:", error);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const loadRules = useCallback(async () => {
    try {
      setRulesLoading(true);
      const res = await authFetch("http://localhost:8080/api/auto-rules");
      if (!res.ok) throw new Error("Failed to load rules");
      const data = await res.json();
      const normalized = data.map((r) => ({
        id: String(r.id),
        title: r.title,
        percent: Number(r.percent),
        sourceWalletId: String(r.source_wallet_id),
        targetWalletId: String(r.target_wallet_id),
        isActive: !!r.is_active,
        scheduleCron: r.schedule_cron,
        lastRun: r.last_run,
        sourceWalletName: r.source_wallet_name,
        targetWalletName: r.target_wallet_name,
      }));
      setRules(normalized);
    } catch (err) {
      console.error("Failed to load rules:", err);
    } finally {
      setRulesLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadData();
    loadRules();
  }, [loadData, loadRules]);

  function handleCreateGoal() {
    setEditingGoal(null);
    setGoalPopupOpen(true);
  }

  async function handleSaveGoal(goal) {
    const walletIdNum = Number(goal.walletId);
    const targetAmountNum = Number(goal.target);
    if (walletIdNum <= 0 || targetAmountNum <= 0) {
      throw new Error(
        "Missing required fields or invalid values: wallet_id, title, target_amount must be positive numbers."
      );
    }

    const apiGoal = {
      wallet_id: walletIdNum,
      title: goal.title,
      target_amount: targetAmountNum,
      due_date: goal.deadline || null,
      saved_amount: 0,
      subtitle: goal.subtitle || "",
      note: goal.note || "",
    };

    try {
      if (!goal.id) {
        const res = await authFetch("http://localhost:8080/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiGoal),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Не вдалося створити ціль");
        }
      } else {
        const res = await authFetch(`http://localhost:8080/api/goals/${goal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiGoal),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update goal");
        }
      }

      await loadData();
      setGoalPopupOpen(false);
      setEditingGoal(null);
    } catch (err) {
      console.error("Error saving goal:", err);
      throw err;
    }
  }

  function handleEditGoal(id) {
    const g = goals.find((x) => x.id === id);
    setEditingGoal(g || null);
    setGoalPopupOpen(true);
  }

  async function handleDeleteGoal(goalId) {
    try {
      const res = await authFetch(`http://localhost:8080/api/goals/${goalId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Не вдалося видалити ціль. Статус: ${res.status}`);
      }
      await loadData();
      setGoalPopupOpen(false);
      setEditingGoal(null);
    } catch (err) {
      console.error("Помилка при видаленні цілі:", err);
      alert(`Помилка при видаленні цілі: ${err.message}`);
    }
  }

  function handleCreateRule() {
    setEditingRule(null);
    setRulePopupOpen(true);
  }

  async function handleSaveRule(rule) {
    const payload = {
      title: rule.title,
      percent: Number(rule.percent),
      source_wallet_id: Number(rule.sourceWalletId),
      target_wallet_id: Number(rule.targetWalletId),
      is_active: rule.isActive ? 1 : 0,
      schedule_cron: rule.scheduleCron ?? null,
    };
 console.log("handleSaveRule payload:", payload);
    try {
      if (!rule.id) {
        const res = await authFetch("http://localhost:8080/api/auto-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to create rule");
        }
      } else {
        const res = await authFetch(`http://localhost:8080/api/auto-rules/${rule.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to update rule");
        }
      }
      await loadRules();
    } catch (err) {
      console.error("handleSaveRule error:", err);
      throw err;
    }
  }

  async function handleEditRule(id) {
    const r = rules.find((x) => x.id === id);
    setEditingRule(r || null);
    setRulePopupOpen(true);
  }

  async function handleDeleteRule(ruleId) {
    try {
      const res = await authFetch(`http://localhost:8080/api/auto-rules/${ruleId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to delete rule (${res.status})`);
      }
      await loadRules();
    } catch (err) {
      console.error("Failed to delete rule:", err);
      alert(err.message || "Помилка при видаленні правила");
    }
  }

  async function toggleRuleActive(ruleId, currentActive) {
    try {
      const res = await authFetch(`http://localhost:8080/api/auto-rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: currentActive ? 0 : 1 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to toggle rule");
      }
      await loadRules();
    } catch (err) {
      console.error("toggleRuleActive error:", err);
      alert(err.message || "Не вдалося змінити стан правила");
    }
  }

  async function runRuleNow(ruleId) {
    try {
      const res = await authFetch(`http://localhost:8080/api/auto-rules/${ruleId}/run`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to run rule");
      }
      const data = await res.json();
      if (data.executed) {
        alert(`Правило виконано: ${data.amount}`);
        await Promise.all([loadData(), loadRules()]);
      } else {
        alert(`Правило не виконано: ${data.reason || "не відомо чому"}`);
      }
    } catch (err) {
      console.error("runRuleNow error:", err);
      alert(err.message || "Помилка при запуску правила");
    }
  }


  function calcDaysLeft(deadlineIso) {
    if (!deadlineIso) return undefined;
    const d = new Date(deadlineIso + "T23:59:59");
    const now = new Date();
    const diffMs = d - now;
    if (diffMs < 0) return "0 днів";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${days} днів`;
  }

  const displayedGoals = goals.map((g) => ({
    ...g,
    daysLeft: calcDaysLeft(g.deadline),
  }));

  const getWalletLabel = useCallback((id) => wallets.find((w) => w.id === id)?.label || id, [wallets]);

  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>Завантаження даних...</p>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.content}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Цілі</div>
                <div className={styles.sectionActions}>
                  <AddGoal onClick={handleCreateGoal} />
                </div>
              </div>

              <div className={styles.cardsGrid}>
                {displayedGoals.map((g) => (
                  <GoalCard
                    dataCy={`goal-card-${g.id}`}
                    key={g.id}
                    title={g.title}
                    subtitle={g.subtitle}
                    current={g.current}
                    target={g.target}
                    walletLabel={g.walletLabel}
                    daysLeft={g.daysLeft}
                    checked={g.checked}
                    onEdit={() => handleEditGoal(g.id)}
                  />
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Автозаощадження</div>
                <div className={styles.sectionActions}>
                  <AddRule onClick={handleCreateRule} />
                </div>
              </div>

              <div className={styles.cardsGrid}>
                {rulesLoading ? (
                  <div>Завантаження правил...</div>
                ) : rules.length === 0 ? (
                  <div>Правил немає</div>
                ) : (
                  rules.map((r) => (
                    <AutoSavings
                      key={r.id}
                      id={r.id}
                      title={r.title}
                      subtitle={`${r.percent}% з ${getWalletLabel(r.sourceWalletId)} → ${getWalletLabel(r.targetWalletId)}`}
                      lines={[
                        `Відсоток: ${r.percent}%`,
                        `З гаманця: ${getWalletLabel(r.sourceWalletId)}`,
                        `Куди: ${getWalletLabel(r.targetWalletId)}`,
                      ]}
                      isActive={!!r.isActive}
                      onToggle={() => toggleRuleActive(r.id, r.isActive)}
                      onEdit={() => handleEditRule(r.id)}
                      onRun={() => runRuleNow(r.id)}      
                      onDelete={() => handleDeleteRule(r.id)} 
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      <GoalPopup
        open={goalPopupOpen}
        onClose={() => {
          setGoalPopupOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        initialGoal={editingGoal}
        wallets={wallets}
      />

      <AutoRulePopup
        open={rulePopupOpen}
        onClose={() => {
          setRulePopupOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule} 
        initialRule={editingRule}
        wallets={wallets}
        onDelete={handleDeleteRule}
      />
    </>
  );
}
