import path from 'path';
import { Command } from 'commander';
import { parseTasks, getTask } from '../core/parser';
import { generatePrompt, formatTaskSummary } from '../core/generator';

const SEP = '─'.repeat(60);

export function registerTask(program: Command): void {
  program
    .command('task <n>')
    .description('Generate a bounded agent prompt for task number n')
    .action(async (nStr: string) => {
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
      } catch (err: unknown) {
        console.error(`Error: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
