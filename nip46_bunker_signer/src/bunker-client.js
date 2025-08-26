import { SimplePool, getPublicKey, nip44, finalizeEvent, generateSecretKey } from 'nostr-tools';
import { bytesToHex } from '@noble/hashes/utils';
import { NIP46_KIND, Nip46Methods } from './types.js';

export class BunkerClient {
  constructor(bunkerUrlOrOptions) {
    let options = bunkerUrlOrOptions;
    
    // If string, parse bunker URL
    if (typeof bunkerUrlOrOptions === 'string') {
      const parsed = this.parseBunkerUrl(bunkerUrlOrOptions);
      options = {
        relayUrl: parsed.relay.length > 0 ? parsed.relay : ['wss://relay.damus.io'],
        bunkerPubkey: parsed.pubkey,
        secret: parsed.secret
      };
    }
    
    this.relayUrls = Array.isArray(options.relayUrl) ? options.relayUrl : [options.relayUrl];
    this.bunkerPubkey = options.bunkerPubkey;
    this.secret = options.secret;
    this.isRestoredSession = !!options.clientPrivkey; // Track if this is a restored session
    this.clientPrivkey = options.clientPrivkey || bytesToHex(generateSecretKey());
    this.clientPubkey = getPublicKey(this.clientPrivkey);
    this.appName = options.appName || 'NIP-46 Client';
    this.perms = options.perms;
    this.onAuthChallenge = options.onAuthChallenge; // Callback for auth challenges
    this.pool = new SimplePool();
    this.pendingRequests = new Map();
    this.authChallenges = new Map(); // Store auth challenges by request ID
    this.connected = false;
    this.subscription = null;
  }

  parseBunkerUrl(url) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'bunker:') {
      throw new Error('Invalid bunker URL protocol');
    }
    
    const pubkey = parsed.hostname || parsed.pathname.slice(2);
    const relays = parsed.searchParams.getAll('relay');
    const secret = parsed.searchParams.get('secret');
    
    return { pubkey, relay: relays, secret };
  }

  generateNostrConnectUrl(metadata = {}) {
    const params = new URLSearchParams();
    if (this.relayUrls[0]) params.set('relay', this.relayUrls[0]);
    if (metadata.name) params.set('name', metadata.name);
    if (metadata.url) params.set('url', metadata.url);
    if (metadata.description) params.set('description', metadata.description);
    if (this.perms) params.set('perms', this.perms);
    
    return `nostrconnect://${this.clientPubkey}?${params.toString()}`;
  }

  async connect(secret) {
    await this.setupSubscription();
    
    // Skip connect event for restored sessions
    if (this.isRestoredSession) {
      this.connected = true;
      return 'ack';
    }
    
    // For new sessions, send connect with secret
    const secretToUse = secret || this.secret;
    const request = {
      id: this.generateRequestId(),
      method: Nip46Methods.CONNECT,
      params: secretToUse ? [this.bunkerPubkey, secretToUse] : [this.bunkerPubkey]
    };

    const response = await this.sendRequest(request);
    this.connected = true;
    return response;
  }

  async setupSubscription() {
    const filter = {
      kinds: [NIP46_KIND],
      '#p': [this.clientPubkey],
      since: Math.floor(Date.now() / 1000)
    };

    this.subscription = this.pool.subscribeMany(
      this.relayUrls,
      [filter],
      {
        onevent: async (event) => {
          await this.handleEvent(event);
        }
      }
    );
  }

  async handleEvent(event) {
    try {
      const decryptedContent = await nip44.v2.decrypt(
        event.content,
        nip44.v2.utils.getConversationKey(this.clientPrivkey, this.bunkerPubkey)
      );
      
      const response = JSON.parse(decryptedContent);
      
      if (response.id && this.pendingRequests.has(response.id)) {
        const { resolve, reject } = this.pendingRequests.get(response.id);
        
        // Check for auth_url challenge - don't delete the pending request yet
        if (response.result === 'auth_url' && response.error) {
          // This is an auth challenge, not a final response
          // The app should handle opening the auth URL
          // We keep the pending request alive to wait for the final response
          console.log('Auth challenge received:', response.error);
          
          // Store the auth URL for the request
          if (!this.authChallenges) {
            this.authChallenges = new Map();
          }
          this.authChallenges.set(response.id, response.error);
          
          // Emit an event or callback that the app can handle
          if (this.onAuthChallenge) {
            this.onAuthChallenge(response.error, response.id);
          } else {
            // Default behavior: open in new window
            const authWindow = window.open(response.error, '_blank');
            if (!authWindow) {
              console.error('Failed to open auth window. Please allow popups for this site.');
            }
          }
          // Don't resolve or reject yet - wait for the final response
          // The bunker will send another response with the same ID after auth
          return;
        }
        
        // This is a final response, remove from pending
        this.pendingRequests.delete(response.id);
        
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.result);
        }
      }
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }

  async sendRequest(request) {
    const encryptedContent = await nip44.v2.encrypt(
      JSON.stringify(request),
      nip44.v2.utils.getConversationKey(this.clientPrivkey, this.bunkerPubkey)
    );

    const event = {
      kind: NIP46_KIND,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', this.bunkerPubkey]],
      content: encryptedContent
    };

    const signedEvent = finalizeEvent(event, this.clientPrivkey);
    
    const promise = new Promise((resolve, reject) => {
      this.pendingRequests.set(request.id, { resolve, reject });
      setTimeout(() => {
        if (this.pendingRequests.has(request.id)) {
          this.pendingRequests.delete(request.id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });

    await Promise.allSettled(
      this.pool.publish(this.relayUrls, signedEvent)
    );

    return promise;
  }

  generateRequestId() {
    return Math.random().toString(36).substring(2, 15);
  }

  async getPublicKey() {
    const request = {
      id: this.generateRequestId(),
      method: Nip46Methods.GET_PUBLIC_KEY,
      params: []
    };
    return this.sendRequest(request);
  }

  async signEvent(event) {
    const request = {
      id: this.generateRequestId(),
      method: Nip46Methods.SIGN_EVENT,
      params: [JSON.stringify(event)]
    };
    const result = await this.sendRequest(request);
    return JSON.parse(result);
  }

  async ping() {
    const request = {
      id: this.generateRequestId(),
      method: Nip46Methods.PING,
      params: []
    };
    return this.sendRequest(request);
  }

  async nip04Encrypt(pubkey, plaintext) {
    const request = {
      id: this.generateRequestId(),
      method: Nip46Methods.NIP04_ENCRYPT,
      params: [pubkey, plaintext]
    };
    return this.sendRequest(request);
  }

  async nip04Decrypt(pubkey, ciphertext) {
    const request = {
      id: this.generateRequestId(),
      method: Nip46Methods.NIP04_DECRYPT,
      params: [pubkey, ciphertext]
    };
    return this.sendRequest(request);
  }

  async nip44Encrypt(pubkey, plaintext) {
    const request = {
      id: this.generateRequestId(),
      method: Nip46Methods.NIP44_ENCRYPT,
      params: [pubkey, plaintext]
    };
    return this.sendRequest(request);
  }

  async nip44Decrypt(pubkey, ciphertext) {
    const request = {
      id: this.generateRequestId(),
      method: Nip46Methods.NIP44_DECRYPT,
      params: [pubkey, ciphertext]
    };
    return this.sendRequest(request);
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.close();
    }
    this.pool.close(this.relayUrls);
    this.connected = false;
    this.pendingRequests.clear();
  }
}