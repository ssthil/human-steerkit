# Generate with: brew install vhs && vhs demo/demo.tape
# Requires hsk to be installed: npm install -g human-steerkit

Output demo/demo.gif

Set Shell "bash"
Set FontSize 13
Set Width 1100
Set Height 640
Set Theme "Dracula"
Set Padding 24
Set TypingSpeed 55ms

# Clean up any previous demo run (hidden)
Hide
Type "rm -rf /tmp/my-project"
Enter
Sleep 300ms
Show

Ctrl+L
Sleep 300ms

# ── Set up a fresh project directory ─────────────────────
Type "cd /tmp && mkdir my-project && cd my-project"
Enter
Sleep 700ms

# ── hsk init ─────────────────────────────────────────────
Type "hsk init"
Enter
Sleep 1200ms

Type "my-saas-app"
Enter
Sleep 500ms

Type "SaaS app for managing client invoices"
Enter
Sleep 500ms

# Stack — Down x2 → nextjs-app-router
Down
Down
Enter
Sleep 500ms

# Agent tool — Claude Code
Enter
Sleep 500ms

# Budget
Type "200"
Enter
Sleep 500ms

# Confirm
Enter
Sleep 2000ms

# ── hsk next --copy ───────────────────────────────────────
Type "hsk next --copy"
Enter
Sleep 2000ms

# ── hsk done 1 ────────────────────────────────────────────
Type "hsk done 1"
Enter
Sleep 800ms

# ── hsk status ────────────────────────────────────────────
Type "hsk status"
Enter
Sleep 1200ms

Sleep 2500ms
