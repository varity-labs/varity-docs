---
title: Varity MCP Server Specification
description: Model Context Protocol server for AI-assisted Varity development
---

# Varity MCP Server Specification

The Varity MCP (Model Context Protocol) server enables AI assistants like Claude, Cursor, and Windsurf to interact with Varity programmatically, providing intelligent code completion, deployment automation, and debugging assistance.

## Server URL

```
https://mcp.varity.dev/mcp
```

## Configuration

Add the Varity MCP server to your Claude Desktop or Cursor configuration:

```json
{
  "mcpServers": {
    "varity": {
      "type": "http",
      "url": "https://mcp.varity.dev/mcp",
      "options": {
        "project_ref": "<project-id>",
        "read_only": false,
        "features": "deployment,docs,debugging"
      }
    }
  }
}
```

### Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `project_ref` | string | Your Varity project ID | Required |
| `read_only` | boolean | Restrict to read-only operations | `false` |
| `features` | string | Comma-separated feature list | `"all"` |

**Available features**: `deployment`, `docs`, `debugging`, `database`, `storage`, `marketplace`

## Tools Reference

### Account Management

#### `list_projects`

List all projects in your Varity account.

**Parameters**: None

**Returns**:
```typescript
{
  projects: Array<{
    id: string
    name: string
    url: string
    status: 'active' | 'paused'
    created_at: string
  }>
}
```

#### `get_project`

Get detailed information about a specific project.

**Parameters**:
```typescript
{
  project_id: string
}
```

**Returns**:
```typescript
{
  id: string
  name: string
  url: string
  status: 'active' | 'paused'
  deployments: number
  storage_used: string
  created_at: string
  config: {
    network: string
    hosting: 'ipfs' | 'akash'
  }
}
```

#### `create_project`

Create a new Varity project.

**Parameters**:
```typescript
{
  name: string
  config: {
    network?: 'varity-l3' | 'ethereum' | 'polygon'
    hosting?: 'ipfs' | 'akash'
  }
}
```

**Returns**:
```typescript
{
  id: string
  name: string
  url: string
  api_key: string
}
```

### Knowledge Base

#### `search_docs`

Search Varity documentation for relevant information.

**Parameters**:
```typescript
{
  query: string
  limit?: number  // default: 10
}
```

**Returns**:
```typescript
{
  results: Array<{
    title: string
    url: string
    snippet: string
    relevance: number
  }>
}
```

### Development

#### `get_project_url`

Get the public URL for a deployed project.

**Parameters**:
```typescript
{
  project_id: string
}
```

**Returns**:
```typescript
{
  url: string
  ssl_enabled: boolean
}
```

#### `get_api_keys`

Get API keys for a project.

**Parameters**:
```typescript
{
  project_id: string
}
```

**Returns**:
```typescript
{
  publishable_key: string
  service_key_hint: string  // Last 4 chars only
}
```

#### `generate_types`

Generate TypeScript type definitions for a project.

**Parameters**:
```typescript
{
  project_id: string
  output_format?: 'typescript' | 'jsdoc'
}
```

**Returns**:
```typescript
{
  types: string  // TypeScript definitions
  filename: string
}
```

### Deployment

#### `deploy_app`

Deploy an application to Varity.

**Parameters**:
```typescript
{
  project_id: string
  config: {
    hosting: 'ipfs' | 'akash'
    submit_to_store?: boolean
    price?: number  // If submitting to store
  }
}
```

**Returns**:
```typescript
{
  deployment_id: string
  url: string
  status: 'deploying' | 'success' | 'failed'
  build_time: number  // seconds
}
```

#### `list_deployments`

List all deployments for a project.

**Parameters**:
```typescript
{
  project_id: string
  limit?: number  // default: 20
}
```

**Returns**:
```typescript
{
  deployments: Array<{
    id: string
    created_at: string
    status: 'active' | 'inactive'
    url: string
    build_time: number
  }>
}
```

#### `rollback_deployment`

Rollback to a previous deployment.

**Parameters**:
```typescript
{
  deployment_id: string
}
```

