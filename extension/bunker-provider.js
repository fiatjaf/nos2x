import browser from 'webextension-polyfill';
import { BunkerClient } from '../nip46_bunker_signer/src/index.js';

export async function deleteBunkerConnection() {
    await browser.storage.local.clear();
}

export async function loadBunkerConnection() {
    const localStorage = await browser.storage.local.get()
    console.log(localStorage.bunker_url)
    console.log(localStorage.local_privkey)
    const canRestoreSession = localStorage.bunker_url !== undefined && localStorage.local_privkey !== undefined;
    console.log({ canRestoreSession })
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
            console.log('Auth challenge for request:', requestId);
            window.open(authUrl, '_blank');
        }
    });

    await signer.connect();
    console.log("connected to bunker")

    global.signer = signer;
}

export async function createBunkerSession() {
    alert("aaaaaaaaa")
    console.log("aaaaaaaaaa")
    const bunkerUrl = prompt('Paste your bunker url');
    console.log(bunkerUrl)
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
            console.log('Auth challenge for request:', requestId);
            alert('Please authenticate in the new window that will open');
            window.open(authUrl, '_blank');
        }
    });
    console.log("ici")
    await client.connect();
    console.log("la")

    // Store both bunker URL and client privkey for session restoration
    await browser.storage.local.set({
        bunker_url: bunkerUrl,
        local_privkey: client.clientPrivkey,
    });

    const localStorage = await browser.storage.local.get()
    console.log(localStorage)
    alert("localStorage")

    // Set global signer to make it available
    global.signer = client;

    // Keep connection alive - don't disconnect
    console.log("Bunker session created and active");

    return true;
}
