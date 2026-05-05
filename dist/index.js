#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// package.json
var require_package = __commonJS({
  "package.json"(exports2, module2) {
    module2.exports = {
      name: "human-steerkit",
      version: "0.1.2",
      description: "Human steers. Agent builds. The AI agent starter kit.",
      main: "dist/index.js",
      bin: {
        hsk: "dist/index.js"
      },
      scripts: {
        build: "tsup && cp -r src/templates dist/",
        dev: "tsup --watch",
        test: "vitest",
        prepublishOnly: "npm run build && npm test"
      },
      files: [
        "dist",
        "README.md"
      ],
      engines: {
        node: ">=18.0.0"
      },
      keywords: [
        "ai",
        "agent",
        "cli",
        "productivity",
        "cursor",
        "claude",
        "copilot",
        "prompt",
        "human-steerkit"
      ],
      author: "",
      license: "MIT",
      dependencies: {
        "@inquirer/prompts": "^8.4.2",
        commander: "^14.0.3"
      },
      devDependencies: {
        "@types/node": "^25.6.0",
        tsup: "^8.5.1",
        typescript: "^6.0.3",
        vitest: "^4.1.5"
      },
      repository: {
        type: "git",
        url: "git+https://github.com/ssthil/human-steerkit.git"
      },
      homepage: "https://github.com/ssthil/human-steerkit#readme",
      bugs: {
        url: "https://github.com/ssthil/human-steerkit/issues"
      }
    };
  }
});

// src/index.ts
var import_commander = require("commander");

// src/commands/init.ts
var import_path3 = __toESM(require("path"));
var import_prompts = require("@inquirer/prompts");

