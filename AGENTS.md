# Agent Guidelines for Blocker Extension

## Commands

- **Dev**: `bun run dev` (Firefox: `bun run dev:firefox`)
- **Build**: `bun run build` (Firefox: `bun run build:firefox`)
- **Format**: `bun run format` (Biome with tabs, double quotes)
- **Lint**: `bun run lint` (Biome recommended rules)
- **Test**: `bun run test` (single test: `bun run test path/to/test.test.ts`)
- **Typecheck**: `bun run typecheck`
- **Zip**: `bun run zip` (Firefox: `bun run zip:firefox`)
- **Postinstall**: `bun run postinstall` (WXT prepare)

## Code Style

- **Formatting**: Biome (tabs, double quotes, auto-organize imports)
- **TypeScript**: ESNext target, React JSX, strict checks (noUnusedLocals/Parameters disabled)
- **Imports**: Use `@/` aliases, auto-organized by Biome
- **Components**: Arrow functions with typed props `{}`, PascalCase
- **Naming**: camelCase for vars/functions, PascalCase for components/types
- **Error Handling**: try/catch with console logging for debugging
- **Styling**: Tailwind CSS in className, no custom CSS unless necessary
- **Browser Extension**: Use WXT framework, browser API for cross-browser compatibility
- **Context**: Use context 7 mcp for enhanced code understanding

## Project Structure

- `src/entrypoints/` - Extension entry points (popup, background, content)
- `src/assets/` - Static assets (CSS, images)
- Build output in `dist/`, use WXT for Firefox/Chrome builds