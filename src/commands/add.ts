import path from 'path';
import { Command } from 'commander';
import { input, number } from '@inquirer/prompts';
import { readFile, writeFile, fileExists } from '../utils/fs';
import { parseTasks } from '../core/parser';

function buildTaskBlock(
  id: number,
  name: string,
  reads: string[],
  builds: string,
  description: string,
  credits: number,
): string {
  return [
    `## Task ${id}: ${name}`,
    `reads: ${reads.join(', ')}`,
    `builds: ${builds}`,
    `description: ${description}`,
    `credits: ${credits}`,
    `status: [ ]`,
  ].join('\n');
}

export function registerAdd(program: Command): void {
  program
    .command('add')
    .description('Interactively add a new task to TASKS.md')
    .action(async () => {
      const tasksPath = path.join(process.cwd(), 'TASKS.md');

      let nextId = 1;
      if (await fileExists(tasksPath)) {
        try {
          const existing = await parseTasks(tasksPath);
          if (existing.length > 0) {
            nextId = Math.max(...existing.map(t => t.id)) + 1;
          }
        } catch {
          // unparseable — start from 1
        }
      }

      console.log(`\nAdding Task ${nextId}\n`);

      const name = await input({ message: 'Task name:' });
      const readsRaw = await input({ message: 'Files to read (comma-separated):' });
      const reads = readsRaw.split(',').map(s => s.trim()).filter(Boolean);
      const builds = await input({ message: 'Output (file or description):' });
      const description = await input({ message: 'Task description:' });
      const credits = (await number({ message: 'Estimated credits:', default: 10 })) ?? 10;

      const block = buildTaskBlock(nextId, name, reads, builds, description, credits);

      if (await fileExists(tasksPath)) {
        const content = await readFile(tasksPath);
        const separator = content.endsWith('\n\n') ? '' : content.endsWith('\n') ? '\n' : '\n\n';
        await writeFile(tasksPath, content + separator + block + '\n');
      } else {
        await writeFile(tasksPath, `# TASKS.md\n\n${block}\n`);
      }

      console.log(`\nTask ${nextId} added to TASKS.md`);
    });
}
