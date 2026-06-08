import path from 'path';
import { Command } from 'commander';
import { parseTasks, getTask } from '../core/parser';
import { generatePrompt, formatTaskSummary } from '../core/generator';
import { copyToClipboard } from '../utils/clipboard';

const SEP = '─'.repeat(60);

export function registerTask(program: Command): void {
  program
    .command('task <n>')
    .description('Generate a bounded agent prompt for task number n')
    .option('--copy', 'copy the prompt to clipboard')
    .action(async (nStr: string, opts: { copy?: boolean }) => {
      const n = parseInt(nStr, 10);
      if (isNaN(n)) {
        console.error(`Error: "${nStr}" is not a valid task number`);
        process.exit(1);
      }

      try {
        const tasks = await parseTasks(path.join(process.cwd(), 'TASKS.md'));
        const task = getTask(tasks, n);

        if (!task) {
          console.error(`Task ${n} not found in TASKS.md`);
          process.exit(1);
        }

        const prompt = generatePrompt(task);
        console.log(`\n${formatTaskSummary(task)}\n`);
        console.log(SEP);
        console.log(prompt);
        console.log(SEP);

        if (opts.copy) {
          const ok = copyToClipboard(prompt);
          console.log(ok ? '\nPrompt copied to clipboard.' : '\nCould not copy to clipboard.');
        }
      } catch (err: unknown) {
        console.error(`Error: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
