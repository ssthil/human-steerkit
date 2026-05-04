import { Command } from 'commander';
import { checkProject } from '../core/checker';

const R = '\x1b[31m';
const Y = '\x1b[33m';
const G = '\x1b[32m';
const X = '\x1b[0m';

export function registerCheck(program: Command): void {
  program
    .command('check')
    .description('Scan project for credit-wasting patterns and output warnings with fixes')
    .action(async () => {
      try {
        const warnings = await checkProject(process.cwd());

        if (warnings.length === 0) {
          console.log(`${G}✓ No issues found. Your project is agent-ready.${X}`);
          return;
        }

        console.log(`\nFound ${warnings.length} issue(s):\n`);
        warnings.forEach((w, i) => {
          console.log(`${R}[${i + 1}] ${w.rule}${X}`);
          console.log(`    ${w.message}`);
          console.log(`    ${Y}Fix: ${w.fix}${X}`);
          console.log('');
        });
      } catch (err: unknown) {
        console.error(`Error: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
