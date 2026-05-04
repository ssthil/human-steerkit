# TASKS.md
# human-steerkit — Build Task Sequence

## Rules for using this file with the agent

- One task per agent prompt. Never combine tasks.
- Always specify exact files to read in every prompt.
- Always append the constraints block at the end of every prompt.
- Run tests locally after every task before moving to the next.
- Do not ask the agent what to build next. Use this file.

---

## Pre-Agent Tasks (You Do These — Zero Credits)

- [ ] PA-1: Create GitHub repo named human-steerkit, run git init
- [ ] PA-2: Run: npm init -y and update package.json with name, version 0.1.0, license MIT
- [ ] PA-3: Write PROJECT.md, DECISIONS.md, TASKS.md in repo root
- [ ] PA-4: Create folder structure manually:
        mkdir -p src/commands src/core src/templates src/scaffolds src/utils bin tests
- [ ] PA-5: Install dev dependencies:
        npm install -D typescript vitest tsup @types/node
- [ ] PA-6: Install runtime dependencies:
        npm install commander @inquirer/prompts
- [ ] PA-7: Create tsconfig.json with target ES2020, module NodeNext, outDir dist
- [ ] PA-8: Create tsup.config.ts with entry src/index.ts, format cjs, dts true
- [ ] PA-9: Add npm scripts to package.json:
        build, dev, test, prepublishOnly
- [ ] PA-10: Claim npm package name:
        npm login && npm publish --access public (placeholder 0.1.0)

---

## Agent Tasks

### Phase 1 — Package Scaffold

## Task 1: CLI entry point and package structure
reads: PROJECT.md, DECISIONS.md, package.json, tsconfig.json
builds: src/index.ts, bin/hsk.js
description: Create the CLI entry point using commander.js. Register all 8 commands as stubs (init, task, next, done, status, check, spend, budget). Each stub should print "command not yet implemented". Add shebang to bin/hsk.js. Wire package.json bin field to dist/index.js.
credits: 10
status: [ ]

## Task 2: TypeScript types and interfaces
reads: PROJECT.md, DECISIONS.md, src/index.ts
builds: src/types.ts
description: Define TypeScript interfaces for Task, ProjectConfig, BudgetConfig, CheckWarning, and Template. Use types from PROJECT.md task schema and budget tracker sections. Export all types.
credits: 5
status: [ ]

## Task 3: File system utilities
reads: PROJECT.md, DECISIONS.md, src/types.ts
builds: src/utils/fs.ts
description: Implement these utility functions: readFile, writeFile, fileExists, ensureDir, readJSON, writeJSON. Use Node.js built-in fs/promises and path only. Add error handling for missing files. Export all functions.
credits: 5
status: [ ]

---

### Phase 2 — Core Modules

## Task 4: TASKS.md parser
reads: PROJECT.md, DECISIONS.md, src/types.ts, src/utils/fs.ts
builds: src/core/parser.ts
description: Implement parseTasks(filePath) that reads TASKS.md and returns Task[]. Parse task number, name, reads (as string array), builds, description, credits (as number), status (boolean). Handle missing optional fields gracefully. Error clearly if reads field is missing on any task. Also implement getTask(tasks, n) and getNextPendingTask(tasks).
credits: 15
status: [ ]

## Task 5: Parser tests
reads: src/core/parser.ts, src/types.ts
builds: tests/parser.test.ts, tests/fixtures/valid-tasks.md, tests/fixtures/missing-reads.md
description: Write vitest tests for parseTasks covering: valid task file parses correctly, all fields extracted, status false for [ ] and true for [x], missing reads field throws error, missing optional fields return defaults, getNextPendingTask returns first unchecked task, getNextPendingTask returns null when all done.
credits: 10
status: [ ]

## Task 6: Prompt generator
reads: PROJECT.md, DECISIONS.md, src/types.ts, src/core/parser.ts
builds: src/core/generator.ts
description: Implement generatePrompt(task, config) that returns a formatted prompt string. Output must follow the exact format in PROJECT.md Generated Prompt Format section. reads field becomes the file list. description becomes the Task line. builds becomes the Output line. Always append the constraints block. Accept optional custom constraints from config. Implement copyToClipboard stub (print to stdout only in V1).
credits: 10
status: [ ]

