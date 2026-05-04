import path from 'path';
import { CheckWarning } from '../types';
import { fileExists, readFile } from '../utils/fs';
import { parseTasks } from './parser';

const BROAD_READS = /^src[/\\]?$|^[a-zA-Z0-9_-]+[/\\]$/;

export async function checkProject(projectRoot: string): Promise<CheckWarning[]> {
  const warnings: CheckWarning[] = [];

  const p = (file: string) => path.join(projectRoot, file);

  const [hasProject, hasDecisions, hasTasks, hasPrompts] = await Promise.all([
    fileExists(p('PROJECT.md')),
    fileExists(p('DECISIONS.md')),
    fileExists(p('TASKS.md')),
    fileExists(p('PROMPTS.md')),
  ]);

  if (!hasProject) {
    warnings.push({
      rule: 'PROJECT_MISSING',
      message: 'PROJECT.md not found',
      fix: 'Run hsk init to generate PROJECT.md',
    });
  }

  if (!hasDecisions) {
    warnings.push({
      rule: 'DECISIONS_MISSING',
      message: 'DECISIONS.md not found',
      fix: 'Run hsk init to generate DECISIONS.md',
    });
  }

  if (!hasTasks) {
    warnings.push({
      rule: 'TASKS_MISSING',
      message: 'TASKS.md not found',
      fix: 'Run hsk init to generate TASKS.md',
    });
  }

  if (hasTasks) {
    try {
      const tasks = await parseTasks(p('TASKS.md'));

      for (const task of tasks) {
        if (!task.reads || task.reads.length === 0) {
          warnings.push({
            rule: 'TASK_MISSING_READS',
            message: `Task ${task.id} has no reads field — agent will scan whatever it finds`,
            fix: 'Add a reads field listing only the files the agent needs',
          });
          continue;
        }

        const broad = task.reads.some(r => BROAD_READS.test(r) || r === 'src/');
        if (broad) {
          warnings.push({
            rule: 'TASK_READS_TOO_BROAD',
            message: `Task ${task.id} reads field is too broad — agent will scan entire codebase`,
            fix: 'Narrow reads to specific files not folders',
          });
        }

        if (task.reads.length > 8) {
          warnings.push({
            rule: 'TASK_READS_TOO_MANY',
            message: `Task ${task.id} has ${task.reads.length} files in reads — context too large`,
            fix: 'Split this task into two smaller tasks',
          });
        }

        const wordCount = task.description.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount < 10) {
          warnings.push({
            rule: 'TASK_DESCRIPTION_TOO_SHORT',
            message: `Task ${task.id} description is too short — agent may ask clarifying questions`,
            fix: 'Expand the task description to be more specific',
          });
        }
      }
    } catch {
      // unparseable TASKS.md — skip task-level rules
    }
  }

  if (hasPrompts) {
    try {
      const content = await readFile(p('PROMPTS.md'));
      if (!content.includes('Constraints')) {
        warnings.push({
          rule: 'PROMPTS_MISSING_CONSTRAINTS',
          message: 'PROMPTS.md is missing a constraints block',
          fix: 'Add a constraints block to PROMPTS.md',
        });
      }
    } catch {
      // treat unreadable PROMPTS.md as missing — no warning for rule 8
    }
  }

  return warnings;
}
