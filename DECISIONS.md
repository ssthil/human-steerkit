# DECISIONS.md
# human-steerkit — Locked Decisions

All decisions below are non-negotiable during v1 build.
Do not re-debate these with the agent. Update this file first if a decision must change.

---

## Product

- This is a developer CLI tool, not a SaaS product or web app.
- Output is a scaffolded project structure plus generated agent prompts.
- It does not connect to any AI agent API.
- It does not track credits automatically — tracking is manual.
- It does not generate code for the developer's project — it generates prompts.
- V1 is free and open source. No paid tier in V1.

---

## Package

- Package name: human-steerkit
- CLI binary name: hsk
- Published to: npm public registry
- License: MIT
- Repository: GitHub public

---

## Technical

- Language: TypeScript
- CLI framework: commander.js only. No other CLI framework.
- Interactive prompts: @inquirer/prompts only.
- File system: Node.js built-in fs and path modules only. No extra fs libraries.
- Testing: vitest
- Build: tsup
- No runtime dependencies beyond commander.js and @inquirer/prompts
- No LLM calls inside the package at any point
- No API calls of any kind inside the package
- No database — all state stored in local JSON files in .hsk/ folder
- Budget stored in .hsk/budget.json
- Config stored in .hsk/config.json
- Both .hsk/ files are gitignored by default

---

## Templates

- Templates are JSON files in src/templates/
- Each template contains a pre-built task array with reads, builds, description, credits fields
- Templates are loaded at runtime — not compiled into the binary
- Community can contribute templates by adding JSON files — no TypeScript required
- V1 ships with 5 templates: fullstack-py, nextjs-api, fastapi-only, express-api, blank

---

## Prompt Generation

- Every generated prompt follows the exact format defined in PROJECT.md
- The constraints block is always appended — never optional
- The reads field drives the file list — if reads is missing, hsk task warns and exits
- Prompt is output to stdout so developer can copy-paste into any agent tool
- No clipboard access — developer copies manually

---

## TASKS.md Format

- Plain Markdown only. No custom file format.
- Task schema uses fenced fields: reads, builds, description, credits, status
- status [ ] = pending, status [x] = done
- hsk done <n> updates status field in-place using string replacement
- Parser must handle missing optional fields gracefully
- Parser must error clearly if reads field is missing

---

## Agent Support

- Agent-agnostic. The generated prompt works with any agent tool.
- hsk init asks which agent tool the developer uses and stores in .hsk/config.json
- In V1 the agent tool selection does not change prompt format
- V2 may add agent-specific prompt optimisations

---

## Credit Tracker

- Budget is set manually with hsk budget <total>
- Spend is recorded manually with hsk spend <n> <credits>
- hsk status reads from .hsk/budget.json and displays summary
- No automatic tracking via any API
- Units are whatever the developer defines (credits, tokens, requests)

---

## Check Command

- hsk check scans only these locations: PROJECT.md, DECISIONS.md, TASKS.md, PROMPTS.md
- It does not scan the developer's source code
- It outputs a list of warnings with suggested fixes
- It does not modify any files
- All 8 check rules from PROJECT.md must be implemented

---

## Testing

- vitest for all tests
- Tests must cover: parser, generator, checker, tracker
- Tests use fixture files in tests/fixtures/ — not real project files
- Minimum 80% coverage on core/ modules before publishing
- Run tests with: npm test

---

## Publishing

- Build output goes to dist/
- bin/hsk.js is the CLI entry point — must have #!/usr/bin/env node shebang
- package.json bin field points to dist/index.js
- npm publish --access public
- Semantic versioning: 0.1.0 for first publish, 1.0.0 after V1 complete

---

## Out of Scope for V1

- VS Code extension
- Agent API integrations
- Automatic credit tracking
- Web dashboard or GUI
- AI-generated task suggestions
- Multi-project workspace management
- Plugin system
- Paid features
- Mobile or desktop app
- Template registry or community portal
- Agent-specific prompt variants
