# human-steerkit

TypeScript CLI (binary: `hsk`, npm: `human-steerkit`) that gives developers a structured planning layer for AI agent work — bounded prompts, credit tracking, and waste detection. No LLM calls, no API calls, pure Node.js CLI.

## Commands

```bash
npm install        # install dependencies
npm run build      # tsup compile + copy src/templates/ → dist/
npm run dev        # tsup watch mode
npm test           # vitest
npm run lint       # eslint src/ tests/
```

```bash
hsk init           # interactive wizard — scaffolds PROJECT.md, TASKS.md, DECISIONS.md, PROMPTS.md
hsk next           # bounded prompt for first pending task
hsk task <n>       # bounded prompt for task n
hsk done <n>       # mark task n complete in TASKS.md
hsk status         # task progress + budget summary
hsk check          # scan for credit-wasting patterns (read-only)
hsk spend <n> <c>  # record c credits used on task n
hsk budget <total> # set total credit budget
```

## Architecture

```
src/
  index.ts          CLI entry — registers commands via commander.js
  types.ts          shared TypeScript types
  commands/         one file per hsk subcommand
  core/             pure business logic, no CLI I/O
    parser.ts       TASKS.md parser and validator
    generator.ts    bounded prompt builder
    checker.ts      waste-pattern detector
    tracker.ts      budget read/write (.hsk/budget.json)
  templates/        JSON stack templates — copied to dist/ at build, not compiled
  utils/
    fs.ts           Node.js fs/path helpers only
    format.ts       terminal output formatting
tests/              vitest — uses tests/fixtures/, never real project files
dist/               build output (gitignored)
```

Runtime state is written to `.hsk/` in the user's target project, never here.

## Constraints

- **No new runtime dependencies** — only `commander` and `@inquirer/prompts` are allowed
- **No network calls** of any kind inside the package
- `hsk check` is read-only — must never write or modify any file
- TypeScript strict mode, no implicit `any`
- Templates are plain JSON — no TypeScript in `src/templates/`
- 80% coverage on `src/core/` required before publishing
- Tests use `tests/fixtures/` — never read real project files in tests
