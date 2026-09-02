#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DOCS = path.join(__dirname, '../src/content/docs/ai-gateway');
const CATALOG_URL = 'https://varity.app/v1/models';
const HEALTH_URL = 'https://varity.app/health';
const TIMEOUT_MS = 25_000;

async function readJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

function source(name) {
  return fs.readFileSync(path.join(DOCS, name), 'utf8');
}

function count(entries, select) {
  return entries.filter(select).length;
}

function assertIncludes(text, expected, label) {
  if (!text.includes(expected)) throw new Error(`${label} must include: ${expected}`);
}

async function main() {
  const [catalog, health] = await Promise.all([
    readJson(CATALOG_URL),
    readJson(HEALTH_URL),
  ]);
  if (!Array.isArray(catalog.data) || catalog.data.length === 0) {
    throw new Error(`${CATALOG_URL} did not return a non-empty data array`);
  }
  if (typeof health.version !== 'string' || !health.version) {
    throw new Error(`${HEALTH_URL} did not return a version`);
  }

  const entries = catalog.data;
  const total = entries.length;
  const chat = count(entries, (entry) => entry.capabilities?.chat_completions === true);
  const streaming = count(entries, (entry) => entry.capabilities?.streaming === true);
  const tools = count(entries, (entry) => entry.capabilities?.tool_calls === true);
  const streamingTools = count(entries, (entry) => entry.capabilities?.streaming_tool_calls === true);
  const privateModels = count(entries, (entry) => entry.privacy === 'private');
  const anonymizedModels = count(entries, (entry) => entry.privacy === 'anonymized');

  const models = source('models.mdx');
  const compatibility = source('compatibility.mdx');
  const overview = source('index.mdx');

  assertIncludes(models, `**${total} models**`, 'models catalog total');
  assertIncludes(models, `all ${chat} models`, 'models chat ratio');
  assertIncludes(models, `${tools} of ${total} models`, 'models tool ratio');
  assertIncludes(models, `${streaming} of ${total} models`, 'models streaming ratio');
  assertIncludes(models, `${streamingTools} of ${total} models`, 'models streaming-tool ratio');
  assertIncludes(models, `\`"private"\` on ${privateModels} models and \`"anonymized"\` on ${anonymizedModels} models`, 'models privacy split');

  assertIncludes(compatibility, `| \`chat_completions\` | ${chat} of ${total} |`, 'compatibility chat ratio');
  assertIncludes(compatibility, `| \`streaming\` | ${streaming} of ${total} |`, 'compatibility streaming ratio');
  assertIncludes(compatibility, `| \`tool_calls\` | **${tools} of ${total}** |`, 'compatibility tool ratio');
  assertIncludes(compatibility, `| \`streaming_tool_calls\` | **${streamingTools} of ${total}** |`, 'compatibility streaming-tool ratio');
  assertIncludes(compatibility, `Only ${tools} of the ${total} models`, 'compatibility tool prose');
  assertIncludes(compatibility, `"version":"${health.version}"`, 'compatibility health version');
  assertIncludes(overview, `"version": "${health.version}"`, 'overview health version');

  console.log(`PASS: live AI Gateway claims match ${total} models and gateway ${health.version}`);
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
