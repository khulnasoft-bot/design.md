# Implementation Checklist - Design.md Monorepo Enhancement

## Phase 1: Core Shared Utilities Package

### 1.1 Package Setup
- [ ] Create `packages/core` directory
- [ ] Create `packages/core/package.json`
  - [ ] Set name to `@google/design.md-core`
  - [ ] Set version to `0.1.0`
  - [ ] Configure TypeScript build script
  - [ ] Add exports map
- [ ] Create `packages/core/tsconfig.json`
- [ ] Create `packages/core/README.md`

### 1.2 Type Definitions
- [ ] Create `src/types/design-system.ts`
  - [ ] Define `DesignSystem` interface
  - [ ] Define `Token` base type
  - [ ] Define `ColorToken`, `TypographyToken`, `SpacingToken`, `RoundedToken`, `ComponentToken`
- [ ] Create `src/types/tokens.ts`
  - [ ] Export all token types
  - [ ] Add JSDoc comments
- [ ] Create `src/types/validation.ts`
  - [ ] Define `LintFinding` interface
  - [ ] Define `LintSummary` interface
  - [ ] Define `LintReport` interface
- [ ] Create `src/types/index.ts`
  - [ ] Re-export all types

### 1.3 Utility Functions
- [ ] Create `src/utils/parser.ts`
  - [ ] Implement `parseDesignMd(content: string)`
  - [ ] Implement `parseFrontmatter(raw: string)`
  - [ ] Add tests
- [ ] Create `src/utils/validator.ts`
  - [ ] Implement `validateDesignSystem(ds: unknown)`
  - [ ] Implement `createZodSchema()`
  - [ ] Add tests
- [ ] Create `src/utils/formatter.ts`
  - [ ] Implement `formatColor(color: ColorToken)`
  - [ ] Implement `formatTypography(typo: TypographyToken)`
  - [ ] Implement `formatToken(token: Token)`
  - [ ] Add tests
- [ ] Create `src/utils/transformer.ts`
  - [ ] Implement `mergeDesignSystems(systems: DesignSystem[])`
  - [ ] Implement `extractTokenByPath(ds: DesignSystem, path: string)`
  - [ ] Implement `diffDesignSystems(before: DesignSystem, after: DesignSystem)`
  - [ ] Add tests

### 1.4 Constants & Helpers
- [ ] Create `src/constants/tokens.ts`
  - [ ] Export token category names
  - [ ] Export validation rules
- [ ] Create `src/constants/index.ts`
  - [ ] Re-export all constants
- [ ] Create `src/index.ts`
  - [ ] Barrel export all types
  - [ ] Barrel export all utilities
  - [ ] Barrel export all constants

### 1.5 Build & Test
- [ ] Run `bun run build` in core package
- [ ] Verify `dist/` output generated
- [ ] Create tests for all utilities
- [ ] Run `bun test` in core package
- [ ] Verify test coverage > 80%
- [ ] Update root `package.json` workspaces if needed

### 1.6 Integration
- [ ] Update `packages/cli/package.json` to depend on `@google/design.md-core`
- [ ] Update `packages/cli/src/` imports to use core package
- [ ] Update `packages/mcp-server/package.json` to depend on `@google/design.md-core`
- [ ] Update `packages/mcp-server/src/` imports to use core package
- [ ] Update `packages/playground/package.json` to depend on `@google/design.md-core`
- [ ] Update `packages/playground/src/` imports to use core package

### 1.7 Verification
- [ ] Run `bun run build` for all packages
- [ ] Run `bun run test` for all packages
- [ ] Run `bun run type-check`
- [ ] Verify no TypeScript errors
- [ ] Verify monorepo still works end-to-end

---

## Phase 2: MCP Server Tool Modularization

### 2.1 Tool Module Structure
- [ ] Create `src/tools/` directory structure
- [ ] Create `src/tools/lint.ts`
  - [ ] Implement `lint_design_md` tool
  - [ ] Input validation with Zod
  - [ ] Output formatting
  - [ ] Error handling
- [ ] Create `src/tools/read.ts`
  - [ ] Implement `read_design_md` tool
  - [ ] Parse frontmatter and body
  - [ ] Handle file read errors
- [ ] Create `src/tools/export.ts`
  - [ ] Implement `export_design_md` tool
  - [ ] Support Tailwind v3 JSON format
  - [ ] Support Tailwind v4 CSS format
  - [ ] Support W3C DTCG format

### 2.2 New MCP Tools
- [ ] Create `src/tools/write.ts`
  - [ ] Implement `write_design_md` tool
  - [ ] Validate before writing
  - [ ] Return linting results after write
  - [ ] Error handling for file write failures