// src/utils/fs.ts
var import_promises = __toESM(require("fs/promises"));
var import_path = __toESM(require("path"));
async function readFile(filePath) {
  try {
    return await import_promises.default.readFile(filePath, "utf-8");
  } catch (err) {
    const code = err.code;
    if (code === "ENOENT") {
      throw new Error(`File not found: ${filePath}`);
    }
    throw err;
  }
}
async function writeFile(filePath, content) {
  await import_promises.default.mkdir(import_path.default.dirname(filePath), { recursive: true });
  await import_promises.default.writeFile(filePath, content, "utf-8");
}
async function fileExists(filePath) {
  try {
    await import_promises.default.access(filePath);
    return true;
  } catch {
    return false;
  }
}
async function readJSON(filePath) {
  const raw = await readFile(filePath);
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in file: ${filePath}`);
  }
}
async function writeJSON(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2) + "\n");
}

// src/core/tracker.ts
var import_path2 = __toESM(require("path"));
var budgetPath = (projectRoot) => import_path2.default.join(projectRoot, ".hsk", "budget.json");
async function initBudget(projectRoot, total) {
  const config = { total, spent: 0, remaining: total, tasks: {} };
  await writeJSON(budgetPath(projectRoot), config);
}
async function getBudget(projectRoot) {
  try {
    return await readJSON(budgetPath(projectRoot));
  } catch {
    throw new Error("Budget not initialised \u2014 run hsk budget <total> first");
  }
}
async function setTotal(projectRoot, total) {
  const config = await getBudget(projectRoot);
  config.total = total;
  config.remaining = total - config.spent;
  await writeJSON(budgetPath(projectRoot), config);
}
async function recordSpend(projectRoot, taskN, credits) {
  const config = await getBudget(projectRoot);
  const entry = { estimate: credits, actual: credits, status: "done" };
  config.tasks[String(taskN)] = entry;
  config.spent = Object.values(config.tasks).reduce(
    (sum, t) => sum + (t.actual ?? 0),
    0
  );
  config.remaining = config.total - config.spent;
  await writeJSON(budgetPath(projectRoot), config);
}
async function getStatus(projectRoot) {
  const config = await getBudget(projectRoot);
  const { total, spent, remaining } = config;
  const percentUsed = total > 0 ? Math.round(spent / total * 1e3) / 10 : 0;
  let budgetStatus;
  if (spent > total) {
    budgetStatus = "OVER BUDGET";
  } else if (remaining < total * 0.2) {
    budgetStatus = "AT RISK";
  } else {
    budgetStatus = "ON TRACK";
  }
  return { total, spent, remaining, percentUsed, budgetStatus };
}

// src/commands/init.ts
var STACKS = ["fullstack-py", "nextjs-api", "fastapi-only", "express-api", "blank"];
var AGENTS = ["Claude Code", "Cursor", "Copilot", "MinMax", "Windsurf", "Other"];
async function loadTemplate(stack) {
  const templatePath = import_path3.default.join(__dirname, "templates", `${stack}.json`);
  if (await fileExists(templatePath)) {
    const tpl = require(templatePath);
    return tpl.tasks ?? [];
  }
  return [];
}
function buildProjectMd(projectName, goal, agentTool, stack) {
  return `# PROJECT.md
# ${projectName}

## Goal
${goal}

## Agent Tool
${agentTool}

## Stack
${stack}

## Scope
Edit this section to define your MVP scope.

## Non-Negotiables
- All calculations must be code-computed
- Respect scope from DECISIONS.md
`;
}
function buildDecisionsMd(projectName, stack, agentTool, budget) {
  return `# DECISIONS.md
# ${projectName} \u2014 Locked Decisions

## Stack
- Framework: ${stack}
- Agent tool: ${agentTool}
- Budget: ${budget} credits

## Non-Negotiables
Edit this section to lock your decisions before running the agent.
`;
}
function buildTasksMd(tasks) {
  if (tasks.length === 0) {
    return `# TASKS.md
`;
  }
  const blocks = tasks.map((t, i) => {
    const n = i + 1;
    return [
      `## Task ${n}: ${t.name}`,
      `reads: ${t.reads.join(", ")}`,
      `builds: ${t.builds}`,
      `description: ${t.description}`,
      `credits: ${t.credits}`,
      `status: [ ]`
    ].join("\n");
  });
  return blocks.join("\n\n") + "\n";
}
function buildPromptsMd(projectName) {
  return `# PROMPTS.md
# ${projectName} \u2014 Agent Prompt Templates

## Universal Constraints Block
Add to the end of every agent prompt:

Constraints:
- Do not scan the whole repository
- Do not modify files not listed above
- Do not refactor unrelated code
- Return concise summary only
- Respect scope from PROJECT.md and DECISIONS.md
`;
}
function registerInit(program2) {
  program2.command("init").description("Interactive wizard: scaffolds PROJECT.md, TASKS.md, DECISIONS.md, PROMPTS.md and folder structure").action(async () => {
    const projectName = await (0, import_prompts.input)({ message: "Project name:" });
    const goal = await (0, import_prompts.input)({ message: "One-line project goal:" });
    const stack = await (0, import_prompts.select)({
      message: "Tech stack:",
      choices: STACKS.map((s) => ({ value: s }))
    });
    const agentTool = await (0, import_prompts.select)({
      message: "AI agent tool:",
      choices: AGENTS.map((a) => ({ value: a }))
    });
    const budget = await (0, import_prompts.number)({ message: "Total credit or token budget:", default: 180 }) ?? 180;
    const confirmed = await (0, import_prompts.confirm)({ message: "Generate project files?", default: true });
    if (!confirmed) {
      console.log("Aborted.");
      return;
    }
    const cwd = process.cwd();
    const tasks = await loadTemplate(stack);
    await Promise.all([
      writeFile(import_path3.default.join(cwd, "PROJECT.md"), buildProjectMd(projectName, goal, agentTool, stack)),
      writeFile(import_path3.default.join(cwd, "DECISIONS.md"), buildDecisionsMd(projectName, stack, agentTool, budget)),
      writeFile(import_path3.default.join(cwd, "TASKS.md"), buildTasksMd(tasks)),
      writeFile(import_path3.default.join(cwd, "PROMPTS.md"), buildPromptsMd(projectName)),
      initBudget(cwd, budget)
    ]);
    console.log("\nCreated:");
    console.log("  PROJECT.md");
    console.log("  DECISIONS.md");
    console.log("  TASKS.md");
    console.log("  PROMPTS.md");
    console.log("  .hsk/budget.json");
    console.log("\nNext: Run hsk next to get your first agent prompt");
  });
}

// src/commands/task.ts
var import_path4 = __toESM(require("path"));

