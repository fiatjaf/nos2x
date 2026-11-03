# Review and distribution

## Before submitting

- [ ] The AI design PR with "Sign in with AI Design Singer" is deployed to app.cadbos.com.
      Reviewers test the extension on the live site; without the button they cannot use it.
- [ ] The privacy policy page is published and its URL is entered in the dashboard.
- [ ] The release zip of the version being submitted is built by the release workflow
      (`ai_design-signer.zip` from the GitHub release).
- [ ] Developer account: registration fee paid, publisher name and contact email set, trader
      status declared.

## Package

Upload `ai_design-signer.zip` from the GitHub release of the version being submitted. Every
later upload needs a higher `version` in `package.json`.

## Test instructions for reviewers

Enter in the **Test instructions** tab. No test account is needed: reviewers create one in the
extension.

```
No credentials are needed: accounts are created in AI design.

1. Install the extension and open https://app.cadbos.com. Click "Guest" in the top right
   corner, then "Sign in or sign up" and "Create account". Click "Generate keys", download
   the key file, tick the three confirmations and click "Next".
2. On "Import the secret key" click "Import into AI Design Singer and sign in" and approve
   saving the key in the extension window (a password is optional). The site shows you as
   signed in.
3. Alternatively: open the extension's onboarding ("Get started" in the toolbar popup),
   choose "Add a key" and upload the downloaded key file. Then in AI design choose
   "Sign in or sign up" → "Sign in" → "Sign in with AI Design Singer" and approve the request.
4. Optional: click the extension icon to see the public key and lock it; signing in again
   asks for the password (if one was set).
5. Settings (right-click the icon → Options) let you download the key file, manage the
   password, revoke site permissions and remove the key.

The extension only runs on cadbos.com and AI design preview deployments and only signs
AI design login events.
```

## Distribution

| Field      | Recommendation                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visibility | **Unlisted** for the first release: installable by the link from the AI design sign-in dialog, not shown in search. Switch to **Public** once it is proven. |
| Regions    | All regions                                                                                                                                                 |
| Pricing    | Free                                                                                                                                                        |

## After approval

- Replace the GitHub download link in the AI design install dialog with the Chrome Web Store
  link (the GitHub release can stay as a fallback).
- People who installed the zip from GitHub get a different extension ID from the store version:
  they need to download their key file in the old extension's settings, then import it into
  the store version.
