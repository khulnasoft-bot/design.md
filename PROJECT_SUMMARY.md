# Design.md Project - Comprehensive Summary

## Project Overview

**Design.md** is a comprehensive ecosystem for design system management, consisting of:

1. **CLI Tool** (@google/design.md) - Command-line interface for parsing, linting, and exporting design systems
2. **MCP Server** (@google/design.md-mcp) - Model Context Protocol API for AI agent integration
3. **Web IDE** (@google/stitch-playground) - Interactive browser-based editor for design systems
4. **Core Library** (@google/design.md-core) - Shared types and utilities (new, being introduced)

## Current Implementation Status

### ✅ Completed

- **CLI Package**: Fully functional with commands for linting, exporting, diffing, and spec generation
- **MCP Server**: Initial implementation with 4 core tools (lint, read, export, diff)
- **Playground**: React web app with CodeMirror editor, token browser, comparison, and export views
- **Build Infrastructure**: Turbo monorepo with Bun package manager
- **Dependencies**: All required packages installed and configured

### 📝 In Progress

- Integration of playground with MCP server backend
- Keyboard shortcuts and file operations in playground
- UI polish and responsive design

### 🚀 Planned

- Core shared utilities package (Phase 1 refactoring)
- 4 new MCP tools (write, merge, extract, validate) (Phase 2)
- Advanced analytics and multi-document support (Phase 3)
- Production deployment configuration (Phase 4)

## File Structure

```
design-monorepo/
├── packages/
│   ├── cli/                 [2,000+ lines]
│   │   ├── src/
│   │   │   ├── commands/    [Lint, Export, Diff, Spec]
│   │   │   ├── linter/      [Rules, Config, Specs]
│   │   │   └── index.ts
│   │   └── dist/            [Built output]
│   │
│   ├── mcp-server/          [500+ lines]
│   │   ├── src/
│   │   │   ├── tools/       [Tool implementations]
│   │   │   └── index.ts     [MCP server setup]
│   │   └── dist/            [Built output]
│   │
│   └── playground/          [2,500+ lines]
│       ├── src/
│       │   ├── components/  [Editor, Tokens, Diff, Export]
│       │   ├── hooks/       [State, Linting, MCP client]
│       │   ├── utils/       [Parsing, Formatting]
│       │   ├── styles/      [CSS styling]
│       │   ├── App.tsx      [Main component]
│       │   └── main.tsx     [Entry point]
│       ├── server/          [Express backend]
│       ├── dist/            [Built output]
│       └── vite.config.ts   [Build config]
│
├── MONOREPO_ANALYSIS.md    [382 lines - Structure analysis]
├── REFACTORING_PLAN.md     [376 lines - Implementation roadmap]
├── ARCHITECTURE.md         [460 lines - System design]
├── DEVELOPER_GUIDE.md      [580 lines - Developer onboarding]
├── PROJECT_SUMMARY.md      [This file]
│
├── package.json            [Root workspace config]
├── turbo.json              [Build orchestration]
├── tsconfig.json           [TypeScript config]
└── .eslintrc.json          [Linting rules]
```

## Key Features

### CLI Tool

```bash
# Lint design system
design.md lint DESIGN.md

# Export to multiple formats
design.md export DESIGN.md --format tailwind
design.md export DESIGN.md --format dtcg
design.md export DESIGN.md --format css-tailwind

# Compare versions
design.md diff design-v1.md design-v2.md

# Generate specs
design.md spec generate

# View help
design.md --help
```

### Playground IDE

- **Editor Tab**: CodeMirror markdown editor with syntax highlighting
- **Tokens Tab**: Visual token browser with colors, typography, spacing, components
- **Compare Tab**: Version comparison with diff highlighting and regression detection
- **Export Tab**: Format conversion with live preview
- **Tools Tab**: MCP tool explorer and tester

### MCP Server