## Task 7: Generator tests
reads: src/core/generator.ts, src/types.ts
builds: tests/generator.test.ts
description: Write vitest tests covering: prompt contains reads files, prompt contains task description, prompt contains builds output, constraints block is always appended, prompt format matches expected structure exactly, missing reads throws error.
credits: 8
status: [ ]

## Task 8: Credit waste checker
reads: PROJECT.md, DECISIONS.md, src/types.ts, src/utils/fs.ts
builds: src/core/checker.ts
description: Implement checkProject(projectRoot) that returns CheckWarning[]. Each warning has a rule name, message, and fix suggestion. Implement all 8 check rules from PROJECT.md Credit Waste Detector Rules section. Scan only PROJECT.md, DECISIONS.md, TASKS.md, PROMPTS.md. Do not scan source code. Return empty array if all rules pass.
credits: 12
status: [ ]

## Task 9: Checker tests
reads: src/core/checker.ts, src/types.ts
builds: tests/checker.test.ts, tests/fixtures/
description: Write vitest tests covering all 8 check rules. Each rule must have a test that triggers the warning and a test that passes cleanly. Use fixture files in tests/fixtures/ not real project files.
credits: 10
status: [ ]

## Task 10: Budget tracker
reads: PROJECT.md, DECISIONS.md, src/types.ts, src/utils/fs.ts
builds: src/core/tracker.ts
description: Implement these functions: initBudget(total), getBudget(), setTotal(total), recordSpend(taskN, credits), getStatus(). Budget stored in .hsk/budget.json. getStatus() returns object with total, spent, remaining, taskCount, completedCount, nextTask, budgetStatus (ON TRACK / AT RISK / OVER BUDGET). AT RISK when remaining < 20% of total.
credits: 10
status: [ ]

---

### Phase 3 — Commands

## Task 11: hsk init command
reads: PROJECT.md, DECISIONS.md, src/types.ts, src/utils/fs.ts, src/core/tracker.ts, src/templates/
builds: src/commands/init.ts, src/scaffolds/PROJECT.md.hbs, src/scaffolds/TASKS.md.hbs, src/scaffolds/DECISIONS.md.hbs, src/scaffolds/PROMPTS.md.hbs
description: Implement init command using @inquirer/prompts. Ask 6 questions from PROJECT.md Init Wizard Questions section. Load selected template from src/templates/. Generate 4 scaffold files using simple string interpolation (no external template engine). Create folder structure from template. Initialise .hsk/budget.json. Print success summary showing files created.
credits: 20
status: [ ]

## Task 12: hsk task and hsk next commands
reads: PROJECT.md, DECISIONS.md, src/types.ts, src/core/parser.ts, src/core/generator.ts
builds: src/commands/task.ts, src/commands/next.ts
description: Implement hsk task <n> — reads TASKS.md, finds task n, generates and prints prompt. Error clearly if task not found or reads missing. Implement hsk next — reads TASKS.md, finds first pending task, generates and prints prompt. Print friendly message if all tasks are done.
credits: 8
status: [ ]

## Task 13: hsk done and hsk status commands
reads: PROJECT.md, DECISIONS.md, src/types.ts, src/core/parser.ts, src/core/tracker.ts
builds: src/commands/done.ts, src/commands/status.ts
description: Implement hsk done <n> — reads TASKS.md, marks task n status as [x] using in-place string replacement, prints confirmation. Implement hsk status — reads TASKS.md and .hsk/budget.json, prints formatted status table showing task progress, credits spent vs total, remaining, next task, budget status.
credits: 8
status: [ ]

