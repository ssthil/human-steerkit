import path from 'path';
import { Command } from 'commander';
import { parseTasks } from '../core/parser';
import { getBudget } from '../core/tracker';
import { fileExists } from '../utils/fs';

const G = '\x1b[32m';
const Y = '\x1b[33m';
const R = '\x1b[31m';
const X = '\x1b[0m';

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length);
}

function deltaStr(actual: number, est: number): string {
  const d = actual - est;
  if (d > 0) return `${R}+${d}${X}`;
  if (d < 0) return `${G}${d}${X}`;
  return '0';
}

export function registerReport(program: Command): void {
  program
    .command('report')
    .description('Show per-task credit breakdown: estimates vs actuals')
    .action(async () => {
      const cwd = process.cwd();
      const tasksPath = path.join(cwd, 'TASKS.md');

      if (!(await fileExists(tasksPath))) {
        console.error('TASKS.md not found — run hsk init first');
        process.exit(1);
      }

      let tasks;
      try {
        tasks = await parseTasks(tasksPath);
      } catch (err: unknown) {
        console.error(`Error reading TASKS.md: ${(err as Error).message}`);
        process.exit(1);
      }

      let budget = null;
      try {
        budget = await getBudget(cwd);
      } catch {
        // budget not initialised — show estimates only
      }

      const SEP = '─'.repeat(56);
      console.log('\n' + pad(' #', 4) + '  ' + pad('Task', 24) + '  ' + pad('Est', 5) + '  ' + pad('Actual', 7) + '  Delta');
      console.log(SEP);

      let totalEst = 0;
      let totalActual = 0;
      let hasActuals = false;

      for (const task of tasks) {
        const entry = budget?.tasks[String(task.id)];
        const actual = entry?.actual ?? null;
        const est = task.credits;
        totalEst += est;

        const mark = task.status ? `${G}✓${X}` : ' ';
        const actualCol = actual !== null ? pad(String(actual), 7) : pad('—', 7);
        const deltaCol = actual !== null ? deltaStr(actual, est) : '—';

        if (actual !== null) {
          hasActuals = true;
          totalActual += actual;
        }

        console.log(
          `${mark} ${pad(String(task.id), 2)}  ${pad(task.name, 24)}  ${pad(String(est), 5)}  ${actualCol}  ${deltaCol}`,
        );
      }

      console.log(SEP);
      const totalActualCol = hasActuals ? pad(String(totalActual), 7) : pad('—', 7);
      const totalDeltaCol = hasActuals ? deltaStr(totalActual, totalEst) : '—';
      console.log(`  ${pad('', 2)}  ${pad('Total', 24)}  ${pad(String(totalEst), 5)}  ${totalActualCol}  ${totalDeltaCol}`);

      if (budget) {
        const pct = budget.total > 0 ? Math.round((budget.spent / budget.total) * 100) : 0;
        let col = G;
        if (budget.budgetStatus === 'AT RISK') col = Y;
        if (budget.budgetStatus === 'OVER BUDGET') col = R;
        console.log(`\nBudget: ${budget.spent} / ${budget.total} credits (${pct}%)  ${col}${budget.budgetStatus}${X}`);
      }

      console.log('');
    });
}
