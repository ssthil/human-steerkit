import { Task } from '../types';

const DEFAULT_CONSTRAINTS = [
  'Do not scan the whole repository',
  'Do not modify files not listed above',
  'Do not refactor unrelated code',
  'Return concise summary only',
  'Respect scope from PROJECT.md and DECISIONS.md',
];

export function generatePrompt(task: Task, customConstraints?: string[]): string {
  if (!task.reads || task.reads.length === 0) {
    throw new Error(`Task ${task.id} ("${task.name}") has no reads field — cannot generate prompt`);
  }

  const constraints = customConstraints
    ? [...DEFAULT_CONSTRAINTS, ...customConstraints]
    : DEFAULT_CONSTRAINTS;

  const constraintLines = constraints.map(c => `- ${c}`).join('\n');

  return [
    `Read only these files: ${task.reads.join(', ')}`,
    '',
    `Task: ${task.description}`,
    '',
    `Output: ${task.builds}`,
    '',
    'Constraints:',
    constraintLines,
  ].join('\n');
}

export function formatTaskSummary(task: Task): string {
  const state = task.status ? 'done' : 'pending';
  return `Task ${task.id}: ${task.name} [${state}]`;
}

export function formatPromptHeader(task: Task): string {
  return `Read only these files: ${task.reads.join(', ')}`;
}
