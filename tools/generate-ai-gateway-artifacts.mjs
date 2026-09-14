#!/usr/bin/env node
/**
 * Generates the public AI-facing projections. None of these three files may be
 * hand-edited; every one of them is derived here so a stale page can never
 * become an LLM's authority (varity-engineering/architecture/AI-GATEWAY-COMPLETION.md
 * sections 6 and 7).
 *
 *   public/llms.txt        compact page index     <- src/content/docs/** + public/mcp-schema.json
 *   public/llms-full.txt   full retrieval corpus  <- src/content/docs/**
 *   public/openapi.yaml    platform API contract  <- contracts/openapi.platform.mirror.json
 *
 * `contracts/openapi.platform.mirror.json` is the exact upstream body of
 * https://varity.app/api/openapi.json (the platform resource API that
 * public/openapi.yaml has always mirrored), refreshed by `--refresh-mirror`.
 * The AI Gateway inference contract is a DIFFERENT document
 * (https://varity.app/v1/openapi.json, "Varity Managed Inference API"); it is
 * documented on the AI Gateway pages and is intentionally not this artifact.
 *
 * Usage:
 *   node tools/generate-ai-gateway-artifacts.mjs                 # hermetic drift check (default)
 *   node tools/generate-ai-gateway-artifacts.mjs --update        # regenerate all three from checked-in sources
 *   node tools/generate-ai-gateway-artifacts.mjs --refresh-mirror  # fetch the live OpenAPI mirror, then --update
 *   node tools/generate-ai-gateway-artifacts.mjs --check-live    # drift check + prove the mirror equals the live endpoint
 *
 * The default and `--update` paths are offline and deterministic; only
 * `--refresh-mirror` and `--check-live` touch the network.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://docs.varity.so';

const DOCS_DIR = 'src/content/docs';
const MCP_SCHEMA_PATH = 'public/mcp-schema.json';
const OPENAPI_MIRROR_PATH = 'contracts/openapi.platform.mirror.json';

/** The live platform OpenAPI document that public/openapi.yaml mirrors. */
const CANONICAL_OPENAPI_URL = 'https://varity.app/api/openapi.json';

const GENERATED_ARTIFACTS = ['public/llms.txt', 'public/llms-full.txt', 'public/openapi.yaml'];

const HEADER_PREAMBLE =
  'Use these docs as the public Varity documentation context. Current MCP install command:';

function readText(path) {
  return readFileSync(path, 'utf8');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Walk `src/content/docs` for every content page, sorted by URL for stable output. */
function collectPageFiles(docsRoot) {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const absolute = join(dir, name);
      if (statSync(absolute).isDirectory()) {
        walk(absolute);
      } else if (/\.mdx?$/.test(name)) {
        files.push(absolute);
      }
    }
  };
  walk(docsRoot);
  return files;
}

/** Minimal frontmatter parser: the docs frontmatter uses single-line scalar keys only. */
function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  const fields = {};
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const pair = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
      if (!pair) continue;
      let value = pair[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      fields[pair[1]] = value;
    }
  }
  return { fields, body: match ? text.slice(match[0].length) : text };
}

/** `foo/index.mdx` -> `foo`, `index.mdx` -> ``, `foo/bar.mdx` -> `foo/bar`. */
function slugFor(absolute, docsRoot) {
  const rel = relative(docsRoot, absolute).split(sep).join('/').replace(/\.mdx?$/, '');
  if (rel === 'index') return '';
  return rel.endsWith('/index') ? rel.slice(0, -'/index'.length) : rel;
}

/** Names of the JSX components a page imports, so their tags can be unwrapped without touching prose. */
function importedComponentNames(body) {
  const names = new Set();
  for (const match of body.matchAll(/^import\s+(.+?)\s+from\s+['"][^'"]+['"];?\s*$/gm)) {
    const clause = match[1].trim();
    const named = /\{([^}]*)\}/.exec(clause);
    if (named) {
      for (const part of named[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/).pop().trim();
        if (/^[A-Z][A-Za-z0-9_]*$/.test(name)) names.add(name);
      }
    }
    const fallback = clause.replace(/\{[^}]*\}/, '').replace(/,/g, '').trim();
    if (/^[A-Z][A-Za-z0-9_]*$/.test(fallback)) names.add(fallback);
  }
  return names;
}

/**
 * Turn an MDX page into retrieval text: drop ESM imports and JSX component
 * wrappers/self-closing components, keep their children and all prose, code,
 * tables and links. Mirrors are left as relative links.
 */
function mdxToText(body) {
  let text = body.replace(/^import\s+.+?\s+from\s+['"][^'"]+['"];?[ \t]*$/gm, '');
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  for (const name of importedComponentNames(body)) {
    const tag = escapeRegExp(name);
    text = text.replace(new RegExp(`<${tag}\\b[^>]*\\/>`, 'g'), '');
    text = text.replace(new RegExp(`<${tag}\\b[^>]*>`, 'g'), '');
    text = text.replace(new RegExp(`</${tag}\\s*>`, 'g'), '');
  }
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

/** Ordered, deterministic page list derived entirely from the checked-in docs. */
function loadPages(root) {
  const docsRoot = join(root, DOCS_DIR);
  const pages = collectPageFiles(docsRoot).map((absolute) => {
    const { fields, body } = parseFrontmatter(readText(absolute));
    const slug = slugFor(absolute, docsRoot);
    return {
      slug,
      url: slug ? `${SITE}/${slug}/` : `${SITE}/`,
      title: fields.title || slug || 'Varity Docs',
      description: fields.description || '',
      body: mdxToText(body),
    };
  });
  return pages.sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));
}

