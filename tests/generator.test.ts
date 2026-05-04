import { describe, it, expect } from 'vitest';
import { generatePrompt, formatTaskSummary, formatPromptHeader } from '../src/core/generator';
import { Task } from '../src/types';

const baseTask: Task = {
  id: 3,
  name: 'Implement parser',
  reads: ['src/types.ts', 'src/utils/fs.ts'],
  builds: 'src/core/parser.ts',
  description: 'Parse TASKS.md into typed Task objects',
  credits: 20,
  status: false,
};

describe('generatePrompt', () => {
  it('contains all reads files', () => {
    const prompt = generatePrompt(baseTask);
    expect(prompt).toContain('src/types.ts');
    expect(prompt).toContain('src/utils/fs.ts');
  });

  it('contains the task description', () => {
    const prompt = generatePrompt(baseTask);
    expect(prompt).toContain('Parse TASKS.md into typed Task objects');
  });

  it('contains the builds field as the Output line', () => {
    const prompt = generatePrompt(baseTask);
    expect(prompt).toContain('Output: src/core/parser.ts');
  });

  it('always appends the default constraints block', () => {
    const prompt = generatePrompt(baseTask);
    expect(prompt).toContain('Constraints:');
    expect(prompt).toContain('- Do not scan the whole repository');
    expect(prompt).toContain('- Do not modify files not listed above');
    expect(prompt).toContain('- Do not refactor unrelated code');
    expect(prompt).toContain('- Return concise summary only');
    expect(prompt).toContain('- Respect scope from PROJECT.md and DECISIONS.md');
  });

  it('appends custom constraints after the defaults', () => {
    const custom = ['Only edit files listed in reads', 'Output must be TypeScript'];
    const prompt = generatePrompt(baseTask, custom);
    expect(prompt).toContain('- Only edit files listed in reads');
    expect(prompt).toContain('- Output must be TypeScript');
    expect(prompt).toContain('- Do not scan the whole repository');
    const defaultIdx = prompt.indexOf('- Do not scan the whole repository');
    const customIdx = prompt.indexOf('- Only edit files listed in reads');
    expect(customIdx).toBeGreaterThan(defaultIdx);
  });

  it('throws when reads is an empty array', () => {
    const task = { ...baseTask, reads: [] };
    expect(() => generatePrompt(task)).toThrow(/no reads field/);
  });

  it('throws when reads is undefined', () => {
    const task = { ...baseTask, reads: undefined as unknown as string[] };
    expect(() => generatePrompt(task)).toThrow(/no reads field/);
  });

  it('starts with "Read only these files:"', () => {
    const prompt = generatePrompt(baseTask);
    expect(prompt.startsWith('Read only these files:')).toBe(true);
  });

  it('contains a "Task:" line', () => {
    const prompt = generatePrompt(baseTask);
    expect(prompt).toMatch(/^Task: .+/m);
  });

  it('contains an "Output:" line', () => {
    const prompt = generatePrompt(baseTask);
    expect(prompt).toMatch(/^Output: .+/m);
  });

  it('contains a "Constraints:" section', () => {
    const prompt = generatePrompt(baseTask);
    expect(prompt).toMatch(/^Constraints:$/m);
  });
});

describe('formatTaskSummary', () => {
  it('returns correct string for a pending task', () => {
    expect(formatTaskSummary(baseTask)).toBe('Task 3: Implement parser [pending]');
  });

  it('returns correct string for a done task', () => {
    const done = { ...baseTask, status: true };
    expect(formatTaskSummary(done)).toBe('Task 3: Implement parser [done]');
  });
});

describe('formatPromptHeader', () => {
  it('returns the correct reads line', () => {
    expect(formatPromptHeader(baseTask)).toBe(
      'Read only these files: src/types.ts, src/utils/fs.ts'
    );
  });
});