**Returns**:
```typescript
{
  success: boolean
  current_deployment_id: string
  url: string
}
```

### CLI Execution

#### `execute_cli`

Execute a varitykit CLI command.

**Parameters**:
```typescript
{
  command: string  // e.g., "doctor", "deploy", "template list"
  args: string[]
  working_directory?: string
}
```

**Returns**:
```typescript
{
  stdout: string
  stderr: string
  exit_code: number
  duration: number
}
```

### Debugging

#### `get_logs`

Get application logs for debugging.

**Parameters**:
```typescript
{
  project_id: string
  options: {
    level?: 'error' | 'warn' | 'info' | 'debug'
    limit?: number  // default: 100
    since?: string  // ISO timestamp
  }
}
```

**Returns**:
```typescript
{
  logs: Array<{
    timestamp: string
    level: string
    message: string
    metadata: object
  }>
}
```

#### `get_errors`

Get error reports for a project.

**Parameters**:
```typescript
{
  project_id: string
  limit?: number  // default: 50
}
```

**Returns**:
```typescript
{
  errors: Array<{
    timestamp: string
    error_type: string
    message: string
    stack_trace: string
    user_id?: string
  }>
}
```

### Monitoring

#### `get_metrics`

Get performance metrics for a project.

**Parameters**:
```typescript
{
  project_id: string
  timeframe: '1h' | '24h' | '7d' | '30d'
}
```

**Returns**:
```typescript
{
  requests: number
  errors: number
  latency_p50: number
  latency_p95: number
  storage_used: string
  bandwidth_used: string
}
```

## Usage Examples

### Example 1: Deploy and Monitor

```typescript
// AI assistant workflow:
// 1. Deploy app
const deployment = await mcp.deploy_app({
  project_id: "proj_abc123",
  config: {
    hosting: "ipfs",
    submit_to_store: true,
    price: 10
  }
})

// 2. Monitor deployment
const metrics = await mcp.get_metrics({
  project_id: "proj_abc123",
  timeframe: "1h"
})

// 3. Check for errors
const errors = await mcp.get_errors({
  project_id: "proj_abc123",
  limit: 10
})
```

### Example 2: Search Documentation

```typescript
// AI searches docs to answer developer question
const results = await mcp.search_docs({
  query: "how to upload files to storage",
  limit: 5
})

// Returns relevant documentation snippets
// AI can then provide context-aware answer
```

### Example 3: Generate TypeScript Types

```typescript
// AI generates types for better autocomplete
const types = await mcp.generate_types({
  project_id: "proj_abc123",
  output_format: "typescript"
})

// Save to project
fs.writeFileSync("varity-types.d.ts", types.types)
```

## Security

### Authentication

All MCP server requests require a valid Varity API key in the configuration. The server supports:

- **Publishable keys**: Read-only operations (docs, metrics)
- **Service keys**: Full access (deployment, configuration)

### Rate Limits

| Plan | Requests/Hour | Concurrent |
|------|---------------|------------|
| Free | 100 | 5 |
| Pro | 1,000 | 20 |
| Enterprise | Unlimited | Unlimited |

### Permissions

Tools respect your project permissions:
- **Owner**: Full access to all tools
- **Admin**: All except billing
- **Developer**: Deployment and debugging only
- **Viewer**: Read-only access

## Error Handling

All tools return standardized errors:

```typescript
{
  error: {
    code: string
    message: string
    details?: object
  }
}
```

**Common error codes**:
- `UNAUTHORIZED`: Invalid or missing API key
- `NOT_FOUND`: Project or resource not found
- `RATE_LIMITED`: Too many requests
- `DEPLOYMENT_FAILED`: Deployment error (check logs)
- `INVALID_CONFIG`: Invalid configuration parameters

## Support

For MCP server issues:
- [Documentation](https://docs.varity.so/ai-tools/mcp-server)
- [Discord](https://discord.gg/varity) - #ai-tools channel
- [GitHub Issues](https://github.com/varity-labs/mcp-server)