## Task 14: hsk check command
reads: PROJECT.md, DECISIONS.md, src/types.ts, src/core/checker.ts
builds: src/commands/check.ts
description: Implement hsk check — runs checkProject on current directory, prints warnings with rule name, message, and fix suggestion. If no warnings found print success message. Format output clearly with colours using chalk or ANSI codes only (no extra dependency).
credits: 6
status: [ ]

## Task 15: hsk spend and hsk budget commands
reads: PROJECT.md, DECISIONS.md, src/types.ts, src/core/tracker.ts
builds: src/commands/spend.ts, src/commands/budget.ts
description: Implement hsk spend <n> <credits> — records actual credits for task n in budget.json, prints updated budget summary. Implement hsk budget <total> — sets total budget in budget.json, prints confirmation. Both commands must create .hsk/ folder and budget.json if not present.
credits: 6
status: [ ]

---

### Phase 4 — Templates

## Task 16: fullstack-py template
reads: PROJECT.md, DECISIONS.md, src/types.ts
builds: src/templates/fullstack-py.json
description: Create the fullstack-py template JSON with 20 pre-built tasks for Next.js + FastAPI + SQLite stack. Each task must have name, reads, builds, description, credits fields. Follow the task sequence used in the FundLens project: scaffold, schemas, data loader, metrics, scoring, alternatives, parsing, endpoint, frontend scaffold, form, result card, charts, states, integration, bug sweep. Reads fields must be specific files not folders.
credits: 15
status: [ ]

## Task 17: Remaining templates
reads: PROJECT.md, DECISIONS.md, src/templates/fullstack-py.json
builds: src/templates/nextjs-api.json, src/templates/fastapi-only.json, src/templates/express-api.json, src/templates/blank.json
description: Create 4 remaining template JSON files. nextjs-api: 14 tasks for Next.js with API routes. fastapi-only: 12 tasks for FastAPI + SQLite. express-api: 12 tasks for Node.js + Express + SQLite. blank: empty tasks array with correct schema comment. All reads fields must list specific files.
credits: 12
status: [ ]

---

### Phase 5 — Polish and Publish

## Task 18: Wire all commands into CLI entry point
reads: src/index.ts, src/commands/init.ts, src/commands/task.ts, src/commands/next.ts, src/commands/done.ts, src/commands/status.ts, src/commands/check.ts, src/commands/spend.ts, src/commands/budget.ts
builds: src/index.ts (updated)
description: Replace all command stubs in src/index.ts with real imports and wiring. Verify all 8 commands are registered and callable. Add --version flag reading from package.json. Add --help descriptions for all commands and their arguments.
credits: 8
status: [ ]

## Task 19: Build verification and README
reads: PROJECT.md, DECISIONS.md, src/index.ts, package.json
builds: README.md
description: Verify npm run build produces dist/ with working CLI. Test hsk --help, hsk init, hsk task 1, hsk status all run without errors. Write README.md covering: installation, quick start (6 commands), how it works, templates list, credit waste checker rules, contributing. Keep README concise and practical. No fluff.
credits: 8
status: [ ]

## Task 20: Final test coverage and npm publish prep
reads: PROJECT.md, DECISIONS.md, tests/, src/core/
builds: Updated tests, package.json
description: Run full test suite and ensure 80%+ coverage on src/core/ modules. Fix any failing tests. Verify package.json has all required fields: name, version, description, bin, main, files, keywords, author, license, repository. Verify .npmignore excludes src/, tests/, .hsk/. Run npm pack and verify tarball contents. Output: test results, coverage report, pack verification.
credits: 10
status: [ ]

---

## Task Count Summary
- Pre-agent tasks: 10 (you do these)
- Agent tasks: 20
- Total: 30

## Credit Budget

| Phase | Tasks | Estimate |
|---|---|---|
| Scaffold | 1-3 | 20 credits |
| Core modules | 4-10 | 75 credits |
| Commands | 11-15 | 48 credits |
| Templates | 16-17 | 27 credits |
| Polish + publish | 18-20 | 26 credits |
| Reserve | — | 20 credits |
| Total | | ~216 credits |

Note: Adjust budget in hsk budget command once you decide your agent tool budget.
