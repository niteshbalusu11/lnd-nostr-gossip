import { randomBytes } from "crypto";

// Generate random channel ID and node ID

const buildAnnouncement = async ({}) => {
  try {
    const channelId = Buffer.from(
      "123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "hex"
    );
    const nodeId = randomBytes(32);

    // Create channel update message
    const message = {
      type: 258,
      short_channel_id: "120x1x1",
      channel_flags: 1,
      message_flags: 1,
      timestamp: Math.round(Date.now() / 1000),
      cltv_expiry_delta: 144,
      htlc_minimum_msat: 1000,
      fee_base_msat: 1,
      fee_proportional_millionths: 20,
      htlc_maximum_msat: 1000000000,
      htlc_minimum_timeout: 9,
      htlc_maximum_timeout: 144,
    };

    // Convert message to byte buffer
    const messageBuffer = Buffer.alloc(136);
    messageBuffer.writeUInt16BE(message.type, 0);
    Buffer.from(message.short_channel_id, "hex").copy(messageBuffer, 2);
    // messageBuffer.writeUInt16BE(message.channel_flags, 34);
    // messageBuffer.writeUInt16BE(message.message_flags, 36);
    messageBuffer.writeUInt32BE(message.timestamp, 38);
    messageBuffer.writeUInt16BE(message.cltv_expiry_delta, 42);
    messageBuffer.writeUInt32BE(message.htlc_minimum_msat, 44);
    messageBuffer.writeUInt32BE(message.fee_base_msat, 52);
    messageBuffer.writeUInt32BE(message.fee_proportional_millionths, 56);
    messageBuffer.writeUInt32BE(message.htlc_maximum_msat, 60);
    // messageBuffer.writeUInt32BE(message.htlc_minimum_timeout, 68);
    // messageBuffer.writeUInt32BE(message.htlc_maximum_timeout, 72);

    return messageBuffer;
  } catch (err) {
    console.log("error building announcement:", err);
  }
};

export default buildAnnouncement;
