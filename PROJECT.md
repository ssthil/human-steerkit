# PROJECT.md
# human-steerkit — MVP Specification

## Project Name
human-steerkit

## npm Package Name
human-steerkit

## CLI Binary
hsk

## Tagline
Human steers. Agent builds.

## Goal
Build and publish an npm CLI package that helps developers work with any AI agent
tool in the most credit-efficient way possible. It enforces the core principle:
human plans, agent executes.

The package must:
- Scaffold a complete project planning structure in under 30 seconds
- Generate bounded, file-scoped agent prompts from a structured task list
- Track credit/token budget per task and overall
- Detect common credit-wasting patterns in the project setup
- Work with any AI agent tool (Claude Code, Cursor, Copilot, MinMax, Windsurf, etc.)
- Work with any project type and any tech stack

---

## Core Problem
Every wasted AI agent credit comes from the same root causes:
- Agent re-discovers scope it was never told
- Agent scans files it did not need to read
- Architecture is debated mid-build instead of locked upfront
- Vague prompts cause long back-and-forth output
- No task sequence — agent decides what to do next

human-steerkit eliminates all of these before the agent starts.

---

## Primary User
A developer using any AI agent tool (Claude Code, Cursor, Copilot, MinMax, Windsurf,
or similar) who wants to build a project efficiently without burning through their
credit or token budget on wasted context and repeated orientation.

---

## Core Philosophy
The developer does the thinking. The agent does the typing.
human-steerkit structures everything between those two steps.

---

## Package Scope

### In Scope (V1)
- CLI tool installable via npm globally or via npx
- Interactive init wizard that scaffolds PROJECT.md, TASKS.md, DECISIONS.md, PROMPTS.md
- Folder structure creation based on stack selection
- Task prompt generator: reads TASKS.md, outputs bounded agent prompt for any task
- Next task command: finds first unchecked task, outputs its prompt
- Done command: marks task complete in TASKS.md
- Status command: shows task progress and budget summary
- Budget tracker: records estimated and actual credits per task
- Credit waste detector: scans project for known waste patterns
- Stack templates: pre-built task sequences for common stacks
- Agent-agnostic: works with any agent tool
- Zero runtime dependencies beyond Node.js built-ins + one CLI framework
- Full TypeScript source with tests
- Published to npm as open source

### Out of Scope (V1)
- VS Code extension
- Agent API integrations or automatic credit tracking
- Web dashboard or GUI
- AI-generated task suggestions
- Multi-project workspace management
- Paid features or SaaS tier
- Mobile or desktop app
- Plugin system

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript | Type safety, good DX, standard for npm CLIs |
| CLI framework | commander.js | Lightweight, zero dependencies, widely used |
| Interactive prompts | @inquirer/prompts | Modern replacement for inquirer, minimal |
| File system | Node.js fs/path built-ins | Zero extra dependencies |
| Testing | vitest | Fast, TypeScript-native |
| Build | tsup | Simple TypeScript bundler for CLIs |
| Package manager | npm | Standard, no extra tooling |
| CI | GitHub Actions | Free, standard |
| Publish | npm public registry | Open source |

---

## Folder Structure

```
human-steerkit/
├── PROJECT.md
├── TASKS.md
├── DECISIONS.md
├── README.md
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src/
│   ├── index.ts                  # CLI entry point
│   ├── commands/
│   │   ├── init.ts               # hsk init
│   │   ├── task.ts               # hsk task <n>
│   │   ├── next.ts               # hsk next
│   │   ├── done.ts               # hsk done <n>
│   │   ├── status.ts             # hsk status
│   │   ├── check.ts              # hsk check
│   │   ├── spend.ts              # hsk spend <n> <credits>
│   │   └── budget.ts             # hsk budget <total>
│   ├── core/
│   │   ├── parser.ts             # TASKS.md parser and validator
│   │   ├── generator.ts          # Prompt generator
│   │   ├── checker.ts            # Credit waste detector
│   │   ├── tracker.ts            # Budget tracker
│   │   └── scaffolder.ts         # File and folder generator
│   ├── templates/
│   │   ├── fullstack-py.json     # Next.js + FastAPI template
│   │   ├── nextjs-api.json       # Next.js API routes template
│   │   ├── fastapi-only.json     # FastAPI only template
│   │   ├── express-api.json      # Node.js + Express template
│   │   └── blank.json            # Empty template
│   ├── scaffolds/
│   │   ├── PROJECT.md.hbs        # PROJECT.md handlebars template
│   │   ├── TASKS.md.hbs          # TASKS.md handlebars template
│   │   ├── DECISIONS.md.hbs      # DECISIONS.md handlebars template
│   │   └── PROMPTS.md.hbs        # PROMPTS.md handlebars template
│   └── utils/
│       ├── fs.ts                 # File system helpers
│       └── format.ts             # Terminal output formatting
├── bin/
│   └── hsk.js                    # CLI binary entry point
└── tests/
    ├── parser.test.ts
    ├── generator.test.ts
    ├── checker.test.ts
    └── tracker.test.ts
```

