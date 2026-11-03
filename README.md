# AI Design Singer

A Chrome extension that signs users in to [AI design](https://app.cadbos.com) with their
Nostr keys. The secret key stays in the browser: AI design only ever receives the public
key and a signed login event.

The extension is built for AI design only. It runs on AI design origins, signs nothing but
AI design login events, and turns every other request away.

## What the user gets

- **Add the AI design key**: accounts are created in AI design; paste the `nsec`, a
  password-protected `ncryptsec`, or upload the key file AI design produces, and optionally
  protect the key with a password. AI design can also hand a new key over after confirmation.
- **One-click sign-in**: the first sign-in from a site asks once; later sign-ins need no
  confirmation (and only the password after a browser restart, if one is set).
- **Settings**: copy the public key, download the key file, set, change or remove the
  password, revoke allowed sites, remove the key.
- Russian and English interface, light and dark theme.

## How AI design talks to the extension

On AI design origins the extension injects a provider before the page's own scripts run. It
exposes the standard [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md)
`window.nostr`, and the same signer under its own name with the calls that hand account
setup over between the app and the extension:

```ts
window.aiDesignSigner.status(): Promise<{ hasAccount: boolean; locked: boolean }>;
window.aiDesignSigner.getPublicKey(): Promise<string>; // hex
window.aiDesignSigner.signEvent(event): Promise<Event>; // NIP-98 login events only
window.aiDesignSigner.openOnboarding(): Promise<null>; // opens onboarding to add a key
window.aiDesignSigner.importKey(secretKeyHex): Promise<string>; // saves an app-made key
```

Failed calls reject with an error whose `code` is one of `no_account`, `account_exists`,
`locked`, `rejected`, `forbidden_origin`, `invalid_event`, `invalid_key`, `busy`, `internal`.
When a key is added or removed, the extension dispatches `ai-design-signer:accountchange` on
`window`, so the app can sign in as soon as setup finishes in another tab.

## Security model

- **Origins.** The provider and every request are limited to `*.cadbos.com` (production is
  `app.cadbos.com`) and Worker previews under `*.cadbos-cloudflare.workers.dev`. Development builds also
  accept `localhost` and `127.0.0.1`.
- **What gets signed.** Only kind 27235 (NIP-98) events with empty content, a `method` tag,
  a `u` tag on the requesting origin and a timestamp within ten minutes of now.
- **Key storage.** One account per browser profile in `chrome.storage.local`: the key in
  plain hex, or as a NIP-49 `ncryptsec` when a password is set. An unlocked key lives in
  `chrome.storage.session`, which content scripts cannot read, until the browser restarts or
  the user locks it.
- **Confirmations.** First sign-ins, unlocking and saving an app-made key are confirmed in an
  extension window. A key saved from a site never overwrites an existing one, and the prompt
  window only ever receives the public key.

## Install from a release

1. Download
   [`ai_design-signer.zip`](https://github.com/cadbos/nostr-signer-browser_extension/releases/latest/download/ai_design-signer.zip)
   from the latest release and unzip it.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the unzipped folder.

Extensions loaded this way do not update themselves: to update, remove the extension and load
the new release the same way.

## Release

Bump `version` in `package.json`, merge, then push a matching tag (`v0.1.0` for `0.1.0`). The
[release workflow](.github/workflows/release.yml) runs the tests, builds the extension and
attaches `ai_design-signer.zip` to a GitHub release.

## Install from source

Requirements: Node.js 22+ and pnpm 10.

```bash
pnpm install
pnpm build
```

Then open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and
select the `dist/` folder.

## Develop

```bash
pnpm dev     # rebuilds dist/ on change, with localhost allowed for `pnpm dev` in cadbos
pnpm test    # svelte-check, prettier, vitest
pnpm format  # prettier --write
```

After a rebuild, reload the extension on `chrome://extensions`. The stack is Svelte 5
(runes), TypeScript, Vite and nostr-tools; the manifest is generated from
[`src/manifest.ts`](src/manifest.ts).

```
src/
  background/   service worker: request policy, prompts, onboarding hand-off
  content/      provider (page world) and bridge (isolated world)
  lib/          keystore, approvals, policy, i18n, shared UI
  pages/        popup, onboarding, prompt and settings pages
public/         icons and _locales for the store listing
```

## License

Business Source License 1.1, see [LICENSE](LICENSE). The source is public: you may read,
modify and redistribute it for non-production use, and use the extension in production only to
sign in to AI design services operated by Cadbos company. On 2030-07-01 it becomes available under
the GNU GPL version 3.0 or later. This project started as a fork of
[nos2x](https://github.com/fiatjaf/nos2x) (public domain) and has since been rewritten.
