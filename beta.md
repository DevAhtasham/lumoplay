# Beta Version - Heavy Dependencies (Development/Testing Phase)

This document tracks the heavy dependencies currently included for development and testing. These will be removed for the final lightweight production version.

## Current Heavy Dependencies (to be removed for production)

### Dev Dependencies to Remove:
- `@typescript-eslint/eslint-plugin` - ESLint TypeScript plugin
- `@typescript-eslint/parser` - ESLint TypeScript parser
- `@vitejs/plugin-react` - React plugin for Vite (not needed)
- `eslint` - JavaScript linter
- `prettier` - Code formatter
- `vitest` - Unit testing framework

### Scripts to Remove:
- `test` - Run Vitest tests
- `test:coverage` - Run Vitest with coverage
- `lint` - Run ESLint
- `format` - Run Prettier

### Keep for Production (Lightweight Version):
- `@types/node` - TypeScript Node types (minimal)
- `typescript` - TypeScript compiler (essential)
- `vite` - Build tool (essential)

## Conversion Instructions for Final Lightweight Version

### Step 1: Remove Heavy Dependencies
Remove from `devDependencies`:
```json
"@typescript-eslint/eslint-plugin": "^6.19.0",
"@typescript-eslint/parser": "^6.19.0",
"@vitejs/plugin-react": "^4.2.1",
"eslint": "^8.56.0",
"prettier": "^3.2.4",
"vitest": "^1.2.1"
```

### Step 2: Remove Scripts
Remove from `scripts`:
```json
"test": "vitest",
"test:coverage": "vitest --coverage",
"lint": "eslint src --ext .ts,.tsx",
"format": "prettier --write \"src/**/*.ts\""
```

### Step 3: Remove Config Files (if created)
- `.eslintrc.json` or `.eslintrc.js`
- `.prettierrc` or `.prettierrc.json`
- `eslint.config.js`
- `vitest.config.ts`

### Step 4: Clean package.json
Final lightweight `devDependencies` should only contain:
```json
"devDependencies": {
  "@types/node": "^20.11.0",
  "typescript": "^5.3.3",
  "vite": "^5.0.12"
}
```

### Step 5: Update README
Remove testing/linting/formatting instructions from README.md

## Current Status
- **Phase**: Beta/Development
- **Dependencies**: Heavy (includes testing/linting tools)
- **Purpose**: Fast debugging and testing
- **Next Phase**: Remove heavy dependencies for lightweight production release

## Notes
- Testing tools (Vitest) will be added back in Phase 2 according to plan
- ESLint/Prettier can be added later if team needs them
- For now, keep heavy dependencies for faster development iteration