// src/core/parser.ts
var TASK_HEADING = /^## Task (\d+): (.+)$/;
var FIELD = (name) => new RegExp(`^${name}:\\s*(.+)$`);
function parseBlock(lines) {
  const heading = lines[0].match(TASK_HEADING);
  const id = parseInt(heading[1], 10);
  const name = heading[2].trim();
  let reads;
  let builds = "";
  let description = "";
  let credits = 0;
  let status = false;
  for (const line of lines.slice(1)) {
    const readsMatch = line.match(FIELD("reads"));
    if (readsMatch) {
      reads = readsMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
      continue;
    }
    const buildsMatch = line.match(FIELD("builds"));
    if (buildsMatch) {
      builds = buildsMatch[1].trim();
      continue;
    }
    const descMatch = line.match(FIELD("description"));
    if (descMatch) {
      description = descMatch[1].trim();
      continue;
    }
    const creditsMatch = line.match(FIELD("credits"));
    if (creditsMatch) {
      credits = parseInt(creditsMatch[1], 10) || 0;
      continue;
    }
    const statusMatch = line.match(FIELD("status"));
    if (statusMatch) {
      status = statusMatch[1].trim() === "[x]";
      continue;
    }
  }
  if (reads === void 0) {
    throw new Error(`Task ${id} ("${name}") is missing the required reads field`);
  }
  return { id, name, reads, builds, description, credits, status };
}
async function parseTasks(filePath) {
  const content = await readFile(filePath);
  const lines = content.split("\n");
  const blocks = [];
  let current = null;
  let inPreAgent = false;
  for (const line of lines) {
    if (line.startsWith("## Pre-Agent")) {
      inPreAgent = true;
      current = null;
      continue;
    }
    if (line.startsWith("## Task ") && TASK_HEADING.test(line)) {
      inPreAgent = false;
      if (current) blocks.push(current);
      current = [line];
      continue;
    }
    if (line.startsWith("## ") && !TASK_HEADING.test(line)) {
      inPreAgent = false;
      if (current) {
        blocks.push(current);
        current = null;
      }
      continue;
    }
    if (!inPreAgent && current) {
      current.push(line);
    }
  }
  if (current) blocks.push(current);
  return blocks.map(parseBlock).sort((a, b) => a.id - b.id);
}
function getTask(tasks, n) {
  return tasks.find((t) => t.id === n);
}
function getNextPendingTask(tasks) {
  return tasks.find((t) => !t.status) ?? null;
}

// src/core/generator.ts
var DEFAULT_CONSTRAINTS = [
  "Do not scan the whole repository",
  "Do not modify files not listed above",
  "Do not refactor unrelated code",
  "Return concise summary only",
  "Respect scope from PROJECT.md and DECISIONS.md"
];
function generatePrompt(task, customConstraints) {
  if (!task.reads || task.reads.length === 0) {
    throw new Error(`Task ${task.id} ("${task.name}") has no reads field \u2014 cannot generate prompt`);
  }
  const constraints = customConstraints ? [...DEFAULT_CONSTRAINTS, ...customConstraints] : DEFAULT_CONSTRAINTS;
  const constraintLines = constraints.map((c) => `- ${c}`).join("\n");
  return [
    `Read only these files: ${task.reads.join(", ")}`,
    "",
    `Task: ${task.description}`,
    "",
    `Output: ${task.builds}`,
    "",
    "Constraints:",
    constraintLines
  ].join("\n");
}
function formatTaskSummary(task) {
  const state = task.status ? "done" : "pending";
  return `Task ${task.id}: ${task.name} [${state}]`;
}

