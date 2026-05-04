import { Command } from 'commander';
import { recordSpend, getBudget } from '../core/tracker';

export function registerSpend(program: Command): void {
  program
    .command('spend <n> <credits>')
    .description('Record actual credits used for task n in .hsk/budget.json')
    .action(async (nStr: string, creditsStr: string) => {
      const n = parseInt(nStr, 10);
      const credits = parseFloat(creditsStr);

      if (isNaN(n)) {
        console.error(`Error: "${nStr}" is not a valid task number`);
        process.exit(1);
      }
      if (isNaN(credits)) {
        console.error(`Error: "${creditsStr}" is not a valid credit amount`);
        process.exit(1);
      }

      const cwd = process.cwd();
      try {
        await recordSpend(cwd, n, credits);
        const budget = await getBudget(cwd);
        console.log(`Recorded ${credits} credits for Task ${n}`);
        console.log(`Total spent: ${budget.spent} / ${budget.total} (${budget.remaining} remaining)`);
      } catch (err: unknown) {
        const msg = (err as Error).message;
        if (msg.includes('not initialised')) {
          console.error('Budget not initialised. Run hsk budget <total> first.');
        } else {
          console.error(`Error: ${msg}`);
        }
        process.exit(1);
      }
    });
}
