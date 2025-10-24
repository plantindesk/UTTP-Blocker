# Agent Guidelines for Blocker Extension

## Commands

- **Build**: `bun run build` (Firefox: `wxt build -b firefox`)
- **Dev**: `bun run dev:firefox` (Firefox: `wxt -b firefox`)
- **Format**: `bunx biome format --write`
- **Lint**: `bunx biome lint --write`
- **Zip**: `bun run zip` (Firefox: `wxt zip -b firefox`)

## Code Style

- **Formatting**: Biome with tab indentation, double quotes
- **TypeScript**: Strict mode, ESNext target, React JSX
- **Imports**: Auto-organized, use `@/` path aliases
- **Components**: Arrow functions with typed props `{}`
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error Handling**: Standard try/catch, console logging for debugging
- **Styling**: Tailwind CSS classes in className attributes

