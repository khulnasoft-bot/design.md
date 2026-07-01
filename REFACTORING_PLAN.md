# Monorepo Refactoring Implementation Plan

## Overview

This document provides a detailed, step-by-step plan for refactoring the design.md monorepo to improve code organization, reduce duplication, enhance maintainability, and enable future growth.

## Phase 1: Create Core Shared Utilities Package

### Step 1.1: Create Core Package Structure

```bash
mkdir -p packages/core/src/{types,utils,constants}
touch packages/core/{package.json,tsconfig.json,README.md}
touch packages/core/src/{index.ts,types/{design-system.ts,tokens.ts,validation.ts},utils/{parser.ts,validator.ts,formatter.ts,transformer.ts},constants/{tokens.ts,rules.ts}}
```

### Step 1.2: Core Package JSON

The core package provides shared types and utilities used by all other packages.

### Step 1.3: Type Definitions

Create unified type definitions for:
- Design systems and tokens
- Validation results
- Export formats
- MCP tool inputs/outputs

### Step 1.4: Utility Functions

Consolidate common logic:
- Token parsing from YAML frontmatter
- Validation of design systems
- Token formatting and transformation
- Design system merging and diffing

**Benefit**: Single source of truth for parsing/validation logic eliminates bugs from duplicate implementations.

## Phase 2: Reorganize Package Structures

### Step 2.1: CLI Package Reorganization

```
packages/cli/src/
├── commands/          (existing)
├── linter/           (existing)
├── exporters/        (new)
├── transformers/     (new)
└── index.ts
```

Create dedicated modules for export logic and transformations to keep the CLI clean and testable.

### Step 2.2: MCP Server Tool Modularization

```
packages/mcp-server/src/
├── tools/
│   ├── lint.ts       (read file + call lint)
│   ├── read.ts       (parse frontmatter)
│   ├── write.ts      (write + validate)
│   ├── export.ts     (convert format)
│   ├── diff.ts       (compare versions)
│   ├── extract.ts    (get specific token)
│   ├── validate.ts   (check component refs)
│   ├── merge.ts      (combine systems)
│   └── index.ts      (registry + dispatcher)
├── server.ts         (MCP transport)
└── index.ts          (entry point)
```

Each tool is a separate file for clarity and testability. Tool registry centralizes all tool definitions.

### Step 2.3: Playground Services Layer

```
packages/playground/src/
├── services/
│   ├── mcp-client.ts     (MCP tool communication)
│   ├── file-service.ts   (file upload/download)
│   └── design-system.ts  (local state + operations)
├── hooks/
│   ├── useDesignMdState.ts      (existing)
│   ├── useLinting.ts             (linting hook)
│   ├── useMcpTools.ts            (tool dispatch)
│   ├── useFileOperations.ts      (new)
│   └── useKeyboardShortcuts.ts   (new)
└── ...
```

Services isolate API communication and business logic from React components, improving testability.

## Phase 3: Root-Level Standardization

### Step 3.1: ESLint Configuration

```bash
npm install --save-dev eslint eslint-config-prettier
```

Create `.eslintrc.json` at root with:
- TypeScript plugin
- React plugin  
- Consistent rules across all packages
- Exception patterns for MCP, CLI, etc.

### Step 3.2: Prettier Configuration

```bash
npm install --save-dev prettier
```

Create `.prettierrc` for uniform code formatting.

### Step 3.3: TypeScript Base Configuration

Update `tsconfig.json`:
- Base config at root
- Package-specific configs inherit and override
- Project references for compile-time dependency checking

### Step 3.4: Testing Infrastructure

```bash
npm install --save-dev vitest @testing-library/react @testing-library/dom
```

Create `vitest.config.ts` and `vitest.workspace.ts` for:
- Unit tests for core package
- Integration tests for MCP tools
- Component tests for playground
- E2E tests for full workflows

## Phase 4: Enhanced MCP Server Implementation

### Step 4.1: New Tool: write_design_md

**Purpose**: Create or update a DESIGN.md file with automatic validation

```typescript
interface WriteDesignMdInput {
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

interface WriteDesignMdOutput {
  success: boolean;
  path: string;
  findings: LintFinding[];
  summary: LintSummary;
}
```

### Step 4.2: New Tool: merge_design_tokens

**Purpose**: Merge multiple design systems with conflict detection

```typescript
interface MergeDesignTokensInput {
  paths: string[];
  strategy: 'override' | 'combine';
}

interface MergeDesignTokensOutput {
  merged: DesignSystem;
  conflicts: Array<{
    path: string;
    token: string;
    values: Record<string, unknown>;
  }>;
}
```

### Step 4.3: New Tool: extract_token_reference

**Purpose**: Retrieve a specific token value by path

```typescript
interface ExtractTokenReferenceInput {
  path: string;
  tokenPath: string; // e.g., "colors.primary"
}

interface ExtractTokenReferenceOutput {
  tokenPath: string;
  value: unknown;
  resolved: string;
  source?: string;
}
```

### Step 4.4: New Tool: validate_component_tokens

**Purpose**: Validate component token properties and references

