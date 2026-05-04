import path from 'path';
import { Command } from 'commander';
import { setTotal, initBudget } from '../core/tracker';
import { fileExists } from '../utils/fs';

export function registerBudget(program: Command): void {
  program
    .command('budget <total>')
    .description('Set total credit budget in .hsk/budget.json')
    .action(async (totalStr: string) => {
      const total = parseFloat(totalStr);
      if (isNaN(total)) {
        console.error(`Error: "${totalStr}" is not a valid budget amount`);
        process.exit(1);
      }

      const cwd = process.cwd();
      try {
        const budgetFile = path.join(cwd, '.hsk', 'budget.json');
        if (await fileExists(budgetFile)) {
          await setTotal(cwd, total);
        } else {
          await initBudget(cwd, total);
        }
        console.log(`Budget set to ${total} credits`);
      } catch (err: unknown) {
        console.error(`Error: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