/** Header shared by both LLM projections, so the product line and tool list cannot diverge. */
function renderHeader(pages, schema) {
  const home = pages.find((page) => page.slug === '');
  const summary = home?.description || 'Predictable cloud hosting for supported apps.';
  const lines = [
    '# Varity Docs',
    '',
    `> ${summary}`,
    '',
    HEADER_PREAMBLE,
    '',
    '```bash',
    schema.server.install.claudeCode,
    '```',
    '',
    '## Current MCP Tools',
    '',
  ];
  for (const tool of schema.tools) lines.push(`- \`${tool.name}\``);
  return lines.join('\n');
}

function renderLlmsIndex(pages, schema) {
  const lines = pages.map(
    (page) => `- [${page.title}](${page.url}): ${page.description}`
  );
  return `${renderHeader(pages, schema)}\n\n## Pages\n\n${lines.join('\n')}\n`;
}

function renderLlmsFull(pages, schema) {
  const sections = pages.map(
    (page) =>
      `## ${page.title}\n\nURL: ${page.url}\nDescription: ${page.description}\n\n${page.body}`
  );
  return `${renderHeader(pages, schema)}\n\n${sections.join('\n\n---\n\n')}\n`;
}

/** public/openapi.yaml is a deterministic pretty-print of the canonical mirror. */
function renderOpenApi(mirrorText) {
  return `${JSON.stringify(JSON.parse(mirrorText), null, 2)}\n`;
}

/** Compute every generated artifact in memory from sources checked into `root`. */
export function generate(root) {
  const pages = loadPages(root);
  const schema = JSON.parse(readText(join(root, MCP_SCHEMA_PATH)));
  const mirror = readText(join(root, OPENAPI_MIRROR_PATH));
  return {
    'public/llms.txt': renderLlmsIndex(pages, schema),
    'public/llms-full.txt': renderLlmsFull(pages, schema),
    'public/openapi.yaml': renderOpenApi(mirror),
  };
}

/** Hermetic drift check: each committed artifact must equal its checked-in source derivation. */
export function check(root) {
  const expected = generate(root);
  const errors = [];
  for (const [artifact, content] of Object.entries(expected)) {
    let actual;
    try {
      actual = readText(join(root, artifact));
    } catch {
      errors.push(`missing generated artifact: ${artifact}`);
      continue;
    }
    if (actual !== content) {
      errors.push(
        `stale generated artifact: ${artifact} (regenerate with: node tools/generate-ai-gateway-artifacts.mjs --update)`
      );
    }
  }
  return { ok: errors.length === 0, errors };
}

/** Network check: prove the checked-in mirror still equals its live upstream. */
async function checkLive(root, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(CANONICAL_OPENAPI_URL, {
      headers: { accept: 'application/json' },
    });
  } catch (error) {
    return [`could not reach ${CANONICAL_OPENAPI_URL}: ${error.message}`];
  }
  if (!response.ok) {
    return [`${CANONICAL_OPENAPI_URL} returned HTTP ${response.status}`];
  }
  const live = JSON.parse(await response.text());
  let stored;
  try {
    stored = JSON.parse(readText(join(root, OPENAPI_MIRROR_PATH)));
  } catch (error) {
    return [`could not read ${OPENAPI_MIRROR_PATH}: ${error.message}`];
  }
  if (JSON.stringify(live) !== JSON.stringify(stored)) {
    return [
      `${OPENAPI_MIRROR_PATH} is stale vs ${CANONICAL_OPENAPI_URL} (refresh with --refresh-mirror, then regenerate)`,
    ];
  }
  return [];
}

function update(root) {
  const artifacts = generate(root);
  for (const [artifact, content] of Object.entries(artifacts)) {
    writeFileSync(join(root, artifact), content);
  }
  return Object.keys(artifacts);
}

async function refreshMirror(root, fetchImpl = fetch) {
  const response = await fetchImpl(CANONICAL_OPENAPI_URL, {
    headers: { accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`${CANONICAL_OPENAPI_URL} returned HTTP ${response.status}`);
  const body = await response.text();
  JSON.parse(body); // fail before writing anything that is not valid JSON
  writeFileSync(join(root, OPENAPI_MIRROR_PATH), body);
}

function rootDir() {
  return fileURLToPath(new URL('..', import.meta.url));
}

async function main() {
  const root = rootDir();
  const args = new Set(process.argv.slice(2));

  if (args.has('--refresh-mirror')) {
    await refreshMirror(root);
    update(root);
    console.log(`refreshed ${OPENAPI_MIRROR_PATH} and regenerated artifacts`);
    return;
  }

  if (args.has('--update')) {
    const written = update(root);
    console.log(`regenerated ${written.join(', ')}`);
    return;
  }

  const { ok, errors } = check(root);
  if (args.has('--check-live')) {
    errors.push(...(await checkLive(root)));
  }
  if (ok && errors.length === 0) {
    console.log(
      `PASS generated AI gateway artifacts match their sources (${GENERATED_ARTIFACTS.join(', ')})`
    );
    return;
  }
  console.error('FAIL generated AI gateway artifacts match their sources');
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (invokedDirectly) {
  await main();
}
