# Design.md Monorepo - Comprehensive Analysis & Enhancement Plan

## Executive Summary

The monorepo currently consists of 4 packages with a Turbo build system and Bun package manager. The structure supports a CLI, MCP server, and web playground, but lacks proper shared utilities, consistent patterns, and scalability for future enhancements.

## Current State Assessment

### Package Overview

```
design-monorepo/
├── packages/
│   ├── cli/                    [Core: DESIGN.md linter, exporter, spec generator]
│   ├── mcp-server/             [API: JSON-RPC tool exposure for agents]
│   └── playground/             [UI: React web IDE for editing design systems]
├── package.json               [Root: Turbo config + workspace manager]
└── turbo.json                 [Monorepo build orchestration]
```

### Package Details

| Package | Type | Purpose | Status |
|---------|------|---------|--------|
| `@google/design.md` (cli) | Core Library | Parse, lint, export DESIGN.md | Production-ready |
| `@google/design.md-mcp` (mcp-server) | API Server | MCP tools for AI agents | Partially complete |
| `@google/stitch-playground` (playground) | Web App | Interactive DESIGN.md editor | In development |

### Dependency Analysis

```
cli (Core Library)
├── remark-* (markdown parsing)
├── unified (AST processing)
├── yaml (frontmatter)
├── zod (validation)
└── tailwindcss (demo)

mcp-server (MCP API)
├── @google/design.md (workspace dependency)
└── @modelcontextprotocol/sdk (agent protocol)

playground (React Web App)
├── @google/design.md (NOT used - gap!)
├── @codemirror/* (markdown editor)
├── react + vite
└── zustand (state management)
```

**Issue**: Playground doesn't import the core library for linting/validation.

### File Structure Gaps

Missing/Inconsistent:
1. **Shared utilities layer** - No common code for token parsing, validation, formatting
2. **Type definitions** - Types scattered across packages, no shared schema
3. **Testing infrastructure** - Each package has separate test setup
4. **Documentation** - No centralized docs for APIs, specs, or architecture
5. **CI/CD configuration** - No GitHub Actions or deployment config
6. **Linting/formatting** - No ESLint or Prettier config at root level

## Enhancement Strategy

### Phase 1: Shared Utilities Layer

Create a new `packages/core` package to consolidate common logic:

```
packages/core/
├── src/
│   ├── types/
│   │   ├── design-system.ts      [Unified type definitions]
│   │   ├── tokens.ts
│   │   └── validation.ts
│   ├── utils/
│   │   ├── parser.ts             [YAML/frontmatter parsing]
│   │   ├── validator.ts          [Validation schemas]
│   │   ├── formatter.ts          [Token formatting]
│   │   └── transformer.ts        [Design system transformations]
│   ├── constants/
│   │   ├── tokens.ts
│   │   └── rules.ts
│   └── index.ts                   [Barrel exports]
├── package.json
└── tsconfig.json
```

**Benefits**:
- Eliminates code duplication (token parsing, validation)
- Enforces consistent types across all packages
- Enables easier sharing between CLI, MCP, and Playground
- Improves testability and maintainability

### Phase 2: Package Reorganization

Improve module structure for clarity and scalability:

#### CLI Package Improvements
```
packages/cli/
├── src/
│   ├── commands/              [Already exists]
│   │   ├── lint.ts           
│   │   ├── export.ts         
│   │   ├── diff.ts           
│   │   └── spec.ts           
│   ├── linter/               [Already exists]
│   │   ├── rules/            [Rule implementations]
│   │   ├── index.ts
│   │   └── spec-config.yaml
│   ├── exporters/            [NEW: Separate export logic]
│   │   ├── tailwind.ts
│   │   ├── dtcg.ts
│   │   └── index.ts
│   ├── transformers/         [NEW: Design system transformations]
│   │   ├── merge.ts
│   │   ├── extract.ts
│   │   └── validate.ts
│   ├── index.ts              [CLI entry]
│   └── types.ts              [CLI-specific types]
└── dist/
```

