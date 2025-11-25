import React from 'react';
import usePageTitle from '../../hooks/usePageTitle/usePageTitle';
import GoalCard from './components/GoalCard/GoalCard';
import AutoSavings from './components/AutoSavings/AutoSavings';
import AddGoal from './components/AddGoal/AddGoal';
import AddRule from './components/AddRule/AddRule';
import GoalPopup from './components/GoalsPopup/GoalPopup';
import AutoRulePopup from './components/AutoRulePopup/AutoRulePopup';
import styles from './Goals.module.css';

const initialGoals = [
  {
    id: 'g1',
    title: 'Відпустка',
    subtitle: 'Подорожі',
    current: 2500,
    target: 3500,
    walletLabel: 'vac',
    deadline: '2025-12-31',
    checked: false,
  },
  {
    id: 'g2',
    title: 'Нова камера',
    subtitle: 'Техніка',
    current: 800,
    target: 1200,
    walletLabel: 'abank',
    deadline: '2026-02-15',
    checked: false,
  },
];

const walletsMock = [
  { id: 'cash', label: 'Готівка' },
  { id: 'abank', label: 'Картка Абанк' },
  { id: 'monobank', label: 'Картка Monobank' },
  { id: 'vac', label: 'Відпустка' },
];

export default function Goals() {
  usePageTitle('Цілі');

  const [goals, setGoals] = React.useState(initialGoals);
  // rules state
  const [rules, setRules] = React.useState([
    // приклад
    {
      id: 'r1',
      title: 'Заощадження 20% з Готівки',
      percent: 20,
      sourceWalletId: 'cash',
      targetWalletId: 'vac',
      isActive: true,
    },
  ]);

  const [goalPopupOpen, setGoalPopupOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState(null);

  const [rulePopupOpen, setRulePopupOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState(null);

  // GOAL handlers
  function handleCreateGoal() { setEditingGoal(null); setGoalPopupOpen(true); }
  function handleSaveGoal(goal) {
    if (!goal.id) setGoals(prev => [{ ...goal, id: Date.now().toString() }, ...prev]);
    else setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, ...goal } : g));
  }
  function handleEditGoal(id) {
    const g = goals.find(x => x.id === id);
    setEditingGoal(g || null);
    setGoalPopupOpen(true);
  }

  // RULE handlers
  function handleCreateRule() { setEditingRule(null); setRulePopupOpen(true); }
  function handleSaveRule(rule) {
    if (!rule.id) {
      setRules(prev => [{ ...rule, id: Date.now().toString() }, ...prev]);
    } else {
      setRules(prev => prev.map(r => (r.id === rule.id ? { ...r, ...rule } : r)));
    }
  }
  function handleEditRule(id) {
    const r = rules.find(x => x.id === id);
    setEditingRule(r || null);
    setRulePopupOpen(true);
  }
  function handleToggleRule(id) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  }
  function handleRemoveRule(id) {
    setRules(prev => prev.filter(r => r.id !== id));
  }

  // For display: days left calc
  function calcDaysLeft(deadlineIso) {
    if (!deadlineIso) return undefined;
    const d = new Date(deadlineIso + 'T23:59:59');
    const now = new Date();
    const diffMs = d - now;
    if (diffMs < 0) return '0 днів';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${days} днів`;
  }

  // --- Приклад застосування правила коли додається транзакція ---
  // ПРИМІТКА: реальна інтеграція залежить від структури твого transactions store.


  const displayedGoals = goals.map(g => ({ ...g, daysLeft: calcDaysLeft(g.deadline) }));

  return (
    <>
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.content}>
            {/* GOALS */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Цілі</div>
                <div className={styles.sectionActions}>
                  <AddGoal onClick={handleCreateGoal} />
                </div>
              </div>

              <div className={styles.cardsGrid}>
                {displayedGoals.map(g => (
                  <GoalCard
                    key={g.id}
                    title={g.title}
                    subtitle={g.subtitle}
                    current={g.current}
                    target={g.target}
                    walletLabel={walletsMock.find(w=>w.id===g.walletLabel)?.label || g.walletLabel}
                    daysLeft={g.daysLeft}
                    checked={g.checked}
                    onEdit={() => handleEditGoal(g.id)}
                  />
                ))}
              </div>
            </section>

            {/* AUTOSAVINGS */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Автозаощадження</div>
                <div className={styles.sectionActions}>
                  <AddRule onClick={handleCreateRule} />
                </div>
              </div>

              <div className={styles.cardsGrid}>
                {rules.map(r => (
                  <AutoSavings
                    key={r.id}
                    id={r.id}
                    title={r.title}
                    subtitle={`${r.percent}% з ${walletsMock.find(w=>w.id===r.sourceWalletId)?.label || r.sourceWalletId} → ${walletsMock.find(w=>w.id===r.targetWalletId)?.label || r.targetWalletId}`}
                    lines={[
                      `Відсоток: ${r.percent}%`,
                      `З гаманця: ${walletsMock.find(w=>w.id===r.sourceWalletId)?.label || r.sourceWalletId}`,
                      `Надходить до: ${walletsMock.find(w=>w.id===r.targetWalletId)?.label || r.targetWalletId}`,
                    ]}
                    isActive={!!r.isActive}
                    onToggle={() => handleToggleRule(r.id)}
                    onEdit={() => handleEditRule(r.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* POPUPS */}
      <GoalPopup
        open={goalPopupOpen}
        onClose={() => { setGoalPopupOpen(false); setEditingGoal(null); }}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
        wallets={walletsMock}
      />

      <AutoRulePopup
        open={rulePopupOpen}
        onClose={() => { setRulePopupOpen(false); setEditingRule(null); }}
        onSave={handleSaveRule}
        initialRule={editingRule}
        wallets={walletsMock}
      />
    </>
  );
}
