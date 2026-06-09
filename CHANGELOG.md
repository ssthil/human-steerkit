# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2026-06-09

### Changed
- README: redesigned top section with text-based header, solid flat-square badges, and nav links row
- README: intro rewritten as blockquote + bullet format (CrewAI-style) for faster scanning
- README: added ASCII workflow flow diagram showing the full `init → next → done → repeat` loop
- README: tagline updated from "CLI toolkit" to "CLI tool"

## [0.2.0] - 2026-06-08

### Added
- `hsk next --copy` and `hsk task <n> --copy` — copies the generated prompt to clipboard using native OS commands (no new runtime dependencies)
- `hsk add` — interactive wizard to add a new task to `TASKS.md` without editing markdown by hand
- `hsk report` — per-task credit breakdown showing estimates vs actuals vs delta
- Template: `nextjs-app-router` — Next.js 14 App Router + Prisma + Server Actions + NextAuth (12 tasks)
- Template: `supabase` — Next.js App Router + Supabase auth, database, RLS, and storage (12 tasks)
- CI via GitHub Actions — tests run on Node 20 and 22 for every push and pull request
- ESLint with `typescript-eslint` flat config
- `.gitignore`

### Fixed
- Attached `cause` to rethrown error in `src/utils/fs.ts` (surfaced by linter)
- Removed stale `eslint-disable` comments in `src/index.ts` and `src/commands/init.ts`

## [0.1.2] - 2025-01-01

### Added
- npm and license badges in README
- Repository metadata in `package.json`

## [0.1.1] - 2025-01-01

### Fixed
- Minor packaging fixes

## [0.1.0] - 2025-01-01

### Added
- Initial release
- `hsk init` — interactive wizard scaffolding `PROJECT.md`, `TASKS.md`, `DECISIONS.md`, `PROMPTS.md`
- `hsk task <n>` / `hsk next` — bounded agent prompt generator
- `hsk done <n>` — mark task complete
- `hsk status` — task progress and budget summary
- `hsk check` — credit-waste pattern detector
- `hsk spend` / `hsk budget` — manual credit tracking
- Templates: `fullstack-py`, `nextjs-api`, `fastapi-only`, `express-api`, `blank`
