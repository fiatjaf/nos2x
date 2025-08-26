import { BunkerClient } from '../src/index.js';

const client = new BunkerClient({
  relayUrl: ['wss://relay.damus.io', 'wss://relay.nostr.band', 'wss://relay.nsec.app'],
  bunkerPubkey: 'a1fe3664f7a2b24db97e5b63869e8011c947f9abd8c03f98befafd27c38467d2',
  clientPrivkey: "c35a68a4ea49bc1ce5bab8f38e667dd0e3e071b2d779e79ddfd7d634f83b7422",
});

await client.connect()

const pubkey = await client.getPublicKey();
console.log('Remote pubkey:', pubkey);
