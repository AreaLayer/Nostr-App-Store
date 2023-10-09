import {
  verifySignature,
  validateEvent,
  type Event,
  matchFilters,
  type Filter,
  getHex64,
  getSubscriptionId,
  MessageQueue,
} from 'nostr-tools';

const event = {
  eventId: 'kind:31990,',
  timestamp: Date.now(),
  payload: { data: 'app' },
  // ...
};

const relay = {
 
  relayId: 'damus',
  endpoint: 'wss://relay.damus.io',

  relayid: 'mutiny',
  endpoint: 'wss://nostr.mutinywallet.com',

};

  
   


