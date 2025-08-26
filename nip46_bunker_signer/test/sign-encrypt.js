import { BunkerClient } from '../src/index.js';

const bunkerUrl = 'bunker://a1fe3664f7a2b24db97e5b63869e8011c947f9abd8c03f98befafd27c38467d2?relay=wss://relay.damus.io&relay=wss://relay.nostr.band&relay=wss://relay.nsec.app&secret=devsecret123';

const client = new BunkerClient(bunkerUrl);

console.log('Connecting...');
await client.connect();

// Get public key
const pubkey = await client.getPublicKey();
console.log('\n=== Public Key ===');
console.log('Remote pubkey:', pubkey);

// Sign an event
console.log('\n=== Signing Event ===');
const event = {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'Test message from NIP-46 client'
};

const signedEvent = await client.signEvent(event);
console.log('Signed event:', signedEvent);

// Test NIP-44 encryption/decryption
console.log('\n=== NIP-44 Encryption ===');
const plaintext = 'Secret message for testing';
const encrypted = await client.nip44Encrypt(pubkey, plaintext);
console.log('Encrypted:', encrypted);

const decrypted = await client.nip44Decrypt(pubkey, encrypted);
console.log('Decrypted:', decrypted);

// Test NIP-04 encryption/decryption
console.log('\n=== NIP-04 Encryption ===');
const plaintext2 = 'Another secret message';
const encrypted2 = await client.nip04Encrypt(pubkey, plaintext2);
console.log('Encrypted:', encrypted2);

const decrypted2 = await client.nip04Decrypt(pubkey, encrypted2);
console.log('Decrypted:', decrypted2);

client.disconnect();
console.log('\nDisconnected');