import browser from 'webextension-polyfill';
import { BunkerClient } from '../nip46_bunker_signer/src/index.js';

export async function deleteBunkerConnection() {
    await browser.storage.local.clear();
}

export async function loadBunkerConnection() {
    const localStorage = await browser.storage.local.get()
    const canRestoreSession = localStorage.bunker_url !== undefined && localStorage.local_privkey !== undefined;
    if (!canRestoreSession) return;

    // Parse the bunker URL properly
    const url = new URL(localStorage.bunker_url);
    const relays = url.searchParams.getAll('relay');
    const bunkerPubkey = url.hostname || url.pathname.slice(2);
    const secret = url.searchParams.get('secret');
    
    const signer = new BunkerClient({
        relayUrl: relays.length > 0 ? relays : ['wss://relay.damus.io'],
        bunkerPubkey: bunkerPubkey,
        clientPrivkey: localStorage.local_privkey,
        secret: secret,
        onAuthChallenge: (authUrl, requestId) => {
            alert(`Authentication required for bunker connection.\n\nPlease visit:\n${authUrl}\n\nOpen this URL in a new tab to authenticate.`);
        }
    });

    await signer.connect();

    global.signer = signer;
}

export async function createBunkerSession() {
    const bunkerUrl = prompt('Paste your bunker url');
    if (!bunkerUrl) return false;

    // Parse the bunker URL first
    const url = new URL(bunkerUrl);
    const relays = url.searchParams.getAll('relay');
    const bunkerPubkey = url.hostname || url.pathname.slice(2);
    const secret = url.searchParams.get('secret');
    
    const client = new BunkerClient({
        relayUrl: relays.length > 0 ? relays : ['wss://relay.damus.io'],
        bunkerPubkey: bunkerPubkey,
        secret: secret,
        onAuthChallenge: (authUrl, requestId) => {
            alert(`Authentication required for bunker connection.\n\nPlease visit:\n${authUrl}\n\nOpen this URL in a new tab to authenticate.`);
        }
    });
    await client.connect();

    // Store both bunker URL and client privkey for session restoration
    await browser.storage.local.set({
        bunker_url: bunkerUrl,
        local_privkey: client.clientPrivkey,
    });

    // Set global signer to make it available
    global.signer = client;

    return true;
}
