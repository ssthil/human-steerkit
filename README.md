# human-steerkit

Human steers. Agent builds.

Every wasted AI agent credit comes from the same root causes: the agent re-discovers scope it was never told, scans files it did not need to read, debates architecture mid-task, or receives a vague prompt that triggers long back-and-forth output. human-steerkit eliminates all of these before the agent starts — by giving you a structured planning layer that turns your project into a sequence of bounded, file-scoped prompts the agent can execute without guessing.

## Installation

```bash
npm install -g human-steerkit
```

Or use without installing:

```bash
npx human-steerkit init
```

## Quick start

```bash
hsk init                      # answer 6 questions, scaffold your project files
hsk next                      # get a bounded prompt for the next pending task
# paste prompt into your agent, run the task
hsk done 1                    # mark task 1 complete
hsk spend 1 12                # record 12 credits used on task 1
hsk status                    # see progress and budget summary
```

## How it works

1. **`hsk init`** asks 6 questions (project name, goal, stack, agent tool, budget, task count) and generates `PROJECT.md`, `TASKS.md`, `DECISIONS.md`, and `PROMPTS.md` in your project root — pre-filled with your answers and a task list from your chosen template.

2. **`hsk next`** reads your `TASKS.md`, finds the first unchecked task, and outputs a ready-to-paste prompt in a fixed format: the exact files to read, the task description, the expected output, and a constraints block that prevents the agent from over-generating.

3. **You run one task at a time.** Mark it done with `hsk done <n>`, record the credit cost with `hsk spend <n> <credits>`, and repeat. `hsk check` scans for patterns that waste credits before you hand off to the agent.

## Commands

| Command | Description |
|---|---|
| `hsk init` | Interactive wizard — scaffolds project files and folder structure |
| `hsk task <n>` | Generate bounded agent prompt for task number n |
| `hsk next` | Find first pending task and output its prompt |
| `hsk done <n>` | Mark task n complete in TASKS.md |
| `hsk status` | Show task progress and budget summary |
| `hsk check` | Scan project for credit-wasting patterns |
| `hsk spend <n> <credits>` | Record actual credits used for task n |
| `hsk budget <total>` | Set total credit budget |

## Templates

| Template | Stack | Tasks |
|---|---|---|
| `fullstack-py` | Next.js + FastAPI + SQLite | 20 |
| `nextjs-api` | Next.js + API Routes + TypeScript | 14 |
| `fastapi-only` | FastAPI + SQLite | 12 |
| `express-api` | Node.js + Express + SQLite | 12 |
| `blank` | Any stack | 0 |

## Credit waste checker

`hsk check` scans `PROJECT.md`, `DECISIONS.md`, `TASKS.md`, and `PROMPTS.md` for these patterns:

| Rule | Problem | Fix |
|---|---|---|
| `PROJECT_MISSING` | Agent re-discovers scope every session | Run `hsk init` |
| `DECISIONS_MISSING` | Agent debates architecture mid-task | Run `hsk init` |
| `TASKS_MISSING` | No task sequence — agent decides what to do | Run `hsk init` |
| `TASK_MISSING_READS` | Agent scans whatever files it finds | Add `reads` field to task |
| `TASK_READS_TOO_BROAD` | `reads: src/` causes full codebase scan | Narrow to specific files |
| `TASK_READS_TOO_MANY` | More than 8 files — context too large | Split task into two |
| `TASK_DESCRIPTION_TOO_SHORT` | Agent asks clarifying questions | Expand description |
| `PROMPTS_MISSING_CONSTRAINTS` | Agent over-generates output | Add constraints block |

## Philosophy

- **Human plans, agent executes.** Architecture decisions, task sequence, and file scope are locked before the agent touches any code. The agent never decides what to do next.
- **Bounded context.** Every prompt lists only the files the agent needs to read. No `src/`, no root directories, no open-ended exploration.
- **Manual tracking by design.** Credits and progress are tracked manually. No API connections, no automatic monitoring — the developer stays in control of every decision.

## Contributing

Contributions are welcome. The fastest way to contribute is to add a new stack template — templates are plain JSON files in `src/templates/` that follow a simple schema. No TypeScript required. Copy an existing template, fill in the task list for your stack, and open a pull request.

## License

MIT
