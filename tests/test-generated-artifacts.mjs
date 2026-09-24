#!/usr/bin/env node
// Drift gate for the generated AI-facing artifacts. A stale public/llms.txt,
// public/llms-full.txt or public/openapi.yaml must never reach main: this
// regenerates each from its checked-in source in memory and fails on any byte
// difference. Workspace concept ownership is routed by
// varity-engineering/architecture/CHANGE-IMPACT.md. Regenerate with:
//   node tools/generate-ai-gateway-artifacts.mjs --update
//
// Check name: generated AI gateway artifacts match their sources
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { check, projectModel } from '../tools/generate-ai-gateway-artifacts.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const { ok, errors } = check(root);

// llms-full.txt must carry the live AI Gateway catalog, not prose about it:
// before 2026-09-24 it named 9 of 183 model ids and none of the funding terms,
// so an LLM answering from it quoted a stale "cheapest model" and no fee.
const mirror = JSON.parse(readFileSync(new URL('../contracts/ai-gateway.mirror.json', import.meta.url), 'utf8'));
const full = readFileSync(new URL('../public/llms-full.txt', import.meta.url), 'utf8');
if (mirror.openapi?.info?.title !== 'Varity AI Gateway API') {
  errors.push('contracts/ai-gateway.mirror.json does not hold the AI Gateway contract (R41: mirror only the document it names)');
}
if (!Array.isArray(mirror.models) || mirror.models.length === 0) {
  errors.push('contracts/ai-gateway.mirror.json holds no models');
}
for (const model of mirror.models ?? []) {
  if (!full.includes(`\n- \`${model.id}\`: `)) errors.push(`llms-full.txt is missing model ${model.id}`);
}
const fee = mirror.openapi?.['x-varity-commercial-contract']?.funding_service_fee_percent;
if (fee === undefined || !full.includes(`\n- funding_service_fee_percent: ${fee}\n`)) {
  errors.push('llms-full.txt is missing the funding service fee from x-varity-commercial-contract');
}
// Per-replica health and timestamps must never enter the mirror, or the daily
// live check would fail on every read instead of on a real catalog change.
const volatile = /"(availability|refreshed_at|evidence|observed_at)":/;
if (volatile.test(JSON.stringify(mirror.models))) errors.push('contracts/ai-gateway.mirror.json models carry volatile fields');
const projected = projectModel({ id: 'm', privacy: 'private', context_window: 1, max_completion_tokens: 1,
  capabilities: { tool_calls: true, availability: {}, refreshed_at: 'x', evidence: {} },
  customer_pricing: { status: 'configured', version: 'v', observed_at: 'x' }, availability: {}, refreshed_at: 'x' });
if (volatile.test(JSON.stringify(projected)) || projected.capabilities.tool_calls !== true
    || projected.customer_pricing.version !== 'v') {
  errors.push('projectModel must drop only the volatile fields');
}

if (!ok || errors.length) {
  console.error('FAIL generated AI gateway artifacts match their sources');
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  'PASS generated AI gateway artifacts match their sources (public/llms.txt, public/llms-full.txt, public/openapi.yaml)'
);
