# Design.md Playground - Quick Start Guide

## Overview
Interactive web IDE for DESIGN.md files with real-time validation, token visualization, and export capabilities. Includes MCP server for AI agent integration.

## Installation

```bash
# Install dependencies
bun install

# Build all packages
bun run build
```

## Running Locally

### Development Mode (with HMR)
```bash
# From project root
cd packages/playground
bun run dev

# Visits:
# - Frontend: http://localhost:5173
# - API: http://localhost:3030
```

### Production Build
```bash
bun run build
# Outputs to packages/playground/dist/
```

## Features

### Editor Tab
- **Markdown Editor** - Full markdown support with syntax highlighting
- **Real-Time Validation** - Linting as you type
- **Frontmatter Editor** - Visual YAML editing
- **Live Validator** - Shows errors, warnings, and info

### Tokens Tab
- **Color Grid** - Visual color swatches with hex/RGB values
- **Typography** - Font samples with actual rendering
- **Spacing** - Visual scale preview
- **Components** - Property inspection
- **Search** - Filter by category or name

### Compare Tab
- **Version Diff** - Compare two DESIGN.md files
- **Change Tracking** - Added, removed, modified tokens
- **Regression Detection** - Alert if validation issues increase
- **Visual Highlighting** - Clear before/after visualization

### Export Tab
- **Multiple Formats**:
  - Tailwind v3 (JSON)
  - Tailwind v4 (CSS custom properties)
  - W3C Design Tokens (DTCG)
- **Live Preview** - See output before download
- **Copy & Download** - Easy sharing

### Tools Tab
- Access all MCP server tools
- Structured input/output
- Real-time validation

## MCP Server

### Standalone Usage
```bash
cd packages/mcp-server
bun run dev

# Listens on stdin, writes JSON-RPC to stdout
# Used by Claude Desktop, Cline, and other MCP clients
```

### Available Tools

#### `lint_design_md`
Validate a DESIGN.md file
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "lint_design_md",
    "arguments": { "path": "/path/to/DESIGN.md" }
  }
}
```

#### `read_design_md`
Load and parse a design file
```json
{
  "method": "tools/call",
  "params": {
    "name": "read_design_md",
    "arguments": { "path": "/path/to/DESIGN.md" }
  }
}
```

#### `write_design_md`
Save a design file
```json
{
  "method": "tools/call",
  "params": {
    "name": "write_design_md",
    "arguments": {
      "path": "/path/to/DESIGN.md",
      "frontmatter": { "name": "My Design System" },
      "body": "# Colors\n\n## Primary\n..."
    }
  }
}
```

#### `export_design_md`
Convert to other formats
```json
{
  "method": "tools/call",
  "params": {
    "name": "export_design_md",
    "arguments": {
      "path": "/path/to/DESIGN.md",
      "format": "json-tailwind"  // or "css-tailwind", "dtcg"
    }
  }
}
```

#### `diff_design_md`
Compare two design systems
```json
{
  "method": "tools/call",
  "params": {
    "name": "diff_design_md",
    "arguments": {
      "before": "/path/to/old.md",
      "after": "/path/to/new.md"
    }
  }
}
```

#### `extract_token_reference`
Get a specific token value
```json
{
  "method": "tools/call",
  "params": {
    "name": "extract_token_reference",
    "arguments": {
      "path": "/path/to/DESIGN.md",
      "tokenPath": "colors.primary"  // Dot notation
    }
  }
}
```

#### `validate_component_tokens`
Validate component properties
```json
{
  "method": "tools/call",
  "params": {
    "name": "validate_component_tokens",
    "arguments": {
      "path": "/path/to/DESIGN.md",
      "component": "Button"
    }
  }
}
```

#### `merge_design_tokens`
Combine multiple design systems
```json
{
  "method": "tools/call",
  "params": {
    "name": "merge_design_tokens",
    "arguments": {
      "paths": ["/path/to/1.md", "/path/to/2.md"],
      "strategy": "override"  // or "combine"
    }
  }
}
```

## DESIGN.md Format

```yaml
---
name: My Design System
colors:
  primary: "#007AFF"
  secondary: "#5AC8FA"
typography:
  heading:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "700"
spacing:
  sm: 8px
  md: 16px
  lg: 24px
rounded:
  sm: 4px
  md: 8px
  lg: 16px
components:
  Button:
    backgroundColor: "{colors.primary}"
    padding: "{spacing.md}"
---

# Tokens

## Colors

### Primary
Blue accent color for interactive elements.

## Typography

### Heading
Used for page titles and section headers.
```

## Keyboard Shortcuts

- `Ctrl+S` / `Cmd+S` - Save file
- `Ctrl+L` / `Cmd+L` - Focus file path input
- `Tab` - Navigate between tabs
- `Ctrl+/` - Toggle comment in editor

## Environment Variables

Optional configuration:
```bash
# MCP Server
STITCH_API_URL=http://localhost:3030  # API endpoint
PORT=3030                              # Server port

# Playground
VITE_API_BASE=/api                    # API base path
```

## Troubleshooting

### Port Already in Use
```bash
# Change port
PORT=3031 bun run dev
```

### Build Fails
```bash
# Clean and rebuild
rm -rf node_modules dist packages/*/dist
bun install
bun run build
```

### TypeScript Errors
```bash
# Check types
bun x tsc --noEmit
```

## Architecture

```
┌─────────────────┐
│   Web Browser   │
│   (React 19)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Vite Server   │
│  (localhost:5173)
└────────┬────────┘
         │ /api/*
         ▼
┌─────────────────┐
│  MCP Server     │
│  (localhost:3030)
└────────┬────────┘
         │ Reads/Writes
         ▼
┌─────────────────┐
│ DESIGN.md Files │
│ (on filesystem) │
└─────────────────┘
```

## Performance Tips

1. **Large Design Systems**
   - Use search to filter tokens
   - Split into multiple DESIGN.md files and merge

2. **Export Performance**
   - Pre-select format before exporting large systems
   - Use CLI for batch exports

3. **Validation**
   - Fix errors immediately (validation runs on every save)
   - Use validation panel to identify issues

## Deployment

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN bun install && bun run build
EXPOSE 3030 5173
CMD ["bun", "run", "dev"]
```

### Vercel
```bash
vercel deploy
```

### Self-Hosted
```bash
# Build
bun run build

# Serve playground
cd packages/playground
bun serve dist/

# Run MCP server (separate process)
cd packages/mcp-server
bun run start
```

## File Locations

- **Editor**: `packages/playground/src/components/Editor/`
- **Tokens**: `packages/playground/src/components/Tokens/`
- **Comparison**: `packages/playground/src/components/Comparison/`
- **Export**: `packages/playground/src/components/Export/`
- **MCP Server**: `packages/mcp-server/src/index.ts`
- **CLI/Linter**: `packages/cli/src/linter/`
- **Styling**: `packages/playground/src/styles/editor.css`
- **State**: `packages/playground/src/hooks/useDesignMdState.ts`

## Resources

- [DESIGN.md Specification](./docs/spec.md)
- [Architecture Overview](./IMPLEMENTATION_SUMMARY.md)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [W3C Design Tokens](https://design-tokens.github.io/community-group/)

## Support

For issues or questions:
1. Check the error message in the Validation panel
2. Review `IMPLEMENTATION_SUMMARY.md` for architecture details
3. Check build output for type errors
4. Review MCP server logs for tool execution issues
