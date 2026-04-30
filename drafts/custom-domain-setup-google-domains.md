# Custom Domain Setup: Google Domains / Squarespace Domains

Connect your domain (e.g. `app.yourcompany.com`) to your Varity deployment using Google Domains or Squarespace Domains DNS management.

> **Status:** Draft — for internal review. Publish when the custom domains feature ships.

---

> **Note on the Google → Squarespace transition:** Google sold Google Domains to Squarespace in 2023. Most domains were migrated to Squarespace Domains by mid-2024. If you purchased your domain on Google Domains, you're likely now managing it at [domains.squarespace.com](https://domains.squarespace.com). The DNS steps are nearly identical — both interfaces are covered below.

---

## What You'll Need

- A domain managed through Google Domains or Squarespace Domains (e.g. `yourcompany.com`)
- A Varity account with at least one deployed app
- Your app's gateway address from the Varity dashboard (e.g. `my-app.gateway.varity.app`)

---

## Option A: Squarespace Domains (current interface)

Most Google Domains users now manage their domains here.

### 1. Log in to Squarespace Domains

Go to [domains.squarespace.com](https://domains.squarespace.com) and sign in with your Google account or Squarespace credentials.

> **Screenshot placeholder:** Squarespace Domains login — white background, Squarespace logo, "Continue with Google" button (prominent) + email/password option below.

### 2. Open Your Domain

On the **Domains** dashboard, click the domain you want to use.

> **Screenshot placeholder:** Squarespace Domains dashboard — list of domains as rows with domain name, status ("Active"), and "Manage" link.

### 3. Go to DNS Settings

In the left sidebar (or under the domain details), click **DNS** → **DNS Settings** (or **Custom Records**).

> **Screenshot placeholder:** Domain details page — sidebar with tabs: Overview, DNS, Email, Security, Advanced. DNS tab selected, showing DNS settings page.

### 4. Add a CNAME Record

Scroll to the **Custom Records** section. Click **Add Record** (or **+ Add custom record**).

Fill in the fields:

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Host name** | `app` |
| **Data** | `gateway.varity.app` |
| **TTL** | 3600 (1 hour, or leave default) |

> **Screenshot placeholder:** "Add Record" form — Type dropdown showing CNAME, Host name field with "app", Data field with "gateway.varity.app", TTL showing 3600.

Click **Save**.

### 5. Verify the Record

The record should appear in the Custom Records table:

```
Type    Host name    Data                     TTL
CNAME   app          gateway.varity.app       3600
```

---

## Option B: Original Google Domains Interface

If you still have access to the legacy Google Domains interface at [domains.google](https://domains.google):

### 1. Sign In

Go to [domains.google](https://domains.google) and sign in with your Google account.

> **Screenshot placeholder:** Google Domains — Google-branded design, domain list showing your registered domains with status badges.

### 2. Open DNS for Your Domain

Click the domain name, then select **DNS** from the left sidebar.

### 3. Add a Custom Record

Scroll to **Custom records** and click **Manage custom records** → **Create new record**.

| Field | Value |
|-------|-------|
| **Host name** | `app` |
| **Type** | `CNAME` |
| **TTL** | 3600 |
| **Data** | `gateway.varity.app` |

Click **Save**.

---

## Add Your Domain in Varity

After saving the DNS record (either interface):

1. Go to your app's **Settings** tab in the Varity dashboard
2. Under **Custom Domain**, enter `app.yourcompany.com`
3. Click **Add Domain**

Varity will verify the DNS record and begin SSL provisioning.

---

## How Long Until It Works?

Google Domains / Squarespace Domains DNS typically propagates within **1–2 hours**, though it can take up to 48 hours in rare cases.

To check propagation: use [dnschecker.org](https://dnschecker.org) and search for `app.yourcompany.com` with record type `CNAME`. When most locations show `gateway.varity.app`, your DNS has propagated.

---

## Common Errors & Fixes

### "I can't log in with my Google account on Squarespace Domains"

If the Google account you used for Google Domains isn't recognized:
1. Try signing in with just the email + password at [domains.squarespace.com](https://domains.squarespace.com)
2. If you never set a Squarespace password, use **Forgot password** with your Google email
3. If you still can't access it, contact Squarespace support — domain migration issues are common

### "I don't see my domain on Squarespace Domains"

Your domain may not have been migrated yet, or the migration may have been rejected. Try logging into [domains.google](https://domains.google) first. If your domain still exists there, manage DNS from the Google Domains interface using Option B above.

### "There's already a CNAME or A record for 'app'"

Delete the conflicting record before adding yours. In the Custom Records section, find the row with Host name `app` and click the trash icon (delete). Then add your new CNAME.

### "SSL certificate not issued after 2 hours"

If Varity's dashboard still shows "Pending SSL" after propagation:
1. Confirm the Data field is exactly `gateway.varity.app` (no trailing dot or spaces)
2. Use [dnschecker.org](https://dnschecker.org) to verify global propagation
3. Re-trigger verification in the Varity dashboard

### "The domain resolves but shows an SSL warning"

Wait up to 5 minutes after DNS propagates for Varity to provision your SSL certificate. If the warning persists beyond 15 minutes, re-check that the CNAME value is correct and retry verification.

### "My email stopped working after I added the DNS record"

Adding a CNAME for `app` should not affect email (which uses MX records on the root domain `@`). If email is broken, check that you didn't accidentally edit or delete an MX or TXT (SPF/DKIM) record. Review the DNS records list and restore any missing mail records.

---

## Related Docs

- [Custom Domains overview](/deploy/custom-domains) — subdomain management for varity.app URLs
- [Deployment Troubleshooting](/deploy/deployment-troubleshooting) — general deploy debugging
