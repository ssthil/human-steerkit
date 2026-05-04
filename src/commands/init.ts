import path from 'path';
import { Command } from 'commander';
import { input, select, confirm, number } from '@inquirer/prompts';
import { writeFile, fileExists } from '../utils/fs';
import { initBudget } from '../core/tracker';
import { TemplateTask } from '../types';

const STACKS = ['fullstack-py', 'nextjs-api', 'fastapi-only', 'express-api', 'blank'] as const;
const AGENTS = ['Claude Code', 'Cursor', 'Copilot', 'MinMax', 'Windsurf', 'Other'] as const;

interface BlankTemplate {
  tasks: TemplateTask[];
}

async function loadTemplate(stack: string): Promise<TemplateTask[]> {
  const templatePath = path.join(__dirname, 'templates', `${stack}.json`);
  if (await fileExists(templatePath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tpl = require(templatePath) as BlankTemplate;
    return tpl.tasks ?? [];
  }
  return [];
}

function buildProjectMd(projectName: string, goal: string, agentTool: string, stack: string): string {
  return `# PROJECT.md
# ${projectName}

## Goal
${goal}

## Agent Tool
${agentTool}

## Stack
${stack}

## Scope
Edit this section to define your MVP scope.

## Non-Negotiables
- All calculations must be code-computed
- Respect scope from DECISIONS.md
`;
}

function buildDecisionsMd(projectName: string, stack: string, agentTool: string, budget: number): string {
  return `# DECISIONS.md
# ${projectName} — Locked Decisions

## Stack
- Framework: ${stack}
- Agent tool: ${agentTool}
- Budget: ${budget} credits

## Non-Negotiables
Edit this section to lock your decisions before running the agent.
`;
}

function buildTasksMd(tasks: TemplateTask[]): string {
  if (tasks.length === 0) {
    return `# TASKS.md\n`;
  }
  const blocks = tasks.map((t, i) => {
    const n = i + 1;
    return [
      `## Task ${n}: ${t.name}`,
      `reads: ${t.reads.join(', ')}`,
      `builds: ${t.builds}`,
      `description: ${t.description}`,
      `credits: ${t.credits}`,
      `status: [ ]`,
    ].join('\n');
  });
  return blocks.join('\n\n') + '\n';
}

function buildPromptsMd(projectName: string): string {
  return `# PROMPTS.md
# ${projectName} — Agent Prompt Templates

## Universal Constraints Block
Add to the end of every agent prompt:

Constraints:
- Do not scan the whole repository
- Do not modify files not listed above
- Do not refactor unrelated code
- Return concise summary only
- Respect scope from PROJECT.md and DECISIONS.md
`;
}

export function registerInit(program: Command): void {
  program
    .command('init')
    .description('Interactive wizard: scaffolds PROJECT.md, TASKS.md, DECISIONS.md, PROMPTS.md and folder structure')
    .action(async () => {
      const projectName = await input({ message: 'Project name:' });
      const goal = await input({ message: 'One-line project goal:' });
      const stack = await select({
        message: 'Tech stack:',
        choices: STACKS.map(s => ({ value: s })),
      });
      const agentTool = await select({
        message: 'AI agent tool:',
        choices: AGENTS.map(a => ({ value: a })),
      });
      const budget = await number({ message: 'Total credit or token budget:', default: 180 }) ?? 180;
      const confirmed = await confirm({ message: 'Generate project files?', default: true });

      if (!confirmed) {
        console.log('Aborted.');
        return;
      }

      const cwd = process.cwd();
      const tasks = await loadTemplate(stack);

      await Promise.all([
        writeFile(path.join(cwd, 'PROJECT.md'), buildProjectMd(projectName, goal, agentTool, stack)),
        writeFile(path.join(cwd, 'DECISIONS.md'), buildDecisionsMd(projectName, stack, agentTool, budget)),
        writeFile(path.join(cwd, 'TASKS.md'), buildTasksMd(tasks)),
        writeFile(path.join(cwd, 'PROMPTS.md'), buildPromptsMd(projectName)),
        initBudget(cwd, budget),
      ]);

      console.log('\nCreated:');
      console.log('  PROJECT.md');
      console.log('  DECISIONS.md');
      console.log('  TASKS.md');
      console.log('  PROMPTS.md');
      console.log('  .hsk/budget.json');
      console.log('\nNext: Run hsk next to get your first agent prompt');
    });
}
