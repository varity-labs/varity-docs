# Custom Domain Setup: GoDaddy

Connect your domain (e.g. `app.yourcompany.com`) to your Varity deployment using GoDaddy's DNS management.

> **Status:** Draft — for internal review. Publish when the custom domains feature ships.

---

## What You'll Need

- A domain registered with GoDaddy (e.g. `yourcompany.com`)
- A Varity account with at least one deployed app
- Your app's gateway address from the Varity dashboard (e.g. `my-app.gateway.varity.app`)

---

## Step-by-Step: Add a CNAME Record

### 1. Log in to GoDaddy

Go to [godaddy.com](https://godaddy.com) and sign in to your account.

> **Screenshot placeholder:** GoDaddy login page — white background, black GoDaddy logo, username and password fields, green "Sign In" button.

### 2. Open Your Domain's DNS Settings

1. In the top navigation, click your account name → **My Products**
2. Find the domain you want to use and click **DNS** (or the three-dot menu → **Manage DNS**)

> **Screenshot placeholder:** GoDaddy "My Products" page — list of domains with "DNS" button visible to the right of each row.

### 3. Scroll to DNS Records

You'll see the DNS Records section with existing records (usually an A record pointing to GoDaddy's parking page, MX records, etc.).

> **Screenshot placeholder:** GoDaddy DNS management page — table of existing DNS records (Type, Name, Value, TTL columns), blue "Add" button at top.

### 4. Add a New CNAME Record

Click **Add** (blue button above the records table).

A form will appear. Fill in:

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Name** | `app` |
| **Value** | `gateway.varity.app` |
| **TTL** | 1 Hour (default) |

> **Screenshot placeholder:** GoDaddy "Add Record" form — dropdown set to CNAME, Name field showing "app", Value field showing "gateway.varity.app", TTL showing "1 Hour".

Click **Save** to confirm.

### 5. Verify the Record Appears

The new record should appear in the DNS Records table:

```
Type    Name    Value                    TTL
CNAME   app     gateway.varity.app       1 Hour
```

> **Screenshot placeholder:** GoDaddy DNS Records table showing the new CNAME row.

### 6. Add Your Domain in Varity

In your Varity dashboard:
1. Go to your app's **Settings** tab
2. Under **Custom Domain**, enter `app.yourcompany.com`
3. Click **Add Domain**

Varity will verify the DNS record and begin SSL provisioning.

---

## How Long Until It Works?

GoDaddy DNS typically propagates within **30 minutes to 2 hours**, though it can take up to 48 hours in rare cases.

To check propagation: use [dnschecker.org](https://dnschecker.org) and search for `app.yourcompany.com` with record type `CNAME`. When most locations show `gateway.varity.app`, your DNS has propagated.

---

## Common Errors & Fixes

### "I can't find the DNS section"

GoDaddy's UI changes periodically. Try:
- **My Products** → find your domain → click **DNS** button
- Or go to **Domains** → **All Domains** → click your domain name → **DNS** tab

### "CNAME record already exists for that name"

You have an existing record at `app`. Delete it first:
1. Find the row with Name `app` in the records table
2. Click the pencil icon (Edit) or the trash icon (Delete)
3. Confirm deletion, then add your new CNAME

### "GoDaddy shows an error when I save the record"

GoDaddy rejects CNAME records that conflict with MX or NS records. The subdomain `app` usually doesn't conflict — but if you get an error, check that no other record with the same name exists.

### "SSL certificate not issued after 2 hours"

If Varity's dashboard still shows "Pending SSL" after propagation:
1. Confirm the CNAME value is exactly `gateway.varity.app` (no trailing dot or spaces)
2. Use [dnschecker.org](https://dnschecker.org) to verify global propagation
3. Re-trigger verification in the Varity dashboard

### "The domain resolves but shows an SSL warning"

Wait up to 5 minutes after DNS propagates for Varity to provision your SSL certificate. If the warning persists beyond 15 minutes, check the CNAME value is correct and retry verification.

### "I deleted a record accidentally"

GoDaddy does not have a built-in DNS change history view. Re-add the correct record manually. If you deleted an important record (like MX for email), contact GoDaddy support to restore it from their backups.

---

## Related Docs

- [Custom Domains overview](/deploy/custom-domains) — subdomain management for varity.app URLs
- [Deployment Troubleshooting](/deploy/deployment-troubleshooting) — general deploy debugging
