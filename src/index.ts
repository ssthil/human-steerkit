#!/usr/bin/env node
import { Command } from 'commander';
import { registerInit } from './commands/init';
import { registerTask } from './commands/task';
import { registerNext } from './commands/next';
import { registerDone } from './commands/done';
import { registerStatus } from './commands/status';
import { registerCheck } from './commands/check';
import { registerSpend } from './commands/spend';
import { registerBudget } from './commands/budget';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json') as { version: string };

const program = new Command();

registerInit(program);
registerTask(program);
registerNext(program);
registerDone(program);
registerStatus(program);
registerCheck(program);
registerSpend(program);
registerBudget(program);

program
  .name('hsk')
  .description('Human steers. Agent builds. The AI agent starter kit.')
  .version(version);

program.parse();