#### MCP Server Improvements
```
packages/mcp-server/
├── src/
│   ├── tools/               [Tool implementations]
│   │   ├── lint.ts          [lint_design_md]
│   │   ├── read.ts          [read_design_md]
│   │   ├── write.ts         [write_design_md]
│   │   ├── export.ts        [export_design_md]
│   │   ├── diff.ts          [diff_design_md]
│   │   ├── extract.ts       [extract_token_reference]
│   │   ├── validate.ts      [validate_component_tokens]
│   │   ├── merge.ts         [merge_design_tokens]
│   │   └── index.ts         [Tool registry]
│   ├── server.ts            [MCP server setup]
│   └── index.ts             [Entry]
└── dist/
```

#### Playground Improvements
```
packages/playground/
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   ├── Tokens/
│   │   ├── Comparison/
│   │   ├── Export/
│   │   └── Layout/         [NEW: Shared layout components]
│   ├── hooks/
│   │   ├── useDesignMdState.ts
│   │   ├── useLinting.ts
│   │   ├── useMcpTools.ts
│   │   ├── useFileOperations.ts  [NEW]
│   │   └── useKeyboardShortcuts.ts [NEW]
│   ├── services/            [NEW: API integration layer]
│   │   ├── mcp-client.ts
│   │   ├── file-service.ts
│   │   └── design-system.ts
│   ├── utils/
│   │   ├── tokenParsing.ts
│   │   ├── formatting.ts
│   │   └── validation.ts
│   ├── styles/
│   │   ├── editor.css
│   │   ├── tokens.css      [NEW]
│   │   └── layout.css      [NEW]
│   ├── App.tsx
│   └── main.tsx
├── server/
│   ├── index.ts            [Proxy routes for MCP]
│   └── middleware/         [NEW: CORS, error handling]
└── dist/
```

### Phase 3: Standardization & Configuration

#### Root-level Configuration Files

```
design-monorepo/
├── tsconfig.json           [Base TypeScript config]
├── .eslintrc.json          [Shared ESLint rules]
├── .prettierrc             [Code formatting]
├── vitest.config.ts        [Unified testing]
├── turbo.json              [Build orchestration]
├── pnpm-workspaces.yaml    [Alt: move to pnpm]
└── .github/
    └── workflows/
        ├── test.yml        [Unit + integration tests]
        ├── build.yml       [All packages]
        ├── lint.yml        [Code quality]
        └── deploy.yml      [Production release]
```

#### Root package.json Updates

```json
{
  "scripts": {
    "build": "turbo build --parallel",
    "build:cli": "turbo build --filter=@google/design.md",
    "build:mcp": "turbo build --filter=@google/design.md-mcp",
    "build:playground": "turbo build --filter=@google/stitch-playground",
    "dev": "turbo dev --parallel",
    "test": "vitest run --workspace vitest.workspace.ts",
    "test:watch": "vitest --workspace vitest.workspace.ts",
    "lint": "eslint packages/**/*.{ts,tsx}",
    "format": "prettier --write packages/**/*.{ts,tsx,json,css}",
    "clean": "turbo clean && rm -rf **/dist node_modules"
  }
}
```

### Phase 4: Enhanced MCP Server Capabilities

New tools to implement:

1. **write_design_md** - Create/update files with validation
2. **merge_design_tokens** - Combine multiple design systems
3. **extract_token_reference** - Get specific token values
4. **validate_component_tokens** - Check component properties
5. **generate_component_spec** - Auto-generate component specs from tokens
6. **analyze_design_system** - Provide insights (unused tokens, coverage, etc.)
7. **diff_design_md** - Version comparison with regression detection
8. **export_design_md** - Convert to multiple formats

### Phase 5: Playground Enhancements

