import { Task } from '../types';
import { readFile } from '../utils/fs';

const TASK_HEADING = /^## Task (\d+): (.+)$/;
const FIELD = (name: string) => new RegExp(`^${name}:\\s*(.+)$`);

function parseBlock(lines: string[]): Task {
  const heading = lines[0].match(TASK_HEADING)!;
  const id = parseInt(heading[1], 10);
  const name = heading[2].trim();

  let reads: string[] | undefined;
  let builds = '';
  let description = '';
  let credits = 0;
  let status = false;

  for (const line of lines.slice(1)) {
    const readsMatch = line.match(FIELD('reads'));
    if (readsMatch) {
      reads = readsMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      continue;
    }
    const buildsMatch = line.match(FIELD('builds'));
    if (buildsMatch) { builds = buildsMatch[1].trim(); continue; }

    const descMatch = line.match(FIELD('description'));
    if (descMatch) { description = descMatch[1].trim(); continue; }

    const creditsMatch = line.match(FIELD('credits'));
    if (creditsMatch) { credits = parseInt(creditsMatch[1], 10) || 0; continue; }

    const statusMatch = line.match(FIELD('status'));
    if (statusMatch) { status = statusMatch[1].trim() === '[x]'; continue; }
  }

  if (reads === undefined) {
    throw new Error(`Task ${id} ("${name}") is missing the required reads field`);
  }

  return { id, name, reads, builds, description, credits, status };
}

export async function parseTasks(filePath: string): Promise<Task[]> {
  const content = await readFile(filePath);
  const lines = content.split('\n');

  const blocks: string[][] = [];
  let current: string[] | null = null;
  let inPreAgent = false;

  for (const line of lines) {
    if (line.startsWith('## Pre-Agent')) {
      inPreAgent = true;
      current = null;
      continue;
    }
    if (line.startsWith('## Task ') && TASK_HEADING.test(line)) {
      inPreAgent = false;
      if (current) blocks.push(current);
      current = [line];
      continue;
    }
    if (line.startsWith('## ') && !TASK_HEADING.test(line)) {
      inPreAgent = false;
      if (current) { blocks.push(current); current = null; }
      continue;
    }
    if (!inPreAgent && current) {
      current.push(line);
    }
  }
  if (current) blocks.push(current);

  return blocks
    .map(parseBlock)
    .sort((a, b) => a.id - b.id);
}

export function getTask(tasks: Task[], n: number): Task | undefined {
  return tasks.find(t => t.id === n);
}

export function getNextPendingTask(tasks: Task[]): Task | null {
  return tasks.find(t => !t.status) ?? null;
}
