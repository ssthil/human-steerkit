import { describe, it, expect } from 'vitest';
import path from 'path';
import { parseTasks, getTask, getNextPendingTask } from '../src/core/parser';

const fixture = (name: string) => path.join(__dirname, 'fixtures', name);

describe('parseTasks', () => {
  it('returns 3 tasks from valid-tasks.md', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    expect(tasks).toHaveLength(3);
  });

  it('skips Pre-Agent Tasks section', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    expect(tasks.every(t => t.id >= 1)).toBe(true);
    expect(tasks.map(t => t.name)).not.toContain('Set up repository');
  });

  it('extracts id and name correctly', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    expect(tasks[0].id).toBe(1);
    expect(tasks[0].name).toBe('Scaffold project structure');
    expect(tasks[1].id).toBe(2);
    expect(tasks[2].id).toBe(3);
  });

  it('parses reads as a string array', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    expect(Array.isArray(tasks[0].reads)).toBe(true);
    expect(tasks[0].reads).toEqual(['PROJECT.md', 'DECISIONS.md']);
  });

  it('extracts builds field', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    expect(tasks[0].builds).toBe('src/ folder layout with placeholder files');
  });

  it('extracts description field', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    expect(tasks[0].description).toContain('Create all source directories');
  });

  it('extracts credits as a number', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    expect(tasks[0].credits).toBe(10);
    expect(tasks[1].credits).toBe(15);
    expect(tasks[2].credits).toBe(20);
  });

  it('sets status false for [ ]', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    expect(tasks[0].status).toBe(false);
  });

  it('sets status true for [x]', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    expect(tasks[1].status).toBe(true);
  });

  it('throws when reads field is missing', async () => {
    await expect(parseTasks(fixture('missing-reads.md'))).rejects.toThrow(
      /missing the required reads field/
    );
  });

  it('returns tasks ordered by id', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    const ids = tasks.map(t => t.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });
});

describe('getTask', () => {
  it('returns the task matching the given id', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    const task = getTask(tasks, 2);
    expect(task).toBeDefined();
    expect(task!.id).toBe(2);
    expect(task!.name).toBe('Implement file system utilities');
  });

  it('returns undefined for a non-existent id', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    expect(getTask(tasks, 99)).toBeUndefined();
  });
});

describe('getNextPendingTask', () => {
  it('returns the first pending task', async () => {
    const tasks = await parseTasks(fixture('valid-tasks.md'));
    const next = getNextPendingTask(tasks);
    expect(next).not.toBeNull();
    expect(next!.id).toBe(1);
    expect(next!.status).toBe(false);
  });

  it('returns null when all tasks are done', () => {
    const allDone = [
      { id: 1, name: 'A', reads: [], builds: '', description: '', credits: 0, status: true },
      { id: 2, name: 'B', reads: [], builds: '', description: '', credits: 0, status: true },
    ];
    expect(getNextPendingTask(allDone)).toBeNull();
  });
});
