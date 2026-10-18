/**
 * The one place public docs read credit-policy values from. Pages never copy a
 * plan price, credit amount, allowance, top-up value or billing code: they name
 * a field, and both renderers (the CreditPolicy Astro component for HTML and the
 * llms generator for text) fill it from `contracts/credit-policy.mirror.json`,
 * the snapshot of `credit_policy` in GET https://varity.app/api/pricing.
 *
 * Interface: `creditPolicyField(mirror, field)` returns a string (inline value)
 * or `{ headers, rows, anchors }` (table). It throws on a missing field, an
 * unknown field, or a billing code without a meaning below, so a contract change
 * fails the build instead of rendering a stale or empty value.
 */

/** Customer names for spend categories. A new category must be named here. */
const CATEGORY_NAMES = {
  ai_chat: 'Chat',
  ai_build: 'Build',
  ai_api: 'AI Gateway API key requests',
  static: 'static apps',
  app: 'dynamic apps',
  cpu: 'CPU VMs',
  gpu: 'GPUs',
};

/**
 * The single meaning of each closed billing code. The code list itself is the
 * contract's; this map only says what each code means to a caller.
 */
const BILLING_CODE_MEANINGS = {
  insufficient_credits: [402, 'Your credit balance cannot cover the action. Add credits or change plan. Replaces the AI Gateway code `insufficient_gateway_balance`; handle both while it is retired.'],
  daily_free_limit_reached: [402, "The Free plan's daily AI allowance is used up. It resets the next UTC day; any subscription or top-up removes the limit."],
  spending_limit_reached: [402, 'The monthly spending limit you set is reached. Raise the limit or wait for the next month. Replaces the AI Gateway code `gateway_monthly_limit_exceeded`; handle both while it is retired.'],
  subscription_required: [402, 'The action needs paid credits from a subscription or top-up, for example an AI Gateway API key request on Free plan credits only.'],
  wallet_frozen: [402, 'Paid usage on this account is paused, for example while a refund or dispute leaves a balance owed. New funding repays it first.'],
  payment_method_shared: [402, "This card already backs another account's free app. Use a different card."],
  quote_expired: [402, 'The price quote expired. Request a new quote and confirm again.'],
  billing_unavailable: [503, 'Billing state could not be read. Never reported as a zero balance; retry with backoff. The body can be the short form `{"error": "billing_unavailable"}`, so read the code from `error` when `code` is absent.'],
};

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);
const usd = (amount) => `$${amount.toLocaleString('en-US')}`;
const count = (amount) => amount.toLocaleString('en-US');

function list(items) {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function required(value, path) {
  if (value === undefined) throw new Error(`credit policy mirror is missing ${path}`);
  return value;
}

function categoryName(category) {
  return required(CATEGORY_NAMES[category], `a customer name for spend category ${category}`);
}

const FIELDS = {
  'credits-per-usd': (p) => `${count(required(p.creditsPerUsd, 'creditsPerUsd'))} credits = $1`,
  'free-monthly-credits': (p) => count(required(p.free?.monthlyCredits, 'free.monthlyCredits')),
  'free-daily-ai-credits': (p) => count(required(p.free?.dailyAiCredits, 'free.dailyAiCredits')),
  'free-promo-categories': (p) => list(required(p.free?.promoCategories, 'free.promoCategories').map(categoryName)),
  'rollover-cycles': (p) => {
    const cycles = required(p.rollover?.subscriptionCycles, 'rollover.subscriptionCycles');
    return `${count(cycles)} billing cycle${cycles === 1 ? '' : 's'}`;
  },
  'top-up-minimum': (p) => usd(required(p.topUp?.minimumUsd, 'topUp.minimumUsd')),
  'top-up-presets': (p) => list(required(p.topUp?.presetsUsd, 'topUp.presetsUsd').map(usd)),
  'top-up-expiry': (p) => {
    const months = required(p.topUp?.expiresAfterMonths, 'topUp.expiresAfterMonths');
    return months === null
      ? 'Top-up credits do not expire.'
      : `Top-up credits expire ${count(months)} months after purchase.`;
  },
  plans: (p) => ({
    headers: ['Plan', 'Price', 'Credits each month'],
    rows: required(p.plans, 'plans').map((plan) => [
      capitalize(plan.id),
      plan.priceUsd === 0 ? '$0' : `${usd(plan.priceUsd)}/month`,
      count(plan.monthlyCredits),
    ]),
    anchors: [],
  }),
  'billing-codes': (p) => {
    const codes = required(p.errorCodes, 'errorCodes');
    for (const code of Object.keys(BILLING_CODE_MEANINGS)) {
      if (!codes.includes(code)) throw new Error(`billing code ${code} has a meaning but is not in credit_policy.errorCodes`);
    }
    return {
      headers: ['Code', 'HTTP', 'Retryable', 'Meaning'],
      rows: codes.map((code) => {
        const [status, meaning] = required(BILLING_CODE_MEANINGS[code], `a meaning for billing code ${code}`);
        return [`\`${code}\``, String(status), status >= 500 ? 'yes' : 'no', meaning];
      }),
      anchors: codes,
    };
  },
};

export const CREDIT_POLICY_FIELDS = Object.keys(FIELDS);

/** @typedef {{ headers: string[], rows: string[][], anchors: string[] }} CreditPolicyTable */

/**
 * @param {{ credit_policy?: any }} mirror
 * @param {string} field
 * @returns {string | CreditPolicyTable}
 */
export function creditPolicyField(mirror, field) {
  const render = FIELDS[field];
  if (!render) throw new Error(`unknown credit policy field "${field}"`);
  return render(required(mirror?.credit_policy, 'credit_policy'));
}

/** Markdown for one field: the text projection used by the llms generator. */
export function creditPolicyMarkdown(mirror, field) {
  const value = creditPolicyField(mirror, field);
  if (typeof value === 'string') return value;
  const line = (cells) => `| ${cells.join(' | ')} |`;
  return [line(value.headers), line(value.headers.map(() => '---')), ...value.rows.map(line)].join('\n');
}
