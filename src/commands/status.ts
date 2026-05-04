import path from 'path';
import { Command } from 'commander';
import { parseTasks, getNextPendingTask } from '../core/parser';
import { getStatus } from '../core/tracker';
import { readFile, fileExists } from '../utils/fs';

const SEP = '─'.repeat(40);

async function getProjectName(cwd: string): Promise<string> {
  const projectPath = path.join(cwd, 'PROJECT.md');
  if (!(await fileExists(projectPath))) return 'Project';
  try {
    const lines = (await readFile(projectPath)).split('\n');
    const heading = lines.find((l, i) => i > 0 && l.startsWith('# '));
    return heading ? heading.replace(/^# /, '').trim() : 'Project';
  } catch {
    return 'Project';
  }
}

export function registerStatus(program: Command): void {
  program
    .command('status')
    .description('Show task progress and budget summary')
    .action(async () => {
      const cwd = process.cwd();

      // Task progress
      let tasks: Awaited<ReturnType<typeof parseTasks>> = [];
      try {
        tasks = await parseTasks(path.join(cwd, 'TASKS.md'));
      } catch {
        console.error('Warning: could not read TASKS.md');
      }

      const done = tasks.filter(t => t.status).length;
      const total = tasks.length;
      const next = getNextPendingTask(tasks);
      const projectName = await getProjectName(cwd);

      // Budget
      let budget: Awaited<ReturnType<typeof getStatus>> | null = null;
      try {
        budget = await getStatus(cwd);
      } catch {
        // budget not initialised — show warning inline
      }

      console.log(`\n${projectName} — Project Status`);
      console.log(SEP);
      console.log(`Tasks complete:    ${done} / ${total}`);

      if (budget) {
        console.log(`Credits spent:     ${budget.spent} / ${budget.total}`);
        console.log(`Credits remaining: ${budget.remaining}`);
        console.log(`Budget status:     ${budget.budgetStatus}`);
      } else {
        console.log('Credits:           not initialised — run hsk budget <total>');
      }

      console.log(SEP);

      if (next) {
        console.log(`Next task: Task ${next.id} — ${next.name}`);
      } else if (total > 0) {
        console.log('All tasks complete.');
      } else {
        console.log('No tasks found. Run hsk init to get started.');
      }

      console.log('');
    });
}
