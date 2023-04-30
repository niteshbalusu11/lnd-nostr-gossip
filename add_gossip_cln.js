import { readFileSync } from "fs";
import {
  loadPackageDefinition,
  credentials as _credentials,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

const addGossipCln = async ({ gossip }) => {
  const PROTO_PATH = "./proto/node.proto";

  const client_key = readFileSync(process.env.CLN_CLIENT_KEY);
  const client_cert = readFileSync(process.env.CLN_CLIENT_CERT);
  const ca_cert = readFileSync(process.env.CLN_CA_CERT);

  const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  };

  var packageDefinition = loadSync(PROTO_PATH, options);

  const CLNService = loadPackageDefinition(packageDefinition).cln.Node;
  let credentials = _credentials.createSsl(ca_cert, client_key, client_cert);

  const client = new CLNService(process.env.CLN_SOCKET, credentials);

  client.AddGossip({ message: gossip }, (error, info) => {
    if (error) {
      console.log("error adding gossip to cln:", error.message);
    }
    // info.id = Buffer.from(info.id, "base64").toString("hex");
    // info.color = Buffer.from(info.color, "base64").toString("hex");
    console.log(info);
  });
};

export default addGossipCln;
