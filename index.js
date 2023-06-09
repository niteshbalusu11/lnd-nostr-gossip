import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import "websocket-polyfill";

import { auto } from "async";
import {
  authenticatedLndGrpc,
  getNetworkGraph,
  getWalletInfo,
  subscribeToGraph,
} from "ln-service";
import { readFileSync } from "fs";
import broadcastGraph from "./src/broadcast_graph.js";
import getEvents from "./src/get_events.js";
import addGossipCln from "./add_gossip_cln.js";
import buildAnnouncement from "./src/build_announcement.js";

const start = async () => {
  return await auto({
    getLnd: async () => {
      const cert = readFileSync(process.env.CERT).toString("base64");
      const macaroon = readFileSync(process.env.MACAROON).toString("base64");
      const socket = process.env.SOCKET;

      const { lnd } = authenticatedLndGrpc({
        cert,
        macaroon,
        socket,
      });

      return { lnd };
    },

    getInfo: [
      "getLnd",
      async ({ getLnd }) => {
        const { lnd } = getLnd;
        const info = await getWalletInfo({ lnd });

        return info;
      },
    ],

    getGraph: [
      "getLnd",
      "getInfo",
      async ({ getLnd }) => {
        const graph = await getNetworkGraph({ lnd: getLnd.lnd });

        console.log(graph);
        return { graph };
      },
    ],

    checkEvents: [
      "getLnd",
      async ({}) => {
        getEvents({});

        return;
      },
    ],

    broadcastGraph: [
      "getGraph",
      "getLnd",
      async ({ getGraph }) => {
        const { graph } = getGraph;

        // broadcastGraph({ graph, kind: 80083 });
        return;
      },
    ],

    subscribeToGraph: [
      "getLnd",
      "broadcastGraph",
      async ({ getLnd }) => {
        const { lnd } = getLnd;

        const sub = subscribeToGraph({ lnd });

        sub.on("channel_updated", (data) => {
          broadcastGraph({ graph: data, kind: 80082 });
        });

        sub.on("channel_closed", (data) => {
          console.log(data);
          broadcastGraph({ graph: data, kind: 80082 });
        });

        sub.on("node_updated", (data) => {
          console.log(data);
          broadcastGraph({ graph: data, kind: 80082 });
        });

        sub.on("error", (err) => {
          sub.removeAllListeners();
        });
      },
    ],
  });
};

start();
