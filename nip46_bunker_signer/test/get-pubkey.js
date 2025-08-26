import { BunkerClient } from '../src/index.js';

const bunkerUrl = 'bunker://a1fe3664f7a2b24db97e5b63869e8011c947f9abd8c03f98befafd27c38467d2?relay=wss://relay.damus.io&relay=wss://relay.nostr.band&relay=wss://relay.nsec.app&secret=devsecret123';

const client = new BunkerClient(bunkerUrl);

console.log('Local private key:', client.clientPrivkey);
console.log('Bunker pubkey:', client.bunkerPubkey);
console.log('Relays:', client.relayUrls);

await client.connect();
const pubkey = await client.getPublicKey();
console.log('Remote pubkey:', pubkey);

client.disconnect();
