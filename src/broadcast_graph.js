import { auto } from "async";
import {
  validateEvent,
  verifySignature,
  signEvent,
  getEventHash,
  relayInit,
} from "nostr-tools";

const broadcastGraph = async ({ graph, kind }) => {
  return await auto({
    buildEvent: async () => {
      let privKey = process.env.PRIVATE_KEY;

      let event = {
        kind,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify(graph),
        pubkey: process.env.PUBLIC_KEY,
      };

      event.id = getEventHash(event);
      event.sig = signEvent(event, privKey);

      let ok = validateEvent(event);
      console.log("Event is valid:", ok);

      let veryOk = verifySignature(event);
      console.log("Event signature is valid:", veryOk);

      return { event };
    },

    broadcastEvent: [
      "buildEvent",
      async ({ buildEvent }) => {
        const { event } = buildEvent;

        const relay = relayInit(process.env.RELAY);
        relay.on("connect", () => {
          console.log(`connected to ${relay.url}`);
        });
        relay.on("error", () => {
          console.log(`failed to connect to ${relay.url}`);
        });

        await relay.connect();

        let pub = relay.publish(event);
        pub.on("ok", () => {
          console.log(`${relay.url} has accepted our event`);
        });
        pub.on("failed", (reason) => {
          console.log(`failed to publish to ${relay.url}: ${reason}`);
        });
      },
    ],
  });
};

export default broadcastGraph;