---

## CLI Commands

| Command | Description | Output |
|---|---|---|
| hsk init | Interactive wizard. Asks project name, goal, stack, agent tool, budget. | PROJECT.md, TASKS.md, DECISIONS.md, PROMPTS.md, folder structure |
| hsk task <n> | Generates bounded agent prompt for task number n. | Ready-to-paste prompt string |
| hsk next | Finds first unchecked task, outputs its prompt. | Next task prompt |
| hsk done <n> | Marks task n complete in TASKS.md. | Updated TASKS.md |
| hsk status | Shows task progress and budget summary. | Terminal summary |
| hsk check | Scans project for credit-wasting patterns. | Warning list with fixes |
| hsk spend <n> <credits> | Records actual credits used for task n. | Updated budget.json |
| hsk budget <total> | Sets total credit budget. | Updated budget.json |

---

## TASKS.md Task Schema
Each task must follow this schema for the prompt generator to work:

```
## Task <n>: <name>
reads: <comma-separated file list>
builds: <output file or description>
description: <what the agent must do>
credits: <estimate>
status: [ ]
```

Rules:
- reads field is required. Prompt generator uses it to build the file list.
- reads must list specific files, never src/ or root directory.
- status [ ] = pending, status [x] = done.
- credits is an estimate used by the budget tracker.

---

## Generated Prompt Format
Every prompt generated by hsk task <n> follows this exact format:

```
Read only these files: [auto-generated from reads field]

Task: [description from TASKS.md]

Output: [builds field from TASKS.md]

Constraints:
- Do not scan the whole repository
- Do not modify files not listed above
- Do not refactor unrelated code
- Return concise summary only
- Respect scope from PROJECT.md and DECISIONS.md
```

The constraints block is appended automatically to every prompt.
Developers can customise the constraints block in .hsk/config.json.

---

## Credit Waste Detector Rules
hsk check scans for these patterns and flags them:

| Pattern | Why it wastes credits | Fix |
|---|---|---|
| PROJECT.md missing | Agent re-discovers scope | Run hsk init |
| DECISIONS.md missing | Agent debates architecture mid-task | Run hsk init |
| Task has no reads field | Agent scans whatever it finds | Add reads field |
| reads includes src/ or root | Agent scans entire codebase | Narrow to specific files |
| reads has more than 8 files | Context too large | Split task into two |
| Task description under 10 words | Agent asks clarifying questions | Expand description |
| No constraints block in PROMPTS.md | Agent over-generates output | Add constraints block |
| Task depends on file not yet created | Agent will fail or hallucinate | Complete dependency first |

---

## Stack Templates

| Template | Stack | Pre-built tasks |
|---|---|---|
| fullstack-py | Next.js + FastAPI + SQLite | 20 tasks |
| nextjs-api | Next.js + API routes | 14 tasks |
| fastapi-only | FastAPI + SQLite | 12 tasks |
| express-api | Node.js + Express + SQLite | 12 tasks |
| blank | Any stack | Empty TASKS.md with schema |

---

## Budget Tracker
Config stored in .hsk/budget.json at project root:

```json
{
  "total_budget": 180,
  "spent": 0,
  "remaining": 180,
  "tasks": {}
}
```

hsk status output:
```
human-steerkit — Project Status
Tasks complete:  5 / 20
Credits spent:   42 / 180
Remaining:       138
Next task:       Task 6 — Scoring engine
Budget status:   ON TRACK
```

---

## Init Wizard Questions
hsk init asks these 6 questions:

1. Project name
2. One-line project goal
3. Tech stack (select from templates or custom)
4. AI agent tool (Claude Code / Cursor / Copilot / MinMax / Windsurf / Other)
5. Total credit or token budget
6. Number of tasks to pre-generate (or generate from goal)

---

## Non-Negotiables
- Zero runtime dependencies beyond commander.js and @inquirer/prompts
- No LLM calls inside the package itself
- TASKS.md stays plain Markdown — readable without the CLI
- All prompts work with any agent tool — no agent-specific syntax
- Budget tracking is manual — no API connections required
- Templates are JSON — community-contributable without writing TypeScript
- Full test coverage for parser, generator, checker, tracker
- Published as open source on npm
- CLI binary is hsk — never changes