- [ ] Create `src/tools/merge.ts`
  - [ ] Implement `merge_design_tokens` tool
  - [ ] Support "override" merge strategy
  - [ ] Support "combine" merge strategy
  - [ ] Detect conflicts
- [ ] Create `src/tools/extract.ts`
  - [ ] Implement `extract_token_reference` tool
  - [ ] Support dot notation paths
  - [ ] Return resolved values
  - [ ] Handle missing tokens gracefully
- [ ] Create `src/tools/validate.ts`
  - [ ] Implement `validate_component_tokens` tool
  - [ ] Check property references
  - [ ] Detect missing imports
  - [ ] Generate detailed reports

### 2.3 Tool Registry
- [ ] Create `src/tools/index.ts`
  - [ ] Import all tool modules
  - [ ] Create tool registry object
  - [ ] Implement tool dispatcher
  - [ ] Add error handling middleware
  - [ ] Add input validation

### 2.4 Server Integration
- [ ] Update `src/index.ts`
  - [ ] Import tool registry
  - [ ] Setup MCP server transport
  - [ ] Register all tools
  - [ ] Implement request handlers
  - [ ] Add logging/telemetry

### 2.5 Testing
- [ ] Create tests for each tool
- [ ] Test valid inputs and outputs
- [ ] Test error conditions
- [ ] Test edge cases
- [ ] Verify tool registry works

### 2.6 Verification
- [ ] Build MCP server: `bun run build`
- [ ] Run tests: `bun test`
- [ ] Manual testing with JSON-RPC calls
- [ ] Verify all 8 tools are registered
- [ ] Test with real DESIGN.md files

---

## Phase 3: Playground Enhancements

### 3.1 Services Layer
- [ ] Create `src/services/mcp-client.ts`
  - [ ] Implement `callTool()` function
  - [ ] Handle request/response serialization
  - [ ] Add error handling
  - [ ] Implement retry logic
- [ ] Create `src/services/file-service.ts`
  - [ ] Implement file upload handler
  - [ ] Implement file download handler
  - [ ] Handle file size limits
  - [ ] Validate file types
- [ ] Create `src/services/design-system.ts`
  - [ ] Local state management for design system
  - [ ] Parse and validate operations
  - [ ] Track changes and diffs

### 3.2 Enhanced Hooks
- [ ] Create `src/hooks/useFileOperations.ts`
  - [ ] `uploadFile()` function
  - [ ] `downloadFile()` function
  - [ ] `saveVersion()` function
  - [ ] `loadRecent()` function
- [ ] Create `src/hooks/useKeyboardShortcuts.ts`
  - [ ] Register Cmd+S for save
  - [ ] Register Cmd+K for search
  - [ ] Register Cmd+L for focus editor
  - [ ] Register Cmd+/ for toggle comment
  - [ ] Register Cmd+Shift+E for export

### 3.3 UI Components
- [ ] Create file operations UI in top bar
  - [ ] Upload button
  - [ ] Save button
  - [ ] Download button
  - [ ] Recent files dropdown
- [ ] Add keyboard shortcuts help dialog
  - [ ] Display available shortcuts
  - [ ] Show in help menu
- [ ] Enhance token analytics view
  - [ ] Token count by category
  - [ ] Unused token detection
  - [ ] Component coverage metrics
  - [ ] Contrast ratio warnings

### 3.4 Multi-Document Support
- [ ] Implement tab interface for multiple files
- [ ] Add tab open/close functionality
- [ ] Implement tab switching
- [ ] Add compare-across-tabs feature
- [ ] Persist open tabs in localStorage

### 3.5 CSS & Styling
- [ ] Create `src/styles/tokens.css` for token components
- [ ] Create `src/styles/layout.css` for layout improvements
- [ ] Enhance responsive design for mobile
- [ ] Add dark/light theme switcher
- [ ] Improve accessibility (WCAG 2.1 AA)

### 3.6 Testing
- [ ] Test file upload/download
- [ ] Test keyboard shortcuts
- [ ] Test multi-document switching
- [ ] Test analytics calculations
- [ ] Component render tests

### 3.7 Verification
- [ ] Build playground: `bun run build`
- [ ] Run tests
- [ ] Manual testing of all features
- [ ] Check responsive design on mobile
- [ ] Verify accessibility with screen reader

---

## Phase 4: Root-Level Configuration

### 4.1 Linting & Formatting
- [ ] Create `.eslintrc.json`
  - [ ] Configure TypeScript parser
  - [ ] Enable recommended rules
  - [ ] Add React plugin rules
  - [ ] Define package-specific overrides
- [ ] Create `.prettierrc`
  - [ ] Set indentation to 2 spaces
  - [ ] Set print width to 100
  - [ ] Enable trailing commas
- [ ] Run `bun run lint` and fix all issues
- [ ] Run `bun run format` to apply formatting

