import path from 'path';
import { Command } from 'commander';
import { readFile, writeFile } from '../utils/fs';

export function registerDone(program: Command): void {
  program
    .command('done <n>')
    .description('Mark task n complete in TASKS.md')
    .action(async (nStr: string) => {
      const n = parseInt(nStr, 10);
      if (isNaN(n)) {
        console.error(`Error: "${nStr}" is not a valid task number`);
        process.exit(1);
      }

      const tasksPath = path.join(process.cwd(), 'TASKS.md');

      try {
        const content = await readFile(tasksPath);
        const lines = content.split('\n');

        const headingIdx = lines.findIndex(l => new RegExp(`^## Task ${n}:`).test(l));
        if (headingIdx === -1) {
          console.error(`Task ${n} not found in TASKS.md`);
          process.exit(1);
        }

        let patched = false;
        for (let i = headingIdx + 1; i < lines.length; i++) {
          if (lines[i].startsWith('## ')) break;
          if (lines[i].trim() === 'status: [ ]') {
            lines[i] = lines[i].replace('status: [ ]', 'status: [x]');
            patched = true;
            break;
          }
        }

        if (!patched) {
          console.error(`Task ${n} is already done or has no status field`);
          process.exit(1);
        }

        await writeFile(tasksPath, lines.join('\n'));
        console.log(`Task ${n} marked as done`);
      } catch (err: unknown) {
        console.error(`Error: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
