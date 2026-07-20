#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const errors = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`missing ${relativePath}`);
    return '';
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function parseJson(relativePath) {
  const raw = read(relativePath);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function visit(value, callback) {
  if (Array.isArray(value)) {
    for (const item of value) visit(item, callback);
    return;
  }
  if (!value || typeof value !== 'object') return;
  callback(value);
  for (const child of Object.values(value)) visit(child, callback);
}

function resolvePointer(document, reference) {
  if (!reference.startsWith('#/')) return undefined;
  return reference.slice(2).split('/').reduce((current, part) => {
    const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
    return current && current[key];
  }, document);
}

const openapi = parseJson('public/openapi.yaml');
if (openapi) {
  if (openapi.openapi !== '3.1.0') errors.push('public/openapi.yaml must declare OpenAPI 3.1.0');
  if (!openapi.info?.title || !openapi.info?.version) errors.push('OpenAPI info title and version are required');
  if (!Array.isArray(openapi.servers) || openapi.servers.length === 0) errors.push('OpenAPI must declare a public server');
  if (!openapi.paths || Object.keys(openapi.paths).length === 0) errors.push('OpenAPI must declare at least one path');

  const operationIds = [];
  const httpMethods = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);
  for (const pathItem of Object.values(openapi.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (httpMethods.has(method) && operation?.operationId) operationIds.push(operation.operationId);
    }
  }
  if (new Set(operationIds).size !== operationIds.length) errors.push('OpenAPI operationId values must be unique');

  visit(openapi, (object) => {
    if (typeof object.$ref !== 'string') return;
    if (!object.$ref.startsWith('#/')) {
      errors.push(`OpenAPI contains unsupported external reference: ${object.$ref}`);
    } else if (resolvePointer(openapi, object.$ref) === undefined) {
      errors.push(`OpenAPI reference does not resolve: ${object.$ref}`);
    }
  });

  const resources = openapi.components?.schemas?.ResourceProfile?.properties;
  const expectedResourceBounds = {
    cpu_units: [0.25, 4],
    memory_mb: [256, 8192],
    storage_mb: [512, 20480],
  };
  for (const [field, [minimum, maximum]] of Object.entries(expectedResourceBounds)) {
    if (resources?.[field]?.minimum !== minimum || resources?.[field]?.maximum !== maximum) {
      errors.push(`OpenAPI ResourceProfile ${field} must declare ${minimum}..${maximum}`);
    }
  }
}

const mcp = parseJson('public/mcp-schema.json');
if (mcp) {
  if (!mcp.server?.name || !mcp.server?.package || !mcp.server?.version) errors.push('MCP schema server identity is incomplete');
  if (!Array.isArray(mcp.tools) || mcp.tools.length === 0) errors.push('MCP schema must declare tools');
  if (mcp.toolCount !== mcp.tools?.length) errors.push('MCP schema toolCount must equal tools.length');

  const toolNames = (mcp.tools || []).map((tool) => tool.name);
  if (toolNames.some((name) => typeof name !== 'string' || !name.startsWith('varity_'))) {
    errors.push('every MCP tool must have a varity_ prefixed name');
  }
  if (new Set(toolNames).size !== toolNames.length) errors.push('MCP tool names must be unique');
  if ((mcp.tools || []).some((tool) => !tool.description || !tool.inputSchema)) {
    errors.push('every MCP tool must declare description and inputSchema');
  }
}

const apiReference = read('src/content/docs/ai-tools/api-reference.mdx');
const mcpReference = read('src/content/docs/ai-tools/mcp-server-spec.mdx');
const aiOverview = read('src/content/docs/ai-tools/overview.mdx');
const llms = read('public/llms.txt');
const llmsFull = read('public/llms-full.txt');

if (!apiReference.includes('/openapi.yaml')) errors.push('API reference must link /openapi.yaml');
if (!mcpReference.includes('/mcp-schema.json')) errors.push('MCP reference must link /mcp-schema.json');
if (!mcpReference.includes('/openapi.yaml')) errors.push('MCP reference must link /openapi.yaml');
for (const artifact of ['/openapi.yaml', '/mcp-schema.json', '/llms.txt', '/llms-full.txt']) {
  if (!aiOverview.includes(artifact)) errors.push(`AI tools overview must link ${artifact}`);
}

for (const [name, content] of [['public/llms.txt', llms], ['public/llms-full.txt', llmsFull]]) {
  if (!content.startsWith('# Varity Docs')) errors.push(`${name} must identify Varity Docs`);
  if (!content.includes('https://docs.varity.so')) errors.push(`${name} must link the canonical docs origin`);
  if (/\b(TODO|TBD|PLACEHOLDER)\b/i.test(content)) errors.push(`${name} contains unresolved placeholder text`);
}
if (llmsFull.length <= llms.length) errors.push('public/llms-full.txt must contain more context than public/llms.txt');

if (process.env.VERIFY_DIST === '1') {
  for (const artifact of ['openapi.yaml', 'mcp-schema.json', 'llms.txt', 'llms-full.txt']) {
    const publicPath = path.join(root, 'public', artifact);
    const distPath = path.join(root, 'dist', artifact);
    if (!fs.existsSync(distPath)) {
      errors.push(`missing built contract artifact: dist/${artifact}`);
    } else if (fs.readFileSync(publicPath).compare(fs.readFileSync(distPath)) !== 0) {
      errors.push(`dist/${artifact} must be an unchanged copy of public/${artifact}`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exit(1);
}

console.log(`PASS public contract artifacts (${Object.keys(openapi?.paths || {}).length} OpenAPI paths, ${mcp?.tools?.length || 0} MCP tools)`);
