# Contributing to human-steerkit

Contributions are welcome. The easiest way to contribute is to add a new stack template.

## Adding a template

Templates are plain JSON files — no TypeScript knowledge required.

1. Fork the repo
2. Create `src/templates/<your-stack>.json` following the schema in any existing template
3. Add your stack name to the `STACKS` array in `src/commands/init.ts`
4. Submit a pull request with a short description of the stack

## Reporting issues

Open an issue on GitHub with steps to reproduce.

## Code contributions

1. Fork and clone the repo
2. Run `npm install`
3. Run `npm test` to verify all tests pass
4. Make your changes
5. Run `npm test` again before submitting a PR
