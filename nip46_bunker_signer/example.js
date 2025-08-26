import { BunkerClient } from './src/index.js';

async function main() {
  // Parse bunker URL
  const bunkerUrl = 'bunker://a1fe3664f7a2b24db97e5b63869e8011c947f9abd8c03f98befafd27c38467d2?relay=wss://relay.damus.io&relay=wss://relay.nostr.band&relay=wss://relay.nsec.app&secret=devsecret123';
  
  // Extract components from URL
  const url = new URL(bunkerUrl);
  const bunkerPubkey = url.hostname || url.pathname.slice(2);
  const relays = url.searchParams.getAll('relay');
  const secret = url.searchParams.get('secret');
  
  console.log('Bunker pubkey:', bunkerPubkey);
  console.log('Relays:', relays);
  console.log('Secret:', secret);

  // Initialize client with extracted info
  const client = new BunkerClient({
    relayUrl: relays,
    bunkerPubkey: bunkerPubkey,
    appName: 'NIP-46 Test Client',
    perms: 'sign_event,get_public_key,nip04_encrypt,nip04_decrypt,nip44_encrypt,nip44_decrypt'
  });

  console.log('Client pubkey:', client.clientPubkey);
  console.log('NostrConnect URL:', client.generateNostrConnectUrl({
    name: 'Test App',
    url: 'https://example.com',
    description: 'Testing NIP-46 bunker connection'
  }));

  try {
    // Connect to bunker with secret
    console.log('\nConnecting to bunker...');
    const connectResponse = await client.connect(secret);
    console.log('Connected! Response:', connectResponse);

    // Ping test
    console.log('\nSending ping...');
    const pong = await client.ping();
    console.log('Ping response:', pong);

    // Get public key
    console.log('\nGetting public key...');
    const pubkey = await client.getPublicKey();
    console.log('User public key:', pubkey);

    // Sign a test event
    console.log('\nSigning event...');
    const event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: 'Test message from NIP-46 client'
    };
    
    const signedEvent = await client.signEvent(event);
    console.log('Signed event:', signedEvent);

    // Test NIP-44 encryption (if another pubkey is available)
    if (pubkey) {
      console.log('\nTesting NIP-44 encryption...');
      const plaintext = 'Secret test message';
      const encrypted = await client.nip44Encrypt(pubkey, plaintext);
      console.log('Encrypted message:', encrypted);
      
      const decrypted = await client.nip44Decrypt(pubkey, encrypted);
      console.log('Decrypted message:', decrypted);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.disconnect();
    console.log('\nDisconnected from bunker');
  }
}

// Run the example
main().catch(console.error);