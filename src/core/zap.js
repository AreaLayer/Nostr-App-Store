const Nostr = require('nostr-js');
const { LndNode } = require('lightning');
const {
  nip19,
  nip57,
  relayInit,
  generatePrivateKey,
  finishEvent,
  SimplePool,
} = require('nostr-tools');

export const decodeNpub = (npub) => nip19.decode(npub).data;

const decodeNoteId = (noteId) => nip19.decode(noteId).data;

let cachedProfileMetadata = {};

export const getProfileMetadata = async (authorId) => {
  if (cachedProfileMetadata[authorId]) {
    return cachedProfileMetadata[authorId];
  }

  const metadata = await new Promise((resolve, reject) => {
    const relay = relayInit('wss://relay.nostr.band');

    relay.on('connect', async () => {
      console.log(`connected to ${relay.url}`);

      const metadata = await relay.get({
        authors: [authorId],
        kinds: [0],
      });

      cachedProfileMetadata[authorId] = metadata;
      resolve(metadata);
      relay.close();
    });

    relay.on('error', () => {
      reject(`failed to connect to ${relay.url}`);
      relay.close();
    });

    relay.connect();
  });

  if (!metadata) {
    throw new Error('failed to fetch user profile :(');
  }

  return metadata;
};

export const extractProfileMetadataContent = (profileMetadata) =>
  JSON.parse(profileMetadata.content);

export const getZapEndpoint = async (profileMetadata) => {
  const zapEndpoint = await nip57.getZapEndpoint(profileMetadata);

  if (!zapEndpoint) {
    throw new Error('failed to retrieve zap endpoint :(');
  }

  return zapEndpoint;
};

const signEvent = async (zapEvent) => {
  if (isNipO7ExtAvailable()) {
    try {
      return await window.nostr.signEvent(zapEvent);
    } catch (e) {
      // fail silently and sign event as an anonymous user
    }
  }

  return finishEvent(zapEvent, generatePrivateKey());
};

const makeZapEvent = async ({ profile, event, amount, relays, comment }) => {
  const zapEvent = nip57.makeZapRequest({
    profile,
    event,
    amount,
    relays,
    comment,
  });

  return signEvent(zapEvent);
};

export const fetchInvoice = async ({
  zapEndpoint,
  amount,
  comment,
  authorId,
  noteId,
  normalizedRelays,
}) => {
  const zapEvent = await makeZapEvent({
    profile: authorId,
    event: noteId ? decodeNoteId(noteId) : undefined,
    amount,
    relays: normalizedRelays,
    comment,
  });
  let url = `${zapEndpoint}?amount=${amount}&nostr=${encodeURIComponent(
    JSON.stringify(zapEvent)
  )}`;

  if (comment) {
    url = `${url}&comment=${encodeURIComponent(comment)}`;
  }

  const res = await fetch(url);
  const { pr: invoice } = await res.json();

  return invoice;
};

export const isNipO7ExtAvailable = () => {
  return window !== undefined && window.nostr !== undefined;
};

export const listenForZapReceipt = ({ relays, invoice, onSuccess }) => {
  const pool = new SimplePool();
  const normalizedRelays = Array.from(
    new Set([...relays, 'wss://relay.nostr.band'])
  );
  const closePool = () => {
    if (pool) {
      pool.close(normalizedRelays);
    }
  };
  const since = Math.round(Date.now() / 1000);

  // check for zap receipt every 5 seconds
  const intervalId = setInterval(() => {
    const sub = pool.sub(normalizedRelays, [
      {
        kinds: [9735],
        since,
      },
    ]);

    sub.on('event', (event) => {
      if (event.tags.find((t) => t[0] === 'bolt11' && t[1] === invoice)) {
        onSuccess();
        closePool();
        clearInterval(intervalId);
      }
    });
  }, 5000);

  return () => {
    closePool();
    clearInterval(intervalId);
  };
};

// Create a Nostr instance
const nostr = new Nostr();

// Create a Lightning Network node instance
const lnd = new LndNode({
  rpc: {
    server: 'localhost:10009', // Replace with your LND RPC server details
    cert: '/path/to/tls.cert', // Replace with the path to your LND TLS certificate
    macaroon: '/path/to/admin.macaroon', // Replace with the path to your LND admin macaroon
  },
});

// Connect to the Lightning Network node
lnd.connect();

// Handle incoming Nostr messages
nostr.on('message', async (message) => {
  console.log('Received message:', message);

  // Process the message and respond
  const response = await processMessage(message);

  // Send the response back via Nostr
  nostr.send(response);
});

// Function to process incoming messages
async function processMessage(message) {
  // Add your logic to handle the received message here
  // You can interact with the Lightning Network node using the 'lnd' instance

  // Example: Get the node info
  const nodeInfo = await lnd.getNodeInfo();
  return `My node ID: ${nodeInfo.node.pub_key}`;
}
