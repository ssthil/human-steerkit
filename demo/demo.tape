# Generate with: vhs demo/demo.tape
# Install vhs:   brew install vhs

Output demo/demo.gif

Set Shell "bash"
Set FontSize 13
Set Width 1100
Set Height 620
Set Theme "Dracula"
Set Padding 24
Set TypingSpeed 60ms

# ── Intro pause ───────────────────────────────────────────
Sleep 500ms

# ── hsk init ──────────────────────────────────────────────
Type "hsk init"
Enter
Sleep 1s

# Project name
Type "my-saas-app"
Enter
Sleep 400ms

# One-line goal
Type "SaaS app for managing client invoices"
Enter
Sleep 400ms

# Stack — arrow to nextjs-app-router (3rd option)
Down
Down
Enter
Sleep 400ms

# Agent tool — Claude Code (1st option)
Enter
Sleep 400ms

# Budget
Type "200"
Enter
Sleep 400ms

# Confirm
Enter
Sleep 1500ms

# ── hsk next --copy ───────────────────────────────────────
Type "hsk next --copy"
Enter
Sleep 1500ms

# ── hsk status ────────────────────────────────────────────
Type "hsk status"
Enter
Sleep 1000ms

# ── hsk add ───────────────────────────────────────────────
Type "hsk add"
Enter
Sleep 800ms

Type "Write unit tests for parser"
Enter
Sleep 300ms

Type "src/core/parser.ts, tests/fixtures/tasks.md"
Enter
Sleep 300ms

Type "tests/parser.test.ts"
Enter
Sleep 300ms

Type "Write vitest unit tests covering parseTasks, getTask, and getNextPendingTask using fixture files"
Enter
Sleep 300ms

Type "8"
Enter
Sleep 1200ms

# ── Final status ──────────────────────────────────────────
Type "hsk report"
Enter
Sleep 1000ms

Sleep 2s