// src/commands/task.ts
var SEP = "\u2500".repeat(60);
function registerTask(program2) {
  program2.command("task <n>").description("Generate a bounded agent prompt for task number n").action(async (nStr) => {
    const n = parseInt(nStr, 10);
    if (isNaN(n)) {
      console.error(`Error: "${nStr}" is not a valid task number`);
      process.exit(1);
    }
    try {
      const tasks = await parseTasks(import_path4.default.join(process.cwd(), "TASKS.md"));
      const task = getTask(tasks, n);
      if (!task) {
        console.error(`Task ${n} not found in TASKS.md`);
        process.exit(1);
      }
      const prompt = generatePrompt(task);
      console.log(`
${formatTaskSummary(task)}
`);
      console.log(SEP);
      console.log(prompt);
      console.log(SEP);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });
}

// src/commands/next.ts
var import_path5 = __toESM(require("path"));
var SEP2 = "\u2500".repeat(60);
function registerNext(program2) {
  program2.command("next").description("Find the first unchecked task and output its prompt").action(async () => {
    try {
      const tasks = await parseTasks(import_path5.default.join(process.cwd(), "TASKS.md"));
      const task = getNextPendingTask(tasks);
      if (!task) {
        console.log("All tasks complete. Nothing left to do.");
        return;
      }
      const prompt = generatePrompt(task);
      console.log(`
${formatTaskSummary(task)}
`);
      console.log(SEP2);
      console.log(prompt);
      console.log(SEP2);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });
}

// src/commands/done.ts
var import_path6 = __toESM(require("path"));
function registerDone(program2) {
  program2.command("done <n>").description("Mark task n complete in TASKS.md").action(async (nStr) => {
    const n = parseInt(nStr, 10);
    if (isNaN(n)) {
      console.error(`Error: "${nStr}" is not a valid task number`);
      process.exit(1);
    }
    const tasksPath = import_path6.default.join(process.cwd(), "TASKS.md");
    try {
      const content = await readFile(tasksPath);
      const lines = content.split("\n");
      const headingIdx = lines.findIndex((l) => new RegExp(`^## Task ${n}:`).test(l));
      if (headingIdx === -1) {
        console.error(`Task ${n} not found in TASKS.md`);
        process.exit(1);
      }
      let patched = false;
      for (let i = headingIdx + 1; i < lines.length; i++) {
        if (lines[i].startsWith("## ")) break;
        if (lines[i].trim() === "status: [ ]") {
          lines[i] = lines[i].replace("status: [ ]", "status: [x]");
          patched = true;
          break;
        }
      }
      if (!patched) {
        console.error(`Task ${n} is already done or has no status field`);
        process.exit(1);
      }
      await writeFile(tasksPath, lines.join("\n"));
      console.log(`Task ${n} marked as done`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });
}

// src/commands/status.ts
var import_path7 = __toESM(require("path"));
var SEP3 = "\u2500".repeat(40);
async function getProjectName(cwd) {
  const projectPath = import_path7.default.join(cwd, "PROJECT.md");
  if (!await fileExists(projectPath)) return "Project";
  try {
    const lines = (await readFile(projectPath)).split("\n");
    const heading = lines.find((l, i) => i > 0 && l.startsWith("# "));
    return heading ? heading.replace(/^# /, "").trim() : "Project";
  } catch {
    return "Project";
  }
}
function registerStatus(program2) {
  program2.command("status").description("Show task progress and budget summary").action(async () => {
    const cwd = process.cwd();
    let tasks = [];
    try {
      tasks = await parseTasks(import_path7.default.join(cwd, "TASKS.md"));
    } catch {
      console.error("Warning: could not read TASKS.md");
    }
    const done = tasks.filter((t) => t.status).length;
    const total = tasks.length;
    const next = getNextPendingTask(tasks);
    const projectName = await getProjectName(cwd);
    let budget = null;
    try {
      budget = await getStatus(cwd);
    } catch {
    }
    console.log(`
${projectName} \u2014 Project Status`);
    console.log(SEP3);
    console.log(`Tasks complete:    ${done} / ${total}`);
    if (budget) {
      console.log(`Credits spent:     ${budget.spent} / ${budget.total}`);
      console.log(`Credits remaining: ${budget.remaining}`);
      console.log(`Budget status:     ${budget.budgetStatus}`);
    } else {
      console.log("Credits:           not initialised \u2014 run hsk budget <total>");
    }
    console.log(SEP3);
    if (next) {
      console.log(`Next task: Task ${next.id} \u2014 ${next.name}`);
    } else if (total > 0) {
      console.log("All tasks complete.");
    } else {
      console.log("No tasks found. Run hsk init to get started.");
    }
    console.log("");
  });
}

// src/core/checker.ts
var import_path8 = __toESM(require("path"));
var BROAD_READS = /^src[/\\]?$|^[a-zA-Z0-9_-]+[/\\]$/;
async function checkProject(projectRoot) {
  const warnings = [];
  const p = (file) => import_path8.default.join(projectRoot, file);
  const [hasProject, hasDecisions, hasTasks, hasPrompts] = await Promise.all([
    fileExists(p("PROJECT.md")),
    fileExists(p("DECISIONS.md")),
    fileExists(p("TASKS.md")),
    fileExists(p("PROMPTS.md"))
  ]);
  if (!hasProject) {
    warnings.push({
      rule: "PROJECT_MISSING",
      message: "PROJECT.md not found",
      fix: "Run hsk init to generate PROJECT.md"
    });
  }
  if (!hasDecisions) {
    warnings.push({
      rule: "DECISIONS_MISSING",
      message: "DECISIONS.md not found",
      fix: "Run hsk init to generate DECISIONS.md"
    });
  }
  if (!hasTasks) {
    warnings.push({
      rule: "TASKS_MISSING",
      message: "TASKS.md not found",
      fix: "Run hsk init to generate TASKS.md"
    });
  }
  if (hasTasks) {
    try {
      const tasks = await parseTasks(p("TASKS.md"));
      for (const task of tasks) {
        if (!task.reads || task.reads.length === 0) {
          warnings.push({
            rule: "TASK_MISSING_READS",
            message: `Task ${task.id} has no reads field \u2014 agent will scan whatever it finds`,
            fix: "Add a reads field listing only the files the agent needs"
          });
          continue;
        }
        const broad = task.reads.some((r) => BROAD_READS.test(r) || r === "src/");
        if (broad) {
          warnings.push({
            rule: "TASK_READS_TOO_BROAD",
            message: `Task ${task.id} reads field is too broad \u2014 agent will scan entire codebase`,
            fix: "Narrow reads to specific files not folders"
          });
        }
        if (task.reads.length > 8) {
          warnings.push({
            rule: "TASK_READS_TOO_MANY",
            message: `Task ${task.id} has ${task.reads.length} files in reads \u2014 context too large`,
            fix: "Split this task into two smaller tasks"
          });
        }
        const wordCount = task.description.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount < 10) {
          warnings.push({
            rule: "TASK_DESCRIPTION_TOO_SHORT",
            message: `Task ${task.id} description is too short \u2014 agent may ask clarifying questions`,
            fix: "Expand the task description to be more specific"
          });
        }
      }
    } catch {
    }
  }
  if (hasPrompts) {
    try {
      const content = await readFile(p("PROMPTS.md"));
      if (!content.includes("Constraints")) {
        warnings.push({
          rule: "PROMPTS_MISSING_CONSTRAINTS",
          message: "PROMPTS.md is missing a constraints block",
          fix: "Add a constraints block to PROMPTS.md"
        });
      }
    } catch {
    }
  }
  return warnings;
}

// src/commands/check.ts
var R = "\x1B[31m";
var Y = "\x1B[33m";
var G = "\x1B[32m";
var X = "\x1B[0m";
function registerCheck(program2) {
  program2.command("check").description("Scan project for credit-wasting patterns and output warnings with fixes").action(async () => {
    try {
      const warnings = await checkProject(process.cwd());
      if (warnings.length === 0) {
        console.log(`${G}\u2713 No issues found. Your project is agent-ready.${X}`);
        return;
      }
      console.log(`
Found ${warnings.length} issue(s):
`);
      warnings.forEach((w, i) => {
        console.log(`${R}[${i + 1}] ${w.rule}${X}`);
        console.log(`    ${w.message}`);
        console.log(`    ${Y}Fix: ${w.fix}${X}`);
        console.log("");
      });
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });
}

// src/commands/spend.ts
function registerSpend(program2) {
  program2.command("spend <n> <credits>").description("Record actual credits used for task n in .hsk/budget.json").action(async (nStr, creditsStr) => {
    const n = parseInt(nStr, 10);
    const credits = parseFloat(creditsStr);
    if (isNaN(n)) {
      console.error(`Error: "${nStr}" is not a valid task number`);
      process.exit(1);
    }
    if (isNaN(credits)) {
      console.error(`Error: "${creditsStr}" is not a valid credit amount`);
      process.exit(1);
    }
    const cwd = process.cwd();
    try {
      await recordSpend(cwd, n, credits);
      const budget = await getBudget(cwd);
      console.log(`Recorded ${credits} credits for Task ${n}`);
      console.log(`Total spent: ${budget.spent} / ${budget.total} (${budget.remaining} remaining)`);
    } catch (err) {
      const msg = err.message;
      if (msg.includes("not initialised")) {
        console.error("Budget not initialised. Run hsk budget <total> first.");
      } else {
        console.error(`Error: ${msg}`);
      }
      process.exit(1);
    }
  });
}

// src/commands/budget.ts
var import_path9 = __toESM(require("path"));
function registerBudget(program2) {
  program2.command("budget <total>").description("Set total credit budget in .hsk/budget.json").action(async (totalStr) => {
    const total = parseFloat(totalStr);
    if (isNaN(total)) {
      console.error(`Error: "${totalStr}" is not a valid budget amount`);
      process.exit(1);
    }
    const cwd = process.cwd();
    try {
      const budgetFile = import_path9.default.join(cwd, ".hsk", "budget.json");
      if (await fileExists(budgetFile)) {
        await setTotal(cwd, total);
      } else {
        await initBudget(cwd, total);
      }
      console.log(`Budget set to ${total} credits`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });
}

// src/index.ts
var { version } = require_package();
var program = new import_commander.Command();
registerInit(program);
registerTask(program);
registerNext(program);
registerDone(program);
registerStatus(program);
registerCheck(program);
registerSpend(program);
registerBudget(program);
program.name("hsk").description("Human steers. Agent builds. The AI agent starter kit.").version(version);
program.parse();
