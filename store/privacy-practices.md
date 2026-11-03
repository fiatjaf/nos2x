# Privacy practices

Answers for the **Privacy practices** tab of the Chrome Web Store Developer Dashboard. The
dashboard is in English, so the answers are too.

## Single purpose

```
AI Design Singer signs the user in to AI design (app.cadbos.com) with their Nostr key. It stores
the key in the browser and signs only AI design login events (NIP-98, kind 27235) for AI design
sites.
```

## Permission justification

**storage**

```
Stores the user's Nostr key (optionally encrypted with the user's password, NIP-49), the list of
AI design sites the user allowed to sign in, and the interface language. The unlocked key is kept
in session storage, which web pages and content scripts cannot read, until the browser restarts
or the user locks it.
```

**Host permissions** (`https://*.cadbos.com/*`, `https://*.cadbos-cloudflare.workers.dev/*`)

```
The extension adds the "Sign in with AI Design Singer" bridge to AI design pages only:
app.cadbos.com and its subdomains, and the AI design preview deployments under
cadbos-cloudflare.workers.dev that the team uses to test releases. It does not run on any other
site.
```

## Remote code

**No, I am not using remote code.**

```
All JavaScript is bundled in the extension package. The extension does not load or execute code
from any server.
```

## Data usage

**What user data do you plan to collect?** Tick:

- [x] **Authentication information** — the user's Nostr secret key, stored only in the browser,
      and the signed login event sent to AI design when the user signs in.

Leave the other categories unticked: the extension does not collect personally identifiable
information, health, financial, communications, location, web history, user activity or website
content.

**Certifications.** Tick all three:

- [x] I do not sell or transfer user data to third parties, outside of the approved use cases.
- [x] I do not use or transfer user data for purposes that are unrelated to my item's single
      purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

## Privacy policy URL

A public page with the text from [privacy-policy.md](privacy-policy.md), for example
`https://app.cadbos.com/privacy/extension`. The page does not exist yet.
