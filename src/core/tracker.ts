import path from 'path';
import { BudgetConfig, TaskBudget } from '../types';
import { readJSON, writeJSON } from '../utils/fs';

export interface BudgetStatus {
  total: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  budgetStatus: 'ON TRACK' | 'AT RISK' | 'OVER BUDGET';
}

const budgetPath = (projectRoot: string) =>
  path.join(projectRoot, '.hsk', 'budget.json');

export async function initBudget(projectRoot: string, total: number): Promise<void> {
  const config: BudgetConfig = { total, spent: 0, remaining: total, tasks: {} };
  await writeJSON(budgetPath(projectRoot), config);
}

export async function getBudget(projectRoot: string): Promise<BudgetConfig> {
  try {
    return await readJSON<BudgetConfig>(budgetPath(projectRoot));
  } catch {
    throw new Error('Budget not initialised — run hsk budget <total> first');
  }
}

export async function setTotal(projectRoot: string, total: number): Promise<void> {
  const config = await getBudget(projectRoot);
  config.total = total;
  config.remaining = total - config.spent;
  await writeJSON(budgetPath(projectRoot), config);
}

export async function recordSpend(
  projectRoot: string,
  taskN: number,
  credits: number,
): Promise<void> {
  const config = await getBudget(projectRoot);
  const entry: TaskBudget = { estimate: credits, actual: credits, status: 'done' };
  config.tasks[String(taskN)] = entry;
  config.spent = Object.values(config.tasks).reduce(
    (sum, t) => sum + (t.actual ?? 0),
    0,
  );
  config.remaining = config.total - config.spent;
  await writeJSON(budgetPath(projectRoot), config);
}

export async function getStatus(projectRoot: string): Promise<BudgetStatus> {
  const config = await getBudget(projectRoot);
  const { total, spent, remaining } = config;
  const percentUsed = total > 0 ? Math.round((spent / total) * 1000) / 10 : 0;

  let budgetStatus: BudgetStatus['budgetStatus'];
  if (spent > total) {
    budgetStatus = 'OVER BUDGET';
  } else if (remaining < total * 0.2) {
    budgetStatus = 'AT RISK';
  } else {
    budgetStatus = 'ON TRACK';
  }

  return { total, spent, remaining, percentUsed, budgetStatus };
}
