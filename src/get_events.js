import { auto } from "async";
import { relayInit } from "nostr-tools";
import addGossipCln from "../add_gossip_cln.js";

const getEvents = async ({}) => {
  const pk = process.env.PUBLIC_KEY;

  const relay = relayInit(process.env.RELAY);
  relay.on("connect", () => {
    console.log(`connected to ${relay.url}`);
  });
  relay.on("error", () => {
    console.log(`failed to connect to ${relay.url}`);
  });

  await relay.connect();

  let sub = relay.sub([
    {
      kinds: [80082, 80083],
      authors: [pk],
    },
  ]);

  sub.on("event", async (event) => {
    console.log("we got the event we wanted:", event.id);
    try {
      await addGossipCln({ gossip: event.content });
    } catch (err) {
      console.log("error adding gossip to cln:", err);
    }
  });

  sub.on("eose", () => {
    sub.unsub();
  });
};

export default getEvents;