```typescript
interface ValidateComponentTokensInput {
  path: string;
  component: string;
}

interface ValidateComponentTokensOutput {
  component: string;
  valid: boolean;
  properties: Record<string, unknown>;
  missingReferences: string[];
  warnings: Array<{
    property: string;
    warning: string;
  }>;
}
```

## Phase 5: Playground Enhancement Features

### Step 5.1: File Operations

Add hooks and services for:
- Upload DESIGN.md files
- Download current design system
- Version/snapshot management
- Recent files (localStorage)

### Step 5.2: Keyboard Shortcuts

Implement common shortcuts:
- `Cmd+S` / `Ctrl+S` - Save file
- `Cmd+K` / `Ctrl+K` - Search tokens
- `Cmd+/` / `Ctrl+/` - Toggle comment
- `Cmd+L` / `Ctrl+L` - Focus editor
- `Cmd+Shift+E` / `Ctrl+Shift+E` - Export

### Step 5.3: Token Analytics

Dashboard showing:
- Total token count by category
- Unused tokens
- Component coverage
- Contrast ratio warnings
- Token usage frequency

### Step 5.4: Multi-Document Editing

Support opening multiple DESIGN.md files:
- Tab-based interface
- Quick switch between files
- Compare tokens across files
- Merge operations

## Implementation Order

### Week 1: Foundation

1. **Day 1**: Create core package with types and utilities
2. **Day 2**: Update CLI to use core package
3. **Day 3**: Update MCP server to use core package  
4. **Day 4**: Setup root-level ESLint, Prettier, TypeScript
5. **Day 5**: Implement tests for core package

### Week 2: Architecture

1. **Day 1**: Reorganize MCP server tools into modules
2. **Day 2**: Create playground services layer
3. **Day 3**: Implement write_design_md and merge_design_tokens tools
4. **Day 4**: Implement extract_token_reference and validate_component_tokens tools
5. **Day 5**: Test and integrate all MCP tools

### Week 3: Enhancement

1. **Day 1-2**: File operations and keyboard shortcuts
2. **Day 3-4**: Token analytics and multi-document support
3. **Day 5**: Performance optimization and testing

## Dependency Migration Path

### Current State
```
cli:        @google/design.md (self)
mcp-server: @google/design.md → cli
playground: (no shared dependencies)
```

### Refactored State
```
core:       (new, no external design.md deps)
cli:        @google/design.md-core → core
mcp-server: @google/design.md-core → core
playground: @google/design.md-core → core
```

All three packages now depend on the core package, eliminating circular dependencies and duplicate code.

## Root Scripts Update

```json
{
  "scripts": {
    "build": "turbo build --parallel",
    "build:core": "turbo build --filter=@google/design.md-core",
    "build:cli": "turbo build --filter=@google/design.md",
    "build:mcp": "turbo build --filter=@google/design.md-mcp",
    "build:playground": "turbo build --filter=@google/stitch-playground",
    
    "dev": "turbo dev --parallel",
    "dev:cli": "turbo dev --filter=@google/design.md",
    "dev:mcp": "turbo dev --filter=@google/design.md-mcp",
    "dev:playground": "turbo dev --filter=@google/stitch-playground",
    
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    
    "lint": "eslint packages/**/*.{ts,tsx}",
    "format": "prettier --write packages/**/*.{ts,tsx,json,css,md}",
    "format:check": "prettier --check packages/**/*.{ts,tsx,json,css,md}",
    
    "clean": "turbo clean && rm -rf **/dist node_modules",
    "type-check": "tsc --noEmit -p ."
  }
}
```

## Validation Checklist

### Code Quality
- [ ] All TypeScript files pass strict type checking
- [ ] ESLint has zero violations
- [ ] Prettier formatting applied consistently
- [ ] No circular dependencies between packages
- [ ] Imports use proper path aliases

### Testing
- [ ] Core package: 80%+ coverage
- [ ] CLI commands: all tested
- [ ] MCP tools: all tested with sample inputs
- [ ] Playground components: render tests
- [ ] Integration tests: CLI → MCP → Playground flow

### Performance
- [ ] Build time: < 30s incremental
- [ ] Turbo cache hit rate: > 80%
- [ ] Bundle size: < 500KB playground, < 200KB CLI
- [ ] MCP tool latency: < 200ms for typical inputs

### Documentation
- [ ] README for each package
- [ ] API docs for core package
- [ ] Architecture diagrams in root
- [ ] Setup guide for developers
- [ ] Troubleshooting guide

## Rollback Strategy

Each phase is designed to be independent:

1. If Phase 1 (core package) fails, revert and stay with current structure
2. If Phase 2 (reorganization) fails, packages continue working with imports from previous structure
3. If Phase 3+ fails, the foundation (Phase 1-2) remains stable

All changes committed to feature branch with clear PR descriptions for easy rollback.

## Success Criteria

- ✅ All packages build without errors
- ✅ Type safety verified with `tsc --noEmit`
- ✅ ESLint and Prettier pass with zero violations
- ✅ Test coverage > 75% for core package
- ✅ Build time reduced by 20%+ with Turbo caching
- ✅ 8 MCP tools fully functional
- ✅ Playground runs locally with offline support
- ✅ Documentation complete and accessible
- ✅ CI/CD pipeline green for all packages
- ✅ Team can onboard new developers easily

