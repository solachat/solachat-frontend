import { generateDHKeys, computeSharedSecret } from "./diffieHellman";
import crypto from "crypto";

const P = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF61");
const G = BigInt(5);

export const establishSessionKey = (peerPublicKey: bigint): Uint8Array => {
    const { privateKey } = generateDHKeys(G, P);

    const sharedSecret = computeSharedSecret(privateKey, peerPublicKey, P);

    const sharedSecretHex = sharedSecret.toString(16).padStart(64, "0");
    const derivedKey = crypto.createHash("sha256").update(sharedSecretHex, "utf8").digest();

    return new Uint8Array(derivedKey);
};