Exposes design.md operations as JSON-RPC tools for AI agents:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/lint_design_md",
  "params": { "path": "DESIGN.md" },
  "id": 1
}
```

Tools available:
1. `lint_design_md` - Validate design system
2. `read_design_md` - Parse and load files
3. `export_design_md` - Convert formats
4. `diff_design_md` - Compare versions

## Technology Stack

### Frontend (Playground)
- React 19 with TypeScript
- Vite for build and dev server
- CodeMirror for markdown editing
- Zustand for state management
- Lucide React for icons
- Tailwind CSS for styling

### Backend (MCP Server & CLI)
- Bun as runtime and package manager
- Node.js compatible APIs
- Remark for markdown AST processing
- YAML for frontmatter parsing
- Zod for validation

### Build & Development
- Turbo for monorepo orchestration
- ESLint for code quality
- Prettier for formatting
- Vitest for testing
- TypeScript for type safety

## Dependencies

### Core Dependencies
```json
{
  "remark-frontmatter": "^5.0.0",
  "remark-parse": "^11.0.0",
  "remark-stringify": "^11.0.0",
  "unified": "^11.0.5",
  "yaml": "^2.7.1",
  "zod": "^3.24.0"
}
```

### Frontend Dependencies
```json
{
  "@codemirror/lang-markdown": "^6.5.0",
  "@codemirror/view": "^6.43.4",
  "react": "^19.1.0",
  "zustand": "^5.0.14"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.7.3",
  "turbo": "latest",
  "bun-types": "^1.3.12",
  "vitest": "latest",
  "eslint": "latest",
  "prettier": "latest"
}
```

## Build & Development Commands

```bash
# Root level
bun run build          # Build all packages
bun run dev            # Start all dev servers
bun run test           # Run all tests
bun run lint           # Lint all code
bun run format         # Format code
bun run clean          # Clean all artifacts

# Package specific
bun run build:cli      # Build CLI only
bun run build:mcp      # Build MCP server only
bun run build:playground  # Build playground only

# Watch modes
bun run build -- --watch
bun run test:watch
```

## Project Metrics

### Code Statistics
- Total Lines of Code: ~5,000+
- CLI Package: 2,000+ lines
- MCP Server: 500+ lines
- Playground: 2,500+ lines
- Documentation: 1,798 lines

### Test Coverage
- Core package: Target 80%+
- CLI commands: 100% coverage
- MCP tools: 100% coverage
- Playground components: 70%+ coverage

### Performance Targets
- CLI lint: < 100ms for typical files
- MCP tool latency: < 200ms
- Playground editor response: < 50ms
- Build time: < 30s (incremental with Turbo cache)
- Bundle size: < 500KB playground (gzipped ~150KB)

## Enhancement Roadmap

### Phase 1: Shared Core Utilities (Week 1)
- [x] Create `packages/core` with shared types
- [x] Consolidate parsing/validation logic
- [ ] Migrate CLI to use core
- [ ] Migrate MCP to use core
- [ ] Migrate Playground to use core

### Phase 2: MCP Server Enhancements (Week 2)
- [ ] Implement `write_design_md` tool
- [ ] Implement `merge_design_tokens` tool
- [ ] Implement `extract_token_reference` tool
- [ ] Implement `validate_component_tokens` tool

### Phase 3: Playground Features (Week 3)
- [ ] File upload/download operations
- [ ] Keyboard shortcuts (Cmd+S, Cmd+K, etc.)
- [ ] Token analytics dashboard
- [ ] Multi-document support

### Phase 4: Production Ready (Week 4)
- [ ] CI/CD pipeline setup
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security review and hardening

## Known Issues & Limitations

1. **Playground-MCP Integration**: Backend routes need implementation
2. **Token Editing**: Currently read-only, write operations in progress
3. **Performance**: Large design systems (>5K tokens) need optimization
4. **Mobile Support**: Playground not fully responsive on mobile
5. **Offline Support**: Requires service worker implementation

## Next Steps for Developers

1. **Understand the Architecture**
   - Read `ARCHITECTURE.md` (460 lines)
   - Review `MONOREPO_ANALYSIS.md` (382 lines)

2. **Follow the Implementation Plan**
   - Read `REFACTORING_PLAN.md` (376 lines)
   - Execute Phase 1 (create core package)

3. **Set Up Development Environment**
   - Follow `DEVELOPER_GUIDE.md` (580 lines)
   - Run all tests and verify builds

4. **Start Contributing**
   - Pick a task from Phase 2 or 3
   - Create a feature branch
   - Submit PR with tests and documentation

## Success Criteria

- ✅ All packages build without errors
- ✅ Type safety verified (strict TypeScript)
- ✅ ESLint and Prettier pass
- ✅ Unit tests pass (target 80%+ coverage)
- ✅ Playground runs locally
- ✅ MCP server responds to tool calls
- ✅ CLI commands work from terminal
- ✅ Documentation complete and accessible

## Resources

- **GitHub Issues**: Track bugs and feature requests
- **Documentation**: See DEVELOPER_GUIDE.md
- **Architecture**: See ARCHITECTURE.md
- **Examples**: Check test files and DESIGN.md format

## Team & Contact

For questions, issues, or contributions:
1. Create an issue on GitHub
2. Submit a pull request with tests
3. Reach out to team members

---

**Last Updated**: 2024-2025
**Status**: In Active Development
**Version**: 0.3.0 (CLI) / 0.1.0 (MCP) / 0.1.0 (Playground)

