# nos2x
### notes and other stuff signed by an extension

## Nostr Signer Extension

This allows you to sign [Nostr](https://github.com/fiatjaf/nostr) events on web-apps without having to give them your keys.

It provides a `window.nostr` object which has the following methods:

```
async window.nostr.getPublicKey(): string // returns your public key as hex
async window.nostr.signEvent(event): string // returns the signature as hex
async window.nostr.nip04.encrypt(pubkey, plaintext): string // returns ciphertext+iv as specified in nip04
async window.nostr.nip04.decrypt(pubkey, ciphertext): string // takes ciphertext+iv as specified in nip04
```

## Demo Video

https://user-images.githubusercontent.com/1653275/149637382-65d50a85-fe30-4259-b7de-99c88b089b53.mp4

## Install

* [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/nos2x/)
* [Chrome Extension](https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp)
* `git clone https://github.com/fiatjaf/nos2x && cd nos2x && yarn && yarn run build` then load as unpackaged on chrome://extensions with "developer mode" enabled

## Screenshots

![](screenshot1.png)
![](screenshot2.png)
![](screenshot3.png)
![](screenshot4.png)

---

LICENSE: public domain.

Icon made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>.