### 4.2 TypeScript Configuration
- [ ] Update root `tsconfig.json`
  - [ ] Set strict mode
  - [ ] Configure path aliases
  - [ ] Enable declaration maps
  - [ ] Setup project references
- [ ] Verify each package has appropriate `tsconfig.json`
- [ ] Run `bun run type-check` with no errors

### 4.3 Testing Infrastructure
- [ ] Create `vitest.config.ts`
- [ ] Create `vitest.workspace.ts`
- [ ] Setup test coverage configuration
- [ ] Create `__tests__` directories in each package
- [ ] Run `bun run test` and verify all pass

### 4.4 Git & CI/CD
- [ ] Create `.github/workflows/test.yml`
  - [ ] Run tests on PR
  - [ ] Generate coverage report
- [ ] Create `.github/workflows/lint.yml`
  - [ ] Run ESLint
  - [ ] Run Prettier check
  - [ ] Type check
- [ ] Create `.github/workflows/build.yml`
  - [ ] Build all packages
  - [ ] Upload artifacts
- [ ] Create `.gitignore` entries
- [ ] Create `.npmignore` in each package

### 4.5 Documentation
- [ ] Update root `README.md`
- [ ] Create `CONTRIBUTING.md`
- [ ] Create `CODE_OF_CONDUCT.md`
- [ ] Create `SECURITY.md`
- [ ] Create `CHANGELOG.md`

### 4.6 Scripts Update
- [ ] Update root `package.json` scripts
  - [ ] Build scripts for all packages
  - [ ] Dev scripts with parallel execution
  - [ ] Test and coverage scripts
  - [ ] Lint and format scripts
  - [ ] Clean and setup scripts

### 4.7 Verification
- [ ] All root scripts work correctly
- [ ] ESLint passes with zero violations
- [ ] Prettier formatting applied consistently
- [ ] TypeScript strict mode passes
- [ ] All tests pass
- [ ] Build artifacts generated correctly

---

## Final Verification Checklist

### Code Quality
- [ ] All TypeScript files pass `tsc --noEmit`
- [ ] ESLint passes with zero violations (`bun run lint`)
- [ ] Prettier formatting applied (`bun run format`)
- [ ] No circular dependencies detected
- [ ] Import paths use consistent style

### Testing
- [ ] Unit tests pass for core package
- [ ] All CLI commands tested
- [ ] All MCP tools tested
- [ ] Playground components render correctly
- [ ] Integration tests pass
- [ ] Coverage > 80% for core package

### Performance
- [ ] Build time < 30s for incremental builds
- [ ] Turbo cache hit rate > 80%
- [ ] CLI lint command < 100ms
- [ ] MCP tool latency < 200ms
- [ ] Playground editor response < 50ms

### Documentation
- [ ] ARCHITECTURE.md complete and accurate
- [ ] DEVELOPER_GUIDE.md covers all packages
- [ ] REFACTORING_PLAN.md reflects implementation
- [ ] README files for each package
- [ ] Code comments for complex logic

### Functionality
- [ ] CLI works: `bun run cli lint --help`
- [ ] MCP server starts: `cd packages/mcp-server && bun run dev`
- [ ] Playground runs: `cd packages/playground && bun run dev`
- [ ] Playground can edit DESIGN.md files
- [ ] Playground can export formats
- [ ] MCP tools respond to JSON-RPC calls

### Deployment Ready
- [ ] All packages build without errors
- [ ] No TypeScript errors or warnings
- [ ] No ESLint errors or warnings
- [ ] All tests pass
- [ ] Git history is clean
- [ ] Version numbers updated
- [ ] Changelog updated

---

## Timeline Tracking

### Week 1: Foundation
- **Mon-Tue**: Phase 1 package setup & types
- **Wed**: Phase 1 utilities & integration
- **Thu**: Phase 1 testing & verification
- **Fri**: Root configuration setup

### Week 2: Architecture
- **Mon-Tue**: Phase 2 tool modularization
- **Wed**: Phase 2 new tools implementation
- **Thu**: Phase 2 testing & integration
- **Fri**: Playground services layer

### Week 3: Features
- **Mon-Tue**: Phase 3 file operations & shortcuts
- **Wed**: Phase 3 analytics & multi-document
- **Thu**: Phase 3 CSS & styling
- **Fri**: Phase 3 testing & verification

### Week 4: Polish
- **Mon**: Performance optimization
- **Tue**: Accessibility audit (WCAG 2.1 AA)
- **Wed**: Security review
- **Thu**: Final testing & bug fixes
- **Fri**: Documentation & release prep

---

## Notes

- Test each phase independently before moving to next
- Commit frequently with clear messages
- Keep PRs focused on single features
- Update documentation as you go
- Run full test suite before any merge
- Get code review approval before merging

