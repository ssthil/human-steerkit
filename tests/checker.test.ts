import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { checkProject } from '../src/core/checker';

let tmpDir: string;

const write = (file: string, content: string) =>
  fs.writeFile(path.join(tmpDir, file), content, 'utf-8');

// A task that passes all 4 task-level rules:
// - specific reads (not broad, ≤8 files)
// - description with 17 words
const VALID_TASK = `## Task 1: Implement all required utility functions correctly
reads: src/types.ts, src/utils/fs.ts
builds: src/output.ts
description: Implement all the required functions using the interfaces defined in the types and utilities files
credits: 10
status: [ ]
`;

const writeAllClean = async () => {
  await write('PROJECT.md', '# Project');
  await write('DECISIONS.md', '# Decisions');
  await write('TASKS.md', VALID_TASK);
  await write('PROMPTS.md', '# Prompts\n\nConstraints:\n- Do not modify files\n');
};

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hsk-checker-test-'));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('checkProject', () => {
  it('returns empty array when all rules pass', async () => {
    await writeAllClean();
    expect(await checkProject(tmpDir)).toEqual([]);
  });

  it('never throws even when all files are missing', async () => {
    await expect(checkProject(tmpDir)).resolves.toBeDefined();
  });

  it('warning objects have rule, message, and fix fields populated', async () => {
    // empty dir — at least rules 1-3 fire
    const warnings = await checkProject(tmpDir);
    expect(warnings.length).toBeGreaterThan(0);
    for (const w of warnings) {
      expect(typeof w.rule).toBe('string');
      expect(w.rule.length).toBeGreaterThan(0);
      expect(typeof w.message).toBe('string');
      expect(w.message.length).toBeGreaterThan(0);
      expect(typeof w.fix).toBe('string');
      expect(w.fix.length).toBeGreaterThan(0);
    }
  });

  describe('Rule 1 — PROJECT_MISSING', () => {
    it('triggers when PROJECT.md is absent', async () => {
      await write('DECISIONS.md', '# Decisions');
      await write('TASKS.md', VALID_TASK);
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'PROJECT_MISSING')).toBe(true);
    });

    it('does not trigger when PROJECT.md exists', async () => {
      await writeAllClean();
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'PROJECT_MISSING')).toBe(false);
    });
  });

  describe('Rule 2 — DECISIONS_MISSING', () => {
    it('triggers when DECISIONS.md is absent', async () => {
      await write('PROJECT.md', '# Project');
      await write('TASKS.md', VALID_TASK);
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'DECISIONS_MISSING')).toBe(true);
    });

    it('does not trigger when DECISIONS.md exists', async () => {
      await writeAllClean();
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'DECISIONS_MISSING')).toBe(false);
    });
  });

  describe('Rule 3 — TASKS_MISSING', () => {
    it('triggers when TASKS.md is absent', async () => {
      await write('PROJECT.md', '# Project');
      await write('DECISIONS.md', '# Decisions');
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'TASKS_MISSING')).toBe(true);
    });

    it('does not trigger when TASKS.md exists', async () => {
      await writeAllClean();
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'TASKS_MISSING')).toBe(false);
    });
  });

  describe('Rule 4 — TASK_MISSING_READS', () => {
    it('triggers when a task reads field is present but empty', async () => {
      await write('PROJECT.md', '# Project');
      await write('DECISIONS.md', '# Decisions');
      // "reads: ," splits to ['',''] → filter(Boolean) → [] so parseTasks
      // returns a task with reads=[] rather than throwing
      await write('TASKS.md', `## Task 1: A task with empty reads content after filtering
reads: ,
builds: src/out.ts
description: This task intentionally has an empty reads field to trigger the warning rule
credits: 5
status: [ ]
`);
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'TASK_MISSING_READS')).toBe(true);
    });

    it('does not trigger when task has reads with specific files', async () => {
      await writeAllClean();
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'TASK_MISSING_READS')).toBe(false);
    });
  });

  describe('Rule 5 — TASK_READS_TOO_BROAD', () => {
    it('triggers when reads contains src/', async () => {
      await write('PROJECT.md', '# Project');
      await write('DECISIONS.md', '# Decisions');
      await write('TASKS.md', `## Task 1: A task that reads the entire src directory folder
reads: src/
builds: src/out.ts
description: This task reads from the entire src directory which is far too broad for the agent to handle
credits: 5
status: [ ]
`);
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'TASK_READS_TOO_BROAD')).toBe(true);
    });

    it('does not trigger when reads contains specific file paths', async () => {
      await writeAllClean();
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'TASK_READS_TOO_BROAD')).toBe(false);
    });
  });

  describe('Rule 6 — TASK_READS_TOO_MANY', () => {
    it('triggers when reads has 9 files', async () => {
      await write('PROJECT.md', '# Project');
      await write('DECISIONS.md', '# Decisions');
      const nineFiles = Array.from({ length: 9 }, (_, i) => `src/file${i + 1}.ts`).join(', ');
      await write('TASKS.md', `## Task 1: A task with nine specific files listed in the reads field
reads: ${nineFiles}
builds: src/out.ts
description: This task has nine files in the reads field which exceeds the maximum of eight allowed
credits: 5
status: [ ]
`);
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'TASK_READS_TOO_MANY')).toBe(true);
    });

    it('does not trigger when reads has exactly 8 files', async () => {
      await write('PROJECT.md', '# Project');
      await write('DECISIONS.md', '# Decisions');
      const eightFiles = Array.from({ length: 8 }, (_, i) => `src/file${i + 1}.ts`).join(', ');
      await write('TASKS.md', `## Task 1: A task with exactly eight files listed in the reads field
reads: ${eightFiles}
builds: src/out.ts
description: This task has exactly eight files in the reads field which is the maximum number allowed
credits: 5
status: [ ]
`);
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'TASK_READS_TOO_MANY')).toBe(false);
    });
  });

  describe('Rule 7 — TASK_DESCRIPTION_TOO_SHORT', () => {
    it('triggers when description has 5 words', async () => {
      await write('PROJECT.md', '# Project');
      await write('DECISIONS.md', '# Decisions');
      await write('TASKS.md', `## Task 1: A task with a very short description field value
reads: src/types.ts
builds: src/out.ts
description: Create a simple function now
credits: 5
status: [ ]
`);
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'TASK_DESCRIPTION_TOO_SHORT')).toBe(true);
    });

    it('does not trigger when description has 10 or more words', async () => {
      await writeAllClean();
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'TASK_DESCRIPTION_TOO_SHORT')).toBe(false);
    });
  });

  describe('Rule 8 — PROMPTS_MISSING_CONSTRAINTS', () => {
    it('triggers when PROMPTS.md exists but lacks "Constraints"', async () => {
      await write('PROJECT.md', '# Project');
      await write('DECISIONS.md', '# Decisions');
      await write('TASKS.md', VALID_TASK);
      await write('PROMPTS.md', '# Prompts\n\nSome content without the required section.\n');
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'PROMPTS_MISSING_CONSTRAINTS')).toBe(true);
    });

    it('does not trigger when PROMPTS.md contains "Constraints"', async () => {
      await writeAllClean();
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'PROMPTS_MISSING_CONSTRAINTS')).toBe(false);
    });

    it('does not trigger when PROMPTS.md is missing', async () => {
      await write('PROJECT.md', '# Project');
      await write('DECISIONS.md', '# Decisions');
      await write('TASKS.md', VALID_TASK);
      const warnings = await checkProject(tmpDir);
      expect(warnings.some(w => w.rule === 'PROMPTS_MISSING_CONSTRAINTS')).toBe(false);
    });
  });
});
