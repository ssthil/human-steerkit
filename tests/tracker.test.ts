import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { initBudget, getBudget, setTotal, recordSpend, getStatus } from '../src/core/tracker';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hsk-tracker-test-'));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('initBudget', () => {
  it('creates .hsk/budget.json with correct initial values', async () => {
    await initBudget(tmpDir, 180);
    const raw = await fs.readFile(path.join(tmpDir, '.hsk', 'budget.json'), 'utf-8');
    const config = JSON.parse(raw);
    expect(config.total).toBe(180);
    expect(config.spent).toBe(0);
    expect(config.remaining).toBe(180);
    expect(config.tasks).toEqual({});
  });

  it('overwrites an existing budget.json', async () => {
    await initBudget(tmpDir, 180);
    await initBudget(tmpDir, 300);
    const config = await getBudget(tmpDir);
    expect(config.total).toBe(300);
    expect(config.remaining).toBe(300);
  });
});

describe('getBudget', () => {
  it('returns the correct BudgetConfig after init', async () => {
    await initBudget(tmpDir, 100);
    const config = await getBudget(tmpDir);
    expect(config.total).toBe(100);
    expect(config.spent).toBe(0);
    expect(config.remaining).toBe(100);
    expect(typeof config.tasks).toBe('object');
  });

  it('throws a clear error when budget is not initialised', async () => {
    await expect(getBudget(tmpDir)).rejects.toThrow(/not initialised/);
  });
});

describe('setTotal', () => {
  it('updates total and recalculates remaining', async () => {
    await initBudget(tmpDir, 100);
    await setTotal(tmpDir, 200);
    const config = await getBudget(tmpDir);
    expect(config.total).toBe(200);
    expect(config.remaining).toBe(200);
  });

  it('recalculates remaining correctly when spend already exists', async () => {
    await initBudget(tmpDir, 100);
    await recordSpend(tmpDir, 1, 30);
    await setTotal(tmpDir, 200);
    const config = await getBudget(tmpDir);
    expect(config.total).toBe(200);
    expect(config.spent).toBe(30);
    expect(config.remaining).toBe(170);
  });

  it('throws when budget is not initialised', async () => {
    await expect(setTotal(tmpDir, 200)).rejects.toThrow(/not initialised/);
  });
});

describe('recordSpend', () => {
  it('adds a task entry and updates spent and remaining', async () => {
    await initBudget(tmpDir, 100);
    await recordSpend(tmpDir, 1, 25);
    const config = await getBudget(tmpDir);
    expect(config.tasks['1']).toEqual({ estimate: 25, actual: 25, status: 'done' });
    expect(config.spent).toBe(25);
    expect(config.remaining).toBe(75);
  });

  it('accumulates spend across multiple tasks', async () => {
    await initBudget(tmpDir, 100);
    await recordSpend(tmpDir, 1, 20);
    await recordSpend(tmpDir, 2, 35);
    const config = await getBudget(tmpDir);
    expect(config.spent).toBe(55);
    expect(config.remaining).toBe(45);
  });

  it('overwrites a previous entry for the same task', async () => {
    await initBudget(tmpDir, 100);
    await recordSpend(tmpDir, 1, 20);
    await recordSpend(tmpDir, 1, 30);
    const config = await getBudget(tmpDir);
    expect(config.tasks['1'].actual).toBe(30);
    expect(config.spent).toBe(30);
  });

  it('throws when budget is not initialised', async () => {
    await expect(recordSpend(tmpDir, 1, 10)).rejects.toThrow(/not initialised/);
  });
});

describe('getStatus', () => {
  it('returns ON TRACK when remaining is >= 20% of total', async () => {
    await initBudget(tmpDir, 100);
    await recordSpend(tmpDir, 1, 50);
    const status = await getStatus(tmpDir);
    expect(status.budgetStatus).toBe('ON TRACK');
    expect(status.spent).toBe(50);
    expect(status.remaining).toBe(50);
    expect(status.percentUsed).toBe(50);
  });

  it('returns AT RISK when remaining is > 0 but < 20% of total', async () => {
    await initBudget(tmpDir, 100);
    await recordSpend(tmpDir, 1, 85);
    const status = await getStatus(tmpDir);
    expect(status.budgetStatus).toBe('AT RISK');
    expect(status.remaining).toBe(15);
  });

  it('returns ON TRACK at exactly 20% remaining', async () => {
    await initBudget(tmpDir, 100);
    await recordSpend(tmpDir, 1, 80);
    const status = await getStatus(tmpDir);
    expect(status.remaining).toBe(20);
    expect(status.budgetStatus).toBe('ON TRACK');
  });

  it('returns OVER BUDGET when spent exceeds total', async () => {
    await initBudget(tmpDir, 100);
    await recordSpend(tmpDir, 1, 110);
    const status = await getStatus(tmpDir);
    expect(status.budgetStatus).toBe('OVER BUDGET');
  });

  it('returns correct percentUsed rounded to 1 decimal', async () => {
    await initBudget(tmpDir, 300);
    await recordSpend(tmpDir, 1, 100);
    const status = await getStatus(tmpDir);
    expect(status.percentUsed).toBe(33.3);
  });

  it('throws when budget is not initialised', async () => {
    await expect(getStatus(tmpDir)).rejects.toThrow(/not initialised/);
  });
});