#### New Features
1. **File Operations** - Upload, save, version management
2. **Keyboard Shortcuts** - Cmd+S (save), Cmd+K (search), etc.
3. **Collaboration** - Real-time sharing (optional)
4. **Component Generator** - Auto-create Tailwind/CSS from tokens
5. **Token Analytics** - Usage stats, contrast warnings, etc.
6. **Multi-document** - Edit multiple DESIGN.md files simultaneously

#### UI Improvements
1. **Responsive Design** - Mobile-friendly editor layout
2. **Dark/Light Themes** - System preference detection
3. **Accessibility** - WCAG 2.1 AA compliance
4. **Performance** - Lazy loading, virtualization for large token sets

## Refactoring Checklist

### High Priority (Week 1)
- [ ] Create `packages/core` with shared types and utilities
- [ ] Update imports in CLI, MCP, and Playground to use core
- [ ] Add ESLint and Prettier configuration at root
- [ ] Setup GitHub Actions CI/CD pipeline
- [ ] Create Vitest configuration for all packages

### Medium Priority (Week 2)
- [ ] Reorganize MCP server with tool modules
- [ ] Add 4 new MCP tools (write, merge, extract, validate)
- [ ] Create playground services layer for MCP integration
- [ ] Add keyboard shortcuts and file operations

### Lower Priority (Week 3+)
- [ ] Move to pnpm workspace (optional)
- [ ] Add E2E tests with Playwright
- [ ] Setup documentation site (Starlight, Nextra, etc.)
- [ ] Create component library with Storybook
- [ ] Add performance monitoring and analytics

## Implementation Examples

### Core Package Structure

```typescript
// packages/core/src/types/design-system.ts
export interface DesignSystem {
  version: string;
  colors: Record<string, Color>;
  typography: Record<string, Typography>;
  spacing: Record<string, string>;
  rounded: Record<string, string>;
  components: Record<string, Component>;
}

export interface Color {
  value: string;
  description?: string;
  source?: string;
}

// packages/core/src/utils/parser.ts
import { DesignSystem } from '../types/design-system';

export function parseDesignMd(content: string): DesignSystem {
  // Shared parsing logic used by all packages
}

// Usage in packages/cli/src/commands/export.ts
import { parseDesignMd } from '@google/design.md-core';

// Usage in packages/playground/src/hooks/useDesignMdState.ts
import { parseDesignMd } from '@google/design.md-core';
```

### Root TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}

// packages/*/tsconfig.json extends root config
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "references": [
    { "path": "../core" }  // Reference other packages as needed
  ]
}
```

## Timeline & Effort Estimation

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| Phase 1: Core Shared Utilities | 1-2 days | Medium | HIGH |
| Phase 2: Package Reorganization | 2-3 days | Medium | HIGH |
| Phase 3: Root Configuration | 1 day | Low | HIGH |
| Phase 4: MCP Enhancements | 2-3 days | Medium | MEDIUM |
| Phase 5: Playground Features | 3-4 days | High | MEDIUM |
| **Total** | **~2 weeks** | **High** | - |

## Success Metrics

- All packages build without errors
- Type safety verified with strict TypeScript
- 80%+ code coverage with unit tests
- Zero ESLint violations
- CI/CD pipeline fully automated
- Documentation updated and accessible
- Playground runs offline with local files
- MCP server handles 100+ tokens without lag
- Build time < 30 seconds for incremental changes

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking existing functionality | Comprehensive test coverage before changes |
| Build time increase | Turbo caching, parallel builds, selective builds |
| Complexity of refactoring | Gradual rollout, feature flags, branch protection |
| Type compatibility issues | Strict TypeScript config, type tests |
| Package version conflicts | Lock files, workspace resolution rules |

## Next Steps

1. **Read** full monorepo structure analysis (this document)
2. **Create** Phase 1 core package with shared utilities
3. **Update** all package references to use core
4. **Setup** root-level linting and testing
5. **Commit** and push to feature branch
6. **Create** PR with detailed change summary
7. **Iterate** based on feedback and test results

