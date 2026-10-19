#!/usr/bin/env node
// Drift gate for the generated AI-facing artifacts. A stale public/llms.txt,
// public/llms-full.txt or public/openapi.yaml must never reach main: this
// regenerates each from its checked-in source in memory and fails on any byte
// difference. Workspace concept ownership is routed by
// varity-engineering/architecture/CHANGE-IMPACT.md. Regenerate with:
//   node tools/generate-ai-gateway-artifacts.mjs --update
//
// Check name: generated AI gateway artifacts match their sources
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { check, fetchCreditPolicyMirror, projectModel } from '../tools/generate-ai-gateway-artifacts.mjs';
import { CREDIT_POLICY_FIELDS, creditPolicyMarkdown, creditPolicyField } from '../src/lib/credit-policy.mjs';

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
// Funding terms come from credit_policy, rendered from its mirror into both the
// pages (<CreditPolicy field=... />) and llms-full.txt; the AI Gateway's old
// commercial-contract block must not reappear as a second, conflicting owner.
const creditPolicy = JSON.parse(readFileSync(new URL('../contracts/credit-policy.mirror.json', import.meta.url), 'utf8'));
for (const field of CREDIT_POLICY_FIELDS) {
  if (!full.includes(creditPolicyMarkdown(creditPolicy, field))) errors.push(`llms-full.txt is missing credit policy field ${field}`);
}
if (full.includes('funding_service_fee_percent')) errors.push('llms-full.txt renders the superseded AI Gateway funding fee');
const failsClosed = (mutate, label) => {
  const broken = structuredClone(creditPolicy);
  mutate(broken.credit_policy);
  try {
    for (const field of CREDIT_POLICY_FIELDS) creditPolicyField(broken, field);
    errors.push(`credit policy rendering must fail closed on ${label}`);
  } catch { /* expected */ }
};
failsClosed((p) => { p.errorCodes.push('new_billing_code'); }, 'a billing code without a meaning');
failsClosed((p) => { p.errorCodes.pop(); }, 'a meaning whose code left the contract');
failsClosed((p) => { delete p.free.dailyAiCredits; }, 'a missing field');
failsClosed((p) => { p.free.promoCategories.push('new_category'); }, 'an unnamed spend category');
// An absent or unreadable (null) live credit_policy must never be mirrored.
for (const body of [{}, { credit_policy: null }]) {
  const fakeFetch = async () => new Response(JSON.stringify(body), { status: 200 });
  if ((await fetchCreditPolicyMirror(fakeFetch)) !== null) {
    errors.push(`fetchCreditPolicyMirror must return null for ${JSON.stringify(body)}`);
  }
}
// Pages name fields; they never copy the code list or the credit rate.
const docsDir = new URL('../src/content/docs/', import.meta.url);
for (const page of readdirSync(docsDir, { recursive: true }).filter((name) => /\.mdx?$/.test(name))) {
  const source = readFileSync(new URL(page, docsDir), 'utf8');
  for (const code of creditPolicy.credit_policy.errorCodes) {
    if (source.includes(code)) errors.push(`${page} copies billing code ${code}; use <CreditPolicy field="billing-codes" /> or link /api/errors/#capacity-and-billing`);
  }
  if (/credits\s*=\s*\$1/.test(source)) errors.push(`${page} copies the credit rate; use <CreditPolicy field="credits-per-usd" />`);
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
