# Custom Domain Setup: Namecheap

Connect your domain (e.g. `app.yourcompany.com`) to your Varity deployment using Namecheap's DNS management.

> **Status:** Draft — for internal review. Publish when the custom domains feature ships.

---

## What You'll Need

- A domain registered with Namecheap (e.g. `yourcompany.com`)
- A Varity account with at least one deployed app
- Your app's gateway address from the Varity dashboard (e.g. `my-app.gateway.varity.app`)

---

## Step-by-Step: Add a CNAME Record

### 1. Log in to Namecheap

Go to [namecheap.com](https://namecheap.com) and sign in.

> **Screenshot placeholder:** Namecheap login page — orange and white design, username and password fields, orange "Sign In" button.

### 2. Open Your Domain's DNS Settings

1. In the top navigation, click **Account** → **Domain List**
2. Find the domain you want to use and click **Manage**

> **Screenshot placeholder:** Namecheap Domain List — table of domains, each with Type, Expires, Nameservers columns, and "Manage" button on the right.

### 3. Go to Advanced DNS

On the domain management page, click the **Advanced DNS** tab.

> **Screenshot placeholder:** Domain management page with tabs: Domain, Nameservers, Advanced DNS, Transfer, Private Email. Advanced DNS tab selected, showing existing DNS records in a table.

### 4. Add a New CNAME Record

Under the **Host Records** section, click **Add New Record**.

A new row will appear at the bottom of the table. Fill in:

| Field | Value |
|-------|-------|
| **Type** | `CNAME Record` |
| **Host** | `app` |
| **Value** | `gateway.varity.app` |
| **TTL** | Automatic |

> **Screenshot placeholder:** New record row in the Host Records table — dropdown showing "CNAME Record", Host field with "app", Value field with "gateway.varity.app", TTL set to Automatic. Green checkmark button to save visible on the right.

Click the **green checkmark** to save the record.

### 5. Verify the Record Appears

The saved CNAME record should appear in the Host Records table:

```
Type            Host    Value                    TTL
CNAME Record    app     gateway.varity.app       Automatic
```

> **Screenshot placeholder:** Host Records table with the new CNAME row saved. Green checkmark replaced by pencil (edit) and red X (delete) icons.

### 6. Add Your Domain in Varity

In your Varity dashboard:
1. Go to your app's **Settings** tab
2. Under **Custom Domain**, enter `app.yourcompany.com`
3. Click **Add Domain**

Varity will verify the DNS record and begin SSL provisioning.

---

## How Long Until It Works?

Namecheap DNS typically propagates within **15–30 minutes** for most records, though it can take up to 48 hours in rare cases.

To check propagation: use [dnschecker.org](https://dnschecker.org) and search for `app.yourcompany.com` with record type `CNAME`. When most locations show `gateway.varity.app`, your DNS has propagated.

---

## Common Errors & Fixes

### "I see Namecheap's parking page instead of my app"

Namecheap's parking page is served from an A record that may override your CNAME. In the Host Records table, look for an `A Record` with Host `@` pointing to Namecheap's IP — this is for your apex domain and won't affect the `app` subdomain. If you see an `A Record` with Host `app`, delete it before saving your CNAME.

### "CNAME record value is being rejected"

Namecheap sometimes requires a trailing dot on CNAME values in its backend, but the UI strips it automatically. Enter the value without a trailing dot: `gateway.varity.app`. If the field shows an error, try adding the trailing dot: `gateway.varity.app.`

### "I can't see the Advanced DNS tab"

The Advanced DNS tab only appears when the domain uses Namecheap's BasicDNS or PremiumDNS nameservers. If your domain uses custom nameservers (e.g. Cloudflare's `ns1.cloudflare.com`), you'll need to manage DNS at that registrar instead.

Check your nameservers on the **Domain** tab → **Nameservers** section.

### "SSL certificate not issued after 1 hour"

If Varity's dashboard still shows "Pending SSL" after propagation:
1. Confirm the CNAME value is exactly `gateway.varity.app` (no trailing dot or spaces)
2. Use [dnschecker.org](https://dnschecker.org) to verify global propagation
3. Re-trigger verification in the Varity dashboard

### "The domain resolves but shows an SSL warning"

Wait up to 5 minutes after DNS propagates for Varity to provision your SSL certificate. If the warning persists beyond 15 minutes, re-check that the CNAME value is correct and retry verification.

### "I accidentally deleted a record"

Namecheap does not provide a self-serve DNS history view. Re-add the correct record manually. If you deleted important email records (MX), contact Namecheap support or re-add them from your email provider's setup guide.

---

## Related Docs

- [Custom Domains overview](/deploy/custom-domains) — subdomain management for varity.app URLs
- [Deployment Troubleshooting](/deploy/deployment-troubleshooting) — general deploy debugging
