# TASKS.md

## Pre-Agent Tasks

- Set up repository
- Install dependencies
- This section must be skipped by the parser

## Task 1: Scaffold project structure
reads: PROJECT.md, DECISIONS.md
builds: src/ folder layout with placeholder files
description: Create all source directories and empty placeholder files per the folder structure in PROJECT.md
credits: 10
status: [ ]

## Task 2: Implement file system utilities
reads: src/types.ts, src/utils/fs.ts
builds: src/utils/fs.ts
description: Implement readFile, writeFile, fileExists, ensureDir, readJSON and writeJSON using Node.js built-ins only
credits: 15
status: [x]

## Task 3: Implement TASKS.md parser
reads: src/types.ts, src/utils/fs.ts, src/core/parser.ts
builds: src/core/parser.ts
description: Parse TASKS.md into typed Task objects and expose getTask and getNextPendingTask helpers
credits: 20
status: [ ]
