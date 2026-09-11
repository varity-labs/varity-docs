#!/usr/bin/env node
// Drift gate for the generated AI-facing artifacts. A stale public/llms.txt,
// public/llms-full.txt or public/openapi.yaml must never reach main: this
// regenerates each from its checked-in source in memory and fails on any byte
// difference. Requirement: varity-engineering/architecture/AI-GATEWAY-COMPLETION.md
// sections 6 and 7. Regenerate with:
//   node tools/generate-ai-gateway-artifacts.mjs --update
//
// Check name: generated AI gateway artifacts match their sources
import { fileURLToPath } from 'node:url';
import { check } from '../tools/generate-ai-gateway-artifacts.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const { ok, errors } = check(root);

if (!ok) {
  console.error('FAIL generated AI gateway artifacts match their sources');
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  'PASS generated AI gateway artifacts match their sources (public/llms.txt, public/llms-full.txt, public/openapi.yaml)'
);
