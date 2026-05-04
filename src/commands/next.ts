import path from 'path';
import { Command } from 'commander';
import { parseTasks, getNextPendingTask } from '../core/parser';
import { generatePrompt, formatTaskSummary } from '../core/generator';

const SEP = '─'.repeat(60);

export function registerNext(program: Command): void {
  program
    .command('next')
    .description('Find the first unchecked task and output its prompt')
    .action(async () => {
      try {
        const tasks = await parseTasks(path.join(process.cwd(), 'TASKS.md'));
        const task = getNextPendingTask(tasks);

        if (!task) {
          console.log('All tasks complete. Nothing left to do.');
          return;
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
