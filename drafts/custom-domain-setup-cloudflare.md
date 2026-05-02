# Custom Domain Setup: Cloudflare

Connect your domain (e.g. `app.yourcompany.com`) to your Varity deployment using Cloudflare's DNS management.

> **Status:** Draft — for internal review. Publish when the custom domains feature ships.

---

## What You'll Need

- A domain managed through Cloudflare (e.g. `yourcompany.com`)
- A Varity account with at least one deployed app
- Your app's gateway address from the Varity dashboard (e.g. `my-app.gateway.varity.app`)

---

## Step-by-Step: Add a CNAME Record

### 1. Log in to Cloudflare

Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign in.

> **Screenshot placeholder:** Cloudflare login screen — dark background, orange "Log in" button, email + password fields.

### 2. Select Your Domain

On the **Home** screen, you'll see a list of your domains ("zones"). Click the domain you want to use (e.g. `yourcompany.com`).

> **Screenshot placeholder:** Cloudflare home — list of domains as cards showing status indicators (Active, green checkmark) and plan type.

### 3. Go to DNS Settings

In the left sidebar, click **DNS** → **Records**.

> **Screenshot placeholder:** Cloudflare sidebar — icons for Overview, Analytics, DNS, Email, Speed, Security, etc. DNS is selected, showing "Records" sub-item.

### 4. Add a New CNAME Record

Click **Add record** (blue button, top right of the records table).

Fill in the fields:

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Name** | `app` |
| **Target** | `gateway.varity.app` |
| **Proxy status** | DNS only (gray cloud) |
| **TTL** | Auto |

> **Important:** Set **Proxy status to "DNS only" (gray cloud icon)**, not "Proxied" (orange cloud). Varity provisions SSL automatically — Cloudflare proxying can interfere with certificate validation.

> **Screenshot placeholder:** "Add record" form — dropdown showing "CNAME", Name field with "app", Target field with "gateway.varity.app", Proxy status toggle showing gray cloud (DNS only), TTL set to Auto.

Click **Save**.

### 5. Verify the Record Appears

You should now see a row in the DNS records table:

```
Type    Name    Content                  Proxy status    TTL
CNAME   app     gateway.varity.app       DNS only        Auto
```

> **Screenshot placeholder:** DNS records table with the new CNAME row highlighted. Gray cloud icon visible in the Proxy status column.

### 6. Add Your Domain in Varity

In your Varity dashboard:
1. Go to your app's **Settings** tab
2. Under **Custom Domain**, enter `app.yourcompany.com`
3. Click **Add Domain**

Varity will verify the DNS record and begin SSL provisioning.

---

## How Long Until It Works?

Cloudflare DNS propagates within **1–5 minutes** for most zones. In rare cases it can take up to 30 minutes.

To check propagation before Varity verifies: use [dnschecker.org](https://dnschecker.org) and search for `app.yourcompany.com` with record type `CNAME`.

---

## Common Errors & Fixes

### "CNAME record conflicts with an existing record"

You already have an A record or another CNAME for `app`. Delete the conflicting record first, then re-add the CNAME.

**Fix:** In Cloudflare DNS → Records, find the conflicting row (look for `app` in the Name column), click **Edit** → **Delete**, then add your new CNAME.

### "SSL certificate not issued after 10 minutes"

If Varity is showing "Pending SSL" after propagation, check:
- Proxy status is set to **gray cloud (DNS only)** — orange cloud (proxied) blocks Varity's validation
- The CNAME target is exactly `gateway.varity.app` with no trailing dot or space

### "I see a Cloudflare error page when I visit the domain"

This usually means the record is proxied (orange cloud) and Cloudflare is blocking the connection. Switch proxy status to **DNS only** and wait 1–2 minutes.

### "The domain works but shows a certificate warning"

SSL can take up to 5 minutes to provision after DNS propagates. Wait and try again. If the warning persists after 15 minutes, re-check that Proxy status is set to DNS only.

### "I set up the CNAME but Varity says it can't find the record"

Wait 5 minutes and retry verification in the Varity dashboard. If still failing, confirm the record at [dnschecker.org](https://dnschecker.org).

---

## Related Docs

- [Custom Domains overview](/deploy/custom-domains) — subdomain management for varity.app URLs
- [Deployment Troubleshooting](/deploy/deployment-troubleshooting) — general deploy debugging
