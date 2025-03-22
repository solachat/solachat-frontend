import { chacha20poly1305 } from '@noble/ciphers/chacha';
import { randomBytes } from '@noble/hashes/utils';

export const generateKeyPair = async (): Promise<{
    privateKey: Uint8Array;
    publicKey: Uint8Array;
}> => {
    const privateKey = randomBytes(32);
    const { x25519 } = await import('@noble/curves/ed25519');
    const publicKey = x25519.getPublicKey(privateKey);
    return { privateKey, publicKey };
};

export const encryptMessage = async (text: string, key: Uint8Array) => {
    const nonce = randomBytes(12);
    const encoded = new TextEncoder().encode(text);
    const cipher = chacha20poly1305(key, nonce);
    const encrypted = cipher.encrypt(nonce, encoded);
    return { encrypted, nonce };
};

export const decryptMessage = async (encrypted: Uint8Array, nonce: Uint8Array, key: Uint8Array) => {
    const cipher = chacha20poly1305(key, nonce);
    const decrypted = cipher.decrypt(nonce, encrypted);
    return new TextDecoder().decode(decrypted);
};
